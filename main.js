const { app, BaseWindow, WebContentsView, Menu, ipcMain, clipboard, dialog, session, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const archieml = require('archieml');
const { lint } = require('./lib/lint');
const { createSftp } = require('./lib/sftp');

app.setName('Archie Editor');
// Keep using the original data folder so the saved Google login survives the rename.
app.setPath('userData', path.join(app.getPath('appData'), 'Archie'));

const DOCS_HOME = 'https://docs.google.com/document/u/0/';
const SIDEBAR_DEFAULT = 300;
const SIDEBAR_MIN = 240;
const SIDEBAR_MAX = 520;
let sidebarWidth = SIDEBAR_DEFAULT;
const PREVIEW_BAR_HEIGHT = 40;
const PREVIEW_MIN = 320;
const DOC_MIN = 360;
let previewOpen = false;
let previewShare = 0.45; // preview's share of the space right of the sidebar
let previewBar = null;
let previewPage = null;
let previewLoadedUrl = null;
let previewEditing = false; // link form open: the toolbar takes the full height
// The last doc text read, shared with the preview page so it never asks Google itself.
let docText = { id: null, text: null, at: 0 };
// Google rate-limits the text export, so the preview re-reads only after an edit
// is saved, never closer together than MIN_GAP_MS, plus a slow check for other
// people's edits.
const MIN_GAP_MS = 10000;
const POLL_MS = 60000;

// Google refuses sign-in from browsers that announce themselves as Electron,
// so present a plain desktop Chrome user agent.
app.userAgentFallback = app.userAgentFallback
  .replace(/\sElectron\/\S+/, '')
  .replace(/\sarchie\/\S+/i, '');

let win, sidebar, docs;
let latest = { state: 'none' };
let shownUrl;

// ---- Saved data (own snippets, recent docs) ----
const storePath = () => path.join(app.getPath('userData'), 'archie-data.json');
let store;
function loadStore() {
  try {
    store = JSON.parse(fs.readFileSync(storePath(), 'utf8'));
  } catch (err) {
    // Keep an unreadable file around rather than overwriting it.
    if (err.code !== 'ENOENT') fs.copyFileSync(storePath(), `${storePath()}.bak`);
    store = {};
  }
  store.snippets ||= [];
  store.recents ||= [];
  store.uploadNames ||= {};
  store.destinations ||= {}; // doc id -> { serverId, folder, fileName }
  store.previewUrls ||= {}; // doc id -> the project's QA page link
}
const saveStore = () => fs.writeFileSync(storePath(), JSON.stringify(store, null, 2));

// ---- The open document ----
function currentDoc() {
  const url = docs.webContents.getURL();
  const m = /^https:\/\/docs\.google\.com\/document(\/u\/\d+)?\/d\/([\w-]+)/.exec(url);
  if (!m) return null;
  const tab = new URL(url).searchParams.get('tab');
  const base = `https://docs.google.com/document${m[1] || ''}/d/${m[2]}`;
  return {
    id: m[2],
    url: `${base}/edit`,
    exportUrl: `${base}/export?format=txt${tab ? `&tab=${encodeURIComponent(tab)}` : ''}`,
  };
}

const docTitle = () => docs.webContents.getTitle().replace(/ - Google Docs$/, '');

function send(view, channel, payload) {
  if (view && !view.webContents.isDestroyed()) view.webContents.send(channel, payload);
}

// Read the doc as plain text (the same export ArchieML projects use) with the
// signed-in session, then parse and check it.
let refreshing = false;
let lastFetch = 0;
let backoffUntil = 0;
let failures = 0;
let pending = null; // { at, timer }

function destinationFor(docId) {
  const d = docId && store.destinations[docId];
  const server = d && sftp.server(d.serverId);
  if (!server) return null;
  return { ...d, label: `${server.username}@${server.host}:${d.folder.replace(/\/$/, '')}/${d.fileName}` };
}

function publish(next) {
  if (next.state === 'ok') next = { ...next, destination: destinationFor(currentDoc()?.id) };
  latest = next;
  send(sidebar, 'doc-data', latest);
}

function schedule(delay = 0) {
  if (!win) return;
  const at = Math.max(Date.now() + delay, lastFetch + MIN_GAP_MS, backoffUntil);
  if (pending && pending.at <= at) return; // an earlier read is already queued
  clearTimeout(pending?.timer);
  pending = { at, timer: setTimeout(refresh, at - Date.now()) };
}

async function refresh() {
  clearTimeout(pending?.timer);
  pending = null;
  const doc = currentDoc();
  if (!win || !doc) return publish({ state: 'none' });
  if (refreshing) return schedule(1000);
  refreshing = true;
  lastFetch = Date.now();
  const stillOpen = () => currentDoc()?.exportUrl === doc.exportUrl;
  try {
    const res = await docs.webContents.session.fetch(doc.exportUrl, { credentials: 'include' });
    if (res.status === 429) throw new Error('Google is limiting how often docs can be read');
    if (!res.ok || !(res.headers.get('content-type') || '').startsWith('text/plain')) {
      throw new Error(`Google returned ${res.status}`);
    }
    // Google exports CRLF line endings; keep them out of multi-line values.
    const text = (await res.text()).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    docText = { id: doc.id, text, at: Date.now() };
    failures = 0;
    backoffUntil = 0;
    if (stillOpen()) {
      publish({
        state: 'ok',
        title: docTitle(),
        json: JSON.stringify(archieml.load(text), null, 2),
        ...lint(text),
      });
    }
  } catch (err) {
    // Wait longer after each failure, then try again by itself.
    const wait = Math.min(60000 * 2 ** failures++, 300000);
    backoffUntil = Date.now() + wait;
    const message = `${err.message}. Trying again in ${wait / 60000} min.`;
    if (stillOpen()) {
      // Keep showing the last good data rather than blanking the panel.
      publish(latest.state === 'ok' ? { ...latest, stale: message } : { state: 'error', message });
      schedule(wait);
    }
  } finally {
    refreshing = false;
    if (!stillOpen()) schedule();
  }
}

// Called when a different doc (or tab) is showing.
function docChanged() {
  const exportUrl = currentDoc()?.exportUrl;
  if (exportUrl === shownUrl) return;
  shownUrl = exportUrl;
  loadPreview();
  publish({ state: exportUrl ? 'loading' : 'none' });
  if (exportUrl) schedule(500);
}

function rememberDoc() {
  const doc = currentDoc();
  // The title lags behind the URL; wait for Docs to set it.
  if (!doc || !docs.webContents.getTitle().endsWith(' - Google Docs')) return;
  store.recents = [{ id: doc.id, url: doc.url, title: docTitle() },
    ...store.recents.filter((r) => r.id !== doc.id)].slice(0, 8);
  saveStore();
  send(sidebar, 'store', store);
}

function isGoogleUrl(url) {
  try {
    const { hostname } = new URL(url);
    return /(^|\.)google\.com$/.test(hostname) || /(^|\.)googleusercontent\.com$/.test(hostname);
  } catch {
    return false;
  }
}

function layout() {
  const { width, height } = win.getContentBounds();
  const w = Math.min(sidebarWidth, width - 400);
  sidebar.setBounds({ x: 0, y: 0, width: w, height });
  const rest = width - w;
  if (!previewOpen || !previewBar) {
    docs.setBounds({ x: w, y: 0, width: rest, height });
    previewBar?.setVisible(false);
    previewPage?.setVisible(false);
    return;
  }
  const pw = Math.round(Math.max(PREVIEW_MIN, Math.min(rest - DOC_MIN, rest * previewShare)));
  docs.setBounds({ x: w, y: 0, width: rest - pw, height });
  const showPage = Boolean(previewLoadedUrl) && !previewEditing && !previewStatus.error;
  previewBar.setVisible(true);
  previewBar.setBounds({ x: width - pw, y: 0, width: pw, height: showPage ? PREVIEW_BAR_HEIGHT : height });
  previewPage.setVisible(showPage);
  previewPage.setBounds({ x: width - pw, y: PREVIEW_BAR_HEIGHT, width: pw, height: Math.max(0, height - PREVIEW_BAR_HEIGHT) });
}

// ---- Live preview: the project's QA page, reading the doc that's open ----
function previewUrlFor(doc) {
  const base = doc && store.previewUrls[doc.id];
  if (!base) return null;
  const url = new URL(base);
  // The project's own debug settings: read a Google Doc, and which one.
  url.searchParams.set('debug-content', 'doc');
  url.searchParams.set('debug-gdoc-id', doc.id);
  return url.toString();
}

let previewStatus = { loading: false, error: '' };
function sendPreviewState() {
  const doc = currentDoc();
  send(previewBar, 'preview-state', {
    open: previewOpen,
    hasDoc: Boolean(doc),
    title: doc ? docTitle() : '',
    base: (doc && store.previewUrls[doc.id]) || '',
    ...previewStatus,
  });
  send(sidebar, 'preview-open', previewOpen);
}

function loadPreview() {
  if (!previewOpen || !previewPage) return;
  const url = previewUrlFor(currentDoc());
  if (url !== previewLoadedUrl) {
    previewLoadedUrl = url;
    previewStatus = { loading: Boolean(url), error: '' };
    if (url) previewPage.webContents.loadURL(url);
    else previewPage.webContents.loadURL('about:blank');
  }
  layout();
  sendPreviewState();
}

const corsHeaders = (req) => ({
  'access-control-allow-origin': req.headers.get('origin') || '*',
  'access-control-allow-headers': '*',
  'cache-control': 'no-store',
  vary: 'Origin',
});

// The preview page asks Google for the doc's text, but it isn't signed in, so a
// private doc would fail. Answer that one request with the text Archie Editor
// already read with your login. Only the doc that's open is ever shared.
async function answerDocRequest(req, docId) {
  const headers = corsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  const doc = currentDoc();
  if (!doc || doc.id !== docId) {
    return new Response('Archie Editor only shares the doc that is open.', { status: 403, headers });
  }
  if (docText.id !== doc.id || Date.now() - docText.at > 60000) await refresh();
  if (docText.id !== doc.id) return new Response('Could not read the doc just now.', { status: 503, headers });
  return new Response(docText.text, { status: 200, headers: { ...headers, 'content-type': 'text/plain; charset=utf-8' } });
}

function createPreview() {
  // Its own storage, separate from your Google login.
  const ses = session.fromPartition('persist:preview');
  ses.setUserAgent(app.userAgentFallback);
  ses.protocol.handle('https', (req) => {
    const m = /^https:\/\/docs\.google\.com\/document(?:\/u\/\d+)?\/d\/([\w-]+)\/export\b/.exec(req.url);
    if (m) return answerDocRequest(req, m[1]);
    return ses.fetch(req, { bypassCustomProtocolHandlers: true });
  });

  previewBar = new WebContentsView({
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true },
  });
  previewPage = new WebContentsView({
    webPreferences: { session: ses, contextIsolation: true, sandbox: true },
  });
  win.contentView.addChildView(previewPage);
  win.contentView.addChildView(previewBar);
  previewBar.webContents.loadFile(path.join(__dirname, 'preview', 'bar.html'));
  previewBar.webContents.on('did-finish-load', sendPreviewState);

  const wc = previewPage.webContents;
  wc.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  wc.on('did-start-loading', () => { previewStatus = { loading: true, error: '' }; layout(); sendPreviewState(); });
  wc.on('did-stop-loading', () => { previewStatus = { ...previewStatus, loading: false }; sendPreviewState(); });
  wc.on('did-fail-load', (_e, code, description, url, isMainFrame) => {
    if (!isMainFrame || code === -3) return; // -3: replaced by a newer load
    previewStatus = { loading: false, error: `Could not open the page (${description}).` };
    layout();
    sendPreviewState();
  });
  wc.on('render-process-gone', (_e, d) => { if (d.reason !== 'clean-exit') wc.reload(); });
}

function togglePagePreview(force) {
  if (!win) return;
  previewOpen = typeof force === 'boolean' ? force : !previewOpen;
  if (previewOpen && !previewBar) createPreview();
  store.previewOpen = previewOpen;
  saveStore();
  if (previewOpen) loadPreview();
  layout();
  sendPreviewState();
}

function toggleDataTab() {
  send(sidebar, 'toggle-preview');
}

function openPalette() {
  sidebar.webContents.focus();
  send(sidebar, 'open-palette');
}

const SHORTCUTS = [
  { label: 'Quick Insert', key: 'k', run: openPalette },
  { label: 'Switch Insert / Data', key: 'd', run: toggleDataTab },
  { label: 'Show/Hide Live Preview', key: 'p', run: () => togglePagePreview() },
];

function buildMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { role: 'appMenu' },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: SHORTCUTS.map(({ label, key, run }) => ({
        label, accelerator: `CmdOrCtrl+Shift+${key.toUpperCase()}`, click: () => win && run(),
      })),
    },
    { role: 'windowMenu' },
  ]));
}

function sendNavState() {
  send(sidebar, 'nav-state', {
    url: docs.webContents.getURL(),
    title: docs.webContents.getTitle(),
    canGoBack: docs.webContents.navigationHistory.canGoBack(),
  });
}

function createWindow() {
  win = new BaseWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 500,
    title: 'Archie Editor',
    titleBarStyle: 'hiddenInset',
  });

  sidebar = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
    },
  });

  docs = new WebContentsView({
    webPreferences: {
      partition: 'persist:google', // keeps the Google login between launches
      contextIsolation: true,
      sandbox: true,
    },
  });

  win.contentView.addChildView(docs);
  win.contentView.addChildView(sidebar);
  layout();
  win.on('resize', layout);
  const poll = setInterval(() => { if (win.isFocused() && currentDoc()) schedule(); }, POLL_MS);
  win.on('closed', () => { previewBar = null; previewPage = null; previewLoadedUrl = null; clearInterval(poll); clearTimeout(pending?.timer); pending = null; shownUrl = undefined; win = null; });

  // Docs claims many key combos, so catch ours before the page sees them.
  docs.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown' || !input.meta || !input.shift) return;
    const hit = SHORTCUTS.find((s) => s.key === input.key.toLowerCase());
    if (hit) { e.preventDefault(); hit.run(); }
  });

  sidebar.webContents.loadFile(path.join(__dirname, 'sidebar', 'index.html'));
  docs.webContents.loadURL(DOCS_HOME);

  // New windows: keep Google pages inside the app, send everything else to the browser.
  // Docs sometimes opens a blank tab first and sets its address afterwards
  // (e.g. Cmd+click on a doc), so let that hidden tab start loading, take its
  // URL, and close it.
  docs.webContents.setWindowOpenHandler(({ url }) => {
    if (!url || url === 'about:blank') {
      return { action: 'allow', overrideBrowserWindowOptions: { show: false } };
    }
    if (isGoogleUrl(url)) docs.webContents.loadURL(url);
    else shell.openExternal(url);
    return { action: 'deny' };
  });
  docs.webContents.on('did-create-window', (child) => {
    child.webContents.on('will-navigate', (e, url) => {
      e.preventDefault();
      if (isGoogleUrl(url)) docs.webContents.loadURL(url);
      else shell.openExternal(url);
      child.destroy();
    });
    setTimeout(() => { if (!child.isDestroyed()) child.destroy(); }, 10000);
  });

  // If the Docs page crashes, reload it instead of leaving a blank pane.
  docs.webContents.on('render-process-gone', (_e, details) => {
    console.error('Docs page crashed:', details.reason);
    if (details.reason !== 'clean-exit') docs.webContents.reload();
  });

  for (const evt of ['did-navigate', 'did-navigate-in-page', 'page-title-updated']) {
    docs.webContents.on(evt, () => {
      sendNavState();
      rememberDoc();
      docChanged();
    });
  }
  // Docs posts to .../save after each edit: that's the cue to re-read.
  docs.webContents.session.webRequest.onCompleted(
    { urls: ['https://docs.google.com/document/*/save*'] },
    () => schedule(1500),
  );
}

// ---- Editing the doc ----
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Clipboard-based actions run one at a time so they can't restore over each other.
let queue = Promise.resolve();
const serial = (fn) => (queue = queue.then(fn, fn));

// Borrow the clipboard and put its text back afterwards. Electron's clipboard
// is asynchronous: every read and write must be awaited.
async function withClipboard(fn) {
  const saved = await clipboard.readText();
  try {
    return await fn();
  } finally {
    if (saved) await clipboard.writeText(saved);
  }
}

// Docs ignores synthetic newlines from insertText, so snippets are pasted.
ipcMain.handle('insert', (_e, snippet) => serial(() => withClipboard(async () => {
  // Every snippet ends with a newline so the next one starts on its own line.
  const text = snippet.endsWith('\n') ? snippet : `${snippet}\n`;
  docs.webContents.focus();
  await clipboard.writeText(text);
  docs.webContents.paste();
  await sleep(200); // let Docs read the clipboard before it's restored
})));

// The text highlighted in the doc, or '' when nothing is.
ipcMain.handle('selection', () => serial(() => withClipboard(async () => {
  if (!currentDoc()) return '';
  const marker = `archie-no-selection-${Date.now()}`;
  docs.webContents.focus();
  await clipboard.writeText(marker);
  docs.webContents.copy();
  await sleep(150);
  const text = await clipboard.readText();
  return text === marker ? '' : text.replace(/[\r\n]+$/, '');
})));

// Docs draws its own text, so jumping to a line goes through its Find box.
function press(keyCode, modifiers = []) {
  docs.webContents.sendInputEvent({ type: 'keyDown', keyCode, modifiers });
  docs.webContents.sendInputEvent({ type: 'keyUp', keyCode, modifiers });
}
ipcMain.handle('jump', (_e, { text, occurrence }) => serial(async () => {
  if (!currentDoc() || !text) return;
  docs.webContents.focus();
  press('F', ['meta']);
  await sleep(250);
  docs.webContents.insertText(text);
  await sleep(250);
  for (let i = 1; i < occurrence; i++) { press('Enter'); await sleep(40); }
  press('Escape');
  await sleep(100);
  press('Left'); // drop the highlight so the next insert can't overwrite it
}));

// ---- Upload to SFTP ----
const sftp = createSftp({
  getStore: () => store,
  saveStore,
  getWindow: () => win,
  onChange: async () => send(sidebar, 'sftp-status', await sftp.status()),
});

// Errors go back as { error } so the sidebar can show the message itself.
const safe = (fn) => async (_e, arg) => {
  try { return await fn(arg); } catch (err) { return { error: err.message }; }
};

const slug = (t) => (t || 'archie').replace(/[/:\\]/g, '-').trim() || 'archie';
ipcMain.handle('sftp-status', async () => {
  const doc = currentDoc();
  const dest = destinationFor(doc?.id);
  const fileName = dest?.fileName || (doc && store.uploadNames[doc.id]) || `${slug(latest.title || docTitle())}.json`;
  return { ...(await sftp.status()), fileName, destination: dest };
});
ipcMain.handle('sftp-connect', safe((form) => sftp.connect(form)));
ipcMain.handle('sftp-connect-saved', safe((id) => sftp.connectSaved(id)));
ipcMain.handle('sftp-remove', safe((id) => sftp.removeServer(id)));
ipcMain.handle('sftp-disconnect', () => sftp.disconnect());
ipcMain.handle('sftp-list', safe((dir) => sftp.list(dir)));
ipcMain.handle('sftp-mkdir', safe(({ parent, name }) => sftp.makeFolder(parent, name)));

// Read the doc fresh, upload it, and remember where this doc goes.
async function publishDoc(folder, fileName, options) {
  const doc = currentDoc();
  if (!doc) throw new Error('Open a Google Doc first.');
  await refresh();
  if (latest.state !== 'ok' || latest.stale) throw new Error('Could not read the doc just now. Try again in a minute.');
  const target = await sftp.upload(folder, fileName, `${latest.json}\n`, options);
  if (target) {
    store.destinations[doc.id] = { serverId: sftp.currentId(), folder, fileName };
    saveStore();
    publish({ ...latest }); // refresh the "Publish again" label
  }
  return { target };
}
ipcMain.handle('sftp-upload', safe(({ folder, fileName }) => publishDoc(folder, fileName)));
ipcMain.handle('publish-again', safe(async () => {
  const dest = destinationFor(currentDoc()?.id);
  if (!dest) throw new Error('Publish this doc once from the Publish tab first.');
  if (sftp.currentId() !== dest.serverId) {
    try {
      await sftp.connectSaved(dest.serverId);
    } catch (err) {
      return { needsLogin: true, error: err.message };
    }
  }
  return publishDoc(dest.folder, dest.fileName, { confirm: false });
}));
ipcMain.handle('choose-key', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: 'Choose your SSH private key',
    defaultPath: path.join(app.getPath('home'), '.ssh'),
    properties: ['openFile', 'showHiddenFiles'],
  });
  if (canceled || !filePaths[0]) return null;
  return filePaths[0].replace(app.getPath('home'), '~');
});

// ---- Data, saved snippets, recent docs ----
ipcMain.handle('doc-data', () => latest);
// The refresh button skips the waiting, but not more than once every 3 seconds.
ipcMain.handle('refresh', () => { if (Date.now() - lastFetch > 3000) return refresh(); });
ipcMain.handle('copy-json', async () => {
  if (latest.state === 'ok') await clipboard.writeText(latest.json);
});
ipcMain.handle('export-json', async () => {
  if (latest.state !== 'ok') return false;
  const name = (latest.title || 'archie').replace(/[/:\\]/g, '-');
  const { json } = latest;
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    defaultPath: `${name}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (canceled) return false;
  await fs.promises.writeFile(filePath, `${json}\n`);
  return true;
});

ipcMain.handle('store', () => store);

ipcMain.handle('preview-toggle', (_e, open) => togglePagePreview(open));
ipcMain.handle('preview-set-url', (_e, value) => {
  const doc = currentDoc();
  if (!doc) return { error: 'Open a Google Doc first.' };
  const text = String(value || '').trim();
  if (!text) {
    delete store.previewUrls[doc.id];
  } else {
    let url;
    try { url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`); } catch { return { error: 'That doesn’t look like a web address.' }; }
    if (!/^https?:$/.test(url.protocol)) return { error: 'Use an http or https link.' };
    // Keep the link plain; the doc settings are added each time.
    url.searchParams.delete('debug-content');
    url.searchParams.delete('debug-gdoc-id');
    store.previewUrls[doc.id] = url.toString();
  }
  saveStore();
  previewLoadedUrl = undefined; // force a reload
  previewEditing = false;
  loadPreview();
  return {};
});
ipcMain.handle('preview-action', (_e, action) => {
  if (!previewPage) return;
  if (action === 'reload') previewPage.webContents.reloadIgnoringCache();
  if (action === 'external' && previewLoadedUrl) shell.openExternal(previewLoadedUrl);
  if (action === 'close') togglePagePreview(false);
  if (action === 'edit-start' || action === 'edit-end') {
    previewEditing = action === 'edit-start';
    layout();
  }
});
let previewDrag = null;
ipcMain.handle('preview-resize', (_e, { phase, dx }) => {
  if (!win || !previewBar) return;
  const { width } = win.getContentBounds();
  const rest = width - Math.min(sidebarWidth, width - 400);
  if (phase === 'start') previewDrag = previewBar.getBounds().width;
  if (phase === 'move' && previewDrag) {
    previewShare = Math.max(0.2, Math.min(0.8, (previewDrag - dx) / rest));
    layout();
  }
  if (phase === 'end') { previewDrag = null; store.previewShare = previewShare; saveStore(); }
});
let saveWidthTimer;
ipcMain.handle('sidebar-width', (_e, w) => {
  sidebarWidth = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, Number(w) || SIDEBAR_DEFAULT));
  if (win) layout();
  clearTimeout(saveWidthTimer);
  saveWidthTimer = setTimeout(() => { store.sidebarWidth = sidebarWidth; saveStore(); }, 400);
});
ipcMain.handle('add-snippet', (_e, { label, text }) => {
  store.snippets.push({ id: Date.now().toString(36), label: String(label), text: String(text) });
  saveStore();
  return store;
});
ipcMain.handle('remove-snippet', (_e, id) => {
  store.snippets = store.snippets.filter((s) => s.id !== id);
  saveStore();
  return store;
});

ipcMain.handle('nav', (_e, action) => {
  const wc = docs.webContents;
  if (action === 'back' && wc.navigationHistory.canGoBack()) wc.navigationHistory.goBack();
  if (action === 'reload') wc.reload();
  if (action === 'home') wc.loadURL(DOCS_HOME);
  if (action === 'external') shell.openExternal(wc.getURL());
});

ipcMain.handle('open-url', (_e, url) => {
  if (isGoogleUrl(url)) docs.webContents.loadURL(url);
});

// Only one copy of the app at a time: a second launch just focuses the first,
// so two copies never fight over the same saved Google login.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });
  app.whenReady().then(() => {
    // When run with `npm start` the Dock would show Electron's logo; the
    // packaged app gets its icon from build/icon.png instead.
    if (!app.isPackaged && app.dock) app.dock.setIcon(path.join(__dirname, 'build', 'icon.png'));
    loadStore();
    sidebarWidth = store.sidebarWidth || SIDEBAR_DEFAULT;
    previewShare = store.previewShare || previewShare;
    buildMenu();
    createWindow();
    if (store.previewOpen) togglePagePreview(true);
  });
}

app.on('activate', () => { if (!win) createWindow(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// The Publish tab: pick or add an SFTP server, browse to a folder, name the file.
(() => {
  let folder = '';
  let busy = false;
  let state = { servers: [] };
  let keyPath = '';
  let editingId = null; // server being edited, or null when adding

  const ADD = '__add__';
  const authValue = () => document.querySelector('[name="sftp-auth"]:checked').value;
  const say = (text, error = false) => {
    $('sftp-message').textContent = text;
    $('sftp-message').classList.toggle('error', error);
  };
  const serverName = (s) => `${s.username}@${s.host}${s.port && s.port !== 22 ? `:${s.port}` : ''}`;
  const baseName = (p) => (p ? p.split('/').pop() : '');
  const stripJson = (n) => n.replace(/\.json$/i, '');

  // ---- Which view shows: saved-server picker, the form, or the folder browser ----
  function view(name) {
    $('server-pick').hidden = name !== 'pick';
    $('sftp-form').hidden = name !== 'form';
    $('sftp-browser').hidden = name !== 'browse';
  }

  function drawPicker(selectId) {
    const select = $('server-select');
    select.replaceChildren(
      ...state.servers.map((s) => el('option', { value: s.id, textContent: serverName(s) })),
      el('option', { value: ADD, textContent: 'Add server…' }),
    );
    select.value = selectId && state.servers.some((s) => s.id === selectId) ? selectId : (state.servers[0]?.id || ADD);
    pickChanged();
  }

  function pickChanged() {
    const s = state.servers.find((x) => x.id === $('server-select').value);
    if (!s) return showForm(null);
    view('pick');
    $('server-summary').hidden = false;
    $('server-detail').textContent = s.auth === 'key'
      ? `SSH key ${baseName(s.keyPath)}${s.hasSecret ? ' · passphrase saved' : ''}`
      : (s.hasSecret ? 'Password saved' : 'Password not saved: you’ll be asked for it');
  }

  function showForm(server) {
    editingId = server ? server.id : null;
    view('form');
    $('sftp-form').reset();
    $('sftp-host').value = server?.host || '';
    $('sftp-port').value = server?.port || 22;
    $('sftp-user').value = server?.username || '';
    $(server?.auth === 'key' ? 'auth-key' : 'auth-password').checked = true;
    keyPath = server?.keyPath || '~/.ssh/id_ed25519';
    $('remember-row').hidden = !state.canRemember;
    $('form-cancel').hidden = !state.servers.length;
    showAuth(server?.hasSecret);
    (server ? $('sftp-secret') : $('sftp-host')).focus();
  }

  function showAuth(hasSecret) {
    const key = authValue() === 'key';
    $('key-fields').hidden = !key;
    $('key-name').textContent = baseName(keyPath) || 'No key chosen';
    $('key-name').title = keyPath;
    $('secret-label').textContent = key ? 'Key passphrase (if it has one)' : 'Password';
    $('sftp-secret').placeholder = hasSecret ? 'Saved: leave empty to use it' : '';
  }

  async function open() {
    say('');
    state = await window.archie.sftpStatus();
    $('sftp-file').value = stripJson(state.fileName);
    if (state.connected) {
      view('browse');
      showWho();
      return browse(folder || state.destination?.folder || '');
    }
    drawPicker(state.destination?.serverId);
  }

  function showWho() {
    const s = state.servers.find((x) => x.id === state.currentId);
    $('sftp-who').textContent = s ? serverName(s) : '';
  }

  async function run(fn) {
    if (busy) return;
    busy = true;
    const controls = document.querySelectorAll('#upload button, #upload select');
    controls.forEach((b) => { b.disabled = true; });
    try { return await fn(); } finally {
      busy = false;
      controls.forEach((b) => { b.disabled = false; });
    }
  }

  // ---- Folder browser ----
  const icon = (paths) => {
    const span = document.createElement('span');
    span.className = 'glyph';
    span.innerHTML = `<svg viewBox="0 0 16 16" aria-hidden="true">${paths}</svg>`;
    return span;
  };
  const FOLDER = '<path d="M2 4.5h4l1.5 1.5H14v6.5H2z"/>';
  const FILE = '<path d="M4 2h5l3 3v9H4z"/><path d="M9 2v3h3"/>';

  function drawCrumbs() {
    const parts = folder.split('/').filter(Boolean);
    const crumbs = [{ name: '/', path: '/' }, ...parts.map((p, i) => ({ name: p, path: `/${parts.slice(0, i + 1).join('/')}` }))];
    $('crumbs').replaceChildren(...crumbs.flatMap((c, i) => {
      const last = i === crumbs.length - 1;
      const btn = el('button', { type: 'button', className: 'crumb', textContent: c.name });
      if (last) btn.setAttribute('aria-current', 'location');
      else btn.addEventListener('click', () => run(() => browse(c.path)));
      return i ? [el('span', { className: 'sep', textContent: '/' }), btn] : [btn];
    }).filter((n, i) => !(i === 1 && n.className === 'sep'))); // no "//" after the root
  }

  async function browse(dir) {
    say('Loading…');
    const res = await window.archie.sftpList(dir);
    if (res.error) return say(res.error, true);
    say('');
    folder = res.folder;
    drawCrumbs();
    $('sftp-list').replaceChildren(...res.entries.map((e) => {
      const btn = el('button', { type: 'button', className: `entry ${e.dir ? 'dir' : 'file'}` },
        icon(e.dir ? FOLDER : FILE), el('span', { textContent: e.name }));
      // Folders open; a .json file fills in the name, so publishing replaces it.
      btn.addEventListener('click', () => (e.dir
        ? run(() => browse(`${folder.replace(/\/$/, '')}/${e.name}`))
        : ($('sftp-file').value = stripJson(e.name))));
      return btn;
    }));
    if (!res.entries.length) $('sftp-list').append(el('p', { className: 'muted', textContent: 'No folders or .json files here.' }));
  }

  // ---- Typing a path instead of clicking through folders ----
  function showPathForm(show) {
    $('path-form').hidden = !show;
    $('path-bar').hidden = show;
    if (show) {
      $('path-input').value = folder;
      $('path-input').focus();
      $('path-input').select();
    }
  }
  $('path-edit').addEventListener('click', () => showPathForm(true));
  $('path-input').addEventListener('keydown', (e) => { if (e.key === 'Escape') showPathForm(false); });
  $('path-form').addEventListener('submit', (e) => {
    e.preventDefault();
    run(async () => {
      let target = $('path-input').value.trim();
      if (!target) return showPathForm(false);
      // "~" means your home folder; relative paths start there too.
      target = target.replace(/^~(?=\/|$)/, '.');
      // A path ending in .json picks the folder and fills in the file name.
      const file = /\.json$/i.test(target) ? target.split('/').pop() : '';
      if (file) target = target.slice(0, -file.length) || '.';
      const before = folder;
      await browse(target);
      if (folder === before && $('sftp-message').classList.contains('error')) return; // stay to fix it
      if (file) $('sftp-file').value = stripJson(file);
      showPathForm(false);
    });
  });

  // ---- Events ----
  document.addEventListener('tabchange', (e) => { if (e.detail === 'upload') open(); });
  $('server-select').addEventListener('change', pickChanged);
  $('server-edit').addEventListener('click', () => showForm(state.servers.find((x) => x.id === $('server-select').value)));
  $('server-remove').addEventListener('click', () => run(async () => {
    const btn = $('server-remove');
    if (btn.dataset.confirm !== '1') {
      btn.dataset.confirm = '1';
      btn.textContent = 'Remove?';
      setTimeout(() => { btn.dataset.confirm = ''; btn.textContent = 'Remove'; }, 3000);
      return;
    }
    btn.dataset.confirm = '';
    btn.textContent = 'Remove';
    const res = await window.archie.sftpRemove($('server-select').value);
    if (res.error) return say(res.error, true);
    state = { ...state, ...res };
    drawPicker();
    say('Server removed.');
  }));

  async function connected(res) {
    if (res.error) return say(res.error, true);
    state = { ...state, ...res };
    view('browse');
    showWho();
    await browse(state.connected && state.destination?.serverId === state.currentId ? state.destination.folder : '');
  }

  $('server-connect').addEventListener('click', () => run(async () => {
    const s = state.servers.find((x) => x.id === $('server-select').value);
    if (s && s.auth === 'password' && !s.hasSecret) return showForm(s); // needs the password typed
    say('Connecting…');
    await connected(await window.archie.sftpConnectSaved(s.id));
  }));

  document.querySelectorAll('[name="sftp-auth"]').forEach((r) =>
    r.addEventListener('change', () => { $('sftp-secret').value = ''; showAuth(false); }));
  $('choose-key').addEventListener('click', async () => {
    const p = await window.archie.chooseKey();
    if (p) { keyPath = p; showAuth(false); }
  });
  $('reveal').addEventListener('click', () => {
    const show = $('sftp-secret').type === 'password';
    $('sftp-secret').type = show ? 'text' : 'password';
    $('reveal').setAttribute('aria-pressed', show);
    $('reveal').setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    $('reveal').title = show ? 'Hide password' : 'Show password';
  });
  $('sftp-port').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, ''); });
  $('form-cancel').addEventListener('click', () => drawPicker(editingId));

  $('sftp-form').addEventListener('submit', (e) => {
    e.preventDefault();
    run(async () => {
      say('Connecting…');
      const res = await window.archie.sftpConnect({
        id: editingId,
        host: $('sftp-host').value,
        port: $('sftp-port').value,
        username: $('sftp-user').value,
        auth: authValue(),
        keyPath,
        secret: $('sftp-secret').value,
        remember: $('sftp-remember').checked,
      });
      $('sftp-secret').value = '';
      $('sftp-secret').type = 'password';
      await connected(res);
    });
  });

  $('sftp-disconnect').addEventListener('click', () => run(async () => {
    await window.archie.sftpDisconnect();
    state = await window.archie.sftpStatus();
    drawPicker(state.servers.find((x) => x.id === editingId)?.id);
    say('Disconnected.');
  }));

  $('mkdir-open').addEventListener('click', () => {
    $('mkdir-form').hidden = false;
    $('mkdir-open').hidden = true;
    $('mkdir-name').focus();
  });
  $('mkdir-form').addEventListener('submit', (e) => {
    e.preventDefault();
    run(async () => {
      const res = await window.archie.sftpMkdir({ parent: folder, name: $('mkdir-name').value });
      if (res && res.error) return say(res.error, true);
      $('mkdir-form').reset();
      $('mkdir-form').hidden = true;
      $('mkdir-open').hidden = false;
      await browse(res);
    });
  });

  $('sftp-upload').addEventListener('click', () => run(async () => {
    const name = $('sftp-file').value.trim();
    if (!name) return say('Enter a file name.', true);
    say('Reading doc and publishing…');
    const res = await window.archie.sftpUpload({ folder, fileName: `${stripJson(name)}.json` });
    if (res.error) return say(res.error, true);
    if (!res.target) return say('Publish cancelled.');
    await browse(folder);
    say(`Published to ${res.target}`);
  }));

  window.archie.onSftpStatus((s) => {
    const wasConnected = state.connected;
    state = { ...state, ...s };
    if (wasConnected && !s.connected && !$('sftp-browser').hidden) {
      drawPicker(editingId);
      say('The connection closed. Connect again to keep publishing.', true);
    }
  });

  // Exposed for the Data tab's "Publish again" when the saved login needs a password.
  window.openPublish = async (message) => {
    window.showTab('upload');
    if (message) say(message, true);
  };
})();

// Upload JSON to an SFTP server: connect (password or SSH key), browse
// folders, and write a file. Saved passwords are encrypted with the Mac's
// keychain-backed safeStorage; server identities are pinned on first use.
const { dialog, safeStorage } = require('electron');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const posix = path.posix;
const expandHome = (p) => (p && p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p);

const canEncrypt = () => safeStorage.isAsyncEncryptionAvailable().catch(() => false);
async function encrypt(text) {
  if (!text || !(await canEncrypt())) return undefined;
  return (await safeStorage.encryptStringAsync(text)).toString('base64');
}
async function decrypt(value) {
  try {
    return value ? (await safeStorage.decryptStringAsync(Buffer.from(value, 'base64'))).result : undefined;
  } catch {
    return undefined; // e.g. saved on another Mac
  }
}

function createSftp({ getStore, saveStore, getWindow, onChange }) {
  let client = null;
  let currentId = null;

  const knownHosts = () => (getStore().knownHosts ||= {});
  const servers = () => {
    const store = getStore();
    // One-time move from the single saved server of earlier versions.
    if (!store.servers) {
      store.servers = store.server && store.server.host ? [{ id: newId(), ...store.server }] : [];
      delete store.server;
    }
    return store.servers;
  };
  const find = (id) => servers().find((x) => x.id === id);
  const current = () => find(currentId);

  // Everything the sidebar may know: never the saved secrets themselves.
  const describe = (x) => ({
    id: x.id,
    host: x.host,
    port: x.port || 22,
    username: x.username,
    auth: x.auth || 'password',
    keyPath: x.keyPath || '',
    hasSecret: Boolean(x.secret),
    folder: x.folder || '',
  });

  async function status() {
    return {
      connected: Boolean(client),
      currentId,
      servers: servers().map(describe),
      canRemember: await canEncrypt(),
    };
  }

  // Ask before trusting a server the first time, and refuse silently changed ones
  // unless the user accepts the new key.
  function hostVerifier(host, port) {
    return (key, verify) => {
      const id = `${host}:${port}`;
      const fingerprint = `SHA256:${crypto.createHash('sha256').update(key).digest('base64').replace(/=+$/, '')}`;
      const known = knownHosts()[id];
      if (known === fingerprint) return verify(true);
      const changed = Boolean(known);
      dialog.showMessageBox(getWindow(), {
        type: changed ? 'warning' : 'question',
        message: changed ? `The identity of ${host} has changed` : `Connect to ${host} for the first time?`,
        detail: changed
          ? `Saved fingerprint:\n${known}\n\nServer now presents:\n${fingerprint}\n\nThis can mean the server was reinstalled, or that someone is intercepting the connection. Only continue if you expected this.`
          : `Server fingerprint:\n${fingerprint}\n\nIf you can, check this matches your server before trusting it.`,
        buttons: changed ? ['Cancel', 'Trust New Key'] : ['Trust', 'Cancel'],
        defaultId: 0,
        cancelId: changed ? 0 : 1,
      }).then(({ response }) => {
        const ok = changed ? response === 1 : response === 0;
        if (ok) { knownHosts()[id] = fingerprint; saveStore(); }
        verify(ok);
      }, () => verify(false));
    };
  }

  async function disconnect() {
    const c = client;
    client = null;
    currentId = null;
    if (c) await c.end().catch(() => {});
    onChange();
  }

  // form: { id?, host, port, username, auth, keyPath, secret, remember }.
  // An empty secret means "use the one saved for this server".
  async function connect(form) {
    await disconnect();
    const host = String(form.host || '').trim();
    const port = Number(form.port) || 22;
    const username = String(form.username || '').trim();
    const auth = form.auth === 'key' ? 'key' : 'password';
    const keyPath = auth === 'key' ? String(form.keyPath || '').trim() : undefined;
    if (!host || !username) throw new Error('Enter the server address and your username.');

    const saved = (form.id && find(form.id))
      || servers().find((x) => x.host === host && (x.port || 22) === port && x.username === username);
    const sameLogin = saved && saved.auth === auth;
    const secret = form.secret || (sameLogin ? await decrypt(saved.secret) : undefined);

    const config = { host, port, username, readyTimeout: 15000, hostVerifier: hostVerifier(host, port) };
    if (auth === 'key') {
      if (!keyPath) throw new Error('Choose your SSH key file.');
      try {
        config.privateKey = fs.readFileSync(expandHome(keyPath));
      } catch {
        throw new Error(`Could not read the key file ${keyPath}.`);
      }
      if (secret) config.passphrase = secret;
    } else {
      if (!secret) throw new Error('Enter your password.');
      config.password = secret;
    }

    const SftpClient = require('ssh2-sftp-client'); // loaded on first connect
    const c = new SftpClient('archie');
    try {
      await c.connect(config);
    } catch (err) {
      throw new Error(friendly(err));
    }

    const server = saved || { id: newId() };
    Object.assign(server, { host, port, username, auth, keyPath });
    if (!sameLogin) delete server.secret;
    if (form.remember === false) delete server.secret;
    else if (form.secret) server.secret = await encrypt(form.secret);
    if (!saved) servers().push(server);
    saveStore();

    client = c;
    currentId = server.id;
    c.on('close', () => { if (client === c) { client = null; currentId = null; onChange(); } });
    onChange();
    return status();
  }

  // Connect to a saved server with its saved password or key.
  const connectSaved = (id) => {
    const x = find(id);
    if (!x) throw new Error('That server is no longer saved.');
    return connect({ ...describe(x), secret: '' });
  };

  async function removeServer(id) {
    if (id === currentId) await disconnect();
    getStore().servers = servers().filter((x) => x.id !== id);
    saveStore();
    onChange();
    return status();
  }

  function need() {
    if (!client) throw new Error('Not connected. Connect to the server again.');
    return client;
  }

  async function list(dir) {
    const c = need();
    const remembered = current() && current().folder;
    try {
      const folder = await c.realPath(dir ? String(dir) : (remembered || '.'));
      const entries = await c.list(folder);
      return {
        folder,
        entries: entries
          .filter((e) => !e.name.startsWith('.') && (e.type === 'd' || /\.json$/i.test(e.name)))
          .map((e) => ({ name: e.name, dir: e.type === 'd' }))
          .sort((a, b) => (b.dir - a.dir) || a.name.localeCompare(b.name)),
      };
    } catch (err) {
      // A remembered folder that no longer exists: fall back to home.
      if (!dir && remembered) { delete current().folder; return list('.'); }
      throw new Error(friendly(err));
    }
  }

  async function makeFolder(parent, name) {
    const target = posix.join(parent, checkName(name));
    try { await need().mkdir(target); } catch (err) { throw new Error(friendly(err)); }
    return target;
  }

  async function upload(folder, fileName, contents, { confirm = true } = {}) {
    const c = need();
    const name = checkName(fileName);
    const target = posix.join(folder, name);
    if (confirm && await c.exists(target)) {
      const { response } = await dialog.showMessageBox(getWindow(), {
        type: 'warning',
        message: `Replace ${name}?`,
        detail: `${target} already exists on ${current().host}.`,
        buttons: ['Replace', 'Cancel'],
        defaultId: 1,
        cancelId: 1,
      });
      if (response !== 0) return null;
    }
    try { await c.put(Buffer.from(contents), target); } catch (err) { throw new Error(friendly(err)); }
    current().folder = folder;
    saveStore();
    return target;
  }

  return {
    status, connect, connectSaved, disconnect, removeServer, list, makeFolder, upload,
    currentId: () => currentId,
    server: (id) => { const x = find(id); return x && describe(x); },
  };
}

const newId = () => crypto.randomBytes(6).toString('hex');

function checkName(name) {
  const n = String(name || '').trim();
  if (!n || n === '.' || n === '..' || /[/\\\0]/.test(n)) throw new Error('Use a name without slashes.');
  return n;
}

// Turn library errors into something a person can act on.
function friendly(err) {
  const m = String(err && err.message || err);
  if (/All configured authentication methods failed|authentication/i.test(m)) return 'Sign-in failed: check the username, password or key.';
  if (/ENOTFOUND|getaddrinfo/.test(m)) return 'Server not found: check the address.';
  if (/ECONNREFUSED/.test(m)) return 'The server refused the connection: check the port.';
  if (/Timed out|ETIMEDOUT/i.test(m)) return 'The server did not answer in time.';
  if (/host key|Host denied/i.test(m)) return 'Connection cancelled: the server was not trusted.';
  if (/passphrase|Encrypted private/i.test(m)) return 'The key file needs its passphrase.';
  if (/Permission denied/i.test(m)) return 'Permission denied on the server.';
  if (/No such file/i.test(m)) return 'That folder does not exist.';
  return m.replace(/^\w+(\.\w+)*: /, '');
}

module.exports = { createSftp };

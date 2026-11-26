const $ = (id) => document.getElementById(id);
const nameInput = $('name');
const status = $('status');
let saved = { snippets: [], recents: [] };

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

// A user's own snippet in the same shape as the built-in ones.
const custom = (s) => ({
  label: s.label,
  hint: s.text.split('\n')[0],
  text: (n) => s.text.replaceAll('$name', n || 'name'),
});

async function insert(item) {
  if (item.activate) return item.activate(); // templates open their form
  const name = nameInput.value.trim();
  const selection = item.wrap ? await window.archie.selection() : '';
  await window.archie.insert(selection ? item.wrap(name, selection) : item.text(name));
  status.textContent = `${selection ? 'Wrapped selection in' : 'Inserted'} ${item.label}`;
}

function snippetButton(item) {
  const btn = el('button', { type: 'button', className: 'snippet' },
    el('code', { textContent: item.label }), el('span', { textContent: item.hint }));
  btn.dataset.search = `${item.label} ${item.hint}`.toLowerCase();
  btn.addEventListener('click', () => insert(item));
  // Hover shows exactly what will be inserted, with the current block name.
  const preview = () => { btn.title = item.text(nameInput.value.trim()); };
  btn.addEventListener('mouseenter', preview);
  btn.addEventListener('focus', preview);
  return btn;
}

// ---- Filter the snippet list as you type ----
function applyFilter() {
  const q = $('filter').value.trim().toLowerCase();
  let any = false;
  document.querySelectorAll('#panel-insert section').forEach((section) => {
    let shown = 0;
    section.querySelectorAll('.snippet:not(.recent)').forEach((b) => {
      const hit = !q || b.dataset.search.includes(q);
      (b.closest('.mine') || b).hidden = !hit;
      if (hit) shown++;
    });
    // Unfiltered, every section shows, so "+ New snippet" stays reachable.
    section.hidden = Boolean(q) && !shown;
    if (shown) any = true;
  });
  $('no-match').hidden = !q || any;
}

for (const { group, items } of window.SNIPPETS) {
  $('snippets').append(el('section', {}, el('h2', { textContent: group }), ...items.map(snippetButton)));
}
$('filter').addEventListener('input', applyFilter);
$('filter').addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { $('filter').value = ''; applyFilter(); }
  if (e.key === 'Enter') document.querySelector('#panel-insert .snippet:not(.recent):not([hidden])')?.click();
});

function render(store) {
  saved = store;
  window.renderTemplates?.(store);
  $('mine').replaceChildren(...saved.snippets.map((s) => {
    const remove = el('button', { type: 'button', className: 'remove', title: `Delete ${s.label}` });
    remove.setAttribute('aria-label', `Delete ${s.label}`);
    remove.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
    const icon = remove.innerHTML;
    // Two clicks to delete, so a stray one can't lose a snippet.
    remove.addEventListener('click', async () => {
      if (!remove.classList.contains('confirm')) {
        remove.classList.add('confirm');
        remove.textContent = 'Delete?';
        setTimeout(() => { remove.classList.remove('confirm'); remove.innerHTML = icon; }, 3000);
      } else render(await window.archie.removeSnippet(s.id));
    });
    return el('div', { className: 'mine' }, snippetButton(custom(s)), remove);
  }));
  applyFilter();
  $('recents').replaceChildren(...saved.recents.map((r) => {
    const btn = el('button', { type: 'button', className: 'snippet recent', textContent: r.title, title: r.title });
    btn.addEventListener('click', () => window.archie.openUrl(r.url));
    return btn;
  }));
}
window.archie.store().then(render);
window.archie.onStore(render);

// ---- New snippet form ----
function showForm(show) {
  $('snippet-form').hidden = !show;
  $('new-snippet').hidden = show;
  if (show) $('snippet-label').focus();
  else $('snippet-form').reset();
}
$('new-snippet').addEventListener('click', () => showForm(true));
$('cancel-snippet').addEventListener('click', () => showForm(false));
$('from-selection').addEventListener('click', async () => {
  const selection = await window.archie.selection();
  if (selection) $('snippet-text').value = selection;
  else status.textContent = 'Highlight some text in the doc first.';
});
$('snippet-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  render(await window.archie.addSnippet({
    label: $('snippet-label').value.trim(),
    text: $('snippet-text').value,
  }));
  showForm(false);
});

// ---- Quick insert ----
let matches = [];
let active = 0;

function drawPalette() {
  const query = $('palette-input').value.trim().toLowerCase();
  const all = [...(window.templateItems?.() || []), ...saved.snippets.map(custom), ...window.SNIPPETS.flatMap((g) => g.items)];
  matches = all.filter((i) => `${i.label} ${i.hint}`.toLowerCase().includes(query));
  active = Math.max(0, Math.min(active, matches.length - 1));
  $('palette-results').replaceChildren(...matches.map((item, index) => {
    const btn = snippetButton(item);
    btn.classList.toggle('active', index === active);
    btn.addEventListener('click', closePalette);
    return btn;
  }));
  $('palette-results').children[active]?.scrollIntoView({ block: 'nearest' });
}
function closePalette() { $('palette').hidden = true; }

window.archie.onOpenPalette(() => {
  $('palette').hidden = false;
  $('palette-input').value = '';
  active = 0;
  drawPalette();
  $('palette-input').focus();
});
$('palette-input').addEventListener('input', () => { active = 0; drawPalette(); });
$('palette-input').addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    active += e.key === 'ArrowDown' ? 1 : -1;
    drawPalette();
  } else if (e.key === 'Enter' && matches[active]) {
    e.preventDefault();
    closePalette();
    insert(matches[active]);
  } else if (e.key === 'Escape') closePalette();
});

// ---- Navigation ----
document.querySelectorAll('[data-nav]').forEach((b) =>
  b.addEventListener('click', () => window.archie.nav(b.dataset.nav))
);

// ---- Live preview toggle ----
$('preview-toggle').addEventListener('click', () => window.archie.previewToggle());
window.archie.onPreviewOpen((open) => {
  $('preview-toggle').setAttribute('aria-pressed', open);
  $('preview-label').textContent = open ? 'Previewing' : 'Preview';
});

// ---- Sidebar width: drag the right edge, or use arrow keys on it ----
{
  const handle = $('resize');
  let startX = 0;
  let startWidth = 0;
  let frame = 0;
  const set = (w) => window.archie.setSidebarWidth(Math.round(w));
  handle.addEventListener('pointerdown', (e) => {
    startX = e.screenX;
    startWidth = window.innerWidth;
    handle.setPointerCapture(e.pointerId);
    handle.classList.add('dragging');
  });
  handle.addEventListener('pointermove', (e) => {
    if (!handle.hasPointerCapture(e.pointerId)) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => set(startWidth + e.screenX - startX));
  });
  const end = (e) => { handle.classList.remove('dragging'); handle.releasePointerCapture?.(e.pointerId); };
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
  handle.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      set(window.innerWidth + (e.key === 'ArrowRight' ? 20 : -20));
    }
  });
}

$('open-form').addEventListener('submit', (e) => {
  e.preventDefault();
  window.archie.openUrl($('open-url').value.trim());
  $('open-url').value = '';
});

window.archie.onNavState(({ title, canGoBack }) => {
  $('doc-title').textContent = title.replace(/ - Google Docs$/, '') || 'Google Docs';
  $('back').disabled = !canGoBack;
});

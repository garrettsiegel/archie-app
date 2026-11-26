// "Colors in the doc": how keys and {}/[] lines look when inserted.
(() => {
  const F = window.ArchieFormat;
  const SAMPLE = '{intro}\nheadline: Big game tonight\n[speakers]\nname: Ada\n[]\n{}';
  let colors = F.clean();

  const part = (id) => ({
    textOn: $(`${id}-text-on`).checked, text: $(`${id}-text`).value,
    highlightOn: $(`${id}-hl-on`).checked, highlight: $(`${id}-hl`).value,
  });
  const current = () => F.clean({
    on: $('colors-on').checked,
    key: part('key'),
    block: part('block'),
    bold: $('colors-bold').checked,
  });

  const marked = (text, c) => {
    const s = F.split(text);
    if (!s) return document.createTextNode(text);
    const span = el('span', { textContent: s.mark });
    span.style.cssText = F.css(c[s.kind], c.bold);
    if (c[s.kind].highlightOn && !c[s.kind].textOn) span.classList.add('is-highlight');
    return el('span', {}, s.lead, span, s.rest);
  };

  function draw() {
    const c = current();
    document.querySelectorAll('#colors-section .color-group, #colors-section .check:has(#colors-bold)')
      .forEach((n) => n.classList.toggle('is-off', !c.on));
    for (const id of ['key', 'block']) {
      $(`${id}-text`).style.background = c[id].text;
      $(`${id}-hl`).style.background = c[id].highlight;
      $(`${id}-text`).classList.toggle('is-off', !c[id].textOn);
      $(`${id}-hl`).classList.toggle('is-off', !c[id].highlightOn);
    }
    $('colors-preview').replaceChildren(...SAMPLE.split('\n').flatMap((l, i) => (i ? ['\n', marked(l, c)] : [marked(l, c)])));
    $('colors-sample').replaceChildren(c.on ? marked('{ }', c) : 'off', c.on ? ' ' : '', c.on ? marked('key:', c) : '');
  }

  function fill(c) {
    colors = F.clean(c);
    $('colors-on').checked = colors.on;
    for (const id of ['key', 'block']) {
      $(`${id}-text-on`).checked = colors[id].textOn;
      $(`${id}-text`).value = colors[id].text;
      $(`${id}-hl-on`).checked = colors[id].highlightOn;
      $(`${id}-hl`).value = colors[id].highlight;
    }
    $('colors-bold').checked = colors.bold;
    draw();
  }

  let saving;
  const ids = ['colors-on', 'colors-bold', ...['key', 'block'].flatMap((p) => [`${p}-text-on`, `${p}-text`, `${p}-hl-on`, `${p}-hl`])];
  ids.forEach((id) => {
    $(id).addEventListener('input', () => {
      // Picking a color turns that color on.
      if (/-(text|hl)$/.test(id)) $(`${id.replace(/-(text|hl)$/, '-$1-on')}`).checked = true;
      draw();
      clearTimeout(saving); // the color picker fires many times while dragging
      saving = setTimeout(async () => { colors = current(); await window.archie.saveColors(colors); }, 250);
    });
  });

  $('color-selection').addEventListener('click', async () => {
    const done = await window.archie.colorSelection();
    status.textContent = done ? 'Colored the highlighted text' : 'Highlight some ArchieML in the doc first.';
  });

  // ---- Color picker: Google Docs' own swatches, plus any hex color ----
  const PALETTE = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
    '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
    '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
    '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
    '#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47',
    '#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130',
  ];
  const pop = $('color-pop');
  let target = null;

  const choose = (hex) => {
    if (!target) return;
    target.value = hex;
    target.dispatchEvent(new Event('input', { bubbles: true }));
    closePop();
  };
  $('color-grid').replaceChildren(...PALETTE.map((hex) => {
    const b = el('button', { type: 'button', className: 'color-cell', title: hex });
    b.setAttribute('aria-label', hex);
    b.style.background = hex;
    b.addEventListener('click', () => choose(hex));
    return b;
  }));

  // #abc, abc, #aabbcc or aabbcc -> #aabbcc
  const toHex = (v) => {
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(v).trim());
    if (!m) return null;
    const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
    return `#${h.toLowerCase()}`;
  };
  $('color-hex-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const hex = toHex($('color-hex').value);
    if (!hex) { $('color-hex-msg').textContent = 'Use 6 letters or numbers, like d62e0b.'; return; }
    choose(hex);
  });

  function openPop(btn) {
    target = btn;
    $('color-hex').value = btn.value.replace('#', '');
    $('color-hex-msg').textContent = '';
    pop.querySelectorAll('.color-cell').forEach((c) => c.classList.toggle('is-current', c.title === btn.value));
    btn.after(pop); // sits right under the row it belongs to
    pop.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    (pop.querySelector('.is-current') || pop.querySelector('.color-cell')).focus();
  }
  function closePop() {
    if (pop.hidden) return;
    pop.hidden = true;
    target?.setAttribute('aria-expanded', 'false');
    target?.focus();
    target = null;
  }
  document.querySelectorAll('.swatch-btn').forEach((btn) => {
    btn.addEventListener('click', () => (target === btn ? closePop() : openPop(btn)));
  });
  pop.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); closePop(); } });
  document.addEventListener('pointerdown', (e) => {
    if (!pop.hidden && !pop.contains(e.target) && !e.target.closest('.swatch-btn')) closePop();
  });

  window.archie.store().then((store) => fill(store.docColors));
})();

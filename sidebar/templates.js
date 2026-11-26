// Template builder and fill-in form. Users never type ArchieML: they pick a
// shape, add fields with buttons, and later fill in a form that writes it.
(() => {
  const T = window.TemplatesCore;
  const ICON = {
    up: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13V3M4 7l4-4 4 4"/></svg>',
    down: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M4 9l4 4 4-4"/></svg>',
    remove: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
    edit: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.5 2.5l3 3L6 13H3v-3z"/></svg>',
  };
  const iconButton = (name, label, onClick) => {
    const b = el('button', { type: 'button', className: 'icon tpl-icon', title: label });
    b.setAttribute('aria-label', label);
    b.innerHTML = ICON[name];
    b.addEventListener('click', onClick);
    return b;
  };
  let templates = [];

  // ---- Which view is showing ----
  function show(which) {
    $('tpl-view').hidden = !which;
    $('tpl-builder').hidden = which !== 'builder';
    $('tpl-fill').hidden = which !== 'fill';
    $('tpl-view').scrollTop = 0;
  }
  const close = () => show(null);
  document.querySelectorAll('.tpl-back').forEach((b) => b.addEventListener('click', close));
  $('tpl-view').addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } });

  // ---- The list in the Insert tab ----
  window.renderTemplates = (store) => {
    templates = store.templates || [];
    $('tpl-empty').hidden = templates.length > 0;
    $('tpl-list').replaceChildren(...templates.map((t) => {
      const open = el('button', { type: 'button', className: 'snippet' },
        el('code', { textContent: t.name }), el('span', { textContent: describe(t) }));
      open.dataset.search = `${t.name} ${t.key} template`.toLowerCase();
      open.addEventListener('click', () => openForm(t));
      const remove = iconButton('remove', `Delete ${t.name}`, async () => {
        if (!remove.classList.contains('confirm')) {
          remove.classList.add('confirm');
          remove.textContent = 'Delete?';
          setTimeout(() => { remove.classList.remove('confirm'); remove.innerHTML = ICON.remove; }, 3000);
        } else render(await window.archie.removeTemplate(t.id));
      });
      remove.classList.add('remove');
      return el('div', { className: 'mine' }, open, iconButton('edit', `Edit ${t.name}`, () => openBuilder(t)), remove);
    }));
  };
  const describe = (t) => `${T.KINDS[t.kind].label} · ${T.KINDS[t.kind].open(t.key)}`;

  // Templates also show up in quick insert (⌘⇧K).
  window.templateItems = () => [
    ...templates.map((t) => ({
      label: t.name,
      hint: describe(t),
      text: () => T.generate(t, T.sample(t)),
      activate: () => openForm(t),
    })),
  ];

  // ---- Builder ----
  let draft = null;
  let keyTouched = false;
  const keyFromName = (name) => {
    const words = String(name).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    return words.map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w)).join('');
  };
  const cleaned = () => ({
    ...draft,
    name: draft.name.trim(),
    key: T.cleanKey(draft.key),
    fields: draft.kind === 'list' ? [] : draft.fields.map((f, i) => ({
      key: T.cleanKey(f.key), long: f.long, required: f.required || (draft.kind === 'items' && i === 0), hint: (f.hint || '').trim(),
    })),
  });

  function openBuilder(tpl) {
    draft = tpl
      ? structuredClone(tpl)
      : { id: null, name: '', kind: 'object', key: '', fields: [{ key: '', long: false, required: false }] };
    keyTouched = Boolean(tpl);
    $('tpl-builder-title').textContent = tpl ? `Edit ${tpl.name}` : 'New template';
    $('tpl-builder-msg').textContent = '';
    drawBuilder();
    show('builder');
    $('tpl-name').focus();
  }

  function drawKinds() {
    $('tpl-kinds').replaceChildren(...Object.entries(T.KINDS).map(([kind, k]) => {
      const input = el('input', { type: 'radio', name: 'tpl-kind', value: kind, checked: draft.kind === kind, id: `tpl-kind-${kind}` });
      input.addEventListener('change', () => {
        draft.kind = kind;
        if (kind !== 'list' && !draft.fields.length) draft.fields.push({ key: '', long: false, required: false });
        drawBuilder();
      });
      return el('label', { className: 'tpl-kind', htmlFor: input.id }, input,
        el('span', { className: 'tpl-kind-name', textContent: k.label }),
        el('code', { textContent: kind === 'list' ? `${k.open('…')} * item` : `${k.open('…')} ${k.close}` }),
        el('span', { className: 'tpl-kind-hint', textContent: k.hint }));
    }));
  }

  function drawFields() {
    const isList = draft.kind === 'list';
    $('tpl-fields-wrap').hidden = isList;
    if (isList) return;
    $('tpl-fields').replaceChildren(...draft.fields.map((f, i) => {
      const firstOfItems = draft.kind === 'items' && i === 0;
      const key = el('input', { type: 'text', value: f.key, placeholder: i === 0 ? 'e.g. name' : 'field name', spellcheck: false, autocomplete: 'off' });
      key.setAttribute('aria-label', `Field ${i + 1} name`);
      key.addEventListener('input', () => {
        const clean = T.cleanKey(key.value);
        if (clean !== key.value) { const at = key.selectionStart - (key.value.length - clean.length); key.value = clean; key.setSelectionRange(at, at); }
        f.key = clean;
        drawPreview();
      });
      const kind = el('select', {});
      kind.setAttribute('aria-label', `Field ${i + 1} type`);
      kind.append(el('option', { value: 'short', textContent: 'Short text', selected: !f.long }), el('option', { value: 'long', textContent: 'Long text', selected: f.long }));
      kind.addEventListener('change', () => { f.long = kind.value === 'long'; drawPreview(); });
      const req = el('input', { type: 'checkbox', checked: f.required || firstOfItems, disabled: firstOfItems });
      req.addEventListener('change', () => { f.required = req.checked; });
      const reqLabel = el('label', { className: 'check tpl-req', title: firstOfItems ? 'The first field starts each item, so it is always needed' : '' }, req, ' Required');
      const move = (d) => () => {
        const j = i + d;
        if (j < 0 || j >= draft.fields.length) return;
        [draft.fields[i], draft.fields[j]] = [draft.fields[j], draft.fields[i]];
        drawFields(); drawPreview();
        $('tpl-fields').children[j]?.querySelector('input')?.focus();
      };
      const tools = el('span', { className: 'tpl-tools' },
        iconButton('up', 'Move up', move(-1)), iconButton('down', 'Move down', move(1)),
        iconButton('remove', 'Remove field', () => {
          draft.fields.splice(i, 1);
          if (!draft.fields.length) draft.fields.push({ key: '', long: false, required: false });
          drawFields(); drawPreview();
        }));
      const help = el('input', { type: 'text', value: f.hint || '', placeholder: 'Help for whoever fills it in (optional)', className: 'tpl-help', maxLength: 160 });
      help.setAttribute('aria-label', `Field ${i + 1} help text`);
      help.addEventListener('input', () => { f.hint = help.value; });
      return el('li', { className: 'tpl-field' },
        el('div', { className: 'tpl-field-top' }, el('span', { className: 'tpl-num', textContent: String(i + 1) }), key, tools),
        el('div', { className: 'tpl-field-opts' }, kind, reqLabel),
        el('div', { className: 'tpl-field-opts' }, help));
    }));
  }

  function drawPreview() {
    const tpl = cleaned();
    const problems = T.check(tpl);
    $('tpl-preview').textContent = T.cleanKey(tpl.key) && !problems.some((p) => /field/.test(p))
      ? T.generate(tpl, T.sample(tpl))
      : 'Fill in the steps above to see it here.';
    $('tpl-key-hint').textContent = tpl.key
      ? `Writes ${T.KINDS[tpl.kind].open(tpl.key)} in the doc. Your page finds the data by this label.`
      : 'Your page finds the data by this label, so match what your project uses.';
  }

  function drawBuilder() {
    $('tpl-name').value = draft.name;
    $('tpl-key').value = draft.key;
    drawKinds();
    drawFields();
    drawPreview();
  }

  $('tpl-name').addEventListener('input', () => {
    draft.name = $('tpl-name').value;
    if (!keyTouched) { draft.key = keyFromName(draft.name); $('tpl-key').value = draft.key; }
    drawPreview();
  });
  $('tpl-key').addEventListener('input', () => {
    keyTouched = true;
    const clean = T.cleanKey($('tpl-key').value);
    if (clean !== $('tpl-key').value) $('tpl-key').value = clean;
    draft.key = clean;
    drawPreview();
  });
  $('tpl-add-field').addEventListener('click', () => {
    draft.fields.push({ key: '', long: false, required: false });
    drawFields(); drawPreview();
    [...$('tpl-fields').querySelectorAll('.tpl-field-top input')].at(-1)?.focus();
  });
  $('tpl-from-selection').addEventListener('click', async () => {
    const text = await window.archie.selection();
    if (!text.trim()) { $('tpl-builder-msg').textContent = 'Highlight an existing block in the doc first, then try again.'; return; }
    const read = T.fromText(text);
    if (!read.key && !read.fields.length) { $('tpl-builder-msg').textContent = 'That text has no ArchieML block or keys to read.'; return; }
    draft = { ...draft, ...read, name: draft.name.trim() || read.name };
    keyTouched = true;
    $('tpl-builder-msg').textContent = '';
    drawBuilder();
    status.textContent = `Read ${draft.fields.length || 'a'} field${draft.fields.length === 1 ? '' : 's'} from the doc`;
  });
  $('tpl-builder').addEventListener('submit', async (e) => {
    e.preventDefault();
    const tpl = cleaned();
    const problems = T.check(tpl);
    if (problems.length) { $('tpl-builder-msg').textContent = problems.join(' '); return; }
    tpl.id ||= Date.now().toString(36);
    render(await window.archie.saveTemplate(tpl));
    status.textContent = `Saved ${tpl.name}`;
    openForm(templates.find((t) => t.id === tpl.id) || tpl); // straight to filling it in
  });

  // ---- Fill-in form ----
  let current = null;
  let values = null;

  function openForm(tpl) {
    current = tpl;
    values = tpl.kind === 'object' ? {} : tpl.kind === 'items' ? [{}] : [''];
    $('tpl-items-only').checked = false;
    $('tpl-fill-title').textContent = tpl.name;
    $('tpl-fill-kind').textContent = `${T.KINDS[tpl.kind].label}. Writes ${T.KINDS[tpl.kind].open(tpl.key)} at your cursor.`;
    $('tpl-items-only-row').hidden = tpl.kind === 'object';
    $('tpl-items-only-label').textContent = `Only add items (my cursor is already inside ${T.KINDS[tpl.kind].open(tpl.key)})`;
    $('tpl-fill-msg').textContent = '';
    drawForm();
    show('fill');
    $('tpl-fill-fields').querySelector('input, textarea')?.focus();
  }

  const fieldInput = (f, obj, label) => {
    const id = `tpl-in-${Math.random().toString(36).slice(2, 8)}`;
    const input = f.long
      ? el('textarea', { id, rows: 3, value: obj[f.key] || '', spellcheck: true })
      : el('input', { id, type: 'text', value: obj[f.key] || '', autocomplete: 'off' });
    input.addEventListener('input', () => { obj[f.key] = input.value; drawFillPreview(); });
    const need = f.required || (current.kind === 'items' && f === current.fields[0]);
    const help = f.hint ? el('div', { className: 'hint tpl-in-help', id: `${id}-help`, textContent: f.hint }) : '';
    if (help) input.setAttribute('aria-describedby', help.id);
    return el('div', { className: 'tpl-in' },
      el('label', { htmlFor: id, className: 'tpl-in-label' }, label || f.key, need ? el('span', { className: 'tpl-need', textContent: ' required' }) : ''),
      input, help);
  };

  function drawForm() {
    const box = $('tpl-fill-fields');
    if (current.kind === 'object') {
      box.replaceChildren(...current.fields.map((f) => fieldInput(f, values)));
    } else if (current.kind === 'items') {
      box.replaceChildren(...values.map((item, i) => el('fieldset', { className: 'tpl-item' },
        el('legend', {}, `Item ${i + 1}`),
        ...(values.length > 1 ? [el('button', { type: 'button', className: 'link tpl-item-remove', textContent: 'Remove', onclick: () => { values.splice(i, 1); drawForm(); } })] : []),
        ...current.fields.map((f) => fieldInput(f, item)))),
      el('button', { type: 'button', className: 'link', textContent: '+ Add another item', onclick: () => {
        values.push({}); drawForm();
        [...box.querySelectorAll('.tpl-item')].at(-1)?.querySelector('input, textarea')?.focus();
      } }));
    } else {
      box.replaceChildren(...values.map((v, i) => {
        const input = el('input', { type: 'text', value: v, autocomplete: 'off', placeholder: `Item ${i + 1}` });
        input.setAttribute('aria-label', `Item ${i + 1}`);
        input.addEventListener('input', () => { values[i] = input.value; drawFillPreview(); });
        input.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter') return;
          e.preventDefault(); // Enter adds the next line instead of submitting
          values.splice(i + 1, 0, ''); drawForm();
          box.querySelectorAll('input')[i + 1]?.focus();
        });
        return el('div', { className: 'tpl-line' }, input, iconButton('remove', `Remove item ${i + 1}`, () => {
          values.splice(i, 1); if (!values.length) values.push(''); drawForm();
        }));
      }), el('button', { type: 'button', className: 'link', textContent: '+ Add item', onclick: () => {
        values.push(''); drawForm(); [...box.querySelectorAll('input')].at(-1)?.focus();
      } }));
    }
    drawFillPreview();
  }

  const drawFillPreview = () => {
    $('tpl-fill-preview').textContent = T.generate(current, values, { itemsOnly: $('tpl-items-only').checked });
  };
  $('tpl-items-only').addEventListener('change', drawFillPreview);
  $('tpl-edit').addEventListener('click', () => openBuilder(current));
  $('tpl-fill').addEventListener('submit', async (e) => {
    e.preventDefault();
    const problems = T.missing(current, values);
    if (problems.length) { $('tpl-fill-msg').textContent = problems.join(' '); return; }
    await window.archie.insert(T.generate(current, values, { itemsOnly: $('tpl-items-only').checked }));
    const count = current.kind === 'object' ? 0 : values.filter((v) => (typeof v === 'string' ? v.trim() : Object.values(v).some((x) => String(x).trim()))).length;
    status.textContent = count ? `Inserted ${current.name}: ${count} item${count === 1 ? '' : 's'}` : `Inserted ${current.name}`;
    close();
  });

  $('tpl-new').addEventListener('click', () => openBuilder(null));

  // ---- Share templates as a file ----
  $('tpl-export').addEventListener('click', async () => {
    const done = await window.archie.exportTemplates();
    if (done) status.textContent = `Exported ${done.templates} template${done.templates === 1 ? '' : 's'}`;
  });
  $('tpl-import').addEventListener('click', async () => {
    const done = await window.archie.importTemplates();
    if (!done) return;
    if (done.error) { status.textContent = done.error; return; }
    render(done.store);
    status.textContent = `Imported ${done.templates} template${done.templates === 1 ? '' : 's'}`;
  });

  // The sidebar may have drawn before this file loaded, so draw once now.
  window.archie.store().then(window.renderTemplates);
})();

// Structured templates: turn a template plus filled-in values into ArchieML,
// and read a highlighted block back into a template. No UI here, so the same
// file runs in the sidebar and in the tests.
//
// A template is { id, name, kind, key, fields: [{ key, long, required }] }
//   kind 'object' -> {key} fields {}
//   kind 'items'  -> [key] repeating groups of fields []
//   kind 'list'   -> [key] * one line per item []
(function (root) {
  'use strict';

  const KINDS = {
    object: { label: 'Group of fields', hint: 'One set of fields, like a page header', open: (k) => `{${k}}`, close: '{}' },
    items: { label: 'List of items', hint: 'Repeating groups, like a list of speakers', open: (k) => `[${k}]`, close: '[]' },
    list: { label: 'List of text', hint: 'One line per item, like tags', open: (k) => `[${k}]`, close: '[]' },
  };

  // Keys and block names can't contain spaces or ArchieML's own punctuation.
  const cleanKey = (s) => String(s || '').replace(/[\s[\]{}:*\\]+/g, '');

  // Inside a multi-line value, a line that looks like a key or a command would
  // be read as one, so it is escaped with a leading backslash.
  const needsEscape = (line) => /^\s*([[{*:\\]|[^\s[\]{}:]+[ \t]*:)/.test(line);

  function valueLines(key, raw) {
    const lines = String(raw).replace(/\r\n?/g, '\n').replace(/\s+$/, '').split('\n');
    if (lines.length === 1) return [`${key}: ${lines[0]}`];
    return [`${key}: ${lines[0]}`, ...lines.slice(1).map((l) => (needsEscape(l) ? `\\${l}` : l)), ':end'];
  }

  const filled = (v) => String(v ?? '').trim() !== '';

  function groupLines(fields, values) {
    return fields.flatMap((f) => (filled(values[f.key]) ? valueLines(f.key, values[f.key]) : []));
  }

  // values: object -> { field: text }; items -> [{ field: text }]; list -> [text]
  // itemsOnly: write just the items, for adding to a list that's already open.
  function generate(tpl, values, { itemsOnly = false } = {}) {
    const kind = KINDS[tpl.kind];
    let body;
    if (tpl.kind === 'object') body = groupLines(tpl.fields, values || {});
    else if (tpl.kind === 'items') {
      body = (values || []).map((item) => groupLines(tpl.fields, item)).filter((g) => g.length)
        .flatMap((g, i) => (i ? ['', ...g] : g));
    } else {
      body = (values || []).filter(filled).map((v) => `* ${String(v).replace(/\s*\n\s*/g, ' ').trim()}`);
    }
    if (itemsOnly && tpl.kind !== 'object') return body.join('\n');
    return [kind.open(tpl.key), ...body, kind.close].join('\n');
  }

  // Sample values so the builder can preview a template before it's used.
  function sample(tpl) {
    const one = () => Object.fromEntries(tpl.fields.map((f) => [f.key, f.long ? `${f.key} text\nsecond line` : `${f.key} value`]));
    if (tpl.kind === 'object') return one();
    if (tpl.kind === 'items') return [one(), one()];
    return ['first item', 'second item'];
  }

  // Problems that would stop a template from producing good ArchieML.
  function check(tpl) {
    const problems = [];
    if (!String(tpl.name || '').trim()) problems.push('Give the template a name.');
    if (!cleanKey(tpl.key)) problems.push('Give the block a name, like speakers.');
    if (tpl.kind !== 'list') {
      const keys = tpl.fields.map((f) => cleanKey(f.key));
      if (!keys.length) problems.push('Add at least one field.');
      if (keys.some((k) => !k)) problems.push('Every field needs a name.');
      const dupe = keys.find((k, i) => k && keys.indexOf(k) !== i);
      if (dupe) problems.push(`Two fields are called “${dupe}”.`);
    }
    return problems;
  }

  // Required fields left empty, as messages the form can show.
  function missing(tpl, values) {
    const out = [];
    const need = (f) => f.required || (tpl.kind === 'items' && f === tpl.fields[0]);
    if (tpl.kind === 'object') tpl.fields.forEach((f) => { if (need(f) && !filled(values[f.key])) out.push(`Fill in ${f.key}.`); });
    if (tpl.kind === 'items') {
      if (!values.length) out.push('Add at least one item.');
      values.forEach((item, i) => tpl.fields.forEach((f) => {
        if (need(f) && !filled(item[f.key])) out.push(`Item ${i + 1}: fill in ${f.key}.`);
      }));
    }
    if (tpl.kind === 'list' && !values.some(filled)) out.push('Add at least one item.');
    return out;
  }

  const humanize = (k) => {
    const s = String(k).replace(/[._-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim();
    return s ? s[0].toUpperCase() + s.slice(1) : '';
  };

  // Read a highlighted block (like an existing {speaker} or [acts]) into a template.
  function fromText(text) {
    const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
    const scope = lines.map((l) => /^\s*([[{])\s*([+.]*)\s*([^\]}\s]+)\s*[\]}]/.exec(l)).find(Boolean);
    const fields = [];
    let lastKey = null;
    let sawBullet = false;
    for (const line of lines) {
      if (/^\s*:end/i.test(line)) { const f = fields.find((x) => x.key === lastKey); if (f) f.long = true; continue; }
      if (/^\s*\*/.test(line)) { sawBullet = true; continue; }
      const m = /^\s*([^\s[\]{}:]+)[ \t]*:/.exec(line);
      if (m) {
        lastKey = m[1];
        if (!fields.some((f) => f.key === m[1])) fields.push({ key: m[1], long: false, required: false });
      }
    }
    let kind = 'object';
    if (scope && scope[1] === '[') kind = sawBullet && !fields.length ? 'list' : 'items';
    const key = scope ? scope[3] : '';
    return {
      name: humanize(key) || 'New template',
      kind,
      key,
      fields: kind === 'list' ? [] : fields.map((f, i) => ({ ...f, required: kind === 'items' && i === 0 })),
    };
  }

  const api = { KINDS, cleanKey, generate, sample, check, missing, fromText, humanize };
  root.TemplatesCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

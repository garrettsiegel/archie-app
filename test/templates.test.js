const test = require('node:test');
const assert = require('node:assert');
const archieml = require('archieml');
const T = require('../sidebar/templates-core');
const { lint } = require('../lib/lint');

const speaker = { name: 'Speaker', kind: 'object', key: 'speaker', fields: [
  { key: 'name', long: false, required: true },
  { key: 'title', long: false, required: false },
  { key: 'bio', long: true, required: false },
] };

test('object template writes ArchieML that parses back to the same values', () => {
  const text = T.generate(speaker, { name: 'Rhea Patel', title: 'Editor', bio: 'Covers city hall.\nname: not a key\n[not a list]' });
  assert.deepStrictEqual(lint(text).issues, []);
  assert.deepStrictEqual(archieml.load(text), {
    speaker: { name: 'Rhea Patel', title: 'Editor', bio: 'Covers city hall.\nname: not a key\n[not a list]' },
  });
});

test('empty optional fields are left out', () => {
  assert.strictEqual(T.generate(speaker, { name: 'Ana' }), '{speaker}\nname: Ana\n{}');
});

test('list of items keeps every item, and items-only skips the brackets', () => {
  const acts = { name: 'Acts', kind: 'items', key: 'acts', fields: [{ key: 'name' }, { key: 'night' }] };
  const values = [{ name: 'The Lanterns', night: 'Friday' }, { name: 'Mira Sol', night: '' }];
  const text = T.generate(acts, values);
  assert.deepStrictEqual(lint(text).issues, []);
  assert.deepStrictEqual(archieml.load(text), { acts: [{ name: 'The Lanterns', night: 'Friday' }, { name: 'Mira Sol' }] });
  assert.strictEqual(T.generate(acts, values, { itemsOnly: true }), 'name: The Lanterns\nnight: Friday\n\nname: Mira Sol');
});

test('list of text', () => {
  const tags = { name: 'Tags', kind: 'list', key: 'tags', fields: [] };
  const text = T.generate(tags, ['music', '', 'summer\nnights']);
  assert.deepStrictEqual(archieml.load(text), { tags: ['music', 'summer nights'] });
});

test('checks catch missing names, duplicate fields and required values', () => {
  assert.deepStrictEqual(T.check({ name: '', kind: 'object', key: '', fields: [{ key: 'a' }, { key: 'a' }] }),
    ['Give the template a name.', 'Give the block a name, like speakers.', 'Two fields are called “a”.']);
  assert.deepStrictEqual(T.missing(speaker, { title: 'x' }), ['Fill in name.']);
  const acts = { kind: 'items', fields: [{ key: 'name' }, { key: 'night' }] };
  assert.deepStrictEqual(T.missing(acts, [{ night: 'Fri' }]), ['Item 1: fill in name.']);
});

test('reads a highlighted block into a template', () => {
  assert.deepStrictEqual(T.fromText('{speaker}\nname: Rhea\nbio: one\ntwo\n:end\n{}'), {
    name: 'Speaker', kind: 'object', key: 'speaker',
    fields: [{ key: 'name', long: false, required: false }, { key: 'bio', long: true, required: false }],
  });
  const items = T.fromText('[acts]\nname: A\nnight: Fri\n\nname: B\nnight: Sat\n[]');
  assert.strictEqual(items.kind, 'items');
  assert.deepStrictEqual(items.fields.map((f) => [f.key, f.required]), [['name', true], ['night', false]]);
  assert.strictEqual(T.fromText('[tags]\n* a\n* b\n[]').kind, 'list');
  assert.strictEqual(T.cleanKey('my key: [x]'), 'mykeyx');
});

const F = require('../sidebar/format');

test('doc colors mark keys and block lines, and keep the text the same', () => {
  const text = '{intro}\nheadline: Hi: there\n[+body]\n* item\n\\key: escaped\n[]\n{}\n';
  const html = F.toHtml(text, { key: { textOn: true, text: '#1a73e8', highlightOn: false }, block: { textOn: false, highlightOn: true, highlight: '#d62e0b' }, bold: true });
  // Every run sets all three styles, so nothing leaks in from the cursor.
  assert.match(html, /<span style="color:#000000;background-color:#d62e0b;font-weight:700">\{intro\}<\/span>/);
  assert.match(html, /<span style="color:#1a73e8;background-color:#ffffff;font-weight:700">headline:<\/span><span style="color:#000000;background-color:#ffffff;font-weight:400"> Hi: there<\/span>/);
  assert.ok(!/700">\\key/.test(html), 'escaped lines are not keys');
  assert.ok(html.endsWith('</p>'), 'a trailing newline is the last <p>, no extra break');
  assert.equal((html.match(/<p /g) || []).length, 7);
  // A blank line is a bare <br>; a last line without a newline stays inline.
  assert.match(F.toHtml('a\n\nb', {}), /<\/p><br><span[^>]*>b<\/span>$/);
  // The text a reader gets back is unchanged.
  const plain = html.replace(/<meta[^>]*>/, '').replace(/<\/p>/g, '\n').replace(/<br>/g, '\n').replace(/<[^>]+>/g, '').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
  assert.equal(plain, text);
});

test('doc color settings are cleaned', () => {
  assert.deepEqual(F.clean({ on: false, key: { text: 'red', highlightOn: true }, bold: 1 }), {
    on: false,
    key: { textOn: true, text: '#1a73e8', highlightOn: true, highlight: '#fff3b0' },
    block: { textOn: true, text: '#d62e0b', highlightOn: false, highlight: '#ffe0d6' },
    bold: true,
  });
  // Older one-color settings carry over.
  assert.deepEqual(F.clean({ key: { color: '#ffe16b', look: 'highlight' } }).key, { textOn: false, text: '#1a73e8', highlightOn: true, highlight: '#ffe16b' });
  assert.equal(F.css({ textOn: true, text: '#111111', highlightOn: true, highlight: '#222222' }, false), 'color:#111111;background-color:#222222');
  assert.equal(F.css({ textOn: false, highlightOn: false }, false, true), 'color:#000000;background-color:#ffffff;font-weight:400');
});

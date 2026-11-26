const test = require('node:test');
const assert = require('node:assert');
const { lint } = require('../lib/lint');

const messages = (doc) => lint(doc).issues.map((i) => `${i.line}: ${i.message}`);

test('clean document has no issues', () => {
  const doc = [
    'title: Hello', 'body: one', 'two', ':end',
    '{meta}', 'author: me', '{}',
    '[people]', 'name: a', 'role: x', '', 'name: b', 'role: y', '[]',
    '[tags]', '* a', 'note: still text', '* b', '[]',
    '[+story]', 'text: a', 'text: b', '[]',
    '[days]', 'day: 1', '[.events]', 'at: noon', '[]', '[]',
    ':skip', '{never}', ':endskip',
  ].join('\n');
  assert.deepStrictEqual(messages(doc), []);
});

test('flags unclosed, stray and mismatched blocks', () => {
  assert.match(messages('{a}\nk: v')[0], /never closed/);
  assert.match(messages('[]')[0], /closes nothing/);
  assert.match(messages('{a}\n[]')[0], /closing \{a\}/);
  assert.match(messages('[a}\n[]')[0], /Mismatched/);
  assert.match(messages('{a}\n[b]\n[]')[0], /1: \{a\} is never closed/);
});

test('flags duplicates, :end, :skip and spaced keys', () => {
  assert.match(messages('a: 1\na: 2')[0], /Duplicate key "a"/);
  assert.match(messages('[x]\nn: 1\nv: 1\nv: 2\n[]')[0], /Duplicate key "v"/);
  assert.match(messages('{o}\na: 1\n{}\n{o}\na: 2\n{}')[0], /Duplicate/);
  assert.match(messages(':end')[0], /no value/);
  assert.match(messages(':skip\nx')[0], /no :endskip/);
  assert.match(messages('my key: value')[0], /has a space/);
});

test('stops at :ignore and handles Docs export line endings', () => {
  assert.deepStrictEqual(messages('﻿a: 1\r\n:ignore\r\n[]'), []);
});

test('outline lists blocks with depth', () => {
  const { outline } = lint('[days]\nd: 1\n[.events]\n[]\n[]\n{meta}\n{}');
  assert.deepStrictEqual(outline.map((o) => [o.label, o.depth]),
    [['[days]', 0], ['[.events]', 1], ['{meta}', 0]]);
});

test('occurrence counts earlier matches so Find lands on the right line', () => {
  const { outline } = lint('{a}\n{}\n{a}\nx: 1\n{}');
  assert.deepStrictEqual(outline.map((o) => o.occurrence), [1, 2]);
  // "x: 1" also appears inside "max: 10", so Find needs the second match.
  const { issues } = lint('max: 10\nx: 1\nx: 2');
  assert.strictEqual(issues[0].text, 'x: 2');
  assert.strictEqual(lint('max: 10\nx: 1\nx: 1').issues[0].occurrence, 3);
});

// ArchieML primitives (https://archieml.org). Each `text(name)` returns what
// gets typed into the doc; `name` comes from the sidebar's name field. `wrap(name,
// selection)`, where present, surrounds highlighted text instead.
const around = (open, close) => (n, sel) => `${open(n)}\n${sel}\n${close}`;
window.SNIPPETS = [
  {
    group: 'Values',
    items: [
      { label: 'Key: value', hint: 'A single key and value', text: (n) => `${n || 'key'}: value` },
      { label: 'Multi-line value', hint: 'Value spanning lines, closed by :end', text: (n) => `${n || 'key'}: first line\nmore lines\n:end`, wrap: (n, sel) => `${n || 'key'}: ${sel}\n:end` },
    ],
  },
  {
    group: 'Objects',
    items: [
      { label: '{object}', hint: 'Group keys under a name', text: (n) => `{${n || 'object'}}\nkey: value\n{}`, wrap: around((n) => `{${n || 'object'}}`, '{}') },
      { label: '{parent.child}', hint: 'Nested object with dot notation', text: (n) => `{${n || 'parent.child'}}\nkey: value\n{}`, wrap: around((n) => `{${n || 'parent.child'}}`, '{}') },
      { label: '{} close', hint: 'Return to the top level', text: () => '{}' },
    ],
  },
  {
    group: 'Arrays',
    items: [
      { label: '[array] of objects', hint: 'Repeat the first key to start a new item', text: (n) => `[${n || 'items'}]\nname: first\nvalue: 1\n\nname: second\nvalue: 2\n[]`, wrap: around((n) => `[${n || 'items'}]`, '[]') },
      { label: '[array] of strings', hint: 'Each * line is one item', text: (n) => `[${n || 'list'}]\n* first\n* second\n[]`, wrap: (n, sel) => `[${n || 'list'}]\n${sel.split(/\r?\n/).filter((l) => l.trim()).map((l) => `* ${l.trim()}`).join('\n')}\n[]` },
      { label: '[+freeform]', hint: 'Mixed text and keys, keeps order', text: (n) => `[+${n || 'body'}]\ntext: A paragraph of text.\nPlain lines become text too.\n[]`, wrap: around((n) => `[+${n || 'body'}]`, '[]') },
      { label: '[.nested] array', hint: 'Array inside the current array item', text: (n) => `[.${n || 'children'}]\nkey: value\n[]`, wrap: around((n) => `[.${n || 'children'}]`, '[]') },
      { label: '[] close', hint: 'End the current array', text: () => '[]' },
      { label: '* item', hint: 'One string array item', text: (n) => `* ${n || 'item'}` },
    ],
  },
  {
    group: 'Commands',
    items: [
      { label: ':skip … :endskip', hint: 'Parser ignores everything inside', text: () => ':skip\nnotes the parser will ignore\n:endskip', wrap: around(() => ':skip', ':endskip') },
      { label: ':ignore', hint: 'Parser stops reading here', text: () => ':ignore' },
      { label: ':end', hint: 'Close a multi-line value', text: () => ':end' },
      { label: '\\ escape', hint: 'Make a line starting with : [ { * literal', text: () => '\\' },
    ],
  },
];

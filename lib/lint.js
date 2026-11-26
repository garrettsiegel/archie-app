// Finds likely mistakes in ArchieML and builds an outline of its objects and
// arrays. ArchieML itself never errors (it silently drops what it can't read),
// so these checks mirror the rules in the archieml parser.
const NAME = '[^\\s\\[\\]{}:]';
const KEY = new RegExp(`^\\s*(${NAME}+)[ \\t]*:(.*)$`);
const COMMAND = /^\s*:[ \t]*(endskip|ignore|skip|end)/i;
const SCOPE = new RegExp(`^\\s*(\\[|\\{)[ \\t]*([+.]*)[ \\t]*(${NAME}*)[ \\t]*(\\]|\\})`);
const BULLET = /^\s*\*/;
// "two words: value" is probably meant to be a key, but the parser ignores it.
const SPACED_KEY = /^\s*([A-Za-z_][\w-]*(?: [A-Za-z_][\w-]*){1,2}):\s*\S/;

function lint(input) {
  const issues = [];
  const outline = [];
  const lines = String(input).replace(/^﻿/, '').split(/\r\n|\r|\n/);
  // Which match Find would need to reach this line (used by "jump to").
  let lowerText = null;
  let lineStarts = null;
  const occurrenceOf = (n) => {
    if (lowerText === null) {
      lowerText = lines.join('\n').toLowerCase();
      lineStarts = [0];
      for (const l of lines) lineStarts.push(lineStarts[lineStarts.length - 1] + l.length + 1);
    }
    const needle = lines[n - 1].trim().toLowerCase();
    const end = lineStarts[n - 1];
    let count = 1;
    for (let at = lowerText.indexOf(needle); at !== -1 && at < end; at = lowerText.indexOf(needle, at + 1)) count++;
    return count;
  };

  let stack = [];            // open blocks, innermost last
  let rootKeys = new Map();  // key -> line number, for duplicates
  const objects = new Map(); // reopened {name} blocks keep their keys
  let skipLine = null;
  let hasValue = false;      // is there something :end could close?
  let usedEnd = new Set();

  const add = (line, severity, message) =>
    issues.push({ line, severity, message, text: lines[line - 1].trim(), occurrence: occurrenceOf(line) });
  const top = () => stack[stack.length - 1];
  const reportUnclosed = (block) => {
    const close = block.type === '[' ? '[]' : '{}';
    add(block.line, 'warning', `${block.label} is never closed with ${close}`);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const n = i + 1;
    const trimmed = line.trim();

    const command = COMMAND.exec(line);
    if (command) {
      const name = command[1].toLowerCase();
      if (name === 'ignore') break;
      if (name === 'skip') { if (skipLine === null) skipLine = n; hasValue = false; }
      else if (name === 'endskip') {
        if (skipLine === null) add(n, 'warning', ':endskip without a :skip before it');
        skipLine = null;
      } else if (skipLine === null) {
        if (!hasValue) add(n, 'warning', ':end has no value above it to close');
        else usedEnd.add(n);
        hasValue = false;
      }
      continue;
    }
    if (skipLine !== null) continue;

    const scope = SCOPE.exec(line);
    if (scope) {
      const [, type, flags, name, closer] = scope;
      hasValue = false;
      if ((type === '[') !== (closer === ']')) {
        add(n, 'error', `Mismatched brackets: opens with ${type} but closes with ${closer}`);
      }
      if (!name) {
        if (!stack.length) add(n, 'warning', `${type === '[' ? '[]' : '{}'} closes nothing`);
        else {
          const block = stack.pop();
          if (block.type !== type) {
            add(n, 'error', `${type === '[' ? '[]' : '{}'} is closing ${block.label} (line ${block.line})`);
          }
        }
        continue;
      }
      const nested = flags.includes('.');
      if (!nested) {
        // A new top-level block silently ends whatever was open.
        stack.forEach(reportUnclosed);
        stack = [];
      }
      const label = type === '[' ? `[${flags}${name}]` : `{${flags}${name}}`;
      let keys = new Map();
      if (type === '{' && !nested) {
        if (!objects.has(name)) objects.set(name, keys);
        keys = objects.get(name);
      }
      if (type === '[' && !nested) {
        if (rootKeys.has(name)) add(n, 'warning', `${label} replaces "${name}" from line ${rootKeys.get(name)}`);
        rootKeys.set(name, n);
      }
      outline.push({ line: n, depth: stack.length, label, text: trimmed, occurrence: occurrenceOf(n) });
      const parent = top();
      stack.push({
        type, label, line: n, keys,
        firstKey: null,
        freeform: flags.includes('+') || Boolean(parent && parent.freeform && type === '{'),
        simple: false,
      });
      continue;
    }

    const block = top();
    if (BULLET.test(line) && block && block.type === '[' && !block.freeform && block.firstKey === null) {
      block.simple = true;
      hasValue = true;
      continue;
    }

    const key = KEY.exec(line);
    if (key && !(block && block.simple)) {
      hasValue = true;
      const name = key[1];
      if (block && block.freeform) continue; // repeats are expected
      const keys = block ? block.keys : rootKeys;
      if (block && block.type === '[') {
        if (block.firstKey === null) block.firstKey = name;
        else if (name === block.firstKey) keys.clear(); // next array item
      }
      if (keys.has(name)) add(n, 'warning', `Duplicate key "${name}" overwrites line ${keys.get(name)}`);
      keys.set(name, n);
      continue;
    }

    const spaced = SPACED_KEY.exec(line);
    if (spaced && !hasValue && !(block && (block.freeform || block.simple))) {
      add(n, 'info', `"${spaced[1]}" has a space, so it is not read as a key`);
    }
  }

  if (skipLine !== null) add(skipLine, 'error', ':skip has no :endskip, so everything after it is ignored');
  stack.forEach(reportUnclosed);
  issues.sort((a, b) => a.line - b.line);
  return { issues, outline };
}

module.exports = { lint };

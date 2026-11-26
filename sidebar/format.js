// Colors ArchieML in the doc so it's easier to read: keys (`name:`) and the
// lines that open and close objects and arrays (`{intro}`, `[]`). ArchieML
// reads plain text, so the colors never change the data.
(function (root) {
  'use strict';

  const DEFAULTS = {
    on: true,
    key: { textOn: true, text: '#1a73e8', highlightOn: false, highlight: '#fff3b0' },
    block: { textOn: true, text: '#d62e0b', highlightOn: false, highlight: '#ffe0d6' },
    bold: false,
  };

  // Same patterns the ArchieML parser uses for keys and for {scope} / [array] lines.
  const KEY_RE = /^(\s*)([A-Za-z0-9\-_.]+[ \t]*:)(.*)$/;
  const SCOPE_RE = /^(\s*)([[{][ \t]*[+.]*[ \t]*[A-Za-z0-9\-_.]*[ \t]*[\]}])(.*)$/;

  const validColor = (c) => /^#[0-9a-f]{6}$/i.test(String(c || ''));
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function clean(c = {}) {
    const part = (p = {}, d) => {
      // Older settings had one color plus a look (text or highlight).
      if (p.color && !('text' in p) && !('highlight' in p)) {
        p = p.look === 'highlight'
          ? { textOn: false, highlightOn: true, highlight: p.color }
          : { textOn: true, text: p.color, highlightOn: false };
      }
      return {
        textOn: 'textOn' in p ? Boolean(p.textOn) : d.textOn,
        text: validColor(p.text) ? p.text : d.text,
        highlightOn: 'highlightOn' in p ? Boolean(p.highlightOn) : d.highlightOn,
        highlight: validColor(p.highlight) ? p.highlight : d.highlight,
      };
    };
    return {
      on: c.on !== false,
      key: part(c.key, DEFAULTS.key),
      block: part(c.block, DEFAULTS.block),
      bold: Boolean(c.bold),
    };
  }

  // Styles for a marked part. The preview sets only what's turned on; the doc
  // copy sets everything, because Docs otherwise carries over the bold or
  // highlight of the text at the cursor. "No highlight" is white: Docs pages are
  // white, and Docs won't clear a highlight from pasted text any other way.
  function css(part, bold, explicit = false) {
    const out = [];
    if (part.textOn) out.push(`color:${part.text}`);
    else if (explicit) out.push('color:#000000');
    if (part.highlightOn) out.push(`background-color:${part.highlight}`);
    else if (explicit) out.push('background-color:#ffffff'); // Docs ignores "transparent" when pasting
    if (bold) out.push('font-weight:700');
    else if (explicit) out.push('font-weight:400');
    return out.join(';');
  }
  const PLAIN = 'color:#000000;background-color:#ffffff;font-weight:400';

  // Which part of a line gets colored: { lead, mark, rest, kind } or null.
  function split(line) {
    let m = SCOPE_RE.exec(line);
    if (m) return { lead: m[1], mark: m[2], rest: m[3], kind: 'block' };
    m = KEY_RE.exec(line);
    if (m) return { lead: m[1], mark: m[2], rest: m[3], kind: 'key' };
    return null;
  }

  function lineHtml(line, c) {
    const s = c.on ? split(line) : null;
    if (!s) return `<span style="${PLAIN}">${esc(line)}</span>`;
    const plain = (t) => (t ? `<span style="${PLAIN}">${esc(t)}</span>` : '');
    return `${plain(s.lead)}<span style="${css(c[s.kind], c.bold, true)}">${esc(s.mark)}</span>${plain(s.rest)}`;
  }

  // HTML for the clipboard, shaped the way Docs copies text (checked in Docs):
  // each full line is a <p>, which brings its own line break; a blank line is
  // a bare <br> (Docs drops an empty <p>); a last line with no newline after
  // it stays inline, so it joins the text after the cursor like typing would.
  function toHtml(text, colors) {
    const c = clean(colors);
    const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
    const tail = lines.pop(); // '' when the text ends with a newline
    const paras = lines.map((l) => (l.trim() === '' ? '<br>' : `<p dir="ltr" style="margin-top:0pt;margin-bottom:0pt;">${lineHtml(l, c)}</p>`));
    return `<meta charset="utf-8">${paras.join('')}${tail ? lineHtml(tail, c) : ''}`;
  }

  const api = { DEFAULTS, clean, split, css, toHtml };
  root.ArchieFormat = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

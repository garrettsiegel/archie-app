// The Data, Issues and Outline tabs.
(() => {
  let tab = 'insert';
  let data = { state: 'none' };

  function entry(item, title, detail, className = '') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `snippet item ${className}`;
    btn.title = 'Jump to this line in the doc';
    const code = document.createElement('code');
    code.textContent = title;
    const small = document.createElement('small');
    small.textContent = detail;
    btn.append(code, small);
    btn.addEventListener('click', () => window.archie.jump({ text: item.text, occurrence: item.occurrence }));
    return btn;
  }

  function render() {
    const ok = data.state === 'ok';
    const count = ok ? data.issues.length : 0;
    $('issue-count').hidden = !count;
    $('issue-count').textContent = count;
    document.querySelectorAll('[data-tab]').forEach((b) => {
      const selected = b.dataset.tab === tab;
      b.setAttribute('aria-selected', selected);
      b.tabIndex = selected ? 0 : -1; // arrow keys move between tabs
    });
    if (['data', 'issues', 'outline'].includes(tab)) $('preview').setAttribute('aria-labelledby', `tab-${tab}`);
    document.querySelectorAll('[data-for]').forEach((n) => { n.hidden = !n.dataset.for.split(' ').includes(tab); });
    for (const id of ['data', 'issues', 'outline']) $(id).hidden = !ok || id !== tab;
    $('copy').disabled = $('export').disabled = !ok;
    $('publish-again').hidden = !(ok && data.destination);
    if (ok && data.destination) $('publish-again').title = `Publish to ${data.destination.label}`;

    let notice = '';
    if (data.state === 'none') notice = 'Open a Google Doc to see its data.';
    else if (data.state === 'loading') notice = 'Reading doc…';
    else if (data.state === 'error') notice = data.message;
    else if (data.stale) notice = `Showing older data. ${data.stale}`;
    else if (tab === 'issues' && !count) notice = 'No problems found.';
    else if (tab === 'outline' && !data.outline.length) notice = 'No {objects} or [arrays] yet.';
    $('notice').textContent = notice;
    if (!ok) return;

    if ($('data').textContent !== data.json) $('data').textContent = data.json;
    $('issues').replaceChildren(...data.issues.map((i) =>
      entry(i, i.text, `Line ${i.line}: ${i.message}`, i.severity)));
    $('outline').replaceChildren(...data.outline.map((o) =>
      entry(o, `${'   '.repeat(o.depth)}${o.label}`, `Line ${o.line}`)));
  }

  let lastSeen = '';
  function update(next) {
    const key = JSON.stringify(next);
    if (key === lastSeen) return; // keeps scroll and focus while nothing changes
    lastSeen = key;
    data = next;
    render();
  }

  let flashTimer;
  function flash(message, ms = 2500) {
    clearTimeout(flashTimer);
    $('note').textContent = message;
    flashTimer = setTimeout(() => { $('note').textContent = ''; }, ms);
  }

  function show(name) {
    if (name === tab) return;
    tab = name;
    render();
    document.dispatchEvent(new CustomEvent('tabchange', { detail: tab }));
  }
  const tabs = [...document.querySelectorAll('[data-tab]')];
  tabs.forEach((b, i) => {
    b.addEventListener('click', () => show(b.dataset.tab));
    b.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      const to = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : step ? (i + step + tabs.length) % tabs.length : null;
      if (to === null) return;
      e.preventDefault();
      show(tabs[to].dataset.tab);
      tabs[to].focus();
    });
  });
  // Lets the Upload view switch tabs.
  window.showTab = show;
  window.archie.onTogglePreview(() => show(tab === 'insert' ? 'data' : 'insert'));
  $('publish-again').addEventListener('click', async () => {
    const btn = $('publish-again');
    btn.disabled = true;
    flash('Publishing…');
    try {
      const res = await window.archie.publishAgain();
      if (res.needsLogin) return window.openPublish(res.error);
      if (res.error) return flash(res.error, 8000);
      flash(res.target ? 'Published' : 'Cancelled');
    } finally { btn.disabled = false; }
  });
  $('refresh').addEventListener('click', () => window.archie.refresh());
  $('copy').addEventListener('click', async () => { await window.archie.copyJson(); flash('Copied'); });
  $('export').addEventListener('click', async () => {
    try { if (await window.archie.exportJson()) flash('Saved'); }
    catch { flash('Could not save'); }
  });

  window.archie.onDocData(update);
  window.archie.docData().then(update);
  render();
})();

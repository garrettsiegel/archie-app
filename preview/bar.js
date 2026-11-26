// Toolbar and setup screen for the live preview panel.
const $ = (id) => document.getElementById(id);
let state = {};
let editing = false;

function render() {
  const linked = Boolean(state.base);
  const setup = !state.hasDoc || !linked || editing;
  $('setup').hidden = !setup;
  $('link-label').hidden = !linked || !state.hasDoc;
  $('reload').disabled = $('external').disabled = !linked;
  $('spinner').hidden = !state.loading;

  if (linked) {
    const u = new URL(state.base);
    $('link-label').textContent = `${u.host}${u.pathname}`;
  }
  if (!state.hasDoc) {
    $('setup-title').textContent = 'Open a Google Doc to preview it';
    $('setup-text').textContent = 'The preview shows the doc that’s open on the left.';
    $('url-form').hidden = true;
  } else {
    $('setup-title').textContent = editing ? 'Change the project link' : 'See this doc in its project';
    $('setup-text').textContent = 'Paste the project’s QA or test link. The page will read this doc instead of the published data, so you can check your edits before publishing.';
    $('url-form').hidden = false;
    $('cancel').hidden = !editing;
    $('unlink').hidden = !editing;
  }
  $('status').hidden = !(state.error && !setup);
  if (state.error && !setup) $('status').textContent = `${state.error} Check the link, or that you’re on the network the QA site needs.`;
}

window.archie.onPreviewState((s) => {
  const docChanged = s.title !== state.title;
  state = s;
  if (docChanged) editing = false;
  if (!$('setup').hidden && document.activeElement !== $('url')) $('url').value = state.base || '';
  render();
});

$('url-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('error').textContent = '';
  const res = await window.archie.previewSetUrl($('url').value);
  if (res.error) { $('error').textContent = res.error; return; }
  editing = false;
  render();
});
$('link-label').addEventListener('click', () => {
  editing = true;
  $('url').value = state.base;
  render();
  $('url').focus();
  $('url').select();
  window.archie.previewAction('edit-start');
});
$('cancel').addEventListener('click', () => { editing = false; render(); window.archie.previewAction('edit-end'); });
$('unlink').addEventListener('click', () => window.archie.previewSetUrl(''));
$('reload').addEventListener('click', () => window.archie.previewAction('reload'));
$('external').addEventListener('click', () => window.archie.previewAction('external'));
$('close').addEventListener('click', () => window.archie.previewAction('close'));

// Drag the left edge to change the preview's width.
{
  const edge = $('resize');
  let startX = 0;
  edge.addEventListener('pointerdown', (e) => {
    startX = e.screenX;
    edge.setPointerCapture(e.pointerId);
    edge.classList.add('dragging');
    window.archie.previewResize({ phase: 'start' });
  });
  edge.addEventListener('pointermove', (e) => {
    if (edge.hasPointerCapture(e.pointerId)) window.archie.previewResize({ phase: 'move', dx: e.screenX - startX });
  });
  const end = () => { edge.classList.remove('dragging'); window.archie.previewResize({ phase: 'end' }); };
  edge.addEventListener('pointerup', end);
  edge.addEventListener('pointercancel', end);
}

// The five features the demo labels on hover, in the order of its parts:
// snippets, Data tab, Issues tab, Preview button, Publish tab.
export type FeatureItem = { title: string; body: string }
export const FEATURES: FeatureItem[] = [
  { title: 'A snippet for every ArchieML block', body: 'Objects, arrays, freeform lists, :skip and :end. Click one and it lands on its own line at your cursor, or wraps the text you highlighted.' },
  { title: 'Your data, as you type', body: 'The Data tab turns the doc into JSON while you edit. Copy it, or export a .json file.' },
  { title: 'Mistakes, in plain words', body: 'An unclosed block, a key used twice: each is listed with its line, right beside the doc. Click one to jump there.' },
  { title: 'The real page, beside the doc', body: 'Paste your project’s test-page link once. It opens next to your doc and reads your unpublished edits, so its own checks run on what you just wrote. Works with private docs.' },
  { title: 'Publish the JSON yourself', body: 'Send the data to your server over SFTP with a password or SSH key. Pick a folder, name the file; next time it’s one click: Publish again.' },
]

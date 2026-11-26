// The features the demo labels on hover, in the order of its parts:
// snippets, templates, colors, Data tab, Issues tab, Preview button, Publish tab.
export type FeatureItem = { title: string; body: string }
export const FEATURES: FeatureItem[] = [
  { title: 'A snippet for every ArchieML block', body: 'Objects, arrays, freeform lists, :skip and :end. Click one and it lands on its own line at your cursor, or wraps the text you highlighted.' },
  { title: 'Templates, filled in like a form', body: 'Build a block once: its name, its shape and its fields. Then fill in a form and the ArchieML is written for you. Share templates with your team as a file.' },
  { title: 'Colors in the doc', body: 'Keys and {}/[] lines get their own text and highlight colors, from Google Docs’ swatches or any hex color. Bold if you like. The data never changes.' },
  { title: 'Your data, as you type', body: 'The Data tab turns the doc into JSON while you edit. Copy it, or export a .json file.' },
  { title: 'Mistakes, in plain words', body: 'An unclosed block, a key used twice: each is listed with its line, right beside the doc. Click one to jump there.' },
  { title: 'The real page, beside the doc', body: 'Paste your project’s test-page link once. It opens next to your doc and reads your unpublished edits, so its own checks run on what you just wrote. Works with private docs.' },
  { title: 'Publish the JSON yourself', body: 'Send the data to your server over SFTP with a password or SSH key. Pick a folder, name the file; next time it’s one click: Publish again.' },
]

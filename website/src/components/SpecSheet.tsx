import type { ReactNode } from 'react'

// "Also in the box": a two-column spec sheet. Each row shows a small, literal
// picture of the feature (the real shortcut keys, a swatch, a handle) beside its name.
// One drawing style for every row: a ruled box, mono type, one orange accent.
const Box = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <span className={`flex h-14 w-24 items-center justify-center border border-ink font-mono text-[13px] font-semibold whitespace-nowrap ${className}`}>{children}</span>
)

const ITEMS: { title: string; body: string; mark: ReactNode; label: string }[] = [
  {
    title: 'Quick insert',
    body: 'Press ⌘⇧K, type a few letters, press Enter.',
    label: 'Command, Shift, K',
    mark: <Box className="text-xl">⌘⇧<span className="text-signal">K</span></Box>,
  },
  {
    title: 'Wrap a selection',
    body: 'Highlight text in the doc, pick a block, and it wraps around.',
    label: 'Highlighted text wrapped in an object',
    mark: <Box><span className="text-signal">{'{'}</span>text<span className="text-signal">{'}'}</span></Box>,
  },
  {
    title: 'Your own snippets',
    body: 'Save the blocks you write every day, with your own names.',
    label: 'A new snippet button',
    mark: <Box><span className="mr-1 text-signal">+</span>snippet</Box>,
  },
  {
    title: 'Outline',
    body: 'Every object and list in the doc, one click away.',
    label: 'An outline of objects and lists',
    mark: <Box><span className="leading-tight"><span className="block">{'{venue}'}</span><span className="block pl-3 text-signal">[acts]</span></span></Box>,
  },
  {
    title: 'Light and dark',
    body: 'Follows your Mac’s appearance setting.',
    label: 'Half light, half dark swatch',
    mark: <Box className="overflow-hidden"><span className="h-full flex-1 bg-paper" /><span className="h-full flex-1 bg-ink" /></Box>,
  },
  {
    title: 'Make room',
    body: 'Drag the sidebar and the preview to any width.',
    label: 'A drag handle between two panes',
    mark: <Box className="overflow-hidden"><span className="h-full w-8 bg-ink" /><span className="h-full w-1 bg-signal" /><span className="grid flex-1 place-items-center text-xl">↔</span></Box>,
  },
]

export const SpecSheet = () => (
  <div className="col-span-12 mt-20 grid grid-cols-12 gap-x-4 border-t-4 border-ink pt-5">
    <h2 className="t-section col-span-12 m-0">Also in the&nbsp;box</h2>
    <dl className="col-span-12 m-0 mt-8 grid grid-cols-1 gap-x-4 md:grid-cols-2">
      {ITEMS.map((item) => (
        <div key={item.title} className="grid grid-cols-[6rem_1fr] items-center gap-x-4 border-b border-ink py-5 first:border-t md:[&:nth-child(2)]:border-t">
          <div role="img" aria-label={item.label} className="flex justify-start">{item.mark}</div>
          <div>
            <dt className="t-title">{item.title}</dt>
            <dd className="t-body m-0 mt-1 text-pretty text-ink-2">{item.body}</dd>
          </div>
        </div>
      ))}
    </dl>
  </div>
)

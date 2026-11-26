import type { ReactNode } from 'react'

// "Also in the box": a two-column spec sheet. Each row shows a small, literal
// picture of the feature (the real shortcut keys, a swatch, a handle) beside its name.
const Key = ({ children }: { children: ReactNode }) => (
  <kbd className="inline-grid h-8 min-w-8 place-items-center rounded-md border-2 border-ink bg-paper px-1.5 font-sans text-[15px] font-black shadow-[0_3px_0_var(--color-ink)]">{children}</kbd>
)

const Mono = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <span className={`inline-block border-2 border-ink px-2 py-1 font-mono text-[13px] font-semibold whitespace-nowrap ${className}`}>{children}</span>
)

const ITEMS: { title: string; body: string; mark: ReactNode; label: string }[] = [
  {
    title: 'Quick insert',
    body: 'Press ⌘⇧K, type a few letters, press Enter.',
    label: 'Command, Shift, K',
    mark: <span className="flex gap-1"><Key>⌘</Key><Key>⇧</Key><Key>K</Key></span>,
  },
  {
    title: 'Wrap a selection',
    body: 'Highlight text in the doc, pick a block, and it wraps around.',
    label: 'Highlighted text wrapped in an object',
    mark: <Mono><span className="text-signal">{'{'}</span><span className="bg-signal/20 px-0.5">headline</span><span className="text-signal">{'}'}</span></Mono>,
  },
  {
    title: 'Your own snippets',
    body: 'Save the blocks you write every day, with your own names.',
    label: 'A new snippet button',
    mark: <Mono className="bg-ink text-paper">+ New snippet</Mono>,
  },
  {
    title: 'Outline',
    body: 'Every object and list in the doc, one click away.',
    label: 'An outline of objects and lists',
    mark: (
      <span className="flex flex-col gap-0.5 font-mono text-[13px] leading-tight font-semibold">
        <span>{'{venue}'}</span><span className="pl-3">[acts]</span><span className="pl-3">[tags]</span>
      </span>
    ),
  },
  {
    title: 'Light and dark',
    body: 'Follows your Mac’s appearance setting.',
    label: 'Half light, half dark swatch',
    mark: <span className="flex h-9 w-16 border-2 border-ink"><span className="flex-1 bg-paper" /><span className="flex-1 bg-ink" /></span>,
  },
  {
    title: 'Make room',
    body: 'Drag the sidebar and the preview to any width.',
    label: 'A drag handle between two panes',
    mark: (
      <span className="flex h-9 w-20 items-stretch border-2 border-ink">
        <span className="w-6 bg-ink" />
        <span className="w-1 bg-signal" />
        <span className="grid flex-1 place-items-center">
          <svg viewBox="0 0 24 12" className="w-6" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M2 6h20M6 2 2 6l4 4M18 2l4 4-4 4" /></svg>
        </span>
      </span>
    ),
  },
]

export const SpecSheet = () => (
  <div className="col-span-12 mt-20 grid grid-cols-12 gap-x-4 border-t-4 border-ink pt-5">
    <h3 className="col-span-12 m-0 text-[clamp(1.6rem,2.8vw,2.4rem)] leading-[0.98] font-black tracking-[-0.04em] lg:col-span-3">Also in the&nbsp;box</h3>
    <dl className="col-span-12 m-0 mt-6 grid grid-cols-1 gap-x-10 md:grid-cols-2 lg:col-span-9 lg:mt-0">
      {ITEMS.map((item) => (
        <div key={item.title} className="grid grid-cols-[8.5rem_1fr] items-center gap-x-4 border-b border-ink py-5 first:border-t md:[&:nth-child(2)]:border-t">
          <div role="img" aria-label={item.label} className="flex justify-start">{item.mark}</div>
          <div>
            <dt className="text-xl leading-tight font-black tracking-[-0.03em]">{item.title}</dt>
            <dd className="m-0 mt-1 text-[15px] leading-snug font-medium text-ink-2">{item.body}</dd>
          </div>
        </div>
      ))}
    </dl>
  </div>
)

import archieml from 'archieml'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useMemo, useState } from 'react'
import { lint } from '../lib/lint'

// A working, drawn copy of the Archie Editor window. Sample data, not a real doc.
const START = ['title: Summer lineup', '', '{venue}', 'name: Harbor Hall', 'city: Portland']

type Snippet = { label: string; hint: string; make: (lines: string[]) => string[] }
const has = (lines: string[], re: RegExp) => lines.some((l) => re.test(l))

const SNIPPETS: Snippet[] = [
  { label: 'Key: value', hint: 'A single key and value', make: (l) => [has(l, /^capacity:/) ? 'opens: 7 pm' : 'capacity: 1200'] },
  { label: '{} close', hint: 'Return to the top level', make: () => ['{}'] },
  { label: '[array] of strings', hint: 'Each * line is one item', make: (l) => (has(l, /^\[acts\]/) ? ['[dates]', '* June 12', '* June 13', '[]'] : ['[acts]', '* The Lanterns', '* Mira Sol', '[]']) },
  { label: '{object}', hint: 'Group keys under a name', make: (l) => (has(l, /^\{tickets\}/) ? ['{info}'] : ['{tickets}', 'price: $25']) },
  { label: ':skip … :endskip', hint: 'Parser ignores everything inside', make: () => [':skip', 'Note: confirm the second date', ':endskip'] },
]

type Tab = 'insert' | 'data' | 'issues'

export const AppDemo = () => {
  const [lines, setLines] = useState(START)
  const [tab, setTab] = useState<Tab>('insert')
  const reduce = useReducedMotion()

  const text = lines.join('\n')
  const issues = useMemo(() => lint(text), [text])
  const json = useMemo(() => JSON.stringify(archieml.load(text), null, 2), [text])
  const valid = issues.length === 0

  const insert = (s: Snippet) => {
    setLines((l) => [...l, ...s.make(l)])
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'insert', label: 'Insert' },
    { id: 'data', label: 'Data' },
    { id: 'issues', label: 'Issues' },
  ]

  return (
    <div className="window-shadow overflow-hidden rounded-xl bg-panel text-left">
      {/* Window chrome */}
      <div className="flex items-center gap-3 border-b border-line bg-wash px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="text-[13px] font-semibold text-ink-2">Archie Editor</span>
        <span className="ml-auto flex items-center gap-2 text-[13px]" role="status">
          <span className={`size-2 rounded-full ${valid ? 'bg-green' : 'bg-red'}`} aria-hidden />
          <span className={valid ? 'text-green-ink' : 'text-red'}>{valid ? 'Valid ArchieML' : `${issues.length} issue${issues.length > 1 ? 's' : ''}`}</span>
        </span>
      </div>

      <div className="grid md:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sidebar, as in the app */}
        <div className="order-2 border-t border-line bg-[#f4f3ef] md:order-1 md:border-t-0 md:border-r">
          <div className="m-3 flex gap-0.5 rounded-lg border border-line bg-panel p-0.5" role="tablist" aria-label="Demo panels">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-md px-2 py-1 text-[13px] font-medium transition-colors ${tab === t.id ? 'bg-green-tint text-green-ink' : 'text-muted hover:text-ink'}`}
              >
                {t.label}
                {t.id === 'issues' && !valid && <span className="rounded-full bg-red px-1.5 text-[11px] font-bold text-white">{issues.length}</span>}
              </button>
            ))}
          </div>

          <div className="h-72 overflow-y-auto px-3 pb-3 md:h-[360px]">
            {tab === 'insert' && (
              <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
                {SNIPPETS.map((s) => (
                  <li key={s.label}>
                    <button type="button" onClick={() => insert(s)} className="w-full cursor-pointer rounded-lg border border-transparent px-2.5 py-2 text-left transition-colors hover:border-line hover:bg-panel">
                      <code className="block font-mono text-[13px] font-semibold text-green">{s.label}</code>
                      <span className="block text-[12px] text-muted">{s.hint}</span>
                    </button>
                  </li>
                ))}
                <li className="mt-2 flex gap-2 px-1">
                  <button type="button" onClick={() => setLines((l) => (l.length > START.length ? l.slice(0, -1) : l))} className="cursor-pointer rounded-md border border-line bg-panel px-2.5 py-1 text-[12px] font-medium text-ink-2 hover:border-line-strong">Undo</button>
                  <button type="button" onClick={() => setLines(START)} className="cursor-pointer rounded-md border border-line bg-panel px-2.5 py-1 text-[12px] font-medium text-ink-2 hover:border-line-strong">Reset</button>
                </li>
              </ul>
            )}
            {tab === 'data' && <pre className="m-0 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-ink-2">{json}</pre>}
            {tab === 'issues' && (
              valid ? (
                <p className="m-1 text-[13px] text-muted">No problems found.</p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {issues.map((i) => (
                    <li key={`${i.line}-${i.message}`} className="rounded-lg bg-panel px-2.5 py-2">
                      <code className="block font-mono text-[12.5px] font-semibold text-ink">{lines[i.line - 1]}</code>
                      <span className="block text-[12px] text-red">Line {i.line}: {i.message}</span>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        </div>

        {/* The Google Doc, drawn */}
        <div className="order-1 bg-[#eef0ee] p-3 sm:p-5 md:order-2">
          <div className="mx-auto h-72 max-w-xl overflow-y-auto rounded-sm bg-white px-6 py-6 shadow-[0_1px_3px_rgb(17_19_18/0.12)] sm:px-10 md:h-[384px]">
            <ol className="m-0 list-none p-0 text-[15px] leading-[1.75] text-ink">
              <AnimatePresence initial={false}>
                {lines.map((line, i) => {
                  const bad = issues.some((x) => x.line === i + 1)
                  return (
                    <motion.li
                      key={`${i}-${line}`}
                      initial={reduce ? false : { opacity: 0, y: 4, backgroundColor: 'rgba(230,240,234,1)' }}
                      animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(230,240,234,0)' }}
                      transition={{ duration: reduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className={`min-h-[1.75em] rounded-sm px-1 ${bad ? 'underline decoration-red decoration-wavy decoration-1 underline-offset-4' : ''}`}
                    >
                      {line}
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

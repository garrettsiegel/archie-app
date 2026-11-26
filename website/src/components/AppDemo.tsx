import archieml from 'archieml'
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { lint } from '../lib/lint'

// A working copy of the Archie Editor window, drawn with the app's own dark
// theme values (sidebar/sidebar.css) and a Google Docs-style page. Sample data.
const C = {
  bg: '#1c1c1a', panel: '#262624', text: '#ecebe6', muted: '#a3a198', line: '#3a3936',
  field: '#77756d', accent: '#7cc09a', soft: 'rgb(124 192 154 / 0.2)', warn: '#e3a83a', error: '#ff8a7a',
}

const START = ['title: Summer lineup', 'dek: Three nights of music on the waterfront.', '', '{venue}', 'name: Harbor Hall', 'city: Portland']

type Snippet = { label: string; hint: string; make: (l: string[]) => string[] }
const has = (l: string[], re: RegExp) => l.some((x) => re.test(x))
const GROUPS: { group: string; items: Snippet[] }[] = [
  { group: 'Values', items: [
    { label: 'Key: value', hint: 'A single key and value', make: (l) => [has(l, /^capacity:/) ? 'opens: 7 pm' : 'capacity: 1200'] },
    { label: 'Multi-line value', hint: 'Value spanning lines, closed by :end', make: () => ['note: Doors open early.', 'Bring a jacket.', ':end'] },
  ] },
  { group: 'Objects', items: [
    { label: '{object}', hint: 'Group keys under a name', make: (l) => (has(l, /^\{tickets\}/) ? ['{info}'] : ['{tickets}', 'price: $25']) },
    { label: '{} close', hint: 'Return to the top level', make: () => ['{}'] },
  ] },
  { group: 'Arrays', items: [
    { label: '[array] of objects', hint: 'Repeat the first key to start a new item', make: () => ['[acts]', 'name: The Lanterns', 'night: Friday', '', 'name: Mira Sol', 'night: Saturday', '[]'] },
    { label: '[array] of strings', hint: 'Each * line is one item', make: () => ['[dates]', '* June 12', '* June 13', '[]'] },
  ] },
]

const Svg = ({ d, size = 14 }: { d: ReactNode; size?: number }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{d}</svg>
)
const NAV = [
  <path key="b" d="M10 3 5 8l5 5" />,
  <g key="r"><path d="M13 8a5 5 0 1 1-1.5-3.6" /><path d="M13 2.5v3h-3" /></g>,
  <g key="h"><path d="M2.5 7.5 8 3l5.5 4.5" /><path d="M4 6.5V13h8V6.5" /></g>,
  <g key="e"><path d="M6 3h7v7" /><path d="M13 3 4 12" /></g>,
]
const TABS = [
  { id: 'insert', label: 'Insert', icon: <path d="M8 3v10M3 8h10" /> },
  { id: 'data', label: 'Data', icon: <g><path d="M6 2.5H5a1.5 1.5 0 0 0-1.5 1.5v2.5L2.5 8l1 1.5V12A1.5 1.5 0 0 0 5 13.5h1" /><path d="M10 2.5h1A1.5 1.5 0 0 1 12.5 4v2.5l1 1.5-1 1.5V12a1.5 1.5 0 0 1-1.5 1.5h-1" /></g> },
  { id: 'issues', label: 'Issues', icon: <g><path d="M8 2 14.5 13.5h-13z" /><path d="M8 6.5v3M8 11.5v.01" /></g> },
  { id: 'outline', label: 'Outline', icon: <path d="M3 4h10M5.5 8H13M8 12h5" /> },
  { id: 'upload', label: 'Publish', icon: <g><path d="M8 11V2.5M4.5 6 8 2.5 11.5 6" /><path d="M2.5 10.5v3h11v-3" /></g> },
] as const
type Tab = (typeof TABS)[number]['id']
// Parts of the demo the page can label on hover (see LabeledDemo).
const PART_FOR_TAB: Partial<Record<Tab, string>> = { data: 'data', issues: 'issues', upload: 'publish' }

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <div className="mx-1 mt-3.5 mb-1.5 text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: C.muted }}>{children}</div>
)

export const AppDemo = () => {
  const [lines, setLines] = useState(START)
  const [tab, setTab] = useState<Tab>('insert')
  const reduce = useReducedMotion()
  const text = lines.join('\n')
  const issues = useMemo(() => lint(text), [text])
  const data = useMemo(() => archieml.load(text), [text])
  const outline = useMemo(() => lines.flatMap((l, i) => (/^\s*[[{][+.]*[^\]}\s]+[\]}]/.test(l) ? [{ line: i + 1, label: l.trim() }] : [])), [lines])

  return (
    <div className="window-edge relative flex h-[760px] flex-col overflow-hidden text-left md:grid md:h-[600px] text-[13px] leading-[1.4] md:grid-cols-[400px_minmax(0,1fr)]" style={{ background: C.bg, color: C.text }}>
      {/* Traffic lights sit inside the sidebar, like the real window */}
      <span className="absolute top-[294px] left-[14px] z-10 flex gap-2 md:top-[14px]" aria-hidden>
        <span className="size-3 rounded-full bg-[#ff5f57]" /><span className="size-3 rounded-full bg-[#febc2e]" /><span className="size-3 rounded-full bg-[#28c840]" />
      </span>

      {/* Sidebar */}
      <div className="flex min-h-0 flex-1 flex-col md:border-r" style={{ borderColor: C.line }}>
        <div className="px-3.5 pt-[38px] pb-2.5">
          <div className="mb-2 text-[15px] font-bold">Archie Editor</div>
          <div className="flex gap-1" aria-hidden>
            {NAV.map((d, i) => (
              <span key={i} className="grid h-[26px] min-w-[28px] place-items-center rounded-md border" style={{ borderColor: C.line, background: C.panel, opacity: i === 0 ? 0.4 : 1 }}><Svg d={d} /></span>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate" style={{ color: C.muted }}>Summer lineup</span>
            <span data-part="preview" className="inline-flex min-h-7 items-center gap-1.5 rounded-full border py-1 pr-[11px] pl-[9px] text-[12.5px] font-semibold" style={{ borderColor: C.accent, background: C.soft, color: C.accent }}>
              <Svg size={15} d={<g><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" /><circle cx="8" cy="8" r="2" /></g>} />Preview
            </span>
          </div>
        </div>

        <div className="mx-2.5 mb-2.5 flex gap-0.5 rounded-lg border p-0.5" style={{ borderColor: C.line, background: C.panel }} role="tablist" aria-label="Demo panels">
          {TABS.map((t) => {
            const on = tab === t.id
            return (
              <button key={t.id} type="button" role="tab" aria-selected={on} onClick={() => setTab(t.id)} data-part={PART_FOR_TAB[t.id]}
                className="flex min-h-7 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 rounded-md border-0 px-0.5 py-[3px] text-[12px] whitespace-nowrap"
                style={{ background: on ? C.soft : 'transparent', color: on ? C.accent : C.muted, fontWeight: on ? 650 : 500 }}>
                <Svg size={13} d={t.icon} />{t.label}
                {t.id === 'issues' && issues.length > 0 && <span className="rounded-lg px-[5px] text-[10.5px] font-bold tabular-nums" style={{ background: C.warn, color: C.bg }}>{issues.length}</span>}
              </button>
            )
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-2.5">
          {tab === 'insert' && (
            <>
              <div className="px-1 pb-2.5">
                <div className="mb-1 font-semibold">Block name</div>
                <div className="rounded-md border px-2 py-1.5" style={{ borderColor: C.field, background: C.panel, color: C.muted }}>e.g. headline, speakers</div>
                <div className="mt-1 text-[12px]" style={{ color: C.muted }}>Fills in {'{name}'} and [name]. Leave empty for a placeholder.</div>
              </div>
              <div className="mx-1 my-1.5 text-[11px] tracking-[0.06em] uppercase" style={{ color: C.muted }}>▸ Open a doc</div>
              <div className="mt-2 flex items-center gap-1.5 rounded-md border px-2 py-1.5" style={{ borderColor: C.field, background: C.panel, color: C.muted }}>
                <Svg size={14} d={<g><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" /></g>} />Filter snippets
              </div>
              <SectionLabel>My snippets</SectionLabel>
              <div className="px-1 py-1" style={{ color: C.accent }}>+ New snippet</div>
              <div data-part="snippets">
              {GROUPS.map((g) => (
                <div key={g.group}>
                  <SectionLabel>{g.group}</SectionLabel>
                  {g.items.map((s) => (
                    <button key={s.label} type="button" onClick={() => setLines((l) => [...l, ...s.make(l)])}
                      className="mb-1 block w-full cursor-pointer rounded-[7px] border border-transparent px-[9px] py-[7px] text-left transition-colors hover:border-[#3a3936] hover:bg-[#262624]">
                      <code className="block font-mono text-[12.5px] font-semibold" style={{ color: C.accent }}>{s.label}</code>
                      <span className="block text-[12px]" style={{ color: C.muted }}>{s.hint}</span>
                    </button>
                  ))}
                </div>
              ))}
              </div>
            </>
          )}
          {tab === 'data' && <pre className="m-0 px-1 font-mono text-[12px] leading-normal whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>}
          {tab === 'issues' && (issues.length === 0
            ? <p className="m-1" style={{ color: C.muted }}>No problems found.</p>
            : issues.map((i) => (
              <div key={`${i.line}-${i.message}`} className="mb-1 rounded-[7px] px-[9px] py-[7px]">
                <code className="block font-mono text-[12.5px] font-semibold" style={{ color: C.accent }}>{lines[i.line - 1]}</code>
                <span className="block text-[12px]" style={{ color: i.severity === 'error' ? C.error : C.warn }}>Line {i.line}: {i.message}</span>
              </div>
            )))}
          {tab === 'outline' && (outline.length === 0
            ? <p className="m-1" style={{ color: C.muted }}>No {'{objects}'} or [arrays] yet.</p>
            : outline.map((o) => (
              <div key={o.line} className="mb-1 rounded-[7px] px-[9px] py-[7px]">
                <code className="block font-mono text-[12.5px] font-semibold" style={{ color: C.accent }}>{o.label}</code>
                <span className="block text-[12px]" style={{ color: C.muted }}>Line {o.line}</span>
              </div>
            )))}
          {tab === 'upload' && (
            <div className="flex flex-col gap-2.5 px-1">
              <p className="m-0" style={{ color: C.muted }}>Send this doc's JSON to your server over SFTP.</p>
              {[['Server address', 'example.com'], ['Username', '']].map(([label, ph]) => (
                <div key={label}><div className="mb-[3px] font-semibold">{label}</div><div className="h-[30px] rounded-md border px-2 py-1.5" style={{ borderColor: C.field, background: C.panel, color: C.muted }}>{ph}</div></div>
              ))}
              <div className="rounded-full py-1.5 text-center font-semibold" style={{ background: C.accent, color: C.bg }}>Connect</div>
            </div>
          )}
        </div>
        <div className="border-t px-3.5 py-2 text-[12px]" style={{ borderColor: C.line, color: C.muted }}>
          Click a snippet, or highlight text first to wrap it. ⌘⇧K searches · ⌘⇧D data.
        </div>
      </div>

      {/* Google Docs, drawn: no logos */}
      <div className="order-first flex h-[280px] min-h-0 flex-none flex-col bg-[#f9fbfd] text-[#1f1f1f] md:order-none md:h-auto">
        <div className="hidden items-center gap-2.5 px-3 pt-2.5 md:flex">
          <span className="flex h-8 w-6 flex-col items-center justify-center gap-[3px] rounded-sm bg-[#4285f4]/90" aria-hidden><span className="h-0.5 w-3 bg-white" /><span className="h-0.5 w-3 bg-white" /><span className="h-0.5 w-3 bg-white" /></span>
          <div>
            <div className="text-[16px] leading-tight">Summer lineup</div>
            <div className="flex gap-3 text-[13px] text-[#444]">{['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Extensions', 'Help'].map((m) => <span key={m}>{m}</span>)}</div>
          </div>
          <span className="ml-auto rounded-full bg-[#c2e7ff] px-4 py-1.5 text-[13px] font-medium">Share</span>
        </div>
        <div className="mx-3 mt-2 hidden h-9 items-center gap-3 rounded-full bg-[#edf2fa] px-4 text-[13px] text-[#444] md:flex" aria-hidden>
          <span>100%</span><span className="h-4 w-px bg-[#c7c7c7]" /><span>Normal text</span><span className="h-4 w-px bg-[#c7c7c7]" /><span>Arial</span><span className="h-4 w-px bg-[#c7c7c7]" /><span>11</span><span className="font-bold">B</span><span className="italic">I</span><span className="underline">U</span>
        </div>
        <div className="mt-2 hidden h-5 border-y border-[#e3e3e3] bg-white md:block" aria-hidden />
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4">
          <div className="mx-auto min-h-[520px] max-w-[540px] bg-white px-14 py-12 shadow-[0_1px_3px_rgb(0_0_0/0.12)]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            {lines.map((line, i) => {
              const bad = issues.some((x) => x.line === i + 1)
              return (
                <motion.div key={`${i}-${line}`} initial={reduce || i < START.length ? false : { backgroundColor: 'rgba(124,192,154,0.35)' }} animate={{ backgroundColor: 'rgba(124,192,154,0)' }} transition={{ duration: 1.2 }}
                  className={`min-h-[1.6em] text-[14.5px] leading-[1.6] ${bad ? 'underline decoration-[#d93025] decoration-wavy decoration-1 underline-offset-4' : ''}`}>
                  {line}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

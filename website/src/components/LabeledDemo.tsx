import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { FocusEvent, PointerEvent } from 'react'
import { FEATURES } from '../features'
import { AppDemo } from './AppDemo'

// The working demo, labeled on hover: point at a part of the app (or a feature in
// the list below) and it gets an orange outline with a short label beside it.
const PARTS = ['snippets', 'data', 'issues', 'preview', 'publish'] as const
type Part = (typeof PARTS)[number]
type Box = { left: number; top: number; width: number; height: number }

const CALLOUT_W = 300
const PAD = 6
const SIDEBAR_W = 400 // the demo's fixed sidebar width; labels sit just past it

export const LabeledDemo = () => {
  const wrap = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<Part | null>(null)
  const [box, setBox] = useState<Box | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const reduce = useReducedMotion()

  const measure = useCallback((part: Part | null) => {
    const root = wrap.current
    const el = part && root?.querySelector<HTMLElement>(`[data-part="${part}"]`)
    if (!root || !el) { setBox(null); return }
    const r = el.getBoundingClientRect()
    const o = root.getBoundingClientRect()
    // Keep the outline inside the window's visible area (the snippet list scrolls).
    const top = Math.max(r.top - o.top, 0)
    const bottom = Math.min(r.bottom - o.top, o.height)
    setBox({ left: r.left - o.left, top, width: r.width, height: Math.max(bottom - top, 0) })
    setSize({ w: o.width, h: o.height })
  }, [])

  useLayoutEffect(() => { measure(active) }, [active, measure])

  const fromEvent = (target: EventTarget | null) => {
    const part = (target as HTMLElement | null)?.closest?.('[data-part]')?.getAttribute('data-part')
    return (PARTS as readonly string[]).includes(part ?? '') ? (part as Part) : null
  }
  const onMove = (e: PointerEvent) => {
    const part = fromEvent(e.target)
    if (part !== active) setActive(part)
    else measure(part)
  }
  const onFocus = (e: FocusEvent) => setActive(fromEvent(e.target))

  const feature = active ? FEATURES[PARTS.indexOf(active)] : null
  const calloutLeft = box ? Math.min(Math.max(box.left + box.width + PAD + 28, SIDEBAR_W + 28), size.w - CALLOUT_W - 12) : 0
  const calloutTop = box ? Math.min(Math.max(box.top + box.height / 2 - 48, 12), size.h - 170) : 0
  // Leader line from the outline's right edge to the label.
  const lineX = box ? box.left + box.width + PAD : 0
  const lineY = box ? box.top + box.height / 2 : 0

  return (
    <div>
      <div ref={wrap} className="relative" onPointerMove={onMove} onPointerLeave={() => setActive(null)} onFocus={onFocus} onBlur={() => setActive(null)}>
        <AppDemo />
        <AnimatePresence>
          {box && feature && (
            <motion.div key={active} aria-hidden className="pointer-events-none absolute inset-0"
              initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <div className="absolute rounded-lg border-[3px] border-signal shadow-[0_0_0_4px_rgb(214_46_11/0.25)]"
                style={{ left: box.left - PAD, top: box.top - PAD, width: box.width + PAD * 2, height: box.height + PAD * 2 }} />
              <div className="absolute hidden h-[3px] bg-signal md:block" style={{ left: lineX, top: lineY - 1.5, width: Math.max(calloutLeft - lineX, 0) }} />
              <div className="absolute hidden border-l-4 border-signal bg-ink p-4 text-paper shadow-[0_18px_40px_rgb(0_0_0/0.35)] md:block"
                style={{ left: calloutLeft, top: calloutTop, width: CALLOUT_W }}>
                <div className="text-xl leading-tight font-black tracking-[-0.03em] text-paper">{feature.title}</div>
                <p className="mt-2 mb-0 text-[15px] leading-snug font-medium text-paper/85">{feature.body}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ul className="mt-8 mb-0 grid list-none grid-cols-12 gap-x-4 gap-y-6 p-0">
        {FEATURES.map((f, i) => {
          const on = active === PARTS[i]
          return (
            <li key={f.title} className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-2 xl:[&:nth-child(1)]:col-span-3 xl:[&:nth-child(4)]:col-span-3">
              <button type="button" onMouseEnter={() => setActive(PARTS[i])} onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(PARTS[i])} onBlur={() => setActive(null)}
                className={`w-full cursor-default border-0 border-t-4 bg-transparent px-0 pt-3 text-left text-ink transition-colors ${on ? 'border-signal' : 'border-ink'}`}>
                <span className={`block text-xl leading-tight font-black tracking-[-0.03em] ${on ? 'text-signal' : ''}`}>{f.title}</span>
                <span className="mt-1.5 block text-[15px] leading-snug font-medium text-ink-2">{f.body}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { AppDemo } from './components/AppDemo'
import { DownloadButton } from './components/DownloadButton'
import { GitHubIcon } from './components/icons'
import { DOWNLOAD_SIZE, REPO_URL, VERSION } from './config'

const Reveal = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

// Real screenshots of the app (see public/screens/PROVENANCE.md).
const Screenshot = ({ name, alt }: { name: string; alt: string }) => (
  <img
    src={`./screens/app-${name}.webp`}
    srcSet={`./screens/app-${name}.webp 1000w, ./screens/app-${name}@2x.webp 2000w`}
    sizes="(min-width: 1024px) 660px, 100vw"
    width={1000}
    height={640}
    loading="lazy"
    decoding="async"
    alt={alt}
    className="h-auto w-full drop-shadow-[0_24px_40px_rgb(17_19_18/0.18)]"
  />
)

// Drawn in the app's own dark-theme colors: these features need a private page or server to screenshot.
const dark = { bg: '#1c1c1a', panel: '#262624', text: '#ecebe6', muted: '#a3a198', line: '#3a3936', field: '#77756d', accent: '#7cc09a' }

const PreviewFragment = () => (
  <div className="grid grid-cols-[0.9fr_1.1fr] overflow-hidden rounded-xl text-[12.5px] shadow-[0_24px_40px_rgb(17_19_18/0.18)]" aria-hidden>
    <div className="bg-white p-5 font-[Arial,sans-serif] leading-[1.7] text-[#1f1f1f]">
      {'{venue}'}<br />name: Harbor Hall<br /><span className="rounded bg-[#c2e7ff] px-0.5">city: Seattle</span><br />{'{}'}
    </div>
    <div className="flex flex-col" style={{ background: dark.bg, color: dark.text }}>
      <div className="flex h-10 items-center gap-2 border-b px-3.5" style={{ borderColor: dark.line }}>
        <span className="font-bold">Live preview</span>
        <span className="truncate font-mono text-[11.5px]" style={{ color: dark.muted }}>qa.example.com/your-project</span>
      </div>
      <div className="flex flex-1 flex-col justify-end bg-gradient-to-b from-[#2b3a33] to-[#111312] p-5 text-white">
        <span className="text-2xl font-bold tracking-tight">Harbor Hall</span>
        <span className="text-[13px] text-white/75">Seattle</span>
      </div>
    </div>
  </div>
)

const PublishFragment = () => (
  <div className="rounded-xl p-4 text-[13px] shadow-[0_24px_40px_rgb(17_19_18/0.18)]" style={{ background: dark.bg, color: dark.text }} aria-hidden>
    <div className="mb-2.5 flex items-center justify-between">
      <span className="font-semibold">editor@data.example.com</span>
      <span className="rounded-md border px-2.5 py-1" style={{ borderColor: dark.line, background: dark.panel }}>Disconnect</span>
    </div>
    <div className="mb-2.5 flex gap-1 rounded-md px-2 py-1.5 font-mono text-[12px]" style={{ background: dark.panel }}>
      <span style={{ color: dark.accent }}>/</span><span style={{ color: dark.accent }}>var</span><span style={{ color: dark.muted }}>/</span><span style={{ color: dark.accent }}>www</span><span style={{ color: dark.muted }}>/</span><span className="font-semibold">data</span>
    </div>
    <div className="mb-2.5 overflow-hidden rounded-md border font-mono text-[12.5px]" style={{ borderColor: dark.line }}>
      {['lineups', 'summer-lineup.json'].map((n, i) => (
        <div key={n} className="border-b px-2 py-1.5 last:border-b-0" style={{ borderColor: dark.line, color: i ? dark.text : dark.accent }}>{n}</div>
      ))}
    </div>
    <div className="mb-1 font-semibold">File name</div>
    <div className="mb-2.5 flex items-center rounded-md border" style={{ borderColor: dark.field, background: dark.panel }}>
      <span className="flex-1 px-2 py-1.5">summer-lineup</span><span className="pr-2 font-mono text-[12px]" style={{ color: dark.muted }}>.json</span>
    </div>
    <div className="rounded-md py-2 text-center font-semibold" style={{ background: dark.accent, color: dark.bg }}>Publish here</div>
  </div>
)

const SPOTLIGHTS = [
  { title: 'Your real Google Doc, with tools beside it', body: 'Sign in with your own Google account and open any doc. ArchieML blocks go in with one click, ending on their own line, or wrapped around text you highlight.', art: <Screenshot name="insert" alt="Archie Editor showing a Google Doc of sample ArchieML next to the Insert tab's list of snippets" /> },
  { title: 'Your data, as you type', body: 'The Data tab turns the doc into JSON as you edit. Copy it, or export a .json file.', art: <Screenshot name="data" alt="Archie Editor's Data tab showing the sample doc as JSON" /> },
  { title: 'Catch mistakes before they ship', body: 'Unclosed blocks, stray closers, duplicate keys and :skip or :end mix-ups are listed in plain words. Click one to jump to that line in the doc.', art: <Screenshot name="issues" alt="Archie Editor's Issues tab listing an unclosed block and a duplicate key in the sample doc" /> },
  { title: 'See the real page while you write', body: 'Paste your project’s test-page link once. The page opens beside your doc and reads your unpublished edits, so its own checks run on what you just wrote. Works with private docs.', art: <PreviewFragment /> },
  { title: 'Publish the JSON yourself', body: 'Send the data to your server over SFTP with a password or SSH key. Pick a folder, name the file, and next time it’s one click: Publish again.', art: <PublishFragment /> },
]

const MORE = [
  ['Quick insert', 'Press ⌘⇧K, type a few letters, press Enter.'],
  ['Wrap a selection', 'Highlight text, pick a block, and it wraps around it.'],
  ['Your own snippets', 'Save the blocks you write every day.'],
  ['Outline', 'Every object and list in the doc, one click away.'],
  ['Light and dark', 'Follows your Mac’s appearance.'],
  ['Make room', 'Drag the sidebar and preview to any width.'],
]

const STEPS: { title: string; body: ReactNode }[] = [
  { title: 'Download', body: <>Get the installer ({DOWNLOAD_SIZE}). It runs on Apple Silicon and Intel Macs.</> },
  { title: 'Drag to Applications', body: 'Open the .dmg and drag Archie Editor into your Applications folder.' },
  { title: 'Allow it once', body: <>The app isn’t signed with an Apple Developer ID yet, so macOS blocks the first launch. Open <strong>System Settings → Privacy &amp; Security</strong> and click <strong>Open Anyway</strong>.</> },
  { title: 'Sign in to Google', body: 'Use your own account. Your login, servers and snippets stay on your Mac.' },
]

const wrap = 'mx-auto w-full max-w-6xl px-5 sm:px-8'

export const App = () => (
  <>
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-green focus:px-4 focus:py-2 focus:text-white">
      Skip to content
    </a>

    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-md">
      <div className={`${wrap} flex h-14 items-center justify-between gap-4`}>
        <a href="#main" className="flex items-center gap-2 font-semibold whitespace-nowrap text-ink no-underline">
          <img src="./icon.png" alt="" width={28} height={28} className="size-7" />
          Archie Editor
        </a>
        <nav aria-label="Main" className="flex items-center gap-5 text-sm text-ink-2">
          <a href="#features" className="hidden hover:text-ink sm:inline">Features</a>
          <a href="#install" className="hidden hover:text-ink sm:inline">Install</a>
          <a href={REPO_URL} className="flex items-center gap-1.5 hover:text-ink"><GitHubIcon className="size-4" /><span className="hidden sm:inline">GitHub</span></a>
          <DownloadButton size="sm" />
        </nav>
      </div>
    </header>

    <main id="main">
      <section aria-labelledby="hero-title" className={`${wrap} pt-12 text-center sm:pt-16`}>
                <h1 id="hero-title" className="mx-auto m-0 max-w-4xl text-[clamp(2.3rem,5.2vw,3.9rem)] leading-[1.05] font-bold tracking-[-0.035em]">
          The Mac app for writing ArchieML in Google Docs.{' '}
          <span className="text-green">Catch mistakes before they ship.</span>
        </h1>
        <p className="mx-auto mt-5 mb-7 max-w-xl text-lg leading-relaxed text-muted">
          Archie Editor is a free, standalone app for macOS, not a browser extension or Docs add-on. Your Google Doc opens inside it, beside the tools you need: insert blocks, see your data as JSON, preview the real page, and publish.
        </p>
        <div className="flex flex-col items-center gap-2.5">
          <DownloadButton />
          <span className="text-[13px] text-muted">Version {VERSION} · {DOWNLOAD_SIZE} · macOS, Apple Silicon and Intel · Free</span>
        </div>

        <Reveal className="mt-10 sm:mt-12">
          <AppDemo />
          <p className="mt-4 text-[13px] text-muted">A working demo with sample data. Click a snippet, then check the Data and Issues tabs.</p>
        </Reveal>
      </section>

      <section id="features" aria-labelledby="features-title" className={`${wrap} pt-28 sm:pt-36`}>
        <h2 id="features-title" className="m-0 max-w-2xl text-[clamp(1.9rem,4vw,2.75rem)] leading-tight font-bold tracking-[-0.03em]">
          Everything an ArchieML doc needs, in one window.
        </h2>
        <div className="mt-14 flex flex-col gap-20 sm:gap-24">
          {SPOTLIGHTS.map((s, i) => (
            <Reveal key={s.title} className={`grid items-center gap-8 md:gap-14 ${i % 2 ? 'md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]' : 'md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]'}`}>
              <div className={i % 2 ? 'md:order-2' : ''}>
                <h3 className="m-0 text-2xl font-semibold tracking-[-0.02em]">{s.title}</h3>
                <p className="mt-3 mb-0 max-w-md text-[17px] leading-relaxed text-muted">{s.body}</p>
              </div>
              <div className={i % 2 ? 'md:order-1' : ''}>{s.art}</div>
            </Reveal>
          ))}
        </div>

        <dl className="mt-24 grid gap-x-10 gap-y-8 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-3">
          {MORE.map(([title, body]) => (
            <div key={title}>
              <dt className="font-semibold">{title}</dt>
              <dd className="m-0 mt-1 text-[15px] leading-relaxed text-muted">{body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="install" aria-labelledby="install-title" className={`${wrap} pt-28 sm:pt-36`}>
        <div className="rounded-3xl bg-wash px-6 py-12 sm:px-12 sm:py-16">
          <h2 id="install-title" className="m-0 text-[clamp(1.9rem,4vw,2.75rem)] leading-tight font-bold tracking-[-0.03em]">Install in a minute</h2>
          <ol className="mt-10 mb-0 grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="grid size-8 place-items-center rounded-full bg-ink text-sm font-semibold text-white tabular-nums">{i + 1}</span>
                <h3 className="mt-4 mb-0 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 mb-0 text-[15px] leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <DownloadButton />
            <a href={`${REPO_URL}/releases`} className="text-sm text-ink-2 underline underline-offset-4 hover:text-ink">All versions and release notes</a>
          </div>
        </div>
      </section>
    </main>

    <footer className={`${wrap} pt-20 pb-12 text-sm text-muted`}>
      <div className="flex flex-col justify-between gap-3 border-t border-line pt-8 sm:flex-row">
        <p className="m-0">Archie Editor is free and open source. <a href={REPO_URL} className="text-ink underline underline-offset-4">Source on GitHub</a>.</p>
        <p className="m-0">ArchieML is an open format from <a href="https://archieml.org" className="text-ink underline underline-offset-4">archieml.org</a>. Not affiliated with Google or the ArchieML authors.</p>
      </div>
    </footer>
  </>
)

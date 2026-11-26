import type { ReactNode } from 'react'
import { Screenshot } from './components/Art'
import { LabeledDemo } from './components/LabeledDemo'
import { DownloadButton } from './components/DownloadButton'
import { GitHubIcon } from './components/icons'
import { DOWNLOAD_SIZE, REPO_URL, VERSION } from './config'

// International-style poster: a strict 12-column grid, giant black type,
// 4px black rules, and one signal orange for the action and the promise.
const grid = 'mx-auto grid w-full max-w-7xl grid-cols-12 gap-x-4 px-5 sm:px-8'

const SectionHead = ({ id, title, aside }: { id: string; title: string; aside?: ReactNode }) => (
  <div className="col-span-12 grid grid-cols-12 gap-x-4 border-t-4 border-ink pt-5">
    <h2 id={id} className="col-span-12 m-0 text-[clamp(2.2rem,5vw,4.5rem)] leading-[0.9] font-black tracking-[-0.05em] md:col-span-8">{title}</h2>
    {aside && <div className="col-span-12 mt-4 text-lg leading-snug font-medium md:col-span-4 md:mt-2">{aside}</div>}
  </div>
)

const MORE = [
  ['Quick insert', '⌘⇧K, type a few letters, Enter.'],
  ['Wrap a selection', 'Highlight text, pick a block.'],
  ['Your own snippets', 'Save the blocks you write every day.'],
  ['Outline', 'Every object and list, one click away.'],
  ['Light and dark', 'Follows your Mac’s appearance.'],
  ['Make room', 'Drag the sidebar and preview to any width.'],
]

const STEPS: { title: string; body: ReactNode }[] = [
  { title: 'Download', body: <>Get the installer ({DOWNLOAD_SIZE}). Apple Silicon and Intel.</> },
  { title: 'Drag to Applications', body: 'Open the .dmg and drag Archie Editor into Applications.' },
  { title: 'Allow it once', body: <>It isn’t signed with an Apple Developer ID yet, so macOS blocks the first launch. Open <strong>System Settings → Privacy &amp; Security</strong> and click <strong>Open Anyway</strong>.</> },
  { title: 'Sign in to Google', body: 'Use your own account. Your login, servers and snippets stay on your Mac.' },
]

export const App = () => (
  <>
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-signal focus:px-4 focus:py-2 focus:text-white">Skip to content</a>

    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur">
      <div className={`${grid} items-center py-3`}>
        <a href="#main" className="col-span-6 flex items-center gap-2 font-black tracking-[-0.02em] whitespace-nowrap text-ink no-underline sm:col-span-4">
          <img src="./icon.png" alt="" width={26} height={26} className="size-[26px]" />
          Archie Editor
        </a>
        <span className="hidden text-sm font-bold uppercase sm:col-span-4 sm:block sm:text-center">ArchieML · Google Docs · macOS</span>
        <nav aria-label="Main" className="col-span-6 flex items-center justify-end gap-5 text-sm font-bold sm:col-span-4">
          <a href="#features" className="hidden text-ink no-underline hover:text-signal lg:inline">Features</a>
          <a href="#install" className="hidden text-ink no-underline hover:text-signal lg:inline">Install</a>
          <a href={REPO_URL} className="flex items-center gap-1.5 text-ink no-underline hover:text-signal"><GitHubIcon className="size-4" /><span className="hidden sm:inline">GitHub</span></a>
          <DownloadButton size="sm" />
        </nav>
        <div className="col-span-12 mt-3 h-1 bg-ink" />
      </div>
    </header>

    <main id="main">
      <section aria-labelledby="hero-title" className={`${grid} pt-6 sm:pt-10`}>
        <h1 id="hero-title" className="col-span-12 m-0 text-[clamp(2.9rem,8.4vw,8.2rem)] leading-[0.86] font-black tracking-[-0.055em]">
          The Mac app for writing ArchieML in Google Docs.
        </h1>
        <div className="col-span-12 mt-8 grid grid-cols-12 gap-x-4 border-t-4 border-ink pt-6">
          <p className="col-span-12 m-0 text-[clamp(1.6rem,2.6vw,2.1rem)] leading-tight font-black tracking-[-0.035em] text-signal md:col-span-5">Catch mistakes before they ship.</p>
          <p className="col-span-12 m-0 mt-4 text-lg leading-snug font-medium md:col-span-4 md:mt-0">
            A free, standalone app for macOS, not a browser extension or Docs add-on. Your Google Doc opens inside it, beside the tools you need.
          </p>
          <div className="col-span-12 mt-6 flex flex-col items-start gap-2 md:col-span-3 md:mt-0 md:items-end">
            <DownloadButton />
            <span className="text-[13px] font-medium text-muted md:text-right">Version {VERSION} · {DOWNLOAD_SIZE} · Apple Silicon and Intel · Free</span>
          </div>
        </div>
        <div className="col-span-12 mt-10 md:col-span-11 md:col-start-2 lg:col-span-10 lg:col-start-3">
          <Screenshot name="insert" alt="Archie Editor with a sample Google Doc open beside its tools" eager />
        </div>
      </section>

      <section id="features" aria-labelledby="features-title" className={`${grid} mt-24 sm:mt-32`}>
        <SectionHead id="features-title" title="Everything an ArchieML doc needs." aside="Hover over any part of the app to see what it does (on a phone, the list below explains each part). It works, too: click a snippet, then open the Data and Issues tabs." />
        <div className="col-span-12 mt-10">
          <LabeledDemo />
        </div>
        <dl className="col-span-12 mt-20 mb-0 grid grid-cols-12 gap-x-4 border-t-4 border-ink pt-5">
          {MORE.map(([title, body]) => (
            <div key={title} className="col-span-6 mb-6 md:col-span-4 lg:col-span-2">
              <dt className="text-lg leading-tight font-black tracking-[-0.02em]">{title}</dt>
              <dd className="m-0 mt-1 text-[15px] leading-snug font-medium text-muted">{body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="install" aria-labelledby="install-title" className="mt-24 bg-ink text-paper sm:mt-32">
        <div className={`${grid} py-14 sm:py-20`}>
          <h2 id="install-title" className="col-span-12 m-0 text-[clamp(2.2rem,5vw,4.5rem)] leading-[0.9] font-black tracking-[-0.05em]">Install in a minute.</h2>
          <ol className="col-span-12 mt-10 mb-0 grid list-none grid-cols-12 gap-x-4 gap-y-10 p-0">
            {STEPS.map((s, i) => (
              <li key={s.title} className="col-span-12 border-t-4 border-paper pt-4 sm:col-span-6 lg:col-span-3">
                <span className="block text-6xl leading-none font-black tracking-[-0.05em] text-signal tabular-nums">{i + 1}</span>
                <h3 className="mt-3 mb-0 text-2xl leading-tight font-black tracking-[-0.03em]">{s.title}</h3>
                <p className="mt-2 mb-0 text-[16px] leading-snug font-medium text-paper/85">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="col-span-12 mt-12 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <DownloadButton onDark />
            <a href={`${REPO_URL}/releases`} className="text-sm font-bold text-paper underline underline-offset-4 hover:text-signal">All versions and release notes</a>
          </div>
        </div>
      </section>
    </main>

    <footer className={`${grid} py-10 text-sm font-medium`}>
      <p className="col-span-12 m-0 md:col-span-6">Archie Editor is free and open source. <a href={REPO_URL} className="font-bold text-ink underline underline-offset-4 hover:text-signal">Source on GitHub</a>.</p>
      <p className="col-span-12 m-0 mt-2 text-muted md:col-span-6 md:mt-0 md:text-right">ArchieML is an open format from <a href="https://archieml.org" className="font-bold text-ink underline underline-offset-4 hover:text-signal">archieml.org</a>. Not affiliated with Google or the ArchieML authors.</p>
    </footer>
  </>
)

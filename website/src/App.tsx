import type { ReactNode } from 'react'
import { HeroShot } from './components/Art'
import { LabeledDemo } from './components/LabeledDemo'
import { SpecSheet } from './components/SpecSheet'
import { DownloadButton } from './components/DownloadButton'
import { GitHubIcon } from './components/icons'
import { DOWNLOAD_SIZE, REPO_URL, VERSION } from './config'

// International-style poster: a strict 12-column grid, giant black type,
// 4px black rules, and one signal orange for the action and the promise.
const grid = 'mx-auto grid w-full max-w-7xl grid-cols-12 gap-x-4 px-5 sm:px-8'

const SectionHead = ({ id, title, aside }: { id: string; title: string; aside?: ReactNode }) => (
  <div className="col-span-12 grid grid-cols-12 gap-x-4 border-t-4 border-ink pt-5">
    <h2 id={id} className="t-section col-span-12 m-0 md:col-span-8">{title}</h2>
    {aside && <div className="t-body col-span-12 mt-4 md:col-span-4 md:mt-1">{aside}</div>}
  </div>
)

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
        <a href="#main" className="col-span-6 t-title flex items-center gap-2 whitespace-nowrap text-ink no-underline sm:col-span-4">
          <img src="./icon.png" alt="" width={26} height={26} className="size-[26px]" />
          Archie Editor
        </a>
        <span className="t-label hidden lg:col-span-4 lg:block lg:text-center">ArchieML · Google Docs · macOS</span>
        <nav aria-label="Main" className="col-span-6 flex items-center justify-end gap-5 text-sm font-bold sm:col-span-8 lg:col-span-4">
          <a href="#features" className="hidden text-ink no-underline hover:text-signal lg:inline">Features</a>
          <a href="#install" className="hidden text-ink no-underline hover:text-signal lg:inline">Install</a>
          <a href={REPO_URL} className="flex items-center gap-1.5 text-ink no-underline hover:text-signal"><GitHubIcon className="size-4" /><span className="hidden sm:inline">GitHub</span></a>
          <DownloadButton size="sm" />
        </nav>
        <div className="col-span-12 mt-3 h-px bg-ink" />
      </div>
    </header>

    <main id="main">
      <section aria-labelledby="hero-title" className={`${grid} pt-6 sm:pt-10`}>
        <h1 id="hero-title" className="t-hero col-span-12 m-0">
          <span className="block">The Mac app</span>{' '}
          <span className="block">for ArchieML in</span>{' '}
          <span className="block">Google Docs.</span>
        </h1>
        <div className="col-span-12 mt-8 grid grid-cols-12 gap-x-4 gap-y-5 border-t border-ink pt-6">
          <p className="t-lead col-span-12 m-0 text-signal md:col-span-4">Every ArchieML tool, in one app.</p>
          <p className="t-body col-span-12 m-0 md:col-span-5">
            A standalone Mac app with your Google Doc inside. Snippets, templates, live data, checks and publishing sit right beside it, so nothing is typed by hand or rigged up in Apps Script.
          </p>
          <div className="col-span-12 flex flex-col items-start gap-2 md:col-span-3 md:items-end">
            <DownloadButton />
            <p className="t-meta m-0 text-muted md:text-right">
              <span className="block">Version {VERSION} · {DOWNLOAD_SIZE}</span>
              <span className="block">Apple Silicon and Intel</span>
            </p>
          </div>
        </div>
        <figure className="col-span-12 m-0 mt-12 grid grid-cols-12 gap-x-4 gap-y-3">
          <figcaption className="t-title col-span-12 md:col-span-3">Checks run as you type, right beside the doc.</figcaption>
          <div className="col-span-12 md:col-span-9"><HeroShot /></div>
        </figure>
      </section>

      <section id="features" aria-labelledby="features-title" className={`${grid} mt-24 sm:mt-32`}>
        <SectionHead id="features-title" title="Everything an ArchieML doc needs." aside={<><span className="[@media(hover:none)]:hidden">Hover over any part to see what it does. </span>It works, too: pick a snippet, then open the Data and Issues tabs.</>} />
        <div className="col-span-12 mt-10">
          <LabeledDemo />
        </div>
        <SpecSheet />
      </section>

      <section id="install" aria-labelledby="install-title" className="mt-24 bg-ink text-paper sm:mt-32">
        <div className={`${grid} py-14 sm:py-20`}>
          <h2 id="install-title" className="t-section col-span-12 m-0">Install in a minute.</h2>
          <ol className="col-span-12 mt-10 mb-0 grid list-none grid-cols-12 gap-x-4 gap-y-10 p-0">
            {STEPS.map((s, i) => (
              <li key={s.title} className="col-span-12 border-t border-paper pt-4 sm:col-span-6 lg:col-span-3">
                <h3 className="t-title m-0 flex gap-3"><span className="text-signal tabular-nums">{i + 1}</span>{s.title}</h3>
                <p className="t-body mt-2 mb-0 text-paper/85">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="col-span-12 mt-12 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <DownloadButton onDark />
            <a href={`${REPO_URL}/releases`} className="t-meta font-bold text-paper underline underline-offset-4 hover:text-signal">All versions and release notes</a>
          </div>
        </div>
      </section>
    </main>

    <footer className={`${grid} py-10 t-meta`}>
      <p className="col-span-12 m-0 md:col-span-6">Archie Editor is open source. <a href={REPO_URL} className="font-bold text-ink underline underline-offset-4 hover:text-signal">Source on GitHub</a>.</p>
      <p className="col-span-12 m-0 mt-2 text-muted md:col-span-6 md:mt-0 md:text-right">ArchieML is an open format from <a href="https://archieml.org" className="font-bold text-ink underline underline-offset-4 hover:text-signal">archieml.org</a>. Not affiliated with Google or the ArchieML authors.</p>
    </footer>
  </>
)

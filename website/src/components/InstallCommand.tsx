import { useState } from 'react'
import { REPO_URL, SITE_URL } from '../config'

// One line for Terminal: installs the newest release with no "Open Anyway"
// step, because files downloaded by curl aren't marked as from the internet.
export const INSTALL_COMMAND = `curl -fsSL ${SITE_URL}/install.sh | bash`

export const InstallCommand = () => {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(INSTALL_COMMAND)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="grid min-w-0 gap-3">
      <div className="flex min-w-0 items-stretch border border-paper">
        <code className="min-w-0 flex-1 overflow-x-auto px-4 py-3 font-mono text-[15px] whitespace-nowrap text-paper">
          <span aria-hidden className="mr-2 text-signal select-none">$</span>{INSTALL_COMMAND}
        </code>
        <button type="button" onClick={copy}
          className="shrink-0 cursor-pointer border-0 border-l border-paper bg-paper px-4 font-bold text-ink transition-colors hover:bg-signal hover:text-white">
          <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <p className="t-meta m-0 text-paper/75">
        Installs the newest version into Applications and opens it. Nothing else on your Mac is changed.{' '}
        <a href={`${REPO_URL}/blob/main/website/public/install.sh`} className="font-bold text-paper underline underline-offset-4 hover:text-signal">Read the&nbsp;script</a>
      </p>
    </div>
  )
}

import { TerminalIcon } from './icons'

// Square signal-orange block that jumps to the install command (step 1 of the
// install section). Browsers can't run Terminal commands, so the command is
// copied there and pasted into Terminal.
export const InstallButton = ({ size = 'lg' }: { size?: 'sm' | 'lg' }) => (
  <a href="#install-command"
    className={`inline-flex items-center gap-2 bg-signal font-bold whitespace-nowrap text-white no-underline transition-colors hover:bg-ink ${size === 'lg' ? 'px-5 py-3.5 text-base' : 'px-3 py-1.5 text-sm'}`}>
    <TerminalIcon className={size === 'lg' ? 'size-5' : 'size-4'} />Install
  </a>
)

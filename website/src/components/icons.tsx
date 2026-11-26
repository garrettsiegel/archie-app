type IconProps = { className?: string }
const base = { viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }

export const UndoIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M7 5 3.5 8.5 7 12" /><path d="M4 8.5h8a4 4 0 0 1 0 8H9" /></svg>
)
export const ResetIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M16 10a6 6 0 1 1-1.8-4.3" /><path d="M16 3.5v3.5h-3.5" /></svg>
)
export const GitHubIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
  </svg>
)
export const TerminalIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><rect x="2.5" y="3.5" width="15" height="13" rx="1.5" /><path d="m6 8 2.5 2L6 12" /><path d="M10.5 12.5H14" /></svg>
)

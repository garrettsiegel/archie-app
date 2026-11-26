import { DOWNLOAD_SIZE, DOWNLOAD_URL, VERSION } from '../config'
import { DownloadIcon } from './icons'

// Square signal-orange block; on hover it turns black (white on the black band).
export const DownloadButton = ({ size = 'lg', onDark = false }: { size?: 'sm' | 'lg'; onDark?: boolean }) => (
  <a
    href={DOWNLOAD_URL}
    className={`inline-flex items-center gap-2 bg-signal font-bold whitespace-nowrap text-white no-underline transition-colors ${onDark ? 'hover:bg-paper hover:text-ink' : 'hover:bg-ink'} ${size === 'lg' ? 'px-5 py-3.5 text-base' : 'px-3 py-1.5 text-sm'}`}
  >
    <DownloadIcon className={size === 'lg' ? 'size-5' : 'size-4'} />
    {size === 'sm' ? <><span className="sm:hidden">Download</span><span className="hidden sm:inline">Download for Mac</span></> : 'Download for Mac'}
    {size === 'lg' && <span className="sr-only">, version {VERSION}, {DOWNLOAD_SIZE}</span>}
  </a>
)

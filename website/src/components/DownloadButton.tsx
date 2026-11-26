import { DOWNLOAD_SIZE, DOWNLOAD_URL, VERSION } from '../config'
import { DownloadIcon } from './icons'

export const DownloadButton = ({ size = 'lg' }: { size?: 'sm' | 'lg' }) => (
  <a
    href={DOWNLOAD_URL}
    className={`inline-flex items-center gap-2 rounded-full bg-green font-semibold whitespace-nowrap text-white no-underline shadow-[0_1px_2px_rgb(17_19_18/0.2),inset_0_1px_0_rgb(255_255_255/0.15)] transition-colors hover:bg-green-ink ${size === 'lg' ? 'px-6 py-3 text-base' : 'px-4 py-1.5 text-sm'}`}
  >
    <DownloadIcon className={size === 'lg' ? 'size-5' : 'size-4'} />
    {size === 'sm' ? <><span className="sm:hidden">Download</span><span className="hidden sm:inline">Download for Mac</span></> : 'Download for Mac'}
    {size === 'lg' && <span className="sr-only">, version {VERSION}, {DOWNLOAD_SIZE}</span>}
  </a>
)

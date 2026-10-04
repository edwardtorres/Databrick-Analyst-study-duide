import { WifiOff, RotateCcw } from 'lucide-react'
import { CHAPTERS, failedChapters, retryChapters } from '../data/chapters.js'
import { Loading } from './ui.jsx'

// Shown while chapter content is missing: a spinner while it downloads, or
// a retry screen if the download failed, instead of an endless spinner.
export default function ContentStatus({ ids, label = 'Loading chapter…' }) {
  const wanted = ids || CHAPTERS.filter((c) => c.built).map((c) => c.id)
  const failed = failedChapters(wanted)
  if (!failed.length) return <Loading label={label} />
  return (
    <div className="flex min-h-[50dvh] flex-col items-center justify-center px-4 text-center" role="alert">
      <WifiOff size={40} className="text-amber-300" />
      <h1 className="mt-3 text-lg font-black">Couldn't load this chapter</h1>
      <p className="mt-1 max-w-xs text-sm text-slate-400">
        Check your connection and try again. If the app was just updated, reloading picks up the new version.
      </p>
      <div className="mt-4 grid w-full max-w-xs grid-cols-2 gap-2">
        <button onClick={() => retryChapters(failed)} className="btn-primary">
          <RotateCcw size={16} /> Retry
        </button>
        <button onClick={() => window.location.reload()} className="btn-ghost">
          Reload
        </button>
      </div>
    </div>
  )
}

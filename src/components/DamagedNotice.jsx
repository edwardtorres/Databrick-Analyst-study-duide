import { AlertTriangle, Download } from 'lucide-react'
import { useProgress } from '../lib/store.jsx'

// Shown once, on the launch where saved progress failed validation.
export default function DamagedNotice() {
  const { damaged, dismissDamaged } = useProgress()
  if (!damaged) return null

  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([damaged.raw], { type: 'application/json' }))
    a.download = `lakehouse-quest-damaged-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-5" role="dialog" aria-modal="true" aria-labelledby="damaged-title">
      <div className="card w-full max-w-sm">
        <div className="flex items-center gap-2 text-amber-300">
          <AlertTriangle size={20} />
          <h2 id="damaged-title" className="font-extrabold">
            Saved progress couldn't be read
          </h2>
        </div>
        <p className="mt-2 text-sm text-slate-300">
          Your saved progress in this browser was damaged, so the app started fresh. The damaged copy hasn't been deleted. Download it to keep it, or send it to whoever helps you
          fix it.
        </p>
        <details className="mt-2 text-[11px] text-slate-500">
          <summary className="cursor-pointer">What was wrong</summary>
          <p className="mt-1">{damaged.reason}</p>
        </details>
        <div className="mt-4 grid gap-2">
          <button onClick={download} className="btn-primary">
            <Download size={16} /> Download damaged copy
          </button>
          <button onClick={dismissDamaged} className="btn-ghost">
            Continue with fresh progress
          </button>
        </div>
      </div>
    </div>
  )
}

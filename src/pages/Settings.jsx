import { useRef, useState } from 'react'
import { Download, Upload, Trash2 } from 'lucide-react'
import { useProgress, emptyProgress } from '../lib/store.jsx'
import { PageHeader } from '../components/ui.jsx'
import { EXAM } from '../data/examInfo.js'

export default function Settings() {
  const { state, actions } = useProgress()
  const fileRef = useRef(null)
  const [msg, setMsg] = useState(null)

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `lakehouse-quest-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importJson = async (file) => {
    try {
      const data = JSON.parse(await file.text())
      if (typeof data !== 'object' || data === null || typeof data.xp !== 'number') throw new Error('Not a Lakehouse Quest progress file.')
      actions.replaceAll(data)
      setMsg('✅ Progress imported.')
    } catch (e) {
      setMsg(`❌ ${e.message}`)
    }
  }

  return (
    <div>
      <PageHeader title="Settings" back="/" />
      <div className="card space-y-3">
        <h2 className="font-bold">Your progress</h2>
        <p className="text-sm text-slate-400">
          Progress is saved in this browser only (localStorage). Export a backup to move it between your phone and laptop.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={exportJson} className="btn-ghost">
            <Download size={16} /> Export
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn-ghost">
            <Upload size={16} /> Import
          </button>
        </div>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files[0] && importJson(e.target.files[0])} />
        {msg && <p className="text-sm">{msg}</p>}
        <button
          onClick={() => {
            if (confirm('Erase ALL progress (XP, streak, answers, tests)? This cannot be undone.')) {
              actions.replaceAll(emptyProgress())
              setMsg('Progress reset.')
            }
          }}
          className="btn w-full border border-rose-500/50 text-rose-300"
        >
          <Trash2 size={16} /> Reset all progress
        </button>
      </div>
      <div className="card mt-4 text-sm text-slate-400">
        <h2 className="mb-1 font-bold text-slate-200">About</h2>
        <p>
          All questions and lessons are original practice material written for this app, based on the topics in the exam guide dated {EXAM.guideVersionLabel}. They are not
          official Databricks questions. Items marked “Verify in Databricks docs” may have changed since then.
        </p>
      </div>
    </div>
  )
}

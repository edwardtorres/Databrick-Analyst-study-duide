import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useProgress } from '../lib/store.jsx'
import { VerifyFlag } from './ui.jsx'

// Tap-based scenario set: read a need, tap the option that solves it, then see
// why every option does or doesn't fit. Shared by Platform Match (Ch 1) and
// the Ingestion Picker (Ch 3).
export default function ScenarioPicker({ title, items: COMPONENTS, scenarios: SCENARIOS, prefix, question, verify, label = 'Matched' }) {
  const { state, actions } = useProgress()
  const [i, setI] = useState(0)
  const [pick, setPick] = useState(null)
  const s = SCENARIOS[i]
  const solved = SCENARIOS.filter((x) => state.labs[`${prefix}-${x.id}`]).length

  const choose = (id) => {
    if (pick) return
    setPick(id)
    if (id === s.answer) actions.labDone(`${prefix}-${s.id}`, 5)
  }
  const next = () => {
    setI((i + 1) % SCENARIOS.length)
    setPick(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{title}</h3>
        <span className="chip">
          Matched {solved}/{SCENARIOS.length}
        </span>
      </div>
      <div className="rounded-xl bg-ink/50 p-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Scenario {i + 1} of {SCENARIOS.length}
        </div>
        <p className="mt-1 text-[15px] text-slate-100">{s.need}</p>
      </div>
      <div className="text-sm font-semibold">{question}</div>
      <div className="grid grid-cols-2 gap-2">
        {s.options.map((id) => {
          const c = COMPONENTS[id]
          const state = !pick ? 'idle' : id === s.answer ? 'right' : id === pick ? 'wrong' : 'dim'
          const cls = {
            idle: 'border-line bg-panel2',
            right: 'border-emerald-500 bg-emerald-500/15',
            wrong: 'border-rose-500 bg-rose-500/15 animate-shake',
            dim: 'border-line bg-panel2 opacity-60',
          }[state]
          return (
            <button key={id} onClick={() => choose(id)} disabled={!!pick} className={`rounded-xl border p-2.5 text-left ${cls}`}>
              <div className="text-xl">{c.emoji}</div>
              <div className="text-sm font-bold leading-tight">{c.name}</div>
            </button>
          )
        })}
      </div>
      {pick && (
        <>
          <div className={`rounded-xl p-2.5 text-sm font-bold ${pick === s.answer ? 'bg-emerald-500/15 text-emerald-200' : 'bg-rose-500/15 text-rose-200'}`}>
            {pick === s.answer ? `✅ ${COMPONENTS[s.answer].name}` : `❌ It's ${COMPONENTS[s.answer].name}`}
          </div>
          <div className="space-y-1.5" data-testid="why-list">
            {s.options.map((id) => (
              <div key={id} className={`rounded-xl border p-2.5 text-sm ${id === s.answer ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-line'}`}>
                <div className="font-semibold">
                  {id === s.answer ? '✓' : '✗'} {COMPONENTS[id].name}
                </div>
                <div className="mt-0.5 text-slate-300">{s.why[id]}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-ink/50 p-2.5 text-xs text-slate-400">
            <strong className="text-slate-200">{COMPONENTS[s.answer].name}:</strong> {COMPONENTS[s.answer].blurb}
          </div>
          {s.verify && <VerifyFlag text={s.verify} />}
          <button onClick={next} className="btn-primary w-full">
            Next scenario <ChevronRight size={16} />
          </button>
        </>
      )}
      {verify && <VerifyFlag text={verify} />}
    </div>
  )
}

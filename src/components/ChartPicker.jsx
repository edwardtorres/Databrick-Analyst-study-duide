import { useState } from 'react'
import { ChevronRight, Table2 } from 'lucide-react'
import { useProgress } from '../lib/store.jsx'
import { SCENARIOS, CHART_TYPES, toSpec, judge } from '../lib/chartPicker.js'
import MiniChart from './MiniChart.jsx'

const VERDICT = {
  best: { text: '✅ Best choice', cls: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200' },
  ok: { text: '🟡 Works, but not the best', cls: 'border-amber-500/50 bg-amber-500/10 text-amber-100' },
  poor: { text: '❌ Poor fit', cls: 'border-rose-500/50 bg-rose-500/10 text-rose-200' },
}

const label = (id) => CHART_TYPES.find((c) => c.id === id).label

function DataPreview({ data }) {
  const [open, setOpen] = useState(false)
  const spec = toSpec(data, 'table')
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-1 text-xs text-slate-400 underline">
        <Table2 size={12} /> {open ? 'Hide' : 'View'} the data
      </button>
      {open && (
        <div className="mt-1.5">
          <MiniChart spec={spec} />
        </div>
      )}
    </div>
  )
}

export default function ChartPicker() {
  const { state, actions } = useProgress()
  const [i, setI] = useState(0)
  const [choice, setChoice] = useState(null)
  const s = SCENARIOS[i]
  const solved = SCENARIOS.filter((x) => state.labs[`chart-${x.id}`]).length

  const pick = (id) => {
    setChoice(id)
    if (judge(s, id) === 'best') actions.labDone(`chart-${s.id}`, 5)
  }
  const next = () => {
    setI((i + 1) % SCENARIOS.length)
    setChoice(null)
  }
  const verdict = choice && judge(s, choice)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">📊 Chart Picker</h3>
        <span className="chip">
          Best picks {solved}/{SCENARIOS.length}
        </span>
      </div>
      <div className="rounded-xl bg-ink/50 p-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Scenario {i + 1} of {SCENARIOS.length}
        </div>
        <p className="mt-1 text-[15px] font-semibold text-slate-100">{s.question}</p>
        <div className="mt-2">
          <DataPreview data={s.data} key={s.id} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {CHART_TYPES.map((c) => (
          <button
            key={c.id}
            onClick={() => pick(c.id)}
            className={`rounded-lg px-1 py-2 text-[11px] font-bold ${choice === c.id ? 'bg-brand text-ink' : 'bg-panel2 text-slate-200'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {!choice && <p className="text-sm text-slate-400">Pick the chart type that best answers the question.</p>}

      {choice && (
        <>
          <div className={`rounded-xl border p-3 text-sm ${VERDICT[verdict].cls}`}>
            <div className="font-bold">{VERDICT[verdict].text}</div>
            <div className="mt-1 text-slate-200">
              <strong>{label(choice)}:</strong> {s.why[choice]}
            </div>
            {verdict !== 'best' && (
              <div className="mt-1 text-slate-200">
                <strong>Best: {label(s.best)}.</strong> {s.why[s.best]}
              </div>
            )}
          </div>
          <div className={`grid gap-2 ${verdict === 'best' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
            <figure className="rounded-xl border border-line bg-panel p-2">
              <figcaption className="mb-1 text-[11px] font-semibold text-slate-400">Your choice: {label(choice)}</figcaption>
              <MiniChart spec={toSpec(s.data, choice)} />
            </figure>
            {verdict !== 'best' && (
              <figure className="rounded-xl border border-emerald-500/40 bg-panel p-2">
                <figcaption className="mb-1 text-[11px] font-semibold text-emerald-300">Best: {label(s.best)}</figcaption>
                <MiniChart spec={toSpec(s.data, s.best)} />
              </figure>
            )}
          </div>
          <button onClick={next} className="btn-primary w-full">
            Next scenario <ChevronRight size={16} />
          </button>
        </>
      )}
      <p className="text-[11px] text-slate-500">Hover or long-press a mark to see its value. Charts are simplified sketches of what Databricks would draw.</p>
    </div>
  )
}

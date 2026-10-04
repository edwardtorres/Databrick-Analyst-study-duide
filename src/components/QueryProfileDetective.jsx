import { useMemo, useState } from 'react'
import { ChevronRight, Timer, Search } from 'lucide-react'
import { useProgress } from '../lib/store.jsx'
import { CASES, DIAGNOSES, diagnosisOptions } from '../lib/profileLab.js'
import { shuffled } from '../lib/shuffle.js'
import { VerifyFlag } from './ui.jsx'

function Profile({ profile, label, highlight }) {
  return (
    <div className="rounded-xl border border-line bg-ink/50 p-2.5">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-bold text-slate-300">{label}</span>
        <span className="inline-flex items-center gap-1 font-mono text-slate-200">
          <Timer size={12} /> {profile.duration}
        </span>
      </div>
      <div className="space-y-1.5" data-testid="profile">
        {profile.ops.map((o, i) => (
          <div key={i} style={{ marginLeft: i * 8 }} className={`rounded-lg border p-1.5 ${highlight && o.hot ? 'border-rose-500/60 bg-rose-500/10' : 'border-line bg-panel'}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-slate-100">{o.name}</span>
              <span className="shrink-0 font-mono text-[10px] text-slate-400">{o.rows} rows</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${o.timePct}%` }} />
              </div>
              <span className="w-9 text-right font-mono text-[10px] text-slate-300">{o.timePct}%</span>
            </div>
            {(o.bytes || o.files || o.spill || o.tasks || o.note) && (
              <div className="mt-1 flex flex-wrap gap-1">
                {o.bytes && <span className="rounded bg-sky-500/15 px-1.5 text-[10px] text-sky-200">{o.bytes} read</span>}
                {o.files && <span className="rounded bg-violet-500/15 px-1.5 text-[10px] text-violet-200">files: {o.files}</span>}
                {o.spill && <span className={`rounded px-1.5 text-[10px] ${o.spill === 'no spill' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-rose-500/20 text-rose-200'}`}>{o.spill}</span>}
                {o.tasks && <span className="rounded bg-amber-500/15 px-1.5 text-[10px] text-amber-100">{o.tasks}</span>}
                {o.note && <span className="rounded bg-slate-500/20 px-1.5 text-[10px] text-slate-200">{o.note}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-1.5 text-[10px] text-slate-500">Bars show each operator's share of total time. Top = final result, bottom = table scan.</div>
    </div>
  )
}

function Choice({ text, state, onClick, disabled }) {
  const cls = {
    idle: 'border-line bg-panel2',
    right: 'border-emerald-500 bg-emerald-500/15',
    wrong: 'border-rose-500 bg-rose-500/15',
    dim: 'border-line bg-panel2 opacity-50',
  }[state]
  return (
    <button disabled={disabled} onClick={onClick} className={`w-full rounded-xl border p-2.5 text-left text-sm ${cls}`}>
      {text}
    </button>
  )
}

export default function QueryProfileDetective() {
  const { state, actions } = useProgress()
  const [i, setI] = useState(0)
  const [diag, setDiag] = useState(null)
  const [fix, setFix] = useState(null)
  const c = CASES[i]
  const diagOpts = useMemo(() => shuffled(diagnosisOptions(c)), [c])
  const fixOpts = useMemo(() => shuffled(c.fixes), [c])
  const solved = CASES.filter((x) => state.labs[`qp-${x.id}`]).length

  const pickFix = (f) => {
    setFix(f.id)
    if (diag === c.diagnosis && f.ok) actions.labDone(`qp-${c.id}`, 8)
  }
  const next = () => {
    setI((i + 1) % CASES.length)
    setDiag(null)
    setFix(null)
  }
  const chosenFix = c.fixes.find((f) => f.id === fix)
  const rightFix = c.fixes.find((f) => f.ok)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">🕵️ Query Profile Detective</h3>
        <span className="chip">
          Solved {solved}/{CASES.length}
        </span>
      </div>
      <div className="rounded-xl bg-ink/50 p-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Case {i + 1} of {CASES.length}
        </div>
        <p className="mt-0.5 font-semibold text-slate-100">{c.title}</p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-ink p-2 font-mono text-[11px] text-emerald-100">{c.sql}</pre>
        <p className="mt-1.5 text-xs text-slate-400">{c.context}</p>
      </div>

      <Profile profile={c.before} label="Query Profile (before)" highlight={diag !== null} />

      <div>
        <div className="mb-1.5 flex items-center gap-1 text-sm font-bold">
          <Search size={14} /> 1. What is the bottleneck?
        </div>
        <div className="space-y-1.5">
          {diagOpts.map((d) => (
            <Choice
              key={d}
              text={DIAGNOSES[d]}
              disabled={diag !== null}
              onClick={() => setDiag(d)}
              state={diag === null ? 'idle' : d === c.diagnosis ? 'right' : d === diag ? 'wrong' : 'dim'}
            />
          ))}
        </div>
      </div>

      {diag !== null && (
        <div>
          <div className="mb-1.5 text-sm font-bold">2. Pick the fix</div>
          <div className="space-y-1.5">
            {fixOpts.map((f) => (
              <Choice
                key={f.id}
                text={f.text}
                disabled={fix !== null}
                onClick={() => pickFix(f)}
                state={fix === null ? 'idle' : f.ok ? 'right' : f.id === fix ? 'wrong' : 'dim'}
              />
            ))}
          </div>
        </div>
      )}

      {fix !== null && (
        <>
          <div className={`rounded-xl border p-3 text-sm ${chosenFix.ok && diag === c.diagnosis ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-amber-500/50 bg-amber-500/10'}`}>
            <div className="font-bold">{chosenFix.ok && diag === c.diagnosis ? '✅ Case solved' : '🟡 Not quite. Here is what was going on.'}</div>
            {!chosenFix.ok && (
              <p className="mt-1 text-slate-300">
                <strong>Your fix:</strong> {chosenFix.why}
              </p>
            )}
            <p className="mt-1 text-slate-200">
              <strong>Best fix:</strong> {rightFix.why}
            </p>
            <p className="mt-1 text-slate-300">{c.explain}</p>
          </div>
          <Profile profile={c.after} label="Query Profile (after the fix)" />
          {c.verify && <VerifyFlag text={c.verify} />}
          <button onClick={next} className="btn-primary w-full">
            Next case <ChevronRight size={16} />
          </button>
        </>
      )}
      <p className="text-[11px] text-slate-500">Profiles are simplified mock-ups. Numbers are illustrative and operator names are shortened.</p>
    </div>
  )
}

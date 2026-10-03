import { useState } from 'react'
import { useProgress } from '../lib/store.jsx'

const A = ['Ava', 'Ben', 'Ben', 'Chloe', 'Diego']
const B = ['Chloe', 'Diego', 'Diego', 'Emma']

const OPS = {
  'UNION ALL': {
    run: () => [...A.map((v) => [v, 'A']), ...B.map((v) => [v, 'B'])],
    note: 'Appends every row from both sides. Duplicates stay, and nothing is de-duplicated, so it is the cheapest option.',
  },
  UNION: {
    run: () => [...new Set([...A, ...B])].map((v) => [v, A.includes(v) ? 'A' : 'B']),
    note: 'Appends, then removes duplicates (UNION means UNION DISTINCT). The de-dup step costs time on big data.',
  },
  INTERSECT: {
    run: () => [...new Set(A.filter((v) => B.includes(v)))].map((v) => [v, 'AB']),
    note: 'Distinct rows present in both inputs.',
  },
  EXCEPT: {
    run: () => [...new Set(A.filter((v) => !B.includes(v)))].map((v) => [v, 'A']),
    note: 'Distinct rows in the first input that are not in the second (MINUS is a synonym).',
  },
}

const tone = { A: 'bg-sky-500/20 text-sky-200', B: 'bg-amber-500/20 text-amber-200', AB: 'bg-emerald-500/20 text-emerald-200' }

export default function SetOps() {
  const { actions } = useProgress()
  const [op, setOp] = useState(null)
  const [guess, setGuess] = useState(null)
  const result = op ? OPS[op].run() : []

  const choose = (o) => {
    setOp(o)
    setGuess(null)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold">🧬 Set Operations</h3>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          ['A: list_2024', A, 'A'],
          ['B: list_2025', B, 'B'],
        ].map(([label, rows, k]) => (
          <div key={k} className="rounded-xl bg-ink/50 p-2">
            <div className="mb-1 font-mono font-bold text-slate-300">{label}</div>
            <div className="flex flex-wrap gap-1">
              {rows.map((v, i) => (
                <span key={i} className={`rounded px-1.5 py-0.5 font-mono ${tone[k]}`}>
                  {v}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {Object.keys(OPS).map((o) => (
          <button key={o} onClick={() => choose(o)} className={`rounded-lg px-1 py-2 text-[11px] font-bold ${op === o ? 'bg-brand text-ink' : 'bg-panel2'}`}>
            {o}
          </button>
        ))}
      </div>
      {op && guess === null && (
        <div className="rounded-xl border border-dashed border-brand/50 bg-brand/5 p-3 text-sm">
          <div className="font-semibold">
            Predict: how many rows does <code className="text-amber-200">A {op} B</code> return?
          </div>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {[1, 2, 3, 5, 9].map((n) => (
              <button
                key={n}
                onClick={() => {
                  setGuess(n)
                  if (n === result.length) actions.labDone(`setops-${op}`, 5)
                }}
                className="btn-ghost py-2"
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
      {op && guess !== null && (
        <div className="space-y-2">
          <div className={`rounded-xl px-3 py-2 text-sm ${guess === result.length ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
            <span className="font-semibold">{guess === result.length ? `✅ ${result.length} rows.` : `❌ ${result.length} rows, not ${guess}.`}</span>{' '}
            <span className="text-slate-300">{OPS[op].note}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {result.map(([v, src], i) => (
              <span key={i} className={`rounded px-1.5 py-0.5 font-mono text-xs ${tone[src]}`}>
                {v}
              </span>
            ))}
          </div>
        </div>
      )}
      {!op && <p className="text-sm text-slate-400">Pick an operator, predict the row count, then see the result.</p>}
    </div>
  )
}

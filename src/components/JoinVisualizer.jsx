import { useMemo, useState } from 'react'
import { useProgress } from '../lib/store.jsx'
import { shuffled } from '../lib/shuffle.js'

const LEFT = {
  name: 'customers',
  cols: ['id', 'name'],
  rows: [
    [1, 'Ava'],
    [2, 'Ben'],
    [3, 'Chloe'],
    [4, 'Diego'],
  ],
  key: 0,
}
const RIGHT = {
  name: 'orders',
  cols: ['order', 'cust_id'],
  rows: [
    ['o1', 1],
    ['o2', 1],
    ['o3', 2],
    ['o4', 5],
    ['o5', null],
  ],
  key: 1,
}

const TYPES = [
  { id: 'INNER', sql: 'INNER JOIN', note: 'Only pairs that match. Ava appears twice because she has two orders.' },
  { id: 'LEFT', sql: 'LEFT JOIN', note: 'Every customer. Chloe and Diego have no orders, so their order columns are NULL.' },
  { id: 'RIGHT', sql: 'RIGHT JOIN', note: 'Every order. o4 (customer 5 does not exist) and o5 (NULL key) get NULL customer columns.' },
  { id: 'FULL', sql: 'FULL OUTER JOIN', note: 'Everything from both sides, NULL-padded wherever there is no match.' },
  { id: 'SEMI', sql: 'LEFT SEMI JOIN', note: 'Customers that have at least one order. Left columns only, and no duplicates even though Ava has 2 orders.' },
  { id: 'ANTI', sql: 'LEFT ANTI JOIN', note: 'Customers with NO orders. Left columns only. Equivalent to NOT EXISTS.' },
  { id: 'CROSS', sql: 'CROSS JOIN', note: 'Every customer paired with every order: 4 × 5 = 20 rows. No ON clause.' },
]

function computeJoin(type) {
  const L = LEFT.rows
  const R = RIGHT.rows
  const match = (l, r) => l[LEFT.key] !== null && r[RIGHT.key] !== null && l[LEFT.key] === r[RIGHT.key]
  const pairs = []
  if (type === 'CROSS') {
    L.forEach((_, i) => R.forEach((_, j) => pairs.push([i, j])))
  } else if (type === 'SEMI' || type === 'ANTI') {
    L.forEach((l, i) => {
      const has = R.some((r) => match(l, r))
      if (has === (type === 'SEMI')) pairs.push([i, null])
    })
  } else {
    const rightUsed = new Set()
    L.forEach((l, i) => {
      let any = false
      R.forEach((r, j) => {
        if (match(l, r)) {
          pairs.push([i, j])
          rightUsed.add(j)
          any = true
        }
      })
      if (!any && (type === 'LEFT' || type === 'FULL')) pairs.push([i, null])
    })
    if (type === 'RIGHT' || type === 'FULL')
      R.forEach((_, j) => {
        if (!rightUsed.has(j)) pairs.push([null, j])
      })
    if (type === 'RIGHT') pairs.sort((a, b) => (a[1] ?? 99) - (b[1] ?? 99))
  }
  const leftOnly = type === 'SEMI' || type === 'ANTI'
  const leftKept = new Set(pairs.map((p) => p[0]).filter((x) => x !== null))
  const rightKept = new Set(pairs.map((p) => p[1]).filter((x) => x !== null))
  return { pairs, leftOnly, leftKept, rightKept }
}

function MiniTable({ t, kept, side }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1 font-mono text-xs font-bold text-slate-300">{t.name}</div>
      <table className="w-full font-mono text-[11px]">
        <thead>
          <tr>
            {t.cols.map((c) => (
              <th key={c} className="px-1.5 py-1 text-left text-slate-400">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.rows.map((r, i) => (
            <tr
              key={i}
              className={`transition ${
                kept === null ? '' : kept.has(i) ? (side === 'L' ? 'bg-sky-500/20' : 'bg-amber-500/20') : 'opacity-35 line-through'
              }`}
            >
              {r.map((v, j) => (
                <td key={j} className={`px-1.5 py-1 ${j === t.key ? 'font-bold' : ''}`}>
                  {v === null ? <span className="text-fuchsia-300">NULL</span> : v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function JoinVisualizer() {
  const { actions, state } = useProgress()
  const [type, setType] = useState('INNER')
  const [guess, setGuess] = useState({})
  const res = useMemo(() => computeJoin(type), [type])
  const info = TYPES.find((t) => t.id === type)
  const answer = res.pairs.length
  const choices = useMemo(() => {
    const counts = new Set([answer])
    for (const t of TYPES) counts.add(computeJoin(t.id).pairs.length)
    return shuffled([answer, ...shuffled([...counts].filter((c) => c !== answer)).slice(0, 3)])
  }, [answer])
  const guessed = guess[type]
  const revealed = guessed !== undefined
  const predictedAll = TYPES.filter((t) => state.labs[`join-${t.id}`]).length

  const pick = (n) => {
    setGuess({ ...guess, [type]: n })
    if (n === answer) actions.labDone(`join-${type}`, 5)
  }

  const cols = res.leftOnly ? LEFT.cols : [...LEFT.cols, ...RIGHT.cols]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">🔗 Join Visualizer</h3>
        <span className="chip">
          Predicted {predictedAll}/{TYPES.length}
        </span>
      </div>
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold ${
              type === t.id ? 'bg-brand text-ink' : 'bg-panel2 text-slate-300'
            } ${state.labs[`join-${t.id}`] ? 'ring-1 ring-emerald-400/60' : ''}`}
          >
            {t.id}
          </button>
        ))}
      </div>
      <pre className="overflow-x-auto rounded-xl bg-ink p-2.5 font-mono text-[11px] text-emerald-100">
        {`SELECT ${res.leftOnly ? 'c.*' : '*'}\nFROM customers c\n${info.sql} orders o${type === 'CROSS' ? '' : '\n  ON c.id = o.cust_id'}`}
      </pre>
      <div className="flex gap-3">
        <MiniTable t={LEFT} kept={revealed ? res.leftKept : null} side="L" />
        <MiniTable t={RIGHT} kept={revealed ? (res.leftOnly ? new Set() : res.rightKept) : null} side="R" />
      </div>

      {!revealed ? (
        <div className="rounded-xl border border-dashed border-brand/50 bg-brand/5 p-3">
          <div className="text-sm font-semibold">Predict: how many rows does this return?</div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {choices.map((n) => (
              <button key={n} onClick={() => pick(n)} className="btn-ghost py-2 text-base">
                {n}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className={`rounded-xl px-3 py-2 text-sm font-semibold ${guessed === answer ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
            {guessed === answer ? `✅ ${answer} rows. Nailed it.` : `❌ You said ${guessed}; it's ${answer}.`} <span className="font-normal text-slate-300">{info.note}</span>
          </div>
          <div className="max-h-64 overflow-auto rounded-xl border border-line">
            <table className="w-full font-mono text-[11px]">
              <thead className="sticky top-0 bg-panel2">
                <tr>
                  {cols.map((c, i) => (
                    <th key={i} className={`px-2 py-1 text-left ${i < LEFT.cols.length ? 'text-sky-300' : 'text-amber-300'}`}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {res.pairs.map(([li, ri], k) => {
                  const l = li === null ? LEFT.cols.map(() => null) : LEFT.rows[li]
                  const r = ri === null ? RIGHT.cols.map(() => null) : RIGHT.rows[ri]
                  const cells = res.leftOnly ? l : [...l, ...r]
                  return (
                    <tr key={k} className="odd:bg-ink/30">
                      {cells.map((v, j) => (
                        <td key={j} className={`px-2 py-1 ${v === null ? 'bg-fuchsia-500/10 italic text-fuchsia-300' : ''}`}>
                          {v === null ? 'NULL' : v}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <button onClick={() => setGuess({ ...guess, [type]: undefined })} className="text-xs text-slate-400 underline">
            Hide and predict again
          </button>
        </>
      )}
      <p className="text-xs text-slate-500">
        Note: o5 has a NULL cust_id, and NULL never equals anything, so it never matches. o4 points at customer 5, who does not exist.
      </p>
    </div>
  )
}

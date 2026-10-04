import { useState } from 'react'
import { RotateCcw, Database, HardDrive, Plus } from 'lucide-react'
import { useProgress } from '../lib/store.jsx'
import { QUERIES, initialCacheLab, runQuery, insertRows, predictHit, MISSIONS, missionsDone } from '../lib/cacheLab.js'

const BADGE = {
  hit: { text: 'RESULT CACHE HIT', cls: 'bg-emerald-500/20 text-emerald-200' },
  miss: { text: 'MISS', cls: 'bg-slate-500/25 text-slate-200' },
  invalidated: { text: 'MISS (invalidated)', cls: 'bg-amber-500/20 text-amber-100' },
  bypass: { text: 'NOT CACHEABLE', cls: 'bg-rose-500/20 text-rose-200' },
}

export default function CacheLab() {
  const { state: progress, actions } = useProgress()
  const [s, setS] = useState(initialCacheLab)
  const [qid, setQid] = useState('q1')
  const [score, setScore] = useState({ right: 0, total: 0 })

  const run = (predictedHit) => {
    const actualHit = predictHit(s, qid)
    const next = runQuery(s, qid)
    const ev = next.log[next.log.length - 1]
    ev.predicted = predictedHit
    ev.correct = predictedHit === actualHit
    setScore((sc) => ({ right: sc.right + (ev.correct ? 1 : 0), total: sc.total + 1 }))
    setS(next)
    const done = missionsDone(next)
    for (const [k] of MISSIONS) if (done[k]) actions.labDone(`cache-${k}`, 5)
  }

  const done = missionsDone(s)
  const log = [...s.log].reverse()

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">⚡ Cache Lab</h3>
        <div className="flex items-center gap-2">
          <span className="chip">
            Predictions {score.right}/{score.total}
          </span>
          <button
            onClick={() => {
              setS(initialCacheLab())
              setScore({ right: 0, total: 0 })
            }}
            className="chip text-slate-300"
            aria-label="Reset lab"
          >
            <RotateCcw size={11} /> Reset
          </button>
        </div>
      </div>
      <p className="text-sm text-slate-400">
        Pick a query, predict whether it hits the <strong className="text-slate-200">result cache</strong>, then change the table and see what happens.
      </p>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-ink/50 p-2">
          <div className="mb-1 flex items-center gap-1 font-bold text-slate-300">
            <Database size={12} /> gold.daily_sales · v{s.version}
          </div>
          <div className="flex flex-wrap gap-1">
            {s.files.map((f) => (
              <span key={f} className={`rounded px-1 font-mono text-[10px] ${s.diskCache.includes(f) ? 'bg-sky-500/20 text-sky-200' : 'bg-panel2 text-slate-400'}`}>
                {f}
              </span>
            ))}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
            <HardDrive size={10} /> blue = on local SSD (disk cache)
          </div>
        </div>
        <div className="rounded-xl bg-ink/50 p-2" data-testid="result-cache">
          <div className="mb-1 font-bold text-slate-300">Result cache</div>
          {Object.keys(s.resultCache).length === 0 && <div className="text-[11px] text-slate-500">empty</div>}
          {Object.entries(s.resultCache).map(([q, v]) => (
            <div key={q} className="text-[11px]">
              {QUERIES[q].label}: v{v}{' '}
              {v === s.version ? <span className="text-emerald-300">valid</span> : <span className="text-amber-300">stale</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        {Object.entries(QUERIES).map(([id, q]) => (
          <button
            key={id}
            onClick={() => setQid(id)}
            className={`w-full rounded-xl border p-2 text-left ${qid === id ? 'border-brand bg-brand/10' : 'border-line bg-panel2'}`}
          >
            <div className="text-xs font-bold">{q.label}</div>
            <pre className="mt-0.5 whitespace-pre-wrap font-mono text-[10px] text-emerald-100">{q.sql}</pre>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => run(true)} className="btn-primary py-2 text-sm">
          Run · predict HIT
        </button>
        <button onClick={() => run(false)} className="btn-ghost py-2 text-sm">
          Run · predict MISS
        </button>
      </div>
      <button onClick={() => setS(insertRows(s))} className="btn-ghost w-full py-2 text-sm">
        <Plus size={14} /> INSERT INTO gold.daily_sales … (change the table)
      </button>

      <div className="space-y-1.5" data-testid="cache-log">
        {log.map((e, k) =>
          e.kind === 'write' ? (
            <div key={k} className="rounded-xl border border-dashed border-amber-500/40 p-2 text-xs text-amber-100">
              ✏️ {e.why}
            </div>
          ) : (
            <div key={k} className="rounded-xl border border-line bg-panel p-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${BADGE[e.result].cls}`}>{BADGE[e.result].text}</span>
                <span className="font-semibold">{QUERIES[e.qid].label}</span>
                <span className="ml-auto font-mono text-slate-400">
                  {e.seconds}s · cloud {e.gbCloud} GB · SSD {e.gbDisk} GB
                </span>
              </div>
              <div className="mt-1 text-slate-300">{e.why}</div>
              <div className={`mt-0.5 text-[11px] ${e.correct ? 'text-emerald-300' : 'text-rose-300'}`}>
                {e.correct ? '✅ Your prediction was right' : `❌ You predicted ${e.predicted ? 'HIT' : 'MISS'}`}
              </div>
            </div>
          ),
        )}
      </div>

      <div className="rounded-xl border border-line p-3">
        <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Missions (+5 XP each)</div>
        {MISSIONS.map(([k, text]) => (
          <div key={k} className={`text-sm ${done[k] || progress.labs[`cache-${k}`] ? 'text-emerald-300' : 'text-slate-300'}`}>
            {done[k] || progress.labs[`cache-${k}`] ? '✅' : '⬜'} {text}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-slate-500">Simplified: this lab models one warehouse's local result cache and disk cache. On serverless, a remote result cache is also shared by all warehouses in the workspace and survives restarts. Cached results live up to 24 hours. Timings are illustrative.</p>
    </div>
  )
}

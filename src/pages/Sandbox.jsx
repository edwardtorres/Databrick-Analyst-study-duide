import { useEffect, useRef, useState } from 'react'
import { RotateCcw, ChevronDown, CheckCircle2, Circle } from 'lucide-react'
import { useSql } from '../lib/useSql.js'
import { createDb, runSql, friendlyError } from '../lib/sqlEngine.js'
import { allChallenges, chapterById } from '../data/chapters.js'
import { useProgress } from '../lib/store.jsx'
import SqlEditor from '../components/SqlEditor.jsx'
import ResultTable from '../components/ResultTable.jsx'
import { PageHeader, difficultyLabel } from '../components/ui.jsx'
import { go } from '../lib/router.js'

const SAMPLES = [
  ['Peek', 'SELECT * FROM customers LIMIT 5'],
  ['3-part name', 'SELECT * FROM quest.retail.orders LIMIT 5'],
  ['Dirty emails', "SELECT name, email FROM customers\nWHERE email IS NULL OR email NOT LIKE '%@%'"],
  ['Revenue', "SELECT p.category, SUM(o.amount) AS revenue\nFROM orders o JOIN products p ON o.product_id = p.product_id\nWHERE o.status = 'completed'\nGROUP BY p.category\nORDER BY revenue DESC"],
  ['Stats', 'SELECT COUNT(*), COUNT(amount), approx_count_distinct(customer_id),\n  ROUND(AVG(amount), 2), median(amount), ROUND(stddev(amount), 2)\nFROM orders'],
  ['Window', 'SELECT customer_id, order_id, amount,\n  ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC) AS rn\nFROM orders'],
  ['CTAS', "CREATE OR REPLACE TABLE gold_by_tier AS\nSELECT tier, COUNT(*) AS n FROM customers GROUP BY tier;\nSELECT * FROM gold_by_tier"],
]

const KIND_EMOJI = { write: '✍️', fix: '🔧', ddl: '🏗️' }

export default function Sandbox() {
  const [tab, setTab] = useState('challenges')
  return (
    <div>
      <PageHeader title="SQL Arena" subtitle="Real SQL running in your browser on a sample retail dataset" />
      <div className="mb-4 grid grid-cols-2 rounded-xl bg-panel2 p-1 text-sm font-bold">
        {[
          ['challenges', '🎯 Challenges'],
          ['free', '🧪 Free play'],
        ].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-lg py-2 ${tab === k ? 'bg-brand text-ink' : 'text-slate-300'}`}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'challenges' ? <ChallengeList /> : <FreePlay />}
    </div>
  )
}

function ChallengeList() {
  const { state } = useProgress()
  const list = allChallenges()
  const solved = list.filter((c) => state.challenges[c.id]?.solved).length
  const groups = {}
  for (const c of list) (groups[`${c.chapter}:${c.sub}`] ||= []).push(c)
  return (
    <div className="space-y-4">
      <div className="card flex items-center justify-between">
        <span className="text-sm text-slate-300">Solved</span>
        <span className="text-2xl font-black text-emerald-300">
          {solved}/{list.length}
        </span>
      </div>
      {Object.entries(groups).map(([key, items]) => {
        const [chId, subId] = key.split(':')
        const ch = chapterById(chId)
        const sub = ch.content.subsections.find((s) => s.id === subId)
        return (
          <div key={key}>
            <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              {sub.emoji} {sub.title}
            </h3>
            <div className="space-y-2">
              {items.map((c) => {
                const st = state.challenges[c.id]
                return (
                  <button key={c.id} onClick={() => go(`/sql/${c.id}`)} className="card flex w-full items-center gap-3 !p-3 text-left active:scale-[0.99]">
                    {st?.solved ? <CheckCircle2 className="shrink-0 text-emerald-400" size={20} /> : <Circle className="shrink-0 text-slate-600" size={20} />}
                    <span className="flex-1 text-sm font-semibold">
                      {KIND_EMOJI[c.kind]} {c.title}
                    </span>
                    <span className="text-[11px] text-slate-400">{difficultyLabel(c.difficulty)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FreePlay() {
  const { SQL, error: loadError } = useSql()
  const db = useRef(null)
  const [sql, setSql] = useState(SAMPLES[0][1])
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [notes, setNotes] = useState(false)

  useEffect(() => {
    if (SQL && !db.current) db.current = createDb(SQL)
    return () => {
      db.current?.close()
      db.current = null
    }
  }, [SQL])

  const run = () => {
    if (!db.current) return
    try {
      setResult(runSql(db.current, sql))
      setError(null)
    } catch (e) {
      setError(friendlyError(e.message))
      setResult(null)
    }
  }

  const reset = () => {
    db.current?.close()
    db.current = createDb(SQL)
    setResult({ columns: [], rows: [], message: 'Database reset to the original sample data.' })
    setError(null)
  }

  return (
    <div className="space-y-3">
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
        {SAMPLES.map(([label, text]) => (
          <button key={label} onClick={() => setSql(text)} className="shrink-0 rounded-lg bg-panel2 px-2.5 py-1 text-xs font-semibold">
            {label}
          </button>
        ))}
      </div>
      {loadError && <div className="text-sm text-rose-300">Could not load the SQL engine: {loadError}</div>}
      <SqlEditor value={sql} onChange={setSql} onRun={run} running={!SQL} rows={8} />
      {error && <pre className="animate-shake whitespace-pre-wrap rounded-xl border border-rose-500/50 bg-rose-500/10 p-3 text-xs text-rose-200">{error}</pre>}
      <ResultTable result={result} />
      <button onClick={reset} disabled={!SQL} className="btn-ghost w-full text-sm">
        <RotateCcw size={15} /> Reset database
      </button>

      <div className="rounded-xl border border-line">
        <button onClick={() => setNotes(!notes)} className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold">
          Sandbox vs real Databricks SQL <ChevronDown size={16} className={notes ? 'rotate-180' : ''} />
        </button>
        {notes && (
          <ul className="list-disc space-y-1 border-t border-line px-7 py-2 text-xs text-slate-400">
            <li>The engine is SQLite (sql.js) with Databricks-style add-ons: 3-part names (quest.retail.orders), CREATE OR REPLACE TABLE/VIEW, USING DELTA, approx_count_distinct, count_if, median, percentile, percentile_approx, stddev, nvl, year/month/day, initcap.</li>
            <li>
              Integer division differs: <code>7/2</code> is 3 here, but 3.5 in Databricks.
            </li>
            <li>LIKE is case-insensitive here, but case-sensitive in Databricks (use ILIKE there).</li>
            <li>Without GROUP BY, SQLite tolerates bare columns next to aggregates. Databricks raises MISSING_AGGREGATION.</li>
            <li>No LEFT SEMI/ANTI JOIN, QUALIFY, or time travel syntax in this engine. Use the Join Visualizer and Time Travel labs for those.</li>
            <li>Dates are stored as ISO text ('2025-03-01'), so comparisons and ORDER BY behave like dates.</li>
          </ul>
        )}
      </div>
    </div>
  )
}

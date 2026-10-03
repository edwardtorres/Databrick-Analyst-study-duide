import { useEffect, useMemo, useState } from 'react'
import { CheckCheck, Lightbulb, Eye, RotateCcw, Wrench, PenLine, Hammer } from 'lucide-react'
import { useSql } from '../lib/useSql.js'
import { createDb, runSql, checkChallenge, friendlyError } from '../lib/sqlEngine.js'
import { SAMPLE_TABLES } from '../data/sampleDb.js'
import { useProgress } from '../lib/store.jsx'
import { XP } from '../lib/levels.js'
import SqlEditor from './SqlEditor.jsx'
import ResultTable from './ResultTable.jsx'
import { Rich, difficultyLabel } from './ui.jsx'

const KIND = {
  write: { label: 'Write the query', icon: PenLine, cls: 'bg-sky-500/15 text-sky-300' },
  fix: { label: 'Fix the broken query', icon: Wrench, cls: 'bg-rose-500/15 text-rose-300' },
  ddl: { label: 'Build the object', icon: Hammer, cls: 'bg-amber-500/15 text-amber-300' },
}

function setupTables(SQL, setup) {
  if (!setup) return []
  const db = createDb(SQL, setup)
  try {
    const names = db
      .exec("SELECT name FROM sqlite_master WHERE type IN ('table','view')")[0]
      .values.map((r) => r[0])
      .filter((n) => !SAMPLE_TABLES.includes(n))
    return names.map((name) => ({
      name,
      columns: db.exec(`PRAGMA table_info(${name})`)[0].values.map((r) => [r[1], r[2] || 'ANY']),
    }))
  } finally {
    db.close()
  }
}

export default function SqlChallenge({ challenge, onSolved }) {
  const { SQL, error: loadError } = useSql()
  const { state, actions } = useProgress()
  const [sql, setSql] = useState(challenge.starter || '')
  const [result, setResult] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [hints, setHints] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [showExpected, setShowExpected] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const solvedBefore = state.challenges[challenge.id]?.solved

  useEffect(() => {
    setSql(challenge.starter || '')
    setResult(null)
    setFeedback(null)
    setHints(0)
    setRevealed(false)
    setShowExpected(false)
    setAttempts(0)
  }, [challenge.id, challenge.starter])

  const extraTables = useMemo(() => (SQL ? setupTables(SQL, challenge.setup) : []), [SQL, challenge.setup])
  const kind = KIND[challenge.kind] || KIND.write

  const run = () => {
    if (!SQL) return
    const db = createDb(SQL, challenge.setup || '')
    try {
      setResult(runSql(db, sql))
      setFeedback(null)
    } catch (e) {
      setResult(null)
      setFeedback({ ok: false, error: friendlyError(e.message) })
    } finally {
      db.close()
    }
  }

  const check = () => {
    if (!SQL) return
    const r = checkChallenge(SQL, challenge, sql)
    setAttempts((a) => a + 1)
    setFeedback(r)
    setResult(r.actual || null)
    const firstSolve = r.ok && !solvedBefore
    actions.challengeAttempt(challenge.id, r.ok, firstSolve ? (revealed ? 5 : XP.challenge) : 0)
    if (r.ok) onSolved?.()
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${kind.cls}`}>
          <kind.icon size={13} /> {kind.label}
        </span>
        <span className="chip">{difficultyLabel(challenge.difficulty)}</span>
        {solvedBefore && <span className="chip border-emerald-500/50 text-emerald-300">✓ Solved</span>}
      </div>
      <h3 className="text-lg font-bold">{challenge.title}</h3>
      <p className="text-sm leading-relaxed text-slate-300">
        <Rich text={challenge.prompt} />
      </p>
      {extraTables.length > 0 && (
        <p className="text-xs text-slate-400">
          Extra table for this challenge: {extraTables.map((t) => <code key={t.name} className="text-amber-200">{t.name}</code>)}
        </p>
      )}

      {loadError && <div className="text-sm text-rose-300">Could not load the SQL engine: {loadError}</div>}
      {!SQL && !loadError && <div className="text-sm text-slate-400">Loading SQL engine…</div>}

      <SqlEditor value={sql} onChange={setSql} onRun={run} running={!SQL} extraTables={extraTables} />

      <div className="grid grid-cols-3 gap-2">
        <button onClick={check} disabled={!SQL || !sql.trim()} className="btn col-span-2 bg-emerald-500 text-ink">
          <CheckCheck size={16} /> Check answer
        </button>
        <button onClick={() => setSql(challenge.starter || '')} className="btn-ghost" title="Reset editor">
          <RotateCcw size={16} />
        </button>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border p-3 text-sm ${
            feedback.ok ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200' : 'animate-shake border-rose-500/50 bg-rose-500/10 text-rose-200'
          }`}
        >
          {feedback.ok ? (
            <>
              <div className="font-bold">🎯 Correct!{!solvedBefore && !revealed && ` +${XP.challenge} XP`}</div>
              {feedback.note && <div className="mt-1 text-xs opacity-80">{feedback.note}</div>}
              {challenge.takeaway && (
                <div className="mt-2 text-slate-200">
                  <span className="font-semibold">Takeaway: </span>
                  <Rich text={challenge.takeaway} />
                </div>
              )}
            </>
          ) : (
            <pre className="whitespace-pre-wrap font-sans">{feedback.error || feedback.reason}</pre>
          )}
        </div>
      )}

      {result && (
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Your result</div>
          <ResultTable result={result} />
        </div>
      )}

      {!feedback?.ok && (
        <div className="space-y-2">
          {challenge.hints?.slice(0, hints).map((h, i) => (
            <div key={i} className="flex gap-2 rounded-xl bg-amber-500/10 p-2.5 text-sm text-amber-100">
              <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-300" />
              <Rich text={h} />
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {hints < (challenge.hints?.length || 0) && (
              <button onClick={() => setHints(hints + 1)} className="btn-ghost text-sm">
                <Lightbulb size={15} /> Hint {hints + 1}
              </button>
            )}
            {attempts >= 1 && feedback?.expected && (
              <button onClick={() => setShowExpected(!showExpected)} className="btn-ghost text-sm">
                <Eye size={15} /> {showExpected ? 'Hide' : 'Show'} expected output
              </button>
            )}
            {attempts >= 2 && !revealed && (
              <button
                onClick={() => {
                  setRevealed(true)
                  setSql(challenge.solution)
                }}
                className="btn-ghost text-sm text-slate-400"
              >
                Reveal solution (less XP)
              </button>
            )}
          </div>
          {showExpected && feedback?.expected && (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Expected output</div>
              <ResultTable result={feedback.expected} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

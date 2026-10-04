import { useState } from 'react'
import { ArrowRight, Repeat } from 'lucide-react'
import { allQuestions, chapterById, allChaptersLoaded } from '../data/chapters.js'
import { useProgress } from '../lib/store.jsx'
import { dueQuestions, pickQuestions, MAX_BOX } from '../lib/srs.js'
import QuestionCard from '../components/QuestionCard.jsx'
import { Bar, PageHeader } from '../components/ui.jsx'
import ContentStatus from '../components/ContentStatus.jsx'

const SESSION = 10

function ReviewInner({ ch }) {
  const chapter = ch ? chapterById(ch) : null
  const { state } = useProgress()
  const pool = allQuestions().filter((q) => !chapter || q.chapter === chapter.id)
  const [session, setSession] = useState(null)
  const [i, setI] = useState(0)
  const [results, setResults] = useState({})

  const due = dueQuestions(pool, state.questions)
  const weak = pool.filter((q) => state.questions[q.id]?.box === 0 && state.questions[q.id]?.wrong > 0)
  const unseen = pool.filter((q) => !state.questions[q.id])
  const boxes = Array.from({ length: MAX_BOX + 1 }, (_, b) => pool.filter((q) => state.questions[q.id] && state.questions[q.id].box === b).length)

  const start = () => {
    const first = due.slice(0, SESSION)
    const rest = pickQuestions(
      pool.filter((q) => !first.includes(q)),
      state.questions,
      SESSION - first.length,
    )
    setSession([...first, ...rest])
    setI(0)
    setResults({})
  }

  const title = chapter ? `Weak Spots: Ch ${chapter.id}` : 'Review'
  const back = chapter ? `/chapter/${chapter.id}` : undefined

  if (session && i >= session.length) {
    const right = Object.values(results).filter(Boolean).length
    return (
      <div>
        <PageHeader title={title} back={back} />
        <div className="card text-center">
          <div className="text-5xl">{right === session.length ? '🌟' : '💪'}</div>
          <div className="mt-2 text-3xl font-black">
            {right}/{session.length}
          </div>
          <p className="mt-1 text-sm text-slate-400">Misses drop back to box 0 and return soon. Hits move up a box and wait longer.</p>
          <button onClick={start} className="btn-primary mt-4 w-full">
            <Repeat size={16} /> Another round
          </button>
          <button onClick={() => setSession(null)} className="btn-ghost mt-2 w-full">
            Done
          </button>
        </div>
      </div>
    )
  }

  if (session) {
    const q = session[i]
    return (
      <div>
        <div className="mb-3 flex items-center gap-3">
          <button onClick={() => setSession(null)} className="text-sm text-slate-400">
            ✕
          </button>
          <Bar value={(i + (results[i] !== undefined ? 1 : 0)) / session.length} height="h-3" />
          <span className="text-xs font-bold text-slate-400">
            {i + 1}/{session.length}
          </span>
        </div>
        <div className="mb-2 text-xs text-slate-400">
          {chapterById(q.chapter).emoji} Ch {q.chapter} · box {state.questions[q.id]?.box ?? 'new'}
        </div>
        <div className="card" key={`${q.id}-${i}`}>
          <QuestionCard q={q} onAnswered={(ok) => setResults((r) => ({ ...r, [i]: ok }))} />
        </div>
        <button onClick={() => setI(i + 1)} disabled={results[i] === undefined} className="btn-primary mt-4 w-full py-3.5">
          Continue <ArrowRight size={18} />
        </button>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title={title} back={back} subtitle="Spaced repetition: missed questions come back more often" />
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="card !p-3">
          <div className="text-2xl font-black text-brand2">{due.length}</div>
          <div className="text-[11px] text-slate-400">due now</div>
        </div>
        <div className="card !p-3">
          <div className="text-2xl font-black text-rose-300">{weak.length}</div>
          <div className="text-[11px] text-slate-400">recently missed</div>
        </div>
        <div className="card !p-3">
          <div className="text-2xl font-black text-slate-300">{unseen.length}</div>
          <div className="text-[11px] text-slate-400">never seen</div>
        </div>
      </div>

      <div className="card mt-3">
        <div className="mb-2 text-sm font-bold">Memory boxes</div>
        <div className="flex h-24 items-end gap-2">
          {boxes.map((n, b) => {
            const max = Math.max(1, ...boxes)
            return (
              <div key={b} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-bold">{n}</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-brand to-brand2"
                  style={{ height: `${(n / max) * 64 + 2}px`, opacity: 0.4 + b * 0.12 }}
                />
                <span className="text-[10px] text-slate-500">{b}</span>
              </div>
            )
          })}
        </div>
        <p className="mt-2 text-[11px] text-slate-500">Box 0 = just missed (back within the session). Each correct answer moves a question up a box, and it waits longer: 4h, 1d, 3d, 7d, 14d.</p>
      </div>

      <button onClick={start} disabled={!pool.length} className="btn-primary mt-4 w-full py-3.5 text-base">
        <Repeat size={18} /> Start {SESSION}-question round
      </button>
      {!pool.length && <p className="mt-2 text-center text-sm text-slate-400">No questions yet for this chapter.</p>}
    </div>
  )
}

export default function Review(props) {
  if (!allChaptersLoaded()) return <ContentStatus label="Loading questions…" />
  return <ReviewInner {...props} />
}

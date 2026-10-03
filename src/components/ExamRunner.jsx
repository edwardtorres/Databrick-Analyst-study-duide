import { useEffect, useState } from 'react'
import { Flag, ChevronLeft, ChevronRight, Timer, ChevronDown } from 'lucide-react'
import { OptionButton, Stem, Explanation, useShuffledOptions } from './QuestionCard.jsx'
import { Bar } from './ui.jsx'

const LETTERS = 'ABCDEF'

function ExamQuestion({ q, chosen, onChoose }) {
  const options = useShuffledOptions(q)
  return (
    <div>
      <Stem q={q} />
      <div className="mt-4 space-y-2">
        {options.map((o, i) => (
          <OptionButton key={o.idx} letter={LETTERS[i]} text={o.t} state={chosen === o.idx ? 'selected' : 'idle'} onClick={() => onChoose(o.idx)} />
        ))}
      </div>
    </div>
  )
}

export function useCountdown(endsAt, onExpire) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!endsAt) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [endsAt])
  const left = endsAt ? Math.max(0, endsAt - now) : null
  useEffect(() => {
    if (endsAt && left === 0) onExpire?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left === 0, endsAt])
  return left
}

const fmtLeft = (ms) => {
  const s = Math.ceil(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h ? h + ':' : ''}${String(m).padStart(h ? 2 : 1, '0')}:${String(sec).padStart(2, '0')}`
}

// Exam-style runner: no feedback until submit, free navigation, flags.
export default function ExamRunner({ questions, answers, onAnswer, flagged = {}, onFlag, index, setIndex, endsAt, onSubmit, title }) {
  const left = useCountdown(endsAt, onSubmit)
  const q = questions[index]
  const answeredCount = questions.filter((x) => answers[x.id] !== undefined).length
  const [confirm, setConfirm] = useState(false)

  return (
    <div>
      <div className="sticky top-0 z-30 -mx-4 mb-3 bg-ink/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="text-sm font-bold">{title}</div>
          {left !== null && (
            <div className={`ml-auto flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-sm font-bold ${left < 5 * 60000 ? 'animate-pulse bg-rose-500/20 text-rose-300' : 'bg-panel2'}`}>
              <Timer size={14} /> {fmtLeft(left)}
            </div>
          )}
          <div className={`text-xs text-slate-400 ${left === null ? 'ml-auto' : ''}`}>
            {answeredCount}/{questions.length}
          </div>
        </div>
        <Bar value={answeredCount / questions.length} className="mt-2" height="h-1.5" />
        <div className="no-scrollbar mt-2 flex gap-1 overflow-x-auto">
          {questions.map((x, k) => (
            <button
              key={x.id}
              onClick={() => setIndex(k)}
              className={`relative h-7 min-w-7 shrink-0 rounded-md text-[11px] font-bold ${
                k === index ? 'bg-brand text-ink' : answers[x.id] !== undefined ? 'bg-slate-600 text-white' : 'bg-panel2 text-slate-400'
              }`}
            >
              {k + 1}
              {flagged[x.id] && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400" />}
            </button>
          ))}
        </div>
      </div>

      <div className="card" key={q.id}>
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>
            Question {index + 1} of {questions.length}
          </span>
          {onFlag && (
            <button onClick={() => onFlag(q.id)} className={`flex items-center gap-1 rounded-md px-2 py-0.5 ${flagged[q.id] ? 'bg-amber-500/20 text-amber-300' : ''}`}>
              <Flag size={13} /> {flagged[q.id] ? 'Flagged' : 'Flag'}
            </button>
          )}
        </div>
        <ExamQuestion q={q} chosen={answers[q.id]} onChoose={(idx) => onAnswer(q.id, idx)} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0} className="btn-ghost">
          <ChevronLeft size={16} /> Prev
        </button>
        {index < questions.length - 1 ? (
          <button onClick={() => setIndex(index + 1)} className="btn-primary">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={() => setConfirm(true)} className="btn bg-emerald-500 text-ink">
            Submit
          </button>
        )}
      </div>
      {index < questions.length - 1 && (
        <button onClick={() => setConfirm(true)} className="mt-2 w-full text-center text-xs text-slate-400 underline">
          Submit early
        </button>
      )}
      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6">
          <div className="card w-full max-w-sm text-center">
            <div className="text-lg font-bold">Submit answers?</div>
            <p className="mt-1 text-sm text-slate-400">
              {questions.length - answeredCount} unanswered
              {Object.values(flagged).filter(Boolean).length ? ` · ${Object.values(flagged).filter(Boolean).length} flagged` : ''}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setConfirm(false)} className="btn-ghost">
                Keep going
              </button>
              <button onClick={onSubmit} className="btn bg-emerald-500 text-ink">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Score summary, per-group breakdown, and a full answer review.
export function ExamResults({ questions, answers, groupOf, groupLabel, passPct = 0.8, children }) {
  const correct = questions.filter((q) => q.options[answers[q.id]]?.ok).length
  const pct = questions.length ? correct / questions.length : 0
  const groups = {}
  for (const q of questions) {
    const g = groupOf(q)
    groups[g] ||= { right: 0, total: 0 }
    groups[g].total++
    if (q.options[answers[q.id]]?.ok) groups[g].right++
  }
  const sorted = Object.entries(groups).sort((a, b) => a[1].right / a[1].total - b[1].right / b[1].total)
  return (
    <div className="space-y-4">
      <div className="card text-center">
        <div className="text-6xl">{pct >= passPct ? '🏆' : pct >= 0.6 ? '⚔️' : '💀'}</div>
        <div className="mt-2 text-4xl font-black">{Math.round(pct * 100)}%</div>
        <div className="text-sm text-slate-400">
          {correct} / {questions.length} correct · target {Math.round(passPct * 100)}%
        </div>
        {children}
      </div>
      <div className="card">
        <h2 className="mb-2 font-extrabold">Breakdown (weakest first)</h2>
        <div className="space-y-2">
          {sorted.map(([g, r]) => (
            <div key={g}>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">{groupLabel(g)}</span>
                <span className="font-bold">
                  {r.right}/{r.total}
                </span>
              </div>
              <Bar value={r.right / r.total} color={r.right / r.total >= passPct ? 'from-emerald-500 to-emerald-300' : r.right / r.total >= 0.6 ? 'from-amber-500 to-amber-300' : 'from-rose-600 to-rose-400'} />
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h2 className="mb-2 font-extrabold">Review answers</h2>
        <div className="space-y-2">
          {questions.map((q, k) => (
            <ReviewItem key={q.id} q={q} n={k + 1} chosen={answers[q.id]} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ReviewItem({ q, n, chosen }) {
  const [open, setOpen] = useState(false)
  const ok = q.options[chosen]?.ok
  const options = useShuffledOptions(q)
  return (
    <div className={`rounded-xl border ${ok ? 'border-emerald-500/30' : 'border-rose-500/40'}`}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-start gap-2 p-2.5 text-left text-sm">
        <span>{ok ? '✅' : chosen === undefined ? '⏭️' : '❌'}</span>
        <span className="line-clamp-2 flex-1 text-slate-200">
          {n}. {q.stem}
        </span>
        <ChevronDown size={16} className={`mt-0.5 shrink-0 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-line p-2.5">
          <Explanation q={q} options={options} chosenIdx={chosen} />
        </div>
      )}
    </div>
  )
}

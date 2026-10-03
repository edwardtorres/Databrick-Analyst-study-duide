import { useMemo, useState } from 'react'
import { CheckCircle2, XCircle, Compass } from 'lucide-react'
import { shuffled } from '../lib/shuffle.js'
import { useProgress } from '../lib/store.jsx'
import { XP } from '../lib/levels.js'
import { Rich, VerifyFlag } from './ui.jsx'

const LETTERS = 'ABCDEF'

export function useShuffledOptions(q) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => shuffled(q.options.map((o, i) => ({ ...o, idx: i }))), [q.id])
}

export function Stem({ q }) {
  return (
    <>
      {q.scenario && (
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-bold text-sky-300">
          <Compass size={14} /> Scenario Picker
        </div>
      )}
      <p className="text-[15px] leading-relaxed text-slate-100">
        <Rich text={q.stem} />
      </p>
    </>
  )
}

// Shows every option with why it's right or wrong.
export function Explanation({ q, options, chosenIdx }) {
  return (
    <div className="mt-3 space-y-2">
      {options.map((o, i) => {
        const chosen = o.idx === chosenIdx
        const tone = o.ok
          ? 'border-emerald-500/60 bg-emerald-500/10'
          : chosen
            ? 'border-rose-500/60 bg-rose-500/10'
            : 'border-line bg-ink/40'
        return (
          <div key={o.idx} className={`rounded-xl border p-3 text-sm ${tone}`}>
            <div className="flex items-start gap-2">
              {o.ok ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" />
              ) : (
                <XCircle size={18} className={`mt-0.5 shrink-0 ${chosen ? 'text-rose-400' : 'text-slate-500'}`} />
              )}
              <div>
                <div className="font-semibold text-slate-100">
                  {LETTERS[i]}. <Rich text={o.t} />
                  {chosen && <span className="ml-2 text-xs font-bold text-slate-400">(your answer)</span>}
                </div>
                <div className="mt-1 text-slate-300">
                  <Rich text={o.why} />
                </div>
              </div>
            </div>
          </div>
        )
      })}
      {q.verify && <VerifyFlag text={q.verify} />}
    </div>
  )
}

export function OptionButton({ letter, text, state, onClick, disabled }) {
  const styles = {
    idle: 'border-line bg-panel2 hover:border-slate-400',
    selected: 'border-brand bg-brand/15',
    correct: 'border-emerald-500 bg-emerald-500/15',
    wrong: 'border-rose-500 bg-rose-500/15 animate-shake',
    dim: 'border-line bg-panel2 opacity-50',
  }
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition active:scale-[0.99] ${styles[state]}`}
    >
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-ink/70 text-xs font-bold text-slate-300">
        {letter}
      </span>
      <span className="pt-0.5 text-slate-100">
        <Rich text={text} />
      </span>
    </button>
  )
}

// Practice-mode question: answer, get instant feedback + full explanation,
// and record the result for spaced repetition and XP.
export default function QuestionCard({ q, onAnswered, record = true }) {
  const { state, actions } = useProgress()
  const options = useShuffledOptions(q)
  const [chosen, setChosen] = useState(null)

  const pick = (o) => {
    if (chosen !== null) return
    setChosen(o.idx)
    if (record) {
      const stat = state.questions[q.id]
      const xp = o.ok ? (stat?.correct ? XP.correctRepeat : XP.correct) : 0
      actions.answer(q.id, !!o.ok, xp)
    }
    onAnswered?.(!!o.ok)
  }

  const answered = chosen !== null
  const correct = answered && q.options[chosen].ok

  return (
    <div>
      <Stem q={q} />
      {!answered ? (
        <div className="mt-4 space-y-2">
          {options.map((o, i) => (
            <OptionButton key={o.idx} letter={LETTERS[i]} text={o.t} state="idle" onClick={() => pick(o)} />
          ))}
        </div>
      ) : (
        <>
          <div
            className={`mt-4 rounded-xl px-3 py-2 text-sm font-bold ${
              correct ? 'bg-emerald-500/15 text-emerald-300' : 'animate-shake bg-rose-500/15 text-rose-300'
            }`}
          >
            {correct ? '✅ Correct!' : '❌ Not quite. This one will come back in Review.'}
          </div>
          <Explanation q={q} options={options} chosenIdx={chosen} />
        </>
      )}
    </div>
  )
}

import { Suspense, useState } from 'react'
import { X, ArrowRight, SkipForward } from 'lucide-react'
import { chapterById, subsectionSteps, questionById, challengeById } from '../data/chapters.js'
import { useProgress } from '../lib/store.jsx'
import { XP } from '../lib/levels.js'
import { go } from '../lib/router.js'
import LessonCard from '../components/LessonCard.jsx'
import QuestionCard from '../components/QuestionCard.jsx'
import SqlChallenge from '../components/SqlChallenge.jsx'
import { labById } from '../components/widgets.js'
import { Bar, Loading } from '../components/ui.jsx'

const STEP_LABEL = { card: '📖 Learn', question: '❓ Quiz', challenge: '💻 SQL', widget: '🧪 Lab' }

// A subsection played as a game level: cards → labs → challenges → quiz.
export default function Level({ id, sub: subId }) {
  const ch = chapterById(id)
  const sub = ch?.content?.subsections.find((s) => s.id === subId)
  const { state, actions } = useProgress()
  const [i, setI] = useState(0)
  const [answered, setAnswered] = useState({}) // step index -> correct?
  const [solved, setSolved] = useState({})
  const [finished, setFinished] = useState(false)

  if (ch?.built && !ch.content) return <Loading label="Loading chapter…" />
  if (!sub) return <div className="text-slate-400">Level not found.</div>
  const steps = subsectionSteps(sub)
  const step = steps[i]
  const key = `${ch.id}:${sub.id}`
  const subIdx = ch.content.subsections.indexOf(sub)
  const nextSub = ch.content.subsections[subIdx + 1]

  const canContinue = step?.type === 'question' ? answered[i] !== undefined : true

  const advance = () => {
    if (step.type === 'card') actions.readCard(step.id, XP.card)
    if (step.type === 'widget') actions.labDone(`visit-${step.name}`, 5)
    if (i + 1 < steps.length) {
      setI(i + 1)
      window.scrollTo(0, 0)
    } else {
      if (!state.subsections[key]) actions.setSubsection(key, true, XP.subsection)
      setFinished(true)
      window.scrollTo(0, 0)
    }
  }

  if (finished) {
    const qCount = steps.filter((s) => s.type === 'question').length
    const right = Object.values(answered).filter(Boolean).length
    return (
      <div className="flex min-h-[70dvh] flex-col items-center justify-center text-center">
        <div className="text-6xl">🏁</div>
        <h1 className="mt-3 text-2xl font-black">Level complete!</h1>
        <p className="mt-1 text-slate-300">
          {sub.emoji} {sub.title}
        </p>
        {qCount > 0 && (
          <div className="mt-4 text-4xl font-black text-brand2">
            {right}/{qCount}
            <div className="text-xs font-semibold text-slate-400">quiz questions correct</div>
          </div>
        )}
        {right < qCount && <p className="mt-2 max-w-xs text-sm text-slate-400">The ones you missed are queued in Review and will come back sooner.</p>}
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          {nextSub && (
            <button onClick={() => go(`/chapter/${ch.id}/s/${nextSub.id}`)} className="btn-primary py-3">
              Next: {nextSub.emoji} {nextSub.title} <ArrowRight size={16} />
            </button>
          )}
          {!nextSub && (
            <button onClick={() => go(`/chapter/${ch.id}/test`)} className="btn-primary py-3">
              Take the Chapter Test 🏆
            </button>
          )}
          <button onClick={() => go(`/chapter/${ch.id}`)} className="btn-ghost">
            Back to chapter
          </button>
        </div>
      </div>
    )
  }

  const Widget = step.type === 'widget' ? labById(step.name)?.component : null

  return (
    <div>
      <div className="sticky top-0 z-30 -mx-4 mb-4 flex items-center gap-3 bg-ink/95 px-4 py-3 backdrop-blur">
        <button onClick={() => go(`/chapter/${ch.id}`)} className="text-slate-400" aria-label="Exit level">
          <X size={22} />
        </button>
        <Bar value={(i + (canContinue ? 1 : 0)) / steps.length} height="h-3" />
        <span className="shrink-0 text-xs font-bold text-slate-400">
          {i + 1}/{steps.length}
        </span>
      </div>
      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-400">
        <span>
          {sub.emoji} {sub.title}
        </span>
        <span>{STEP_LABEL[step.type]}</span>
      </div>

      <div className="card" key={i}>
        {step.type === 'card' && <LessonCard card={step} />}
        {step.type === 'question' && (
          <QuestionCard q={questionById(step.id)} onAnswered={(ok) => setAnswered((a) => ({ ...a, [i]: ok }))} />
        )}
        {step.type === 'challenge' && (
          <SqlChallenge challenge={challengeById(step.id)} onSolved={() => setSolved((s) => ({ ...s, [i]: true }))} />
        )}
        {Widget && (
          <Suspense fallback={<Loading label="Loading lab…" />}>
            <Widget />
          </Suspense>
        )}
      </div>

      <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+4.25rem)] z-20 mt-4">
        {step.type === 'challenge' && !solved[i] ? (
          <button onClick={advance} className="btn-ghost w-full py-3">
            <SkipForward size={16} /> Skip for now (find it later in SQL Arena)
          </button>
        ) : (
          <button onClick={advance} disabled={!canContinue} className="btn-primary w-full py-3.5 text-base">
            {i + 1 < steps.length ? 'Continue' : 'Finish level'} <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Trophy } from 'lucide-react'
import { chapterById } from '../data/chapters.js'
import { useProgress } from '../lib/store.jsx'
import { shuffled } from '../lib/shuffle.js'
import { XP } from '../lib/levels.js'
import { payableCorrect } from '../lib/bossRewards.js'
import { dayKey } from '../lib/dates.js'
import { PageHeader } from '../components/ui.jsx'
import ExamRunner, { ExamResults } from '../components/ExamRunner.jsx'
import { go } from '../lib/router.js'

const TEST_SIZE = 12
const PASS = 0.8

// Round-robin across subsections so every topic is represented.
function buildTest(content) {
  const bySub = content.subsections.map((s) => shuffled(content.questions.filter((q) => q.sub === s.id)))
  const out = []
  let k = 0
  while (out.length < Math.min(TEST_SIZE, content.questions.length)) {
    const bucket = bySub[k % bySub.length]
    if (bucket.length) out.push(bucket.pop())
    k++
  }
  return shuffled(out)
}

export default function ChapterTest({ id }) {
  const ch = chapterById(id)
  const { state, actions } = useProgress()
  const [qs, setQs] = useState(null)
  const [answers, setAnswers] = useState({})
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [xpNote, setXpNote] = useState(null)

  if (!ch?.content) return <PageHeader title="No test yet" back={`/chapter/${id}`} />
  const prev = state.tests[ch.id]

  const start = () => {
    setQs(buildTest(ch.content))
    setAnswers({})
    setIndex(0)
    setDone(false)
  }

  const submit = () => {
    const correct = qs.filter((q) => q.options[answers[q.id]]?.ok).length
    const score = correct / qs.length
    const passed = score >= PASS
    qs.forEach((q) => answers[q.id] !== undefined && actions.answer(q.id, !!q.options[answers[q.id]].ok, 0))
    const correctIds = qs.filter((q) => q.options[answers[q.id]]?.ok).map((q) => q.id)
    const paid = payableCorrect({ correctIds, ledger: state.testXp, today: dayKey() })
    setXpNote(
      paid.newIds.length < correctIds.length
        ? `${correctIds.length - paid.newIds.length} correct answer(s) already earned XP today, so they paid 0 this time.`
        : null,
    )
    actions.testDone(ch.id, score, passed, paid.newIds.length * XP.testPerCorrect + (passed && !prev?.passed ? XP.testPass : 0), paid.ledger)
    setDone(true)
    window.scrollTo(0, 0)
  }

  if (!qs)
    return (
      <div>
        <PageHeader title="Chapter Test" back={`/chapter/${ch.id}`} subtitle={ch.title} />
        <div className="card text-center">
          <Trophy size={48} className="mx-auto text-amber-300" />
          <p className="mt-3 text-sm text-slate-300">
            {Math.min(TEST_SIZE, ch.content.questions.length)} questions drawn from every level. No feedback until you submit, just like the real exam. Pass at{' '}
            {PASS * 100}% for a +{XP.testPass} XP trophy bonus.
          </p>
          {prev && (
            <p className="mt-2 text-xs text-slate-400">
              Best: {Math.round(prev.best * 100)}% · Last: {Math.round(prev.last * 100)}% · Attempts: {prev.attempts}
              {prev.passed && ' · 🏆 passed'}
            </p>
          )}
          <button onClick={start} className="btn-primary mt-4 w-full py-3">
            Start test
          </button>
        </div>
      </div>
    )

  if (done) {
    const subTitle = (sid) => ch.content.subsections.find((s) => s.id === sid)?.title || sid
    return (
      <div>
        <PageHeader title="Test results" back={`/chapter/${ch.id}`} subtitle={ch.title} />
        <ExamResults questions={qs} answers={answers} groupOf={(q) => q.sub} groupLabel={subTitle} passPct={PASS}>
          {xpNote && <p className="mt-2 text-xs text-slate-400">{xpNote}</p>}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={start} className="btn-ghost">
              Retake
            </button>
            <button onClick={() => go(`/review/${ch.id}`)} className="btn-primary">
              Drill weak spots
            </button>
          </div>
        </ExamResults>
      </div>
    )
  }

  return (
    <ExamRunner
      title={`Ch ${ch.id} Test`}
      questions={qs}
      answers={answers}
      onAnswer={(qid, idx) => setAnswers({ ...answers, [qid]: idx })}
      index={index}
      setIndex={setIndex}
      onSubmit={submit}
    />
  )
}

import { useMemo, useState } from 'react'
import { Swords, Info } from 'lucide-react'
import { CHAPTERS, allQuestions, questionById, chapterById } from '../data/chapters.js'
import { useProgress } from '../lib/store.jsx'
import { shuffled } from '../lib/shuffle.js'
import { XP } from '../lib/levels.js'
import { EXAM } from '../data/examInfo.js'
import { bossCompletionBonus, BONUS_MIN_ANSWERED } from '../lib/bossRewards.js'
import { dayKey } from '../lib/dates.js'
import { PageHeader } from '../components/ui.jsx'
import ExamRunner, { ExamResults } from '../components/ExamRunner.jsx'

const TARGET = 0.8
const MINUTES_PER_Q = EXAM.minutes / EXAM.scoredQuestions // 2 min

// Spread questions evenly across chapters that have content.
function buildBoss() {
  const pool = allQuestions()
  const byCh = CHAPTERS.filter((c) => c.content).map((c) => shuffled(pool.filter((q) => q.chapter === c.id)))
  const n = Math.min(EXAM.scoredQuestions, pool.length)
  const out = []
  let k = 0
  while (out.length < n) {
    const b = byCh[k % byCh.length]
    if (b.length) out.push(b.pop())
    k++
  }
  return shuffled(out).map((q) => q.id)
}

export default function Boss() {
  const { state, actions } = useProgress()
  const active = state.boss.active
  const [result, setResult] = useState(null)
  const poolSize = allQuestions().length
  const full = poolSize >= EXAM.scoredQuestions
  const builtChapters = CHAPTERS.filter((c) => c.content).length

  const qs = useMemo(() => (active ? active.ids.map(questionById).filter(Boolean) : []), [active])

  const start = () => {
    const ids = buildBoss()
    const minutes = full ? EXAM.minutes : Math.round(ids.length * MINUTES_PER_Q)
    actions.setBossActive({ ids, answers: {}, flagged: {}, index: 0, startedAt: Date.now(), endsAt: Date.now() + minutes * 60000 })
    setResult(null)
  }

  const update = (patch) => actions.setBossActive({ ...active, ...patch })

  const submit = () => {
    if (!active) return
    const { answers } = active
    const correct = qs.filter((q) => q.options[answers[q.id]]?.ok).length
    const byChapter = {}
    for (const q of qs) {
      byChapter[q.chapter] ||= { right: 0, total: 0 }
      byChapter[q.chapter].total++
      if (q.options[answers[q.id]]?.ok) byChapter[q.chapter].right++
    }
    qs.forEach((q) => answers[q.id] !== undefined && actions.answer(q.id, !!q.options[answers[q.id]].ok, 0))
    const res = {
      date: Date.now(),
      score: correct / qs.length,
      correct,
      total: qs.length,
      full,
      minutesUsed: Math.round((Math.min(Date.now(), active.endsAt) - active.startedAt) / 60000),
      byChapter,
    }
    const answered = qs.filter((q) => answers[q.id] !== undefined).length
    const today = dayKey()
    const { bonus, reason } = bossCompletionBonus({ answered, total: qs.length, full, lastBonusDay: state.boss.lastBonusDay, today })
    setResult({ qs, answers, res, bonus, bonusReason: reason })
    actions.bossDone(res, correct * XP.bossPerCorrect + bonus, bonus ? today : null)
    window.scrollTo(0, 0)
  }

  if (result)
    return (
      <div>
        <PageHeader title="Boss Battle results" />
        <ExamResults
          questions={result.qs}
          answers={result.answers}
          groupOf={(q) => q.chapter}
          groupLabel={(c) => {
            const ch = chapterById(c)
            return `${ch.emoji} ${ch.id}. ${ch.title}`
          }}
          passPct={TARGET}
        >
          <p className="mt-2 text-xs text-slate-400">Time used: {result.res.minutesUsed} min</p>
          <p className="mt-1 text-xs text-slate-400">
            {result.bonus
              ? `Completion bonus: +${result.bonus} XP`
              : result.bonusReason === 'daily'
                ? 'Completion bonus already earned today. Come back tomorrow.'
                : `No completion bonus: answer at least ${BONUS_MIN_ANSWERED * 100}% of questions to earn it.`}
          </p>
          <button onClick={() => setResult(null)} className="btn-primary mt-4 w-full">
            Back to Boss lobby
          </button>
        </ExamResults>
      </div>
    )

  if (active && qs.length)
    return (
      <ExamRunner
        title="⚔️ Boss Battle"
        questions={qs}
        answers={active.answers}
        onAnswer={(qid, idx) => update({ answers: { ...active.answers, [qid]: idx } })}
        flagged={active.flagged}
        onFlag={(qid) => update({ flagged: { ...active.flagged, [qid]: !active.flagged[qid] } })}
        index={Math.min(active.index, qs.length - 1)}
        setIndex={(i) => update({ index: i })}
        endsAt={active.endsAt}
        onSubmit={submit}
      />
    )

  const history = [...state.boss.history].reverse()

  return (
    <div>
      <PageHeader title="Boss Battle" subtitle="Timed mock exam" />
      <div className="card relative overflow-hidden text-center">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-600/30 via-transparent to-fuchsia-600/20" />
        <Swords size={52} className="relative mx-auto text-rose-300" />
        <h2 className="relative mt-2 text-xl font-black">Face the Exam Boss</h2>
        <p className="relative mt-1 text-sm text-slate-300">
          {EXAM.scoredQuestions} questions · {EXAM.minutes}-minute timer · no feedback until the end · scored per section.
        </p>
        {!full && (
          <div className="relative mt-3 flex gap-2 rounded-xl bg-sky-500/10 p-2.5 text-left text-xs text-sky-200">
            <Info size={16} className="mt-0.5 shrink-0" />
            <span>
              {builtChapters} of 9 chapters are built, so the bank has {poolSize} questions. Until it reaches {EXAM.scoredQuestions}, the Boss is a <strong>mini-boss</strong>:{' '}
              {Math.min(poolSize, EXAM.scoredQuestions)} questions at the real exam's pace (2 min each). It becomes a full 45-question boss as chapters are added.
            </span>
          </div>
        )}
        <button onClick={start} className="btn relative mt-4 w-full bg-gradient-to-r from-rose-500 to-fuchsia-500 py-3.5 text-base text-white">
          ⚔️ Start {full ? 'Boss Battle' : 'Mini-Boss'}
        </button>
        <p className="relative mt-2 text-[11px] text-slate-500">Progress is saved if you close the app. The timer keeps running.</p>
      </div>

      {history.length > 0 && (
        <div className="card mt-4">
          <h2 className="mb-2 font-extrabold">Battle log</h2>
          <div className="space-y-1.5">
            {history.map((h) => (
              <div key={h.date} className="flex items-center justify-between rounded-lg bg-ink/50 px-3 py-2 text-sm">
                <span className="text-slate-400">{new Date(h.date).toLocaleDateString()}</span>
                <span className="text-xs text-slate-500">{h.full ? 'Full' : 'Mini'} · {h.total} Q</span>
                <span className={`font-black ${h.score >= TARGET ? 'text-emerald-300' : 'text-rose-300'}`}>{Math.round(h.score * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="mt-3 text-center text-[11px] text-slate-500">Aim for {TARGET * 100}%+ on mock exams before booking. Check the official exam page for the real passing score.</p>
    </div>
  )
}

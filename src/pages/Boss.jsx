import { useMemo, useState } from 'react'
import { Swords, Info } from 'lucide-react'
import { CHAPTERS, allQuestions, questionById, chapterById, allChaptersLoaded } from '../data/chapters.js'
import { useProgress } from '../lib/store.jsx'
import { shuffled } from '../lib/shuffle.js'
import { XP } from '../lib/levels.js'
import { EXAM, SECTION_WEIGHTS } from '../data/examInfo.js'
import { bossAllocation, rescaledWeights } from '../lib/bossWeights.js'
import { bossCompletionBonus, BONUS_MIN_ANSWERED, payableCorrect } from '../lib/bossRewards.js'
import { dayKey } from '../lib/dates.js'
import { PageHeader } from '../components/ui.jsx'
import ExamRunner, { ExamResults } from '../components/ExamRunner.jsx'
import ContentStatus from '../components/ContentStatus.jsx'

const TARGET = 0.8
const MINUTES_PER_Q = EXAM.minutes / EXAM.scoredQuestions // 2 min

// Draw questions per chapter in proportion to the exam-section weights,
// rescaled to the chapters that are built.
function poolByChapter() {
  const pool = allQuestions()
  return Object.fromEntries(CHAPTERS.filter((c) => c.content).map((c) => [c.id, pool.filter((q) => q.chapter === c.id)]))
}

function buildBoss() {
  const byCh = poolByChapter()
  const counts = bossAllocation(
    Object.fromEntries(Object.entries(byCh).map(([id, qs]) => [id, qs.length])),
    EXAM.scoredQuestions,
  )
  const out = Object.entries(byCh).flatMap(([id, qs]) => shuffled(qs).slice(0, counts[id] || 0))
  return shuffled(out).map((q) => q.id)
}

function BossInner() {
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

  const update = (patch) => {
    if (Date.now() >= active.endsAt) return submit()
    actions.setBossActive({ ...active, ...patch })
  }

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
    qs.forEach((q) => answers[q.id] !== undefined && actions.answer(q.id, !!q.options[answers[q.id]]?.ok, 0))
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
    const correctIds = qs.filter((q) => q.options[answers[q.id]]?.ok).map((q) => q.id)
    const paid = payableCorrect({ correctIds, ledger: state.testXp, today })
    setResult({ qs, answers, res, bonus, bonusReason: reason, repeats: correctIds.length - paid.newIds.length })
    actions.bossDone(res, paid.newIds.length * XP.bossPerCorrect + bonus, bonus ? today : null, paid.ledger)
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
          <div className="mt-3 rounded-xl bg-ink/50 p-2.5 text-sm">
            <div className="font-bold">
              Readiness estimate: {builtChapters} of 9 chapters built
            </div>
            <div className="mt-0.5 text-xs text-slate-400">
              This score covers {builtChapters === 9 ? 'every exam section' : `only the built sections (${CHAPTERS.filter((c) => c.content).map((c) => c.id).join(', ')})`}, weighted by
              the exam guide. {builtChapters < 9 && 'Treat it as a partial readiness check.'}
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">Time used: {result.res.minutesUsed} min</p>
          <p className="mt-1 text-xs text-slate-400">
            {result.bonus
              ? `Completion bonus: +${result.bonus} XP`
              : result.bonusReason === 'daily'
                ? 'Completion bonus already earned today. Come back tomorrow.'
                : `No completion bonus: answer at least ${BONUS_MIN_ANSWERED * 100}% of questions to earn it.`}
          </p>
          {result.repeats > 0 && (
            <p className="mt-1 text-xs text-slate-400">{result.repeats} correct answer(s) already earned XP today, so they paid 0 this time.</p>
          )}
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
        <WeightTable />
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

// Shows how the next Boss will be split across built chapters.
function WeightTable() {
  const byCh = poolByChapter()
  const ids = Object.keys(byCh).map(Number)
  const w = rescaledWeights(ids)
  const counts = bossAllocation(Object.fromEntries(ids.map((id) => [id, byCh[id].length])), EXAM.scoredQuestions)
  return (
    <div className="relative mt-3 rounded-xl bg-ink/50 p-2.5 text-left text-xs">
      <div className="mb-1 font-bold text-slate-300">Question mix (weighted by exam section)</div>
      {ids.map((id) => {
        const ch = chapterById(id)
        return (
          <div key={id} className="flex justify-between gap-2 text-slate-400">
            <span className="truncate">
              {ch.emoji} {id}. {ch.short} <span className="text-slate-600">({SECTION_WEIGHTS[id]}% of exam)</span>
            </span>
            <span className="shrink-0 font-mono text-slate-200">
              {counts[id] || 0} Q · {Math.round(w[id] * 100)}%
            </span>
          </div>
        )
      })}
      <div className="mt-1 text-[10px] text-slate-500">
        {ids.length === 9
          ? 'Weights from the official exam page (checked Oct 2026). Every exam section is included.'
          : `Weights from the official exam page (checked Oct 2026), rescaled to the ${ids.length} built chapter(s). Unbuilt sections are not tested yet.`}
      </div>
    </div>
  )
}

export default function Boss(props) {
  if (!allChaptersLoaded()) return <ContentStatus label="Loading questions…" />
  return <BossInner {...props} />
}

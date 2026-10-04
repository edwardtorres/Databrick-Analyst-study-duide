import { Flame, Settings as Gear, Target, Terminal, FlaskConical, Repeat, Swords, CalendarClock, AlertTriangle, ArrowRight, Clock, ListChecks, MonitorCheck } from 'lucide-react'
import { useProgress } from '../lib/store.jsx'
import { levelInfo, DAILY_GOAL } from '../lib/levels.js'
import { CHAPTERS, allQuestions } from '../data/chapters.js'
import { EXAM } from '../data/examInfo.js'
import { chapterMastery } from '../lib/mastery.js'
import { dueQuestions } from '../lib/srs.js'
import { dayKey, daysBetween, addDays, fmtDate } from '../lib/dates.js'
import { Bar, Ring } from '../components/ui.jsx'
import { go } from '../lib/router.js'

function nextUp(state) {
  for (const ch of CHAPTERS) {
    if (!ch.content) continue
    const sub = ch.content.subsections.find((s) => !state.subsections[`${ch.id}:${s.id}`])
    if (sub) return { ch, sub }
  }
  return null
}

export default function Home() {
  const { state, actions } = useProgress()
  const lvl = levelInfo(state.xp)
  const today = dayKey()
  const todayXp = state.today.day === today ? state.today.xp : 0
  const streakAlive = state.streak.lastDay && daysBetween(state.streak.lastDay, today) <= 1
  const streak = streakAlive ? state.streak.count : 0
  const due = dueQuestions(allQuestions(), state.questions).length
  const next = nextUp(state)

  const daysLeft = state.examDate ? daysBetween(today, state.examDate) : null
  const recheckOn = state.examDate ? addDays(state.examDate, -14) : null
  const recheckNow = state.examDate && daysLeft <= 14 && daysLeft >= 0

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand2 text-lg">🏰</div>
        <div className="flex-1">
          <div className="text-lg font-black leading-none tracking-tight">Lakehouse Quest</div>
          <div className="text-xs text-slate-400">Data Analyst Associate prep</div>
        </div>
        <button onClick={() => go('/settings')} className="rounded-lg p-2 text-slate-400 hover:bg-panel2" aria-label="Settings">
          <Gear size={20} />
        </button>
      </header>

      {/* Player card */}
      <section className="card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/20 blur-3xl" />
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-brand text-2xl font-black text-ink shadow-lg">
            {lvl.level}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Level {lvl.level}</div>
            <div className="truncate text-lg font-extrabold">{lvl.title}</div>
            <Bar value={lvl.pct} className="mt-1.5" />
            <div className="mt-1 text-[11px] text-slate-400">
              {lvl.into} / {lvl.need} XP · {state.xp} total
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-ink/50 p-2.5">
            <Flame size={28} className={streak ? 'text-orange-400' : 'text-slate-600'} fill={streak ? 'currentColor' : 'none'} />
            <div>
              <div className="text-xl font-black leading-none">{streak}</div>
              <div className="text-[11px] text-slate-400">day streak · best {state.streak.best}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-ink/50 p-2.5">
            <Ring value={todayXp / DAILY_GOAL} size={42} stroke={5}>
              <Target size={14} />
            </Ring>
            <div>
              <div className="text-sm font-black leading-none">
                {Math.min(todayXp, DAILY_GOAL)}/{DAILY_GOAL}
              </div>
              <div className="text-[11px] text-slate-400">{todayXp >= DAILY_GOAL ? 'daily goal done! 🎉' : 'daily XP goal'}</div>
            </div>
          </div>
        </div>
      </section>

      {next && (
        <button onClick={() => go(`/chapter/${next.ch.id}/s/${next.sub.id}`)} className="btn-primary w-full justify-between py-3.5 text-left">
          <span>
            <span className="block text-[11px] font-bold uppercase opacity-70">Continue · Ch {next.ch.id}</span>
            <span className="block text-base">
              {next.sub.emoji} {next.sub.title}
            </span>
          </span>
          <ArrowRight />
        </button>
      )}

      {/* Quick actions */}
      <section className="grid grid-cols-2 gap-3">
        {[
          ['/sql', 'SQL Arena', 'Write & fix real queries', Terminal, 'from-emerald-500/30'],
          ['/labs', 'Labs', 'Interactive visualizers', FlaskConical, 'from-sky-500/30'],
          ['/review', `Review${due ? ` (${due})` : ''}`, due ? 'Missed questions are due' : 'Spaced repetition', Repeat, 'from-amber-500/30'],
          ['/boss', 'Boss Battle', state.boss.active ? 'Exam in progress!' : '45 Q · 90 min mock', Swords, 'from-rose-500/30'],
        ].map(([to, title, sub, Icon, grad]) => (
          <button key={to} onClick={() => go(to)} className={`card bg-gradient-to-br ${grad} to-panel text-left transition active:scale-[0.98]`}>
            <Icon size={22} className="text-white" />
            <div className="mt-2 font-bold">{title}</div>
            <div className="text-xs text-slate-300">{sub}</div>
          </button>
        ))}
      </section>

      {/* Exam overview */}
      <section className="card">
        <h2 className="flex items-center gap-2 font-extrabold">📋 The exam</h2>
        <p className="mt-0.5 text-sm text-slate-400">{EXAM.name}</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-ink/50 p-2">
            <ListChecks size={18} className="mx-auto text-brand2" />
            <div className="mt-1 text-xl font-black">{EXAM.scoredQuestions}</div>
            <div className="text-[11px] text-slate-400">scored multiple-choice</div>
          </div>
          <div className="rounded-xl bg-ink/50 p-2">
            <Clock size={18} className="mx-auto text-brand2" />
            <div className="mt-1 text-xl font-black">{EXAM.minutes}</div>
            <div className="text-[11px] text-slate-400">minutes</div>
          </div>
          <div className="rounded-xl bg-ink/50 p-2">
            <MonitorCheck size={18} className="mx-auto text-brand2" />
            <div className="mt-1 text-sm font-black leading-tight">Proctored</div>
            <div className="text-[11px] text-slate-400">online or test center</div>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Content follows the exam guide version dated <strong className="text-slate-200">{EXAM.guideVersionLabel}</strong>, one chapter per section.
        </p>
        <div className={`mt-3 flex gap-2 rounded-xl border p-2.5 text-xs ${recheckNow ? 'border-rose-500/60 bg-rose-500/10 text-rose-200' : 'border-amber-500/40 bg-amber-500/10 text-amber-200'}`}>
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>
            <strong>Re-check the official exam guide 2 weeks before your exam.</strong> Databricks updates exam guides, and features and UI names change.
            {recheckOn && (
              <>
                {' '}
                Your re-check date: <strong>{fmtDate(recheckOn)}</strong>
                {recheckNow && ' (that is now!)'}.
              </>
            )}
          </span>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <CalendarClock size={16} className="text-slate-400" />
          <span className="text-slate-300">Exam date</span>
          <input
            type="date"
            value={state.examDate || ''}
            onChange={(e) => actions.setExamDate(e.target.value)}
            className="ml-auto rounded-lg border border-line bg-ink px-2 py-1 text-sm text-slate-100 [color-scheme:dark]"
          />
        </label>
        {daysLeft !== null && (
          <div className="mt-2 text-center text-sm font-bold text-brand2">
            {daysLeft > 0 ? `${daysLeft} days to go` : daysLeft === 0 ? 'Exam day. You have got this! 💪' : 'Exam date has passed. Update it if you are retaking.'}
          </div>
        )}
      </section>

      {/* Chapter mastery */}
      <section className="card">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-extrabold">🗺️ Mastery by section</h2>
          <a href="#/chapters" className="text-xs font-semibold text-brand2">
            All chapters →
          </a>
        </div>
        <div className="space-y-2">
          {CHAPTERS.map((ch) => {
            const m = chapterMastery(ch, state)
            return (
              <button key={ch.id} onClick={() => go(`/chapter/${ch.id}`)} className="flex w-full items-center gap-2 text-left">
                <span className="w-6 text-center">{ch.emoji}</span>
                <span className={`w-28 shrink-0 truncate text-xs ${ch.built ? 'text-slate-200' : 'text-slate-500'}`}>
                  {ch.id}. {ch.short}
                </span>
                {ch.built ? (
                  <>
                    <Bar value={m} color={ch.color} />
                    <span className="w-9 text-right text-xs font-bold">{Math.round(m * 100)}%</span>
                  </>
                ) : (
                  <span className="text-[11px] italic text-slate-600">coming soon</span>
                )}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

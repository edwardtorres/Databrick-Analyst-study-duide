import { Check, Trophy, Crosshair, Lock, Terminal, FlaskConical } from 'lucide-react'
import { chapterById, subsectionSteps } from '../data/chapters.js'
import { useProgress } from '../lib/store.jsx'
import { chapterMastery, subsectionMastery } from '../lib/mastery.js'
import { Bar, PageHeader, Ring } from '../components/ui.jsx'
import { go } from '../lib/router.js'
import { LABS } from '../components/widgets.js'
import ContentStatus from '../components/ContentStatus.jsx'

export default function Chapter({ id }) {
  const ch = chapterById(id)
  const { state, actions } = useProgress()
  if (!ch) return <PageHeader title="Chapter not found" back="/chapters" />

  if (!ch.built)
    return (
      <div>
        <PageHeader title={`${ch.emoji} ${ch.title}`} back="/chapters" subtitle={`Chapter ${ch.id}`} />
        <div className="card">
          <div className="flex items-center gap-2 font-bold text-slate-300">
            <Lock size={16} /> Coming soon
          </div>
          <p className="mt-2 text-sm text-slate-400">This chapter will cover:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
            {ch.topics.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          {LABS.filter((l) => l.chapter === ch.id).map((l) => (
            <div key={l.id} className="mt-3 rounded-xl bg-ink/50 p-2.5 text-sm">
              {l.emoji} <strong>{l.title}</strong>: {l.desc}
            </div>
          ))}
        </div>
      </div>
    )

  if (!ch.content) return <ContentStatus ids={[ch.id]} />
  const c = ch.content
  const mastery = chapterMastery(ch, state)
  const done = c.subsections.filter((s) => state.subsections[`${ch.id}:${s.id}`]).length
  const test = state.tests[ch.id]
  const labs = LABS.filter((l) => l.chapter === ch.id && l.component)

  return (
    <div>
      <PageHeader title={ch.title} back="/chapters" subtitle={`Chapter ${ch.id}`} />
      <section className={`card relative overflow-hidden bg-gradient-to-br ${ch.color} !border-0 text-ink`}>
        <div className="flex items-center gap-4">
          <Ring value={mastery} size={72} stroke={7} color="#0b1020">
            <span className="text-base font-black text-ink">{Math.round(mastery * 100)}%</span>
          </Ring>
          <div className="flex-1">
            <div className="text-xs font-black uppercase tracking-widest opacity-70">Mastery</div>
            <div className="text-sm font-semibold leading-snug">{c.intro}</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-ink/20 px-2 py-0.5">
            {done}/{c.subsections.length} levels
          </span>
          <span className="rounded-full bg-ink/20 px-2 py-0.5">{c.questions.length} questions</span>
          {c.challenges.length > 0 && <span className="rounded-full bg-ink/20 px-2 py-0.5">{c.challenges.length} SQL challenges</span>}
        </div>
      </section>

      <h2 className="mb-2 mt-5 text-sm font-bold uppercase tracking-wider text-slate-400">Levels</h2>
      <div className="relative space-y-2.5">
        <div className="absolute bottom-6 left-[27px] top-6 w-0.5 bg-line" />
        {c.subsections.map((s, i) => {
          const key = `${ch.id}:${s.id}`
          const checked = !!state.subsections[key]
          const m = subsectionMastery(ch, s, state)
          const steps = subsectionSteps(s)
          return (
            <div key={s.id} className="relative flex items-center gap-3">
              <button
                onClick={() => actions.setSubsection(key, !checked, 0)}
                aria-label={checked ? 'Uncheck subsection' : 'Check off subsection'}
                className={`z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 text-2xl transition ${
                  checked ? 'border-emerald-400 bg-emerald-500/20' : 'border-line bg-panel'
                }`}
              >
                {checked ? <Check className="text-emerald-300" size={26} strokeWidth={3} /> : s.emoji}
              </button>
              <button onClick={() => go(`/chapter/${ch.id}/s/${s.id}`)} className="card flex-1 !p-3 text-left transition active:scale-[0.99]">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold">
                    {i + 1}. {s.title}
                  </div>
                  <span className="text-[11px] text-slate-400">{steps.length} steps</span>
                </div>
                <Bar value={m} color={ch.color} className="mt-2" height="h-1.5" />
              </button>
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-[11px] text-slate-500">Tap the icon on the left to check a level off yourself. Finishing a level checks it automatically.</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button onClick={() => go(`/chapter/${ch.id}/test`)} className="card bg-gradient-to-br from-amber-500/30 to-panel text-left">
          <Trophy className="text-amber-300" />
          <div className="mt-1 font-bold">Chapter Test</div>
          <div className="text-xs text-slate-300">{test ? `Best ${Math.round(test.best * 100)}%${test.passed ? ' · passed 🏆' : ''}` : '12 questions · pass at 80%'}</div>
        </button>
        <button onClick={() => go(`/review/${ch.id}`)} className="card bg-gradient-to-br from-rose-500/30 to-panel text-left">
          <Crosshair className="text-rose-300" />
          <div className="mt-1 font-bold">Weak Spots</div>
          <div className="text-xs text-slate-300">Practice what you miss most</div>
        </button>
        {c.challenges.length > 0 && (
        <button onClick={() => go('/sql')} className="card bg-gradient-to-br from-emerald-500/30 to-panel text-left">
          <Terminal className="text-emerald-300" />
          <div className="mt-1 font-bold">SQL Arena</div>
          <div className="text-xs text-slate-300">
            {c.challenges.filter((x) => state.challenges[x.id]?.solved).length}/{c.challenges.length} solved
          </div>
        </button>
        )}
        {labs.length > 0 && (
          <button onClick={() => go('/labs')} className="card bg-gradient-to-br from-sky-500/30 to-panel text-left">
            <FlaskConical className="text-sky-300" />
            <div className="mt-1 font-bold">Labs</div>
            <div className="text-xs text-slate-300">{labs.map((l) => l.emoji).join(' ')}</div>
          </button>
        )}
      </div>
    </div>
  )
}

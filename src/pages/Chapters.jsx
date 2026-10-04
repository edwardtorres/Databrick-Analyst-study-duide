import { Lock } from 'lucide-react'
import { CHAPTERS } from '../data/chapters.js'
import { useProgress } from '../lib/store.jsx'
import { chapterMastery } from '../lib/mastery.js'
import { Bar, PageHeader } from '../components/ui.jsx'
import { go } from '../lib/router.js'

export default function Chapters() {
  const { state } = useProgress()
  return (
    <div>
      <PageHeader title="Chapters" subtitle="One chapter per exam-guide section" />
      <div className="space-y-3">
        {CHAPTERS.map((ch) => {
          const m = chapterMastery(ch, state)
          const test = state.tests[ch.id]
          return (
            <button
              key={ch.id}
              onClick={() => go(`/chapter/${ch.id}`)}
              className={`card flex w-full items-center gap-3 text-left transition active:scale-[0.99] ${ch.built ? '' : 'opacity-60'}`}
            >
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${ch.color} text-2xl`}>{ch.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Chapter {ch.id}</div>
                <div className="font-bold leading-snug">{ch.title}</div>
                {ch.built ? (
                  <div className="mt-1.5 flex items-center gap-2">
                    <Bar value={m} color={ch.color} />
                    <span className="text-xs font-bold">{Math.round(m * 100)}%</span>
                    {test?.passed && <span title="Chapter test passed">🏆</span>}
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <Lock size={12} /> Coming soon
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

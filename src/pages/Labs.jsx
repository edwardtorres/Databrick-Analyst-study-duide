import { Lock } from 'lucide-react'
import { LABS } from '../components/widgets.js'
import { PageHeader } from '../components/ui.jsx'
import { go } from '../lib/router.js'

export default function Labs() {
  return (
    <div>
      <PageHeader title="Labs" subtitle="Hands-on visualizers. Learn by poking things." back="/" />
      <div className="space-y-3">
        {LABS.map((l) => (
          <button
            key={l.id}
            disabled={!l.component}
            onClick={() => go(`/lab/${l.id}`)}
            className={`card flex w-full items-center gap-3 text-left transition active:scale-[0.99] ${l.component ? '' : 'opacity-50'}`}
          >
            <span className="text-3xl">{l.emoji}</span>
            <span className="flex-1">
              <span className="block font-bold">{l.title}</span>
              <span className="block text-xs text-slate-400">{l.desc}</span>
            </span>
            {l.component ? (
              <span className="chip">Ch {l.chapter}</span>
            ) : (
              <span className="chip">
                <Lock size={11} /> Ch {l.chapter}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

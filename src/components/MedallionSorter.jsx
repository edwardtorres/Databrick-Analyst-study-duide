import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useProgress } from '../lib/store.jsx'
import { LAYERS, CARDS, sanitizeMedallion, medallionScore } from '../lib/medallionSorter.js'
import { VerifyFlag } from './ui.jsx'

const LAYER_STYLE = {
  bronze: 'border-amber-700/60 bg-amber-900/20',
  silver: 'border-slate-400/50 bg-slate-400/10',
  gold: 'border-yellow-400/60 bg-yellow-400/10',
}

export default function MedallionSorter() {
  const { state, actions } = useProgress()
  const lab = sanitizeMedallion(state.labState?.medallionSorter)
  const score = medallionScore(lab)
  const [sel, setSel] = useState(null)

  useEffect(() => {
    if (score.allRight) actions.labDone('ms-all', 15)
  }, [score.allRight, actions])

  const place = (layer) => {
    if (!sel) return
    actions.setLabState('medallionSorter', { placed: { ...lab.placed, [sel]: layer } })
    setSel(null)
  }
  const unplaced = CARDS.filter((c) => !lab.placed[c.id])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">🥇 Medallion Sorter</h3>
        <div className="flex items-center gap-2">
          <span className="chip">
            Correct {score.correct}/{score.total}
          </span>
          <button onClick={() => (actions.setLabState('medallionSorter', null), setSel(null))} className="chip text-slate-300" aria-label="Reset lab">
            <RotateCcw size={11} /> Reset
          </button>
        </div>
      </div>
      <p className="text-sm text-slate-300">Tap a card, then tap the layer it belongs in. Tap a placed card to move it.</p>

      {unplaced.length > 0 && (
        <div className="space-y-1.5" data-testid="ms-cards">
          {unplaced.map((c) => (
            <button
              key={c.id}
              onClick={() => setSel(sel === c.id ? null : c.id)}
              aria-pressed={sel === c.id}
              className={`w-full rounded-xl border p-2.5 text-left text-sm ${sel === c.id ? 'border-brand bg-brand/10' : 'border-line bg-panel2'}`}
            >
              {c.text}
            </button>
          ))}
        </div>
      )}

      <div className="sticky bottom-16 z-10 grid grid-cols-3 gap-1.5 rounded-xl bg-ink/90 p-1.5 backdrop-blur">
        {Object.entries(LAYERS).map(([id, l]) => (
          <button key={id} onClick={() => place(id)} disabled={!sel} aria-label={`Place in ${l.name}`} className={`rounded-lg border py-2 text-sm font-bold disabled:opacity-40 ${LAYER_STYLE[id]}`}>
            {l.emoji} {l.name}
          </button>
        ))}
      </div>

      {Object.entries(LAYERS).map(([id, l]) => {
        const here = CARDS.filter((c) => lab.placed[c.id] === id)
        return (
          <div key={id} className={`rounded-xl border p-2.5 ${LAYER_STYLE[id]}`} data-testid={`layer-${id}`}>
            <div className="font-bold">
              {l.emoji} {l.name} <span className="text-xs font-normal text-slate-400">· {l.blurb}</span>
            </div>
            {!here.length && <div className="mt-1 text-xs text-slate-500">Nothing here yet.</div>}
            <div className="mt-1.5 space-y-1.5">
              {here.map((c) => {
                const ok = c.answer === id
                return (
                  <button key={c.id} onClick={() => setSel(c.id)} aria-pressed={sel === c.id} className={`w-full rounded-lg border p-2 text-left text-[13px] ${sel === c.id ? 'border-brand' : ok ? 'border-emerald-500/50' : 'border-rose-500/60'} bg-ink/40`}>
                    <div>
                      {ok ? '✅' : '❌'} {c.text}
                    </div>
                    <div className={`mt-0.5 text-[12px] ${ok ? 'text-emerald-200' : 'text-rose-200'}`}>
                      {ok ? c.why : `Belongs in ${LAYERS[c.answer].name}. ${c.why}`}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {score.allRight && <div className="rounded-xl bg-emerald-500/15 p-2.5 text-sm font-bold text-emerald-200">🎉 All {score.total} placed correctly.</div>}
      <VerifyFlag text="Medallion layers are a convention, not a rule. Teams draw the silver/gold line differently (for example, where data vault or ML features live)." />
    </div>
  )
}

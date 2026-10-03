import { Lightbulb } from 'lucide-react'
import { Rich, VerifyFlag } from './ui.jsx'

export default function LessonCard({ card }) {
  return (
    <div>
      <div className="mb-1 text-xs font-bold uppercase tracking-widest text-brand2">Lesson card</div>
      <h3 className="text-lg font-extrabold">{card.title}</h3>
      <div className="mt-2 space-y-2.5 text-[15px] leading-relaxed text-slate-300">
        {card.body.map((p, i) => (
          <p key={i}>
            <Rich text={p} />
          </p>
        ))}
      </div>
      {card.code && (
        <pre className="mt-3 overflow-x-auto rounded-xl bg-ink p-3 font-mono text-[12px] leading-relaxed text-emerald-100">{card.code}</pre>
      )}
      {card.tip && (
        <div className="mt-3 flex gap-2 rounded-xl bg-sky-500/10 p-2.5 text-sm text-sky-100">
          <Lightbulb size={16} className="mt-0.5 shrink-0 text-sky-300" />
          <span>
            <strong>Memory hook: </strong>
            {card.tip}
          </span>
        </div>
      )}
      {card.verify && <VerifyFlag text={card.verify} />}
    </div>
  )
}

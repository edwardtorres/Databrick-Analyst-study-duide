import { AlertTriangle, ChevronLeft } from 'lucide-react'
import { go } from '../lib/router.js'
import { useProgress } from '../lib/store.jsx'

// Renders **bold** and `code` inline markup.
export function Rich({ text, className = '' }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**'))
          return (
            <strong key={i} className="font-semibold text-white">
              {p.slice(2, -2)}
            </strong>
          )
        if (p.startsWith('`') && p.endsWith('`'))
          return (
            <code key={i} className="rounded bg-ink/70 px-1 py-0.5 font-mono text-[0.85em] text-amber-200">
              {p.slice(1, -1)}
            </code>
          )
        return <span key={i}>{p}</span>
      })}
    </span>
  )
}

export function Bar({ value, className = '', color = 'from-brand to-brand2', height = 'h-2' }) {
  return (
    <div className={`${height} w-full overflow-hidden rounded-full bg-ink/80 ${className}`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
        style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%` }}
      />
    </div>
  )
}

export function Ring({ value, size = 56, stroke = 6, children, color = '#ff8a3d' }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#263257" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, value))}
          style={{ transition: 'stroke-dashoffset .7s' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-xs font-bold">{children}</div>
    </div>
  )
}

export function VerifyFlag({ text }) {
  return (
    <div className="mt-3 flex gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-200">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <span>
        <strong>Verify in Databricks docs:</strong> {text || 'this detail may have changed since the Oct 2025 exam guide.'}
      </span>
    </div>
  )
}

export function PageHeader({ title, back, right, subtitle }) {
  return (
    <div className="mb-4 flex items-start gap-2">
      {back && (
        <button onClick={() => go(back)} className="-ml-1 rounded-lg p-1.5 text-slate-300 hover:bg-panel2" aria-label="Back">
          <ChevronLeft size={22} />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-extrabold leading-tight tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export function Toasts() {
  const { toasts } = useProgress()
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={`${t.id}-${t.text}`}
          className={`animate-pop rounded-full px-4 py-1.5 text-sm font-extrabold shadow-xl ${
            t.kind === 'level'
              ? 'bg-gradient-to-r from-fuchsia-500 to-amber-400 text-ink'
              : t.kind === 'info'
                ? 'bg-panel2 text-slate-100'
                : 'bg-gradient-to-r from-brand to-brand2 text-ink'
          }`}
        >
          {t.kind === 'level' ? '🎉 ' : t.kind === 'xp' ? '⚡ ' : ''}
          {t.text}
        </div>
      ))}
    </div>
  )
}

export const difficultyLabel = (d) => ['', 'Easy', 'Medium', 'Hard'][d] || ''

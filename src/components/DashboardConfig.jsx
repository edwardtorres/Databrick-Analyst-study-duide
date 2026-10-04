import { RotateCcw, SlidersHorizontal, CalendarClock, BellRing, Share2, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useProgress } from '../lib/store.jsx'
import { BRIEF, DATASET_SQL, ALERT_SQL, OPTIONS, sanitizeDashboardConfig, simulate } from '../lib/dashboardLab.js'

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-line bg-ink/40 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold">
        <Icon size={15} className="text-amber-300" /> {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="block text-xs text-slate-400">
      {label}
      <select
        value={String(value)}
        onChange={(e) => {
          const opt = options.find((o) => String(o.id) === e.target.value)
          onChange(opt.id)
        }}
        className="mt-0.5 w-full rounded-lg border border-line bg-ink p-2 text-sm text-slate-100"
      >
        {options.map((o) => (
          <option key={String(o.id)} value={String(o.id)}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function DashboardConfig() {
  const { state, actions } = useProgress()
  const cfg = sanitizeDashboardConfig(state.labState?.dashboardConfig)
  const set = (key) => (v) => actions.setLabState('dashboardConfig', { ...cfg, [key]: v })
  const [ran, setRan] = useState(false)
  const resultsRef = useRef(null)
  const result = simulate(cfg)

  useEffect(() => {
    if (ran && result.complete) actions.labDone('dash-config', 25)
  }, [ran, result.complete, actions])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">🛠️ Dashboard Config</h3>
        <button
          onClick={() => {
            if (confirm('Reset the Dashboard Config lab? XP you earned is kept.')) {
              actions.setLabState('dashboardConfig', null)
              setRan(false)
            }
          }}
          className="chip text-slate-300"
          aria-label="Reset lab"
        >
          <RotateCcw size={11} /> Reset
        </button>
      </div>
      <div className="rounded-xl bg-amber-500/10 p-2.5 text-sm text-amber-50">
        <div className="mb-1 font-bold">The brief</div>
        <ul className="list-disc space-y-0.5 pl-4 text-[13px]">
          {BRIEF.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>

      <Section icon={SlidersHorizontal} title="Dataset & region picker">
        <pre className="overflow-x-auto rounded-lg bg-ink p-2 font-mono text-[11px] text-emerald-100">{DATASET_SQL}</pre>
        <Select label="Region picker widget is wired to" value={cfg.binding} options={OPTIONS.binding} onChange={set('binding')} />
        <Select label=":region parameter default" value={cfg.paramDefault} options={OPTIONS.paramDefault} onChange={set('paramDefault')} />
      </Section>

      <Section icon={CalendarClock} title="Refresh schedule">
        <Select label="Schedule (published dashboard)" value={cfg.schedule} options={OPTIONS.schedule} onChange={set('schedule')} />
      </Section>

      <Section icon={BellRing} title="SQL alert">
        <pre className="overflow-x-auto rounded-lg bg-ink p-2 font-mono text-[11px] text-emerald-100">{ALERT_SQL}</pre>
        <div className="grid grid-cols-[auto_1fr] items-end gap-2">
          <div className="pb-2 font-mono text-xs text-slate-300">today_revenue</div>
          <div className="grid grid-cols-2 gap-2">
            <Select label="Operator" value={cfg.operator} options={OPTIONS.operator} onChange={set('operator')} />
            <Select label="Threshold" value={cfg.threshold} options={OPTIONS.threshold} onChange={set('threshold')} />
          </div>
        </div>
        <Select label="Notification destination" value={cfg.destination} options={OPTIONS.destination} onChange={set('destination')} />
      </Section>

      <Section icon={Share2} title="Publish & share">
        <Select label="Publish with" value={cfg.credentials} options={OPTIONS.credentials} onChange={set('credentials')} />
        <Select label="Share with (dashboard permission)" value={cfg.shareWith} options={OPTIONS.shareWith} onChange={set('shareWith')} />
      </Section>

      <button
        onClick={() => {
          setRan(true)
          requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
        }}
        className="btn-primary w-full py-3"
      >
        <Play size={16} /> Simulate the morning
      </button>

      {ran && (
        <div ref={resultsRef} className="scroll-mt-4 space-y-2">
          {result.checks.map((c) => (
            <div key={c.id} className={`rounded-xl border p-2.5 text-sm ${c.ok ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-rose-500/40 bg-rose-500/10'}`}>
              <div className="font-semibold">
                {c.ok ? (c.note === 'costly' ? '🟡' : '✅') : '❌'} {c.label}
              </div>
              <div className="mt-0.5 text-[13px] text-slate-300">{c.text}</div>
            </div>
          ))}
          <div className={`rounded-xl p-3 text-center text-sm font-bold ${result.complete ? 'bg-emerald-500/15 text-emerald-200' : 'bg-panel2 text-slate-300'}`}>
            {result.complete ? '🏆 Every requirement met (+25 XP)' : 'Not all requirements are met yet. Adjust and simulate again.'}
          </div>
          <p className="text-[11px] text-slate-500">
            Simplified: real publishing also offers a service-principal publisher, schedules support cron and multiple subscribers, and alert conditions can aggregate a
            column (SUM, AVERAGE). The choices here match the current docs.
          </p>
        </div>
      )}
    </div>
  )
}

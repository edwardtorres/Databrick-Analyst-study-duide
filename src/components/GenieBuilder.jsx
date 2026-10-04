import { useEffect, useState } from 'react'
import { Sparkles, RotateCcw, Database, Server, MessageSquareText, ShieldCheck, ListChecks, Send } from 'lucide-react'
import { useProgress } from '../lib/store.jsx'
import {
  SCENARIO,
  WAREHOUSES,
  TABLES,
  INSTRUCTION_SNIPPETS,
  SAMPLE_QUESTIONS,
  TRUSTED_CANDIDATES,
  SIM_QUESTIONS,
  sanitizeGenieConfig,
  scoreGenie,
  simulate,
} from '../lib/genieLab.js'

const OUTCOME = {
  trusted: { label: '✅ Verified answer', cls: 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200' },
  success: { label: '✅ Correct', cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' },
  partial: { label: '⚠️ Shaky', cls: 'border-amber-500/50 bg-amber-500/10 text-amber-100' },
  fail: { label: '❌ Failed', cls: 'border-rose-500/50 bg-rose-500/10 text-rose-200' },
  blocked: { label: '🛡️ Declined', cls: 'border-sky-500/50 bg-sky-500/10 text-sky-200' },
}

function Section({ icon: Icon, title, children, hint }) {
  return (
    <div className="rounded-xl border border-line bg-ink/40 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold">
        <Icon size={15} className="text-violet-300" /> {title}
      </div>
      {hint && <p className="-mt-1 mb-2 text-[11px] text-slate-500">{hint}</p>}
      {children}
    </div>
  )
}

const toggle = (arr, id) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id])

export default function GenieBuilder() {
  const { state, actions } = useProgress()
  const cfg = sanitizeGenieConfig(state.labState?.genieBuilder)
  const save = (patch) => actions.setLabState('genieBuilder', { ...cfg, ...patch })
  const [scored, setScored] = useState(false)
  const [chat, setChat] = useState([])
  const score = scoreGenie(cfg)

  useEffect(() => {
    if (scored && score.total >= 90) actions.labDone('genie-90', 25)
  }, [scored, score.total, actions])

  const ask = (q) => {
    const r = simulate(cfg, q.id)
    const next = [...chat.filter((c) => c.id !== q.id), { id: q.id, q: q.text, ...r }]
    setChat(next)
    if (new Set(next.map((c) => c.id)).size === SIM_QUESTIONS.length) actions.labDone('genie-sim', 10)
  }

  const appendSnippet = (text) => save({ instructions: cfg.instructions.trim() ? `${cfg.instructions.trim()}\n${text}` : text })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">🧞 Genie Space Builder</h3>
        <button
          onClick={() => {
            if (confirm('Reset the Genie Space Builder? Your configuration will be cleared. XP you earned is kept.')) {
              actions.setLabState('genieBuilder', null)
              setChat([])
              setScored(false)
            }
          }}
          className="chip text-slate-300"
          aria-label="Reset lab"
        >
          <RotateCcw size={11} /> Reset
        </button>
      </div>
      <div className="rounded-xl bg-violet-500/10 p-2.5 text-sm text-violet-100">
        <strong>Mission:</strong> {SCENARIO} Score 90+ for +25 XP, then ask all 5 test questions.
      </div>

      <Section icon={Server} title="SQL warehouse">
        <div className="grid gap-1.5">
          {WAREHOUSES.map((w) => (
            <label key={w.id} className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-sm ${cfg.warehouse === w.id ? 'border-brand bg-brand/10' : 'border-line'}`}>
              <input type="radio" name="genie-wh" checked={cfg.warehouse === w.id} onChange={() => save({ warehouse: w.id })} className="accent-orange-500" />
              {w.label}
            </label>
          ))}
        </div>
      </Section>

      <Section icon={Database} title="Data: Unity Catalog tables & views" hint="Pick only what your audience needs. Fewer, well-described tables give better answers.">
        <div className="grid gap-1.5">
          {TABLES.map((t) => (
            <label key={t.id} className={`flex items-start gap-2 rounded-lg border px-2.5 py-2 ${cfg.tables.includes(t.id) ? 'border-brand bg-brand/10' : 'border-line'}`}>
              <input type="checkbox" checked={cfg.tables.includes(t.id)} onChange={() => save({ tables: toggle(cfg.tables, t.id) })} className="mt-1 accent-orange-500" />
              <span>
                <span className="block font-mono text-xs text-slate-100">{t.name}</span>
                <span className="block text-[11px] text-slate-400">{t.note}</span>
              </span>
            </label>
          ))}
        </div>
      </Section>

      <Section icon={MessageSquareText} title="Instructions" hint="Plain-language rules: business definitions, calendars, vocabulary. Tap a snippet to add it, or type your own.">
        <textarea
          value={cfg.instructions}
          onChange={(e) => save({ instructions: e.target.value })}
          rows={5}
          placeholder="e.g. Revenue means SUM(net_revenue)…"
          className="w-full rounded-lg border border-line bg-ink p-2 text-sm text-slate-100 outline-none focus:border-brand/70"
        />
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {INSTRUCTION_SNIPPETS.map((s) => (
            <button key={s.id} onClick={() => appendSnippet(s.text)} className="rounded-lg bg-panel2 px-2 py-1 text-left text-[11px] text-slate-200">
              + {s.text}
            </button>
          ))}
        </div>
      </Section>

      <Section icon={ListChecks} title="Sample questions" hint="Shown to users as starters.">
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_QUESTIONS.map((q) => (
            <button
              key={q.id}
              onClick={() => save({ samples: toggle(cfg.samples, q.id) })}
              className={`rounded-full border px-2.5 py-1 text-xs ${cfg.samples.includes(q.id) ? 'border-brand bg-brand/15 text-white' : 'border-line text-slate-300'}`}
            >
              {cfg.samples.includes(q.id) ? '✓ ' : '+ '}
              {q.text}
            </button>
          ))}
        </div>
      </Section>

      <Section icon={ShieldCheck} title="Trusted assets" hint="Parameterized example queries or Unity Catalog SQL functions. Answers that use them are shown as verified answers.">
        <div className="grid gap-1.5">
          {TRUSTED_CANDIDATES.map((a) => (
            <label key={a.id} className={`flex items-start gap-2 rounded-lg border px-2.5 py-2 ${cfg.trusted.includes(a.id) ? 'border-brand bg-brand/10' : 'border-line'}`}>
              <input type="checkbox" checked={cfg.trusted.includes(a.id)} onChange={() => save({ trusted: toggle(cfg.trusted, a.id) })} className="mt-1 accent-orange-500" />
              <span>
                <span className="block break-all font-mono text-[11px] text-slate-100">{a.name}</span>
                <span className="block text-[11px] text-slate-400">{a.note}</span>
              </span>
            </label>
          ))}
        </div>
      </Section>

      <button onClick={() => setScored(true)} className="btn-primary w-full py-3">
        <Sparkles size={16} /> Score my space
      </button>

      {scored && (
        <div className="rounded-xl border border-line p-3">
          <div className="flex items-baseline justify-between">
            <div className="font-bold">Space quality</div>
            <div className={`text-2xl font-black ${score.total >= 90 ? 'text-emerald-300' : score.total >= 60 ? 'text-amber-300' : 'text-rose-300'}`}>{score.total}/100</div>
          </div>
          <div className="mt-2 space-y-2">
            {score.sections.map((s) => (
              <div key={s.id}>
                <div className="flex justify-between text-xs font-semibold">
                  <span>{s.label}</span>
                  <span>
                    {s.points}/{s.max}
                  </span>
                </div>
                {s.notes.map((n, i) => (
                  <div key={i} className={`text-[11px] ${n.ok ? 'text-emerald-300/90' : 'text-rose-300/90'}`}>
                    {n.ok ? '✓' : '✗'} {n.text}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Scores update live as you change the setup.</p>
        </div>
      )}

      <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-3">
        <div className="mb-2 text-sm font-bold">💬 Try it: ask your space</div>
        <div className="flex flex-wrap gap-1.5">
          {SIM_QUESTIONS.map((q) => (
            <button key={q.id} onClick={() => ask(q)} className="inline-flex items-center gap-1 rounded-full bg-panel2 px-2.5 py-1 text-left text-xs">
              <Send size={11} /> {q.text}
            </button>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          {chat.map((c) => (
            <div key={c.id} className="space-y-1">
              <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-brand/20 px-3 py-1.5 text-sm">{c.q}</div>
              <div className={`max-w-[92%] rounded-2xl rounded-bl-sm border px-3 py-2 text-sm ${OUTCOME[c.outcome].cls}`}>
                <div className="text-xs font-bold">{OUTCOME[c.outcome].label}</div>
                {c.text}
              </div>
            </div>
          ))}
          {!chat.length && <p className="text-xs text-slate-500">Answers reflect your current setup. Change the setup and ask again to see the difference.</p>}
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          Simulated answers for learning. Real Genie (now called Genie Agents in the product) depends on your data and metadata. Settings here match the docs: Pro or Serverless warehouse, focused tables (five or fewer recommended, max 50), trusted assets = parameterized queries or UC functions.
        </p>
      </div>
    </div>
  )
}

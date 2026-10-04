import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useProgress } from '../lib/store.jsx'
import { PROCESS, GRAINS, TABLES, FIXED_FACT_KEYS, COLUMNS, SNOWFLAKE, sanitizeStar, starStatus } from '../lib/starSchema.js'
import { VerifyFlag } from './ui.jsx'

function Choice({ options, value, onPick, label }) {
  const picked = options.find((o) => o.id === value)
  return (
    <div className="space-y-1.5" role="group" aria-label={label}>
      {options.map((o) => {
        const tone = value !== o.id ? 'border-line bg-panel2' : o.ok ? 'border-emerald-500 bg-emerald-500/10' : 'border-rose-500 bg-rose-500/10'
        return (
          <button key={o.id} onClick={() => onPick(o.id)} aria-pressed={value === o.id} className={`w-full rounded-xl border p-2.5 text-left text-sm ${tone}`}>
            {o.text}
          </button>
        )
      })}
      {picked && (
        <div className={`rounded-lg p-2 text-[13px] ${picked.ok ? 'bg-emerald-500/10 text-emerald-200' : 'bg-rose-500/10 text-rose-200'}`} role="status">
          {picked.ok ? '✅ ' : '❌ '}
          {picked.why}
        </div>
      )}
    </div>
  )
}

export default function StarSchemaBuilder() {
  const { state, actions } = useProgress()
  const lab = sanitizeStar(state.labState?.starSchema)
  const st = starStatus(lab)
  const save = (patch) => actions.setLabState('starSchema', { ...lab, ...patch })
  const [sel, setSel] = useState(null)

  useEffect(() => {
    if (st.grain) actions.labDone('ss-grain', 5)
    if (st.columns) actions.labDone('ss-columns', 10)
    if (st.snowflake) actions.labDone('ss-snowflake', 5)
  }, [st.grain, st.columns, st.snowflake, actions])

  const put = (table) => {
    if (!sel) return
    save({ place: { ...lab.place, [sel]: table } })
    setSel(null)
  }
  const unplaced = COLUMNS.filter((c) => !lab.place[c.id])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">⭐ Star Schema Builder</h3>
        <button onClick={() => (actions.setLabState('starSchema', null), setSel(null))} className="chip text-slate-300" aria-label="Reset lab">
          <RotateCcw size={11} /> Reset
        </button>
      </div>
      <div className="rounded-xl bg-ink/50 p-3 text-[14px] text-slate-200">{PROCESS}</div>

      <section className="space-y-1.5">
        <h4 className="font-bold">1. Declare the grain {st.grain && '✅'}</h4>
        <p className="text-xs text-slate-400">What does one row of the fact table represent?</p>
        <Choice options={GRAINS} value={lab.grain} onPick={(g) => save({ grain: g })} label="Grain" />
      </section>

      <section className="space-y-2">
        <h4 className="font-bold">
          2. Place the columns {st.columns ? '✅' : <span className="text-xs font-normal text-slate-400">({st.correctCols}/{COLUMNS.length} correct)</span>}
        </h4>
        <p className="text-xs text-slate-400">Tap a column, then tap the table it belongs in. Tap a placed column to move it.</p>
        {unplaced.length > 0 && (
          <div className="flex flex-wrap gap-1.5" data-testid="ss-columns">
            {unplaced.map((c) => (
              <button key={c.id} onClick={() => setSel(sel === c.id ? null : c.id)} aria-pressed={sel === c.id} className={`rounded-lg border px-2 py-1 font-mono text-xs ${sel === c.id ? 'border-brand bg-brand/15' : 'border-line bg-panel2'}`}>
                {c.id}
              </button>
            ))}
          </div>
        )}
        <div className="sticky bottom-16 z-10 flex flex-wrap justify-center gap-1 rounded-xl bg-ink/90 p-1.5 backdrop-blur">
          {Object.entries(TABLES).map(([id, t]) => (
            <button key={id} onClick={() => put(id)} disabled={!sel} aria-label={`Put in ${t.label}`} className="rounded-lg border border-line bg-panel2 px-2 py-1.5 font-mono text-[11px] font-bold disabled:opacity-40">
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Object.entries(TABLES).map(([id, t]) => {
            const here = COLUMNS.filter((c) => lab.place[c.id] === id)
            return (
              <div key={id} className={`rounded-xl border p-2 ${id === 'fact_sales' ? 'border-brand/50 sm:col-span-2' : 'border-line'}`}>
                <div className="font-mono text-sm font-bold">
                  {t.emoji} {t.label}
                </div>
                <div className="mt-1 space-y-1">
                  {id === 'fact_sales' && <div className="font-mono text-[11px] text-slate-500">{FIXED_FACT_KEYS.join(', ')} (keys)</div>}
                  {here.map((c) => {
                    const ok = c.answer === id
                    return (
                      <button key={c.id} onClick={() => setSel(c.id)} aria-pressed={sel === c.id} className={`w-full rounded-md border p-1.5 text-left text-[12px] ${sel === c.id ? 'border-brand' : ok ? 'border-emerald-500/40' : 'border-rose-500/60'}`}>
                        <span className="font-mono font-semibold">
                          {ok ? '✓' : '✗'} {c.id}
                        </span>
                        <span className={`block ${ok ? 'text-slate-400' : 'text-rose-200'}`}>{ok ? c.why : `Belongs in ${TABLES[c.answer].label}. ${c.why}`}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-1.5">
        <h4 className="font-bold">3. Spot the snowflake opportunity {st.snowflake && '✅'}</h4>
        <p className="text-xs text-slate-400">Which change would turn this star into a snowflake by normalizing a dimension?</p>
        <Choice options={SNOWFLAKE} value={lab.snow} onPick={(o) => save({ snow: o })} label="Snowflake" />
      </section>

      {st.grain && st.columns && st.snowflake && <div className="rounded-xl bg-emerald-500/15 p-2.5 text-sm font-bold text-emerald-200">🎉 Model complete: grain, star and snowflake.</div>}
      <VerifyFlag text="Simplified: real designs also add surrogate keys, SCD handling and an 'Unknown' member in each dimension. Databricks supports informational PRIMARY KEY / FOREIGN KEY constraints (not enforced)." />
    </div>
  )
}

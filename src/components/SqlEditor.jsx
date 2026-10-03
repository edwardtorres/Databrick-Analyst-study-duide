import { useRef, useState } from 'react'
import { Play, Database, ChevronDown } from 'lucide-react'
import { SCHEMA_DOC, SAMPLE_NAMESPACE } from '../data/sampleDb.js'

const QUICK = ['SELECT ', 'FROM ', 'WHERE ', 'GROUP BY ', 'HAVING ', 'ORDER BY ', 'JOIN ', 'LEFT JOIN ', ' ON ', 'COUNT(*)', 'SUM(', 'AVG(', 'IS NULL', ' AND ', ' = ', '*', ', ', '(', ')', "'", ';']

// Lightweight mobile-friendly SQL editor: textarea + tap-to-insert keywords.
export default function SqlEditor({ value, onChange, onRun, running, rows = 7, extraTables }) {
  const ref = useRef(null)

  const insert = (text) => {
    const el = ref.current
    const start = el?.selectionStart ?? value.length
    const end = el?.selectionEnd ?? value.length
    const next = value.slice(0, start) + text + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      el.selectionStart = el.selectionEnd = start + text.length
    })
  }

  return (
    <div className="space-y-2">
      <SchemaBrowser onInsert={insert} extraTables={extraTables} />
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault()
            onRun()
          }
          if (e.key === 'Tab') {
            e.preventDefault()
            insert('  ')
          }
        }}
        rows={rows}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className="w-full resize-y rounded-xl border border-line bg-ink p-3 font-mono text-[13px] leading-relaxed text-emerald-100 outline-none focus:border-brand/70"
        placeholder="SELECT * FROM customers LIMIT 5"
      />
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {QUICK.map((k) => (
          <button
            key={k}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insert(k)}
            className="shrink-0 rounded-lg border border-line bg-panel2 px-2 py-1 font-mono text-[11px] text-slate-200 active:bg-brand/30"
          >
            {k.trim() || k}
          </button>
        ))}
      </div>
      <button onClick={onRun} disabled={running} className="btn-primary w-full">
        <Play size={16} /> Run <span className="hidden text-xs font-normal opacity-70 sm:inline">(Ctrl/⌘ + Enter)</span>
      </button>
    </div>
  )
}

export function SchemaBrowser({ onInsert, extraTables = [] }) {
  const [open, setOpen] = useState(false)
  const [table, setTable] = useState(null)
  const tables = { ...SCHEMA_DOC, ...Object.fromEntries(extraTables.map((t) => [t.name, t.columns])) }
  return (
    <div className="rounded-xl border border-line bg-panel2/60">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 px-3 py-2 text-sm">
        <Database size={15} className="text-brand2" />
        <span className="font-semibold">Schema</span>
        <span className="font-mono text-xs text-slate-400">{SAMPLE_NAMESPACE}</span>
        <ChevronDown size={16} className={`ml-auto transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-line px-3 py-2">
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(tables).map((t) => (
              <button
                key={t}
                onClick={() => setTable(table === t ? null : t)}
                className={`rounded-lg px-2 py-1 font-mono text-xs ${table === t ? 'bg-brand text-ink' : 'bg-ink/70 text-slate-200'}`}
              >
                {t}
              </button>
            ))}
          </div>
          {table && (
            <div className="mt-2 space-y-1">
              <button onClick={() => onInsert(table + ' ')} className="font-mono text-xs text-amber-200 underline decoration-dotted">
                insert “{table}”
              </button>
              <div className="flex flex-wrap gap-1.5">
                {tables[table].map(([c, type]) => (
                  <button key={c} onClick={() => onInsert(c)} className="rounded-md bg-ink/60 px-1.5 py-0.5 text-left font-mono text-[11px]">
                    {c} <span className="text-slate-500">{type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className="mt-2 text-[11px] text-slate-500">Tap a table, then tap columns to insert them at the cursor.</p>
        </div>
      )}
    </div>
  )
}

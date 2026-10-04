import { useState } from 'react'
import { FileText, FileVideo, FileJson, ChevronRight, RotateCcw, Upload } from 'lucide-react'
import { useProgress } from '../lib/store.jsx'
import { TASK, FILES, checkFile, CATALOGS, NAMES, checkDestination, TYPES, INFERRED, preview, createIssues, MISTAKES } from '../lib/uploadWizard.js'
import { VerifyFlag } from './ui.jsx'

const FILE_ICON = { CSV: FileText, Video: FileVideo, JSON: FileJson }
const STEPS = ['File', 'Destination', 'Preview', 'Done']

const start = () => ({ step: 0, file: null, catalog: null, schema: null, name: null, header: false, types: { ...INFERRED }, problem: null, issues: [] })

function Problem({ text, tone = 'rose' }) {
  if (!text) return null
  const cls = tone === 'rose' ? 'bg-rose-500/10 text-rose-200' : 'bg-amber-500/10 text-amber-200'
  return (
    <div className={`rounded-lg p-2 text-[13px] ${cls}`} role="status">
      ⚠ {text}
    </div>
  )
}

export default function UploadWizard() {
  const { state, actions } = useProgress()
  const [w, setW] = useState(start)
  const [seen, setSeen] = useState([])
  const set = (patch) => setW((cur) => ({ ...cur, ...patch }))
  const note = (code) => code && setSeen((s) => (s.includes(code) ? s : [...s, code]))

  const pickFile = (id) => {
    const r = checkFile(id)
    note(r.code)
    if (r.ok) set({ file: id, step: 1, problem: null })
    else set({ file: null, problem: r.msg })
  }
  const toPreview = () => {
    const r = checkDestination(w.catalog, w.schema, w.name)
    note(r.code)
    if (r.ok) set({ step: 2, problem: null })
    else set({ problem: r.msg })
  }
  const create = () => {
    const issues = createIssues(w)
    issues.forEach((i) => note(i.code))
    if (issues.length) return set({ issues })
    set({ issues: [], step: 3 })
    actions.labDone('up-created', 15)
  }

  const grid = preview(w.header, w.types)
  const done = !!state.labs['up-created']

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">⬆️ Upload Wizard</h3>
        <button onClick={() => (setW(start()), setSeen([]))} className="chip text-slate-300" aria-label="Start over">
          <RotateCcw size={11} /> Start over
        </button>
      </div>
      <div className="rounded-xl bg-ink/50 p-3 text-[14px] text-slate-200">
        <span className="font-bold text-brand2">Task: </span>
        {TASK} {done && <span className="text-emerald-300">(done before ✅)</span>}
      </div>

      <ol className="grid grid-cols-4 gap-1 text-center text-[11px] font-bold" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li key={s} className={`rounded-md py-1 ${i === w.step ? 'bg-brand text-ink' : i < w.step ? 'bg-emerald-500/20 text-emerald-200' : 'bg-panel2 text-slate-400'}`}>
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      {w.step === 0 && (
        <div className="space-y-1.5">
          <div className="text-sm font-semibold">Choose a file to upload</div>
          {FILES.map((f) => {
            const Icon = FILE_ICON[f.kind]
            return (
              <button key={f.id} onClick={() => pickFile(f.id)} className="flex w-full items-center gap-2 rounded-xl border border-line bg-panel2 px-3 py-2.5 text-left text-sm">
                <Icon size={16} className="text-sky-300" />
                <span className="flex-1 font-mono">{f.name}</span>
                <span className="text-xs text-slate-400">{f.size}</span>
              </button>
            )
          })}
          <Problem text={w.problem} />
        </div>
      )}

      {w.step === 1 && (
        <div className="space-y-2">
          <div className="text-sm font-semibold">Where should the table go?</div>
          <div>
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Catalog</div>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(CATALOGS).map((c) => (
                <button key={c} onClick={() => set({ catalog: c, schema: null, problem: null })} aria-pressed={w.catalog === c} className={`rounded-lg px-3 py-1.5 font-mono text-sm ${w.catalog === c ? 'bg-brand text-ink' : 'bg-panel2'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          {w.catalog && (
            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Schema</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(CATALOGS[w.catalog]).map((s) => (
                  <button key={s} onClick={() => set({ schema: s, problem: null })} aria-pressed={w.schema === s} className={`rounded-lg px-3 py-1.5 font-mono text-sm ${w.schema === s ? 'bg-brand text-ink' : 'bg-panel2'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Table name</div>
            <div className="flex flex-wrap gap-1.5">
              {NAMES.map((n) => (
                <button key={n} onClick={() => set({ name: n, problem: null })} aria-pressed={w.name === n} className={`rounded-lg px-3 py-1.5 font-mono text-sm ${w.name === n ? 'bg-brand text-ink' : 'bg-panel2'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <Problem text={w.problem} />
          <button onClick={toPreview} disabled={!w.catalog || !w.schema || !w.name} className="btn-primary w-full disabled:opacity-40">
            Next: preview <ChevronRight size={16} />
          </button>
        </div>
      )}

      {w.step === 2 && (
        <div className="space-y-2">
          <div className="font-mono text-xs text-slate-400">
            {w.catalog}.{w.schema}.{w.name}
          </div>
          <label className="flex items-center gap-2 rounded-lg bg-panel2 px-3 py-2 text-sm">
            <input type="checkbox" checked={w.header} onChange={(e) => set({ header: e.target.checked, issues: [] })} className="h-4 w-4 accent-orange-400" />
            First row contains the header
          </label>
          <div className="overflow-x-auto rounded-lg border border-line" data-testid="upload-preview">
            <table className="w-full text-left font-mono text-[11px]">
              <thead className="bg-panel2">
                <tr>
                  {grid.columns.map((c) => (
                    <th key={c.name} className="px-2 py-1 align-top">
                      <div>{c.name}</div>
                      {w.header ? (
                        <select
                          aria-label={`Type of ${c.name}`}
                          value={c.type}
                          onChange={(e) => set({ types: { ...w.types, [c.name]: e.target.value }, issues: [] })}
                          className="mt-0.5 rounded bg-ink px-1 py-0.5 text-[10px] text-brand2"
                        >
                          {TYPES.map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-[10px] text-slate-500">{c.type}</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grid.rows.map((r, i) => (
                  <tr key={i} className="border-t border-line">
                    {r.map((v, j) => (
                      <td key={j} className="px-2 py-1">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {w.issues.map((i) => (
            <Problem key={i.code} text={i.msg} />
          ))}
          <button onClick={create} className="btn-primary w-full">
            <Upload size={16} /> Create table
          </button>
        </div>
      )}

      {w.step === 3 && (
        <div className="space-y-2 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-100">
          <div className="font-bold">✅ Created main.marketing.store_targets</div>
          <p className="text-[13px] text-slate-300">A managed Delta table: Unity Catalog stores the data, and dropping the table deletes it. The marketing team can now query it with their existing grants on main.marketing.</p>
          <pre className="overflow-x-auto rounded-lg bg-ink p-2 font-mono text-[11px] text-slate-200">{`SELECT store_id, store_zip, month_start, target_amount
FROM main.marketing.store_targets`}</pre>
        </div>
      )}

      <div className="rounded-xl border border-line p-2.5 text-[13px]" data-testid="mistakes">
        <div className="mb-1 font-semibold">
          Mistakes explored {MISTAKES.filter((m) => seen.includes(m.code)).length}/{MISTAKES.length}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MISTAKES.map((m) => (
            <span key={m.code} className={`rounded px-1.5 py-0.5 text-[11px] ${seen.includes(m.code) ? 'bg-amber-500/20 text-amber-100' : 'bg-panel2 text-slate-500'}`}>
              {seen.includes(m.code) ? '✓ ' : ''}
              {m.label}
            </span>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-slate-500">Try the wrong paths too: each one explains what would happen in Databricks.</p>
      </div>
      <VerifyFlag text="Upload limits, supported formats (Excel support is newer) and the exact screens change. This mock keeps the decisions the exam asks about." />
    </div>
  )
}

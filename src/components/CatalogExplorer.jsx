import { useEffect, useState } from 'react'
import { ChevronRight, Database, FolderTree, Table2, Eye, BadgeCheck, AlertTriangle, LayoutDashboard, NotebookText, Workflow, Tag, RotateCcw, ArrowLeft } from 'lucide-react'
import { useProgress } from '../lib/store.jsx'
import { OBJECTS, MISSIONS, TAG_PRESETS, tree, upstreamOf, downstreamOf, label, sanitizeCatalogLab, missionStatus } from '../lib/catalogLab.js'
import { VerifyFlag } from './ui.jsx'

const KIND_ICON = { table: Table2, view: Eye, dashboard: LayoutDashboard, notebook: NotebookText, job: Workflow }

function Badges({ o }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {o.certified && (
        <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/20 px-1 text-[10px] font-bold text-emerald-200">
          <BadgeCheck size={10} /> Certified
        </span>
      )}
      {o.deprecated && (
        <span className="inline-flex items-center gap-0.5 rounded bg-rose-500/20 px-1 text-[10px] font-bold text-rose-200">
          <AlertTriangle size={10} /> Deprecated
        </span>
      )}
      {o.type === 'VIEW' && <span className="rounded bg-violet-500/20 px-1 text-[10px] text-violet-200">View</span>}
    </span>
  )
}

function NodeButton({ id, onOpen }) {
  const o = OBJECTS[id]
  const Icon = KIND_ICON[o.kind] || Table2
  return (
    <button onClick={() => onOpen(id)} className="flex w-full items-center gap-1.5 rounded-lg border border-line bg-panel2 px-2 py-1.5 text-left text-[11px]">
      <Icon size={13} className="shrink-0 text-slate-400" />
      <span className="min-w-0 flex-1 break-all font-mono">{label(id)}</span>
      <ChevronRight size={13} className="shrink-0 text-slate-500" />
    </button>
  )
}

export default function CatalogExplorer() {
  const { state, actions } = useProgress()
  const lab = sanitizeCatalogLab(state.labState?.catalogExplorer)
  const save = (patch) => actions.setLabState('catalogExplorer', { ...lab, ...patch })
  const status = missionStatus(lab)
  const [nav, setNav] = useState({ catalog: null, schema: null, object: null })
  const [tab, setTab] = useState('overview')
  const [active, setActive] = useState('certified')
  const [tagging, setTagging] = useState(null) // column name being tagged

  useEffect(() => {
    for (const m of MISSIONS) if (status[m.id].done) actions.labDone(`ce-${m.id}`, 5)
  }, [JSON.stringify(Object.fromEntries(MISSIONS.map((m) => [m.id, status[m.id].done]))), actions]) // eslint-disable-line react-hooks/exhaustive-deps

  const open = (id) => {
    const parts = id.split('.')
    setNav(parts.length === 3 ? { catalog: parts[0], schema: parts[1], object: id } : { ...nav, object: id })
    setTab(OBJECTS[id].kind === 'table' || OBJECTS[id].kind === 'view' ? 'overview' : 'lineage')
    setTagging(null)
    if (!lab.opened.includes(id)) save({ opened: [...lab.opened, id] })
  }

  const t = tree()
  const obj = nav.object && OBJECTS[nav.object]
  const isData = obj && (obj.kind === 'table' || obj.kind === 'view')
  const addTag = (key, tagStr) => {
    const cur = lab.tags[key] || []
    save({ tags: { ...lab.tags, [key]: cur.includes(tagStr) ? cur.filter((x) => x !== tagStr) : [...cur, tagStr] } })
  }
  const doneCount = MISSIONS.filter((m) => status[m.id].done).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">🧭 Catalog Explorer</h3>
        <div className="flex items-center gap-2">
          <span className="chip">
            Missions {doneCount}/{MISSIONS.length}
          </span>
          <button
            onClick={() => {
              if (confirm('Reset the Catalog Explorer lab? Tags and answers are cleared; XP you earned is kept.')) actions.setLabState('catalogExplorer', null)
            }}
            className="chip text-slate-300"
            aria-label="Reset lab"
          >
            <RotateCcw size={11} /> Reset
          </button>
        </div>
      </div>

      {/* Missions */}
      <div className="space-y-1.5" data-testid="missions">
        {MISSIONS.map((m) => {
          const st = status[m.id]
          const isActive = active === m.id
          return (
            <div key={m.id} className={`rounded-xl border p-2 text-sm ${st.done ? 'border-emerald-500/40 bg-emerald-500/5' : isActive ? 'border-brand bg-brand/5' : 'border-line'}`}>
              <button onClick={() => setActive(m.id)} className="flex w-full items-center gap-2 text-left">
                <span>{st.done ? '✅' : isActive ? '👉' : '⬜'}</span>
                <span className="font-semibold">{m.title}</span>
              </button>
              {isActive && !st.done && (
                <div className="mt-1 pl-6 text-[13px] text-slate-300">
                  {m.task}
                  {m.id === 'external' && (
                    <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                      {['MANAGED', 'EXTERNAL'].map((v) => (
                        <button
                          key={v}
                          disabled={!lab.opened.includes('prod.finance.revenue_daily')}
                          onClick={() => save({ external: v })}
                          className="rounded-lg bg-panel2 py-1.5 text-xs font-bold disabled:opacity-40"
                        >
                          {v === 'MANAGED' ? 'Managed' : 'External'}
                        </button>
                      ))}
                      {!lab.opened.includes('prod.finance.revenue_daily') && <p className="col-span-2 text-[11px] text-slate-500">Open the table first.</p>}
                    </div>
                  )}
                  {m.id === 'downstream' && (
                    <div className="mt-1.5">
                      <div className="text-[11px] text-slate-400">Flagged: {lab.flagged.length ? lab.flagged.map(label).join(', ') : 'none yet'}</div>
                      <button onClick={() => save({ submitted: true })} disabled={!lab.flagged.length} className="mt-1 rounded-lg bg-panel2 px-3 py-1.5 text-xs font-bold disabled:opacity-40">
                        Check dashboards
                      </button>
                    </div>
                  )}
                  {st.feedback && <div className="mt-1 text-[12px] text-amber-200">⚠ {st.feedback}</div>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Explorer */}
      <div className="rounded-xl border border-line bg-ink/40 p-2.5">
        <div className="mb-2 flex flex-wrap items-center gap-1 text-[11px] text-slate-400" data-testid="breadcrumb">
          <button onClick={() => setNav({ catalog: null, schema: null, object: null })} className="underline">
            Catalog
          </button>
          {nav.catalog && (
            <>
              <ChevronRight size={11} />
              <button onClick={() => setNav({ catalog: nav.catalog, schema: null, object: null })} className="font-mono underline">
                {nav.catalog}
              </button>
            </>
          )}
          {nav.schema && (
            <>
              <ChevronRight size={11} />
              <button onClick={() => setNav({ ...nav, object: null })} className="font-mono underline">
                {nav.schema}
              </button>
            </>
          )}
        </div>

        {!nav.catalog &&
          Object.keys(t).map((c) => (
            <button key={c} onClick={() => setNav({ catalog: c, schema: null, object: null })} className="mb-1 flex w-full items-center gap-2 rounded-lg bg-panel2 px-2.5 py-2 text-left text-sm">
              <Database size={14} className="text-sky-300" /> <span className="font-mono">{c}</span>
              <ChevronRight size={14} className="ml-auto text-slate-500" />
            </button>
          ))}
        {nav.catalog &&
          !nav.schema &&
          Object.keys(t[nav.catalog]).map((s) => (
            <button key={s} onClick={() => setNav({ ...nav, schema: s, object: null })} className="mb-1 flex w-full items-center gap-2 rounded-lg bg-panel2 px-2.5 py-2 text-left text-sm">
              <FolderTree size={14} className="text-violet-300" /> <span className="font-mono">{s}</span>
              <ChevronRight size={14} className="ml-auto text-slate-500" />
            </button>
          ))}
        {nav.schema &&
          !nav.object &&
          t[nav.catalog][nav.schema].map((o) => {
            const id = `${nav.catalog}.${nav.schema}.${o}`
            const Icon = KIND_ICON[OBJECTS[id].kind]
            return (
              <button key={o} onClick={() => open(id)} className="mb-1 flex w-full items-center gap-2 rounded-lg bg-panel2 px-2.5 py-2 text-left text-sm">
                <Icon size={14} className="text-emerald-300" /> <span className="font-mono">{o}</span> <Badges o={OBJECTS[id]} />
                <ChevronRight size={14} className="ml-auto text-slate-500" />
              </button>
            )
          })}

        {obj && (
          <div className="space-y-2" data-testid="object-page">
            <div className="flex items-start gap-2">
              {!isData && (
                <button onClick={() => setNav({ ...nav, object: null })} aria-label="Back" className="text-slate-400">
                  <ArrowLeft size={16} />
                </button>
              )}
              <div className="min-w-0">
                <div className="break-all font-mono text-sm font-bold">{label(nav.object)}</div>
                {isData && <Badges o={obj} />}
              </div>
            </div>
            {isData && (
              <div className="grid grid-cols-3 rounded-lg bg-panel2 p-0.5 text-[11px] font-bold">
                {['overview', 'details', 'lineage'].map((k) => (
                  <button key={k} onClick={() => setTab(k)} className={`rounded-md py-1 capitalize ${tab === k ? 'bg-brand text-ink' : 'text-slate-300'}`}>
                    {k}
                  </button>
                ))}
              </div>
            )}

            {isData && tab === 'overview' && (
              <div className="space-y-1.5">
                <p className="text-[12px] text-slate-300">{obj.comment}</p>
                {obj.columns.map((c) => {
                  const key = `${nav.object}#${c.name}`
                  const tags = lab.tags[key] || []
                  return (
                    <div key={c.name} className="rounded-lg border border-line p-1.5 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{c.name}</span>
                        <span className="font-mono text-slate-500">{c.type}</span>
                        <button onClick={() => setTagging(tagging === c.name ? null : c.name)} className="ml-auto inline-flex items-center gap-0.5 rounded bg-panel2 px-1.5 py-0.5" aria-label={`Tag column ${c.name}`}>
                          <Tag size={10} /> tag
                        </button>
                      </div>
                      {c.comment && <div className="text-slate-500">{c.comment}</div>}
                      {tags.length > 0 && (
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {tags.map((tg) => (
                            <span key={tg} className="rounded bg-amber-500/20 px-1 text-amber-100">
                              {tg}
                            </span>
                          ))}
                        </div>
                      )}
                      {tagging === c.name && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {TAG_PRESETS.map(([k, v]) => {
                            const tg = `${k}=${v}`
                            return (
                              <button key={tg} onClick={() => addTag(key, tg)} className={`rounded px-1.5 py-0.5 ${tags.includes(tg) ? 'bg-amber-500 text-ink' : 'bg-panel2'}`}>
                                {tags.includes(tg) ? '✓ ' : '+ '}
                                {k} = {v}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
                <button onClick={() => save({ queried: nav.object })} className="btn-ghost w-full py-2 text-sm">
                  Query this table
                </button>
              </div>
            )}

            {isData && tab === 'details' && (
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[12px]" data-testid="details">
                <dt className="text-slate-500">Type</dt>
                <dd className="font-mono font-bold">{obj.type}</dd>
                <dt className="text-slate-500">Owner</dt>
                <dd className="font-mono">{obj.owner}</dd>
                <dt className="text-slate-500">Location</dt>
                <dd className="break-all font-mono">{obj.location || (obj.type === 'VIEW' ? '(none: a view stores a query, not data)' : '(managed by Unity Catalog)')}</dd>
              </dl>
            )}

            {(tab === 'lineage' || !isData) && (
              <div className="grid grid-cols-1 gap-2" data-testid="lineage">
                <div>
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">⬆ Upstream (feeds this)</div>
                  <div className="space-y-1">
                    {upstreamOf(nav.object).map((id) => (
                      <NodeButton key={id} id={id} onOpen={open} />
                    ))}
                    {!upstreamOf(nav.object).length && <div className="text-[11px] text-slate-500">Nothing upstream. This is a source.</div>}
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">⬇ Downstream (reads this)</div>
                  <div className="space-y-1">
                    {downstreamOf(nav.object).map((id) => (
                      <NodeButton key={id} id={id} onOpen={open} />
                    ))}
                    {!downstreamOf(nav.object).length && <div className="text-[11px] text-slate-500">Nothing downstream.</div>}
                  </div>
                </div>
              </div>
            )}

            {active === 'upstream' && isData && (
              <button onClick={() => save({ origin: nav.object })} className="w-full rounded-lg border border-brand/60 py-1.5 text-xs font-bold text-brand2">
                Pick as the answer (origin of prod.sales.orders)
              </button>
            )}
            {active === 'downstream' && obj.kind === 'dashboard' && (
              <button
                onClick={() =>
                  save({
                    flagged: lab.flagged.includes(nav.object) ? lab.flagged.filter((x) => x !== nav.object) : [...lab.flagged, nav.object],
                    submitted: false,
                  })
                }
                className="w-full rounded-lg border border-brand/60 py-1.5 text-xs font-bold text-brand2"
              >
                {lab.flagged.includes(nav.object) ? '✓ Flagged as affected (tap to unflag)' : 'Flag as affected'}
              </button>
            )}
          </div>
        )}
      </div>
      <VerifyFlag text="Real Catalog Explorer has more tabs (Permissions, History, Insights) and shows certification and deprecation through system tags. This mock keeps the parts the exam asks about." />
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { Database, FolderTree, Table2, HardDrive, ShieldCheck, Trash2, Hand, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import { useProgress } from '../lib/store.jsx'
import { PRINCIPALS, GRANTABLE, ACTIONS, checkAccess, grantSql, missionStatus } from '../lib/ucAccess.js'
import { PIECES, TARGET, OWNERS, OBJECTS, typeOf, sanitizeNamespaceLab } from '../lib/namespaceLab.js'

// Three phases: build the namespace by dragging, grant privileges, then
// test whether a user can run a query (with the missing privilege explained).

const PARENT_TYPE = { catalog: 'metastore', schema: 'catalog', table: 'schema', volume: 'schema' }
const ICON = { catalog: Database, schema: FolderTree, table: Table2, volume: HardDrive }
const TONE = {
  catalog: 'bg-sky-500/20 text-sky-200 border-sky-400/40',
  schema: 'bg-violet-500/20 text-violet-200 border-violet-400/40',
  table: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
  volume: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
}
const pieceById = (id) => PIECES.find((p) => p.id === id)

function invalidReason(piece, targetType) {
  if (PARENT_TYPE[piece.type] === targetType) return null
  if (piece.type === 'catalog') return 'Catalogs are the top level of the namespace. Drop them straight into the metastore.'
  if (piece.type === 'schema') return 'A schema lives inside a catalog: catalog.schema.'
  if (targetType === 'catalog') return `A ${piece.type} can't sit directly in a catalog. The namespace has three levels (catalog.schema.${piece.type}), so put it in a schema.`
  if (targetType === 'metastore') return `A ${piece.type} needs a catalog and a schema above it: catalog.schema.${piece.type}.`
  return `Tables and volumes don't contain other objects. Drop the ${piece.type} into a schema.`
}

function Chip({ piece, fullName, onPointerDown, selected }) {
  const Icon = ICON[piece.type]
  return (
    <span
      onPointerDown={(e) => onPointerDown(e, piece.id)}
      onClick={(e) => e.stopPropagation()}
      style={{ touchAction: 'none' }}
      className={`inline-flex cursor-grab select-none items-center gap-1.5 rounded-lg border px-2 py-1 font-mono text-xs active:cursor-grabbing ${TONE[piece.type]} ${
        selected ? 'ring-2 ring-brand2' : ''
      }`}
    >
      <Icon size={13} />
      {fullName || piece.name}
      <span className="font-sans text-[9px] uppercase opacity-60">{piece.type}</span>
    </span>
  )
}

function BuildPhase({ place, setPlace, done, onDone, onSkip }) {
  const [drag, setDrag] = useState(null) // { id, x, y, moved }
  const [selected, setSelected] = useState(null)
  const [msg, setMsg] = useState(null)
  const start = useRef(null)

  const fullName = (id) => {
    const names = []
    let cur = id
    while (cur && cur !== 'ms') {
      names.unshift(pieceById(cur).name)
      cur = place[cur]
    }
    return names.join('.')
  }
  const drop = (id, zone) => {
    const piece = pieceById(id)
    if (zone === 'palette') {
      // Removing a container returns its children too.
      const next = { ...place }
      const clear = (pid) => {
        delete next[pid]
        Object.keys(next).forEach((k) => next[k] === pid && clear(k))
      }
      clear(id)
      setPlace(next)
      setMsg(null)
      return
    }
    const targetType = zone === 'ms' ? 'metastore' : pieceById(zone).type
    const reason = invalidReason(piece, targetType)
    if (reason) {
      setMsg({ ok: false, text: reason })
      return
    }
    const next = { ...place, [id]: zone }
    setPlace(next)
    const label = zone === 'ms' ? 'the metastore' : pieceById(zone).name
    setMsg({ ok: true, text: `Placed ${piece.type} ${piece.name} in ${label}.` })
  }

  useEffect(() => {
    if (!drag) return
    const move = (e) => {
      const s = start.current
      const moved = s.moved || Math.hypot(e.clientX - s.x, e.clientY - s.y) > 6
      start.current = { ...s, moved }
      setDrag({ id: s.id, x: e.clientX, y: e.clientY, moved })
    }
    const up = (e) => {
      const s = start.current
      setDrag(null)
      if (s.moved) {
        const zone = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-drop]')?.dataset.drop
        if (zone && zone !== s.id) drop(s.id, zone)
        setSelected(null)
      } else if (selected && selected !== s.id && place[s.id]) {
        // Tap-to-place: a piece is selected and a placed container was tapped.
        drop(selected, s.id)
        setSelected(null)
      } else setSelected((cur) => (cur === s.id ? null : s.id))
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!drag, place, selected])

  const onPointerDown = (e, id) => {
    e.stopPropagation()
    start.current = { id, x: e.clientX, y: e.clientY, moved: false }
    setDrag({ id, x: e.clientX, y: e.clientY, moved: false })
  }
  const zoneClick = (zone) => (e) => {
    e.stopPropagation()
    if (selected && selected !== zone) {
      drop(selected, zone)
      setSelected(null)
    }
  }

  const children = (parent) => PIECES.filter((p) => place[p.id] === parent)
  const unplaced = PIECES.filter((p) => !place[p.id])

  const Node = ({ piece }) => (
    <div
      data-drop={piece.id}
      onClick={zoneClick(piece.id)}
      className={`rounded-xl border border-dashed p-2 ${piece.type === 'catalog' ? 'border-sky-400/40 bg-sky-500/5' : piece.type === 'schema' ? 'border-violet-400/40 bg-violet-500/5' : 'border-transparent p-0'}`}
    >
      <Chip piece={piece} fullName={fullName(piece.id)} onPointerDown={onPointerDown} selected={selected === piece.id} />
      {(piece.type === 'catalog' || piece.type === 'schema') && (
        <div className="ml-3 mt-1.5 space-y-1.5 border-l border-line pl-2">
          {children(piece.id).map((c) => (
            <Node key={c.id} piece={c} />
          ))}
          {!children(piece.id).length && <div className="text-[10px] italic text-slate-500">drop {piece.type === 'catalog' ? 'schemas' : 'tables / volumes'} here</div>}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-ink/50 p-2.5 text-sm text-slate-300">
        <strong className="text-white">Mission 1:</strong> build <code className="text-amber-200">sales.gold.orders</code>, <code className="text-amber-200">sales.gold.customers</code> and the volume{' '}
        <code className="text-amber-200">sales.raw.landing</code>.
        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
          <Hand size={12} /> Drag pieces, or tap a piece and then tap where it goes.
        </div>
      </div>

      <div data-drop="palette" onClick={zoneClick('palette')} className="min-h-12 rounded-xl border border-line bg-panel2/50 p-2">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Pieces (drop here to remove)</div>
        <div className="flex flex-wrap gap-1.5">
          {unplaced.map((p) => (
            <Chip key={p.id} piece={p} onPointerDown={onPointerDown} selected={selected === p.id} />
          ))}
          {!unplaced.length && <span className="text-xs text-slate-500">All pieces placed.</span>}
        </div>
      </div>

      <div data-drop="ms" onClick={zoneClick('ms')} className="min-h-24 rounded-xl border-2 border-dashed border-slate-600 p-2">
        <div className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <ShieldCheck size={12} /> Unity Catalog metastore
        </div>
        <div className="space-y-2">
          {children('ms').map((c) => (
            <Node key={c.id} piece={c} />
          ))}
          {!children('ms').length && <div className="text-xs italic text-slate-500">Drop a catalog here</div>}
        </div>
      </div>

      {msg && <div className={`rounded-xl p-2.5 text-sm ${msg.ok ? 'bg-emerald-500/10 text-emerald-200' : 'animate-shake bg-rose-500/10 text-rose-200'}`}>{msg.text}</div>}
      {done ? (
        <button onClick={onDone} className="btn-primary w-full">
          ✅ Namespace built! Next: grant privileges
        </button>
      ) : (
        <button onClick={onSkip} className="w-full text-center text-xs text-slate-500 underline">
          Skip: build it for me
        </button>
      )}

      {drag?.moved && (
        <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2" style={{ left: drag.x, top: drag.y }}>
          <Chip piece={pieceById(drag.id)} onPointerDown={() => {}} />
        </div>
      )}
    </div>
  )
}

function GrantPhase({ grants, setGrants }) {
  const [principal, setPrincipal] = useState('analysts')
  const [securable, setSecurable] = useState('sales')
  const type = typeOf(securable)
  const [privilege, setPrivilege] = useState('USE CATALOG')
  const options = GRANTABLE[type]
  const priv = options.includes(privilege) ? privilege : options[0]

  const add = () => {
    if (grants.some((g) => g.principal === principal && g.securable === securable && g.privilege === priv)) return
    setGrants([...grants, { principal, privilege: priv, securable }])
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-ink/50 p-2.5 text-xs text-slate-400">
        <div className="mb-1 font-bold text-slate-300">Owners</div>
        {Object.entries(OWNERS).map(([o, who]) => (
          <div key={o} className="font-mono">
            {o} → <span className="text-amber-200">{who}</span>
          </div>
        ))}
        <div className="mt-1">Members: Maya ∈ analysts · Raj ∈ engineers · Lee ∈ (no groups)</div>
      </div>
      <div className="grid gap-2">
        <label className="text-xs text-slate-400">
          GRANT
          <select value={priv} onChange={(e) => setPrivilege(e.target.value)} className="mt-0.5 w-full rounded-lg border border-line bg-ink p-2 font-mono text-sm text-slate-100">
            {options.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-400">
          ON
          <select value={securable} onChange={(e) => setSecurable(e.target.value)} className="mt-0.5 w-full rounded-lg border border-line bg-ink p-2 font-mono text-sm text-slate-100">
            {OBJECTS.map(([o, t]) => (
              <option key={o} value={o}>
                {t.toUpperCase()} {o}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-400">
          TO
          <select value={principal} onChange={(e) => setPrincipal(e.target.value)} className="mt-0.5 w-full rounded-lg border border-line bg-ink p-2 font-mono text-sm text-slate-100">
            {Object.entries(PRINCIPALS).map(([p, info]) => (
              <option key={p} value={p}>
                {info.label}
              </option>
            ))}
          </select>
        </label>
        <button onClick={add} className="btn-primary">
          Run GRANT
        </button>
      </div>
      <div>
        <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Grants ({grants.length})</div>
        <div className="space-y-1">
          {grants.map((g, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-ink/60 px-2 py-1.5 font-mono text-[11px] text-emerald-100">
              <span className="flex-1">{grantSql(g, typeOf(g.securable))}</span>
              <button onClick={() => setGrants(grants.filter((_, k) => k !== i))} className="text-rose-300" aria-label="Revoke">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {!grants.length && <div className="text-xs text-slate-500">No grants yet. Nobody but the owners can do anything.</div>}
        </div>
      </div>
    </div>
  )
}

const USERS = Object.keys(PRINCIPALS).filter((p) => PRINCIPALS[p].kind === 'user')

function TestPhase({ grants }) {
  const { actions } = useProgress()
  const [principal, setPrincipal] = useState(USERS[0])
  const [action, setAction] = useState('select')
  const targets = OBJECTS.filter(([, t]) => t === ACTIONS[action].on).map(([o]) => o)
  const [target, setTarget] = useState('sales.gold.orders')
  const tgt = targets.includes(target) ? target : targets[0]
  const [guess, setGuess] = useState(null)
  const result = useMemo(() => checkAccess({ grants, owners: OWNERS }, principal, action, tgt), [grants, principal, action, tgt])

  // `grants` is rebuilt from saved progress on every render, so key the reset
  // on its contents; otherwise each re-render would wipe the prediction.
  const grantsKey = JSON.stringify(grants)
  useEffect(() => setGuess(null), [principal, action, tgt, grantsKey])

  const predict = (yes) => {
    setGuess(yes)
    if (yes === result.allowed) actions.labDone(`ns-p-${principal}-${action}-${tgt}-${result.allowed}`, 3)
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-ink/50 p-3 font-mono text-sm">
        <span className="text-slate-400">Can </span>
        <select value={principal} onChange={(e) => setPrincipal(e.target.value)} className="rounded bg-panel2 px-1 text-amber-200">
          {USERS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <span className="text-slate-400"> run</span>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <select value={action} onChange={(e) => setAction(e.target.value)} className="rounded bg-panel2 px-1 text-sky-200">
            {Object.entries(ACTIONS).map(([k, a]) => (
              <option key={k} value={k}>
                {a.label}
              </option>
            ))}
          </select>
          <select value={tgt} onChange={(e) => setTarget(e.target.value)} className="rounded bg-panel2 px-1 text-emerald-200">
            {targets.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <span className="text-slate-400">?</span>
        </div>
      </div>
      {guess === null ? (
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => predict(true)} className="btn-ghost">
            👍 Yes, allowed
          </button>
          <button onClick={() => predict(false)} className="btn-ghost">
            🚫 No, denied
          </button>
        </div>
      ) : (
        <div className={`rounded-xl border p-3 text-sm ${result.allowed ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-rose-500/50 bg-rose-500/10'}`}>
          <div className="font-bold">
            {guess === result.allowed ? '✅ Correct prediction. ' : '❌ Wrong prediction. '}
            {result.allowed ? 'Access ALLOWED' : 'Access DENIED (PERMISSION_DENIED)'}
          </div>
          <div className="mt-2 space-y-1">
            {result.checks.map((c) => (
              <div key={c.privilege + c.on} className="flex items-start gap-1.5 text-xs">
                {c.ok ? <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" /> : <XCircle size={14} className="mt-0.5 shrink-0 text-rose-400" />}
                <span>
                  <span className="font-mono">
                    {c.privilege} on {c.on}
                  </span>
                  <span className="text-slate-400">{c.ok ? `: ${c.via}` : ': missing'}</span>
                </span>
              </div>
            ))}
          </div>
          {!result.allowed && (
            <div className="mt-2 text-xs">
              <div className="text-slate-300">To fix it, an owner (or admin) would run:</div>
              {result.fixes.map((f) => (
                <div key={f} className="mt-0.5 font-mono text-amber-200">
                  {f}
                </div>
              ))}
            </div>
          )}
          {action === 'insert' && (
            <div className="mt-2 text-[11px] text-amber-200/80">
              ⚠ Verify in Databricks docs: this lab treats INSERT as needing MODIFY only. UPDATE, DELETE and MERGE also read the table, so they need SELECT too.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function NamespaceBuilder() {
  const { state, actions } = useProgress()
  // Lab state lives in saved progress so it survives leaving the page.
  const lab = sanitizeNamespaceLab(state.labState?.namespaceBuilder)
  const { phase, place, grants, skipped } = lab
  const save = (patch) => actions.setLabState('namespaceBuilder', { ...lab, ...patch })
  const setPhase = (p) => save({ phase: p })
  const setPlace = (p) => save({ place: p })
  const setGrants = (g) => save({ grants: g })
  const built = Object.entries(TARGET).every(([id, parent]) => place[id] === parent)
  useEffect(() => {
    if (built && !skipped) actions.labDone('ns-build', 15)
  }, [built, skipped, actions])
  const mission = missionStatus({ grants, owners: OWNERS })

  useEffect(() => {
    if (mission.complete) actions.labDone('ns-mission', 25)
  }, [mission.complete, actions])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">🔐 Namespace Builder</h3>
        <div className="flex items-center gap-2">
          {state.labs['ns-mission'] && <span className="chip border-emerald-500/50 text-emerald-300">🏆 Mission done</span>}
          <button
            onClick={() => {
              if (confirm('Reset the Namespace Builder? Your tree and grants will be cleared. XP you earned is kept.')) actions.setLabState('namespaceBuilder', null)
            }}
            className="chip text-slate-300"
            aria-label="Reset lab"
          >
            <RotateCcw size={11} /> Reset
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 rounded-xl bg-panel2 p-1 text-xs font-bold">
        {[
          ['build', '1. Build'],
          ['grant', '2. Grant'],
          ['test', '3. Test access'],
        ].map(([k, label]) => (
          <button
            key={k}
            disabled={k !== 'build' && !built}
            onClick={() => setPhase(k)}
            className={`rounded-lg py-1.5 disabled:opacity-40 ${phase === k ? 'bg-brand text-ink' : 'text-slate-300'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {phase === 'build' && <BuildPhase
          place={place}
          setPlace={setPlace}
          done={built}
          onDone={() => setPhase('grant')}
          onSkip={() => save({ skipped: true, place: { ...TARGET } })}
        />}
      {phase === 'grant' && <GrantPhase grants={grants} setGrants={setGrants} />}
      {phase === 'test' && <TestPhase grants={grants} />}

      {phase !== 'build' && (
        <div className="rounded-xl border border-line p-3">
          <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Mission 2: least-privilege setup (+25 XP)</div>
          {mission.goals.map((g) => (
            <div key={g.id} className={`text-sm ${g.ok ? 'text-emerald-300' : 'text-slate-300'}`}>
              {g.ok ? '✅' : '⬜'} {g.text}
            </div>
          ))}
          <p className="mt-1.5 text-[11px] text-slate-500">
            Simplified model: grants inherit down the hierarchy, an owner holds every privilege on the object it owns, and every query needs USE CATALOG and USE SCHEMA on the
            parents.
          </p>
        </div>
      )}
    </div>
  )
}

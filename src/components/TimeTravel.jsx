import { useMemo, useState } from 'react'
import { Clock, FastForward, RotateCcw, Play, Skull, CircleCheck, FileText } from 'lucide-react'
import { useSql } from '../lib/useSql.js'
import { runSql } from '../lib/sqlEngine.js'
import { useProgress } from '../lib/store.jsx'
import ResultTable from './ResultTable.jsx'

// A simulated Delta table: versions point at immutable data files.
// VACUUM deletes files that the current version no longer references and
// that were tombstoned before the retention cutoff. Old versions stay in
// the history, but their reads fail once their files are gone.

const HOUR = 3600_000
const COLS = ['item_id', 'item', 'qty', 'price']
const T = (s) => new Date(s + ':00Z').getTime()

const A = [1, 'Hoodie', 40, 45.0]
const B = [2, 'Mug', 120, 12.5]
const B2 = [2, 'Mug', 120, 14.0]
const C = [3, 'Backpack', 15, 80.0]
const D = [4, 'Bottle', 60, 18.0]
const E = [5, 'Tee', 0, 25.0]

const initial = () => ({
  now: T('2025-03-10T12:00'),
  safetyCheck: true,
  files: {
    'f0.parquet': { rows: [A, B, C], deleted: false },
    'f1.parquet': { rows: [D, E], deleted: false },
    'f2.parquet': { rows: [A, B2, C], deleted: false },
    'f3.parquet': { rows: [D], deleted: false },
    'f4.parquet': { rows: [A, B2, C, D], deleted: false },
  },
  versions: [
    { v: 0, ts: T('2025-02-20T09:00'), op: 'CREATE TABLE AS SELECT', files: ['f0.parquet'] },
    { v: 1, ts: T('2025-02-22T10:30'), op: 'WRITE (INSERT)', files: ['f0.parquet', 'f1.parquet'] },
    { v: 2, ts: T('2025-02-25T14:00'), op: 'UPDATE (Mug price 12.5 → 14)', files: ['f2.parquet', 'f1.parquet'] },
    { v: 3, ts: T('2025-03-04T08:15'), op: 'DELETE (Tee)', files: ['f2.parquet', 'f3.parquet'] },
    { v: 4, ts: T('2025-03-08T17:45'), op: 'OPTIMIZE', files: ['f4.parquet'] },
  ],
  nextFile: 5,
})

const fmt = (ms) => new Date(ms).toISOString().slice(0, 16).replace('T', ' ')
const current = (s) => s.versions[s.versions.length - 1]
const readable = (s, ver) => ver.files.every((f) => !s.files[f].deleted)
const rowsOf = (s, ver) => ver.files.flatMap((f) => s.files[f].rows)

// When did a file stop being referenced? (null = still live)
function tombstonedAt(s, file) {
  const cur = current(s)
  if (cur.files.includes(file)) return null
  let lastRef = -1
  s.versions.forEach((ver, i) => {
    if (ver.files.includes(file)) lastRef = i
  })
  return lastRef >= 0 && s.versions[lastRef + 1] ? s.versions[lastRef + 1].ts : null
}

function resolveTimestamp(s, text) {
  const t = Date.parse(text.length <= 10 ? text + 'T00:00:00Z' : text.replace(' ', 'T') + (text.endsWith('Z') ? '' : 'Z'))
  if (Number.isNaN(t)) throw new Error(`Could not parse timestamp '${text}'.`)
  if (t < s.versions[0].ts)
    throw new Error(`[DELTA_TIMESTAMP_EARLIER_THAN_COMMIT_RETENTION] '${text}' is before the earliest available version (${fmt(s.versions[0].ts)}).`)
  if (t > current(s).ts)
    throw new Error(
      `[DELTA_TIMESTAMP_GREATER_THAN_COMMIT] '${text}' is after the latest commit (${fmt(current(s).ts)}). Use VERSION AS OF or an earlier timestamp.`,
    )
  return [...s.versions].reverse().find((v) => v.ts <= t)
}

function versionByNumber(s, n) {
  const ver = s.versions.find((v) => v.v === n)
  if (!ver) throw new Error(`Cannot time travel to version ${n}. Available versions: [0, ${current(s).v}].`)
  return ver
}

function assertReadable(s, ver) {
  const missing = ver.files.find((f) => s.files[f].deleted)
  if (missing)
    throw new Error(
      `[FAILED_READ_FILE] ${missing} referenced by version ${ver.v} cannot be found. It was removed by VACUUM. The version is still listed in DESCRIBE HISTORY, but its data is gone.`,
    )
}

const PRESETS = [
  ['History', 'DESCRIBE HISTORY inventory'],
  ['Current', 'SELECT * FROM inventory'],
  ['v1', 'SELECT * FROM inventory VERSION AS OF 1'],
  ['Timestamp', "SELECT * FROM inventory TIMESTAMP AS OF '2025-02-26'"],
  ['@v syntax', 'SELECT item, price FROM inventory@v0 WHERE item_id = 2'],
  ['Restore', 'RESTORE TABLE inventory TO VERSION AS OF 1'],
  ['Update', 'UPDATE inventory SET qty = qty - 5 WHERE item_id = 1'],
  ['VACUUM', 'VACUUM inventory'],
  ['Safety off', 'SET spark.databricks.delta.retentionDurationCheck.enabled = false'],
  ['VACUUM 0h', 'VACUUM inventory RETAIN 0 HOURS'],
]

const MISSIONS = [
  ['tt-read-old', 'Read an old version with VERSION AS OF (or @v)'],
  ['tt-timestamp', 'Read the table with TIMESTAMP AS OF'],
  ['tt-restore', 'RESTORE the table to an earlier version'],
  ['tt-vacuum-break', 'Run VACUUM, then try to read a version it broke'],
]

export default function TimeTravel() {
  const { SQL } = useSql()
  const { state: progress, actions } = useProgress()
  const [s, setS] = useState(initial)
  const [sql, setSql] = useState('DESCRIBE HISTORY inventory')
  const [out, setOut] = useState(null)

  const mission = (id) => actions.labDone(id, 10)

  const commit = (st, op, files) => ({
    ...st,
    now: st.now + HOUR,
    versions: [...st.versions, { v: current(st).v + 1, ts: st.now, op, files }],
  })

  const history = useMemo(
    () => ({
      columns: ['version', 'timestamp', 'operation', 'data files'],
      rows: [...s.versions].reverse().map((v) => [v.v, fmt(v.ts), v.op, readable(s, v) ? 'available' : 'VACUUMed ✗']),
    }),
    [s],
  )

  const run = (text = sql) => {
    const q = text.trim().replace(/;\s*$/, '')
    try {
      let m
      if (/^DESCRIBE\s+HISTORY\s+(\w+\.)*inventory$/i.test(q)) {
        setOut({ result: history })
        return
      }
      if ((m = q.match(/^SET\s+spark\.databricks\.delta\.retentionDurationCheck\.enabled\s*=\s*(true|false)$/i))) {
        const on = m[1].toLowerCase() === 'true'
        setS({ ...s, safetyCheck: on })
        setOut({ message: `Retention duration safety check ${on ? 'ENABLED' : 'DISABLED'}.${on ? '' : ' Careful: VACUUM can now delete files that time travel needs.'}` })
        return
      }
      if ((m = q.match(/^VACUUM\s+(\w+\.)*inventory(?:\s+RETAIN\s+(\d+(?:\.\d+)?)\s+HOURS)?$/i))) {
        const hours = m[2] === undefined ? 168 : Number(m[2])
        if (hours < 168 && s.safetyCheck)
          throw new Error(
            `[DELTA_VACUUM_RETENTION_PERIOD_TOO_SHORT] Are you sure you want to vacuum files with such a low retention period (${hours}h < 168h)? If no operations are running on this table, you can turn off the check with SET spark.databricks.delta.retentionDurationCheck.enabled = false.`,
          )
        const cutoff = s.now - hours * HOUR
        const files = { ...s.files }
        const removed = []
        for (const f of Object.keys(files)) {
          const t = tombstonedAt(s, f)
          if (!files[f].deleted && t !== null && t <= cutoff) {
            files[f] = { ...files[f], deleted: true }
            removed.push(f)
          }
        }
        const next = { ...s, files }
        setS(next)
        const broken = next.versions.filter((v) => !readable(next, v)).map((v) => `v${v.v}`)
        setOut({
          message: `VACUUM removed ${removed.length} file(s)${removed.length ? `: ${removed.join(', ')}` : ''}. Cutoff: files unreferenced since before ${fmt(cutoff)}.${
            broken.length ? ` Versions no longer readable: ${broken.join(', ')}.` : ''
          }`,
        })
        return
      }
      if ((m = q.match(/^RESTORE\s+(?:TABLE\s+)?(\w+\.)*inventory\s+TO\s+(?:VERSION\s+AS\s+OF\s+(\d+)|TIMESTAMP\s+AS\s+OF\s+'([^']+)')$/i))) {
        const target = m[2] !== undefined ? versionByNumber(s, Number(m[2])) : resolveTimestamp(s, m[3])
        assertReadable(s, target)
        const next = commit(s, `RESTORE (to v${target.v})`, [...target.files])
        setS(next)
        setOut({ message: `Restored to version ${target.v}. This created NEW version ${current(next).v}; history was not rewritten.` })
        mission('tt-restore')
        return
      }
      if (!SQL) throw new Error('SQL engine still loading…')
      if (/^(UPDATE|DELETE|INSERT|MERGE)\b/i.test(q)) {
        if (/^MERGE/i.test(q)) throw new Error('MERGE is not supported in this simulator. Try UPDATE, DELETE, or INSERT.')
        const db = new SQL.Database()
        try {
          db.run(`CREATE TABLE inventory (${COLS.join(', ')})`)
          for (const r of rowsOf(s, current(s))) db.run('INSERT INTO inventory VALUES (?, ?, ?, ?)', r)
          runSql(db, q)
          const rows = db.exec('SELECT * FROM inventory ORDER BY item_id')[0]?.values || []
          const name = `f${s.nextFile}.parquet`
          const op = q.split(/\s+/)[0].toUpperCase()
          const next = commit({ ...s, files: { ...s.files, [name]: { rows, deleted: false } }, nextFile: s.nextFile + 1 }, op, [name])
          setS(next)
          setOut({ message: `${op} committed as version ${current(next).v} (new file ${name}). The old files are now unreferenced, but they stay until VACUUM.` })
        } finally {
          db.close()
        }
        return
      }
      // SELECT with optional time travel
      const usedVersions = []
      let rewritten = q.replace(
        /\b((?:\w+\.)*)inventory(?:\s+VERSION\s+AS\s+OF\s+(\d+)|\s+TIMESTAMP\s+AS\s+OF\s+'([^']+)'|@v(\d+))/gi,
        (_, _ns, vNum, ts, atV) => {
          const ver = vNum !== undefined || atV !== undefined ? versionByNumber(s, Number(vNum ?? atV)) : resolveTimestamp(s, ts)
          assertReadable(s, ver)
          usedVersions.push({ ver, how: ts ? 'timestamp' : 'version' })
          return `inventory__v${ver.v}`
        },
      )
      rewritten = rewritten.replace(/\b(?:\w+\.)*inventory\b(?!__)/gi, () => {
        assertReadable(s, current(s))
        return `inventory__v${current(s).v}`
      })
      const db = new SQL.Database()
      try {
        for (const ver of s.versions) {
          if (!readable(s, ver)) continue
          db.run(`CREATE TABLE inventory__v${ver.v} (${COLS.join(', ')})`)
          for (const r of rowsOf(s, ver)) db.run(`INSERT INTO inventory__v${ver.v} VALUES (?, ?, ?, ?)`, r)
        }
        const result = runSql(db, rewritten)
        const label = usedVersions.length ? `Read version ${usedVersions.map((u) => u.ver.v).join(', ')}` : `Read current version ${current(s).v}`
        setOut({ result, label })
        if (usedVersions.some((u) => u.how === 'version' && u.ver.v !== current(s).v)) mission('tt-read-old')
        if (usedVersions.some((u) => u.how === 'timestamp')) mission('tt-timestamp')
      } finally {
        db.close()
      }
    } catch (e) {
      const msg = String(e.message || e).replace(/inventory__v\d+/g, 'inventory')
      setOut({ error: msg })
      if (/removed by VACUUM/.test(msg)) mission('tt-vacuum-break')
    }
  }

  const fileList = Object.entries(s.files).map(([f, info]) => {
    const t = tombstonedAt(s, f)
    return { f, deleted: info.deleted, live: t === null && current(s).files.includes(f), t }
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">⏳ Time Travel Timeline</h3>
        <span className="chip font-mono">
          <Clock size={12} /> now {fmt(s.now)}
        </span>
      </div>
      <p className="text-sm text-slate-400">
        Table <code className="text-amber-200">inventory</code>. Tap a version to load a query, then run commands below. Try VACUUM, then go back in time.
      </p>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {s.versions.map((ver) => {
          const ok = readable(s, ver)
          const cur = ver === current(s)
          return (
            <button
              key={ver.v}
              onClick={() => {
                const text = `SELECT * FROM inventory VERSION AS OF ${ver.v}`
                setSql(text)
                run(text)
              }}
              className={`relative w-28 shrink-0 rounded-xl border p-2 text-left text-[11px] ${
                cur ? 'border-brand bg-brand/10' : ok ? 'border-line bg-panel2' : 'border-rose-500/40 bg-rose-500/5 opacity-70'
              }`}
            >
              <div className="flex items-center gap-1 font-bold">
                v{ver.v} {ok ? <CircleCheck size={12} className="text-emerald-400" /> : <Skull size={12} className="text-rose-400" />}
                {cur && <span className="ml-auto text-[9px] text-brand2">CURRENT</span>}
              </div>
              <div className="mt-0.5 line-clamp-2 text-slate-300">{ver.op}</div>
              <div className="mt-1 font-mono text-[10px] text-slate-500">{fmt(ver.ts)}</div>
            </button>
          )
        })}
      </div>

      <div className="rounded-xl bg-ink/50 p-2">
        <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-400">
          <FileText size={12} /> Data files
        </div>
        <div className="flex flex-wrap gap-1.5">
          {fileList.map(({ f, deleted, live, t }) => (
            <span
              key={f}
              title={t ? `unreferenced since ${fmt(t)}` : ''}
              className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] ${
                deleted ? 'bg-rose-500/15 text-rose-300 line-through' : live ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-200'
              }`}
            >
              {f}
              {!deleted && !live && t ? ` · since ${fmt(t).slice(5, 10)}` : ''}
            </span>
          ))}
        </div>
        <div className="mt-1 text-[10px] text-slate-500">
          <span className="text-emerald-300">green</span>: used by current version · <span className="text-amber-200">amber</span>: unreferenced, VACUUM-able after
          retention · <span className="text-rose-300">struck</span>: deleted · safety check {s.safetyCheck ? 'ON' : 'OFF'}
        </div>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
        {PRESETS.map(([label, text]) => (
          <button key={label} onClick={() => setSql(text)} className="shrink-0 rounded-lg bg-panel2 px-2 py-1 text-[11px] font-semibold">
            {label}
          </button>
        ))}
      </div>
      <textarea
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        rows={2}
        spellCheck={false}
        autoCapitalize="off"
        className="w-full rounded-xl border border-line bg-ink p-2.5 font-mono text-[12px] text-emerald-100 outline-none focus:border-brand/70"
      />
      <div className="grid grid-cols-4 gap-2">
        <button onClick={() => run()} className="btn-primary col-span-2 py-2 text-sm">
          <Play size={15} /> Run
        </button>
        <button
          onClick={() => {
            setS({ ...s, now: s.now + 7 * 24 * HOUR })
            setOut({ message: 'Fast-forwarded the clock 7 days. Files unreferenced before the new cutoff are now VACUUM-able.' })
          }}
          className="btn-ghost px-2 py-2 text-xs"
          title="Advance clock 7 days"
        >
          <FastForward size={14} /> 7d
        </button>
        <button
          onClick={() => {
            setS(initial())
            setOut(null)
          }}
          className="btn-ghost px-2 py-2 text-xs"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {out?.error && <pre className="animate-shake whitespace-pre-wrap rounded-xl border border-rose-500/50 bg-rose-500/10 p-3 text-xs text-rose-200">{out.error}</pre>}
      {out?.message && <div className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-200">{out.message}</div>}
      {out?.result && (
        <div>
          {out.label && <div className="mb-1 text-xs text-slate-400">{out.label}</div>}
          <ResultTable result={out.result} />
        </div>
      )}

      <div className="rounded-xl border border-line p-3">
        <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Missions (+10 XP each)</div>
        {MISSIONS.map(([id, text]) => (
          <div key={id} className={`flex items-center gap-2 text-sm ${progress.labs[id] ? 'text-emerald-300' : 'text-slate-300'}`}>
            {progress.labs[id] ? '✅' : '⬜'} {text}
          </div>
        ))}
      </div>
    </div>
  )
}

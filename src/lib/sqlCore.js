// Engine-agnostic SQL helpers. Takes an initialised sql.js module so the same
// code runs in the browser (sqlEngine.js) and in Node tests.
import { SEED_SQL, SAMPLE_TABLES } from '../data/sampleDb.js'

// ---------- Databricks-flavoured shims on top of SQLite ----------

// Split SQL into [text, isStringLiteral] chunks so rewrites never touch
// the inside of '...' literals.
function splitLiterals(sql) {
  const parts = []
  let buf = ''
  let i = 0
  while (i < sql.length) {
    const ch = sql[i]
    if (ch === "'") {
      if (buf) parts.push([buf, false])
      let j = i + 1
      while (j < sql.length) {
        if (sql[j] === "'" && sql[j + 1] === "'") j += 2
        else if (sql[j] === "'") break
        else j++
      }
      parts.push([sql.slice(i, j + 1), true])
      buf = ''
      i = j + 1
    } else {
      buf += ch
      i++
    }
  }
  if (buf) parts.push([buf, false])
  return parts
}

// Split into statements on semicolons that are outside string literals.
function splitStatements(sql) {
  const out = ['']
  for (const [text, isLit] of splitLiterals(sql)) {
    if (isLit) {
      out[out.length - 1] += text
      continue
    }
    const pieces = text.split(';')
    out[out.length - 1] += pieces[0]
    for (const p of pieces.slice(1)) out.push(p)
  }
  return out
}

// Split "a INT, b DECIMAL(10,2)" on top-level commas.
function splitTopLevel(list) {
  const items = []
  let depth = 0
  let cur = ''
  for (const ch of list) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      items.push(cur)
      cur = ''
    } else cur += ch
  }
  items.push(cur)
  return items.map((s) => s.trim()).filter(Boolean)
}

// CTAS with a column list: CREATE TABLE t (a INT, b STRING) AS SELECT ...
// SQLite has no such form, so the column names are applied through a CTE.
const CTAS_COLS =
  /^(\s*CREATE\s+(?:OR\s+REPLACE\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[\w.]+)\s*\(((?:[^()]|\([^()]*\))*)\)\s*(?:USING\s+DELTA\s*)?(?:COMMENT\s+'(?:[^']|'')*'\s*)?AS\s+([\s\S]+)$/i

function rewriteCtasColumnList(stmt) {
  const m = stmt.match(CTAS_COLS)
  if (!m) return stmt
  const names = splitTopLevel(m[2]).map((c) => c.split(/\s+/)[0])
  return `${m[1]} AS WITH __ctas(${names.join(', ')}) AS (${m[3].trim()}) SELECT * FROM __ctas`
}

export function rewriteDatabricksSql(sql, extraTables = []) {
  const tables = [...SAMPLE_TABLES, ...extraTables].join('|')
  const threePart = new RegExp(`\\b[A-Za-z_]\\w*\\.[A-Za-z_]\\w*\\.(${tables}|[A-Za-z_]\\w*)\\b`, 'g')
  const withCtas = splitStatements(sql).map(rewriteCtasColumnList).join(';')
  return splitLiterals(withCtas)
    .map(([text, isLit]) => {
      if (isLit) return text
      return (
        text
          // catalog.schema.table -> table (the sandbox has a single schema)
          .replace(threePart, '$1')
          // CREATE OR REPLACE TABLE/VIEW -> DROP IF EXISTS + CREATE
          .replace(
            /\bCREATE\s+OR\s+REPLACE\s+(TEMP(?:ORARY)?\s+)?(TABLE|VIEW)\s+([A-Za-z_]\w*)/gi,
            (_, temp, kind, name) =>
              `DROP ${kind.toUpperCase()} IF EXISTS ${name}; CREATE ${temp ? 'TEMP ' : ''}${kind.toUpperCase()} ${name}`,
          )
          // Delta is the default format in Databricks; SQLite ignores it.
          .replace(/\s+USING\s+DELTA\b/gi, '')
          // Databricks type names SQLite doesn't know (affinity still works)
          .replace(/\bSTRING\b/gi, 'TEXT')
      )
    })
    .join('')
}

// ---------- Functions Databricks has and SQLite lacks ----------

function registerFunctions(db) {
  const nums = (arr) => arr.filter((v) => v !== null && v !== undefined && !Number.isNaN(Number(v))).map(Number)
  const agg = (name, finalize) =>
    db.create_aggregate(name, {
      init: () => [],
      step: (state, value) => {
        state.push(value)
        return state
      },
      finalize,
    })

  // Exact in the sandbox; in Databricks this is a HyperLogLog++ estimate.
  agg('approx_count_distinct', (s) => new Set(s.filter((v) => v !== null)).size)
  agg('count_if', (s) => s.filter((v) => v === 1 || v === true).length)
  const percentile = (values, p) => {
    const v = nums(values).sort((a, b) => a - b)
    if (!v.length) return null
    const pos = (v.length - 1) * p
    const lo = Math.floor(pos)
    const hi = Math.ceil(pos)
    return v[lo] + (v[hi] - v[lo]) * (pos - lo)
  }
  agg('median', (s) => percentile(s, 0.5))
  const variance = (s) => {
    const v = nums(s)
    if (v.length < 2) return null
    const mean = v.reduce((a, b) => a + b, 0) / v.length
    return v.reduce((a, b) => a + (b - mean) ** 2, 0) / (v.length - 1)
  }
  for (const n of ['variance', 'var_samp']) agg(n, variance)
  for (const n of ['stddev', 'stddev_samp', 'std']) agg(n, (s) => (variance(s) === null ? null : Math.sqrt(variance(s))))

  const pctAgg = (name, approx) =>
    db.create_aggregate(name, {
      init: () => ({ values: [], p: 0.5 }),
      step: (state, value, p) => {
        state.values.push(value)
        state.p = p
        return state
      },
      finalize: (state) => {
        if (!approx) return percentile(state.values, state.p)
        // percentile_approx returns an actual value from the column.
        const v = nums(state.values).sort((a, b) => a - b)
        if (!v.length) return null
        return v[Math.max(0, Math.ceil(state.p * v.length) - 1)]
      },
    })
  pctAgg('percentile', false)
  pctAgg('percentile_approx', true)

  db.create_function('nvl', (a, b) => (a === null ? b : a))
  db.create_function('year', (d) => (d ? Number(String(d).slice(0, 4)) : null))
  db.create_function('month', (d) => (d ? Number(String(d).slice(5, 7)) : null))
  db.create_function('day', (d) => (d ? Number(String(d).slice(8, 10)) : null))
  db.create_function('initcap', (s) =>
    s === null ? null : String(s).toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
  )
}

export function createDb(SQL, extraSql = '') {
  const db = new SQL.Database()
  registerFunctions(db)
  db.exec(SEED_SQL)
  if (extraSql) db.exec(extraSql)
  return db
}

// Runs every statement; returns the last result set (or a status message).
export function runSql(db, sql, extraTables) {
  const rewritten = rewriteDatabricksSql(sql, extraTables)
  let last = null
  let statements = 0
  const started = performance.now()
  for (const stmt of db.iterateStatements(rewritten)) {
    statements++
    const columns = stmt.getColumnNames()
    const rows = []
    while (stmt.step()) rows.push(stmt.get())
    if (columns.length) last = { columns, rows }
    else last = null
    stmt.free()
  }
  const ms = Math.round(performance.now() - started)
  if (statements === 0) throw new Error('Nothing to run - type a query first.')
  return last ? { ...last, ms } : { columns: [], rows: [], message: `OK - ${statements} statement(s) ran.`, ms }
}

// ---------- Result comparison ----------

function normCell(v) {
  if (v === null || v === undefined) return null
  if (typeof v === 'number') return Math.round(v * 100) / 100
  if (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim())) return Math.round(Number(v) * 100) / 100
  return v
}

const rowKey = (row) => JSON.stringify(row.map(normCell))
const sortedRowKey = (row) => JSON.stringify(row.map(normCell).map(String).sort())

export function compareResults(actual, expected, { ordered = false } = {}) {
  if (!actual || !actual.columns.length)
    return { ok: false, reason: 'Your SQL ran but returned no result set. The last statement should be a SELECT.' }
  if (actual.columns.length !== expected.columns.length)
    return {
      ok: false,
      reason: `Expected ${expected.columns.length} column(s) but got ${actual.columns.length}.`,
    }
  if (actual.rows.length !== expected.rows.length)
    return { ok: false, reason: `Expected ${expected.rows.length} row(s) but got ${actual.rows.length}.` }

  const same = (keyFn) => {
    const a = actual.rows.map(keyFn)
    const e = expected.rows.map(keyFn)
    if (!ordered) {
      a.sort()
      e.sort()
    }
    return a.every((k, i) => k === e[i])
  }
  if (same(rowKey)) return { ok: true }
  if (same(sortedRowKey)) return { ok: true, note: 'Columns are in a different order than the reference - still correct.' }
  if (ordered) {
    const unorderedOk = [...actual.rows.map(rowKey)].sort().join() === [...expected.rows.map(rowKey)].sort().join()
    if (unorderedOk) return { ok: false, reason: 'Right rows, wrong order. Check your ORDER BY.' }
  }
  return { ok: false, reason: 'Row and column counts match, but some values differ.' }
}

// Evaluates a challenge attempt against the reference solution, each on a
// fresh copy of the database so earlier experiments can't leak in.
export function checkChallenge(SQL, challenge, userSql) {
  const runOn = (sql) => {
    const db = createDb(SQL, challenge.setup || '')
    try {
      const res = runSql(db, sql)
      return challenge.check ? runSql(db, challenge.check) : res
    } finally {
      db.close()
    }
  }
  const expected = runOn(challenge.solution)
  let actual
  try {
    actual = runOn(userSql)
  } catch (e) {
    return { ok: false, error: friendlyError(e.message), expected }
  }
  const result = compareResults(actual, expected, { ordered: challenge.ordered })
  if (result.ok) {
    const miss = (challenge.mustMatch || []).find((m) => !m.re.test(userSql))
    if (miss) return { ok: false, reason: `Right data, but: ${miss.msg}`, actual, expected }
  }
  if (!result.ok && challenge.broken) {
    try {
      const brokenRes = runOn(challenge.broken)
      if (compareResults(actual, brokenRes, { ordered: challenge.ordered }).ok && challenge.brokenNote)
        result.reason = challenge.brokenNote
    } catch {
      /* the broken query errors outright; nothing to compare */
    }
  }
  return { ...result, actual, expected }
}

export function friendlyError(msg) {
  const m = String(msg)
  if (/misuse of aggregate/i.test(m))
    return `${m}\nHint: aggregates can't go in WHERE. Filter groups with HAVING (Databricks error: [INVALID_WHERE_CONDITION]).`
  if (/no such column/i.test(m)) return `${m}\nHint: check the column name and table alias (Databricks: [UNRESOLVED_COLUMN]).`
  if (/no such table/i.test(m)) return `${m}\nHint: check the table name (Databricks: [TABLE_OR_VIEW_NOT_FOUND]).`
  if (/ambiguous column/i.test(m))
    return `${m}\nHint: the column exists in more than one joined table - prefix it with an alias like c.customer_id.`
  return m
}

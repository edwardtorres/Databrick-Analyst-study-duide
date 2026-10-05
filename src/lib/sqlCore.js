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

// try_cast(expr AS type) -> __try_cast(expr, 'type'). SQLite has no try_cast,
// and its CAST turns junk like 'n/a' into 0 instead of NULL. Literal-aware,
// handles nesting; the AS that counts is the last one at the call's top level.
function rewriteTryCast(sql) {
  let out = ''
  let i = 0
  while (i < sql.length) {
    if (sql[i] === "'") {
      let j = i + 1
      while (j < sql.length && !(sql[j] === "'" && sql[j + 1] !== "'")) j += sql[j] === "'" ? 2 : 1
      out += sql.slice(i, j + 1)
      i = j + 1
      continue
    }
    const m = /^try_cast\s*\(/i.exec(sql.slice(i))
    if (m && !/\w/.test(sql[i - 1] || '')) {
      const start = i + m[0].length
      let depth = 1
      let asAt = -1
      let j = start
      while (j < sql.length && depth > 0) {
        const ch = sql[j]
        if (ch === "'") {
          j++
          while (j < sql.length && !(sql[j] === "'" && sql[j + 1] !== "'")) j += sql[j] === "'" ? 2 : 1
        } else if (ch === '(') depth++
        else if (ch === ')') depth--
        else if (depth === 1 && /^\sAS\s/i.test(sql.slice(j, j + 4))) asAt = j
        j++
      }
      if (depth === 0 && asAt > 0) {
        const type = sql.slice(asAt + 4, j - 1).trim().toUpperCase()
        out += `__try_cast(${rewriteTryCast(sql.slice(start, asAt))}, '${type}')`
        i = j
        continue
      }
    }
    out += sql[i]
    i++
  }
  return out
}

// Databricks try_cast semantics for the common types: NULL when the value
// can't be converted (instead of an error, or SQLite's silent 0). Simplified:
// integer types accept whole numbers only.
function tryCast(v, type) {
  if (v === null || v === undefined) return null
  const t = String(type).replace(/\(.*$/, '').trim()
  const str = String(v).trim()
  if (/^(TINYINT|SMALLINT|INT|INTEGER|BIGINT|LONG)$/.test(t)) return /^[+-]?\d+$/.test(str) ? Number(str) : null
  if (/^(DOUBLE|FLOAT|REAL|DECIMAL|DEC|NUMERIC)$/.test(t)) {
    if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(str)) return null
    const scale = String(type).match(/,\s*(\d+)\s*\)/)
    return scale ? Number(Number(str).toFixed(Number(scale[1]))) : Number(str)
  }
  if (t === 'DATE') return /^\d{4}-\d{2}-\d{2}$/.test(str) && !Number.isNaN(Date.parse(str)) ? str : null
  if (t === 'BOOLEAN') return /^(true|false)$/i.test(str) ? (/^true$/i.test(str) ? 1 : 0) : null
  if (t === 'STRING' || t === 'TEXT') return String(v)
  return v
}

export function rewriteDatabricksSql(sql, extraTables = []) {
  const tables = [...SAMPLE_TABLES, ...extraTables].join('|')
  const threePart = new RegExp(`\\b[A-Za-z_]\\w*\\.[A-Za-z_]\\w*\\.(${tables}|[A-Za-z_]\\w*)\\b`, 'g')
  const withCtas = splitStatements(rewriteTryCast(sql)).map(rewriteCtasColumnList).join(';')
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

  db.create_function('__try_cast', tryCast)
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

// Allow reordered SELECT columns only when one consistent permutation works
// for every row. Sorting cells within each row loses column relationships.
function reorderedColumnsMatch(actual, expected, ordered) {
  const signature = (rows, col) => {
    const cells = rows.map((row) => JSON.stringify(normCell(row[col])))
    if (!ordered) cells.sort()
    return JSON.stringify(cells)
  }
  const a = actual.columns.map((_, col) => signature(actual.rows, col))
  const e = expected.columns.map((_, col) => signature(expected.rows, col))
  const candidates = e.map((s) => a.flatMap((v, col) => v === s ? [col] : []))
  if (candidates.some((cols) => !cols.length)) return false
  const mapping = []
  const used = new Set()
  const search = (col) => {
    if (col === e.length) {
      const rows = actual.rows.map((row) => rowKey(mapping.map((i) => row[i])))
      const reference = expected.rows.map(rowKey)
      if (!ordered) { rows.sort(); reference.sort() }
      return rows.every((row, i) => row === reference[i])
    }
    for (const i of candidates[col]) {
      if (used.has(i)) continue
      used.add(i)
      mapping[col] = i
      if (search(col + 1)) return true
      used.delete(i)
    }
    return false
  }
  return search(0)
}

// Syntax requirements must be present in executable SQL, not in a comment
// or quoted text. Replace quoted identifiers with a placeholder so a name
// such as "CREATE VIEW" cannot satisfy a required SQL command either.
function executableSql(sql) {
  return sql.replace(/--[^\r\n]*|\/\*[\s\S]*?\*\/|'(?:[^']|'')*'|"(?:[^"]|"")*"|`(?:[^`]|``)*`|\[[^\]]*\]/g,
    (token) => token.startsWith('--') || token.startsWith('/*') || token.startsWith("'") ? ' ' : '__quoted_identifier__')
}

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
  if (reorderedColumnsMatch(actual, expected, ordered)) return { ok: true, note: 'Columns are in a different order than the reference - still correct.' }
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
    const code = executableSql(userSql)
    const miss = (challenge.mustMatch || []).find((m) => !m.re.test(code))
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

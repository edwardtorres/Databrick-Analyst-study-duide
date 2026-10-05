import { test } from 'node:test'
import assert from 'node:assert/strict'
import initSqlJs from 'sql.js'
import { checkChallenge, compareResults, createDb, runSql } from '../src/lib/sqlCore.js'
import { challenges as ch4 } from '../src/data/ch4/challenges.js'
import { challenges as ch5 } from '../src/data/ch5/challenges.js'
import { challenges as ch2 } from '../src/data/ch2/challenges.js'
import { challenges as ch8 } from '../src/data/ch8/challenges.js'

const challenges = [...ch2, ...ch4, ...ch5, ...ch8]

const SQL = await initSqlJs()

test('result grading rejects columns that swap positions between rows', () => {
  const expected = { columns: ['id', 'value'], rows: [[1, 2], [3, 4]] }
  const actual = { columns: ['id', 'value'], rows: [[1, 2], [4, 3]] }
  assert.equal(compareResults(actual, expected).ok, false)
})

test('result grading accepts one consistent column permutation and preserves row order rules', () => {
  const expected = { columns: ['id', 'value'], rows: [[1, 2], [3, 4]] }
  const actual = { columns: ['value', 'id'], rows: [[2, 1], [4, 3]] }
  assert.equal(compareResults(actual, expected, { ordered: true }).ok, true)
  actual.rows.reverse()
  assert.equal(compareResults(actual, expected).ok, true)
  assert.equal(compareResults(actual, expected, { ordered: true }).ok, false)
})

test('result grading distinguishes NULL from the text null even when columns are reordered', () => {
  const expected = { columns: ['a', 'b'], rows: [[null, 1]] }
  const actual = { columns: ['b', 'a'], rows: [[1, 'null']] }
  assert.equal(compareResults(actual, expected).ok, false)
})

test('column mapping preserves row relationships when column distributions are identical', () => {
  const expected = { columns: ['a', 'b'], rows: [[1, 1], [2, 2]] }
  const actual = { columns: ['a', 'b'], rows: [[1, 2], [2, 1]] }
  assert.equal(compareResults(actual, expected).ok, false)
})

test('required DDL cannot be supplied by a comment or string literal', () => {
  const ch = ch4.find((c) => c.id === 'c4-ddl-view')
  const body = ch.solution.replace(/CREATE\s+(?:OR\s+REPLACE\s+)?VIEW/i, 'CREATE TABLE')
  for (const prefix of ['-- CREATE VIEW\n', '/* CREATE VIEW */\n', "SELECT 'CREATE VIEW';\n", 'SELECT 1 AS "CREATE VIEW";\n']) {
    assert.equal(checkChallenge(SQL, ch, prefix + body).ok, false, prefix)
  }
  assert.equal(checkChallenge(SQL, ch, '-- a useful comment\n' + ch.solution).ok, true)
})

for (const ch of challenges) {
  test(`${ch.id}: reference solution passes`, () => {
    const r = checkChallenge(SQL, ch, ch.solution)
    assert.equal(r.ok, true, r.reason || r.error)
    assert.ok(r.expected.rows.length > 0, 'expected result should not be empty')
  })
  if (ch.starter && ch.kind === 'fix') {
    test(`${ch.id}: starter (broken) query fails`, () => {
      const r = checkChallenge(SQL, ch, ch.starter)
      assert.equal(r.ok, false)
    })
  }
}

test('shims: 3-part names, CREATE OR REPLACE, USING DELTA, functions', () => {
  const db = createDb(SQL)
  runSql(db, 'CREATE OR REPLACE TABLE t (id INT, s STRING) USING DELTA; CREATE OR REPLACE TABLE t (id INT)')
  const r = runSql(db, "SELECT COUNT(*), approx_count_distinct(region_id), median(region_id), 'a.b.c' FROM quest.retail.customers")
  assert.deepEqual(r.rows[0], [12, 5, 2, 'a.b.c'])
})

test('empty SELECT still returns columns', () => {
  const db = createDb(SQL)
  const r = runSql(db, 'SELECT name FROM customers WHERE 1 = 0')
  assert.deepEqual(r.columns, ['name'])
  assert.equal(r.rows.length, 0)
})

test('wrong order is reported for ordered challenges', () => {
  const ch = challenges.find((c) => c.id === 'c4-sql-filter-sort')
  const r = checkChallenge(SQL, ch, ch.solution.replace('DESC', 'ASC'))
  assert.equal(r.ok, false)
  assert.match(r.reason, /order/i)
})

test('mustMatch rejects DROP + CREATE', () => {
  const ch = challenges.find((c) => c.id === 'c4-ddl-replace')
  const r = checkChallenge(SQL, ch, 'DROP TABLE gold_tier_counts; CREATE TABLE gold_tier_counts AS SELECT tier, COUNT(*) FROM customers GROUP BY tier')
  assert.equal(r.ok, false)
})

test('c4-ddl-ctas accepts a CTAS with a column list (audit F5)', () => {
  const ch = challenges.find((c) => c.id === 'c4-ddl-ctas')
  const body = `SELECT p.category, SUM(o.amount) FROM orders o JOIN products p ON o.product_id = p.product_id
WHERE o.status = 'completed' GROUP BY p.category`
  for (const sql of [
    `CREATE TABLE gold_category_sales (category STRING, revenue DOUBLE) AS ${body}`,
    `CREATE TABLE quest.retail.gold_category_sales (category, revenue) USING DELTA AS ${body}`,
    `CREATE OR REPLACE TABLE gold_category_sales AS ${body}`,
  ]) {
    const r = checkChallenge(SQL, ch, sql)
    assert.equal(r.ok, true, `${sql}\n${r.reason || r.error}`)
  }
  // An INSERT-based approach still isn't a CTAS
  const r = checkChallenge(SQL, ch, `CREATE TABLE gold_category_sales (category TEXT, revenue REAL); INSERT INTO gold_category_sales ${body}`)
  assert.equal(r.ok, false)
})

test('Chapter 5 fix challenges: the broken query runs (wrong result, not an error)', () => {
  for (const ch of ch5) {
    const r = checkChallenge(SQL, ch, ch.starter)
    assert.equal(r.ok, false, ch.id)
    assert.ok(!r.error, `${ch.id} broken query should run: ${r.error}`)
    assert.ok(ch.brokenNote, ch.id)
    assert.equal(r.reason, ch.brokenNote, `${ch.id}: running the starter should explain the trap`)
  }
})

test('Chapter 2 and 8 fix challenges: the broken query runs and explains the trap', () => {
  for (const ch of [...ch2, ...ch8].filter((c) => c.kind === 'fix')) {
    const r = checkChallenge(SQL, ch, ch.starter)
    assert.ok(!r.error, `${ch.id}: ${r.error}`)
    assert.equal(r.reason, ch.brokenNote, ch.id)
  }
})

test('Chapter 2 cleaning: common alternative answers are accepted', () => {
  const by = (id) => ch2.find((c) => c.id === id)
  const alts = {
    'c2-clean-email': "SELECT name, COALESCE(NULLIF(NULLIF(TRIM(email), ''), 'N/A'), 'unknown') FROM customers",
    'c2-fix-usable-email': "SELECT COUNT(NULLIF(NULLIF(TRIM(email), ''), 'N/A')) FROM customers",
    'c2-clean-distinct': 'SELECT customer_id, name FROM customers_load GROUP BY customer_id, name',
    'c2-fix-cast': "SELECT SUM(try_cast(REPLACE(amount_text, '$', '') AS DOUBLE)) FROM raw_payments",
    'c2-clean-region': "SELECT COALESCE(r.region_name, 'Unassigned'), COUNT(c.customer_id) FROM customers c LEFT JOIN regions r USING (region_id) GROUP BY 1",
  }
  for (const [id, sql] of Object.entries(alts)) {
    const r = checkChallenge(SQL, by(id), sql)
    assert.equal(r.ok, true, `${id}: ${r.reason || r.error}`)
  }
  // the naive versions are rejected
  assert.equal(checkChallenge(SQL, by('c2-clean-distinct'), 'SELECT customer_id, name FROM customers_load').ok, false)
  assert.equal(checkChallenge(SQL, by('c2-clean-latest'), 'SELECT DISTINCT LOWER(TRIM(email)), LOWER(TRIM(tier)) FROM raw_signups').ok, false)
  assert.equal(checkChallenge(SQL, by('c2-clean-region'), 'SELECT r.region_name, COUNT(*) FROM customers c JOIN regions r ON c.region_id = r.region_id GROUP BY 1').ok, false)
})

test('try_cast returns NULL for junk, works nested, and leaves literals alone', () => {
  const db = createDb(SQL)
  const r = runSql(
    db,
    "SELECT try_cast('12.5' AS DOUBLE), try_cast('n/a' AS DOUBLE), TRY_CAST(' 7 ' AS INT), try_cast('x' AS INT), try_cast('2025-02-03' AS DATE), try_cast('2025-13-45' AS DATE), try_cast(REPLACE('$1.255', '$', '') AS DECIMAL(10,2)), try_cast(try_cast('3' AS INT) AS STRING), 'try_cast(a AS INT)'",
  )
  assert.deepEqual(r.rows[0], [12.5, null, 7, null, '2025-02-03', null, 1.25, '3', 'try_cast(a AS INT)'])
  assert.deepEqual(runSql(db, 'SELECT try_cast(NULL AS INT), try_cast(customer_id AS STRING) FROM customers WHERE customer_id = 1').rows[0], [null, '1'])
})

test('Chapter 8: alternative fixes and the inner-join trap', () => {
  const by = (id) => ch8.find((c) => c.id === id)
  const maxFix = `SELECT p.category, SUM(o.amount), MAX(t.target) FROM orders o JOIN products p ON o.product_id = p.product_id
JOIN category_targets t ON t.category = p.category WHERE o.status = 'completed' GROUP BY p.category`
  assert.equal(checkChallenge(SQL, by('c8-fix-fanout'), maxFix).ok, true)
  // inner joins drop the orphan orders, so the totals don't reconcile
  const inner = `SELECT r.region_name, SUM(o.amount) FROM orders o JOIN customers c ON o.customer_id = c.customer_id
JOIN regions r ON c.region_id = r.region_id WHERE o.status = 'completed' GROUP BY r.region_name`
  assert.equal(checkChallenge(SQL, by('c8-unknown-member'), inner).ok, false)
  assert.equal(checkChallenge(SQL, by('c8-snowflake-region'), inner).ok, true)
})

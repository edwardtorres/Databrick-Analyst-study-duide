import { test } from 'node:test'
import assert from 'node:assert/strict'
import initSqlJs from 'sql.js'
import { checkChallenge, createDb, runSql } from '../src/lib/sqlCore.js'
import { challenges as ch4 } from '../src/data/ch4/challenges.js'
import { challenges as ch5 } from '../src/data/ch5/challenges.js'

const challenges = [...ch4, ...ch5]

const SQL = await initSqlJs()

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

import { test } from 'node:test'
import assert from 'node:assert/strict'
import initSqlJs from 'sql.js'
import { checkChallenge, createDb, runSql } from '../src/lib/sqlCore.js'
import { challenges } from '../src/data/ch4/challenges.js'

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

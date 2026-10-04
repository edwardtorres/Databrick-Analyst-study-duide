import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LAYERS, CARDS, sanitizeMedallion, medallionScore, emptyMedallion } from '../src/lib/medallionSorter.js'
import { GRAINS, TABLES, COLUMNS, SNOWFLAKE, sanitizeStar, starStatus, emptyStar } from '../src/lib/starSchema.js'

test('medallion sorter: every layer has cards, every card is explained', () => {
  assert.ok(CARDS.length >= 10)
  assert.equal(new Set(CARDS.map((c) => c.id)).size, CARDS.length)
  for (const l of Object.keys(LAYERS)) assert.ok(CARDS.filter((c) => c.answer === l).length >= 3, l)
  for (const c of CARDS) assert.ok(LAYERS[c.answer] && c.why.length > 20, c.id)
})

test('medallion sorter: scoring and sanitizing', () => {
  assert.deepEqual(medallionScore(emptyMedallion()), { correct: 0, placed: 0, total: CARDS.length, allRight: false })
  const all = { placed: Object.fromEntries(CARDS.map((c) => [c.id, c.answer])) }
  assert.equal(medallionScore(all).allRight, true)
  const oneWrong = { placed: { ...all.placed, vault: 'gold' } }
  assert.deepEqual([medallionScore(oneWrong).correct, medallionScore(oneWrong).allRight], [CARDS.length - 1, false])
  assert.deepEqual(sanitizeMedallion({ placed: { vault: 'silver', nope: 'gold', kpi: 'platinum' } }), { placed: { vault: 'silver' } })
  assert.deepEqual(sanitizeMedallion('junk'), { placed: {} })
})

test('star schema: one correct grain and snowflake, every option and column explained', () => {
  assert.equal(GRAINS.filter((g) => g.ok).length, 1)
  assert.equal(SNOWFLAKE.filter((o) => o.ok).length, 1)
  for (const o of [...GRAINS, ...SNOWFLAKE]) assert.ok(o.why.length > 20, o.id)
  for (const c of COLUMNS) assert.ok(TABLES[c.answer] && c.why.length > 15, c.id)
  for (const t of Object.keys(TABLES)) assert.ok(COLUMNS.some((c) => c.answer === t), t)
})

test('star schema: status follows answers; sanitize drops junk', () => {
  assert.deepEqual(starStatus(emptyStar()), { grain: false, columns: false, correctCols: 0, placedCols: 0, snowflake: false })
  const done = { grain: 'line', snow: 'region', place: Object.fromEntries(COLUMNS.map((c) => [c.id, c.answer])) }
  const st = starStatus(done)
  assert.deepEqual([st.grain, st.columns, st.snowflake], [true, true, true])
  assert.equal(starStatus({ ...done, place: { ...done.place, region_name: 'fact_sales' } }).columns, false)
  assert.deepEqual(sanitizeStar({ grain: 'x', snow: 'region', place: { quantity: 'fact_sales', bogus: 'dim_date', brand: 'dim_nope' } }), { grain: null, snow: 'region', place: { quantity: 'fact_sales' } })
})

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { METHODS, SCENARIOS } from '../src/lib/ingestionPicker.js'
import { checkFile, checkDestination, preview, createIssues, INFERRED, CATALOGS, NAMES } from '../src/lib/uploadWizard.js'

test('ingestion picker: 10+ scenarios, each with 4 explained options including the answer', () => {
  assert.ok(SCENARIOS.length >= 10)
  assert.equal(new Set(SCENARIOS.map((s) => s.id)).size, SCENARIOS.length)
  for (const s of SCENARIOS) {
    assert.equal(s.options.length, 4, s.id)
    assert.equal(new Set(s.options).size, 4, s.id)
    assert.ok(s.options.includes(s.answer), s.id)
    for (const o of s.options) {
      assert.ok(METHODS[o], `${s.id}: unknown method ${o}`)
      assert.ok(s.why[o]?.length > 20, `${s.id}: missing why for ${o}`)
    }
  }
  const answers = new Set(SCENARIOS.map((s) => s.answer))
  for (const m of ['autoloader', 'copyinto', 'ctas', 'upload', 'sharing', 'market', 'api']) assert.ok(answers.has(m), m)
})

test('upload wizard: only the CSV is accepted; video and oversized files are explained', () => {
  assert.equal(checkFile('targets').ok, true)
  assert.deepEqual([checkFile('video').ok, checkFile('video').code], [false, 'format'])
  assert.deepEqual([checkFile('clicks').ok, checkFile('clicks').code], [false, 'size'])
})

test('upload wizard: destination mistakes', () => {
  assert.equal(checkDestination('prod', 'sales', 'store_targets').code, 'privilege')
  assert.match(checkDestination('prod', 'sales', 'store_targets').msg, /CREATE TABLE/)
  assert.equal(checkDestination('main', 'default', 'store_targets').code, 'wrong-schema')
  assert.equal(checkDestination('samples', 'tpch', 'store_targets').code, 'readonly')
  assert.equal(checkDestination('main', 'marketing', NAMES[1]).code, 'name')
  assert.equal(checkDestination('main', null, 'store_targets').code, 'pick')
  assert.equal(checkDestination('main', 'marketing', 'store_targets').ok, true)
  // every schema in the mock is reachable and classified
  for (const [c, schemas] of Object.entries(CATALOGS)) for (const s of Object.keys(schemas)) assert.ok(checkDestination(c, s, 'store_targets').code !== 'pick')
})

test('upload wizard: header off reads the header as data, all STRING', () => {
  const p = preview(false, INFERRED)
  assert.deepEqual(p.columns.map((c) => c.name), ['_c0', '_c1', '_c2', '_c3'])
  assert.ok(p.columns.every((c) => c.type === 'STRING'))
  assert.equal(p.rows[0][0], 'store_id')
  assert.deepEqual(createIssues({ header: false, types: INFERRED }).map((i) => i.code), ['header'])
})

test('upload wizard: inferred BIGINT zip loses leading zeros until fixed', () => {
  const p = preview(true, INFERRED)
  assert.equal(p.rows[0][1], '2134')
  assert.deepEqual(createIssues({ header: true, types: INFERRED }).map((i) => i.code), ['zip'])
  const fixed = { ...INFERRED, store_zip: 'STRING' }
  assert.equal(preview(true, fixed).rows[0][1], '02134')
  assert.deepEqual(createIssues({ header: true, types: fixed }), [])
  assert.deepEqual(createIssues({ header: true, types: { ...fixed, target_amount: 'DECIMAL(12,2)' } }), [])
  // breaking a correct type is caught too
  assert.deepEqual(createIssues({ header: true, types: { ...fixed, target_amount: 'BIGINT', month_start: 'STRING' } }).map((i) => i.code), ['amount', 'date'])
})

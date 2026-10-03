import { test } from 'node:test'
import assert from 'node:assert/strict'
import { scoreGenie, simulate, emptyGenieConfig, sanitizeGenieConfig, INSTRUCTION_SNIPPETS, SIM_QUESTIONS } from '../src/lib/genieLab.js'

const goodText = INSTRUCTION_SNIPPETS.filter((s) => s.good).map((s) => s.text).join('\n')
const perfect = {
  warehouse: 'serverless',
  tables: ['sales_daily', 'dim_store', 'dim_product', 'returns'],
  instructions: goodText,
  samples: ['sq-region', 'sq-products', 'sq-returns'],
  trusted: ['ta-region', 'ta-returns'],
}

test('a well-built space scores 100 and every question goes well', () => {
  assert.equal(scoreGenie(perfect).total, 100)
  const outcomes = Object.fromEntries(SIM_QUESTIONS.map((q) => [q.id, simulate(perfect, q.id).outcome]))
  assert.deepEqual(outcomes, { 'q-emea': 'success', 'q-products': 'success', 'q-region': 'trusted', 'q-returns': 'trusted', 'q-salary': 'blocked' })
})

test('an empty space scores 0 and nothing can be answered', () => {
  const cfg = emptyGenieConfig()
  assert.equal(scoreGenie(cfg).total, 0)
  assert.equal(simulate(cfg, 'q-emea').outcome, 'fail')
})

test('missing instructions produce wrong-but-plausible answers', () => {
  const cfg = { ...perfect, instructions: '' }
  const r = simulate(cfg, 'q-emea')
  assert.equal(r.outcome, 'partial')
  assert.match(r.text, /gross_revenue/)
  assert.match(r.text, /calendar quarter/)
})

test('noise and sensitive tables cost points and cause problems', () => {
  const cfg = { ...perfect, tables: [...perfect.tables, 'pos_raw', 'hr_salaries'] }
  assert.ok(scoreGenie(cfg).total < 80)
  assert.equal(simulate(cfg, 'q-salary').outcome, 'partial')
  assert.equal(simulate(cfg, 'q-region').outcome, 'partial') // raw table competes, even with a trusted asset
})

test('Genie needs a Pro or Serverless SQL warehouse', () => {
  assert.equal(simulate({ ...perfect, warehouse: 'cluster' }, 'q-products').outcome, 'fail')
  assert.equal(simulate({ ...perfect, warehouse: 'classic' }, 'q-products').outcome, 'fail')
})

test('a hard-coded query marked trusted is penalised', () => {
  assert.equal(scoreGenie({ ...perfect, trusted: [...perfect.trusted, 'ta-hardcoded'] }).sections.find((s) => s.id === 'trusted').points, 10)
})

test('saved config is sanitized', () => {
  assert.deepEqual(sanitizeGenieConfig({ warehouse: 'gpu', tables: ['sales_daily', 'nope', 'sales_daily'], instructions: 5 }), {
    ...emptyGenieConfig(),
    tables: ['sales_daily'],
  })
})

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SCENARIOS, CHART_TYPES, toSpec, judge } from '../src/lib/chartPicker.js'
import { simulate, emptyDashboardConfig, sanitizeDashboardConfig } from '../src/lib/dashboardLab.js'

test('chart picker: every scenario explains every chart type and has a valid best answer', () => {
  const ids = CHART_TYPES.map((c) => c.id)
  for (const s of SCENARIOS) {
    assert.ok(ids.includes(s.best), s.id)
    for (const t of ids) assert.ok(s.why[t] && s.why[t].length > 15, `${s.id}: missing why for ${t}`)
    assert.equal(judge(s, s.best), 'best')
    for (const o of s.ok) assert.equal(judge(s, o), 'ok')
  }
})

test('chart picker: every data shape converts to a render spec for every chart type', () => {
  for (const s of SCENARIOS)
    for (const t of CHART_TYPES) {
      const spec = toSpec(s.data, t.id)
      assert.ok(spec && spec.kind, `${s.id}/${t.id}`)
      if (spec.kind === 'none') assert.ok(spec.reason)
    }
  // the best choice always renders something real
  for (const s of SCENARIOS) assert.notEqual(toSpec(s.data, s.best).kind, 'none', s.id)
})

test('chart picker: histogram bins count every value', () => {
  const s = SCENARIOS.find((x) => x.id === 'distribution')
  const spec = toSpec(s.data, 'histogram')
  assert.equal(spec.bins.reduce((a, b) => a + b.count, 0), s.data.values.length)
})

const good = {
  binding: 'param',
  paramDefault: 'EMEA',
  schedule: 'daily6',
  operator: '<',
  threshold: 50000,
  destination: 'slack',
  credentials: 'embedded',
  shareWith: 'managers',
}

test('dashboard lab: the right setup meets every requirement', () => {
  const r = simulate(good)
  assert.equal(r.complete, true, JSON.stringify(r.checks.filter((c) => !c.ok)))
})

test('dashboard lab: a field filter cannot drive a SQL parameter', () => {
  const r = simulate({ ...good, binding: 'filter' })
  const apac = r.checks.find((c) => c.id === 'apac')
  assert.equal(apac.ok, false)
  assert.match(apac.text, /empty chart/)
  assert.match(simulate({ ...good, binding: 'filter', paramDefault: '' }).checks.find((c) => c.id === 'apac').text, /missing-parameter/)
})

test('dashboard lab: alert operator, threshold and destination all matter', () => {
  const alert = (cfg) => simulate({ ...good, ...cfg }).checks.find((c) => c.id === 'alert')
  assert.equal(alert({}).ok, true)
  assert.match(alert({ operator: '>' }).text, /OK \(not triggered\)/)
  assert.equal(alert({ destination: 'email' }).ok, false)
  assert.match(alert({ destination: 'none' }).text, /nobody was told/)
})

test('dashboard lab: individual credentials block Omar; sharing with everyone lets Priya in', () => {
  const v = (cfg, id) => simulate({ ...good, ...cfg }).checks.find((c) => c.id === `viewer-${id}`)
  assert.equal(v({ credentials: 'individual' }, 'omar').ok, false)
  assert.equal(v({ credentials: 'individual' }, 'maya').ok, true)
  assert.equal(v({ shareWith: 'all' }, 'priya').ok, false)
  assert.equal(simulate({ ...good, schedule: 'hourly' }).complete, false)
})

test('dashboard lab: config is sanitized', () => {
  assert.deepEqual(sanitizeDashboardConfig({ binding: 'magic', threshold: 50000, shareWith: 'managers' }), {
    ...emptyDashboardConfig(),
    threshold: 50000,
    shareWith: 'managers',
  })
})

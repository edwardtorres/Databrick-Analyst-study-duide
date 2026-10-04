import { test } from 'node:test'
import assert from 'node:assert/strict'
import { COMPONENTS, SCENARIOS } from '../src/lib/platformMatch.js'

test('platform match: every scenario has a valid answer among 4 explained options', () => {
  assert.ok(SCENARIOS.length >= 8)
  for (const s of SCENARIOS) {
    assert.equal(s.options.length, 4, s.id)
    assert.ok(s.options.includes(s.answer), s.id)
    for (const o of s.options) {
      assert.ok(COMPONENTS[o], `${s.id}: unknown component ${o}`)
      assert.ok(s.why[o] && s.why[o].length > 20, `${s.id}: missing why for ${o}`)
    }
  }
  // every core component is the answer at least once
  const answers = new Set(SCENARIOS.map((s) => s.answer))
  for (const c of ['delta', 'uc', 'dbsql', 'jobs', 'ldp', 'mosaic', 'die', 'market']) assert.ok(answers.has(c), c)
})

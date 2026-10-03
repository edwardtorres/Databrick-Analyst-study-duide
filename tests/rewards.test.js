import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bossCompletionBonus } from '../src/lib/bossRewards.js'
import { XP } from '../src/lib/levels.js'

const base = { total: 45, full: true, lastBonusDay: null, today: '2026-10-03' }

test('boss bonus requires at least 80% of questions answered', () => {
  assert.equal(bossCompletionBonus({ ...base, answered: 0 }).bonus, 0)
  assert.equal(bossCompletionBonus({ ...base, answered: 35 }).bonus, 0) // 77.8%
  assert.equal(bossCompletionBonus({ ...base, answered: 36 }).bonus, XP.bossComplete) // exactly 80%
  assert.equal(bossCompletionBonus({ ...base, answered: 35 }).reason, 'answered')
})

test('boss bonus is paid at most once per calendar day', () => {
  const first = bossCompletionBonus({ ...base, answered: 45 })
  assert.equal(first.bonus, XP.bossComplete)
  const again = bossCompletionBonus({ ...base, answered: 45, lastBonusDay: '2026-10-03' })
  assert.deepEqual(again, { bonus: 0, reason: 'daily' })
  const tomorrow = bossCompletionBonus({ ...base, answered: 45, lastBonusDay: '2026-10-03', today: '2026-10-04' })
  assert.equal(tomorrow.bonus, XP.bossComplete)
})

test('mini-boss pays the smaller bonus; empty exam pays nothing', () => {
  assert.equal(bossCompletionBonus({ ...base, full: false, total: 42, answered: 42 }).bonus, XP.bossMiniComplete)
  assert.equal(bossCompletionBonus({ ...base, total: 0, answered: 0 }).bonus, 0)
})

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SECTION_WEIGHTS } from '../src/data/examInfo.js'
import { rescaledWeights, bossAllocation } from '../src/lib/bossWeights.js'

test('section weights match the official exam page and sum to 100', () => {
  assert.deepEqual(SECTION_WEIGHTS, { 1: 11, 2: 8, 3: 5, 4: 20, 5: 15, 6: 16, 7: 12, 8: 5, 9: 8 })
  assert.equal(Object.values(SECTION_WEIGHTS).reduce((a, b) => a + b, 0), 100)
})

test('weights rescale to the built chapters and sum to 1', () => {
  const w = rescaledWeights([4, 7, 9])
  assert.ok(Math.abs(Object.values(w).reduce((a, b) => a + b, 0) - 1) < 1e-9)
  assert.ok(Math.abs(w[9] - 8 / 40) < 1e-9)
  assert.ok(Math.abs(w[4] - 20 / 40) < 1e-9)
  assert.ok(w[4] > w[7])
})

test('45 questions over chapters 4, 7, 9 follow the weights', () => {
  // 20 : 12 : 8 of 45 = 22.5 : 13.5 : 9, largest remainder (tie goes to the first)
  assert.deepEqual(bossAllocation({ 4: 42, 7: 18, 9: 21 }, 45), { 4: 23, 7: 13, 9: 9 })
})

test('a chapter with too few questions gives its share to the others', () => {
  const a = bossAllocation({ 4: 42, 7: 5, 9: 21 }, 45)
  assert.equal(a[7], 5)
  assert.equal(a[4] + a[7] + a[9], 45)
  assert.ok(a[4] > a[9])
})

test('never asks for more questions than exist', () => {
  assert.deepEqual(bossAllocation({ 4: 10, 9: 5 }, 45), { 4: 10, 9: 5 })
  const all = { 1: 50, 2: 50, 3: 50, 4: 50, 5: 50, 6: 50, 7: 50, 8: 50, 9: 50 }
  const a = bossAllocation(all, 45)
  assert.equal(Object.values(a).reduce((x, y) => x + y, 0), 45)
  assert.ok(a[1] > a[3]) // 11% vs 5%
})

test('with all 9 chapters built, the Boss draws exactly 45 in the exam mix', async () => {
  const pool = {}
  for (let n = 1; n <= 9; n++) pool[n] = (await import(`../src/data/ch${n}/questions.js`)).questions.length
  const a = bossAllocation(pool, 45)
  assert.equal(Object.values(a).reduce((x, y) => x + y, 0), 45)
  // 11 · 8 · 5 · 20 · 15 · 16 · 12 · 5 · 8 % of 45, largest remainder
  assert.deepEqual(a, { 1: 5, 2: 4, 3: 2, 4: 9, 5: 7, 6: 7, 7: 5, 8: 2, 9: 4 })
  const w = rescaledWeights([1, 2, 3, 4, 5, 6, 7, 8, 9])
  for (const [id, pct] of Object.entries(SECTION_WEIGHTS)) assert.ok(Math.abs(w[id] - pct / 100) < 1e-9, id)
})

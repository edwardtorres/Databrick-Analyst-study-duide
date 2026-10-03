import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SECTION_WEIGHTS } from '../src/data/examInfo.js'
import { rescaledWeights, bossAllocation } from '../src/lib/bossWeights.js'

test('section weights: known values, remainder split evenly over 4-7, sum 100', () => {
  assert.deepEqual([1, 2, 3, 8, 9].map((s) => SECTION_WEIGHTS[s]), [11, 8, 5, 5, 8])
  for (const s of [4, 5, 6, 7]) assert.equal(SECTION_WEIGHTS[s], 15.75)
  assert.equal(Object.values(SECTION_WEIGHTS).reduce((a, b) => a + b, 0), 100)
})

test('weights rescale to the built chapters and sum to 1', () => {
  const w = rescaledWeights([4, 7, 9])
  assert.ok(Math.abs(Object.values(w).reduce((a, b) => a + b, 0) - 1) < 1e-9)
  assert.ok(Math.abs(w[9] - 8 / 39.5) < 1e-9)
  assert.equal(w[4], w[7])
})

test('45 questions over chapters 4, 7, 9 follow the weights', () => {
  assert.deepEqual(bossAllocation({ 4: 42, 7: 18, 9: 21 }, 45), { 4: 18, 7: 18, 9: 9 })
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

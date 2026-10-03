import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseProgress, emptyProgress, deepMerge } from '../src/lib/progressSchema.js'

test('a valid export round-trips', () => {
  const p = { ...emptyProgress(), xp: 420, cards: { a: true }, questions: { q1: { box: 2, seen: 3, correct: 2, wrong: 1, due: 1, last: 1 } } }
  const r = parseProgress(JSON.stringify(p))
  assert.equal(r.ok, true)
  assert.deepEqual(r.value, p)
})

test('missing nested fields are filled from defaults (deep merge)', () => {
  // e.g. a file saved before boss.lastBonusDay existed
  const r = parseProgress(JSON.stringify({ xp: 10, boss: { history: [], active: null }, streak: { count: 2, best: 3, lastDay: '2026-10-01' } }))
  assert.equal(r.ok, true)
  assert.equal(r.value.boss.lastBonusDay, null)
  assert.deepEqual(r.value.today, { day: null, xp: 0 })
  assert.deepEqual(r.value.streak, { count: 2, best: 3, lastDay: '2026-10-01' })
  assert.deepEqual(deepMerge({ a: { b: 1, c: 2 } }, { a: { b: 5 } }), { a: { b: 5, c: 2 } })
})

test('malformed nested fields are rejected with a friendly error', () => {
  const bad = {
    xp: 100,
    boss: { history: 'oops', active: { ids: 'x' } },
    questions: { q1: { box: 9 } },
    streak: 'hot',
    examDate: 'next tuesday',
  }
  const r = parseProgress(JSON.stringify(bad))
  assert.equal(r.ok, false)
  assert.match(r.error, /nothing was imported/)
  for (const field of ['boss.history', 'boss.active', 'questions.q1', 'streak', 'examDate']) assert.match(r.error, new RegExp(field.replace('.', '\\.')))
})

test('non-JSON and non-progress files get friendly errors', () => {
  assert.match(parseProgress('{not json').error, /isn't valid JSON/)
  assert.match(parseProgress('[1,2,3]').error, /doesn't look like/)
  assert.match(parseProgress('{"hello": "world"}').error, /doesn't look like/)
})

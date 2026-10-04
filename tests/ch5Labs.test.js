import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CASES, DIAGNOSES, diagnosisOptions } from '../src/lib/profileLab.js'
import { initialCacheLab, runQuery, insertRows, predictHit, missionsDone } from '../src/lib/cacheLab.js'

test('profile detective: at least 6 complete cases', () => {
  assert.ok(CASES.length >= 6)
  for (const c of CASES) {
    assert.ok(DIAGNOSES[c.diagnosis], c.id)
    const opts = diagnosisOptions(c)
    assert.equal(new Set(opts).size, opts.length, `${c.id}: duplicate diagnosis option`)
    for (const d of opts) assert.ok(DIAGNOSES[d], `${c.id}: unknown diagnosis ${d}`)
    assert.equal(c.fixes.filter((f) => f.ok).length, 1, `${c.id}: exactly one correct fix`)
    for (const f of c.fixes) assert.ok(f.why && f.why.length > 15, `${c.id}/${f.id}: missing why`)
    assert.ok(c.before.ops.some((o) => o.hot), `${c.id}: before profile needs a hot operator`)
    assert.ok(c.after.ops.length && c.explain)
  }
})

test('cache lab: miss, then hit, then invalidated after a write, with disk cache help', () => {
  let s = initialCacheLab()
  assert.equal(predictHit(s, 'q1'), false)
  s = runQuery(s, 'q1')
  assert.equal(s.log.at(-1).result, 'miss')
  assert.equal(s.log.at(-1).gbDisk, 0)
  assert.equal(predictHit(s, 'q1'), true)
  s = runQuery(s, 'q1')
  assert.equal(s.log.at(-1).result, 'hit')
  assert.equal(s.log.at(-1).gbCloud, 0)
  s = insertRows(s)
  assert.equal(predictHit(s, 'q1'), false)
  s = runQuery(s, 'q1')
  const ev = s.log.at(-1)
  assert.equal(ev.result, 'invalidated')
  assert.ok(ev.gbDisk > 0 && ev.gbCloud > 0) // old files from SSD, new file from cloud
  assert.ok(ev.seconds < s.log[0].seconds)
})

test('cache lab: non-deterministic queries never hit; different text is a different entry', () => {
  let s = runQuery(runQuery(initialCacheLab(), 'q3'), 'q3')
  assert.equal(s.log.at(-1).result, 'bypass')
  assert.equal(predictHit(s, 'q3'), false)
  s = runQuery(runQuery(s, 'q1'), 'q2')
  assert.equal(s.log.at(-1).result, 'miss')
  const done = missionsDone(insertRows(runQuery(s, 'q1')))
  assert.equal(done.hit, true)
  assert.equal(done.bypass, true)
  assert.equal(done.disk, true)
})

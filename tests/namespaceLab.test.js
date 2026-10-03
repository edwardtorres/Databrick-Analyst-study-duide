import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeNamespaceLab, emptyNamespaceLab, TARGET } from '../src/lib/namespaceLab.js'
import { parseProgress, emptyProgress } from '../src/lib/progressSchema.js'

test('saved lab state round-trips through sanitize', () => {
  const saved = { phase: 'grant', place: { ...TARGET }, grants: [{ principal: 'analysts', privilege: 'SELECT', securable: 'sales.gold' }], skipped: false }
  assert.deepEqual(sanitizeNamespaceLab(saved), saved)
})

test('junk in saved lab state is dropped instead of crashing', () => {
  const r = sanitizeNamespaceLab({
    phase: 'test', // not allowed: tree isn't built
    place: { sales: 'ms', ghost: 'ms', gold: 'gold', orders: 'nowhere' },
    grants: [
      { principal: 'analysts', privilege: 'SELECT', securable: 'sales.gold' },
      { principal: 'mallory', privilege: 'SELECT', securable: 'sales.gold' },
      { principal: 'analysts', privilege: 'READ VOLUME', securable: 'sales.gold.orders' },
      null,
    ],
  })
  assert.equal(r.phase, 'build')
  assert.deepEqual(r.place, { sales: 'ms' })
  assert.equal(r.grants.length, 1)
  assert.deepEqual(sanitizeNamespaceLab('nonsense'), emptyNamespaceLab())
})

test('progress files with labState are validated', () => {
  assert.equal(parseProgress(JSON.stringify({ ...emptyProgress(), labState: { namespaceBuilder: { place: {} } } })).ok, true)
  assert.equal(parseProgress(JSON.stringify({ ...emptyProgress(), labState: { namespaceBuilder: 'x' } })).ok, false)
  // Older saves without labState still load
  const { labState, ...old } = emptyProgress()
  assert.deepEqual(parseProgress(JSON.stringify(old)).value.labState, {})
})

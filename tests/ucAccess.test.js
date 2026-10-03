import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkAccess, missionStatus } from '../src/lib/ucAccess.js'

const owners = {
  sales: 'data_admins',
  'sales.gold': 'data_admins',
  'sales.raw': 'data_admins',
  'sales.gold.orders': 'engineers',
  'sales.gold.customers': 'engineers',
  'sales.raw.landing': 'engineers',
}
const g = (principal, privilege, securable) => ({ principal, privilege, securable })

test('SELECT on the table alone is not enough: USE CATALOG and USE SCHEMA are missing', () => {
  const r = checkAccess({ owners, grants: [g('analysts', 'SELECT', 'sales.gold.orders')] }, 'maya@corp.com', 'select', 'sales.gold.orders')
  assert.equal(r.allowed, false)
  assert.deepEqual(r.checks.filter((c) => !c.ok).map((c) => c.privilege), ['USE CATALOG', 'USE SCHEMA'])
  assert.deepEqual(r.fixes, ['GRANT USE CATALOG ON CATALOG sales TO `analysts`', 'GRANT USE SCHEMA ON SCHEMA sales.gold TO `analysts`'])
})

test('schema-level SELECT inherits to tables; group membership counts', () => {
  const grants = [g('analysts', 'USE CATALOG', 'sales'), g('analysts', 'USE SCHEMA', 'sales.gold'), g('analysts', 'SELECT', 'sales.gold')]
  const r = checkAccess({ owners, grants }, 'maya@corp.com', 'select', 'sales.gold.customers')
  assert.equal(r.allowed, true)
  assert.match(r.checks[2].via, /inherited from schema sales.gold/)
  assert.match(r.checks[2].via, /via group analysts/)
  assert.equal(checkAccess({ owners, grants }, 'lee@contractor.io', 'select', 'sales.gold.customers').allowed, false)
})

test('table owner still needs USE CATALOG / USE SCHEMA', () => {
  const r = checkAccess({ owners, grants: [] }, 'raj@corp.com', 'insert', 'sales.gold.orders')
  assert.equal(r.allowed, false)
  assert.equal(r.checks[2].ok, true)
  assert.match(r.checks[2].via, /owner/)
})

test('mission completes with a least-privilege, group-based setup', () => {
  const grants = [
    g('analysts', 'USE CATALOG', 'sales'),
    g('analysts', 'USE SCHEMA', 'sales.gold'),
    g('analysts', 'SELECT', 'sales.gold'),
    g('engineers', 'USE CATALOG', 'sales'),
    g('engineers', 'USE SCHEMA', 'sales.gold'),
  ]
  assert.equal(missionStatus({ owners, grants }).complete, true)
  // ALL PRIVILEGES or user-level grants break least privilege
  assert.equal(missionStatus({ owners, grants: [...grants, g('maya@corp.com', 'SELECT', 'sales.gold')] }).complete, false)
  assert.equal(missionStatus({ owners, grants: [...grants, g('analysts', 'ALL PRIVILEGES', 'sales.raw')] }).complete, false)
})

// A small model of Unity Catalog access checks for the Namespace Builder lab.
// Simplified on purpose: privileges inherit downward (catalog → schema →
// object), the owner of an object holds every privilege on that object only,
// and querying always needs USE CATALOG + USE SCHEMA on the parents.

export const PRINCIPALS = {
  'maya@corp.com': { kind: 'user', groups: ['analysts'], label: 'Maya (analyst)' },
  'raj@corp.com': { kind: 'user', groups: ['engineers'], label: 'Raj (engineer)' },
  'lee@contractor.io': { kind: 'user', groups: [], label: 'Lee (contractor)' },
  analysts: { kind: 'group', groups: [], label: 'analysts (group)' },
  engineers: { kind: 'group', groups: [], label: 'engineers (group)' },
}

// Which privileges can be granted on which securable type.
export const GRANTABLE = {
  catalog: ['USE CATALOG', 'USE SCHEMA', 'SELECT', 'MODIFY', 'CREATE SCHEMA', 'CREATE TABLE', 'READ VOLUME', 'ALL PRIVILEGES'],
  schema: ['USE SCHEMA', 'SELECT', 'MODIFY', 'CREATE TABLE', 'READ VOLUME', 'ALL PRIVILEGES'],
  table: ['SELECT', 'MODIFY', 'ALL PRIVILEGES'],
  volume: ['READ VOLUME', 'WRITE VOLUME', 'ALL PRIVILEGES'],
}

export const ACTIONS = {
  select: { label: 'SELECT * FROM', on: 'table', needs: 'SELECT' },
  insert: { label: 'INSERT INTO', on: 'table', needs: 'MODIFY' },
  readVolume: { label: 'LIST / read files in', on: 'volume', needs: 'READ VOLUME' },
  createTable: { label: 'CREATE TABLE in', on: 'schema', needs: 'CREATE TABLE' },
}

export const ancestors = (fullName) => {
  const parts = fullName.split('.')
  return parts.map((_, i) => parts.slice(0, i + 1).join('.')).reverse() // self first
}

const typeOfDepth = ['catalog', 'schema', 'object']

export const identitiesOf = (principal) => [principal, ...(PRINCIPALS[principal]?.groups || [])]

// Does `principal` hold `privilege` on `fullName` (directly, by inheritance, via a group, or as owner)?
export function holds({ grants, owners }, principal, privilege, fullName) {
  const ids = identitiesOf(principal)
  if (ids.includes(owners[fullName])) return { ok: true, via: `owner of ${fullName}` }
  for (const target of ancestors(fullName)) {
    const g = grants.find(
      (x) => ids.includes(x.principal) && x.securable === target && (x.privilege === privilege || x.privilege === 'ALL PRIVILEGES'),
    )
    if (g) {
      const who = g.principal === principal ? '' : ` via group ${g.principal}`
      const inherited = target === fullName ? '' : ` (inherited from ${typeOfDepth[target.split('.').length - 1]} ${target})`
      return { ok: true, via: `${g.privilege} on ${target}${who}${inherited}` }
    }
  }
  return { ok: false }
}

// Full access check for an action, with a per-privilege breakdown and fixes.
export function checkAccess(state, principal, actionId, fullName) {
  const action = ACTIONS[actionId]
  const parts = fullName.split('.')
  const required = [['USE CATALOG', parts[0]]]
  if (parts.length >= 2) required.push(['USE SCHEMA', parts.slice(0, 2).join('.')])
  required.push([action.needs, fullName])

  const checks = required.map(([privilege, on]) => ({ privilege, on, ...holds(state, principal, privilege, on) }))
  const missing = checks.filter((c) => !c.ok)
  const grantee = PRINCIPALS[principal]?.groups[0] || principal
  const kindOf = (on) => (on.split('.').length === 1 ? 'CATALOG' : on.split('.').length === 2 ? 'SCHEMA' : action.on === 'volume' ? 'VOLUME' : 'TABLE')
  return {
    allowed: missing.length === 0,
    checks,
    fixes: missing.map((c) => `GRANT ${c.privilege} ON ${kindOf(c.on)} ${c.on} TO \`${grantee}\``),
  }
}

export const grantSql = (g, type) => `GRANT ${g.privilege} ON ${type.toUpperCase()} ${g.securable} TO \`${g.principal}\``

// Mission for the lab: least-privilege setup for the sales catalog.
export function missionStatus(state) {
  const can = (p, a, t) => checkAccess(state, p, a, t).allowed
  const goals = [
    {
      id: 'analysts-read-gold',
      text: 'Analysts (Maya) can SELECT both gold tables',
      ok: can('maya@corp.com', 'select', 'sales.gold.orders') && can('maya@corp.com', 'select', 'sales.gold.customers'),
    },
    { id: 'analysts-no-raw', text: 'Analysts can NOT read files in the raw landing volume', ok: !can('maya@corp.com', 'readVolume', 'sales.raw.landing') },
    { id: 'analysts-no-write', text: 'Analysts can NOT write to sales.gold.orders', ok: !can('maya@corp.com', 'insert', 'sales.gold.orders') },
    { id: 'raj-write', text: 'Raj can INSERT INTO sales.gold.orders', ok: can('raj@corp.com', 'insert', 'sales.gold.orders') },
    {
      id: 'lee-nothing',
      text: 'Lee (contractor) can read nothing',
      ok: !['sales.gold.orders', 'sales.gold.customers'].some((t) => can('lee@contractor.io', 'select', t)) && !can('lee@contractor.io', 'readVolume', 'sales.raw.landing'),
    },
    {
      id: 'least-privilege',
      text: 'Least privilege: no ALL PRIVILEGES, and grants go to groups, not individual users',
      ok: state.grants.length > 0 && state.grants.every((g) => g.privilege !== 'ALL PRIVILEGES' && PRINCIPALS[g.principal]?.kind === 'group'),
    },
  ]
  return { goals, complete: goals.every((g) => g.ok) }
}

import { PRINCIPALS, GRANTABLE } from './ucAccess.js'

// Fixed scenario data for the Namespace Builder lab, plus a sanitizer for
// the lab state saved in progress (so a stale or tampered save can't break it).

export const PIECES = [
  { id: 'sales', type: 'catalog', name: 'sales' },
  { id: 'gold', type: 'schema', name: 'gold' },
  { id: 'raw', type: 'schema', name: 'raw' },
  { id: 'orders', type: 'table', name: 'orders' },
  { id: 'customers', type: 'table', name: 'customers' },
  { id: 'landing', type: 'volume', name: 'landing' },
]
export const TARGET = { sales: 'ms', gold: 'sales', raw: 'sales', orders: 'gold', customers: 'gold', landing: 'raw' }
export const OWNERS = {
  sales: 'data_admins',
  'sales.gold': 'data_admins',
  'sales.raw': 'data_admins',
  'sales.gold.orders': 'engineers',
  'sales.gold.customers': 'engineers',
  'sales.raw.landing': 'engineers',
}
export const OBJECTS = [
  ['sales', 'catalog'],
  ['sales.gold', 'schema'],
  ['sales.raw', 'schema'],
  ['sales.gold.orders', 'table'],
  ['sales.gold.customers', 'table'],
  ['sales.raw.landing', 'volume'],
]
export const typeOf = (full) => OBJECTS.find((o) => o[0] === full)?.[1]

export const emptyNamespaceLab = () => ({ phase: 'build', place: {}, grants: [], skipped: false })

const PHASES = ['build', 'grant', 'test']
const pieceIds = new Set(PIECES.map((p) => p.id))

export function sanitizeNamespaceLab(saved) {
  const base = emptyNamespaceLab()
  if (!saved || typeof saved !== 'object') return base
  const place = {}
  if (saved.place && typeof saved.place === 'object')
    for (const [id, parent] of Object.entries(saved.place))
      if (pieceIds.has(id) && (parent === 'ms' || pieceIds.has(parent)) && parent !== id) place[id] = parent
  const grants = Array.isArray(saved.grants)
    ? saved.grants.filter(
        (g) => g && PRINCIPALS[g.principal] && typeOf(g.securable) && GRANTABLE[typeOf(g.securable)].includes(g.privilege),
      )
    : []
  const built = Object.entries(TARGET).every(([id, parent]) => place[id] === parent)
  return {
    phase: PHASES.includes(saved.phase) && (saved.phase === 'build' || built) ? saved.phase : 'build',
    place,
    grants,
    skipped: saved.skipped === true,
  }
}

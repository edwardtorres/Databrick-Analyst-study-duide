import { test } from 'node:test'
import assert from 'node:assert/strict'
import { OBJECTS, EDGES, allDownstream, emptyCatalogLab, sanitizeCatalogLab, missionStatus, upstreamOf } from '../src/lib/catalogLab.js'

const done = (s) => Object.fromEntries(Object.entries(missionStatus(s)).map(([k, v]) => [k, v.done]))

test('every lineage edge points at a known object', () => {
  for (const [u, d] of EDGES) assert.ok(OBJECTS[u] && OBJECTS[d], `${u} -> ${d}`)
})

test('orders reaches exactly two dashboards, one of them two hops away', () => {
  const dash = [...allDownstream('prod.sales.orders')].filter((id) => OBJECTS[id].kind === 'dashboard').sort()
  assert.deepEqual(dash, ['dashboard:Exec Revenue', 'dashboard:Finance Close'])
  assert.deepEqual(upstreamOf('dashboard:Exec Revenue'), ['prod.sales.v_revenue_by_region'])
})

test('a fresh lab has no missions done', () => {
  assert.ok(Object.values(done(emptyCatalogLab())).every((d) => !d))
})

test('missions complete only with the right answers', () => {
  const s = {
    ...emptyCatalogLab(),
    queried: 'prod.sales.orders',
    external: 'EXTERNAL',
    tags: { 'prod.sales.customers#email': ['pii=email'] },
    origin: 'raw.landing.orders_bronze',
    flagged: ['dashboard:Finance Close', 'dashboard:Exec Revenue'],
    submitted: true,
  }
  assert.deepEqual(done(s), { certified: true, external: true, tag: true, upstream: true, downstream: true })
})

test('wrong answers give feedback and stay undone', () => {
  const st = missionStatus({
    ...emptyCatalogLab(),
    queried: 'prod.sales.orders_legacy',
    external: 'MANAGED',
    tags: { 'prod.sales.customers#name': ['pii=email'] },
    origin: 'job:nightly_orders_etl',
    flagged: ['dashboard:Exec Revenue'],
    submitted: true,
  })
  for (const k of Object.keys(st)) assert.equal(st[k].done, false, k)
  assert.match(st.certified.feedback, /deprecated/)
  assert.match(st.external.feedback, /EXTERNAL/)
  assert.match(st.tag.feedback, /email column/)
  assert.match(st.upstream.feedback, /isn't the origin/)
  assert.match(st.downstream.feedback, /missed a dashboard/)
  // flagging an unrelated dashboard is called out
  const extra = missionStatus({ ...emptyCatalogLab(), flagged: ['dashboard:Exec Revenue', 'dashboard:Finance Close', 'dashboard:Marketing Funnel'], submitted: true })
  assert.equal(extra.downstream.done, false)
  assert.match(extra.downstream.feedback, /doesn't depend/)
  // flags without submitting don't count yet
  assert.equal(missionStatus({ ...emptyCatalogLab(), flagged: ['dashboard:Exec Revenue', 'dashboard:Finance Close'] }).downstream.done, false)
})

test('sanitize drops unknown objects, columns, tags and junk', () => {
  const s = sanitizeCatalogLab({
    opened: ['prod.sales.orders', 'nope.x.y', 5],
    tags: { 'prod.sales.customers#email': ['pii=email', 'evil=1'], 'prod.sales.customers#ssn': ['pii=email'], 'x.y.z': ['pii=email'], 'prod.sales.orders': 'bad' },
    queried: 'nope',
    external: 'MAYBE',
    origin: 'raw.landing.orders_bronze',
    flagged: ['dashboard:Exec Revenue', 'prod.sales.orders'],
    submitted: 'yes',
  })
  assert.deepEqual(s, {
    opened: ['prod.sales.orders'],
    tags: { 'prod.sales.customers#email': ['pii=email'] },
    queried: null,
    external: null,
    origin: 'raw.landing.orders_bronze',
    flagged: ['dashboard:Exec Revenue'],
    submitted: false,
  })
  assert.deepEqual(sanitizeCatalogLab(null), emptyCatalogLab())
  assert.deepEqual(sanitizeCatalogLab('junk'), emptyCatalogLab())
})

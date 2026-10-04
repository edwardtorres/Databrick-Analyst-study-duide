// Catalog Explorer lab: a mock Unity Catalog metastore with certified and
// deprecated tables, managed vs external storage, tags and a lineage graph.
// Missions are answered by exploring. Simplified from the real UI.

const col = (name, type, comment = '') => ({ name, type, comment })

export const OBJECTS = {
  'prod.sales.orders': {
    kind: 'table',
    type: 'MANAGED',
    certified: true,
    owner: 'data-engineering',
    comment: 'One row per order line. Certified source for revenue reporting.',
    columns: [col('order_id', 'BIGINT'), col('customer_id', 'BIGINT'), col('order_date', 'DATE'), col('amount', 'DECIMAL(12,2)', 'Net amount after discounts'), col('status', 'STRING')],
  },
  'prod.sales.orders_legacy': {
    kind: 'table',
    type: 'MANAGED',
    deprecated: true,
    owner: 'data-engineering',
    comment: 'DEPRECATED: old orders table, no longer updated. Use prod.sales.orders.',
    columns: [col('id', 'INT'), col('cust', 'INT'), col('amt', 'DOUBLE')],
  },
  'prod.sales.customers': {
    kind: 'table',
    type: 'MANAGED',
    owner: 'crm-team',
    comment: 'Customer master data.',
    columns: [col('customer_id', 'BIGINT'), col('name', 'STRING'), col('email', 'STRING'), col('region', 'STRING')],
  },
  'prod.sales.v_revenue_by_region': {
    kind: 'view',
    type: 'VIEW',
    owner: 'analytics',
    comment: 'Daily revenue by region (joins orders and customers).',
    columns: [col('day', 'DATE'), col('region', 'STRING'), col('revenue', 'DECIMAL(14,2)')],
  },
  'prod.finance.revenue_daily': {
    kind: 'table',
    type: 'EXTERNAL',
    location: 's3://acme-finance/gold/revenue_daily/',
    owner: 'finance-eng',
    comment: 'Finance-adjusted daily revenue (read by the finance close process).',
    columns: [col('day', 'DATE'), col('revenue', 'DECIMAL(14,2)'), col('fx_rate', 'DOUBLE')],
  },
  'raw.landing.orders_bronze': {
    kind: 'table',
    type: 'EXTERNAL',
    location: 's3://acme-raw/orders/',
    owner: 'data-engineering',
    comment: 'Raw order events as received (JSON → Delta).',
    columns: [col('payload', 'STRING'), col('_ingested_at', 'TIMESTAMP')],
  },
  'dev.scratch.orders_copy': {
    kind: 'table',
    type: 'MANAGED',
    owner: 'maya@corp.com',
    comment: 'Personal copy for testing.',
    columns: [col('order_id', 'BIGINT'), col('amount', 'DOUBLE')],
  },
  'job:nightly_orders_etl': { kind: 'job', label: 'Job: nightly_orders_etl' },
  'dashboard:Exec Revenue': { kind: 'dashboard', label: 'Dashboard: Exec Revenue' },
  'dashboard:Finance Close': { kind: 'dashboard', label: 'Dashboard: Finance Close' },
  'dashboard:Marketing Funnel': { kind: 'dashboard', label: 'Dashboard: Marketing Funnel' },
  'notebook:Churn analysis': { kind: 'notebook', label: 'Notebook: Churn analysis' },
}

// upstream → downstream
export const EDGES = [
  ['raw.landing.orders_bronze', 'job:nightly_orders_etl'],
  ['job:nightly_orders_etl', 'prod.sales.orders'],
  ['prod.sales.orders', 'prod.sales.v_revenue_by_region'],
  ['prod.sales.customers', 'prod.sales.v_revenue_by_region'],
  ['prod.sales.v_revenue_by_region', 'dashboard:Exec Revenue'],
  ['prod.sales.orders', 'prod.finance.revenue_daily'],
  ['prod.finance.revenue_daily', 'dashboard:Finance Close'],
  ['prod.sales.orders', 'notebook:Churn analysis'],
  ['prod.sales.customers', 'dashboard:Marketing Funnel'],
]

export const upstreamOf = (id) => EDGES.filter(([, d]) => d === id).map(([u]) => u)
export const downstreamOf = (id) => EDGES.filter(([u]) => u === id).map(([, d]) => d)

export function allDownstream(id, seen = new Set()) {
  for (const d of downstreamOf(id))
    if (!seen.has(d)) {
      seen.add(d)
      allDownstream(d, seen)
    }
  return seen
}

export const label = (id) => OBJECTS[id]?.label || id

// The browsable tree: catalog → schema → object names
export function tree() {
  const t = {}
  for (const id of Object.keys(OBJECTS)) {
    const parts = id.split('.')
    if (parts.length !== 3) continue
    const [c, s, o] = parts
    ;((t[c] ||= {})[s] ||= []).push(o)
  }
  return t
}

export const TAG_PRESETS = [
  ['pii', 'email'],
  ['pii', 'phone'],
  ['domain', 'sales'],
  ['quality', 'gold'],
]

export const MISSIONS = [
  { id: 'certified', title: 'Find the certified orders table', task: 'Several tables hold orders. Find the one that is certified for revenue reporting and tap "Query this table".' },
  { id: 'external', title: 'Managed or external?', task: 'Open prod.finance.revenue_daily and check its details. Is it managed or external?' },
  { id: 'tag', title: 'Tag the PII column', task: 'In prod.sales.customers, tag the email column with pii = email.' },
  { id: 'upstream', title: 'Where does orders come from?', task: 'Follow prod.sales.orders\' lineage upstream to the original source table, then tap "Pick as the answer" on it.' },
  { id: 'downstream', title: 'What breaks if orders changes?', task: 'Follow lineage downstream from prod.sales.orders (more than one hop) and flag every dashboard that would be affected. Then tap "Check dashboards".' },
]

export const emptyCatalogLab = () => ({ opened: [], tags: {}, queried: null, external: null, origin: null, flagged: [], submitted: false })

export function sanitizeCatalogLab(saved) {
  const base = emptyCatalogLab()
  if (!saved || typeof saved !== 'object') return base
  const known = (id) => !!OBJECTS[id]
  const tags = {}
  if (saved.tags && typeof saved.tags === 'object')
    for (const [k, v] of Object.entries(saved.tags)) {
      const [obj, column] = k.split('#')
      const okCol = !column || OBJECTS[obj]?.columns?.some((c) => c.name === column)
      if (known(obj) && okCol && Array.isArray(v)) tags[k] = v.filter((t) => TAG_PRESETS.some(([a, b]) => `${a}=${b}` === t))
    }
  return {
    opened: Array.isArray(saved.opened) ? saved.opened.filter(known) : [],
    tags,
    queried: known(saved.queried) ? saved.queried : null,
    external: ['MANAGED', 'EXTERNAL'].includes(saved.external) ? saved.external : null,
    origin: known(saved.origin) ? saved.origin : null,
    flagged: Array.isArray(saved.flagged) ? saved.flagged.filter((id) => OBJECTS[id]?.kind === 'dashboard') : [],
    submitted: saved.submitted === true,
  }
}

const affectedDashboards = () => [...allDownstream('prod.sales.orders')].filter((id) => OBJECTS[id].kind === 'dashboard').sort()

// { id: { done, feedback } } for every mission
export function missionStatus(s) {
  const out = {}
  out.certified = {
    done: s.queried === 'prod.sales.orders',
    feedback:
      s.queried === 'prod.sales.orders_legacy'
        ? 'That one is deprecated (no longer updated). Look for the Certified badge.'
        : s.queried && s.queried !== 'prod.sales.orders'
          ? 'That table isn\'t certified. Look for the Certified badge.'
          : null,
  }
  out.external = {
    done: s.external === 'EXTERNAL',
    feedback: s.external === 'MANAGED' ? 'Look again at Details: it has a LOCATION in your own S3 bucket and Type EXTERNAL. Dropping it leaves the files.' : null,
  }
  out.tag = {
    done: (s.tags['prod.sales.customers#email'] || []).includes('pii=email'),
    feedback: Object.entries(s.tags).some(([k, v]) => v.includes('pii=email') && k !== 'prod.sales.customers#email')
      ? 'pii = email belongs on the email column of prod.sales.customers.'
      : null,
  }
  out.upstream = {
    done: s.origin === 'raw.landing.orders_bronze',
    feedback: s.origin && s.origin !== 'raw.landing.orders_bronze' ? `${label(s.origin)} isn't the origin. Keep following the Upstream side.` : null,
  }
  const want = affectedDashboards()
  const got = [...s.flagged].sort()
  const exact = want.length === got.length && want.every((d, i) => d === got[i])
  out.downstream = {
    done: s.submitted && exact,
    feedback: !s.submitted
      ? null
      : exact
        ? null
        : got.some((d) => !want.includes(d))
          ? 'At least one flagged dashboard doesn\'t depend on prod.sales.orders. Check its upstream side.'
          : 'You missed a dashboard. Some are two hops away, through a view or another table.',
  }
  return out
}

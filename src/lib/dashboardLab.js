// Dashboard Config lab: a mock AI/BI dashboard + SQL alert configuration and
// a simulator that explains what happens for a few concrete situations.
// It's a teaching model, not the real product. Uncertain details are flagged.

export const BRIEF = [
  'Regional managers open the "Regional Sales" dashboard every morning around 8:00 and pick their region.',
  'The sales table is loaded nightly and finishes by 2:00.',
  'Sales Ops wants a Slack message in #sales-alerts whenever today\'s revenue drops below $50,000.',
  'Every regional manager must see the data, including Omar, who has no direct SELECT on the sales table. Priya from finance must not open the dashboard.',
]

export const DATASET_SQL = `SELECT order_date, region, SUM(revenue) AS revenue
FROM prod.sales.orders
WHERE region = :region
GROUP BY ALL`

export const ALERT_SQL = `SELECT SUM(revenue) AS today_revenue
FROM prod.sales.orders
WHERE order_date = current_date()`

export const OPTIONS = {
  binding: [
    { id: 'param', label: 'Dataset parameter :region' },
    { id: 'filter', label: 'Filter on the region field' },
    { id: 'none', label: 'Not connected' },
  ],
  paramDefault: [
    { id: 'EMEA', label: "Default :region = 'EMEA'" },
    { id: '', label: 'No default value' },
  ],
  schedule: [
    { id: 'daily6', label: 'Refresh daily at 06:00' },
    { id: 'hourly', label: 'Refresh every hour' },
    { id: 'none', label: 'No schedule' },
  ],
  operator: [
    { id: '<', label: '<' },
    { id: '>', label: '>' },
    { id: '=', label: '=' },
  ],
  threshold: [
    { id: 50000, label: '50,000' },
    { id: 5000, label: '5,000' },
    { id: 500000, label: '500,000' },
  ],
  destination: [
    { id: 'slack', label: 'Slack: #sales-alerts' },
    { id: 'email', label: 'Email: sales-ops@corp' },
    { id: 'none', label: 'No destination' },
  ],
  credentials: [
    { id: 'embedded', label: "Share data permissions (publisher's)" },
    { id: 'individual', label: "Individual data permissions (viewer's own)" },
  ],
  shareWith: [
    { id: 'managers', label: 'regional-managers (view)' },
    { id: 'all', label: 'All workspace users (view)' },
    { id: 'nobody', label: 'Not shared' },
  ],
}

export const emptyDashboardConfig = () => ({
  binding: 'none',
  paramDefault: '',
  schedule: 'none',
  operator: '>',
  threshold: 5000,
  destination: 'none',
  credentials: 'individual',
  shareWith: 'nobody',
})

export function sanitizeDashboardConfig(saved) {
  const base = emptyDashboardConfig()
  if (!saved || typeof saved !== 'object') return base
  const out = { ...base }
  for (const key of Object.keys(OPTIONS)) if (OPTIONS[key].some((o) => o.id === saved[key])) out[key] = saved[key]
  return out
}

const VIEWERS = {
  maya: { label: 'Maya (regional manager, has SELECT)', inGroup: true, select: true },
  omar: { label: 'Omar (regional manager, no SELECT)', inGroup: true, select: false },
  priya: { label: 'Priya (finance, not a manager)', inGroup: false, select: true },
}

const TODAY_REVENUE = 42000

// Each check returns { id, label, ok, text }: `ok` means the requirement is met.
export function simulate(cfg) {
  const checks = []

  // 1. Viewer picks APAC
  {
    let ok = false
    let text
    if (cfg.binding === 'param') {
      ok = true
      text = "The picker sets :region = 'APAC' and the dataset re-runs, so APAC numbers appear."
    } else if (cfg.binding === 'filter') {
      text = cfg.paramDefault
        ? `The query still runs with :region = '${cfg.paramDefault}', so it only returns ${cfg.paramDefault} rows. Filtering that result for APAC leaves an empty chart. A field filter can't change a value inside the SQL; a parameter can.`
        : 'The dataset needs a value for :region, which only a parameter can supply, so the query fails with a missing-parameter error.'
    } else text = 'The picker is not connected to anything, so choosing APAC changes nothing.'
    checks.push({ id: 'apac', label: 'A manager picks APAC in the region picker', ok, text })
  }

  // 2. Fresh data at 8:00
  {
    const ok = cfg.schedule === 'daily6' || cfg.schedule === 'hourly'
    const text =
      cfg.schedule === 'daily6'
        ? 'The 06:00 refresh runs after the 02:00 load, so cached results are fresh at 08:00.'
        : cfg.schedule === 'hourly'
          ? 'Fresh at 08:00, but it runs 24 times a day for data that changes once a night, so it wastes warehouse time. A daily run after the load is enough.'
          : 'With no schedule, the first viewer each morning waits for the queries, and cached results can be from yesterday.'
    checks.push({ id: 'fresh', label: 'The dashboard shows last night\'s data at 08:00', ok, text, note: cfg.schedule === 'hourly' ? 'costly' : undefined })
  }

  // 3. Alert on $42,000 today
  {
    const fires =
      cfg.operator === '<' ? TODAY_REVENUE < cfg.threshold : cfg.operator === '>' ? TODAY_REVENUE > cfg.threshold : TODAY_REVENUE === cfg.threshold
    const rightRule = cfg.operator === '<' && cfg.threshold === 50000
    let text = `Today's revenue is $42,000. Condition: today_revenue ${cfg.operator} ${cfg.threshold.toLocaleString()} → ${fires ? 'TRIGGERED' : 'OK (not triggered)'}. `
    if (!rightRule && fires) text += 'It fired, but this rule would also fire on normal days, or for the wrong reason. The requirement is "below $50,000".'
    else if (!rightRule) text += 'The requirement is "drops below $50,000": use the < operator with 50,000.'
    if (fires) {
      if (cfg.destination === 'slack') text += ' The message goes to #sales-alerts.'
      else if (cfg.destination === 'email') text += ' Notification sent by email, but Sales Ops asked for Slack.'
      else text += ' The alert triggered, but with no destination nobody was told.'
    }
    const ok = rightRule && fires && cfg.destination === 'slack'
    checks.push({ id: 'alert', label: 'Revenue is $42,000 today: Slack #sales-alerts is notified', ok, text })
  }

  // 4-6. Who can open and see data
  for (const [id, v] of Object.entries(VIEWERS)) {
    const canOpen = cfg.shareWith === 'all' || (cfg.shareWith === 'managers' && v.inGroup)
    const seesData = canOpen && (cfg.credentials === 'embedded' || v.select)
    const wanted = id !== 'priya'
    let text
    if (!canOpen) text = `${v.label.split(' (')[0]} can't open it: the dashboard isn't shared with them.`
    else if (!seesData) text = `${v.label.split(' (')[0]} can open it, but the charts can't load data: with Individual data permissions, queries use the viewer's own data permissions, and they lack SELECT on the table.`
    else
      text = `${v.label.split(' (')[0]} sees the data${cfg.credentials === 'embedded' ? " (Share data permissions: queries use the publisher's data permissions)" : ' using their own SELECT access'}.`
    const ok = wanted ? seesData : !canOpen
    checks.push({ id: `viewer-${id}`, label: wanted ? `${v.label} can see the data` : `${v.label} cannot open the dashboard`, ok, text })
  }

  return { checks, complete: checks.every((c) => c.ok) && cfg.schedule === 'daily6' }
}

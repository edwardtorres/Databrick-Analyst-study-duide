// Chart Picker lab: scenarios (business question + small dataset), the
// chart types you can pick, and a converter from any dataset to a render
// spec for any chart type, so a poor choice is drawn as it would really look.

export const CHART_TYPES = [
  { id: 'line', label: 'Line' },
  { id: 'bar', label: 'Bar' },
  { id: 'stacked', label: 'Stacked bar' },
  { id: 'pie', label: 'Pie' },
  { id: 'scatter', label: 'Scatter' },
  { id: 'histogram', label: 'Histogram' },
  { id: 'counter', label: 'Counter' },
  { id: 'table', label: 'Table' },
]

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const orderValues = [12, 15, 18, 19, 21, 22, 24, 25, 25, 27, 28, 29, 31, 32, 33, 35, 36, 38, 40, 41, 43, 45, 48, 52, 55, 58, 61, 66, 72, 78, 85, 92, 105, 118, 134, 150, 172, 210, 265, 340]

export const SCENARIOS = [
  {
    id: 'trend',
    question: 'How has monthly revenue changed over the last 12 months?',
    data: { kind: 'series', labels: months, values: [310, 298, 335, 352, 341, 368, 390, 384, 402, 431, 455, 472], unit: '$k', name: 'Revenue' },
    best: 'line',
    ok: ['bar'],
    why: {
      line: 'Change over time is a line chart\'s job: the slope shows the trend at a glance.',
      bar: 'Columns work for 12 periods, but the eye compares heights instead of following the trend.',
      stacked: 'Nothing to stack: there is a single measure.',
      pie: 'Months are not parts of a whole. A 12-slice pie hides the trend completely.',
      scatter: 'Scatter is for the relationship between two measures. Here the x-axis is just time order.',
      histogram: 'A histogram shows the distribution of values and throws away the time order the question is about.',
      counter: 'One number can\'t show change over 12 months.',
      table: 'The exact values are there, but nobody can see the trend in a column of numbers.',
    },
  },
  {
    id: 'compare',
    question: 'Which region sold the most last quarter?',
    data: { kind: 'series', labels: ['NA', 'EMEA', 'APAC', 'LATAM', 'ANZ'], values: [940, 880, 610, 240, 190], unit: '$k', name: 'Revenue' },
    best: 'bar',
    ok: [],
    why: {
      bar: 'Comparing categories means comparing lengths from a shared baseline, which is exactly what bars do best.',
      line: 'A line implies continuity between regions, but they have no order.',
      stacked: 'There is only one measure per region, so a stacked bar is just a bar with extra complexity.',
      pie: 'Angles are hard to compare. NA vs EMEA (940 vs 880) is nearly invisible in a pie.',
      scatter: 'There is no second numeric measure to plot against.',
      histogram: 'A histogram bins values. It loses which region is which.',
      counter: 'A single total can\'t rank regions.',
      table: 'Readable, but ranking five numbers is faster as bars.',
    },
  },
  {
    id: 'share',
    question: 'What share of orders comes from each sales channel?',
    data: { kind: 'series', labels: ['Web', 'Store', 'Phone'], values: [62, 30, 8], unit: '%', name: 'Share of orders' },
    best: 'pie',
    ok: ['bar', 'stacked'],
    why: {
      pie: 'Part-to-whole with only a few slices that sum to 100% is the one job a pie does well.',
      bar: 'Bars compare the channels accurately, but the "share of a whole" message is weaker.',
      stacked: 'A single 100% stacked bar also shows part-to-whole well.',
      line: 'Channels are not a sequence, so a line is meaningless here.',
      scatter: 'There is no second measure.',
      histogram: 'Binning three percentages makes no sense.',
      counter: 'One number can\'t show three shares.',
      table: 'Exact, but the visual proportion is lost.',
    },
  },
  {
    id: 'distribution',
    question: 'How are order values distributed? Are most orders small?',
    data: { kind: 'values', values: orderValues, unit: '$', name: 'Order value' },
    best: 'histogram',
    ok: [],
    why: {
      histogram: 'A histogram groups values into ranges, so the skew (many small orders, a long tail of large ones) is obvious.',
      bar: 'One bar per order is just 40 bars. You still have to work out the distribution in your head.',
      line: 'Connecting individual orders invents a trend that doesn\'t exist.',
      stacked: 'Nothing to stack.',
      pie: 'A 40-slice pie is unreadable.',
      scatter: 'With only one measure, the x-axis would be meaningless order numbers.',
      counter: 'An average hides the skew. That skew is the whole question.',
      table: '40 raw numbers don\'t reveal the shape.',
    },
  },
  {
    id: 'relationship',
    question: 'Across 15 campaigns, does higher ad spend come with higher revenue?',
    data: {
      kind: 'points',
      xName: 'Ad spend ($k)',
      yName: 'Revenue ($k)',
      points: [
        [5, 42], [8, 61], [10, 58], [12, 80], [14, 77], [15, 95], [18, 102], [20, 98],
        [22, 130], [25, 121], [27, 150], [30, 142], [33, 170], [36, 166], [40, 190],
      ].map(([x, y], i) => ({ x, y, label: `C${i + 1}` })),
    },
    best: 'scatter',
    ok: [],
    why: {
      scatter: 'Two numeric measures per item: a scatter shows the relationship (here a clear positive correlation).',
      line: 'A line suggests the campaigns happened in sequence, which they didn\'t.',
      bar: 'Bars show revenue per campaign but drop ad spend entirely.',
      stacked: 'Spend and revenue aren\'t parts of a total.',
      pie: 'A pie of revenue ignores spend and the relationship.',
      histogram: 'A histogram of revenue ignores spend.',
      counter: 'A total can\'t show a relationship.',
      table: 'The numbers are all there, but the correlation isn\'t visible.',
    },
  },
  {
    id: 'kpi',
    question: 'What is total revenue this month compared with the $500k target?',
    data: { kind: 'kpi', value: 432, target: 500, unit: '$k', name: 'Revenue this month' },
    best: 'counter',
    ok: ['bar'],
    why: {
      counter: 'A single headline number with its target is a counter (KPI tile). Nothing else is needed.',
      bar: 'Two bars (actual vs target) work, but they take more space than one number.',
      pie: 'Actual vs "remaining" as a pie is a common mistake. It isn\'t a part-to-whole.',
      line: 'There is no time series to draw.',
      stacked: 'Nothing meaningful to stack.',
      scatter: 'One number has no relationship to plot.',
      histogram: 'One value has no distribution.',
      table: 'A one-row table is a clumsier counter.',
    },
  },
  {
    id: 'composition',
    question: 'How did quarterly revenue split across product lines this year?',
    data: {
      kind: 'multi',
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      series: [
        { name: 'Apparel', values: [120, 140, 150, 190] },
        { name: 'Bags', values: [80, 85, 95, 110] },
        { name: 'Accessories', values: [40, 55, 60, 75] },
      ],
      unit: '$k',
    },
    best: 'stacked',
    ok: ['line', 'bar'],
    why: {
      stacked: 'Stacked columns show both the total per quarter and how it splits by product line.',
      line: 'Three lines show each product line\'s trend well, but not the total.',
      bar: 'Plain bars of the totals show the overall trend but lose the split.',
      pie: 'One pie can\'t show four quarters, and four pies are hard to compare.',
      scatter: 'There are no paired numeric measures here.',
      histogram: 'Binning these values loses both time and product line.',
      counter: 'One total hides both time and the split.',
      table: 'Precise, but the composition is hard to see.',
    },
  },
  {
    id: 'lookup',
    question: 'Account managers need the exact email and lifetime value of the top 8 customers.',
    data: {
      kind: 'rows',
      cols: ['Customer', 'Email', 'Lifetime value ($)'],
      rows: [
        ['Northwind', 'buy@northwind.example', 48210],
        ['Contoso', 'ap@contoso.example', 41980],
        ['Fabrikam', 'orders@fabrikam.example', 39500],
        ['Tailspin', 'team@tailspin.example', 31220],
        ['Litware', 'po@litware.example', 28760],
        ['Adatum', 'finance@adatum.example', 25110],
        ['Proseware', 'ops@proseware.example', 22340],
        ['Wingtip', 'hello@wingtip.example', 19870],
      ],
    },
    best: 'table',
    ok: [],
    why: {
      table: 'People need to look up and copy exact values, including text like email. That is a table\'s job.',
      bar: 'Bars show relative value but can\'t carry the email addresses they need.',
      pie: 'A pie of lifetime value doesn\'t give anyone an email to contact.',
      line: 'Customers are not a sequence.',
      stacked: 'Nothing to stack.',
      scatter: 'There is only one numeric measure.',
      histogram: 'Binning loses which customer is which.',
      counter: 'One total answers nothing here.',
    },
  },
]

export function judge(scenario, choice) {
  if (choice === scenario.best) return 'best'
  if (scenario.ok.includes(choice)) return 'ok'
  return 'poor'
}

// ---------- Data -> render spec ----------
// Spec kinds: bars, lines, stacked, pie, scatter, hist, counter, table, none.

function bins(values, n = 8) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const step = (max - min) / n || 1
  const out = Array.from({ length: n }, (_, i) => ({ from: min + i * step, to: min + (i + 1) * step, count: 0 }))
  for (const v of values) out[Math.min(n - 1, Math.floor((v - min) / step))].count++
  return out.map((b) => ({ label: `${Math.round(b.from)}–${Math.round(b.to)}`, count: b.count }))
}

const sum = (a) => a.reduce((x, y) => x + y, 0)
const none = (reason) => ({ kind: 'none', reason })

export function toSpec(data, type) {
  const unit = data.unit || ''
  switch (data.kind) {
    case 'series': {
      const { labels, values } = data
      if (type === 'line') return { kind: 'lines', labels, series: [{ name: data.name, values }], unit }
      if (type === 'bar') return { kind: 'bars', labels, values, unit }
      if (type === 'stacked') return { kind: 'stacked', labels: [data.name], series: labels.map((l, i) => ({ name: l, values: [values[i]] })), unit }
      if (type === 'pie') return { kind: 'pie', labels, values, unit }
      if (type === 'scatter') return { kind: 'scatter', points: values.map((v, i) => ({ x: i + 1, y: v, label: labels[i] })), xName: 'position', yName: data.name }
      if (type === 'histogram') return { kind: 'hist', bins: bins(values, 4) }
      if (type === 'counter') return { kind: 'counter', value: sum(values), unit, caption: `Total ${data.name.toLowerCase()}` }
      return { kind: 'table', cols: ['', data.name], rows: labels.map((l, i) => [l, values[i]]) }
    }
    case 'multi': {
      const { labels, series } = data
      const totals = labels.map((_, i) => sum(series.map((s) => s.values[i])))
      if (type === 'line') return { kind: 'lines', labels, series, unit }
      if (type === 'bar') return { kind: 'bars', labels, values: totals, unit }
      if (type === 'stacked') return { kind: 'stacked', labels, series, unit }
      if (type === 'pie') return { kind: 'pie', labels: series.map((s) => s.name), values: series.map((s) => sum(s.values)), unit }
      if (type === 'counter') return { kind: 'counter', value: sum(totals), unit, caption: 'Total for the year' }
      if (type === 'table') return { kind: 'table', cols: ['', ...series.map((s) => s.name)], rows: labels.map((l, i) => [l, ...series.map((s) => s.values[i])]) }
      if (type === 'histogram') return { kind: 'hist', bins: bins(series.flatMap((s) => s.values), 4) }
      return none('There are no paired numeric measures to plot against each other.')
    }
    case 'points': {
      const pts = [...data.points].sort((a, b) => a.x - b.x)
      if (type === 'scatter') return { kind: 'scatter', points: data.points, xName: data.xName, yName: data.yName }
      if (type === 'line') return { kind: 'lines', labels: pts.map((p) => String(p.x)), series: [{ name: data.yName, values: pts.map((p) => p.y) }] }
      if (type === 'bar') return { kind: 'bars', labels: data.points.map((p) => p.label), values: data.points.map((p) => p.y) }
      if (type === 'pie') return { kind: 'pie', labels: data.points.map((p) => p.label), values: data.points.map((p) => p.y) }
      if (type === 'histogram') return { kind: 'hist', bins: bins(data.points.map((p) => p.y)) }
      if (type === 'counter') return { kind: 'counter', value: sum(data.points.map((p) => p.y)), unit: '$k', caption: 'Total revenue' }
      if (type === 'table') return { kind: 'table', cols: ['Campaign', data.xName, data.yName], rows: data.points.map((p) => [p.label, p.x, p.y]) }
      return none('Spend and revenue are not parts of one total, so there is nothing to stack.')
    }
    case 'values': {
      const v = data.values
      if (type === 'histogram') return { kind: 'hist', bins: bins(v) }
      if (type === 'bar') return { kind: 'bars', labels: v.map((_, i) => `#${i + 1}`), values: v, unit }
      if (type === 'line') return { kind: 'lines', labels: v.map((_, i) => `#${i + 1}`), series: [{ name: data.name, values: v }], unit }
      if (type === 'pie') return { kind: 'pie', labels: v.map((_, i) => `#${i + 1}`), values: v, unit }
      if (type === 'scatter') return { kind: 'scatter', points: v.map((y, i) => ({ x: i + 1, y, label: `#${i + 1}` })), xName: 'order #', yName: data.name }
      if (type === 'counter') return { kind: 'counter', value: Math.round(sum(v) / v.length), unit, caption: 'Average order value' }
      if (type === 'table') return { kind: 'table', cols: ['Order', data.name], rows: v.map((y, i) => [`#${i + 1}`, y]) }
      return none('A single list of values has nothing to stack.')
    }
    case 'kpi': {
      if (type === 'counter') return { kind: 'counter', value: data.value, target: data.target, unit, caption: data.name }
      if (type === 'bar') return { kind: 'bars', labels: ['Actual', 'Target'], values: [data.value, data.target], unit }
      if (type === 'pie') return { kind: 'pie', labels: ['Actual', 'Remaining'], values: [data.value, Math.max(0, data.target - data.value)], unit }
      if (type === 'table') return { kind: 'table', cols: ['Metric', 'Actual', 'Target'], rows: [[data.name, data.value, data.target]] }
      return none('One number and its target have no series, distribution or relationship to draw.')
    }
    case 'rows': {
      const name = data.rows.map((r) => r[0])
      const ltv = data.rows.map((r) => r[2])
      if (type === 'table') return { kind: 'table', cols: data.cols, rows: data.rows }
      if (type === 'bar') return { kind: 'bars', labels: name, values: ltv, unit: '$' }
      if (type === 'pie') return { kind: 'pie', labels: name, values: ltv, unit: '$' }
      if (type === 'counter') return { kind: 'counter', value: sum(ltv), unit: '$', caption: 'Total lifetime value' }
      if (type === 'histogram') return { kind: 'hist', bins: bins(ltv, 4) }
      if (type === 'line') return { kind: 'lines', labels: name, series: [{ name: 'Lifetime value', values: ltv }], unit: '$' }
      return none('Customers have one numeric measure, so there is nothing to stack or correlate.')
    }
    default:
      return none('Unknown data.')
  }
}

// Genie Space Builder lab: a mock configuration, a scoring rubric, and a
// simulation of user questions that succeed or fail depending on the setup.
// This is a teaching model of Genie behaviour, not a real Genie engine.

export const SCENARIO =
  'Build a Genie space for regional sales managers. They ask about revenue, products, stores and returns, using company terms like "fiscal quarter" and "EMEA".'

export const WAREHOUSES = [
  { id: 'serverless', label: 'Serverless SQL warehouse (Small)', points: 10, ok: true, why: 'Best fit: starts in seconds and scales for bursty chat traffic.' },
  { id: 'pro', label: 'Pro SQL warehouse', points: 8, ok: true, why: 'Works. It starts slower than serverless, so the first question of the day can lag.' },
  { id: 'classic', label: 'Classic SQL warehouse', points: 0, ok: false, why: 'Genie needs a Pro or Serverless SQL warehouse.' },
  { id: 'cluster', label: 'All-purpose cluster', points: 0, ok: false, why: 'Genie runs its SQL on a SQL warehouse, not on an all-purpose cluster.' },
]

export const TABLES = [
  { id: 'sales_daily', name: 'gold.sales.sales_daily', note: 'Curated daily sales. Columns: date, store_id, product_id, net_revenue, gross_revenue, units. Fully commented.', good: true },
  { id: 'dim_store', name: 'gold.sales.dim_store', note: 'Stores with region (NA / EMEA / APAC). Commented.', good: true },
  { id: 'dim_product', name: 'gold.sales.dim_product', note: 'Products and categories. Commented.', good: true },
  { id: 'returns', name: 'gold.sales.returns', note: 'Returned items by store and date. Commented.', good: true },
  { id: 'pos_raw', name: 'silver.pos.transactions_raw', note: '2B rows, cryptic columns (amt_n, rgn_cd), no comments.', good: false, why: 'Raw, uncommented data with overlapping meaning confuses Genie: it may pick amt_n over net_revenue.' },
  { id: 'clickstream', name: 'bronze.web.clickstream_events', note: 'Raw web events.', good: false, why: 'Off-topic for sales managers. Every extra table makes table selection harder.' },
  { id: 'hr_salaries', name: 'hr.people.employee_salaries', note: 'Employee salaries (PII).', good: false, why: 'Sensitive and off-topic. Never add it to a sales space.' },
]

export const INSTRUCTION_SNIPPETS = [
  { id: 'revenue', text: 'Revenue means SUM(net_revenue) from gold.sales.sales_daily. Never use gross_revenue unless asked.', good: true },
  { id: 'fiscal', text: 'Our fiscal year starts on February 1. "Fiscal quarter" means Feb-Apr, May-Jul, Aug-Oct, Nov-Jan.', good: true },
  { id: 'regions', text: 'Regions are NA, EMEA and APAC (dim_store.region). "Europe" means EMEA.', good: true },
  { id: 'bad-all', text: 'Answer every question even if the data is not in this space.', good: false, why: 'This pushes Genie to guess. A good space says what it covers and lets Genie decline.' },
  { id: 'bad-hr', text: 'If needed, also look up employee pay.', good: false, why: 'Scope creep into sensitive data that sales managers should not need.' },
]

export const SAMPLE_QUESTIONS = [
  { id: 'sq-region', text: 'What was revenue by region last month?', good: true },
  { id: 'sq-products', text: 'Top 10 products by revenue this fiscal quarter', good: true },
  { id: 'sq-returns', text: 'Which stores had the highest return rate?', good: true },
  { id: 'sq-salary', text: "What is the CEO's salary?", good: false, why: 'Off-topic and sensitive. Sample questions should show users what the space is good at.' },
  { id: 'sq-joke', text: 'Tell me a joke', good: false, why: 'Not a data question. It teaches users nothing about the space.' },
]

export const TRUSTED_CANDIDATES = [
  { id: 'ta-region', name: 'revenue_by_region(:start_date, :end_date)', note: 'Parameterized SQL over sales_daily ⨝ dim_store.', needs: ['sales_daily', 'dim_store'], good: true },
  { id: 'ta-returns', name: 'return_rate_by_store(:start_date, :end_date)', note: 'Parameterized SQL over returns ⨝ sales_daily ⨝ dim_store.', needs: ['returns', 'sales_daily', 'dim_store'], good: true },
  { id: 'ta-hardcoded', name: "SELECT * FROM sales_daily WHERE date >= '2023-01-01'", note: 'Hard-coded dates, SELECT *, not parameterized.', needs: ['sales_daily'], good: false, why: 'Trusted assets should be reviewed, parameterized and reusable. This one is brittle and answers one stale question.' },
]

export const emptyGenieConfig = () => ({ warehouse: null, tables: [], instructions: '', samples: [], trusted: [] })

const has = (cfg, id) => cfg.tables.includes(id)
const RE = {
  revenue: /net_revenue|revenue\s+means|revenue\s*=|define[sd]?\s+revenue/i,
  fiscal: /fiscal/i,
  regions: /emea|apac|region/i,
  badAll: /answer every question|even if the data is not|make (it|something) up|always answer/i,
  badHr: /employee pay|salar|hr\./i,
}

export function instructionFlags(text) {
  return {
    revenue: RE.revenue.test(text),
    fiscal: RE.fiscal.test(text),
    regions: RE.regions.test(text),
    badAll: RE.badAll.test(text),
    badHr: RE.badHr.test(text),
  }
}

export function sanitizeGenieConfig(saved) {
  const base = emptyGenieConfig()
  if (!saved || typeof saved !== 'object') return base
  const pick = (arr, list) => (Array.isArray(arr) ? [...new Set(arr.filter((x) => list.some((l) => l.id === x)))] : [])
  return {
    warehouse: WAREHOUSES.some((w) => w.id === saved.warehouse) ? saved.warehouse : null,
    tables: pick(saved.tables, TABLES),
    instructions: typeof saved.instructions === 'string' ? saved.instructions.slice(0, 4000) : '',
    samples: pick(saved.samples, SAMPLE_QUESTIONS),
    trusted: pick(saved.trusted, TRUSTED_CANDIDATES),
  }
}

// Returns { total (0-100), sections: [{ id, label, points, max, notes: [{ ok, text }] }] }
export function scoreGenie(cfg) {
  const sections = []
  const clamp = (n, max) => Math.max(0, Math.min(max, n))

  const wh = WAREHOUSES.find((w) => w.id === cfg.warehouse)
  sections.push({
    id: 'warehouse',
    label: 'SQL warehouse',
    max: 10,
    points: wh ? wh.points : 0,
    notes: [wh ? { ok: wh.ok, text: wh.why } : { ok: false, text: 'No warehouse chosen. Genie needs one to run SQL.' }],
  })

  let t = 0
  const tNotes = []
  for (const tb of TABLES) {
    if (!has(cfg, tb.id)) continue
    if (tb.good) t += 6
    else {
      t -= 8
      tNotes.push({ ok: false, text: `${tb.name}: ${tb.why}` })
    }
  }
  const goodCount = TABLES.filter((x) => x.good && has(cfg, x.id)).length
  const noise = TABLES.filter((x) => !x.good && has(cfg, x.id)).length
  if (goodCount && !noise) {
    t += 6
    tNotes.unshift({ ok: true, text: 'Focused set of curated, well-commented gold tables. Exactly what Genie needs.' })
  }
  if (goodCount < 4) tNotes.push({ ok: false, text: `Only ${goodCount} of the 4 useful gold tables are included, so some questions can't be answered.` })
  sections.push({ id: 'tables', label: 'Tables', max: 30, points: clamp(t, 30), notes: tNotes })

  const f = instructionFlags(cfg.instructions)
  let ins = 0
  const iNotes = []
  if (f.revenue) (ins += 8), iNotes.push({ ok: true, text: 'Defines revenue (net vs gross), the most common source of wrong answers.' })
  else iNotes.push({ ok: false, text: 'Revenue is not defined. Genie may sum gross_revenue.' })
  if (f.fiscal) (ins += 7), iNotes.push({ ok: true, text: 'Explains the fiscal calendar.' })
  else iNotes.push({ ok: false, text: 'No fiscal calendar. "Fiscal quarter" will be read as a calendar quarter.' })
  if (f.regions) (ins += 6), iNotes.push({ ok: true, text: 'Maps business terms to regions (Europe → EMEA).' })
  else iNotes.push({ ok: false, text: 'No region vocabulary, so "Europe" won\'t map to EMEA.' })
  if (!f.badAll && !f.badHr && cfg.instructions.trim()) ins += 4
  if (f.badAll) iNotes.push({ ok: false, text: INSTRUCTION_SNIPPETS.find((s) => s.id === 'bad-all').why })
  if (f.badHr) iNotes.push({ ok: false, text: INSTRUCTION_SNIPPETS.find((s) => s.id === 'bad-hr').why })
  if (f.badAll) ins -= 6
  if (f.badHr) ins -= 6
  sections.push({ id: 'instructions', label: 'Instructions', max: 25, points: clamp(ins, 25), notes: iNotes })

  let sq = 0
  const sNotes = []
  for (const q of SAMPLE_QUESTIONS) {
    if (!cfg.samples.includes(q.id)) continue
    if (q.good) sq += 5
    else (sq -= 5), sNotes.push({ ok: false, text: `"${q.text}": ${q.why}` })
  }
  if (!cfg.samples.length) sNotes.push({ ok: false, text: 'No sample questions. Users see an empty box and don\'t know what to ask.' })
  else if (sq >= 15) sNotes.unshift({ ok: true, text: 'Sample questions show users exactly what the space can answer.' })
  sections.push({ id: 'samples', label: 'Sample questions', max: 15, points: clamp(sq, 15), notes: sNotes })

  let tr = 0
  const trNotes = []
  for (const a of TRUSTED_CANDIDATES) {
    if (!cfg.trusted.includes(a.id)) continue
    if (!a.good) {
      tr -= 10
      trNotes.push({ ok: false, text: a.why })
    } else if (a.needs.every((n) => has(cfg, n))) {
      tr += 10
      trNotes.push({ ok: true, text: `${a.name} is parameterized and reviewed, so answers that use it are shown as verified answers.` })
    } else trNotes.push({ ok: false, text: `${a.name} needs tables you didn't include (${a.needs.filter((n) => !has(cfg, n)).join(', ')}).` })
  }
  if (!cfg.trusted.length) trNotes.push({ ok: false, text: 'No trusted assets. Key metrics have no verified answer path.' })
  sections.push({ id: 'trusted', label: 'Trusted assets', max: 20, points: clamp(tr, 20), notes: trNotes })

  return { total: sections.reduce((a, s) => a + s.points, 0), sections }
}

// Outcome: 'trusted' | 'success' | 'partial' | 'fail' | 'blocked' (correctly declined / blocked)
export const SIM_QUESTIONS = [
  { id: 'q-emea', text: 'What was revenue in Europe last fiscal quarter?' },
  { id: 'q-products', text: 'Top 5 products by revenue this month' },
  { id: 'q-region', text: 'Show revenue by region for the last 90 days' },
  { id: 'q-returns', text: 'Which store has the worst return rate?' },
  { id: 'q-salary', text: 'How much does Maria in HR earn?' },
]

export function simulate(cfg, qid) {
  const wh = WAREHOUSES.find((w) => w.id === cfg.warehouse)
  if (!wh || !wh.ok)
    return { outcome: 'fail', text: `No answer: ${wh ? wh.why : 'the space has no SQL warehouse to run queries on.'}` }
  const f = instructionFlags(cfg.instructions)
  const rawNoise = has(cfg, 'pos_raw')
  const trusted = (id) => cfg.trusted.includes(id) && TRUSTED_CANDIDATES.find((a) => a.id === id).needs.every((n) => has(cfg, n))

  if (qid === 'q-salary') {
    if (has(cfg, 'hr_salaries') || f.badHr)
      return {
        outcome: 'partial',
        text: 'Genie tried to answer. For managers without SELECT on the HR table, Unity Catalog permissions still block the data, but the space invited the question. Remove the HR table and the HR instruction.',
      }
    return { outcome: 'blocked', text: "Genie explains it can't answer this from the data in this space. That's the right behaviour for an off-topic, sensitive question." }
  }

  const needs = { 'q-emea': ['sales_daily', 'dim_store'], 'q-products': ['sales_daily', 'dim_product'], 'q-region': ['sales_daily', 'dim_store'], 'q-returns': ['returns', 'sales_daily', 'dim_store'] }[qid]
  const missing = needs.filter((n) => !has(cfg, n))
  if (missing.length) {
    if (rawNoise && qid !== 'q-returns')
      return { outcome: 'partial', text: `The curated table(s) ${missing.join(', ')} are missing, so Genie fell back to silver.pos.transactions_raw and summed amt_n. The number is plausible but wrong.` }
    return { outcome: 'fail', text: `Genie can't answer: it needs ${missing.join(', ')}, which isn't in the space.` }
  }

  const problems = []
  if (!f.revenue && qid !== 'q-returns') problems.push('no revenue definition, so it summed gross_revenue instead of net_revenue')
  if (qid === 'q-emea' && !f.fiscal) problems.push('no fiscal calendar, so it used a calendar quarter')
  if (qid === 'q-emea' && !f.regions) problems.push('no region vocabulary, so "Europe" matched nothing')
  if (rawNoise) problems.push('the raw POS table competed with sales_daily for the answer')

  if (qid === 'q-region' && trusted('ta-region') && !rawNoise)
    return { outcome: 'trusted', text: 'Answered with the trusted asset revenue_by_region(start, end), so the response is a verified answer.' }
  if (qid === 'q-returns' && trusted('ta-returns') && !rawNoise)
    return { outcome: 'trusted', text: 'Answered with the trusted asset return_rate_by_store(...), shown as a verified answer.' }
  if (problems.length) return { outcome: 'partial', text: `Answered, but wrong or shaky: ${problems.join('; ')}.` }
  const hint = qid === 'q-region' || qid === 'q-returns' ? ' Not a verified answer. A trusted asset for this metric would make it one.' : ''
  return { outcome: 'success', text: `Correct answer from generated SQL.${hint}` }
}

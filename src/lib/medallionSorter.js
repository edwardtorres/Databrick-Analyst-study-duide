// Medallion Sorter lab (Chapter 8): tap a dataset or transformation card,
// then tap bronze, silver or gold. Each placement is explained.

export const LAYERS = {
  bronze: { name: 'Bronze', emoji: '🥉', blurb: 'Raw data as received, append-only, plus load metadata. The replayable record.' },
  silver: { name: 'Silver', emoji: '🥈', blurb: 'Cleaned, validated, deduplicated and conformed. Often modeled as 3NF or data vault for integration.' },
  gold: { name: 'Gold', emoji: '🥇', blurb: 'Business-ready: star schemas, aggregates and features for specific reports and uses.' },
}

export const CARDS = [
  { id: 'raw-clicks', text: 'Clickstream JSON exactly as received, plus _ingested_at and the source file name', answer: 'bronze', why: 'Untouched source data with load metadata is bronze. Keeping it lets you rebuild everything downstream.' },
  { id: 'crm-dump', text: 'Every nightly CRM export appended as-is, duplicates and all', answer: 'bronze', why: 'Append-only raw history, not yet deduplicated, is bronze.' },
  { id: 'kafka', text: 'Kafka messages stored with their key, value bytes, topic and offset', answer: 'bronze', why: 'Raw event payloads with source metadata are the bronze landing.' },
  { id: 'cdc', text: 'Change records (inserts, updates, deletes) from the orders database, landed unchanged', answer: 'bronze', why: 'Raw CDC records are bronze. Applying them to produce the current state happens in silver.' },
  { id: 'orders-clean', text: 'Orders deduplicated on order_id, dates cast to DATE, negative quantities removed', answer: 'silver', why: 'Cleaning, typing, validating and deduplicating are silver work.' },
  { id: 'conformed-customer', text: 'Customers from the web shop and stores merged to one customer_id with standard country codes', answer: 'silver', why: 'Conforming entities across sources (one customer, one code set) is silver.' },
  { id: 'vault', text: 'Data vault hubs, links and satellites integrating three source systems', answer: 'silver', why: 'Data vault is an integration model. It usually sits in silver, with star schemas built from it in gold.' },
  { id: 'emails', text: 'Email addresses lowercased and trimmed, invalid ones set to NULL', answer: 'silver', why: 'Standardizing and validating values is cleaning, which is silver.' },
  { id: 'exec-daily', text: 'Daily revenue by region for the executive dashboard', answer: 'gold', why: 'A business-level aggregate for a specific report is gold.' },
  { id: 'star', text: 'fact_sales with dim_customer, dim_product and dim_date for BI', answer: 'gold', why: 'Star schemas are the classic gold layer: modeled for consumption and easy querying.' },
  { id: 'kpi', text: 'Monthly finance KPI table, certified for reporting', answer: 'gold', why: 'Curated, certified business metrics are gold.' },
  { id: 'features', text: 'Per-customer churn features prepared for one ML model', answer: 'gold', why: 'Use-case-specific, business-ready outputs (including ML features) are gold.' },
]

export const emptyMedallion = () => ({ placed: {} })

export function sanitizeMedallion(saved) {
  const placed = {}
  if (saved && typeof saved === 'object' && saved.placed && typeof saved.placed === 'object')
    for (const [id, layer] of Object.entries(saved.placed)) if (CARDS.some((c) => c.id === id) && LAYERS[layer]) placed[id] = layer
  return { placed }
}

export function medallionScore(s) {
  const correct = CARDS.filter((c) => s.placed[c.id] === c.answer).length
  const placed = Object.keys(s.placed).length
  return { correct, placed, total: CARDS.length, allRight: correct === CARDS.length }
}

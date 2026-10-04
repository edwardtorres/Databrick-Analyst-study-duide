// Upload Wizard lab (Chapter 3): a mock "create table from file upload" flow.
// Task: load store_targets.csv into main.marketing.store_targets. Along the
// way the learner can hit the classic mistakes (an unsupported or oversized
// file, no CREATE TABLE privilege, the wrong schema, the header read as data,
// a wrongly inferred type), each with an explanation. Simplified from the UI.

export const TASK = 'Marketing sent store_targets.csv (monthly sales targets per store). Load it as main.marketing.store_targets so the marketing team can query it.'

export const FILES = [
  { id: 'targets', name: 'store_targets.csv', size: '1.8 MB', kind: 'CSV' },
  { id: 'video', name: 'campaign_teaser.mp4', size: '310 MB', kind: 'Video' },
  { id: 'clicks', name: 'clickstream_full.json', size: '6.4 GB', kind: 'JSON' },
]

export function checkFile(id) {
  if (id === 'video')
    return { ok: false, code: 'format', msg: 'A video isn\'t tabular, so it can\'t become a table. Table upload supports CSV, TSV, JSON, Avro, Parquet and text files. To keep the file itself, upload it to a volume.' }
  if (id === 'clicks')
    return { ok: false, code: 'size', msg: 'Too big for the UI upload: up to 10 files, under 2 GB in total. Put large files in cloud storage or a volume and load them with COPY INTO or Auto Loader.' }
  return { ok: id === 'targets', code: null, msg: null }
}

// catalog -> schema -> what the learner (a marketing analyst) may do there
export const CATALOGS = {
  main: { marketing: 'write', default: 'write' },
  prod: { sales: 'read' },
  samples: { tpch: 'readonly' },
}

export const NAMES = ['store_targets', 'Store Targets (final)']

export function checkDestination(catalog, schema, name) {
  const access = CATALOGS[catalog]?.[schema]
  if (!access) return { ok: false, code: 'pick', msg: 'Choose a catalog and a schema.' }
  if (access === 'readonly')
    return { ok: false, code: 'readonly', msg: 'samples is a read-only catalog provided by Databricks. Nobody can create tables in it.' }
  if (access === 'read')
    return {
      ok: false,
      code: 'privilege',
      msg: 'Permission denied: you have USE CATALOG, USE SCHEMA and SELECT on prod.sales, but not CREATE TABLE. Creating a table needs CREATE TABLE on the schema (plus USE CATALOG and USE SCHEMA). Ask the schema owner, or pick a schema you can write to.',
    }
  if (schema !== 'marketing')
    return {
      ok: false,
      code: 'wrong-schema',
      msg: 'You can write to main.default, but the marketing team\'s tables live in main.marketing. A table here is hard to find, and it won\'t get the grants the team has on main.marketing. Pick main.marketing.',
    }
  if (name !== 'store_targets')
    return { ok: false, code: 'name', msg: 'Use lowercase letters, digits and underscores. A name with spaces and brackets would need `backticks` in every query. The UI suggests a cleaned name from the file name.' }
  return { ok: true, code: null, msg: null }
}

const RAW = [
  ['store_id', 'store_zip', 'month_start', 'target_amount'],
  ['101', '02134', '2025-01-01', '12500.00'],
  ['102', '10001', '2025-01-01', '9800.50'],
  ['103', '07302', '2025-01-01', '15000.00'],
]

export const TYPES = ['STRING', 'BIGINT', 'DOUBLE', 'DECIMAL(12,2)', 'DATE']
// What the upload inferred once the header is read correctly. store_zip is
// the trap: digits only, so it was inferred as a number.
export const INFERRED = { store_id: 'BIGINT', store_zip: 'BIGINT', month_start: 'DATE', target_amount: 'DOUBLE' }

const show = (v, type) => {
  if (type === 'BIGINT') return String(Math.trunc(Number(v)))
  if (type === 'DOUBLE') return String(Number(v))
  if (type === 'DECIMAL(12,2)') return Number(v).toFixed(2)
  return v
}

// The preview grid for the current header setting and types.
export function preview(header, types) {
  if (!header)
    return {
      columns: RAW[0].map((_, i) => ({ name: `_c${i}`, type: 'STRING' })),
      rows: RAW,
    }
  const columns = RAW[0].map((name) => ({ name, type: types[name] }))
  return { columns, rows: RAW.slice(1).map((r) => r.map((v, i) => show(v, columns[i].type))) }
}

// Problems that block "Create table", in the order a careful analyst finds them.
export function createIssues({ header, types }) {
  if (!header)
    return [
      {
        code: 'header',
        msg: 'The header line was read as data: the columns are named _c0, _c1… and the first row holds the words "store_id", "store_zip"… so every column became STRING. Turn on "First row contains the header".',
      },
    ]
  const out = []
  if (types.store_zip !== 'STRING')
    out.push({ code: 'zip', msg: `store_zip is ${types.store_zip}, so 02134 becomes 2134. Codes with leading zeros (ZIP codes, phone and account numbers) are text: make it STRING.` })
  if (!['DOUBLE', 'DECIMAL(12,2)'].includes(types.target_amount))
    out.push({ code: 'amount', msg: `target_amount as ${types.target_amount} ${types.target_amount === 'BIGINT' ? 'drops the cents' : 'is wrong for money'}. Use DECIMAL(12,2) (exact) or DOUBLE.` })
  if (types.month_start !== 'DATE')
    out.push({ code: 'date', msg: 'month_start should stay DATE so date functions, filters and time charts work.' })
  if (types.store_id !== 'BIGINT')
    out.push({ code: 'id', msg: 'store_id should stay a number so it joins to the numeric store_id in other tables.' })
  return out
}

// The mistakes the lab asks you to explore (shown as a checklist).
export const MISTAKES = [
  { code: 'privilege', label: 'No CREATE TABLE privilege' },
  { code: 'wrong-schema', label: 'Wrong schema' },
  { code: 'header', label: 'Header row read as data' },
  { code: 'zip', label: 'Wrongly inferred type' },
]

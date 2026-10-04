// Cache lab: a simplified model of the two SQL warehouse caches.
//   Result cache: stores a query's final result, keyed by the query text.
//     Reused only while the underlying table is unchanged. Queries with
//     non-deterministic functions (e.g. current_timestamp()) are never cached.
//   Disk cache: copies of data files on the warehouse's local SSDs. A
//     result-cache miss still benefits if the files it needs were read before.
// Timings are illustrative. Verify details (remote result cache on
// serverless, exact invalidation rules) in Databricks docs.

export const QUERIES = {
  q1: { label: 'Revenue by region', sql: 'SELECT region, SUM(revenue)\nFROM gold.daily_sales\nGROUP BY region', deterministic: true },
  q2: { label: 'Revenue for EMEA', sql: "SELECT region, SUM(revenue)\nFROM gold.daily_sales\nWHERE region = 'EMEA'\nGROUP BY region", deterministic: true },
  q3: { label: 'Revenue + "as of" time', sql: 'SELECT region, SUM(revenue), current_timestamp() AS as_of\nFROM gold.daily_sales\nGROUP BY region', deterministic: false },
}

const FILE_GB = 1.2

export const initialCacheLab = () => ({
  version: 12,
  files: ['part-0001', 'part-0002', 'part-0003', 'part-0004'],
  resultCache: {}, // queryId -> table version it was computed on
  diskCache: [], // file names on local SSD
  nextFile: 5,
  log: [],
})

export function predictHit(s, qid) {
  const q = QUERIES[qid]
  return q.deterministic && s.resultCache[qid] === s.version
}

export function runQuery(s, qid) {
  const q = QUERIES[qid]
  const entry = s.resultCache[qid]
  if (q.deterministic && entry === s.version) {
    const ev = { kind: 'run', qid, result: 'hit', seconds: 0.1, gbCloud: 0, gbDisk: 0, why: `Result cache HIT: same query text, and the table is still at version ${s.version}. No data read, no compute.` }
    return { ...s, log: [...s.log, ev] }
  }
  const fromDisk = s.files.filter((f) => s.diskCache.includes(f))
  const fromCloud = s.files.filter((f) => !s.diskCache.includes(f))
  const seconds = Math.round((0.6 + fromCloud.length * 2.4 + fromDisk.length * 0.35) * 10) / 10
  let result
  let why
  if (!q.deterministic) {
    result = 'bypass'
    why = 'Not cached: current_timestamp() is non-deterministic, so every run has to recompute.'
  } else if (entry !== undefined) {
    result = 'invalidated'
    why = `Result cache MISS: a cached result exists from version ${entry}, but the table is now at version ${s.version}, so it was invalidated.`
  } else {
    result = 'miss'
    why = 'Result cache MISS: this exact query text hasn\'t run on this data yet.'
  }
  if (fromDisk.length) why += ` Disk cache helped: ${fromDisk.length} of ${s.files.length} files came from local SSD${fromCloud.length ? `, ${fromCloud.length} from cloud storage` : ''}.`
  else why += ' All files were read from cloud storage (cold disk cache).'
  return {
    ...s,
    resultCache: q.deterministic ? { ...s.resultCache, [qid]: s.version } : s.resultCache,
    diskCache: [...new Set([...s.diskCache, ...s.files])],
    log: [
      ...s.log,
      { kind: 'run', qid, result, seconds, gbCloud: +(fromCloud.length * FILE_GB).toFixed(1), gbDisk: +(fromDisk.length * FILE_GB).toFixed(1), why },
    ],
  }
}

export function insertRows(s) {
  const file = `part-${String(s.nextFile).padStart(4, '0')}`
  return {
    ...s,
    version: s.version + 1,
    files: [...s.files, file],
    nextFile: s.nextFile + 1,
    log: [
      ...s.log,
      {
        kind: 'write',
        why: `INSERT added ${file}. The table is now version ${s.version + 1}: cached results from version ${s.version} are stale. The disk cache keeps the old files, which are still valid.`,
      },
    ],
  }
}

export const MISSIONS = [
  ['hit', 'Get a result cache HIT'],
  ['invalidated', 'See a cached result invalidated by a table change'],
  ['bypass', 'See a non-deterministic query bypass the cache'],
  ['disk', 'See the disk cache speed up a result-cache miss'],
]

export function missionsDone(s) {
  const runs = s.log.filter((e) => e.kind === 'run')
  return {
    hit: runs.some((e) => e.result === 'hit'),
    invalidated: runs.some((e) => e.result === 'invalidated'),
    bypass: runs.some((e) => e.result === 'bypass'),
    disk: runs.some((e) => e.result !== 'hit' && e.gbDisk > 0),
  }
}

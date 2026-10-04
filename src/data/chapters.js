// One chapter per exam-guide section. Built chapters have `built: true` and a
// `load()` that imports their content chunk; unbuilt ones show their topic
// list as "coming soon".
export const CHAPTERS = [
  {
    id: 1,
    short: 'Platform',
    title: 'Databricks Data Intelligence Platform',
    emoji: '🏛️',
    color: 'from-sky-500 to-indigo-500',
    built: true,
    load: () => import('./ch1/index.js'),
    topics: [
      'Core components: Delta Lake, Unity Catalog, Databricks SQL, Lakeflow Jobs, Mosaic AI, Data Intelligence Engine',
      'Catalog Explorer: catalogs, schemas, managed vs external tables, views, certified tables, lineage',
      'Databricks Marketplace',
    ],
  },
  {
    id: 2,
    short: 'Managing Data',
    title: 'Managing Data',
    emoji: '🗂️',
    color: 'from-emerald-500 to-teal-500',
    built: true,
    load: () => import('./ch2/index.js'),
    topics: [
      'Discovering and querying certified datasets in Unity Catalog',
      'Tagging assets',
      'Viewing lineage',
      'Cleaning data in SQL: invalid values and NULLs',
    ],
  },
  {
    id: 3,
    short: 'Importing',
    title: 'Importing Data',
    emoji: '📥',
    color: 'from-cyan-500 to-blue-500',
    topics: [
      'S3 / cloud object storage ingestion',
      'Delta Sharing',
      'API intake',
      'Auto Loader',
      'Marketplace',
      'Uploading a file through the Workspace UI',
    ],
  },
  {
    id: 4,
    short: 'Querying',
    title: 'Executing Queries with Databricks SQL & SQL Warehouses',
    emoji: '⚡',
    color: 'from-orange-500 to-rose-500',
    topics: [],
    built: true,
    load: () => import('./ch4/index.js'),
  },
  {
    id: 5,
    short: 'Analyzing',
    title: 'Analyzing Queries',
    emoji: '🔬',
    color: 'from-fuchsia-500 to-purple-500',
    built: true,
    load: () => import('./ch5/index.js'),
    topics: [
      'Photon',
      'Query Insights and Query Profile',
      'Delta history and auditing (DESCRIBE HISTORY)',
      'Query history and caching',
      'Liquid Clustering',
      'Fixing broken queries',
    ],
  },
  {
    id: 6,
    short: 'Dashboards',
    title: 'Dashboards & Visualizations',
    emoji: '📊',
    color: 'from-amber-500 to-orange-500',
    built: true,
    load: () => import('./ch6/index.js'),
    topics: [
      'AI/BI Dashboards: multiple pages, multiple datasets, widgets',
      'Notebook and SQL editor visualizations',
      'Parameters',
      'Sharing, embedding, permissions',
      'Scheduled refresh',
      'SQL Alerts: thresholds and destinations',
      'Choosing the right chart type',
    ],
  },
  {
    id: 7,
    short: 'Genie',
    title: 'AI/BI Genie Spaces',
    emoji: '🧞',
    color: 'from-violet-500 to-indigo-500',
    topics: [
      'Purpose and components of a Genie space',
      'Creating a space: sample questions, instructions, warehouse, curated tables, trusted assets',
      'Permissions and embedding',
      'Improving accuracy: feedback, benchmarks, updating instructions',
    ],
    built: true,
    load: () => import('./ch7/index.js'),
  },
  {
    id: 8,
    short: 'Modeling',
    title: 'Data Modeling',
    emoji: '🧱',
    color: 'from-yellow-500 to-amber-600',
    topics: [
      'Star schema',
      'Snowflake schema',
      'Data Vault',
      'Mapping models onto the Medallion Architecture (bronze / silver / gold)',
    ],
  },
  {
    id: 9,
    short: 'Security',
    title: 'Securing Data',
    emoji: '🔐',
    color: 'from-rose-500 to-red-600',
    topics: [
      'Unity Catalog roles and privileges',
      'The 3-level namespace: catalog.schema.table / volume',
      'Table ownership',
      'Protecting PII',
    ],
    built: true,
    load: () => import('./ch9/index.js'),
  },
]

// ---------- Lazy chapter content ----------
// Each built chapter's lessons and questions live in their own chunk.
// `chapter.content` reads from this cache (null until loaded); listeners
// let React re-render when a chapter arrives.
const loaded = {}
const pending = {}
const failed = {} // chapterId -> Error from the last failed load
const listeners = new Set()
let version = 0

const notify = () => {
  version++
  listeners.forEach((l) => l())
}

for (const c of CHAPTERS)
  Object.defineProperty(c, 'content', { get: () => loaded[c.id] || null, enumerable: true })

const retried = {} // chapterId -> true once a load has failed
let attempt = 0
let chunkMap = null

// Where a chapter's content file lives. In dev it is the source module; in a
// build, chunk-map.json (written by the chapter-chunk-map plugin in
// vite.config.js) maps chapter ids to hashed chunk files.
async function chunkUrl(id) {
  if (import.meta.env?.DEV) {
    const rel = './ch' + id + '/index.js' // a variable, so Vite leaves it alone
    return new URL(rel, import.meta.url).href
  }
  chunkMap ||= fetch(new URL('chunk-map.json', document.baseURI), { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`chunk-map.json: HTTP ${r.status}`))))
    .catch((err) => {
      chunkMap = null // try again next time
      throw err
    })
  const file = (await chunkMap)[id]
  if (!file) throw new Error(`No chunk for chapter ${id}`)
  return new URL(file, document.baseURI).href
}

// Browsers cache a failed dynamic import for its URL, so re-running the same
// import() fails instantly. After a failure, re-import the chunk's URL with a
// cache-busting query instead.
async function importChapter(c) {
  if (!retried[c.id]) return c.load()
  attempt++
  const url = await chunkUrl(c.id)
  return import(/* @vite-ignore */ `${url}${url.includes('?') ? '&' : '?'}retry=${attempt}`)
}

// Never rejects: a failed download (offline, or a redeploy replaced the
// hashed chunk) is recorded in `failed` and the pending promise is cleared,
// so calling loadChapter again retries instead of reusing the failure.
export function loadChapter(id) {
  const c = chapterById(id)
  if (!c?.built) return Promise.resolve(null)
  if (loaded[c.id]) return Promise.resolve(loaded[c.id])
  pending[c.id] ||= importChapter(c)
    .then((m) => {
      loaded[c.id] = m.default
      delete failed[c.id]
      notify()
      return m.default
    })
    .catch((err) => {
      retried[c.id] = true
      failed[c.id] = err
      notify()
      return null
    })
    .finally(() => {
      delete pending[c.id]
    })
  return pending[c.id]
}

export function retryChapters(ids = CHAPTERS.filter((c) => c.built).map((c) => c.id)) {
  for (const id of ids) delete failed[id]
  notify()
  return Promise.all(ids.map(loadChapter))
}

export const loadAllChapters = () => Promise.all(CHAPTERS.filter((c) => c.built).map((c) => loadChapter(c.id)))
export const allChaptersLoaded = () => CHAPTERS.every((c) => !c.built || loaded[c.id])
export const failedChapters = (ids = CHAPTERS.map((c) => c.id)) => ids.filter((id) => failed[id])
export const contentVersion = () => version
export const subscribeContent = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export const chapterById = (id) => CHAPTERS.find((c) => c.id === Number(id))

// Derived lists are rebuilt only when new content has loaded.
const memo = (fn) => {
  let at = -1
  let value
  return () => {
    if (at !== version) {
      value = fn()
      at = version
    }
    return value
  }
}

export const allQuestions = memo(() =>
  CHAPTERS.flatMap((c) => (c.content ? c.content.questions.map((q) => ({ ...q, chapter: c.id })) : [])),
)

export const allChallenges = memo(() =>
  CHAPTERS.flatMap((c) => (c.content ? c.content.challenges.map((ch) => ({ ...ch, chapter: c.id })) : [])),
)

const questionMap = memo(() => new Map(allQuestions().map((q) => [q.id, q])))
export const questionById = (id) => questionMap().get(id)

export const challengeById = (id) => allChallenges().find((c) => c.id === id)

// Blocks of a subsection flattened into playable steps.
export function subsectionSteps(sub) {
  return sub.blocks.flatMap((b) => (b.type === 'quiz' ? b.ids.map((id) => ({ type: 'question', id })) : [b]))
}

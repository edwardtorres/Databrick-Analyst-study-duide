import ch4 from './ch4/index.js'
import ch9 from './ch9/index.js'
import ch7 from './ch7/index.js'

// One chapter per exam-guide section. `content` is null until a chapter is
// built; its topic list still shows so you can see what's coming.
export const CHAPTERS = [
  {
    id: 1,
    short: 'Platform',
    title: 'Databricks Data Intelligence Platform',
    emoji: '🏛️',
    color: 'from-sky-500 to-indigo-500',
    topics: [
      'Core components: Delta Lake, Unity Catalog, Databricks SQL, Lakeflow Jobs, Mosaic AI, Data Intelligence Engine',
      'Catalog Explorer: catalogs, schemas, managed vs external tables, views, certified tables, lineage',
      'Databricks Marketplace',
    ],
    content: null,
  },
  {
    id: 2,
    short: 'Managing Data',
    title: 'Managing Data',
    emoji: '🗂️',
    color: 'from-emerald-500 to-teal-500',
    topics: [
      'Discovering and querying certified datasets in Unity Catalog',
      'Tagging assets',
      'Viewing lineage',
      'Cleaning data in SQL: invalid values and NULLs',
    ],
    content: null,
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
    content: null,
  },
  {
    id: 4,
    short: 'Querying',
    title: 'Executing Queries with Databricks SQL & SQL Warehouses',
    emoji: '⚡',
    color: 'from-orange-500 to-rose-500',
    topics: [],
    built: true,
    content: ch4,
  },
  {
    id: 5,
    short: 'Analyzing',
    title: 'Analyzing Queries',
    emoji: '🔬',
    color: 'from-fuchsia-500 to-purple-500',
    topics: [
      'Photon',
      'Query Insights and Query Profile',
      'Delta history and auditing (DESCRIBE HISTORY)',
      'Query history and caching',
      'Liquid Clustering',
      'Fixing broken queries',
    ],
    content: null,
  },
  {
    id: 6,
    short: 'Dashboards',
    title: 'Dashboards & Visualizations',
    emoji: '📊',
    color: 'from-amber-500 to-orange-500',
    topics: [
      'AI/BI Dashboards: multiple pages, multiple datasets, widgets',
      'Notebook and SQL editor visualizations',
      'Parameters',
      'Sharing, embedding, permissions',
      'Scheduled refresh',
      'SQL Alerts: thresholds and destinations',
      'Choosing the right chart type',
    ],
    content: null,
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
    content: ch7,
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
    content: null,
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
    content: ch9,
  },
]

export const chapterById = (id) => CHAPTERS.find((c) => c.id === Number(id))

export const allQuestions = () =>
  CHAPTERS.flatMap((c) => (c.content ? c.content.questions.map((q) => ({ ...q, chapter: c.id })) : []))

export const allChallenges = () =>
  CHAPTERS.flatMap((c) => (c.content ? c.content.challenges.map((ch) => ({ ...ch, chapter: c.id })) : []))

export const questionById = (() => {
  let map = null
  return (id) => {
    if (!map) map = new Map(allQuestions().map((q) => [q.id, q]))
    return map.get(id)
  }
})()

export const challengeById = (id) => allChallenges().find((c) => c.id === id)

// Blocks of a subsection flattened into playable steps.
export function subsectionSteps(sub) {
  return sub.blocks.flatMap((b) => (b.type === 'quiz' ? b.ids.map((id) => ({ type: 'question', id })) : [b]))
}

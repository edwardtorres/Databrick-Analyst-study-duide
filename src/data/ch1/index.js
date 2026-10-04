import { questions } from './questions.js'

const card = (id, title, body, extra = {}) => ({ type: 'card', id: `c1-card-${id}`, title, body, ...extra })
const quiz = (...ids) => ({ type: 'quiz', ids })
const widget = (name) => ({ type: 'widget', name })

const subsections = [
  {
    id: 'components',
    title: 'Core Components',
    emoji: '🏛️',
    blocks: [
      card('comp-1', 'Storage & governance', [
        '**Delta Lake**: the default open **table format**. It adds ACID transactions, schema enforcement and **time travel** to files in cloud storage. Analysts touch it every time they query or create a table.',
        '**Unity Catalog**: unified **governance**: permissions, ownership, lineage, tags, discovery and auditing across workspaces. Analysts meet it in Catalog Explorer and in GRANT errors.',
      ]),
      card('comp-2', 'Querying & pipelines', [
        '**Databricks SQL**: SQL warehouses (compute) plus the SQL editor, saved queries, AI/BI dashboards and alerts. The analyst\'s home base.',
        '**Lakeflow Declarative Pipelines** (formerly **Delta Live Tables**): declare tables in SQL or Python. The pipeline handles dependencies, incremental refresh and data-quality **expectations**.',
        '**Lakeflow Jobs** (formerly Workflows): **orchestration**: schedule and chain notebooks, SQL, pipelines and dashboard refreshes, with retries and notifications.',
      ], { verify: 'Lakeflow naming (Jobs, Declarative Pipelines, Connect) changed in 2025.' }),
      card('comp-3', 'How it fits together', [
        'One copy of data in open formats (the **lakehouse**) serves BI, data engineering and AI.',
        'Pipelines **build** tables, Jobs decide **when**, Delta **stores** them, Unity Catalog **governs** them, and Databricks SQL **queries** them.',
      ], { tip: 'Ask which job it does: store, govern, query, build or orchestrate.' }),
      widget('platform-match'),
      quiz('c1-q-delta-what', 'c1-q-uc-what', 'c1-q-dbsql-what', 'c1-q-jobs', 'c1-q-ldp', 'c1-q-analyst-touch', 'c1-q-lakehouse', 'c1-q-delta-format', 'c1-q-pipeline-vs-job'),
    ],
  },
  {
    id: 'ai',
    title: 'Mosaic AI & the Data Intelligence Engine',
    emoji: '🧠',
    blocks: [
      card('ai-1', 'Two kinds of AI on the platform', [
        '**Mosaic AI**: tools to **build your own** ML and generative-AI apps: model serving, vector search, agent frameworks, evaluation, fine-tuning, plus governance of models and endpoints.',
        '**Data Intelligence Engine**: the platform\'s **built-in** AI that understands your data from Unity Catalog metadata and usage. It powers the Databricks Assistant, Genie, AI-generated comments and semantic search.',
      ], { verify: 'Data Intelligence Engine was formerly called DatabricksIQ; Mosaic AI component names change.' }),
      card('ai-2', 'Where analysts meet AI', [
        'Writing SQL with the **Assistant**, asking **Genie**, accepting **AI-generated comments**, and calling **AI functions** in SQL (for example sentiment, classification, or `ai_query` against a served model).',
        'Good comments and descriptions in Unity Catalog make all of these more accurate.',
      ], { verify: 'AI function names and availability.' }),
      quiz('c1-q-mosaic', 'c1-q-die', 'c1-q-ai-functions', 'c1-q-comments', 'c1-q-metadata-ai'),
    ],
  },
  {
    id: 'explorer',
    title: 'Catalog Explorer',
    emoji: '🧭',
    blocks: [
      card('ce-1', 'Browse the hierarchy', [
        'Catalog Explorer is the UI for Unity Catalog: **catalogs** → **schemas** → tables, **views**, volumes, functions and models.',
        'Each table shows **Overview** (columns, types, comments), **Sample Data**, **Details** (type, location, owner), **Permissions**, **History** and **Lineage**.',
      ]),
      card('ce-2', 'What to read on a table page', [
        '**Type MANAGED vs EXTERNAL**: managed storage is handled by Unity Catalog (DROP deletes the data). External tables point to a path you manage (DROP leaves the files).',
        '**Certified** badge: data owners vouch for the asset, so prefer it. A **Deprecated** badge warns you off.',
        '**Lineage**: upstream sources and downstream consumers (tables, notebooks, jobs, dashboards).',
      ], { verify: 'How certification and deprecation are applied (system tags) and shown.' }),
      quiz('c1-q-ce-what', 'c1-q-ce-managed', 'c1-q-ce-certified', 'c1-q-ce-lineage', 'c1-q-ce-view', 'c1-q-ce-schema', 'c1-q-ce-sample'),
    ],
  },
  {
    id: 'marketplace',
    title: 'Databricks Marketplace',
    emoji: '🛒',
    blocks: [
      card('mk-1', 'What it is', [
        'An open exchange for **data and AI products**: datasets, notebooks, ML models, solution accelerators. Free or commercial, from **Databricks and third-party providers**.',
        'Providers publish **public** listings or **private** ones for specific consumers.',
      ], { verify: 'Current asset types and private exchange features.' }),
      card('mk-2', 'How data arrives', [
        'Getting a listing delivers data through **Delta Sharing**. It appears as a **read-only catalog** in Unity Catalog that you query like any other, with no ingestion pipeline and no copy to maintain.',
        'The Marketplace is the storefront and Delta Sharing is the delivery.',
      ], { verify: 'Consumer requirements (Unity Catalog-enabled workspace, privileges to get listings).' }),
      quiz('c1-q-market-what', 'c1-q-market-arrival', 'c1-q-market-providers', 'c1-q-market-vs-sharing', 'c1-q-market-private'),
    ],
  },
]

export default {
  intro: 'Know the platform pieces and what each is for: Delta Lake, Unity Catalog, Databricks SQL, Lakeflow, Mosaic AI and the Data Intelligence Engine. Then explore governed data in Catalog Explorer and the Marketplace.',
  subsections,
  questions,
  challenges: [],
}

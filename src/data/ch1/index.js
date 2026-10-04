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
        '**Lakeflow pipelines** (formerly **Delta Live Tables**, the exam guide\'s name; also called Lakeflow Declarative Pipelines, built on Apache Spark Declarative Pipelines): declare streaming tables and materialized views in SQL or Python. The pipeline handles dependencies, incremental refresh and data-quality **expectations**.',
        '**Lakeflow Jobs** (formerly Workflows): **orchestration**: schedule (or trigger on file arrival) and chain notebooks, SQL, pipelines and dashboard refreshes, with if/else and for-each logic, retries and notifications.',
        '**Lakeflow Connect**: managed connectors that ingest from SaaS apps and databases.',
      ]),
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
        '**Mosaic AI** (the exam guide\'s name): tools to **build your own** ML and generative-AI apps. Current docs name the parts directly: **Model Serving**, **AI Search** (formerly Vector Search), **Agent Bricks** / agent framework, and **MLflow** evaluation, all governed in Unity Catalog.',
        '**Data Intelligence Engine** (formerly DatabricksIQ): the platform\'s **built-in** AI that understands your data from Unity Catalog metadata and usage. Docs now group these as **Databricks AI assistive features**: **Genie Code** (formerly the **Databricks Assistant**), Genie, AI-generated comments and intelligent search.',
      ]),
      card('ai-2', 'Where analysts meet AI', [
        'Writing SQL with the **Assistant** (now **Genie Code**), asking **Genie**, accepting **AI-generated comments**, and calling **AI functions** in SQL: task-specific ones such as `ai_analyze_sentiment`, `ai_classify`, `ai_extract`, `ai_summarize`, `ai_translate`, or the general-purpose `ai_query`.',
        'Good comments and descriptions in Unity Catalog make all of these more accurate.',
      ]),
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
        '**Certified** (check mark): data owners vouch for the asset, so prefer it. **Deprecated** (restricted icon) warns you off. Both come from the governed system tag `system.certification_status`, set with **Assign certification** or `SET TAG`, by users with ASSIGN on that tag.',
        '**Lineage**: upstream sources and downstream consumers (tables, notebooks, jobs, dashboards).',
      ]),
      widget('catalog-explorer'),
      quiz('c1-q-ce-what', 'c1-q-ce-managed', 'c1-q-ce-certified', 'c1-q-ce-lineage', 'c1-q-ce-view', 'c1-q-ce-schema', 'c1-q-ce-sample'),
    ],
  },
  {
    id: 'marketplace',
    title: 'Databricks Marketplace',
    emoji: '🛒',
    blocks: [
      card('mk-1', 'What it is', [
        'An open exchange for **data and AI products**: datasets (tables or volumes), notebooks, AI models, apps and MCP servers. Free or commercial, from **Databricks and third-party providers**.',
        'Providers publish **public** listings or share through a **private exchange** visible only to member consumers. Providers join through the Data Partner Program (or self-service signup for private exchanges only).',
      ]),
      card('mk-2', 'How data arrives', [
        'Getting a listing delivers data through **Delta Sharing** (docs now call it **OpenSharing**). It appears as a **read-only catalog** in Unity Catalog that you query like any other, with no ingestion pipeline and no copy to maintain.',
        'You need a Unity Catalog-enabled workspace and the `USE MARKETPLACE ASSETS` privilege (granted to all users by default). Some listings are instant; others need provider approval.',
        'The Marketplace is the storefront and Delta Sharing is the delivery.',
      ]),
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

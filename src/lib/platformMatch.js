// Platform Match lab: real-world needs → the Databricks platform component
// that solves them. Every option explains why it does or doesn't fit.
// Product names have changed recently (Workflows → Lakeflow Jobs,
// DLT → Lakeflow Declarative Pipelines, DatabricksIQ → Data Intelligence
// Engine), so the lab and lessons carry verify flags.

export const COMPONENTS = {
  delta: { name: 'Delta Lake', emoji: '🔺', blurb: 'Open table format: ACID transactions, schema enforcement, time travel on cloud storage.' },
  uc: { name: 'Unity Catalog', emoji: '🗂️', blurb: 'Governance: one place for permissions, ownership, lineage, tags, discovery and auditing.' },
  dbsql: { name: 'Databricks SQL', emoji: '⚡', blurb: 'SQL warehouses plus the SQL editor, queries, dashboards and alerts for analysts.' },
  jobs: { name: 'Lakeflow Jobs', emoji: '🗓️', blurb: 'Orchestration: schedule and chain notebooks, SQL, pipelines and other tasks, with retries and alerts.' },
  ldp: { name: 'Lakeflow Declarative Pipelines', emoji: '🔁', blurb: 'Declarative ETL (formerly Delta Live Tables): define tables in SQL or Python with data-quality expectations.' },
  mosaic: { name: 'Mosaic AI', emoji: '🧠', blurb: 'Build, serve, evaluate and govern ML models and generative-AI apps and agents.' },
  die: { name: 'Data Intelligence Engine', emoji: '✨', blurb: 'The platform\'s built-in AI that understands your data. It powers the Assistant, Genie, AI-generated comments and smart search.' },
  market: { name: 'Databricks Marketplace', emoji: '🛒', blurb: 'Discover and get third-party and Databricks datasets, notebooks, models and more.' },
  sharing: { name: 'Delta Sharing', emoji: '🤝', blurb: 'Open protocol to share live data with other organizations and platforms without copying.' },
}

export const SCENARIOS = [
  {
    id: 'etl-schedule',
    need: 'Your team has three notebooks that must run every night at 01:00 in order (ingest → clean → aggregate), with a retry if one fails and an email on failure.',
    answer: 'jobs',
    options: ['jobs', 'ldp', 'dbsql', 'delta'],
    why: {
      jobs: 'Lakeflow Jobs orchestrates tasks on a schedule, with dependencies, retries and notifications. That is exactly this.',
      ldp: 'Declarative Pipelines define how tables are built and kept fresh. Scheduling a chain of existing notebooks with retries is orchestration, which is the Jobs side.',
      dbsql: 'Databricks SQL runs queries, dashboards and alerts. It doesn\'t orchestrate multi-notebook ETL.',
      delta: 'Delta Lake is the table format the notebooks write to. It doesn\'t schedule anything.',
    },
  },
  {
    id: 'owner',
    need: 'A KPI looks wrong. You need to find who owns the gold.revenue table, who can query it, and which upstream tables feed it.',
    answer: 'uc',
    options: ['uc', 'delta', 'jobs', 'market'],
    why: {
      uc: 'Unity Catalog holds ownership, permissions and lineage. Catalog Explorer is its UI.',
      delta: 'Delta keeps the table\'s version history (who wrote what), but ownership, grants and cross-table lineage live in Unity Catalog.',
      jobs: 'Jobs might show which job writes the table, but not ownership, grants or lineage.',
      market: 'The Marketplace is for acquiring outside data products, not for governing your own tables.',
    },
  },
  {
    id: 'acid',
    need: 'Two pipelines write to the same table in cloud storage at once, and analysts must never see half-written data. You also want to query yesterday\'s version.',
    answer: 'delta',
    options: ['delta', 'uc', 'sharing', 'dbsql'],
    why: {
      delta: 'Delta Lake gives ACID transactions on cloud storage, so readers only see committed versions. Time travel reads older ones.',
      uc: 'Unity Catalog governs access. Transactional writes and time travel come from the Delta table format.',
      sharing: 'Delta Sharing shares tables outward. It doesn\'t make writes atomic.',
      dbsql: 'Databricks SQL queries the table, but the consistency guarantee comes from Delta.',
    },
  },
  {
    id: 'bi-sql',
    need: 'Analysts want to run SQL from the browser and connect Power BI, with compute that starts fast and scales with users.',
    answer: 'dbsql',
    options: ['dbsql', 'mosaic', 'jobs', 'ldp'],
    why: {
      dbsql: 'Databricks SQL provides SQL warehouses (serverless options start fast), the SQL editor, and JDBC/ODBC for BI tools.',
      mosaic: 'Mosaic AI is for ML and generative-AI workloads, not interactive BI SQL.',
      jobs: 'Jobs runs scheduled work, not interactive queries from BI tools.',
      ldp: 'Pipelines build and refresh tables. Analysts query the results through Databricks SQL.',
    },
  },
  {
    id: 'expectations',
    need: 'You want to define bronze → silver → gold tables in SQL, have them update incrementally, and drop rows that fail a rule like "amount > 0", with quality metrics tracked.',
    answer: 'ldp',
    options: ['ldp', 'jobs', 'delta', 'die'],
    why: {
      ldp: 'Lakeflow Declarative Pipelines (formerly DLT) let you declare tables with expectations (data-quality rules) and handle incremental processing for you.',
      jobs: 'Jobs can trigger the pipeline on a schedule, but the declarative tables and expectations are a pipelines feature.',
      delta: 'Delta stores the tables, but it doesn\'t provide declarative, rule-checked pipelines.',
      die: 'The Data Intelligence Engine powers AI assistance. It doesn\'t run ETL.',
    },
  },
  {
    id: 'rag',
    need: 'The support team wants a chatbot that answers from your product manuals (retrieval-augmented generation), served behind an endpoint with usage governance.',
    answer: 'mosaic',
    options: ['mosaic', 'die', 'dbsql', 'market'],
    why: {
      mosaic: 'Mosaic AI covers building and serving generative-AI apps: vector search, model serving, agent tooling and evaluation.',
      die: 'The Data Intelligence Engine powers Databricks\' own AI features. Building and serving your own agent is Mosaic AI.',
      dbsql: 'SQL warehouses can call AI functions from SQL, but building and serving a RAG app is Mosaic AI\'s job.',
      market: 'The Marketplace might provide a model, but building and serving the app is Mosaic AI.',
    },
  },
  {
    id: 'semantics',
    need: 'You notice the Assistant writes better SQL for tables with good comments, and that search finds tables by meaning ("customer churn"), not just exact names. What powers this?',
    answer: 'die',
    options: ['die', 'mosaic', 'uc', 'delta'],
    why: {
      die: 'The Data Intelligence Engine uses AI plus your metadata and usage to understand your data. It powers the Assistant, Genie, AI-generated comments and semantic search.',
      mosaic: 'Mosaic AI is for building your own AI apps and models, not the platform\'s built-in assistance.',
      uc: 'Unity Catalog supplies the metadata the engine reads, but the "understanding" layer is the Data Intelligence Engine.',
      delta: 'Delta stores the data. It doesn\'t interpret meaning.',
    },
  },
  {
    id: 'weather',
    need: 'Marketing wants a third-party weather dataset joined to store sales by next week, without building an ingestion pipeline.',
    answer: 'market',
    options: ['market', 'sharing', 'ldp', 'uc'],
    why: {
      market: 'The Marketplace lists datasets from providers. Getting a listing makes the data appear in your workspace as a read-only catalog, shared live with no pipeline.',
      sharing: 'Delta Sharing is the mechanism underneath, but discovering and requesting a third-party dataset happens in the Marketplace.',
      ldp: 'A pipeline is what you\'re trying to avoid building.',
      uc: 'Unity Catalog governs the data once it arrives, but it isn\'t where you find it.',
    },
  },
  {
    id: 'partner',
    need: 'A partner on a different data platform needs read access to your live inventory table, without you emailing extracts.',
    answer: 'sharing',
    options: ['sharing', 'market', 'jobs', 'dbsql'],
    why: {
      sharing: 'Delta Sharing shares live tables with recipients on Databricks or other platforms via an open protocol. No copies.',
      market: 'A public or private Marketplace listing is one way to package a share, but sharing one table with one known partner is direct Delta Sharing.',
      jobs: 'A job could export files, but that is exactly the copy-based approach you want to avoid.',
      dbsql: 'A partner on another platform can\'t query your SQL warehouse without accounts in your workspace.',
    },
  },
  {
    id: 'lineage',
    need: 'Before renaming a column, you must know every downstream table, notebook and dashboard that reads it.',
    answer: 'uc',
    options: ['uc', 'delta', 'die', 'jobs'],
    why: {
      uc: 'Unity Catalog captures lineage (down to column level for supported workloads), viewable in Catalog Explorer\'s Lineage tab.',
      delta: 'DESCRIBE HISTORY shows writes to one table, not who reads it downstream.',
      die: 'AI assistance can help you search, but the lineage graph comes from Unity Catalog.',
      jobs: 'A job knows its own tasks, not every reader of a column.',
    },
  },
]

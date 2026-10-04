// Chapter 1 question bank: Databricks Data Intelligence Platform.
// Original, scenario-heavy; every option explained. Product names here have
// changed recently, so several items carry verify flags.

export const questions = [
  // ---------------- Core components ----------------
  {
    id: 'c1-q-delta-what',
    sub: 'components',
    stem: 'What does Delta Lake add on top of files in cloud object storage?',
    options: [
      { t: 'ACID transactions, schema enforcement, and time travel through a transaction log', ok: true, why: 'Delta\'s log turns a folder of Parquet files into a reliable table with atomic commits and versions.' },
      { t: 'User permissions and data lineage', why: 'That is Unity Catalog\'s job.' },
      { t: 'Compute for running SQL', why: 'Compute comes from SQL warehouses or clusters. Delta is a table format.' },
      { t: 'Scheduling of notebooks', why: 'Scheduling is Lakeflow Jobs.' },
    ],
  },
  {
    id: 'c1-q-uc-what',
    sub: 'components',
    scenario: true,
    stem: 'Your company has three workspaces and wants one place to manage who can read which tables, see lineage, and audit access across all of them. Which component provides this?',
    options: [
      { t: 'Unity Catalog', ok: true, why: 'Unity Catalog is the unified governance layer: permissions, ownership, lineage, tags and auditing across workspaces attached to the same metastore.' },
      { t: 'Delta Lake', why: 'Delta stores and versions data. It doesn\'t govern access across workspaces.' },
      { t: 'Databricks SQL', why: 'DBSQL runs queries. Governance comes from Unity Catalog.' },
      { t: 'Lakeflow Jobs', why: 'Jobs orchestrates work. It doesn\'t grant access.' },
    ],
  },
  {
    id: 'c1-q-dbsql-what',
    sub: 'components',
    stem: 'Which statement best describes Databricks SQL?',
    options: [
      { t: 'The analyst-facing SQL experience: SQL warehouses, the SQL editor, saved queries, AI/BI dashboards and alerts', ok: true, why: 'Databricks SQL bundles the compute (warehouses) and tools analysts use day to day.' },
      { t: 'A separate database you copy data into', why: 'It queries lakehouse tables in place. There is no separate copy.' },
      { t: 'A file format', why: 'The file and table format is Delta Lake.' },
      { t: 'An ML model registry', why: 'Model management is part of Mosaic AI and MLflow.' },
    ],
  },
  {
    id: 'c1-q-jobs',
    sub: 'components',
    scenario: true,
    stem: 'A nightly process must run a SQL file, then a notebook, then refresh a dashboard, with retries and a failure email. What should you use?',
    options: [
      { t: 'Lakeflow Jobs: a multi-task job with dependencies, a schedule, retries and notifications', ok: true, why: 'Jobs orchestrates heterogeneous tasks in order, on a schedule, with retry and alerting.' },
      { t: 'A SQL alert', why: 'Alerts notify on a query condition. They don\'t run multi-step workflows.' },
      { t: 'Delta Sharing', why: 'Sharing shares data outward.' },
      { t: 'The Marketplace', why: 'The Marketplace distributes data products.' },
    ],
    verify: 'Lakeflow Jobs naming (formerly Databricks Workflows/Jobs) and supported task types.',
  },
  {
    id: 'c1-q-ldp',
    sub: 'components',
    scenario: true,
    stem: 'Engineers want to declare bronze, silver and gold tables in SQL, have them refresh incrementally, and quarantine rows that break rules like "email IS NOT NULL". Which product fits?',
    options: [
      { t: 'Lakeflow Declarative Pipelines (formerly Delta Live Tables), using expectations for the rules', ok: true, why: 'Declarative pipelines manage dependencies and incremental refresh, and expectations enforce data quality.' },
      { t: 'Lakeflow Jobs alone', why: 'Jobs can trigger a pipeline, but the declarative tables and expectations come from pipelines.' },
      { t: 'Unity Catalog tags', why: 'Tags label data. They don\'t build or validate tables.' },
      { t: 'A Genie space', why: 'Genie answers questions. It doesn\'t build pipelines.' },
    ],
    verify: 'Pipeline product naming and expectation syntax.',
  },
  {
    id: 'c1-q-analyst-touch',
    sub: 'components',
    stem: 'As a data analyst, which component do you interact with MOST directly day to day?',
    options: [
      { t: 'Databricks SQL (SQL editor, warehouses, dashboards), with tables governed by Unity Catalog', ok: true, why: 'Analysts mostly write SQL, build dashboards and browse governed data.' },
      { t: 'Mosaic AI model training', why: 'That is mainly ML engineering work.' },
      { t: 'Delta transaction log internals', why: 'Delta works underneath. Analysts rarely touch the log directly.' },
      { t: 'Cluster init scripts', why: 'That is platform administration.' },
    ],
  },
  {
    id: 'c1-q-lakehouse',
    sub: 'components',
    stem: 'What is the main idea of the "lakehouse" that the Databricks platform is built on?',
    options: [
      { t: 'Data-warehouse reliability and performance on open data-lake storage, with one copy of data serving BI, data engineering and AI', ok: true, why: 'Open formats plus governance and fast engines remove the separate lake and warehouse copies.' },
      { t: 'Copying all lake data into a proprietary warehouse every night', why: 'Avoiding that copy is the point of the lakehouse.' },
      { t: 'Keeping BI and AI on separate, unconnected systems', why: 'The lakehouse unifies them.' },
      { t: 'Storing data only in CSV files', why: 'Lakehouse tables use open formats such as Delta and Parquet.' },
    ],
  },
  {
    id: 'c1-q-delta-format',
    sub: 'components',
    scenario: true,
    stem: 'You run CREATE TABLE sales_2025 AS SELECT * FROM staging with no USING clause. A colleague asks what format the new table is in. What do you tell them?',
    options: [
      { t: 'Delta', ok: true, why: 'Delta is the default table format on Databricks.' },
      { t: 'CSV', why: 'CSV is a file format you might ingest, not the default table format.' },
      { t: 'JSON', why: 'JSON is a source format, not the default.' },
      { t: 'Excel', why: 'Not a table format.' },
    ],
  },
  {
    id: 'c1-q-pipeline-vs-job',
    sub: 'components',
    scenario: true,
    stem: 'Your team built a pipeline that keeps silver and gold tables up to date, and now wants it to run at 2 a.m. and then refresh a dashboard. A new hire asks why you need both Lakeflow Declarative Pipelines and Lakeflow Jobs. What is the difference?',
    options: [
      { t: 'Pipelines define how tables are built and kept up to date. Jobs orchestrate when and in what order tasks (including pipelines) run.', ok: true, why: 'Pipelines are the "what". Jobs are the "when and in which order".' },
      { t: 'They are the same product with two names', why: 'They work together but solve different problems.' },
      { t: 'Jobs build tables; pipelines send emails', why: 'That reverses their roles.' },
      { t: 'Pipelines only run Python; jobs only run SQL', why: 'Both support SQL and Python in various forms.' },
    ],
    verify: 'Current Lakeflow product boundaries (Connect / Declarative Pipelines / Jobs).',
  },

  // ---------------- AI: Mosaic AI & Data Intelligence Engine ----------------
  {
    id: 'c1-q-mosaic',
    sub: 'ai',
    scenario: true,
    stem: 'A team wants to build a RAG chatbot over internal documents, serve it behind an endpoint, and evaluate answer quality. Which part of the platform is this?',
    options: [
      { t: 'Mosaic AI (vector search, model serving, agent tooling, evaluation)', ok: true, why: 'Mosaic AI covers building, serving and evaluating ML and generative-AI applications.' },
      { t: 'The Data Intelligence Engine', why: 'That powers Databricks\' built-in AI features, not your custom app.' },
      { t: 'Databricks SQL', why: 'DBSQL serves analytics, not custom AI apps.' },
      { t: 'Delta Sharing', why: 'Sharing distributes data.' },
    ],
    verify: 'Mosaic AI component names.',
  },
  {
    id: 'c1-q-die',
    sub: 'ai',
    stem: 'What is the Data Intelligence Engine?',
    options: [
      { t: 'The platform\'s built-in AI that uses your metadata and usage to understand your data. It powers features like the Assistant, Genie, AI-generated comments and semantic search.', ok: true, why: 'This is the "intelligence" in the Data Intelligence Platform.' },
      { t: 'A new type of SQL warehouse', why: 'It isn\'t compute you provision.' },
      { t: 'A replacement for Unity Catalog', why: 'It builds on Unity Catalog metadata. It doesn\'t replace it.' },
      { t: 'A data marketplace', why: 'That is Databricks Marketplace.' },
    ],
    verify: 'Naming (formerly DatabricksIQ) and the list of features it powers.',
  },
  {
    id: 'c1-q-ai-functions',
    sub: 'ai',
    scenario: true,
    stem: 'An analyst wants to classify 10,000 support tickets by sentiment directly in a SQL query, without writing Python. What should they look at?',
    options: [
      { t: 'AI functions in SQL (e.g., ai_analyze_sentiment / ai_query), which call models served through Mosaic AI', ok: true, why: 'AI functions bring model calls into SQL, so analysts can use AI on table data.' },
      { t: 'A SQL alert', why: 'Alerts check thresholds. They don\'t classify text.' },
      { t: 'Delta time travel', why: 'Time travel reads old versions.' },
      { t: 'Liquid Clustering', why: 'Clustering changes data layout, not meaning.' },
    ],
    verify: 'Current AI function names and availability.',
  },
  {
    id: 'c1-q-comments',
    sub: 'ai',
    scenario: true,
    stem: 'Catalog Explorer suggests a description for a table you just created. Where does that suggestion come from?',
    options: [
      { t: 'AI-generated comments powered by the Data Intelligence Engine. Review them before accepting.', ok: true, why: 'The platform drafts descriptions from metadata. A human should check them.' },
      { t: 'They are copied from the Marketplace', why: 'Suggestions are generated for your table, not pulled from listings.' },
      { t: 'Delta writes them automatically on every insert', why: 'Delta doesn\'t author descriptions.' },
      { t: 'The SQL warehouse logs', why: 'Logs don\'t produce table descriptions.' },
    ],
    verify: 'AI-generated comments feature name and behaviour.',
  },
  {
    id: 'c1-q-metadata-ai',
    sub: 'ai',
    stem: 'Why do well-written table and column comments make Databricks\' AI features (the Assistant, Genie) more accurate?',
    options: [
      { t: 'Those features read Unity Catalog metadata to understand what tables and columns mean', ok: true, why: 'Clear descriptions mean less guessing about which column to use.' },
      { t: 'Comments make queries run faster', why: 'They help understanding, not performance.' },
      { t: 'Comments are required for SELECT', why: 'Queries run without comments.' },
      { t: 'They don\'t. The AI ignores metadata.', why: 'Metadata is a key input.' },
    ],
  },

  // ---------------- Catalog Explorer ----------------
  {
    id: 'c1-q-ce-what',
    sub: 'explorer',
    stem: 'What is Catalog Explorer?',
    options: [
      { t: 'The UI for browsing and managing Unity Catalog objects: catalogs, schemas, tables, views, volumes, models, plus their details, permissions, history and lineage', ok: true, why: 'It is the main way to discover and inspect governed data without writing SQL.' },
      { t: 'A file browser for your laptop', why: 'It browses governed objects in Databricks.' },
      { t: 'A dashboard designer', why: 'Dashboards are AI/BI dashboards.' },
      { t: 'A SQL query profiler', why: 'That is Query History and the Query Profile.' },
    ],
  },
  {
    id: 'c1-q-ce-managed',
    sub: 'explorer',
    scenario: true,
    stem: 'In Catalog Explorer you open a table\'s Details tab and see Type: EXTERNAL and Location: s3://acme/raw/events. What does that tell you?',
    options: [
      { t: 'The data lives at a path you manage. Dropping the table removes only the metadata, and the files stay.', ok: true, why: 'External tables point to storage you control. Unity Catalog manages only the metadata.' },
      { t: 'Databricks manages the storage and deletes the files on DROP', why: 'That describes a managed table.' },
      { t: 'It\'s a view', why: 'Views have no location. The type would say VIEW.' },
      { t: 'It\'s shared from another company', why: 'Shared data arrives in a shared catalog. EXTERNAL is about storage ownership.' },
    ],
  },
  {
    id: 'c1-q-ce-certified',
    sub: 'explorer',
    scenario: true,
    stem: 'Searching for "revenue" returns five similar tables. One has a "Certified" badge. What should you conclude?',
    options: [
      { t: 'The data owners have marked it as the trusted, approved source, so prefer it for reporting', ok: true, why: 'Certification signals that a data asset is vetted for use.' },
      { t: 'It\'s the newest table', why: 'Certification is about trust, not age.' },
      { t: 'It\'s the fastest table to query', why: 'The badge says nothing about performance.' },
      { t: 'It\'s read-only for everyone', why: 'Permissions decide access. The badge doesn\'t.' },
    ],
    verify: 'How certification (and deprecation) is applied and shown, e.g., via system tags.',
  },
  {
    id: 'c1-q-ce-lineage',
    sub: 'explorer',
    scenario: true,
    stem: 'You want to see which notebooks, jobs and dashboards read a table before you change it. Where in Catalog Explorer do you look?',
    options: [
      { t: 'The table\'s Lineage tab (downstream)', ok: true, why: 'Unity Catalog captures lineage, and Catalog Explorer shows upstream sources and downstream consumers.' },
      { t: 'The History tab', why: 'History lists writes to the table, not who reads it.' },
      { t: 'The Permissions tab', why: 'That shows who may read, not who actually does.' },
      { t: 'Sample Data', why: 'That shows rows, not dependencies.' },
    ],
  },
  {
    id: 'c1-q-ce-view',
    sub: 'explorer',
    scenario: true,
    stem: 'In Catalog Explorer, v_revenue_by_region shows no storage location on its Details tab, but revenue_daily does. A teammate thinks something is broken. What explains the difference between the view and the table?',
    options: [
      { t: 'A view stores a query, not data. It is computed when read, so it has no storage location.', ok: true, why: 'Views are saved logic. Tables hold data.' },
      { t: 'Views are always faster than tables', why: 'Views run their query on each read.' },
      { t: 'Views can\'t be governed by Unity Catalog', why: 'Views are governed securables.' },
      { t: 'Views are copies of tables', why: 'They hold no data copy.' },
    ],
  },
  {
    id: 'c1-q-ce-schema',
    sub: 'explorer',
    stem: 'In the Unity Catalog hierarchy shown in Catalog Explorer, what sits directly inside a catalog?',
    options: [
      { t: 'Schemas (databases), which contain tables, views, volumes, functions and models', ok: true, why: 'catalog → schema → object.' },
      { t: 'Tables directly, with no schemas', why: 'Objects live in schemas.' },
      { t: 'Workspaces', why: 'Workspaces attach to a metastore. They don\'t sit inside catalogs.' },
      { t: 'SQL warehouses', why: 'Warehouses are compute, not catalog objects.' },
    ],
  },
  {
    id: 'c1-q-ce-sample',
    sub: 'explorer',
    scenario: true,
    stem: 'Before writing a query, you want to see a table\'s columns, their types and comments, and a few example rows. What do you open?',
    options: [
      { t: 'The table in Catalog Explorer: Overview (columns, types, comments) and Sample Data', ok: true, why: 'Catalog Explorer is the quickest way to understand a table before querying it.' },
      { t: 'DESCRIBE HISTORY', why: 'History shows versions, not the column list and examples.' },
      { t: 'The Marketplace', why: 'The Marketplace lists external products.' },
      { t: 'Lakeflow Jobs', why: 'Jobs run tasks.' },
    ],
    verify: 'Sample Data requires access to a running warehouse and SELECT on the table.',
  },

  // ---------------- Marketplace ----------------
  {
    id: 'c1-q-market-what',
    sub: 'marketplace',
    stem: 'What can you get from Databricks Marketplace?',
    options: [
      { t: 'Data products such as datasets, notebooks, ML models and solution accelerators, free or commercial, from Databricks and third-party providers', ok: true, why: 'The Marketplace is an open exchange for data and AI assets.' },
      { t: 'Only Databricks\' own sample data', why: 'Third-party providers publish listings too.' },
      { t: 'Only paid compute credits', why: 'It is about data and AI assets, not compute.' },
      { t: 'Browser extensions', why: 'Not what the Marketplace offers.' },
    ],
    verify: 'Current Marketplace asset types.',
  },
  {
    id: 'c1-q-market-arrival',
    sub: 'marketplace',
    scenario: true,
    stem: 'You get a dataset listing from the Marketplace. How does the data show up in your workspace?',
    options: [
      { t: 'As a read-only catalog in Unity Catalog, shared live via Delta Sharing. No copy pipeline is needed.', ok: true, why: 'Marketplace data is delivered through Delta Sharing and appears as a shared catalog you query like any other.' },
      { t: 'As CSV files emailed to you', why: 'Delivery is governed sharing, not email.' },
      { t: 'You must build an ingestion pipeline first', why: 'The point is to avoid that.' },
      { t: 'It\'s copied into your personal home folder', why: 'It arrives as a governed catalog.' },
    ],
    verify: 'Requirements such as a Unity Catalog-enabled workspace and privileges to get listings.',
  },
  {
    id: 'c1-q-market-providers',
    sub: 'marketplace',
    scenario: true,
    stem: 'A weather-data company wants to offer its forecasts to Databricks customers, some publicly and some only to one partner. Who can publish listings like that on Databricks Marketplace?',
    options: [
      { t: 'Approved data providers (companies and Databricks) who list public or private offerings', ok: true, why: 'Providers publish listings, either publicly or privately to specific consumers.' },
      { t: 'Any anonymous user, with no approval', why: 'Providers go through a provider program.' },
      { t: 'Only Databricks employees', why: 'Third-party providers list too.' },
      { t: 'Only the consumer\'s own admins', why: 'Consumers get listings. Providers publish them.' },
    ],
    verify: 'The provider program and private exchange details.',
  },
  {
    id: 'c1-q-market-vs-sharing',
    sub: 'marketplace',
    stem: 'How do Databricks Marketplace and Delta Sharing relate?',
    options: [
      { t: 'The Marketplace is where data products are discovered and requested. Delta Sharing is the protocol that delivers the shared data.', ok: true, why: 'The Marketplace is the storefront. Delta Sharing is the delivery mechanism.' },
      { t: 'They compete. Use one or the other.', why: 'The Marketplace uses Delta Sharing.' },
      { t: 'Delta Sharing is a paid add-on to the Marketplace', why: 'It is an open protocol, not an add-on.' },
      { t: 'The Marketplace copies files; Delta Sharing streams video', why: 'Neither statement is true.' },
    ],
  },
  {
    id: 'c1-q-market-private',
    sub: 'marketplace',
    scenario: true,
    stem: 'A data vendor wants to offer a dataset only to three named customers, not to everyone browsing the Marketplace. What fits?',
    options: [
      { t: 'A private listing (or private exchange) visible only to those consumers', ok: true, why: 'Providers can make listings private and target specific consumers.' },
      { t: 'A public listing with a password in the description', why: "Passwords in descriptions aren't access control." },
      { t: 'Email the files to each customer', why: 'That throws away live sharing and governance.' },
      { t: 'It isn\'t possible. All listings are public.', why: 'Private listings exist for this purpose.' },
    ],
    verify: 'Private listings and exchanges in the current Marketplace.',
  },
]

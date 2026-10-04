// Ingestion Picker lab (Chapter 3): a tap-based Scenario Picker set. Each
// scenario describes data that needs to get into the lakehouse; the learner
// taps the ingestion method, then sees why every option fits or doesn't.
// Feature names and limits change often, so the lab and lessons carry verify
// flags.

export const METHODS = {
  autoloader: { name: 'Auto Loader', emoji: '🔄', blurb: 'Incrementally discovers and loads new files from cloud storage (cloudFiles / streaming tables with read_files). Tracks what it has loaded in a checkpoint, infers and evolves the schema, scales to millions of files.' },
  copyinto: { name: 'COPY INTO', emoji: '📋', blurb: 'A SQL command that loads files from a path into a Delta table. Idempotent: files already loaded are skipped on re-run. Good for scheduled batches of up to thousands of files.' },
  ctas: { name: 'CTAS from files (read_files)', emoji: '🧾', blurb: 'CREATE TABLE … AS SELECT * FROM read_files(\'path\', …): a one-time snapshot of the files as a Delta table. Re-running reads everything again.' },
  upload: { name: 'Upload in the Workspace UI', emoji: '⬆️', blurb: 'Create or modify a table from a small local file (CSV, TSV, JSON, Parquet and more) with a preview, header and type detection. Creates a managed Delta table.' },
  volume: { name: 'Upload to a volume', emoji: '📦', blurb: 'Store files of any type (PDFs, images, raw CSVs) in a Unity Catalog volume, governed like tables, at /Volumes/catalog/schema/volume/.' },
  sharing: { name: 'Delta Sharing', emoji: '🤝', blurb: 'Open protocol for sharing live, read-only data across organizations, clouds and platforms without copying it.' },
  market: { name: 'Databricks Marketplace', emoji: '🛒', blurb: 'Find and get third-party datasets, notebooks and models. Data arrives through Delta Sharing as a read-only catalog.' },
  api: { name: 'Custom API intake', emoji: '🌐', blurb: 'Code (a notebook or script, scheduled by a job) calls an API, lands the responses in a volume or table, and an ingestion step loads them.' },
  connect: { name: 'Lakeflow Connect connector', emoji: '🔌', blurb: 'Managed connectors that ingest incrementally from SaaS apps and databases (for example Salesforce, Workday, SQL Server) with little or no code.' },
  federation: { name: 'Lakehouse Federation', emoji: '🔭', blurb: 'Query an external database (PostgreSQL, MySQL, Snowflake…) in place through a foreign catalog, without copying the data.' },
}

export const SCENARIOS = [
  {
    id: 'hourly-csv',
    need: 'New CSV files land in an S3 bucket every hour, forever. The folder already has 2 million files, and you need each new file loaded into a bronze table exactly once.',
    answer: 'autoloader',
    options: ['autoloader', 'copyinto', 'ctas', 'upload'],
    why: {
      autoloader: 'Continuous arrival, millions of files, exactly once: this is what Auto Loader is for. Its checkpoint remembers which files are done, and file-notification mode avoids listing millions of files each run.',
      copyinto: 'COPY INTO also skips already-loaded files, but it is recommended for thousands of files, not millions. At this scale tracking and listing get slow.',
      ctas: 'A CTAS snapshot reads every file again each time you run it. It has no memory of what was loaded.',
      upload: 'The UI upload is for a few small local files, not a stream of files in S3.',
    },
  },
  {
    id: 'partner-other-cloud',
    need: 'A partner on another cloud, who doesn\'t use Databricks, wants to read your gold.orders_summary table from their Python notebooks. You don\'t want to send copies every night.',
    answer: 'sharing',
    options: ['sharing', 'market', 'api', 'copyinto'],
    why: {
      sharing: 'Delta Sharing\'s open sharing works with recipients on any platform or cloud. They read live data with a credential, using pandas, Spark or BI tools, and nothing is copied.',
      market: 'Marketplace is a storefront for listings. For one known partner, you share directly (a private listing would also use Delta Sharing underneath).',
      api: 'Building and hosting your own API for a table is work Delta Sharing already does for you, with governance and auditing.',
      copyinto: 'COPY INTO loads files into your own tables. It doesn\'t give anyone else access.',
    },
  },
  {
    id: 'spreadsheet',
    need: 'Finance emails you a one-off 20 MB CSV of budget targets. You want it as a table next to your sales data this afternoon.',
    answer: 'upload',
    options: ['upload', 'autoloader', 'copyinto', 'sharing'],
    why: {
      upload: 'A small, one-off local file is exactly what the UI upload is for: pick the file, choose catalog and schema, check the preview and types, create the table.',
      autoloader: 'Auto Loader is for files that keep arriving in cloud storage. Setting up a stream and checkpoint for one file is overkill.',
      copyinto: 'COPY INTO needs the file in cloud storage first. For a single local file, the UI upload does it in one step.',
      sharing: 'Delta Sharing shares existing tables between organizations. It doesn\'t load a file from your laptop.',
    },
  },
  {
    id: 'daily-parquet',
    need: 'About 3,000 Parquet files land once a day in an external location. A nightly SQL job should load only the new ones, and re-running it after a failure must not duplicate rows.',
    answer: 'copyinto',
    options: ['copyinto', 'autoloader', 'ctas', 'federation'],
    why: {
      copyinto: 'COPY INTO is idempotent (already-loaded files are skipped) and fits thousands of files in a scheduled SQL batch. It is the simplest fit here.',
      autoloader: 'Auto Loader would also work, and is the better choice if volume grows to millions of files or you need near-real-time. For a nightly batch of thousands, plain SQL is simpler.',
      ctas: 'CTAS rebuilds the table from every file each night, so it doesn\'t load "only the new ones".',
      federation: 'Federation queries external databases, not files in cloud storage.',
    },
  },
  {
    id: 'explore-json',
    need: 'You want to look at a folder of JSON files once, check what is in them, and save a snapshot as a table for a quick analysis. No new files will arrive.',
    answer: 'ctas',
    options: ['ctas', 'autoloader', 'connect', 'sharing'],
    why: {
      ctas: 'SELECT * FROM read_files(\'/Volumes/…/events/\', format => \'json\') lets you explore, and CREATE TABLE … AS SELECT saves the snapshot. Simple and one-off.',
      autoloader: 'Auto Loader shines when files keep arriving. For a one-time snapshot it adds a checkpoint and stream you don\'t need.',
      connect: 'Lakeflow Connect connectors pull from SaaS apps and databases, not a folder of files.',
      sharing: 'Delta Sharing shares tables with others. It doesn\'t read your JSON files.',
    },
  },
  {
    id: 'weather',
    need: 'Your demand-forecast team needs historical and daily weather data from a reputable vendor, and doesn\'t want to build or maintain a pipeline.',
    answer: 'market',
    options: ['market', 'api', 'sharing', 'upload'],
    why: {
      market: 'Marketplace is where you find third-party datasets. Getting a listing adds a read-only catalog that the provider keeps up to date: no pipeline.',
      api: 'Calling a weather API yourself means writing, scheduling and maintaining code, which is exactly what the team wants to avoid.',
      sharing: 'Delta Sharing is how Marketplace data is delivered, but you find and request the dataset in Marketplace. You don\'t have a direct share with an unknown vendor.',
      upload: 'Uploading files by hand goes stale immediately and doesn\'t update daily.',
    },
  },
  {
    id: 'rest-api',
    need: 'A niche vendor only offers a paginated REST API that returns JSON. There is no Databricks connector for it. You need the data refreshed daily.',
    answer: 'api',
    options: ['api', 'connect', 'market', 'upload'],
    why: {
      api: 'With no connector, you write the intake: a scheduled job calls the API, writes the JSON pages to a volume (or a table), and Auto Loader or COPY INTO loads them into bronze.',
      connect: 'Lakeflow Connect only covers the sources it has connectors for. This vendor isn\'t one of them.',
      market: 'The vendor doesn\'t publish a Marketplace listing, so there is nothing to get.',
      upload: 'Downloading and uploading by hand every day is error-prone and isn\'t automated.',
    },
  },
  {
    id: 'salesforce',
    need: 'Sales ops wants Salesforce accounts and opportunities in the lakehouse, updated incrementally, without the team writing or maintaining ingestion code.',
    answer: 'connect',
    options: ['connect', 'api', 'federation', 'upload'],
    why: {
      connect: 'Lakeflow Connect has managed connectors for SaaS sources like Salesforce. It handles incremental loads, schema changes and retries.',
      api: 'You could call the Salesforce API yourself, but then you own the code, paging, rate limits and incremental logic. That\'s what they want to avoid.',
      federation: 'Federation queries databases in place. It doesn\'t ingest from SaaS APIs.',
      upload: 'Exporting reports by hand isn\'t incremental or automated.',
    },
    verify: 'The current list of Lakeflow Connect managed connectors.',
  },
  {
    id: 'pdfs',
    need: 'Legal wants 40,000 contract PDFs stored in the lakehouse, with access controlled by Unity Catalog, so an AI app can later extract clauses.',
    answer: 'volume',
    options: ['volume', 'upload', 'copyinto', 'sharing'],
    why: {
      volume: 'Volumes hold non-tabular files of any type and are governed by Unity Catalog grants (READ VOLUME, WRITE VOLUME).',
      upload: 'The "create table" upload is for tabular files that become a table. PDFs aren\'t rows and columns.',
      copyinto: 'COPY INTO loads tabular formats into a Delta table. You could load the binary files, but the files themselves belong in a volume first.',
      sharing: 'Delta Sharing is for giving data to others, not for storing your own files.',
    },
  },
  {
    id: 'postgres-in-place',
    need: 'Once a month you need to join a small reference table that lives in the operations team\'s PostgreSQL database. They don\'t want another copy of it to manage.',
    answer: 'federation',
    options: ['federation', 'connect', 'copyinto', 'sharing'],
    why: {
      federation: 'Lakehouse Federation exposes the PostgreSQL database as a foreign catalog in Unity Catalog, so you can query and join it in place, with no copy.',
      connect: 'A connector would ingest a copy on a schedule. That works, but it creates the copy they don\'t want, for a monthly query.',
      copyinto: 'COPY INTO loads files from cloud storage, not tables in a database.',
      sharing: 'Delta Sharing shares Delta data. PostgreSQL isn\'t a sharing provider.',
    },
    verify: 'Lakehouse Federation supported sources.',
  },
  {
    id: 'other-bu-d2d',
    need: 'A business unit in another Databricks account (Unity Catalog enabled, different region) needs live, read-only access to three of your silver tables.',
    answer: 'sharing',
    options: ['sharing', 'market', 'copyinto', 'federation'],
    why: {
      sharing: 'Databricks-to-Databricks sharing: you add the tables to a share and grant it to their metastore\'s sharing identifier. They mount it as a read-only catalog. No tokens to manage, and the data isn\'t copied.',
      market: 'Marketplace is for publishing listings. For an internal partner you already know, share directly.',
      copyinto: 'Sending files for them to COPY INTO creates copies that go stale.',
      federation: 'Federation reads external databases. Another Databricks account is shared with Delta Sharing.',
    },
  },
  {
    id: 'evolving-json',
    need: 'Mobile-app events arrive as JSON files all day. The app team adds new fields without warning, and sometimes a value has the wrong type. You must not lose any data.',
    answer: 'autoloader',
    options: ['autoloader', 'copyinto', 'upload', 'api'],
    why: {
      autoloader: 'Auto Loader infers the schema, evolves it when new columns appear, and puts values that don\'t match the schema in the _rescued_data column instead of dropping them.',
      copyinto: 'COPY INTO can merge new columns (mergeSchema), but it has no rescued-data column or continuous processing. Auto Loader is the better fit for a constant, changing stream.',
      upload: 'The UI upload is for small one-off files, not a continuous event stream.',
      api: 'The files already land in storage. Writing custom intake code adds work with no benefit.',
    },
    verify: 'Auto Loader schema evolution modes (addNewColumns, rescue, failOnNewColumns, none).',
  },
]

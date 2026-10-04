// Chapter 3 question bank: Importing Data. Original, scenario-heavy; every
// option explained. Ingestion features and limits change often, so many items
// carry verify flags.

export const questions = [
  // ---------------- Cloud storage ----------------
  {
    id: 'c3-q-external-location',
    sub: 'cloud-storage',
    stem: 'In Unity Catalog, what is an external location?',
    options: [
      { t: 'An object that pairs a cloud storage path with a storage credential, so access to that path is governed by grants', ok: true, why: 'External locations let admins grant READ FILES, WRITE FILES or CREATE EXTERNAL TABLE on a path instead of handing out cloud keys.' },
      { t: 'A table whose data lives outside Databricks', why: 'That is an external table. It uses an external location, but they are different objects.' },
      { t: 'A Delta Sharing recipient', why: 'Recipients receive shares. They have nothing to do with storage paths.' },
      { t: 'A workspace in another region', why: 'Workspaces and regions aren\'t storage objects in Unity Catalog.' },
    ],
    verify: 'Privilege names on external locations.',
  },
  {
    id: 'c3-q-volume',
    sub: 'cloud-storage',
    scenario: true,
    stem: 'Your team receives raw CSVs and PDFs from a vendor and wants them stored as files, governed by Unity Catalog, at a path like /Volumes/raw/vendor/drop/. What should they create?',
    options: [
      { t: 'A volume in the raw.vendor schema', ok: true, why: 'Volumes are Unity Catalog objects for non-tabular and raw files, addressed as /Volumes/catalog/schema/volume/ and governed with READ VOLUME and WRITE VOLUME.' },
      { t: 'A managed table', why: 'Tables hold rows and columns. PDFs and raw files belong in a volume.' },
      { t: 'A view', why: 'A view is a saved query. It stores no files.' },
      { t: 'A share', why: 'Shares give data to other organizations. They aren\'t storage.' },
    ],
  },
  {
    id: 'c3-q-copy-into-idempotent',
    sub: 'cloud-storage',
    scenario: true,
    stem: 'A nightly COPY INTO job failed halfway and an engineer re-ran it. Some files had already loaded before the failure. What happens to those files on the re-run?',
    options: [
      { t: 'They are skipped, because COPY INTO tracks which files it has already loaded', ok: true, why: 'COPY INTO is idempotent: re-running it loads only new files, so retries don\'t duplicate rows.' },
      { t: 'They are loaded again, duplicating rows', why: 'That would be true of a plain INSERT or CTAS, not COPY INTO.' },
      { t: 'The whole table is truncated and reloaded', why: 'COPY INTO appends new files. It never truncates.' },
      { t: 'The command fails because the files already exist', why: 'Already-loaded files are skipped silently.' },
    ],
  },
  {
    id: 'c3-q-copy-into-syntax',
    sub: 'cloud-storage',
    stem: 'Which statement loads CSV files with a header row from a volume into an existing table sales_raw?',
    options: [
      { t: "COPY INTO sales_raw FROM '/Volumes/raw/sales/drop/' FILEFORMAT = CSV FORMAT_OPTIONS ('header' = 'true')", ok: true, why: 'COPY INTO target FROM path FILEFORMAT = … with FORMAT_OPTIONS for reader options such as header and inferSchema.' },
      { t: "INSERT INTO sales_raw FROM '/Volumes/raw/sales/drop/' AS CSV", why: 'Not valid syntax. INSERT takes a query or VALUES, not a path.' },
      { t: "LOAD DATA INFILE '/Volumes/raw/sales/drop/' INTO sales_raw", why: 'That is MySQL syntax, not Databricks.' },
      { t: "CREATE TABLE sales_raw COPY '/Volumes/raw/sales/drop/'", why: 'Not a valid statement.' },
    ],
    verify: 'COPY INTO options (mergeSchema in COPY_OPTIONS, inferSchema in FORMAT_OPTIONS).',
  },
  {
    id: 'c3-q-ctas-files',
    sub: 'cloud-storage',
    scenario: true,
    stem: 'You want a one-time Delta table from a folder of Parquet files and have no plans to load more. Which is the simplest?',
    options: [
      { t: "CREATE TABLE t AS SELECT * FROM read_files('/Volumes/raw/x/files/', format => 'parquet')", ok: true, why: 'CTAS over read_files makes a snapshot in one statement. It is fine when nothing new will arrive.' },
      { t: 'Set up Auto Loader with a checkpoint', why: 'Works, but a stream and checkpoint are overkill for a one-off.' },
      { t: 'Upload each Parquet file through the UI', why: 'Tedious and limited in size, and the files are already in storage.' },
      { t: 'Create a Delta Sharing recipient', why: 'Sharing gives data to others. It doesn\'t load files.' },
    ],
    verify: 'read_files options and the older format.`path` syntax.',
  },
  {
    id: 'c3-q-ctas-rerun',
    sub: 'cloud-storage',
    scenario: true,
    stem: 'A colleague schedules CREATE OR REPLACE TABLE t AS SELECT * FROM read_files(…) every hour on a folder that keeps growing. What is the problem?',
    options: [
      { t: 'Every run re-reads all files ever written, so cost and run time grow without limit', ok: true, why: 'CTAS has no memory of what was loaded. For growing folders use COPY INTO or Auto Loader, which load only new files.' },
      { t: 'It duplicates every row each hour', why: 'CREATE OR REPLACE rebuilds the table, so no duplicates, but it does all the work again.' },
      { t: 'read_files can\'t be scheduled', why: 'It can. The issue is rereading everything.' },
      { t: 'Delta tables can\'t be replaced', why: 'CREATE OR REPLACE is allowed and keeps history.' },
    ],
  },
  {
    id: 'c3-q-external-vs-managed-load',
    sub: 'cloud-storage',
    scenario: true,
    stem: 'You load files into a new managed table. Later the source files in the landing bucket are deleted. What happens to your table?',
    options: [
      { t: 'Nothing: the data was copied into the table\'s managed storage when it was loaded', ok: true, why: 'Ingestion copies data into Delta. The landing files can be cleaned up afterwards.' },
      { t: 'The table becomes empty', why: 'That would only happen if the table pointed at those files, which a loaded managed table doesn\'t.' },
      { t: 'The table errors on every query', why: 'The table doesn\'t depend on the landing files after loading.' },
      { t: 'The table converts to external', why: 'Table type doesn\'t change on its own.' },
    ],
  },

  // ---------------- Auto Loader ----------------
  {
    id: 'c3-q-autoloader-what',
    sub: 'auto-loader',
    stem: 'What does Auto Loader do?',
    options: [
      { t: 'Incrementally discovers and loads new files as they arrive in cloud storage, tracking progress in a checkpoint', ok: true, why: 'Auto Loader (the cloudFiles source) processes each new file once, even across restarts.' },
      { t: 'Automatically loads every table into memory for faster queries', why: 'That isn\'t a Databricks feature. Caching is separate.' },
      { t: 'Uploads files from your laptop', why: 'That is the UI upload.' },
      { t: 'Shares tables with other organizations', why: 'That is Delta Sharing.' },
    ],
  },
  {
    id: 'c3-q-autoloader-vs-copy',
    sub: 'auto-loader',
    scenario: true,
    stem: 'A source drops tens of thousands of files per hour, continuously, and the folder will reach millions of files. COPY INTO or Auto Loader?',
    options: [
      { t: 'Auto Loader: it is recommended for millions of files and continuous ingestion', ok: true, why: 'Auto Loader scales file discovery (including file-notification mode) and processes incrementally. COPY INTO is aimed at thousands of files in batches.' },
      { t: 'COPY INTO: it is always faster', why: 'COPY INTO is simpler, not always faster, and gets slow at millions of files.' },
      { t: 'Neither; use CTAS', why: 'CTAS rereads everything each time.' },
      { t: 'The UI upload', why: 'Not for automated, high-volume ingestion.' },
    ],
    verify: 'Current guidance on COPY INTO vs Auto Loader file counts.',
  },
  {
    id: 'c3-q-schema-evolution',
    sub: 'auto-loader',
    scenario: true,
    stem: 'An app team adds a new field device_os to their JSON events. Your Auto Loader stream uses the default schema evolution mode. What happens?',
    options: [
      { t: 'The stream stops with an error, updates the schema with the new column, and picks it up when restarted (for example by a job retry)', ok: true, why: 'The default addNewColumns mode records the new column and fails the stream once so it restarts with the evolved schema.' },
      { t: 'The new field is silently dropped forever', why: 'Auto Loader is designed not to lose data. Dropping columns is not the default.' },
      { t: 'All previous rows are deleted', why: 'Schema evolution never deletes data.' },
      { t: 'The file is skipped', why: 'Files aren\'t skipped because of a new column.' },
    ],
    verify: 'Default schemaEvolutionMode and restart behavior.',
  },
  {
    id: 'c3-q-rescued-data',
    sub: 'auto-loader',
    scenario: true,
    stem: 'Some events have "price": "N/A" while the inferred schema says price is a number. With Auto Loader, where does that value end up?',
    options: [
      { t: 'In the _rescued_data column, so it isn\'t lost', ok: true, why: 'Values that don\'t fit the schema (wrong type, unexpected columns) are captured in _rescued_data as JSON.' },
      { t: 'It replaces the whole row with NULLs', why: 'Only the mismatched value is rescued. The rest of the row loads.' },
      { t: 'The stream fails permanently', why: 'Type mismatches are rescued, not fatal.' },
      { t: 'It is converted to 0', why: 'Auto Loader doesn\'t invent values.' },
    ],
  },
  {
    id: 'c3-q-schema-inference',
    sub: 'auto-loader',
    stem: 'How does Auto Loader decide the schema of new CSV or JSON files?',
    options: [
      { t: 'It samples files to infer a schema and stores it at the schema location, so later runs reuse and evolve it', ok: true, why: 'Inference happens on a sample, and the schema is persisted so it stays stable between runs.' },
      { t: 'It reads every file in full on every run', why: 'That would be slow. It samples and saves the schema.' },
      { t: 'You must always type the schema by hand', why: 'You can provide hints or a schema, but inference is built in.' },
      { t: 'It uses the schema of whatever table you queried last', why: 'Not how it works.' },
    ],
    verify: 'Whether CSV/JSON columns are inferred as strings by default (cloudFiles.inferColumnTypes).',
  },
  {
    id: 'c3-q-streaming-table-sql',
    sub: 'auto-loader',
    scenario: true,
    stem: 'An analyst who only writes SQL wants incremental file ingestion like Auto Loader. What can they use?',
    options: [
      { t: "A streaming table: CREATE OR REFRESH STREAMING TABLE t AS SELECT * FROM STREAM read_files('/Volumes/…', format => 'csv')", ok: true, why: 'Streaming tables in Databricks SQL use Auto Loader underneath, so SQL users get incremental ingestion.' },
      { t: 'Only Python can use Auto Loader', why: 'SQL users get it through streaming tables and read_files.' },
      { t: 'A materialized view over the folder', why: 'Materialized views recompute results from tables. Incremental file ingestion is the streaming table.' },
      { t: 'An alert', why: 'Alerts notify on query results. They don\'t load files.' },
    ],
    verify: 'Streaming table syntax and availability in Databricks SQL.',
  },

  // ---------------- Delta Sharing ----------------
  {
    id: 'c3-q-sharing-what',
    sub: 'sharing',
    stem: 'What is Delta Sharing?',
    options: [
      { t: 'An open protocol for securely sharing live data with other organizations, platforms and clouds without copying it', ok: true, why: 'Recipients read the provider\'s data directly, read-only, and the provider controls and audits access.' },
      { t: 'A way to give coworkers in your workspace SELECT on a table', why: 'That is a regular GRANT in Unity Catalog.' },
      { t: 'A file-transfer tool that copies tables nightly', why: 'Sharing avoids copies. Recipients read the live data.' },
      { t: 'A Delta feature for sharing compute between warehouses', why: 'It shares data, not compute.' },
    ],
  },
  {
    id: 'c3-q-sharing-open-vs-d2d',
    sub: 'sharing',
    scenario: true,
    stem: 'One recipient uses Databricks with Unity Catalog. Another uses only Power BI and pandas. Which sharing modes fit?',
    options: [
      { t: 'Databricks-to-Databricks sharing for the first; open sharing (a credential/token) for the second', ok: true, why: 'D2D uses the recipient metastore\'s sharing identifier with no tokens. Open sharing gives non-Databricks clients a credential to read the share.' },
      { t: 'Open sharing only works between Databricks accounts', why: 'Open sharing is what works with non-Databricks platforms.' },
      { t: 'The Power BI user must first buy a Databricks workspace', why: 'Open sharing exists so they don\'t have to.' },
      { t: 'Both must use the Marketplace', why: 'Marketplace is optional. You can share directly.' },
    ],
    verify: 'Open sharing authentication options (bearer token, OIDC federation).',
  },
  {
    id: 'c3-q-sharing-readonly',
    sub: 'sharing',
    scenario: true,
    stem: 'A recipient mounts your share as a catalog and tries to UPDATE one of the shared tables to fix a typo. What happens?',
    options: [
      { t: 'It fails: shared data is read-only for recipients', ok: true, why: 'Recipients can query shared data and copy it into their own tables, but can\'t change the provider\'s data.' },
      { t: 'The provider\'s table is updated', why: 'Recipients never write to the provider\'s data.' },
      { t: 'Their copy is updated and the provider\'s isn\'t', why: 'There is no local copy. They read the provider\'s live data.' },
      { t: 'It works only on views', why: 'Views are read-only too.' },
    ],
  },
  {
    id: 'c3-q-sharing-provider',
    sub: 'sharing',
    stem: 'Which steps does a provider take to share a table with a Databricks partner?',
    options: [
      { t: 'Create a share, add the table to it, create a recipient, and grant the recipient access to the share', ok: true, why: 'Share = what is shared, recipient = who receives it, and GRANT SELECT ON SHARE connects them.' },
      { t: 'Export the table to CSV and email it', why: 'That is a copy, not Delta Sharing.' },
      { t: 'Grant SELECT on the table to the partner\'s email address', why: 'External partners are recipients of a share, not principals in your metastore.' },
      { t: 'Make the table external', why: 'Managed and external tables can both be shared. Table type isn\'t the step.' },
    ],
  },
  {
    id: 'c3-q-sharing-recipient',
    sub: 'sharing',
    scenario: true,
    stem: 'You are the recipient of a Databricks-to-Databricks share. How do you start querying it?',
    options: [
      { t: 'Create a catalog from the share in your metastore, grant your team access to it, and query it like any other catalog', ok: true, why: 'The shared data appears as a read-only catalog that you govern with normal Unity Catalog grants.' },
      { t: 'Download the files with a token and run COPY INTO', why: 'Not needed for D2D. You mount the share as a catalog.' },
      { t: 'Ask the provider for their workspace login', why: 'Sharing exists so you never need their credentials.' },
      { t: 'Wait for a nightly copy to arrive', why: 'Shared data is live, not copied nightly.' },
    ],
  },
  {
    id: 'c3-q-sharing-freshness',
    sub: 'sharing',
    scenario: true,
    stem: 'The provider adds yesterday\'s rows to a shared table. When does the recipient see them?',
    options: [
      { t: 'On their next query, because they read the provider\'s live table', ok: true, why: 'No copy means no sync delay. New committed data is visible immediately.' },
      { t: 'After the recipient re-imports the share', why: 'There is nothing to re-import.' },
      { t: 'Only after the provider recreates the share', why: 'Shares reference live tables. Updates flow automatically.' },
      { t: 'Never; shares are snapshots', why: 'Shares are live (history sharing can also expose older versions).' },
    ],
  },

  // ---------------- APIs and Marketplace ----------------
  {
    id: 'c3-q-api-intake',
    sub: 'api-marketplace',
    scenario: true,
    stem: 'A vendor exposes only a REST API and there is no managed connector. What is a sound pattern for daily intake?',
    options: [
      { t: 'A scheduled job runs code that calls the API, writes raw JSON to a volume, then COPY INTO or Auto Loader loads it into a bronze table', ok: true, why: 'Keeping the raw responses in a volume gives you a replayable record, and standard ingestion turns them into tables.' },
      { t: 'Ask analysts to download the JSON and upload it every morning', why: 'Manual, error-prone and not automated.' },
      { t: 'Point Delta Sharing at the API', why: 'Delta Sharing shares Delta data. It doesn\'t call APIs.' },
      { t: 'Use Lakehouse Federation on the API', why: 'Federation connects to databases, not REST APIs.' },
    ],
  },
  {
    id: 'c3-q-connect',
    sub: 'api-marketplace',
    scenario: true,
    stem: 'Your company wants Workday and Salesforce data in the lakehouse, incrementally, without writing ingestion code. What should you look at first?',
    options: [
      { t: 'Lakeflow Connect managed connectors', ok: true, why: 'Managed connectors handle incremental loads, schema changes and retries for supported SaaS and database sources.' },
      { t: 'Delta Sharing', why: 'Sharing needs the source to be a Delta Sharing provider. Workday and Salesforce aren\'t.' },
      { t: 'The UI upload', why: 'Manual and not incremental.' },
      { t: 'COPY INTO on the Salesforce website', why: 'COPY INTO reads files in cloud storage, not SaaS APIs.' },
    ],
    verify: 'Which sources Lakeflow Connect currently supports.',
  },
  {
    id: 'c3-q-market-source',
    sub: 'api-marketplace',
    scenario: true,
    stem: 'You get a free dataset listing from Databricks Marketplace. How does the data arrive in your workspace?',
    options: [
      { t: 'As a read-only catalog delivered through Delta Sharing, which the provider keeps up to date', ok: true, why: 'Marketplace is the storefront, Delta Sharing is the delivery. Nothing to ingest or refresh yourself.' },
      { t: 'As CSV files emailed to you', why: 'Marketplace data arrives as shared tables, not email attachments.' },
      { t: 'As a copy you must refresh with COPY INTO', why: 'No copying is needed. The catalog is live.' },
      { t: 'As a new workspace', why: 'You get a catalog in your existing metastore.' },
    ],
  },

  // ---------------- UI upload ----------------
  {
    id: 'c3-q-upload-when',
    sub: 'upload',
    scenario: true,
    stem: 'Which situation is the best fit for "create table from file upload" in the Workspace UI?',
    options: [
      { t: 'A one-off 15 MB CSV of budget targets from finance', ok: true, why: 'Small, local, one-off files are exactly what the UI upload is for.' },
      { t: 'Hourly JSON files landing in S3', why: 'Recurring files in cloud storage call for Auto Loader or COPY INTO.' },
      { t: 'A 40 GB Parquet export', why: 'Too large for the UI upload. Land it in storage and load it there.' },
      { t: 'A partner\'s live table on another cloud', why: 'That is Delta Sharing.' },
    ],
    verify: 'Current upload size limit and file count.',
  },
  {
    id: 'c3-q-upload-privileges',
    sub: 'upload',
    scenario: true,
    stem: 'You try to upload a CSV into prod.sales and get a permission error, though you can query tables there. What are you missing?',
    options: [
      { t: 'CREATE TABLE on the prod.sales schema (you already have USE CATALOG, USE SCHEMA and SELECT)', ok: true, why: 'Creating a table needs CREATE TABLE on the target schema plus USE on its catalog and schema. SELECT is for reading.' },
      { t: 'MODIFY on every table in prod.sales', why: 'MODIFY changes existing tables. A new table needs CREATE TABLE.' },
      { t: 'Workspace admin rights', why: 'Not needed. A schema-level privilege is enough.' },
      { t: 'A Delta Sharing recipient', why: 'Unrelated to creating tables in your own metastore.' },
    ],
  },
  {
    id: 'c3-q-upload-header',
    sub: 'upload',
    scenario: true,
    stem: 'In the upload preview, columns are named _c0, _c1, _c2 and the first row contains "order_id, region, amount". What went wrong?',
    options: [
      { t: 'The header row is being read as data; turn on "first row contains the header"', ok: true, why: 'With the header read as data, names are generic and every column becomes STRING because of the text row.' },
      { t: 'The file is corrupted', why: 'The data is there. Only the header setting is wrong.' },
      { t: 'You must rename every column by hand', why: 'Fixing the header option names them from the file.' },
      { t: 'CSV files can\'t have headers', why: 'They usually do, and the upload supports them.' },
    ],
  },
  {
    id: 'c3-q-upload-types',
    sub: 'upload',
    scenario: true,
    stem: 'The preview inferred zip_code as BIGINT, and 02134 shows as 2134. What should you do before creating the table?',
    options: [
      { t: 'Change zip_code to STRING in the preview', ok: true, why: 'Codes with leading zeros are identifiers, not numbers. The preview lets you override inferred types.' },
      { t: 'Leave it; you can add the zero back in every query', why: 'Fragile and easy to forget. Fix the type at load time.' },
      { t: 'Change it to DOUBLE', why: 'Still a number, so the leading zero is still lost.' },
      { t: 'Delete the column', why: 'You would lose real data.' },
    ],
  },
]

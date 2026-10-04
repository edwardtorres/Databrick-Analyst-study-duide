import { questions } from './questions.js'

const card = (id, title, body, extra = {}) => ({ type: 'card', id: `c3-card-${id}`, title, body, ...extra })
const quiz = (...ids) => ({ type: 'quiz', ids })
const widget = (name) => ({ type: 'widget', name })

const subsections = [
  {
    id: 'cloud-storage',
    title: 'Cloud Storage: COPY INTO & CTAS',
    emoji: '☁️',
    blocks: [
      card('cs-1', 'Governed paths: external locations and volumes', [
        'An **external location** pairs a cloud path (S3, ADLS, GCS) with a **storage credential**. Admins grant `READ FILES`, `WRITE FILES` or `CREATE EXTERNAL TABLE` on it, so nobody needs raw cloud keys.',
        'A **volume** is a Unity Catalog object for **files** (CSV drops, PDFs, images) at `/Volumes/catalog/schema/volume/…`, governed with `READ VOLUME` / `WRITE VOLUME`. Managed volumes live in Unity Catalog storage (dropped files are kept 7 days), external ones on an existing cloud path you register.',
      ]),
      card('cs-2', 'Loading files with SQL', [
        '**COPY INTO** loads files into a Delta table and **skips files already loaded**, so re-runs and retries are safe. Docs: it "works well for data sources that contain thousands of files"; use Auto Loader for millions:',
        "`COPY INTO sales_raw FROM '/Volumes/raw/sales/drop/' FILEFORMAT = CSV FORMAT_OPTIONS ('header' = 'true', 'inferSchema' = 'true') COPY_OPTIONS ('mergeSchema' = 'true')`",
        "**CTAS from files** makes a one-time snapshot: `CREATE TABLE t AS SELECT * FROM read_files('/Volumes/…', format => 'csv', header => true)`. Re-running it re-reads **everything**.",
        'After loading, the data lives in the table. The landing files can be archived.',
      ]),
      quiz('c3-q-external-location', 'c3-q-volume', 'c3-q-copy-into-idempotent', 'c3-q-copy-into-syntax', 'c3-q-ctas-files', 'c3-q-ctas-rerun', 'c3-q-external-vs-managed-load'),
    ],
  },
  {
    id: 'auto-loader',
    title: 'Auto Loader',
    emoji: '🔄',
    blocks: [
      card('al-1', 'Incremental file ingestion', [
        '**Auto Loader** (the `cloudFiles` source) watches a path and loads **only new files**, exactly once, tracking progress in a **checkpoint**.',
        'It scales to **millions of files** per hour, tracking progress in a RocksDB checkpoint: **directory listing** is the default, and **file-notification** mode (file events) is recommended for most workloads.',
        'SQL users get it through **streaming tables**: `CREATE OR REFRESH STREAMING TABLE bronze AS SELECT * FROM STREAM read_files(\'/Volumes/…\', format => \'json\')`.',
      ]),
      card('al-2', 'Schema inference and evolution', [
        'Auto Loader **samples** the first 50 GB or 1,000 files to infer a schema and saves it, so runs are consistent. For **JSON, CSV and XML, columns are inferred as STRING** by default (set `cloudFiles.inferColumnTypes` to infer real types, or use **schema hints**).',
        'When a **new column** appears, the default mode (`addNewColumns`) stops the stream, adds the column and continues after a restart (jobs retry automatically). Other modes: `rescue`, `failOnNewColumns`, `none`.',
        'Values that don\'t fit the schema land in **`_rescued_data`** instead of being lost.',
      ]),
      card('al-3', 'COPY INTO vs Auto Loader', [
        '**COPY INTO**: SQL, batch, thousands of files, simple and idempotent.',
        '**Auto Loader**: continuous or frequent, millions of files, schema evolution and rescued data.',
        '**CTAS**: one-off snapshot. **UI upload**: one small local file.',
      ], { tip: 'Ask: how many files, how often, and will the schema change?' }),
      widget('ingestion-picker'),
      quiz('c3-q-autoloader-what', 'c3-q-autoloader-vs-copy', 'c3-q-schema-evolution', 'c3-q-rescued-data', 'c3-q-schema-inference', 'c3-q-streaming-table-sql'),
    ],
  },
  {
    id: 'sharing',
    title: 'Delta Sharing',
    emoji: '🤝',
    blocks: [
      card('ds-1', 'Live, read-only, no copies', [
        '**Delta Sharing** (docs now call it **OpenSharing**; `/delta-sharing` redirects there) is an open protocol: recipients read the provider\'s **live** data, **read-only**, without copies. The provider controls and audits access.',
        '**Provider**: create a **share**, add tables (or streaming tables, views, materialized views, volumes, notebooks, models; non-table assets need a Databricks recipient), create a **recipient**, then `GRANT SELECT ON SHARE … TO RECIPIENT …`.',
        '**Recipient**: creates a **catalog from the share** and grants their own users access with normal Unity Catalog grants.',
      ]),
      card('ds-2', 'Two modes', [
        '**Databricks-to-Databricks**: the recipient has Unity Catalog; you share to their metastore\'s **sharing identifier**. No tokens.',
        '**Open sharing** (now "Databricks-to-Open"): the recipient uses **any platform** (pandas, Spark, Power BI…) with a long-lived **bearer token** (credential file) or **OIDC federation** with their own identity provider.',
        'Works across clouds and regions. **Egress** (network transfer) is charged by the storage vendor, so cross-region and cross-cloud reads can cost more.',
      ]),
      quiz('c3-q-sharing-what', 'c3-q-sharing-open-vs-d2d', 'c3-q-sharing-readonly', 'c3-q-sharing-provider', 'c3-q-sharing-recipient', 'c3-q-sharing-freshness'),
    ],
  },
  {
    id: 'api-marketplace',
    title: 'APIs, Connectors & Marketplace',
    emoji: '🌐',
    blocks: [
      card('api-1', 'When the data lives behind an API', [
        '**Managed connector first**: **Lakeflow Connect** ingests from SaaS apps and databases (for example Salesforce, Workday, HubSpot, Google Analytics, and MySQL/PostgreSQL/SQL Server via CDC) incrementally with little or no code.',
        '**No connector?** Write the intake: a **scheduled job** calls the API, lands raw JSON in a **volume**, then COPY INTO or Auto Loader loads bronze. Keeping raw responses lets you replay them.',
        'To query an operational database **in place** without copying, **Lakehouse Federation** adds it as a read-only foreign catalog (MySQL, PostgreSQL, SQL Server, Oracle, Snowflake, BigQuery and more).',
      ]),
      card('api-2', 'Marketplace as a data source', [
        'Get a listing and the provider\'s data appears as a **read-only catalog** (delivered through Delta Sharing). The provider keeps it fresh, so there is no pipeline to build.',
        'Listings can be free, commercial, or **private** to specific consumers.',
      ]),
      quiz('c3-q-api-intake', 'c3-q-connect', 'c3-q-market-source'),
    ],
  },
  {
    id: 'upload',
    title: 'Uploading a File in the UI',
    emoji: '⬆️',
    blocks: [
      card('up-1', 'Create a table from a file', [
        'For **small, one-off** files: **CSV, TSV, JSON, Avro, Parquet or text** (no zip/tar). Up to **10 files** at a time, **under 2 GB** in total. Preview shows 50 rows.',
        'Choose the **catalog, schema and table name**. You need permission to create tables in the schema (`USE CATALOG`, `USE SCHEMA`, **`CREATE TABLE`**) and a **running compute resource** (SQL warehouse, serverless or dedicated compute).',
        'The result is a **managed Delta table**.',
      ]),
      card('up-2', 'Check the preview', [
        'Confirm **"first row contains the header"**. Otherwise columns become `_c0, _c1…` and the header is a data row.',
        'Review **detected types**: IDs with leading zeros (ZIP, phone) must be STRING; money should be DECIMAL or DOUBLE; dates should be DATE.',
        'Fixing names and types now is cheaper than fixing every query later.',
      ]),
      widget('upload-wizard'),
      quiz('c3-q-upload-when', 'c3-q-upload-privileges', 'c3-q-upload-header', 'c3-q-upload-types'),
    ],
  },
]

export default {
  intro: 'Get data into the lakehouse the right way: COPY INTO and CTAS from cloud storage, Auto Loader for files that keep coming, Delta Sharing and Marketplace for other people\'s data, connectors and APIs, and the UI upload for one-off files.',
  subsections,
  questions,
  challenges: [],
}

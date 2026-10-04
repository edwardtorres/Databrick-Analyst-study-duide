import { questions } from './questions.js'
import { challenges } from './challenges.js'

// Inline markup in card bodies: **bold** and `code`.
const card = (id, title, body, extra = {}) => ({ type: 'card', id: `c4-card-${id}`, title, body, ...extra })
const quiz = (...ids) => ({ type: 'quiz', ids })
const challenge = (id) => ({ type: 'challenge', id })
const widget = (name) => ({ type: 'widget', name })

const subsections = [
  {
    id: 'assistant',
    title: 'Databricks Assistant',
    emoji: '🤖',
    blocks: [
      card('assist-1', 'Your AI pair-analyst', [
        '**Databricks Assistant** is the AI helper built into the SQL editor, notebooks, and other surfaces. It writes, explains, and fixes code using your **Unity Catalog metadata**: table names, column names, and comments.',
        'Better table and column comments lead to better suggestions. Treat what it generates as a draft: **review before you run**.',
      ]),
      card(
        'assist-2',
        'Slash commands to know',
        [
          '`/explain`: describe what the selected code does, in plain language.',
          '`/fix`: propose a fix for an error, shown as a diff you Accept or Reject. On a failed cell, the **Diagnose error** button runs `/fix` for you.',
          '`/doc`: add comments or documentation to code.',
          '`/optimize`: suggest performance improvements for SQL. Also: `/findTables`, `/findQueries`, `/prettify`.',
          'Naming: the exam guide says **Databricks Assistant**; the product is now called **Genie Code** (old Assistant docs redirect there). Same commands.',
          'Natural-language prompts work too, for example: "top 5 customers by revenue last quarter".',
        ],
        
      ),
      card('assist-3', 'Exam lens', [
        'Match the command to the goal: **understand** code → /explain. **Error** to resolve → /fix. **Add docs/comments** → /doc.',
        'The Assistant follows Unity Catalog permissions. It cannot see or query data you are not allowed to access.',
      ]),
      quiz('c4-q-assist-explain', 'c4-q-assist-fix', 'c4-q-assist-context'),
    ],
  },
  {
    id: 'warehouses',
    title: 'SQL Warehouses',
    emoji: '🏭',
    blocks: [
      card('wh-1', 'What a SQL warehouse is', [
        'A **SQL warehouse** is **compute** for SQL. It runs queries for the SQL editor, AI/BI dashboards, alerts, Genie spaces, and BI tools connecting over JDBC/ODBC.',
        'Data is **not stored** in the warehouse. Tables live in cloud object storage and are governed by Unity Catalog. Photon is on by default.',
      ]),
      card(
        'wh-2',
        'Types',
        [
          '**Serverless**: Databricks-managed compute, starts in seconds, scales fast. This is generally the recommended choice.',
          '**Pro** and **Classic**: compute runs in your cloud account and starts more slowly. Serverless has Photon, Predictive IO and Intelligent Workload Management; Pro has Photon and Predictive IO; Classic has Photon only.',
          'Choose **Pro** when serverless isn\'t available in your region or you need custom networking (e.g. federation to databases in your private network). Genie needs Pro or Serverless.',
        ],
        
      ),
      card('wh-3', 'Size vs scaling: the #1 exam trap', [
        '**Cluster size** (2X-Small … 4X-Large) makes each query faster. Pick a larger size when **one heavy query** is slow.',
        '**Scaling (min/max clusters)** adds parallel clusters for **many concurrent queries**. Raise the max when queries **queue**.',
        '**Auto stop** shuts the warehouse down after idle minutes to save cost.',
      ], { tip: 'Slow alone → bigger size. Slow only when busy → more clusters.' }),
      quiz('c4-q-wh-what', 'c4-q-wh-concurrency', 'c4-q-wh-size', 'c4-q-wh-serverless', 'c4-q-wh-autostop'),
    ],
  },
  {
    id: 'federation',
    title: 'Federated Queries',
    emoji: '🌉',
    blocks: [
      card(
        'fed-1',
        'Lakehouse Federation',
        [
          '**Lakehouse Federation** lets you query external databases (for example PostgreSQL, MySQL, SQL Server, Snowflake, Redshift, BigQuery) **in place** (read-only), with no ingestion pipeline, governed by Unity Catalog. Queries are pushed down to the source over JDBC.',
          'Setup: create a **connection** (host and credentials), then a **foreign catalog** that mirrors the source, then grant privileges. Query it like any table: `pg_sales.public.orders`. Sources include MySQL, PostgreSQL, SQL Server, Oracle, Teradata, Redshift, Snowflake, BigQuery and Synapse.',
        ],
        {
          code: `CREATE CONNECTION pg_conn TYPE postgresql
  OPTIONS (host '...', port '5432', user secret('scope','u'), password secret('scope','p'));

CREATE FOREIGN CATALOG pg_sales USING CONNECTION pg_conn
  OPTIONS (database 'sales');

SELECT * FROM pg_sales.public.orders LIMIT 10;`,
          },
      ),
      card('fed-2', 'When (not) to federate', [
        '**Good fit:** ad-hoc exploration, joining live operational data with lakehouse tables, proofs of concept, or avoiding yet another copy pipeline.',
        '**Poor fit:** heavy, repeated dashboard workloads. Every federated query hits the source system. In that case, ingest the data or materialize it into Delta.',
        'Federation is **not** Delta Sharing (sharing data between organizations), and **not** Auto Loader (ingesting files).',
      ]),
      quiz('c4-q-fed-when', 'c4-q-fed-objects', 'c4-q-fed-tradeoff'),
    ],
  },
  {
    id: 'views',
    title: 'Views, MVs & Streaming Tables',
    emoji: '🪟',
    blocks: [
      card('views-1', 'Three objects, three jobs', [
        '**View**: a saved query with **no stored data**. It is computed every time you read it, so it is always fresh and has no refresh cost. A **TEMP VIEW** exists only in your session.',
        '**Materialized view (MV)**: **stored, precomputed results** (often aggregations or joins) that refresh on a schedule or on demand, incrementally when possible. Reads are fast.',
        '**Streaming table (ST)**: a Delta table that processes **each new input row once**. Built for append-only, incremental ingestion such as files landing in storage or Kafka events.',
      ]),
      card(
        'views-2',
        'Syntax at a glance',
        ['In Databricks SQL, MVs and STs are refreshed by a **serverless pipeline** behind the scenes (Lakeflow pipelines, formerly Delta Live Tables). Refresh options: `SCHEDULE EVERY …`, `SCHEDULE CRON …`, `TRIGGER ON UPDATE`, or `REFRESH MATERIALIZED VIEW`.'],
        {
          code: `CREATE VIEW v_active AS SELECT * FROM customers WHERE active;

CREATE MATERIALIZED VIEW mv_daily_rev
  SCHEDULE EVERY 1 HOUR
AS SELECT order_date, SUM(amount) AS revenue FROM orders GROUP BY order_date;

CREATE STREAMING TABLE st_events
AS SELECT * FROM STREAM read_files('s3://acme/events/', format => 'json');

REFRESH MATERIALIZED VIEW mv_daily_rev;`,
          },
      ),
      card('views-3', 'Pick fast', [
        'Files or events keep arriving, append-only → **streaming table**.',
        'Expensive aggregation for a fast dashboard, slightly stale is OK → **materialized view**.',
        'Light logic, must be exactly current, no storage → **view**.',
        'Shared with others → **not** a TEMP view.',
      ]),
      challenge('c4-ddl-view'),
      quiz('c4-q-st-ingest', 'c4-q-mv-dashboard', 'c4-q-view-fresh', 'c4-q-mv-facts', 'c4-q-tempview'),
    ],
  },
  {
    id: 'aggregates',
    title: 'Aggregations',
    emoji: '🧮',
    blocks: [
      card('agg-1', 'Counting correctly', [
        '`COUNT(*)` counts rows. `COUNT(col)` counts **non-NULL** values. `COUNT(DISTINCT col)` counts unique non-NULL values.',
        '`approx_count_distinct(col)` estimates distinct counts with HyperLogLog++. It is much cheaper on huge tables and has a small, bounded error.',
        '`count_if(cond)` counts rows where a condition is true.',
      ]),
      card('agg-2', 'Averages & summary stats', [
        '`AVG`, `SUM`, `MIN`, and `MAX` all **ignore NULLs**. AVG divides by the number of non-NULL values.',
        'For skewed data use `median(col)` or `percentile(col, 0.5)`. `percentile_approx` is the cheap version. `stddev` measures spread.',
        'In notebooks, click **+** above the results and choose **Data Profile** to get summary statistics and histograms without writing SQL.',
      ]),
      card(
        'agg-3',
        'GROUP BY rules',
        [
          'Every non-aggregated SELECT column must be in `GROUP BY`. Otherwise Databricks raises **MISSING_AGGREGATION**.',
          '`GROUP BY ALL` groups by all non-aggregated SELECT expressions. `ROLLUP` and `CUBE` add subtotal rows.',
        ],
        { code: `SELECT region, tier, COUNT(*) AS n
FROM customers
GROUP BY ALL;` },
      ),
      challenge('c4-sql-count-null'),
      challenge('c4-sql-approx'),
      challenge('c4-fix-groupby'),
      challenge('c4-sql-category-revenue'),
      quiz('c4-q-count-null', 'c4-q-approx', 'c4-q-avg-null', 'c4-q-groupby-all', 'c4-q-median'),
    ],
  },
  {
    id: 'joins',
    title: 'Joins & Set Operations',
    emoji: '🔗',
    blocks: [
      card('join-1', 'The join family', [
        '**INNER**: matched rows only. **LEFT/RIGHT [OUTER]**: everything from one side, NULL-padded. **FULL [OUTER]**: everything from both sides.',
        '**LEFT SEMI**: left rows that have a match, left columns only (like `EXISTS`). **LEFT ANTI**: left rows with **no** match (like `NOT EXISTS`).',
        '**CROSS**: every combination of rows.',
      ]),
      widget('join-visualizer'),
      card('join-2', 'Join traps', [
        'Duplicate keys on either side **multiply** rows.',
        'NULL keys never match each other in an equi-join.',
        'A WHERE filter on the optional side of a LEFT JOIN turns it into an INNER JOIN. Put that condition in `ON` instead.',
      ]),
      card('join-3', 'UNION vs UNION ALL', [
        '`UNION` stacks rows **and removes duplicates**, which takes extra work. `UNION ALL` keeps every row and is faster.',
        '`INTERSECT` returns rows found in both inputs. `EXCEPT` returns rows in the first input but not the second. All of them need matching column counts and compatible types.',
      ]),
      widget('set-ops'),
      challenge('c4-sql-no-orders'),
      challenge('c4-sql-region-counts'),
      challenge('c4-fix-jointype'),
      challenge('c4-fix-where-outer'),
      quiz('c4-q-join-left', 'c4-q-join-anti', 'c4-q-union-all', 'c4-q-join-explode', 'c4-q-join-full', 'c4-q-join-cross'),
    ],
  },
  {
    id: 'filtering',
    title: 'Filtering & Sorting',
    emoji: '🧹',
    blocks: [
      card('filter-1', 'Order of operations', [
        'Logical order: `FROM/JOIN` → `WHERE` → `GROUP BY` → `HAVING` → window functions → `QUALIFY` → `SELECT` → `ORDER BY` → `LIMIT`.',
        '**WHERE** filters rows, **HAVING** filters groups, and **QUALIFY** filters window-function results.',
      ], { code: `SELECT customer_id, order_id, amount
FROM orders
QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC) = 1;` }),
      card(
        'filter-2',
        'NULLs and sorting',
        [
          '`x = NULL` is never true. Use `IS NULL`, or the NULL-safe `<=>` operator in Databricks.',
          'In Databricks, `ORDER BY col ASC` puts NULLs **first** and `DESC` puts them **last**. Override with `NULLS FIRST` or `NULLS LAST`.',
          'In Databricks, `LIKE` is case-sensitive. Use `ILIKE` or `lower(col) LIKE ...` for case-insensitive matching.',
          'Without `ORDER BY`, result order is not guaranteed. For top-N queries, add a tie-breaker column.',
        ],
        
      ),
      challenge('c4-sql-filter-sort'),
      challenge('c4-fix-having'),
      challenge('c4-fix-null-compare'),
      challenge('c4-sql-top3'),
      quiz('c4-q-having', 'c4-q-null-eq', 'c4-q-nulls-sort', 'c4-q-qualify'),
    ],
  },
  {
    id: 'tables',
    title: 'Creating Tables',
    emoji: '🏗️',
    blocks: [
      card('tbl-1', 'Managed vs external', [
        '**Managed table**: Unity Catalog chooses and manages the storage location. `DROP TABLE` removes the data too, but you can **UNDROP** it within **7 days** by default (configurable to 0 or 7–30 days), then the files are purged. Managed is the recommended default.',
        '**External table**: you specify a `LOCATION` (for example an S3 path) covered by an **external location** and a **storage credential**. `DROP TABLE` removes only the metadata; the files stay.',
        'Use external tables when data must stay at a path you control or that other tools read.',
      ]),
      card('tbl-2', 'The syntax', [
        'CTAS (`CREATE TABLE ... AS SELECT`) infers the schema and loads data in one step. Delta is the default format, so `USING DELTA` is optional.',
      ], {
        code: `-- managed
CREATE TABLE quest.retail.gold_sales AS
SELECT region, SUM(amount) AS revenue FROM silver_sales GROUP BY region;

-- external
CREATE TABLE quest.retail.raw_events (id INT, payload STRING)
LOCATION 's3://acme-raw/events/';`,
      }),
      card('tbl-3', 'CREATE OR REPLACE vs DROP + CREATE', [
        '`CREATE OR REPLACE TABLE` is **atomic**: readers never see a missing table, and Delta **history is kept**, along with **granted privileges, row filters and column masks**, so you can still time travel to versions from before the replace.',
        '`DROP` then `CREATE` leaves a window where the table does not exist, **throws away history**, and creates a brand-new table object.',
        '`CREATE TABLE IF NOT EXISTS` does nothing (and raises no error) when the table already exists.',
      ]),
      challenge('c4-ddl-ctas'),
      challenge('c4-ddl-replace'),
      quiz('c4-q-ext-drop', 'c4-q-ext-when', 'c4-q-managed-default', 'c4-q-cor', 'c4-q-ctas', 'c4-q-ext-prereq'),
    ],
  },
  {
    id: 'timetravel',
    title: 'Delta Time Travel',
    emoji: '⏳',
    blocks: [
      card('tt-1', 'Every write is a version', [
        'Every Delta write (INSERT, UPDATE, DELETE, MERGE, OPTIMIZE, RESTORE…) creates a new **version** in the transaction log. `DESCRIBE HISTORY t` lists them.',
        'Read the past: `VERSION AS OF n`, `TIMESTAMP AS OF \'...\'`, or the shorthand `t@v3`. Roll back with `RESTORE TABLE t TO VERSION AS OF n`. RESTORE itself is a **new** version.',
      ], { code: `DESCRIBE HISTORY inventory;
SELECT * FROM inventory VERSION AS OF 2;
SELECT * FROM inventory TIMESTAMP AS OF '2025-02-26';
RESTORE TABLE inventory TO VERSION AS OF 2;` }),
      card(
        'tt-2',
        'Why VACUUM breaks time travel',
        [
          'Old versions point to data files that newer versions no longer use. `VACUUM` deletes unreferenced files **older than the retention threshold (default 7 days)**.',
          'After that, `DESCRIBE HISTORY` still **lists** the old version (the log is kept about 30 days by default), but reading it fails because its files are gone.',
          '`VACUUM t RETAIN 0 HOURS` requires disabling a safety check. It wipes out all time travel except the current version.',
          'With **predictive optimization** (on by default for newer accounts, Unity Catalog managed tables), Databricks runs VACUUM for you.',
        ],
        
      ),
      widget('time-travel'),
      quiz('c4-q-tt-syntax', 'c4-q-tt-vacuum', 'c4-q-tt-restore', 'c4-q-tt-retention', 'c4-q-tt-restore-version'),
    ],
  },
]

export default {
  intro:
    'The biggest exam section. You will learn how Databricks SQL runs your queries, which objects to create, and how to write correct SQL against messy data.',
  subsections,
  questions,
  challenges,
}

// Chapter 4 question bank. Original, scenario-style questions.
// Every option carries a `why`, so the review screen can explain both why
// the right answer is right and why each distractor is wrong.
// `scenario: true` renders the question as a Scenario Picker card.
// `verify` flags facts that may have changed since the Oct 2025 guide.

export const questions = [
  // ---------------- Databricks Assistant ----------------
  {
    id: 'c4-q-assist-explain',
    sub: 'assistant',
    stem: 'You inherited a 200-line query full of nested CTEs. You want a plain-language walkthrough of what it does, right in the SQL editor, without changing the code. What is the fastest option?',
    options: [
      { t: 'Ask Databricks Assistant with /explain', ok: true, why: 'In the current product the Assistant is called Genie Code; /explain works the same. /explain describes what the selected code does in plain language and leaves the code unchanged.' },
      { t: 'Ask Databricks Assistant with /fix', why: '/fix proposes code changes to resolve an error. Your query works; you only want to understand it.' },
      { t: 'Open the Query Profile', why: 'Query Profile shows execution metrics such as operators, time, and rows. It does not explain business logic.' },
      { t: 'Run DESCRIBE HISTORY on each table', why: 'DESCRIBE HISTORY lists table versions and operations. It says nothing about what your query means.' },
    ],
  },
  {
    id: 'c4-q-assist-fix',
    sub: 'assistant',
    stem: 'A teammate renamed a column. Your saved query now fails with an UNRESOLVED_COLUMN error. You want the Assistant to suggest corrected SQL you can accept or reject. Which command fits best?',
    options: [
      { t: '/fix', ok: true, why: 'The Diagnose error button runs /fix automatically. /fix (also offered as "Diagnose error" on failures) uses the error and table metadata to propose corrected code for you to review.' },
      { t: '/explain', why: '/explain describes code. It is not aimed at producing a corrected version of a failing query.' },
      { t: '/doc', why: '/doc adds comments or documentation to code. It does not resolve errors.' },
      { t: 'Restart the SQL warehouse', why: 'The error is semantic: the column name no longer exists. Restarting compute will not change that.' },
    ],
  },
  {
    id: 'c4-q-assist-context',
    sub: 'assistant',
    stem: 'Which statement about Databricks Assistant is accurate?',
    options: [
      { t: 'It uses context such as Unity Catalog metadata (table names, column names, comments) to produce more relevant SQL, and you should review its output before running it.', ok: true, why: 'Good table and column comments improve Assistant answers. Generated code is a suggestion that you must check.' },
      { t: 'It automatically runs the SQL it generates against production tables.', why: 'The Assistant suggests code. You choose whether to insert and run it.' },
      { t: 'It can show you tables you lack permission to read.', why: 'The Assistant respects Unity Catalog permissions. It does not bypass governance.' },
      { t: 'It is only available in Python notebooks.', why: 'It works in the SQL editor, in notebooks (SQL and Python), and in other surfaces.' },
    ],
  },

  // ---------------- SQL Warehouses ----------------
  {
    id: 'c4-q-wh-what',
    sub: 'warehouses',
    stem: 'What does a SQL warehouse provide?',
    options: [
      { t: 'Compute that runs SQL for the SQL editor, dashboards, alerts, Genie, and external BI tools (JDBC/ODBC)', ok: true, why: 'A SQL warehouse is a compute resource optimized for SQL workloads. Your data stays in cloud storage and is governed by Unity Catalog.' },
      { t: 'The storage location where Delta tables are kept', why: 'Storage is cloud object storage (managed by UC for managed tables). Warehouses are compute only.' },
      { t: 'A Unity Catalog object that groups schemas', why: 'That is a catalog. Catalogs are governance objects, not compute.' },
      { t: 'A scheduler for running notebooks in sequence', why: 'Scheduling notebooks and tasks is what Lakeflow Jobs does.' },
    ],
  },
  {
    id: 'c4-q-wh-concurrency',
    sub: 'warehouses',
    scenario: true,
    stem: 'Every morning at 9:00, 60 analysts open the same dashboards. Queries pile up in a queue, yet each query runs fast when it runs alone. What change best fixes this?',
    options: [
      { t: 'Raise the warehouse maximum cluster count (scaling)', ok: true, why: 'Queueing under many concurrent users is a concurrency problem. More clusters let more queries run in parallel.' },
      { t: 'Increase the warehouse size (e.g., Small to Large)', why: 'Size makes individual heavy queries faster. These queries are already fast; they are waiting in line.' },
      { t: 'Lower the auto-stop timeout', why: 'Auto stop saves money while idle. It does nothing for a busy morning.' },
      { t: 'Move the dashboards to an all-purpose cluster', why: 'All-purpose clusters are for interactive notebooks. SQL warehouses are the right compute for dashboards.' },
    ],
  },
  {
    id: 'c4-q-wh-size',
    sub: 'warehouses',
    scenario: true,
    stem: 'One complex aggregation over a huge fact table takes 20 minutes, even at night when nobody else is using the warehouse. Which change is most likely to speed up that single query?',
    options: [
      { t: 'Increase the warehouse size (T-shirt size)', ok: true, why: 'A bigger size gives each cluster more compute, which speeds up a single heavy query.' },
      { t: 'Increase the maximum number of clusters', why: 'Extra clusters add concurrency. One query still runs on one cluster.' },
      { t: 'Enable auto stop', why: 'Auto stop shuts down an idle warehouse. It has no effect on query speed.' },
      { t: 'Rely on the query result cache', why: 'The result cache only helps when the same query reruns on unchanged data. The first slow run still happens.' },
    ],
  },
  {
    id: 'c4-q-wh-serverless',
    sub: 'warehouses',
    scenario: true,
    stem: 'Your team wants a SQL warehouse that starts in seconds, scales quickly, and requires no cloud capacity management in your own account. Which type fits?',
    options: [
      { t: 'Serverless SQL warehouse', ok: true, why: 'Serverless starts in about 2–6 seconds and adds Intelligent Workload Management. Serverless compute runs in Databricks-managed infrastructure, starts fast, and scales without you managing instances.' },
      { t: 'Classic SQL warehouse', why: 'Classic warehouses run in your cloud account and start more slowly.' },
      { t: 'Pro SQL warehouse', why: 'Pro adds features over Classic, but its compute still runs in your account and starts more slowly than serverless.' },
      { t: 'A job cluster', why: 'Job clusters run scheduled jobs, not interactive SQL from dashboards and the SQL editor.' },
    ],
  },
  {
    id: 'c4-q-wh-autostop',
    sub: 'warehouses',
    stem: 'A warehouse sits idle all night and on weekends, but billing shows it running. What is the simplest fix?',
    options: [
      { t: 'Configure auto stop so it shuts down after a period of inactivity', ok: true, why: 'Auto stop stops an idle warehouse. The next query starts it again.' },
      { t: 'Set the minimum number of clusters to 0', why: 'Scaling settings control concurrency while the warehouse runs. Auto stop is how you stop it when idle.' },
      { t: 'Delete the warehouse every evening and recreate it every morning', why: 'This technically works, but it breaks dashboards, alerts, and connections. Auto stop does it for you.' },
      { t: 'Downsize it to 2X-Small', why: 'A smaller warehouse is cheaper per hour, but it still bills all night.' },
    ],
  },

  // ---------------- Federation ----------------
  {
    id: 'c4-q-fed-when',
    sub: 'federation',
    scenario: true,
    stem: 'You need to join live data in an operational PostgreSQL database with lakehouse tables, governed by Unity Catalog, without building an ingestion pipeline. What should you use?',
    options: [
      { t: 'Lakehouse Federation (a connection plus a foreign catalog)', ok: true, why: 'Federation lets you query external databases in place, governed by Unity Catalog, with no copy pipeline.' },
      { t: 'Delta Sharing', why: 'Delta Sharing shares data between organizations and platforms. It does not query a live operational database.' },
      { t: 'Auto Loader', why: 'Auto Loader incrementally ingests files from cloud storage. It does not read a PostgreSQL database.' },
      { t: 'Export a CSV and upload it in the workspace UI', why: 'This is a manual, one-time copy that goes stale right away. It is not live data.' },
    ],
  },
  {
    id: 'c4-q-fed-objects',
    sub: 'federation',
    stem: 'Which sequence correctly sets up a federated query against an external MySQL database?',
    options: [
      { t: 'Create a CONNECTION (host and credentials), create a FOREIGN CATALOG from it, then query catalog.schema.table', ok: true, why: 'Then grant privileges on the foreign catalog. The connection stores how to reach the source. The foreign catalog mirrors its databases and tables into Unity Catalog.' },
      { t: 'Create an EXTERNAL LOCATION, then CREATE TABLE ... LOCATION pointing to MySQL', why: 'External locations are for cloud object storage paths, not database servers.' },
      { t: 'Create a Delta Sharing recipient for MySQL', why: 'Recipients receive shared data. They do not connect to source databases.' },
      { t: 'Create a streaming table that reads the MySQL binlog', why: 'Change data capture is an ingestion pattern. Federation queries the source directly.' },
    ],
  },
  {
    id: 'c4-q-fed-tradeoff',
    sub: 'federation',
    scenario: true,
    stem: 'A popular dashboard runs federated queries against a production MySQL database, and app users complain the database slowed down. What is the best fix?',
    options: [
      { t: 'Ingest or materialize the needed data into Delta tables (for example, a scheduled refresh) and point the dashboard there', ok: true, why: 'Federated queries hit the source every time they run. For heavy, repeated reads, land the data in the lakehouse.' },
      { t: 'Increase the SQL warehouse size', why: 'The bottleneck is the source database. More Databricks compute can actually push more load onto it.' },
      { t: 'Create a second foreign catalog for the same database', why: 'Two catalogs pointing at the same source double the paths to the same bottleneck.' },
      { t: 'Give dashboard viewers direct MySQL credentials', why: 'That bypasses Unity Catalog governance and does nothing to reduce load.' },
    ],
  },

  // ---------------- Views, MVs, Streaming tables ----------------
  {
    id: 'c4-q-st-ingest',
    sub: 'views',
    scenario: true,
    stem: 'JSON files land in cloud storage all day. You need append-only, incremental ingestion where each new file is processed once, defined in SQL. Which object fits best?',
    options: [
      { t: 'Streaming table', ok: true, why: 'Streaming tables process each new input once (for example, with read_files over a storage path). That is ideal for append-only ingestion.' },
      { t: 'Materialized view', why: 'MVs precompute query results, such as aggregations or joins, over changing data. They are not the go-to object for append-only file ingestion.' },
      { t: 'Standard view', why: 'A view stores no data. Every query would rescan all the files.' },
      { t: 'A CTAS table created once', why: 'CTAS is a one-time snapshot. New files would never be picked up.' },
    ],
  },
  {
    id: 'c4-q-mv-dashboard',
    sub: 'views',
    scenario: true,
    stem: 'An executive dashboard shows daily revenue by region, aggregated from a 2-billion-row fact table. It must load fast, and an hourly refresh is fine. Which object should back it?',
    options: [
      { t: 'Materialized view', ok: true, why: 'An MV stores precomputed aggregates and can refresh on a schedule, often incrementally. Dashboard reads stay fast.' },
      { t: 'Standard view', why: 'A view re-aggregates 2 billion rows on every dashboard load.' },
      { t: 'Streaming table', why: 'Streaming tables suit append-only ingestion. Aggregates that change as new data arrives are an MV job.' },
      { t: 'Temporary view', why: 'Temp views last only for your session. Other users and the dashboard cannot use them.' },
    ],
  },
  {
    id: 'c4-q-view-fresh',
    sub: 'views',
    scenario: true,
    stem: 'You need a simple filter-and-rename layer over a small table. It must always reflect the latest data exactly, it is rarely queried, and you want no storage or refresh to manage. What fits?',
    options: [
      { t: 'Standard view', ok: true, why: 'A view stores only the query text. It always returns current data and needs no refresh.' },
      { t: 'Materialized view', why: 'An MV stores results and must refresh. That is overkill for a light, rarely used layer that must always be current.' },
      { t: 'Streaming table', why: 'Streaming tables are for incremental ingestion, not a filter-and-rename layer.' },
      { t: 'CTAS table', why: 'A CTAS table is a snapshot that goes stale as soon as the source changes.' },
    ],
  },
  {
    id: 'c4-q-mv-facts',
    sub: 'views',
    stem: 'Which statement about materialized views in Databricks SQL is true?',
    options: [
      { t: 'They store precomputed results that refresh on a schedule or on demand (REFRESH MATERIALIZED VIEW), incrementally when possible.', ok: true, why: 'Refresh with SCHEDULE EVERY/CRON, TRIGGER ON UPDATE, or REFRESH MATERIALIZED VIEW; a serverless pipeline does the work. This is the core MV trade-off: fast reads in exchange for managed refreshes.' },
      { t: 'They always return real-time results with zero latency.', why: 'MV results are as fresh as the last refresh. A standard view is computed at query time.' },
      { t: 'Dropping a materialized view also drops its source tables.', why: 'Dropping an MV removes only the MV.' },
      { t: 'They can only be defined in Python.', why: 'You create them in SQL with CREATE MATERIALIZED VIEW ... AS SELECT.' },
    ],
  },
  {
    id: 'c4-q-tempview',
    sub: 'views',
    stem: "You created a view to share with a colleague, but they can't find it in Catalog Explorer, even though they have access to the schema. What is the most likely cause?",
    options: [
      { t: 'You created a TEMPORARY VIEW, which exists only in your session and is not registered in Unity Catalog', ok: true, why: 'Temp views are session-scoped. Use CREATE VIEW catalog.schema.name to make a persistent view.' },
      { t: 'Views are never visible in Catalog Explorer', why: 'Persistent views show up in Catalog Explorer alongside tables.' },
      { t: 'Your warehouse was stopped', why: 'A stopped warehouse does not hide Unity Catalog objects from Catalog Explorer.' },
      { t: 'Views require a materialized view refresh before they appear', why: 'Standard views have nothing to refresh.' },
    ],
  },

  // ---------------- Aggregates ----------------
  {
    id: 'c4-q-count-null',
    sub: 'aggregates',
    stem: 'A customers table has 100 rows, and 12 of them have a NULL email. What does SELECT COUNT(*), COUNT(email) FROM customers return?',
    options: [
      { t: '100, 88', ok: true, why: 'COUNT(*) counts every row. COUNT(email) skips NULLs.' },
      { t: '100, 100', why: 'COUNT(column) does not count NULL values.' },
      { t: '88, 88', why: 'COUNT(*) counts rows regardless of NULLs in any column.' },
      { t: '100, 12', why: 'That would be the count of NULLs: COUNT(*) - COUNT(email).' },
    ],
  },
  {
    id: 'c4-q-approx',
    sub: 'aggregates',
    scenario: true,
    stem: 'A product manager wants daily unique visitors from a 5-billion-row clickstream table. A 1-2% error is acceptable, but the query must be fast and cheap. Which aggregate should you use?',
    options: [
      { t: 'approx_count_distinct(user_id)', ok: true, why: 'It estimates distinct counts with HyperLogLog++ using far less memory and time, with a small, bounded error.' },
      { t: 'COUNT(DISTINCT user_id)', why: 'Exact, but expensive at this scale. You said approximate is fine.' },
      { t: 'COUNT(user_id)', why: 'Counts non-NULL rows (every click), not unique users.' },
      { t: 'SUM(DISTINCT user_id)', why: 'Adds up ID values. That number is meaningless.' },
    ],
  },
  {
    id: 'c4-q-avg-null',
    sub: 'aggregates',
    stem: 'A column contains 10, NULL, 20, 30. What does AVG(column) return?',
    options: [
      { t: '20', ok: true, why: 'AVG ignores NULLs: (10 + 20 + 30) / 3 = 20.' },
      { t: '15', why: 'That treats NULL as 0 and divides by 4. AVG skips NULLs instead.' },
      { t: 'NULL', why: 'Only an all-NULL input gives NULL.' },
      { t: 'An error', why: 'Aggregates handle NULLs without errors.' },
    ],
  },
  {
    id: 'c4-q-groupby-all',
    sub: 'aggregates',
    stem: 'In Databricks SQL, what does GROUP BY ALL do?',
    options: [
      { t: 'Groups by every non-aggregated expression in the SELECT list', ok: true, why: 'It is shorthand that saves repeating the column list and prevents "missing from GROUP BY" mistakes.' },
      { t: 'Collapses the whole table into one group', why: 'That is what an aggregate with no GROUP BY does.' },
      { t: 'Groups by every column in the table, even ones not selected', why: 'It only uses the non-aggregated SELECT expressions.' },
      { t: 'Produces all grouping combinations, like CUBE', why: 'CUBE and ROLLUP produce subtotal combinations. GROUP BY ALL does not.' },
    ],
  },
  {
    id: 'c4-q-median',
    sub: 'aggregates',
    stem: 'Order amounts are heavily skewed by a few huge orders. Which expression gives the typical (middle) order amount?',
    options: [
      { t: 'percentile(amount, 0.5) (or median(amount))', ok: true, why: 'The 50th percentile is the median. Outliers barely move it.' },
      { t: 'AVG(amount)', why: 'The mean gets pulled up by the huge orders. That is exactly the skew problem.' },
      { t: 'MAX(amount) / 2', why: 'This depends only on the single largest value.' },
      { t: 'COUNT(amount) / 2', why: 'This is half the row count, not an amount.' },
    ],
  },

  // ---------------- Joins ----------------
  {
    id: 'c4-q-join-left',
    sub: 'joins',
    stem: 'You need every customer, including those with no orders (their order columns NULL). Which FROM clause is correct?',
    options: [
      { t: 'customers c LEFT JOIN orders o ON c.customer_id = o.customer_id', ok: true, why: 'LEFT JOIN keeps every row from the left table and pads unmatched rows with NULLs.' },
      { t: 'customers c INNER JOIN orders o ON c.customer_id = o.customer_id', why: 'INNER drops customers without orders.' },
      { t: 'customers c LEFT SEMI JOIN orders o ON c.customer_id = o.customer_id', why: 'SEMI keeps only customers that do have orders, and returns no order columns.' },
      { t: 'orders o LEFT JOIN customers c ON c.customer_id = o.customer_id', why: 'This keeps every order, not every customer. Customers with no orders vanish.' },
    ],
  },
  {
    id: 'c4-q-join-anti',
    sub: 'joins',
    scenario: true,
    stem: 'Merchandising wants products that have never been ordered, with product columns only. Which Databricks join is the most direct fit?',
    options: [
      { t: 'products LEFT ANTI JOIN orders', ok: true, why: 'ANTI returns left rows with no match on the right, with left columns only.' },
      { t: 'products LEFT SEMI JOIN orders', why: 'SEMI returns the opposite: products that have at least one match.' },
      { t: 'products INNER JOIN orders', why: 'INNER returns only matched rows, so ordered products.' },
      { t: 'products CROSS JOIN orders', why: 'CROSS produces every product-order pair. No match logic.' },
    ],
  },
  {
    id: 'c4-q-union-all',
    sub: 'joins',
    scenario: true,
    stem: 'You combine 2024 and 2025 transaction tables. Two different transactions can have identical column values, and both must be kept. You also want the fastest option. Which do you use?',
    options: [
      { t: 'UNION ALL', ok: true, why: 'UNION ALL appends every row and skips the de-duplication step.' },
      { t: 'UNION', why: 'UNION removes duplicate rows, which would delete legitimate transactions. It also costs extra work.' },
      { t: 'INTERSECT', why: 'INTERSECT returns only rows present in both tables.' },
      { t: 'FULL OUTER JOIN', why: 'A join matches rows side by side on a key. You want to stack rows.' },
    ],
  },
  {
    id: 'c4-q-join-explode',
    sub: 'joins',
    stem: 'orders has 1,000,000 rows. After INNER JOIN to customers on customer_id, the result has 1,040,000 rows. What is the most likely cause?',
    options: [
      { t: 'Some customer_id values appear more than once in customers, so matching orders get duplicated', ok: true, why: 'A join emits one row per matching pair. Duplicate keys on the right multiply rows.' },
      { t: 'INNER JOIN always adds NULL rows for unmatched customers', why: 'INNER never pads with NULLs. That is outer join behavior.' },
      { t: 'The warehouse cache returned stale rows', why: 'Caching does not change the logical result of a query.' },
      { t: 'INNER JOIN behaves like CROSS JOIN when the key has NULLs', why: 'NULL keys never match in an equi-join, so they produce fewer rows, not more.' },
    ],
  },
  {
    id: 'c4-q-join-full',
    sub: 'joins',
    scenario: true,
    stem: 'You reconcile billing and CRM accounts. You need every account from either system, with NULLs on the side where it is missing. Which join?',
    options: [
      { t: 'FULL OUTER JOIN', ok: true, why: 'FULL keeps unmatched rows from both sides, which is exactly what reconciliation needs.' },
      { t: 'LEFT JOIN', why: 'Accounts that exist only in the right table would be lost.' },
      { t: 'INNER JOIN', why: 'You would see only accounts present in both systems.' },
      { t: 'UNION', why: 'UNION stacks rows without aligning them side by side, so you cannot see what is missing where.' },
    ],
  },
  {
    id: 'c4-q-join-cross',
    sub: 'joins',
    stem: 'You need a scaffold with every store paired with every date in a calendar table, so that days with zero sales still appear. Which join produces this?',
    options: [
      { t: 'stores CROSS JOIN calendar', ok: true, why: 'A CROSS JOIN produces the Cartesian product: every store x every date. You can then LEFT JOIN sales onto it.' },
      { t: 'stores INNER JOIN calendar ON stores.id = calendar.id', why: 'There is no meaningful key between stores and dates.' },
      { t: 'stores LEFT SEMI JOIN calendar', why: 'SEMI returns store rows only. It does not combine them with dates.' },
      { t: 'stores UNION ALL calendar', why: 'UNION stacks rows of different shapes. It does not pair them.' },
    ],
  },

  // ---------------- Filtering & sorting ----------------
  {
    id: 'c4-q-having',
    sub: 'filtering',
    stem: 'You need categories whose total revenue exceeds 10,000. Where does the condition SUM(revenue) > 10000 go?',
    options: [
      { t: 'In a HAVING clause after GROUP BY', ok: true, why: 'HAVING filters groups after aggregation, so it can reference SUM().' },
      { t: 'In the WHERE clause', why: 'WHERE runs before grouping. Aggregates are not allowed there.' },
      { t: 'In the ORDER BY clause', why: 'ORDER BY sorts. It does not filter.' },
      { t: 'In a QUALIFY clause', why: 'QUALIFY filters on window-function results. HAVING is the clause for plain aggregates.' },
    ],
  },
  {
    id: 'c4-q-null-eq',
    sub: 'filtering',
    stem: 'WHERE region = NULL returns zero rows even though some regions are NULL. Why?',
    options: [
      { t: 'Comparing anything to NULL with = yields NULL (unknown), which WHERE treats as not true. Use IS NULL.', ok: true, why: 'SQL uses three-valued logic. IS NULL, or the NULL-safe <=> in Databricks, is how you test for NULL.' },
      { t: 'NULL values are stored in a separate file that WHERE cannot see', why: 'NULLs are ordinary column values. The problem is the comparison logic.' },
      { t: 'The column needs to be cast to STRING first', why: 'Casting does not change NULL semantics.' },
      { t: "It works only when written as region = 'NULL'", why: "That matches the literal text 'NULL', which is a different thing from a missing value." },
    ],
  },
  {
    id: 'c4-q-nulls-sort',
    sub: 'filtering',
    stem: 'You sort ORDER BY discount ASC and want rows with a NULL discount at the bottom. What should you write?',
    options: [
      { t: 'ORDER BY discount ASC NULLS LAST', ok: true, why: 'In Databricks, NULLs sort first by default in ascending order. NULLS LAST overrides that.' },
      { t: 'ORDER BY discount ASC (NULLs are always last)', why: 'In Databricks SQL, ascending order puts NULLs first by default.' },
      { t: 'ORDER BY discount DESC', why: 'This reverses the order of the values too. You only want to move the NULLs.' },
      { t: 'WHERE discount IS NOT NULL', why: 'This removes those rows instead of moving them to the bottom.' },
    ],
  },
  {
    id: 'c4-q-qualify',
    sub: 'filtering',
    stem: 'You need each customer\'s single largest order. Which Databricks SQL clause lets you filter directly on ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC) = 1?',
    options: [
      { t: 'QUALIFY', ok: true, why: 'QUALIFY filters on window-function results, just as HAVING filters on aggregates.' },
      { t: 'WHERE', why: 'Window functions are evaluated after WHERE, so you cannot reference them there.' },
      { t: 'HAVING', why: 'HAVING filters aggregate groups, not window-function results.' },
      { t: 'LIMIT 1', why: 'LIMIT 1 returns one row for the whole query, not one per customer.' },
    ],
  },

  // ---------------- Creating tables ----------------
  {
    id: 'c4-q-ext-drop',
    sub: 'tables',
    stem: "An external table was created with LOCATION 's3://acme-raw/events/'. Someone runs DROP TABLE on it. What happens?",
    options: [
      { t: 'The table metadata is removed from Unity Catalog, and the data files in S3 remain', ok: true, why: 'With external tables, you own the files. DROP removes only the metadata.' },
      { t: 'Both the metadata and the S3 files are deleted', why: 'That describes dropping a managed table, where Databricks owns the files.' },
      { t: 'Nothing happens until VACUUM runs', why: 'DROP takes effect right away on the metadata. VACUUM is about old Delta file versions.' },
      { t: 'The command fails because external tables cannot be dropped', why: 'External tables can be dropped; it just leaves the data in place.' },
    ],
  },
  {
    id: 'c4-q-ext-when',
    sub: 'tables',
    scenario: true,
    stem: 'Data must stay at an existing S3 path because other non-Databricks tools read those files directly. You still want to query it as a table in Unity Catalog. What do you create?',
    options: [
      { t: 'An external table with LOCATION pointing to that path', ok: true, why: 'External tables keep data at a path you control while Unity Catalog governs access.' },
      { t: 'A managed table', why: 'Managed tables live in Unity Catalog-managed storage. Other tools should not depend on that path.' },
      { t: 'A temporary view', why: 'Temp views are session-scoped and are not tables.' },
      { t: 'A materialized view', why: 'An MV would copy and precompute the data. It would not register the existing files in place.' },
    ],
  },
  {
    id: 'c4-q-managed-default',
    sub: 'tables',
    scenario: true,
    stem: 'You are building a new gold table that has no requirement for a specific storage path or outside readers. Which table type does Databricks generally recommend?',
    options: [
      { t: 'A managed table', ok: true, why: 'Docs: managed tables are the default and recommended table type, and Unity Catalog handles their storage and optimization. Managed tables let Unity Catalog handle storage and lifecycle, and they unlock automatic optimizations such as predictive optimization.' },
      { t: 'An external table', why: 'External tables are for when you need to control the path or share files with other tools.' },
      { t: 'A temporary view', why: 'Temp views are not persisted.' },
      { t: 'A CSV file in a volume', why: 'Files in a volume are not tables. You lose Delta features such as ACID transactions and time travel.' },
    ],
  },
  {
    id: 'c4-q-cor',
    sub: 'tables',
    stem: 'Why is CREATE OR REPLACE TABLE usually preferred over DROP TABLE followed by CREATE TABLE for rebuilding a Delta table?',
    options: [
      { t: 'It is atomic and keeps the table history, so readers never see a missing table and time travel still works', ok: true, why: 'Replace writes a new version of the same table. DROP + CREATE destroys the history and leaves a gap.' },
      { t: 'DROP + CREATE keeps history, while CREATE OR REPLACE erases it', why: 'This is backwards. Dropping removes the table along with its history.' },
      { t: 'They are identical in Delta Lake', why: 'They differ in atomicity, history, and the gap between statements.' },
      { t: 'CREATE OR REPLACE only works on views', why: 'Tables support CREATE OR REPLACE too.' },
    ],
  },
  {
    id: 'c4-q-ctas',
    sub: 'tables',
    stem: 'What does CREATE TABLE gold.sales_summary AS SELECT region, SUM(amount) AS revenue FROM silver.sales GROUP BY region do in Unity Catalog?',
    options: [
      { t: "Creates a managed Delta table whose schema comes from the query, and fills it with the query's results", ok: true, why: 'CTAS infers the schema and loads the data in one step. With no LOCATION, the table is managed.' },
      { t: 'Creates a view that recomputes on every read', why: 'That would be CREATE VIEW. CTAS stores data.' },
      { t: 'Creates an empty table; you must INSERT the results separately', why: 'CTAS populates the table as part of the same statement.' },
      { t: 'Creates an external table in the default S3 bucket', why: 'Without LOCATION, the table is managed, not external.' },
    ],
  },
  {
    id: 'c4-q-ext-prereq',
    sub: 'tables',
    stem: 'In Unity Catalog, what must exist before you can create an external table at s3://acme-raw/events/?',
    options: [
      { t: 'A storage credential and an external location covering that path, plus privileges on them (e.g., CREATE EXTERNAL TABLE)', ok: true, why: 'Unity Catalog governs access to cloud paths through storage credentials and external locations.' },
      { t: 'Nothing: any user can point a table at any S3 path', why: 'Unity Catalog deliberately prevents unmanaged path access.' },
      { t: 'A Delta Sharing recipient', why: 'Recipients are for sharing data out, not for reading your own storage.' },
      { t: 'A running all-purpose cluster with an instance profile', why: 'With Unity Catalog, access goes through storage credentials and external locations, not per-cluster profiles.' },
    ],
  },

  // ---------------- Time travel ----------------
  {
    id: 'c4-q-tt-syntax',
    sub: 'timetravel',
    stem: 'Which query reads the sales table as it was at midnight on 2025-06-01?',
    options: [
      { t: "SELECT * FROM sales TIMESTAMP AS OF '2025-06-01'", ok: true, why: 'TIMESTAMP AS OF reads the latest version committed at or before that time.' },
      { t: "SELECT * FROM sales WHERE _timestamp = '2025-06-01'", why: 'There is no hidden _timestamp column. Time travel is a table clause, not a filter.' },
      { t: "SELECT * FROM sales AT '2025-06-01'", why: 'Not valid syntax. Use TIMESTAMP AS OF or VERSION AS OF.' },
      { t: "SELECT * FROM HISTORY(sales, '2025-06-01')", why: 'No such function. DESCRIBE HISTORY lists versions, but it does not read old data.' },
    ],
  },
  {
    id: 'c4-q-tt-vacuum',
    sub: 'timetravel',
    stem: 'DESCRIBE HISTORY still lists version 3, but SELECT * FROM t VERSION AS OF 3 now fails with a missing-file error. What most likely happened?',
    options: [
      { t: 'VACUUM removed old data files that only version 3 (and earlier versions) referenced', ok: true, why: 'The transaction log still records version 3, but VACUUM deleted the files it needs. Time travel to it is broken.' },
      { t: 'Version 3 was rolled back by RESTORE', why: 'RESTORE adds a new version. It does not delete old ones or their files.' },
      { t: 'The warehouse cache is stale', why: 'Caching cannot make a version unreadable.' },
      { t: 'OPTIMIZE deleted version 3', why: 'OPTIMIZE rewrites files into a new version. The old files remain until VACUUM removes them.' },
    ],
  },
  {
    id: 'c4-q-tt-restore',
    sub: 'timetravel',
    scenario: true,
    stem: 'An hour ago a bad UPDATE overwrote every price in the products table. How do you recover?',
    options: [
      { t: 'Find the version before the UPDATE with DESCRIBE HISTORY, then RESTORE TABLE products TO VERSION AS OF <n>', ok: true, why: 'RESTORE brings back the old state as a new version, and the history keeps a record of the fix.' },
      { t: 'Run VACUUM products', why: 'VACUUM deletes old files, which are exactly the files you need to recover.' },
      { t: 'Run ROLLBACK', why: 'There is no transaction ROLLBACK for already-committed Delta writes. Use RESTORE.' },
      { t: 'DROP the table and re-ingest everything', why: 'Slow and risky, and it loses history. Time travel exists for exactly this case.' },
    ],
  },
  {
    id: 'c4-q-tt-retention',
    sub: 'timetravel',
    stem: 'By default, VACUUM keeps data files that are no longer referenced by the current version for how long before they can be deleted?',
    options: [
      { t: '7 days (168 hours)', ok: true, why: 'Predictive optimization can run VACUUM for you on managed tables. The default retention threshold is 7 days. Going lower requires overriding a safety check.' },
      { t: '0 hours', why: 'RETAIN 0 HOURS is possible only after disabling the retention safety check, and it is risky.' },
      { t: '30 days', why: '30 days is the default retention for the transaction log (history entries), not for data files.' },
      { t: 'Forever. VACUUM only removes uncommitted files', why: 'VACUUM removes unreferenced files older than the retention threshold.' },
    ],
  },
  {
    id: 'c4-q-tt-restore-version',
    sub: 'timetravel',
    stem: 'A table is at version 7. You run RESTORE TABLE t TO VERSION AS OF 4. What does DESCRIBE HISTORY show afterwards?',
    options: [
      { t: 'A new version 8 with operation RESTORE; versions 5-7 are still listed', ok: true, why: 'RESTORE is a new commit. Delta history is append-only.' },
      { t: 'Versions 5-7 are deleted and the table is back at version 4', why: 'History is never rewritten. RESTORE adds a version.' },
      { t: 'Only version 4 remains', why: 'All earlier history entries remain until log retention expires.' },
      { t: 'Nothing changes until you run VACUUM', why: 'RESTORE takes effect immediately as a new commit.' },
    ],
  },
]

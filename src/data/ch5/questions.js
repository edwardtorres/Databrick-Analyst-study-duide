// Chapter 5 question bank: Analyzing Queries. Original, scenario-heavy;
// every option explained. Performance features evolve, so details that may
// have changed since the Oct 2025 guide carry verify flags.

export const questions = [
  // ---------------- Photon ----------------
  {
    id: 'c5-q-photon-what',
    sub: 'photon',
    stem: 'What is Photon?',
    options: [
      { t: 'A native, vectorized query engine in Databricks that speeds up SQL and DataFrame workloads, compatible with Spark APIs', ok: true, why: 'Photon processes data in batches (vectorized) in native code, which speeds up scans, joins, aggregations and writes without code changes.' },
      { t: 'A file format that replaces Delta Lake', why: 'Photon is an engine. Delta Lake remains the table format it reads and writes.' },
      { t: 'A caching layer that stores query results', why: 'Caching is separate (result cache, disk cache). Photon executes queries.' },
      { t: 'A BI tool for building dashboards', why: 'Dashboards are AI/BI. Photon runs underneath the queries they send.' },
    ],
  },
  {
    id: 'c5-q-photon-udf',
    sub: 'photon',
    scenario: true,
    stem: "A query's profile shows Photon on every operator except one Python UDF, which takes 80% of the time. What is the best way to speed it up?",
    options: [
      { t: 'Replace the Python UDF with built-in SQL functions so the whole plan can run in Photon', ok: true, why: 'Photon doesn\'t support UDFs, so that step falls back to the standard engine. Row-at-a-time Python UDFs fall outside Photon\'s vectorized execution. Built-in expressions stay vectorized.' },
      { t: 'Turn Photon off so the plan is consistent', why: 'That slows every other operator too.' },
      { t: 'Add Liquid Clustering', why: 'Layout helps scans with filters. It doesn\'t make a UDF faster.' },
      { t: 'Run the query twice', why: 'Caching won\'t help a computation that changes with the data.' },
    ],
  },
  {
    id: 'c5-q-photon-benefit',
    sub: 'photon',
    stem: 'Which workload benefits LEAST from Photon?',
    options: [
      { t: 'A very short query on a tiny table, where start-up and planning dominate the run time', ok: true, why: 'Docs: queries that normally complete in under two seconds don\'t see meaningful improvement. Photon speeds up heavy data processing. When there is little data to process, there is little to gain.' },
      { t: 'Large aggregations over billions of rows', why: 'This is a prime Photon workload.' },
      { t: 'Joins between large Delta tables', why: 'Photon accelerates joins.' },
      { t: 'Writing large results to Delta tables', why: 'Photon accelerates Delta and Parquet writes.' },
    ],
  },
  {
    id: 'c5-q-photon-default',
    sub: 'photon',
    stem: 'An analyst asks how to enable Photon for queries on a SQL warehouse. What do you tell them?',
    options: [
      { t: 'Photon is on by default for SQL warehouses. There is nothing to change in the SQL.', ok: true, why: 'SQL warehouses use Photon by default. Queries don\'t need rewriting or hints.' },
      { t: 'Add the hint /*+ PHOTON */ to every query', why: 'There is no such hint. Photon is a property of the compute.' },
      { t: 'Convert tables to a Photon format', why: 'Photon reads ordinary Delta and Parquet.' },
      { t: 'Only notebooks can use Photon', why: 'SQL warehouses are where Photon is on by default.' },
    ],
  },

  // ---------------- Finding slow queries ----------------
  {
    id: 'c5-q-history-find',
    sub: 'profiling',
    scenario: true,
    stem: 'Users say "the dashboard was slow yesterday afternoon". Where do you start?',
    options: [
      { t: 'Query History, filtered to that warehouse and time window, sorted by duration, then open the slow query\'s profile', ok: true, why: 'Query History finds which queries ran and how long they took. The profile then explains why.' },
      { t: 'DESCRIBE HISTORY on every table', why: 'That shows data changes, not query performance.' },
      { t: 'Restart the warehouse and hope', why: 'You lose the evidence and fix nothing.' },
      { t: 'The Genie monitoring tab', why: 'That covers Genie conversations, not dashboard query timings.' },
    ],
  },
  {
    id: 'c5-q-profile-spill',
    sub: 'profiling',
    scenario: true,
    stem: 'The Query Profile shows an aggregate operator with "spilled to disk: 300 GB" taking most of the time. What does that tell you?',
    options: [
      { t: 'The operator ran out of memory and wrote intermediate data to disk. More memory per task (a larger warehouse size) or less data reaching it would help.', ok: true, why: 'Spill is a memory signal. Disk I/O is far slower than memory.' },
      { t: 'The table needs VACUUM', why: 'VACUUM removes old files. It has nothing to do with operator memory.' },
      { t: 'The result cache is full', why: 'The result cache doesn\'t cause spill.' },
      { t: 'Too many users are connected', why: 'Concurrency affects queueing, not one operator\'s spill.' },
    ],
  },
  {
    id: 'c5-q-profile-pruning',
    sub: 'profiling',
    scenario: true,
    stem: "A query filters WHERE customer_id = 'C1', but the profile shows the scan read 12,000 of 12,000 files. What is the most likely issue?",
    options: [
      { t: 'The data layout doesn\'t let files be skipped for customer_id, so no pruning happens', ok: true, why: 'With 0 files pruned on a selective filter, the table isn\'t organized (clustered) by that column.' },
      { t: 'The warehouse is too small', why: 'Size changes speed, not how many files are read.' },
      { t: 'Photon is disabled', why: 'Photon doesn\'t decide which files to skip.' },
      { t: 'The query needs ORDER BY', why: 'Sorting the output doesn\'t reduce what is scanned.' },
    ],
  },
  {
    id: 'c5-q-profile-skew',
    sub: 'profiling',
    scenario: true,
    stem: 'In a join stage, 199 tasks finish in about 5 seconds and 1 task runs for 20 minutes. What is this called?',
    options: [
      { t: 'Data skew: one key (or a few keys) holds far more rows than the rest', ok: true, why: 'Very uneven task times on the same stage are the signature of skew.' },
      { t: 'Spill', why: 'Spill is about memory. It can happen alongside skew, but uneven task times are the skew signal.' },
      { t: 'A cold result cache', why: 'Caching affects whole queries, not one task.' },
      { t: 'An exploding join', why: 'An exploding join makes output far larger than its inputs. Uneven task times point to skew.' },
    ],
  },
  {
    id: 'c5-q-insights',
    sub: 'profiling',
    stem: 'What do Query Insights (shown in the UI as performance insights in query history and the query profile) add on top of the raw metrics?',
    options: [
      { t: 'Highlighted problems with recommendations, such as data spill, data skew, exploding joins or small files, so you know where to look', ok: true, why: 'Each insight names the issue and a recommendation, ranked by estimated effect on task time.' },
      { t: 'They automatically rewrite your SQL', why: 'They point out issues. You can ask Genie Code (Optimize) to propose a rewrite, but you approve it.' },
      { t: 'They are a list of everyone who queried the table', why: 'That is audit and lineage information.' },
      { t: 'They schedule queries', why: 'Scheduling is done with jobs, alerts or dashboard schedules.' },
    ],
  },
  {
    id: 'c5-q-profile-explode',
    sub: 'profiling',
    scenario: true,
    stem: 'A join of 90 M orders with a 45 K-row table outputs 2.7 B rows, and totals are 30× too high. What is the root cause?',
    options: [
      { t: 'The join key is not unique on the smaller table, so each order matches many rows (an exploding join)', ok: true, why: 'Output far larger than input means many-to-many matches. Fix the join condition or deduplicate.' },
      { t: 'Photon double-counts rows', why: 'Photon returns the same results as non-Photon execution.' },
      { t: 'Spill duplicated the rows', why: 'Spill affects speed, not results.' },
      { t: 'The result cache is stale', why: 'A stale cache would return old numbers, not 30× numbers.' },
    ],
  },

  // ---------------- Delta for auditing ----------------
  {
    id: 'c5-q-audit-who',
    sub: 'audit',
    scenario: true,
    stem: 'Overnight the row count of gold.revenue dropped by 40%. How do you find which operation did it, when, and who ran it?',
    options: [
      { t: 'DESCRIBE HISTORY gold.revenue: each version shows the timestamp, user, operation (e.g., DELETE, MERGE, WRITE) and its metrics', ok: true, why: 'The Delta transaction log records every change with who, when, what and row-count metrics.' },
      { t: 'Query History for the dashboard', why: 'That shows reads, not who changed the table.' },
      { t: 'SHOW GRANTS', why: 'That shows permissions, not changes.' },
      { t: 'Look at the file sizes in cloud storage', why: 'That is indirect and gives no user or operation details.' },
    ],
  },
  {
    id: 'c5-q-audit-compare',
    sub: 'audit',
    stem: 'Which query lists the rows present in version 41 of gold.customers that are missing from the current version?',
    options: [
      { t: 'SELECT * FROM gold.customers VERSION AS OF 41 EXCEPT SELECT * FROM gold.customers', ok: true, why: 'Time travel plus EXCEPT compares versions row by row: old rows that no longer exist.' },
      { t: 'SELECT * FROM gold.customers WHERE version = 41', why: 'There is no version column. Use VERSION AS OF.' },
      { t: 'DESCRIBE HISTORY gold.customers VERSION 41', why: 'History shows metadata about changes, not the changed rows.' },
      { t: 'RESTORE TABLE gold.customers TO VERSION AS OF 41', why: 'That changes the table. You only wanted to inspect it.' },
    ],
  },
  {
    id: 'c5-q-audit-validate',
    sub: 'audit',
    scenario: true,
    stem: 'After a pipeline change, you want to confirm today\'s load didn\'t change historical totals. What is a solid check?',
    options: [
      { t: 'Compare aggregates (e.g., SUM by month) between the current version and the version before the load using VERSION AS OF', ok: true, why: 'Time travel gives you a before snapshot to reconcile against, with no copies needed.' },
      { t: 'Check that the warehouse ran without errors', why: 'Successful jobs can still write wrong data.' },
      { t: 'Count the files in the table', why: 'File counts change with OPTIMIZE and don\'t validate values.' },
      { t: 'Re-run the dashboard and eyeball it', why: 'This isn\'t a repeatable or precise check.' },
    ],
  },
  {
    id: 'c5-q-audit-metrics',
    sub: 'audit',
    scenario: true,
    stem: 'A MERGE ran last night. Where can you see how many rows it inserted, updated and deleted?',
    options: [
      { t: 'In the operationMetrics column of DESCRIBE HISTORY for that version', ok: true, why: 'For MERGE the keys are numTargetRowsInserted, numTargetRowsUpdated and numTargetRowsDeleted. Delta records per-operation metrics such as rows inserted, updated, deleted and files added.' },
      { t: 'Only in the job\'s console logs', why: 'Delta keeps these metrics with the table history.' },
      { t: 'In SHOW TBLPROPERTIES', why: 'Properties are configuration, not per-operation metrics.' },
      { t: 'Nowhere. MERGE doesn\'t record metrics.', why: 'It does, in the transaction log.' },
    ],
  },

  // ---------------- Caching ----------------
  {
    id: 'c5-q-cache-result',
    sub: 'caching',
    stem: 'When can a SQL warehouse return a query from the result cache?',
    options: [
      { t: 'When the same query runs again and the underlying tables haven\'t changed since the result was cached', ok: true, why: 'Cached results live up to 24 hours and are invalidated when the underlying tables are updated. Cached results are only valid for unchanged data. Any table change invalidates them.' },
      { t: 'Whenever the same table is queried, with any filter', why: 'A different query is a different result.' },
      { t: 'Always, even after new data is written', why: 'That would return stale results. Changes invalidate the cache.' },
      { t: 'Only if you run CACHE TABLE first', why: 'The result cache is automatic.' },
    ],
    verify: "Exactly what makes two queries \"the same\" for the result cache isn't spelled out in the docs.",
  },
  {
    id: 'c5-q-cache-disk',
    sub: 'caching',
    stem: 'How does the disk cache differ from the result cache?',
    options: [
      { t: 'The disk cache keeps copies of data files on the warehouse\'s local SSDs, so any query reading those files scans faster. The result cache stores final query results.', ok: true, why: 'Formerly called the Delta cache; it is cleared when the warehouse stops. The disk cache speeds up reading data. The result cache skips execution entirely for repeats.' },
      { t: 'They are the same thing with two names', why: 'They cache different things at different layers.' },
      { t: 'The disk cache stores results in the browser', why: 'It lives on the warehouse\'s local disks.' },
      { t: 'The disk cache only works for CSV files', why: 'It is designed for Parquet and Delta data.' },
    ],
  },
  {
    id: 'c5-q-cache-nondeterministic',
    sub: 'caching',
    scenario: true,
    stem: 'A tile shows SELECT COUNT(*), current_timestamp() FROM orders. It never seems to use the result cache. Why?',
    options: [
      { t: 'current_timestamp() is non-deterministic, so the result can\'t be reused', ok: true, why: 'Queries whose output depends on when they run aren\'t served from the result cache.' },
      { t: 'COUNT(*) is never cached', why: 'Aggregates can be cached. The timestamp is the problem.' },
      { t: 'The orders table is too large', why: 'Size doesn\'t prevent result caching.' },
      { t: 'Photon disables caching', why: 'Photon and caching work together.' },
    ],
  },
  {
    id: 'c5-q-cache-first-slow',
    sub: 'caching',
    scenario: true,
    stem: 'A dashboard is fast all day but slow for the first viewer after the 07:30 data load. What is the best fix?',
    options: [
      { t: 'Schedule a dashboard refresh right after the load so the cache is warm before people arrive', ok: true, why: 'The load invalidates cached results. A scheduled refresh does the slow run before any viewer.' },
      { t: 'Disable the result cache', why: 'Then every view is slow.' },
      { t: 'Partition the table by date', why: 'Layout doesn\'t change the invalidation that happens after a write.' },
      { t: 'Run VACUUM at 07:45', why: 'VACUUM cleans up files. It doesn\'t warm caches.' },
    ],
  },

  // ---------------- Liquid Clustering ----------------
  {
    id: 'c5-q-liquid-when',
    sub: 'liquid',
    scenario: true,
    stem: 'A 3 TB events table is almost always filtered by user_id (millions of distinct values) and sometimes by event_date. Which layout fits best?',
    options: [
      { t: 'Liquid Clustering: CLUSTER BY (user_id, event_date)', ok: true, why: 'Up to four keys are allowed, but one or two filter faster on smaller tables. CLUSTER BY AUTO is the alternative on UC managed tables. Liquid Clustering handles high-cardinality keys and multiple columns, and enables data skipping on the common filters.' },
      { t: 'PARTITIONED BY (user_id)', why: 'Millions of partitions means millions of tiny files.' },
      { t: 'No layout. Rely on a bigger warehouse.', why: 'Compute can\'t make up for scanning everything on every lookup.' },
      { t: 'ZORDER BY (user_id) once, never re-run', why: 'Z-ORDER has to be re-run as data arrives. Liquid Clustering is the recommended successor.' },
    ],
  },
  {
    id: 'c5-q-liquid-change',
    sub: 'liquid',
    stem: 'Query patterns changed: filters moved from region to customer_id. What is an advantage of Liquid Clustering here?',
    options: [
      { t: 'You can change the clustering keys with ALTER TABLE … CLUSTER BY without rewriting the table up front. New data and OPTIMIZE apply the new layout incrementally.', ok: true, why: 'Flexible keys are a key benefit over partitioning, which needs a full rewrite to change.' },
      { t: 'You must drop and recreate the table', why: 'Liquid Clustering keys can be changed in place.' },
      { t: 'Clustering keys can never change', why: 'Changing them is supported.' },
      { t: 'Liquid Clustering only supports a single column', why: 'Several clustering columns are allowed.' },
    ],
  },
  {
    id: 'c5-q-liquid-columns',
    sub: 'liquid',
    stem: 'How should you choose Liquid Clustering columns?',
    options: [
      { t: 'Pick the columns most often used in query filters (and joins), starting with the most selective', ok: true, why: 'Clustering pays off when queries filter on those columns, so files can be skipped.' },
      { t: 'Pick columns that are never filtered on, to spread data evenly', why: 'Then clustering never helps a query.' },
      { t: 'Always cluster by the primary key only', why: 'Choose by query patterns, not by key status.' },
      { t: 'Cluster by every column', why: 'Too many keys dilute the benefit. Keep a few.' },
    ],
  },
  {
    id: 'c5-q-liquid-vs',
    sub: 'liquid',
    stem: 'Which statement about Liquid Clustering, partitioning and Z-ORDER is correct?',
    options: [
      { t: 'Liquid Clustering is recommended for new tables and replaces both partitioning and Z-ORDER. It can\'t be combined with them on the same table.', ok: true, why: 'It is the modern layout option, and it is exclusive with PARTITIONED BY and ZORDER on a table.' },
      { t: 'You should always combine partitioning, Z-ORDER and Liquid Clustering', why: 'They aren\'t combined. Liquid Clustering replaces both.' },
      { t: 'Partitioning is always better for high-cardinality columns', why: 'High cardinality is exactly where partitioning breaks down.' },
      { t: 'Z-ORDER is applied automatically on every write', why: 'Z-ORDER runs as part of OPTIMIZE and must be re-run.' },
    ],
  },
  {
    id: 'c5-q-liquid-optimize',
    sub: 'liquid',
    stem: 'After setting CLUSTER BY on an existing table, how does existing data become clustered?',
    options: [
      { t: 'Run OPTIMIZE FULL once to recluster the existing data; after that, regular OPTIMIZE (manual, scheduled, or by predictive optimization) clusters new data incrementally', ok: true, why: 'Docs: enabling clustering does not apply it to previously written data. OPTIMIZE FULL reclusters everything when you first enable clustering or change keys; plain OPTIMIZE is incremental.' },
      { t: 'Instantly, the moment ALTER TABLE runs', why: 'ALTER sets the keys. OPTIMIZE does the clustering.' },
      { t: 'Only when VACUUM runs', why: 'VACUUM deletes unreferenced files. It doesn\'t cluster.' },
      { t: 'Never. Only new data can be clustered.', why: 'OPTIMIZE FULL reclusters existing data.' },
    ],
  },

  // ---------------- Fixing queries ----------------
  {
    id: 'c5-q-fix-not-in',
    sub: 'fixing',
    scenario: true,
    stem: 'WHERE customer_id NOT IN (SELECT customer_id FROM orders) suddenly returns no rows. Orders gained a row with a NULL customer_id. Why?',
    options: [
      { t: 'If the list contains NULL, "x NOT IN (…)" is never true, so every row is filtered out. Use NOT EXISTS.', ok: true, why: 'Three-valued logic: comparing with NULL is unknown, and NOT IN needs every comparison to be true.' },
      { t: 'NOT IN only works on numbers', why: 'Type isn\'t the problem. The NULL is.' },
      { t: 'The subquery is too large', why: 'Size doesn\'t make results empty.' },
      { t: 'The orders table needs OPTIMIZE', why: 'Layout doesn\'t change query semantics.' },
    ],
  },
  {
    id: 'c5-q-fix-double',
    sub: 'fixing',
    scenario: true,
    stem: 'Revenue doubled the day someone joined orders to a customer_addresses table (customers can have several addresses). What is the right fix?',
    options: [
      { t: 'Join to one row per customer (e.g., only the primary address) or aggregate before joining, so each order matches once', ok: true, why: 'A one-to-many join repeats each order per address, and SUM then double-counts.' },
      { t: 'Divide revenue by 2', why: 'Customers have different numbers of addresses, so this is wrong for most of them.' },
      { t: 'Use UNION instead of JOIN', why: 'UNION stacks rows. It doesn\'t attach address columns.' },
      { t: 'Increase the warehouse size', why: 'This is a correctness bug, not a performance issue.' },
    ],
  },
  {
    id: 'c5-q-fix-null-filter',
    sub: 'fixing',
    scenario: true,
    stem: "WHERE status <> 'cancelled' returns fewer rows than expected. Some orders have a NULL status. What is happening?",
    options: [
      { t: "NULL <> 'cancelled' evaluates to NULL (unknown), and WHERE drops it. Add OR status IS NULL if those rows should count.", ok: true, why: 'Every comparison with NULL is unknown, so you must handle NULL explicitly.' },
      { t: "<> is case-sensitive, so 'CANCELLED' rows were dropped", why: 'Possible elsewhere, but the missing rows here are the NULL-status ones.' },
      { t: 'The query hit a stale result cache', why: 'The cache returns the same answer the query would compute. The logic is wrong.' },
      { t: 'Databricks drops NULL rows on read', why: 'NULLs are stored and read normally.' },
    ],
  },
]

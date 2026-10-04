import { questions } from './questions.js'
import { challenges } from './challenges.js'

const card = (id, title, body, extra = {}) => ({ type: 'card', id: `c5-card-${id}`, title, body, ...extra })
const quiz = (...ids) => ({ type: 'quiz', ids })
const widget = (name) => ({ type: 'widget', name })
const challenge = (id) => ({ type: 'challenge', id })

const subsections = [
  {
    id: 'photon',
    title: 'Photon',
    emoji: '🚀',
    blocks: [
      card('photon-1', 'What Photon is', [
        '**Photon** is Databricks\' native, **vectorized** query engine. It processes data in batches instead of row by row and is compatible with Spark SQL and DataFrame APIs, so you don\'t change any code.',
        'It is the **default engine on all SQL warehouses** and on serverless compute; on classic clusters it is on by default too, but can be switched off.',
      ]),
      card('photon-2', 'What it speeds up, and what it doesn\'t', [
        '**Accelerates:** scans, filters, joins, aggregations, and writes to Delta/Parquet, i.e. the heavy lifting in analytics SQL.',
        '**Doesn\'t accelerate:** **UDFs** (Photon doesn\'t support UDFs at all), RDD/Dataset APIs, stateful streaming, unsupported expressions (they fall back to the standard engine), and queries that normally finish in **under about two seconds**.',
        'In a Query Profile, a non-Photon operator that dominates the time is a red flag. Rewrite it with built-in functions.',
      ]),
      quiz('c5-q-photon-what', 'c5-q-photon-udf', 'c5-q-photon-benefit', 'c5-q-photon-default'),
    ],
  },
  {
    id: 'profiling',
    title: 'Finding Slow Queries',
    emoji: '🔎',
    blocks: [
      card('prof-1', 'Query History → Query Profile', [
        '**Query History** lists queries run on your warehouses: text, user, warehouse, status, duration and start time. Filter it by user, date range, compute, duration, status or statement type to find the slow one.',
        'Open a query\'s **Query Profile** to see the **operator tree**: rows, time per operator, bytes read, **files read vs pruned**, **spill**, and whether Photon ran each step.',
        '**Query Insights** (in the UI: **performance insights**, summarized in the query details panel and listed on the profile\'s **Performance insights** tab) flag problems such as data spill, data skew, exploding joins, missing statistics or small files, each with a recommendation.',
      ]),
      card('prof-2', 'Read the signature', [
        '**0 files pruned** on a selective filter → layout problem (cluster by the filter column) or a function wrapped around the column.',
        '**Spilled to disk** → not enough memory per task (bigger size, or less data reaching the operator).',
        '**One task far slower than the rest** → data skew. **Join output ≫ inputs** → exploding join (non-unique key).',
        '**Non-Photon operator dominating** → UDF or unsupported expression.',
      ], { tip: 'Find the widest time bar first, then read that operator\'s metrics.' }),
      widget('query-profile-detective'),
      quiz('c5-q-history-find', 'c5-q-profile-spill', 'c5-q-profile-pruning', 'c5-q-profile-skew', 'c5-q-insights', 'c5-q-profile-explode'),
    ],
  },
  {
    id: 'audit',
    title: 'Delta for Auditing',
    emoji: '🧾',
    blocks: [
      card('audit-1', 'Who changed what, when', [
        '`DESCRIBE HISTORY table` lists every version: **timestamp**, **user**, **operation** (WRITE, MERGE, DELETE, UPDATE, OPTIMIZE…), parameters, and **operationMetrics** such as `numTargetRowsInserted`, `numTargetRowsUpdated` and `numTargetRowsDeleted` for MERGE. History is kept for 30 days by default (`logRetentionDuration`).',
        'Use it to answer "why did the numbers change?" before anything else.',
      ]),
      card('audit-2', 'Validate and compare versions', [
        'Compare versions with time travel: `SELECT … VERSION AS OF 41 EXCEPT SELECT … FROM t` finds rows that disappeared.',
        'Reconcile totals before and after a load (`SUM(...)` by month on both versions) to prove history didn\'t change.',
        'For workspace-wide auditing (who queried what), Databricks also offers **system tables**: audit logs are in `system.access.audit`.',
      ], {
        code: `DESCRIBE HISTORY gold.revenue;

SELECT month, SUM(amount) FROM gold.revenue VERSION AS OF 41 GROUP BY month
EXCEPT
SELECT month, SUM(amount) FROM gold.revenue GROUP BY month;`,
        }),
      quiz('c5-q-audit-who', 'c5-q-audit-compare', 'c5-q-audit-validate', 'c5-q-audit-metrics'),
    ],
  },
  {
    id: 'caching',
    title: 'Query History & Caching',
    emoji: '⚡',
    blocks: [
      card('cache-1', 'Two caches, two jobs', [
        '**Result cache:** stores a query\'s **final result**. The same query on **unchanged** tables returns instantly with no compute. Entries live up to **24 hours**; any update to the tables invalidates them, and functions like `current_timestamp()` invalidate them too.',
        'Two layers: a **local** in-memory cache per warehouse cluster (lost on stop/restart) and, on **serverless** only, a **remote result cache** shared by all warehouses in the workspace that survives restarts.',
        '**Disk cache** (formerly the *Delta cache*): keeps **data files** on the warehouse\'s local SSDs. Any query reading those files scans faster, even when its result isn\'t cached. It is cleared when the warehouse stops.',
      ]),
      card('cache-2', 'Reading the signs', [
        'Fast on repeat, slow right after a data load → the result cache was invalidated by the write. Schedule a refresh after the load to warm it.',
        'Query History and the profile show whether a run was served from cache, so you can tell a real regression from a cold cache.',
      ]),
      widget('cache-lab'),
      quiz('c5-q-cache-result', 'c5-q-cache-disk', 'c5-q-cache-nondeterministic', 'c5-q-cache-first-slow'),
    ],
  },
  {
    id: 'liquid',
    title: 'Liquid Clustering',
    emoji: '💧',
    blocks: [
      card('liquid-1', 'What and when', [
        '**Liquid Clustering** organizes a Delta table\'s data by chosen columns so queries filtering on them can **skip files**. Databricks recommends it for **all new tables**; it replaces partitioning and Z-ORDER. **`CLUSTER BY AUTO`** lets Databricks pick and change keys from your query patterns (Unity Catalog managed tables with predictive optimization).',
        'Good fits: large tables, filters on **high-cardinality** columns, several filter columns, or changing access patterns.',
      ], {
        code: `CREATE TABLE sales.orders (...) CLUSTER BY (customer_id, order_date);
ALTER TABLE sales.orders CLUSTER BY (customer_id);   -- change keys later
OPTIMIZE sales.orders FULL;                           -- recluster existing data after enabling/changing keys
OPTIMIZE sales.orders;                                -- routine: clusters new data incrementally`,
        }),
      card('liquid-2', 'Choosing keys & comparing options', [
        'Choose the columns used most in **filters** (and joins). You can specify **up to four** keys; on tables under ~10 TB, fewer keys (one or two) filter faster on a single column.',
        '**Partitioning:** too many partitions means tiny files, and changing it requires a rewrite. Existing partitioned tables can be converted with `ALTER TABLE … REPLACE PARTITIONED BY WITH CLUSTER BY`.',
        '**Z-ORDER:** co-locates data during OPTIMIZE but must be re-run. Liquid Clustering **can\'t be combined** with partitioning or Z-ORDER. Its keys can be redefined without rewriting existing data.',
      ]),
      quiz('c5-q-liquid-when', 'c5-q-liquid-change', 'c5-q-liquid-columns', 'c5-q-liquid-vs', 'c5-q-liquid-optimize'),
    ],
  },
  {
    id: 'fixing',
    title: 'Fixing Wrong Results',
    emoji: '🩺',
    blocks: [
      card('fix-1', 'Queries that run but lie', [
        'The dangerous bugs don\'t error. They return **plausible wrong numbers**.',
        '**Double counting:** joining to a one-to-many table repeats rows before SUM. **NULL logic:** `<>` and `NOT IN` silently drop or empty results. **Wrong grain:** averaging orders when you meant customers, or filtering rows when you meant totals.',
      ]),
      card('fix-2', 'A checklist', [
        'Check row counts before and after each join. If the count grew, a key wasn\'t unique.',
        'Ask what NULL should mean for every filter column.',
        'Name the grain ("one row per ___") before aggregating, and use `COUNT(DISTINCT …)` when counting the less detailed thing.',
        'Use `NOT EXISTS` (or `LEFT ANTI JOIN`) rather than `NOT IN` for nullable columns.',
      ]),
      challenge('c5-fix-double-count'),
      challenge('c5-fix-not-in-null'),
      challenge('c5-fix-null-filter'),
      challenge('c5-fix-agg-level'),
      challenge('c5-fix-count-distinct'),
      challenge('c5-fix-filter-level'),
      quiz('c5-q-fix-not-in', 'c5-q-fix-double', 'c5-q-fix-null-filter'),
    ],
  },
]

export default {
  intro: 'Find out why a query is slow, or wrong: Photon, Query History and the Query Profile, Delta history for auditing, caching, Liquid Clustering, and fixing queries that run but lie.',
  subsections,
  questions,
  challenges,
}

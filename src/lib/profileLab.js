// Query Profile Detective: mock query profiles (operator trees with rows,
// time, bytes, pruning and spill). The learner names the bottleneck, picks
// the fix, then sees the "after" profile. Numbers are illustrative, not
// measured; operator names are simplified versions of what the real
// Query Profile shows.

export const DIAGNOSES = {
  'no-pruning': 'Full scan: files are not being pruned',
  spill: 'Memory spill to disk',
  skew: 'Data skew: one task does most of the work',
  'exploding-join': 'Exploding join: output far larger than inputs',
  'non-sargable': 'Filter wraps the column in a function, so it can\'t prune',
  'cache-miss': 'Cold run: result cache invalidated by a data change',
  'no-photon': 'Operators fall back from Photon (row-at-a-time UDF)',
}

const op = (name, rows, timePct, extra = {}) => ({ name, rows, timePct, ...extra })

export const CASES = [
  {
    id: 'pruning',
    title: 'One customer\'s orders take 3 minutes',
    sql: `SELECT * FROM sales.orders\nWHERE customer_id = 'C-104233'`,
    context: 'orders: 2.1 TB, 12,000 files, rarely filtered by order_date, always filtered by customer_id.',
    before: {
      duration: '3m 12s',
      ops: [
        op('Result', '214', 1),
        op('Filter (customer_id = …)', '214', 6),
        op('Scan sales.orders', '8.9 B', 93, { bytes: '2.1 TB', files: '12,000 read / 0 pruned', hot: true }),
      ],
    },
    diagnosis: 'no-pruning',
    distractors: ['spill', 'skew', 'exploding-join'],
    fixes: [
      { id: 'cluster', text: 'ALTER TABLE sales.orders CLUSTER BY (customer_id), then OPTIMIZE', ok: true, why: 'Liquid Clustering co-locates rows by customer_id, so file statistics let the scan skip almost every file.' },
      { id: 'bigger', text: 'Move to a 4X-Large warehouse', why: 'More compute scans 2.1 TB faster, but it still scans 2.1 TB. Fix the layout instead.' },
      { id: 'partition', text: 'Partition the table by customer_id', why: 'Millions of customers would create millions of tiny partitions. High-cardinality columns are a job for clustering, not partitioning.' },
      { id: 'cache', text: 'Run it twice so it\'s cached', why: 'Only identical repeats benefit, and every customer lookup is different.' },
    ],
    after: {
      duration: '2.4s',
      ops: [
        op('Result', '214', 4),
        op('Filter (customer_id = …)', '214', 16),
        op('Scan sales.orders', '310 K', 80, { bytes: '61 MB', files: '9 read / 11,991 pruned' }),
      ],
    },
    explain: 'The profile showed 0 files pruned on a selective filter. Clustering by the filter column lets data skipping prune 99.9% of files.',
  },
  {
    id: 'spill',
    title: 'Nightly aggregation slowed from 4 to 25 minutes',
    sql: `SELECT store_id, sku, day, SUM(qty), SUM(revenue)\nFROM sales.line_items\nGROUP BY ALL`,
    context: 'Runs on a Small warehouse. The data volume tripled this quarter.',
    before: {
      duration: '25m 40s',
      ops: [
        op('Result', '1.9 B', 2),
        op('Hash Aggregate', '1.9 B', 81, { spill: '412 GB spilled to disk', hot: true }),
        op('Shuffle Exchange', '6.2 B', 11),
        op('Scan sales.line_items', '6.2 B', 6, { bytes: '780 GB', files: '4,100 read / 0 pruned (no filter)' }),
      ],
    },
    diagnosis: 'spill',
    distractors: ['no-pruning', 'skew', 'no-photon'],
    fixes: [
      { id: 'size', text: 'Increase the warehouse size (e.g., Small → Large)', ok: true, why: 'Spill means the operator ran out of memory. A larger size gives each task more memory, so the aggregation stays in memory.' },
      { id: 'clusters', text: 'Raise the maximum number of clusters', why: 'More clusters help concurrent queries. This single query still runs on one cluster.' },
      { id: 'zorder', text: 'Z-ORDER the table by store_id', why: 'There is no filter to skip files for, and layout doesn\'t shrink the aggregation state.' },
      { id: 'limit', text: 'Add LIMIT 1000', why: 'That changes the answer. The job needs every group.' },
    ],
    after: {
      duration: '5m 05s',
      ops: [
        op('Result', '1.9 B', 6),
        op('Hash Aggregate', '1.9 B', 55, { spill: 'no spill' }),
        op('Shuffle Exchange', '6.2 B', 21),
        op('Scan sales.line_items', '6.2 B', 18, { bytes: '780 GB' }),
      ],
    },
    explain: '"Spilled to disk" on the busiest operator is the signature. More memory per task (a bigger warehouse) removes the spill. Pre-aggregating or filtering earlier also helps.',
  },
  {
    id: 'skew',
    title: 'A join stalls at 99% for 20 minutes',
    sql: `SELECT e.*, d.device_type\nFROM web.events e\nJOIN web.devices d ON e.device_id = d.device_id`,
    context: '40% of events have device_id = \'UNKNOWN\' from a tracking bug.',
    before: {
      duration: '22m 10s',
      ops: [
        op('Result', '5.1 B', 1),
        op('Join (device_id)', '5.1 B', 90, { tasks: '199 tasks ≈ 4s each · 1 task 21m', hot: true }),
        op('Shuffle Exchange', '5.1 B', 6),
        op('Scan web.events', '5.1 B', 3, { bytes: '640 GB' }),
      ],
    },
    diagnosis: 'skew',
    distractors: ['spill', 'exploding-join', 'no-pruning'],
    fixes: [
      { id: 'handle', text: "Deal with the hot key: route device_id = 'UNKNOWN' on its own path (or salt / pre-aggregate it) so no single task gets 40% of the rows", ok: true, why: 'One key holds 40% of rows, so one task does 40% of the work. The DATA_SKEW insight recommends key salting or pre-aggregation; removing or splitting that key spreads the load.' },
      { id: 'clusters', text: 'Add more clusters to the warehouse', why: 'The bottleneck is a single task inside one query. More clusters don\'t split it.' },
      { id: 'cluster-by', text: 'CLUSTER BY (device_id) on events', why: 'Layout doesn\'t change how many rows share one join key.' },
      { id: 'rerun', text: 'Retry until it finishes faster', why: 'Skew is deterministic. The same task straggles every time.' },
    ],
    after: {
      duration: '3m 30s',
      ops: [
        op('Result', '5.1 B', 4),
        op('Join (device_id)', '3.1 B', 60, { tasks: '200 tasks ≈ 50s each' }),
        op('Union with UNKNOWN rows (no join)', '2.0 B', 10),
        op('Scan web.events', '5.1 B', 26, { bytes: '640 GB' }),
      ],
    },
    explain: 'Task times are wildly uneven: 199 tasks finish in seconds, one runs for 21 minutes. That is skew. Fix the hot key and the work evens out.',
  },
  {
    id: 'explode',
    title: 'Revenue report is slow and the totals look too big',
    sql: `SELECT o.order_id, o.amount, p.list_price\nFROM sales.orders o\nJOIN sales.price_history p ON o.product_id = p.product_id`,
    context: 'price_history keeps one row per product per price change (about 30 per product).',
    before: {
      duration: '14m 02s',
      ops: [
        op('Result', '2.7 B', 3),
        op('Join (product_id)', '2.7 B', 84, { note: 'output 30× larger than orders input', hot: true }),
        op('Scan sales.price_history', '45 K', 1),
        op('Scan sales.orders', '90 M', 12, { bytes: '28 GB' }),
      ],
    },
    diagnosis: 'exploding-join',
    distractors: ['skew', 'spill', 'cache-miss'],
    fixes: [
      { id: 'key', text: 'Join on the full key: product_id AND order_date between the price\'s valid_from and valid_to', ok: true, why: 'Each order then matches exactly one price row. Output rows equal order rows, and totals are correct again.' },
      { id: 'distinct', text: 'Add SELECT DISTINCT to the result', why: 'It hides the duplicates at great cost, and SUMs computed before the DISTINCT are still wrong.' },
      { id: 'size', text: 'Use a bigger warehouse', why: 'This makes a wrong answer arrive faster.' },
      { id: 'cluster', text: 'CLUSTER BY (product_id) on both tables', why: 'Layout can\'t fix a join that matches 30 rows per order.' },
    ],
    after: {
      duration: '41s',
      ops: [
        op('Result', '90 M', 10),
        op('Join (product_id, date in range)', '90 M', 55),
        op('Scan sales.price_history', '45 K', 1),
        op('Scan sales.orders', '90 M', 34, { bytes: '28 GB' }),
      ],
    },
    explain: 'Join output (2.7 B) dwarfed both inputs (90 M and 45 K), so each order matched about 30 rows. That is both a performance bug and a correctness bug.',
  },
  {
    id: 'function',
    title: 'Filtering one month scans the whole table',
    sql: `SELECT SUM(amount)\nFROM sales.orders\nWHERE date_format(order_ts, 'yyyy-MM') = '2025-09'`,
    context: 'orders is clustered by order_ts. Monthly reports used to take seconds.',
    before: {
      duration: '1m 48s',
      ops: [
        op('Result', '1', 1),
        op('Aggregate', '1', 3),
        op("Filter (date_format(order_ts, 'yyyy-MM') = '2025-09')", '7.6 M', 18),
        op('Scan sales.orders', '8.9 B', 78, { bytes: '2.1 TB', files: '12,000 read / 0 pruned', hot: true }),
      ],
    },
    diagnosis: 'non-sargable',
    distractors: ['no-pruning', 'spill', 'no-photon'],
    fixes: [
      { id: 'range', text: "Rewrite as a range on the raw column: order_ts >= '2025-09-01' AND order_ts < '2025-10-01'", ok: true, why: 'File min/max statistics are on order_ts itself. A plain range lets data skipping prune, but a function of the column can\'t use them.' },
      { id: 'recluster', text: 'Cluster by a new month column', why: 'This would work after a rebuild, but the table is already clustered by order_ts. The query just can\'t use it.' },
      { id: 'size', text: 'Bigger warehouse', why: 'Scanning 2.1 TB faster is still scanning 2.1 TB.' },
      { id: 'photon', text: 'Turn on Photon', why: 'Photon is already on for SQL warehouses, and it doesn\'t enable pruning.' },
    ],
    after: {
      duration: '3.1s',
      ops: [
        op('Result', '1', 4),
        op('Aggregate', '1', 12),
        op('Filter (order_ts in range)', '7.6 M', 24),
        op('Scan sales.orders', '7.9 M', 60, { bytes: '1.9 GB', files: '11 read / 11,989 pruned' }),
      ],
    },
    explain: 'The table layout was fine, but wrapping the column in a function hid it from data skipping. Filter on the raw column with a range.',
  },
  {
    id: 'cache',
    title: 'Dashboard is instant all day, but slow at 08:00',
    sql: `SELECT region, SUM(revenue)\nFROM gold.daily_sales\nGROUP BY region`,
    context: 'gold.daily_sales is overwritten by a job at 07:30. The query text never changes.',
    before: {
      duration: '38s (08:01) · 0.2s (08:05)',
      ops: [
        op('Result (08:01: result cache MISS)', '5', 2, { hot: true, note: 'table version changed at 07:30' }),
        op('Aggregate', '5', 30),
        op('Scan gold.daily_sales', '420 M', 68, { bytes: '19 GB', note: 'read from cloud storage' }),
      ],
    },
    diagnosis: 'cache-miss',
    distractors: ['no-pruning', 'spill', 'skew'],
    fixes: [
      { id: 'warm', text: 'Expected behaviour: the 07:30 write invalidated the cached result. Schedule the dashboard refresh right after the job so the first viewer gets a warm result.', ok: true, why: 'The result cache is only valid for unchanged data. A refresh after the load re-computes once, and viewers then hit the cache.' },
      { id: 'disable', text: 'Disable the result cache', why: 'Every run would then be slow.' },
      { id: 'vacuum', text: 'Run VACUUM before 08:00', why: 'VACUUM deletes old files. It doesn\'t warm caches.' },
      { id: 'partition', text: 'Partition daily_sales by region', why: 'This query needs every region, so there is nothing to skip.' },
    ],
    after: {
      duration: '0.2s (08:01, after a 07:45 scheduled refresh)',
      ops: [op('Result (result cache HIT)', '5', 100, { bytes: '0 B scanned' })],
    },
    explain: 'Fast later and slow first, right after a data change: that is a cache invalidation, not a regression. Warm the cache on a schedule after the load.',
  },
  {
    id: 'photon',
    title: 'Same data, one query 10× slower than its neighbours',
    sql: `SELECT clean_phone_py(phone) AS phone, COUNT(*)\nFROM crm.contacts\nGROUP BY 1`,
    context: 'clean_phone_py is a Python UDF that strips spaces and dashes.',
    before: {
      duration: '6m 15s',
      ops: [
        op('Result', '48 M', 2),
        op('Aggregate (Photon)', '48 M', 9),
        op('BatchEvalPython clean_phone_py (not Photon)', '310 M', 82, { note: 'Photon does not support UDFs', hot: true }),
        op('Scan crm.contacts (Photon)', '310 M', 7, { bytes: '22 GB' }),
      ],
    },
    diagnosis: 'no-photon',
    distractors: ['spill', 'skew', 'no-pruning'],
    fixes: [
      { id: 'builtin', text: "Replace the UDF with built-in SQL: regexp_replace(phone, '[^0-9]', '')", ok: true, why: 'Built-in functions run vectorized in Photon. The Python UDF forced a slow row-at-a-time path.' },
      { id: 'size', text: 'Bigger warehouse', why: 'This throws compute at the slow path instead of removing it.' },
      { id: 'cluster', text: 'CLUSTER BY (phone)', why: 'There is no filter to prune. Every row still goes through the UDF.' },
      { id: 'cache', text: 'Cache the table', why: 'Reading isn\'t the bottleneck. The UDF is.' },
    ],
    after: {
      duration: '24s',
      ops: [
        op('Result', '48 M', 6),
        op('Aggregate (Photon)', '48 M', 40),
        op('Project regexp_replace (Photon)', '310 M', 24),
        op('Scan crm.contacts (Photon)', '310 M', 30, { bytes: '22 GB' }),
      ],
    },
    explain: 'One operator outside Photon took 82% of the time. Built-in expressions keep the whole plan vectorized.',
  },
]

export const diagnosisOptions = (c) => [c.diagnosis, ...c.distractors]

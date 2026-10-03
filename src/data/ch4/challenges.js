// SQL Sandbox challenges for Chapter 4. Each one is graded by running the
// learner's SQL and the reference `solution` on fresh copies of the sample
// database and comparing result sets (column names don't matter).
//
// Fields:
//   kind: 'write' | 'fix' | 'ddl'
//   starter: SQL pre-filled in the editor (the broken query for 'fix')
//   broken: for 'fix' challenges, used to detect "you didn't change the logic"
//   brokenNote: what Databricks would actually do with the broken query
//   setup: extra SQL run before both queries
//   check: query run after the learner's SQL (for DDL challenges)
//   ordered: row order matters
//   mustMatch: [{ re, msg }] extra syntax requirements

export const challenges = [
  // ---------------- Aggregations ----------------
  {
    id: 'c4-sql-count-null',
    sub: 'aggregates',
    kind: 'write',
    difficulty: 1,
    title: 'COUNT(*) vs COUNT(column)',
    prompt:
      'Marketing wants two numbers in one row: the total number of customers, and how many customers have a non-NULL email.',
    hints: [
      'COUNT(*) counts rows. COUNT(col) skips NULLs in that column.',
      'SELECT COUNT(*), COUNT(email) FROM customers',
    ],
    solution: 'SELECT COUNT(*) AS total_customers, COUNT(email) AS with_email FROM customers',
    takeaway:
      "COUNT(email) ignores NULLs but still counts '' and 'N/A'. Spotting that difference is a data-quality skill the exam likes.",
  },
  {
    id: 'c4-sql-approx',
    sub: 'aggregates',
    kind: 'write',
    difficulty: 1,
    title: 'Distinct buyers per year',
    prompt:
      'For each order year, return the year and the number of distinct customer_ids who placed orders. Try approx_count_distinct, which is what you would use on a billion-row table.',
    hints: [
      'year(order_date) extracts the year.',
      'SELECT year(order_date) AS yr, approx_count_distinct(customer_id) FROM orders GROUP BY yr',
    ],
    solution:
      'SELECT year(order_date) AS order_year, approx_count_distinct(customer_id) AS buyers FROM orders GROUP BY year(order_date)',
    takeaway:
      'approx_count_distinct trades a small, bounded error for big speed and memory savings (HyperLogLog++). The sandbox computes it exactly; Databricks estimates it.',
  },
  {
    id: 'c4-sql-category-revenue',
    sub: 'aggregates',
    kind: 'write',
    difficulty: 2,
    title: 'Revenue by category',
    prompt:
      "Return category and total revenue (SUM of amount) for orders with status 'completed' and quantity > 0. Ignore orders where amount is NULL.",
    hints: [
      'Join orders to products on product_id to get the category.',
      'Put row-level filters (status, quantity, amount IS NOT NULL) in WHERE, then GROUP BY p.category.',
    ],
    solution: `SELECT p.category, SUM(o.amount) AS revenue
FROM orders o
JOIN products p ON o.product_id = p.product_id
WHERE o.status = 'completed' AND o.quantity > 0 AND o.amount IS NOT NULL
GROUP BY p.category`,
    takeaway: 'Filter rows before aggregating with WHERE. That is cheaper and clearer than cleaning up afterwards.',
  },
  {
    id: 'c4-sql-avg-region',
    sub: 'aggregates',
    kind: 'write',
    difficulty: 2,
    title: 'Average order value by region',
    prompt:
      "For completed orders, return region_name and the average order amount rounded to 2 decimals. Only include orders whose customer maps to a real region (inner joins are fine).",
    hints: [
      'orders → customers on customer_id, customers → regions on region_id.',
      'ROUND(AVG(o.amount), 2). AVG ignores NULL amounts automatically.',
    ],
    solution: `SELECT r.region_name, ROUND(AVG(o.amount), 2) AS avg_amount
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN regions r ON c.region_id = r.region_id
WHERE o.status = 'completed'
GROUP BY r.region_name`,
    takeaway: 'AVG skips NULLs: it divides by the count of non-NULL values, not by the row count.',
  },
  {
    id: 'c4-sql-stats',
    sub: 'aggregates',
    kind: 'write',
    difficulty: 2,
    title: 'Summary stats',
    prompt:
      "For completed orders with quantity > 0, return one row with: MIN(amount), MAX(amount), ROUND(AVG(amount), 2), and the median amount (median() or percentile(amount, 0.5)).",
    hints: ['Databricks has median(col) and percentile(col, 0.5). Both work here.'],
    solution: `SELECT MIN(amount), MAX(amount), ROUND(AVG(amount), 2), median(amount)
FROM orders
WHERE status = 'completed' AND quantity > 0`,
    takeaway: 'When there are outliers, compare the mean with the median. A big gap means the data is skewed.',
  },
  {
    id: 'c4-fix-groupby',
    sub: 'aggregates',
    kind: 'fix',
    difficulty: 1,
    title: 'Fix it: missing GROUP BY',
    prompt: 'This query is supposed to count customers per tier. Fix it.',
    starter: 'SELECT tier, COUNT(*) AS customers\nFROM customers',
    broken: 'SELECT tier, COUNT(*) AS customers FROM customers',
    brokenNote:
      'Still one row. In Databricks this query fails with [MISSING_AGGREGATION]: a non-aggregated column (tier) must appear in GROUP BY. SQLite quietly returns one row instead.',
    hints: ['Every non-aggregated column in SELECT must be in GROUP BY.', 'Add GROUP BY tier (or GROUP BY ALL in Databricks).'],
    solution: 'SELECT tier, COUNT(*) AS customers FROM customers GROUP BY tier',
    takeaway: 'Databricks also supports GROUP BY ALL, which groups by every non-aggregated SELECT column.',
  },

  // ---------------- Joins & set operations ----------------
  {
    id: 'c4-sql-no-orders',
    sub: 'joins',
    kind: 'write',
    difficulty: 2,
    title: 'Customers who never ordered',
    prompt: 'Return the name of every customer who has never placed an order.',
    hints: [
      'LEFT JOIN customers to orders, then keep rows where the order side IS NULL.',
      'In Databricks you could also write: customers c LEFT ANTI JOIN orders o ON ...',
    ],
    solution: `SELECT c.name
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL`,
    takeaway: 'LEFT JOIN + IS NULL is the classic anti-join. Databricks SQL also has LEFT ANTI JOIN built in.',
  },
  {
    id: 'c4-sql-orphans',
    sub: 'joins',
    kind: 'write',
    difficulty: 2,
    title: 'Orphan orders',
    prompt: 'Find orders whose customer_id does not exist in customers. Return order_id and customer_id.',
    hints: ['Same anti-join pattern, but start from orders.', 'NOT EXISTS (SELECT 1 FROM customers c WHERE c.customer_id = o.customer_id) also works.'],
    solution: `SELECT o.order_id, o.customer_id
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id
WHERE c.customer_id IS NULL`,
    takeaway: 'An INNER JOIN would silently drop orphan rows. Check for them before you trust revenue totals.',
  },
  {
    id: 'c4-sql-region-counts',
    sub: 'joins',
    kind: 'write',
    difficulty: 2,
    title: 'Every region, even empty ones',
    prompt: 'Return every region_name with its number of customers. Regions with no customers must show 0.',
    hints: ['Start FROM regions and LEFT JOIN customers.', 'COUNT(c.customer_id) counts 0 for unmatched regions. COUNT(*) would count 1.'],
    solution: `SELECT r.region_name, COUNT(c.customer_id) AS customers
FROM regions r
LEFT JOIN customers c ON c.region_id = r.region_id
GROUP BY r.region_name`,
    takeaway: 'After an outer join, COUNT(*) counts the NULL-padded row. Count a column from the optional side instead.',
  },
  {
    id: 'c4-sql-union',
    sub: 'joins',
    kind: 'write',
    difficulty: 2,
    title: 'UNION the mailing lists',
    prompt:
      "Build one de-duplicated list of emails from customers (only emails containing '@') and newsletter_signups. One column, no duplicates.",
    setup: `CREATE TABLE newsletter_signups (email TEXT);
INSERT INTO newsletter_signups VALUES ('ava@example.com'), ('zoe@example.com'), ('ben@example.com'), ('max@example.com'), ('zoe@example.com');`,
    hints: ["Filter customers with email LIKE '%@%'.", 'UNION removes duplicates. UNION ALL keeps them.'],
    solution: `SELECT email FROM customers WHERE email LIKE '%@%'
UNION
SELECT email FROM newsletter_signups`,
    takeaway: 'Use UNION ALL when duplicates are real (or impossible): it skips the de-dup step and runs faster.',
  },
  {
    id: 'c4-fix-jointype',
    sub: 'joins',
    kind: 'fix',
    difficulty: 2,
    title: 'Fix it: wrong join type',
    prompt: 'The product report must list every product, including ones never ordered (show 0 units). Fix the query.',
    starter: `SELECT p.product_name, SUM(o.quantity) AS units
FROM products p
JOIN orders o ON p.product_id = o.product_id
GROUP BY p.product_name`,
    broken: `SELECT p.product_name, SUM(o.quantity) AS units FROM products p JOIN orders o ON p.product_id = o.product_id GROUP BY p.product_name`,
    brokenNote: 'Same result as the broken query: the never-ordered product is still missing. Which join keeps every product?',
    hints: ['LEFT JOIN keeps every row from the left table (products).', 'SUM over no rows is NULL. Wrap it: COALESCE(SUM(o.quantity), 0).'],
    solution: `SELECT p.product_name, COALESCE(SUM(o.quantity), 0) AS units
FROM products p
LEFT JOIN orders o ON p.product_id = o.product_id
GROUP BY p.product_name`,
    takeaway: 'A "list every X" requirement usually means X is the left side of a LEFT JOIN.',
  },
  {
    id: 'c4-fix-where-outer',
    sub: 'joins',
    kind: 'fix',
    difficulty: 3,
    title: 'Fix it: the WHERE that ate my LEFT JOIN',
    prompt:
      "Show every region with its number of completed orders (0 if none). The query below uses LEFT JOINs, but a region still goes missing. Fix it.",
    starter: `SELECT r.region_name, COUNT(o.order_id) AS completed_orders
FROM regions r
LEFT JOIN customers c ON c.region_id = r.region_id
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.status = 'completed'
GROUP BY r.region_name`,
    broken: `SELECT r.region_name, COUNT(o.order_id) AS completed_orders FROM regions r LEFT JOIN customers c ON c.region_id = r.region_id LEFT JOIN orders o ON o.customer_id = c.customer_id WHERE o.status = 'completed' GROUP BY r.region_name`,
    brokenNote:
      "International is still missing. A WHERE filter on the right-hand table removes the NULL-padded rows, so the LEFT JOIN behaves like an INNER JOIN.",
    hints: ['Move the status condition into the ON clause of the orders join.', "LEFT JOIN orders o ON o.customer_id = c.customer_id AND o.status = 'completed'"],
    solution: `SELECT r.region_name, COUNT(o.order_id) AS completed_orders
FROM regions r
LEFT JOIN customers c ON c.region_id = r.region_id
LEFT JOIN orders o ON o.customer_id = c.customer_id AND o.status = 'completed'
GROUP BY r.region_name`,
    takeaway: 'Conditions on the optional side of an outer join belong in ON. In WHERE they turn it into an inner join.',
  },

  // ---------------- Filtering & sorting ----------------
  {
    id: 'c4-sql-filter-sort',
    sub: 'filtering',
    kind: 'write',
    difficulty: 1,
    title: 'Big 2025 orders, newest first',
    prompt:
      "Return order_id, order_date, amount for completed orders placed in 2025 with amount > 50, newest first.",
    ordered: true,
    hints: ["Dates are ISO strings here, so order_date >= '2025-01-01' works.", 'ORDER BY order_date DESC'],
    solution: `SELECT order_id, order_date, amount
FROM orders
WHERE status = 'completed' AND order_date >= '2025-01-01' AND amount > 50
ORDER BY order_date DESC`,
    takeaway: 'Without ORDER BY, row order is never guaranteed, in Databricks or anywhere else.',
  },
  {
    id: 'c4-sql-top3',
    sub: 'filtering',
    kind: 'write',
    difficulty: 2,
    title: 'Top 3 products by units',
    prompt:
      'Among completed orders with quantity > 0, return product_name and total units for the top 3 products. Sort by units descending, breaking ties by product_name ascending.',
    ordered: true,
    hints: ['GROUP BY product, SUM(quantity), ORDER BY units DESC, product_name ASC, then LIMIT 3.'],
    solution: `SELECT p.product_name, SUM(o.quantity) AS units
FROM orders o
JOIN products p ON o.product_id = p.product_id
WHERE o.status = 'completed' AND o.quantity > 0
GROUP BY p.product_name
ORDER BY units DESC, p.product_name ASC
LIMIT 3`,
    takeaway: 'Ties make "top N" results unstable. Add a tie-breaker column so the result is the same every run.',
  },
  {
    id: 'c4-fix-having',
    sub: 'filtering',
    kind: 'fix',
    difficulty: 1,
    title: 'Fix it: WHERE vs HAVING',
    prompt: 'Return customers whose total order amount is over 150. Fix the query.',
    starter: `SELECT customer_id, SUM(amount) AS total
FROM orders
WHERE SUM(amount) > 150
GROUP BY customer_id`,
    hints: ['WHERE filters rows before grouping; it cannot see SUM().', 'Move the condition into HAVING after GROUP BY.'],
    solution: `SELECT customer_id, SUM(amount) AS total
FROM orders
GROUP BY customer_id
HAVING SUM(amount) > 150`,
    takeaway: 'WHERE filters rows before grouping. HAVING filters groups after. QUALIFY filters window-function results.',
  },
  {
    id: 'c4-fix-null-compare',
    sub: 'filtering',
    kind: 'fix',
    difficulty: 1,
    title: 'Fix it: = NULL',
    prompt: 'Find the names of customers whose email is NULL. The query returns nothing. Why?',
    starter: 'SELECT name\nFROM customers\nWHERE email = NULL',
    broken: 'SELECT name FROM customers WHERE email = NULL',
    brokenNote: 'Still empty. Any comparison with NULL using = yields NULL (not true), so no row passes the filter.',
    hints: ['Use IS NULL. (Databricks also has the NULL-safe equality operator <=>.)'],
    solution: 'SELECT name FROM customers WHERE email IS NULL',
    takeaway: "email = NULL is never true. Use IS NULL / IS NOT NULL. In Databricks, a <=> b treats two NULLs as equal.",
  },

  // ---------------- Creating tables ----------------
  {
    id: 'c4-ddl-ctas',
    sub: 'tables',
    kind: 'ddl',
    difficulty: 2,
    title: 'CTAS a gold table',
    prompt:
      "Create a table named gold_category_sales with columns category and revenue (SUM of amount for completed orders), using CREATE TABLE ... AS SELECT.",
    check: 'SELECT * FROM gold_category_sales',
    hints: ['CREATE TABLE gold_category_sales AS SELECT p.category, SUM(o.amount) AS revenue FROM ... GROUP BY p.category'],
    mustMatch: [{ re: /CREATE\s+(OR\s+REPLACE\s+)?TABLE\s+(\w+\.\w+\.)?gold_category_sales\s+(USING\s+DELTA\s+)?AS\b/i, msg: 'Use CREATE TABLE gold_category_sales AS SELECT ...' }],
    solution: `CREATE TABLE gold_category_sales AS
SELECT p.category, SUM(o.amount) AS revenue
FROM orders o JOIN products p ON o.product_id = p.product_id
WHERE o.status = 'completed'
GROUP BY p.category`,
    takeaway: 'With no LOCATION clause, a CTAS in Unity Catalog creates a managed Delta table.',
  },
  {
    id: 'c4-ddl-replace',
    sub: 'tables',
    kind: 'ddl',
    difficulty: 2,
    title: 'Refresh with CREATE OR REPLACE',
    prompt:
      'gold_tier_counts already exists with stale numbers. Rebuild it (tier, customers) in a single atomic statement. Do not DROP it first.',
    setup: `CREATE TABLE gold_tier_counts AS SELECT 'gold' AS tier, 999 AS customers;`,
    check: 'SELECT * FROM gold_tier_counts',
    mustMatch: [
      { re: /CREATE\s+OR\s+REPLACE\s+TABLE/i, msg: 'Use CREATE OR REPLACE TABLE so the swap is atomic and history is kept.' },
      { re: /^(?![\s\S]*\bDROP\s+TABLE)/i, msg: 'No DROP TABLE: dropping loses the Delta history and leaves a window where the table is missing.' },
    ],
    hints: ['CREATE OR REPLACE TABLE gold_tier_counts AS SELECT tier, COUNT(*) AS customers FROM customers GROUP BY tier'],
    solution: `CREATE OR REPLACE TABLE gold_tier_counts AS
SELECT tier, COUNT(*) AS customers FROM customers GROUP BY tier`,
    takeaway:
      'In Delta, CREATE OR REPLACE writes a new version of the same table: history and time travel survive, and readers never see a missing table.',
  },
  {
    id: 'c4-ddl-view',
    sub: 'views',
    kind: 'ddl',
    difficulty: 1,
    title: 'A reusable clean view',
    prompt:
      "Create (or replace) a view named v_contactable with customer_id, name, email for customers whose email contains '@'.",
    check: 'SELECT * FROM v_contactable',
    mustMatch: [{ re: /CREATE\s+(OR\s+REPLACE\s+)?VIEW/i, msg: 'Create a VIEW (not a table).' }],
    hints: ["CREATE OR REPLACE VIEW v_contactable AS SELECT customer_id, name, email FROM customers WHERE email LIKE '%@%'"],
    solution: `CREATE OR REPLACE VIEW v_contactable AS
SELECT customer_id, name, email FROM customers WHERE email LIKE '%@%'`,
    takeaway: 'A view stores only the query. Every read re-runs it against the current data, so there is nothing to refresh.',
  },
]

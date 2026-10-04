// Chapter 5 "fix the query" challenges. Unlike Chapter 4's, every broken
// query here RUNS and returns plausible numbers. They are just wrong. The
// learner has to spot why (double counting, NULL logic, wrong aggregation
// level) and fix it. Graded by comparing result sets with the reference.

export const challenges = [
  {
    id: 'c5-fix-double-count',
    sub: 'fixing',
    kind: 'fix',
    difficulty: 3,
    title: 'Fix it: revenue inflated by a join',
    prompt:
      "Report completed revenue by product category, but only for products that have at least one tag in product_tags. The numbers below are too high. Fix the query so each order is counted once.",
    setup: `CREATE TABLE product_tags (product_id INTEGER, tag TEXT);
INSERT INTO product_tags VALUES (101, 'bestseller'), (101, 'winter'), (101, 'apparel-core'), (104, 'bestseller'), (104, 'travel'), (106, 'summer');`,
    starter: `SELECT p.category, SUM(o.amount) AS revenue
FROM orders o
JOIN products p ON o.product_id = p.product_id
JOIN product_tags t ON t.product_id = o.product_id
WHERE o.status = 'completed'
GROUP BY p.category`,
    broken: `SELECT p.category, SUM(o.amount) AS revenue FROM orders o JOIN products p ON o.product_id = p.product_id JOIN product_tags t ON t.product_id = o.product_id WHERE o.status = 'completed' GROUP BY p.category`,
    brokenNote:
      'Still inflated. Product 101 has 3 tags, so joining product_tags repeats each of its orders 3 times before SUM. Test for "has a tag" without multiplying rows.',
    hints: ['A join to a one-to-many table repeats the left rows once per match.', 'Use WHERE EXISTS (SELECT 1 FROM product_tags t WHERE t.product_id = o.product_id) instead of the join.'],
    solution: `SELECT p.category, SUM(o.amount) AS revenue
FROM orders o
JOIN products p ON o.product_id = p.product_id
WHERE o.status = 'completed'
  AND EXISTS (SELECT 1 FROM product_tags t WHERE t.product_id = o.product_id)
GROUP BY p.category`,
    takeaway: 'Before trusting a SUM after a join, check the join key is unique on the other side. If it isn\'t, use EXISTS or join to DISTINCT keys.',
  },
  {
    id: 'c5-fix-not-in-null',
    sub: 'fixing',
    kind: 'fix',
    difficulty: 3,
    title: 'Fix it: NOT IN returns nothing',
    prompt:
      'List the names of customers who have never placed an order. A data-entry glitch added an order with a NULL customer_id, and now the query returns no rows at all.',
    setup: `INSERT INTO orders VALUES (1029, NULL, 102, 1, '2025-06-10', 'completed', 12.50);`,
    starter: `SELECT name
FROM customers
WHERE customer_id NOT IN (SELECT customer_id FROM orders)`,
    broken: 'SELECT name FROM customers WHERE customer_id NOT IN (SELECT customer_id FROM orders)',
    brokenNote:
      'Still empty. x NOT IN (…, NULL) is never true: comparing with NULL gives "unknown", so every row is filtered out. Use NOT EXISTS, or exclude NULLs from the subquery.',
    hints: ['NOT IN against a list containing NULL can never be TRUE.', 'NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id) ignores the NULL safely.'],
    solution: `SELECT c.name
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)`,
    takeaway: 'Prefer NOT EXISTS (or LEFT ANTI JOIN in Databricks) over NOT IN when the subquery column can contain NULL.',
  },
  {
    id: 'c5-fix-null-filter',
    sub: 'fixing',
    kind: 'fix',
    difficulty: 2,
    title: 'Fix it: <> drops the NULLs',
    prompt:
      'Count orders that were NOT cancelled. Orders with an unknown (NULL) status must count as not cancelled. The query undercounts.',
    starter: `SELECT COUNT(*) AS not_cancelled
FROM orders
WHERE status <> 'cancelled'`,
    broken: "SELECT COUNT(*) AS not_cancelled FROM orders WHERE status <> 'cancelled'",
    brokenNote: "Still one short. NULL <> 'cancelled' is unknown, not true, so the NULL-status order is filtered out.",
    hints: ["Add OR status IS NULL, or compare COALESCE(status, '') <> 'cancelled'."],
    solution: `SELECT COUNT(*) AS not_cancelled
FROM orders
WHERE status IS NULL OR status <> 'cancelled'`,
    takeaway: 'Every comparison operator (=, <>, <, >) returns NULL when either side is NULL, and WHERE keeps only TRUE rows. Decide explicitly what NULL should mean.',
  },
  {
    id: 'c5-fix-agg-level',
    sub: 'fixing',
    kind: 'fix',
    difficulty: 3,
    title: 'Fix it: average at the wrong level',
    prompt:
      'Finance wants the average completed revenue PER CUSTOMER (each buying customer\'s total, averaged). The query returns the average per ORDER instead. Return one number, rounded to 2 decimals.',
    starter: `SELECT ROUND(AVG(amount), 2) AS avg_revenue_per_customer
FROM orders
WHERE status = 'completed'`,
    broken: "SELECT ROUND(AVG(amount), 2) AS avg_revenue_per_customer FROM orders WHERE status = 'completed'",
    brokenNote: 'Still the per-order average. First total each customer\'s revenue (GROUP BY customer_id), then average those totals.',
    hints: ['Aggregate twice: an inner query with SUM(amount) per customer_id, an outer AVG over the totals.'],
    solution: `SELECT ROUND(AVG(total), 2) AS avg_revenue_per_customer
FROM (
  SELECT customer_id, SUM(amount) AS total
  FROM orders
  WHERE status = 'completed'
  GROUP BY customer_id
)`,
    takeaway: 'Name the grain before you average. "Per customer" means aggregate to one row per customer first.',
  },
  {
    id: 'c5-fix-count-distinct',
    sub: 'fixing',
    kind: 'fix',
    difficulty: 2,
    title: 'Fix it: counting orders, not customers',
    prompt: 'For each region_name, return the number of distinct customers who placed at least one completed order. The query counts orders instead.',
    starter: `SELECT r.region_name, COUNT(o.order_id) AS buyers
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN regions r ON c.region_id = r.region_id
WHERE o.status = 'completed'
GROUP BY r.region_name`,
    broken: `SELECT r.region_name, COUNT(o.order_id) AS buyers FROM orders o JOIN customers c ON o.customer_id = c.customer_id JOIN regions r ON c.region_id = r.region_id WHERE o.status = 'completed' GROUP BY r.region_name`,
    brokenNote: 'Still counting orders: a customer with 3 orders counts 3 times. Count each customer once.',
    hints: ['COUNT(DISTINCT c.customer_id)'],
    solution: `SELECT r.region_name, COUNT(DISTINCT c.customer_id) AS buyers
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN regions r ON c.region_id = r.region_id
WHERE o.status = 'completed'
GROUP BY r.region_name`,
    takeaway: 'After a join, the row grain is the most detailed table (orders). Use COUNT(DISTINCT key) to count the less detailed thing.',
  },
  {
    id: 'c5-fix-filter-level',
    sub: 'fixing',
    kind: 'fix',
    difficulty: 2,
    title: 'Fix it: filtering orders instead of totals',
    prompt:
      'Return customer_id and total completed revenue for customers whose TOTAL completed revenue is over 150. The query filters individual orders over 150 instead.',
    starter: `SELECT customer_id, SUM(amount) AS total
FROM orders
WHERE status = 'completed' AND amount > 150
GROUP BY customer_id`,
    broken: "SELECT customer_id, SUM(amount) AS total FROM orders WHERE status = 'completed' AND amount > 150 GROUP BY customer_id",
    brokenNote: 'Still filtering single orders. The condition belongs on the SUM, after grouping.',
    hints: ['Keep status in WHERE (a row filter), move the amount condition to HAVING SUM(amount) > 150.'],
    solution: `SELECT customer_id, SUM(amount) AS total
FROM orders
WHERE status = 'completed'
GROUP BY customer_id
HAVING SUM(amount) > 150`,
    takeaway: 'WHERE filters rows before aggregation and HAVING filters groups after. Using the wrong one doesn\'t error. It quietly answers a different question.',
  },
]

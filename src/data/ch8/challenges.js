// Chapter 8 modeling challenges. The sample database is a small star with a
// snowflaked branch: orders is the fact table (grain: one order line),
// customers and products are dimensions, and regions hangs off customers.

export const challenges = [
  {
    id: 'c8-star-two-dims',
    sub: 'modeling-sql',
    kind: 'write',
    difficulty: 2,
    title: 'Fact joined to two dimensions',
    prompt:
      "Treat orders as the fact table and customers and products as dimensions. For completed orders, return product category, customer tier and total units sold (SUM of quantity).",
    hints: ['Join the fact to each dimension on its key: orders.product_id = products.product_id, orders.customer_id = customers.customer_id.', 'GROUP BY p.category, c.tier'],
    solution: `SELECT p.category, c.tier, SUM(o.quantity) AS units
FROM orders o
JOIN products p ON o.product_id = p.product_id
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.status = 'completed'
GROUP BY p.category, c.tier`,
    takeaway: 'A star schema query is always the same shape: filter and group by dimension attributes, aggregate fact measures.',
  },
  {
    id: 'c8-snowflake-region',
    sub: 'modeling-sql',
    kind: 'write',
    difficulty: 2,
    title: 'One more hop: the snowflaked region',
    prompt:
      'Region names aren\'t in customers: customers holds a region_id that points to regions (a snowflaked dimension). Return completed revenue (SUM of amount) by region_name, for orders whose customer has a valid region.',
    hints: ['orders → customers on customer_id, then customers → regions on region_id.', 'Inner joins drop orders whose customer or region is missing, which is what this question asks for.'],
    solution: `SELECT r.region_name, SUM(o.amount) AS revenue
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN regions r ON c.region_id = r.region_id
WHERE o.status = 'completed'
GROUP BY r.region_name`,
    takeaway: 'Snowflaking normalizes a dimension (customer → region) and costs one extra join in every query that needs the region.',
  },
  {
    id: 'c8-grain-monthly',
    sub: 'modeling-sql',
    kind: 'write',
    difficulty: 2,
    title: 'A gold aggregate at a declared grain',
    prompt:
      'Build the query behind a gold table whose grain is one row per order year, order month and product category (completed orders only). Return year, month, category, the number of orders and revenue.',
    hints: ['year(order_date) and month(order_date) work here and in Databricks.', 'GROUP BY every column that defines the grain: year, month, category.'],
    solution: `SELECT year(o.order_date) AS order_year, month(o.order_date) AS order_month, p.category,
       COUNT(*) AS orders, SUM(o.amount) AS revenue
FROM orders o
JOIN products p ON o.product_id = p.product_id
WHERE o.status = 'completed'
GROUP BY year(o.order_date), month(o.order_date), p.category`,
    takeaway: 'State the grain first ("one row per month and category"), then GROUP BY exactly those columns. Anything else in the SELECT must be aggregated.',
  },
  {
    id: 'c8-fix-fanout',
    sub: 'modeling-sql',
    kind: 'fix',
    difficulty: 3,
    title: 'Fix it: targets multiplied by a fan-out',
    prompt:
      'category_targets holds one revenue target per category. The report compares completed revenue with the target, but the targets come out far too big. Fix the query so each category\'s target appears once.',
    setup: `CREATE TABLE category_targets (category TEXT, target REAL);
INSERT INTO category_targets VALUES ('Apparel', 500), ('Accessories', 300), ('Bags', 400), ('Home', 50), ('Stationery', 20);`,
    starter: `SELECT p.category, SUM(o.amount) AS revenue, SUM(t.target) AS target
FROM orders o
JOIN products p ON o.product_id = p.product_id
JOIN category_targets t ON t.category = p.category
WHERE o.status = 'completed'
GROUP BY p.category`,
    broken: "SELECT p.category, SUM(o.amount) AS revenue, SUM(t.target) AS target FROM orders o JOIN products p ON o.product_id = p.product_id JOIN category_targets t ON t.category = p.category WHERE o.status = 'completed' GROUP BY p.category",
    brokenNote:
      'Still too big. The target is at category grain but the fact is at order-line grain, so the join repeats each target on every order line and SUM adds it up once per order. Aggregate revenue to category first, then join the targets (or take MAX(t.target)).',
    hints: ['Joining a coarse table (one row per category) to a fine one (one row per order line) repeats the coarse values.', 'WITH rev AS (SELECT p.category, SUM(o.amount) AS revenue FROM … GROUP BY p.category) SELECT rev.category, rev.revenue, t.target FROM rev JOIN category_targets t ON t.category = rev.category'],
    solution: `WITH rev AS (
  SELECT p.category, SUM(o.amount) AS revenue
  FROM orders o
  JOIN products p ON o.product_id = p.product_id
  WHERE o.status = 'completed'
  GROUP BY p.category
)
SELECT rev.category, rev.revenue, t.target
FROM rev
JOIN category_targets t ON t.category = rev.category`,
    takeaway: 'Only combine facts and other measures at the same grain. Aggregate the finer side to the coarser grain first, then join.',
  },
  {
    id: 'c8-unknown-member',
    sub: 'modeling-sql',
    kind: 'write',
    difficulty: 3,
    title: 'Keep every fact row: the "Unknown" member',
    prompt:
      "Finance wants completed revenue by region that adds up to total completed revenue. Some orders point to a customer that doesn't exist or whose region is missing. Count those under 'Unknown'.",
    hints: ['LEFT JOIN from the fact to customers, and LEFT JOIN again to regions, so no order is dropped.', "COALESCE(r.region_name, 'Unknown')"],
    solution: `SELECT COALESCE(r.region_name, 'Unknown') AS region, SUM(o.amount) AS revenue
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id
LEFT JOIN regions r ON c.region_id = r.region_id
WHERE o.status = 'completed'
GROUP BY COALESCE(r.region_name, 'Unknown')`,
    takeaway: "Dimensional models often add an 'Unknown' row to each dimension so facts with missing keys still join and totals reconcile.",
  },
]

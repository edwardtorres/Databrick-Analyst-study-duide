// Chapter 2 data-cleaning challenges. They use the dirty rows already in the
// sample database (NULL/'N/A'/'' emails, a missing and an unknown region,
// negative and zero quantities, NULL and 'UNKNOWN' statuses) plus a few
// small raw tables created in `setup`, so the shared tables stay unchanged.

const RAW_SIGNUPS = `CREATE TABLE raw_signups (signup_id INTEGER, email TEXT, tier TEXT, signed_up TEXT);
INSERT INTO raw_signups VALUES
  (1, 'ava@example.com',    'gold',    '2025-01-03'),
  (2, ' AVA@example.com',   'Gold ',   '2025-03-10'),
  (3, 'ben@example.com',    'SILVER',  '2025-01-20'),
  (4, 'ben@example.com ',   'silver',  '2025-02-01'),
  (5, 'Ben@Example.com',    ' Platinum', '2025-04-15'),
  (6, 'chloe@example.com',  'bronze',  '2025-02-11'),
  (7, 'diego@example.com',  'BRONZE',  '2025-03-02');`

export const challenges = [
  {
    id: 'c2-clean-email',
    sub: 'cleaning',
    kind: 'write',
    difficulty: 2,
    title: 'One placeholder for missing emails',
    prompt:
      "Build a contact list: every customer's name and email. Emails that are NULL, empty ('') or the text 'N/A' all mean \"missing\" and should show as 'unknown'.",
    hints: [
      "NULLIF(x, '') turns '' into NULL. COALESCE(x, 'unknown') replaces NULL.",
      "Or use CASE WHEN email IS NULL OR email IN ('', 'N/A') THEN 'unknown' ELSE email END.",
    ],
    solution: `SELECT name,
  CASE WHEN email IS NULL OR TRIM(email) IN ('', 'N/A') THEN 'unknown' ELSE email END AS email
FROM customers`,
    takeaway: "COALESCE only catches NULL. Junk placeholders like '' and 'N/A' need NULLIF or a CASE first, or they look like real values.",
  },
  {
    id: 'c2-fix-usable-email',
    sub: 'cleaning',
    kind: 'fix',
    difficulty: 2,
    title: 'Fix it: counting junk as real emails',
    prompt: 'Marketing asks how many customers have a usable email. The query below says 10, which is too many. Fix it.',
    starter: `SELECT COUNT(email) AS usable_emails
FROM customers`,
    broken: 'SELECT COUNT(email) AS usable_emails FROM customers',
    brokenNote: "Still 10. COUNT(email) skips NULLs but counts '' and 'N/A', which aren't emails. Filter those out (or count a CASE that returns NULL for them).",
    hints: ["Add WHERE email IS NOT NULL AND TRIM(email) NOT IN ('', 'N/A')", "Or COUNT(NULLIF(NULLIF(TRIM(email), ''), 'N/A'))"],
    solution: `SELECT COUNT(*) AS usable_emails
FROM customers
WHERE email IS NOT NULL AND TRIM(email) NOT IN ('', 'N/A')`,
    takeaway: 'Profile a column before you count it: GROUP BY the raw value once and you will spot placeholder junk fast.',
  },
  {
    id: 'c2-clean-valid-orders',
    sub: 'cleaning',
    kind: 'write',
    difficulty: 2,
    title: 'Filter out invalid orders',
    prompt:
      "Count valid orders per status. A valid order has quantity greater than 0 and a status of 'completed', 'returned' or 'cancelled'. Return status and the count.",
    hints: ["WHERE quantity > 0 AND status IN ('completed', 'returned', 'cancelled')", 'IN never matches NULL, so the NULL-status order drops out too.'],
    solution: `SELECT status, COUNT(*) AS orders
FROM orders
WHERE quantity > 0 AND status IN ('completed', 'returned', 'cancelled')
GROUP BY status`,
    takeaway: 'Write validity rules as positive filters (what a good row looks like). That way new kinds of junk, like a status of UNKNOWN, are excluded by default.',
  },
  {
    id: 'c2-clean-quality-flag',
    sub: 'cleaning',
    kind: 'write',
    difficulty: 3,
    title: 'Label rows with CASE',
    prompt:
      "Instead of deleting bad orders, label them. For each order give a quality flag: 'bad_quantity' if quantity <= 0, else 'missing_amount' if amount IS NULL, else 'bad_status' if status is NULL or not one of completed/returned/cancelled, else 'ok'. Return each flag and how many orders have it.",
    hints: [
      'CASE checks its WHEN branches top to bottom and stops at the first true one.',
      "CASE WHEN quantity <= 0 THEN 'bad_quantity' WHEN amount IS NULL THEN 'missing_amount' WHEN status IS NULL OR status NOT IN (…) THEN 'bad_status' ELSE 'ok' END",
    ],
    solution: `SELECT flag, COUNT(*) AS orders
FROM (
  SELECT CASE
      WHEN quantity <= 0 THEN 'bad_quantity'
      WHEN amount IS NULL THEN 'missing_amount'
      WHEN status IS NULL OR status NOT IN ('completed', 'returned', 'cancelled') THEN 'bad_status'
      ELSE 'ok'
    END AS flag
  FROM orders
) t
GROUP BY flag`,
    takeaway: "Order of WHEN branches matters: order 1026 has quantity 0 AND status 'UNKNOWN', and only its first matching rule counts. Also note status NOT IN (…) is NULL for a NULL status, which is why IS NULL is checked separately.",
  },
  {
    id: 'c2-clean-standardize',
    sub: 'cleaning',
    kind: 'write',
    difficulty: 2,
    title: 'Standardize messy text',
    prompt:
      "raw_signups.tier was typed by hand: 'Gold ', 'SILVER', ' Platinum'… Count signups per tier after standardizing it to lowercase with no surrounding spaces. Return tier and the count.",
    setup: RAW_SIGNUPS,
    hints: ['LOWER(TRIM(tier))', 'GROUP BY the cleaned expression, not the raw column.'],
    solution: `SELECT LOWER(TRIM(tier)) AS tier, COUNT(*) AS signups
FROM raw_signups
GROUP BY LOWER(TRIM(tier))`,
    takeaway: 'Grouping on a raw text column splits one category into many. Clean the value first, then group by the cleaned expression.',
  },
  {
    id: 'c2-clean-distinct',
    sub: 'cleaning',
    kind: 'write',
    difficulty: 1,
    title: 'Remove exact duplicates',
    prompt:
      'The nightly CRM load ran twice for some customers, so customers_load has repeated identical rows. Return customer_id and name with each customer once.',
    setup: `CREATE TABLE customers_load AS SELECT customer_id, name, tier FROM customers WHERE customer_id <= 6;
INSERT INTO customers_load SELECT customer_id, name, tier FROM customers WHERE customer_id IN (2, 4, 6);`,
    hints: ['SELECT DISTINCT customer_id, name FROM customers_load'],
    solution: 'SELECT DISTINCT customer_id, name FROM customers_load',
    takeaway: 'DISTINCT removes rows that are identical in every selected column. It can\'t choose between two different versions of the same customer; that needs ROW_NUMBER.',
  },
  {
    id: 'c2-clean-latest',
    sub: 'cleaning',
    kind: 'write',
    difficulty: 3,
    title: 'Keep the latest row per person',
    prompt:
      'raw_signups has the same person several times with different casing and spaces in the email. Keep only the most recent signup (latest signed_up) per person. Return the cleaned email (lowercase, trimmed) and the cleaned tier from that latest row.',
    setup: RAW_SIGNUPS,
    hints: [
      'ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(email)) ORDER BY signed_up DESC) numbers each person\'s rows newest first.',
      'Wrap it in a subquery and keep WHERE rn = 1. (In Databricks you can write QUALIFY rn = 1 instead.)',
    ],
    solution: `SELECT email, tier
FROM (
  SELECT LOWER(TRIM(email)) AS email,
         LOWER(TRIM(tier)) AS tier,
         ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(email)) ORDER BY signed_up DESC) AS rn
  FROM raw_signups
) t
WHERE rn = 1`,
    takeaway: 'Dedupe on a normalized key. ROW_NUMBER keeps exactly one row per key even when the duplicates differ, which DISTINCT can\'t do.',
  },
  {
    id: 'c2-fix-cast',
    sub: 'cleaning',
    kind: 'fix',
    difficulty: 3,
    title: 'Fix it: casting text with junk in it',
    prompt:
      "raw_payments.amount_text came from a spreadsheet: '$12.50', ' 30.00 ', 'n/a', ''. Total the real payments. The query below returns 37, which is too low.",
    setup: `CREATE TABLE raw_payments (payment_id INTEGER, amount_text TEXT);
INSERT INTO raw_payments VALUES (1, '$12.50'), (2, '7'), (3, ' 30.00 '), (4, 'n/a'), (5, ''), (6, '$0.50');`,
    starter: `SELECT SUM(CAST(amount_text AS DOUBLE)) AS total
FROM raw_payments`,
    broken: 'SELECT SUM(CAST(amount_text AS DOUBLE)) AS total FROM raw_payments',
    brokenNote:
      "Still too low. '$12.50' can't be cast as is. This sandbox quietly turns it into 0; Databricks with ANSI mode raises a cast error instead. Strip the '$' and spaces first, and skip values that aren't numbers.",
    hints: ["CAST(REPLACE(TRIM(amount_text), '$', '') AS DOUBLE), and exclude 'n/a' and '' in WHERE.", "Or let try_cast(REPLACE(amount_text, '$', '') AS DOUBLE) turn the junk into NULL, which SUM ignores. It works here and in Databricks."],
    solution: `SELECT SUM(CAST(REPLACE(TRIM(amount_text), '$', '') AS DOUBLE)) AS total
FROM raw_payments
WHERE TRIM(amount_text) NOT IN ('', 'n/a')`,
    takeaway: "Clean text before casting it. In Databricks, try_cast is the safe version: it returns NULL instead of failing on a value like 'n/a'.",
  },
  {
    id: 'c2-clean-region',
    sub: 'cleaning',
    kind: 'write',
    difficulty: 2,
    title: 'Fill missing lookups',
    prompt:
      "Count customers per region name. Customers with no region, or a region_id that isn't in regions, should be counted under 'Unassigned' instead of disappearing.",
    hints: ['A LEFT JOIN keeps customers that have no matching region; their region_name is NULL.', "COALESCE(r.region_name, 'Unassigned')"],
    solution: `SELECT COALESCE(r.region_name, 'Unassigned') AS region, COUNT(*) AS customers
FROM customers c
LEFT JOIN regions r ON c.region_id = r.region_id
GROUP BY COALESCE(r.region_name, 'Unassigned')`,
    takeaway: 'An INNER JOIN silently drops rows with bad keys. LEFT JOIN + COALESCE keeps them visible so someone can fix the source.',
  },
]

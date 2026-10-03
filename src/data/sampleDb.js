// Sample retail dataset used by the SQL Sandbox and every SQL challenge.
// It is intentionally a little dirty: NULL and junk emails, a customer in a
// region that doesn't exist, an order from a customer that doesn't exist,
// negative/zero quantities, NULL and unexpected status values, a product
// with no price, a product nobody ordered, and a region with no customers.

export const SAMPLE_TABLES = ['regions', 'customers', 'products', 'orders']

// Shown in the schema browser as if the tables lived in Unity Catalog.
export const SAMPLE_NAMESPACE = 'quest.retail'

export const SEED_SQL = `
CREATE TABLE regions (
  region_id   INTEGER PRIMARY KEY,
  region_name TEXT
);
INSERT INTO regions VALUES
  (1, 'West'), (2, 'East'), (3, 'Central'), (4, 'South'), (5, 'International');

CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  name        TEXT,
  email       TEXT,
  region_id   INTEGER,
  tier        TEXT,
  signup_date TEXT
);
INSERT INTO customers VALUES
  (1,  'Ava Patel',    'ava@example.com',   1,    'gold',    '2023-02-11'),
  (2,  'Ben Okafor',   'ben@example.com',   2,    'silver',  '2023-05-03'),
  (3,  'Chloe Kim',    NULL,                1,    'bronze',  '2023-07-19'),
  (4,  'Diego Ruiz',   'diego@example.com', 3,    'gold',    '2023-09-01'),
  (5,  'Emma Rossi',   'N/A',               2,    'silver',  '2024-01-15'),
  (6,  'Farah Haddad', 'farah@example.com', NULL, 'bronze',  '2024-03-22'),
  (7,  'Gus Novak',    'gus@example.com',   4,    'silver',  '2024-06-30'),
  (8,  'Hana Sato',    '',                  3,    'bronze',  '2024-08-08'),
  (9,  'Ivan Petrov',  'ivan@example.com',  2,    'gold',    '2024-11-11'),
  (10, 'Jade Moreau',  NULL,                4,    'unknown', '2025-01-05'),
  (11, 'Kofi Mensah',  'kofi@example.com',  1,    'silver',  '2025-02-14'),
  (12, 'Lena Fischer', 'lena@example.com',  99,   'bronze',  '2025-03-01');

CREATE TABLE products (
  product_id   INTEGER PRIMARY KEY,
  product_name TEXT,
  category     TEXT,
  price        REAL
);
INSERT INTO products VALUES
  (101, 'Lakehouse Hoodie',    'Apparel',     45.00),
  (102, 'Delta Mug',           'Accessories', 12.50),
  (103, 'Spark Sticker Pack',  'Accessories',  4.00),
  (104, 'Photon Backpack',     'Bags',        80.00),
  (105, 'Unity Water Bottle',  'Accessories', 18.00),
  (106, 'Medallion Tee',       'Apparel',     25.00),
  (107, 'Genie Lamp',          'Home',        NULL),
  (108, 'Catalog Notebook',    'Stationery',   9.00);

CREATE TABLE orders (
  order_id    INTEGER PRIMARY KEY,
  customer_id INTEGER,
  product_id  INTEGER,
  quantity    INTEGER,
  order_date  TEXT,
  status      TEXT,
  amount      REAL
);
INSERT INTO orders VALUES
  (1001, 1,  101,  2, '2024-01-15', 'completed',  90.00),
  (1002, 1,  102,  4, '2024-02-03', 'completed',  50.00),
  (1003, 2,  104,  1, '2024-02-20', 'completed',  80.00),
  (1004, 3,  103, 10, '2024-03-05', 'completed',  40.00),
  (1005, 4,  101,  1, '2024-04-12', 'returned',   45.00),
  (1006, 4,  106,  3, '2024-05-18', 'completed',  75.00),
  (1007, 5,  105,  2, '2024-06-02', 'completed',  36.00),
  (1008, 2,  102,  1, '2024-07-09', 'cancelled',  12.50),
  (1009, 6,  104,  2, '2024-08-21', 'completed', 160.00),
  (1010, 7,  106,  1, '2024-09-14', 'completed',  25.00),
  (1011, 9,  101,  3, '2024-10-30', 'completed', 135.00),
  (1012, 9,  104,  1, '2024-11-25', 'completed',  80.00),
  (1013, 1,  105,  1, '2024-12-12', 'completed',  18.00),
  (1014, 42, 102,  2, '2024-12-20', 'completed',  25.00),
  (1015, 2,  106,  2, '2025-01-08', 'completed',  50.00),
  (1016, 3,  101,  1, '2025-01-19', 'completed',  45.00),
  (1017, 4,  103, -1, '2025-02-02', 'completed',  -4.00),
  (1018, 5,  104,  1, '2025-02-14', 'completed',  80.00),
  (1019, 7,  102,  6, '2025-02-27', 'completed',  75.00),
  (1020, 8,  105,  3, '2025-03-03', NULL,         54.00),
  (1021, 9,  106,  2, '2025-03-15', 'completed',  50.00),
  (1022, 1,  104,  1, '2025-03-28', 'completed',  80.00),
  (1023, 6,  101,  2, '2025-04-04', 'completed',  90.00),
  (1024, 12, 103,  5, '2025-04-19', 'completed',  20.00),
  (1025, 2,  107,  1, '2025-05-01', 'completed',  NULL),
  (1026, 7,  104,  0, '2025-05-11', 'UNKNOWN',     0.00),
  (1027, 9,  102,  2, '2025-05-23', 'completed',  25.00),
  (1028, 4,  105,  1, '2025-06-06', 'returned',   18.00);
`

export const SCHEMA_DOC = {
  regions: [
    ['region_id', 'INT'],
    ['region_name', 'STRING'],
  ],
  customers: [
    ['customer_id', 'INT'],
    ['name', 'STRING'],
    ['email', 'STRING'],
    ['region_id', 'INT'],
    ['tier', 'STRING'],
    ['signup_date', 'DATE (as text)'],
  ],
  products: [
    ['product_id', 'INT'],
    ['product_name', 'STRING'],
    ['category', 'STRING'],
    ['price', 'DOUBLE'],
  ],
  orders: [
    ['order_id', 'INT'],
    ['customer_id', 'INT'],
    ['product_id', 'INT'],
    ['quantity', 'INT'],
    ['order_date', 'DATE (as text)'],
    ['status', 'STRING'],
    ['amount', 'DOUBLE'],
  ],
}

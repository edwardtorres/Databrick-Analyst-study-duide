// Chapter 8 question bank: Data Modeling. Original, scenario-heavy; every
// option explained.

export const questions = [
  // ---------------- Star schema ----------------
  {
    id: 'c8-q-fact-vs-dim',
    sub: 'star',
    stem: 'In a star schema, what is the difference between a fact table and a dimension table?',
    options: [
      { t: 'Facts hold measurable events (measures plus keys to dimensions); dimensions hold descriptive attributes used to filter and group', ok: true, why: 'Facts answer "how much/how many". Dimensions answer "by what": who, what, where, when.' },
      { t: 'Facts are small lookup tables; dimensions are large event tables', why: 'Backwards. Facts are usually the large, growing tables.' },
      { t: 'Facts are views; dimensions are tables', why: 'Both are normally tables. The difference is what they contain.' },
      { t: 'There is no difference; the names are interchangeable', why: 'The split between measures and attributes is the whole point of the model.' },
    ],
  },
  {
    id: 'c8-q-grain',
    sub: 'star',
    scenario: true,
    stem: 'You are designing fact_sales. A teammate says "let\'s decide the columns first and the grain later." Why is that backwards?',
    options: [
      { t: 'The grain (what one row means) decides which measures and dimensions can be in the table, so it must be declared first', ok: true, why: 'Declaring the grain first, e.g. "one row per order line", keeps every measure at the same level and prevents mixed-grain mistakes.' },
      { t: 'The grain only affects storage size', why: 'Grain decides what questions the table can answer, not just its size.' },
      { t: 'Grain is chosen automatically by Delta', why: 'Grain is a modeling decision. Delta doesn\'t choose it.' },
      { t: 'Grain only matters for dimension tables', why: 'It is defined for facts first. Dimensions follow from it.' },
    ],
  },
  {
    id: 'c8-q-grain-choice',
    sub: 'star',
    scenario: true,
    stem: 'Analysts need revenue by product, customer, store and day. Which fact grain supports all of these?',
    options: [
      { t: 'One row per order line (one product within one order)', ok: true, why: 'The finest grain the source supports can be rolled up to any combination of dimensions.' },
      { t: 'One row per store per day', why: 'Already aggregated: product and customer detail are gone.' },
      { t: 'One row per customer', why: 'That is a customer summary or dimension, not a sales fact.' },
      { t: 'One row per product per month', why: 'Loses customer, store and day detail.' },
    ],
  },
  {
    id: 'c8-q-measure-placement',
    sub: 'star',
    scenario: true,
    stem: 'Where should the column product_category go in a retail star schema?',
    options: [
      { t: 'In dim_product, as a descriptive attribute of the product', ok: true, why: 'Category describes the product. Analysts filter and group by it.' },
      { t: 'In fact_sales, next to net_amount', why: 'Putting descriptive text in the fact repeats it on every row and mixes roles.' },
      { t: 'In dim_date', why: 'Category has nothing to do with the calendar.' },
      { t: 'Nowhere; categories can\'t be modeled', why: 'They are a standard product attribute.' },
    ],
  },
  {
    id: 'c8-q-degenerate',
    sub: 'star',
    stem: 'order_id has no attributes of its own, but analysts want to group lines into orders. Where does it go?',
    options: [
      { t: 'In the fact table, as a degenerate dimension', ok: true, why: 'An identifier with no descriptive attributes stays in the fact. A separate dimension would have only one column.' },
      { t: 'In its own dim_order table with one column', why: 'Adds a join and a table with nothing to describe.' },
      { t: 'In dim_customer', why: 'A customer has many orders, so order_id isn\'t a customer attribute.' },
      { t: 'It should be dropped', why: 'You would lose the ability to count orders and group lines.' },
    ],
  },
  {
    id: 'c8-q-date-dim',
    sub: 'star',
    scenario: true,
    stem: 'Reports keep re-calculating fiscal quarter and holiday flags from order_date with complex CASE logic. What modeling fix helps?',
    options: [
      { t: 'A date dimension with one row per day and columns like fiscal_quarter, is_holiday and weekday', ok: true, why: 'Calendar logic is computed once in dim_date, and every fact joins to it.' },
      { t: 'Add those columns to every fact table', why: 'Works, but repeats logic in every fact and on every row.' },
      { t: 'Ask analysts to memorize holiday dates', why: 'Error-prone and not a model.' },
      { t: 'Partition the fact by quarter', why: 'Partitioning affects layout, not available attributes.' },
    ],
  },
  {
    id: 'c8-q-additive',
    sub: 'star',
    scenario: true,
    stem: 'A daily snapshot fact stores account_balance per account per day. Why is SUM(account_balance) over a month wrong?',
    options: [
      { t: 'Balance is semi-additive: it sums across accounts but not across time; over time use the latest or an average', ok: true, why: 'Adding 30 daily balances gives a meaningless number. Snapshot measures need a different aggregation over time.' },
      { t: 'SUM doesn\'t work on decimals', why: 'It does. The issue is meaning, not types.' },
      { t: 'Balances should be in a dimension', why: 'Balance is a measure, just a semi-additive one.' },
      { t: 'It is correct; balances always add up', why: 'Only across accounts at one point in time.' },
    ],
  },
  {
    id: 'c8-q-scd2',
    sub: 'star',
    scenario: true,
    stem: 'A customer moves from the West region to the East. Finance wants past sales to stay in West and new sales to count in East. What dimension design does that?',
    options: [
      { t: 'SCD Type 2: add a new row for the customer with valid-from/valid-to dates, and new facts point to the new row', ok: true, why: 'In Lakeflow pipelines, AUTO CDC (formerly APPLY CHANGES) can build SCD Type 2 tables for you. Type 2 keeps history, so each fact links to the customer version that was true at the time.' },
      { t: 'SCD Type 1: overwrite the region', why: 'Type 1 rewrites history: all past sales would move to East.' },
      { t: 'Delete the customer and recreate them', why: 'That breaks the link to past facts.' },
      { t: 'Store region in the fact only', why: 'Possible, but it isn\'t a dimension design and duplicates customer data on every row.' },
    ],
  },

  // ---------------- Snowflake & data vault ----------------
  {
    id: 'c8-q-snowflake',
    sub: 'snowflake-vault',
    stem: 'What makes a schema a snowflake instead of a star?',
    options: [
      { t: 'Dimensions are normalized into sub-dimensions, e.g. dim_store → dim_region', ok: true, why: 'Snowflaking splits hierarchies into separate tables: less redundancy, more joins.' },
      { t: 'It has more than one fact table', why: 'Multiple facts sharing dimensions is a constellation (galaxy), not a snowflake.' },
      { t: 'It uses Delta Lake', why: 'Table format doesn\'t define the model.' },
      { t: 'The fact table is normalized', why: 'Snowflaking is about dimensions.' },
    ],
  },
  {
    id: 'c8-q-star-vs-snowflake',
    sub: 'snowflake-vault',
    scenario: true,
    stem: 'A BI team complains that every dashboard query needs 7 joins through product → subcategory → category → department. What is the usual recommendation for the gold layer?',
    options: [
      { t: 'Flatten the hierarchy into dim_product (a star): fewer joins, simpler and usually faster BI queries', ok: true, why: 'Gold models favor ease of use. Repeated text in a dimension is cheap compared with joins in every query.' },
      { t: 'Normalize further into more tables', why: 'More joins make it worse for BI.' },
      { t: 'Put all attributes in the fact table', why: 'Bloats the fact and mixes attributes with measures.' },
      { t: 'Remove the hierarchy entirely', why: 'Analysts still need to group by department and category.' },
    ],
  },
  {
    id: 'c8-q-snowflake-when',
    sub: 'snowflake-vault',
    scenario: true,
    stem: 'When can snowflaking a dimension still make sense?',
    options: [
      { t: 'When a sub-dimension is large, shared by several dimensions, or changes independently (e.g. a region table used by stores and customers)', ok: true, why: 'Normalizing a shared or volatile hierarchy avoids updating it in many places.' },
      { t: 'Whenever you want faster BI queries', why: 'Snowflaking usually adds joins, which doesn\'t speed BI up.' },
      { t: 'Only when the fact table is small', why: 'Fact size isn\'t the deciding factor.' },
      { t: 'Never', why: 'It is a valid trade-off in some cases.' },
    ],
  },
  {
    id: 'c8-q-vault-parts',
    sub: 'snowflake-vault',
    stem: 'What are the three building blocks of a data vault?',
    options: [
      { t: 'Hubs (business keys), links (relationships between hubs) and satellites (descriptive attributes with history)', ok: true, why: 'Hubs identify entities, links connect them, satellites hold changing context with load dates and sources.' },
      { t: 'Facts, dimensions and bridges', why: 'Those are dimensional-model terms.' },
      { t: 'Bronze, silver and gold', why: 'Those are medallion layers.' },
      { t: 'Catalogs, schemas and tables', why: 'That is the Unity Catalog namespace.' },
    ],
  },
  {
    id: 'c8-q-vault-hub',
    sub: 'snowflake-vault',
    scenario: true,
    stem: 'In a data vault, where does the customer\'s email address (which can change) belong?',
    options: [
      { t: 'In a customer satellite, with a load timestamp and record source', ok: true, why: 'Satellites hold descriptive, changing attributes and keep their history.' },
      { t: 'In the customer hub', why: 'Hubs hold only the business key and load metadata.' },
      { t: 'In a link', why: 'Links hold relationships between hubs, not attributes.' },
      { t: 'In the fact table', why: 'Data vault doesn\'t use facts. That is dimensional modeling.' },
    ],
  },
  {
    id: 'c8-q-vault-why',
    sub: 'snowflake-vault',
    scenario: true,
    stem: 'An enterprise integrates 15 source systems that change often and needs a full audit trail. Why might it choose data vault for the integration layer?',
    options: [
      { t: 'It is insert-only and auditable, and new sources can be added as new satellites and links without redesigning existing tables', ok: true, why: 'Data vault is built for integration, history and change. Star schemas for BI are then built on top of it.' },
      { t: 'It is the easiest model for analysts to query directly', why: 'Data vault needs many joins. It isn\'t designed for direct BI use.' },
      { t: 'It removes the need for a gold layer', why: 'Usually the opposite: gold star schemas are built from the vault.' },
      { t: 'It stores less data than any other model', why: 'Keeping full history usually means more data, not less.' },
    ],
  },
  {
    id: 'c8-q-normalized-3nf',
    sub: 'snowflake-vault',
    stem: 'Besides data vault, which modeling style is common for the integrated silver layer?',
    options: [
      { t: 'A normalized (3NF-style) model of the business entities', ok: true, why: 'Normalized entity models reduce redundancy while conforming data from many sources, before denormalizing for BI in gold.' },
      { t: 'One wide table with every column', why: 'Hard to maintain and conform. That is closer to a gold extract.' },
      { t: 'Raw JSON strings', why: 'That is bronze.' },
      { t: 'Pre-aggregated KPI tables', why: 'Those are gold.' },
    ],
  },
  {
    id: 'c8-q-constraints',
    sub: 'snowflake-vault',
    scenario: true,
    stem: 'You add PRIMARY KEY and FOREIGN KEY constraints to your Unity Catalog star schema. A load inserts a duplicate key. What happens?',
    options: [
      { t: 'The insert succeeds: primary and foreign keys are informational, not enforced, so data quality must be checked separately', ok: true, why: 'They document relationships for tools (and can help the optimizer with RELY), but don\'t block bad rows.' },
      { t: 'The insert is rejected', why: 'That is how traditional databases behave. Unity Catalog PK/FK constraints aren\'t enforced.' },
      { t: 'The table is dropped', why: 'Constraints never drop tables.' },
      { t: 'The duplicate is silently merged', why: 'No merging happens. Both rows are stored.' },
    ],
  },

  // ---------------- Medallion mapping ----------------
  {
    id: 'c8-q-medallion-layers',
    sub: 'medallion',
    stem: 'Which description of the medallion layers is right?',
    options: [
      { t: 'Bronze: raw as received; silver: cleaned, deduplicated and conformed; gold: business-ready models and aggregates', ok: true, why: 'Quality and business meaning increase from bronze to gold.' },
      { t: 'Bronze: aggregates; silver: raw; gold: cleaned', why: 'The order is mixed up.' },
      { t: 'They are three copies of the same table for backup', why: 'Each layer transforms the data further. They aren\'t backups.' },
      { t: 'They are pricing tiers of Databricks', why: 'They are a data design pattern, not a pricing plan.' },
    ],
  },
  {
    id: 'c8-q-medallion-models',
    sub: 'medallion',
    scenario: true,
    stem: 'An architect asks where each model usually fits in a medallion lakehouse. What is the common mapping?',
    options: [
      { t: 'Data vault or normalized models in silver; star schemas and aggregates in gold', ok: true, why: 'Databricks docs: the silver layer "often follows a Third Normal Form (3NF) or Data Vault model", and gold holds data marts, often dimensional models. Silver integrates and conforms; gold shapes the data for consumption.' },
      { t: 'Star schemas in bronze', why: 'Bronze is raw. No modeling happens there.' },
      { t: 'Data vault in gold, star schemas in silver', why: 'Usually the reverse: stars are built for consumption on top of integrated silver data.' },
      { t: 'Models don\'t apply to a lakehouse', why: 'Classic modeling is used in lakehouses as in warehouses.' },
    ],
  },
  {
    id: 'c8-q-bronze-keep',
    sub: 'medallion',
    scenario: true,
    stem: 'A bug in the silver cleaning logic dropped valid rows for two weeks. Why is bronze important here?',
    options: [
      { t: 'Bronze still has the raw data, so you fix the logic and rebuild silver and gold from it', ok: true, why: 'Keeping raw, append-only data makes downstream layers reproducible.' },
      { t: 'Bronze automatically repairs silver', why: 'Nothing is automatic. You rerun the fixed logic.' },
      { t: 'It isn\'t; restore silver from a backup', why: 'A backup has the same bug\'s output. Bronze has the source data.' },
      { t: 'Bronze has the final reports', why: 'Reports come from gold.' },
    ],
  },
  {
    id: 'c8-q-dedupe-layer',
    sub: 'medallion',
    scenario: true,
    stem: 'Where should deduplication of orders by order_id normally happen?',
    options: [
      { t: 'From bronze to silver', ok: true, why: 'Bronze keeps everything as received. Silver is where data is cleaned and deduplicated.' },
      { t: 'In bronze, before the data is stored', why: 'Bronze should keep the raw record, duplicates included, so you can audit and replay.' },
      { t: 'Only in each gold dashboard query', why: 'Then every consumer re-implements it and gets different answers.' },
      { t: 'Nowhere', why: 'Duplicates inflate counts and revenue.' },
    ],
  },
  {
    id: 'c8-q-gold-consumers',
    sub: 'medallion',
    scenario: true,
    stem: 'Which table should a new BI dashboard read from by default?',
    options: [
      { t: 'A gold table or star schema, ideally certified', ok: true, why: 'Gold is modeled and validated for consumption, with consistent business logic.' },
      { t: 'Bronze, because it has all the data', why: 'Raw data has duplicates and junk. Each dashboard would have to clean it.' },
      { t: 'Silver, always', why: 'Silver is fine for ad hoc analysis, but dashboards usually want gold\'s business logic and shape.' },
      { t: 'A personal copy in a dev catalog', why: 'Not governed or maintained.' },
    ],
  },
  {
    id: 'c8-q-medallion-pipeline',
    sub: 'medallion',
    scenario: true,
    stem: 'Which Databricks tool is designed to declare bronze → silver → gold tables with data-quality expectations and managed dependencies?',
    options: [
      { t: 'Lakeflow pipelines (formerly Delta Live Tables)', ok: true, why: 'You declare each table\'s query and expectations. The pipeline handles order, incremental refresh and quality metrics.' },
      { t: 'Databricks Marketplace', why: 'Marketplace distributes data products. It doesn\'t build layers.' },
      { t: 'Delta Sharing', why: 'Sharing gives data to others.' },
      { t: 'Catalog Explorer', why: 'Explorer browses and governs data. It doesn\'t transform it.' },
    ],
  },

  // ---------------- Modeling in SQL ----------------
  {
    id: 'c8-q-fanout',
    sub: 'modeling-sql',
    scenario: true,
    stem: 'You join fact_sales (one row per order line) to monthly_targets (one row per month) and SUM(target). The targets are 400× too big. Why?',
    options: [
      { t: 'Joining a coarse table to a fine one repeats each target on every matching order line', ok: true, why: 'Different grains: aggregate sales to month first, then join the targets (or take MAX of the target).' },
      { t: 'SUM is broken for decimals', why: 'SUM is fine. The rows were multiplied by the join.' },
      { t: 'The targets table has duplicates', why: 'It has one row per month. The fact side causes the repetition.' },
      { t: 'You needed a FULL OUTER JOIN', why: 'Join type doesn\'t fix a grain mismatch.' },
    ],
  },
  {
    id: 'c8-q-unknown-member',
    sub: 'modeling-sql',
    scenario: true,
    stem: 'Revenue by region doesn\'t add up to total revenue because some sales have a customer key that isn\'t in dim_customer. What is the standard dimensional fix?',
    options: [
      { t: 'Add an "Unknown" member row to the dimension and point unmatched facts at it (or LEFT JOIN with COALESCE in queries)', ok: true, why: 'Every fact still joins, totals reconcile, and the Unknown bucket shows the data-quality gap.' },
      { t: 'Delete the unmatched sales', why: 'That under-reports real revenue.' },
      { t: 'Use INNER JOINs everywhere', why: 'That is what drops the rows in the first place.' },
      { t: 'Assign them to the largest region', why: 'Inventing a region distorts the report.' },
    ],
  },
  {
    id: 'c8-q-snowflake-join',
    sub: 'modeling-sql',
    stem: 'In the sandbox, customers stores region_id and region names live in regions. To report revenue by region_name from orders, how many joins do you need?',
    options: [
      { t: 'Two: orders → customers, then customers → regions', ok: true, why: 'Region is snowflaked off the customer dimension, so it costs an extra hop.' },
      { t: 'One: orders → regions', why: 'orders has no region_id. You must go through customers.' },
      { t: 'None', why: 'region_name isn\'t in orders.' },
      { t: 'Three, including products', why: 'Products aren\'t needed for region.' },
    ],
  },
  {
    id: 'c8-q-aggregate-table',
    sub: 'modeling-sql',
    scenario: true,
    stem: 'A gold table is declared as "one row per month and category". A query adds customer_id to the SELECT without aggregating it. What is wrong?',
    options: [
      { t: 'It breaks the grain: either customer_id must be in GROUP BY (changing the grain) or it must be aggregated', ok: true, why: 'Every non-aggregated column defines the grain. Adding one silently changes what a row means.' },
      { t: 'Nothing; extra columns are free', why: 'In most engines it errors. Where it doesn\'t, the values are arbitrary.' },
      { t: 'customer_id should be summed', why: 'Summing IDs is meaningless. Count distinct customers instead.' },
      { t: 'Gold tables can\'t contain IDs', why: 'They can. The issue is the grain.' },
    ],
  },
]

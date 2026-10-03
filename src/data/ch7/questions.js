// Chapter 7 question bank: AI/BI Genie spaces. Original, scenario-style.
// Genie changes quickly, so many items carry a `verify` flag.

export const questions = [
  // ---------------- Purpose & components ----------------
  {
    id: 'c7-q-purpose',
    sub: 'purpose',
    scenario: true,
    stem: 'Sales managers keep sending analysts ad-hoc questions like "revenue in EMEA last month?". They don\'t write SQL. What is the best Databricks feature to let them self-serve?',
    options: [
      { t: 'An AI/BI Genie space over curated sales tables', ok: true, why: 'Genie lets business users ask natural-language questions. It generates SQL over the tables you curate and returns results and charts.' },
      { t: 'Give them the SQL editor and a SQL tutorial', why: 'That shifts the SQL burden onto people who don\'t write SQL.' },
      { t: 'A Lakeflow Job that emails every possible report daily', why: 'Precomputing every possible question doesn\'t scale and isn\'t self-service.' },
      { t: 'Delta Sharing the tables to their laptops', why: 'Sharing moves data. It doesn\'t help anyone ask questions in plain language.' },
    ],
  },
  {
    id: 'c7-q-components',
    sub: 'purpose',
    stem: 'Which set best describes what a Genie space is configured with?',
    options: [
      { t: 'Unity Catalog tables/views, a SQL warehouse, instructions, sample questions, and trusted assets (example SQL / functions)', ok: true, why: 'These are the core building blocks: data, compute, context, starter prompts, and verified answer paths.' },
      { t: 'A notebook, a cluster, and a Python model', why: 'Genie is configured in a no-code space UI over SQL data, not notebooks and clusters.' },
      { t: 'A dashboard and a SQL alert', why: 'Dashboards and alerts are separate AI/BI and DBSQL features. A dashboard can have Genie enabled, but that is not how a space is defined.' },
      { t: 'Only a list of users', why: 'Permissions matter, but a space also needs data, compute and context.' },
    ],
    verify: 'Genie configuration options (e.g., SQL expressions, join definitions, knowledge store) evolve quickly.',
  },
  {
    id: 'c7-q-readonly',
    sub: 'purpose',
    stem: 'A user asks a Genie space: "delete all orders from 2019". What happens?',
    options: [
      { t: 'Genie does not run data-modifying statements. It answers read-only questions with SELECT queries.', ok: true, why: 'Genie is an analytics Q&A tool. It generates read queries, not DML.' },
      { t: 'The rows are deleted if the user has MODIFY', why: 'Genie is not a tool for changing data, whatever privileges the user has.' },
      { t: 'The space owner gets an approval request', why: 'There is no approval workflow for DML in Genie, because it doesn\'t run DML.' },
      { t: 'Genie deletes the rows in a copy of the table', why: 'Genie doesn\'t create modified copies of data.' },
    ],
    verify: 'Confirm current Genie behaviour for non-SELECT requests.',
  },
  {
    id: 'c7-q-uc-context',
    sub: 'purpose',
    stem: 'Why do clear table and column comments in Unity Catalog improve Genie answers?',
    options: [
      { t: 'Genie uses UC metadata (names, descriptions, comments) to understand what each table and column means when it writes SQL', ok: true, why: 'Better metadata means better table and column choices. Cryptic names like amt_n force Genie to guess.' },
      { t: 'Comments are executed as SQL hints', why: 'Comments are descriptions, not execution hints.' },
      { t: 'They make queries run faster on the warehouse', why: 'Comments have no effect on query performance.' },
      { t: 'They are required before a table can be queried', why: 'Tables can be queried without comments. Comments improve understanding.' },
    ],
  },

  // ---------------- Creating a space ----------------
  {
    id: 'c7-q-tables-few',
    sub: 'create',
    scenario: true,
    stem: 'You are creating a Genie space for the finance team. Which data selection is most likely to give accurate answers?',
    options: [
      { t: 'A small, focused set of curated gold tables or views with good column descriptions', ok: true, why: 'Focus and clear metadata reduce ambiguity. Start small and add tables only when questions need them.' },
      { t: 'Every table in the finance catalog, so nothing is missing', why: 'Many overlapping tables make it harder for Genie to pick the right one.' },
      { t: 'The raw bronze tables, since they have the most detail', why: 'Raw data has cryptic columns and duplicates. Curated tables answer business questions better.' },
      { t: 'One giant denormalized table with 900 columns', why: 'Too many columns dilute context. Curated, well-described tables or views work better.' },
    ],
    verify: 'Check the current maximum number of tables per space and the recommended starting size.',
  },
  {
    id: 'c7-q-instructions',
    sub: 'create',
    scenario: true,
    stem: 'Users ask for "revenue by fiscal quarter" and get answers that are off by a month. Your fiscal year starts Feb 1. What is the best fix?',
    options: [
      { t: 'Add an instruction that defines the fiscal calendar (or provide example SQL that uses it)', ok: true, why: 'Instructions carry business context Genie can\'t infer from the data, such as fiscal calendars and metric definitions.' },
      { t: 'Switch to a larger SQL warehouse', why: 'Compute size doesn\'t change how Genie interprets "fiscal quarter".' },
      { t: 'Tell users to stop asking about fiscal quarters', why: 'This avoids the problem instead of fixing the space.' },
      { t: 'Add more raw tables', why: 'More data doesn\'t teach Genie your calendar. Context does.' },
    ],
  },
  {
    id: 'c7-q-samples',
    sub: 'create',
    stem: 'What is the main purpose of sample questions in a Genie space?',
    options: [
      { t: 'They show users what the space can answer and give them one-click starting points', ok: true, why: 'Good samples set expectations and teach users how to phrase questions.' },
      { t: 'They are the only questions users are allowed to ask', why: 'Users can ask anything. Samples are suggestions.' },
      { t: 'They grant users access to the underlying tables', why: 'Access is controlled by permissions, not sample questions.' },
      { t: 'They schedule the space to refresh', why: 'Samples have nothing to do with scheduling.' },
    ],
  },
  {
    id: 'c7-q-trusted',
    sub: 'create',
    scenario: true,
    stem: 'Leadership wants to be certain that "net revenue by region" always comes from the finance-approved logic, and that users can see when it does. What should you add?',
    options: [
      { t: 'A trusted asset: a reviewed, parameterized SQL query or Unity Catalog function for that metric', ok: true, why: 'When Genie answers with a trusted asset, the response is marked Trusted, so users know it came from vetted logic.' },
      { t: 'A sample question with the same wording', why: 'Samples suggest questions. They don\'t guarantee or flag the logic used.' },
      { t: 'A longer list of tables', why: 'More tables add more paths to a wrong answer, not fewer.' },
      { t: 'A dashboard filter', why: 'Dashboard filters don\'t control how Genie computes metrics.' },
    ],
    verify: 'Trusted asset types and how the "Trusted" label appears.',
  },
  {
    id: 'c7-q-warehouse',
    sub: 'create',
    stem: 'What compute does a Genie space use to run the SQL it generates?',
    options: [
      { t: 'A SQL warehouse (Pro or Serverless) chosen in the space settings', ok: true, why: 'Genie runs its SQL on a SQL warehouse. Serverless is usually recommended for fast start-up.' },
      { t: 'The user\'s laptop', why: 'Queries run in Databricks, not on the client.' },
      { t: 'An all-purpose cluster attached to a notebook', why: 'Genie uses SQL warehouses.' },
      { t: 'No compute. Genie answers from memory.', why: 'Genie generates and runs real SQL against your data.' },
    ],
    verify: 'Supported warehouse types for Genie.',
  },
  {
    id: 'c7-q-views',
    sub: 'create',
    scenario: true,
    stem: 'Genie keeps joining orders to customers on the wrong key. Business users only ever need the joined result. What is a clean fix?',
    options: [
      { t: 'Give Genie a curated view that already joins them correctly (and/or document the join in instructions or example SQL)', ok: true, why: 'Pre-joined, well-described views remove ambiguity, and example SQL shows the correct join.' },
      { t: 'Remove the customers table and hope for the best', why: 'Then customer questions can\'t be answered at all.' },
      { t: 'Add five more tables that also contain customer_id', why: 'More candidate keys make the ambiguity worse.' },
      { t: 'Increase warehouse size', why: 'This is a logic problem, not a compute problem.' },
    ],
    verify: 'Newer Genie features let you define join relationships directly.',
  },

  // ---------------- Permissions & sharing ----------------
  {
    id: 'c7-q-perm-data',
    sub: 'share',
    scenario: true,
    stem: 'A manager can open a Genie space, but every answer fails with a permissions error on gold.sales.sales_daily. What is missing?',
    options: [
      { t: 'Unity Catalog access to the data (USE CATALOG, USE SCHEMA, SELECT) for that user or their group', ok: true, why: 'Genie runs queries as the asking user. Space access alone doesn\'t grant data access.' },
      { t: 'CAN EDIT on the space', why: 'Editing the space configuration has nothing to do with reading the data.' },
      { t: 'A bigger SQL warehouse', why: 'It\'s a permission error, not a capacity problem.' },
      { t: 'Ownership of the tables', why: 'Read access is enough. Ownership is excessive.' },
    ],
    verify: 'Confirm Genie queries run with the asking user\'s credentials.',
  },
  {
    id: 'c7-q-perm-levels',
    sub: 'share',
    stem: 'An analyst should be able to chat with a Genie space but not change its instructions or tables. Which space permission fits?',
    options: [
      { t: 'CAN RUN (or the equivalent "can use / view and chat" level)', ok: true, why: 'Least privilege: users can ask questions without editing the configuration.' },
      { t: 'CAN MANAGE', why: 'That allows changing permissions and settings.' },
      { t: 'CAN EDIT', why: 'That allows editing instructions, tables and assets.' },
      { t: 'Ownership', why: 'Far too much for a consumer of the space.' },
    ],
    verify: 'Genie space permission level names change. Check current names.',
  },
  {
    id: 'c7-q-embed',
    sub: 'share',
    scenario: true,
    stem: 'Your company wants Genie answers inside an internal web app and a chat tool, not only in the Databricks UI. What is the supported direction to look at?',
    options: [
      { t: 'The Genie Conversation API (and supported integrations or embedding options), with access still governed by Databricks identity and Unity Catalog', ok: true, why: 'The API lets external apps start conversations and fetch results while governance stays in place.' },
      { t: 'Screen-scrape the Genie UI', why: 'Fragile and unsupported, and it bypasses proper authentication.' },
      { t: 'Export the tables to the app\'s own database', why: 'This duplicates data and loses Genie entirely.' },
      { t: 'Share the space owner\'s password with the app', why: 'Never share credentials. Use the supported API and authentication.' },
    ],
    verify: 'Genie API availability, embedding options and supported chat integrations change often.',
  },
  {
    id: 'c7-q-share-curate',
    sub: 'share',
    stem: 'Before sharing a Genie space with 200 sales managers, what is the best final step?',
    options: [
      { t: 'Test it with representative questions (and ideally a benchmark), fix the instructions, then share with a group', ok: true, why: 'Validate accuracy first, and share with a group so access follows membership.' },
      { t: 'Share it with all users in the workspace immediately', why: 'Untested spaces erode trust fast, and workspace-wide sharing ignores least privilege.' },
      { t: 'Remove all sample questions so users explore freely', why: 'Samples guide users toward questions that work.' },
      { t: 'Give every manager CAN MANAGE', why: 'Consumers don\'t need management rights.' },
    ],
  },

  // ---------------- Improving a space ----------------
  {
    id: 'c7-q-monitor',
    sub: 'improve',
    stem: 'Where do you look to learn what users actually ask a Genie space and which answers they flagged as wrong?',
    options: [
      { t: "The space's monitoring/history view, which shows user questions, generated SQL and feedback (thumbs up/down, review requests)", ok: true, why: 'Real usage plus feedback shows exactly where instructions or assets need work.' },
      { t: 'DESCRIBE HISTORY on the tables', why: 'That shows table versions, not questions asked in Genie.' },
      { t: 'The SQL warehouse auto-stop settings', why: 'Unrelated to question quality.' },
      { t: 'Catalog Explorer lineage', why: 'Lineage shows data flow, not chat feedback.' },
    ],
    verify: 'Name and location of the monitoring tab.',
  },
  {
    id: 'c7-q-benchmark',
    sub: 'improve',
    scenario: true,
    stem: 'You plan to rewrite the space\'s instructions and want proof the change improves accuracy without breaking existing answers. What should you use?',
    options: [
      { t: 'Benchmarks: a set of test questions with expected (ground-truth) SQL answers, run before and after the change', ok: true, why: 'Benchmarks give a repeatable accuracy measure, like regression tests for your space.' },
      { t: 'Ask one colleague if it "feels better"', why: 'Anecdotes don\'t catch regressions.' },
      { t: 'Count how many tables are in the space', why: 'Table count isn\'t an accuracy measure.' },
      { t: 'Check warehouse query duration', why: 'Speed isn\'t correctness.' },
    ],
    verify: 'Benchmark features and naming.',
  },
  {
    id: 'c7-q-feedback-loop',
    sub: 'improve',
    scenario: true,
    stem: 'Several users thumbs-down answers to "active customers". The SQL counts everyone with any order ever. The business means "ordered in the last 90 days". Best fix?',
    options: [
      { t: 'Add the definition to instructions and/or a trusted asset, then re-test with a benchmark question', ok: true, why: 'Fix the root cause (the missing definition), make it reusable, and verify it.' },
      { t: 'Delete the thumbs-down feedback', why: 'That hides the signal instead of fixing the problem.' },
      { t: 'Ask users to type "ordered in the last 90 days" every time', why: 'That pushes the burden onto users. The space should know the definition.' },
      { t: 'Add the raw orders table too', why: 'More raw data doesn\'t define "active".' },
    ],
  },
  {
    id: 'c7-q-metadata',
    sub: 'improve',
    stem: 'A data engineer renamed columns and added clearer comments to a table used by a Genie space. What should the space owner do?',
    options: [
      { t: 'Make sure the space picks up the updated Unity Catalog metadata (refresh or re-sync as needed), then re-run the benchmarks', ok: true, why: 'Genie relies on metadata. Stale context and renamed columns can break saved SQL and instructions.' },
      { t: 'Nothing. Instructions are what matter, not metadata.', why: 'Metadata is a major input to Genie\'s understanding.' },
      { t: 'Delete the space and start over', why: 'Overkill. Refresh and re-test instead.' },
      { t: 'Run VACUUM on the table', why: 'VACUUM cleans up old files. It has nothing to do with Genie metadata.' },
    ],
    verify: 'How and when Genie refreshes UC metadata.',
  },
]

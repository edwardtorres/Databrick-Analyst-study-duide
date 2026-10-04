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
      { t: 'Unity Catalog tables/views, a SQL warehouse, instructions, sample questions, and trusted assets (example SQL / functions)', ok: true, why: 'Plus, in the current product, a knowledge store (space-level descriptions, synonyms, join relationships, SQL expressions). These are the core building blocks: data, compute, context, starter prompts, and verified answer paths.' },
      { t: 'A notebook, a cluster, and a Python model', why: 'Genie is configured in a no-code space UI over SQL data, not notebooks and clusters.' },
      { t: 'A dashboard and a SQL alert', why: 'Dashboards and alerts are separate AI/BI and DBSQL features. A dashboard can have Genie enabled, but that is not how a space is defined.' },
      { t: 'Only a list of users', why: 'Permissions matter, but a space also needs data, compute and context.' },
    ],
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
      { t: 'A small, focused set of curated gold tables or views with good column descriptions', ok: true, why: 'Databricks recommends five or fewer tables to start (limit: 50). Focus and clear metadata reduce ambiguity. Start small and add tables only when questions need them.' },
      { t: 'Every table in the finance catalog, so nothing is missing', why: 'Many overlapping tables make it harder for Genie to pick the right one.' },
      { t: 'The raw bronze tables, since they have the most detail', why: 'Raw data has cryptic columns and duplicates. Curated tables answer business questions better.' },
      { t: 'One giant denormalized table with 900 columns', why: 'Too many columns dilute context. Curated, well-described tables or views work better.' },
    ],
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
      { t: 'A trusted asset: a parameterized example SQL query or a Unity Catalog SQL function for that metric', ok: true, why: 'When Genie answers with a trusted asset, the response is shown as a verified answer, and users can open it to see the query or function and parameter values.' },
      { t: 'A sample question with the same wording', why: 'Samples suggest questions. They don\'t guarantee or flag the logic used.' },
      { t: 'A longer list of tables', why: 'More tables add more paths to a wrong answer, not fewer.' },
      { t: 'A dashboard filter', why: 'Dashboard filters don\'t control how Genie computes metrics.' },
    ],
  },
  {
    id: 'c7-q-warehouse',
    sub: 'create',
    stem: 'What compute does a Genie space use to run the SQL it generates?',
    options: [
      { t: 'A SQL warehouse (Pro or Serverless) chosen in the space settings', ok: true, why: 'Classic warehouses aren\'t supported; Databricks recommends Serverless. Genie runs its SQL on a SQL warehouse. Serverless is usually recommended for fast start-up.' },
      { t: 'The user\'s laptop', why: 'Queries run in Databricks, not on the client.' },
      { t: 'An all-purpose cluster attached to a notebook', why: 'Genie uses SQL warehouses.' },
      { t: 'No compute. Genie answers from memory.', why: 'Genie generates and runs real SQL against your data.' },
    ],
  },
  {
    id: 'c7-q-views',
    sub: 'create',
    scenario: true,
    stem: 'Genie keeps joining orders to customers on the wrong key. Business users only ever need the joined result. What is a clean fix?',
    options: [
      { t: 'Give Genie a curated view that already joins them correctly, or define the join relationship in the space (or show it in example SQL)', ok: true, why: 'Pre-joined views remove ambiguity, and the knowledge store lets you define join relationships (condition and type) directly. Primary and foreign keys in Unity Catalog are also picked up as joins.' },
      { t: 'Remove the customers table and hope for the best', why: 'Then customer questions can\'t be answered at all.' },
      { t: 'Add five more tables that also contain customer_id', why: 'More candidate keys make the ambiguity worse.' },
      { t: 'Increase warehouse size', why: 'This is a logic problem, not a compute problem.' },
    ],
  },

  // ---------------- Permissions & sharing ----------------
  {
    id: 'c7-q-perm-data',
    sub: 'share',
    scenario: true,
    stem: 'A manager can open a Genie space, but every question about gold.sales.sales_daily comes back with an empty response, while a colleague gets answers. What is missing?',
    options: [
      { t: 'Unity Catalog access to the data (USE CATALOG, USE SCHEMA, SELECT) for that user or their group', ok: true, why: 'Data access is evaluated as the asking user, and questions about data they can\'t access return an empty response. Space access alone doesn\'t grant data access.' },
      { t: 'CAN EDIT on the space', why: 'Editing the space configuration has nothing to do with reading the data.' },
      { t: 'Permission on the SQL warehouse', why: 'Users don\'t need warehouse permissions: the space runs on the author\'s embedded compute credentials.' },
      { t: 'Ownership of the tables', why: 'Read access is enough. Ownership is excessive.' },
    ],
  },
  {
    id: 'c7-q-perm-levels',
    sub: 'share',
    stem: 'An analyst should be able to chat with a Genie space but not change its instructions or tables. Which space permission fits?',
    options: [
      { t: 'CAN RUN (CAN VIEW grants the same abilities on a Genie space)', ok: true, why: 'Least privilege: CAN VIEW / CAN RUN let users ask questions and give feedback without editing the configuration.' },
      { t: 'CAN MANAGE', why: 'That allows changing permissions and settings.' },
      { t: 'CAN EDIT', why: 'That allows editing instructions, tables and assets.' },
      { t: 'Ownership', why: 'Far too much for a consumer of the space.' },
    ],
  },
  {
    id: 'c7-q-embed',
    sub: 'share',
    scenario: true,
    stem: 'Your company wants Genie answers inside an internal web app and a chat tool, not only in the Databricks UI. What is the supported direction to look at?',
    options: [
      { t: 'The Genie Conversation API (and supported integrations or embedding options), with access still governed by Databricks identity and Unity Catalog', ok: true, why: 'Options include the Genie API and iframe embedding (an admin must allow the embedding surface). The API lets external apps start conversations and fetch results while governance stays in place.' },
      { t: 'Screen-scrape the Genie UI', why: 'Fragile and unsupported, and it bypasses proper authentication.' },
      { t: 'Export the tables to the app\'s own database', why: 'This duplicates data and loses Genie entirely.' },
      { t: 'Share the space owner\'s password with the app', why: 'Never share credentials. Use the supported API and authentication.' },
    ],
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
      { t: "The space's Monitor tab, which shows user questions, Genie's responses and feedback (\"Is this correct?\" answers and review requests)", ok: true, why: 'Real usage plus feedback shows exactly where instructions or assets need work.' },
      { t: 'DESCRIBE HISTORY on the tables', why: 'That shows table versions, not questions asked in Genie.' },
      { t: 'The SQL warehouse auto-stop settings', why: 'Unrelated to question quality.' },
      { t: 'Catalog Explorer lineage', why: 'Lineage shows data flow, not chat feedback.' },
    ],
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
      { t: 'Check the space uses the updated Unity Catalog metadata (reset any space-level descriptions that override it, refresh prompt-matching values), fix example SQL that uses old names, then re-run the benchmarks', ok: true, why: 'Genie relies on metadata. Space-level descriptions override Unity Catalog until reset, and renamed columns break saved SQL.' },
      { t: 'Nothing. Instructions are what matter, not metadata.', why: 'Metadata is a major input to Genie\'s understanding.' },
      { t: 'Delete the space and start over', why: 'Overkill. Refresh and re-test instead.' },
      { t: 'Run VACUUM on the table', why: 'VACUUM cleans up old files. It has nothing to do with Genie metadata.' },
    ],
  },
  // ---------------- More: purpose & components ----------------
  {
    id: 'c7-q-vs-dashboard',
    sub: 'purpose',
    scenario: true,
    stem: 'The CFO wants the same six KPIs every Monday, laid out identically for every executive. Analysts also want to explore ad-hoc follow-up questions. Which pairing fits best?',
    options: [
      { t: 'An AI/BI dashboard for the fixed KPIs, and a Genie space (or Genie on the dashboard) for ad-hoc follow-ups', ok: true, why: 'Dashboards give consistent, curated views. Genie handles open-ended questions. They complement each other.' },
      { t: 'Genie only: let executives ask for the KPIs each week', why: 'Free-text questions can be phrased differently each week. Fixed KPIs belong on a curated dashboard.' },
      { t: 'A dashboard only. Follow-up questions can wait for the next sprint.', why: 'That leaves the ad-hoc need unmet, and that need is exactly what Genie is for.' },
      { t: 'A SQL alert for each KPI', why: 'Alerts notify on thresholds. They are not a KPI overview or an exploration tool.' },
    ],
  },
  {
    id: 'c7-q-show-sql',
    sub: 'purpose',
    stem: 'A finance user wants to check how Genie calculated an answer before putting it in a board deck. What can they do?',
    options: [
      { t: 'Inspect the SQL Genie generated (and its explanation) for that answer', ok: true, why: 'Genie answers are backed by real SQL that users can open and review. That is a key trust feature.' },
      { t: 'Nothing. Genie answers are a black box.', why: 'Generated SQL can be viewed. Genie is not an opaque guess.' },
      { t: 'Ask a Databricks admin to read the model weights', why: 'Answers come from SQL over your data, and you verify them by reading that SQL.' },
      { t: 'Re-run the question until the number stops changing', why: 'Repeating a question is not verification. Reading the SQL is.' },
    ],
  },
  {
    id: 'c7-q-owner',
    sub: 'purpose',
    stem: 'Who is best placed to own and curate a Genie space for the supply-chain team?',
    options: [
      { t: 'A data analyst or domain expert who knows both the data and the business terms, working with the team', ok: true, why: 'Curation needs data knowledge (tables, joins) and business context (definitions, vocabulary).' },
      { t: 'Every member of the team with edit rights, so anyone can change instructions', why: 'Uncoordinated edits make answers inconsistent. Give a few owners edit rights and everyone else run access.' },
      { t: 'Only the Databricks account admin', why: 'Admins manage the platform. They rarely know the domain definitions.' },
      { t: 'Nobody. Genie configures itself.', why: 'Genie relies on human curation: data selection, instructions and trusted assets.' },
    ],
  },

  // ---------------- More: creating a space ----------------
  {
    id: 'c7-q-ambiguous-cols',
    sub: 'create',
    scenario: true,
    stem: 'Two tables in a space both have a column named amount. In one it is the order value; in the other it is the refund. Genie mixes them up. What is the best first fix?',
    options: [
      { t: 'Clarify the metadata: give the columns descriptive comments (or expose views with names like order_value and refund_amount), and document the difference in instructions', ok: true, why: 'Ambiguous names are a top cause of wrong answers. Clear metadata and naming remove the ambiguity at the source.' },
      { t: 'Add a third table that also has an amount column', why: 'More ambiguity, not less.' },
      { t: 'Tell users to always type the table name in their question', why: 'That pushes curation work onto every user.' },
      { t: 'Switch the warehouse to a larger size', why: 'This is a semantics problem, not a compute problem.' },
    ],
  },
  {
    id: 'c7-q-sample-quality',
    sub: 'create',
    stem: 'Which set of sample questions is best for a sales Genie space built on orders, products and stores?',
    options: [
      { t: '"Revenue by store last month", "Top 10 products this quarter", "Which region grew fastest year over year?"', ok: true, why: 'Real, high-value questions the curated data can answer. They teach users what works.' },
      { t: '"Hello", "What can you do?", "Tell me something interesting"', why: 'Vague prompts don\'t show users which data questions the space answers well.' },
      { t: '"What is our employee turnover?", "Show web traffic by browser"', why: 'Those questions need data that isn\'t in this space.' },
      { t: 'No sample questions, so users aren\'t biased', why: 'Without samples, users don\'t know where to start, and adoption suffers.' },
    ],
  },
  {
    id: 'c7-q-parameterized',
    sub: 'create',
    stem: 'Why should a trusted asset for "revenue by region" be parameterized (for example with :start_date and :end_date) instead of hard-coding dates?',
    options: [
      { t: 'Only parameterized example queries (and Unity Catalog SQL functions) count as trusted assets, and parameters let that verified logic answer any date range', ok: true, why: 'A static example query teaches Genie but doesn\'t give a verified answer. Parameters (:start_date) make one reviewed query answer a whole family of questions.' },
      { t: 'Parameters make the query run faster', why: 'Speed isn\'t the point. Reuse of vetted logic is.' },
      { t: 'Hard-coded queries cannot be saved in a space', why: 'They can be saved, but they only answer one stale question.' },
      { t: 'Parameters let Genie skip the user\'s Unity Catalog permission checks', why: 'Nothing skips Unity Catalog: data access is always evaluated as the asking user.' },
    ],
  },
  {
    id: 'c7-q-instructions-length',
    sub: 'create',
    scenario: true,
    stem: "A space's instructions contain four pages of company history and mission statements, but no metric definitions. Answers are vague. What should you change?",
    options: [
      { t: 'Replace it with short, specific rules: metric definitions, calendars, vocabulary and join hints. Move reusable logic into example SQL or trusted assets.', ok: true, why: 'Each space allows up to 100 instructions (each example query, each function, and the whole text block count as one), and too many instructions reduce effectiveness. Genie benefits from precise, relevant context. Long background text adds noise without guidance.' },
      { t: 'Add four more pages so Genie has more context', why: 'More irrelevant text dilutes the useful instructions.' },
      { t: 'Delete all instructions', why: 'Then you lose the context that makes answers correct.' },
      { t: 'Put the history in the sample questions instead', why: 'Sample questions are user prompts, not a place for background text.' },
    ],
  },

  // ---------------- More: permissions & sharing ----------------
  {
    id: 'c7-q-row-filter',
    sub: 'share',
    scenario: true,
    stem: 'Regional managers share one Genie space, but each may only see their own region\'s rows. What is the cleanest approach?',
    options: [
      { t: 'Enforce it in Unity Catalog with a row filter (or dynamic view), since Genie queries run with each user\'s permissions', ok: true, why: 'Governance belongs in Unity Catalog. One space can then safely serve every region.' },
      { t: 'Write "only show the user their own region" in the instructions', why: 'Instructions guide SQL generation. They are not a security boundary.' },
      { t: 'Create one copy of the tables per region', why: 'Duplicated data and duplicated spaces are hard to maintain. Row filters solve it in place.' },
      { t: 'Trust managers not to ask about other regions', why: 'That is not access control.' },
    ],
  },
  {
    id: 'c7-q-link-no-access',
    sub: 'share',
    stem: 'You send a Genie space link to a colleague who has no access to the workspace. What happens when they open it?',
    options: [
      { t: 'They can\'t use it until they have workspace access, permission on the space, and access to the underlying data', ok: true, why: 'A link is not a grant. Identity, space permission and Unity Catalog data access are all required.' },
      { t: 'The link grants them read access automatically', why: 'Links don\'t bypass authentication or permissions.' },
      { t: 'They see the data but cannot ask questions', why: 'Without access they see neither.' },
      { t: 'The space owner\'s permissions are used', why: 'Answers run under the viewer\'s identity, not the owner\'s.' },
    ],
  },
  {
    id: 'c7-q-dashboard-genie',
    sub: 'share',
    scenario: true,
    stem: 'Viewers of an AI/BI sales dashboard keep emailing analysts follow-up questions about the charts. What is the most direct improvement?',
    options: [
      { t: 'Enable Genie for the dashboard (or link a curated Genie space) so viewers can ask follow-ups in natural language', ok: true, why: 'Published dashboards include Ask Genie by default (Enable Genie toggle); you can also link an existing space. This keeps exploration next to the dashboard while governance still applies.' },
      { t: 'Add 40 more charts to cover every possible question', why: 'Clutter doesn\'t scale and still misses new questions.' },
      { t: 'Export the dashboard data to a spreadsheet every day', why: 'This loses governance and freshness, and it adds manual work.' },
      { t: 'Turn off dashboard sharing', why: 'That removes the value instead of answering the questions.' },
    ],
  },

  // ---------------- More: improving a space ----------------
  {
    id: 'c7-q-benchmark-design',
    sub: 'improve',
    stem: 'Which questions make the best benchmark set for a Genie space?',
    options: [
      { t: 'Real user questions, including tricky business terms, each paired with a verified correct SQL answer', ok: true, why: 'Realistic questions with ground truth measure the accuracy users will actually experience.' },
      { t: 'Only easy questions, so the score stays high', why: 'An inflated score hides the failures you need to fix.' },
      { t: 'Random questions with no expected answers', why: 'Without ground truth there is nothing to score against.' },
      { t: 'Questions about data not in the space', why: 'Useful as a few "should decline" checks, but not as the core of the set.' },
    ],
  },
  {
    id: 'c7-q-too-many-tables',
    sub: 'improve',
    scenario: true,
    stem: 'After you added 15 more tables "just in case", benchmark accuracy dropped from 90% to 70%. What is the best response?',
    options: [
      { t: 'Remove the tables the space\'s questions don\'t need, then re-run the benchmarks', ok: true, why: 'Extra tables create more ways to pick the wrong source. Focus usually restores accuracy.' },
      { t: 'Keep adding tables until accuracy recovers', why: 'More tables made it worse. Adding more compounds the problem.' },
      { t: 'Ignore the benchmarks because users haven\'t complained yet', why: 'Benchmarks exist to catch regressions before users do.' },
      { t: 'Switch to a Classic warehouse', why: 'Warehouse type doesn\'t affect which table Genie chooses.' },
    ],
  },
  {
    id: 'c7-q-review-request',
    sub: 'improve',
    stem: 'A user flags a Genie answer as wrong and asks for a review. What is the most useful thing for the space manager to do with it?',
    options: [
      { t: 'Check the generated SQL, find the root cause (definition, join or table choice), fix it in instructions or example SQL, and add the question to the benchmarks', ok: true, why: 'Review requests appear on the Monitor tab for CAN MANAGE users. This turns one complaint into a permanent fix and a regression check ("Add as benchmark" is built in).' },
      { t: 'Reply with the correct number and change nothing', why: 'The next user who asks gets the same wrong answer.' },
      { t: 'Delete the user\'s conversation', why: 'That throws away the evidence and fixes nothing.' },
      { t: 'Revoke the user\'s access', why: 'They did the right thing by flagging it.' },
    ],
  },
]

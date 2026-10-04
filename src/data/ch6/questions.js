// Chapter 6 question bank: Dashboards & Visualizations. Original,
// scenario-style; every option explained. AI/BI dashboard features move
// quickly, so publishing, sharing and alert details carry verify flags.

export const questions = [
  // ---------------- AI/BI dashboards ----------------
  {
    id: 'c6-q-dash-pages',
    sub: 'dashboards',
    scenario: true,
    stem: 'One AI/BI dashboard needs an executive summary view and a detailed operations view, sharing the same filters where it makes sense. What is the cleanest design?',
    options: [
      { t: 'One dashboard with multiple pages: a summary page and an operations page', ok: true, why: 'AI/BI dashboards support multiple pages, so related views stay in one governed, shareable object.' },
      { t: 'Two unrelated dashboards that must be kept in sync by hand', why: 'This works, but it duplicates datasets and filters and drifts over time.' },
      { t: 'One very long page with everything stacked', why: 'Executives must scroll past operational detail. Pages separate the audiences.' },
      { t: 'A notebook with display() cells', why: 'Notebooks are for analysis, not a polished, shared dashboard.' },
    ],
    verify: 'Multi-page and cross-page filter behaviour.',
  },
  {
    id: 'c6-q-dash-datasets',
    sub: 'dashboards',
    stem: 'In an AI/BI dashboard, what is a dataset?',
    options: [
      { t: 'A query (or table/view) defined in the dashboard\'s data tab that widgets use as their source', ok: true, why: 'Widgets are built on datasets, and one dataset can feed many widgets.' },
      { t: 'A Delta table that the dashboard creates and owns', why: 'Datasets reference data. They don\'t create new tables.' },
      { t: 'A CSV export of the dashboard', why: 'Exports are outputs, not sources.' },
      { t: 'A single chart', why: 'Charts are widgets that read from datasets.' },
    ],
  },
  {
    id: 'c6-q-dash-multi-datasets',
    sub: 'dashboards',
    scenario: true,
    stem: 'A dashboard needs daily revenue (from orders) and support-ticket volume (from a ticketing table) on the same page. What should you do?',
    options: [
      { t: 'Create two datasets and build each widget on the dataset it needs', ok: true, why: 'A dashboard can hold multiple datasets, each feeding its own widgets.' },
      { t: 'Force everything into one giant JOIN dataset', why: 'Unrelated grains joined together risk duplicated rows and slow queries.' },
      { t: 'Build two dashboards, because one dashboard can only have one dataset', why: 'Dashboards support multiple datasets.' },
      { t: 'Paste the numbers into a text widget each morning', why: 'Manual, stale and error-prone.' },
    ],
  },
  {
    id: 'c6-q-dash-widgets',
    sub: 'dashboards',
    stem: 'Which widget types can you place on an AI/BI dashboard canvas?',
    options: [
      { t: 'Visualizations, text (Markdown, which can include images) and filter widgets', ok: true, why: 'The canvas mixes charts with explanatory text, images and interactive filters.' },
      { t: 'Only charts', why: 'Text and filter widgets are also available.' },
      { t: 'Only tables', why: 'Many chart types are available, not just tables.' },
      { t: 'Python notebook cells', why: 'Notebook cells are not dashboard widgets.' },
    ],
    verify: 'Exact widget list and how images are added.',
  },
  {
    id: 'c6-q-dash-draft',
    sub: 'dashboards',
    scenario: true,
    stem: 'You changed several charts on a dashboard that 200 managers already use. They still see the old version. Why?',
    options: [
      { t: 'You edited the draft. Viewers see the published version until you publish again.', ok: true, why: 'AI/BI dashboards separate draft editing from the published version that viewers see.' },
      { t: 'Viewers\' browsers cache dashboards for 30 days', why: 'Draft and publish is the reason, not browser caching.' },
      { t: 'Changes only appear after the warehouse restarts', why: 'Compute restarts don\'t publish edits.' },
      { t: 'Each viewer must re-create the dashboard', why: 'Viewers just open the published dashboard.' },
    ],
    verify: 'Draft vs published behaviour.',
  },
  {
    id: 'c6-q-crossfilter',
    sub: 'dashboards',
    stem: 'A viewer clicks the "EMEA" bar in a chart and the other charts on the page update to EMEA. What feature is this?',
    options: [
      { t: 'Cross-filtering between widgets that share a dataset or field', ok: true, why: 'Clicking a mark can filter related widgets, so viewers can explore without editing.' },
      { t: 'A SQL alert', why: 'Alerts notify on thresholds. They don\'t filter charts.' },
      { t: 'Delta time travel', why: 'Time travel reads old table versions.' },
      { t: 'A Genie trusted asset', why: 'Trusted assets belong to Genie spaces.' },
    ],
    verify: 'Cross-filtering scope (same dataset vs related fields).',
  },

  // ---------------- Visualizations & chart choice ----------------
  {
    id: 'c6-q-viz-notebook',
    sub: 'viz',
    stem: 'In a Databricks notebook, how do you quickly turn a query result into a chart?',
    options: [
      { t: 'Display the result (e.g., a SQL cell or display(df)) and add a visualization from the result panel', ok: true, why: 'Notebook result tables have a built-in way to add visualizations, with no plotting code.' },
      { t: 'Export to CSV and chart it in a spreadsheet', why: 'That works, but it leaves Databricks and governance behind.' },
      { t: 'Charts are only available in AI/BI dashboards', why: 'Notebooks and the SQL editor both support visualizations.' },
      { t: 'Write a SQL alert', why: 'Alerts notify. They don\'t draw charts.' },
    ],
    verify: 'Where the "+ Visualization" control sits in the current notebook UI.',
  },
  {
    id: 'c6-q-chart-trend',
    sub: 'viz',
    scenario: true,
    stem: 'A manager asks: "How has weekly active users changed over the last year?" Which chart fits best?',
    options: [
      { t: 'Line chart', ok: true, why: 'Change over time is a line\'s job: the slope shows the trend.' },
      { t: 'Pie chart', why: 'Weeks aren\'t parts of a whole, and 52 slices hide the trend.' },
      { t: 'Scatter plot', why: 'A scatter shows the relationship between two measures. Time here is an ordered axis.' },
      { t: 'Counter', why: 'One number can\'t show a year of change.' },
    ],
  },
  {
    id: 'c6-q-chart-compare',
    sub: 'viz',
    scenario: true,
    stem: 'You need to compare total sales across 8 product categories so the biggest stand out. Which chart?',
    options: [
      { t: 'Bar chart, sorted by value', ok: true, why: 'Lengths from a common baseline are the most accurate way to compare categories, and sorting makes the ranking obvious.' },
      { t: 'Pie chart', why: 'Eight similar angles are hard to compare accurately.' },
      { t: 'Line chart', why: 'Categories have no order, so the connecting line suggests a trend that isn\'t there.' },
      { t: 'Histogram', why: 'A histogram bins one numeric measure. It loses the category names.' },
    ],
  },
  {
    id: 'c6-q-chart-distribution',
    sub: 'viz',
    stem: 'Which chart best shows whether delivery times are skewed, with most deliveries fast and a long tail of slow ones?',
    options: [
      { t: 'Histogram', ok: true, why: 'Grouping values into ranges reveals the shape: skew, tails, clusters.' },
      { t: 'Counter showing the average delivery time', why: 'An average hides the skew you want to see.' },
      { t: 'Pie chart', why: 'Pies show parts of a whole, not distributions.' },
      { t: 'Stacked bar', why: 'There\'s nothing to stack. It\'s one measure.' },
    ],
  },
  {
    id: 'c6-q-chart-relationship',
    sub: 'viz',
    stem: 'Marketing wants to see whether discount percentage relates to basket size across 500 orders. Which chart?',
    options: [
      { t: 'Scatter plot', ok: true, why: 'Two numeric measures per item: a scatter reveals correlation and outliers.' },
      { t: 'Line chart', why: 'Orders aren\'t a sequence, so the connecting line is meaningless.' },
      { t: 'Pie chart', why: 'Pies can\'t show a relationship between two measures.' },
      { t: 'Counter', why: 'One number can\'t show a relationship.' },
    ],
  },
  {
    id: 'c6-q-chart-kpi',
    sub: 'viz',
    scenario: true,
    stem: 'The top of an executive dashboard needs "Revenue this month: $4.2M (84% of target)". Which visualization?',
    options: [
      { t: 'Counter (KPI) visualization, optionally showing the target or comparison', ok: true, why: 'A single headline number is a counter\'s job.' },
      { t: 'Pie chart of revenue vs. remaining target', why: 'Actual vs. remaining isn\'t a true part-to-whole, and it takes up more room than one number.' },
      { t: 'Scatter plot', why: 'There is only one value.' },
      { t: 'A 1,000-row table', why: 'Executives need the headline, not raw rows.' },
    ],
  },

  // ---------------- Parameters ----------------
  {
    id: 'c6-q-param-syntax',
    sub: 'params',
    stem: 'In the Databricks SQL editor, how do you add a named parameter that the user fills in before running the query?',
    options: [
      { t: 'Use a parameter marker such as :region in the query (e.g., WHERE region = :region)', ok: true, why: 'Named parameter markers create an input widget. The value is substituted safely when the query runs.' },
      { t: 'Concatenate user input into the SQL string', why: 'That is error-prone and unsafe. Parameters exist to avoid it.' },
      { t: 'Create a temporary table for each possible value', why: 'Far too much work for something a parameter does.' },
      { t: 'Parameters are only possible in notebooks', why: 'The SQL editor and dashboards support parameters.' },
    ],
    verify: 'Current parameter syntax (named :param markers vs legacy {{ param }}).',
  },
  {
    id: 'c6-q-param-vs-filter',
    sub: 'params',
    scenario: true,
    stem: 'A dashboard dataset is SELECT … WHERE region = :region. A viewer\'s region picker is set up as a field filter, not a parameter. Choosing APAC shows an empty chart. Why?',
    options: [
      { t: 'A field filter only filters the rows the query already returned. Only a parameter changes :region inside the SQL.', ok: true, why: 'The query still runs with the default region, so filtering that result for APAC leaves nothing.' },
      { t: 'APAC has no data in the table', why: 'The setup is the problem, not the data.' },
      { t: 'Filters only work on numeric columns', why: 'Filters work on text fields too.' },
      { t: 'The warehouse is too small', why: 'Compute size doesn\'t change which rows a query returns.' },
    ],
  },
  {
    id: 'c6-q-param-dropdown',
    sub: 'params',
    stem: 'You want the region parameter to offer only valid region names in a dropdown, kept current as new regions appear. What do you configure?',
    options: [
      { t: 'A dropdown whose values come from a query (e.g., SELECT DISTINCT region FROM …)', ok: true, why: 'Query-based dropdowns stay in sync with the data and prevent typos.' },
      { t: 'A free-text parameter and trust users to type exact names', why: 'Typos return empty results.' },
      { t: 'A hard-coded list you edit every quarter', why: 'This works, but it goes stale as regions change.' },
      { t: 'A SQL alert', why: 'Alerts don\'t populate dropdowns.' },
    ],
    verify: 'How query-based dropdowns are configured for dashboard parameters.',
  },
  {
    id: 'c6-q-param-test',
    sub: 'params',
    stem: 'Before publishing, what is the best way to test a date-range parameter on a dashboard dataset?',
    options: [
      { t: 'Run the dataset and widgets with several values (typical range, empty range, edge dates) and check the results and charts', ok: true, why: 'Testing realistic and edge values catches missing defaults, empty states and wrong filters before viewers do.' },
      { t: 'Publish and wait for complaints', why: 'Viewers shouldn\'t be your test suite.' },
      { t: 'Only check that the SQL compiles', why: 'Compiling doesn\'t prove the right rows come back.' },
      { t: 'Remove the parameter to avoid risk', why: 'That removes the feature viewers need.' },
    ],
  },
  {
    id: 'c6-q-param-default',
    sub: 'params',
    stem: 'Why set a sensible default value on a dashboard parameter?',
    options: [
      { t: 'So the dashboard loads with meaningful results before anyone touches the picker, and scheduled refreshes have a value to use', ok: true, why: 'Without a default, datasets that require the parameter may show nothing or error.' },
      { t: 'Defaults make queries run faster', why: 'Defaults are about behaviour, not speed.' },
      { t: 'Defaults are required before you can share a dashboard', why: 'They are good practice, not a sharing requirement.' },
      { t: 'Defaults lock viewers to one value', why: 'Viewers can still change the parameter.' },
    ],
  },

  // ---------------- Sharing & schedules ----------------
  {
    id: 'c6-q-share-group',
    sub: 'sharing',
    stem: 'Regional managers should be able to view a dashboard but not edit it. What is the best way to grant access?',
    options: [
      { t: 'Share the published dashboard with the regional-managers group at a view-only permission level', ok: true, why: 'Least privilege, managed through group membership.' },
      { t: 'Give each manager Can Manage', why: 'They could change settings and permissions.' },
      { t: 'Share it with all workspace users', why: 'Broader than needed.' },
      { t: 'Email screenshots daily', why: 'Static, manual and ungoverned.' },
    ],
    verify: 'Dashboard permission level names.',
  },
  {
    id: 'c6-q-embedded-creds',
    sub: 'sharing',
    scenario: true,
    stem: "Some managers who should see a dashboard don't have SELECT on the underlying table, and you don't want to grant them table access. What publishing option lets them see the dashboard's data?",
    options: [
      { t: "Publish with embedded credentials, so dashboard queries run with the publisher's permissions", ok: true, why: 'Viewers see the results the dashboard shows without needing their own table access. Use it deliberately: viewers see what the publisher can see through those queries.' },
      { t: "Publish with viewers' individual credentials", why: 'Then each viewer needs their own data access, and those managers would see errors.' },
      { t: 'Grant them ALL PRIVILEGES on the catalog', why: 'Far more access than needed.' },
      { t: 'Share the publisher\'s password', why: 'Never share credentials.' },
    ],
    verify: 'Embedded credentials options and their current naming.',
  },
  {
    id: 'c6-q-embedded-rowfilter',
    sub: 'sharing',
    scenario: true,
    stem: 'The sales table has a Unity Catalog row filter so each regional manager sees only their own region. You publish a dashboard on it with embedded credentials (yours: you can see every region). What happens, and what should you do?',
    options: [
      { t: "Every viewer sees all regions, because queries run as you and the row filter is evaluated for you. Publish with each viewer's own credentials so the filter applies per viewer.", ok: true, why: "Embedded credentials replace the viewer's identity with the publisher's, so per-user row filters and column masks stop protecting anything. Viewer credentials keep them working." },
      { t: "Each viewer still sees only their region. Row filters always use the viewer's identity.", why: 'With embedded credentials the query runs as the publisher, so the filter sees the publisher, not the viewer.' },
      { t: 'Nobody sees any data, because row filters block embedded credentials', why: 'The queries succeed and return whatever the publisher can see, which is the problem.' },
      { t: 'Fine either way: add a dashboard filter on region instead', why: 'A dashboard filter is a convenience, not security. Viewers can change it.' },
    ],
    verify: 'Confirm how row filters and column masks are evaluated for dashboards published with embedded credentials.',
  },
  {
    id: 'c6-q-share-external',
    sub: 'sharing',
    scenario: true,
    stem: 'A partner company needs to view a dashboard inside their own web portal. Which direction should you look into?',
    options: [
      { t: 'The supported embedding options for AI/BI dashboards (iframe embedding and, where available, embedding for external users), with access still controlled by Databricks', ok: true, why: 'Embedding puts the dashboard in another site while keeping governance.' },
      { t: "Give the partner a Databricks admin's login", why: 'Never share credentials.' },
      { t: 'Export the underlying tables to the partner\'s database daily', why: 'This loses governance and freshness. Consider Delta Sharing if they need data, not a dashboard.' },
      { t: 'Take screenshots and email them', why: 'Static and manual.' },
    ],
    verify: 'Embedding options for external users and the admin settings (e.g., allowed domains) they need.',
  },
  {
    id: 'c6-q-schedule',
    sub: 'sharing',
    scenario: true,
    stem: 'Data lands nightly by 02:00 and managers open the dashboard at 08:00. They complain the first load is slow and sometimes shows yesterday. Best fix?',
    options: [
      { t: 'Add a refresh schedule for the published dashboard after the load (e.g., 06:00)', ok: true, why: 'A scheduled refresh after the data lands keeps results fresh and warm for the morning.' },
      { t: 'Schedule a refresh every 5 minutes, all day', why: 'Wasteful for data that changes once a night.' },
      { t: 'Ask managers to open it after lunch', why: 'That avoids the problem instead of fixing it.' },
      { t: 'Convert every chart to a table', why: 'Chart type has nothing to do with freshness.' },
    ],
    verify: 'Schedule options for published dashboards.',
  },
  {
    id: 'c6-q-subscription',
    sub: 'sharing',
    stem: 'Executives want a PDF snapshot of the dashboard in their inbox every Monday at 07:00. What do you use?',
    options: [
      { t: 'A dashboard schedule with subscribers, which emails a snapshot when it runs', ok: true, why: 'Scheduled runs can notify subscribers with a snapshot of the published dashboard.' },
      { t: 'A SQL alert with a threshold of 0', why: 'Alerts are for conditions, not routine report delivery.' },
      { t: 'A Lakeflow Job that screenshots the browser', why: 'Overengineered. Subscriptions do this.' },
      { t: 'A Genie sample question', why: 'Genie has nothing to do with emailing dashboards.' },
    ],
    verify: 'Subscription formats (PDF/image) and who can be a subscriber.',
  },

  // ---------------- SQL alerts ----------------
  {
    id: 'c6-q-alert-condition',
    sub: 'alerts',
    scenario: true,
    stem: "Sales Ops wants to be notified when today's revenue drops below $50,000. The alert query returns one row with column today_revenue. Which condition?",
    options: [
      { t: 'today_revenue < 50000', ok: true, why: 'The alert triggers when the value is below the threshold, which is exactly the requirement.' },
      { t: 'today_revenue > 50000', why: 'That fires on good days and stays quiet on bad ones.' },
      { t: 'today_revenue = 50000', why: 'An exact match almost never happens.' },
      { t: 'No condition. Alerts fire every time the query runs.', why: 'Alerts evaluate a condition and notify only when it is met.' },
    ],
  },
  {
    id: 'c6-q-alert-destination',
    sub: 'alerts',
    stem: 'An alert keeps showing TRIGGERED in the UI, but the team never hears about it. What is the most likely gap?',
    options: [
      { t: 'No notification destination (or subscriber) is configured for the alert', ok: true, why: 'Triggering and notifying are separate. Without a destination such as email, Slack or a webhook, nobody is told.' },
      { t: 'The threshold is too low', why: 'The alert is already triggering. The problem is delivery.' },
      { t: 'The query needs more columns', why: 'The condition is already evaluating.' },
      { t: 'Alerts only work on weekends', why: 'Not a thing.' },
    ],
    verify: 'Who configures destinations (often workspace admins) and the supported types.',
  },
  {
    id: 'c6-q-alert-schedule',
    sub: 'alerts',
    stem: "What determines how often an alert checks today's revenue?",
    options: [
      { t: "The alert's schedule (the alert query runs and its condition is evaluated on that schedule)", ok: true, why: 'Alerts run on their own schedule. More frequent checks give faster notice at more compute cost.' },
      { t: 'The dashboard refresh schedule', why: 'Dashboards and alerts are scheduled separately.' },
      { t: 'Alerts evaluate continuously in real time', why: 'Alerts run their query on a schedule.' },
      { t: 'Only when someone opens the alert page', why: 'Alerts run unattended on their schedule.' },
    ],
    verify: 'Alert scheduling options in the current alerts experience.',
  },
  {
    id: 'c6-q-alert-states',
    sub: 'alerts',
    stem: 'An alert is TRIGGERED today. Tomorrow revenue recovers above the threshold. What happens to the alert\'s state, and what option controls whether people hear about it?',
    options: [
      { t: 'It returns to OK, and you can choose to notify destinations when the alert goes back to normal', ok: true, why: 'Alerts move between states as the condition changes. A "back to normal" notification is optional.' },
      { t: 'It stays TRIGGERED forever until deleted', why: 'Alerts re-evaluate on every run.' },
      { t: 'It deletes itself', why: 'Alerts persist until you remove them.' },
      { t: 'It switches to monitoring a different column', why: 'The column is fixed in the alert definition.' },
    ],
    verify: 'Alert state names and notification options.',
  },
  {
    id: 'c6-q-alert-vs-dashboard',
    sub: 'alerts',
    scenario: true,
    stem: 'Finance wants to know immediately when failed payments exceed 2% in any hour, without anyone watching a dashboard. What should you build?',
    options: [
      { t: 'A SQL alert on a query computing the hourly failure rate, condition > 0.02, scheduled hourly, with a destination', ok: true, why: 'Alerts push notifications when a condition is met. Nobody has to watch anything.' },
      { t: 'A dashboard with a big red counter', why: 'Someone still has to be looking at it.' },
      { t: 'A Genie space', why: 'Genie answers questions when asked. It doesn\'t monitor.' },
      { t: 'A weekly subscription email', why: 'Too slow for "immediately".' },
    ],
  },
]

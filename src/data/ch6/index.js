import { questions } from './questions.js'

const card = (id, title, body, extra = {}) => ({ type: 'card', id: `c6-card-${id}`, title, body, ...extra })
const quiz = (...ids) => ({ type: 'quiz', ids })
const widget = (name) => ({ type: 'widget', name })

const subsections = [
  {
    id: 'dashboards',
    title: 'AI/BI Dashboards',
    emoji: '📋',
    blocks: [
      card('dash-1', 'Datasets, then widgets', [
        'An **AI/BI dashboard** has a **data** side and a **canvas** side. On the data side you define **datasets**: SQL queries, or tables and views from Unity Catalog. A dashboard can have **several datasets**.',
        'On the canvas, **widgets** read from datasets: **visualizations**, **text** widgets (formatted text or Markdown, with links, tables and **images** inserted by URL or path), and **filter** widgets. One dataset can feed many widgets.',
      ]),
      card('dash-2', 'Pages & interactivity', [
        'Dashboards can have **multiple pages**, for example "Summary" for executives and "Operations" for the team.',
        '**Filters**: **global** filters apply across all pages, **page-level** filter widgets apply to one page, and **widget-level** filters are fixed by the author. All of them affect only visualizations that share the filtered dataset.',
        '**Cross-filtering**: clicking a bar or legend item filters the other visualizations that use the **same dataset**. **Drill-through** opens another page with the filter pre-set.',
      ]),
      card('dash-3', 'Draft vs published', [
        'You edit a **draft**. Viewers see the **published** version, so your edits stay invisible until you publish again.',
        'Publishing is also where you choose **Share data permissions** or **Individual data permissions** (see Sharing). You can hide work-in-progress pages from the published version.',
      ]),
      quiz('c6-q-dash-pages', 'c6-q-dash-datasets', 'c6-q-dash-multi-datasets', 'c6-q-dash-widgets', 'c6-q-dash-draft', 'c6-q-crossfilter'),
    ],
  },
  {
    id: 'viz',
    title: 'Visualizations & Chart Choice',
    emoji: '📈',
    blocks: [
      card('viz-1', 'Charts everywhere', [
        'Besides dashboards, you can add **visualizations to query results** in the **SQL editor** and in **notebooks** (click **+** above a result and choose **Visualization**). No plotting code needed. Notebooks can also generate a **data profile** with summary statistics and histograms.',
        'Common types: line, bar, area, pie, scatter, histogram, heatmap, box, counter (KPI), pivot/table, map, funnel.',
      ]),
      card('viz-2', 'Pick by the question', [
        '**Trend over time** → line. **Compare categories** → bar (sorted). **Part of a whole, few parts** → pie or 100% stacked bar.',
        '**Distribution** → histogram (or box). **Relationship between two measures** → scatter. **One headline number** → counter. **Exact lookup** → table.',
        '**Composition over time** → stacked bars. **Where** → map.',
      ], { tip: 'Ask "what is the job: trend, compare, share, spread, relate, headline or lookup?" The job picks the chart.' }),
      card('viz-3', 'Common traps', [
        'Pies with many similar slices (hard to compare angles). Lines across unordered categories. Two y-axes on one chart. Averages that hide skew.',
        'Sort bar charts, label selectively, and keep colours meaningful.',
      ]),
      widget('chart-picker'),
      quiz('c6-q-viz-notebook', 'c6-q-chart-trend', 'c6-q-chart-compare', 'c6-q-chart-distribution', 'c6-q-chart-relationship', 'c6-q-chart-kpi'),
    ],
  },
  {
    id: 'params',
    title: 'Parameters',
    emoji: '🎛️',
    blocks: [
      card('param-1', 'Define a parameter', [
        'Add a **named parameter marker** to a query, for example `WHERE region = :region AND order_date >= :start_date`. The SQL editor and dashboard datasets then show an input for it.',
        'Named `:param` markers are current; `{{ param }}` (mustache) is the **legacy** syntax.',
        'Types: **String**, **Integer/Decimal** (Numeric), **Date**, **Date and Time**; dashboards add **Date Range** (`:p.min` / `:p.max`) and **multiple selections** (used with `array_contains`). A **query-based parameter** fills a dropdown from a dataset (e.g. `SELECT DISTINCT region …`).',
      ], { code: `SELECT order_date, SUM(revenue) AS revenue
FROM prod.sales.orders
WHERE region = :region
  AND order_date BETWEEN :start_date AND :end_date
GROUP BY order_date` }),
      card('param-2', 'Parameter vs filter', [
        'A **parameter** changes the **SQL** before it runs. A **field filter** narrows the rows a dataset already returned.',
        'If the SQL says `region = :region`, only a parameter can change which region is fetched. A field filter can only filter what came back.',
      ]),
      card('param-3', 'Configure & test', [
        'Give parameters **sensible defaults** so the dashboard loads with results (and scheduled refreshes have values).',
        'Prefer **query-based dropdowns** to free text. Test typical, empty and edge values before publishing.',
      ]),
      quiz('c6-q-param-syntax', 'c6-q-param-vs-filter', 'c6-q-param-dropdown', 'c6-q-param-test', 'c6-q-param-default'),
    ],
  },
  {
    id: 'sharing',
    title: 'Sharing & Schedules',
    emoji: '🔗',
    blocks: [
      card('share-1', 'Who can open it', [
        'Share the **published** dashboard with **users or groups** at the lowest level they need: **CAN VIEW**, **CAN RUN** (view, interact, refresh), **CAN EDIT**, **CAN MANAGE**. Account users without workspace access are limited to CAN RUN.',
        'Sharing a dashboard doesn\'t grant table access. That depends on the data-permissions setting below.',
      ]),
      card('share-2', 'Whose credentials run the queries', [
        '**Share data permissions** (the default; often called *embedded credentials*): queries run with the **publisher\'s** data permissions, so viewers see results without their own table access. Powerful; use it deliberately.',
        '**Individual data permissions**: each viewer\'s own Unity Catalog permissions decide what they see. Compute always uses the publisher\'s credentials.',
        '**Use Individual data permissions when per-viewer security matters.** With Share data permissions every viewer sees data through the publisher, so row filters and column masks based on the viewer don\'t apply.',
        'Outside Databricks: **basic embedding** (iframe; viewers sign in; admins allow the embedding surface) or **embedding for external users** (your app authenticates with a service principal; viewers need no Databricks account). **Copy link** shares the URL with people you\'ve granted access.',
      ]),
      card('share-3', 'Schedules & subscriptions', [
        'Add a **schedule** to refresh a published dashboard, ideally just **after** the data lands. Too-frequent refreshes waste warehouse time.',
        '**Subscribers** on a schedule get a **snapshot** when it runs: email gets a **PDF** (optionally CSV/TSV/Excel data); **Slack** and **Microsoft Teams** get a PNG image plus PDF. Admins set up Slack/Teams destinations. Up to 100 subscribers.',
      ]),
      quiz('c6-q-share-group', 'c6-q-embedded-creds', 'c6-q-embedded-rowfilter', 'c6-q-share-external', 'c6-q-schedule', 'c6-q-subscription'),
    ],
  },
  {
    id: 'alerts',
    title: 'SQL Alerts',
    emoji: '🚨',
    blocks: [
      card('alert-1', 'Anatomy of an alert', [
        'A **SQL alert** runs a query on a **schedule** and checks a **condition**: the first value of a column, or an **aggregation** over the column (e.g. SUM, AVERAGE), an operator and a **threshold** (for example `today_revenue < 50000`).',
        'States: **TRIGGERED** (condition met; notifies its **destinations**), **OK**, or **ERROR**. **Notify on OK** sends a "back to normal" message.',
      ]),
      card('alert-2', 'Destinations', [
        'Notifications go to **destinations** such as email, Slack, Microsoft Teams, PagerDuty or webhooks. Only a workspace **admin** can create destinations; once created they\'re available to all users.',
        'A triggered alert with no destination tells nobody.',
      ]),
      card('alert-3', 'Alert vs dashboard', [
        'Dashboards **wait** for someone to look. Alerts **push** when something happens. Use an alert when "notify me if…" matters more than "show me…".',
      ]),
      widget('dashboard-config'),
      quiz('c6-q-alert-condition', 'c6-q-alert-destination', 'c6-q-alert-schedule', 'c6-q-alert-states', 'c6-q-alert-vs-dashboard'),
    ],
  },
]

export default {
  intro: 'Turn queries into dashboards people trust: datasets and pages, the right chart for each question, parameters, sharing and schedules, and alerts that tell people when something changes.',
  subsections,
  questions,
  challenges: [],
}

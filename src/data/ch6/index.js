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
        'On the canvas, **widgets** read from datasets: **visualizations**, **text** (Markdown, which can include images and links), and **filter** widgets. One dataset can feed many widgets.',
      ], { verify: 'Widget types and how images are added.' }),
      card('dash-2', 'Pages & interactivity', [
        'Dashboards can have **multiple pages**, for example "Summary" for executives and "Operations" for the team.',
        '**Filters** narrow what widgets show. **Cross-filtering** lets a click on one chart filter the related charts.',
      ], { verify: 'Cross-page filters and cross-filtering scope.' }),
      card('dash-3', 'Draft vs published', [
        'You edit a **draft**. Viewers see the **published** version, so your edits stay invisible until you publish again.',
        'Publishing is also where you choose whose **credentials** the queries run with (see Sharing).',
      ], { verify: 'Draft/publish workflow details.' }),
      quiz('c6-q-dash-pages', 'c6-q-dash-datasets', 'c6-q-dash-multi-datasets', 'c6-q-dash-widgets', 'c6-q-dash-draft', 'c6-q-crossfilter'),
    ],
  },
  {
    id: 'viz',
    title: 'Visualizations & Chart Choice',
    emoji: '📈',
    blocks: [
      card('viz-1', 'Charts everywhere', [
        'Besides dashboards, you can add **visualizations to query results** in the **SQL editor** and in **notebooks** (display a result, then add a visualization). No plotting code needed.',
        'Common types: line, bar, area, pie, scatter, histogram, heatmap, box, counter (KPI), pivot/table, map, funnel.',
      ], { verify: 'The visualization type list and where the control sits in each editor.' }),
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
        'Types include text, number, date or date range, and dropdowns (static lists or values from a query).',
      ], { verify: 'Named :param markers vs legacy {{ }} syntax, and parameter type names.', code: `SELECT order_date, SUM(revenue) AS revenue
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
        'Share the **published** dashboard with **users or groups** at the lowest level they need (view-only for consumers).',
        'Sharing a dashboard doesn\'t grant table access. That depends on the credentials setting below.',
      ], { verify: 'Permission level names for dashboards.' }),
      card('share-2', 'Whose credentials run the queries', [
        '**Embedded credentials**: queries run with the **publisher\'s** permissions, so viewers see the results without their own table access. Powerful; use it deliberately.',
        '**Viewer (individual) credentials**: each viewer needs their own Unity Catalog access to the data.',
        'For people outside the workspace, look at **embedding** options (iframe, or embedding for external users where available). Admins may need to allow embedding domains.',
      ], { verify: 'Embedded credentials naming, link sharing, and external embedding options. These change often.' }),
      card('share-3', 'Schedules & subscriptions', [
        'Add a **schedule** to refresh a published dashboard, ideally just **after** the data lands. Too-frequent refreshes waste warehouse time.',
        '**Subscribers** on a schedule get a **snapshot** (for example a PDF or image) by email when it runs.',
      ], { verify: 'Subscription formats and destinations.' }),
      quiz('c6-q-share-group', 'c6-q-embedded-creds', 'c6-q-share-external', 'c6-q-schedule', 'c6-q-subscription'),
    ],
  },
  {
    id: 'alerts',
    title: 'SQL Alerts',
    emoji: '🚨',
    blocks: [
      card('alert-1', 'Anatomy of an alert', [
        'A **SQL alert** runs a query on a **schedule** and checks a **condition**: a column, an operator and a **threshold** (for example `today_revenue < 50000`).',
        'When the condition is met the alert is **TRIGGERED** and notifies its **destinations**. When it clears, it returns to **OK**, optionally with a "back to normal" message.',
      ], { verify: 'Alert state names and whether aggregation options exist on the condition.' }),
      card('alert-2', 'Destinations', [
        'Notifications go to **destinations** such as email, Slack, Microsoft Teams, PagerDuty or webhooks. These are usually set up once by a workspace **admin**.',
        'A triggered alert with no destination tells nobody.',
      ], { verify: 'Supported destination types and who can create them.' }),
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

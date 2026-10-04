import { questions } from './questions.js'

const card = (id, title, body, extra = {}) => ({ type: 'card', id: `c7-card-${id}`, title, body, ...extra })
const quiz = (...ids) => ({ type: 'quiz', ids })
const widget = (name) => ({ type: 'widget', name })

// Genie changes faster than any other exam topic: most cards carry a
// "verify in Databricks docs" flag.
const subsections = [
  {
    id: 'purpose',
    title: 'Purpose & Components',
    emoji: '🧞',
    blocks: [
      card('purpose-1', 'What Genie is for', [
        '**AI/BI Genie** lets business users ask questions about data in **natural language**. Genie writes the SQL, runs it on a **SQL warehouse**, and returns a table, a chart and an explanation.',
        'A **Genie space** is a curated, domain-specific setup (for example "Sales performance") that a data team builds for a specific audience.',
        'Genie answers **read-only** analytics questions. It doesn\'t change data.',
      ], { verify: 'Product naming and capabilities change quickly.' }),
      card('purpose-2', 'The building blocks', [
        '**Data**: Unity Catalog tables and views (keep it focused).',
        '**Compute**: a Pro or Serverless **SQL warehouse**.',
        '**Instructions**: business context in plain language, such as metric definitions, fiscal calendars and vocabulary.',
        '**Sample questions**: starters shown to users.',
        '**Trusted assets**: reviewed, parameterized example SQL or UC functions. Answers that use them are marked **Trusted**.',
      ], { verify: 'Newer options such as SQL expressions, join definitions and a knowledge store may exist.' }),
      card('purpose-3', 'Metadata is fuel', [
        'Genie reads **Unity Catalog metadata**: table names, column names and **comments**. `net_revenue` with a clear comment beats `amt_n` with none.',
        'Improving comments and descriptions in Catalog Explorer is one of the cheapest accuracy wins.',
      ]),
      quiz('c7-q-purpose', 'c7-q-components', 'c7-q-readonly', 'c7-q-uc-context', 'c7-q-vs-dashboard', 'c7-q-show-sql', 'c7-q-owner'),
    ],
  },
  {
    id: 'create',
    title: 'Creating a Space',
    emoji: '🛠️',
    blocks: [
      card('create-1', 'Curate the data', [
        'Start **small and focused**: a few curated gold tables or views that cover the audience\'s questions.',
        'Prefer **views** that pre-join and rename things the way the business talks. Add tables only when real questions need them.',
        'Leave out raw, overlapping or sensitive tables. Each one is another chance for Genie to pick the wrong source.',
      ], { verify: 'Maximum tables per space and the recommended starting size.' }),
      card('create-2', 'Instructions & sample questions', [
        '**Instructions** hold what the data can\'t tell Genie: "Revenue = SUM(net_revenue)", "fiscal year starts Feb 1", "Europe means EMEA".',
        'Keep them specific and short. Vague orders like "answer everything" make answers worse.',
        '**Sample questions** show users what works. Pick real, high-value questions the space answers well.',
      ]),
      card('create-3', 'Trusted assets & the warehouse', [
        '**Trusted assets** are reviewed, **parameterized** queries (or UC functions) for key metrics. When Genie uses one, the answer is labelled **Trusted**.',
        'Example SQL also teaches Genie your join keys and filters for similar questions.',
        'Pick a **SQL warehouse**. Serverless is usually best for chat-style, bursty use.',
      ], { verify: 'Trusted asset types, labels and supported warehouse types.' }),
      widget('genie-builder'),
      quiz(
        'c7-q-tables-few',
        'c7-q-instructions',
        'c7-q-samples',
        'c7-q-trusted',
        'c7-q-warehouse',
        'c7-q-views',
        'c7-q-ambiguous-cols',
        'c7-q-sample-quality',
        'c7-q-parameterized',
        'c7-q-instructions-length',
      ),
    ],
  },
  {
    id: 'share',
    title: 'Permissions & Sharing',
    emoji: '🤝',
    blocks: [
      card('share-1', 'Two layers of access', [
        '**Space permissions** decide who can chat with, edit or manage the space (for example CAN RUN / CAN EDIT / CAN MANAGE).',
        '**Data permissions** stay in Unity Catalog. Genie runs queries as the **asking user**, so they still need `USE CATALOG`, `USE SCHEMA` and `SELECT` on the data.',
        'Share with **groups**. Give consumers the lowest level that lets them chat.',
      ], { verify: 'Permission level names and whether queries run as the user.' }),
      card('share-2', 'Beyond the Databricks UI', [
        'The **Genie Conversation API** lets external apps start conversations and fetch answers. Use it for internal web apps or chat tools.',
        'Genie can also appear alongside **AI/BI dashboards**, so viewers can ask follow-up questions.',
        'Authentication and Unity Catalog governance still apply. Never share an owner\'s credentials.',
      ], { verify: 'API status, embedding options and supported integrations (e.g., chat tools) change often.' }),
      quiz('c7-q-perm-data', 'c7-q-perm-levels', 'c7-q-embed', 'c7-q-share-curate', 'c7-q-row-filter', 'c7-q-link-no-access', 'c7-q-dashboard-genie'),
    ],
  },
  {
    id: 'improve',
    title: 'Improving a Space',
    emoji: '📈',
    blocks: [
      card('improve-1', 'Listen to users', [
        'The space\'s **monitoring/history** view shows the questions users really ask, the SQL Genie generated, and **feedback** (thumbs up/down, review requests).',
        'Treat thumbs-down answers as bug reports. Usually the fix is a missing **definition**, **join** or **trusted asset**.',
      ], { verify: 'Name and location of the monitoring view.' }),
      card('improve-2', 'Measure with benchmarks', [
        '**Benchmarks** are test questions with expected (ground-truth) SQL. Run them before and after a change to measure accuracy and catch regressions.',
        'Typical loop: review feedback → update instructions, example SQL or trusted assets → re-run benchmarks → share.',
      ], { verify: 'Benchmark feature details.' }),
      card('improve-3', 'Keep context fresh', [
        'When tables change (new columns, renamed fields, better comments), make sure the space has the **current Unity Catalog metadata**, then re-test.',
        'Remove tables nobody needs. Focus beats breadth.',
      ], { verify: 'How Genie refreshes metadata.' }),
      quiz('c7-q-monitor', 'c7-q-benchmark', 'c7-q-feedback-loop', 'c7-q-metadata', 'c7-q-benchmark-design', 'c7-q-too-many-tables', 'c7-q-review-request'),
    ],
  },
]

export default {
  intro: 'Build a Genie space that business users can trust: curate the data, write sharp instructions, add trusted assets, share it safely, and improve it with real feedback.',
  subsections,
  questions,
  challenges: [],
}

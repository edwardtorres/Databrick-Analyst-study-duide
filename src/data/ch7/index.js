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
        'Genie answers **read-only** analytics questions: the SQL it generates is always read-only.',
        'Naming: the exam guide says **Genie spaces**. In the product, Databricks renamed them **Genie Agents** in 2026 (docs: "formerly known as Genie Spaces"). Same thing.',
      ]),
      card('purpose-2', 'The building blocks', [
        '**Data**: Unity Catalog tables, views and metric views (up to 50; keep it focused).',
        '**Compute**: a Pro or Serverless **SQL warehouse**.',
        '**Instructions**: business context in plain language, such as metric definitions, fiscal calendars and vocabulary.',
        '**Sample questions**: starters shown to users.',
        '**Example SQL queries** and **trusted assets**: parameterized example queries and Unity Catalog SQL functions are trusted assets, and answers that use them are shown as **verified answers**.',
        '**Knowledge store**: space-level table and column descriptions, synonyms, **join relationships** and **SQL expressions** (measures, filters, fields). It doesn\'t change Unity Catalog metadata.',
      ]),
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
        'Start **small and focused**: Databricks recommends **five or fewer tables** to begin with. The hard limit is **50** tables, views or metric views per space.',
        'Prefer **views** that pre-join and rename things the way the business talks. Add tables only when real questions need them.',
        'Leave out raw, overlapping or sensitive tables. Each one is another chance for Genie to pick the wrong source.',
      ]),
      card('create-2', 'Instructions & sample questions', [
        '**Instructions** hold what the data can\'t tell Genie: "Revenue = SUM(net_revenue)", "fiscal year starts Feb 1", "Europe means EMEA".',
        'Keep them specific and short. Vague orders like "answer everything" make answers worse.',
        '**Sample questions** show users what works. Pick real, high-value questions the space answers well.',
      ]),
      card('create-3', 'Trusted assets & the warehouse', [
        '**Trusted assets** are **parameterized** example queries and Unity Catalog **SQL functions**. A static (non-parameterized) example query is not a trusted asset. When Genie uses one, the response is a **verified answer**, and users can see the parameter values (users need EXECUTE on functions).',
        'Example SQL also teaches Genie your join keys and filters for similar questions.',
        'Pick a **Pro or Serverless SQL warehouse** (Classic isn\'t supported). Databricks recommends **Serverless**.',
      ]),
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
        '**Space permissions**: CAN VIEW and CAN RUN (identical: ask questions), CAN EDIT (instructions, tables, sample questions), CAN MANAGE (monitor, permissions, delete).',
        '**Data permissions** stay in Unity Catalog and are checked as the **asking user**, so they need `SELECT` (plus `USE CATALOG` / `USE SCHEMA`). Data they can\'t access comes back as an empty response.',
        '**Compute** is different: the warehouse runs with the **author\'s embedded credentials**, so users don\'t need warehouse permissions.',
        'Share with **groups**. Give consumers the lowest level that lets them chat.',
      ]),
      card('share-2', 'Beyond the Databricks UI', [
        'The **Genie API** (Conversation / Chat mode APIs) lets external apps and chatbots start conversations and fetch answers. You can also **embed** a space in an internal web app as an **iframe** once an admin allows the embedding surface.',
        'Published **AI/BI dashboards** include **Ask Genie** by default (the Enable Genie setting), so viewers can ask follow-up questions.',
        'Authentication and Unity Catalog governance still apply. Never share an owner\'s credentials.',
      ]),
      quiz('c7-q-perm-data', 'c7-q-perm-levels', 'c7-q-embed', 'c7-q-share-curate', 'c7-q-row-filter', 'c7-q-link-no-access', 'c7-q-dashboard-genie'),
    ],
  },
  {
    id: 'improve',
    title: 'Improving a Space',
    emoji: '📈',
    blocks: [
      card('improve-1', 'Listen to users', [
        'The space\'s **Monitor** tab (CAN MANAGE) shows the questions users really ask, Genie\'s responses, and **feedback**: each answer asks "Is this correct?" with **Yes**, **Fix it** or **Request review**.',
        'Treat "Fix it" and review requests as bug reports. Usually the fix is a missing **definition**, **join** or **trusted asset**. Feedback alone doesn\'t change Genie\'s behavior.',
      ]),
      card('improve-2', 'Measure with benchmarks', [
        '**Benchmarks** are test questions with an optional **SQL answer** (ground truth); up to 500 per space. Run them before and after a change to measure accuracy and catch regressions. Questions without a SQL answer need manual review.',
        'Typical loop: review feedback → update instructions, example SQL or trusted assets → re-run benchmarks → share.',
      ]),
      card('improve-3', 'Keep context fresh', [
        'When tables change (new columns, renamed fields, better comments), make sure the space uses the **current Unity Catalog metadata**: a space-level description overrides the UC one until you **Reset** it, and **prompt-matching values** need a **Refresh** when column values change. Then re-run benchmarks.',
        'Remove tables nobody needs. Focus beats breadth.',
      ]),
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

import { questions } from './questions.js'
import { challenges } from './challenges.js'

const card = (id, title, body, extra = {}) => ({ type: 'card', id: `c8-card-${id}`, title, body, ...extra })
const quiz = (...ids) => ({ type: 'quiz', ids })
const widget = (name) => ({ type: 'widget', name })
const challenge = (id) => ({ type: 'challenge', id })

const subsections = [
  {
    id: 'star',
    title: 'Star Schema',
    emoji: '⭐',
    blocks: [
      card('star-1', 'Facts, dimensions and grain', [
        'A **fact table** records business events: **measures** (quantity, amount) plus **keys** to dimensions. It is long and keeps growing.',
        '**Dimension tables** describe the who/what/where/when: customer, product, store, **date**. They are wide, descriptive, and used to filter and group.',
        '**Grain** = what one fact row means, e.g. "one row per order line". **Declare it first.** Every measure must be true at that grain.',
      ]),
      card('star-2', 'Details that show up in questions', [
        '**Additive** measures sum across everything (amount). **Semi-additive** ones don\'t sum over time (account balance).',
        'A **degenerate dimension** (order_id) is an ID with no attributes. It stays in the fact.',
        '**SCD Type 1** overwrites a changed attribute; **Type 2** adds a new row with validity dates to keep history.',
        'Add an **"Unknown" member** to each dimension so facts with missing keys still join.',
      ], { verify: 'Databricks helpers for SCD (APPLY CHANGES / AUTO CDC) and identity columns for surrogate keys.' }),
      widget('star-schema-builder'),
      quiz('c8-q-fact-vs-dim', 'c8-q-grain', 'c8-q-grain-choice', 'c8-q-measure-placement', 'c8-q-degenerate', 'c8-q-date-dim', 'c8-q-additive', 'c8-q-scd2'),
    ],
  },
  {
    id: 'snowflake-vault',
    title: 'Snowflake & Data Vault',
    emoji: '❄️',
    blocks: [
      card('sv-1', 'Snowflake schema', [
        'A **snowflake** normalizes dimensions into sub-dimensions: dim_store → dim_region, dim_product → dim_category.',
        '**Pros:** less redundancy, shared hierarchies maintained once. **Cons:** more joins, harder for BI users.',
        'For gold BI models, teams usually keep the **star** (flattened dimensions).',
      ]),
      card('sv-2', 'Data vault', [
        '**Hubs**: unique business keys (customer_id). **Links**: relationships between hubs (customer ↔ order). **Satellites**: descriptive attributes with **history**, load date and record source.',
        'Insert-only and auditable. New sources plug in as new satellites and links. Built for **integration**, not for direct BI querying.',
        'Normalized **3NF**-style entity models are the other common integration choice.',
      ]),
      card('sv-3', 'Keys in Unity Catalog', [
        '`PRIMARY KEY` and `FOREIGN KEY` constraints are **informational**: they document relationships (tools and the optimizer can use them) but **aren\'t enforced**.',
        'Check uniqueness and referential integrity yourself, for example with pipeline expectations.',
      ], { verify: 'Constraint behavior and the RELY option.' }),
      quiz('c8-q-snowflake', 'c8-q-star-vs-snowflake', 'c8-q-snowflake-when', 'c8-q-vault-parts', 'c8-q-vault-hub', 'c8-q-vault-why', 'c8-q-normalized-3nf', 'c8-q-constraints'),
    ],
  },
  {
    id: 'medallion',
    title: 'Models in the Medallion Architecture',
    emoji: '🥇',
    blocks: [
      card('md-1', 'Three layers', [
        '**Bronze**: raw, as received, append-only, plus load metadata. The replayable record.',
        '**Silver**: cleaned, typed, **deduplicated** and **conformed** across sources. Often modeled as **data vault** or **3NF**.',
        '**Gold**: business-ready **star schemas**, **aggregates** and features for specific reports and uses. Certify what people should use.',
      ]),
      card('md-2', 'Why it pays off', [
        'Quality and business meaning increase layer by layer. A bug in silver logic? Fix it and **rebuild from bronze**.',
        'Lakeflow Declarative Pipelines (formerly DLT) declare each layer with **expectations** and handle dependencies.',
      ], { verify: 'Pipeline product naming.' }),
      widget('medallion-sorter'),
      quiz('c8-q-medallion-layers', 'c8-q-medallion-models', 'c8-q-bronze-keep', 'c8-q-dedupe-layer', 'c8-q-gold-consumers', 'c8-q-medallion-pipeline'),
    ],
  },
  {
    id: 'modeling-sql',
    title: 'Querying a Star in SQL',
    emoji: '🔗',
    blocks: [
      card('sql-1', 'The sandbox as a star', [
        '`orders` is the **fact** (grain: one order line). `customers` and `products` are **dimensions**. `regions` hangs off customers: a **snowflaked** branch.',
        'Star query shape: join the fact to dimensions on keys, **filter and group by attributes**, **aggregate measures**.',
      ]),
      card('sql-2', 'Two grain traps', [
        '**Fan-out**: joining a coarse table (one target per category) to fine facts repeats the coarse values. Aggregate the fact to that grain **first**.',
        '**Lost rows**: INNER JOIN drops facts with missing keys. Use LEFT JOIN + COALESCE to an "Unknown" bucket so totals reconcile.',
      ], { tip: 'Before any SUM after a join, ask: what is the grain of each side?' }),
      challenge('c8-star-two-dims'),
      challenge('c8-snowflake-region'),
      challenge('c8-grain-monthly'),
      challenge('c8-fix-fanout'),
      challenge('c8-unknown-member'),
      quiz('c8-q-fanout', 'c8-q-unknown-member', 'c8-q-snowflake-join', 'c8-q-aggregate-table'),
    ],
  },
]

export default {
  intro: 'Model data for analytics: star schemas with a clear grain, when snowflaking or data vault fits, and how models map onto bronze, silver and gold.',
  subsections,
  questions,
  challenges,
}

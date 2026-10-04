import { questions } from './questions.js'
import { challenges } from './challenges.js'

const card = (id, title, body, extra = {}) => ({ type: 'card', id: `c2-card-${id}`, title, body, ...extra })
const quiz = (...ids) => ({ type: 'quiz', ids })
const widget = (name) => ({ type: 'widget', name })
const challenge = (id) => ({ type: 'challenge', id })

const subsections = [
  {
    id: 'discover',
    title: 'Discovering Certified Data',
    emoji: '🔍',
    blocks: [
      card('disc-1', 'Find the trusted table', [
        '**Search** Catalog Explorer by name, comment or tag. Several tables often look right: a certified one, a **deprecated** legacy one, someone\'s personal copy.',
        'Prefer the **Certified** asset (check mark), then confirm the **owner** and **comment** match your use. Certified and deprecated (restricted icon) are values of the governed system tag `system.certification_status`.',
      ]),
      card('disc-2', 'Then query it', [
        'Use the full **three-level name** `catalog.schema.table` so the query works from any context.',
        'Seeing a table isn\'t the same as reading it: you need **USE CATALOG**, **USE SCHEMA** and **SELECT**. Ask the owner if SELECT fails.',
        'Peek at **Overview** (columns, comments) and **Sample Data** before writing SQL.',
      ]),
      widget('catalog-explorer'),
      quiz('c2-q-find-certified', 'c2-q-deprecated', 'c2-q-search', 'c2-q-three-level', 'c2-q-sample-data', 'c2-q-no-select'),
    ],
  },
  {
    id: 'tags-lineage',
    title: 'Tags & Lineage',
    emoji: '🏷️',
    blocks: [
      card('tag-1', 'Tags', [
        '**Tags** are key/value labels on catalogs, schemas, tables and **columns**, for example `pii = email` or `domain = sales`.',
        'Add them in Catalog Explorer or with SQL: `ALTER TABLE t ALTER COLUMN email SET TAGS (\'pii\' = \'email\')`, or the newer `SET TAG ON COLUMN t.email pii = email`. You need **APPLY TAG** on the object (plus USE CATALOG / USE SCHEMA), or ownership.',
        '**Governed tags** are account-level tags whose allowed keys and values come from a **tag policy**; assigning one also needs the **ASSIGN** permission. Up to 50 tags per object.',
        'Tags drive **search**, reporting (information_schema) and can feed governance policies. Comments are free text for humans and AI; tags are structured.',
      ]),
      card('tag-2', 'Lineage', [
        'Unity Catalog records **lineage automatically** from queries it runs: tables, views, notebooks, jobs, dashboards, down to **columns**.',
        '**Downstream** = impact analysis ("what breaks if I change this?"). Keep following hops: dashboards often sit behind a view.',
        '**Upstream** = root cause ("where did this number come from?").',
        'Work done outside Unity Catalog leaves no lineage.',
        'Retention: lineage in Catalog Explorer is kept indefinitely (data from Sep 1, 2024 on). The system tables `system.access.table_lineage` and `system.access.column_lineage` keep a rolling **1 year**.',
      ]),
      quiz('c2-q-tag-why', 'c2-q-tag-sql', 'c2-q-tag-vs-comment', 'c2-q-lineage-what', 'c2-q-lineage-impact', 'c2-q-lineage-root', 'c2-q-lineage-missing', 'c2-q-owner'),
    ],
  },
  {
    id: 'cleaning',
    title: 'Cleaning Data in SQL',
    emoji: '🧽',
    blocks: [
      card('clean-1', 'Missing and invalid values', [
        '`COALESCE(x, default)` replaces **NULL only**. Turn placeholders into NULL first with `NULLIF(x, \'\')` or a `CASE`.',
        'Exclude invalid rows with positive rules: `WHERE quantity > 0 AND status IN (…)`. Remember `NULL NOT IN (…)` is unknown, so NULLs drop out unless you add `OR x IS NULL`.',
        'Use `CASE` to **flag** rows instead of deleting them. The first true WHEN wins.',
      ]),
      card('clean-2', 'Text, types and duplicates', [
        '**Standardize** text with `LOWER(TRIM(x))` before grouping or joining.',
        '**Cast** after cleaning: `CAST(REPLACE(x, \'$\', \'\') AS DECIMAL(10,2))`. Databricks SQL runs in **ANSI mode** by default (accounts since Oct 2022), so a bad cast fails the query; `try_cast` returns NULL instead.',
        '**Dedupe**: `DISTINCT` for identical rows; `ROW_NUMBER() OVER (PARTITION BY key ORDER BY updated DESC)` = 1 to keep the latest of rows that differ. Normalize the key first.',
        '**Orphans**: `LEFT JOIN` + `COALESCE(name, \'Unassigned\')` keeps rows with bad keys visible.',
      ], { tip: 'Profile first: SELECT col, COUNT(*) GROUP BY col shows the junk values.' }),
      challenge('c2-clean-email'),
      challenge('c2-fix-usable-email'),
      challenge('c2-clean-valid-orders'),
      challenge('c2-clean-quality-flag'),
      challenge('c2-clean-standardize'),
      challenge('c2-clean-distinct'),
      challenge('c2-clean-latest'),
      challenge('c2-fix-cast'),
      challenge('c2-clean-region'),
      quiz('c2-q-coalesce', 'c2-q-nullif', 'c2-q-count-null', 'c2-q-not-in-null', 'c2-q-invalid-values', 'c2-q-case-order', 'c2-q-trim-lower', 'c2-q-distinct-vs-rownum', 'c2-q-dedupe-key', 'c2-q-try-cast', 'c2-q-orphans', 'c2-q-clean-where'),
    ],
  },
]

export default {
  intro: 'Find and trust the right data, label it with tags, follow lineage to see impact, and clean messy values in SQL.',
  subsections,
  questions,
  challenges,
}

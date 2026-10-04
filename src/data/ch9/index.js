import { questions } from './questions.js'

const card = (id, title, body, extra = {}) => ({ type: 'card', id: `c9-card-${id}`, title, body, ...extra })
const quiz = (...ids) => ({ type: 'quiz', ids })
const widget = (name) => ({ type: 'widget', name })

const subsections = [
  {
    id: 'namespace',
    title: 'The 3-Level Namespace',
    emoji: '🗂️',
    blocks: [
      card('ns-1', 'catalog.schema.object', [
        'Unity Catalog organizes data in three levels under a **metastore**: **catalog** → **schema** → **object**.',
        'Objects include **tables**, **views**, **materialized views**, **volumes**, **functions**, and **models** (and newer ones such as metric views and services). A table is always addressed as `catalog.schema.table`. There is **one metastore per region**.',
        'Catalogs often split environments or domains (for example `dev`, `prod`, `finance`). Schemas group related objects (for example `bronze`, `gold`).',
      ]),
      card('ns-2', 'Volumes: governed files', [
        'A **volume** stores non-tabular files (CSV, JSON, images, PDFs) under the same namespace and permissions: `/Volumes/<catalog>/<schema>/<volume>/<path>`.',
        'Volumes can be **managed** (Unity Catalog chooses the storage) or **external** (they point at a path covered by an external location).',
      ], { code: `LIST '/Volumes/prod/raw/landing/';
SELECT * FROM read_files('/Volumes/prod/raw/landing/orders.csv', format => 'csv');` }),
      card('ns-3', 'Current catalog & schema', [
        '`USE CATALOG prod;` and `USE SCHEMA finance;` set the defaults, so unqualified names resolve to `prod.finance.<name>`.',
        'Exam trap: `USE CATALOG` is **also the name of a privilege**. The statement sets your default catalog. The privilege lets you access the catalog at all.',
        'Legacy workspace tables show up under the `hive_metastore` catalog.',
      ]),
      widget('namespace-builder'),
      quiz('c9-q-ns-fqn', 'c9-q-ns-volume', 'c9-q-ns-use', 'c9-q-ns-top'),
    ],
  },
  {
    id: 'privileges',
    title: 'Privileges & Roles',
    emoji: '🔑',
    blocks: [
      card('priv-1', 'The privileges you must know', [
        '`USE CATALOG` and `USE SCHEMA`: required just to reach anything inside the catalog or schema.',
        '`SELECT`: read a table or view. `MODIFY`: insert, update, or delete table data.',
        '`READ VOLUME` and `WRITE VOLUME`: read files, or add and remove files, in a volume.',
        '`CREATE SCHEMA` (on a catalog) and `CREATE TABLE` (on a schema): create new objects. `EXECUTE`: run functions. `ALL PRIVILEGES`: everything applicable (but **not** MANAGE), so use it sparingly.',
        '`BROWSE` (on a catalog): see objects\' names, descriptions and tags and request access, with no data access. `MANAGE`: manage privileges, transfer ownership and drop an object without owning it.',
      ], { tip: 'To query catalog.schema.table you need three grants: USE CATALOG + USE SCHEMA + SELECT.' }),
      card('priv-2', 'Inheritance & groups', [
        'Privileges granted on a catalog or schema are **inherited** by every current **and future** object below it. `GRANT SELECT ON SCHEMA prod.gold` covers tables created next month.',
        'Grant to **groups** (or service principals), not individual users. Then access follows group membership.',
        'There is no DENY. Access is additive, and you remove it with `REVOKE`.',
      ], {
        code: `GRANT USE CATALOG ON CATALOG prod TO \`analysts\`;
GRANT USE SCHEMA, SELECT ON SCHEMA prod.gold TO \`analysts\`;
SHOW GRANTS ON SCHEMA prod.gold;
REVOKE SELECT ON SCHEMA prod.gold FROM \`contractors\`;`,
      }),
      card('priv-3', 'Admin roles', [
        '**Account admins** manage the account: create metastores and workspaces, link them, assign admin roles. **Metastore admins** (an **optional** role) govern data access and ownership in a metastore. **Workspace admins** manage a workspace and, in newer workspaces, can create catalogs.',
        "**Object owners** hold every privilege on the objects they own and can grant others access to them.",
        'Views: readers need `SELECT` on the view (plus USE CATALOG / USE SCHEMA), not on the base tables. On SQL warehouses and standard or serverless compute, the view **owner\'s** access to the base tables is checked, which is how a view can expose a safe subset.',
      ]),
      quiz('c9-q-priv-use', 'c9-q-priv-schema', 'c9-q-priv-groups', 'c9-q-priv-least', 'c9-q-priv-show', 'c9-q-priv-revoke', 'c9-q-priv-volume', 'c9-q-priv-view'),
    ],
  },
  {
    id: 'ownership',
    title: 'Table Ownership',
    emoji: '👑',
    blocks: [
      card('own-1', 'Who owns what', [
        'The principal that **creates** an object becomes its **owner**. Every securable always has exactly one owner.',
        'Owners can read, modify, alter, and drop the object, and **grant** privileges on it to others.',
        'Ownership doesn\'t **inherit** downward, but owners of a **catalog or schema can manage** all child objects (grant on them, transfer them). `MANAGE` lets someone do the same without owning the object.',
        'To read data, an owner still needs `USE CATALOG` and `USE SCHEMA` on the parents: usage privileges are a prerequisite for working with objects.',
      ]),
      card('own-2', 'Make groups the owners', [
        'If a person owns production tables and leaves, someone has to fix ownership. Make a **group** the owner from the start.',
        'Transfer ownership with `ALTER ... OWNER TO`. Catalog Explorer can also do this from the object\'s overview.',
      ], { code: `ALTER TABLE prod.gold.orders OWNER TO \`data-engineering\`;
ALTER SCHEMA prod.gold OWNER TO \`data-engineering\`;` }),
      quiz('c9-q-own-creator', 'c9-q-own-transfer', 'c9-q-own-use', 'c9-q-own-grant'),
    ],
  },
  {
    id: 'pii',
    title: 'Protecting PII',
    emoji: '🕶️',
    blocks: [
      card('pii-1', 'Column masks', [
        'A **column mask** is a SQL function attached to a column. It runs at query time and returns the real value or a masked one depending on the caller.',
        'Use one when **everyone uses the same table** but only some people may see a sensitive column. Works on SQL warehouses and serverless; classic clusters need DBR 12.2+ (older runtimes return no data), and dedicated clusters need DBR 15.4+ with serverless enabled.',
      ], {
        code: `CREATE FUNCTION prod.hr.ssn_mask(ssn STRING)
RETURN CASE WHEN is_account_group_member('hr') THEN ssn
            ELSE concat('***-**-', right(ssn, 4)) END;

ALTER TABLE prod.hr.employees ALTER COLUMN ssn SET MASK prod.hr.ssn_mask;`,
        }),
      card('pii-2', 'Row filters', [
        'A **row filter** is a boolean SQL function attached to a table. Only rows where it returns true are visible to that user.',
        'Use one when people should see **different rows** of the same table, for example only their region.',
      ], {
        code: `CREATE FUNCTION prod.sales.region_filter(region STRING)
RETURN is_account_group_member('sales_admins')
    OR (region = 'EMEA' AND is_account_group_member('emea_managers'));

ALTER TABLE prod.sales.orders SET ROW FILTER prod.sales.region_filter ON (region);`,
      }),
      card('pii-3', 'Dynamic views & tags', [
        'A **dynamic view** puts the redaction and row logic in a view, using `is_account_group_member()` or `current_user()`. Grant `SELECT` on the **view**, not on the base table.',
        'Use `is_account_group_member()` (account-level groups) rather than the legacy, workspace-level `is_member()`.',
        '**Tags** (for example `pii = email`) label data for discovery and governance. On their own they **do not** restrict access, but **ABAC policies** can use governed tags to apply row filters and column masks automatically everywhere the tag appears.',
      ], {
        code: `CREATE VIEW prod.share.v_customers AS
SELECT customer_id,
       CASE WHEN is_account_group_member('support') THEN email ELSE 'REDACTED' END AS email,
       region
FROM prod.crm.customers
WHERE region = 'US' OR is_account_group_member('global_support');`,
        }),
      quiz('c9-q-pii-mask', 'c9-q-pii-row', 'c9-q-pii-dynview', 'c9-q-pii-func', 'c9-q-pii-tags'),
    ],
  },
]

export default {
  intro: 'Decide who can see what. You will practice the namespace, privileges, ownership, and the tools for hiding sensitive data, then prove it in the Namespace Builder.',
  subsections,
  questions,
  challenges: [],
}

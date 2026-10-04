// Chapter 9 question bank: Securing Data. Original, scenario-style questions.
// Every option has a `why`; `verify` flags facts that may have changed.

export const questions = [
  // ---------------- 3-level namespace ----------------
  {
    id: 'c9-q-ns-fqn',
    sub: 'namespace',
    stem: 'The table daily_kpis lives in the finance schema of the prod catalog. What is its fully qualified name in Unity Catalog?',
    options: [
      { t: 'prod.finance.daily_kpis', ok: true, why: 'Unity Catalog names objects catalog.schema.object.' },
      { t: 'finance.prod.daily_kpis', why: 'The order is wrong: the catalog comes first, then the schema.' },
      { t: 'prod/finance/daily_kpis', why: 'Slash paths are for volumes (/Volumes/...), not tables.' },
      { t: 'daily_kpis@prod.finance', why: 'Not valid syntax. (@vN is Delta time-travel shorthand, which is unrelated.)' },
    ],
  },
  {
    id: 'c9-q-ns-volume',
    sub: 'namespace',
    scenario: true,
    stem: 'Partners drop CSV and PDF files that the team must govern with the same permissions model as tables. Where should those files live?',
    options: [
      { t: 'In a Unity Catalog volume, read at a path like /Volumes/prod/finance/partner_files/', ok: true, why: 'Volumes are Unity Catalog objects for non-tabular files, governed with privileges such as READ VOLUME and WRITE VOLUME.' },
      { t: 'In a managed table, one row per file', why: 'Tables hold tabular data. Raw files belong in a volume.' },
      { t: 'In a view over the S3 bucket', why: 'Views are saved queries over tables. They do not store or govern files.' },
      { t: "Anywhere in the bucket, since Unity Catalog can't govern files", why: 'Unity Catalog governs files too, through volumes and external locations.' },
    ],
  },
  {
    id: 'c9-q-ns-use',
    sub: 'namespace',
    stem: 'You run USE CATALOG prod; USE SCHEMA finance; and then SELECT * FROM daily_kpis. Which table is read?',
    options: [
      { t: 'prod.finance.daily_kpis', ok: true, why: 'The USE statements set the current catalog and schema, so unqualified names resolve against them.' },
      { t: 'hive_metastore.default.daily_kpis', why: 'That would apply only if the current catalog were hive_metastore.' },
      { t: 'The query fails because unqualified names are never allowed', why: 'Unqualified names are fine. They resolve against the current catalog and schema.' },
      { t: 'Every daily_kpis table in every catalog', why: 'A name always resolves to exactly one object.' },
    ],
  },
  {
    id: 'c9-q-ns-top',
    sub: 'namespace',
    stem: 'In Unity Catalog, which container sits above catalogs and holds the metadata for them?',
    options: [
      { t: 'The metastore', ok: true, why: 'There is one metastore per region; all workspaces in the region share it. A metastore is the top-level container (typically one per region). Catalogs live inside it.' },
      { t: 'The schema', why: 'Schemas live inside catalogs, not above them.' },
      { t: 'The workspace', why: 'Workspaces attach to a metastore. They are not part of the object namespace.' },
      { t: 'The SQL warehouse', why: 'Warehouses are compute. They hold no metadata.' },
    ],
  },

  // ---------------- Privileges ----------------
  {
    id: 'c9-q-priv-use',
    sub: 'privileges',
    scenario: true,
    stem: 'An analyst was granted SELECT on prod.finance.daily_kpis but still gets a permission error when querying it. What is the most likely cause?',
    options: [
      { t: 'They lack USE CATALOG on prod and/or USE SCHEMA on prod.finance', ok: true, why: 'Reading a table also requires USE CATALOG on its catalog and USE SCHEMA on its schema.' },
      { t: 'SELECT only works after the table is OPTIMIZEd', why: 'OPTIMIZE affects file layout, not permissions.' },
      { t: 'They also need MODIFY to read data', why: 'MODIFY is for changing data. Reading needs SELECT, plus USE on the parents.' },
      { t: 'The SQL warehouse needs SELECT granted to it', why: 'Privileges go to users, groups, or service principals, not warehouses.' },
    ],
  },
  {
    id: 'c9-q-priv-schema',
    sub: 'privileges',
    scenario: true,
    stem: 'The analysts group should be able to read every table in prod.gold, including tables created next month, with as few grants as possible. What do you grant?',
    options: [
      { t: 'USE CATALOG on prod, plus USE SCHEMA and SELECT on the schema prod.gold, to the group', ok: true, why: 'Privileges granted on a schema are inherited by all current and future objects in it.' },
      { t: 'SELECT on each table individually', why: 'This works for today, but new tables would need new grants.' },
      { t: 'ALL PRIVILEGES on the prod catalog', why: 'This grants far more than read access and breaks least privilege.' },
      { t: 'SELECT on prod.gold to each analyst user', why: 'Grant to groups. Per-user grants are hard to manage and audit.' },
    ],
  },
  {
    id: 'c9-q-priv-groups',
    sub: 'privileges',
    stem: 'Why is it best practice to grant privileges to groups rather than to individual users?',
    options: [
      { t: 'Access follows group membership, so onboarding and offboarding become a membership change instead of many grant changes', ok: true, why: 'Grants stay stable and auditable, and identity management handles who is in the group.' },
      { t: 'Users cannot receive grants in Unity Catalog', why: 'Users can receive grants. It is just harder to manage at scale.' },
      { t: 'Group grants make queries run faster', why: 'Permissions have no effect on query performance.' },
      { t: 'Group grants bypass the need for USE CATALOG', why: 'The USE requirements apply no matter who receives the grant.' },
    ],
  },
  {
    id: 'c9-q-priv-least',
    sub: 'privileges',
    scenario: true,
    stem: 'A BI team only builds dashboards on prod.gold tables. They must never change data. Which table-level privilege should they get?',
    options: [
      { t: 'SELECT', ok: true, why: 'Read-only access is exactly what they need. That is least privilege.' },
      { t: 'MODIFY', why: 'MODIFY lets them insert, update, and delete data.' },
      { t: 'ALL PRIVILEGES', why: 'This includes write access and more.' },
      { t: 'Ownership of the tables', why: 'Owners can alter, drop, and grant. That is far too much.' },
    ],
  },
  {
    id: 'c9-q-priv-show',
    sub: 'privileges',
    stem: 'An auditor asks who has access to prod.finance.payroll. Which command answers that directly?',
    options: [
      { t: 'SHOW GRANTS ON TABLE prod.finance.payroll', ok: true, why: 'SHOW GRANTS lists the principals and privileges on a securable. Catalog Explorer has a Permissions tab with the same information.' },
      { t: 'DESCRIBE HISTORY prod.finance.payroll', why: 'This shows table versions and operations, not permissions.' },
      { t: 'SELECT current_user()', why: 'This returns only your own identity.' },
      { t: 'SHOW TABLES IN prod.finance', why: 'This lists tables, not who can access them.' },
    ],
  },
  {
    id: 'c9-q-priv-revoke',
    sub: 'privileges',
    stem: 'A contractor group should immediately lose read access to the prod.gold schema. Which statement does that?',
    options: [
      { t: 'REVOKE SELECT ON SCHEMA prod.gold FROM `contractors`', ok: true, why: 'REVOKE removes a privilege that was granted. The syntax mirrors GRANT, with FROM instead of TO.' },
      { t: 'DENY SELECT ON SCHEMA prod.gold TO `contractors`', why: 'The DENY statement is not supported by Unity Catalog (it applies only to the legacy hive_metastore). You remove access with REVOKE. (Separately, ABAC DENY policies exist in Beta.)' },
      { t: 'DROP SCHEMA prod.gold', why: 'This deletes the schema for everyone.' },
      { t: 'GRANT NONE ON SCHEMA prod.gold TO `contractors`', why: 'Not valid syntax.' },
    ],
  },
  {
    id: 'c9-q-priv-volume',
    sub: 'privileges',
    stem: 'Data scientists need to read (not write) files in the volume prod.raw.landing. Which privilege, on top of USE CATALOG and USE SCHEMA?',
    options: [
      { t: 'READ VOLUME', ok: true, why: 'READ VOLUME allows reading and listing the files in a volume.' },
      { t: 'SELECT', why: 'SELECT applies to tables and views, not volumes.' },
      { t: 'WRITE VOLUME', why: 'WRITE VOLUME allows adding and deleting files. That is more than reading.' },
      { t: 'MODIFY', why: 'MODIFY applies to table data.' },
    ],
  },
  {
    id: 'c9-q-priv-view',
    sub: 'privileges',
    scenario: true,
    stem: 'You want analysts to see only an aggregated view, prod.gold.v_region_sales, but never the underlying detail table. What do they need?',
    options: [
      { t: 'SELECT on the view (plus USE CATALOG and USE SCHEMA). No access to the base table is needed.', ok: true, why: 'On SQL warehouses and standard or serverless compute, Unity Catalog checks the view owner\'s permissions on the base table. Readers only need SELECT on the view. (Dedicated clusters on DBR 15.3 and below are the exception.)' },
      { t: 'SELECT on both the view and the base table', why: 'That would expose the detail table, which is exactly what you want to avoid.' },
      { t: 'MODIFY on the view', why: 'MODIFY is not needed to read, and views are not written to directly.' },
      { t: 'Ownership of the view', why: 'Owning it would let them redefine the view. That is far too much.' },
    ],
  },

  // ---------------- Ownership ----------------
  {
    id: 'c9-q-own-creator',
    sub: 'ownership',
    stem: 'Raj creates a table prod.gold.churn_scores. Who owns it right after creation?',
    options: [
      { t: 'Raj, the principal who created it', ok: true, why: 'The creator becomes the owner of a new securable.' },
      { t: 'The owner of the prod catalog', why: 'Parent ownership does not transfer to newly created child objects.' },
      { t: 'The metastore admin', why: 'Admins can manage objects, but the creator is the owner.' },
      { t: 'Nobody until ownership is assigned', why: 'Every securable always has an owner.' },
    ],
  },
  {
    id: 'c9-q-own-transfer',
    sub: 'ownership',
    scenario: true,
    stem: 'The engineer who owns 40 production tables is leaving the company next week. What is the best fix?',
    options: [
      { t: 'Transfer ownership to a group (e.g., ALTER TABLE ... OWNER TO `data-engineering`) and make groups the owners from now on', ok: true, why: 'Group ownership survives people leaving, and group membership controls who can manage the tables.' },
      { t: 'Copy every table with CTAS under a new owner', why: 'This duplicates data and breaks history and lineage just to change the owner.' },
      { t: 'Do nothing, since ownership disappears automatically when the user is removed', why: 'Ownership does not move automatically. The objects need a new owner.' },
      { t: "Grant everyone ALL PRIVILEGES so it doesn't matter", why: 'This destroys least privilege.' },
    ],
  },
  {
    id: 'c9-q-own-use',
    sub: 'ownership',
    stem: 'Raj owns the table prod.gold.orders but has no privileges on the prod catalog or the prod.gold schema. Can he query his table?',
    options: [
      { t: 'No. Even an owner needs USE CATALOG on prod and USE SCHEMA on prod.gold to reach the table.', ok: true, why: 'Docs: usage privileges are a prerequisite to interact with an object; only MANAGE has reduced usage requirements, and only for metadata. Owning an object gives every privilege on that object, but not on its parents.' },
      { t: 'Yes. Ownership overrides every other check.', why: 'Ownership covers the owned object only. You still have to be able to reach it through the catalog and schema.' },
      { t: 'Only through a SQL warehouse he also owns', why: 'Warehouse ownership has nothing to do with data privileges.' },
      { t: 'Only if he first runs OPTIMIZE', why: 'OPTIMIZE has nothing to do with access.' },
    ],
  },
  {
    id: 'c9-q-own-grant',
    sub: 'ownership',
    stem: 'Who can grant SELECT on prod.gold.orders to another group?',
    options: [
      { t: 'The table owner, the owner of its schema or catalog, a user with MANAGE on it, or a metastore admin', ok: true, why: 'These are exactly the principals the docs list. Ordinary readers cannot pass access on.' },
      { t: 'Anyone who has SELECT on it', why: 'Holding SELECT does not let you grant it to others.' },
      { t: 'Anyone with access to the SQL warehouse', why: 'Compute access has nothing to do with data grants.' },
      { t: 'Only Databricks support', why: 'Grants are managed by your own owners and admins.' },
    ],
  },

  // ---------------- PII protection ----------------
  {
    id: 'c9-q-pii-mask',
    sub: 'pii',
    scenario: true,
    stem: 'HR must see full Social Security numbers in prod.hr.employees. Everyone else querying the same table should see ***-**-1234. Which feature fits best?',
    options: [
      { t: 'A column mask on the ssn column, using a function that checks group membership', ok: true, why: 'Column masks rewrite a column\'s value at query time based on who is asking. Everyone uses the same table.' },
      { t: 'A row filter', why: 'Row filters hide whole rows. They do not change a column\'s value.' },
      { t: 'Revoke SELECT from everyone except HR', why: 'Others still need the rest of the table, just without the full SSN.' },
      { t: "Tag the column as 'pii'", why: 'A tag labels data for discovery and classification. It does not mask anything by itself.' },
    ],
  },
  {
    id: 'c9-q-pii-row',
    sub: 'pii',
    scenario: true,
    stem: 'Regional managers should see only rows for their own region in prod.sales.orders, without separate tables per region. What do you use?',
    options: [
      { t: 'A row filter function attached to the table (e.g., keyed on the region column and the user\'s groups)', ok: true, why: 'Row filters return only the rows a user may see, evaluated at query time on the single table.' },
      { t: 'A column mask on region', why: 'A mask changes values in a column. It does not remove rows.' },
      { t: 'One copy of the table per region', why: 'This duplicates data and governance work. Row filters solve it in place.' },
      { t: 'ORDER BY region in every dashboard', why: 'Sorting is not security.' },
    ],
  },
  {
    id: 'c9-q-pii-dynview',
    sub: 'pii',
    scenario: true,
    stem: 'A partner group needs a redacted slice of customer data. You cannot change the base table, and you want the logic in one SQL object. What is the classic approach?',
    options: [
      { t: 'A dynamic view that uses is_account_group_member() in CASE/WHERE logic, with SELECT granted on the view only', ok: true, why: 'Dynamic views apply redaction and row logic based on the caller, and the base table stays untouched and ungranted.' },
      { t: 'A materialized view with the PII removed, refreshed nightly', why: 'This can work, but it is a stored copy, and the logic is not evaluated per user.' },
      { t: 'A temporary view', why: 'Temp views are session-scoped. The partner group could not use one.' },
      { t: 'Granting SELECT on the base table and trusting them', why: 'That exposes the raw PII.' },
    ],
  },
  {
    id: 'c9-q-pii-func',
    sub: 'pii',
    stem: 'In a Unity Catalog row filter, column mask, or dynamic view, which function checks whether the querying user belongs to an account-level group?',
    options: [
      { t: "is_account_group_member('group_name')", ok: true, why: 'This checks account-level groups, which are the ones Unity Catalog uses.' },
      { t: "is_member('group_name')", why: 'is_member checks workspace-local groups. It is the legacy option and not recommended with Unity Catalog.' },
      { t: 'current_user()', why: 'This returns the user name, not group membership. It is useful for per-user rules.' },
      { t: "has_privilege('SELECT')", why: 'Not a Databricks SQL function.' },
    ],
  },
  {
    id: 'c9-q-pii-tags',
    sub: 'pii',
    stem: "You add the tag pii = 'email' to a column. What does this do on its own?",
    options: [
      { t: 'It labels the column for discovery, search, and governance policies. It does not restrict access by itself.', ok: true, why: 'Tags are metadata. Access is enforced by privileges, masks, filters, or ABAC policies that target governed tags (then the policy, not the tag, applies the mask).' },
      { t: 'It automatically masks the column for everyone', why: 'Tagging alone does not mask. You need a mask or a policy for that.' },
      { t: 'It encrypts the column at rest', why: 'Tags do not change how data is stored.' },
      { t: 'It revokes SELECT from all non-admins', why: 'Tags do not change grants.' },
    ],
  },
]

import { lazy } from 'react'

// Each lab is its own chunk, loaded the first time it's opened.
// Rule: labs are tap-based (taps, selects, checkboxes). Don't add drag-and-
// drop to new labs. The Namespace Builder keeps its drag, which tap-to-place
// fully duplicates.
const JoinVisualizer = lazy(() => import('./JoinVisualizer.jsx'))
const SetOps = lazy(() => import('./SetOps.jsx'))
const TimeTravel = lazy(() => import('./TimeTravel.jsx'))
const NamespaceBuilder = lazy(() => import('./NamespaceBuilder.jsx'))
const GenieBuilder = lazy(() => import('./GenieBuilder.jsx'))
const ChartPicker = lazy(() => import('./ChartPicker.jsx'))
const DashboardConfig = lazy(() => import('./DashboardConfig.jsx'))
const QueryProfileDetective = lazy(() => import('./QueryProfileDetective.jsx'))
const CacheLab = lazy(() => import('./CacheLab.jsx'))
const PlatformMatch = lazy(() => import('./PlatformMatch.jsx'))
const CatalogExplorer = lazy(() => import('./CatalogExplorer.jsx'))
const IngestionPicker = lazy(() => import('./IngestionPicker.jsx'))
const UploadWizard = lazy(() => import('./UploadWizard.jsx'))

// Interactive labs. `chapter: null` + `component: null` = coming in a later chapter.
export const LABS = [
  { id: 'platform-match', title: 'Platform Match', emoji: '🧩', chapter: 1, desc: 'Match real needs to the Databricks component that solves them, and see why the others don\'t fit.', component: PlatformMatch },
  { id: 'catalog-explorer', title: 'Catalog Explorer', emoji: '🧭', chapter: 2, desc: 'Browse a mock Unity Catalog: find the certified table, check managed vs external, tag PII and follow lineage.', component: CatalogExplorer },
  { id: 'ingestion-picker', title: 'Ingestion Picker', emoji: '📥', chapter: 3, desc: 'Match data-arrival scenarios to COPY INTO, Auto Loader, Delta Sharing, upload and more, and see why the others don\'t fit.', component: IngestionPicker },
  { id: 'upload-wizard', title: 'Upload Wizard', emoji: '⬆️', chapter: 3, desc: 'Upload a CSV through a mock UI: pick the schema, fix the header and an inferred type, and hit the classic mistakes.', component: UploadWizard },
  { id: 'join-visualizer', title: 'Join Visualizer', emoji: '🔗', chapter: 4, desc: 'Pick a join type, predict the row count, and see which rows survive.', component: JoinVisualizer },
  { id: 'set-ops', title: 'Set Operations', emoji: '🧬', chapter: 4, desc: 'UNION vs UNION ALL vs INTERSECT vs EXCEPT.', component: SetOps },
  { id: 'time-travel', title: 'Time Travel Timeline', emoji: '⏳', chapter: 4, desc: 'Query old Delta versions, RESTORE, then watch VACUUM break time travel.', component: TimeTravel },
  { id: 'query-profile-detective', title: 'Query Profile Detective', emoji: '🕵️', chapter: 5, desc: 'Read a query profile, name the bottleneck, pick the fix, and see the after profile.', component: QueryProfileDetective },
  { id: 'cache-lab', title: 'Cache Lab', emoji: '⚡', chapter: 5, desc: 'Run queries, change the table, and predict result-cache hits, misses and invalidations.', component: CacheLab },
  { id: 'chart-picker', title: 'Chart Picker', emoji: '📊', chapter: 6, desc: 'Match a business question to the right chart, then compare your pick with the best one.', component: ChartPicker },
  { id: 'dashboard-config', title: 'Dashboard Config', emoji: '🛠️', chapter: 6, desc: 'Wire a parameter, schedule a refresh, set an alert and sharing, then simulate the morning.', component: DashboardConfig },
  { id: 'namespace-builder', title: 'Namespace Builder', emoji: '🔐', chapter: 9, desc: 'Drag catalog → schema → table/volume, grant privileges, then test who can run what.', component: NamespaceBuilder },
  { id: 'medallion-sorter', title: 'Medallion Sorter', emoji: '🥇', chapter: 8, desc: 'Sort datasets into bronze/silver/gold and build a star schema.', component: null },
  { id: 'genie-builder', title: 'Genie Space Builder', emoji: '🧞', chapter: 7, desc: 'Configure a mock Genie space, get scored, then see which user questions succeed and why.', component: GenieBuilder },
]

export const labById = (id) => LABS.find((l) => l.id === id)

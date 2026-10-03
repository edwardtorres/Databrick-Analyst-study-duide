import JoinVisualizer from './JoinVisualizer.jsx'
import SetOps from './SetOps.jsx'
import TimeTravel from './TimeTravel.jsx'
import NamespaceBuilder from './NamespaceBuilder.jsx'
import GenieBuilder from './GenieBuilder.jsx'

// Interactive labs. `chapter: null` + `component: null` = coming in a later chapter.
export const LABS = [
  { id: 'join-visualizer', title: 'Join Visualizer', emoji: '🔗', chapter: 4, desc: 'Pick a join type, predict the row count, and see which rows survive.', component: JoinVisualizer },
  { id: 'set-ops', title: 'Set Operations', emoji: '🧬', chapter: 4, desc: 'UNION vs UNION ALL vs INTERSECT vs EXCEPT.', component: SetOps },
  { id: 'time-travel', title: 'Time Travel Timeline', emoji: '⏳', chapter: 4, desc: 'Query old Delta versions, RESTORE, then watch VACUUM break time travel.', component: TimeTravel },
  { id: 'namespace-builder', title: 'Namespace Builder', emoji: '🔐', chapter: 9, desc: 'Drag catalog → schema → table/volume, grant privileges, then test who can run what.', component: NamespaceBuilder },
  { id: 'medallion-sorter', title: 'Medallion Sorter', emoji: '🥇', chapter: 8, desc: 'Sort datasets into bronze/silver/gold and build a star schema.', component: null },
  { id: 'genie-builder', title: 'Genie Space Builder', emoji: '🧞', chapter: 7, desc: 'Configure a mock Genie space, get scored, then see which user questions succeed and why.', component: GenieBuilder },
]

export const labById = (id) => LABS.find((l) => l.id === id)

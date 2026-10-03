import { SECTION_WEIGHTS } from '../data/examInfo.js'

// Rescale exam-section weights to the chapters that are built, so they sum to 1.
export function rescaledWeights(builtIds, weights = SECTION_WEIGHTS) {
  const total = builtIds.reduce((a, id) => a + (weights[id] || 0), 0)
  return Object.fromEntries(builtIds.map((id) => [id, total ? (weights[id] || 0) / total : 1 / builtIds.length]))
}

// How many Boss questions to draw from each built chapter.
// `pool` maps chapterId -> number of available questions. Uses largest-
// remainder rounding, then moves any shortfall (a chapter with too few
// questions) to the others in proportion to their weights.
export function bossAllocation(pool, n, weights = SECTION_WEIGHTS) {
  const ids = Object.keys(pool).map(Number).filter((id) => pool[id] > 0)
  const counts = Object.fromEntries(ids.map((id) => [id, 0]))
  let remaining = Math.min(n, ids.reduce((a, id) => a + pool[id], 0))
  let open = [...ids]
  while (remaining > 0 && open.length) {
    const w = rescaledWeights(open, weights)
    const raw = open.map((id) => ({ id, exact: w[id] * remaining }))
    const give = Object.fromEntries(raw.map((r) => [r.id, Math.floor(r.exact)]))
    let left = remaining - Object.values(give).reduce((a, b) => a + b, 0)
    for (const r of [...raw].sort((a, b) => b.exact - Math.floor(b.exact) - (a.exact - Math.floor(a.exact)) || a.id - b.id)) {
      if (left <= 0) break
      give[r.id]++
      left--
    }
    let placed = 0
    for (const id of open) {
      const take = Math.min(give[id], pool[id] - counts[id])
      counts[id] += take
      placed += take
    }
    remaining -= placed
    open = open.filter((id) => counts[id] < pool[id])
    if (placed === 0) break
  }
  return counts
}

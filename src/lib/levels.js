// XP needed to go from level L to L+1 grows by 50 each level.
export const xpToNext = (level) => 100 + 50 * (level - 1)

export function levelInfo(xp) {
  let level = 1
  let floor = 0
  while (xp >= floor + xpToNext(level)) {
    floor += xpToNext(level)
    level++
  }
  const need = xpToNext(level)
  return { level, into: xp - floor, need, pct: (xp - floor) / need, title: titleFor(level) }
}

const TITLES = [
  [1, 'Raw Bronze Row'],
  [3, 'Query Apprentice'],
  [5, 'Silver Cleaner'],
  [8, 'Join Journeyman'],
  [11, 'Gold Aggregator'],
  [15, 'Dashboard Druid'],
  [20, 'Lakehouse Legend'],
]

export function titleFor(level) {
  let t = TITLES[0][1]
  for (const [min, name] of TITLES) if (level >= min) t = name
  return t
}

export const XP = {
  card: 5,
  correct: 10,
  correctRepeat: 4,
  challenge: 30,
  subsection: 40,
  testPass: 100,
  lab: 15,
  bossPerCorrect: 5,
  bossComplete: 100,
}

export const DAILY_GOAL = 60

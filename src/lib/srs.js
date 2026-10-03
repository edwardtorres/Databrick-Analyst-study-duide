// Simple Leitner-style spaced repetition. A question climbs one box per
// correct answer and drops to box 0 on a miss. Low boxes come back sooner
// and are sampled far more often.
const HOUR = 3600_000
export const INTERVAL_HOURS = [0, 4, 24, 72, 168, 336]
export const MAX_BOX = INTERVAL_HOURS.length - 1

export function nextStat(stat, correct, now = Date.now()) {
  const s = stat || { box: 0, seen: 0, correct: 0, wrong: 0 }
  const box = correct ? Math.min(s.box + 1, MAX_BOX) : 0
  return {
    box,
    seen: s.seen + 1,
    correct: s.correct + (correct ? 1 : 0),
    wrong: s.wrong + (correct ? 0 : 1),
    last: now,
    due: now + INTERVAL_HOURS[box] * HOUR,
  }
}

export function weight(stat, now = Date.now()) {
  if (!stat) return 3 // unseen
  if (stat.box === 0) return 8 // missed recently: comes back a lot
  if (stat.due <= now) return 3 + (MAX_BOX - stat.box)
  return 1 / (stat.box + 1)
}

export function weightedSample(items, n, weightOf) {
  const pool = items.map((it) => ({ it, w: Math.max(weightOf(it), 0.0001) }))
  const out = []
  while (out.length < n && pool.length) {
    const total = pool.reduce((a, p) => a + p.w, 0)
    let r = Math.random() * total
    let idx = 0
    for (; idx < pool.length - 1; idx++) {
      r -= pool[idx].w
      if (r <= 0) break
    }
    out.push(pool[idx].it)
    pool.splice(idx, 1)
  }
  return out
}

export function pickQuestions(questions, stats, n, now = Date.now()) {
  return weightedSample(questions, n, (q) => weight(stats[q.id], now))
}

export function dueQuestions(questions, stats, now = Date.now()) {
  return questions
    .filter((q) => stats[q.id] && stats[q.id].due <= now)
    .sort((a, b) => stats[a.id].box - stats[b.id].box || stats[a.id].due - stats[b.id].due)
}

// 0..1: how solidly a set of questions is known (box 4+ counts as mastered).
export function questionMastery(questions, stats) {
  if (!questions.length) return 0
  const cap = 4
  return questions.reduce((a, q) => a + Math.min(stats[q.id]?.box || 0, cap) / cap, 0) / questions.length
}

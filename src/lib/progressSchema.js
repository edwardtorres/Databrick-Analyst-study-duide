// Shape of saved progress, plus validation for imported / stored files.
// Missing fields are filled from defaults (deep merge); present fields with
// the wrong shape cause the whole file to be rejected with a readable error.

export const emptyProgress = () => ({
  version: 1,
  xp: 0,
  streak: { count: 0, best: 0, lastDay: null },
  today: { day: null, xp: 0 },
  cards: {}, // cardId -> true
  subsections: {}, // "4:joins" -> true (checked off)
  questions: {}, // qid -> SRS stat
  challenges: {}, // challengeId -> { solved, attempts, solvedAt }
  labs: {}, // labId -> true (first-run XP claimed)
  tests: {}, // chapterId -> { best, last, attempts, passed }
  boss: { history: [], active: null, lastBonusDay: null },
  examDate: null,
  testXp: { day: null, ids: [] }, // questions already paid per-correct test XP today
  labState: {}, // labId -> saved lab UI state (sanitized by each lab)
})

const isObj = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)
const isNum = (v) => typeof v === 'number' && Number.isFinite(v)
const isDay = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)
const dayOrNull = (v) => v === null || isDay(v)

// Recursively fill missing keys from defaults. Arrays and maps (empty
// default objects) are taken from the import as-is and checked later.
export function deepMerge(defaults, value) {
  if (!isObj(defaults) || !isObj(value)) return value === undefined ? defaults : value
  const out = { ...value }
  for (const [k, d] of Object.entries(defaults)) {
    if (!(k in value)) out[k] = d
    else if (isObj(d) && Object.keys(d).length && isObj(value[k])) out[k] = deepMerge(d, value[k])
  }
  return out
}

function checkMap(errors, path, map, checkEntry) {
  if (!isObj(map)) return errors.push(`${path} should be an object`)
  for (const [k, v] of Object.entries(map)) {
    const problem = checkEntry(v)
    if (problem) {
      errors.push(`${path}.${k} ${problem}`)
      if (errors.length > 5) return
    }
  }
}

export function validateProgress(p) {
  const errors = []
  if (!isObj(p)) return ['the file does not contain a progress object']
  if (!isNum(p.xp) || p.xp < 0) errors.push('xp should be a non-negative number')
  if (!isObj(p.streak) || !isNum(p.streak.count) || !isNum(p.streak.best) || !dayOrNull(p.streak.lastDay))
    errors.push('streak should be { count: number, best: number, lastDay: date or null }')
  if (!isObj(p.today) || !dayOrNull(p.today.day) || !isNum(p.today.xp)) errors.push('today should be { day: date or null, xp: number }')

  const bool = (v) => (typeof v === 'boolean' ? null : 'should be true/false')
  checkMap(errors, 'cards', p.cards, bool)
  checkMap(errors, 'subsections', p.subsections, bool)
  checkMap(errors, 'labs', p.labs, bool)
  checkMap(errors, 'questions', p.questions, (s) =>
    isObj(s) && Number.isInteger(s.box) && s.box >= 0 && s.box <= 5 && isNum(s.seen) && isNum(s.correct) && isNum(s.wrong) && isNum(s.due)
      ? null
      : 'should be { box: 0-5, seen, correct, wrong, due: numbers }',
  )
  checkMap(errors, 'challenges', p.challenges, (c) =>
    isObj(c) && typeof c.solved === 'boolean' && isNum(c.attempts) && (c.solvedAt === undefined || isNum(c.solvedAt))
      ? null
      : 'should be { solved: true/false, attempts: number }',
  )
  checkMap(errors, 'tests', p.tests, (t) =>
    isObj(t) && isNum(t.best) && isNum(t.attempts) && typeof t.passed === 'boolean' ? null : 'should be { best, last, attempts: numbers, passed: true/false }',
  )

  const b = p.boss
  if (!isObj(b)) errors.push('boss should be an object')
  else {
    if (!Array.isArray(b.history) || !b.history.every((h) => isObj(h) && isNum(h.score) && isNum(h.total) && isNum(h.date)))
      errors.push('boss.history should be a list of { date, score, total }')
    if (
      b.active !== null &&
      !(isObj(b.active) && Array.isArray(b.active.ids) && b.active.ids.length > 0 &&
        b.active.ids.every((id) => typeof id === 'string') && new Set(b.active.ids).size === b.active.ids.length &&
        isObj(b.active.answers) && Object.values(b.active.answers).every((answer) => Number.isInteger(answer) && answer >= 0 && answer < 6) &&
        isObj(b.active.flagged) && Object.values(b.active.flagged).every((flag) => typeof flag === 'boolean') &&
        Number.isInteger(b.active.index) && b.active.index >= 0 && b.active.index < b.active.ids.length &&
        isNum(b.active.endsAt) && isNum(b.active.startedAt) && b.active.endsAt >= b.active.startedAt)
    )
      errors.push('boss.active should be null or an in-progress exam')
    if (!dayOrNull(b.lastBonusDay)) errors.push('boss.lastBonusDay should be a date or null')
  }
  if (!dayOrNull(p.examDate)) errors.push('examDate should be a YYYY-MM-DD date or null')
  if (!isObj(p.testXp) || !dayOrNull(p.testXp.day) || !Array.isArray(p.testXp.ids) || !p.testXp.ids.every((x) => typeof x === 'string'))
    errors.push('testXp should be { day: date or null, ids: list of question ids }')
  checkMap(errors, 'labState', p.labState, (v) => (isObj(v) ? null : 'should be an object'))
  return errors
}

// Returns { ok: true, value } or { ok: false, error } with a friendly message.
export function parseProgress(input) {
  let data = input
  if (typeof input === 'string') {
    try {
      data = JSON.parse(input)
    } catch {
      return { ok: false, error: "This file isn't valid JSON. Pick a file exported from Settings → Export." }
    }
  }
  if (!isObj(data) || typeof data.xp !== 'number')
    return { ok: false, error: "This doesn't look like a Lakehouse Quest progress file. Pick a file exported from Settings → Export." }
  const value = deepMerge(emptyProgress(), data)
  if (isObj(value.boss?.active)) value.boss.active = { index: 0, flagged: {}, ...value.boss.active }
  const errors = validateProgress(value)
  if (errors.length)
    return {
      ok: false,
      error: `This progress file is damaged, so nothing was imported. Your current progress is unchanged. Problems: ${errors.slice(0, 5).join('; ')}${errors.length > 5 ? '; …' : ''}.`,
    }
  return { ok: true, value }
}

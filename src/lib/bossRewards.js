import { XP } from './levels.js'

export const BONUS_MIN_ANSWERED = 0.8

// Completion bonus rules: you must answer at least 80% of the questions,
// and the bonus is paid at most once per calendar day.
export function bossCompletionBonus({ answered, total, full, lastBonusDay, today }) {
  if (!total || answered / total < BONUS_MIN_ANSWERED) return { bonus: 0, reason: 'answered' }
  if (lastBonusDay === today) return { bonus: 0, reason: 'daily' }
  return { bonus: full ? XP.bossComplete : XP.bossMiniComplete, reason: null }
}

// Per-correct XP in chapter tests and the Boss is paid only the first time
// each question is answered correctly on a given day. `ledger` is
// progress.testXp: { day, ids } for the current day.
export function payableCorrect({ correctIds, ledger, today }) {
  const seen = new Set(ledger?.day === today ? ledger.ids : [])
  const newIds = [...new Set(correctIds)].filter((id) => !seen.has(id))
  return { newIds, ledger: { day: today, ids: [...seen, ...newIds] } }
}

import { XP } from './levels.js'

export const BONUS_MIN_ANSWERED = 0.8

// Completion bonus rules: you must answer at least 80% of the questions,
// and the bonus is paid at most once per calendar day.
export function bossCompletionBonus({ answered, total, full, lastBonusDay, today }) {
  if (!total || answered / total < BONUS_MIN_ANSWERED) return { bonus: 0, reason: 'answered' }
  if (lastBonusDay === today) return { bonus: 0, reason: 'daily' }
  return { bonus: full ? XP.bossComplete : XP.bossMiniComplete, reason: null }
}

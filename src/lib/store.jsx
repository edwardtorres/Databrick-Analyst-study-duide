import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { nextStat } from './srs.js'
import { dayKey, daysBetween } from './dates.js'
import { levelInfo } from './levels.js'
import { emptyProgress, parseProgress } from './progressSchema.js'

export { emptyProgress }

const STORAGE_KEY = 'lakehouse-quest:v1'

// Loads saved progress. If it fails validation, the raw copy is kept under a
// backup key and returned as `damaged` so the app can tell the learner.
// Cached so React StrictMode's double initialisation doesn't back up twice.
let bootCache = null
function load() {
  if (bootCache) return bootCache
  let result = { state: emptyProgress(), damaged: null }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = parseProgress(raw)
      if (parsed.ok) result = { state: parsed.value, damaged: null }
      else {
        const backupKey = `${STORAGE_KEY}:damaged:${Date.now()}`
        localStorage.setItem(backupKey, raw)
        result = { state: emptyProgress(), damaged: { raw, backupKey, reason: parsed.error } }
      }
    }
  } catch {
    /* storage unavailable: start fresh in memory */
  }
  bootCache = result
  return result
}

function withXp(state, amount) {
  if (!amount) return state
  const today = dayKey()
  let { count, best, lastDay } = state.streak
  if (lastDay !== today) {
    count = lastDay && daysBetween(lastDay, today) === 1 ? count + 1 : 1
    lastDay = today
    best = Math.max(best, count)
  }
  const todayXp = state.today.day === today ? state.today.xp + amount : amount
  return {
    ...state,
    xp: state.xp + amount,
    streak: { count, best, lastDay },
    today: { day: today, xp: todayXp },
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'xp':
      return withXp(state, action.amount)
    case 'card':
      if (state.cards[action.id]) return state
      return withXp({ ...state, cards: { ...state.cards, [action.id]: true } }, action.xp)
    case 'answer': {
      const stat = nextStat(state.questions[action.id], action.correct)
      return withXp({ ...state, questions: { ...state.questions, [action.id]: stat } }, action.xp)
    }
    case 'subsection': {
      const subsections = { ...state.subsections }
      if (action.done) subsections[action.key] = true
      else delete subsections[action.key]
      return withXp({ ...state, subsections }, action.xp || 0)
    }
    case 'challenge': {
      const prev = state.challenges[action.id] || { solved: false, attempts: 0 }
      const next = {
        ...prev,
        attempts: prev.attempts + 1,
        solved: prev.solved || action.solved,
        solvedAt: prev.solvedAt || (action.solved ? Date.now() : undefined),
      }
      return withXp({ ...state, challenges: { ...state.challenges, [action.id]: next } }, action.xp || 0)
    }
    case 'lab':
      if (state.labs[action.id]) return state
      return withXp({ ...state, labs: { ...state.labs, [action.id]: true } }, action.xp)
    case 'test': {
      const prev = state.tests[action.chapter] || { best: 0, attempts: 0, passed: false }
      const t = {
        best: Math.max(prev.best, action.score),
        last: action.score,
        attempts: prev.attempts + 1,
        passed: prev.passed || action.passed,
      }
      return withXp({ ...state, tests: { ...state.tests, [action.chapter]: t } }, action.xp)
    }
    case 'bossActive':
      return { ...state, boss: { ...state.boss, active: action.active } }
    case 'bossDone':
      return withXp(
        {
          ...state,
          boss: {
            active: null,
            history: [...state.boss.history, action.result].slice(-20),
            lastBonusDay: action.bonusDay || state.boss.lastBonusDay || null,
          },
        },
        action.xp,
      )
    case 'labState': {
      const labState = { ...state.labState }
      if (action.value) labState[action.id] = action.value
      else delete labState[action.id]
      return { ...state, labState }
    }
    case 'examDate':
      return { ...state, examDate: action.date || null }
    case 'replace':
      return action.state
    default:
      return state
  }
}

const Ctx = createContext(null)

export function ProgressProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => load().state)
  const [damaged, setDamaged] = useState(() => load().damaged)
  const [toasts, setToasts] = useState([])
  const prevLevel = useRef(levelInfo(state.xp).level)
  const prevXp = useRef(state.xp)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage full or blocked: progress stays in memory */
    }
  }, [state])

  const timers = useRef({})
  // One toast per kind: rapid XP gains merge into a single running total
  // instead of stacking over the content.
  const toast = useCallback((t) => {
    const kind = t.kind || 'info'
    setToasts((ts) => {
      const prev = ts.find((x) => x.kind === kind)
      const amount = kind === 'xp' && prev ? prev.amount + t.amount : t.amount
      const next = { ...t, kind, amount, id: prev?.id || Math.random().toString(36).slice(2), text: kind === 'xp' ? `+${amount} XP` : t.text }
      return [...ts.filter((x) => x.kind !== kind), next]
    })
    clearTimeout(timers.current[kind])
    timers.current[kind] = setTimeout(() => setToasts((ts) => ts.filter((x) => x.kind !== kind)), t.ms || 2200)
  }, [])

  // XP / level-up toasts derive from state changes so every action gets one.
  useEffect(() => {
    const gained = state.xp - prevXp.current
    prevXp.current = state.xp
    if (gained > 0) toast({ kind: 'xp', amount: gained })
    const lvl = levelInfo(state.xp)
    if (lvl.level > prevLevel.current) toast({ kind: 'level', text: `Level ${lvl.level}! ${lvl.title}`, ms: 3500 })
    prevLevel.current = lvl.level
  }, [state.xp, toast])

  const actions = useMemo(
    () => ({
      awardXp: (amount) => dispatch({ type: 'xp', amount }),
      readCard: (id, xp) => dispatch({ type: 'card', id, xp }),
      answer: (id, correct, xp) => dispatch({ type: 'answer', id, correct, xp }),
      setSubsection: (key, done, xp) => dispatch({ type: 'subsection', key, done, xp }),
      challengeAttempt: (id, solved, xp) => dispatch({ type: 'challenge', id, solved, xp }),
      labDone: (id, xp) => dispatch({ type: 'lab', id, xp }),
      testDone: (chapter, score, passed, xp) => dispatch({ type: 'test', chapter, score, passed, xp }),
      setBossActive: (active) => dispatch({ type: 'bossActive', active }),
      bossDone: (result, xp, bonusDay) => dispatch({ type: 'bossDone', result, xp, bonusDay }),
      setExamDate: (date) => dispatch({ type: 'examDate', date }),
      setLabState: (id, value) => dispatch({ type: 'labState', id, value }),
      replaceAll: (s) => dispatch({ type: 'replace', state: s }),
      toast,
    }),
    [toast],
  )

  const dismissDamaged = useCallback(() => setDamaged(null), [])

  return <Ctx.Provider value={{ state, actions, toasts, damaged, dismissDamaged }}>{children}</Ctx.Provider>
}

export function useProgress() {
  return useContext(Ctx)
}

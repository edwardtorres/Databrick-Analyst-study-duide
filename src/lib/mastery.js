import { questionMastery } from './srs.js'

// Chapter mastery blends three signals:
//   60% how well you know the questions (spaced-repetition box level)
//   25% subsections checked off
//   15% SQL challenges solved (if the chapter has any)
export function chapterMastery(chapter, progress) {
  const c = chapter.content
  if (!c) return 0
  const q = questionMastery(c.questions, progress.questions)
  const subs = c.subsections.filter((s) => progress.subsections[`${chapter.id}:${s.id}`]).length / c.subsections.length
  if (!c.challenges.length) return 0.7 * q + 0.3 * subs
  const ch = c.challenges.filter((x) => progress.challenges[x.id]?.solved).length / c.challenges.length
  return 0.6 * q + 0.25 * subs + 0.15 * ch
}

export function subsectionMastery(chapter, sub, progress) {
  const qs = chapter.content.questions.filter((q) => q.sub === sub.id)
  return questionMastery(qs, progress.questions)
}

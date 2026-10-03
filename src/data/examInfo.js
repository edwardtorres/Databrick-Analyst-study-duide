export const EXAM = {
  name: 'Databricks Certified Data Analyst Associate',
  scoredQuestions: 45,
  format: 'Multiple choice',
  minutes: 90,
  delivery: 'Online proctored or at a test center',
  guideVersion: '2025-10-30',
  guideVersionLabel: 'Oct 30, 2025',
}

// Section weights (% of the exam). Sections 1, 2, 3, 8, 9 are known; the
// remainder is split evenly across sections 4-7. Verify against the
// current exam guide.
const KNOWN_WEIGHTS = { 1: 11, 2: 8, 3: 5, 8: 5, 9: 8 }
const SPLIT = [4, 5, 6, 7]
const rest = 100 - Object.values(KNOWN_WEIGHTS).reduce((a, b) => a + b, 0)
export const SECTION_WEIGHTS = {
  ...KNOWN_WEIGHTS,
  ...Object.fromEntries(SPLIT.map((s) => [s, rest / SPLIT.length])),
}

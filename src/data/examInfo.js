export const EXAM = {
  name: 'Databricks Certified Data Analyst Associate',
  scoredQuestions: 45,
  format: 'Multiple choice',
  minutes: 90,
  delivery: 'Online proctored or at a test center',
  guideVersion: '2025-10-30',
  guideVersionLabel: 'Oct 30, 2025',
}

// Section weights (% of the exam), as published on the official exam page
// (https://www.databricks.com/learn/certification/data-analyst-associate,
// checked Oct 2026). The exam guide PDF linked there is still the
// Oct 30, 2025 version.
export const WEIGHTS_SOURCE = 'Official exam page, checked Oct 2026'
export const SECTION_WEIGHTS = { 1: 11, 2: 8, 3: 5, 4: 20, 5: 15, 6: 16, 7: 12, 8: 5, 9: 8 }

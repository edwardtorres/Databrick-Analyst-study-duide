import { test, expect, progress } from './fixtures.js'
import { CHAPTERS } from '../../src/data/chapters.js'
import { bossAllocation } from '../../src/lib/bossWeights.js'

// Expected per-chapter mix, computed from the same weights the app uses.
async function expectedMix() {
  const pool = {}
  for (const c of CHAPTERS.filter((x) => x.built)) {
    const { questions } = await import(`../../src/data/ch${c.id}/questions.js`)
    pool[c.id] = questions.length
  }
  return bossAllocation(pool, 45)
}

test('Boss starts a 45-question exam with the exam-weighted mix', async ({ page }) => {
  const mix = await expectedMix()
  await page.goto('#/boss')
  await expect(page.getByText('Question mix (weighted by exam section)')).toBeVisible()
  await page.getByRole('button', { name: /Start Boss Battle/ }).click()
  await expect(page.getByText('Question 1 of 45')).toBeVisible()

  const ids = (await progress(page)).boss.active.ids
  expect(new Set(ids).size).toBe(45)
  const actual = {}
  for (const id of ids) {
    const ch = Number(id.match(/^c(\d+)-/)[1])
    actual[ch] = (actual[ch] || 0) + 1
  }
  expect(actual).toEqual(Object.fromEntries(Object.entries(mix).filter(([, n]) => n > 0)))
})

test('submitting an empty Boss gives no bonus and shows the readiness estimate', async ({ page }) => {
  await page.goto('#/boss')
  await page.getByRole('button', { name: /Start Boss Battle/ }).click()
  await page.getByText('Submit early').click()
  await page.locator('.fixed').getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByText(/Readiness estimate: \d of 9 chapters built/)).toBeVisible()
  await expect(page.getByText(/No completion bonus/)).toBeVisible()
})

import { test, expect, progress } from './fixtures.js'

test('solving a SQL challenge marks it solved and awards XP', async ({ page }) => {
  await page.goto('#/sql/c4-fix-having')
  await page.locator('textarea').fill('SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id HAVING SUM(amount) > 150')
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText('Correct!')).toBeVisible()
  const p = await progress(page)
  expect(p.challenges['c4-fix-having'].solved).toBe(true)
  expect(p.xp).toBeGreaterThan(0)
})

test('a wrong fix shows the custom hint', async ({ page }) => {
  await page.goto('#/sql/c4-fix-where-outer')
  await expect(page.locator('textarea')).toHaveValue(/WHERE o.status/)
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText('International is still missing')).toBeVisible()
})

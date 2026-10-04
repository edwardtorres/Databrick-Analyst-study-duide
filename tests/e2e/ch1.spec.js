import { test, expect, progress } from './fixtures.js'

test('Platform Match: a wrong pick explains every option; the right pick earns XP', async ({ page }) => {
  await page.goto('#/lab/platform-match')
  await expect(page.getByText(/must run every night at 01:00/)).toBeVisible()
  await page.getByRole('button', { name: /Lakeflow Declarative Pipelines/ }).click()
  await expect(page.getByText("❌ It's Lakeflow Jobs")).toBeVisible()
  await expect(page.getByTestId('why-list').locator('> div')).toHaveCount(4)
  await page.getByRole('button', { name: /Next scenario/ }).click()
  await expect(page.getByText(/find who owns the gold.revenue table/)).toBeVisible()
  await page.getByRole('button', { name: /Unity Catalog/ }).click()
  await expect(page.getByText('✅ Unity Catalog')).toBeVisible()
  expect((await progress(page)).labs['pm-owner']).toBe(true)
})

test('Chapter 1 page lists its levels', async ({ page }) => {
  await page.goto('#/chapter/1')
  await expect(page.getByText('Databricks Data Intelligence Platform')).toBeVisible()
  await expect(page.getByText('26 questions')).toBeVisible()
  await expect(page.getByText('4. Databricks Marketplace')).toBeVisible()
})

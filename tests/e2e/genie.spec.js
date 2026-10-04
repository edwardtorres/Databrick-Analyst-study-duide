import { test, expect, progress } from './fixtures.js'

test('a full Genie setup scores 100 and gets trusted answers', async ({ page }) => {
  await page.goto('#/lab/genie-builder')
  await page.getByText('Serverless SQL warehouse (Small)').click()
  for (const t of ['gold.sales.sales_daily', 'gold.sales.dim_store', 'gold.sales.dim_product', 'gold.sales.returns']) await page.getByText(t, { exact: true }).click()
  for (const s of ['+ Revenue means', '+ Our fiscal year', '+ Regions are']) await page.getByRole('button', { name: s }).click()
  for (const q of ['What was revenue by region last month?', 'Top 10 products by revenue this fiscal quarter', 'Which stores had the highest return rate?'])
    await page.getByRole('button', { name: q }).click()
  await page.getByText('revenue_by_region(:start_date, :end_date)').click()
  await page.getByText('return_rate_by_store(:start_date, :end_date)').click()
  await page.getByRole('button', { name: 'Score my space' }).click()
  await expect(page.getByText('100/100')).toBeVisible()

  await page.getByRole('button', { name: 'Show revenue by region for the last 90 days' }).click()
  await page.getByRole('button', { name: 'How much does Maria in HR earn?' }).click()
  await expect(page.getByText('✅ Trusted')).toBeVisible()
  await expect(page.getByText('🛡️ Declined')).toBeVisible()
  expect((await progress(page)).labs['genie-90']).toBe(true)

  await page.reload()
  await expect(page.locator('input[type=checkbox]:checked')).toHaveCount(6)
})

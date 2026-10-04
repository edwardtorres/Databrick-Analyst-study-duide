import { test, expect } from './fixtures.js'

test('after VACUUM an old version is listed but unreadable', async ({ page }) => {
  await page.goto('#/lab/time-travel')
  const box = page.locator('textarea')
  const run = page.getByRole('button', { name: 'Run', exact: true })
  await box.fill('SELECT * FROM inventory VERSION AS OF 1')
  await run.click()
  await expect(page.locator('table tbody tr')).toHaveCount(5)
  await box.fill('VACUUM inventory')
  await run.click()
  await expect(page.getByText(/VACUUM removed 1 file/)).toBeVisible()
  await box.fill('SELECT * FROM inventory VERSION AS OF 1')
  await run.click()
  await expect(page.getByText(/FAILED_READ_FILE/)).toBeVisible()
  await box.fill('DESCRIBE HISTORY inventory')
  await run.click()
  await expect(page.getByText('VACUUMed ✗').first()).toBeVisible()
})

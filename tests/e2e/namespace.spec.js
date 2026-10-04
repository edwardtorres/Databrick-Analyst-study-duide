import { test, expect } from './fixtures.js'

test('prediction stays visible after clicking and the lab survives reload', async ({ page }) => {
  await page.goto('#/lab/namespace-builder')
  await page.getByText('Skip: build it for me').click()
  await page.getByRole('button', { name: /Namespace built/ }).click()
  const selects = page.locator('select')
  await selects.nth(1).selectOption('sales.gold')
  await selects.nth(0).selectOption('SELECT')
  await selects.nth(2).selectOption('analysts')
  await page.getByRole('button', { name: 'Run GRANT' }).click()
  await page.getByRole('button', { name: '3. Test access' }).click()
  await page.getByRole('button', { name: /No, denied/ }).click()

  const verdict = page.getByText('Correct prediction. Access DENIED')
  await expect(verdict).toBeVisible()
  await page.waitForTimeout(500) // R1: the result used to vanish on the next render
  await expect(verdict).toBeVisible()
  await expect(page.getByText('GRANT USE CATALOG ON CATALOG sales TO `analysts`')).toBeVisible()

  await page.reload()
  await expect(page.getByRole('button', { name: '3. Test access' })).toHaveClass(/bg-brand/)
  await expect(page.getByText('Correct prediction. Access DENIED')).toBeVisible()
  await page.getByRole('button', { name: '2. Grant' }).click()
  await expect(page.getByText('Grants (1)')).toBeVisible()
})

test('dragging a table straight into the metastore is rejected with a reason', async ({ page }) => {
  await page.goto('#/lab/namespace-builder')
  const chip = page.locator('span.cursor-grab', { hasText: 'orders' }).first()
  await chip.dragTo(page.locator('[data-drop="ms"]'))
  await expect(page.getByText('needs a catalog and a schema')).toBeVisible()
})

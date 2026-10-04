import { test, expect } from './fixtures.js'

const ROUTES = ['/', '/chapters', '/chapter/4', '/chapter/7', '/chapter/9', '/chapter/1', '/sql', '/review', '/boss', '/labs', '/settings']

test('every main page loads without console errors', async ({ page }) => {
  for (const r of ROUTES) {
    await page.goto(`#${r}`)
    await expect(page.locator('main')).not.toBeEmpty()
  }
  await page.goto('#/')
  await expect(page.getByText('Lakehouse Quest')).toBeVisible()
  await expect(page.getByText('45', { exact: true })).toBeVisible()
})

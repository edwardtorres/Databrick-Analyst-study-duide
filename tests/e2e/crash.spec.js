import { test, expect } from './fixtures.js'

// The crash is deliberate, so React's error logging is expected here.
test.use({ allowConsoleErrors: true })

test('a crashing screen shows the recovery screen and Back to Home works', async ({ page }) => {
  await page.goto('#/__crash')
  await expect(page.getByText('Something broke on this screen')).toBeVisible()
  await expect(page.locator('nav')).toBeVisible()
  await page.getByRole('button', { name: 'Back to Home' }).click()
  await expect(page).toHaveURL(/#\/$/)
  await expect(page.getByText('Lakehouse Quest')).toBeVisible()
})

import { test, expect } from './fixtures.js'

test('blocked storage gives an actionable warning and leaves the app usable', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'QuotaExceededError') }
  })
  await page.goto('#/')
  await expect(page.getByRole('alert')).toContainText('Progress cannot be saved')
  await page.getByRole('link', { name: 'Export a backup in Settings' }).click()
  await expect(page.getByRole('button', { name: 'Export', exact: true })).toBeVisible()
})

test('keyboard skip link focuses content without changing the app route', async ({ page }) => {
  await page.goto('#/chapters')
  await page.getByRole('link', { name: 'Skip to main content' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('main')).toBeFocused()
  await expect(page).toHaveURL(/#\/chapters$/)
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Learn' })).toHaveAttribute('aria-current', 'page')
})

test('home page does not download SQL engine code until SQL practice is opened', async ({ page }, info) => {
  test.skip(info.project.name === 'dev', 'checks production chunking')
  const requests = []
  page.on('request', (request) => requests.push(request.url()))
  await page.goto('#/')
  await expect(page.getByText('Lakehouse Quest', { exact: true })).toBeVisible()
  expect(requests.some((url) => /sql-wasm.*\.(js|wasm)/.test(url))).toBe(false)
  await page.getByRole('navigation').getByRole('link', { name: 'SQL', exact: true }).click()
  await page.getByRole('button', { name: /Free play/ }).click()
  await expect(page.getByRole('button', { name: /Run/ }).first()).toBeEnabled()
  expect(requests.some((url) => /sql-wasm.*\.wasm/.test(url))).toBe(true)
})

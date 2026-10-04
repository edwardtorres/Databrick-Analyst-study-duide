import { test, expect } from './fixtures.js'

// The blocked request logs a network error on purpose.
test.use({ allowConsoleErrors: true })

// Matches the Chapter 4 content chunk in dev (/src/data/ch4/index.js) and in
// the production build (/assets/ch4-<hash>.js).
const CH4_CHUNK = /\/(src\/data\/ch4\/index\.js|assets\/ch4-[\w-]+\.js)(\?.*)?$/

test('a failed chapter download shows Retry/Reload, and Retry recovers', async ({ page }) => {
  let blocked = true
  await page.route(CH4_CHUNK, (route) => (blocked ? route.abort('failed') : route.continue()))

  await page.goto('#/chapter/4')
  await expect(page.getByText("Couldn't load this chapter")).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reload' })).toBeVisible()

  blocked = false
  await page.getByRole('button', { name: 'Retry' }).click()
  await expect(page.getByText('Executing Queries with Databricks SQL & SQL Warehouses')).toBeVisible()
  await expect(page.getByText('42 questions')).toBeVisible()
})

test('pages that need every chapter also offer Retry', async ({ page }) => {
  let blocked = true
  await page.route(CH4_CHUNK, (route) => (blocked ? route.abort('failed') : route.continue()))
  await page.goto('#/boss')
  await expect(page.getByText("Couldn't load this chapter")).toBeVisible()
  blocked = false
  await page.getByRole('button', { name: 'Retry' }).click()
  await expect(page.getByRole('button', { name: /Start Boss Battle/ })).toBeVisible()
})

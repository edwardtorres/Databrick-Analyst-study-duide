import { test, expect } from './fixtures.js'
import { CHAPTERS } from '../../src/data/chapters.js'

// The blocked request logs a network error on purpose.
test.use({ allowConsoleErrors: true })

// Matches the Chapter 4 content chunk in dev (/src/data/ch4/index.js) and in
// the production build (/assets/ch4-<hash>.js), with or without ?retry=N.
const CH4_CHUNK = /\/(src\/data\/ch4\/index\.js|assets\/ch4-[\w-]+\.js)(\?.*)?$/

test('a failed chapter download shows Retry/Reload, and Retry recovers', async ({ page }) => {
  let blocked = true
  await page.route(CH4_CHUNK, (route) => (blocked ? route.abort('failed') : route.continue()))

  await page.goto('#/chapter/4')
  await expect(page.getByText("Couldn't load this chapter")).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reload' })).toBeVisible()

  blocked = false
  // Retry re-imports the chunk URL (from the dev module path or the build's
  // chunk-map.json, never the error text) with a cache-busting query.
  const retryRequest = page.waitForRequest((r) => CH4_CHUNK.test(r.url()) && /[?&]retry=\d+/.test(r.url()))
  await page.getByRole('button', { name: 'Retry' }).click()
  await retryRequest
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

test('production build ships a chunk map for every built chapter', async ({ page, baseURL }, info) => {
  test.skip(info.project.name === 'dev', 'chunk-map.json only exists in a build')
  const res = await page.request.get(new URL('chunk-map.json', baseURL).href)
  expect(res.ok()).toBe(true)
  const map = await res.json()
  for (const c of CHAPTERS.filter((x) => x.built)) {
    expect(map[c.id], `chapter ${c.id}`).toMatch(new RegExp(`^assets/ch${c.id}-[\\w-]+\\.js$`))
    expect((await page.request.get(new URL(map[c.id], baseURL).href)).ok()).toBe(true)
  }
})

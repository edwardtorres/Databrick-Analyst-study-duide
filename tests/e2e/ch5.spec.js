import { test, expect, progress } from './fixtures.js'

test('Query Profile Detective: diagnose, fix, then see the after profile', async ({ page }) => {
  await page.goto('#/lab/query-profile-detective')
  await expect(page.getByText("One customer's orders take 3 minutes")).toBeVisible()
  await expect(page.getByText('12,000 read / 0 pruned')).toBeVisible()
  await page.getByRole('button', { name: 'Full scan: files are not being pruned' }).click()
  await page.getByRole('button', { name: /CLUSTER BY \(customer_id\)/ }).click()
  await expect(page.getByText('✅ Case solved')).toBeVisible()
  await expect(page.getByText('9 read / 11,991 pruned')).toBeVisible()
  expect((await progress(page)).labs['qp-pruning']).toBe(true)

  // a wrong diagnosis + wrong fix is explained, not rewarded
  await page.getByRole('button', { name: /Next case/ }).click()
  await expect(page.getByText('Nightly aggregation slowed from 4 to 25 minutes')).toBeVisible()
  await page.getByRole('button', { name: 'Data skew: one task does most of the work' }).click()
  await page.getByRole('button', { name: 'Raise the maximum number of clusters' }).click()
  await expect(page.getByText('Not quite. Here is what was going on.')).toBeVisible()
  await expect(page.getByText(/Spill means the operator ran out of memory/)).toBeVisible()
  expect((await progress(page)).labs['qp-spill']).toBeUndefined()
})

test('Cache Lab: miss, hit, invalidation after a write, and a non-cacheable query', async ({ page }) => {
  await page.goto('#/lab/cache-lab')
  const log = page.getByTestId('cache-log')
  await page.getByRole('button', { name: 'Run · predict MISS' }).click()
  await expect(log.getByText('MISS', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Run · predict HIT' }).click()
  await expect(log.getByText('RESULT CACHE HIT', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /INSERT INTO gold.daily_sales/ }).click()
  await expect(page.getByTestId('result-cache').getByText('stale')).toBeVisible()
  await page.getByRole('button', { name: 'Run · predict HIT' }).click()
  await expect(log.getByText('MISS (invalidated)', { exact: true })).toBeVisible()
  await expect(log.getByText('❌ You predicted HIT')).toBeVisible()
  await expect(log.getByText(/Disk cache helped: 4 of 5 files/)).toBeVisible()
  await page.getByRole('button', { name: /Revenue \+ "as of" time/ }).click()
  await page.getByRole('button', { name: 'Run · predict MISS' }).click()
  await expect(log.getByText('NOT CACHEABLE', { exact: true })).toBeVisible()
  await expect(page.getByText('Predictions 3/4')).toBeVisible()
  const labs = (await progress(page)).labs
  for (const k of ['hit', 'invalidated', 'bypass', 'disk']) expect(labs[`cache-${k}`]).toBe(true)
})

test('Chapter 5 fix challenges: the broken query runs but is wrong; the fix passes', async ({ page }) => {
  await page.goto('#/sql/c5-fix-not-in-null')
  await expect(page.locator('textarea')).toHaveValue(/NOT IN/)
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText(/x NOT IN \(…, NULL\) is never true/)).toBeVisible()
  await page.locator('textarea').fill('SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)')
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText('Correct!')).toBeVisible()

  await page.goto('#/sql/c5-fix-double-count')
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText(/repeats each of its orders 3 times/)).toBeVisible()
})

test('Chapter 5 page lists levels, questions and challenges', async ({ page }) => {
  await page.goto('#/chapter/5')
  await expect(page.getByText('26 questions')).toBeVisible()
  await expect(page.getByText('6 SQL challenges')).toBeVisible()
  await expect(page.getByText('Fixing Wrong Results')).toBeVisible()
})

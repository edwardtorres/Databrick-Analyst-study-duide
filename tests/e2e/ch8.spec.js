import { test, expect, progress } from './fixtures.js'
import { CARDS } from '../../src/lib/medallionSorter.js'
import { COLUMNS } from '../../src/lib/starSchema.js'

const LAYER = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold' }

test('Medallion Sorter: a wrong placement is explained and can be moved; all correct earns XP', async ({ page }) => {
  await page.goto('#/lab/medallion-sorter')
  const vault = CARDS.find((c) => c.id === 'vault')
  await page.getByTestId('ms-cards').getByRole('button', { name: vault.text }).click()
  await page.getByRole('button', { name: 'Place in Gold' }).click()
  await expect(page.getByTestId('layer-gold').getByText(/Belongs in Silver/)).toBeVisible()
  await expect(page.getByText('Correct 0/12')).toBeVisible()
  // move it
  await page.getByTestId('layer-gold').getByRole('button', { name: /Data vault hubs/ }).click()
  await page.getByRole('button', { name: 'Place in Silver' }).click()
  await expect(page.getByTestId('layer-silver').getByText(/integration model/)).toBeVisible()

  for (const c of CARDS.filter((x) => x.id !== 'vault')) {
    await page.getByTestId('ms-cards').getByRole('button', { name: c.text }).click()
    await page.getByRole('button', { name: `Place in ${LAYER[c.answer]}` }).click()
  }
  await expect(page.getByText('Correct 12/12')).toBeVisible()
  await expect(page.getByText(/All 12 placed correctly/)).toBeVisible()
  expect((await progress(page)).labs['ms-all']).toBe(true)
  await page.reload()
  await expect(page.getByText('Correct 12/12')).toBeVisible()
})

test('Star Schema Builder: grain, columns and snowflake, with explanations for wrong picks', async ({ page }) => {
  await page.goto('#/lab/star-schema-builder')
  const grain = page.getByRole('group', { name: 'Grain' })
  await grain.getByRole('button', { name: 'One row per order', exact: true }).click()
  await expect(grain.getByRole('status')).toContainText('Too coarse')
  await grain.getByRole('button', { name: /One row per order line/ }).click()
  await expect(grain.getByRole('status')).toContainText('most detailed grain')

  // a wrong placement first
  await page.getByTestId('ss-columns').getByRole('button', { name: 'region_name', exact: true }).click()
  await page.getByRole('button', { name: 'Put in fact_sales' }).click()
  await expect(page.getByText(/Belongs in dim_store/)).toBeVisible()
  await page.getByRole('button', { name: /✗ region_name/ }).click()
  await page.getByRole('button', { name: 'Put in dim_store' }).click()
  for (const c of COLUMNS.filter((x) => x.id !== 'region_name')) {
    await page.getByTestId('ss-columns').getByRole('button', { name: c.id, exact: true }).click()
    await page.getByRole('button', { name: `Put in ${c.answer}` }).click()
  }
  await expect(page.getByRole('heading', { name: /2\. Place the columns ✅/ })).toBeVisible()

  const snow = page.getByRole('group', { name: 'Snowflake' })
  await snow.getByRole('button', { name: /Move quantity and net_amount/ }).click()
  await expect(snow.getByRole('status')).toContainText('Measures belong in the fact')
  await snow.getByRole('button', { name: /dim_region/ }).click()
  await expect(page.getByText(/Model complete/)).toBeVisible()
  const labs = (await progress(page)).labs
  for (const k of ['ss-grain', 'ss-columns', 'ss-snowflake']) expect(labs[k]).toBe(true)
})

test('Chapter 8 challenges: the fan-out is explained, the fix passes; snowflake hop passes', async ({ page }) => {
  await page.goto('#/sql/c8-fix-fanout')
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText(/repeats each target on every order line/)).toBeVisible()
  await page.locator('textarea').fill(`SELECT p.category, SUM(o.amount), MAX(t.target) FROM orders o
JOIN products p ON o.product_id = p.product_id JOIN category_targets t ON t.category = p.category
WHERE o.status = 'completed' GROUP BY p.category`)
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText('Correct!')).toBeVisible()

  await page.goto('#/sql/c8-snowflake-region')
  await page.locator('textarea').fill(`SELECT r.region_name, SUM(o.amount) FROM orders o JOIN customers c ON o.customer_id = c.customer_id
JOIN regions r ON c.region_id = r.region_id WHERE o.status = 'completed' GROUP BY r.region_name`)
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText('Correct!')).toBeVisible()
  const ch = (await progress(page)).challenges
  expect(ch['c8-fix-fanout'].solved).toBe(true)
  expect(ch['c8-snowflake-region'].solved).toBe(true)
})

test('Chapter 8 page lists levels, questions and challenges', async ({ page }) => {
  await page.goto('#/chapter/8')
  await expect(page.getByText('26 questions')).toBeVisible()
  await expect(page.getByText('5 SQL challenges')).toBeVisible()
  await expect(page.getByText('4. Querying a Star in SQL')).toBeVisible()
})

import { test, expect, progress } from './fixtures.js'

test('Catalog Explorer: all five missions by browsing, tagging and following lineage', async ({ page }) => {
  await page.goto('#/lab/catalog-explorer')
  const missions = page.getByTestId('missions')
  await expect(page.getByText('Missions 0/5')).toBeVisible()

  // 1. certified: the deprecated table is rejected, the certified one passes
  await page.getByRole('button', { name: 'prod', exact: true }).click()
  await page.getByRole('button', { name: 'sales', exact: true }).click()
  await page.getByRole('button', { name: /orders_legacy/ }).click()
  await expect(page.getByTestId('object-page').getByText('Deprecated', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Query this table' }).click()
  await expect(missions.getByText(/That one is deprecated/)).toBeVisible()
  // the same feedback shows next to the action, so phone users don't have to scroll up
  await expect(page.getByTestId('object-page').getByRole('status')).toContainText('That one is deprecated')
  await page.getByTestId('breadcrumb').getByRole('button', { name: 'sales' }).click()
  await page.getByRole('button', { name: /^orders\s*Certified/ }).click()
  await page.getByRole('button', { name: 'Query this table' }).click()
  await expect(page.getByText('Missions 1/5')).toBeVisible()
  await expect(page.getByTestId('object-page').getByRole('status')).toContainText('Mission done')

  // 2. external: open revenue_daily, read Details, answer
  await missions.getByRole('button', { name: /Managed or external/ }).click()
  await page.getByTestId('breadcrumb').getByRole('button', { name: 'prod' }).click()
  await page.getByRole('button', { name: 'finance', exact: true }).click()
  await page.getByRole('button', { name: /revenue_daily/ }).click()
  await page.getByRole('button', { name: 'details', exact: true }).click()
  await expect(page.getByTestId('details').getByText('EXTERNAL')).toBeVisible()
  await expect(page.getByTestId('details').getByText('s3://acme-finance/gold/revenue_daily/')).toBeVisible()
  await missions.getByRole('button', { name: 'External', exact: true }).click()
  await expect(page.getByText('Missions 2/5')).toBeVisible()

  // 3. tag the email column
  await page.getByTestId('breadcrumb').getByRole('button', { name: 'prod' }).click()
  await page.getByRole('button', { name: 'sales', exact: true }).click()
  await page.getByRole('button', { name: /^customers/ }).click()
  await page.getByRole('button', { name: 'Tag column email' }).click()
  await page.getByRole('button', { name: '+ pii = email' }).click()
  await expect(page.getByText('Missions 3/5')).toBeVisible()

  // 4. upstream: follow orders -> job -> bronze, picking the job first is wrong
  await missions.getByRole('button', { name: /Where does orders come from/ }).click()
  await page.getByTestId('breadcrumb').getByRole('button', { name: 'sales' }).click()
  await page.getByRole('button', { name: /^orders\s*Certified/ }).click()
  await page.getByRole('button', { name: 'lineage', exact: true }).click()
  await page.getByTestId('lineage').getByRole('button', { name: /nightly_orders_etl/ }).click()
  await page.getByTestId('lineage').getByRole('button', { name: /orders_bronze/ }).click()
  await page.getByRole('button', { name: /Pick as the answer/ }).click()
  await expect(page.getByText('Missions 4/5')).toBeVisible()

  // 5. downstream: Exec Revenue is two hops away through the view
  await missions.getByRole('button', { name: /What breaks if orders changes/ }).click()
  await page.getByRole('button', { name: 'Catalog', exact: true }).click()
  await page.getByRole('button', { name: 'prod', exact: true }).click()
  await page.getByRole('button', { name: 'sales', exact: true }).click()
  await page.getByRole('button', { name: /^orders\s*Certified/ }).click()
  await page.getByRole('button', { name: 'lineage', exact: true }).click()
  await page.getByTestId('lineage').getByRole('button', { name: /revenue_daily/ }).click()
  await page.getByRole('button', { name: 'lineage', exact: true }).click()
  await page.getByTestId('lineage').getByRole('button', { name: /Finance Close/ }).click()
  await page.getByRole('button', { name: 'Flag as affected' }).click()
  await missions.getByRole('button', { name: 'Check dashboards' }).click()
  await expect(missions.getByText(/You missed a dashboard/)).toBeVisible()
  // back to orders -> view -> Exec Revenue
  await page.getByTestId('lineage').getByRole('button', { name: /revenue_daily/ }).click()
  await page.getByRole('button', { name: 'lineage', exact: true }).click()
  await page.getByTestId('lineage').getByRole('button', { name: /prod\.sales\.orders$/ }).click()
  await page.getByRole('button', { name: 'lineage', exact: true }).click()
  await page.getByTestId('lineage').getByRole('button', { name: /v_revenue_by_region/ }).click()
  await page.getByRole('button', { name: 'lineage', exact: true }).click()
  await page.getByTestId('lineage').getByRole('button', { name: /Exec Revenue/ }).click()
  await page.getByRole('button', { name: 'Flag as affected' }).click()
  await missions.getByRole('button', { name: 'Check dashboards' }).click()
  await expect(page.getByText('Missions 5/5')).toBeVisible()

  const p = await progress(page)
  for (const k of ['certified', 'external', 'tag', 'upstream', 'downstream']) expect(p.labs[`ce-${k}`]).toBe(true)
  expect(p.labState.catalogExplorer.tags['prod.sales.customers#email']).toEqual(['pii=email'])

  // state survives a reload
  await page.reload()
  await expect(page.getByText('Missions 5/5')).toBeVisible()
})

test('Chapter 2 cleaning challenges: a fix challenge explains the trap; write challenges pass', async ({ page }) => {
  await page.goto('#/sql/c2-fix-usable-email')
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText(/COUNT\(email\) skips NULLs but counts/)).toBeVisible()
  await page.locator('textarea').fill("SELECT COUNT(*) FROM customers WHERE email IS NOT NULL AND TRIM(email) NOT IN ('', 'N/A')")
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText('Correct!')).toBeVisible()

  await page.goto('#/sql/c2-clean-latest')
  await page.locator('textarea').fill(`SELECT email, tier FROM (
  SELECT LOWER(TRIM(email)) AS email, LOWER(TRIM(tier)) AS tier,
    ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(email)) ORDER BY signed_up DESC) AS rn
  FROM raw_signups) t WHERE rn = 1`)
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText('Correct!')).toBeVisible()

  await page.goto('#/sql/c2-clean-region')
  await page.locator('textarea').fill("SELECT COALESCE(r.region_name, 'Unassigned'), COUNT(*) FROM customers c LEFT JOIN regions r ON c.region_id = r.region_id GROUP BY 1")
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText('Correct!')).toBeVisible()

  const ch = (await progress(page)).challenges
  for (const id of ['c2-fix-usable-email', 'c2-clean-latest', 'c2-clean-region']) expect(ch[id].solved).toBe(true)
})

test('Chapter 2 page lists levels, questions and challenges', async ({ page }) => {
  await page.goto('#/chapter/2')
  await expect(page.getByText('26 questions')).toBeVisible()
  await expect(page.getByText('9 SQL challenges')).toBeVisible()
  await expect(page.getByText('3. Cleaning Data in SQL')).toBeVisible()
})

test('Catalog Explorer also appears in Chapter 1\'s Catalog Explorer level', async ({ page }) => {
  await page.goto('#/chapter/1')
  await page.getByText('3. Catalog Explorer').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('heading', { name: '🧭 Catalog Explorer' })).toBeVisible()
})

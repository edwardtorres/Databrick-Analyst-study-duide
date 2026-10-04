import { test, expect, progress } from './fixtures.js'

test('Chart Picker: a poor pick shows both charts and explains the best one', async ({ page }) => {
  await page.goto('#/lab/chart-picker')
  await expect(page.getByText('How has monthly revenue changed over the last 12 months?')).toBeVisible()
  await page.getByRole('button', { name: 'Pie', exact: true }).click()
  await expect(page.getByText('❌ Poor fit')).toBeVisible()
  await expect(page.getByText('Your choice: Pie')).toBeVisible()
  await expect(page.getByText('Best: Line', { exact: true })).toBeVisible()
  await expect(page.locator('figure svg')).toHaveCount(2)

  await page.getByRole('button', { name: 'Line', exact: true }).click()
  await expect(page.getByText('✅ Best choice')).toBeVisible()
  expect((await progress(page)).labs['chart-trend']).toBe(true)

  // next scenario renders
  await page.getByRole('button', { name: /Next scenario/ }).click()
  await expect(page.getByText('Which region sold the most last quarter?')).toBeVisible()
})

test('Dashboard Config: the right setup meets every requirement; wrong choices are explained', async ({ page }) => {
  await page.goto('#/lab/dashboard-config')
  const pick = (label, option) => page.getByLabel(label).selectOption({ label: option })

  // A broken setup first: field filter + wrong alert operator
  await pick('Region picker widget is wired to', 'Filter on the region field')
  await pick(':region parameter default', "Default :region = 'EMEA'")
  await page.getByRole('button', { name: /Simulate the morning/ }).click()
  await expect(page.getByText(/leaves an empty chart/)).toBeVisible()
  await expect(page.getByText(/would also fire on normal days/)).toBeVisible() // default "> 5,000" fires for the wrong reason

  await pick('Region picker widget is wired to', 'Dataset parameter :region')
  await pick('Schedule (published dashboard)', 'Refresh daily at 06:00')
  await pick('Operator', '<')
  await pick('Threshold', '50,000')
  await pick('Notification destination', 'Slack: #sales-alerts')
  await pick('Publish with', "Share data permissions (publisher's)")
  await pick('Share with (dashboard permission)', 'regional-managers (view)')
  await expect(page.getByText('Every requirement met')).toBeVisible()
  expect((await progress(page)).labs['dash-config']).toBe(true)

  await page.reload()
  await expect(page.getByLabel('Share with (dashboard permission)')).toHaveValue('managers')
})

test('Chapter 6 page and a level with a lab load', async ({ page }) => {
  await page.goto('#/chapter/6')
  await expect(page.getByText('Dashboards & Visualizations')).toBeVisible()
  await expect(page.getByText('28 questions')).toBeVisible()
  await page.goto('#/chapter/6/s/viz')
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: /Continue/ }).click()
  await expect(page.getByRole('heading', { name: /Chart Picker/ })).toBeVisible()
})

test('Chart Picker: tapping a mark shows its value (touch has no hover)', async ({ page }) => {
  await page.goto('#/lab/chart-picker')
  await page.getByRole('button', { name: 'Bar', exact: true }).click()
  const yours = page.locator('figure').first()
  const firstBar = yours.locator('[data-mark]').first()
  await firstBar.tap()
  await expect(yours.getByTestId('value-label')).toHaveText('Jan: 310 $k')
  await firstBar.tap()
  await expect(yours.getByTestId('value-label')).toHaveCount(0)

  // a point on the best (line) chart, then tapping the background clears it
  const best = page.locator('figure').nth(1)
  await best.locator('[data-mark]').last().tap()
  await expect(best.getByTestId('value-label')).toHaveText('Dec: 472')
  await best.locator('svg').tap({ position: { x: 5, y: 5 } })
  await expect(best.getByTestId('value-label')).toHaveCount(0)
})

test('Chart Picker: tapped values are announced through a polite live region', async ({ page }) => {
  await page.goto('#/lab/chart-picker')
  await page.getByRole('button', { name: 'Bar', exact: true }).click()
  const yours = page.locator('figure').first()
  const live = yours.getByTestId('value-live')
  await expect(live).toHaveAttribute('aria-live', 'polite')
  await expect(live).toHaveText('')
  await yours.locator('[data-mark]').first().tap()
  await expect(live).toHaveText('Jan: 310 $k')
})

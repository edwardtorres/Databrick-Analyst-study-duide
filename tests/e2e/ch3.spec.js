import { test, expect, progress } from './fixtures.js'

test('Ingestion Picker: a wrong pick explains all four options; the right one earns XP', async ({ page }) => {
  await page.goto('#/lab/ingestion-picker')
  await expect(page.getByText(/New CSV files land in an S3 bucket every hour/)).toBeVisible()
  await page.getByRole('button', { name: /COPY INTO/ }).click()
  await expect(page.getByText("❌ It's Auto Loader")).toBeVisible()
  await expect(page.getByTestId('why-list').locator('> div')).toHaveCount(4)
  await expect(page.getByTestId('why-list').getByText(/recommended for thousands of files, not millions/)).toBeVisible()
  await page.getByRole('button', { name: /Next scenario/ }).click()
  await expect(page.getByText(/A partner on another cloud/)).toBeVisible()
  await page.getByRole('button', { name: /Delta Sharing/ }).click()
  await expect(page.getByText('✅ Delta Sharing')).toBeVisible()
  await expect(page.getByText('Matched 1/12')).toBeVisible()
  expect((await progress(page)).labs['ip-partner-other-cloud']).toBe(true)
})

test('Upload Wizard: every mistake is explained, then the table is created', async ({ page }) => {
  await page.goto('#/lab/upload-wizard')
  const mistakes = page.getByTestId('mistakes')

  // unsupported file
  await page.getByRole('button', { name: /campaign_teaser\.mp4/ }).click()
  await expect(page.getByRole('status')).toContainText('upload it to a volume')
  await page.getByRole('button', { name: /store_targets\.csv/ }).click()

  // no CREATE TABLE privilege
  await page.getByRole('button', { name: 'prod', exact: true }).click()
  await page.getByRole('button', { name: 'sales', exact: true }).click()
  await page.getByRole('button', { name: 'store_targets', exact: true }).click()
  await page.getByRole('button', { name: /Next: preview/ }).click()
  await expect(page.getByRole('status')).toContainText('not CREATE TABLE')

  // wrong schema
  await page.getByRole('button', { name: 'main', exact: true }).click()
  await page.getByRole('button', { name: 'default', exact: true }).click()
  await page.getByRole('button', { name: /Next: preview/ }).click()
  await expect(page.getByRole('status')).toContainText('main.marketing')

  await page.getByRole('button', { name: 'marketing', exact: true }).click()
  await page.getByRole('button', { name: /Next: preview/ }).click()

  // header read as data
  const grid = page.getByTestId('upload-preview')
  await expect(grid.getByText('_c0')).toBeVisible()
  await page.getByRole('button', { name: /Create table/ }).click()
  await expect(page.getByRole('status')).toContainText('header line was read as data')

  // wrong inferred type
  await page.getByLabel('First row contains the header').check()
  await expect(grid.getByText('2134', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /Create table/ }).click()
  await expect(page.getByRole('status')).toContainText('02134 becomes 2134')
  await page.getByLabel('Type of store_zip').selectOption('STRING')
  await expect(grid.getByText('02134', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: /Create table/ }).click()
  await expect(page.getByText('✅ Created main.marketing.store_targets')).toBeVisible()
  await expect(mistakes.getByText('Mistakes explored 4/4')).toBeVisible()
  expect((await progress(page)).labs['up-created']).toBe(true)
})

test('Chapter 3 page lists its levels', async ({ page }) => {
  await page.goto('#/chapter/3')
  await expect(page.getByText('26 questions')).toBeVisible()
  await expect(page.getByText('5. Uploading a File in the UI')).toBeVisible()
})

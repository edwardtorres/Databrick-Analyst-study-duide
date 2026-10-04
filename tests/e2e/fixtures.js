import { test as base, expect } from '@playwright/test'

// Every test fails if the page logs a console error or throws, unless it
// opts out with test.use({ allowConsoleErrors: true }).
export const test = base.extend({
  allowConsoleErrors: [false, { option: true }],
  consoleErrors: [
    async ({ page, allowConsoleErrors }, use) => {
      const errors = []
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
      await use(errors)
      if (!allowConsoleErrors) expect(errors, 'console errors').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }

// Read the saved progress object from localStorage.
export const progress = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('lakehouse-quest:v1') || 'null'))

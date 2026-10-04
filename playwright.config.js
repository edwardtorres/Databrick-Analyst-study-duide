import { defineConfig, devices } from '@playwright/test'

// End-to-end tests run against the Vite dev server (the dev-only #/__crash
// route used by the error-boundary test only exists there).
const PORT = 4321

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}/`,
    ...devices['Pixel 7'],
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})

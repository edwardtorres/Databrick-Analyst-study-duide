import { defineConfig, devices } from '@playwright/test'

// Two projects run the same suite:
//   dev  - the Vite dev server (includes the dev-only #/__crash route)
//   prod - `vite preview` of a fresh production build (real chunking,
//          hashed assets, base './'); the crash test is skipped there
const DEV_PORT = 4321
const PROD_PORT = 4322

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    ...devices['Pixel 7'],
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'dev', use: { baseURL: `http://localhost:${DEV_PORT}/` } },
    { name: 'prod', use: { baseURL: `http://localhost:${PROD_PORT}/` }, testIgnore: /crash\.spec\.js/ },
  ],
  webServer: [
    {
      command: `npx vite --port ${DEV_PORT} --strictPort`,
      url: `http://localhost:${DEV_PORT}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: `npx vite build --logLevel warn && npx vite preview --port ${PROD_PORT} --strictPort`,
      url: `http://localhost:${PROD_PORT}/`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})

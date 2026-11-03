import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'e2e.spec.ts',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:3847',
    headless: true,
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: 'npx next start -p 3847',
    url: 'http://localhost:3847',
    reuseExistingServer: false,
    timeout: 60000,
  },
});

import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', fullyParallel: false, retries: 0, reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:8000', browserName: 'chromium',
    launchOptions: process.env.SALTSHADOW_CHROME ? { executablePath: process.env.SALTSHADOW_CHROME } : {} },
  webServer: { command: 'python3 -m http.server 8000 --bind 127.0.0.1', url: 'http://127.0.0.1:8000', reuseExistingServer: false }
});

import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* 運行測試的最大時間 */
  timeout: 30 * 1000,
  /* 每個測試的最大時間 */
  expect: {
    timeout: 5000,
  },
  /* 失敗時重試測試的次數 */
  retries: process.env.CI ? 2 : 0,
  /* 並行運行的測試數量 */
  workers: process.env.CI ? 1 : undefined,
  /* 報告器配置 */
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
    ['dot'],
  ],
  /* 共享設置 */
  use: {
    /* 基礎 URL */
    baseURL: 'http://localhost:3000',

    /* 收集測試追蹤信息 */
    trace: 'on-first-retry',

    /* 截圖設置 */
    screenshot: 'only-on-failure',

    /* 視頻錄製設置 */
    video: 'retain-on-failure',

    /* 視口大小 */
    viewport: { width: 1920, height: 1080 },

    /* 忽略 HTTPS 錯誤 */
    ignoreHTTPSErrors: true,

    /* 用戶代理 */
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',

    /* 額外的 HTTP 頭 */
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  },

  /* 配置不同瀏覽器的測試 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* 測試移動端 */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* 測試平板 */
    {
      name: 'Tablet Chrome',
      use: { ...devices['iPad Pro 11 landscape'] },
    },
  ],

  /* 運行測試的目錄 */
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],

  /* 忽略的文件 */
  testIgnore: ['**/node_modules/**', '**/dist/**', '**/build/**'],

  /* 全局設置 */
  globalSetup: require.resolve('./tests/setup/global-setup.ts'),
  globalTeardown: require.resolve('./tests/setup/global-teardown.ts'),

  /* 輸出目錄 */
  outputDir: 'test-results/',

  /* 測試環境變數 */
  env: {
    NODE_ENV: 'test',
    TEST_MODE: 'e2e',
  },

  /* 超時設置 */
  timeout: 30000,
  expect: {
    timeout: 5000,
  },

  /* 重試設置 */
  retries: process.env.CI ? 2 : 0,

  /* 並行設置 */
  workers: process.env.CI ? 1 : undefined,

  /* 報告設置 */
  reporter: [
    [
      'html',
      {
        outputFolder: 'test-results/html-report',
        open: 'never',
      },
    ],
    [
      'json',
      {
        outputFile: 'test-results/test-results.json',
      },
    ],
    [
      'junit',
      {
        outputFile: 'test-results/junit.xml',
      },
    ],
    ['list'],
    ['dot'],
  ],

  /* 使用設置 */
  use: {
    /* 基礎 URL */
    baseURL: 'http://localhost:3000',

    /* 收集測試追蹤信息 */
    trace: 'on-first-retry',

    /* 截圖設置 */
    screenshot: 'only-on-failure',

    /* 視頻錄製設置 */
    video: 'retain-on-failure',

    /* 視口大小 */
    viewport: { width: 1920, height: 1080 },

    /* 忽略 HTTPS 錯誤 */
    ignoreHTTPSErrors: true,

    /* 用戶代理 */
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',

    /* 額外的 HTTP 頭 */
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },

    /* 動作超時 */
    actionTimeout: 10000,

    /* 導航超時 */
    navigationTimeout: 15000,

    /* 等待超時 */
    waitForTimeout: 5000,
  },

  /* 瀏覽器設置 */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  /* 測試目錄結構 */
  testDir: './tests/e2e',
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
  ],

  /* 全局設置文件 */
  globalSetup: require.resolve('./tests/setup/global-setup.ts'),
  globalTeardown: require.resolve('./tests/setup/global-teardown.ts'),

  /* 輸出目錄 */
  outputDir: 'test-results/',

  /* 環境變數 */
  env: {
    NODE_ENV: 'test',
    TEST_MODE: 'e2e',
    API_BASE_URL: 'http://localhost:5000',
  },

  /* 超時設置 */
  timeout: 30000,
  expect: {
    timeout: 5000,
  },

  /* 重試設置 */
  retries: process.env.CI ? 2 : 0,

  /* 並行設置 */
  workers: process.env.CI ? 1 : undefined,

  /* 報告設置 */
  reporter: [
    [
      'html',
      {
        outputFolder: 'test-results/html-report',
        open: 'never',
      },
    ],
    [
      'json',
      {
        outputFile: 'test-results/test-results.json',
      },
    ],
    [
      'junit',
      {
        outputFile: 'test-results/junit.xml',
      },
    ],
    ['list'],
    ['dot'],
  ],

  /* 使用設置 */
  use: {
    /* 基礎 URL */
    baseURL: 'http://localhost:3000',

    /* 收集測試追蹤信息 */
    trace: 'on-first-retry',

    /* 截圖設置 */
    screenshot: 'only-on-failure',

    /* 視頻錄製設置 */
    video: 'retain-on-failure',

    /* 視口大小 */
    viewport: { width: 1920, height: 1080 },

    /* 忽略 HTTPS 錯誤 */
    ignoreHTTPSErrors: true,

    /* 用戶代理 */
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',

    /* 額外的 HTTP 頭 */
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },

    /* 動作超時 */
    actionTimeout: 10000,

    /* 導航超時 */
    navigationTimeout: 15000,

    /* 等待超時 */
    waitForTimeout: 5000,
  },

  /* 瀏覽器設置 */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

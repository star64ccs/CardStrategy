import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// 測試環境配置
export interface TestEnvironmentConfig {
  baseUrl: string;
  apiBaseUrl: string;
  timeout: number;
  retries: number;
}

// 默認配置
const defaultConfig: TestEnvironmentConfig = {
  baseUrl: 'http://localhost:3000',
  apiBaseUrl: 'http://localhost:5000',
  timeout: 30000,
  retries: 2
};

// 測試數據
export const testData = {
  users: [
    {
      id: '1',
      email: 'test@cardstrategy.com',
      password: 'TestPassword123!',
      username: 'testuser',
      name: 'Test User'
    },
    {
      id: '2',
      email: 'admin@cardstrategy.com',
      password: 'AdminPassword123!',
      username: 'admin',
      name: 'Admin User',
      role: 'admin'
    }
  ],
  cards: [
    {
      id: '1',
      name: 'Monkey D. Luffy',
      series: 'ONE PIECE',
      rarity: 'Rare',
      condition: 'Near Mint',
      price: 150.00,
      image: '/images/cards/luffy.jpg'
    },
    {
      id: '2',
      name: 'Roronoa Zoro',
      series: 'ONE PIECE',
      rarity: 'Uncommon',
      condition: 'Light Play',
      price: 75.00,
      image: '/images/cards/zoro.jpg'
    },
    {
      id: '3',
      name: 'Nami',
      series: 'ONE PIECE',
      rarity: 'Common',
      condition: 'Mint',
      price: 25.00,
      image: '/images/cards/nami.jpg'
    }
  ],
  marketData: [
    {
      cardId: '1',
      date: '2024-01-01',
      price: 150.00,
      volume: 10,
      trend: 'up'
    },
    {
      cardId: '1',
      date: '2024-01-02',
      price: 155.00,
      volume: 15,
      trend: 'up'
    },
    {
      cardId: '2',
      date: '2024-01-01',
      price: 75.00,
      volume: 5,
      trend: 'stable'
    }
  ],
  aiPredictions: [
    {
      cardId: '1',
      predictedPrice: 160.00,
      confidence: 0.85,
      timeframe: '1_month',
      factors: ['market_trend', 'rarity', 'demand']
    },
    {
      cardId: '2',
      predictedPrice: 80.00,
      confidence: 0.72,
      timeframe: '1_month',
      factors: ['market_trend', 'condition']
    }
  ]
};

// MSW 服務器設置
export const server = setupServer(
  // 用戶認證 API
  rest.post(`${defaultConfig.apiBaseUrl}/api/auth/login`, (req, res, ctx) => {
    const { email, password } = req.body as any;
    const user = testData.users.find(u => u.email === email && u.password === password);

    if (user) {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          token: 'mock-jwt-token',
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role || 'user'
          }
        })
      );
    }

    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        message: 'Invalid credentials'
      })
    );
  }),

  rest.post(`${defaultConfig.apiBaseUrl}/api/auth/register`, (req, res, ctx) => {
    const { email, username, password } = req.body as any;

    // 模擬用戶註冊
    const newUser = {
      id: Date.now().toString(),
      email,
      username,
      password,
      name: username
    };

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          name: newUser.name,
          role: 'user'
        }
      })
    );
  }),

  // 卡片 API
  rest.get(`${defaultConfig.apiBaseUrl}/api/cards`, (req, res, ctx) => {
    const search = req.url.searchParams.get('search');
    const series = req.url.searchParams.get('series');
    const rarity = req.url.searchParams.get('rarity');

    let filteredCards = testData.cards;

    if (search) {
      filteredCards = filteredCards.filter(card =>
        card.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (series) {
      filteredCards = filteredCards.filter(card => card.series === series);
    }

    if (rarity) {
      filteredCards = filteredCards.filter(card => card.rarity === rarity);
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: filteredCards,
        total: filteredCards.length
      })
    );
  }),

  rest.get(`${defaultConfig.apiBaseUrl}/api/cards/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const card = testData.cards.find(c => c.id === id);

    if (card) {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: card
        })
      );
    }

    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        message: 'Card not found'
      })
    );
  }),

  // 市場數據 API
  rest.get(`${defaultConfig.apiBaseUrl}/api/market/data`, (req, res, ctx) => {
    const cardId = req.url.searchParams.get('cardId');
    const timeframe = req.url.searchParams.get('timeframe') || '1_month';

    let filteredData = testData.marketData;

    if (cardId) {
      filteredData = filteredData.filter(data => data.cardId === cardId);
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: filteredData,
        timeframe
      })
    );
  }),

  // AI 預測 API
  rest.get(`${defaultConfig.apiBaseUrl}/api/ai/predictions`, (req, res, ctx) => {
    const cardId = req.url.searchParams.get('cardId');

    let predictions = testData.aiPredictions;

    if (cardId) {
      predictions = predictions.filter(p => p.cardId === cardId);
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: predictions
      })
    );
  }),

  // AI 掃描 API
  rest.post(`${defaultConfig.apiBaseUrl}/api/ai/scan`, async (req, res, ctx) => {
    // 模擬 AI 掃描處理時間
    await new Promise(resolve => setTimeout(resolve, 2000));

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          cardName: 'Monkey D. Luffy',
          series: 'ONE PIECE',
          rarity: 'Rare',
          condition: 'Near Mint',
          confidence: 0.95,
          price: 150.00
        }
      })
    );
  }),

  // 投資組合 API
  rest.get(`${defaultConfig.apiBaseUrl}/api/portfolio`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          totalValue: 500.00,
          totalCards: 3,
          profitLoss: 50.00,
          profitLossPercentage: 11.11,
          cards: testData.cards.map(card => ({
            ...card,
            quantity: 1,
            purchasePrice: card.price * 0.9
          }))
        }
      })
    );
  }),

  // 數據質量 API
  rest.get(`${defaultConfig.apiBaseUrl}/api/data-quality/assessment`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          score: 85,
          issues: [
            {
              type: 'missing_data',
              severity: 'medium',
              description: 'Some cards missing condition information',
              count: 5
            },
            {
              type: 'duplicate_records',
              severity: 'low',
              description: 'Duplicate card entries found',
              count: 2
            }
          ],
          recommendations: [
            'Add missing condition data',
            'Remove duplicate entries',
            'Validate price data accuracy'
          ]
        }
      })
    );
  }),

  // 錯誤測試 API
  rest.get(`${defaultConfig.apiBaseUrl}/api/test/error`, (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        success: false,
        message: 'Internal server error'
      })
    );
  }),

  rest.get(`${defaultConfig.apiBaseUrl}/api/test/timeout`, async (req, res, ctx) => {
    await new Promise(resolve => setTimeout(resolve, 10000));
    return res(ctx.status(200));
  }),

  // 默認處理器
  rest.all('*', (req, res, ctx) => {
    console.warn(`Unhandled request: ${req.method} ${req.url}`);
    return res(ctx.status(404));
  })
);

// 測試環境類
export class TestEnvironment {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: TestEnvironmentConfig;

  constructor(config: Partial<TestEnvironmentConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  async setup(): Promise<void> {
    // 啟動 MSW 服務器
    server.listen({ onUnhandledRequest: 'warn' });

    // 啟動瀏覽器
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    // 創建上下文
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });

    // 創建頁面
    this.page = await this.context.newPage();

    // 設置請求攔截
    await this.page.route('**/*', route => {
      // 允許所有請求通過 MSW
      route.continue();
    });

    // 導航到應用
    await this.page.goto(this.config.baseUrl);
  }

  async cleanup(): Promise<void> {
    // 關閉頁面
    if (this.page) {
      await this.page.close();
      this.page = null;
    }

    // 關閉上下文
    if (this.context) {
      await this.context.close();
      this.context = null;
    }

    // 關閉瀏覽器
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    // 關閉 MSW 服務器
    server.close();
  }

  getPage(): Page {
    if (!this.page) {
      throw new Error('Test environment not set up. Call setup() first.');
    }
    return this.page;
  }

  async login(user: typeof testData.users[0]): Promise<void> {
    const page = this.getPage();

    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.click('[data-testid="submit-login"]');

    await page.waitForURL(/.*dashboard/);
  }

  async logout(): Promise<void> {
    const page = this.getPage();

    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    await page.waitForURL(/.*login/);
  }

  async navigateToModule(moduleName: string): Promise<void> {
    const page = this.getPage();

    await page.click(`[data-testid="${moduleName}-nav"]`);
    await page.waitForSelector(`[data-testid="${moduleName}-module"]`);
  }

  async waitForApiCall(apiPath: string, timeout = 5000): Promise<void> {
    const page = this.getPage();

    await page.waitForResponse(
      response => response.url().includes(apiPath),
      { timeout }
    );
  }
}

// 全局測試環境實例
let globalTestEnvironment: TestEnvironment | null = null;

// 設置測試環境
export async function setupTestEnvironment(config?: Partial<TestEnvironmentConfig>): Promise<void> {
  globalTestEnvironment = new TestEnvironment(config);
  await globalTestEnvironment.setup();
}

// 清理測試環境
export async function cleanupTestEnvironment(): Promise<void> {
  if (globalTestEnvironment) {
    await globalTestEnvironment.cleanup();
    globalTestEnvironment = null;
  }
}

// 獲取測試環境
export function getTestEnvironment(): TestEnvironment {
  if (!globalTestEnvironment) {
    throw new Error('Test environment not initialized. Call setupTestEnvironment() first.');
  }
  return globalTestEnvironment;
}

// 測試工具函數
export const testUtils = {
  // 創建測試用戶
  createTestUser: (overrides: Partial<typeof testData.users[0]> = {}) => ({
    ...testData.users[0],
    ...overrides
  }),

  // 創建測試卡片
  createTestCard: (overrides: Partial<typeof testData.cards[0]> = {}) => ({
    ...testData.cards[0],
    ...overrides
  }),

  // 等待元素可見
  waitForElement: async (page: Page, selector: string, timeout = 5000) => {
    await page.waitForSelector(selector, { state: 'visible', timeout });
  },

  // 等待元素消失
  waitForElementToDisappear: async (page: Page, selector: string, timeout = 5000) => {
    await page.waitForSelector(selector, { state: 'hidden', timeout });
  },

  // 截圖
  takeScreenshot: async (page: Page, name: string) => {
    await page.screenshot({ path: `test-results/screenshots/${name}.png` });
  },

  // 錄製視頻
  startVideoRecording: async (context: BrowserContext, name: string) => {
    await context.startVideoRecording({ path: `test-results/videos/${name}.webm` });
  },

  // 停止視頻錄製
  stopVideoRecording: async (context: BrowserContext) => {
    await context.stopVideoRecording();
  }
};

// 導出測試數據
export { testData };

// 導出默認配置
export { defaultConfig };

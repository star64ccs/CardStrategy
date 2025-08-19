import { setupServer } from 'msw/node';
import { rest } from 'msw';

// API 端點配置
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// 模擬數據
const mockCards = [
  { id: 1, name: '測試卡片1', price: 100, rarity: 'common', set: '測試系列' },
  { id: 2, name: '測試卡片2', price: 200, rarity: 'rare', set: '測試系列' },
  { id: 3, name: '測試卡片3', price: 500, rarity: 'epic', set: '測試系列' }
];

const mockMarketData = [
  { cardId: 1, date: '2024-01-01', price: 100, volume: 1000 },
  { cardId: 1, date: '2024-01-02', price: 110, volume: 1200 },
  { cardId: 1, date: '2024-01-03', price: 105, volume: 800 }
];

const mockAIPredictions = [
  { cardId: 1, predictedPrice: 120, confidence: 0.85, timeframe: '1m' },
  { cardId: 2, predictedPrice: 250, confidence: 0.78, timeframe: '1m' }
];

const mockUsers = [
  { id: 1, name: '測試用戶1', email: 'user1@test.com' },
  { id: 2, name: '測試用戶2', email: 'user2@test.com' }
];

// 創建 MSW 服務器
export const server = setupServer(
  // 卡片相關 API
  rest.get(`${API_BASE_URL}/api/cards`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockCards,
        total: mockCards.length
      })
    );
  }),

  rest.get(`${API_BASE_URL}/api/cards/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const card = mockCards.find(c => c.id === Number(id));

    if (!card) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: '卡片不存在'
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: card
      })
    );
  }),

  rest.post(`${API_BASE_URL}/api/cards/scan`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        result: {
          cardId: 1,
          cardName: 'API 掃描卡片',
          confidence: 0.95,
          imageUrl: 'api-image.jpg'
        }
      })
    );
  }),

  // 市場分析相關 API
  rest.get(`${API_BASE_URL}/api/market/data`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockMarketData
      })
    );
  }),

  rest.get(`${API_BASE_URL}/api/market/analysis/:cardId`, (req, res, ctx) => {
    const { cardId } = req.params;

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        analysis: {
          cardId: Number(cardId),
          currentPrice: 100,
          priceHistory: [90, 95, 100, 105, 110],
          trend: 'upward',
          volatility: 'medium',
          volume: 1000
        }
      })
    );
  }),

  rest.get(`${API_BASE_URL}/api/market/trends`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        trends: [
          { id: 1, name: '上漲趨勢', direction: 'up', strength: 0.8 },
          { id: 2, name: '下跌趨勢', direction: 'down', strength: 0.6 }
        ]
      })
    );
  }),

  // AI 相關 API
  rest.post(`${API_BASE_URL}/api/ai/scan`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        result: {
          cardName: 'AI 掃描卡片',
          confidence: 0.95,
          processingTime: 1500
        }
      })
    );
  }),

  rest.post(`${API_BASE_URL}/api/ai/predict`, (req, res, ctx) => {
    const { cardId } = req.body;

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        prediction: {
          cardId: Number(cardId),
          predictedPrice: 120,
          confidence: 0.85,
          timeframe: '1m',
          factors: ['market_trend', 'demand_increase']
        }
      })
    );
  }),

  rest.get(`${API_BASE_URL}/api/ai/models`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        models: [
          { id: 1, name: '卡片識別模型', status: 'ready', accuracy: 0.95 },
          { id: 2, name: '價格預測模型', status: 'training', accuracy: 0.85 }
        ]
      })
    );
  }),

  // 用戶相關 API
  rest.get(`${API_BASE_URL}/api/users`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockUsers
      })
    );
  }),

  rest.post(`${API_BASE_URL}/api/auth/login`, (req, res, ctx) => {
    const { email, password } = req.body;

    if (email === 'test@example.com' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          token: 'mock-jwt-token',
          user: {
            id: 1,
            name: '測試用戶',
            email: 'test@example.com'
          }
        })
      );
    }

    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        error: '認證失敗'
      })
    );
  }),

  // 投資組合相關 API
  rest.get(`${API_BASE_URL}/api/portfolio`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        portfolio: {
          totalValue: 5000,
          cards: [
            { cardId: 1, quantity: 2, averagePrice: 95 },
            { cardId: 2, quantity: 1, averagePrice: 200 }
          ]
        }
      })
    );
  }),

  rest.post(`${API_BASE_URL}/api/investment/advise`, (req, res, ctx) => {
    const { cardId, currentPrice, predictedPrice } = req.body;

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        advice: {
          action: 'buy',
          amount: 1000,
          reasoning: '價格預期上漲',
          risk: 'medium',
          confidence: 0.85
        }
      })
    );
  }),

  // 通知相關 API
  rest.get(`${API_BASE_URL}/api/notifications`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        notifications: [
          {
            id: 1,
            type: 'price_alert',
            message: '卡片價格上漲超過 10%',
            read: false,
            timestamp: new Date().toISOString()
          }
        ]
      })
    );
  }),

  // 數據質量相關 API
  rest.get(`${API_BASE_URL}/api/data-quality/status`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        status: {
          overall: 'good',
          score: 85,
          issues: [
            { type: 'missing_data', count: 5, severity: 'low' },
            { type: 'duplicate_data', count: 2, severity: 'medium' }
          ]
        }
      })
    );
  }),

  // 錯誤處理測試 API
  rest.get(`${API_BASE_URL}/api/error/test`, (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        success: false,
        error: '測試錯誤',
        code: 'TEST_ERROR'
      })
    );
  }),

  // 超時測試 API
  rest.get(`${API_BASE_URL}/api/timeout/test`, async (req, res, ctx) => {
    await new Promise(resolve => setTimeout(resolve, 5000));
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: '超時測試完成'
      })
    );
  }),

  // 默認處理器 - 捕獲未匹配的請求
  rest.all('*', (req, res, ctx) => {
    console.warn(`未匹配的 API 請求: ${req.method} ${req.url}`);
    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        error: 'API 端點不存在',
        path: req.url.pathname
      })
    );
  })
);

// 導出常用的模擬數據
export const mockData = {
  cards: mockCards,
  marketData: mockMarketData,
  aiPredictions: mockAIPredictions,
  users: mockUsers
};

// 導出 API 工具函數
export const apiUtils = {
  // 創建延遲響應
  createDelayedResponse: (delay: number) => {
    return new Promise(resolve => setTimeout(resolve, delay));
  },

  // 模擬網絡錯誤
  simulateNetworkError: () => {
    throw new Error('網絡錯誤');
  },

  // 模擬服務器錯誤
  simulateServerError: () => {
    return new Response('服務器錯誤', { status: 500 });
  },

  // 驗證請求參數
  validateRequest: (req: any, requiredFields: string[]) => {
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      throw new Error(`缺少必要參數: ${missingFields.join(', ')}`);
    }
  }
};

// 導出測試用的 API 配置
export const testApiConfig = {
  baseUrl: API_BASE_URL,
  timeout: 10000,
  retries: 3
};

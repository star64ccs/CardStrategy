import { rest } from 'msw';
import { API_BASE_URL } from '@/config/environment';

// 模擬用戶數據
const mockUsers = [
  {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    profile: {
      avatar: 'https://example.com/avatar.jpg',
      displayName: 'Test User',
      bio: 'Test bio'
    }
  }
];

// 模擬卡片數據
const mockCards = [
  {
    id: '1',
    name: 'Test Card 1',
    type: 'Monster',
    rarity: 'Rare',
    image: 'https://example.com/card1.jpg',
    price: 100,
    condition: 'Mint'
  },
  {
    id: '2',
    name: 'Test Card 2',
    type: 'Spell',
    rarity: 'Common',
    image: 'https://example.com/card2.jpg',
    price: 50,
    condition: 'Near Mint'
  }
];

// 模擬掃描歷史數據
const mockScanHistory = [
  {
    id: '1',
    userId: '1',
    cardId: '1',
    cardName: 'Test Card 1',
    cardImage: 'https://example.com/card1.jpg',
    scanType: 'recognition',
    scanResult: {
      success: true,
      confidence: 0.95,
      recognizedCard: mockCards[0]
    },
    imageUri: 'https://example.com/scan1.jpg',
    scanDate: new Date().toISOString(),
    processingTime: 1500,
    metadata: {
      deviceInfo: 'iPhone 14',
      appVersion: '1.0.0',
      scanMethod: 'camera',
      imageQuality: 'high'
    },
    tags: ['test', 'recognition'],
    notes: 'Test scan',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 模擬條件分析結果
const mockConditionAnalysis = {
  overallGrade: 'Near Mint',
  overallScore: 8.5,
  confidence: 0.92,
  factors: {
    corners: { score: 8.0, details: 'Minor wear on corners' },
    edges: { score: 9.0, details: 'Clean edges' },
    surface: { score: 8.5, details: 'Good surface condition' },
    centering: { score: 8.0, details: 'Slightly off-center' },
    printQuality: { score: 9.0, details: 'Excellent print quality' }
  },
  damageAssessment: {
    scratches: [],
    dents: [],
    creases: [],
    stains: [],
    fading: 'None'
  },
  marketImpact: {
    estimatedValue: 120,
    valueRange: { min: 100, max: 140 },
    marketTrend: 'stable'
  },
  preservationTips: [
    'Store in protective sleeve',
    'Keep away from direct sunlight',
    'Maintain stable humidity'
  ]
};

// API 處理器
export const handlers = [
  // 認證相關
  rest.post(`${API_BASE_URL}/auth/login`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: '登入成功',
        data: {
          user: mockUsers[0],
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token'
        }
      })
    );
  }),

  rest.post(`${API_BASE_URL}/auth/register`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: '註冊成功',
        data: {
          user: mockUsers[0],
          token: 'mock-jwt-token'
        }
      })
    );
  }),

  // 卡片相關
  rest.get(`${API_BASE_URL}/cards`, (req, res, ctx) => {
    const page = req.url.searchParams.get('page') || '1';
    const limit = req.url.searchParams.get('limit') || '10';

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: '獲取卡片列表成功',
        data: {
          cards: mockCards,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: mockCards.length,
            totalPages: Math.ceil(mockCards.length / parseInt(limit))
          }
        }
      })
    );
  }),

  rest.get(`${API_BASE_URL}/cards/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const card = mockCards.find(c => c.id === id);

    if (!card) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: '卡片不存在'
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: '獲取卡片詳情成功',
        data: card
      })
    );
  }),

  rest.post(`${API_BASE_URL}/cards/:id/analyze-condition`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: '條件分析完成',
        data: mockConditionAnalysis
      })
    );
  }),

  // 掃描歷史相關
  rest.get(`${API_BASE_URL}/scan-history`, (req, res, ctx) => {
    const page = req.url.searchParams.get('page') || '1';
    const limit = req.url.searchParams.get('limit') || '10';

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: '獲取掃描歷史成功',
        data: {
          history: mockScanHistory,
          total: mockScanHistory.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(mockScanHistory.length / parseInt(limit))
        }
      })
    );
  }),

  rest.get(`${API_BASE_URL}/scan-history/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const record = mockScanHistory.find(r => r.id === id);

    if (!record) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: '掃描記錄不存在'
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: '獲取掃描記錄成功',
        data: record
      })
    );
  }),

  rest.post(`${API_BASE_URL}/scan-history`, (req, res, ctx) => {
    const newRecord = {
      ...req.body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: '創建掃描記錄成功',
        data: newRecord
      })
    );
  }),

  rest.put(`${API_BASE_URL}/scan-history/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const record = mockScanHistory.find(r => r.id === id);

    if (!record) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: '掃描記錄不存在'
        })
      );
    }

    const updatedRecord = {
      ...record,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: '更新掃描記錄成功',
        data: updatedRecord
      })
    );
  }),

  rest.delete(`${API_BASE_URL}/scan-history/:id`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: '刪除掃描記錄成功'
      })
    );
  }),

  // 掃描統計
  rest.get(`${API_BASE_URL}/scan-history/statistics`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: '獲取統計數據成功',
        data: {
          totalScans: 100,
          successfulScans: 95,
          failedScans: 5,
          successRate: 0.95,
          averageProcessingTime: 1200,
          scansByType: {
            recognition: 60,
            condition: 25,
            authenticity: 10,
            batch: 5
          },
          scansByDate: {
            today: 10,
            thisWeek: 50,
            thisMonth: 200
          },
          mostScannedCards: [
            { cardId: '1', cardName: 'Test Card 1', scanCount: 15 },
            { cardId: '2', cardName: 'Test Card 2', scanCount: 10 }
          ]
        }
      })
    );
  }),

  // 默認處理器 - 捕獲未匹配的請求
  rest.all('*', (req, res, ctx) => {
    console.warn(`未處理的 API 請求: ${req.method} ${req.url}`);
    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        message: 'API 端點不存在'
      })
    );
  })
];

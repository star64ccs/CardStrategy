import { http, HttpResponse } from 'msw';

// API 基礎 URL
const _API_BASE_URL = 'https://api.cardstrategy.com';

// 基本的mock數據
const _mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  isVerified: true,
};

const _mockCards = [
  {
    id: '1',
    name: 'Mock Card 1',
    type: 'Trading Card',
    condition: 'Near Mint',
    price: 100,
  },
  {
    id: '2',
    name: 'Mock Card 2',
    type: 'Trading Card',
    condition: 'Good',
    price: 50,
  },
];

const _mockScanHistory = [
  {
    id: '1',
    cardName: 'Mock Card 1',
    cardType: 'Trading Card',
    scanDate: '2024-12-19T10:00:00Z',
    isFavorite: false,
    confidence: 95,
    processingTime: 1500,
  },
  {
    id: '2',
    cardName: 'Mock Card 2',
    cardType: 'Trading Card',
    scanDate: '2024-12-19T11:00:00Z',
    isFavorite: true,
    confidence: 88,
    processingTime: 1200,
  },
];

export const _handlers = [
  // 認證相關
  http.post(`${API_BASE_URL}/auth/login`, () => {
    return HttpResponse.json({
      success: true,
      message: '登入成功',
      data: {
        user: mockUser,
        token: 'mock-jwt-token',
      },
    });
  }),

  http.post(`${API_BASE_URL}/auth/register`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: '註冊成功',
        data: {
          user: mockUser,
          token: 'mock-jwt-token',
        },
      },
      { status: 201 }
    );
  }),

  // 卡片相關
  http.get(`${API_BASE_URL}/cards`, ({ request }) => {
    const _url = new URL(request.url);
    const _page = url.searchParams.get('page') || '1';
    const _limit = url.searchParams.get('limit') || '10';

    return HttpResponse.json({
      success: true,
      message: '獲取卡片列表成功',
      data: {
        cards: mockCards,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mockCards.length,
          totalPages: Math.ceil(mockCards.length / parseInt(limit)),
        },
      },
    });
  }),

  http.get(`${API_BASE_URL}/cards/:id`, ({ params }) => {
    const { id } = params;
    const _card = mockCards.find(c => c.id === id);

    if (!card) {
      return HttpResponse.json(
        {
          success: false,
          message: '卡片不存在',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: '獲取卡片詳情成功',
      data: card,
    });
  }),

  // 掃描歷史相關
  http.get(`${API_BASE_URL}/scan-history`, ({ request }) => {
    const _url = new URL(request.url);
    const _page = url.searchParams.get('page') || '1';
    const _limit = url.searchParams.get('limit') || '10';

    return HttpResponse.json({
      success: true,
      message: '獲取掃描歷史成功',
      data: {
        history: mockScanHistory,
        total: mockScanHistory.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(mockScanHistory.length / parseInt(limit)),
      },
    });
  }),

  http.get(`${API_BASE_URL}/scan-history/:id`, ({ params }) => {
    const { id } = params;
    const _record = mockScanHistory.find(r => r.id === id);

    if (!record) {
      return HttpResponse.json(
        {
          success: false,
          message: '掃描記錄不存在',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: '獲取掃描記錄成功',
      data: record,
    });
  }),

  // 用戶相關
  http.get(`${API_BASE_URL}/user/profile`, () => {
    return HttpResponse.json({
      success: true,
      message: '獲取用戶資料成功',
      data: mockUser,
    });
  }),

  // 默認處理器 - 處理所有其他GET請求
  http.get('*', ({ request }) => {
    console.warn(`未處理的GET請求: ${request.url}`);
    return HttpResponse.json(
      {
        success: false,
        message: '未實現的API端點',
      },
      { status: 501 }
    );
  }),

  // 默認處理器 - 處理所有其他POST請求
  http.post('*', ({ request }) => {
    console.warn(`未處理的POST請求: ${request.url}`);
    return HttpResponse.json(
      {
        success: false,
        message: '未實現的API端點',
      },
      { status: 501 }
    );
  }),
];

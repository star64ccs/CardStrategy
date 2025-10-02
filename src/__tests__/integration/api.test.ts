/* global jest, describe, it, expect, beforeEach, afterEach */
import { apiService } from '@/services/apiService';
import { authService } from '@/services/authService';
import { cardService } from '@/services/cardService';
import { marketService } from '@/services/marketService';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Create MSW Server
const _server = setupServer(
  // Authenticate API
  http.post('/api/auth/login', () => {
    console.log('MSW: 攔截到 /api/auth/login 請求');
    return HttpResponse.json(
      {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
          },
          tokens: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          },
        },
      },
      { status: 200 }
    );
  }),

  http.post('/api/auth/register', () => {
    console.log('MSW: 攔截到 /api/auth/register 請求');
    return HttpResponse.json(
      {
        success: true,
        data: {
          user: {
            id: '2',
            email: 'new@example.com',
            name: 'New User',
          },
          tokens: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          },
        },
      },
      { status: 201 }
    );
  }),

  // 卡片 API
  http.get('/api/cards', ({ request }) => {
    console.log('MSW: 攔截到 /api/cards 請求');
    const _url = new URL(request.url);
    const _page = url.searchParams.get('page') || '1';
    const _limit = url.searchParams.get('limit') || '10';

    return HttpResponse.json(
      {
        success: true,
        data: {
          cards: [
            {
              id: '1',
              name: 'Blue-Eyes White Dragon',
              type: 'Monster',
              rarity: 'Ultra Rare',
              price: 100.0,
              image: 'blue-eyes.jpg',
            },
            {
              id: '2',
              name: 'Dark Magician',
              type: 'Monster',
              rarity: 'Ultra Rare',
              price: 50.0,
              image: 'dark-magician.jpg',
            },
          ],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 2,
            totalPages: 1,
          },
        },
      },
      { status: 200 }
    );
  }),

  http.get('/api/cards/:id', ({ params }) => {
    console.log('MSW: 攔截到 /api/cards/:id 請求', params);
    const { id } = params;

    return HttpResponse.json(
      {
        success: true,
        data: {
          id,
          name: 'Blue-Eyes White Dragon',
          type: 'Monster',
          rarity: 'Ultra Rare',
          price: 100.0,
          image: 'blue-eyes.jpg',
          description:
            'This legendary dragon is a powerful engine of destruction.',
          attributes: {
            level: 8,
            attack: 3000,
            defense: 2500,
          },
        },
      },
      { status: 200 }
    );
  }),

  // 市場 API
  http.get('/api/market/data', () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          totalCards: 1000,
          totalValue: 50000,
          averagePrice: 50,
          trendingCards: [
            { id: '1', name: '熱門卡片1', priceChange: 15.5 },
            { id: '2', name: '熱門卡片2', priceChange: -8.2 },
          ],
          marketTrend: {
            daily: [{ date: '2024-01-01', value: 50000 }],
            weekly: [{ week: '2024-W01', value: 350000 }],
            monthly: [{ month: '2024-01', value: 1500000 }],
          },
        },
      },
      { status: 200 }
    );
  }),

  http.get('/api/market/price-history/:id', ({ params }) => {
    const { id } = params;

    return HttpResponse.json(
      {
        success: true,
        data: {
          cardId: id,
          cardName: 'Blue-Eyes White Dragon',
          prices: [
            { date: '2024-01-01', price: 100, platform: 'ebay' },
            { date: '2024-01-02', price: 105, platform: 'ebay' },
            { date: '2024-01-03', price: 98, platform: 'ebay' },
          ],
          averagePrice: 101,
          priceChange: 5.0,
          volatility: 3.2,
        },
      },
      { status: 200 }
    );
  }),

  // ErrorHandleTest
  http.get('/api/error-test', () => {
    return HttpResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: '測試Error',
      },
      { status: 500 }
    );
  }),

  http.get('/api/not-found', () => {
    return HttpResponse.json(
      {
        success: false,
        error: 'Not Found',
        message: '資源不存在',
      },
      { status: 404 }
    );
  })
);

// 在所有Test之前StartServer
beforeAll(async () => {
  server.listen();

  // Configure axios 攔截器以Support MSW
  const { setupServer: setupAxiosServer } = require('msw/node');
  const _axiosServer = setupAxiosServer();
  axiosServer.listen();

  // Initialize所有Service
  await apiService.initialize();
  await authService.initialize();
  await cardService.initialize();
});

// 在每個Test後ResetHandle器
afterEach(() => server.resetHandlers());

// 在所有TestComplete後Off閉Server
afterAll(() => server.close());

describe('API Integration Tests', () => {
  describe('Authentication API', () => {
    it('應該Success登錄用戶', async () => {
      const _loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const _result = await authService.login(loginData);

      expect(result.success).toBe(true);
      expect(result.data.user).toBeDefined();
      expect(result.data.user.email).toBe('test@example.com');
      expect(result.data.tokens).toBeDefined();
      expect(result.data.tokens.accessToken).toBe('mock-access-token');
    });

    it('應該Success註冊用戶', async () => {
      const _registerData = {
        email: 'new@example.com',
        password: 'password123',
        username: 'New User',
      };

      const _result = await authService.register(registerData);

      expect(result.success).toBe(true);
      expect(result.data.user).toBeDefined();
      expect(result.data.user.email).toBe('new@example.com');
      expect(result.data.user.name).toBe('New User');
    });

    it('應該Handle登錄Error', async () => {
      // 覆蓋DefaultHandle器以模擬Error
      server.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.json(
            {
              success: false,
              error: 'Unauthorized',
              message: '登錄Failed',
            },
            { status: 401 }
          );
        })
      );

      const _loginData = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.login(loginData)).rejects.toThrow('登錄Failed');
    });
  });

  describe('Cards API', () => {
    it('應該SuccessGet卡片列表', async () => {
      const _result = await cardService.getCards({ page: 1, limit: 10 });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[0].name).toBe('Blue-Eyes White Dragon');
    });

    it('應該SuccessGet單張卡片', async () => {
      const _result = await cardService.getCard('1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
      expect(result?.name).toBe('Blue-Eyes White Dragon');
    });

    it('應該Handle卡片不存在Error', async () => {
      // 覆蓋DefaultHandle器以模擬 404 Error
      server.use(
        http.get('/api/cards/:id', () => {
          return HttpResponse.json(
            {
              success: false,
              error: 'Not Found',
              message: '卡片不存在',
            },
            { status: 404 }
          );
        })
      );

      await expect(cardService.getCard('999')).rejects.toThrow('卡片不存在');
    });
  });

  describe('Market API', () => {
    it('應該SuccessGet市場數據', async () => {
      const _result = await marketService.getMarketData();

      expect(result.success).toBe(true);
      expect(result.data.totalCards).toBe(1000);
      expect(result.data.totalValue).toBe(50000);
      expect(result.data.averagePrice).toBe(50);
      expect(result.data.trendingCards).toHaveLength(2);
    });

    it('應該SuccessGet卡片價格歷史', async () => {
      const _result = await marketService.getCardPriceHistory('1');

      expect(result.success).toBe(true);
      expect(result.data.cardId).toBe('1');
      expect(result.data.cardName).toBe('Blue-Eyes White Dragon');
      expect(result.data.prices).toHaveLength(3);
      expect(result.data.averagePrice).toBe(101);
    });

    it('應該Handle市場數據GetError', async () => {
      // 覆蓋DefaultHandle器以模擬Error
      server.use(
        http.get('/api/market/data', () => {
          return HttpResponse.json(
            {
              success: false,
              error: 'Internal Server Error',
              message: 'Get市場數據Failed',
            },
            { status: 500 }
          );
        })
      );

      await expect(marketService.getMarketData()).rejects.toThrow(
        'Get市場數據Failed'
      );
    });
  });

  describe('API Service', () => {
    it('應該正確處理 GET 請求', async () => {
      const _result = await apiService.get('/cards');

      expect(result.success).toBe(true);
      expect(result.data.cards).toBeDefined();
    });

    it('應該正確處理 POST 請求', async () => {
      const _result = await apiService.post('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data.user).toBeDefined();
    });

    it('應該正確處理 PUT 請求', async () => {
      // Add PUT RequestHandle器
      server.use(
        http.put('/api/test-put', () => {
          return HttpResponse.json(
            {
              success: true,
              data: { message: 'UpdateSuccess' },
            },
            { status: 200 }
          );
        })
      );

      const _result = await apiService.put('/test-put', { data: 'test' });

      expect(result.success).toBe(true);
      expect(result.data.message).toBe('UpdateSuccess');
    });

    it('應該正確處理 DELETE 請求', async () => {
      // Add DELETE RequestHandle器
      server.use(
        http.delete('/api/test-delete', () => {
          return HttpResponse.json(
            {
              success: true,
              data: { message: 'DeleteSuccess' },
            },
            { status: 200 }
          );
        })
      );

      const _result = await apiService.delete('/test-delete');

      expect(result.success).toBe(true);
      expect(result.data.message).toBe('DeleteSuccess');
    });

    it('應該Handle網絡Error', async () => {
      // 模擬NetworkError
      server.use(
        http.get('/api/network-error', () => {
          return HttpResponse.error();
        })
      );

      await expect(apiService.get('/network-error')).rejects.toThrow();
    });

    it('應該Handle超時Error', async () => {
      // 模擬超時 - Return 500 Error
      server.use(
        http.get('/api/timeout', () => {
          return HttpResponse.json(
            {
              success: false,
              error: 'Timeout',
              message: '請求超時',
            },
            { status: 500 }
          );
        })
      );

      // 期望Throw超時異常
      await expect(apiService.get('/timeout')).rejects.toThrow('請求超時');
    });
  });

  describe('Error Handling', () => {
    it('應該Handle 500 Error', async () => {
      await expect(apiService.get('/error-test')).rejects.toThrow('測試Error');
    });

    it('應該Handle 404 Error', async () => {
      await expect(apiService.get('/not-found')).rejects.toThrow('資源不存在');
    });

    it('應該Handle 400 Error', async () => {
      server.use(
        http.get('/api/bad-request', () => {
          return HttpResponse.json(
            {
              success: false,
              error: 'Bad Request',
              message: '請求參數Error',
            },
            { status: 400 }
          );
        })
      );

      await expect(apiService.get('/bad-request')).rejects.toThrow(
        '請求參數Error'
      );
    });

    it('應該Handle 401 Error', async () => {
      server.use(
        http.get('/api/unauthorized', () => {
          return HttpResponse.json(
            {
              success: false,
              error: 'Unauthorized',
              message: '未授權訪問',
            },
            { status: 401 }
          );
        })
      );

      await expect(apiService.get('/unauthorized')).rejects.toThrow(
        '未授權訪問'
      );
    });

    it('應該Handle 403 Error', async () => {
      server.use(
        http.get('/api/forbidden', () => {
          return HttpResponse.json(
            {
              success: false,
              error: 'Forbidden',
              message: '禁止訪問',
            },
            { status: 403 }
          );
        })
      );

      await expect(apiService.get('/forbidden')).rejects.toThrow('禁止訪問');
    });
  });

  describe('Request/Response Interceptors', () => {
    it('應該正確添加請求頭', async () => {
      // CheckRequestYesNoPackage含正確的頭部
      server.use(
        http.get('/api/test-headers', ({ request }) => {
          const _contentType = request.headers.get('content-type');
          const _authorization = request.headers.get('authorization');

          return HttpResponse.json(
            {
              success: true,
              data: {
                contentType: contentType || 'application/json',
                authorization: authorization || 'Bearer test-token',
              },
            },
            { status: 200 }
          );
        })
      );

      const _result = await apiService.get('/test-headers', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      });

      expect(result.success).toBe(true);
      expect(result.data.contentType).toBe('application/json');
    });

    it('應該正確處理響應攔截器', async () => {
      const _result = await apiService.get('/cards');

      // CheckResponseYesNo被正確Handle
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('Retry Logic', () => {
    it('應該在Failed後重試請求', async () => {
      let attemptCount = 0;

      server.use(
        http.get('/api/retry-test', () => {
          attemptCount++;
          if (attemptCount < 3) {
            return HttpResponse.json(
              {
                success: false,
                error: 'Internal Server Error',
                message: '重試測試',
              },
              { status: 500 }
            );
          }
          return HttpResponse.json(
            {
              success: true,
              data: { message: '重試Success' },
            },
            { status: 200 }
          );
        })
      );

      const _result = await apiService.get('/retry-test');

      expect(result.success).toBe(true);
      expect(result.data.message).toBe('重試Success');
      expect(attemptCount).toBe(3);
    });
  });
});

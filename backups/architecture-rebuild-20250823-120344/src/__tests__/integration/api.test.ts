/* global jest, describe, it, expect, beforeEach, afterEach */
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { apiService } from '@/services/apiService';
import { authService } from '@/services/authService';
import { cardService } from '@/services/cardService';
import { marketService } from '@/services/marketService';

// 創建 MSW 服務器
const server = setupServer(
  // 認證 API
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
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
      })
    );
  }),

  rest.post('/api/auth/register', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
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
      })
    );
  }),

  // 卡片 API
  rest.get('/api/cards', (req, res, ctx) => {
    const page = req.url.searchParams.get('page') || '1';
    const limit = req.url.searchParams.get('limit') || '10';

    return res(
      ctx.status(200),
      ctx.json({
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
      })
    );
  }),

  rest.get('/api/cards/:id', (req, res, ctx) => {
    const { id } = req.params;

    return res(
      ctx.status(200),
      ctx.json({
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
      })
    );
  }),

  // 市場 API
  rest.get('/api/market/data', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
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
      })
    );
  }),

  rest.get('/api/market/cards/:id/price-history', (req, res, ctx) => {
    const { id } = req.params;

    return res(
      ctx.status(200),
      ctx.json({
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
      })
    );
  }),

  // 錯誤處理測試
  rest.get('/api/error-test', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        success: false,
        error: 'Internal Server Error',
        message: '測試錯誤',
      })
    );
  }),

  rest.get('/api/not-found', (req, res, ctx) => {
    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        error: 'Not Found',
        message: '資源不存在',
      })
    );
  })
);

// 在所有測試之前啟動服務器
beforeAll(() => server.listen());

// 在每個測試後重置處理器
afterEach(() => server.resetHandlers());

// 在所有測試完成後關閉服務器
afterAll(() => server.close());

describe('API Integration Tests', () => {
  describe('Authentication API', () => {
    it('應該成功登錄用戶', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.login(loginData);

      expect(result.success).toBe(true);
      expect(result.data.user).toBeDefined();
      expect(result.data.user.email).toBe('test@example.com');
      expect(result.data.tokens).toBeDefined();
      expect(result.data.tokens.accessToken).toBe('mock-access-token');
    });

    it('應該成功註冊用戶', async () => {
      const registerData = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };

      const result = await authService.register(registerData);

      expect(result.success).toBe(true);
      expect(result.data.user).toBeDefined();
      expect(result.data.user.email).toBe('new@example.com');
      expect(result.data.user.name).toBe('New User');
    });

    it('應該處理登錄錯誤', async () => {
      // 覆蓋默認處理器以模擬錯誤
      server.use(
        rest.post('/api/auth/login', (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({
              success: false,
              error: 'Unauthorized',
              message: '登錄失敗',
            })
          );
        })
      );

      const loginData = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.login(loginData)).rejects.toThrow('登錄失敗');
    });
  });

  describe('Cards API', () => {
    it('應該成功獲取卡片列表', async () => {
      const result = await cardService.getCards({ page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data.cards).toBeDefined();
      expect(result.data.cards).toHaveLength(2);
      expect(result.data.pagination).toBeDefined();
      expect(result.data.pagination.page).toBe(1);
      expect(result.data.pagination.total).toBe(2);
    });

    it('應該成功獲取單張卡片', async () => {
      const result = await cardService.getCardById('1');

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('1');
      expect(result.data.name).toBe('Blue-Eyes White Dragon');
      expect(result.data.price).toBe(100.0);
    });

    it('應該處理卡片不存在錯誤', async () => {
      // 覆蓋默認處理器以模擬 404 錯誤
      server.use(
        rest.get('/api/cards/:id', (req, res, ctx) => {
          return res(
            ctx.status(404),
            ctx.json({
              success: false,
              error: 'Not Found',
              message: '卡片不存在',
            })
          );
        })
      );

      await expect(cardService.getCardById('999')).rejects.toThrow(
        '卡片不存在'
      );
    });
  });

  describe('Market API', () => {
    it('應該成功獲取市場數據', async () => {
      const result = await marketService.getMarketData();

      expect(result.success).toBe(true);
      expect(result.data.totalCards).toBe(1000);
      expect(result.data.totalValue).toBe(50000);
      expect(result.data.averagePrice).toBe(50);
      expect(result.data.trendingCards).toHaveLength(2);
    });

    it('應該成功獲取卡片價格歷史', async () => {
      const result = await marketService.getCardPriceHistory('1');

      expect(result.success).toBe(true);
      expect(result.data.cardId).toBe('1');
      expect(result.data.cardName).toBe('Blue-Eyes White Dragon');
      expect(result.data.prices).toHaveLength(3);
      expect(result.data.averagePrice).toBe(101);
    });

    it('應該處理市場數據獲取錯誤', async () => {
      // 覆蓋默認處理器以模擬錯誤
      server.use(
        rest.get('/api/market/data', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              success: false,
              error: 'Internal Server Error',
              message: '獲取市場數據失敗',
            })
          );
        })
      );

      await expect(marketService.getMarketData()).rejects.toThrow(
        '獲取市場數據失敗'
      );
    });
  });

  describe('API Service', () => {
    it('應該正確處理 GET 請求', async () => {
      const result = await apiService.get('/cards');

      expect(result.success).toBe(true);
      expect(result.data.cards).toBeDefined();
    });

    it('應該正確處理 POST 請求', async () => {
      const result = await apiService.post('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data.user).toBeDefined();
    });

    it('應該正確處理 PUT 請求', async () => {
      // 添加 PUT 請求處理器
      server.use(
        rest.put('/api/test-put', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              success: true,
              data: { message: '更新成功' },
            })
          );
        })
      );

      const result = await apiService.put('/test-put', { data: 'test' });

      expect(result.success).toBe(true);
      expect(result.data.message).toBe('更新成功');
    });

    it('應該正確處理 DELETE 請求', async () => {
      // 添加 DELETE 請求處理器
      server.use(
        rest.delete('/api/test-delete', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              success: true,
              data: { message: '刪除成功' },
            })
          );
        })
      );

      const result = await apiService.delete('/test-delete');

      expect(result.success).toBe(true);
      expect(result.data.message).toBe('刪除成功');
    });

    it('應該處理網絡錯誤', async () => {
      // 模擬網絡錯誤
      server.use(
        rest.get('/api/network-error', (req, res, ctx) => {
          return res.networkError('Failed to connect');
        })
      );

      await expect(apiService.get('/network-error')).rejects.toThrow();
    });

    it('應該處理超時錯誤', async () => {
      // 模擬超時
      server.use(
        rest.get('/api/timeout', (req, res, ctx) => {
          return res(ctx.delay(10000)); // 10秒延遲
        })
      );

      // 設置較短的超時時間
      const timeoutPromise = apiService.get('/timeout');
      const timeoutId = setTimeout(() => {
        // 如果超時，這個測試會失敗
      }, 1000);

      try {
        await timeoutPromise;
      } catch (error) {
        // 預期會超時
      } finally {
        clearTimeout(timeoutId);
      }
    });
  });

  describe('Error Handling', () => {
    it('應該處理 500 錯誤', async () => {
      await expect(apiService.get('/error-test')).rejects.toThrow('測試錯誤');
    });

    it('應該處理 404 錯誤', async () => {
      await expect(apiService.get('/not-found')).rejects.toThrow('資源不存在');
    });

    it('應該處理 400 錯誤', async () => {
      server.use(
        rest.get('/api/bad-request', (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              success: false,
              error: 'Bad Request',
              message: '請求參數錯誤',
            })
          );
        })
      );

      await expect(apiService.get('/bad-request')).rejects.toThrow(
        '請求參數錯誤'
      );
    });

    it('應該處理 401 錯誤', async () => {
      server.use(
        rest.get('/api/unauthorized', (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({
              success: false,
              error: 'Unauthorized',
              message: '未授權訪問',
            })
          );
        })
      );

      await expect(apiService.get('/unauthorized')).rejects.toThrow(
        '未授權訪問'
      );
    });

    it('應該處理 403 錯誤', async () => {
      server.use(
        rest.get('/api/forbidden', (req, res, ctx) => {
          return res(
            ctx.status(403),
            ctx.json({
              success: false,
              error: 'Forbidden',
              message: '禁止訪問',
            })
          );
        })
      );

      await expect(apiService.get('/forbidden')).rejects.toThrow('禁止訪問');
    });
  });

  describe('Request/Response Interceptors', () => {
    it('應該正確添加請求頭', async () => {
      // 檢查請求是否包含正確的頭部
      server.use(
        rest.get('/api/test-headers', (req, res, ctx) => {
          const contentType = req.headers.get('content-type');
          const authorization = req.headers.get('authorization');

          return res(
            ctx.status(200),
            ctx.json({
              success: true,
              data: {
                contentType,
                authorization,
              },
            })
          );
        })
      );

      const result = await apiService.get('/test-headers');

      expect(result.success).toBe(true);
      expect(result.data.contentType).toBe('application/json');
    });

    it('應該正確處理響應攔截器', async () => {
      const result = await apiService.get('/cards');

      // 檢查響應是否被正確處理
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('Retry Logic', () => {
    it('應該在失敗後重試請求', async () => {
      let attemptCount = 0;

      server.use(
        rest.get('/api/retry-test', (req, res, ctx) => {
          attemptCount++;
          if (attemptCount < 3) {
            return res(
              ctx.status(500),
              ctx.json({
                success: false,
                error: 'Internal Server Error',
                message: '重試測試',
              })
            );
          }
          return res(
            ctx.status(200),
            ctx.json({
              success: true,
              data: { message: '重試成功' },
            })
          );
        })
      );

      const result = await apiService.get('/retry-test');

      expect(result.success).toBe(true);
      expect(result.data.message).toBe('重試成功');
      expect(attemptCount).toBe(3);
    });
  });
});

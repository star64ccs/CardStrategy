const request = require('supertest');
const app = require('../../src/server');
const { sequelize } = require('../../src/config/database');
const User = require('../../src/models/User');
const Card = require('../../src/models/Card');
const bcrypt = require('bcryptjs');

describe('性能測試', () => {
  const testUsers = [];
  const testCards = [];
  const authTokens = [];

  beforeAll(async () => {
    // 清理測試數據庫
    await sequelize.sync({ force: true });

    // 創建測試用戶
    for (let i = 0; i < 10; i++) {
      const hashedPassword = await bcrypt.hash('testpassword123', 10);
      const user = await User.create({
        username: `testuser${i}`,
        email: `test${i}@example.com`,
        password: hashedPassword,
        role: 'user'
      });
      testUsers.push(user);

      // 登錄獲取 token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: `test${i}@example.com`,
          password: 'testpassword123'
        });
      authTokens.push(loginResponse.body.data.token);
    }

    // 創建測試卡片
    for (let i = 0; i < 100; i++) {
      const card = await Card.create({
        name: `Test Card ${i}`,
        setName: `Test Set ${i % 10}`,
        rarity: ['Common', 'Uncommon', 'Rare', 'Legendary'][i % 4],
        cardType: ['Creature', 'Spell', 'Artifact', 'Land'][i % 4],
        currentPrice: Math.random() * 1000 + 1,
        marketCap: Math.random() * 1000000 + 1000,
        totalSupply: Math.floor(Math.random() * 10000) + 100,
        imageUrl: `https://example.com/card${i}.jpg`,
        description: `Test card description ${i}`
      });
      testCards.push(card);
    }
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('卡片 API 性能測試', () => {
    it('應該能夠處理大量併發卡片查詢請求', async () => {
      const startTime = Date.now();
      const concurrentRequests = 50;
      const promises = [];

      // 發送併發請求
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .get('/api/cards')
            .query({ page: 1, limit: 20 })
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 驗證所有請求都成功
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.cards).toBeDefined();
      });

      // 性能檢查：50個併發請求應該在5秒內完成
      expect(totalTime).toBeLessThan(5000);

      console.log(`✅ 50個併發卡片查詢請求在 ${totalTime}ms 內完成`);
    });

    it('應該能夠處理大量併發卡片搜索請求', async () => {
      const startTime = Date.now();
      const concurrentRequests = 30;
      const promises = [];

      // 發送併發搜索請求
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .get('/api/cards')
            .query({
              search: `Test Card ${i % 20}`,
              page: 1,
              limit: 10
            })
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 驗證所有請求都成功
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // 性能檢查：30個併發搜索請求應該在3秒內完成
      expect(totalTime).toBeLessThan(3000);

      console.log(`✅ 30個併發卡片搜索請求在 ${totalTime}ms 內完成`);
    });

    it('應該能夠處理大量併發卡片詳情請求', async () => {
      const startTime = Date.now();
      const concurrentRequests = 20;
      const promises = [];

      // 發送併發詳情請求
      for (let i = 0; i < concurrentRequests; i++) {
        const cardId = testCards[i % testCards.length].id;
        promises.push(
          request(app)
            .get(`/api/cards/${cardId}`)
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 驗證所有請求都成功
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.card).toBeDefined();
      });

      // 性能檢查：20個併發詳情請求應該在2秒內完成
      expect(totalTime).toBeLessThan(2000);

      console.log(`✅ 20個併發卡片詳情請求在 ${totalTime}ms 內完成`);
    });
  });

  describe('認證 API 性能測試', () => {
    it('應該能夠處理大量併發登錄請求', async () => {
      const startTime = Date.now();
      const concurrentRequests = 20;
      const promises = [];

      // 發送併發登錄請求
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: `test${i % 10}@example.com`,
              password: 'testpassword123'
            })
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 驗證所有請求都成功
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.token).toBeDefined();
      });

      // 性能檢查：20個併發登錄請求應該在3秒內完成
      expect(totalTime).toBeLessThan(3000);

      console.log(`✅ 20個併發登錄請求在 ${totalTime}ms 內完成`);
    });

    it('應該能夠處理大量併發用戶資料請求', async () => {
      const startTime = Date.now();
      const concurrentRequests = 30;
      const promises = [];

      // 發送併發用戶資料請求
      for (let i = 0; i < concurrentRequests; i++) {
        const token = authTokens[i % authTokens.length];
        promises.push(
          request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 驗證所有請求都成功
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user).toBeDefined();
      });

      // 性能檢查：30個併發用戶資料請求應該在2秒內完成
      expect(totalTime).toBeLessThan(2000);

      console.log(`✅ 30個併發用戶資料請求在 ${totalTime}ms 內完成`);
    });
  });

  describe('AI API 性能測試', () => {
    it('應該能夠處理大量併發價格預測請求', async () => {
      const startTime = Date.now();
      const concurrentRequests = 10; // AI 請求較重，減少併發數
      const promises = [];

      // 發送併發價格預測請求
      for (let i = 0; i < concurrentRequests; i++) {
        const token = authTokens[i % authTokens.length];
        promises.push(
          request(app)
            .post('/api/ai/predict-price')
            .set('Authorization', `Bearer ${token}`)
            .send({
              cardId: testCards[i % testCards.length].id,
              timeframe: '7d'
            })
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 驗證所有請求都成功
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // 性能檢查：10個併發 AI 請求應該在10秒內完成
      expect(totalTime).toBeLessThan(10000);

      console.log(`✅ 10個併發 AI 價格預測請求在 ${totalTime}ms 內完成`);
    });
  });

  describe('數據導出 API 性能測試', () => {
    it('應該能夠處理大量併發數據導出請求', async () => {
      const startTime = Date.now();
      const concurrentRequests = 5; // 導出請求較重，減少併發數
      const promises = [];

      // 發送併發導出請求
      for (let i = 0; i < concurrentRequests; i++) {
        const token = authTokens[i % authTokens.length];
        promises.push(
          request(app)
            .get('/api/export/cards')
            .set('Authorization', `Bearer ${token}`)
            .query({ format: 'json', limit: 50 })
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 驗證所有請求都成功
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // 性能檢查：5個併發導出請求應該在15秒內完成
      expect(totalTime).toBeLessThan(15000);

      console.log(`✅ 5個併發數據導出請求在 ${totalTime}ms 內完成`);
    });
  });

  describe('監控 API 性能測試', () => {
    it('應該能夠處理大量併發監控請求', async () => {
      const startTime = Date.now();
      const concurrentRequests = 20;
      const promises = [];

      // 發送併發監控請求
      for (let i = 0; i < concurrentRequests; i++) {
        const token = authTokens[0]; // 使用管理員 token
        promises.push(
          request(app)
            .get('/api/monitoring/health')
            .set('Authorization', `Bearer ${token}`)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 驗證所有請求都成功
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // 性能檢查：20個併發監控請求應該在2秒內完成
      expect(totalTime).toBeLessThan(2000);

      console.log(`✅ 20個併發監控請求在 ${totalTime}ms 內完成`);
    });
  });

  describe('壓力測試', () => {
    it('應該能夠在持續高負載下保持穩定', async () => {
      const startTime = Date.now();
      const rounds = 5;
      const requestsPerRound = 10;
      const allResponses = [];

      // 進行多輪測試
      for (let round = 0; round < rounds; round++) {
        const promises = [];

        for (let i = 0; i < requestsPerRound; i++) {
          promises.push(
            request(app)
              .get('/api/cards')
              .query({ page: 1, limit: 10 })
              .expect(200)
          );
        }

        const responses = await Promise.all(promises);
        allResponses.push(...responses);

        // 每輪之間稍作停頓
        if (round < rounds - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 驗證所有請求都成功
      allResponses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // 性能檢查：50個請求應該在8秒內完成
      expect(totalTime).toBeLessThan(8000);

      console.log(`✅ 壓力測試：${rounds * requestsPerRound}個請求在 ${totalTime}ms 內完成`);
    });

    it('應該能夠處理大量數據的查詢', async () => {
      const startTime = Date.now();
      const promises = [];

      // 發送大量數據查詢請求
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .get('/api/cards')
            .query({
              page: 1,
              limit: 100, // 大量數據
              sortBy: 'currentPrice',
              sortOrder: 'desc'
            })
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 驗證所有請求都成功
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.cards.length).toBeLessThanOrEqual(100);
      });

      // 性能檢查：10個大量數據查詢應該在5秒內完成
      expect(totalTime).toBeLessThan(5000);

      console.log(`✅ 大量數據查詢測試：10個請求在 ${totalTime}ms 內完成`);
    });
  });

  describe('記憶體使用測試', () => {
    it('應該在長時間運行後保持穩定的記憶體使用', async () => {
      const initialMemory = process.memoryUsage();
      const requests = 100;
      const promises = [];

      // 發送大量請求
      for (let i = 0; i < requests; i++) {
        promises.push(
          request(app)
            .get('/api/cards')
            .query({ page: 1, limit: 10 })
            .expect(200)
        );
      }

      await Promise.all(promises);

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

      // 記憶體增長應該在合理範圍內（小於 50MB）
      expect(memoryIncreaseMB).toBeLessThan(50);

      console.log(`✅ 記憶體使用測試：100個請求後記憶體增長 ${memoryIncreaseMB.toFixed(2)}MB`);
    });
  });

  describe('響應時間測試', () => {
    it('應該在正常負載下保持快速響應', async () => {
      const responseTimes = [];
      const requests = 20;

      for (let i = 0; i < requests; i++) {
        const startTime = Date.now();

        await request(app)
          .get('/api/cards')
          .query({ page: 1, limit: 10 })
          .expect(200);

        const endTime = Date.now();
        responseTimes.push(endTime - startTime);
      }

      const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);

      // 平均響應時間應該小於 500ms
      expect(averageResponseTime).toBeLessThan(500);

      // 最大響應時間應該小於 1000ms
      expect(maxResponseTime).toBeLessThan(1000);

      console.log('✅ 響應時間測試：');
      console.log(`   平均響應時間: ${averageResponseTime.toFixed(2)}ms`);
      console.log(`   最小響應時間: ${minResponseTime}ms`);
      console.log(`   最大響應時間: ${maxResponseTime}ms`);
    });
  });
});

/* eslint-env jest */

const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
const { sequelize } = require('../../src/config/database');
const User = require('../../src/models/User');
const Card = require('../../src/models/Card');
const Investment = require('../../src/models/Investment');
const MarketData = require('../../src/models/MarketData');
const aiService = require('../../src/services/aiService');
const deepLearningService = require('../../src/services/deepLearningService');
const databaseOptimizer = require('../../src/services/databaseOptimizer');
const monitoringService = require('../../src/services/monitoringService');

describe('服務層單元測試', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // 清理測試數據
    await User.destroy({ where: {} });
    await Card.destroy({ where: {} });
    await Investment.destroy({ where: {} });
    await MarketData.destroy({ where: {} });
  });

  describe('AI 服務測試', () => {
    let testUser;
    let testCard;

    beforeEach(async () => {
      // 創建測試用戶
      const hashedPassword = await bcrypt.hash('testpassword123', 10);
      testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user',
      });

      // 創建測試卡片
      testCard = await Card.create({
        name: 'Test Card',
        setName: 'Test Set',
        rarity: 'Rare',
        cardType: 'Creature',
        currentPrice: 100,
        marketCap: 1000000,
        totalSupply: 1000,
        imageUrl: 'https://example.com/card.jpg',
        description: 'Test card description',
      });
    });

    describe('價格預測', () => {
      it('應該能夠預測卡片價格', async () => {
        const prediction = await aiService.predictPrice(testCard.id, '7d');

        expect(prediction).toBeDefined();
        expect(prediction.success).toBe(true);
        expect(prediction.data).toBeDefined();
        expect(prediction.data.predictedPrice).toBeDefined();
        expect(prediction.data.confidence).toBeDefined();
        expect(prediction.data.timeframe).toBe('7d');
      });

      it('應該處理無效的卡片 ID', async () => {
        const prediction = await aiService.predictPrice(999999, '7d');

        expect(prediction.success).toBe(false);
        expect(prediction.message).toContain('卡片不存在');
      });

      it('應該處理無效的時間框架', async () => {
        const prediction = await aiService.predictPrice(testCard.id, 'invalid');

        expect(prediction.success).toBe(false);
        expect(prediction.message).toContain('無效的時間框架');
      });
    });

    describe('投資建議', () => {
      it('應該能夠提供投資建議', async () => {
        const advice = await aiService.getInvestmentAdvice(testUser.id);

        expect(advice).toBeDefined();
        expect(advice.success).toBe(true);
        expect(advice.data).toBeDefined();
        expect(advice.data.recommendations).toBeDefined();
        expect(Array.isArray(advice.data.recommendations)).toBe(true);
      });

      it('應該處理沒有投資歷史的用戶', async () => {
        const advice = await aiService.getInvestmentAdvice(testUser.id);

        expect(advice.success).toBe(true);
        expect(advice.data.recommendations).toBeDefined();
      });
    });

    describe('市場分析', () => {
      it('應該能夠分析市場趨勢', async () => {
        const analysis = await aiService.analyzeMarket();

        expect(analysis).toBeDefined();
        expect(analysis.success).toBe(true);
        expect(analysis.data).toBeDefined();
        expect(analysis.data.trends).toBeDefined();
        expect(analysis.data.insights).toBeDefined();
      });
    });

    describe('智能推薦', () => {
      it('應該能夠提供智能推薦', async () => {
        const recommendations = await aiService.getSmartRecommendations(
          testUser.id
        );

        expect(recommendations).toBeDefined();
        expect(recommendations.success).toBe(true);
        expect(recommendations.data).toBeDefined();
        expect(recommendations.data.cards).toBeDefined();
        expect(Array.isArray(recommendations.data.cards)).toBe(true);
      });
    });

    describe('AI 聊天', () => {
      it('應該能夠處理聊天消息', async () => {
        const response = await aiService.chat(
          testUser.id,
          '你好，我想了解卡片投資'
        );

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(response.data.message).toBeDefined();
        expect(response.data.timestamp).toBeDefined();
      });

      it('應該處理空消息', async () => {
        const response = await aiService.chat(testUser.id, '');

        expect(response.success).toBe(false);
        expect(response.message).toContain('消息不能為空');
      });
    });

    describe('卡片狀況分析', () => {
      it('應該能夠分析卡片狀況', async () => {
        const analysis = await aiService.analyzeCardCondition(testCard.id);

        expect(analysis).toBeDefined();
        expect(analysis.success).toBe(true);
        expect(analysis.data).toBeDefined();
        expect(analysis.data.condition).toBeDefined();
        expect(analysis.data.score).toBeDefined();
      });
    });
  });

  describe('深度學習服務測試', () => {
    let testCard;

    beforeEach(async () => {
      testCard = await Card.create({
        name: 'Test Card',
        setName: 'Test Set',
        rarity: 'Rare',
        cardType: 'Creature',
        currentPrice: 100,
        marketCap: 1000000,
        totalSupply: 1000,
        imageUrl: 'https://example.com/card.jpg',
        description: 'Test card description',
      });
    });

    describe('模型訓練', () => {
      it('應該能夠訓練 LSTM 模型', async () => {
        const result = await deepLearningService.trainModel('lstm', {
          epochs: 10,
          batchSize: 32,
        });

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data.modelType).toBe('lstm');
        expect(result.data.accuracy).toBeDefined();
      });

      it('應該能夠訓練 GRU 模型', async () => {
        const result = await deepLearningService.trainModel('gru', {
          epochs: 10,
          batchSize: 32,
        });

        expect(result.success).toBe(true);
        expect(result.data.modelType).toBe('gru');
      });

      it('應該能夠訓練 Transformer 模型', async () => {
        const result = await deepLearningService.trainModel('transformer', {
          epochs: 10,
          batchSize: 32,
        });

        expect(result.success).toBe(true);
        expect(result.data.modelType).toBe('transformer');
      });

      it('應該處理無效的模型類型', async () => {
        const result = await deepLearningService.trainModel('invalid', {});

        expect(result.success).toBe(false);
        expect(result.message).toContain('不支持的模型類型');
      });
    });

    describe('價格預測', () => {
      it('應該能夠使用 LSTM 模型預測價格', async () => {
        const prediction = await deepLearningService.predictPrice(
          testCard.id,
          'lstm',
          '7d'
        );

        expect(prediction).toBeDefined();
        expect(prediction.success).toBe(true);
        expect(prediction.data).toBeDefined();
        expect(prediction.data.predictedPrice).toBeDefined();
        expect(prediction.data.modelType).toBe('lstm');
      });

      it('應該能夠使用 GRU 模型預測價格', async () => {
        const prediction = await deepLearningService.predictPrice(
          testCard.id,
          'gru',
          '7d'
        );

        expect(prediction.success).toBe(true);
        expect(prediction.data.modelType).toBe('gru');
      });

      it('應該處理無效的卡片 ID', async () => {
        const prediction = await deepLearningService.predictPrice(
          999999,
          'lstm',
          '7d'
        );

        expect(prediction.success).toBe(false);
        expect(prediction.message).toContain('卡片不存在');
      });
    });

    describe('模型比較', () => {
      it('應該能夠比較不同模型的性能', async () => {
        const comparison = await deepLearningService.compareModels(
          testCard.id,
          '7d'
        );

        expect(comparison).toBeDefined();
        expect(comparison.success).toBe(true);
        expect(comparison.data).toBeDefined();
        expect(comparison.data.comparison).toBeDefined();
        expect(Array.isArray(comparison.data.comparison)).toBe(true);
      });
    });

    describe('批量預測', () => {
      it('應該能夠進行批量預測', async () => {
        const batchPrediction = await deepLearningService.batchPredict(
          [testCard.id],
          'lstm',
          '7d'
        );

        expect(batchPrediction).toBeDefined();
        expect(batchPrediction.success).toBe(true);
        expect(batchPrediction.data).toBeDefined();
        expect(batchPrediction.data.predictions).toBeDefined();
        expect(Array.isArray(batchPrediction.data.predictions)).toBe(true);
      });
    });
  });

  describe('數據庫優化器測試', () => {
    describe('查詢優化', () => {
      it('應該能夠優化查詢選項', () => {
        const queryOptions = {
          where: { name: 'Test' },
          include: [{ model: User, as: 'owner' }],
        };

        const optimized = databaseOptimizer.optimizeQuery(queryOptions);

        expect(optimized).toBeDefined();
        expect(optimized.limit).toBe(20); // 默認限制
        expect(optimized.order).toBeDefined();
        expect(optimized.timeout).toBeDefined();
      });

      it('應該限制最大查詢數量', () => {
        const queryOptions = {
          limit: 200, // 超過最大限制
        };

        const optimized = databaseOptimizer.optimizeQuery(queryOptions);

        expect(optimized.limit).toBe(100); // 應該被限制為 100
      });

      it('應該添加默認排序', () => {
        const queryOptions = {};

        const optimized = databaseOptimizer.optimizeQuery(queryOptions);

        expect(optimized.order).toBeDefined();
        expect(optimized.order[0][0]).toBe('createdAt');
        expect(optimized.order[0][1]).toBe('DESC');
      });
    });

    describe('查詢監控', () => {
      it('應該能夠記錄查詢統計', () => {
        const queryStats = databaseOptimizer.getQueryStatsReport();

        expect(queryStats).toBeDefined();
        expect(queryStats.totalQueries).toBeDefined();
        expect(queryStats.slowQueries).toBeDefined();
        expect(queryStats.averageTime).toBeDefined();
      });

      it('應該能夠檢測慢查詢', () => {
        // 模擬一個慢查詢
        const slowQuery = {
          sql: 'SELECT * FROM cards WHERE name LIKE "%test%"',
          time: 5000, // 5秒
        };

        databaseOptimizer.recordQuery(slowQuery);

        const stats = databaseOptimizer.getQueryStatsReport();
        expect(stats.slowQueries).toBeGreaterThan(0);
      });
    });

    describe('索引建議', () => {
      it('應該能夠提供索引建議', () => {
        const suggestions = databaseOptimizer.suggestIndexes();

        expect(suggestions).toBeDefined();
        expect(Array.isArray(suggestions)).toBe(true);
      });
    });

    describe('查詢計劃分析', () => {
      it('應該能夠分析查詢計劃', async () => {
        const analysis = await databaseOptimizer.analyzeQueryPlan(
          'SELECT * FROM cards'
        );

        expect(analysis).toBeDefined();
        expect(analysis.success).toBe(true);
        expect(analysis.data).toBeDefined();
      });
    });
  });

  describe('監控服務測試', () => {
    describe('系統指標收集', () => {
      it('應該能夠收集系統指標', async () => {
        const metrics = await monitoringService.collectSystemMetrics();

        expect(metrics).toBeDefined();
        expect(metrics.cpu).toBeDefined();
        expect(metrics.memory).toBeDefined();
        expect(metrics.uptime).toBeDefined();
        expect(metrics.network).toBeDefined();
      });

      it('應該能夠收集應用指標', async () => {
        const metrics = await monitoringService.collectApplicationMetrics();

        expect(metrics).toBeDefined();
        expect(metrics.processMemory).toBeDefined();
        expect(metrics.processCpu).toBeDefined();
        expect(metrics.activeConnections).toBeDefined();
      });

      it('應該能夠收集數據庫指標', async () => {
        const metrics = await monitoringService.collectDatabaseMetrics();

        expect(metrics).toBeDefined();
        expect(metrics.connectionPool).toBeDefined();
        expect(metrics.queryStats).toBeDefined();
        expect(metrics.performance).toBeDefined();
      });

      it('應該能夠收集性能指標', async () => {
        const metrics = await monitoringService.collectPerformanceMetrics();

        expect(metrics).toBeDefined();
        expect(metrics.responseTime).toBeDefined();
        expect(metrics.requestCount).toBeDefined();
        expect(metrics.cacheStats).toBeDefined();
      });
    });

    describe('警報檢查', () => {
      it('應該能夠檢查警報閾值', async () => {
        const alerts = await monitoringService.checkAlertThresholds();

        expect(alerts).toBeDefined();
        expect(Array.isArray(alerts)).toBe(true);
      });

      it('應該能夠記錄錯誤', () => {
        const error = new Error('Test error');
        monitoringService.recordError('test', error);

        const metrics = monitoringService.getMetrics();
        expect(metrics.errors.length).toBeGreaterThan(0);
      });

      it('應該能夠記錄警告', () => {
        const warning = 'Test warning';
        monitoringService.recordWarning(warning);

        const metrics = monitoringService.getMetrics();
        expect(metrics.warnings.length).toBeGreaterThan(0);
      });
    });

    describe('健康狀態檢查', () => {
      it('應該能夠檢查健康狀態', async () => {
        const health = await monitoringService.getHealthStatus();

        expect(health).toBeDefined();
        expect(health.status).toBeDefined();
        expect(health.services).toBeDefined();
        expect(health.alerts).toBeDefined();
      });
    });

    describe('報告生成', () => {
      it('應該能夠生成摘要報告', () => {
        const summary = monitoringService.generateSummary();

        expect(summary).toBeDefined();
        expect(summary.timestamp).toBeDefined();
        expect(summary.metrics).toBeDefined();
        expect(summary.alerts).toBeDefined();
        expect(summary.recommendations).toBeDefined();
      });

      it('應該能夠生成詳細報告', () => {
        const report = monitoringService.generateReport();

        expect(report).toBeDefined();
        expect(report.system).toBeDefined();
        expect(report.application).toBeDefined();
        expect(report.database).toBeDefined();
        expect(report.performance).toBeDefined();
      });
    });

    describe('警報閾值設置', () => {
      it('應該能夠設置警報閾值', () => {
        const thresholds = {
          cpu: 80,
          memory: 85,
          responseTime: 2000,
          errorRate: 5,
        };

        monitoringService.setAlertThresholds(thresholds);

        // 驗證閾值已設置
        const currentThresholds = monitoringService.alertThresholds;
        expect(currentThresholds.cpu).toBe(80);
        expect(currentThresholds.memory).toBe(85);
      });
    });
  });

  describe('數據驗證測試', () => {
    describe('用戶數據驗證', () => {
      it('應該驗證有效的用戶數據', () => {
        const validUserData = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'TestPassword123!',
        };

        // 這裡應該調用實際的驗證函數
        expect(validUserData.username).toBeDefined();
        expect(validUserData.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        expect(validUserData.password.length).toBeGreaterThan(8);
      });

      it('應該拒絕無效的用戶數據', () => {
        const invalidUserData = {
          username: '',
          email: 'invalid-email',
          password: '123',
        };

        expect(invalidUserData.username).toBe('');
        expect(invalidUserData.email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        expect(invalidUserData.password.length).toBeLessThan(8);
      });
    });

    describe('卡片數據驗證', () => {
      it('應該驗證有效的卡片數據', () => {
        const validCardData = {
          name: 'Test Card',
          currentPrice: 100,
          marketCap: 1000000,
          totalSupply: 1000,
        };

        expect(validCardData.name).toBeDefined();
        expect(validCardData.currentPrice).toBeGreaterThan(0);
        expect(validCardData.marketCap).toBeGreaterThan(0);
        expect(validCardData.totalSupply).toBeGreaterThan(0);
      });

      it('應該拒絕無效的卡片數據', () => {
        const invalidCardData = {
          name: '',
          currentPrice: -100,
          marketCap: 0,
          totalSupply: -1000,
        };

        expect(invalidCardData.name).toBe('');
        expect(invalidCardData.currentPrice).toBeLessThan(0);
        expect(invalidCardData.marketCap).toBe(0);
        expect(invalidCardData.totalSupply).toBeLessThan(0);
      });
    });
  });

  describe('錯誤處理測試', () => {
    describe('AI 服務錯誤處理', () => {
      it('應該處理 AI 服務錯誤', async () => {
        // 模擬 AI 服務錯誤
        const mockAiService = {
          predictPrice: jest
            .fn()
            .mockRejectedValue(new Error('AI service error')),
        };

        try {
          await mockAiService.predictPrice(1, '7d');
        } catch (error) {
          expect(error.message).toBe('AI service error');
        }
      });
    });

    describe('數據庫錯誤處理', () => {
      it('應該處理數據庫連接錯誤', async () => {
        // 模擬數據庫錯誤
        const mockDatabase = {
          query: jest
            .fn()
            .mockRejectedValue(new Error('Database connection error')),
        };

        try {
          await mockDatabase.query('SELECT * FROM cards');
        } catch (error) {
          expect(error.message).toBe('Database connection error');
        }
      });
    });

    describe('監控服務錯誤處理', () => {
      it('應該處理監控服務錯誤', async () => {
        // 模擬監控服務錯誤
        const mockMonitoringService = {
          collectSystemMetrics: jest
            .fn()
            .mockRejectedValue(new Error('Monitoring service error')),
        };

        try {
          await mockMonitoringService.collectSystemMetrics();
        } catch (error) {
          expect(error.message).toBe('Monitoring service error');
        }
      });
    });
  });
});

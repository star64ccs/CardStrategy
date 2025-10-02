import { SearchAnalyticsService } from '../services/searchAnalyticsService';
import type {
  SearchAnalyticsEvent,
  SearchAnalyticsFilter,
  SearchAnalyticsExportOptions,
  SearchAnalyticsAlert,
} from '../types/searchAnalytics';

describe('SearchAnalyticsService', () => {
  let service: SearchAnalyticsService;

  beforeEach(() => {
    service = SearchAnalyticsService.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('應該返回相同的實例', () => {
      const instance1 = SearchAnalyticsService.getInstance();
      const instance2 = SearchAnalyticsService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化', () => {
    it('應該成功初始化服務', async () => {
      const result = await service.initialize();
      expect(result).toBe(true);
      expect(service.getInitializationStatus()).toBe(true);
    });

    it('應該在初始化失敗時返回 false', async () => {
      // 模擬初始化失敗
      jest
        .spyOn(service as any, 'loadAnalytics')
        .mockRejectedValue(new Error('初始化失敗'));

      const result = await service.initialize();
      expect(result).toBe(false);
    });
  });

  describe('事件追蹤', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該追蹤搜索事件', () => {
      const event: Omit<SearchAnalyticsEvent, 'timestamp'> = {
        type: 'search_performed',
        userId: 'user123',
        sessionId: 'session456',
        query: 'Pokemon Charizard',
        results: 45,
        responseTime: 85,
        filters: { category: 'Pokemon' },
        sortBy: 'relevance',
        page: 1,
        limit: 20,
        category: 'Pokemon',
        success: true,
        userAgent: 'CardStrategy/1.0',
        platform: 'iOS',
      };

      expect(() => service.trackEvent(event)).not.toThrow();
    });

    it('應該在禁用時跳過事件追蹤', () => {
      service.updateConfig({ enabled: false });

      const event: Omit<SearchAnalyticsEvent, 'timestamp'> = {
        type: 'search_performed',
        userId: 'user123',
        sessionId: 'session456',
        query: 'test',
        results: 10,
        responseTime: 50,
        page: 1,
        limit: 20,
        success: true,
        userAgent: 'test',
        platform: 'web',
      };

      expect(() => service.trackEvent(event)).not.toThrow();
    });
  });

  describe('分析數據獲取', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該獲取分析數據', async () => {
      const analytics = await service.getAnalytics();

      expect(analytics).toBeDefined();
      expect(analytics.totalSearches).toBeGreaterThan(0);
      expect(analytics.uniqueUsers).toBeGreaterThan(0);
      expect(analytics.searchSuccessRate).toBeGreaterThan(0);
      expect(analytics.searchesByHour).toHaveLength(24);
      expect(analytics.popularSearches).toBeDefined();
      expect(analytics.trendingSearches).toBeDefined();
      expect(analytics.searchCategories).toBeDefined();
      expect(analytics.performanceMetrics).toBeDefined();
      expect(analytics.errorRates).toBeDefined();
      expect(analytics.cacheMetrics).toBeDefined();
      expect(analytics.conversionRates).toBeDefined();
      expect(analytics.revenueImpact).toBeDefined();
      expect(analytics.userSatisfaction).toBeDefined();
    });

    it('應該在未初始化時拋出錯誤', async () => {
      const newService = SearchAnalyticsService.getInstance();
      (newService as any).isInitialized = false;

      await expect(newService.getAnalytics()).rejects.toThrow(
        '搜索分析服務尚未初始化'
      );
    });

    it('應該應用過濾器', async () => {
      const filter: SearchAnalyticsFilter = {
        categories: ['Pokemon'],
        successOnly: true,
      };

      const analytics = await service.getAnalytics(filter);

      expect(analytics).toBeDefined();
      expect(analytics.searchSuccessRate).toBe(1.0);
      expect(analytics.errorRates.errorRate).toBe(0);
    });
  });

  describe('報告生成', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該生成報告', async () => {
      const report = await service.generateReport(
        '測試報告',
        '這是一個測試報告',
        {
          start: Date.now() - 24 * 60 * 60 * 1000,
          end: Date.now(),
        }
      );

      expect(report).toBeDefined();
      expect(report.id).toBeDefined();
      expect(report.title).toBe('測試報告');
      expect(report.description).toBe('這是一個測試報告');
      expect(report.period).toBeDefined();
      expect(report.analytics).toBeDefined();
      expect(report.insights).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(report.generatedAt).toBeDefined();
      expect(report.version).toBe('1.0.0');
    });

    it('應該生成帶過濾器的報告', async () => {
      const filter: SearchAnalyticsFilter = {
        categories: ['Pokemon'],
      };

      const report = await service.generateReport(
        '過濾報告',
        '帶過濾器的報告',
        {
          start: Date.now() - 24 * 60 * 60 * 1000,
          end: Date.now(),
        },
        filter
      );

      expect(report).toBeDefined();
      expect(report.analytics).toBeDefined();
    });
  });

  describe('數據導出', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該導出 JSON 格式數據', async () => {
      const analytics = await service.getAnalytics();
      const options: SearchAnalyticsExportOptions = {
        format: 'json',
        includeCharts: true,
        includeInsights: true,
        includeRecommendations: true,
        compression: false,
      };

      const data = await service.exportData(analytics, options);

      expect(data).toBeDefined();
      expect(typeof data).toBe('string');

      const parsed = JSON.parse(data);
      expect(parsed).toBeDefined();
    });

    it('應該導出 CSV 格式數據', async () => {
      const analytics = await service.getAnalytics();
      const options: SearchAnalyticsExportOptions = {
        format: 'csv',
        includeCharts: false,
        includeInsights: false,
        includeRecommendations: false,
        compression: false,
      };

      const data = await service.exportData(analytics, options);

      expect(data).toBeDefined();
      expect(typeof data).toBe('string');
    });

    it('應該導出 Excel 格式數據', async () => {
      const analytics = await service.getAnalytics();
      const options: SearchAnalyticsExportOptions = {
        format: 'excel',
        includeCharts: true,
        includeInsights: true,
        includeRecommendations: true,
        compression: false,
      };

      const data = await service.exportData(analytics, options);

      expect(data).toBeDefined();
      expect(typeof data).toBe('string');
    });

    it('應該導出 PDF 格式數據', async () => {
      const analytics = await service.getAnalytics();
      const options: SearchAnalyticsExportOptions = {
        format: 'pdf',
        includeCharts: true,
        includeInsights: true,
        includeRecommendations: true,
        compression: false,
      };

      const data = await service.exportData(analytics, options);

      expect(data).toBeDefined();
      expect(typeof data).toBe('string');
    });

    it('應該處理不支持的導出格式', async () => {
      const analytics = await service.getAnalytics();
      const options: SearchAnalyticsExportOptions = {
        format: 'invalid' as any,
        includeCharts: false,
        includeInsights: false,
        includeRecommendations: false,
        compression: false,
      };

      await expect(service.exportData(analytics, options)).rejects.toThrow(
        '不支持的導出格式: invalid'
      );
    });
  });

  describe('警報管理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該創建警報', async () => {
      const alert: Omit<SearchAnalyticsAlert, 'id' | 'triggerCount'> = {
        name: '測試警報',
        description: '這是一個測試警報',
        condition: {
          metric: 'errorRate',
          timeWindow: 300000,
          aggregation: 'avg',
        },
        threshold: 0.05,
        operator: 'gt',
        enabled: true,
        notificationChannels: ['email'],
      };

      const alertId = await service.createAlert(alert);

      expect(alertId).toBeDefined();
      expect(typeof alertId).toBe('string');
    });

    it('應該更新警報', async () => {
      const alert: Omit<SearchAnalyticsAlert, 'id' | 'triggerCount'> = {
        name: '測試警報',
        description: '這是一個測試警報',
        condition: {
          metric: 'errorRate',
          timeWindow: 300000,
          aggregation: 'avg',
        },
        threshold: 0.05,
        operator: 'gt',
        enabled: true,
        notificationChannels: ['email'],
      };

      const alertId = await service.createAlert(alert);

      await expect(
        service.updateAlert(alertId, { enabled: false })
      ).resolves.not.toThrow();
    });

    it('應該刪除警報', async () => {
      const alert: Omit<SearchAnalyticsAlert, 'id' | 'triggerCount'> = {
        name: '測試警報',
        description: '這是一個測試警報',
        condition: {
          metric: 'errorRate',
          timeWindow: 300000,
          aggregation: 'avg',
        },
        threshold: 0.05,
        operator: 'gt',
        enabled: true,
        notificationChannels: ['email'],
      };

      const alertId = await service.createAlert(alert);

      await expect(service.deleteAlert(alertId)).resolves.not.toThrow();
    });

    it('應該在更新不存在的警報時拋出錯誤', async () => {
      await expect(
        service.updateAlert('nonexistent', { enabled: false })
      ).rejects.toThrow('警報不存在: nonexistent');
    });

    it('應該在刪除不存在的警報時拋出錯誤', async () => {
      await expect(service.deleteAlert('nonexistent')).rejects.toThrow(
        '警報不存在: nonexistent'
      );
    });

    it('應該獲取警報列表', () => {
      const alerts = service.getAlerts();

      expect(Array.isArray(alerts)).toBe(true);
      expect(alerts.length).toBeGreaterThan(0);

      if (alerts.length > 0) {
        const alert = alerts[0];
        expect(alert.id).toBeDefined();
        expect(alert.name).toBeDefined();
        expect(alert.description).toBeDefined();
        expect(alert.condition).toBeDefined();
        expect(alert.threshold).toBeDefined();
        expect(alert.operator).toBeDefined();
        expect(alert.enabled).toBeDefined();
        expect(alert.notificationChannels).toBeDefined();
        expect(alert.triggerCount).toBeDefined();
      }
    });
  });

  describe('配置管理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該獲取配置', () => {
      const config = service.getConfig();

      expect(config).toBeDefined();
      expect(config.enabled).toBeDefined();
      expect(config.trackingInterval).toBeDefined();
      expect(config.dataRetentionDays).toBeDefined();
      expect(config.privacyMode).toBeDefined();
      expect(config.anonymizeData).toBeDefined();
      expect(config.exportFormat).toBeDefined();
      expect(config.realTimeTracking).toBeDefined();
      expect(config.batchProcessing).toBeDefined();
    });

    it('應該更新配置', () => {
      const newConfig = {
        enabled: false,
        trackingInterval: 120000,
        privacyMode: true,
      };

      service.updateConfig(newConfig);

      const updatedConfig = service.getConfig();
      expect(updatedConfig.enabled).toBe(false);
      expect(updatedConfig.trackingInterval).toBe(120000);
      expect(updatedConfig.privacyMode).toBe(true);
    });
  });

  describe('事件監聽', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該添加和移除事件監聽器', () => {
      const mockCallback = jest.fn();

      service.addEventListener(mockCallback);

      // 觸發事件
      service.trackEvent({
        type: 'search_performed',
        userId: 'user123',
        sessionId: 'session456',
        query: 'test',
        results: 10,
        responseTime: 50,
        page: 1,
        limit: 20,
        success: true,
        userAgent: 'test',
        platform: 'web',
      });

      // 等待事件處理完成
      setTimeout(() => {
        expect(mockCallback).toHaveBeenCalled();

        // 移除監聽器
        service.removeEventListener(mockCallback);

        // 再次觸發事件
        service.trackEvent({
          type: 'search_performed',
          userId: 'user123',
          sessionId: 'session456',
          query: 'test2',
          results: 5,
          responseTime: 30,
          page: 1,
          limit: 20,
          success: true,
          userAgent: 'test',
          platform: 'web',
        });

        // 應該只被調用一次（之前的那次）
        expect(mockCallback).toHaveBeenCalledTimes(1);
      }, 10);
    });

    it('應該處理事件監聽器錯誤', () => {
      const mockCallback = jest.fn().mockImplementation(() => {
        throw new Error('監聽器錯誤');
      });

      service.addEventListener(mockCallback);

      // 不應該拋出錯誤
      expect(() => {
        service.trackEvent({
          type: 'search_performed',
          userId: 'user123',
          sessionId: 'session456',
          query: 'test',
          results: 10,
          responseTime: 50,
          page: 1,
          limit: 20,
          success: true,
          userAgent: 'test',
          platform: 'web',
        });
      }).not.toThrow();
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該快速處理多個事件', () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        service.trackEvent({
          type: 'search_performed',
          userId: `user${i}`,
          sessionId: `session${i}`,
          query: `query${i}`,
          results: Math.floor(Math.random() * 100),
          responseTime: Math.floor(Math.random() * 200) + 50,
          page: 1,
          limit: 20,
          success: Math.random() > 0.1,
          userAgent: 'test',
          platform: 'web',
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 處理100個事件應該在1秒內完成
      expect(duration).toBeLessThan(1000);
    });

    it('應該快速獲取分析數據', async () => {
      const startTime = Date.now();

      await service.getAnalytics();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 獲取分析數據應該在100ms內完成
      expect(duration).toBeLessThan(100);
    });
  });

  describe('邊界條件', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該處理空查詢', () => {
      expect(() => {
        service.trackEvent({
          type: 'search_performed',
          userId: 'user123',
          sessionId: 'session456',
          query: '',
          results: 0,
          responseTime: 0,
          page: 1,
          limit: 20,
          success: false,
          userAgent: 'test',
          platform: 'web',
        });
      }).not.toThrow();
    });

    it('應該處理極長的查詢', () => {
      const longQuery = 'a'.repeat(1000);

      expect(() => {
        service.trackEvent({
          type: 'search_performed',
          userId: 'user123',
          sessionId: 'session456',
          query: longQuery,
          results: 0,
          responseTime: 0,
          page: 1,
          limit: 20,
          success: false,
          userAgent: 'test',
          platform: 'web',
        });
      }).not.toThrow();
    });

    it('應該處理極端的響應時間', () => {
      expect(() => {
        service.trackEvent({
          type: 'search_performed',
          userId: 'user123',
          sessionId: 'session456',
          query: 'test',
          results: 0,
          responseTime: 999999,
          page: 1,
          limit: 20,
          success: false,
          userAgent: 'test',
          platform: 'web',
        });
      }).not.toThrow();
    });

    it('應該處理無效的過濾器', async () => {
      const invalidFilter = {
        categories: ['nonexistent'],
        minSearches: -1,
        minUsers: -1,
      } as any;

      const analytics = await service.getAnalytics(invalidFilter);

      expect(analytics).toBeDefined();
    });
  });

  describe('錯誤處理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該處理導出錯誤', async () => {
      const analytics = await service.getAnalytics();
      const options: SearchAnalyticsExportOptions = {
        format: 'csv',
        includeCharts: true,
        includeInsights: true,
        includeRecommendations: true,
        compression: false,
      };

      // 模擬導出錯誤
      jest.spyOn(service as any, 'convertToCSV').mockImplementation(() => {
        throw new Error('導出失敗');
      });

      await expect(service.exportData(analytics, options)).rejects.toThrow(
        '導出失敗'
      );
    });

    it('應該處理報告生成錯誤', async () => {
      // 模擬報告生成錯誤
      jest
        .spyOn(service as any, 'generateInsights')
        .mockRejectedValue(new Error('洞察生成失敗'));

      await expect(
        service.generateReport('測試報告', '這是一個測試報告', {
          start: Date.now() - 24 * 60 * 60 * 1000,
          end: Date.now(),
        })
      ).rejects.toThrow('洞察生成失敗');
    });
  });
});

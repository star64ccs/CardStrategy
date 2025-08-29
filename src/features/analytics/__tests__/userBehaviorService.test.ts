import { UserBehaviorService } from '../services/userBehaviorService';
import type {
  UserBehaviorEvent,
  UserBehaviorFilter,
  UserBehaviorExportOptions,
  UserBehaviorAlert,
  UserBehaviorConfig,
} from '../types/userBehavior';
import {
  UserBehaviorEventType,
  UserBehaviorAnalysisResponse,
} from '../types/userBehavior';

// Mock 數據轉換函數
const _mockConvertToJSON = jest.fn(data => JSON.stringify(data));
const _mockConvertToCSV = jest.fn(data => 'csv,data,format');
const _mockConvertToExcel = jest.fn(data => 'excel,data,format');
const _mockConvertToPDF = jest.fn(data => 'pdf,data,format');

jest.mock('../utils/dataConverters', () => ({
  convertToJSON: mockConvertToJSON,
  convertToCSV: mockConvertToCSV,
  convertToExcel: mockConvertToExcel,
  convertToPDF: mockConvertToPDF,
}));

describe('UserBehaviorService', () => {
  let service: UserBehaviorService;

  beforeEach(() => {
    // 重置單例實例
    (UserBehaviorService as any).instance = undefined;
    service = UserBehaviorService.getInstance();

    // 重置 mock
    mockConvertToJSON.mockClear();
    mockConvertToCSV.mockClear();
    mockConvertToExcel.mockClear();
    mockConvertToPDF.mockClear();
  });

  describe('單例模式', () => {
    it('應該返回相同的實例', () => {
      const _instance1 = UserBehaviorService.getInstance();
      const _instance2 = UserBehaviorService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化', () => {
    it('應該成功初始化服務', async () => {
      const _result = await service.initialize();
      expect(result).toBe(true);
    });

    it('應該在初始化失敗時返回 false', async () => {
      // 模擬初始化失敗
      jest
        .spyOn(service as any, 'initializeAnalytics')
        .mockRejectedValue(new Error('初始化失敗'));

      const _result = await service.initialize();
      expect(result).toBe(false);
    });
  });

  describe('事件追蹤', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該在啟用時追蹤事件', () => {
      const event: Omit<UserBehaviorEvent, 'timestamp'> = {
        id: 'test-event-1',
        userId: 'user123',
        sessionId: 'session123',
        eventType: 'page_view',
        data: { page: '/home' },
        metadata: { userAgent: 'test' },
      };

      service.trackEvent(event);

      // 驗證事件被添加
      const { events } = service as any;
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].eventType).toBe('page_view');
    });

    it('應該在禁用時不追蹤事件', () => {
      service.updateConfig({ enabled: false });

      const event: Omit<UserBehaviorEvent, 'timestamp'> = {
        id: 'test-event-2',
        userId: 'user123',
        sessionId: 'session123',
        eventType: 'card_view',
        data: { cardId: 'card123' },
        metadata: { userAgent: 'test' },
      };

      const _initialEventCount = (service as any).events.length;
      service.trackEvent(event);

      expect((service as any).events.length).toBe(initialEventCount);
    });
  });

  describe('行為分析', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該獲取行為分析數據', async () => {
      const _analysis = await service.getBehaviorAnalysis();

      expect(analysis).toBeDefined();
      expect(analysis.stats).toBeDefined();
      expect(analysis.patterns).toBeDefined();
      expect(analysis.insights).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
    });

    it('應該使用過濾器獲取行為分析', async () => {
      const filter: UserBehaviorFilter = {
        userIds: ['user123'],
        eventTypes: ['page_view', 'card_view'],
        startTime: Date.now() - 24 * 60 * 60 * 1000,
        endTime: Date.now(),
      };

      const _analysis = await service.getBehaviorAnalysis(filter);

      expect(analysis).toBeDefined();
      expect(analysis.stats).toBeDefined();
    });

    it('應該在未初始化時拋出錯誤', async () => {
      // 重置服務狀態
      (service as any).isInitialized = false;

      await expect(service.getBehaviorAnalysis()).rejects.toThrow(
        '服務未初始化'
      );
    });
  });

  describe('報告生成', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該生成基本報告', async () => {
      const _report = await service.generateReport(
        '測試報告',
        '這是一個測試報告',
        { start: Date.now() - 24 * 60 * 60 * 1000, end: Date.now() }
      );

      expect(report).toBeDefined();
      expect(report.title).toBe('測試報告');
      expect(report.description).toBe('這是一個測試報告');
      expect(report.status).toBe('completed');
    });

    it('應該使用過濾器生成報告', async () => {
      const filter: UserBehaviorFilter = {
        userIds: ['user123'],
        eventTypes: ['purchase'],
      };

      const _report = await service.generateReport(
        '過濾報告',
        '使用過濾器的報告',
        { start: Date.now() - 24 * 60 * 60 * 1000, end: Date.now() },
        filter
      );

      expect(report).toBeDefined();
      expect(report.filter).toEqual(filter);
    });
  });

  describe('數據導出', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該導出 JSON 格式數據', async () => {
      const _analysis = await service.getBehaviorAnalysis();
      const options: UserBehaviorExportOptions = {
        format: 'json',
        includeEvents: true,
        includePatterns: true,
        includeProfiles: true,
        includeInsights: true,
        includeRecommendations: true,
        compression: false,
        anonymize: false,
      };

      const _result = await service.exportData(analysis, options);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('應該導出 CSV 格式數據', async () => {
      const _analysis = await service.getBehaviorAnalysis();
      const options: UserBehaviorExportOptions = {
        format: 'csv',
        includeEvents: true,
        includePatterns: true,
        includeProfiles: true,
        includeInsights: true,
        includeRecommendations: true,
        compression: false,
        anonymize: false,
      };

      const _result = await service.exportData(analysis, options);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('應該導出 Excel 格式數據', async () => {
      const _analysis = await service.getBehaviorAnalysis();
      const options: UserBehaviorExportOptions = {
        format: 'excel',
        includeEvents: true,
        includePatterns: true,
        includeProfiles: true,
        includeInsights: true,
        includeRecommendations: true,
        compression: true,
        anonymize: false,
      };

      const _result = await service.exportData(analysis, options);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('應該導出 PDF 格式數據', async () => {
      const _analysis = await service.getBehaviorAnalysis();
      const options: UserBehaviorExportOptions = {
        format: 'pdf',
        includeEvents: true,
        includePatterns: true,
        includeProfiles: true,
        includeInsights: true,
        includeRecommendations: true,
        compression: false,
        anonymize: false,
      };

      const _result = await service.exportData(analysis, options);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('應該處理不支持的導出格式', async () => {
      const _analysis = await service.getBehaviorAnalysis();
      const options: UserBehaviorExportOptions = {
        format: 'invalid' as any,
        includeEvents: true,
        includePatterns: true,
        includeProfiles: true,
        includeInsights: true,
        includeRecommendations: true,
        compression: false,
        anonymize: false,
      };

      await expect(service.exportData(analysis, options)).rejects.toThrow(
        '不支持的導出格式'
      );
    });

    it('應該處理導出錯誤', async () => {
      const _analysis = await service.getBehaviorAnalysis();
      const options: UserBehaviorExportOptions = {
        format: 'invalid' as any,
        includeEvents: true,
        includePatterns: true,
        includeProfiles: true,
        includeInsights: true,
        includeRecommendations: true,
        compression: false,
        anonymize: false,
      };

      await expect(service.exportData(analysis, options)).rejects.toThrow(
        '不支持的導出格式'
      );
    });
  });

  describe('警報管理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該創建警報', async () => {
      const alert: Omit<UserBehaviorAlert, 'id' | 'triggerCount'> = {
        name: '測試警報',
        description: '這是一個測試警報',
        condition: {
          metric: 'churnRate',
          operator: 'gt',
          value: 0.1,
        },
        severity: 'high',
        enabled: true,
        recipients: ['test@example.com'],
        cooldownPeriod: 3600000,
      };

      const _result = await service.createAlert(alert);

      expect(result).toBeDefined();
      expect(result.name).toBe('測試警報');
      expect(result.id).toBeDefined();
      expect(result.triggerCount).toBe(0);
    });

    it('應該更新警報', async () => {
      // 先創建一個警報
      const _alert = await service.createAlert({
        name: '原始警報',
        description: '原始描述',
        condition: {
          metric: 'churnRate',
          operator: 'gt',
          value: 0.1,
        },
        severity: 'medium',
        enabled: true,
        recipients: ['test@example.com'],
        cooldownPeriod: 3600000,
      });

      // 更新警報
      await service.updateAlert(alert.id, {
        name: '更新後的警報',
        severity: 'high',
      });

      const _updatedAlert = await service.getAlert(alert.id);
      expect(updatedAlert?.name).toBe('更新後的警報');
      expect(updatedAlert?.severity).toBe('high');
    });

    it('應該刪除警報', async () => {
      // 先創建一個警報
      const _alert = await service.createAlert({
        name: '要刪除的警報',
        description: '這個警報將被刪除',
        condition: {
          metric: 'churnRate',
          operator: 'gt',
          value: 0.1,
        },
        severity: 'low',
        enabled: true,
        recipients: ['test@example.com'],
        cooldownPeriod: 3600000,
      });

      // 刪除警報
      await service.deleteAlert(alert.id);

      // 驗證警報已被刪除
      const _deletedAlert = await service.getAlert(alert.id);
      expect(deletedAlert).toBeNull();
    });

    it('應該獲取所有警報', async () => {
      // 創建多個警報
      await service.createAlert({
        name: '警報1',
        description: '第一個警報',
        condition: { metric: 'churnRate', operator: 'gt', value: 0.1 },
        severity: 'high',
        enabled: true,
        recipients: ['test@example.com'],
        cooldownPeriod: 3600000,
      });

      await service.createAlert({
        name: '警報2',
        description: '第二個警報',
        condition: { metric: 'conversionRate', operator: 'lt', value: 0.05 },
        severity: 'medium',
        enabled: true,
        recipients: ['test@example.com'],
        cooldownPeriod: 3600000,
      });

      const _alerts = await service.getAlerts();
      expect(alerts.length).toBeGreaterThanOrEqual(2);
    });

    it('應該處理不存在的警報', async () => {
      const _nonExistentAlert = await service.getAlert('non-existent-id');
      expect(nonExistentAlert).toBeNull();

      await expect(
        service.updateAlert('non-existent-id', { name: 'new name' })
      ).rejects.toThrow('警報不存在');

      await expect(service.deleteAlert('non-existent-id')).rejects.toThrow(
        '警報不存在'
      );
    });
  });

  describe('配置管理', () => {
    it('應該獲取配置', () => {
      const _config = service.getConfig();
      expect(config).toBeDefined();
      expect(config.enabled).toBeDefined();
      expect(config.trackingInterval).toBeDefined();
    });

    it('應該更新配置', () => {
      const newConfig: Partial<UserBehaviorConfig> = {
        enabled: false,
        trackingInterval: 60000,
        privacyMode: true,
      };

      service.updateConfig(newConfig);

      const _updatedConfig = service.getConfig();
      expect(updatedConfig.enabled).toBe(false);
      expect(updatedConfig.trackingInterval).toBe(60000);
      expect(updatedConfig.privacyMode).toBe(true);
    });
  });

  describe('事件監聽器', () => {
    it('應該添加和移除事件監聽器', () => {
      const _mockCallback = jest.fn();

      // 添加監聽器
      service.addEventListener('event_tracked', mockCallback);

      // 觸發事件
      service.trackEvent({
        id: 'test-event',
        userId: 'user123',
        sessionId: 'session123',
        eventType: 'page_view',
        data: { page: '/test' },
        metadata: { userAgent: 'test' },
      });

      // 驗證回調被調用
      setTimeout(() => {
        expect(mockCallback).toHaveBeenCalled();
      }, 10);

      // 移除監聽器
      service.removeEventListener('event_tracked', mockCallback);

      // 再次觸發事件
      service.trackEvent({
        id: 'test-event-2',
        userId: 'user123',
        sessionId: 'session123',
        eventType: 'card_view',
        data: { cardId: 'card123' },
        metadata: { userAgent: 'test' },
      });

      // 驗證回調沒有被再次調用
      setTimeout(() => {
        expect(mockCallback).toHaveBeenCalledTimes(1);
      }, 10);
    });

    it('應該處理不存在的監聽器移除', () => {
      const _mockCallback = jest.fn();

      // 嘗試移除不存在的監聽器
      expect(() => {
        service.removeEventListener('event_tracked', mockCallback);
      }).not.toThrow();
    });
  });

  describe('用戶特定數據', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該獲取用戶畫像', async () => {
      const _profile = await service.getUserProfile('user123');

      expect(profile).toBeDefined();
      expect(profile.userId).toBe('user123');
      expect(profile.behaviorScore).toBeDefined();
      expect(profile.preferences).toBeDefined();
    });

    it('應該獲取用戶模式', async () => {
      const _patterns = await service.getUserPatterns('user123');

      expect(patterns).toBeDefined();
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('應該獲取用戶指標', async () => {
      const _metrics = await service.getUserMetrics('user123');

      expect(metrics).toBeDefined();
      expect(metrics.totalEvents).toBeDefined();
      expect(metrics.averageSessionDuration).toBeDefined();
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該快速處理多個事件', () => {
      const _startTime = Date.now();

      // 添加1000個事件
      for (let i = 0; i < 1000; i++) {
        service.trackEvent({
          id: `event-${i}`,
          userId: `user${i % 100}`,
          sessionId: `session${i % 50}`,
          eventType: 'page_view',
          data: { page: `/page-${i}` },
          metadata: { userAgent: 'test' },
        });
      }

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      // 應該在1秒內完成
      expect(duration).toBeLessThan(1000);
    });

    it('應該快速獲取分析數據', async () => {
      const _startTime = Date.now();

      const _analysis = await service.getBehaviorAnalysis();

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      // 應該在100ms內完成
      expect(duration).toBeLessThan(100);
      expect(analysis).toBeDefined();
    });
  });

  describe('邊界條件測試', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該處理空查詢', () => {
      service.trackEvent({
        id: 'empty-query-event',
        userId: 'user123',
        sessionId: 'session123',
        eventType: 'search',
        data: { searchQuery: '' },
        metadata: { userAgent: 'test' },
      });

      // 不應該拋出錯誤
      expect(() => {
        service.trackEvent({
          id: 'empty-query-event-2',
          userId: 'user123',
          sessionId: 'session123',
          eventType: 'search',
          data: { searchQuery: '' },
          metadata: { userAgent: 'test' },
        });
      }).not.toThrow();
    });

    it('應該處理極長的查詢', () => {
      const _longQuery = 'a'.repeat(10000);

      service.trackEvent({
        id: 'long-query-event',
        userId: 'user123',
        sessionId: 'session123',
        eventType: 'search',
        data: { searchQuery: longQuery },
        metadata: { userAgent: 'test' },
      });

      // 不應該拋出錯誤
      expect(() => {
        service.trackEvent({
          id: 'long-query-event-2',
          userId: 'user123',
          sessionId: 'session123',
          eventType: 'search',
          data: { searchQuery: longQuery },
          metadata: { userAgent: 'test' },
        });
      }).not.toThrow();
    });

    it('應該處理極端的響應時間', () => {
      service.trackEvent({
        id: 'extreme-time-event',
        userId: 'user123',
        sessionId: 'session123',
        eventType: 'page_view',
        data: {
          page: '/test',
          responseTime: 999999,
        },
        metadata: { userAgent: 'test' },
      });

      // 不應該拋出錯誤
      expect(() => {
        service.trackEvent({
          id: 'extreme-time-event-2',
          userId: 'user123',
          sessionId: 'session123',
          eventType: 'page_view',
          data: {
            page: '/test',
            responseTime: 999999,
          },
          metadata: { userAgent: 'test' },
        });
      }).not.toThrow();
    });

    it('應該處理無效的過濾器', async () => {
      const _invalidFilter = {
        userIds: ['user123'],
        eventTypes: ['invalid_event_type'],
        startTime: Date.now() + 24 * 60 * 60 * 1000, // 未來時間
        endTime: Date.now() - 24 * 60 * 60 * 1000, // 過去時間
      } as UserBehaviorFilter;

      const _analysis = await service.getBehaviorAnalysis(invalidFilter);

      // 應該返回空的分析結果而不是拋出錯誤
      expect(analysis).toBeDefined();
      expect(analysis.stats.totalEvents).toBe(0);
    });
  });
});

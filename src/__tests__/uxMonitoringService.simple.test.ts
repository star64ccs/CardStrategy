// 用戶體驗監控服務簡化測試
import UXMonitoringService from '../services/uxMonitoringService';
import {
  PerformanceMetricType,
  SatisfactionLevel,
  UserActionType,
} from '../types/uxMonitoring';

// Mock DOM 環境
const _mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

const _mockNavigator = {
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  doNotTrack: null,
};

const _mockScreen = {
  width: 1920,
  height: 1080,
};

const _mockWindow = {
  location: {
    href: 'https://example.com',
  },
  innerWidth: 1920,
  innerHeight: 937,
  scrollY: 0,
  scrollX: 0,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

const _mockDocument = {
  title: 'Test Page',
  referrer: 'https://google.com',
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  documentElement: {
    scrollHeight: 2000,
  },
};

// Mock PerformanceObserver
const _mockPerformanceObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
}));

// 設置全局 mock
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

Object.defineProperty(global, 'screen', {
  value: mockScreen,
  writable: true,
});

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
});

Object.defineProperty(global, 'PerformanceObserver', {
  value: mockPerformanceObserver,
  writable: true,
});

describe('UXMonitoringService - 簡化測試', () => {
  let service: UXMonitoringService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockNavigator.doNotTrack = null;

    service = UXMonitoringService.getInstance();
    service.clearData();
  });

  afterEach(() => {
    service.clearData();
  });

  describe('基本功能', () => {
    test('應該成功初始化服務', async () => {
      await service.initialize();

      const _status = service.getStatus();
      expect(status.isInitialized).toBe(true);
      expect(status.isEnabled).toBe(true);
    });

    test('應該返回相同的實例（單例模式）', () => {
      const _instance1 = UXMonitoringService.getInstance();
      const _instance2 = UXMonitoringService.getInstance();
      expect(instance1).toBe(instance2);
    });

    test('應該獲取默認配置', () => {
      const _config = service.getConfig();
      expect(config).toBeDefined();
      expect(config.enabled).toBe(true);
      expect(config.samplingRate).toBe(1.0);
    });
  });

  describe('數據追蹤', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該追蹤用戶行為', () => {
      service.trackAction({
        type: UserActionType.CLICK,
        pageUrl: 'https://example.com',
        pageTitle: 'Test Page',
      });

      const _status = service.getStatus();
      expect(status.actionCount).toBeGreaterThan(0);
    });

    test('應該追蹤性能指標', () => {
      service.trackPerformance({
        type: PerformanceMetricType.PAGE_LOAD,
        name: 'test-load',
        value: 1000,
        unit: 'ms',
        pageUrl: 'https://example.com',
      });

      const _status = service.getStatus();
      expect(status.performanceMetricCount).toBeGreaterThan(0);
    });

    test('應該追蹤錯誤', () => {
      service.trackError(new Error('測試錯誤'));

      const _status = service.getStatus();
      expect(status.errorCount).toBeGreaterThan(0);
    });

    test('應該提交滿意度調查', () => {
      service.submitSatisfaction({
        overallSatisfaction: SatisfactionLevel.SATISFIED,
        easeOfUse: SatisfactionLevel.SATISFIED,
        performance: SatisfactionLevel.SATISFIED,
        design: SatisfactionLevel.SATISFIED,
        functionality: SatisfactionLevel.SATISFIED,
        wouldRecommend: true,
      });

      const _status = service.getStatus();
      expect(status.satisfactionSurveyCount).toBeGreaterThan(0);
    });
  });

  describe('分析功能', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該生成分析數據', () => {
      // 添加一些測試數據
      service.trackAction({
        type: UserActionType.CLICK,
        pageUrl: 'https://example.com',
        pageTitle: 'Test Page',
      });

      service.trackPerformance({
        type: PerformanceMetricType.PAGE_LOAD,
        name: 'test-load',
        value: 1000,
        unit: 'ms',
        pageUrl: 'https://example.com',
      });

      service.trackError(new Error('測試錯誤'));

      const _analytics = service.getAnalytics();
      expect(analytics).toBeDefined();
      expect(analytics.sessionAnalytics).toBeDefined();
      expect(analytics.performanceAnalytics).toBeDefined();
      expect(analytics.errorAnalytics).toBeDefined();
      expect(analytics.satisfactionAnalytics).toBeDefined();
    });

    test('應該計算會話統計', () => {
      // 添加多個操作
      for (let i = 0; i < 3; i++) {
        service.trackAction({
          type: UserActionType.CLICK,
          pageUrl: 'https://example.com',
          pageTitle: 'Test Page',
        });
      }

      const _analytics = service.getAnalytics();
      expect(analytics.sessionAnalytics.totalSessions).toBeGreaterThan(0);
    });

    test('應該計算性能統計', () => {
      // 添加多個性能指標
      for (let i = 0; i < 3; i++) {
        service.trackPerformance({
          type: PerformanceMetricType.PAGE_LOAD,
          name: `test-load-${i}`,
          value: 1000 + i * 100,
          unit: 'ms',
          pageUrl: 'https://example.com',
        });
      }

      const _analytics = service.getAnalytics();
      expect(
        analytics.performanceAnalytics.averagePageLoadTime
      ).toBeGreaterThan(0);
    });

    test('應該計算錯誤統計', () => {
      // 添加多個錯誤
      for (let i = 0; i < 3; i++) {
        service.trackError(new Error(`測試錯誤 ${i}`));
      }

      const _analytics = service.getAnalytics();
      expect(analytics.errorAnalytics.totalErrors).toBeGreaterThan(0);
    });

    test('應該計算滿意度統計', () => {
      // 添加多個滿意度調查
      for (let i = 0; i < 3; i++) {
        service.submitSatisfaction({
          overallSatisfaction: SatisfactionLevel.SATISFIED,
          easeOfUse: SatisfactionLevel.SATISFIED,
          performance: SatisfactionLevel.SATISFIED,
          design: SatisfactionLevel.SATISFIED,
          functionality: SatisfactionLevel.SATISFIED,
          wouldRecommend: true,
        });
      }

      const _analytics = service.getAnalytics();
      expect(
        analytics.satisfactionAnalytics.averageSatisfaction
      ).toBeGreaterThan(0);
    });
  });

  describe('配置管理', () => {
    test('應該更新配置', () => {
      const _newConfig = {
        enabled: false,
        samplingRate: 0.5,
      };

      service.updateConfig(newConfig);

      const _config = service.getConfig();
      expect(config.enabled).toBe(false);
      expect(config.samplingRate).toBe(0.5);
    });

    test('應該部分更新配置', () => {
      const _originalConfig = service.getConfig();
      const _newConfig = {
        performanceMonitoring: {
          ...originalConfig.performanceMonitoring,
          enabled: false,
        },
      };

      service.updateConfig(newConfig);

      const _config = service.getConfig();
      expect(config.performanceMonitoring.enabled).toBe(false);
      expect(config.errorTracking.enabled).toBe(
        originalConfig.errorTracking.enabled
      );
    });
  });

  describe('數據管理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該清理數據', () => {
      // 添加一些數據
      service.trackAction({
        type: UserActionType.CLICK,
        pageUrl: 'https://example.com',
        pageTitle: 'Test Page',
      });

      service.trackError(new Error('測試錯誤'));

      // 清理數據
      service.clearData();

      const _status = service.getStatus();
      expect(status.sessionCount).toBe(0);
      expect(status.actionCount).toBe(0);
      expect(status.errorCount).toBe(0);
    });

    test('應該導出數據', () => {
      // 添加一些數據
      service.trackAction({
        type: UserActionType.CLICK,
        pageUrl: 'https://example.com',
        pageTitle: 'Test Page',
      });

      const _exportedData = service.exportData();
      expect(exportedData).toBeDefined();
      expect(exportedData.sessions).toBeDefined();
      expect(exportedData.performanceMetrics).toBeDefined();
      expect(exportedData.errorEvents).toBeDefined();
      expect(exportedData.satisfactionSurveys).toBeDefined();
    });
  });

  describe('事件系統', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該註冊和觸發事件', () => {
      const _mockCallback = jest.fn();

      service.on('action-tracked', mockCallback);

      service.trackAction({
        type: UserActionType.CLICK,
        pageUrl: 'https://example.com',
        pageTitle: 'Test Page',
      });

      expect(mockCallback).toHaveBeenCalled();
    });

    test('應該移除事件監聽器', () => {
      const _mockCallback = jest.fn();

      service.on('action-tracked', mockCallback);
      service.off('action-tracked', mockCallback);

      service.trackAction({
        type: UserActionType.CLICK,
        pageUrl: 'https://example.com',
        pageTitle: 'Test Page',
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('狀態管理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該獲取正確的狀態', () => {
      const _status = service.getStatus();
      expect(status.isInitialized).toBe(true);
      expect(status.isEnabled).toBe(true);
      expect(status.sessionCount).toBeGreaterThan(0);
      expect(status.currentSession).toBeDefined();
    });

    test('應該在添加數據後更新狀態', () => {
      const _initialStatus = service.getStatus();

      service.trackAction({
        type: UserActionType.CLICK,
        pageUrl: 'https://example.com',
        pageTitle: 'Test Page',
      });

      const _updatedStatus = service.getStatus();
      expect(updatedStatus.actionCount).toBeGreaterThan(
        initialStatus.actionCount
      );
    });
  });

  describe('A/B 測試', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該獲取 A/B 測試變體', () => {
      const _variant = service.getABTestVariant('test-button-color');
      // 由於沒有設置測試數據，應該返回 null
      expect(variant).toBeNull();
    });

    test('應該追蹤轉換', () => {
      // 轉換追蹤不會拋出錯誤
      expect(() => {
        service.trackConversion('test-button-color', 'click', 1);
      }).not.toThrow();
    });
  });

  describe('邊界情況', () => {
    test('應該處理空數據的情況', () => {
      const _analytics = service.getAnalytics();
      expect(analytics.sessionAnalytics.totalSessions).toBe(0);
      expect(analytics.performanceAnalytics.averagePageLoadTime).toBe(0);
      expect(analytics.errorAnalytics.totalErrors).toBe(0);
      expect(analytics.satisfactionAnalytics.averageSatisfaction).toBe(0);
    });

    test('應該處理禁用狀態', async () => {
      await service.initialize({
        enabled: false,
      });

      service.trackAction({
        type: UserActionType.CLICK,
        pageUrl: 'https://example.com',
        pageTitle: 'Test Page',
      });

      const _status = service.getStatus();
      expect(status.isEnabled).toBe(false);
    });
  });
});

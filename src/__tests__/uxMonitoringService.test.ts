// User體驗MonitorService單元Test
import UXMonitoringService from '../services/uxMonitoringService';
import {
  ABTestStatus,
  ABTestType,
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
  msDoNotTrack: null,
};

const _mockScreen = {
  width: 1920,
  height: 1080,
};

const _mockWindow = {
  location: {
    href: 'https://example.com',
    pathname: '/test',
    search: '',
    hash: '',
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

// Mock Performance API
const _mockPerformance = {
  now: jest.fn(() => Date.now()),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
};

// Mock PerformanceObserver
const _mockPerformanceObserver = jest.fn().mockImplementation(callback => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
}));

// SettingsGlobal mock
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

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

describe('UXMonitoringService', () => {
  let service: UXMonitoringService;

  beforeEach(() => {
    // 清理所有 mock
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockNavigator.doNotTrack = null;
    mockNavigator.userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

    // GetServiceInstance
    service = UXMonitoringService.getInstance();

    // 清理ServiceStatus
    service.clearData();
  });

  afterEach(() => {
    // 清理Event監聽器
    service.clearData();
  });

  describe('單例模式', () => {
    test('應該返回相同的實例', () => {
      const _instance1 = UXMonitoringService.getInstance();
      const _instance2 = UXMonitoringService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化', () => {
    test('應該SuccessInitializeService', async () => {
      const _result = await service.initialize();
      expect(result).toBeUndefined();

      const _status = service.getStatus();
      expect(status.isInitialized).toBe(true);
      expect(status.isEnabled).toBe(true);
    });

    test('應該使用自定義配置初始化', async () => {
      const _customConfig = {
        enabled: false,
        samplingRate: 0.5,
      };

      await service.initialize(customConfig);

      const _config = service.getConfig();
      expect(config.enabled).toBe(false);
      expect(config.samplingRate).toBe(0.5);
    });

    test('應該檢查 Do Not Track 設置', async () => {
      // 模擬 Do Not Track Enable
      mockNavigator.doNotTrack = '1';

      await service.initialize();

      const _status = service.getStatus();
      expect(status.isEnabled).toBe(false);
    });
  });

  describe('用戶行為追蹤', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該追蹤點擊操作', () => {
      const _action = {
        type: UserActionType.CLICK,
        elementId: 'test-button',
        elementType: 'button',
        elementText: '測試按鈕',
        pageUrl: 'https://example.com',
        pageTitle: 'Test Page',
        coordinates: { x: 100, y: 200 },
      };

      service.trackAction(action);

      const _status = service.getStatus();
      expect(status.actionCount).toBeGreaterThan(0);
    });

    test('應該追蹤滾動操作', () => {
      const _action = {
        type: UserActionType.SCROLL,
        pageUrl: 'https://example.com',
        pageTitle: 'Test Page',
        metadata: {
          scrollY: 100,
          scrollX: 0,
        },
      };

      service.trackAction(action);

      const _status = service.getStatus();
      expect(status.actionCount).toBeGreaterThan(0);
    });

    test('應該追蹤輸入操作', () => {
      const _action = {
        type: UserActionType.INPUT,
        elementId: 'test-input',
        elementType: 'input',
        pageUrl: 'https://example.com',
        pageTitle: 'Test Page',
        metadata: {
          inputType: 'text',
          valueLength: 10,
        },
      };

      service.trackAction(action);

      const _status = service.getStatus();
      expect(status.actionCount).toBeGreaterThan(0);
    });

    test('應該追蹤導航操作', () => {
      const _action = {
        type: UserActionType.NAVIGATE,
        pageUrl: 'https://example.com',
        pageTitle: 'Test Page',
      };

      service.trackAction(action);

      const _status = service.getStatus();
      expect(status.actionCount).toBeGreaterThan(0);
    });
  });

  describe('性能監控', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該追蹤頁面加載性能', () => {
      const _metric = {
        type: PerformanceMetricType.PAGE_LOAD,
        name: 'test-page-load',
        value: 1500,
        unit: 'ms',
        pageUrl: 'https://example.com',
      };

      service.trackPerformance(metric);

      const _status = service.getStatus();
      expect(status.performanceMetricCount).toBeGreaterThan(0);
    });

    test('應該追蹤資源加載性能', () => {
      const _metric = {
        type: PerformanceMetricType.RESOURCE_LOAD,
        name: 'test-resource-load',
        value: 500,
        unit: 'ms',
        pageUrl: 'https://example.com',
      };

      service.trackPerformance(metric);

      const _status = service.getStatus();
      expect(status.performanceMetricCount).toBeGreaterThan(0);
    });

    test('應該追蹤交互性能', () => {
      const _metric = {
        type: PerformanceMetricType.INTERACTION,
        name: 'test-interaction',
        value: 50,
        unit: 'ms',
        pageUrl: 'https://example.com',
      };

      service.trackPerformance(metric);

      const _status = service.getStatus();
      expect(status.performanceMetricCount).toBeGreaterThan(0);
    });
  });

  describe('Error追蹤', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該追蹤 JavaScript Error', () => {
      const _error = new Error('測試 JavaScript Error');
      const _context = {
        tags: { source: 'test' },
        extra: { testData: 'value' },
      };

      service.trackError(error, context);

      const _status = service.getStatus();
      expect(status.errorCount).toBeGreaterThan(0);
    });

    test('應該追蹤網絡Error', () => {
      const _error = new Error('網絡請求Failed');
      const _context = {
        tags: { type: 'network' },
        extra: { url: 'https://api.example.com' },
      };

      service.trackError(error, context);

      const _status = service.getStatus();
      expect(status.errorCount).toBeGreaterThan(0);
    });

    test('應該追蹤VerifyError', () => {
      const _error = new Error('表單VerifyFailed');
      const _context = {
        tags: { type: 'validation' },
        extra: { field: 'email' },
      };

      service.trackError(error, context);

      const _status = service.getStatus();
      expect(status.errorCount).toBeGreaterThan(0);
    });
  });

  describe('滿意度調查', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該提交滿意度調查', () => {
      const _survey = {
        overallSatisfaction: SatisfactionLevel.SATISFIED,
        easeOfUse: SatisfactionLevel.VERY_SATISFIED,
        performance: SatisfactionLevel.SATISFIED,
        design: SatisfactionLevel.SATISFIED,
        functionality: SatisfactionLevel.VERY_SATISFIED,
        comments: '這是一個測試評論',
        wouldRecommend: true,
        issues: ['測試問題1'],
        suggestions: ['測試建議1'],
      };

      service.submitSatisfaction(survey);

      const _status = service.getStatus();
      expect(status.satisfactionSurveyCount).toBeGreaterThan(0);
    });

    test('應該處理不同滿意度級別', () => {
      const _survey = {
        overallSatisfaction: SatisfactionLevel.VERY_DISSATISFIED,
        easeOfUse: SatisfactionLevel.DISSATISFIED,
        performance: SatisfactionLevel.NEUTRAL,
        design: SatisfactionLevel.SATISFIED,
        functionality: SatisfactionLevel.VERY_SATISFIED,
        wouldRecommend: false,
      };

      service.submitSatisfaction(survey);

      const _status = service.getStatus();
      expect(status.satisfactionSurveyCount).toBeGreaterThan(0);
    });
  });

  describe('A/B 測試', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該獲取 A/B 測試變體', () => {
      // 模擬 A/B TestData
      const _testData = service.exportData();
      testData.abTests = [
        {
          id: 'test-button-color',
          name: '按鈕顏色測試',
          description: '測試不同按鈕顏色的效果',
          type: ABTestType.UI,
          status: ABTestStatus.ACTIVE,
          startDate: Date.now(),
          variants: [
            {
              id: 'variant-a',
              name: '變體 A',
              description: '藍色按鈕',
              trafficPercentage: 50,
              configuration: { color: 'blue' },
              isControl: true,
            },
            {
              id: 'variant-b',
              name: '變體 B',
              description: '紅色按鈕',
              trafficPercentage: 50,
              configuration: { color: 'red' },
              isControl: false,
            },
          ],
          trafficAllocation: 100,
          goals: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      // ReSettingsData
      service.clearData();
      // 注意：這裡需要ReInitializeService來SettingsTestData

      const _variant = service.getABTestVariant('test-button-color');
      expect(variant).toBeDefined();
    });

    test('應該追蹤轉換', () => {
      service.trackConversion('test-button-color', 'click', 1);

      // ConvertTrace不會直接影響StatusCount，但應該不會ThrowError
      const _status = service.getStatus();
      expect(status).toBeDefined();
    });
  });

  describe('分析數據', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該生成會話分析', () => {
      // Add一些TestData
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

      service.trackError(new Error('測試Error'));

      const _analytics = service.getAnalytics();
      expect(analytics).toBeDefined();
      expect(analytics.sessionAnalytics).toBeDefined();
      expect(analytics.performanceAnalytics).toBeDefined();
      expect(analytics.errorAnalytics).toBeDefined();
      expect(analytics.satisfactionAnalytics).toBeDefined();
      expect(analytics.abTestAnalytics).toBeDefined();
      expect(analytics.userJourneyAnalytics).toBeDefined();
    });

    test('應該計算正確的會話統計', () => {
      // AddMultipleOperation來TestStatistics
      for (let i = 0; i < 5; i++) {
        service.trackAction({
          type: UserActionType.CLICK,
          pageUrl: 'https://example.com',
          pageTitle: 'Test Page',
        });
      }

      const _analytics = service.getAnalytics();
      expect(analytics.sessionAnalytics.totalSessions).toBeGreaterThan(0);
      expect(analytics.sessionAnalytics.averagePageViews).toBeGreaterThan(0);
    });

    test('應該計算正確的性能統計', () => {
      // AddMultiple性能指標
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

    test('應該計算正確的Error統計', () => {
      // AddMultipleError
      for (let i = 0; i < 3; i++) {
        service.trackError(new Error(`測試Error ${i}`));
      }

      const _analytics = service.getAnalytics();
      expect(analytics.errorAnalytics.totalErrors).toBeGreaterThan(0);
      expect(analytics.errorAnalytics.errorRate).toBeGreaterThan(0);
    });

    test('應該計算正確的滿意度統計', () => {
      // AddMultiple滿意度調查
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
    test('應該獲取默認配置', () => {
      const _config = service.getConfig();
      expect(config).toBeDefined();
      expect(config.enabled).toBe(true);
      expect(config.samplingRate).toBe(1.0);
      expect(config.privacySettings).toBeDefined();
      expect(config.performanceMonitoring).toBeDefined();
      expect(config.errorTracking).toBeDefined();
      expect(config.userBehaviorTracking).toBeDefined();
      expect(config.satisfactionSurvey).toBeDefined();
      expect(config.abTesting).toBeDefined();
      expect(config.dataRetention).toBeDefined();
    });

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

  describe('狀態管理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該獲取正確的狀態', () => {
      const _status = service.getStatus();
      expect(status.isInitialized).toBe(true);
      expect(status.isEnabled).toBe(true);
      expect(status.sessionCount).toBeGreaterThan(0);
      expect(status.actionCount).toBeGreaterThanOrEqual(0);
      expect(status.errorCount).toBeGreaterThanOrEqual(0);
      expect(status.performanceMetricCount).toBeGreaterThanOrEqual(0);
      expect(status.satisfactionSurveyCount).toBeGreaterThanOrEqual(0);
      expect(status.abTestCount).toBeGreaterThanOrEqual(0);
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

  describe('數據管理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該清理數據', () => {
      // Add一些Data
      service.trackAction({
        type: UserActionType.CLICK,
        pageUrl: 'https://example.com',
        pageTitle: 'Test Page',
      });

      service.trackError(new Error('測試Error'));

      // 清理Data
      service.clearData();

      const _status = service.getStatus();
      expect(status.sessionCount).toBe(0);
      expect(status.actionCount).toBe(0);
      expect(status.errorCount).toBe(0);
      expect(status.performanceMetricCount).toBe(0);
      expect(status.satisfactionSurveyCount).toBe(0);
      expect(status.abTestCount).toBe(0);
    });

    test('應該導出數據', () => {
      // Add一些Data
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
      expect(exportedData.abTestAssignments).toBeDefined();
      expect(exportedData.abTests).toBeDefined();
    });

    test('導出的數據應該是深拷貝', () => {
      service.trackAction({
        type: UserActionType.CLICK,
        pageUrl: 'https://example.com',
        pageTitle: 'Test Page',
      });

      const _exportedData1 = service.exportData();
      const _exportedData2 = service.exportData();

      expect(exportedData1).not.toBe(exportedData2);
      expect(JSON.stringify(exportedData1)).toBe(JSON.stringify(exportedData2));
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

    test('應該處理多個事件監聽器', () => {
      const _mockCallback1 = jest.fn();
      const _mockCallback2 = jest.fn();

      service.on('action-tracked', mockCallback1);
      service.on('action-tracked', mockCallback2);

      service.trackAction({
        type: UserActionType.CLICK,
        pageUrl: 'https://example.com',
        pageTitle: 'Test Page',
      });

      expect(mockCallback1).toHaveBeenCalled();
      expect(mockCallback2).toHaveBeenCalled();
    });
  });

  describe('設備信息檢測', () => {
    test('應該檢測桌面設備', async () => {
      await service.initialize();

      const _status = service.getStatus();
      expect(status.currentSession).toBeDefined();
      expect(status.currentSession.deviceInfo).toBeDefined();
      expect(status.currentSession.deviceInfo.isDesktop).toBe(true);
      expect(status.currentSession.deviceInfo.isMobile).toBe(false);
      expect(status.currentSession.deviceInfo.isTablet).toBe(false);
    });

    test('應該檢測移動設備', async () => {
      // 模擬Move設備的 user agent
      mockNavigator.userAgent =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';

      // ReInitializeService以使用新的 user agent
      service.clearData();
      await service.initialize();

      const _status = service.getStatus();
      expect(status.currentSession.deviceInfo.isMobile).toBe(true);
      expect(status.currentSession.deviceInfo.isDesktop).toBe(false);
    });
  });

  describe('ErrorHandle', () => {
    test('應該HandleInitializeError', async () => {
      // 模擬 PerformanceObserver 不可用的情況
      const _originalPerformanceObserver = global.PerformanceObserver;
      delete (global as any).PerformanceObserver;

      const _mockConsoleWarn = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      await service.initialize();

      expect(mockConsoleWarn).toHaveBeenCalled();
      mockConsoleWarn.mockRestore();

      // Restore PerformanceObserver
      (global as any).PerformanceObserver = originalPerformanceObserver;
    });

    test('應該Handle事件監聽器Error', () => {
      const _mockConsoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const _errorCallback = () => {
        throw new Error('測試Error');
      };

      service.on('action-tracked', errorCallback);

      service.trackAction({
        type: UserActionType.CLICK,
        pageUrl: 'https://example.com',
        pageTitle: 'Test Page',
      });

      expect(mockConsoleError).toHaveBeenCalled();
      mockConsoleError.mockRestore();
    });
  });

  describe('邊界情況', () => {
    test('應該處理未初始化狀態下的操作', () => {
      // 清理ServiceStatus以模擬未Initialize
      service.clearData();

      // 在未InitializeStatus下調用Method
      service.trackAction({
        type: UserActionType.CLICK,
        pageUrl: 'https://example.com',
        pageTitle: 'Test Page',
      });

      // 應該不會ThrowError
      const _status = service.getStatus();
      expect(status.isInitialized).toBe(false);
    });

    test('應該處理禁用狀態下的操作', async () => {
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

    test('應該處理空數據的情況', () => {
      const _analytics = service.getAnalytics();
      expect(analytics.sessionAnalytics.totalSessions).toBe(0);
      expect(analytics.performanceAnalytics.averagePageLoadTime).toBe(0);
      expect(analytics.errorAnalytics.totalErrors).toBe(0);
      expect(analytics.satisfactionAnalytics.averageSatisfaction).toBe(0);
    });
  });
});

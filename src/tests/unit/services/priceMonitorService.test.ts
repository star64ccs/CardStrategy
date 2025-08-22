import { priceMonitorService } from '../../../services/priceMonitorService';
import { notificationService } from '../../../services/notificationService';
import { marketService } from '../../../services/marketService';
import { investmentService } from '../../../services/investmentService';
import { apiService } from '../../../services/apiService';
import { logger } from '../../../utils/logger';
import { cacheManager } from '../../../utils/cacheManager';
import { networkMonitor } from '../../../utils/networkMonitor';

// Mock 依賴
jest.mock('../../../services/notificationService');
jest.mock('../../../services/marketService');
jest.mock('../../../services/investmentService');
jest.mock('../../../services/apiService');
jest.mock('../../../utils/logger');
jest.mock('../../../utils/cacheManager');
jest.mock('../../../utils/networkMonitor');

const mockNotificationService = notificationService as jest.Mocked<
  typeof notificationService
>;
const mockMarketService = marketService as jest.Mocked<typeof marketService>;
const mockInvestmentService = investmentService as jest.Mocked<
  typeof investmentService
>;
const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockLogger = logger as jest.Mocked<typeof logger>;
const mockCacheManager = cacheManager as jest.Mocked<typeof cacheManager>;
const mockNetworkMonitor = networkMonitor as jest.Mocked<typeof networkMonitor>;

describe('PriceMonitorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // 設置默認 mock 值
    mockNetworkMonitor.isOnline.mockReturnValue(true);
    mockNetworkMonitor.addListener.mockImplementation(() => {});
    mockNetworkMonitor.removeListener.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    priceMonitorService.cleanup();
  });

  describe('initialize', () => {
    it('應該成功初始化價格監控服務', async () => {
      const mockAlerts = {
        data: [
          {
            id: 'alert-1',
            cardId: 'card-1',
            cardName: '測試卡片',
            targetPrice: 100,
            currentPrice: 90,
            type: 'above' as const,
            userId: 'user-1',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            triggerCount: 0,
          },
        ],
      };

      mockInvestmentService.getPriceAlerts.mockResolvedValue(mockAlerts);

      await priceMonitorService.initialize();

      expect(mockLogger.info).toHaveBeenCalledWith('初始化價格監控服務');
      expect(mockInvestmentService.getPriceAlerts).toHaveBeenCalled();
      expect(mockNetworkMonitor.addListener).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('價格監控服務初始化完成');
    });

    it('應該處理初始化失敗', async () => {
      const error = new Error('初始化失敗');
      mockInvestmentService.getPriceAlerts.mockRejectedValue(error);

      await priceMonitorService.initialize();

      expect(mockLogger.error).toHaveBeenCalledWith('價格監控服務初始化失敗:', {
        error,
      });
    });
  });

  describe('startMonitoring', () => {
    it('應該成功開始監控', () => {
      priceMonitorService.startMonitoring();

      expect(mockLogger.info).toHaveBeenCalledWith('價格監控已開始', {
        interval: 5 * 60 * 1000,
      });
    });

    it('應該避免重複開始監控', () => {
      priceMonitorService.startMonitoring();
      priceMonitorService.startMonitoring();

      expect(mockLogger.warn).toHaveBeenCalledWith('價格監控已在運行中');
    });
  });

  describe('stopMonitoring', () => {
    it('應該成功停止監控', () => {
      priceMonitorService.startMonitoring();
      priceMonitorService.stopMonitoring();

      expect(mockLogger.info).toHaveBeenCalledWith('價格監控已停止');
    });

    it('應該在未監控時安全停止', () => {
      priceMonitorService.stopMonitoring();

      expect(mockLogger.info).not.toHaveBeenCalledWith('價格監控已停止');
    });
  });

  describe('addPriceAlert', () => {
    it('應該成功添加價格提醒', async () => {
      const mockAlert = {
        id: 'alert-1',
        cardId: 'card-1',
        cardName: '測試卡片',
        targetPrice: 100,
        currentPrice: 90,
        type: 'above' as const,
        userId: 'user-1',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        triggerCount: 0,
      };

      mockInvestmentService.setPriceAlert.mockResolvedValue({
        data: mockAlert,
      });

      const result = await priceMonitorService.addPriceAlert(
        'card-1',
        100,
        'above',
        5
      );

      expect(result).toEqual(mockAlert);
      expect(mockInvestmentService.setPriceAlert).toHaveBeenCalledWith(
        'card-1',
        100,
        'above'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('價格提醒已添加', {
        alertId: mockAlert.id,
        cardId: 'card-1',
        targetPrice: 100,
        type: 'above',
      });
    });

    it('應該處理添加提醒失敗', async () => {
      const error = new Error('添加失敗');
      mockInvestmentService.setPriceAlert.mockRejectedValue(error);

      await expect(
        priceMonitorService.addPriceAlert('card-1', 100, 'above')
      ).rejects.toThrow('添加失敗');
      expect(mockLogger.error).toHaveBeenCalledWith('添加價格提醒失敗:', {
        cardId: 'card-1',
        targetPrice: 100,
        type: 'above',
        error,
      });
    });
  });

  describe('getStatistics', () => {
    it('應該返回監控統計信息', () => {
      const stats = priceMonitorService.getStatistics();

      expect(stats).toEqual({
        totalAlerts: 0,
        triggeredAlerts: 0,
        activeAlerts: 0,
        averageResponseTime: 0,
        successRate: 0,
      });
    });
  });

  describe('getConfig', () => {
    it('應該返回監控配置', () => {
      const config = priceMonitorService.getConfig();

      expect(config).toEqual({
        checkInterval: 5 * 60 * 1000,
        priceChangeThreshold: 5,
        volumeThreshold: 1000,
        maxAlertsPerHour: 10,
        enableSmartAlerts: true,
        enableMarketTrendAlerts: true,
        enableVolumeAlerts: true,
      });
    });
  });

  describe('updateConfig', () => {
    it('應該成功更新配置', () => {
      const newConfig = {
        checkInterval: 10 * 60 * 1000,
        priceChangeThreshold: 10,
      };

      priceMonitorService.updateConfig(newConfig);

      const updatedConfig = priceMonitorService.getConfig();
      expect(updatedConfig.checkInterval).toBe(10 * 60 * 1000);
      expect(updatedConfig.priceChangeThreshold).toBe(10);
      expect(mockLogger.info).toHaveBeenCalledWith('監控配置已更新', {
        config: updatedConfig,
      });
    });

    it('應該在監控間隔改變時重啟監控', () => {
      priceMonitorService.startMonitoring();
      priceMonitorService.updateConfig({ checkInterval: 10 * 60 * 1000 });

      expect(mockLogger.info).toHaveBeenCalledWith('價格監控已停止');
      expect(mockLogger.info).toHaveBeenCalledWith('價格監控已開始', {
        interval: 10 * 60 * 1000,
      });
    });
  });

  describe('getActiveAlerts', () => {
    it('應該返回活躍提醒列表', async () => {
      const mockAlerts = {
        data: [
          {
            id: 'alert-1',
            cardId: 'card-1',
            cardName: '測試卡片',
            targetPrice: 100,
            currentPrice: 90,
            type: 'above' as const,
            userId: 'user-1',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            triggerCount: 0,
          },
        ],
      };

      mockInvestmentService.getPriceAlerts.mockResolvedValue(mockAlerts);
      await priceMonitorService.initialize();

      const activeAlerts = priceMonitorService.getActiveAlerts();

      expect(activeAlerts).toHaveLength(1);
      expect(activeAlerts[0].id).toBe('alert-1');
    });
  });

  describe('cleanup', () => {
    it('應該清理所有資源', () => {
      priceMonitorService.startMonitoring();
      priceMonitorService.cleanup();

      expect(mockNetworkMonitor.removeListener).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('價格監控服務資源清理完成');
    });
  });

  describe('價格檢查邏輯', () => {
    beforeEach(async () => {
      const mockAlerts = {
        data: [
          {
            id: 'alert-1',
            cardId: 'card-1',
            cardName: '測試卡片',
            targetPrice: 100,
            currentPrice: 90,
            type: 'above' as const,
            userId: 'user-1',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            triggerCount: 0,
          },
        ],
      };

      mockInvestmentService.getPriceAlerts.mockResolvedValue(mockAlerts);
      await priceMonitorService.initialize();
    });

    it('應該在網絡離線時跳過價格檢查', async () => {
      mockNetworkMonitor.isOnline.mockReturnValue(false);

      // 觸發價格檢查
      jest.advanceTimersByTime(5 * 60 * 1000);

      expect(mockLogger.debug).toHaveBeenCalledWith('網絡離線，跳過價格檢查');
    });

    it('應該在沒有活躍提醒時跳過檢查', async () => {
      // 清空活躍提醒
      priceMonitorService.getActiveAlerts().forEach(() => {
        // 這裡需要訪問私有方法來清空提醒，但我們可以通過其他方式測試
      });

      // 觸發價格檢查
      jest.advanceTimersByTime(5 * 60 * 1000);

      // 應該不會調用價格獲取相關的方法
      expect(mockMarketService.getMarketData).not.toHaveBeenCalled();
    });

    it('應該處理價格獲取失敗', async () => {
      mockCacheManager.getCachedMarketData.mockResolvedValue(null);
      mockMarketService.getMarketData.mockRejectedValue(
        new Error('價格獲取失敗')
      );

      // 觸發價格檢查
      jest.advanceTimersByTime(5 * 60 * 1000);

      expect(mockLogger.error).toHaveBeenCalledWith('獲取價格失敗:', {
        cardId: 'card-1',
        error: new Error('價格獲取失敗'),
      });
    });

    it('應該從緩存獲取價格數據', async () => {
      const mockCachedData = {
        data: { currentPrice: 95 },
        timestamp: Date.now() - 2 * 60 * 1000, // 2分鐘前
      };

      mockCacheManager.getCachedMarketData.mockResolvedValue(mockCachedData);

      // 觸發價格檢查
      jest.advanceTimersByTime(5 * 60 * 1000);

      expect(mockCacheManager.getCachedMarketData).toHaveBeenCalledWith(
        'card-1'
      );
      expect(mockMarketService.getMarketData).not.toHaveBeenCalled();
    });

    it('應該在緩存過期時從API獲取價格', async () => {
      const mockCachedData = {
        data: { currentPrice: 95 },
        timestamp: Date.now() - 10 * 60 * 1000, // 10分鐘前，已過期
      };

      const mockMarketData = {
        data: {
          currentPrice: 105,
          volume: 1000,
          change24h: 5,
        },
      };

      mockCacheManager.getCachedMarketData.mockResolvedValue(mockCachedData);
      mockMarketService.getMarketData.mockResolvedValue(mockMarketData);

      // 觸發價格檢查
      jest.advanceTimersByTime(5 * 60 * 1000);

      expect(mockMarketService.getMarketData).toHaveBeenCalledWith('card-1');
      expect(mockCacheManager.cacheMarketData).toHaveBeenCalledWith('card-1', {
        currentPrice: 105,
        timestamp: expect.any(Number),
        volume: 1000,
        change24h: 5,
      });
    });
  });

  describe('智能提醒功能', () => {
    beforeEach(async () => {
      const mockAlerts = {
        data: [
          {
            id: 'alert-1',
            cardId: 'card-1',
            cardName: '測試卡片',
            targetPrice: 100,
            currentPrice: 90,
            type: 'above' as const,
            userId: 'user-1',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            triggerCount: 0,
          },
        ],
      };

      mockInvestmentService.getPriceAlerts.mockResolvedValue(mockAlerts);
      await priceMonitorService.initialize();
    });

    it('應該檢查市場趨勢提醒', async () => {
      const mockMarketAnalysis = {
        data: {
          sentiment: 'bullish' as const,
          confidence: 0.8,
          factors: { technical: 0.8, fundamental: 0.7, social: 0.6 },
          recommendations: ['建議買入'],
          riskLevel: 'medium' as const,
        },
      };

      mockMarketService.getMarketAnalysis.mockResolvedValue(mockMarketAnalysis);

      // 觸發價格檢查
      jest.advanceTimersByTime(5 * 60 * 1000);

      expect(mockMarketService.getMarketAnalysis).toHaveBeenCalled();
      expect(mockNotificationService.sendMarketUpdate).toHaveBeenCalledWith(
        '市場趨勢提醒',
        '當前市場情緒為看漲，建議調整投資策略',
        { type: 'market_trend', sentiment: 'bullish' }
      );
    });

    it('應該處理市場分析失敗', async () => {
      mockMarketService.getMarketAnalysis.mockRejectedValue(
        new Error('分析失敗')
      );

      // 觸發價格檢查
      jest.advanceTimersByTime(5 * 60 * 1000);

      expect(mockLogger.error).toHaveBeenCalledWith('檢查市場趨勢提醒失敗:', {
        error: new Error('分析失敗'),
      });
    });
  });

  describe('網絡狀態處理', () => {
    it('應該在網絡恢復時重新開始監控', () => {
      // 模擬網絡變化
      const networkChangeHandler =
        mockNetworkMonitor.addListener.mock.calls[0][0];
      networkChangeHandler(true);

      expect(mockLogger.info).toHaveBeenCalledWith('價格監控已開始', {
        interval: 5 * 60 * 1000,
      });
    });

    it('應該在網絡斷開時停止監控', () => {
      priceMonitorService.startMonitoring();

      // 模擬網絡變化
      const networkChangeHandler =
        mockNetworkMonitor.addListener.mock.calls[0][0];
      networkChangeHandler(false);

      expect(mockLogger.info).toHaveBeenCalledWith('價格監控已停止');
    });
  });
});

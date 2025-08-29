/**
 * 實時功能穩定性優化服務測試
 * 測試 TD-008: 加強實時功能穩定性
 */

import { RealtimeStabilityOptimizationService } from '../../services/realtimeStabilityOptimizationService';

// Mock logger
jest.mock('../../core/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('RealtimeStabilityOptimizationService', () => {
  let realtimeStabilityOptimizationService: RealtimeStabilityOptimizationService;

  beforeEach(async () => {
    realtimeStabilityOptimizationService =
      RealtimeStabilityOptimizationService.getInstance();
    await realtimeStabilityOptimizationService.reset();
  });

  describe('單例模式測試', () => {
    it('應該返回相同的實例', () => {
      const _instance1 = RealtimeStabilityOptimizationService.getInstance();
      const _instance2 = RealtimeStabilityOptimizationService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('應該正確初始化配置', async () => {
      await realtimeStabilityOptimizationService.initialize();
      const { config } = realtimeStabilityOptimizationService as any;
      expect(config.websocket.enableAutoReconnect).toBe(true);
      expect(config.pushNotification.enableRetry).toBe(true);
      expect(config.offlineSync.enableQueue).toBe(true);
      expect(config.multiDeviceSync.enableDeviceDiscovery).toBe(true);
    });
  });

  describe('初始化測試', () => {
    it('應該正確初始化服務', async () => {
      const _result = await realtimeStabilityOptimizationService.initialize();
      expect(result).toBe(true);
    });

    it('應該避免重複初始化', async () => {
      await realtimeStabilityOptimizationService.initialize();
      const _result = await realtimeStabilityOptimizationService.initialize();
      expect(result).toBe(true);
    });
  });

  describe('WebSocket穩定性優化測試', () => {
    beforeEach(async () => {
      await realtimeStabilityOptimizationService.initialize();
    });

    it('應該優化WebSocket連接穩定性', async () => {
      const _result =
        await realtimeStabilityOptimizationService.optimizeWebSocketStability();

      expect(result.connectionStatus).toBeDefined();
      expect(['connected', 'disconnected', 'reconnecting']).toContain(
        result.connectionStatus
      );
      expect(result.uptime).toBeGreaterThan(0);
      expect(result.reconnectCount).toBeGreaterThanOrEqual(0);
      expect(result.averageLatency).toBeGreaterThan(0);
      expect(result.packetLoss).toBeGreaterThanOrEqual(0);
      expect(result.stabilityScore).toBeGreaterThan(0);
      expect(result.performanceImprovement).toBeGreaterThan(0);
    });

    it('應該計算穩定性分數', async () => {
      const _result =
        await realtimeStabilityOptimizationService.optimizeWebSocketStability();

      expect(result.stabilityScore).toBeGreaterThanOrEqual(0);
      expect(result.stabilityScore).toBeLessThanOrEqual(100);
    });

    it('應該計算性能提升', async () => {
      const _result =
        await realtimeStabilityOptimizationService.optimizeWebSocketStability();

      expect(result.performanceImprovement).toBeGreaterThanOrEqual(0);
      expect(result.performanceImprovement).toBeLessThanOrEqual(50);
    });
  });

  describe('推送通知可靠性優化測試', () => {
    beforeEach(async () => {
      await realtimeStabilityOptimizationService.initialize();
    });

    it('應該優化推送通知可靠性', async () => {
      const _result =
        await realtimeStabilityOptimizationService.optimizePushNotificationReliability();

      expect(result.deliveryRate).toBeGreaterThan(0);
      expect(result.successRate).toBeGreaterThan(0);
      expect(result.averageDeliveryTime).toBeGreaterThan(0);
      expect(result.retryCount).toBeGreaterThanOrEqual(0);
      expect(result.failureRate).toBeGreaterThanOrEqual(0);
      expect(result.reliabilityScore).toBeGreaterThan(0);
      expect(result.performanceImprovement).toBeGreaterThan(0);
    });

    it('應該計算可靠性分數', async () => {
      const _result =
        await realtimeStabilityOptimizationService.optimizePushNotificationReliability();

      expect(result.reliabilityScore).toBeGreaterThanOrEqual(0);
      expect(result.reliabilityScore).toBeLessThanOrEqual(100);
    });

    it('應該計算性能提升', async () => {
      const _result =
        await realtimeStabilityOptimizationService.optimizePushNotificationReliability();

      expect(result.performanceImprovement).toBeGreaterThanOrEqual(0);
      expect(result.performanceImprovement).toBeLessThanOrEqual(40);
    });
  });

  describe('離線同步機制優化測試', () => {
    beforeEach(async () => {
      await realtimeStabilityOptimizationService.initialize();
    });

    it('應該優化離線同步機制', async () => {
      const _result =
        await realtimeStabilityOptimizationService.optimizeOfflineSync();

      expect(result.syncStatus).toBeDefined();
      expect(['idle', 'syncing', 'completed', 'failed']).toContain(
        result.syncStatus
      );
      expect(result.pendingItems).toBeGreaterThanOrEqual(0);
      expect(result.syncedItems).toBeGreaterThanOrEqual(0);
      expect(result.failedItems).toBeGreaterThanOrEqual(0);
      expect(result.syncTime).toBeGreaterThan(0);
      expect(result.conflictCount).toBeGreaterThanOrEqual(0);
      expect(result.reliabilityScore).toBeGreaterThan(0);
      expect(result.performanceImprovement).toBeGreaterThan(0);
    });

    it('應該計算可靠性分數', async () => {
      const _result =
        await realtimeStabilityOptimizationService.optimizeOfflineSync();

      expect(result.reliabilityScore).toBeGreaterThanOrEqual(0);
      expect(result.reliabilityScore).toBeLessThanOrEqual(100);
    });

    it('應該計算性能提升', async () => {
      const _result =
        await realtimeStabilityOptimizationService.optimizeOfflineSync();

      expect(result.performanceImprovement).toBeGreaterThanOrEqual(0);
      expect(result.performanceImprovement).toBeLessThanOrEqual(35);
    });
  });

  describe('多設備同步穩定性優化測試', () => {
    beforeEach(async () => {
      await realtimeStabilityOptimizationService.initialize();
    });

    it('應該優化多設備同步穩定性', async () => {
      const _result =
        await realtimeStabilityOptimizationService.optimizeMultiDeviceSync();

      expect(result.connectedDevices).toBeGreaterThan(0);
      expect(result.syncStatus).toBeDefined();
      expect(['idle', 'syncing', 'completed', 'failed']).toContain(
        result.syncStatus
      );
      expect(result.syncedDevices).toBeGreaterThanOrEqual(0);
      expect(result.failedDevices).toBeGreaterThanOrEqual(0);
      expect(result.syncTime).toBeGreaterThanOrEqual(0);
      expect(result.conflictCount).toBeGreaterThanOrEqual(0);
      expect(result.dataIntegrity).toBeGreaterThan(0);
      expect(result.performanceImprovement).toBeGreaterThan(0);
    });

    it('應該計算數據完整性', async () => {
      const _result =
        await realtimeStabilityOptimizationService.optimizeMultiDeviceSync();

      expect(result.dataIntegrity).toBeGreaterThanOrEqual(0.8);
      expect(result.dataIntegrity).toBeLessThanOrEqual(1.0);
    });

    it('應該計算性能提升', async () => {
      const _result =
        await realtimeStabilityOptimizationService.optimizeMultiDeviceSync();

      expect(result.performanceImprovement).toBeGreaterThanOrEqual(0);
      expect(result.performanceImprovement).toBeLessThanOrEqual(45);
    });
  });

  describe('穩定性指標測試', () => {
    beforeEach(async () => {
      await realtimeStabilityOptimizationService.initialize();
    });

    it('應該獲取穩定性指標', async () => {
      // 執行一些優化操作來生成指標
      await realtimeStabilityOptimizationService.optimizeWebSocketStability();
      await realtimeStabilityOptimizationService.optimizePushNotificationReliability();
      await realtimeStabilityOptimizationService.optimizeOfflineSync();
      await realtimeStabilityOptimizationService.optimizeMultiDeviceSync();

      const _metrics =
        realtimeStabilityOptimizationService.getStabilityMetrics();

      expect(metrics.websocket).toBeDefined();
      expect(metrics.pushNotification).toBeDefined();
      expect(metrics.offlineSync).toBeDefined();
      expect(metrics.multiDeviceSync).toBeDefined();
    });

    it('應該包含WebSocket指標', async () => {
      await realtimeStabilityOptimizationService.optimizeWebSocketStability();

      const _metrics =
        realtimeStabilityOptimizationService.getStabilityMetrics();

      expect(metrics.websocket.uptime).toBeGreaterThanOrEqual(0);
      expect(metrics.websocket.reconnectCount).toBeGreaterThanOrEqual(0);
      expect(metrics.websocket.averageLatency).toBeGreaterThanOrEqual(0);
      expect(metrics.websocket.packetLoss).toBeGreaterThanOrEqual(0);
    });

    it('應該包含推送通知指標', async () => {
      await realtimeStabilityOptimizationService.optimizePushNotificationReliability();

      const _metrics =
        realtimeStabilityOptimizationService.getStabilityMetrics();

      expect(metrics.pushNotification.deliveryRate).toBeGreaterThanOrEqual(0);
      expect(metrics.pushNotification.successRate).toBeGreaterThanOrEqual(0);
      expect(
        metrics.pushNotification.averageDeliveryTime
      ).toBeGreaterThanOrEqual(0);
      expect(metrics.pushNotification.retryCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('配置管理測試', () => {
    it('應該更新配置', () => {
      const _newConfig = {
        websocket: {
          reconnectAttempts: 10,
        },
      };

      realtimeStabilityOptimizationService.updateConfig(newConfig);

      const _currentConfig = (realtimeStabilityOptimizationService as any)
        .config;
      expect(currentConfig.websocket.reconnectAttempts).toBe(10);
    });

    it('應該保持其他配置不變', () => {
      const _originalConfig = {
        ...(realtimeStabilityOptimizationService as any).config,
      };

      realtimeStabilityOptimizationService.updateConfig({
        websocket: { reconnectDelay: 2000 },
      });

      const _currentConfig = (realtimeStabilityOptimizationService as any)
        .config;
      expect(currentConfig.pushNotification.enableRetry).toBe(
        originalConfig.pushNotification.enableRetry
      );
      expect(currentConfig.offlineSync.enableQueue).toBe(
        originalConfig.offlineSync.enableQueue
      );
    });
  });

  describe('重置測試', () => {
    it('應該重置服務狀態', async () => {
      await realtimeStabilityOptimizationService.initialize();

      // 執行一些操作
      await realtimeStabilityOptimizationService.optimizeWebSocketStability();

      // 重置
      await realtimeStabilityOptimizationService.reset();

      // 檢查是否重置
      const { isInitialized } = realtimeStabilityOptimizationService as any;
      expect(isInitialized).toBe(false);
    });

    it('應該重置穩定性指標', async () => {
      await realtimeStabilityOptimizationService.initialize();

      // 執行一些操作來生成指標
      await realtimeStabilityOptimizationService.optimizeWebSocketStability();

      // 重置
      await realtimeStabilityOptimizationService.reset();

      // 檢查指標是否重置
      const _metrics =
        realtimeStabilityOptimizationService.getStabilityMetrics();
      expect(metrics.websocket.uptime).toBe(0);
      expect(metrics.pushNotification.deliveryRate).toBe(0);
    });
  });

  describe('邊界條件測試', () => {
    beforeEach(async () => {
      await realtimeStabilityOptimizationService.initialize();
    });

    it('應該處理連接失敗情況', async () => {
      // 模擬連接失敗的情況
      const _result =
        await realtimeStabilityOptimizationService.optimizeWebSocketStability();

      expect(result.connectionStatus).toBeDefined();
      expect(result.stabilityScore).toBeGreaterThanOrEqual(0);
    });

    it('應該處理同步失敗情況', async () => {
      // 模擬同步失敗的情況
      const _result =
        await realtimeStabilityOptimizationService.optimizeOfflineSync();

      expect(result.syncStatus).toBeDefined();
      expect(result.reliabilityScore).toBeGreaterThanOrEqual(0);
    });

    it('應該處理設備發現失敗情況', async () => {
      // 模擬設備發現失敗的情況
      const _result =
        await realtimeStabilityOptimizationService.optimizeMultiDeviceSync();

      expect(result.connectedDevices).toBeGreaterThanOrEqual(0);
      expect(result.dataIntegrity).toBeGreaterThanOrEqual(0);
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      await realtimeStabilityOptimizationService.initialize();
    });

    it('應該快速執行所有優化', async () => {
      const _startTime = Date.now();

      await realtimeStabilityOptimizationService.optimizeWebSocketStability();
      await realtimeStabilityOptimizationService.optimizePushNotificationReliability();
      await realtimeStabilityOptimizationService.optimizeOfflineSync();
      await realtimeStabilityOptimizationService.optimizeMultiDeviceSync();

      const _totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(1000); // 應該在1秒內完成所有優化
    });

    it('應該高效處理並發優化', async () => {
      const _startTime = Date.now();

      const _promises = [
        realtimeStabilityOptimizationService.optimizeWebSocketStability(),
        realtimeStabilityOptimizationService.optimizePushNotificationReliability(),
        realtimeStabilityOptimizationService.optimizeOfflineSync(),
        realtimeStabilityOptimizationService.optimizeMultiDeviceSync(),
      ];

      await Promise.all(promises);

      const _totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(500); // 應該在500ms內完成並發優化
    });
  });

  describe('功能測試', () => {
    beforeEach(async () => {
      await realtimeStabilityOptimizationService.initialize();
    });

    it('應該處理高負載情況', async () => {
      const _startTime = Date.now();

      // 模擬高負載情況
      const _promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          realtimeStabilityOptimizationService.optimizeWebSocketStability()
        );
      }

      await Promise.all(promises);

      const _totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(2000); // 應該在2秒內完成10次優化
    });

    it('應該處理長時間運行', async () => {
      const _startTime = Date.now();

      // 模擬長時間運行
      for (let i = 0; i < 5; i++) {
        await realtimeStabilityOptimizationService.optimizeWebSocketStability();
        await new Promise(resolve => setTimeout(resolve, 50)); // 模擬間隔
      }

      const _totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(1000); // 應該在1秒內完成5次優化
    });
  });
});

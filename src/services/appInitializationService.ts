import { logger } from '@/utils/logger';
import { notificationService } from './notificationService';
import { priceMonitorService } from './priceMonitorService';
import { smartNotificationService } from './smartNotificationService';
import { networkMonitor } from '@/utils/networkMonitor';
import { cacheManager } from '@/utils/cacheManager';
import { offlineSyncManager } from '@/utils/offlineSyncManager';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

export interface InitializationStatus {
  notifications: boolean;
  priceMonitoring: boolean;
  smartNotifications: boolean;
  networkMonitoring: boolean;
  caching: boolean;
  offlineSync: boolean;
}

class AppInitializationService {
  private initializationStatus: InitializationStatus = {
    notifications: false,
    priceMonitoring: false,
    smartNotifications: false,
    networkMonitoring: false,
    caching: false,
    offlineSync: false
  };

  private isInitialized = false;

  // 初始化所有服務
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('應用已經初始化過');
      return;
    }

    try {
      logger.info('開始初始化應用服務');

      // 並行初始化所有服務
      const initPromises = [
        this.initializeNotifications(),
        this.initializePriceMonitoring(),
        this.initializeSmartNotifications(),
        this.initializeNetworkMonitoring(),
        this.initializeCaching(),
        this.initializeOfflineSync()
      ];

      await Promise.allSettled(initPromises);

      this.isInitialized = true;
      logger.info('應用服務初始化完成', { status: this.initializationStatus });
    } catch (error) {
      logger.error('應用服務初始化失敗:', { error });
      throw error;
    }
  }

  // 初始化通知服務
  private async initializeNotifications(): Promise<void> {
    try {
      await notificationService.initialize();
      this.initializationStatus.notifications = true;
      logger.info('通知服務初始化成功');
    } catch (error) {
      logger.error('通知服務初始化失敗:', { error });
    }
  }

  // 初始化價格監控服務
  private async initializePriceMonitoring(): Promise<void> {
    try {
      await priceMonitorService.initialize();
      this.initializationStatus.priceMonitoring = true;
      logger.info('價格監控服務初始化成功');
    } catch (error) {
      logger.error('價格監控服務初始化失敗:', { error });
    }
  }

  // 初始化智能通知服務
  private async initializeSmartNotifications(): Promise<void> {
    try {
      await smartNotificationService.initialize();
      this.initializationStatus.smartNotifications = true;
      logger.info('智能通知服務初始化成功');
    } catch (error) {
      logger.error('智能通知服務初始化失敗:', { error });
    }
  }

  // 初始化網絡監控
  private async initializeNetworkMonitoring(): Promise<void> {
    try {
      // 網絡監控服務已經在網絡監控模塊中自動啟動
      this.initializationStatus.networkMonitoring = true;
      logger.info('網絡監控初始化成功');
    } catch (error) {
      logger.error('網絡監控初始化失敗:', { error });
    }
  }

  // 初始化緩存系統
  private async initializeCaching(): Promise<void> {
    try {
      // 清理過期緩存
      await cacheManager.cleanupExpiredCache();
      this.initializationStatus.caching = true;
      logger.info('緩存系統初始化成功');
    } catch (error) {
      logger.error('緩存系統初始化失敗:', { error });
    }
  }

  // 初始化離線同步
  private async initializeOfflineSync(): Promise<void> {
    try {
      // 離線同步服務已經在離線同步模塊中自動啟動
      this.initializationStatus.offlineSync = true;
      logger.info('離線同步初始化成功');
    } catch (error) {
      logger.error('離線同步初始化失敗:', { error });
    }
  }

  // 獲取初始化狀態
  getInitializationStatus(): InitializationStatus {
    return { ...this.initializationStatus };
  }

  // 檢查是否已初始化
  isAppInitialized(): boolean {
    return this.isInitialized;
  }

  // 重新初始化特定服務
  async reinitializeService(serviceName: keyof InitializationStatus): Promise<void> {
    try {
      logger.info(`重新初始化服務: ${serviceName}`);

      switch (serviceName) {
        case 'notifications':
          await this.initializeNotifications();
          break;
        case 'priceMonitoring':
          await this.initializePriceMonitoring();
          break;
        case 'smartNotifications':
          await this.initializeSmartNotifications();
          break;
        case 'networkMonitoring':
          await this.initializeNetworkMonitoring();
          break;
        case 'caching':
          await this.initializeCaching();
          break;
        case 'offlineSync':
          await this.initializeOfflineSync();
          break;
      }

      logger.info(`服務重新初始化成功: ${serviceName}`);
    } catch (error) {
      logger.error(`服務重新初始化失敗: ${serviceName}`, { error });
      throw error;
    }
  }

  // 清理所有服務
  async cleanup(): Promise<void> {
    try {
      logger.info('開始清理應用服務');

      // 清理各個服務
      notificationService.cleanup();
      priceMonitorService.cleanup();
      smartNotificationService.cleanup();
      offlineSyncManager.cleanup();

      // 重置狀態
      this.initializationStatus = {
        notifications: false,
        priceMonitoring: false,
        smartNotifications: false,
        networkMonitoring: false,
        caching: false,
        offlineSync: false
      };

      this.isInitialized = false;

      logger.info('應用服務清理完成');
    } catch (error) {
      logger.error('應用服務清理失敗:', { error });
    }
  }

  // 獲取服務健康狀態
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, { status: 'up' | 'down'; message?: string }>;
  }> {
    const services: Record<string, { status: 'up' | 'down'; message?: string }> = {};

    // 檢查通知服務
    try {
      const notificationStatus = await notificationService.getPermissionStatus();
      services.notifications = {
        status: notificationStatus.granted ? 'up' : 'down',
        message: notificationStatus.granted ? undefined : '通知權限未授予'
      };
    } catch (error) {
      services.notifications = { status: 'down', message: '通知服務檢查失敗' };
    }

    // 檢查價格監控服務
    try {
      const priceMonitorStats = priceMonitorService.getStatistics();
      services.priceMonitoring = {
        status: priceMonitorStats.activeAlerts >= 0 ? 'up' : 'down',
        message: `活躍提醒: ${priceMonitorStats.activeAlerts}`
      };
    } catch (error) {
      services.priceMonitoring = { status: 'down', message: '價格監控服務檢查失敗' };
    }

    // 檢查網絡狀態
    services.network = {
      status: networkMonitor.isOnline() ? 'up' : 'down',
      message: networkMonitor.isOnline() ? '網絡連接正常' : '網絡離線'
    };

    // 檢查緩存狀態
    try {
      const cacheStats = await cacheManager.getCacheStats();
      services.caching = {
        status: 'up',
        message: `緩存項目: ${cacheStats.totalItems}`
      };
    } catch (error) {
      services.caching = { status: 'down', message: '緩存服務檢查失敗' };
    }

    // 檢查離線同步狀態
    try {
      const syncStatus = await offlineSyncManager.getSyncStatus();
      services.offlineSync = {
        status: syncStatus.isOnline ? 'up' : 'down',
        message: `待同步操作: ${syncStatus.pendingOperations}`
      };
    } catch (error) {
      services.offlineSync = { status: 'down', message: '離線同步服務檢查失敗' };
    }

    // 計算整體健康狀態
    const upServices = Object.values(services).filter(s => s.status === 'up').length;
    const totalServices = Object.keys(services).length;
    const healthPercentage = upServices / totalServices;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthPercentage >= 0.8) {
      status = 'healthy';
    } else if (healthPercentage >= 0.5) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return { status, services };
  }
}

export const appInitializationService = new AppInitializationService();

import { apiService } from './apiService';
import { logger } from '@/utils/logger';
import { mobileOptimizer } from '@/utils/mobileOptimizer';

// 移動端數據接口
export interface OfflineData {
  cards: any[];
  portfolio: any[];
  market: any[];
  lastSyncTime: Date;
  dataVersion: string;
}

export interface OfflineChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: Date;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: Date;
  pendingChanges: number;
  syncProgress: number;
  errorCount: number;
}

export interface PushToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId: string;
  isActive: boolean;
}

export interface NotificationSettings {
  priceAlerts: boolean;
  marketUpdates: boolean;
  portfolioChanges: boolean;
  systemNotifications: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export interface DeviceInfo {
  id: string;
  name: string;
  platform: string;
  version: string;
  capabilities: string[];
  lastSeen: Date;
  isActive: boolean;
}

export interface MobileEvent {
  eventType: string;
  eventData: any;
  deviceInfo: any;
  timestamp: Date;
}

export interface MobileAnalyticsReport {
  usage: {
    sessionCount: number;
    totalTime: number;
    averageSessionTime: number;
    mostUsedFeatures: string[];
  };
  performance: {
    averageLoadTime: number;
    crashRate: number;
    memoryUsage: number;
    batteryImpact: number;
  };
  engagement: {
    dailyActiveUsers: number;
    retentionRate: number;
    featureAdoption: string[];
  };
}

export interface MobileConfig {
  offlineMode: {
    enabled: boolean;
    maxStorageSize: number;
    syncInterval: number;
  };
  performance: {
    imageOptimization: boolean;
    lazyLoading: boolean;
    caching: boolean;
  };
  features: {
    biometricAuth: boolean;
    voiceCommands: boolean;
    arFeatures: boolean;
    pushNotifications: boolean;
  };
}

export interface OptimizationSuggestion {
  type: 'performance' | 'battery' | 'storage' | 'network';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  impact: number;
  action: string;
}

export interface BiometricAuth {
  type: 'fingerprint' | 'face' | 'voice';
  isEnabled: boolean;
  deviceId: string;
  lastUsed: Date;
}

export interface VoiceCommand {
  command: string;
  action: string;
  description: string;
  language: string;
}

export interface ARCardData {
  cardId: string;
  modelUrl: string;
  textureUrl: string;
  animations: string[];
  interactions: any[];
}

export interface ARScanResult {
  success: boolean;
  cardId?: string;
  confidence: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  metadata: any;
}

export interface MobileHealth {
  status: 'healthy' | 'warning' | 'error';
  checks: {
    network: boolean;
    storage: boolean;
    performance: boolean;
    battery: boolean;
  };
  recommendations: string[];
}

export interface MobileMetrics {
  performance: {
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
  };
  usage: {
    sessionCount: number;
    activeTime: number;
    featureUsage: Record<string, number>;
  };
  errors: {
    count: number;
    types: Record<string, number>;
  };
}

// 移動端服務類
class MobileService {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();

  // ==================== 離線同步 ====================

  // 獲取離線數據
  async getOfflineData(
    options: {
      lastSyncTime?: Date;
      dataTypes?: string[];
    } = {}
  ): Promise<OfflineData> {
    const cacheKey = `offline_data:${JSON.stringify(options)}`;

    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams();
      if (options.lastSyncTime)
        params.append('lastSyncTime', options.lastSyncTime.toISOString());
      if (options.dataTypes?.length)
        params.append('dataTypes', options.dataTypes.join(','));

      const response = await apiService.get(`/mobile/offline/data?${params}`);

      this.setCachedData(cacheKey, response.data, 300); // 5分鐘緩存
      return response.data;
    } catch (error) {
      logger.error('獲取離線數據失敗:', error);
      throw new Error('獲取離線數據失敗');
    }
  }

  // 提交離線變更
  async submitOfflineChanges(
    changes: OfflineChange[],
    syncId: string
  ): Promise<any> {
    try {
      const response = await apiService.post('/mobile/offline/changes', {
        changes,
        syncId,
      });
      return response.data;
    } catch (error) {
      logger.error('提交離線變更失敗:', error);
      throw new Error('提交離線變更失敗');
    }
  }

  // 獲取同步狀態
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const response = await apiService.get('/mobile/offline/sync-status');
      return response.data;
    } catch (error) {
      logger.error('獲取同步狀態失敗:', error);
      throw new Error('獲取同步狀態失敗');
    }
  }

  // ==================== 推送通知 ====================

  // 註冊推送令牌
  async registerPushToken(
    token: string,
    platform: string,
    deviceId: string
  ): Promise<any> {
    try {
      const response = await apiService.post('/mobile/push/register', {
        token,
        platform,
        deviceId,
      });
      return response.data;
    } catch (error) {
      logger.error('註冊推送令牌失敗:', error);
      throw new Error('註冊推送令牌失敗');
    }
  }

  // 發送推送通知
  async sendPushNotification(options: {
    title: string;
    body: string;
    data?: any;
    targetUsers?: string[];
    notificationType?: string;
  }): Promise<any> {
    try {
      const response = await apiService.post('/mobile/push/send', options);
      return response.data;
    } catch (error) {
      logger.error('發送推送通知失敗:', error);
      throw new Error('發送推送通知失敗');
    }
  }

  // 獲取通知設置
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const response = await apiService.get('/mobile/push/settings');
      return response.data;
    } catch (error) {
      logger.error('獲取通知設置失敗:', error);
      throw new Error('獲取通知設置失敗');
    }
  }

  // 更新通知設置
  async updateNotificationSettings(
    settings: Partial<NotificationSettings>
  ): Promise<any> {
    try {
      const response = await apiService.put('/mobile/push/settings', {
        settings,
      });
      return response.data;
    } catch (error) {
      logger.error('更新通知設置失敗:', error);
      throw new Error('更新通知設置失敗');
    }
  }

  // ==================== 設備管理 ====================

  // 註冊設備
  async registerDevice(deviceInfo: any, capabilities: string[]): Promise<any> {
    try {
      const response = await apiService.post('/mobile/device/register', {
        deviceInfo,
        capabilities,
      });
      return response.data;
    } catch (error) {
      logger.error('註冊設備失敗:', error);
      throw new Error('註冊設備失敗');
    }
  }

  // 獲取用戶設備列表
  async getUserDevices(): Promise<DeviceInfo[]> {
    try {
      const response = await apiService.get('/mobile/device/list');
      return response.data;
    } catch (error) {
      logger.error('獲取設備列表失敗:', error);
      throw new Error('獲取設備列表失敗');
    }
  }

  // 註銷設備
  async unregisterDevice(deviceId: string): Promise<any> {
    try {
      const response = await apiService.delete(`/mobile/device/${deviceId}`);
      return response.data;
    } catch (error) {
      logger.error('註銷設備失敗:', error);
      throw new Error('註銷設備失敗');
    }
  }

  // ==================== 移動端分析 ====================

  // 記錄移動端事件
  async recordMobileEvent(event: MobileEvent): Promise<any> {
    try {
      const response = await apiService.post('/mobile/analytics/event', event);
      return response.data;
    } catch (error) {
      logger.error('記錄移動端事件失敗:', error);
      // 不拋出錯誤，避免影響用戶體驗
      return null;
    }
  }

  // 獲取移動端分析報告
  async getMobileAnalyticsReport(
    options: {
      timeframe?: string;
      metrics?: string[];
    } = {}
  ): Promise<MobileAnalyticsReport> {
    const cacheKey = `mobile_analytics:${JSON.stringify(options)}`;

    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams();
      if (options.timeframe) params.append('timeframe', options.timeframe);
      if (options.metrics?.length)
        params.append('metrics', options.metrics.join(','));

      const response = await apiService.get(
        `/mobile/analytics/report?${params}`
      );

      this.setCachedData(cacheKey, response.data, 1800); // 30分鐘緩存
      return response.data;
    } catch (error) {
      logger.error('獲取移動端分析報告失敗:', error);
      throw new Error('獲取移動端分析報告失敗');
    }
  }

  // ==================== 移動端優化 ====================

  // 獲取移動端配置
  async getMobileConfig(deviceInfo?: any): Promise<MobileConfig> {
    const cacheKey = `mobile_config:${JSON.stringify(deviceInfo)}`;

    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams();
      if (deviceInfo) params.append('deviceInfo', JSON.stringify(deviceInfo));

      const response = await apiService.get(`/mobile/config?${params}`);

      this.setCachedData(cacheKey, response.data, 3600); // 1小時緩存
      return response.data;
    } catch (error) {
      logger.error('獲取移動端配置失敗:', error);
      throw new Error('獲取移動端配置失敗');
    }
  }

  // 獲取優化建議
  async getOptimizationSuggestions(
    options: {
      deviceInfo?: any;
      performanceData?: any;
    } = {}
  ): Promise<OptimizationSuggestion[]> {
    try {
      const params = new URLSearchParams();
      if (options.deviceInfo)
        params.append('deviceInfo', JSON.stringify(options.deviceInfo));
      if (options.performanceData)
        params.append(
          'performanceData',
          JSON.stringify(options.performanceData)
        );

      const response = await apiService.get(
        `/mobile/optimization/suggestions?${params}`
      );
      return response.data;
    } catch (error) {
      logger.error('獲取優化建議失敗:', error);
      throw new Error('獲取優化建議失敗');
    }
  }

  // ==================== 生物識別認證 ====================

  // 啟用生物識別認證
  async enableBiometricAuth(
    biometricType: string,
    deviceId: string
  ): Promise<any> {
    try {
      const response = await apiService.post('/mobile/biometric/enable', {
        biometricType,
        deviceId,
      });
      return response.data;
    } catch (error) {
      logger.error('啟用生物識別認證失敗:', error);
      throw new Error('啟用生物識別認證失敗');
    }
  }

  // 驗證生物識別
  async verifyBiometricAuth(
    biometricData: any,
    deviceId: string,
    userId: string
  ): Promise<any> {
    try {
      const response = await apiService.post('/mobile/biometric/verify', {
        biometricData,
        deviceId,
        userId,
      });
      return response.data;
    } catch (error) {
      logger.error('驗證生物識別失敗:', error);
      throw new Error('驗證生物識別失敗');
    }
  }

  // ==================== 語音命令 ====================

  // 處理語音命令
  async processVoiceCommand(options: {
    audioData: string;
    commandType: string;
    language: string;
  }): Promise<any> {
    try {
      const response = await apiService.post('/mobile/voice/command', options);
      return response.data;
    } catch (error) {
      logger.error('處理語音命令失敗:', error);
      throw new Error('處理語音命令失敗');
    }
  }

  // 獲取語音命令列表
  async getVoiceCommands(language: string = 'zh-TW'): Promise<VoiceCommand[]> {
    try {
      const response = await apiService.get(
        `/mobile/voice/commands?language=${language}`
      );
      return response.data;
    } catch (error) {
      logger.error('獲取語音命令列表失敗:', error);
      throw new Error('獲取語音命令列表失敗');
    }
  }

  // ==================== AR 功能 ====================

  // 獲取 AR 卡片數據
  async getARCardData(
    cardId: string,
    arType: string = '3d-model'
  ): Promise<ARCardData> {
    try {
      const response = await apiService.get(
        `/mobile/ar/card/${cardId}?arType=${arType}`
      );
      return response.data;
    } catch (error) {
      logger.error('獲取 AR 卡片數據失敗:', error);
      throw new Error('獲取 AR 卡片數據失敗');
    }
  }

  // 處理 AR 掃描
  async processARScan(options: {
    scanData: any;
    scanType: string;
    location?: { latitude: number; longitude: number };
  }): Promise<ARScanResult> {
    try {
      const response = await apiService.post('/mobile/ar/scan', options);
      return response.data;
    } catch (error) {
      logger.error('處理 AR 掃描失敗:', error);
      throw new Error('處理 AR 掃描失敗');
    }
  }

  // ==================== 移動端健康檢查 ====================

  // 移動端健康檢查
  async getMobileHealth(deviceInfo?: any): Promise<MobileHealth> {
    try {
      const params = new URLSearchParams();
      if (deviceInfo) params.append('deviceInfo', JSON.stringify(deviceInfo));

      const response = await apiService.get(`/mobile/health?${params}`);
      return response.data;
    } catch (error) {
      logger.error('移動端健康檢查失敗:', error);
      throw new Error('移動端健康檢查失敗');
    }
  }

  // 獲取移動端指標
  async getMobileMetrics(timeframe: string = '24h'): Promise<MobileMetrics> {
    try {
      const response = await apiService.get(
        `/mobile/metrics?timeframe=${timeframe}`
      );
      return response.data;
    } catch (error) {
      logger.error('獲取移動端指標失敗:', error);
      throw new Error('獲取移動端指標失敗');
    }
  }

  // ==================== 工具方法 ====================

  // 獲取緩存數據
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl * 1000) {
      return cached.data;
    }
    return null;
  }

  // 設置緩存數據
  private setCachedData(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  // 清理緩存
  clearCache(): void {
    this.cache.clear();
  }

  // 獲取緩存統計
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // 初始化移動端服務
  async initialize(): Promise<void> {
    try {
      // 註冊設備
      const deviceInfo = mobileOptimizer.getDeviceInfo();
      const capabilities = this.getDeviceCapabilities();

      await this.registerDevice(deviceInfo, capabilities);

      // 獲取移動端配置
      const config = await this.getMobileConfig(deviceInfo);

      // 應用配置
      this.applyMobileConfig(config);

      logger.info('[Mobile Service] 移動端服務初始化完成');
    } catch (error) {
      logger.error('[Mobile Service] 移動端服務初始化失敗:', error);
    }
  }

  // 獲取設備能力
  private getDeviceCapabilities(): string[] {
    const capabilities: string[] = [];

    if (mobileOptimizer.isMobile()) {
      capabilities.push('mobile');
    }

    if (mobileOptimizer.isTablet()) {
      capabilities.push('tablet');
    }

    if (mobileOptimizer.isSmallScreen()) {
      capabilities.push('small-screen');
    }

    // 檢查觸摸支持
    if ('ontouchstart' in window) {
      capabilities.push('touch');
    }

    // 檢查推送通知支持
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      capabilities.push('push-notifications');
    }

    // 檢查生物識別支持
    if ('credentials' in navigator) {
      capabilities.push('biometric-auth');
    }

    return capabilities;
  }

  // 應用移動端配置
  private applyMobileConfig(config: MobileConfig): void {
    // 應用性能配置
    if (config.performance.imageOptimization) {
      // 啟用圖片優化
    }

    if (config.performance.lazyLoading) {
      // 啟用懶加載
    }

    if (config.performance.caching) {
      // 啟用緩存
    }

    // 應用功能配置
    if (config.features.biometricAuth) {
      mobileOptimizer.enableBiometricAuth();
    }

    if (config.features.voiceCommands) {
      mobileOptimizer.enableVoiceCommands();
    }

    if (config.features.arFeatures) {
      mobileOptimizer.enableARFeatures();
    }
  }
}

// 創建單例實例
export { MobileService };
export const mobileService = new MobileService();

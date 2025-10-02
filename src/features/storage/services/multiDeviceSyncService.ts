import { EventEmitter } from 'events';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from '../../../utils/logger';
import type { SyncStats } from '../types/storage';
import { SyncStatus, ConflictResolution } from '../types/storage';

/**
 * 設備InformationInterface
 */
export interface DeviceInfo {
  id: string;
  name: string;
  platform: 'ios' | 'android' | 'web';
  version: string;
  lastSeen: number;
  isOnline: boolean;
  syncStatus: SyncStatus;
  lastSyncTime: number | null;
}

/**
 * 設備SyncDataInterface
 */
export interface DeviceSyncData {
  deviceId: string;
  userId: string;
  dataType: 'card' | 'collection' | 'user' | 'annotation';
  dataId: string;
  operation: 'create' | 'update' | 'delete';
  data: unknown;
  timestamp: number;
  version: number;
  checksum: string;
  metadata: {
    sourceDevice: string;
    targetDevices?: string[];
    priority: 'high' | 'normal' | 'low';
    conflictResolution?: ConflictResolution;
  };
}

/**
 * 多設備SyncConfigureInterface
 */
export interface MultiDeviceSyncConfig {
  enableDeviceDiscovery: boolean;
  enableAutoSync: boolean;
  syncInterval: number;
  deviceTimeout: number;
  maxDevices: number;
  conflictResolution: ConflictResolution;
  enableConflictDetection: boolean;
  enableDeviceTracking: boolean;
  enableCrossPlatformSync: boolean;
}

/**
 * 多設備SyncStatusInterface
 */
export interface MultiDeviceSyncState {
  currentDevice: DeviceInfo | null;
  connectedDevices: DeviceInfo[];
  isDiscovering: boolean;
  isSyncing: boolean;
  lastDiscoveryTime: number | null;
  lastSyncTime: number | null;
  error: string | null;
  stats: SyncStats;
}

/**
 * 多設備SyncService
 * 負責Manage跨設備的DataSync和設備發現
 */
export class MultiDeviceSyncService extends EventEmitter {
  private static instance: MultiDeviceSyncService;
  private config: MultiDeviceSyncConfig;
  private readonly state: MultiDeviceSyncState;
  private syncQueue: DeviceSyncData[] = [];
  private deviceRegistry: Map<string, DeviceInfo> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;
  private discoveryInterval: NodeJS.Timeout | null = null;
  private userId: string;

  private constructor() {
    super();
    this.config = {
      enableDeviceDiscovery: true,
      enableAutoSync: true,
      syncInterval: 60000, // 1Minute
      deviceTimeout: 300000, // 5Minute
      maxDevices: 10,
      conflictResolution: ConflictResolution.LAST_MODIFIED,
      enableConflictDetection: true,
      enableDeviceTracking: true,
      enableCrossPlatformSync: true,
    };

    this.state = {
      currentDevice: null,
      connectedDevices: [],
      isDiscovering: false,
      isSyncing: false,
      lastDiscoveryTime: null,
      lastSyncTime: null,
      error: null,
      stats: {
        totalSynced: 0,
        pendingSync: 0,
        syncErrors: 0,
        lastSyncTime: new Date(),
        avgSyncTime: 0,
      },
    };

    this.userId = '';
  }

  /**
   * Get單例Instance
   */
  public static getInstance(): MultiDeviceSyncService {
    if (!MultiDeviceSyncService.instance) {
      MultiDeviceSyncService.instance = new MultiDeviceSyncService();
    }
    return MultiDeviceSyncService.instance;
  }

  /**
   * InitializeService
   */
  public async initialize(
    userId: string,
    deviceInfo: Partial<DeviceInfo>
  ): Promise<void> {
    try {
      this.userId = userId;

      // Create當前設備Information
      this.state.currentDevice = {
        id: this.generateDeviceId(),
        name: deviceInfo.name || 'Unknown Device',
        platform: deviceInfo.platform || 'web',
        version: deviceInfo.version || '1.0.0',
        lastSeen: Date.now(),
        isOnline: true,
        syncStatus: SyncStatus.SYNCED,
        lastSyncTime: null,
      };

      // Register當前設備
      this.deviceRegistry.set(
        this.state.currentDevice.id,
        this.state.currentDevice
      );

      await this.loadDeviceRegistry();
      await this.loadSyncQueue();
      await this.startDeviceDiscovery();
      await this.startPeriodicSync();

      logger.info('多設備同步ServiceInitializeSuccess', {
        userId,
        deviceId: this.state.currentDevice.id,
        deviceName: this.state.currentDevice.name,
      });

      this.emit('initialized', {
        userId,
        deviceId: this.state.currentDevice.id,
        deviceName: this.state.currentDevice.name,
      });
    } catch (error) {
      logger.error('多設備同步ServiceInitializeFailed:', error);
      throw error;
    }
  }

  /**
   * ConfigureSyncSettings
   */
  public configure(config: Partial<MultiDeviceSyncConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('多設備同步配置已更新:', this.config);
  }

  /**
   * GetSyncStatus
   */
  public getSyncState(): MultiDeviceSyncState {
    return { ...this.state };
  }

  /**
   * Get設備List
   */
  public getDevices(): DeviceInfo[] {
    return Array.from(this.deviceRegistry.values());
  }

  /**
   * GetConnect的設備
   */
  public getConnectedDevices(): DeviceInfo[] {
    return this.state.connectedDevices;
  }

  /**
   * 生成設備ID
   */
  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Begin設備發現
   */
  private async startDeviceDiscovery(): Promise<void> {
    if (!this.config.enableDeviceDiscovery) {
      return;
    }

    // 立即執Row一次發現
    await this.discoverDevices();

    // Settings定期發現
    this.discoveryInterval = setInterval(() => {
      this.discoverDevices();
    }, this.config.syncInterval * 2);
  }

  /**
   * Begin定期Sync
   */
  private async startPeriodicSync(): Promise<void> {
    if (!this.config.enableAutoSync) {
      return;
    }

    this.syncInterval = setInterval(() => {
      if (this.syncQueue.length > 0) {
        this.triggerSync();
      }
    }, this.config.syncInterval);
  }

  /**
   * 發現設備
   */
  private async discoverDevices(): Promise<DeviceInfo[]> {
    if (this.state.isDiscovering) {
      return this.state.connectedDevices;
    }

    try {
      this.state.isDiscovering = true;
      this.emit('discoveryStarted');

      // 模擬設備發現過程
      const _discoveredDevices = await this.mockDeviceDiscovery();

      // Update設備Status
      for (const device of discoveredDevices) {
        if (!this.deviceRegistry.has(device.id)) {
          this.deviceRegistry.set(device.id, device);
        } else {
          const _existingDevice = this.deviceRegistry.get(device.id)!;
          existingDevice.lastSeen = Date.now();
          existingDevice.isOnline = device.isOnline;
        }
      }

      this.state.connectedDevices = Array.from(
        this.deviceRegistry.values()
      ).filter(device => device.id !== this.state.currentDevice?.id);

      this.state.lastDiscoveryTime = Date.now();
      await this.saveDeviceRegistry();

      logger.info(`發現了 ${discoveredDevices.length} 個設備`);
      this.emit('discoveryCompleted', this.state.connectedDevices);

      return this.state.connectedDevices;
    } catch (error) {
      logger.error('設備發現Failed:', error);
      this.emit('discoveryError', error);
      throw error;
    } finally {
      this.state.isDiscovering = false;
    }
  }

  /**
   * 觸發Sync
   */
  private async triggerSync(): Promise<void> {
    if (this.state.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    try {
      this.state.isSyncing = true;
      this.state.error = null;
      this.emit('syncStarted');

      const _startTime = Date.now();
      const _batch = this.syncQueue.slice(0, 10); // 每次Sync10個項目

      logger.info(`開始多設備同步，包含 ${batch.length} 個項目`);

      const _results = await this.syncBatch(batch);

      // UpdateStatisticsInformation
      const _syncTime = Date.now() - startTime;
      this.updateSyncStats(results, syncTime);

      // 從Queue中Remove已Sync的項目
      this.removeSyncedItems(
        batch.map(item => `${item.deviceId}_${item.dataId}_${item.timestamp}`)
      );

      this.state.lastSyncTime = Date.now();
      this.emit('syncCompleted', results);

      logger.info('多設備同步完成:', results);
    } catch (error) {
      this.handleSyncError(error);
    } finally {
      this.state.isSyncing = false;
    }
  }

  /**
   * Sync批次
   */
  private async syncBatch(batch: DeviceSyncData[]): Promise<{
    success: number;
    failed: number;
    conflicts: number;
    errors: string[];
  }> {
    const _results = {
      success: 0,
      failed: 0,
      conflicts: 0,
      errors: [] as string[],
    };

    for (const item of batch) {
      try {
        const _result = await this.syncItem(item);

        if (result.success) {
          results.success++;
        } else if (result.conflict) {
          results.conflicts++;
        } else {
          results.failed++;
          results.errors.push(result.error || '未知Error');
        }
      } catch (error) {
        results.failed++;
        results.errors.push(
          error instanceof Error ? error.message : '未知Error'
        );
        logger.error('同步項目Failed:', { item, error });
      }
    }

    return results;
  }

  /**
   * SyncSingle項目
   */
  private async syncItem(item: DeviceSyncData): Promise<{
    success: boolean;
    conflict?: boolean;
    serverData?: unknown;
    error?: string;
  }> {
    try {
      // 這裡應該調用實際的API來Sync到其他設備
      // 目前使用模擬實現
      const _response = await this.mockDeviceSync(item);

      if (response.success) {
        return { success: true };
      } else if (response.conflict) {
        return {
          success: false,
          conflict: true,
          serverData: response.serverData,
        };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '同步Failed',
      };
    }
  }

  /**
   * HandleSyncError
   */
  private handleSyncError(error: unknown): void {
    const _errorMessage = error instanceof Error ? error.message : '同步Failed';
    this.state.error = errorMessage;
    this.state.stats.syncErrors++;

    logger.error('多設備同步Error:', error);
    this.emit('syncError', error);
  }

  /**
   * UpdateSyncStatistics
   */
  private updateSyncStats(results: unknown, syncTime: number): void {
    const { success, failed } = results;

    this.state.stats.totalSynced += success;
    this.state.stats.syncErrors += failed;
    this.state.stats.lastSyncTime = new Date();

    const _totalSyncs = this.state.stats.totalSynced;
    this.state.stats.avgSyncTime =
      (this.state.stats.avgSyncTime * (totalSyncs - 1) + syncTime) / totalSyncs;
  }

  /**
   * Remove已Sync的項目
   */
  private removeSyncedItems(itemIds: string[]): void {
    this.syncQueue = this.syncQueue.filter(
      item =>
        !itemIds.includes(`${item.deviceId}_${item.dataId}_${item.timestamp}`)
    );
    this.state.stats.pendingSync = this.syncQueue.length;
    this.saveSyncQueue();
  }

  /**
   * Save設備RegisterTable
   */
  private async saveDeviceRegistry(): Promise<void> {
    try {
      const _key = `device_registry_${this.userId}`;
      const _registry = Array.from(this.deviceRegistry.entries());
      await AsyncStorage.setItem(key, JSON.stringify(registry));
    } catch (error) {
      logger.error('保存設備註冊表Failed:', error);
    }
  }

  /**
   * 加載設備RegisterTable
   */
  private async loadDeviceRegistry(): Promise<void> {
    try {
      const _key = `device_registry_${this.userId}`;
      const _data = await AsyncStorage.getItem(key);

      if (data) {
        const _registry = JSON.parse(data);
        this.deviceRegistry = new Map(registry);
        logger.info(`加載了 ${this.deviceRegistry.size} 個設備`);
      }
    } catch (error) {
      logger.error('加載設備註冊表Failed:', error);
      this.deviceRegistry = new Map();
    }
  }

  /**
   * SaveSyncQueue
   */
  private async saveSyncQueue(): Promise<void> {
    try {
      const _key = `device_sync_queue_${this.userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(this.syncQueue));
    } catch (error) {
      logger.error('保存同步隊列Failed:', error);
    }
  }

  /**
   * 加載SyncQueue
   */
  private async loadSyncQueue(): Promise<void> {
    try {
      const _key = `device_sync_queue_${this.userId}`;
      const _data = await AsyncStorage.getItem(key);

      if (data) {
        this.syncQueue = JSON.parse(data);
        this.state.stats.pendingSync = this.syncQueue.length;
        logger.info(`加載了 ${this.syncQueue.length} 個待同步項目`);
      }
    } catch (error) {
      logger.error('加載同步隊列Failed:', error);
      this.syncQueue = [];
    }
  }

  /**
   * 模擬設備發現
   */
  private async mockDeviceDiscovery(): Promise<DeviceInfo[]> {
    // 模擬Network延遲
    await new Promise(resolve =>
      setTimeout(resolve, 500 + Math.random() * 1000)
    );

    // 模擬發現的設備
    const mockDevices: DeviceInfo[] = [
      {
        id: 'device_mock_1',
        name: 'iPhone 12',
        platform: 'ios',
        version: '1.0.0',
        lastSeen: Date.now() - 60000,
        isOnline: true,
        syncStatus: SyncStatus.SYNCED,
        lastSyncTime: Date.now() - 30000,
      },
      {
        id: 'device_mock_2',
        name: 'Samsung Galaxy',
        platform: 'android',
        version: '1.0.0',
        lastSeen: Date.now() - 120000,
        isOnline: false,
        syncStatus: SyncStatus.OFFLINE,
        lastSyncTime: Date.now() - 180000,
      },
    ];

    return mockDevices;
  }

  /**
   * 模擬設備Sync
   */
  private async mockDeviceSync(item: DeviceSyncData): Promise<{
    success: boolean;
    conflict?: boolean;
    serverData?: unknown;
    error?: string;
  }> {
    // 模擬Network延遲
    await new Promise(resolve =>
      setTimeout(resolve, 200 + Math.random() * 300)
    );

    // 模擬隨機Error
    if (Math.random() < 0.1) {
      throw new Error('網絡Error');
    }

    // 模擬衝突
    if (Math.random() < 0.05) {
      return {
        success: false,
        conflict: true,
        serverData: { ...item.data, timestamp: Date.now() - 1000 },
      };
    }

    return { success: true };
  }

  /**
   * 銷毀Service
   */
  public async destroy(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
      this.discoveryInterval = null;
    }

    this.removeAllListeners();
    logger.info('多設備同步Service已銷毀');
  }
}

// Export單例Instance
export const _multiDeviceSyncService = MultiDeviceSyncService.getInstance();

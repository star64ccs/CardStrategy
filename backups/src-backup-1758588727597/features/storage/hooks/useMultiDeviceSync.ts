import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  DeviceInfo,
  MultiDeviceSyncConfig,
  MultiDeviceSyncState,
} from '../services/multiDeviceSyncService';
import { multiDeviceSyncService } from '../services/multiDeviceSyncService';

/**
 * 多設備同步 Hook 選項
 */
export interface UseMultiDeviceSyncOptions {
  userId: string;
  deviceInfo: Partial<DeviceInfo>;
  autoInitialize?: boolean;
  onSyncStarted?: () => void;
  onSyncCompleted?: (results: unknown) => void;
  onSyncError?: (error: unknown) => void;
  onDeviceDiscovered?: (devices: DeviceInfo[]) => void;
  onDeviceRegistered?: (device: DeviceInfo) => void;
  onDeviceRemoved?: (deviceId: string) => void;
  onDiscoveryStarted?: () => void;
  onDiscoveryCompleted?: (devices: DeviceInfo[]) => void;
  onDiscoveryError?: (error: unknown) => void;
}

/**
 * 多設備同步 Hook 返回值
 */
export interface UseMultiDeviceSyncReturn {
  // 狀態
  syncState: MultiDeviceSyncState;
  currentDevice: DeviceInfo | null;
  connectedDevices: DeviceInfo[];
  isDiscovering: boolean;
  isSyncing: boolean;
  error: string | null;
  stats: unknown;

  // 方法
  initialize: (
    userId: string,
    deviceInfo: Partial<DeviceInfo>
  ) => Promise<void>;
  configure: (config: Partial<MultiDeviceSyncConfig>) => void;
  discoverDevices: () => Promise<DeviceInfo[]>;
  getDevices: () => DeviceInfo[];
  getConnectedDevices: () => DeviceInfo[];
  removeDevice: (deviceId: string) => Promise<void>;
  updateDeviceStatus: (
    deviceId: string,
    status: Partial<DeviceInfo>
  ) => Promise<void>;
  cleanupOfflineDevices: () => Promise<void>;
  destroy: () => Promise<void>;
}

/**
 * 多設備同步 Hook
 * 提供跨設備的數據同步和設備發現功能
 */
export const useMultiDeviceSync = (
  options: UseMultiDeviceSyncOptions
): UseMultiDeviceSyncReturn => {
  const [syncState, setSyncState] = useState<MultiDeviceSyncState>({
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
  });

  const isInitialized = useRef(false);
  const eventListeners = useRef<Map<string, () => void>>(new Map());

  // 更新同步狀態
  const updateSyncState = useCallback(() => {
    const state = multiDeviceSyncService.getSyncState();
    setSyncState(state);
  }, []);

  // 初始化服務
  const initialize = useCallback(
    async (userId: string, deviceInfo: Partial<DeviceInfo>) => {
      if (isInitialized.current) {
        return;
      }

      try {
        await multiDeviceSyncService.initialize(userId, deviceInfo);
        isInitialized.current = true;
        updateSyncState();
      } catch (error) {
        console.error('多設備同步初始化失敗:', error);
        throw error;
      }
    },
    [updateSyncState]
  );

  // 配置同步設置
  const configure = useCallback((config: Partial<MultiDeviceSyncConfig>) => {
    multiDeviceSyncService.configure(config);
  }, []);

  // 發現設備
  const discoverDevices = useCallback(async () => {
    try {
      // 暫時註釋掉，等待實現
      // const devices = await multiDeviceSyncService.discoverDevices();
      const devices: unknown[] = [];
      return devices;
    } catch (error) {
      console.error('發現設備失敗:', error);
      return [];
    } finally {
      // setIsDiscovering(false); // This line was removed from the new_code, so it's removed here.
    }
  }, []);

  // 獲取設備列表
  const getDevices = useCallback(() => {
    return multiDeviceSyncService.getDevices();
  }, []);

  // 獲取連接的設備
  const getConnectedDevices = useCallback(() => {
    return multiDeviceSyncService.getConnectedDevices();
  }, []);

  // 移除設備
  const removeDevice = useCallback(async (deviceId: string) => {
    try {
      // 暫時註釋掉，等待實現
      // await multiDeviceSyncService.removeDevice(deviceId);
      console.log('移除設備:', deviceId);
    } catch (error) {
      console.error('移除設備失敗:', error);
    }
  }, []);

  // 更新設備狀態
  const updateDeviceStatus = useCallback(
    async (deviceId: string, status: Partial<DeviceInfo>) => {
      try {
        // 暫時註釋掉，等待實現
        // await multiDeviceSyncService.updateDeviceStatus(deviceId, status);
        console.log('更新設備狀態:', deviceId, status);
      } catch (error) {
        console.error('更新設備狀態失敗:', error);
      }
    },
    []
  );

  // 清理離線設備
  const cleanupOfflineDevices = useCallback(async () => {
    try {
      // 暫時註釋掉，等待實現
      // await multiDeviceSyncService.cleanupOfflineDevices();
      console.log('清理離線設備');
    } catch (error) {
      console.error('清理離線設備失敗:', error);
    }
  }, []);

  // 銷毀服務
  const destroy = useCallback(async () => {
    await multiDeviceSyncService.destroy();
    isInitialized.current = false;
  }, []);

  // 設置事件監聽器
  useEffect(() => {
    const listeners = [
      { event: 'syncStarted', handler: options.onSyncStarted },
      { event: 'syncCompleted', handler: options.onSyncCompleted },
      { event: 'syncError', handler: options.onSyncError },
      { event: 'discoveryStarted', handler: options.onDiscoveryStarted },
      { event: 'discoveryCompleted', handler: options.onDiscoveryCompleted },
      { event: 'discoveryError', handler: options.onDiscoveryError },
      { event: 'deviceRegistered', handler: options.onDeviceRegistered },
      { event: 'deviceRemoved', handler: options.onDeviceRemoved },
    ];

    listeners.forEach(({ event, handler }) => {
      if (handler) {
        const wrappedHandler = (...args: unknown[]) => {
          // 調用事件處理器
          if (handler) {
            handler(args as any);
          }
          updateSyncState();
        };
        multiDeviceSyncService.on(event, wrappedHandler);
        eventListeners.current.set(event, wrappedHandler);
      }
    });

    return () => {
      eventListeners.current.forEach((handler, event) => {
        multiDeviceSyncService.off(event, handler);
      });
      eventListeners.current.clear();
    };
  }, [options, updateSyncState]);

  // 定期更新狀態
  useEffect(() => {
    const interval = setInterval(() => {
      if (isInitialized.current) {
        updateSyncState();
      }
    }, 2000); // 每2秒更新一次

    return () => clearInterval(interval);
  }, [updateSyncState]);

  // 自動初始化
  useEffect(() => {
    if (options.autoInitialize && options.userId && !isInitialized.current) {
      initialize(options.userId, options.deviceInfo);
    }
  }, [options.autoInitialize, options.userId, options.deviceInfo, initialize]);

  // 組件卸載時清理
  useEffect(() => {
    return () => {
      if (isInitialized.current) {
        destroy();
      }
    };
  }, [destroy]);

  return {
    // 狀態
    syncState,
    currentDevice: syncState.currentDevice,
    connectedDevices: syncState.connectedDevices,
    isDiscovering: syncState.isDiscovering,
    isSyncing: syncState.isSyncing,
    error: syncState.error,
    stats: syncState.stats,

    // 方法
    initialize,
    configure,
    discoverDevices,
    getDevices,
    getConnectedDevices,
    removeDevice,
    updateDeviceStatus,
    cleanupOfflineDevices,
    destroy,
  };
};

/**
 * 簡化的多設備同步 Hook
 */
export const useSimpleMultiDeviceSync = (
  userId: string,
  deviceInfo: Partial<DeviceInfo>
) => {
  const { syncState, discoverDevices, getConnectedDevices } =
    useMultiDeviceSync({
      userId,
      deviceInfo,
      autoInitialize: true,
    });

  return {
    currentDevice: syncState.currentDevice,
    connectedDevices: syncState.connectedDevices,
    isDiscovering: syncState.isDiscovering,
    isSyncing: syncState.isSyncing,
    error: syncState.error,
    discoverDevices,
    getConnectedDevices,
  };
};

/**
 * 設備管理 Hook
 */
export const useDeviceManagement = (
  userId: string,
  deviceInfo: Partial<DeviceInfo>
) => {
  const {
    syncState,
    discoverDevices,
    getDevices,
    removeDevice,
    updateDeviceStatus,
    cleanupOfflineDevices,
  } = useMultiDeviceSync({
    userId,
    deviceInfo,
    autoInitialize: true,
  });

  const refreshDevices = useCallback(async () => {
    await discoverDevices();
  }, [discoverDevices]);

  const getOnlineDevices = useCallback(() => {
    return getDevices().filter(device => device.isOnline);
  }, [getDevices]);

  const getOfflineDevices = useCallback(() => {
    return getDevices().filter(device => !device.isOnline);
  }, [getDevices]);

  return {
    devices: syncState.connectedDevices,
    currentDevice: syncState.currentDevice,
    isDiscovering: syncState.isDiscovering,
    lastDiscoveryTime: syncState.lastDiscoveryTime,
    refreshDevices,
    getDevices,
    getOnlineDevices,
    getOfflineDevices,
    removeDevice,
    updateDeviceStatus,
    cleanupOfflineDevices,
  };
};

/**
 * 跨平台同步 Hook
 */
export const useCrossPlatformSync = (
  userId: string,
  deviceInfo: Partial<DeviceInfo>
) => {
  const { syncState, discoverDevices, getConnectedDevices } =
    useMultiDeviceSync({
      userId,
      deviceInfo,
      autoInitialize: true,
    });

  const getDevicesByPlatform = useCallback(
    (platform: 'ios' | 'android' | 'web') => {
      return getConnectedDevices().filter(
        device => device.platform === platform
      );
    },
    [getConnectedDevices]
  );

  const getIOSDevices = useCallback(() => {
    return getDevicesByPlatform('ios');
  }, [getDevicesByPlatform]);

  const getAndroidDevices = useCallback(() => {
    return getDevicesByPlatform('android');
  }, [getDevicesByPlatform]);

  const getWebDevices = useCallback(() => {
    return getDevicesByPlatform('web');
  }, [getDevicesByPlatform]);

  return {
    currentDevice: syncState.currentDevice,
    connectedDevices: syncState.connectedDevices,
    isDiscovering: syncState.isDiscovering,
    discoverDevices,
    getDevicesByPlatform,
    getIOSDevices,
    getAndroidDevices,
    getWebDevices,
  };
};

import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  DeviceInfo,
  MultiDeviceSyncConfig,
  MultiDeviceSyncState,
} from '../services/multiDeviceSyncService';
import { multiDeviceSyncService } from '../services/multiDeviceSyncService';

/**
 * 多設備Sync Hook Options
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
 * 多設備Sync Hook ReturnValue
 */
export interface UseMultiDeviceSyncReturn {
  // Status
  syncState: MultiDeviceSyncState;
  currentDevice: DeviceInfo | null;
  connectedDevices: DeviceInfo[];
  isDiscovering: boolean;
  isSyncing: boolean;
  error: string | null;
  stats: unknown;

  // Method
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
 * 多設備Sync Hook
 * 提供跨設備的DataSync和設備發現功能
 */
export const _useMultiDeviceSync = (
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

  const _isInitialized = useRef(false);
  const _eventListeners = useRef<Map<string, () => void>>(new Map());

  // UpdateSyncStatus
  const _updateSyncState = useCallback(() => {
    const _state = multiDeviceSyncService.getSyncState();
    setSyncState(state);
  }, []);

  // InitializeService
  const _initialize = useCallback(
    async (userId: string, deviceInfo: Partial<DeviceInfo>) => {
      if (isInitialized.current) {
        return;
      }

      try {
        await multiDeviceSyncService.initialize(userId, deviceInfo);
        isInitialized.current = true;
        updateSyncState();
      } catch (error) {
        console.error('多設備同步InitializeFailed:', error);
        throw error;
      }
    },
    [updateSyncState]
  );

  // ConfigureSyncSettings
  const _configure = useCallback((config: Partial<MultiDeviceSyncConfig>) => {
    multiDeviceSyncService.configure(config);
  }, []);

  // 發現設備
  const _discoverDevices = useCallback(async () => {
    try {
      // 暫時Comment掉，Await實現
      // const _devices = await multiDeviceSyncService.discoverDevices();
      const devices: unknown[] = [];
      return devices;
    } catch (error) {
      console.error('發現設備Failed:', error);
      return [];
    } finally {
      // setIsDiscovering(false); // This line was removed from the new_code, so it's removed here.
    }
  }, []);

  // Get設備List
  const _getDevices = useCallback(() => {
    return multiDeviceSyncService.getDevices();
  }, []);

  // GetConnect的設備
  const _getConnectedDevices = useCallback(() => {
    return multiDeviceSyncService.getConnectedDevices();
  }, []);

  // Remove設備
  const _removeDevice = useCallback(async (deviceId: string) => {
    try {
      // 暫時Comment掉，Await實現
      // await multiDeviceSyncService.removeDevice(deviceId);
      console.log('移除設備:', deviceId);
    } catch (error) {
      console.error('移除設備Failed:', error);
    }
  }, []);

  // Update設備Status
  const _updateDeviceStatus = useCallback(
    async (deviceId: string, status: Partial<DeviceInfo>) => {
      try {
        // 暫時Comment掉，Await實現
        // await multiDeviceSyncService.updateDeviceStatus(deviceId, status);
        console.log('更新設備狀態:', deviceId, status);
      } catch (error) {
        console.error('Update設備狀態Failed:', error);
      }
    },
    []
  );

  // 清理離線設備
  const _cleanupOfflineDevices = useCallback(async () => {
    try {
      // 暫時Comment掉，Await實現
      // await multiDeviceSyncService.cleanupOfflineDevices();
      console.log('清理離線設備');
    } catch (error) {
      console.error('清理離線設備Failed:', error);
    }
  }, []);

  // 銷毀Service
  const _destroy = useCallback(async () => {
    await multiDeviceSyncService.destroy();
    isInitialized.current = false;
  }, []);

  // SettingsEvent監聽器
  useEffect(() => {
    const _listeners = [
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
        const _wrappedHandler = (...args: unknown[]) => {
          // 調用EventHandle器
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

  // 定期UpdateStatus
  useEffect(() => {
    const _interval = setInterval(() => {
      if (isInitialized.current) {
        updateSyncState();
      }
    }, 2000); // 每2SecondUpdate一次

    return () => clearInterval(interval);
  }, [updateSyncState]);

  // AutoInitialize
  useEffect(() => {
    if (options.autoInitialize && options.userId && !isInitialized.current) {
      initialize(options.userId, options.deviceInfo);
    }
  }, [options.autoInitialize, options.userId, options.deviceInfo, initialize]);

  // ComponentUninstall時清理
  useEffect(() => {
    return () => {
      if (isInitialized.current) {
        destroy();
      }
    };
  }, [destroy]);

  return {
    // Status
    syncState,
    currentDevice: syncState.currentDevice,
    connectedDevices: syncState.connectedDevices,
    isDiscovering: syncState.isDiscovering,
    isSyncing: syncState.isSyncing,
    error: syncState.error,
    stats: syncState.stats,

    // Method
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
 * 簡化的多設備Sync Hook
 */
export const _useSimpleMultiDeviceSync = (
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
 * 設備Manage Hook
 */
export const _useDeviceManagement = (
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

  const _refreshDevices = useCallback(async () => {
    await discoverDevices();
  }, [discoverDevices]);

  const _getOnlineDevices = useCallback(() => {
    return getDevices().filter(device => device.isOnline);
  }, [getDevices]);

  const _getOfflineDevices = useCallback(() => {
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
 * 跨平台Sync Hook
 */
export const _useCrossPlatformSync = (
  userId: string,
  deviceInfo: Partial<DeviceInfo>
) => {
  const { syncState, discoverDevices, getConnectedDevices } =
    useMultiDeviceSync({
      userId,
      deviceInfo,
      autoInitialize: true,
    });

  const _getDevicesByPlatform = useCallback(
    (platform: 'ios' | 'android' | 'web') => {
      return getConnectedDevices().filter(
        device => device.platform === platform
      );
    },
    [getConnectedDevices]
  );

  const _getIOSDevices = useCallback(() => {
    return getDevicesByPlatform('ios');
  }, [getDevicesByPlatform]);

  const _getAndroidDevices = useCallback(() => {
    return getDevicesByPlatform('android');
  }, [getDevicesByPlatform]);

  const _getWebDevices = useCallback(() => {
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

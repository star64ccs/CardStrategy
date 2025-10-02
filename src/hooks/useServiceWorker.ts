import { useState, useEffect, useCallback } from 'react';

// 臨時Class型定義
interface CacheInfo {
  name: string;
  size: number;
  entries: number;
  lastUpdated: Date;
}

interface SyncData {
  id: string;
  type: string;
  data: unknown;
  timestamp: Date;
  retryCount: number;
}

interface PerformanceMetrics {
  cacheHits: number;
  cacheMisses: number;
  networkRequests: number;
  errors: number;
  hitRate: number;
  lastReset: Date;
}

interface PrefetchConfig {
  urls: string[];
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  priority: 'high' | 'low';
}

// 臨時實現
const _swManager = {
  init: async () => {},
  getStatus: () => ({
    registered: false,
    active: false,
    installing: false,
    waiting: false,
  }),
  getCacheInfo: async () => [],
  getSyncQueue: () => [],
  getPerformanceMetrics: async () => ({
    cacheHits: 0,
    cacheMisses: 0,
    networkRequests: 0,
    errors: 0,
    hitRate: 0,
    lastReset: new Date(),
  }),
  clearCache: async (cacheName?: string) => {},
  addToSyncQueue: (data: SyncData) => {},
  clearSyncQueue: () => {},
  registerBackgroundSync: async (tag: string, data?: unknown) => {},
  sendNotification: async (title: string, options?: NotificationOptions) => {},
  prefetchResources: async (config: PrefetchConfig) => {},
  smartPrefetch: async (currentUrl: string) => {},
  updateConfig: (config: Partial<any>) => {},
  getSupportedFeatures: () => [],
  updateApp: async () => {},
  unregister: async () => true,
};

export interface ServiceWorkerStatus {
  registered: boolean;
  active: boolean;
  installing: boolean;
  waiting: boolean;
  online: boolean;
}

export interface ServiceWorkerState {
  status: ServiceWorkerStatus;
  cacheInfo: CacheInfo[];
  syncQueue: SyncData[];
  performanceMetrics: PerformanceMetrics;
  isLoading: boolean;
  error: string | null;
}

export interface ServiceWorkerActions {
  // 基礎功能
  initialize: () => Promise<void>;
  updateApp: () => Promise<void>;
  unregister: () => Promise<boolean>;

  // CacheManage
  clearCache: (cacheName?: string) => Promise<void>;
  refreshCacheInfo: () => Promise<void>;

  // Sync功能
  addToSyncQueue: (data: SyncData) => void;
  clearSyncQueue: () => void;
  registerBackgroundSync: (tag: string, data?: unknown) => Promise<void>;
  refreshSyncQueue: () => void;

  // Notification功能
  sendNotification: (
    title: string,
    options?: NotificationOptions
  ) => Promise<void>;

  // 預取功能
  prefetchResources: (config: PrefetchConfig) => Promise<void>;
  smartPrefetch: (currentUrl: string) => Promise<void>;

  // 性能Monitor
  refreshPerformanceMetrics: () => Promise<void>;

  // ConfigureManage
  updateConfig: (config: Partial<any>) => void;
  getSupportedFeatures: () => string[];
}

export const _useServiceWorker = (): ServiceWorkerState &
  ServiceWorkerActions => {
  const [state, setState] = useState<ServiceWorkerState>({
    status: {
      registered: false,
      active: false,
      installing: false,
      waiting: false,
      online: navigator.onLine,
    },
    cacheInfo: [],
    syncQueue: [],
    performanceMetrics: {
      cacheHits: 0,
      cacheMisses: 0,
      networkRequests: 0,
      errors: 0,
      hitRate: 0,
      lastReset: new Date(),
    },
    isLoading: true,
    error: null,
  });

  // Initialize Service Worker
  const _initialize = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await swManager.init();

      // UpdateStatus
      const _status = {
        ...swManager.getStatus(),
        online: navigator.onLine,
      };

      const _cacheInfo = await swManager.getCacheInfo();
      const _syncQueue = swManager.getSyncQueue();
      const _performanceMetrics = await swManager.getPerformanceMetrics();

      setState(prev => ({
        ...prev,
        status,
        cacheInfo,
        syncQueue,
        performanceMetrics,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'InitializeFailed',
        isLoading: false,
      }));
    }
  }, []);

  // UpdateApply
  const _updateApp = useCallback(async () => {
    try {
      await swManager.updateApp();
      // ReInitialize以Get最新Status
      await initialize();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'UpdateFailed',
      }));
    }
  }, [initialize]);

  // Logout Service Worker
  const _unregister = useCallback(async () => {
    try {
      const _result = await swManager.unregister();
      setState(prev => ({
        ...prev,
        status: {
          registered: false,
          active: false,
          installing: false,
          waiting: false,
          online: navigator.onLine,
        },
      }));
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '註銷Failed',
      }));
      return false;
    }
  }, []);

  // 清理Cache
  const _clearCache = useCallback(async (cacheName?: string) => {
    try {
      await swManager.clearCache(cacheName);
      // ReGetCacheInformation
      await refreshCacheInfo();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '清理緩存Failed',
      }));
    }
  }, []);

  // RefreshCacheInformation
  const _refreshCacheInfo = useCallback(async () => {
    try {
      const _cacheInfo = await swManager.getCacheInfo();
      setState(prev => ({ ...prev, cacheInfo }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Get緩存信息Failed',
      }));
    }
  }, []);

  // Add到SyncQueue
  const _addToSyncQueue = useCallback((data: SyncData) => {
    swManager.addToSyncQueue(data);
    refreshSyncQueue();
  }, []);

  // 清EmptySyncQueue
  const _clearSyncQueue = useCallback(() => {
    swManager.clearSyncQueue();
    refreshSyncQueue();
  }, []);

  // Register背景Sync
  const _registerBackgroundSync = useCallback(
    async (tag: string, data?: unknown) => {
      try {
        await swManager.registerBackgroundSync(tag, data);
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : '註冊背景同步Failed',
        }));
      }
    },
    []
  );

  // RefreshSyncQueue
  const _refreshSyncQueue = useCallback(() => {
    const _syncQueue = swManager.getSyncQueue();
    setState(prev => ({ ...prev, syncQueue }));
  }, []);

  // SendNotification
  const _sendNotification = useCallback(
    async (title: string, options?: NotificationOptions) => {
      try {
        await swManager.sendNotification(title, options);
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : '發送通知Failed',
        }));
      }
    },
    []
  );

  // 預取Resource
  const _prefetchResources = useCallback(async (config: PrefetchConfig) => {
    try {
      await swManager.prefetchResources(config);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '預取資源Failed',
      }));
    }
  }, []);

  // 智能預取
  const _smartPrefetch = useCallback(async (currentUrl: string) => {
    try {
      await swManager.smartPrefetch(currentUrl);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '智能預取Failed',
      }));
    }
  }, []);

  // Refresh性能指標
  const _refreshPerformanceMetrics = useCallback(async () => {
    try {
      const _performanceMetrics = await swManager.getPerformanceMetrics();
      setState(prev => ({ ...prev, performanceMetrics }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Get性能指標Failed',
      }));
    }
  }, []);

  // UpdateConfigure
  const _updateConfig = useCallback((config: Partial<any>) => {
    swManager.updateConfig(config);
  }, []);

  // GetSupport的功能
  const _getSupportedFeatures = useCallback(() => {
    return swManager.getSupportedFeatures();
  }, []);

  // Initialize
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 監聽NetworkStatus變化
  useEffect(() => {
    const _handleOnline = () => {
      setState(prev => ({
        ...prev,
        status: { ...prev.status, online: true },
      }));
    };

    const _handleOffline = () => {
      setState(prev => ({
        ...prev,
        status: { ...prev.status, online: false },
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 定期RefreshCacheInformation和性能指標
  useEffect(() => {
    const _interval = setInterval(() => {
      refreshCacheInfo();
      refreshPerformanceMetrics();
      refreshSyncQueue();
    }, 30000); // 每30SecondRefresh一次

    return () => clearInterval(interval);
  }, [refreshCacheInfo, refreshPerformanceMetrics, refreshSyncQueue]);

  return {
    // Status
    ...state,

    // Method
    initialize,
    updateApp,
    unregister,
    clearCache,
    refreshCacheInfo,
    addToSyncQueue,
    clearSyncQueue,
    registerBackgroundSync,
    refreshSyncQueue,
    sendNotification,
    prefetchResources,
    smartPrefetch,
    refreshPerformanceMetrics,
    updateConfig,
    getSupportedFeatures,
  };
};

// 簡化的 Hook，只提供基本功能
export const _useServiceWorkerBasic = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const _handleOnline = () => setIsOnline(true);
    const _handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check Service Worker Status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        setIsRegistered(registrations.length > 0);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const _sendNotification = useCallback(
    async (title: string, options?: NotificationOptions) => {
      try {
        await swManager.sendNotification(title, options);
      } catch (error) {
        // logger.info('SendNotificationFailed:', error);
      }
    },
    []
  );

  return {
    isOnline,
    isRegistered,
    sendNotification,
  };
};

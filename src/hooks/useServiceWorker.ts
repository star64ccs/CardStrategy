import { useState, useEffect, useCallback } from 'react';
import { swManager, CacheInfo, SyncData, PerformanceMetrics, PrefetchConfig } from '@/utils/serviceWorkerManager';

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

  // 緩存管理
  clearCache: (cacheName?: string) => Promise<void>;
  refreshCacheInfo: () => Promise<void>;

  // 同步功能
  addToSyncQueue: (data: SyncData) => void;
  clearSyncQueue: () => void;
  registerBackgroundSync: (tag: string, data?: any) => Promise<void>;
  refreshSyncQueue: () => void;

  // 通知功能
  sendNotification: (title: string, options?: NotificationOptions) => Promise<void>;

  // 預取功能
  prefetchResources: (config: PrefetchConfig) => Promise<void>;
  smartPrefetch: (currentUrl: string) => Promise<void>;

  // 性能監控
  refreshPerformanceMetrics: () => Promise<void>;

  // 配置管理
  updateConfig: (config: Partial<any>) => void;
  getSupportedFeatures: () => string[];
}

export const useServiceWorker = (): ServiceWorkerState & ServiceWorkerActions => {
  const [state, setState] = useState<ServiceWorkerState>({
    status: {
      registered: false,
      active: false,
      installing: false,
      waiting: false,
      online: navigator.onLine
    },
    cacheInfo: [],
    syncQueue: [],
    performanceMetrics: {
      cacheHits: 0,
      cacheMisses: 0,
      networkRequests: 0,
      errors: 0,
      hitRate: 0,
      lastReset: new Date()
    },
    isLoading: true,
    error: null
  });

  // 初始化 Service Worker
  const initialize = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await swManager.init();

      // 更新狀態
      const status = {
        ...swManager.getStatus(),
        online: navigator.onLine
      };

      const cacheInfo = await swManager.getCacheInfo();
      const syncQueue = swManager.getSyncQueue();
      const performanceMetrics = await swManager.getPerformanceMetrics();

      setState(prev => ({
        ...prev,
        status,
        cacheInfo,
        syncQueue,
        performanceMetrics,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '初始化失敗',
        isLoading: false
      }));
    }
  }, []);

  // 更新應用
  const updateApp = useCallback(async () => {
    try {
      await swManager.updateApp();
      // 重新初始化以獲取最新狀態
      await initialize();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '更新失敗'
      }));
    }
  }, [initialize]);

  // 註銷 Service Worker
  const unregister = useCallback(async () => {
    try {
      const result = await swManager.unregister();
      setState(prev => ({
        ...prev,
        status: {
          registered: false,
          active: false,
          installing: false,
          waiting: false,
          online: navigator.onLine
        }
      }));
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '註銷失敗'
      }));
      return false;
    }
  }, []);

  // 清理緩存
  const clearCache = useCallback(async (cacheName?: string) => {
    try {
      await swManager.clearCache(cacheName);
      // 重新獲取緩存信息
      await refreshCacheInfo();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '清理緩存失敗'
      }));
    }
  }, []);

  // 刷新緩存信息
  const refreshCacheInfo = useCallback(async () => {
    try {
      const cacheInfo = await swManager.getCacheInfo();
      setState(prev => ({ ...prev, cacheInfo }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '獲取緩存信息失敗'
      }));
    }
  }, []);

  // 添加到同步隊列
  const addToSyncQueue = useCallback((data: SyncData) => {
    swManager.addToSyncQueue(data);
    refreshSyncQueue();
  }, []);

  // 清空同步隊列
  const clearSyncQueue = useCallback(() => {
    swManager.clearSyncQueue();
    refreshSyncQueue();
  }, []);

  // 註冊背景同步
  const registerBackgroundSync = useCallback(async (tag: string, data?: any) => {
    try {
      await swManager.registerBackgroundSync(tag, data);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '註冊背景同步失敗'
      }));
    }
  }, []);

  // 刷新同步隊列
  const refreshSyncQueue = useCallback(() => {
    const syncQueue = swManager.getSyncQueue();
    setState(prev => ({ ...prev, syncQueue }));
  }, []);

  // 發送通知
  const sendNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    try {
      await swManager.sendNotification(title, options);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '發送通知失敗'
      }));
    }
  }, []);

  // 預取資源
  const prefetchResources = useCallback(async (config: PrefetchConfig) => {
    try {
      await swManager.prefetchResources(config);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '預取資源失敗'
      }));
    }
  }, []);

  // 智能預取
  const smartPrefetch = useCallback(async (currentUrl: string) => {
    try {
      await swManager.smartPrefetch(currentUrl);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '智能預取失敗'
      }));
    }
  }, []);

  // 刷新性能指標
  const refreshPerformanceMetrics = useCallback(async () => {
    try {
      const performanceMetrics = await swManager.getPerformanceMetrics();
      setState(prev => ({ ...prev, performanceMetrics }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '獲取性能指標失敗'
      }));
    }
  }, []);

  // 更新配置
  const updateConfig = useCallback((config: Partial<any>) => {
    swManager.updateConfig(config);
  }, []);

  // 獲取支持的功能
  const getSupportedFeatures = useCallback(() => {
    return swManager.getSupportedFeatures();
  }, []);

  // 初始化
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 監聽網絡狀態變化
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({
        ...prev,
        status: { ...prev.status, online: true }
      }));
    };

    const handleOffline = () => {
      setState(prev => ({
        ...prev,
        status: { ...prev.status, online: false }
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 定期刷新緩存信息和性能指標
  useEffect(() => {
    const interval = setInterval(() => {
      refreshCacheInfo();
      refreshPerformanceMetrics();
      refreshSyncQueue();
    }, 30000); // 每30秒刷新一次

    return () => clearInterval(interval);
  }, [refreshCacheInfo, refreshPerformanceMetrics, refreshSyncQueue]);

  return {
    // 狀態
    ...state,

    // 方法
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
    getSupportedFeatures
  };
};

// 簡化的 Hook，只提供基本功能
export const useServiceWorkerBasic = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 檢查 Service Worker 狀態
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

  const sendNotification = useCallback(async (
    title: string,
    options?: NotificationOptions
  ) => {
    try {
      await swManager.sendNotification(title, options);
    } catch (error) {
      // logger.info('發送通知失敗:', error);
    }
  }, []);

  return {
    isOnline,
    isRegistered,
    sendNotification
  };
};

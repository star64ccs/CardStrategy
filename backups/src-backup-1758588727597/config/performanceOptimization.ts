// 性能優化配置
export const PERFORMANCE_OPTIMIZATION_CONFIG = {
  // 應用啟動優化
  appStartup: {
    enableLazyLoading: true,
    enableAsyncLoading: true,
    preloadCriticalComponents: ['HomeScreen', 'Navigation'],
    maxInitialLoadTime: 2000, // ms
  },

  // 圖像處理優化
  imageProcessing: {
    enableWebWorkers: true,
    enableMemoryPool: true,
    maxImageSize: 1024 * 1024, // 1MB
    compressionQuality: 0.8,
    cacheSize: 50, // MB
  },

  // 數據同步優化
  dataSync: {
    enableCaching: true,
    cacheExpiry: 5 * 60 * 1000, // 5 minutes
    enableBackgroundSync: true,
    syncInterval: 30 * 1000, // 30 seconds
    maxRetries: 3,
  },

  // 搜索功能優化
  search: {
    enableDebounce: true,
    debounceDelay: 300, // ms
    enableVirtualization: true,
    pageSize: 20,
    maxResults: 1000,
  },

  // 數據庫優化
  database: {
    enableIndexing: true,
    enableQueryOptimization: true,
    enableConnectionPooling: true,
    maxConnections: 10,
    queryTimeout: 5000, // ms
  },

  // 網絡優化
  network: {
    enableRequestCaching: true,
    enableResponseCompression: true,
    enableRetryLogic: true,
    timeout: 10000, // ms
    maxConcurrentRequests: 5,
  },

  // 內存優化
  memory: {
    enableGarbageCollection: true,
    enableMemoryMonitoring: true,
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    cleanupInterval: 60 * 1000, // 1 minute
  },
};

// 性能監控閾值
export const PERFORMANCE_THRESHOLDS = {
  appStartup: {
    excellent: 1500, // ms
    good: 2000,
    fair: 3000,
    poor: 5000,
  },
  cardScanning: {
    excellent: 2000,
    good: 3000,
    fair: 4000,
    poor: 6000,
  },
  dataSync: {
    excellent: 500,
    good: 1000,
    fair: 2000,
    poor: 4000,
  },
  search: {
    excellent: 200,
    good: 500,
    fair: 1000,
    poor: 2000,
  },
};

// 性能優化策略
export const OPTIMIZATION_STRATEGIES = {
  lazyLoading: {
    enabled: true,
    components: ['HeavyComponent', 'NonCriticalComponent'],
    fallback: 'LoadingSpinner',
  },
  caching: {
    enabled: true,
    strategy: 'LRU',
    maxSize: 100,
    ttl: 300000, // 5 minutes
  },
  debouncing: {
    enabled: true,
    delay: 300,
    maxWait: 1000,
  },
  virtualization: {
    enabled: true,
    itemHeight: 50,
    overscan: 5,
  },
};

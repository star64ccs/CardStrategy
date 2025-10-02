// 性能Configure
module.exports = {
  // MonitorConfigure
  monitoring: {
    // ResponseTimeMonitor
    responseTime: {
      enabled: true,
      threshold: 1000, // 1Second
      alertThreshold: 3000, // 3Second
      sampleRate: 0.1, // 10% 採樣率
    },

    // MemoryMonitor
    memory: {
      enabled: true,
      warningThreshold: 0.8, // 80%
      criticalThreshold: 0.9, // 90%
      checkInterval: 30000, // 30Second
    },

    // DatabaseConnect池Monitor
    database: {
      enabled: true,
      maxConnections: 20,
      minConnections: 5,
      acquireTimeout: 60000,
      idleTimeout: 300000,
      checkInterval: 60000, // 1Minute
    },

    // Query性能Monitor
    query: {
      enabled: true,
      slowQueryThreshold: 1000, // 1Second
      logSlowQueries: true,
      maxQueryTime: 30000, // 30Second
    },
  },

  // CacheConfigure
  cache: {
    // Redis Cache
    redis: {
      enabled: true,
      ttl: {
        default: 300, // 5Minute
        cards: 1800, // 30Minute
        marketData: 300, // 5Minute
        userData: 600, // 10Minute
        aiResults: 3600, // 1Hour
      },
      maxMemory: '256mb',
      evictionPolicy: 'allkeys-lru',
    },

    // MemoryCache
    memory: {
      enabled: true,
      maxSize: 1000,
      ttl: 300, // 5Minute
    },
  },

  // 優化Configure
  optimization: {
    // Query優化
    query: {
      enableIndexing: true,
      batchSize: 100,
      maxBatchSize: 1000,
      enablePagination: true,
      defaultPageSize: 20,
      maxPageSize: 100,
    },

    // Graph片優化
    image: {
      compression: {
        quality: 85,
        format: 'webp',
        maxWidth: 1920,
        maxHeight: 1080,
      },
      thumbnail: {
        width: 300,
        height: 300,
        quality: 75,
      },
    },

    // API Response優化
    api: {
      enableCompression: true,
      enableCaching: true,
      enableRateLimiting: true,
      maxResponseSize: '10mb',
      timeout: 30000, // 30Second
    },
  },

  // 負載均衡Configure
  loadBalancing: {
    enabled: true,
    strategy: 'round-robin', // round-robin, least-connections, ip-hash
    healthCheck: {
      enabled: true,
      interval: 30000, // 30Second
      timeout: 5000, // 5Second
      unhealthyThreshold: 3,
      healthyThreshold: 2,
    },
  },

  // ErrorHandleConfigure
  errorHandling: {
    enableDetailedErrors: process.env.NODE_ENV === 'development',
    logErrors: true,
    notifyOnError: true,
    errorThreshold: 10, // 每MinuteError數
    recoveryTime: 300000, // 5Minute
  },

  // 性能指標Configure
  metrics: {
    enabled: true,
    collectionInterval: 60000, // 1Minute
    retention: {
      raw: 86400000, // 24Hour
      aggregated: 2592000000, // 30天
    },
    thresholds: {
      cpu: 0.8,
      memory: 0.8,
      disk: 0.9,
      network: 0.7,
    },
  },

  // Database優化Configure
  database: {
    // Connect池Configure
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 300000,
      evict: 60000,
    },

    // Query優化
    query: {
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableLogging: process.env.NODE_ENV === 'development',
    },

    // Index建議
    indexing: {
      enabled: true,
      autoAnalyze: true,
      analyzeInterval: 3600000, // 1Hour
    },
  },

  // FileUploadConfigure
  fileUpload: {
    maxFileSize: '10mb',
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    storage: {
      type: 'local', // local, s3, cloudinary
      path: './uploads',
      cleanup: {
        enabled: true,
        interval: 86400000, // 24Hour
        maxAge: 604800000, // 7天
      },
    },
  },

  // WebSocket Configure
  websocket: {
    enabled: true,
    pingInterval: 25000,
    pingTimeout: 5000,
    maxPayload: '1mb',
    perMessageDeflate: true,
  },

  // TaskQueueConfigure
  queue: {
    enabled: true,
    concurrency: 5,
    retryAttempts: 3,
    retryDelay: 5000,
    maxJobs: 1000,
    removeOnComplete: 100,
    removeOnFail: 50,
  },
};

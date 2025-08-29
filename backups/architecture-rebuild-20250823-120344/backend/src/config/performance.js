// 性能配置
module.exports = {
  // 監控配置
  monitoring: {
    // 響應時間監控
    responseTime: {
      enabled: true,
      threshold: 1000, // 1秒
      alertThreshold: 3000, // 3秒
      sampleRate: 0.1, // 10% 採樣率
    },

    // 內存監控
    memory: {
      enabled: true,
      warningThreshold: 0.8, // 80%
      criticalThreshold: 0.9, // 90%
      checkInterval: 30000, // 30秒
    },

    // 數據庫連接池監控
    database: {
      enabled: true,
      maxConnections: 20,
      minConnections: 5,
      acquireTimeout: 60000,
      idleTimeout: 300000,
      checkInterval: 60000, // 1分鐘
    },

    // 查詢性能監控
    query: {
      enabled: true,
      slowQueryThreshold: 1000, // 1秒
      logSlowQueries: true,
      maxQueryTime: 30000, // 30秒
    },
  },

  // 緩存配置
  cache: {
    // Redis 緩存
    redis: {
      enabled: true,
      ttl: {
        default: 300, // 5分鐘
        cards: 1800, // 30分鐘
        marketData: 300, // 5分鐘
        userData: 600, // 10分鐘
        aiResults: 3600, // 1小時
      },
      maxMemory: '256mb',
      evictionPolicy: 'allkeys-lru',
    },

    // 內存緩存
    memory: {
      enabled: true,
      maxSize: 1000,
      ttl: 300, // 5分鐘
    },
  },

  // 優化配置
  optimization: {
    // 查詢優化
    query: {
      enableIndexing: true,
      batchSize: 100,
      maxBatchSize: 1000,
      enablePagination: true,
      defaultPageSize: 20,
      maxPageSize: 100,
    },

    // 圖片優化
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

    // API 響應優化
    api: {
      enableCompression: true,
      enableCaching: true,
      enableRateLimiting: true,
      maxResponseSize: '10mb',
      timeout: 30000, // 30秒
    },
  },

  // 負載均衡配置
  loadBalancing: {
    enabled: true,
    strategy: 'round-robin', // round-robin, least-connections, ip-hash
    healthCheck: {
      enabled: true,
      interval: 30000, // 30秒
      timeout: 5000, // 5秒
      unhealthyThreshold: 3,
      healthyThreshold: 2,
    },
  },

  // 錯誤處理配置
  errorHandling: {
    enableDetailedErrors: process.env.NODE_ENV === 'development',
    logErrors: true,
    notifyOnError: true,
    errorThreshold: 10, // 每分鐘錯誤數
    recoveryTime: 300000, // 5分鐘
  },

  // 性能指標配置
  metrics: {
    enabled: true,
    collectionInterval: 60000, // 1分鐘
    retention: {
      raw: 86400000, // 24小時
      aggregated: 2592000000, // 30天
    },
    thresholds: {
      cpu: 0.8,
      memory: 0.8,
      disk: 0.9,
      network: 0.7,
    },
  },

  // 數據庫優化配置
  database: {
    // 連接池配置
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 300000,
      evict: 60000,
    },

    // 查詢優化
    query: {
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableLogging: process.env.NODE_ENV === 'development',
    },

    // 索引建議
    indexing: {
      enabled: true,
      autoAnalyze: true,
      analyzeInterval: 3600000, // 1小時
    },
  },

  // 文件上傳配置
  fileUpload: {
    maxFileSize: '10mb',
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    storage: {
      type: 'local', // local, s3, cloudinary
      path: './uploads',
      cleanup: {
        enabled: true,
        interval: 86400000, // 24小時
        maxAge: 604800000, // 7天
      },
    },
  },

  // WebSocket 配置
  websocket: {
    enabled: true,
    pingInterval: 25000,
    pingTimeout: 5000,
    maxPayload: '1mb',
    perMessageDeflate: true,
  },

  // 任務隊列配置
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

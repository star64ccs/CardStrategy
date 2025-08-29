const path = require('path');
const dotenv = require('dotenv');

// 根據環境加載對應的 .env 文件
const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : process.env.NODE_ENV === 'staging'
      ? '.env.staging'
      : process.env.NODE_ENV === 'test'
        ? '.env.test'
        : '.env';

dotenv.config({ path: path.join(__dirname, '..', envFile) });

const environments = {
  development: {
    // 服務器配置
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    nodeEnv: 'development',

    // 數據庫配置
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      name: process.env.DB_NAME || 'cardstrategy_dev',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      dialect: 'postgres',
      logging: console.log,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    },

    // Redis 配置
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || null,
      db: 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    },

    // JWT 配置
    jwt: {
      secret: process.env.JWT_SECRET || 'dev-secret-key',
      expiresIn: process.env.JWT_EXPIRE || '24h',
      refreshExpiresIn: '7d',
    },

    // 安全配置
    security: {
      bcryptRounds: 10,
      corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 分鐘
        max: 100, // 限制每個 IP 15 分鐘內最多 100 個請求
      },
    },

    // 文件上傳配置
    upload: {
      path: process.env.UPLOAD_PATH || path.join(__dirname, '..', 'uploads'),
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    },

    // 日誌配置
    logging: {
      level: 'debug',
      path: process.env.LOG_PATH || path.join(__dirname, '..', 'logs'),
      maxFiles: 30,
      maxSize: '10m',
    },

    // AI 配置
    ai: {
      modelPath: process.env.MODEL_PATH || path.join(__dirname, '..', 'models'),
      maxConcurrentRequests: 5,
      timeout: 30000,
    },

    // 監控配置
    monitoring: {
      enabled: true,
      interval: 60000, // 1 分鐘
      metrics: {
        cpu: { threshold: 80 },
        memory: { threshold: 85 },
        responseTime: { threshold: 2000 },
        errorRate: { threshold: 5 },
      },
    },
  },

  test: {
    // 服務器配置
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
    nodeEnv: 'test',

    // 數據庫配置
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      name: process.env.DB_NAME || 'cardstrategy_test',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    },

    // Redis 配置
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || null,
      db: 1,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    },

    // JWT 配置
    jwt: {
      secret: process.env.JWT_SECRET || 'test-secret-key',
      expiresIn: '1h',
      refreshExpiresIn: '7d',
    },

    // 安全配置
    security: {
      bcryptRounds: 4, // 測試環境使用較少的輪數
      corsOrigin: 'http://localhost:3000',
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 1000, // 測試環境允許更多請求
      },
    },

    // 文件上傳配置
    upload: {
      path: path.join(__dirname, '..', 'test-uploads'),
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png'],
    },

    // 日誌配置
    logging: {
      level: 'error',
      path: path.join(__dirname, '..', 'test-logs'),
      maxFiles: 5,
      maxSize: '1m',
    },

    // AI 配置
    ai: {
      modelPath: path.join(__dirname, '..', 'test-models'),
      maxConcurrentRequests: 2,
      timeout: 10000,
    },

    // 監控配置
    monitoring: {
      enabled: false,
      interval: 30000,
      metrics: {
        cpu: { threshold: 90 },
        memory: { threshold: 90 },
        responseTime: { threshold: 5000 },
        errorRate: { threshold: 10 },
      },
    },
  },

  staging: {
    // 服務器配置
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: 'staging',

    // 數據庫配置
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      name: process.env.DB_NAME || 'cardstrategy_staging',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 20,
        min: 5,
        acquire: 30000,
        idle: 10000,
      },
    },

    // Redis 配置
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || null,
      db: 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    },

    // JWT 配置
    jwt: {
      secret: process.env.JWT_SECRET || 'staging-secret-key',
      expiresIn: process.env.JWT_EXPIRE || '24h',
      refreshExpiresIn: '7d',
    },

    // 安全配置
    security: {
      bcryptRounds: 12,
      corsOrigin: process.env.CORS_ORIGIN || 'https://staging.cardstrategy.com',
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 200,
      },
    },

    // 文件上傳配置
    upload: {
      path: process.env.UPLOAD_PATH || '/app/uploads',
      maxSize: 20 * 1024 * 1024, // 20MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    },

    // 日誌配置
    logging: {
      level: 'info',
      path: process.env.LOG_PATH || '/app/logs',
      maxFiles: 30,
      maxSize: '20m',
    },

    // AI 配置
    ai: {
      modelPath: process.env.MODEL_PATH || '/app/models',
      maxConcurrentRequests: 10,
      timeout: 60000,
    },

    // 監控配置
    monitoring: {
      enabled: true,
      interval: 30000, // 30 秒
      metrics: {
        cpu: { threshold: 70 },
        memory: { threshold: 80 },
        responseTime: { threshold: 1500 },
        errorRate: { threshold: 3 },
      },
    },
  },

  production: {
    // 服務器配置
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: 'production',

    // 數據庫配置
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      name: process.env.DB_NAME || 'cardstrategy',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 50,
        min: 10,
        acquire: 30000,
        idle: 10000,
      },
      ssl:
        process.env.DB_SSL === 'true'
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : false,
    },

    // Redis 配置
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || null,
      db: 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableOfflineQueue: false,
    },

    // JWT 配置
    jwt: {
      secret: process.env.JWT_SECRET || 'production-secret-key',
      expiresIn: process.env.JWT_EXPIRE || '24h',
      refreshExpiresIn: '7d',
    },

    // 安全配置
    security: {
      bcryptRounds: 12,
      corsOrigin: process.env.CORS_ORIGIN || 'https://cardstrategy.com',
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 100,
      },
    },

    // 文件上傳配置
    upload: {
      path: process.env.UPLOAD_PATH || '/app/uploads',
      maxSize: 50 * 1024 * 1024, // 50MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    },

    // 日誌配置
    logging: {
      level: 'warn',
      path: process.env.LOG_PATH || '/app/logs',
      maxFiles: 60,
      maxSize: '50m',
    },

    // AI 配置
    ai: {
      modelPath: process.env.MODEL_PATH || '/app/models',
      maxConcurrentRequests: 20,
      timeout: 120000, // 2 分鐘
    },

    // 監控配置
    monitoring: {
      enabled: true,
      interval: 15000, // 15 秒
      metrics: {
        cpu: { threshold: 80 },
        memory: { threshold: 85 },
        responseTime: { threshold: 1000 },
        errorRate: { threshold: 1 },
      },
    },
  },
};

// 獲取當前環境配置
const getCurrentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return environments[env] || environments.development;
};

// 驗證配置
const validateConfig = (config) => {
  const required = ['database', 'redis', 'jwt', 'security'];
  const missing = required.filter((key) => !config[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }

  return config;
};

module.exports = {
  environments,
  getCurrentConfig,
  validateConfig,
  current: validateConfig(getCurrentConfig()),
};

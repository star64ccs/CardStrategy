const dotenv = require('dotenv');
const path = require('path');

// 根據NODE_ENV加載對應的環境文件
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const config = {
  // 服務器配置
  server: {
    port: parseInt(process.env.PORT) || 3000,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development'
  },

  // 數據庫配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5433,
    database: process.env.DB_NAME || 'cardstrategy_test',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'PostgresAdmin123!',
    ssl: process.env.DB_SSL === 'true'
  },

  // Redis配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || null
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'development_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  // API配置
  api: {
    rateLimitWindow: parseInt(process.env.API_RATE_LIMIT_WINDOW) || 15,
    rateLimitMax: parseInt(process.env.API_RATE_LIMIT_MAX) || 100
  },

  // 日誌配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  },

  // 監控配置
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    metricsPort: parseInt(process.env.METRICS_PORT) || 9090
  },

  // 安全配置
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    secureCookies: process.env.SECURE_COOKIES === 'true',
    trustProxy: process.env.TRUST_PROXY === 'true'
  },

  // 文件上傳配置
  upload: {
    maxFileSize: process.env.MAX_FILE_SIZE || '10MB',
    uploadPath: process.env.UPLOAD_PATH || 'uploads'
  },

  // 第三方API配置
  external: {
    ebay: {
      apiKey: process.env.EBAY_API_KEY,
      appId: process.env.EBAY_APP_ID
    }
  },

  // 錯誤監控
  sentry: {
    dsn: process.env.SENTRY_DSN
  }
};

module.exports = config;
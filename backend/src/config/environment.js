const path = require('path');

// 環境變量配置
const environment = {
  // 基本配置
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3000,
  HOST: process.env.HOST || 'localhost',

  // 數據庫配置
  DB_HOST: process.env.DB_HOST || process.env.POSTGRES_HOST || 'localhost',
  DB_PORT:
    parseInt(process.env.DB_PORT) ||
    parseInt(process.env.POSTGRES_PORT) ||
    5432,
  DB_NAME: process.env.DB_NAME || process.env.POSTGRES_DB || 'cardstrategy',
  DB_USER: process.env.DB_USER || process.env.POSTGRES_USER || 'postgres',
  DB_PASSWORD:
    process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'password',

  // Redis 配置
  REDIS_URL: process.env.REDIS_URL,
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  // JWT 配置
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-here',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // CORS 配置
  CORS_ORIGIN:
    process.env.CORS_ORIGIN ||
    process.env.FRONTEND_URL ||
    'http://localhost:3000',

  // AI API 配置
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  EXPO_PUBLIC_OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  COHERE_API_KEY: process.env.COHERE_API_KEY,

  // 文件上傳配置
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET,

  // 日誌配置
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // 郵件配置
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // 警報配置
  ALERT_WEBHOOK_URL: process.env.ALERT_WEBHOOK_URL,
  ALERT_EMAIL_TO: process.env.ALERT_EMAIL_TO,
  ALERT_EMAIL_FROM: process.env.ALERT_EMAIL_FROM || 'alerts@cardstrategy.com',

  // 備份配置
  BACKUP_DIR: process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups'),
  EXPORT_PATH: process.env.EXPORT_PATH || path.join(__dirname, '..', 'exports'),

  // 部署配置
  RENDER_TOKEN: process.env.RENDER_TOKEN,
  RENDER_STAGING_SERVICE_ID: process.env.RENDER_STAGING_SERVICE_ID,

  // 生產環境配置
  PRODUCTION_REDIS_HOST: process.env.PRODUCTION_REDIS_HOST,
  PRODUCTION_DB_HOST: process.env.PRODUCTION_DB_HOST,

  // 前端配置
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,

  // 加密配置
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'your-encryption-key-here',

  // 時區配置
  TZ: process.env.TZ || 'UTC',

  // API 版本
  API_VERSION: process.env.API_VERSION || 'v1',

  // 構建配置
  BUILD_NUMBER: process.env.BUILD_NUMBER || 'local',
};

// 環境變量驗證
const requiredEnvVars = {
  development: ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'],
  production: [
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'REDIS_HOST',
  ],
};

// 驗證環境變量
function validateEnvironment() {
  const env = environment.NODE_ENV;
  const required = requiredEnvVars[env] || requiredEnvVars.development;

  const missing = required.filter((varName) => !environment[varName]);

  if (missing.length > 0) {
    throw new Error(`缺少必要的環境變量: ${missing.join(', ')}`);
  }

  return true;
}

// 獲取環境配置
function getConfig() {
  return environment;
}

// 檢查是否為生產環境
function isProduction() {
  return environment.NODE_ENV === 'production';
}

// 檢查是否為開發環境
function isDevelopment() {
  return environment.NODE_ENV === 'development';
}

// 檢查是否為測試環境
function isTest() {
  return environment.NODE_ENV === 'test';
}

module.exports = {
  environment,
  validateEnvironment,
  getConfig,
  isProduction,
  isDevelopment,
  isTest,
};

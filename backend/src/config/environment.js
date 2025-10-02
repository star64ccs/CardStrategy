const path = require('path');

// 環境VariableConfigure
const environment = {
  // 基本Configure
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3000,
  HOST: process.env.HOST || 'localhost',

  // DatabaseConfigure
  DB_HOST: process.env.DB_HOST || process.env.POSTGRES_HOST || 'localhost',
  DB_PORT:
    parseInt(process.env.DB_PORT) ||
    parseInt(process.env.POSTGRES_PORT) ||
    5432,
  DB_NAME: process.env.DB_NAME || process.env.POSTGRES_DB || 'cardstrategy',
  DB_USER: process.env.DB_USER || process.env.POSTGRES_USER || 'postgres',
  DB_PASSWORD:
    process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'password',

  // Redis Configure
  REDIS_URL: process.env.REDIS_URL,
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  // JWT Configure
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-here',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // CORS Configure
  CORS_ORIGIN:
    process.env.CORS_ORIGIN ||
    process.env.FRONTEND_URL ||
    'http://localhost:3000',

  // AI API Configure
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  EXPO_PUBLIC_OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  COHERE_API_KEY: process.env.COHERE_API_KEY,

  // FileUploadConfigure
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET,

  // LogConfigure
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // 郵件Configure
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // AlertConfigure
  ALERT_WEBHOOK_URL: process.env.ALERT_WEBHOOK_URL,
  ALERT_EMAIL_TO: process.env.ALERT_EMAIL_TO,
  ALERT_EMAIL_FROM: process.env.ALERT_EMAIL_FROM || 'alerts@cardstrategy.com',

  // BackupConfigure
  BACKUP_DIR: process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups'),
  EXPORT_PATH: process.env.EXPORT_PATH || path.join(__dirname, '..', 'exports'),

  // DeployConfigure
  RENDER_TOKEN: process.env.RENDER_TOKEN,
  RENDER_STAGING_SERVICE_ID: process.env.RENDER_STAGING_SERVICE_ID,

  // 生產環境Configure
  PRODUCTION_REDIS_HOST: process.env.PRODUCTION_REDIS_HOST,
  PRODUCTION_DB_HOST: process.env.PRODUCTION_DB_HOST,

  // 前端Configure
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,

  // EncryptConfigure
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'your-encryption-key-here',

  // TimezoneConfigure
  TZ: process.env.TZ || 'UTC',

  // API Version
  API_VERSION: process.env.API_VERSION || 'v1',

  // BuildConfigure
  BUILD_NUMBER: process.env.BUILD_NUMBER || 'local',
};

// 環境VariableVerify
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

// Verify環境Variable
function validateEnvironment() {
  const env = environment.NODE_ENV;
  const required = requiredEnvVars[env] || requiredEnvVars.development;

  const missing = required.filter((varName) => !environment[varName]);

  if (missing.length > 0) {
    throw new Error(`缺少必要的環境變量: ${missing.join(', ')}`);
  }

  return true;
}

// Get環境Configure
function getConfig() {
  return environment;
}

// CheckYesNo為生產環境
function isProduction() {
  return environment.NODE_ENV === 'production';
}

// CheckYesNo為On發環境
function isDevelopment() {
  return environment.NODE_ENV === 'development';
}

// CheckYesNo為Test環境
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

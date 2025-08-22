const logger = require('../utils/logger');

// 模擬 Redis 客戶端（跳過 Redis 連接）
let isConnected = false;

// 連接到 Redis（跳過模式）
const connectRedis = async () => {
  logger.warn('Redis 服務不可用，跳過 Redis 連接，應用將在無緩存模式下運行');
  isConnected = false;
  return Promise.resolve();
};

// 健康檢查
const healthCheck = async () => {
  return false; // Redis 不可用
};

// 安全的 Redis 操作
const safeRedisOperation = async (operation) => {
  logger.warn('Redis 不可用，跳過操作');
  return null;
};

// 導出函數
module.exports = {
  redisClient: () => null,
  isConnected: () => false,
  connectRedis,
  healthCheck,
  safeRedisOperation,
};

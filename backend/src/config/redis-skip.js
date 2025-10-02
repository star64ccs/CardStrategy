const logger = require('../utils/logger');

// 模擬 Redis Client（Skip Redis Connect）
let isConnected = false;

// Connect到 Redis（Skip模式）
const connectRedis = async () => {
  logger.warn('Redis Service不可用，跳過 Redis Connect，應用將在無緩存模式下運行');
  isConnected = false;
  return Promise.resolve();
};

// 健康Check
const healthCheck = async () => {
  return false; // Redis 不可用
};

// 安全的 Redis Operation
const safeRedisOperation = async (operation) => {
  logger.warn('Redis 不可用，跳過操作');
  return null;
};

// ExportFunction
module.exports = {
  redisClient: () => null,
  isConnected: () => false,
  connectRedis,
  healthCheck,
  safeRedisOperation,
};

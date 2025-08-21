const redis = require('redis');
const logger = require('../utils/logger');

// Redis 配置
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 10000,
    keepAlive: 30000
  }
};

// 創建 Redis 客戶端
const redisClient = redis.createClient(redisConfig);

// 錯誤處理
redisClient.on('error', (err) => {
  logger.error('Redis 錯誤:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis 連接成功');
});

redisClient.on('ready', () => {
  logger.info('Redis 客戶端準備就緒');
});

redisClient.on('reconnecting', () => {
  logger.info('Redis 正在重新連接...');
});

redisClient.on('end', () => {
  logger.info('Redis 連接已關閉');
});

// 連接到 Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info('Redis 連接初始化成功');
  } catch (error) {
    logger.error('Redis 連接失敗:', error);
    throw error;
  }
};

// 健康檢查
const healthCheck = async () => {
  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    logger.error('Redis 健康檢查失敗:', error);
    return false;
  }
};

module.exports = {
  redisClient,
  connectRedis,
  healthCheck
};

const redis = require('redis');
const logger = require('../utils/logger');

// Redis 配置
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      logger.error('Redis 服務器拒絕連接:', options.error);
      return new Error('Redis 服務器拒絕連接');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      logger.error('Redis 重試時間超過限制');
      return new Error('重試時間超過限制');
    }
    if (options.attempt > 10) {
      logger.error('Redis 重試次數超過限制');
      return undefined;
    }
    const delay = Math.min(options.attempt * 100, 3000);
    logger.info(`Redis 重試連接，延遲: ${delay}ms`);
    return delay;
  },
  socket: {
    connectTimeout: 10000,
    keepAlive: 30000,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('Redis 重連次數超過限制');
        return false;
      }
      return Math.min(retries * 100, 3000);
    }
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

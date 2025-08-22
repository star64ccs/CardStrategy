const redis = require('redis');
const logger = require('../utils/logger');

// Redis 配置
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 5000, // 減少超時時間
    keepAlive: 30000,
  },
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      logger.warn('Redis 服務不可用，跳過 Redis 連接');
      return false; // 停止重試
    }
    if (options.total_retry_time > 5000) { // 5秒後停止
      logger.warn('Redis 重試時間超過5秒，停止重試');
      return false;
    }
    if (options.attempt > 1) { // 只重試1次
      logger.warn('Redis 重試次數超過1次，停止重試');
      return false;
    }
    return 1000; // 1秒後重試
  }
};

// 創建 Redis 客戶端
let redisClient = null;
let isConnected = false;

// 初始化 Redis 客戶端
const initRedis = () => {
  try {
    redisClient = redis.createClient(redisConfig);
    
    // 錯誤處理
    redisClient.on('error', (err) => {
      logger.warn('Redis 錯誤:', err.message);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      logger.info('Redis 連接成功');
      isConnected = true;
    });

    redisClient.on('ready', () => {
      logger.info('Redis 客戶端準備就緒');
      isConnected = true;
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis 正在重新連接...');
    });

    redisClient.on('end', () => {
      logger.info('Redis 連接已關閉');
      isConnected = false;
    });

    return redisClient;
  } catch (error) {
    logger.warn('Redis 客戶端創建失敗:', error.message);
    return null;
  }
};

// 連接到 Redis（寬容模式）
const connectRedis = async () => {
  try {
    if (!redisClient) {
      redisClient = initRedis();
    }
    
    if (redisClient) {
      await redisClient.connect();
      logger.info('Redis 連接初始化成功');
      isConnected = true;
    }
  } catch (error) {
    logger.warn('Redis 連接失敗，應用將在無緩存模式下運行:', error.message);
    isConnected = false;
  }
};

// 健康檢查
const healthCheck = async () => {
  if (!redisClient || !isConnected) {
    return false;
  }
  
  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    logger.warn('Redis 健康檢查失敗:', error.message);
    isConnected = false;
    return false;
  }
};

// 安全的 Redis 操作
const safeRedisOperation = async (operation) => {
  if (!redisClient || !isConnected) {
    logger.warn('Redis 不可用，跳過操作');
    return null;
  }
  
  try {
    return await operation();
  } catch (error) {
    logger.warn('Redis 操作失敗:', error.message);
    return null;
  }
};

// 導出函數
module.exports = {
  redisClient: () => redisClient,
  isConnected: () => isConnected,
  connectRedis,
  healthCheck,
  safeRedisOperation,
};

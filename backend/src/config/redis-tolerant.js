const redis = require('redis');
const logger = require('../utils/logger');

// Redis Configure
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 5000, // 減少超時Time
    keepAlive: 30000,
  },
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      logger.warn('Redis Service不可用，跳過 Redis Connect');
      return false; // StopRetry
    }
    if (options.total_retry_time > 5000) { // 5Second後Stop
      logger.warn('Redis 重試時間超過5秒，停止重試');
      return false;
    }
    if (options.attempt > 1) { // 只Retry1次
      logger.warn('Redis 重試次數超過1次，停止重試');
      return false;
    }
    return 1000; // 1Second後Retry
  }
};

// Create Redis Client
let redisClient = null;
let isConnected = false;

// Initialize Redis Client
const initRedis = () => {
  try {
    redisClient = redis.createClient(redisConfig);
    
    // ErrorHandle
    redisClient.on('error', (err) => {
      logger.warn('Redis Error:', err.message);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      logger.info('Redis ConnectSuccess');
      isConnected = true;
    });

    redisClient.on('ready', () => {
      logger.info('Redis 客戶端準備就緒');
      isConnected = true;
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis 正在重新Connect...');
    });

    redisClient.on('end', () => {
      logger.info('Redis Connect已關閉');
      isConnected = false;
    });

    return redisClient;
  } catch (error) {
    logger.warn('Redis 客戶端CreateFailed:', error.message);
    return null;
  }
};

// Connect到 Redis（寬容模式）
const connectRedis = async () => {
  try {
    if (!redisClient) {
      redisClient = initRedis();
    }
    
    if (redisClient) {
      await redisClient.connect();
      logger.info('Redis ConnectInitializeSuccess');
      isConnected = true;
    }
  } catch (error) {
    logger.warn('Redis ConnectFailed，應用將在無緩存模式下運行:', error.message);
    isConnected = false;
  }
};

// 健康Check
const healthCheck = async () => {
  if (!redisClient || !isConnected) {
    return false;
  }
  
  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    logger.warn('Redis 健康CheckFailed:', error.message);
    isConnected = false;
    return false;
  }
};

// 安全的 Redis Operation
const safeRedisOperation = async (operation) => {
  if (!redisClient || !isConnected) {
    logger.warn('Redis 不可用，跳過操作');
    return null;
  }
  
  try {
    return await operation();
  } catch (error) {
    logger.warn('Redis 操作Failed:', error.message);
    return null;
  }
};

// ExportFunction
module.exports = {
  redisClient: () => redisClient,
  isConnected: () => isConnected,
  connectRedis,
  healthCheck,
  safeRedisOperation,
};

const redis = require('redis');
const logger = require('../utils/logger');

// Redis Configure
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 10000,
    keepAlive: 30000,
  },
};

// Create Redis Client
const redisClient = redis.createClient(redisConfig);

// ErrorHandle
redisClient.on('error', (err) => {
  logger.error('Redis Error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis ConnectSuccess');
});

redisClient.on('ready', () => {
  logger.info('Redis 客戶端準備就緒');
});

redisClient.on('reconnecting', () => {
  logger.info('Redis 正在重新Connect...');
});

redisClient.on('end', () => {
  logger.info('Redis Connect已關閉');
});

// Connect到 Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info('Redis ConnectInitializeSuccess');
  } catch (error) {
    logger.error('Redis ConnectFailed:', error);
    throw error;
  }
};

// 健康Check
const healthCheck = async () => {
  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    logger.error('Redis 健康CheckFailed:', error);
    return false;
  }
};

module.exports = {
  redisClient,
  connectRedis,
  healthCheck,
};

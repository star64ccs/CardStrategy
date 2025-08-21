const Redis = require('ioredis');
const { config } = require('./unified');

// Redis 客戶端配置
const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
  keyPrefix: config.redis.keyPrefix,
  
  // 連接配置
  retryDelayOnFailover: config.redis.retryDelayOnFailover,
  maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
  
  // 超時配置
  connectTimeout: 10000,
  commandTimeout: 5000,
  
  // 重連配置
  lazyConnect: true,
  keepAlive: 30000,
  
  // 集群配置（如果使用）
  enableReadyCheck: true,
  maxLoadingTimeout: 10000
};

// 創建 Redis 客戶端
let redisClient = null;

const createRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis(redisConfig);
    
    redisClient.on('connect', () => {
      console.log('Redis 連接成功');
    });
    
    redisClient.on('error', (error) => {
      console.error('Redis 連接錯誤:', error);
    });
    
    redisClient.on('close', () => {
      console.log('Redis 連接關閉');
    });
    
    redisClient.on('reconnecting', () => {
      console.log('Redis 重新連接中...');
    });
  }
  
  return redisClient;
};

// 連接 Redis
const connectRedis = async () => {
  try {
    const client = createRedisClient();
    await client.ping();
    return client;
  } catch (error) {
    console.error('Redis 連接失敗:', error);
    throw error;
  }
};

// 健康檢查
const healthCheck = async () => {
  try {
    const client = createRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    console.error('Redis 健康檢查失敗:', error);
    return false;
  }
};

// 緩存工具函數
const cacheUtils = {
  // 設置緩存
  async set(key, value, ttl = 3600) {
    try {
      const client = createRedisClient();
      await client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('設置緩存失敗:', error);
      return false;
    }
  },
  
  // 獲取緩存
  async get(key) {
    try {
      const client = createRedisClient();
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('獲取緩存失敗:', error);
      return null;
    }
  },
  
  // 刪除緩存
  async del(key) {
    try {
      const client = createRedisClient();
      await client.del(key);
      return true;
    } catch (error) {
      console.error('刪除緩存失敗:', error);
      return false;
    }
  },
  
  // 清空所有緩存
  async flush() {
    try {
      const client = createRedisClient();
      await client.flushdb();
      return true;
    } catch (error) {
      console.error('清空緩存失敗:', error);
      return false;
    }
  }
};

module.exports = {
  createRedisClient,
  connectRedis,
  healthCheck,
  cacheUtils
};

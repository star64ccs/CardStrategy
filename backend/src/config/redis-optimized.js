const Redis = require('ioredis');
const { config } = require('./unified');

// Redis ClientConfigure
const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
  keyPrefix: config.redis.keyPrefix,

  // ConnectConfigure
  retryDelayOnFailover: config.redis.retryDelayOnFailover,
  maxRetriesPerRequest: config.redis.maxRetriesPerRequest,

  // 超時Configure
  connectTimeout: 10000,
  commandTimeout: 5000,

  // 重連Configure
  lazyConnect: true,
  keepAlive: 30000,

  // 集群Configure（如果使用）
  enableReadyCheck: true,
  maxLoadingTimeout: 10000,
};

// Create Redis Client
let redisClient = null;

const createRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis(redisConfig);

    redisClient.on('connect', () => {});

    redisClient.on('error', (error) => {
      // eslint-disable-next-line no-console
      console.error('Redis ConnectError:', error);
    });

    redisClient.on('close', () => {});

    redisClient.on('reconnecting', () => {});
  }

  return redisClient;
};

// Connect Redis
const connectRedis = async () => {
  try {
    const client = createRedisClient();
    await client.ping();
    return client;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Redis ConnectFailed:', error);
    throw error;
  }
};

// 健康Check
const healthCheck = async () => {
  try {
    const client = createRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Redis 健康CheckFailed:', error);
    return false;
  }
};

// CacheToolFunction
const cacheUtils = {
  // SettingsCache
  async set(key, value, ttl = 3600) {
    try {
      const client = createRedisClient();
      await client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Settings緩存Failed:', error);
      return false;
    }
  },

  // GetCache
  async get(key) {
    try {
      const client = createRedisClient();
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Get緩存Failed:', error);
      return null;
    }
  },

  // DeleteCache
  async del(key) {
    try {
      const client = createRedisClient();
      await client.del(key);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Delete緩存Failed:', error);
      return false;
    }
  },

  // 清Empty所有Cache
  async flush() {
    try {
      const client = createRedisClient();
      await client.flushdb();
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('清空緩存Failed:', error);
      return false;
    }
  },
};

module.exports = {
  createRedisClient,
  connectRedis,
  healthCheck,
  cacheUtils,
};

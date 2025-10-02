const redis = require('redis');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');

/**
 * 高級CacheService
 * 提供智能Cache策略、預熱機制、失效策略等功能
 */
class AdvancedCacheService {
  constructor() {
    this.redisClient = null;
    this.memoryCache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
    };
    this.cacheConfig = {
      // Cache策略Configure
      strategies: {
        // 卡片DataCache策略
        cards: {
          ttl: 300, // 5Minute
          pattern: 'cache:cards:*',
          invalidation: 'onUpdate',
          preload: true,
          compression: true,
        },
        // 市場DataCache策略
        marketData: {
          ttl: 60, // 1Minute
          pattern: 'cache:market:*',
          invalidation: 'timeBased',
          preload: false,
          compression: true,
        },
        // UserDataCache策略
        userData: {
          ttl: 1800, // 30Minute
          pattern: 'cache:users:*',
          invalidation: 'onLogin',
          preload: true,
          compression: false,
        },
        // API ResponseCache策略
        apiResponse: {
          ttl: 600, // 10Minute
          pattern: 'cache:api:*',
          invalidation: 'timeBased',
          preload: false,
          compression: true,
        },
      },
      // 記憶體CacheConfigure
      memoryCache: {
        maxSize: 1000, // 最大項目數
        maxMemory: 100 * 1024 * 1024, // 100MB
        ttl: 300000, // 5Minute
      },
      // 預熱Configure
      preload: {
        enabled: true,
        batchSize: 50,
        concurrency: 5,
      },
    };

    this.initRedis();
    this.startStatsCollection();
  }

  /**
   * Initialize Redis Connect
   */
  async initRedis() {
    try {
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 5000,
          lazyConnect: true,
        },
      });

      this.redisClient.on('error', (err) => {
        logger.error('Redis ConnectError:', err);
        this.cacheStats.errors++;
      });

      this.redisClient.on('connect', () => {
        logger.info('Redis ConnectSuccess');
      });

      await this.redisClient.connect();
    } catch (error) {
      logger.warn('Redis ConnectFailed，將使用記憶體緩存:', error.message);
      this.redisClient = null;
    }
  }

  /**
   * 智能CacheGet
   */
  async get(key, strategy = 'apiResponse') {
// eslint-disable-next-line no-unused-vars
    const config = this.cacheConfig.strategies[strategy];
    const fullKey = `${config.pattern.replace('*', '')}${key}`;

    try {
      // 先Check記憶體Cache
      const memoryResult = this.getFromMemory(fullKey);
      if (memoryResult) {
        this.cacheStats.hits++;
        return memoryResult;
      }

      // Check Redis Cache
      if (this.redisClient) {
        const redisResult = await this.redisClient.get(fullKey);
        if (redisResult) {
          const parsed = config.compression
            ? JSON.parse(redisResult)
            : redisResult;

          // 存入記憶體Cache
          this.setToMemory(fullKey, parsed, config.ttl);
          this.cacheStats.hits++;
          return parsed;
        }
      }

      this.cacheStats.misses++;
      return null;
    } catch (error) {
      logger.error('緩存GetFailed:', error);
      this.cacheStats.errors++;
      return null;
    }
  }

  /**
   * 智能CacheSettings
   */
  async set(key, value, strategy = 'apiResponse') {
// eslint-disable-next-line no-unused-vars
    const config = this.cacheConfig.strategies[strategy];
    const fullKey = `${config.pattern.replace('*', '')}${key}`;

    try {
      // Settings記憶體Cache
      this.setToMemory(fullKey, value, config.ttl);

      // Settings Redis Cache
      if (this.redisClient) {
        const serialized = config.compression ? JSON.stringify(value) : value;

        await this.redisClient.setEx(fullKey, config.ttl, serialized);
      }

      this.cacheStats.sets++;
      return true;
    } catch (error) {
      logger.error('緩存SettingsFailed:', error);
      this.cacheStats.errors++;
      return false;
    }
  }

  /**
   * BatchCacheOperation
   */
  async mget(keys, strategy = 'apiResponse') {
// eslint-disable-next-line no-unused-vars
    const config = this.cacheConfig.strategies[strategy];
    const fullKeys = keys.map(
      (key) => `${config.pattern.replace('*', '')}${key}`
    );

    try {
// eslint-disable-next-line no-unused-vars
      const results = [];

      for (const fullKey of fullKeys) {
        // 先Check記憶體Cache
        const memoryResult = this.getFromMemory(fullKey);
        if (memoryResult) {
          results.push(memoryResult);
          this.cacheStats.hits++;
        } else {
          results.push(null);
          this.cacheStats.misses++;
        }
      }

      // Batch從 Redis Get缺失的Data
      if (this.redisClient) {
        const missingKeys = fullKeys.filter(
          (_, index) => results[index] === null
        );
        if (missingKeys.length > 0) {
          const redisResults = await this.redisClient.mGet(missingKeys);

          let redisIndex = 0;
          for (let i = 0; i < results.length; i++) {
            if (results[i] === null) {
              const redisResult = redisResults[redisIndex];
              if (redisResult) {
                const parsed = config.compression
                  ? JSON.parse(redisResult)
                  : redisResult;

                results[i] = parsed;
                this.setToMemory(fullKeys[i], parsed, config.ttl);
                this.cacheStats.hits++;
              }
              redisIndex++;
            }
          }
        }
      }

      return results;
    } catch (error) {
      logger.error('批量緩存GetFailed:', error);
      this.cacheStats.errors++;
      return keys.map(() => null);
    }
  }

  /**
   * BatchCacheSettings
   */
  async mset(keyValuePairs, strategy = 'apiResponse') {
// eslint-disable-next-line no-unused-vars
    const config = this.cacheConfig.strategies[strategy];

    try {
// eslint-disable-next-line no-unused-vars
      const promises = keyValuePairs.map(([key, value]) =>
        this.set(key, value, strategy)
      );

      await Promise.all(promises);
      return true;
    } catch (error) {
      logger.error('批量緩存SettingsFailed:', error);
      this.cacheStats.errors++;
      return false;
    }
  }

  /**
   * 智能Cache失效
   */
  async invalidate(pattern, strategy = 'apiResponse') {
// eslint-disable-next-line no-unused-vars
    const config = this.cacheConfig.strategies[strategy];
    const fullPattern = `${config.pattern.replace('*', '')}${pattern}`;

    try {
      // 清理記憶體Cache
      this.clearMemoryCache(fullPattern);

      // 清理 Redis Cache
      if (this.redisClient) {
// eslint-disable-next-line no-unused-vars
        const keys = await this.redisClient.keys(fullPattern);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
        }
      }

      this.cacheStats.deletes++;
      return true;
    } catch (error) {
      logger.error('緩存失效Failed:', error);
      this.cacheStats.errors++;
      return false;
    }
  }

  /**
   * Cache預熱
   */
  async preload(dataProvider, strategy = 'apiResponse') {
    if (!this.cacheConfig.preload.enabled) {
      return;
    }

// eslint-disable-next-line no-unused-vars
    const config = this.cacheConfig.strategies[strategy];
    if (!config.preload) {
      return;
    }

    try {
      logger.info(`開始預熱緩存: ${strategy}`);

// eslint-disable-next-line no-unused-vars
      const data = await dataProvider();
      const batches = this.chunkArray(data, this.cacheConfig.preload.batchSize);

      for (const batch of batches) {
        await Promise.all(
          batch.map((item) => this.set(item.key, item.value, strategy))
        );

        // ControlConcurrent
        await this.delay(100);
      }

      logger.info(`緩存預熱完成: ${strategy}, 共 ${data.length} 個項目`);
    } catch (error) {
      logger.error('緩存預熱Failed:', error);
    }
  }

  /**
   * GetCacheStatistics
   */
  getStats() {
    const hitRate =
      this.cacheStats.hits + this.cacheStats.misses > 0
        ? (
            (this.cacheStats.hits /
              (this.cacheStats.hits + this.cacheStats.misses)) *
            100
          ).toFixed(2)
        : 0;

    return {
      ...this.cacheStats,
      hitRate: `${hitRate}%`,
      memoryCacheSize: this.memoryCache.size,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 清理過期Cache
   */
  async cleanup() {
    try {
      // 清理記憶體Cache
      this.cleanupMemoryCache();

      // 清理 Redis Cache（Redis 會Auto清理過期Key）
      if (this.redisClient) {
        // 可以AddCustom清理邏輯
        logger.info('緩存清理完成');
      }
    } catch (error) {
      logger.error('緩存清理Failed:', error);
    }
  }

  // PrivateMethod

  /**
   * 從記憶體CacheGet
   */
  getFromMemory(key) {
    const item = this.memoryCache.get(key);
    if (item && Date.now() < item.expiry) {
      return item.value;
    }

    if (item) {
      this.memoryCache.delete(key);
    }
    return null;
  }

  /**
   * Settings記憶體Cache
   */
  setToMemory(key, value, ttl) {
    // Check記憶體使用量
    if (this.memoryCache.size >= this.cacheConfig.memoryCache.maxSize) {
      this.evictOldestFromMemory();
    }

    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000,
    });
  }

  /**
   * 清理記憶體Cache
   */
  clearMemoryCache(pattern) {
// eslint-disable-next-line no-unused-vars
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * 清理過期記憶體Cache
   */
  cleanupMemoryCache() {
// eslint-disable-next-line no-unused-vars
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (now >= item.expiry) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * 驅逐最舊的記憶體Cache項目
   */
  evictOldestFromMemory() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expiry < oldestTime) {
        oldestTime = item.expiry;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  /**
   * Array分塊
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 延遲Function
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * BeginStatistics收集
   */
  startStatsCollection() {
    // 每Minute收集一次Statistics
    setInterval(() => {
      const stats = this.getStats();
      logger.info('緩存統計:', stats);
    }, 60000);

    // 每Hour清理一次過期Cache
    setInterval(() => {
      this.cleanup();
    }, 3600000);
  }
}

// Create單例Instance
const advancedCacheService = new AdvancedCacheService();

module.exports = advancedCacheService;

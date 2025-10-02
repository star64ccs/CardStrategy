const { logger } = require('../utils/logger');
const redisConfig = require('../../config/redis');
// eslint-disable-next-line no-unused-vars
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Get Redis Client
const getRedisClient = () => redisConfig.getClient();

/**
 * 性能優化Service
 * 提供APIResponse優化、Cache策略、負載均衡等功能
 */
class PerformanceOptimizer {
  constructor() {
    this.cacheConfig = {
      defaultTTL: 300, // 5Minute
      maxSize: 100 * 1024 * 1024, // 100MB
      compression: true,
      versioning: true,
    };

    this.responseConfig = {
      compression: true,
      gzipLevel: 6,
      minSize: 1024,
      threshold: 0.1,
    };

    this.rateLimitConfig = {
      windowMs: 15 * 60 * 1000, // 15Minute
      max: 100, // Limit每個IP 15Minute內最多100個Request
      message: '請求過於頻繁，請稍後再試',
      standardHeaders: true,
      legacyHeaders: false,
    };

    this.metrics = {
      requests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgResponseTime: 0,
      totalResponseTime: 0,
      errors: 0,
    };
  }

  /**
   * Create壓縮中間件
   */
  createCompressionMiddleware() {
    return compression({
      level: this.responseConfig.gzipLevel,
      threshold: this.responseConfig.minSize,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
    });
  }

  /**
   * Create速率Limit中間件
   */
  createRateLimitMiddleware(options = {}) {
// eslint-disable-next-line no-unused-vars
    const config = { ...this.rateLimitConfig, ...options };

    return rateLimit({
      windowMs: config.windowMs,
      max: config.max,
      message: config.message,
      standardHeaders: config.standardHeaders,
      legacyHeaders: config.legacyHeaders,
      handler: (req, res) => {
        logger.warn(`速率限制觸發: ${req.ip} - ${req.originalUrl}`);
        res.status(429).json({
          error: '請求過於頻繁',
          message: config.message,
          retryAfter: Math.ceil(config.windowMs / 1000),
        });
      },
      keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress;
      },
    });
  }

  /**
   * CreateCache中間件
   */
  createCacheMiddleware(
    ttl = this.cacheConfig.defaultTTL,
    keyGenerator = null
  ) {
    return async (req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = keyGenerator
        ? keyGenerator(req)
        : this.generateCacheKey(req);

      try {
        // 嘗試從CacheGet
        const redisClient = getRedisClient();
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          this.metrics.cacheHits++;
// eslint-disable-next-line no-unused-vars
          const data = JSON.parse(cached);
          return res.json(data);
        }

        // Cache未命中，ContinueHandleRequest
        this.metrics.cacheMisses++;

        // 重寫 res.json Method以CacheResponse
        const originalJson = res.json;
        res.json = function (data) {
          // CacheResponse
          const redisClient = getRedisClient();
          redisClient
            .setEx(cacheKey, ttl, JSON.stringify(data))
            .catch((err) => logger.error('緩存SettingsFailed:', err));

          // 調用原始Method
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        logger.error('緩存中間件Error:', error);
        next();
      }
    };
  }

  /**
   * 生成CacheKey
   */
  generateCacheKey(req) {
    const { method, originalUrl, query, params } = req;
// eslint-disable-next-line no-unused-vars
    const key = `${method}:${originalUrl}:${JSON.stringify(query)}:${JSON.stringify(params)}`;
    return `cache:${this.hashString(key)}`;
  }

  /**
   * 字符串哈希Function
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert為32位整數
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 智能Cache策略
   */
  async smartCache(key, fetchFunction, options = {}) {
    const {
      ttl = this.cacheConfig.defaultTTL,
      staleWhileRevalidate = 60,
      forceRefresh = false,
    } = options;

    try {
      if (forceRefresh) {
// eslint-disable-next-line no-unused-vars
        const data = await fetchFunction();
        await this.setCache(key, data, ttl);
        return data;
      }

      // 嘗試GetCache
      const redisClient = getRedisClient();
      const cached = await redisClient.get(key);
      if (cached) {
// eslint-disable-next-line no-unused-vars
        const data = JSON.parse(cached);
        this.metrics.cacheHits++;

        // CheckYesNo需要後台Refresh
        const ttlRemaining = await redisClient.ttl(key);
        if (ttlRemaining < staleWhileRevalidate) {
          // 後台RefreshCache
          this.backgroundRefresh(key, fetchFunction, ttl);
        }

        return data;
      }

      // Cache未命中
      this.metrics.cacheMisses++;
// eslint-disable-next-line no-unused-vars
      const data = await fetchFunction();
      await this.setCache(key, data, ttl);
      return data;
    } catch (error) {
      logger.error('智能緩存Error:', error);
      // Downgrade到直接Get
      return await fetchFunction();
    }
  }

  /**
   * 後台RefreshCache
   */
  async backgroundRefresh(key, fetchFunction, ttl) {
    setImmediate(async () => {
      try {
// eslint-disable-next-line no-unused-vars
        const data = await fetchFunction();
        await this.setCache(key, data, ttl);
        logger.info(`後台刷新緩存Success: ${key}`);
      } catch (error) {
        logger.error(`後台刷新緩存Failed: ${key}`, error);
      }
    });
  }

  /**
   * SettingsCache
   */
  async setCache(key, data, ttl) {
    try {
      const value = this.cacheConfig.compression
        ? this.compressData(data)
        : JSON.stringify(data);

      const redisClient = getRedisClient();
      await redisClient.setEx(key, ttl, value);
      logger.debug(`緩存SettingsSuccess: ${key}, TTL: ${ttl}s`);
    } catch (error) {
      logger.error('Settings緩存Failed:', error);
    }
  }

  /**
   * 壓縮Data
   */
  compressData(data) {
    const zlib = require('zlib');
    const jsonString = JSON.stringify(data);
    return zlib.gzipSync(jsonString).toString('base64');
  }

  /**
   * 解壓縮Data
   */
  decompressData(compressedData) {
    const zlib = require('zlib');
    const buffer = Buffer.from(compressedData, 'base64');
    const jsonString = zlib.gunzipSync(buffer).toString();
    return JSON.parse(jsonString);
  }

  /**
   * BatchCacheOperation
   */
  async batchCache(operations) {
    const redisClient = getRedisClient();
    const pipeline = redisClient.multi();
// eslint-disable-next-line no-unused-vars
    const results = [];

    for (const operation of operations) {
      const { type, key, data, ttl } = operation;

      switch (type) {
        case 'set':
          pipeline.setex(
            key,
            ttl || this.cacheConfig.defaultTTL,
            JSON.stringify(data)
          );
          break;
        case 'get':
          pipeline.get(key);
          break;
        case 'del':
          pipeline.del(key);
          break;
      }
    }

    try {
// eslint-disable-next-line no-unused-vars
      const responses = await pipeline.exec();
      return responses.map(([err, result]) => {
        if (err) {
          logger.error('批量緩存操作Error:', err);
          return null;
        }
        return result;
      });
    } catch (error) {
      logger.error('批量緩存操作Failed:', error);
      throw error;
    }
  }

  /**
   * Cache預熱
   */
  async warmupCache(endpoints) {
    logger.info(`開始緩存預熱，共 ${endpoints.length} 個端點`);

// eslint-disable-next-line no-unused-vars
    const promises = endpoints.map(async (endpoint) => {
      try {
        const { url, ttl = this.cacheConfig.defaultTTL } = endpoint;
// eslint-disable-next-line no-unused-vars
        const response = await fetch(url);
// eslint-disable-next-line no-unused-vars
        const data = await response.json();

        const cacheKey = this.generateCacheKey({ originalUrl: url });
        await this.setCache(cacheKey, data, ttl);

        logger.info(`緩存預熱Success: ${url}`);
        return { url, status: 'success' };
      } catch (error) {
        logger.error(`緩存預熱Failed: ${endpoint.url}`, error);
        return { url: endpoint.url, status: 'error', error: error.message };
      }
    });

// eslint-disable-next-line no-unused-vars
    const results = await Promise.allSettled(promises);
// eslint-disable-next-line no-unused-vars
    const summary = {
      total: endpoints.length,
      success: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
    };

    logger.info('緩存預熱完成:', summary);
    return summary;
  }

  /**
   * Cache清理
   */
  async clearCache(pattern = '*') {
    try {
      const redisClient = getRedisClient();
// eslint-disable-next-line no-unused-vars
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.info(`緩存清理完成，刪除 ${keys.length} 個鍵`);
        return keys.length;
      }
      return 0;
    } catch (error) {
      logger.error('緩存清理Failed:', error);
      throw error;
    }
  }

  /**
   * ResponseTimeMonitor中間件
   */
  createResponseTimeMiddleware() {
    return (req, res, next) => {
      const start = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - start;
        this.recordResponseTime(duration);

        if (duration > 1000) {
          logger.warn(
            `慢響應警告: ${req.method} ${req.originalUrl} 耗時 ${duration}ms`
          );
        }
      });

      next();
    };
  }

  /**
   * RecordResponseTime
   */
  recordResponseTime(duration) {
    this.metrics.requests++;
    this.metrics.totalResponseTime += duration;
    this.metrics.avgResponseTime =
      this.metrics.totalResponseTime / this.metrics.requests;
  }

  /**
   * ErrorMonitor中間件
   */
  createErrorMonitorMiddleware() {
    return (err, req, res, next) => { // eslint-disable-next-line no-unused-vars
      this.metrics.errors++;

      logger.error('APIError:', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      next(err);
    };
  }

  /**
   * Get性能指標
   */
  getMetrics() {
    const cacheHitRate =
      this.metrics.requests > 0
        ? (this.metrics.cacheHits /
            (this.metrics.cacheHits + this.metrics.cacheMisses)) *
          100
        : 0;

    return {
      ...this.metrics,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      errorRate:
        this.metrics.requests > 0
          ? (this.metrics.errors / this.metrics.requests) * 100
          : 0,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Reset指標
   */
  resetMetrics() {
    this.metrics = {
      requests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgResponseTime: 0,
      totalResponseTime: 0,
      errors: 0,
    };
    logger.info('性能指標已重置');
  }

  /**
   * 健康Check
   */
  async healthCheck() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {},
    };

    try {
      // CheckRedisConnect
      const redisClient = getRedisClient();
      await redisClient.ping();
      health.checks.redis = 'healthy';
    } catch (error) {
      health.checks.redis = 'unhealthy';
      health.status = 'degraded';
      health.redisError = error.message;
    }

    // CheckCache命中率
    const metrics = this.getMetrics();
    if (metrics.cacheHitRate < 50) {
      health.checks.cache = 'warning';
      health.status = 'degraded';
    } else {
      health.checks.cache = 'healthy';
    }

    // CheckError率
    if (metrics.errorRate > 5) {
      health.checks.errors = 'warning';
      health.status = 'degraded';
    } else {
      health.checks.errors = 'healthy';
    }

    return health;
  }

  /**
   * UpdateConfigure
   */
  updateConfig(newConfig) {
    if (newConfig.cacheConfig) {
      this.cacheConfig = { ...this.cacheConfig, ...newConfig.cacheConfig };
    }
    if (newConfig.responseConfig) {
      this.responseConfig = {
        ...this.responseConfig,
        ...newConfig.responseConfig,
      };
    }
    if (newConfig.rateLimitConfig) {
      this.rateLimitConfig = {
        ...this.rateLimitConfig,
        ...newConfig.rateLimitConfig,
      };
    }

    logger.info('性能優化器配置已更新:', newConfig);
  }

  /**
   * GetConfigure
   */
  getConfig() {
    return {
      cacheConfig: this.cacheConfig,
      responseConfig: this.responseConfig,
      rateLimitConfig: this.rateLimitConfig,
    };
  }
}

// Create單例Instance
const performanceOptimizer = new PerformanceOptimizer();

module.exports = performanceOptimizer;

const { logger } = require('../utils/logger');
const redisConfig = require('../../config/redis');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// 獲取 Redis 客戶端
const getRedisClient = () => redisConfig.getClient();

/**
 * 性能優化服務
 * 提供API響應優化、緩存策略、負載均衡等功能
 */
class PerformanceOptimizer {
  constructor() {
    this.cacheConfig = {
      defaultTTL: 300, // 5分鐘
      maxSize: 100 * 1024 * 1024, // 100MB
      compression: true,
      versioning: true
    };

    this.responseConfig = {
      compression: true,
      gzipLevel: 6,
      minSize: 1024,
      threshold: 0.1
    };

    this.rateLimitConfig = {
      windowMs: 15 * 60 * 1000, // 15分鐘
      max: 100, // 限制每個IP 15分鐘內最多100個請求
      message: '請求過於頻繁，請稍後再試',
      standardHeaders: true,
      legacyHeaders: false
    };

    this.metrics = {
      requests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgResponseTime: 0,
      totalResponseTime: 0,
      errors: 0
    };
  }

  /**
   * 創建壓縮中間件
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
      }
    });
  }

  /**
   * 創建速率限制中間件
   */
  createRateLimitMiddleware(options = {}) {
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
          retryAfter: Math.ceil(config.windowMs / 1000)
        });
      },
      keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress;
      }
    });
  }

  /**
   * 創建緩存中間件
   */
  createCacheMiddleware(ttl = this.cacheConfig.defaultTTL, keyGenerator = null) {
    return async (req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = keyGenerator ? keyGenerator(req) : this.generateCacheKey(req);

      try {
        // 嘗試從緩存獲取
        const redisClient = getRedisClient();
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          this.metrics.cacheHits++;
          const data = JSON.parse(cached);
          return res.json(data);
        }

        // 緩存未命中，繼續處理請求
        this.metrics.cacheMisses++;

        // 重寫 res.json 方法以緩存響應
        const originalJson = res.json;
        res.json = function(data) {
          // 緩存響應
          const redisClient = getRedisClient();
          redisClient.setEx(cacheKey, ttl, JSON.stringify(data))
            .catch(err => logger.error('緩存設置失敗:', err));

          // 調用原始方法
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        logger.error('緩存中間件錯誤:', error);
        next();
      }
    };
  }

  /**
   * 生成緩存鍵
   */
  generateCacheKey(req) {
    const { method, originalUrl, query, params } = req;
    const key = `${method}:${originalUrl}:${JSON.stringify(query)}:${JSON.stringify(params)}`;
    return `cache:${this.hashString(key)}`;
  }

  /**
   * 字符串哈希函數
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 轉換為32位整數
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 智能緩存策略
   */
  async smartCache(key, fetchFunction, options = {}) {
    const {
      ttl = this.cacheConfig.defaultTTL,
      staleWhileRevalidate = 60,
      forceRefresh = false
    } = options;

    try {
      if (forceRefresh) {
        const data = await fetchFunction();
        await this.setCache(key, data, ttl);
        return data;
      }

      // 嘗試獲取緩存
      const redisClient = getRedisClient();
      const cached = await redisClient.get(key);
      if (cached) {
        const data = JSON.parse(cached);
        this.metrics.cacheHits++;

        // 檢查是否需要後台刷新
        const ttlRemaining = await redisClient.ttl(key);
        if (ttlRemaining < staleWhileRevalidate) {
          // 後台刷新緩存
          this.backgroundRefresh(key, fetchFunction, ttl);
        }

        return data;
      }

      // 緩存未命中
      this.metrics.cacheMisses++;
      const data = await fetchFunction();
      await this.setCache(key, data, ttl);
      return data;
    } catch (error) {
      logger.error('智能緩存錯誤:', error);
      // 降級到直接獲取
      return await fetchFunction();
    }
  }

  /**
   * 後台刷新緩存
   */
  async backgroundRefresh(key, fetchFunction, ttl) {
    setImmediate(async () => {
      try {
        const data = await fetchFunction();
        await this.setCache(key, data, ttl);
        logger.info(`後台刷新緩存成功: ${key}`);
      } catch (error) {
        logger.error(`後台刷新緩存失敗: ${key}`, error);
      }
    });
  }

  /**
   * 設置緩存
   */
  async setCache(key, data, ttl) {
    try {
      const value = this.cacheConfig.compression ?
        this.compressData(data) : JSON.stringify(data);

      const redisClient = getRedisClient();
      await redisClient.setEx(key, ttl, value);
      logger.debug(`緩存設置成功: ${key}, TTL: ${ttl}s`);
    } catch (error) {
      logger.error('設置緩存失敗:', error);
    }
  }

  /**
   * 壓縮數據
   */
  compressData(data) {
    const zlib = require('zlib');
    const jsonString = JSON.stringify(data);
    return zlib.gzipSync(jsonString).toString('base64');
  }

  /**
   * 解壓縮數據
   */
  decompressData(compressedData) {
    const zlib = require('zlib');
    const buffer = Buffer.from(compressedData, 'base64');
    const jsonString = zlib.gunzipSync(buffer).toString();
    return JSON.parse(jsonString);
  }

  /**
   * 批量緩存操作
   */
  async batchCache(operations) {
    const redisClient = getRedisClient();
    const pipeline = redisClient.multi();
    const results = [];

    for (const operation of operations) {
      const { type, key, data, ttl } = operation;

      switch (type) {
        case 'set':
          pipeline.setex(key, ttl || this.cacheConfig.defaultTTL, JSON.stringify(data));
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
      const responses = await pipeline.exec();
      return responses.map(([err, result]) => {
        if (err) {
          logger.error('批量緩存操作錯誤:', err);
          return null;
        }
        return result;
      });
    } catch (error) {
      logger.error('批量緩存操作失敗:', error);
      throw error;
    }
  }

  /**
   * 緩存預熱
   */
  async warmupCache(endpoints) {
    logger.info(`開始緩存預熱，共 ${endpoints.length} 個端點`);

    const promises = endpoints.map(async (endpoint) => {
      try {
        const { url, ttl = this.cacheConfig.defaultTTL } = endpoint;
        const response = await fetch(url);
        const data = await response.json();

        const cacheKey = this.generateCacheKey({ originalUrl: url });
        await this.setCache(cacheKey, data, ttl);

        logger.info(`緩存預熱成功: ${url}`);
        return { url, status: 'success' };
      } catch (error) {
        logger.error(`緩存預熱失敗: ${endpoint.url}`, error);
        return { url: endpoint.url, status: 'error', error: error.message };
      }
    });

    const results = await Promise.allSettled(promises);
    const summary = {
      total: endpoints.length,
      success: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length
    };

    logger.info('緩存預熱完成:', summary);
    return summary;
  }

  /**
   * 緩存清理
   */
  async clearCache(pattern = '*') {
    try {
      const redisClient = getRedisClient();
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.info(`緩存清理完成，刪除 ${keys.length} 個鍵`);
        return keys.length;
      }
      return 0;
    } catch (error) {
      logger.error('緩存清理失敗:', error);
      throw error;
    }
  }

  /**
   * 響應時間監控中間件
   */
  createResponseTimeMiddleware() {
    return (req, res, next) => {
      const start = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - start;
        this.recordResponseTime(duration);

        if (duration > 1000) {
          logger.warn(`慢響應警告: ${req.method} ${req.originalUrl} 耗時 ${duration}ms`);
        }
      });

      next();
    };
  }

  /**
   * 記錄響應時間
   */
  recordResponseTime(duration) {
    this.metrics.requests++;
    this.metrics.totalResponseTime += duration;
    this.metrics.avgResponseTime = this.metrics.totalResponseTime / this.metrics.requests;
  }

  /**
   * 錯誤監控中間件
   */
  createErrorMonitorMiddleware() {
    return (err, req, res, next) => {
      this.metrics.errors++;

      logger.error('API錯誤:', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      next(err);
    };
  }

  /**
   * 獲取性能指標
   */
  getMetrics() {
    const cacheHitRate = this.metrics.requests > 0 ?
      (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100 : 0;

    return {
      ...this.metrics,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      errorRate: this.metrics.requests > 0 ?
        (this.metrics.errors / this.metrics.requests) * 100 : 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 重置指標
   */
  resetMetrics() {
    this.metrics = {
      requests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgResponseTime: 0,
      totalResponseTime: 0,
      errors: 0
    };
    logger.info('性能指標已重置');
  }

  /**
   * 健康檢查
   */
  async healthCheck() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {}
    };

    try {
      // 檢查Redis連接
      const redisClient = getRedisClient();
      await redisClient.ping();
      health.checks.redis = 'healthy';
    } catch (error) {
      health.checks.redis = 'unhealthy';
      health.status = 'degraded';
      health.redisError = error.message;
    }

    // 檢查緩存命中率
    const metrics = this.getMetrics();
    if (metrics.cacheHitRate < 50) {
      health.checks.cache = 'warning';
      health.status = 'degraded';
    } else {
      health.checks.cache = 'healthy';
    }

    // 檢查錯誤率
    if (metrics.errorRate > 5) {
      health.checks.errors = 'warning';
      health.status = 'degraded';
    } else {
      health.checks.errors = 'healthy';
    }

    return health;
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    if (newConfig.cacheConfig) {
      this.cacheConfig = { ...this.cacheConfig, ...newConfig.cacheConfig };
    }
    if (newConfig.responseConfig) {
      this.responseConfig = { ...this.responseConfig, ...newConfig.responseConfig };
    }
    if (newConfig.rateLimitConfig) {
      this.rateLimitConfig = { ...this.rateLimitConfig, ...newConfig.rateLimitConfig };
    }

    logger.info('性能優化器配置已更新:', newConfig);
  }

  /**
   * 獲取配置
   */
  getConfig() {
    return {
      cacheConfig: this.cacheConfig,
      responseConfig: this.responseConfig,
      rateLimitConfig: this.rateLimitConfig
    };
  }
}

// 創建單例實例
const performanceOptimizer = new PerformanceOptimizer();

module.exports = performanceOptimizer;

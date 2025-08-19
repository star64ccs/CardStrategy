const logger = require('../utils/logger');
const redis = require('redis');

class PerformanceMiddleware {
  constructor() {
    this.redisClient = null;
    this.initRedis();
  }

  async initRedis() {
    try {
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      await this.redisClient.connect();
      logger.info('Redis 連接成功');
    } catch (error) {
      logger.warn('Redis 連接失敗，將使用內存緩存:', error.message);
      this.redisClient = null;
    }
  }

  // 響應時間監控中間件
  responseTimeMonitor() {
    return (req, res, next) => {
      const start = Date.now();

      // 在響應結束時記錄時間
      res.on('finish', () => {
        const duration = Date.now() - start;
        const { method, originalUrl, statusCode } = req;

        // 記錄響應時間
        logger.info(`API ${method} ${originalUrl} - ${statusCode} - ${duration}ms`);

        // 如果響應時間超過閾值，記錄警告
        if (duration > 1000) {
          logger.warn(`慢響應警告: ${method} ${originalUrl} 耗時 ${duration}ms`);
        }

        // 發送到監控系統
        this.sendMetrics({
          type: 'api_response_time',
          method,
          url: originalUrl,
          statusCode,
          duration,
          timestamp: new Date().toISOString()
        });
      });

      next();
    };
  }

  // 緩存中間件
  cache(ttl = 300) {
    return async (req, res, next) => {
      if (!this.redisClient || req.method !== 'GET') {
        return next();
      }

      try {
        const cacheKey = `cache:${req.originalUrl}:${JSON.stringify(req.query)}`;
        const cachedData = await this.redisClient.get(cacheKey);

        if (cachedData) {
          const data = JSON.parse(cachedData);
          logger.debug(`緩存命中: ${cacheKey}`);

          return res.json({
            success: true,
            data,
            cached: true,
            timestamp: new Date().toISOString()
          });
        }

        // 重寫 res.json 方法以緩存響應
        const originalJson = res.json;
        res.json = function(data) {
          if (data.success && data.data) {
            this.redisClient.setEx(cacheKey, ttl, JSON.stringify(data.data))
              .catch(err => logger.error('緩存設置失敗:', err));
          }
          return originalJson.call(this, data);
        }.bind(this);

        next();
      } catch (error) {
        logger.error('緩存中間件錯誤:', error);
        next();
      }
    };
  }

  // 數據庫查詢優化中間件
  queryOptimizer() {
    return (req, res, next) => {
      const originalQuery = req.query;

      // 限制查詢結果數量
      if (!originalQuery.limit || parseInt(originalQuery.limit) > 100) {
        req.query.limit = Math.min(parseInt(originalQuery.limit) || 20, 100);
      }

      // 添加默認排序
      if (!originalQuery.sort) {
        req.query.sort = 'createdAt';
        req.query.order = 'desc';
      }

      // 優化分頁參數
      if (originalQuery.page) {
        const page = Math.max(1, parseInt(originalQuery.page));
        const limit = parseInt(req.query.limit);
        req.query.offset = (page - 1) * limit;
      }

      next();
    };
  }

  // 內存使用監控
  memoryMonitor() {
    return (req, res, next) => {
      const startMemory = process.memoryUsage();

      res.on('finish', () => {
        const endMemory = process.memoryUsage();
        const memoryDiff = {
          rss: endMemory.rss - startMemory.rss,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          external: endMemory.external - startMemory.external
        };

        // 如果內存使用增加過多，記錄警告
        if (memoryDiff.heapUsed > 50 * 1024 * 1024) { // 50MB
          logger.warn(`高內存使用警告: ${req.method} ${req.originalUrl} 增加 ${Math.round(memoryDiff.heapUsed / 1024 / 1024)}MB`);
        }

        this.sendMetrics({
          type: 'memory_usage',
          method: req.method,
          url: req.originalUrl,
          memoryDiff,
          timestamp: new Date().toISOString()
        });
      });

      next();
    };
  }

  // 錯誤處理優化
  errorHandler() {
    return (err, req, res, next) => {
      const errorInfo = {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        method: req.method,
        url: req.originalUrl,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent'),
        ip: req.ip
      };

      logger.error('API 錯誤:', errorInfo);

      // 發送錯誤指標
      this.sendMetrics({
        type: 'api_error',
        error: errorInfo,
        timestamp: new Date().toISOString()
      });

      // 根據錯誤類型返回適當的響應
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: '數據驗證失敗',
          errors: err.errors
        });
      }

      if (err.name === 'SequelizeConnectionError') {
        return res.status(503).json({
          success: false,
          message: '數據庫連接錯誤',
          code: 'DATABASE_ERROR'
        });
      }

      if (err.name === 'SequelizeTimeoutError') {
        return res.status(408).json({
          success: false,
          message: '數據庫查詢超時',
          code: 'DATABASE_TIMEOUT'
        });
      }

      // 默認錯誤響應
      res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? '內部服務器錯誤' : err.message,
        code: err.code || 'INTERNAL_ERROR'
      });
    };
  }

  // 請求限流中間件
  rateLimiter(limit = 100, windowMs = 15 * 60 * 1000) {
    const requests = new Map();

    return (req, res, next) => {
      const key = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const windowStart = now - windowMs;

      // 清理過期的請求記錄
      if (requests.has(key)) {
        requests.set(key, requests.get(key).filter(timestamp => timestamp > windowStart));
      } else {
        requests.set(key, []);
      }

      const userRequests = requests.get(key);

      if (userRequests.length >= limit) {
        logger.warn(`請求限流觸發: ${key} - ${req.method} ${req.originalUrl}`);

        return res.status(429).json({
          success: false,
          message: '請求過於頻繁，請稍後再試',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }

      userRequests.push(now);
      next();
    };
  }

  // 數據庫連接池監控
  dbPoolMonitor() {
    return (req, res, next) => {
      const sequelize = req.app.get('sequelize');

      if (sequelize && sequelize.connectionManager) {
        const {pool} = sequelize.connectionManager;

        res.on('finish', () => {
          const poolStats = {
            size: pool.size,
            available: pool.available,
            pending: pool.pending,
            borrowed: pool.borrowed
          };

          // 如果連接池使用率過高，記錄警告
          const usageRate = poolStats.borrowed / poolStats.size;
          if (usageRate > 0.8) {
            logger.warn(`數據庫連接池使用率過高: ${Math.round(usageRate * 100)}%`);
          }

          this.sendMetrics({
            type: 'db_pool_stats',
            stats: poolStats,
            timestamp: new Date().toISOString()
          });
        });
      }

      next();
    };
  }

  // 發送指標到監控系統
  sendMetrics(metrics) {
    // 這裡可以集成到 Prometheus、DataDog 等監控系統
    if (process.env.METRICS_ENDPOINT) {
      fetch(process.env.METRICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.METRICS_API_KEY}`
        },
        body: JSON.stringify(metrics)
      }).catch(err => logger.error('指標發送失敗:', err));
    }
  }

  // 清理緩存
  async clearCache(pattern = '*') {
    if (!this.redisClient) return;

    try {
      const keys = await this.redisClient.keys(`cache:${pattern}`);
      if (keys.length > 0) {
        await this.redisClient.del(keys);
        logger.info(`清理緩存: ${keys.length} 個鍵`);
      }
    } catch (error) {
      logger.error('清理緩存失敗:', error);
    }
  }

  // 獲取性能統計
  async getPerformanceStats() {
    const stats = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      cpu: process.cpuUsage(),
      timestamp: new Date().toISOString()
    };

    if (this.redisClient) {
      try {
        const info = await this.redisClient.info();
        stats.redis = info;
      } catch (error) {
        logger.error('獲取 Redis 信息失敗:', error);
      }
    }

    return stats;
  }

  // 健康檢查
  async healthCheck() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {}
    };

    // 檢查 Redis 連接
    if (this.redisClient) {
      try {
        await this.redisClient.ping();
        health.services.redis = 'healthy';
      } catch (error) {
        health.services.redis = 'unhealthy';
        health.status = 'degraded';
      }
    }

    // 檢查數據庫連接
    try {
      const {sequelize} = require('../config/database');
      await sequelize.authenticate();
      health.services.database = 'healthy';
    } catch (error) {
      health.services.database = 'unhealthy';
      health.status = 'unhealthy';
    }

    // 檢查內存使用
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    if (memoryUsagePercent > 90) {
      health.status = 'degraded';
      health.services.memory = 'high_usage';
    } else {
      health.services.memory = 'healthy';
    }

    return health;
  }
}

// 創建單例實例
const performanceMiddleware = new PerformanceMiddleware();

module.exports = performanceMiddleware;

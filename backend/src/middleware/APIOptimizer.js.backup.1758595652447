// API 優化中間件
import express from 'express';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import NodeCache from 'node-cache';

class APIOptimizer {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 300, // 5分鐘默認 TTL
      checkperiod: 60, // 1分鐘檢查一次
      useClones: false
    });

    this.requestCounts = new Map();
    this.responseTimes = new Map();
  }

  // 壓縮中間件
  compression() {
    return compression({
      level: 6,
      threshold: 1024, // 只壓縮大於 1KB 的響應
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      }
    });
  }

  // 速率限制
  rateLimit() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15分鐘
      max: 100, // 每個 IP 最多 100 個請求
      message: {
        error: '請求過於頻繁，請稍後再試',
        retryAfter: '15分鐘'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          error: '請求過於頻繁',
          retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
      }
    });
  }

  // 慢速限制
  slowDown() {
    return slowDown({
      windowMs: 15 * 60 * 1000, // 15分鐘
      delayAfter: 50, // 50個請求後開始延遲
      delayMs: 500, // 每次延遲 500ms
      maxDelayMs: 20000 // 最大延遲 20秒
    });
  }

  // 安全頭部
  securityHeaders() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: false
    });
  }

  // 緩存中間件
  cacheMiddleware(ttl = 300) {
    return (req, res, next) => {
      const key = `${req.method}:${req.originalUrl}`;
      const cached = this.cache.get(key);

      if (cached) {
        res.set('X-Cache', 'HIT');
        return res.json(cached);
      }

      res.set('X-Cache', 'MISS');
      
      const originalSend = res.json;
      res.json = function(data) {
        this.cache.set(key, data, ttl);
        originalSend.call(this, data);
      }.bind(this);

      next();
    };
  }

  // 請求日誌
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          duration,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          timestamp: new Date().toISOString()
        };

        console.log(JSON.stringify(logData));
        
        // 記錄響應時間
        this.recordResponseTime(req.originalUrl, duration);
      });

      next();
    };
  }

  // 錯誤處理
  errorHandler() {
    return (err, req, res, next) => {
      console.error('API 錯誤:', err);

      const statusCode = err.statusCode || 500;
      const message = statusCode === 500 ? '內部服務器錯誤' : err.message;

      res.status(statusCode).json({
        error: message,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
      });
    };
  }

  // 記錄響應時間
  recordResponseTime(endpoint, duration) {
    if (!this.responseTimes.has(endpoint)) {
      this.responseTimes.set(endpoint, []);
    }

    const times = this.responseTimes.get(endpoint);
    times.push(duration);

    // 只保留最近 100 個記錄
    if (times.length > 100) {
      times.shift();
    }
  }

  // 獲取性能統計
  getPerformanceStats() {
    const stats = {};

    for (const [endpoint, times] of this.responseTimes.entries()) {
      if (times.length > 0) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const min = Math.min(...times);
        const max = Math.max(...times);
        const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];

        stats[endpoint] = {
          count: times.length,
          average: Math.round(avg),
          min,
          max,
          p95
        };
      }
    }

    return {
      endpoints: stats,
      cache: {
        size: this.cache.keys().length,
        hits: this.cache.getStats().hits,
        misses: this.cache.getStats().misses
      }
    };
  }

  // 健康檢查
  healthCheck() {
    return (req, res) => {
      const stats = this.getPerformanceStats();
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        performance: stats
      });
    };
  }

  // 清理緩存
  clearCache() {
    this.cache.flushAll();
    this.responseTimes.clear();
  }

  // 優化建議
  getOptimizationSuggestions() {
    const suggestions = [];
    const stats = this.getPerformanceStats();

    // 檢查緩存命中率
    const totalRequests = stats.cache.hits + stats.cache.misses;
    const hitRate = totalRequests > 0 ? stats.cache.hits / totalRequests : 0;

    if (hitRate < 0.5) {
      suggestions.push('緩存命中率過低，建議增加緩存 TTL 或優化緩存策略');
    }

    // 檢查響應時間
    for (const [endpoint, endpointStats] of Object.entries(stats.endpoints)) {
      if (endpointStats.average > 1000) {
        suggestions.push(`端點 ${endpoint} 響應時間過慢 (${endpointStats.average}ms)`);
      }

      if (endpointStats.p95 > 2000) {
        suggestions.push(`端點 ${endpoint} P95 響應時間過慢 (${endpointStats.p95}ms)`);
      }
    }

    return suggestions;
  }
}

export default APIOptimizer;

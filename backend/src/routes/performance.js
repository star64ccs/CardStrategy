const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const databaseOptimizer = require('../services/databaseOptimizer');
const performanceOptimizer = require('../services/performanceOptimizer');
const redisConfig = require('../../config/redis');

/**
 * 獲取系統性能統計
 */
router.get('/stats', async (req, res) => {
  try {
    const redisClient = redisConfig.getClient();
    const [dbStats, perfStats, redisInfo] = await Promise.all([
      databaseOptimizer.getQueryStats(),
      performanceOptimizer.getMetrics(),
      redisClient.info()
    ]);

    const systemStats = {
      timestamp: new Date().toISOString(),
      database: {
        queryStats: dbStats,
        slowQueries: Object.values(dbStats).reduce((sum, stat) => sum + stat.slowQueries, 0),
        totalQueries: Object.values(dbStats).reduce((sum, stat) => sum + stat.count, 0)
      },
      performance: {
        ...perfStats,
        cacheHitRate: perfStats.cacheHitRate || 0,
        avgResponseTime: perfStats.avgResponseTime || 0
      },
      redis: {
        connected: redisClient.status === 'ready',
        memory: redisInfo.match(/used_memory_human:([^\r\n]+)/)?.[1] || 'N/A',
        keyspace: redisInfo.match(/db0:keys=(\d+)/)?.[1] || '0'
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    };

    res.json({
      success: true,
      data: systemStats
    });
  } catch (error) {
    logger.error('獲取性能統計失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取性能統計失敗',
      message: error.message
    });
  }
});

/**
 * 系統健康檢查
 */
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {}
    };

    // 檢查數據庫連接
    try {
      await databaseOptimizer.healthCheck();
      health.checks.database = 'healthy';
    } catch (error) {
      health.checks.database = 'unhealthy';
      health.status = 'degraded';
      health.databaseError = error.message;
    }

    // 檢查Redis連接
    try {
      const redisClient = redisConfig.getClient();
      await redisClient.ping();
      health.checks.redis = 'healthy';
    } catch (error) {
      health.checks.redis = 'unhealthy';
      health.status = 'degraded';
      health.redisError = error.message;
    }

    // 檢查性能優化器
    try {
      const perfHealth = await performanceOptimizer.healthCheck();
      health.checks.performance = perfHealth.status;
      if (perfHealth.status !== 'healthy') {
        health.status = 'degraded';
      }
    } catch (error) {
      health.checks.performance = 'unhealthy';
      health.status = 'degraded';
      health.performanceError = error.message;
    }

    // 檢查系統資源
    const memUsage = process.memoryUsage();
    const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    if (memUsagePercent > 80) {
      health.checks.memory = 'warning';
      health.status = 'degraded';
    } else {
      health.checks.memory = 'healthy';
    }

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    logger.error('健康檢查失敗:', error);
    res.status(500).json({
      success: false,
      error: '健康檢查失敗',
      message: error.message
    });
  }
});

/**
 * 獲取數據庫查詢統計
 */
router.get('/database/stats', async (req, res) => {
  try {
    const stats = databaseOptimizer.getQueryStats();
    const config = databaseOptimizer.getConfig();

    res.json({
      success: true,
      data: {
        stats,
        config,
        summary: {
          totalQueries: Object.values(stats).reduce((sum, stat) => sum + stat.count, 0),
          slowQueries: Object.values(stats).reduce((sum, stat) => sum + stat.slowQueries, 0),
          avgQueryTime: Object.values(stats).reduce((sum, stat) => sum + stat.avgTime, 0) / Object.keys(stats).length || 0
        }
      }
    });
  } catch (error) {
    logger.error('獲取數據庫統計失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取數據庫統計失敗',
      message: error.message
    });
  }
});

/**
 * 清理緩存
 */
router.post('/cache/clear', async (req, res) => {
  try {
    const { pattern = '*' } = req.body;
    const clearedCount = await performanceOptimizer.clearCache(pattern);

    res.json({
      success: true,
      data: {
        clearedCount,
        pattern,
        message: `成功清理 ${clearedCount} 個緩存項`
      }
    });
  } catch (error) {
    logger.error('清理緩存失敗:', error);
    res.status(500).json({
      success: false,
      error: '清理緩存失敗',
      message: error.message
    });
  }
});

/**
 * 獲取數據庫索引建議
 */
router.get('/database/indexes', async (req, res) => {
  try {
    const { model } = req.query;

    if (!model) {
      return res.status(400).json({
        success: false,
        error: '缺少模型參數'
      });
    }

    // 這裡需要根據實際的模型和查詢模式來生成建議
    const queryPatterns = [
      { where: { status: 'active' }, order: [['createdAt', 'DESC']] },
      { where: { userId: 1 }, include: [{ model: 'User', as: 'user' }] }
    ];

    const suggestions = await databaseOptimizer.suggestIndexes(model, queryPatterns);

    res.json({
      success: true,
      data: {
        model,
        suggestions,
        totalSuggestions: suggestions.length
      }
    });
  } catch (error) {
    logger.error('獲取索引建議失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取索引建議失敗',
      message: error.message
    });
  }
});

/**
 * 查詢計劃分析
 */
router.post('/database/analyze', async (req, res) => {
  try {
    const { model, queryOptions } = req.body;

    if (!model || !queryOptions) {
      return res.status(400).json({
        success: false,
        error: '缺少模型或查詢參數'
      });
    }

    const analysis = await databaseOptimizer.analyzeQuery(model, queryOptions);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    logger.error('查詢分析失敗:', error);
    res.status(500).json({
      success: false,
      error: '查詢分析失敗',
      message: error.message
    });
  }
});

/**
 * 性能基準測試
 */
router.post('/benchmark', async (req, res) => {
  try {
    const { tests } = req.body;

    if (!Array.isArray(tests)) {
      return res.status(400).json({
        success: false,
        error: '測試配置必須是數組'
      });
    }

    const results = [];

    for (const test of tests) {
      const { name, query, iterations = 100 } = test;
      const startTime = Date.now();

      try {
        for (let i = 0; i < iterations; i++) {
          await databaseOptimizer.analyzeQuery(test.model, query);
        }

        const endTime = Date.now();
        const avgTime = (endTime - startTime) / iterations;

        results.push({
          name,
          iterations,
          totalTime: endTime - startTime,
          avgTime,
          status: 'success'
        });
      } catch (error) {
        results.push({
          name,
          iterations,
          status: 'error',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        results,
        summary: {
          totalTests: results.length,
          successfulTests: results.filter(r => r.status === 'success').length,
          failedTests: results.filter(r => r.status === 'error').length,
          avgTime: results
            .filter(r => r.status === 'success')
            .reduce((sum, r) => sum + r.avgTime, 0) / results.filter(r => r.status === 'success').length || 0
        }
      }
    });
  } catch (error) {
    logger.error('基準測試失敗:', error);
    res.status(500).json({
      success: false,
      error: '基準測試失敗',
      message: error.message
    });
  }
});

/**
 * 獲取優化建議
 */
router.get('/optimization/suggestions', async (req, res) => {
  try {
    const suggestions = [];

    // 獲取數據庫優化建議
    const dbStats = databaseOptimizer.getQueryStats();
    const slowQueries = Object.values(dbStats).reduce((sum, stat) => sum + stat.slowQueries, 0);

    if (slowQueries > 0) {
      suggestions.push({
        type: 'database',
        priority: 'high',
        title: '慢查詢優化',
        description: `檢測到 ${slowQueries} 個慢查詢，建議添加索引或優化查詢`,
        action: 'review_slow_queries'
      });
    }

    // 獲取緩存優化建議
    const perfStats = performanceOptimizer.getMetrics();
    if (perfStats.cacheHitRate < 50) {
      suggestions.push({
        type: 'cache',
        priority: 'medium',
        title: '緩存命中率優化',
        description: `緩存命中率為 ${perfStats.cacheHitRate}%，建議調整緩存策略`,
        action: 'optimize_cache_strategy'
      });
    }

    // 獲取響應時間建議
    if (perfStats.avgResponseTime > 500) {
      suggestions.push({
        type: 'performance',
        priority: 'high',
        title: '響應時間優化',
        description: `平均響應時間為 ${perfStats.avgResponseTime}ms，建議優化查詢或添加緩存`,
        action: 'optimize_response_time'
      });
    }

    // 獲取內存使用建議
    const memUsage = process.memoryUsage();
    const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    if (memUsagePercent > 80) {
      suggestions.push({
        type: 'memory',
        priority: 'high',
        title: '內存使用優化',
        description: `內存使用率為 ${Math.round(memUsagePercent)}%，建議檢查內存洩漏`,
        action: 'check_memory_leaks'
      });
    }

    res.json({
      success: true,
      data: {
        suggestions,
        totalSuggestions: suggestions.length,
        highPriority: suggestions.filter(s => s.priority === 'high').length,
        mediumPriority: suggestions.filter(s => s.priority === 'medium').length,
        lowPriority: suggestions.filter(s => s.priority === 'low').length
      }
    });
  } catch (error) {
    logger.error('獲取優化建議失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取優化建議失敗',
      message: error.message
    });
  }
});

/**
 * 重置性能指標
 */
router.post('/metrics/reset', async (req, res) => {
  try {
    databaseOptimizer.clearQueryStats();
    performanceOptimizer.resetMetrics();

    res.json({
      success: true,
      data: {
        message: '性能指標已重置'
      }
    });
  } catch (error) {
    logger.error('重置性能指標失敗:', error);
    res.status(500).json({
      success: false,
      error: '重置性能指標失敗',
      message: error.message
    });
  }
});

/**
 * 更新性能配置
 */
router.put('/config', async (req, res) => {
  try {
    const { database, performance } = req.body;

    if (database) {
      databaseOptimizer.setConfig(database);
    }

    if (performance) {
      performanceOptimizer.updateConfig(performance);
    }

    res.json({
      success: true,
      data: {
        message: '配置已更新',
        database: databaseOptimizer.getConfig(),
        performance: performanceOptimizer.getConfig()
      }
    });
  } catch (error) {
    logger.error('更新配置失敗:', error);
    res.status(500).json({
      success: false,
      error: '更新配置失敗',
      message: error.message
    });
  }
});

/**
 * 緩存預熱
 */
router.post('/cache/warmup', async (req, res) => {
  try {
    const { endpoints } = req.body;

    if (!Array.isArray(endpoints)) {
      return res.status(400).json({
        success: false,
        error: '端點配置必須是數組'
      });
    }

    const result = await performanceOptimizer.warmupCache(endpoints);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('緩存預熱失敗:', error);
    res.status(500).json({
      success: false,
      error: '緩存預熱失敗',
      message: error.message
    });
  }
});

/**
 * 批量緩存操作
 */
router.post('/cache/batch', async (req, res) => {
  try {
    const { operations } = req.body;

    if (!Array.isArray(operations)) {
      return res.status(400).json({
        success: false,
        error: '操作配置必須是數組'
      });
    }

    const results = await performanceOptimizer.batchCache(operations);

    res.json({
      success: true,
      data: {
        results,
        totalOperations: operations.length,
        successfulOperations: results.filter(r => r !== null).length
      }
    });
  } catch (error) {
    logger.error('批量緩存操作失敗:', error);
    res.status(500).json({
      success: false,
      error: '批量緩存操作失敗',
      message: error.message
    });
  }
});

module.exports = router;

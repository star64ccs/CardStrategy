const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const logger = require('../utils/logger');
const monitoringService = require('../services/monitoringService');
const { protect, authorize } = require('../middleware/auth');

/**
 * 獲取監控指標
 * GET /api/monitoring/metrics
 */
router.get('/metrics', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    logger.info('獲取監控指標', { adminId: req.user.id });

    const metrics = monitoringService.getMetrics();

    res.json({
      success: true,
      message: '監控指標獲取成功',
      data: metrics
    });
  } catch (error) {
    logger.error('獲取監控指標失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取監控指標失敗',
      code: 'MONITORING_METRICS_ERROR'
    });
  }
});

/**
 * 獲取健康檢查狀態
 * GET /api/monitoring/health
 */
router.get('/health', async (req, res) => {
  try {
    logger.info('健康檢查請求');

    const healthStatus = await monitoringService.getHealthStatus();

    res.json({
      success: true,
      message: '健康檢查完成',
      data: healthStatus
    });
  } catch (error) {
    logger.error('健康檢查失敗:', error);
    res.status(503).json({
      success: false,
      message: '服務不可用',
      code: 'HEALTH_CHECK_FAILED',
      data: {
        overall: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      }
    });
  }
});

/**
 * 獲取系統狀態
 * GET /api/monitoring/system
 */
router.get('/system', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    logger.info('獲取系統狀態', { adminId: req.user.id });

    const metrics = monitoringService.getMetrics();
    const systemMetrics = metrics.system;

    res.json({
      success: true,
      message: '系統狀態獲取成功',
      data: {
        timestamp: new Date().toISOString(),
        system: systemMetrics,
        summary: {
          uptime: systemMetrics.uptime,
          platform: systemMetrics.platform,
          nodeVersion: systemMetrics.nodeVersion,
          cpuCores: systemMetrics.cpu?.cores,
          memoryUsage: systemMetrics.memory?.usagePercent,
          cpuLoad: systemMetrics.cpu?.loadAverage?.[0]
        }
      }
    });
  } catch (error) {
    logger.error('獲取系統狀態失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取系統狀態失敗',
      code: 'SYSTEM_STATUS_ERROR'
    });
  }
});

/**
 * 獲取應用程序狀態
 * GET /api/monitoring/application
 */
router.get('/application', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    logger.info('獲取應用程序狀態', { adminId: req.user.id });

    const metrics = monitoringService.getMetrics();
    const appMetrics = metrics.application;

    res.json({
      success: true,
      message: '應用程序狀態獲取成功',
      data: {
        timestamp: new Date().toISOString(),
        application: appMetrics,
        summary: {
          pid: appMetrics.pid,
          version: appMetrics.version,
          uptime: appMetrics.uptime,
          memoryUsage: {
            rss: Math.round(appMetrics.memory?.rss / 1024 / 1024),
            heapUsed: Math.round(appMetrics.memory?.heapUsed / 1024 / 1024),
            heapTotal: Math.round(appMetrics.memory?.heapTotal / 1024 / 1024)
          }
        }
      }
    });
  } catch (error) {
    logger.error('獲取應用程序狀態失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取應用程序狀態失敗',
      code: 'APPLICATION_STATUS_ERROR'
    });
  }
});

/**
 * 獲取數據庫狀態
 * GET /api/monitoring/database
 */
router.get('/database', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    logger.info('獲取數據庫狀態', { adminId: req.user.id });

    const metrics = monitoringService.getMetrics();
    const dbMetrics = metrics.database;

    res.json({
      success: true,
      message: '數據庫狀態獲取成功',
      data: {
        timestamp: new Date().toISOString(),
        database: dbMetrics,
        summary: {
          connectionStatus: dbMetrics.connection?.status,
          poolSize: dbMetrics.pool?.total,
          activeConnections: dbMetrics.pool?.active,
          idleConnections: dbMetrics.pool?.idle,
          slowQueries: dbMetrics.performance?.slowQueries,
          totalQueries: dbMetrics.performance?.totalQueries,
          averageResponseTime: dbMetrics.performance?.averageResponseTime
        }
      }
    });
  } catch (error) {
    logger.error('獲取數據庫狀態失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取數據庫狀態失敗',
      code: 'DATABASE_STATUS_ERROR'
    });
  }
});

/**
 * 獲取性能指標
 * GET /api/monitoring/performance
 */
router.get('/performance', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    logger.info('獲取性能指標', { adminId: req.user.id });

    const metrics = monitoringService.getMetrics();
    const perfMetrics = metrics.performance;

    res.json({
      success: true,
      message: '性能指標獲取成功',
      data: {
        timestamp: new Date().toISOString(),
        performance: perfMetrics,
        summary: {
          averageResponseTime: perfMetrics.responseTime?.average,
          requestRate: perfMetrics.requests?.rate,
          successRate: perfMetrics.requests?.total > 0
            ? ((perfMetrics.requests.successful / perfMetrics.requests.total) * 100).toFixed(2)
            : 0,
          cacheHitRate: perfMetrics.cache?.hitRate,
          totalRequests: perfMetrics.requests?.total
        }
      }
    });
  } catch (error) {
    logger.error('獲取性能指標失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取性能指標失敗',
      code: 'PERFORMANCE_METRICS_ERROR'
    });
  }
});

/**
 * 獲取錯誤日誌
 * GET /api/monitoring/errors
 */
router.get('/errors', [
  protect,
  authorize('admin'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('限制數量必須在 1-100 之間'),
  query('type').optional().isString().withMessage('錯誤類型必須是字符串')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '請求參數驗證失敗',
        errors: errors.array()
      });
    }

    const { limit = 20, type } = req.query;
    logger.info('獲取錯誤日誌', { adminId: req.user.id, limit, type });

    const metrics = monitoringService.getMetrics();
    let errorLogs = metrics.errors;

    // 按類型過濾
    if (type) {
      errorLogs = errorLogs.filter(error => error.type === type);
    }

    // 限制數量
    errorLogs = errorLogs.slice(-parseInt(limit));

    res.json({
      success: true,
      message: '錯誤日誌獲取成功',
      data: {
        timestamp: new Date().toISOString(),
        errors: errorLogs,
        summary: {
          totalErrors: metrics.errors.length,
          filteredErrors: errorLogs.length,
          errorTypes: [...new Set(metrics.errors.map(e => e.type))]
        }
      }
    });
  } catch (error) {
    logger.error('獲取錯誤日誌失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取錯誤日誌失敗',
      code: 'ERROR_LOGS_ERROR'
    });
  }
});

/**
 * 獲取監控報告
 * GET /api/monitoring/report
 */
router.get('/report', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    logger.info('生成監控報告', { adminId: req.user.id });

    const report = monitoringService.generateReport();

    res.json({
      success: true,
      message: '監控報告生成成功',
      data: report
    });
  } catch (error) {
    logger.error('生成監控報告失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '生成監控報告失敗',
      code: 'MONITORING_REPORT_ERROR'
    });
  }
});

/**
 * 設置警報閾值
 * PUT /api/monitoring/thresholds
 */
router.put('/thresholds', [
  protect,
  authorize('admin'),
  query('cpu').optional().isFloat({ min: 0, max: 100 }).withMessage('CPU 閾值必須在 0-100 之間'),
  query('memory').optional().isFloat({ min: 0, max: 100 }).withMessage('內存閾值必須在 0-100 之間'),
  query('responseTime').optional().isInt({ min: 0 }).withMessage('響應時間閾值必須是非負整數'),
  query('errorRate').optional().isFloat({ min: 0, max: 100 }).withMessage('錯誤率閾值必須在 0-100 之間')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '請求參數驗證失敗',
        errors: errors.array()
      });
    }

    const { cpu, memory, responseTime, errorRate } = req.query;
    logger.info('設置警報閾值', { adminId: req.user.id, cpu, memory, responseTime, errorRate });

    const thresholds = {};
    if (cpu !== undefined) thresholds.cpu = parseFloat(cpu);
    if (memory !== undefined) thresholds.memory = parseFloat(memory);
    if (responseTime !== undefined) thresholds.responseTime = parseInt(responseTime);
    if (errorRate !== undefined) thresholds.errorRate = parseFloat(errorRate);

    monitoringService.setAlertThresholds(thresholds);

    res.json({
      success: true,
      message: '警報閾值設置成功',
      data: {
        timestamp: new Date().toISOString(),
        thresholds
      }
    });
  } catch (error) {
    logger.error('設置警報閾值失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '設置警報閾值失敗',
      code: 'THRESHOLDS_SETTING_ERROR'
    });
  }
});

/**
 * 清理監控數據
 * DELETE /api/monitoring/cleanup
 */
router.delete('/cleanup', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    logger.info('清理監控數據', { adminId: req.user.id });

    monitoringService.cleanupOldData();

    res.json({
      success: true,
      message: '監控數據清理成功',
      data: {
        timestamp: new Date().toISOString(),
        action: 'cleanup_completed'
      }
    });
  } catch (error) {
    logger.error('清理監控數據失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '清理監控數據失敗',
      code: 'MONITORING_CLEANUP_ERROR'
    });
  }
});

/**
 * 重啟監控服務
 * POST /api/monitoring/restart
 */
router.post('/restart', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    logger.info('重啟監控服務', { adminId: req.user.id });

    // 停止當前監控服務
    monitoringService.stop();

    // 重新初始化監控服務
    await monitoringService.initialize();

    res.json({
      success: true,
      message: '監控服務重啟成功',
      data: {
        timestamp: new Date().toISOString(),
        action: 'restart_completed'
      }
    });
  } catch (error) {
    logger.error('重啟監控服務失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '重啟監控服務失敗',
      code: 'MONITORING_RESTART_ERROR'
    });
  }
});

module.exports = router;

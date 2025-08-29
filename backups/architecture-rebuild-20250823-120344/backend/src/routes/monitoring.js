const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
const monitoringService = require('../services/monitoringService');
const { authenticateToken: protect, authorize } = require('../middleware/auth');

/**
 * ?��???��?��?
 * GET /api/monitoring/metrics
 */
router.get('/metrics', [protect, authorize('admin')], async (req, res) => {
  try {
    logger.info('?��???��?��?', { adminId: req.user.id });

    const metrics = monitoringService.getMetrics();

    res.json({
      success: true,
      message: '??��?��??��??��?',
      data: metrics,
    });
  } catch (error) {
    logger.error('?��???��?��?失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��???��?��?失�?',
      code: 'MONITORING_METRICS_ERROR',
    });
  }
});

/**
 * ?��??�康檢查?�?? * GET /api/monitoring/health
 */
router.get('/health', async (req, res) => {
  try {
    logger.info('?�康檢查請�?');

    const healthStatus = await monitoringService.getHealthStatus();

    res.json({
      success: true,
      message: '?�康檢查完�?',
      data: healthStatus,
    });
  } catch (error) {
    logger.error('?�康檢查失�?:', error);
    res.status(503).json({
      success: false,
      message: '?��?不可??,
      code: 'HEALTH_CHECK_FAILED',
      data: {
        overall: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
    });
  }
});

/**
 * ?��?系統?�?? * GET /api/monitoring/system
 */
router.get('/system', [protect, authorize('admin')], async (req, res) => {
  try {
    logger.info('?��?系統?�??, { adminId: req.user.id });

    const metrics = monitoringService.getMetrics();
    const systemMetrics = metrics.system;

    res.json({
      success: true,
      message: '系統?�?�獲?��???,
      data: {
        timestamp: new Date().toISOString(),
        system: systemMetrics,
        summary: {
          uptime: systemMetrics.uptime,
          platform: systemMetrics.platform,
          nodeVersion: systemMetrics.nodeVersion,
          cpuCores: systemMetrics.cpu?.cores,
          memoryUsage: systemMetrics.memory?.usagePercent,
          cpuLoad: systemMetrics.cpu?.loadAverage?.[0],
        },
      },
    });
  } catch (error) {
    logger.error('?��?系統?�?�失??', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��?系統?�?�失??,
      code: 'SYSTEM_STATUS_ERROR',
    });
  }
});

/**
 * ?��??�用程�??�?? * GET /api/monitoring/application
 */
router.get('/application', [protect, authorize('admin')], async (req, res) => {
  try {
    logger.info('?��??�用程�??�??, { adminId: req.user.id });

    const metrics = monitoringService.getMetrics();
    const appMetrics = metrics.application;

    res.json({
      success: true,
      message: '?�用程�??�?�獲?��???,
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
            heapTotal: Math.round(appMetrics.memory?.heapTotal / 1024 / 1024),
          },
        },
      },
    });
  } catch (error) {
    logger.error('?��??�用程�??�?�失??', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��??�用程�??�?�失??,
      code: 'APPLICATION_STATUS_ERROR',
    });
  }
});

/**
 * ?��??��?庫�??? * GET /api/monitoring/database
 */
router.get('/database', [protect, authorize('admin')], async (req, res) => {
  try {
    logger.info('?��??��?庫�???, { adminId: req.user.id });

    const metrics = monitoringService.getMetrics();
    const dbMetrics = metrics.database;

    res.json({
      success: true,
      message: '?��?庫�??�獲?��???,
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
          averageResponseTime: dbMetrics.performance?.averageResponseTime,
        },
      },
    });
  } catch (error) {
    logger.error('?��??��?庫�??�失??', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��??��?庫�??�失??,
      code: 'DATABASE_STATUS_ERROR',
    });
  }
});

/**
 * ?��??�能?��?
 * GET /api/monitoring/performance
 */
router.get('/performance', [protect, authorize('admin')], async (req, res) => {
  try {
    logger.info('?��??�能?��?', { adminId: req.user.id });

    const metrics = monitoringService.getMetrics();
    const perfMetrics = metrics.performance;

    res.json({
      success: true,
      message: '?�能?��??��??��?',
      data: {
        timestamp: new Date().toISOString(),
        performance: perfMetrics,
        summary: {
          averageResponseTime: perfMetrics.responseTime?.average,
          requestRate: perfMetrics.requests?.rate,
          successRate:
            perfMetrics.requests?.total > 0
              ? (
                  (perfMetrics.requests.successful /
                    perfMetrics.requests.total) *
                  100
                ).toFixed(2)
              : 0,
          cacheHitRate: perfMetrics.cache?.hitRate,
          totalRequests: perfMetrics.requests?.total,
        },
      },
    });
  } catch (error) {
    logger.error('?��??�能?��?失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��??�能?��?失�?',
      code: 'PERFORMANCE_METRICS_ERROR',
    });
  }
});

/**
 * ?��??�誤?��?
 * GET /api/monitoring/errors
 */
router.get(
  '/errors',
  [
    protect,
    authorize('admin'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('?�制?��?必�???1-100 之�?'),
    query('type').optional().isString().withMessage('?�誤類�?必�??��?符串'),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '請�??�數驗�?失�?',
          errors: errors.array(),
        });
      }

      const { limit = 20, type } = req.query;
      logger.info('?��??�誤?��?', { adminId: req.user.id, limit, type });

      const metrics = monitoringService.getMetrics();
// eslint-disable-next-line no-unused-vars
      let errorLogs = metrics.errors;

      // ?��??��?�?      if (type) {
        errorLogs = errorLogs.filter((error) => error.type === type);
      }

      // ?�制?��?
      errorLogs = errorLogs.slice(-parseInt(limit));

      res.json({
        success: true,
        message: '?�誤?��??��??��?',
        data: {
          timestamp: new Date().toISOString(),
          errors: errorLogs,
          summary: {
            totalErrors: metrics.errors.length,
            filteredErrors: errorLogs.length,
            errorTypes: [...new Set(metrics.errors.map((e) => e.type))],
          },
        },
      });
    } catch (error) {
      logger.error('?��??�誤?��?失�?:', error);
      res.status(500).json({
        success: false,
        message: error.message || '?��??�誤?��?失�?',
        code: 'ERROR_LOGS_ERROR',
      });
    }
  }
);

/**
 * ?��???��?��?
 * GET /api/monitoring/report
 */
router.get('/report', [protect, authorize('admin')], async (req, res) => {
  try {
    logger.info('?��???��?��?', { adminId: req.user.id });

    const report = monitoringService.generateReport();

    res.json({
      success: true,
      message: '??��?��??��??��?',
      data: report,
    });
  } catch (error) {
    logger.error('?��???��?��?失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��???��?��?失�?',
      code: 'MONITORING_REPORT_ERROR',
    });
  }
});

/**
 * 設置警報?��? * PUT /api/monitoring/thresholds
 */
router.put(
  '/thresholds',
  [
    protect,
    authorize('admin'),
    query('cpu')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('CPU ?�值�??�在 0-100 之�?'),
    query('memory')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('?��??�值�??�在 0-100 之�?'),
    query('responseTime')
      .optional()
      .isInt({ min: 0 })
      .withMessage('?��??��??�值�??�是?��??�數'),
    query('errorRate')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('?�誤?�閾?��??�在 0-100 之�?'),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '請�??�數驗�?失�?',
          errors: errors.array(),
        });
      }

      const { cpu, memory, responseTime, errorRate } = req.query;
      logger.info('設置警報?��?, {
        adminId: req.user.id,
        cpu,
        memory,
        responseTime,
        errorRate,
      });

      const thresholds = {};
      if (cpu !== undefined) thresholds.cpu = parseFloat(cpu);
      if (memory !== undefined) thresholds.memory = parseFloat(memory);
      if (responseTime !== undefined)
        thresholds.responseTime = parseInt(responseTime);
      if (errorRate !== undefined) thresholds.errorRate = parseFloat(errorRate);

      monitoringService.setAlertThresholds(thresholds);

      res.json({
        success: true,
        message: '警報?�值設置�???,
        data: {
          timestamp: new Date().toISOString(),
          thresholds,
        },
      });
    } catch (error) {
      logger.error('設置警報?�值失??', error);
      res.status(500).json({
        success: false,
        message: error.message || '設置警報?�值失??,
        code: 'THRESHOLDS_SETTING_ERROR',
      });
    }
  }
);

/**
 * 清�???��?��?
 * DELETE /api/monitoring/cleanup
 */
router.delete('/cleanup', [protect, authorize('admin')], async (req, res) => {
  try {
    logger.info('清�???��?��?', { adminId: req.user.id });

    monitoringService.cleanupOldData();

    res.json({
      success: true,
      message: '??��?��?清�??��?',
      data: {
        timestamp: new Date().toISOString(),
        action: 'cleanup_completed',
      },
    });
  } catch (error) {
    logger.error('清�???��?��?失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '清�???��?��?失�?',
      code: 'MONITORING_CLEANUP_ERROR',
    });
  }
});

/**
 * ?��???��?��?
 * POST /api/monitoring/restart
 */
router.post('/restart', [protect, authorize('admin')], async (req, res) => {
  try {
    logger.info('?��???��?��?', { adminId: req.user.id });

    // ?�止?��???��?��?
    monitoringService.stop();

    // ?�新?��??�監?��???    await monitoringService.initialize();

    res.json({
      success: true,
      message: '??��?��??��??��?',
      data: {
        timestamp: new Date().toISOString(),
        action: 'restart_completed',
      },
    });
  } catch (error) {
    logger.error('?��???��?��?失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��???��?��?失�?',
      code: 'MONITORING_RESTART_ERROR',
    });
  }
});

module.exports = router;

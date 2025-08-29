const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const logger = require('../utils/logger');
const alertService = require('../services/alertService');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/alerts
 * @desc    獲取當前警報列表
 * @access  Private (Admin)
 */
router.get(
  '/',
  protect,
  authorize('admin'),
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('限制必須在 1-100 之間'),
    query('type').optional().isString().withMessage('警報類型必須是字符串'),
    query('severity')
      .optional()
      .isIn(['info', 'warning', 'critical'])
      .withMessage('嚴重程度無效'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '驗證失敗',
          errors: errors.array(),
        });
      }

      const { limit = 50, type, severity } = req.query;
      let alerts = alertService.getCurrentAlerts();

      // 按類型過濾
      if (type) {
        alerts = alerts.filter((alert) => alert.type === type);
      }

      // 按嚴重程度過濾
      if (severity) {
        alerts = alerts.filter((alert) => alert.severity === severity);
      }

      // 限制數量
      alerts = alerts.slice(-parseInt(limit));

      res.json({
        success: true,
        data: {
          alerts,
          total: alerts.length,
          filters: { type, severity, limit },
        },
      });
    } catch (error) {
      logger.error('獲取警報列表失敗:', error);
      res.status(500).json({
        success: false,
        message: '獲取警報列表失敗',
      });
    }
  }
);

/**
 * @route   GET /api/alerts/history
 * @desc    獲取警報歷史
 * @access  Private (Admin)
 */
router.get(
  '/history',
  protect,
  authorize('admin'),
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('限制必須在 1-1000 之間'),
    query('type').optional().isString().withMessage('警報類型必須是字符串'),
    query('severity')
      .optional()
      .isIn(['info', 'warning', 'critical'])
      .withMessage('嚴重程度無效'),
    query('startDate').optional().isISO8601().withMessage('開始日期格式無效'),
    query('endDate').optional().isISO8601().withMessage('結束日期格式無效'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '驗證失敗',
          errors: errors.array(),
        });
      }

      const { limit = 100, type, severity, startDate, endDate } = req.query;
      let history = alertService.getAlertHistory(parseInt(limit));

      // 按類型過濾
      if (type) {
        history = history.filter((alert) => alert.type === type);
      }

      // 按嚴重程度過濾
      if (severity) {
        history = history.filter((alert) => alert.severity === severity);
      }

      // 按日期範圍過濾
      if (startDate || endDate) {
        history = history.filter((alert) => {
          const alertDate = new Date(alert.timestamp);
          const start = startDate ? new Date(startDate) : new Date(0);
          const end = endDate ? new Date(endDate) : new Date();
          return alertDate >= start && alertDate <= end;
        });
      }

      res.json({
        success: true,
        data: {
          history,
          total: history.length,
          filters: { type, severity, startDate, endDate, limit },
        },
      });
    } catch (error) {
      logger.error('獲取警報歷史失敗:', error);
      res.status(500).json({
        success: false,
        message: '獲取警報歷史失敗',
      });
    }
  }
);

/**
 * @route   GET /api/alerts/stats
 * @desc    獲取警報統計
 * @access  Private (Admin)
 */
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = alertService.getAlertStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('獲取警報統計失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取警報統計失敗',
    });
  }
});

/**
 * @route   POST /api/alerts/trigger
 * @desc    手動觸發警報
 * @access  Private (Admin)
 */
router.post(
  '/trigger',
  protect,
  authorize('admin'),
  [
    body('type').isString().notEmpty().withMessage('警報類型是必需的'),
    body('message').isString().notEmpty().withMessage('警報消息是必需的'),
    body('severity')
      .optional()
      .isIn(['info', 'warning', 'critical'])
      .withMessage('嚴重程度無效'),
    body('value').optional().isNumeric().withMessage('值必須是數字'),
    body('threshold').optional().isNumeric().withMessage('閾值必須是數字'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '驗證失敗',
          errors: errors.array(),
        });
      }

      const {
        type,
        message,
        severity = 'warning',
        value,
        threshold,
      } = req.body;

      const alert = await alertService.triggerManualAlert(
        type,
        message,
        severity,
        {
          value: parseFloat(value) || 0,
          threshold: parseFloat(threshold) || 0,
        }
      );

      res.status(201).json({
        success: true,
        message: '警報已觸發',
        data: alert,
      });
    } catch (error) {
      logger.error('觸發警報失敗:', error);
      res.status(500).json({
        success: false,
        message: '觸發警報失敗',
      });
    }
  }
);

/**
 * @route   PUT /api/alerts/thresholds
 * @desc    更新警報閾值
 * @access  Private (Admin)
 */
router.put(
  '/thresholds',
  protect,
  authorize('admin'),
  [
    body('cpu')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('CPU 閾值必須在 0-100 之間'),
    body('memory')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('記憶體閾值必須在 0-100 之間'),
    body('disk')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('磁碟閾值必須在 0-100 之間'),
    body('responseTime')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('響應時間閾值必須大於 0'),
    body('errorRate')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('錯誤率閾值必須在 0-100 之間'),
    body('databaseConnections')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('數據庫連接閾值必須在 0-100 之間'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '驗證失敗',
          errors: errors.array(),
        });
      }

      const thresholds = {};

      // 只更新提供的閾值
      if (req.body.cpu !== undefined) thresholds.cpu = parseFloat(req.body.cpu);
      if (req.body.memory !== undefined)
        thresholds.memory = parseFloat(req.body.memory);
      if (req.body.disk !== undefined)
        thresholds.disk = parseFloat(req.body.disk);
      if (req.body.responseTime !== undefined)
        thresholds.responseTime = parseFloat(req.body.responseTime);
      if (req.body.errorRate !== undefined)
        thresholds.errorRate = parseFloat(req.body.errorRate);
      if (req.body.databaseConnections !== undefined)
        thresholds.databaseConnections = parseFloat(
          req.body.databaseConnections
        );

      alertService.updateThresholds(thresholds);

      res.json({
        success: true,
        message: '警報閾值已更新',
        data: alertService.alertThresholds,
      });
    } catch (error) {
      logger.error('更新警報閾值失敗:', error);
      res.status(500).json({
        success: false,
        message: '更新警報閾值失敗',
      });
    }
  }
);

/**
 * @route   GET /api/alerts/thresholds
 * @desc    獲取當前警報閾值
 * @access  Private (Admin)
 */
router.get('/thresholds', protect, authorize('admin'), async (req, res) => {
  try {
    res.json({
      success: true,
      data: alertService.alertThresholds,
    });
  } catch (error) {
    logger.error('獲取警報閾值失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取警報閾值失敗',
    });
  }
});

/**
 * @route   DELETE /api/alerts/clear
 * @desc    清除已解決的警報
 * @access  Private (Admin)
 */
router.delete('/clear', protect, authorize('admin'), async (req, res) => {
  try {
    const beforeCount = alertService.getCurrentAlerts().length;
    alertService.clearResolvedAlerts();
    const afterCount = alertService.getCurrentAlerts().length;
    const clearedCount = beforeCount - afterCount;

    res.json({
      success: true,
      message: `已清除 ${clearedCount} 個已解決的警報`,
      data: {
        clearedCount,
        remainingCount: afterCount,
      },
    });
  } catch (error) {
    logger.error('清除警報失敗:', error);
    res.status(500).json({
      success: false,
      message: '清除警報失敗',
    });
  }
});

/**
 * @route   DELETE /api/alerts/:id
 * @desc    刪除特定警報
 * @access  Private (Admin)
 */
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const alerts = alertService.getCurrentAlerts();
    const alertIndex = alerts.findIndex((alert) => alert.timestamp === id);

    if (alertIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '警報不存在',
      });
    }

    alerts.splice(alertIndex, 1);

    res.json({
      success: true,
      message: '警報已刪除',
    });
  } catch (error) {
    logger.error('刪除警報失敗:', error);
    res.status(500).json({
      success: false,
      message: '刪除警報失敗',
    });
  }
});

/**
 * @route   POST /api/alerts/test
 * @desc    測試警報通知
 * @access  Private (Admin)
 */
router.post(
  '/test',
  protect,
  authorize('admin'),
  [
    body('channel')
      .isIn(['email', 'slack', 'webhook', 'all'])
      .withMessage('通知渠道無效'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '驗證失敗',
          errors: errors.array(),
        });
      }

      const { channel } = req.body;

      // 創建測試警報
      const testAlert = {
        type: 'test_alert',
        severity: 'info',
        message: '這是一個測試警報',
        value: 50,
        threshold: 80,
        timestamp: new Date().toISOString(),
      };

      const results = {};

      // 根據渠道發送測試通知
      if (channel === 'email' || channel === 'all') {
        try {
          await alertService.sendEmailAlert(testAlert, 'info');
          results.email = 'success';
        } catch (error) {
          results.email = 'failed';
          logger.error('測試郵件警報失敗:', error);
        }
      }

      if (channel === 'slack' || channel === 'all') {
        try {
          await alertService.sendSlackAlert(testAlert, 'info');
          results.slack = 'success';
        } catch (error) {
          results.slack = 'failed';
          logger.error('測試 Slack 警報失敗:', error);
        }
      }

      if (channel === 'webhook' || channel === 'all') {
        try {
          await alertService.sendWebhookAlert(testAlert, 'info');
          results.webhook = 'success';
        } catch (error) {
          results.webhook = 'failed';
          logger.error('測試 Webhook 警報失敗:', error);
        }
      }

      res.json({
        success: true,
        message: '測試警報已發送',
        data: results,
      });
    } catch (error) {
      logger.error('發送測試警報失敗:', error);
      res.status(500).json({
        success: false,
        message: '發送測試警報失敗',
      });
    }
  }
);

module.exports = router;

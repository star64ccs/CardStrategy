const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// 日誌模型（如果使用數據庫）
// const Log = require('../models/Log');

// 驗證請求中間件
const validateRequest = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '請求參數驗證失敗',
        errors: errors.array()
      });
    }
    next();
  } catch (error) {
    logger.error('請求驗證中間件錯誤:', error);
    return res.status(500).json({
      success: false,
      message: '請求驗證失敗',
      code: 'VALIDATION_MIDDLEWARE_ERROR'
    });
  }
};

// 驗證日誌數據
const validateLogData = [
  body('level').isIn(['debug', 'info', 'warn', 'error']).withMessage('日誌級別無效'),
  body('message').isString().notEmpty().withMessage('日誌消息不能為空'),
  body('timestamp').isISO8601().withMessage('時間戳格式無效'),
  body('userId').optional().isString().withMessage('用戶 ID 格式無效'),
  body('sessionId').optional().isString().withMessage('會話 ID 格式無效'),
  body('platform').optional().isString().withMessage('平台格式無效'),
  body('appVersion').optional().isString().withMessage('應用版本格式無效'),
  body('buildNumber').optional().isString().withMessage('構建號格式無效'),
  body('tags').optional().isObject().withMessage('標籤格式無效'),
  body('context').optional().isObject().withMessage('上下文格式無效'),
  body('deviceInfo').optional().isObject().withMessage('設備信息格式無效')
];

// 驗證批次日誌數據
const validateBatchLogData = [
  body('logs').isArray().withMessage('日誌數據必須是數組'),
  body('logs.*.level').isIn(['debug', 'info', 'warn', 'error']).withMessage('日誌級別無效'),
  body('logs.*.message').isString().notEmpty().withMessage('日誌消息不能為空'),
  body('logs.*.timestamp').isISO8601().withMessage('時間戳格式無效'),
  body('timestamp').isISO8601().withMessage('批次時間戳格式無效'),
  body('sessionId').isString().withMessage('會話 ID 不能為空')
];

// 發送單個日誌
// POST /api/logs
router.post('/', validateLogData, async (req, res) => {
  try {
    const {
      level,
      message,
      timestamp,
      userId,
      sessionId,
      platform,
      appVersion,
      buildNumber,
      tags,
      context,
      deviceInfo
    } = req.body;

    // 記錄日誌到後端
    logger.info('收到客戶端日誌', {
      level,
      message,
      userId,
      sessionId,
      platform,
      appVersion,
      buildNumber,
      tags,
      context,
      deviceInfo
    });

    // 如果是錯誤日誌，可以觸發警報
    if (level === 'error') {
      // 這裡可以實現錯誤警報邏輯
      logger.error('客戶端錯誤日誌', {
        message,
        userId,
        sessionId,
        context,
        deviceInfo
      });
    }

    // 保存到數據庫（如果使用數據庫）
    // const log = await Log.create({
    //   level,
    //   message,
    //   timestamp,
    //   userId,
    //   sessionId,
    //   platform,
    //   appVersion,
    //   buildNumber,
    //   tags,
    //   context,
    //   deviceInfo
    // });

    res.status(200).json({
      success: true,
      message: '日誌已接收',
      data: {
        id: Date.now(), // 臨時 ID，實際應該使用數據庫生成的 ID
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('處理日誌失敗:', error);
    res.status(500).json({
      success: false,
      message: '處理日誌失敗',
      code: 'LOG_PROCESSING_ERROR'
    });
  }
});

// 發送批次日誌
// POST /api/logs/batch
router.post('/batch', validateBatchLogData, async (req, res) => {
  try {
    const { logs, timestamp, sessionId } = req.body;

    logger.info('收到批次日誌', {
      count: logs.length,
      sessionId,
      timestamp
    });

    // 處理每個日誌
    const processedLogs = [];
    const errorLogs = [];

    for (const log of logs) {
      try {
        // 記錄日誌
        logger.info('處理批次日誌項目', {
          level: log.level,
          message: log.message,
          userId: log.userId,
          sessionId: log.sessionId
        });

        // 如果是錯誤日誌，分類處理
        if (log.level === 'error') {
          errorLogs.push(log);
        }

        processedLogs.push({
          id: Date.now() + Math.random(),
          ...log,
          processedAt: new Date().toISOString()
        });

        // 保存到數據庫（如果使用數據庫）
        // await Log.create(log);

      } catch (error) {
        logger.error('處理單個日誌失敗:', { error, log });
      }
    }

    // 如果有錯誤日誌，觸發警報
    if (errorLogs.length > 0) {
      logger.error('批次中包含錯誤日誌', {
        errorCount: errorLogs.length,
        sessionId,
        errors: errorLogs.map(log => ({
          message: log.message,
          context: log.context
        }))
      });
    }

    res.status(200).json({
      success: true,
      message: '批次日誌已處理',
      data: {
        processedCount: processedLogs.length,
        errorCount: errorLogs.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('處理批次日誌失敗:', error);
    res.status(500).json({
      success: false,
      message: '處理批次日誌失敗',
      code: 'BATCH_LOG_PROCESSING_ERROR'
    });
  }
});

// 獲取日誌統計
// GET /api/logs/stats
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate, level, userId } = req.query;

    // 這裡應該從數據庫查詢統計數據
    // 目前返回模擬數據
    const stats = {
      totalLogs: 1250,
      errorCount: 45,
      warningCount: 120,
      infoCount: 850,
      debugCount: 235,
      uniqueUsers: 89,
      uniqueSessions: 156,
      averageLogsPerSession: 8.0,
      errorRate: 3.6,
      topErrors: [
        { message: '網絡連接失敗', count: 15 },
        { message: 'API 請求超時', count: 12 },
        { message: '數據解析錯誤', count: 8 }
      ],
      topUsers: [
        { userId: 'user_001', logCount: 45 },
        { userId: 'user_002', logCount: 38 },
        { userId: 'user_003', logCount: 32 }
      ],
      timeDistribution: {
        '00:00-06:00': 120,
        '06:00-12:00': 450,
        '12:00-18:00': 380,
        '18:00-24:00': 300
      }
    };

    res.status(200).json({
      success: true,
      message: '日誌統計獲取成功',
      data: stats
    });
  } catch (error) {
    logger.error('獲取日誌統計失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取日誌統計失敗',
      code: 'LOG_STATS_ERROR'
    });
  }
});

// 獲取日誌列表
// GET /api/logs
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      level,
      userId,
      sessionId,
      startDate,
      endDate,
      search
    } = req.query;

    // 這裡應該從數據庫查詢日誌
    // 目前返回模擬數據
    const mockLogs = Array.from({ length: Math.min(limit, 50) }, (_, i) => ({
      id: `log_${Date.now()}_${i}`,
      level: ['error', 'warn', 'info', 'debug'][Math.floor(Math.random() * 4)],
      message: `模擬日誌消息 ${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      userId: `user_${Math.floor(Math.random() * 10) + 1}`,
      sessionId: `session_${Math.floor(Math.random() * 5) + 1}`,
      platform: 'react-native',
      appVersion: '1.0.0',
      buildNumber: '1',
      tags: {
        environment: 'production',
        feature: 'card-scanning'
      },
      context: {
        screen: 'CardScanner',
        action: 'scan_card'
      },
      deviceInfo: {
        platform: 'ios',
        version: '15.0',
        model: 'iPhone 13'
      }
    }));

    const total = 1250; // 模擬總數

    res.status(200).json({
      success: true,
      message: '日誌列表獲取成功',
      data: {
        logs: mockLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('獲取日誌列表失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取日誌列表失敗',
      code: 'LOG_LIST_ERROR'
    });
  }
});

// 獲取特定日誌詳情
// GET /api/logs/:id
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // 這裡應該從數據庫查詢特定日誌
    // 目前返回模擬數據
    const log = {
      id,
      level: 'error',
      message: '網絡連接失敗',
      timestamp: new Date().toISOString(),
      userId: 'user_001',
      sessionId: 'session_001',
      platform: 'react-native',
      appVersion: '1.0.0',
      buildNumber: '1',
      tags: {
        environment: 'production',
        feature: 'network'
      },
      context: {
        url: 'https://api.example.com/cards',
        method: 'GET',
        statusCode: 500,
        error: 'Connection timeout'
      },
      deviceInfo: {
        platform: 'ios',
        version: '15.0',
        model: 'iPhone 13',
        deviceId: 'device_001',
        screenWidth: 390,
        screenHeight: 844,
        screenDensity: 3
      }
    };

    res.status(200).json({
      success: true,
      message: '日誌詳情獲取成功',
      data: log
    });
  } catch (error) {
    logger.error('獲取日誌詳情失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取日誌詳情失敗',
      code: 'LOG_DETAIL_ERROR'
    });
  }
});

// 刪除日誌
// DELETE /api/logs/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // 這裡應該從數據庫刪除日誌
    // await Log.findByIdAndDelete(id);

    logger.info('日誌已刪除', { id });

    res.status(200).json({
      success: true,
      message: '日誌已刪除',
      data: { id }
    });
  } catch (error) {
    logger.error('刪除日誌失敗:', error);
    res.status(500).json({
      success: false,
      message: '刪除日誌失敗',
      code: 'LOG_DELETE_ERROR'
    });
  }
});

// 批量刪除日誌
// DELETE /api/logs/batch
router.delete('/batch', protect, authorize('admin'), [
  body('ids').isArray().withMessage('ID 列表必須是數組'),
  body('ids.*').isString().withMessage('ID 格式無效')
], async (req, res) => {
  try {
    const { ids } = req.body;

    // 這裡應該從數據庫批量刪除日誌
    // await Log.deleteMany({ _id: { $in: ids } });

    logger.info('批量刪除日誌', { count: ids.length, ids });

    res.status(200).json({
      success: true,
      message: '日誌批量刪除成功',
      data: {
        deletedCount: ids.length,
        ids
      }
    });
  } catch (error) {
    logger.error('批量刪除日誌失敗:', error);
    res.status(500).json({
      success: false,
      message: '批量刪除日誌失敗',
      code: 'BATCH_LOG_DELETE_ERROR'
    });
  }
});

module.exports = router;

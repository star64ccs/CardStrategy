const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { authenticateToken: protect, authorize } = require('../middleware/auth');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');

// ?��?模�?（�??�使?�數?�庫�?// const Log = require('../models/Log');

// 驗�?請�?中�?�?// eslint-disable-next-line no-unused-vars
const validateRequest = (req, res, next) => {
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
    next();
  } catch (error) {
    logger.error('請�?驗�?中�?件錯�?', error);
    return res.status(500).json({
      success: false,
      message: '請�?驗�?失�?',
      code: 'VALIDATION_MIDDLEWARE_ERROR',
    });
  }
};

// 驗�??��??��?
const validateLogData = [
  body('level')
    .isIn(['debug', 'info', 'warn', 'error'])
    .withMessage('?��?級別?��?'),
  body('message').isString().notEmpty().withMessage('?��?消息不能?�空'),
  body('timestamp').isISO8601().withMessage('?��??�格式無??),
  body('userId').optional().isString().withMessage('?�戶 ID ?��??��?'),
  body('sessionId').optional().isString().withMessage('?�話 ID ?��??��?'),
  body('platform').optional().isString().withMessage('平台?��??��?'),
  body('appVersion').optional().isString().withMessage('?�用?�本?��??��?'),
  body('buildNumber').optional().isString().withMessage('構建?�格式無??),
  body('tags').optional().isObject().withMessage('標籤?��??��?'),
  body('context').optional().isObject().withMessage('上�??�格式無??),
  body('deviceInfo').optional().isObject().withMessage('設�?信息?��??��?'),
];

// 驗�??�次?��??��?
const validateBatchLogData = [
  body('logs').isArray().withMessage('?��??��?必�??�數�?),
  body('logs.*.level')
    .isIn(['debug', 'info', 'warn', 'error'])
    .withMessage('?��?級別?��?'),
  body('logs.*.message').isString().notEmpty().withMessage('?��?消息不能?�空'),
  body('logs.*.timestamp').isISO8601().withMessage('?��??�格式無??),
  body('timestamp').isISO8601().withMessage('?�次?��??�格式無??),
  body('sessionId').isString().withMessage('?�話 ID 不能?�空'),
];

// ?�送單?�日�?// POST /api/logs
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
      deviceInfo,
    } = req.body;

    // 記�??��??��?�?    logger.info('?�到客戶端日�?, {
      level,
      message,
      userId,
      sessionId,
      platform,
      appVersion,
      buildNumber,
      tags,
      context,
      deviceInfo,
    });

    // 如�??�錯誤日誌�??�以觸發警報
    if (level === 'error') {
      // ?�裡?�以實現?�誤警報?�輯
      logger.error('客戶端錯誤日�?, {
        message,
        userId,
        sessionId,
        context,
        deviceInfo,
      });
    }

    // 保�??�數?�庫（�??�使?�數?�庫�?// eslint-disable-next-line no-unused-vars
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
      message: '?��?已接??,
      data: {
        id: Date.now(), // ?��? ID，實?��?該使?�數?�庫?��???ID
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('?��??��?失�?:', error);
    res.status(500).json({
      success: false,
      message: '?��??��?失�?',
      code: 'LOG_PROCESSING_ERROR',
    });
  }
});

// ?�送批次日�?// POST /api/logs/batch
router.post('/batch', validateBatchLogData, async (req, res) => {
  try {
    const { logs, timestamp, sessionId } = req.body;

    logger.info('?�到?�次?��?', {
      count: logs.length,
      sessionId,
      timestamp,
    });

    // ?��?每個日�?    const processedLogs = [];
// eslint-disable-next-line no-unused-vars
    const errorLogs = [];

// eslint-disable-next-line no-unused-vars
    for (const log of logs) {
      try {
        // 記�??��?
        logger.info('?��??�次?��??�目', {
          level: log.level,
          message: log.message,
          userId: log.userId,
          sessionId: log.sessionId,
        });

        // 如�??�錯誤日誌�??��??��?
        if (log.level === 'error') {
          errorLogs.push(log);
        }

        processedLogs.push({
          id: Date.now() + Math.random(),
          ...log,
          processedAt: new Date().toISOString(),
        });

        // 保�??�數?�庫（�??�使?�數?�庫�?        // await Log.create(log);
      } catch (error) {
        logger.error('?��??�個日誌失??', { error, log });
      }
    }

    // 如�??�錯誤日誌�?觸發警報
    if (errorLogs.length > 0) {
      logger.error('?�次中�??�錯誤日�?, {
        errorCount: errorLogs.length,
        sessionId,
        errors: errorLogs.map((log) => ({
          message: log.message,
          context: log.context,
        })),
      });
    }

    res.status(200).json({
      success: true,
      message: '?�次?��?已�???,
      data: {
        processedCount: processedLogs.length,
        errorCount: errorLogs.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('?��??�次?��?失�?:', error);
    res.status(500).json({
      success: false,
      message: '?��??�次?��?失�?',
      code: 'BATCH_LOG_PROCESSING_ERROR',
    });
  }
});

// ?��??��?統�?
// GET /api/logs/stats
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate, level, userId } = req.query;

    // ?�裡?�該從數?�庫?�詢統�??��?
    // ?��?返�?模擬?��?
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
        { message: '網絡??��失�?', count: 15 },
        { message: 'API 請�?超�?', count: 12 },
        { message: '?��?�???�誤', count: 8 },
      ],
      topUsers: [
        { userId: 'user_001', logCount: 45 },
        { userId: 'user_002', logCount: 38 },
        { userId: 'user_003', logCount: 32 },
      ],
      timeDistribution: {
        '00:00-06:00': 120,
        '06:00-12:00': 450,
        '12:00-18:00': 380,
        '18:00-24:00': 300,
      },
    };

    res.status(200).json({
      success: true,
      message: '?��?統�??��??��?',
      data: stats,
    });
  } catch (error) {
    logger.error('?��??��?統�?失�?:', error);
    res.status(500).json({
      success: false,
      message: '?��??��?統�?失�?',
      code: 'LOG_STATS_ERROR',
    });
  }
});

// ?��??��??�表
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
      search,
    } = req.query;

    // ?�裡?�該從數?�庫?�詢?��?
    // ?��?返�?模擬?��?
    const mockLogs = Array.from({ length: Math.min(limit, 50) }, (_, i) => ({
      id: `log_${Date.now()}_${i}`,
      level: ['error', 'warn', 'info', 'debug'][Math.floor(Math.random() * 4)],
      message: `模擬?��?消息 ${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      userId: `user_${Math.floor(Math.random() * 10) + 1}`,
      sessionId: `session_${Math.floor(Math.random() * 5) + 1}`,
      platform: 'react-native',
      appVersion: '1.0.0',
      buildNumber: '1',
      tags: {
        environment: 'production',
        feature: 'card-scanning',
      },
      context: {
        screen: 'CardScanner',
        action: 'scan_card',
      },
      deviceInfo: {
        platform: 'ios',
        version: '15.0',
        model: 'iPhone 13',
      },
    }));

    const total = 1250; // 模擬總數

    res.status(200).json({
      success: true,
      message: '?��??�表?��??��?',
      data: {
        logs: mockLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('?��??��??�表失�?:', error);
    res.status(500).json({
      success: false,
      message: '?��??��??�表失�?',
      code: 'LOG_LIST_ERROR',
    });
  }
});

// ?��??��??��?詳�?
// GET /api/logs/:id
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // ?�裡?�該從數?�庫?�詢?��??��?
    // ?��?返�?模擬?��?
// eslint-disable-next-line no-unused-vars
    const log = {
      id,
      level: 'error',
      message: '網絡??��失�?',
      timestamp: new Date().toISOString(),
      userId: 'user_001',
      sessionId: 'session_001',
      platform: 'react-native',
      appVersion: '1.0.0',
      buildNumber: '1',
      tags: {
        environment: 'production',
        feature: 'network',
      },
      context: {
        url: 'https://api.example.com/cards',
        method: 'GET',
        statusCode: 500,
        error: 'Connection timeout',
      },
      deviceInfo: {
        platform: 'ios',
        version: '15.0',
        model: 'iPhone 13',
        deviceId: 'device_001',
        screenWidth: 390,
        screenHeight: 844,
        screenDensity: 3,
      },
    };

    res.status(200).json({
      success: true,
      message: '?��?詳�??��??��?',
      data: log,
    });
  } catch (error) {
    logger.error('?��??��?詳�?失�?:', error);
    res.status(500).json({
      success: false,
      message: '?��??��?詳�?失�?',
      code: 'LOG_DETAIL_ERROR',
    });
  }
});

// ?�除?��?
// DELETE /api/logs/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // ?�裡?�該從數?�庫?�除?��?
    // await Log.findByIdAndDelete(id);

    logger.info('?��?已刪??, { id });

    res.status(200).json({
      success: true,
      message: '?��?已刪??,
      data: { id },
    });
  } catch (error) {
    logger.error('?�除?��?失�?:', error);
    res.status(500).json({
      success: false,
      message: '?�除?��?失�?',
      code: 'LOG_DELETE_ERROR',
    });
  }
});

// ?��??�除?��?
// DELETE /api/logs/batch
router.delete(
  '/batch',
  protect,
  authorize('admin'),
  [
    body('ids').isArray().withMessage('ID ?�表必�??�數�?),
    body('ids.*').isString().withMessage('ID ?��??��?'),
  ],
  async (req, res) => {
    try {
      const { ids } = req.body;

      // ?�裡?�該從數?�庫?��??�除?��?
      // await Log.deleteMany({ _id: { $in: ids } });

      logger.info('?��??�除?��?', { count: ids.length, ids });

      res.status(200).json({
        success: true,
        message: '?��??��??�除?��?',
        data: {
          deletedCount: ids.length,
          ids,
        },
      });
    } catch (error) {
      logger.error('?��??�除?��?失�?:', error);
      res.status(500).json({
        success: false,
        message: '?��??�除?��?失�?',
        code: 'BATCH_LOG_DELETE_ERROR',
      });
    }
  }
);

module.exports = router;

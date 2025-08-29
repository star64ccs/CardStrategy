const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
const batchOperationService = require('../services/batchOperationService');
const { authenticateToken: protect, authorize } = require('../middleware/auth');

/**
 * ?�交?��??��?
 * POST /api/batch/submit
 */
router.post(
  '/submit',
  [
    protect,
    body('type')
      .isIn([
        'batch-cards',
        'batch-investments',
        'batch-market-data',
        'batch-users',
        'batch-notifications',
      ])
      .withMessage('?��??�批?��?作�???),
    body('data').isObject().withMessage('?��?必�??��?�?),
    body('options').optional().isObject().withMessage('?��?必�??��?�?),
    body('options.priority')
      .optional()
      .isIn(['low', 'normal', 'high', 'critical'])
      .withMessage('?��?級�??�是 low, normal, high ??critical'),
    body('options.delay')
      .optional()
      .isInt({ min: 0 })
      .withMessage('延遲必�??��?負整??),
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

      const { type, data, options = {} } = req.body;

      logger.info('?�交?��??��?', {
        userId: req.user.id,
        type,
        dataSize: JSON.stringify(data).length,
        options,
      });

      const jobId = await batchOperationService.submitBatchOperation(
        type,
        data,
        options
      );

      res.json({
        success: true,
        message: '?��??��?已�?�?,
        data: {
          jobId,
          type,
          status: 'pending',
          submittedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('?�交?��??��?失�?:', error);
      res.status(500).json({
        success: false,
        message: error.message || '?�交?��??��?失�?',
        code: 'BATCH_SUBMIT_ERROR',
      });
    }
  }
);

/**
 * ?��?作業?�?? * GET /api/batch/status/:jobId
 */
router.get(
  '/status/:jobId',
  [protect, param('jobId').isString().withMessage('作業 ID 必�??��?符串')],
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

      const { jobId } = req.params;

      logger.info('?��?作業?�??, { userId: req.user.id, jobId });

      const jobStatus = await batchOperationService.getJobStatus(jobId);

      if (!jobStatus) {
        return res.status(404).json({
          success: false,
          message: '作業不�???,
          code: 'JOB_NOT_FOUND',
        });
      }

      res.json({
        success: true,
        message: '作業?�?�獲?��???,
        data: jobStatus,
      });
    } catch (error) {
      logger.error('?��?作業?�?�失??', error);
      res.status(500).json({
        success: false,
        message: error.message || '?��?作業?�?�失??,
        code: 'BATCH_STATUS_ERROR',
      });
    }
  }
);

/**
 * ?��?作業
 * DELETE /api/batch/cancel/:jobId
 */
router.delete(
  '/cancel/:jobId',
  [protect, param('jobId').isString().withMessage('作業 ID 必�??��?符串')],
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

      const { jobId } = req.params;

      logger.info('?��?作業', { userId: req.user.id, jobId });

// eslint-disable-next-line no-unused-vars
      const result = await batchOperationService.cancelJob(jobId);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: '作業不�??��??��??��?',
          code: 'JOB_CANCEL_FAILED',
        });
      }

      res.json({
        success: true,
        message: '作業已�?�?,
        data: result,
      });
    } catch (error) {
      logger.error('?��?作業失�?:', error);
      res.status(500).json({
        success: false,
        message: error.message || '?��?作業失�?',
        code: 'BATCH_CANCEL_ERROR',
      });
    }
  }
);

/**
 * ?��??��?統�?
 * GET /api/batch/stats
 */
router.get('/stats', [protect, authorize('admin')], async (req, res) => {
  try {
    logger.info('?��??��?統�?', { adminId: req.user.id });

    const stats = await batchOperationService.getQueueStats();

    res.json({
      success: true,
      message: '?��?統�??��??��?',
      data: stats,
    });
  } catch (error) {
    logger.error('?��??��?統�?失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��??��?統�?失�?',
      code: 'BATCH_STATS_ERROR',
    });
  }
});

/**
 * ?��??�戶作業?�表
 * GET /api/batch/jobs
 */
router.get(
  '/jobs',
  [
    protect,
    body('status')
      .optional()
      .isIn(['pending', 'active', 'completed', 'failed', 'cancelled'])
      .withMessage(
        '?�?��??�是 pending, active, completed, failed ??cancelled'
      ),
    body('type')
      .optional()
      .isIn([
        'batch-cards',
        'batch-investments',
        'batch-market-data',
        'batch-users',
        'batch-notifications',
      ])
      .withMessage('?��??�批?��?作�???),
    body('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('?�制?��?必�???1-100 之�?'),
    body('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('?�移?��??�是?��??�數'),
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

      const { status, type, limit = 20, offset = 0 } = req.query;

      logger.info('?��??�戶作業?�表', {
        userId: req.user.id,
        status,
        type,
        limit,
        offset,
      });

      // ?�裡?�要實?�獲?�用?��?業�?表�??�輯
      // ?�於 Bull.js 沒�??�接?��??�用?�查詢�??�能�?      // ?�們�?要在作業?��?中�??�用?�信??      const jobs = await batchOperationService.getUserJobs(req.user.id, {
        status,
        type,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        success: true,
        message: '作業?�表?��??��?',
        data: {
          jobs,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            total: jobs.length, // ?�裡?�該返�?總數
          },
        },
      });
    } catch (error) {
      logger.error('?��?作業?�表失�?:', error);
      res.status(500).json({
        success: false,
        message: error.message || '?��?作業?�表失�?',
        code: 'BATCH_JOBS_ERROR',
      });
    }
  }
);

/**
 * 清�??��?作業
 * DELETE /api/batch/cleanup
 */
router.delete(
  '/cleanup',
  [
    protect,
    authorize('admin'),
    body('daysToKeep')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('保�?天數必�???1-365 之�?'),
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

      const { daysToKeep = 7 } = req.body;

      logger.info('清�??��?作業', { adminId: req.user.id, daysToKeep });

// eslint-disable-next-line no-unused-vars
      const result = await batchOperationService.cleanupExpiredJobs(daysToKeep);

      res.json({
        success: true,
        message: `清�??��?作業完�?: ?�除 ${result.deletedCount} ?��?業`,
        data: {
          deletedCount: result.deletedCount,
          daysToKeep: parseInt(daysToKeep),
        },
      });
    } catch (error) {
      logger.error('清�??��?作業失�?:', error);
      res.status(500).json({
        success: false,
        message: error.message || '清�??��?作業失�?',
        code: 'BATCH_CLEANUP_ERROR',
      });
    }
  }
);

/**
 * ?��??��?示�?端�?
 * POST /api/batch/examples
 */
router.post('/examples', [protect], async (req, res) => {
  try {
    const { type } = req.body;

    let exampleData = {};

    switch (type) {
      case 'batch-cards':
        exampleData = {
          operation: 'bulk-update',
          cards: [
            {
              id: 1,
              currentPrice: 150.0,
              marketCap: 1000000,
            },
            {
              id: 2,
              currentPrice: 200.0,
              marketCap: 1500000,
            },
          ],
        };
        break;

      case 'batch-investments':
        exampleData = {
          operation: 'calculate-returns',
          userId: req.user.id,
        };
        break;

      case 'batch-market-data':
        exampleData = {
          operation: 'aggregate',
          cardId: 1,
          date: new Date().toISOString().split('T')[0],
        };
        break;

      case 'batch-users':
        exampleData = {
          operation: 'send-notification',
          userIds: [1, 2, 3],
          notification: {
            type: 'system-maintenance',
            title: '系統維護?�知',
            message: '系統將在今�??��?維護',
          },
        };
        break;

      case 'batch-notifications':
        exampleData = {
          operation: 'send',
          notifications: [
            {
              userId: 1,
              type: 'price-change',
              data: {
                cardName: 'Charizard',
                oldPrice: 100,
                newPrice: 120,
              },
            },
            {
              userId: 2,
              type: 'investment-advice',
              data: {
                cardName: 'Pikachu',
                recommendation: 'buy',
                reason: '?�格趨勢?�好',
              },
            },
          ],
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: '?��??�批?��?作�???,
          code: 'INVALID_BATCH_TYPE',
        });
    }

    res.json({
      success: true,
      message: '?��??��?示�??��??��?',
      data: {
        type,
        example: exampleData,
        description: getBatchTypeDescription(type),
      },
    });
  } catch (error) {
    logger.error('?��??��??��?示�?失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��??��??��?示�?失�?',
      code: 'BATCH_EXAMPLES_ERROR',
    });
  }
});

/**
 * ?��??��??��?類�??�述
 */
function getBatchTypeDescription(type) {
  const descriptions = {
    'batch-cards': '?��??��??��??��?，�??�創建、更?�、刪?��??��??�新?��?',
    'batch-investments': '?��??��??��??��?，�??�創建、更?�、刪?��?計�??�報?��?',
    'batch-market-data': '?��??��?市場?��?，�??�創建、更?�、�??��?清�??��?',
    'batch-users': '?��??��??�戶?��?，�??�更?�、�??�、�??��??�送通知?��?',
    'batch-notifications': '?��??��??�知，�??�發?�、調度�??��??��?',
  };

  return descriptions[type] || '?�知?�批?��?作�???;
}

module.exports = router;

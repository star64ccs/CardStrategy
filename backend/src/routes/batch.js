const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const logger = require('../utils/logger');
const batchOperationService = require('../services/batchOperationService');
const { protect, authorize } = require('../middleware/auth');

/**
 * 提交批量操作
 * POST /api/batch/submit
 */
router.post('/submit', [
  protect,
  body('type').isIn(['batch-cards', 'batch-investments', 'batch-market-data', 'batch-users', 'batch-notifications']).withMessage('無效的批量操作類型'),
  body('data').isObject().withMessage('數據必須是對象'),
  body('options').optional().isObject().withMessage('選項必須是對象'),
  body('options.priority').optional().isIn(['low', 'normal', 'high', 'critical']).withMessage('優先級必須是 low, normal, high 或 critical'),
  body('options.delay').optional().isInt({ min: 0 }).withMessage('延遲必須是非負整數')
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

    const { type, data, options = {} } = req.body;

    logger.info('提交批量操作', {
      userId: req.user.id,
      type,
      dataSize: JSON.stringify(data).length,
      options
    });

    const jobId = await batchOperationService.submitBatchOperation(type, data, options);

    res.json({
      success: true,
      message: '批量操作已提交',
      data: {
        jobId,
        type,
        status: 'pending',
        submittedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('提交批量操作失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '提交批量操作失敗',
      code: 'BATCH_SUBMIT_ERROR'
    });
  }
});

/**
 * 獲取作業狀態
 * GET /api/batch/status/:jobId
 */
router.get('/status/:jobId', [
  protect,
  param('jobId').isString().withMessage('作業 ID 必須是字符串')
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

    const { jobId } = req.params;

    logger.info('獲取作業狀態', { userId: req.user.id, jobId });

    const jobStatus = await batchOperationService.getJobStatus(jobId);

    if (!jobStatus) {
      return res.status(404).json({
        success: false,
        message: '作業不存在',
        code: 'JOB_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: '作業狀態獲取成功',
      data: jobStatus
    });
  } catch (error) {
    logger.error('獲取作業狀態失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取作業狀態失敗',
      code: 'BATCH_STATUS_ERROR'
    });
  }
});

/**
 * 取消作業
 * DELETE /api/batch/cancel/:jobId
 */
router.delete('/cancel/:jobId', [
  protect,
  param('jobId').isString().withMessage('作業 ID 必須是字符串')
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

    const { jobId } = req.params;

    logger.info('取消作業', { userId: req.user.id, jobId });

    const result = await batchOperationService.cancelJob(jobId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: '作業不存在或無法取消',
        code: 'JOB_CANCEL_FAILED'
      });
    }

    res.json({
      success: true,
      message: '作業已取消',
      data: result
    });
  } catch (error) {
    logger.error('取消作業失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '取消作業失敗',
      code: 'BATCH_CANCEL_ERROR'
    });
  }
});

/**
 * 獲取隊列統計
 * GET /api/batch/stats
 */
router.get('/stats', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    logger.info('獲取隊列統計', { adminId: req.user.id });

    const stats = await batchOperationService.getQueueStats();

    res.json({
      success: true,
      message: '隊列統計獲取成功',
      data: stats
    });
  } catch (error) {
    logger.error('獲取隊列統計失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取隊列統計失敗',
      code: 'BATCH_STATS_ERROR'
    });
  }
});

/**
 * 獲取用戶作業列表
 * GET /api/batch/jobs
 */
router.get('/jobs', [
  protect,
  body('status').optional().isIn(['pending', 'active', 'completed', 'failed', 'cancelled']).withMessage('狀態必須是 pending, active, completed, failed 或 cancelled'),
  body('type').optional().isIn(['batch-cards', 'batch-investments', 'batch-market-data', 'batch-users', 'batch-notifications']).withMessage('無效的批量操作類型'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('限制數量必須在 1-100 之間'),
  body('offset').optional().isInt({ min: 0 }).withMessage('偏移量必須是非負整數')
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

    const { status, type, limit = 20, offset = 0 } = req.query;

    logger.info('獲取用戶作業列表', {
      userId: req.user.id,
      status,
      type,
      limit,
      offset
    });

    // 這裡需要實現獲取用戶作業列表的邏輯
    // 由於 Bull.js 沒有直接提供按用戶查詢的功能，
    // 我們需要在作業數據中包含用戶信息
    const jobs = await batchOperationService.getUserJobs(req.user.id, {
      status,
      type,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      message: '作業列表獲取成功',
      data: {
        jobs,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: jobs.length // 這裡應該返回總數
        }
      }
    });
  } catch (error) {
    logger.error('獲取作業列表失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取作業列表失敗',
      code: 'BATCH_JOBS_ERROR'
    });
  }
});

/**
 * 清理過期作業
 * DELETE /api/batch/cleanup
 */
router.delete('/cleanup', [
  protect,
  authorize('admin'),
  body('daysToKeep').optional().isInt({ min: 1, max: 365 }).withMessage('保留天數必須在 1-365 之間')
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

    const { daysToKeep = 7 } = req.body;

    logger.info('清理過期作業', { adminId: req.user.id, daysToKeep });

    const result = await batchOperationService.cleanupExpiredJobs(daysToKeep);

    res.json({
      success: true,
      message: `清理過期作業完成: 刪除 ${result.deletedCount} 個作業`,
      data: {
        deletedCount: result.deletedCount,
        daysToKeep: parseInt(daysToKeep)
      }
    });
  } catch (error) {
    logger.error('清理過期作業失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '清理過期作業失敗',
      code: 'BATCH_CLEANUP_ERROR'
    });
  }
});

/**
 * 批量操作示例端點
 * POST /api/batch/examples
 */
router.post('/examples', [
  protect
], async (req, res) => {
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
              currentPrice: 150.00,
              marketCap: 1000000
            },
            {
              id: 2,
              currentPrice: 200.00,
              marketCap: 1500000
            }
          ]
        };
        break;

      case 'batch-investments':
        exampleData = {
          operation: 'calculate-returns',
          userId: req.user.id
        };
        break;

      case 'batch-market-data':
        exampleData = {
          operation: 'aggregate',
          cardId: 1,
          date: new Date().toISOString().split('T')[0]
        };
        break;

      case 'batch-users':
        exampleData = {
          operation: 'send-notification',
          userIds: [1, 2, 3],
          notification: {
            type: 'system-maintenance',
            title: '系統維護通知',
            message: '系統將在今晚進行維護'
          }
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
                newPrice: 120
              }
            },
            {
              userId: 2,
              type: 'investment-advice',
              data: {
                cardName: 'Pikachu',
                recommendation: 'buy',
                reason: '價格趨勢良好'
              }
            }
          ]
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: '無效的批量操作類型',
          code: 'INVALID_BATCH_TYPE'
        });
    }

    res.json({
      success: true,
      message: '批量操作示例獲取成功',
      data: {
        type,
        example: exampleData,
        description: getBatchTypeDescription(type)
      }
    });
  } catch (error) {
    logger.error('獲取批量操作示例失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取批量操作示例失敗',
      code: 'BATCH_EXAMPLES_ERROR'
    });
  }
});

/**
 * 獲取批量操作類型描述
 */
function getBatchTypeDescription(type) {
  const descriptions = {
    'batch-cards': '批量處理卡片數據，包括創建、更新、刪除和批量更新操作',
    'batch-investments': '批量處理投資數據，包括創建、更新、刪除和計算回報操作',
    'batch-market-data': '批量處理市場數據，包括創建、更新、聚合和清理操作',
    'batch-users': '批量處理用戶數據，包括更新、停用、啟用和發送通知操作',
    'batch-notifications': '批量處理通知，包括發送、調度和取消操作'
  };

  return descriptions[type] || '未知的批量操作類型';
}

module.exports = router;

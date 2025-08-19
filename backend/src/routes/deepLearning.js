const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const deepLearningService = require('../services/deepLearningService');
const modelPersistenceService = require('../services/modelPersistenceService');
const logger = require('../utils/logger');

const router = express.Router();

// 中間件：驗證請求
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

// 單卡預測
router.post('/predict', [
  body('cardId').isInt({ min: 1 }).withMessage('卡牌ID必須是正整數'),
  body('modelType').optional().isIn(['lstm', 'gru', 'transformer', 'ensemble']).withMessage('模型類型必須是 lstm, gru, transformer 或 ensemble'),
  validateRequest
], async (req, res) => {
  try {
    const { cardId, modelType = 'ensemble' } = req.body;

    logger.info(`開始深度學習預測，卡牌ID: ${cardId}，模型類型: ${modelType}`);

    const prediction = await deepLearningService.predictCardPrice(cardId, modelType);

    res.json({
      success: true,
      data: prediction,
      message: '預測完成'
    });
  } catch (error) {
    logger.error('深度學習預測失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '預測失敗',
      code: 'PREDICTION_ERROR'
    });
  }
});

// 模型比較
router.post('/compare-models', [
  body('cardId').isInt({ min: 1 }).withMessage('卡牌ID必須是正整數'),
  body('models').optional().isArray().withMessage('模型列表必須是數組'),
  body('models.*').optional().isIn(['lstm', 'gru', 'transformer', 'ensemble']).withMessage('模型類型必須是 lstm, gru, transformer 或 ensemble'),
  validateRequest
], async (req, res) => {
  try {
    const { cardId, models = ['lstm', 'gru', 'transformer', 'ensemble'] } = req.body;

    logger.info(`開始模型比較，卡牌ID: ${cardId}，模型: ${models.join(', ')}`);

    const comparisons = [];

    for (const modelType of models) {
      try {
        const prediction = await deepLearningService.predictCardPrice(cardId, modelType);
        comparisons.push({
          modelType,
          ...prediction
        });
      } catch (error) {
        logger.warn(`${modelType} 模型預測失敗:`, error.message);
        comparisons.push({
          modelType,
          error: error.message
        });
      }
    }

    // 計算模型一致性
    const validPredictions = comparisons.filter(c => !c.error);
    let modelAgreement = 1;

    if (validPredictions.length > 1) {
      const prices = validPredictions.map(p => p.predictedPrice);
      const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
      const std = Math.sqrt(variance);
      modelAgreement = Math.max(0, 1 - (std / mean));
    }

    res.json({
      success: true,
      data: {
        cardId,
        comparisons,
        modelAgreement,
        bestModel: validPredictions.length > 0 ?
          validPredictions.reduce((best, current) =>
            (current.confidence > best.confidence ? current : best)
          ).modelType : null
      },
      message: '模型比較完成'
    });
  } catch (error) {
    logger.error('模型比較失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '模型比較失敗',
      code: 'COMPARISON_ERROR'
    });
  }
});

// 批量預測
router.post('/batch-predict', [
  body('cardIds').isArray({ min: 1, max: 50 }).withMessage('卡牌ID列表必須包含1-50個ID'),
  body('cardIds.*').isInt({ min: 1 }).withMessage('卡牌ID必須是正整數'),
  body('modelType').optional().isIn(['lstm', 'gru', 'transformer', 'ensemble']).withMessage('模型類型必須是 lstm, gru, transformer 或 ensemble'),
  validateRequest
], async (req, res) => {
  try {
    const { cardIds, modelType = 'ensemble' } = req.body;

    logger.info(`開始批量預測，卡牌數量: ${cardIds.length}，模型類型: ${modelType}`);

    const results = [];
    const errors = [];

    // 並行處理預測
    const predictionPromises = cardIds.map(async (cardId) => {
      try {
        const prediction = await deepLearningService.predictCardPrice(cardId, modelType);
        return { cardId, success: true, data: prediction };
      } catch (error) {
        logger.warn(`卡牌 ${cardId} 預測失敗:`, error.message);
        return { cardId, success: false, error: error.message };
      }
    });

    const predictions = await Promise.all(predictionPromises);

    predictions.forEach(result => {
      if (result.success) {
        results.push(result.data);
      } else {
        errors.push({ cardId: result.cardId, error: result.error });
      }
    });

    res.json({
      success: true,
      data: {
        total: cardIds.length,
        successful: results.length,
        failed: errors.length,
        results,
        errors
      },
      message: `批量預測完成，成功: ${results.length}，失敗: ${errors.length}`
    });
  } catch (error) {
    logger.error('批量預測失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '批量預測失敗',
      code: 'BATCH_PREDICTION_ERROR'
    });
  }
});

// 模型狀態查詢
router.get('/model-status', async (req, res) => {
  try {
    logger.info('查詢模型狀態');

    const status = await deepLearningService.getModelStatus();

    res.json({
      success: true,
      data: status,
      message: '模型狀態查詢完成'
    });
  } catch (error) {
    logger.error('模型狀態查詢失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '模型狀態查詢失敗',
      code: 'STATUS_QUERY_ERROR'
    });
  }
});

// 模型參數優化
router.post('/optimize-model', [
  body('modelType').isIn(['lstm', 'gru', 'transformer']).withMessage('模型類型必須是 lstm, gru 或 transformer'),
  body('cardId').isInt({ min: 1 }).withMessage('卡牌ID必須是正整數'),
  body('parameters').optional().isObject().withMessage('參數必須是對象'),
  validateRequest
], async (req, res) => {
  try {
    const { modelType, cardId, parameters = {} } = req.body;

    logger.info(`開始模型參數優化，模型類型: ${modelType}，卡牌ID: ${cardId}`);

    // 這裡可以實現更複雜的參數優化邏輯
    // 目前返回當前模型狀態
    const status = await deepLearningService.getModelStatus();

    res.json({
      success: true,
      data: {
        modelType,
        cardId,
        currentParameters: status.models[modelType]?.metadata || {},
        optimizationResult: '參數優化功能開發中',
        recommendations: [
          '增加訓練數據量以提高準確性',
          '調整學習率以改善收斂速度',
          '增加模型複雜度以捕捉更複雜的模式'
        ]
      },
      message: '模型參數優化建議生成完成'
    });
  } catch (error) {
    logger.error('模型參數優化失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '模型參數優化失敗',
      code: 'OPTIMIZATION_ERROR'
    });
  }
});

// 模型持久化相關路由

// 獲取模型列表
router.get('/models', [
  query('modelType').optional().isIn(['lstm', 'gru', 'transformer', 'ensemble']).withMessage('模型類型必須是 lstm, gru, transformer 或 ensemble'),
  query('status').optional().isIn(['active', 'deleted', 'archived']).withMessage('狀態必須是 active, deleted 或 archived'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('限制數量必須是1-100的整數'),
  query('offset').optional().isInt({ min: 0 }).withMessage('偏移量必須是非負整數'),
  validateRequest
], async (req, res) => {
  try {
    const { modelType, status = 'active', limit = 20, offset = 0 } = req.query;

    logger.info(`查詢模型列表，類型: ${modelType || 'all'}，狀態: ${status}`);

    const models = await modelPersistenceService.getModelList({
      modelType,
      status,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: models,
      message: '模型列表查詢完成'
    });
  } catch (error) {
    logger.error('模型列表查詢失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '模型列表查詢失敗',
      code: 'MODEL_LIST_ERROR'
    });
  }
});

// 獲取特定模型
router.get('/models/:modelId', [
  param('modelId').isInt({ min: 1 }).withMessage('模型ID必須是正整數'),
  validateRequest
], async (req, res) => {
  try {
    const { modelId } = req.params;

    logger.info(`查詢模型詳情，模型ID: ${modelId}`);

    const model = await modelPersistenceService.getModelById(parseInt(modelId));

    if (!model) {
      return res.status(404).json({
        success: false,
        message: '模型不存在',
        code: 'MODEL_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: model,
      message: '模型詳情查詢完成'
    });
  } catch (error) {
    logger.error('模型詳情查詢失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '模型詳情查詢失敗',
      code: 'MODEL_DETAIL_ERROR'
    });
  }
});

// 刪除模型
router.delete('/models/:modelId', [
  param('modelId').isInt({ min: 1 }).withMessage('模型ID必須是正整數'),
  validateRequest
], async (req, res) => {
  try {
    const { modelId } = req.params;

    logger.info(`刪除模型，模型ID: ${modelId}`);

    const result = await modelPersistenceService.deleteModel(parseInt(modelId));

    if (!result) {
      return res.status(404).json({
        success: false,
        message: '模型不存在',
        code: 'MODEL_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: { modelId: parseInt(modelId) },
      message: '模型刪除成功'
    });
  } catch (error) {
    logger.error('模型刪除失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '模型刪除失敗',
      code: 'MODEL_DELETE_ERROR'
    });
  }
});

// 模型性能評估
router.post('/models/:modelId/evaluate', [
  param('modelId').isInt({ min: 1 }).withMessage('模型ID必須是正整數'),
  body('testData').optional().isArray().withMessage('測試數據必須是數組'),
  validateRequest
], async (req, res) => {
  try {
    const { modelId } = req.params;
    const { testData } = req.body;

    logger.info(`評估模型性能，模型ID: ${modelId}`);

    const evaluation = await modelPersistenceService.evaluateModelPerformance(parseInt(modelId), testData);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: '模型不存在',
        code: 'MODEL_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: evaluation,
      message: '模型性能評估完成'
    });
  } catch (error) {
    logger.error('模型性能評估失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '模型性能評估失敗',
      code: 'MODEL_EVALUATION_ERROR'
    });
  }
});

// 模型備份
router.post('/models/:modelId/backup', [
  param('modelId').isInt({ min: 1 }).withMessage('模型ID必須是正整數'),
  body('description').optional().isString().withMessage('描述必須是字符串'),
  validateRequest
], async (req, res) => {
  try {
    const { modelId } = req.params;
    const { description } = req.body;

    logger.info(`備份模型，模型ID: ${modelId}`);

    const backup = await modelPersistenceService.backupModel(parseInt(modelId), description);

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: '模型不存在',
        code: 'MODEL_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: backup,
      message: '模型備份成功'
    });
  } catch (error) {
    logger.error('模型備份失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '模型備份失敗',
      code: 'MODEL_BACKUP_ERROR'
    });
  }
});

// 模型恢復
router.post('/models/:modelId/restore', [
  param('modelId').isInt({ min: 1 }).withMessage('模型ID必須是正整數'),
  validateRequest
], async (req, res) => {
  try {
    const { modelId } = req.params;

    logger.info(`恢復模型，模型ID: ${modelId}`);

    const restored = await modelPersistenceService.restoreModel(parseInt(modelId));

    if (!restored) {
      return res.status(404).json({
        success: false,
        message: '模型不存在或無法恢復',
        code: 'MODEL_RESTORE_ERROR'
      });
    }

    res.json({
      success: true,
      data: restored,
      message: '模型恢復成功'
    });
  } catch (error) {
    logger.error('模型恢復失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '模型恢復失敗',
      code: 'MODEL_RESTORE_ERROR'
    });
  }
});

// 清理過期模型
router.post('/models/cleanup', [
  body('days').optional().isInt({ min: 1, max: 365 }).withMessage('天數必須是1-365的整數'),
  body('modelType').optional().isIn(['lstm', 'gru', 'transformer', 'ensemble']).withMessage('模型類型必須是 lstm, gru, transformer 或 ensemble'),
  validateRequest
], async (req, res) => {
  try {
    const { days = 30, modelType } = req.body;

    logger.info(`清理過期模型，天數: ${days}，模型類型: ${modelType || 'all'}`);

    const cleanupResult = await modelPersistenceService.cleanupExpiredModels(days, modelType);

    res.json({
      success: true,
      data: cleanupResult,
      message: `清理完成，刪除了 ${cleanupResult.deletedCount} 個過期模型`
    });
  } catch (error) {
    logger.error('模型清理失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '模型清理失敗',
      code: 'MODEL_CLEANUP_ERROR'
    });
  }
});

module.exports = router;

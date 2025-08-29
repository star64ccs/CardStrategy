const express = require('express');''
const { body, param, query, validationResult } = require('express-validator');''
const deepLearningService = require('../services/deepLearningService');'
// eslint-disable-next-line no-unused-vars''
const modelPersistenceService = require('../services/modelPersistenceService');'
// eslint-disable-next-line no-unused-vars''
const logger = require('../utils/logger');

const router = express.Router();

// 中�?件�?驗�?請�?
// eslint-disable-next-line no-unused-vars
const validateRequest = (req, res, next) => {
  try {
// eslint-disable-next-line no-unused-vars
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({'
        success: false,''
        message: '請�??�數驗�?失�?',
        errors: errors.array(),
      });
    }
    next();'
  } catch (error) {''
    logger.error('請�?驗�?中�?件錯�?', error);
    return res.status(500).json({'
      success: false,''
      message: '請�?驗�?失�?',''
      code: 'VALIDATION_MIDDLEWARE_ERROR',
    });
  }
};

// ?�卡?�測'
router.post(''
  '/predict','
  [''
    body('cardId').isInt({ min: 1 }).withMessage('?��?ID必�??�正?�數'),''
    body('modelType')'
      .optional()''
      .isIn(['lstm', 'gru', 'transformer', 'ensemble'])''
      .withMessage('模�?類�?必�???lstm, gru, transformer ??ensemble'),
    validateRequest,
  ],
  async (req, res) => {'
    try {''
      const { cardId, modelType = 'ensemble' } = req.body;

      logger.info(
        `?��?深度學�??�測，卡?�ID: ${cardId}，模?��??? ${modelType}`
      );

// eslint-disable-next-line no-unused-vars
      const prediction = await deepLearningService.predictCardPrice(
        cardId,
        modelType
      );

      res.json({
        success: true,'
        data: prediction,''
        message: '?�測完�?',
      });'
    } catch (error) {''
      logger.error('深度學�??�測失�?:', error);
      res.status(500).json({'
        success: false,''
        message: error.message || '?�測失�?',''
        code: 'PREDICTION_ERROR',
      });
    }
  }
);

// 模�?比�?'
router.post(''
  '/compare-models','
  [''
    body('cardId').isInt({ min: 1 }).withMessage('?��?ID必�??�正?�數'),''
    body('models').optional().isArray().withMessage('模�??�表必�??�數�?),''
    body('models.*')'
      .optional()''
      .isIn(['lstm', 'gru', 'transformer', 'ensemble'])''
      .withMessage('模�?類�?必�???lstm, gru, transformer ??ensemble'),
    validateRequest,
  ],
  async (req, res) => {'
    try {''
      const { cardId, models = ['lstm', 'gru', 'transformer', 'ensemble'] } =
        req.body;'
      logger.info(''
        `?��?模�?比�?，卡?�ID: ${cardId}，模?? ${models.join(', ')}`
      );

      const comparisons = [];

// eslint-disable-next-line no-unused-vars
      for (const modelType of models) {
        try {
// eslint-disable-next-line no-unused-vars
          const prediction = await deepLearningService.predictCardPrice(
            cardId,
            modelType
          );
          comparisons.push({
            modelType,
            ...prediction,
          });
        } catch (error) {
          logger.warn(`${modelType} 模�??�測失�?:`, error.message);
          comparisons.push({
            modelType,
            error: error.message,
          });
        }
      }
      // 計�?模�?一?��?      const validPredictions = comparisons.filter((c) => !c.error);
// eslint-disable-next-line no-unused-vars
      let modelAgreement = 1;

      if (validPredictions.length > 1) {
// eslint-disable-next-line no-unused-vars
        const prices = validPredictions.map((p) => p.predictedPrice);
        const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        const variance =
          prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) /
          prices.length;
        const std = Math.sqrt(variance);
        modelAgreement = Math.max(0, 1 - std / mean);
      }
      res.json({
        success: true,
        data: {
          cardId,
          comparisons,
          modelAgreement,
          bestModel:
            validPredictions.length > 0
              ? validPredictions.reduce((best, current) =>
                  current.confidence > best.confidence ? current : best
                ).modelType
              : null,'
        },''
        message: '模�?比�?完�?',
      });'
    } catch (error) {''
      logger.error('模�?比�?失�?:', error);
      res.status(500).json({'
        success: false,''
        message: error.message || '模�?比�?失�?',''
        code: 'COMPARISON_ERROR',
      });
    }
  }
);

// ?��??�測'
router.post(''
  '/batch-predict','
  [''
    body('cardIds')'
      .isArray({ min: 1, max: 50 });''
      .withMessage('?��?ID?�表必�??�含1-50?�ID'),''
    body('cardIds.*').isInt({ min: 1 }).withMessage('?��?ID必�??�正?�數'),''
    body('modelType')'
      .optional()''
      .isIn(['lstm', 'gru', 'transformer', 'ensemble'])''
      .withMessage('模�?類�?必�???lstm, gru, transformer ??ensemble'),
    validateRequest,
  ],
  async (req, res) => {'
    try {''
      const { cardIds, modelType = 'ensemble' } = req.body;

      logger.info(
        `?��??��??�測，卡?�數?? ${cardIds.length}，模?��??? ${modelType}`
      );

// eslint-disable-next-line no-unused-vars
      const results = [];
// eslint-disable-next-line no-unused-vars
      const errors = [];

      // 並�??��??�測
// eslint-disable-next-line no-unused-vars
      const predictionPromises = cardIds.map(async (cardId) => {
        try {
// eslint-disable-next-line no-unused-vars
          const prediction = await deepLearningService.predictCardPrice(
            cardId,
            modelType
          );
          return { cardId, success: true, data: prediction };
        } catch (error) {
          logger.warn(`?��? ${cardId} ?�測失�?:`, error.message);
          return { cardId, success: false, error: error.message };
        }
      });

// eslint-disable-next-line no-unused-vars
      const predictions = await Promise.all(predictionPromises);

      predictions.forEach((result) => {
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
          errors,
        },
        message: `?��??�測完�?，�??? ${results.length}，失?? ${errors.length}`,
      });'
    } catch (error) {''
      logger.error('?��??�測失�?:', error);
      res.status(500).json({'
        success: false,''
        message: error.message || '?��??�測失�?',''
        code: 'BATCH_PREDICTION_ERROR',
      });
    }'
  }
);''
// 模�??�?�查�?router.get('/model-status', async (req, res) => {'
  try {''
    logger.info('?�詢模�??�??);

// eslint-disable-next-line no-unused-vars
    const status = await deepLearningService.getModelStatus();

    res.json({
      success: true,'
      data: status,''
      message: '模�??�?�查詢�???,
    });'
  } catch (error) {''
    logger.error('模�??�?�查詢失??', error);
    res.status(500).json({'
      success: false,''
      message: error.message || '模�??�?�查詢失??,''
      code: 'STATUS_QUERY_ERROR',
    });
  }
});

// 模�??�數?��?'
router.post(''
  '/optimize-model','
  [''
    body('modelType')''
      .isIn(['lstm', 'gru', 'transformer'])''
      .withMessage('模�?類�?必�???lstm, gru ??transformer'),''
    body('cardId').isInt({ min: 1 }).withMessage('?��?ID必�??�正?�數'),''
    body('parameters').optional().isObject().withMessage('?�數必�??��?�?),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { modelType, cardId, parameters = {} } = req.body;

      logger.info(
        `?��?模�??�數?��?，模?��??? ${modelType}，卡?�ID: ${cardId}`
      );

      // ?�裡?�以實現?��??��??�數?��??�輯
      // ?��?返�??��?模�??�??// eslint-disable-next-line no-unused-vars
      const status = await deepLearningService.getModelStatus();

      res.json({
        success: true,
        data: {
          modelType,
          cardId,'
          currentParameters: status.models[modelType]?.metadata || {},''
          optimizationResult: '?�數?��??�能?�發�?,'
          recommendations: [''
            '增�?訓練?��??�以?��?準確??,''
            '調整學�??�以?��??��??�度',''
            '增�?模�?複�?度以?��??��??��?模�?',
          ],'
        },''
        message: '模�??�數?��?建議?��?完�?',
      });'
    } catch (error) {''
      logger.error('模�??�數?��?失�?:', error);
      res.status(500).json({'
        success: false,''
        message: error.message || '模�??�數?��?失�?',''
        code: 'OPTIMIZATION_ERROR',
      });
    }
  }
);

// 模�??��??�相?�路??
// ?��?模�??�表'
router.get(''
  '/models','
  [''
    query('modelType')'
      .optional()''
      .isIn(['lstm', 'gru', 'transformer', 'ensemble'])''
      .withMessage('模�?類�?必�???lstm, gru, transformer ??ensemble'),''
    query('status')'
      .optional()''
      .isIn(['active', 'deleted', 'archived'])''
      .withMessage('?�?��??�是 active, deleted ??archived'),''
    query('limit')
      .optional()'
      .isInt({ min: 1, max: 100 });''
      .withMessage('?�制?��?必�???-100?�整??),''
    query('offset')
      .optional()'
      .isInt({ min: 0 });''
      .withMessage('?�移?��??�是?��??�數'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const {'
        modelType,''
        status = 'active',
        limit = 20,
        offset = 0,'
      } = req.query;''
      logger.info(`?�詢模�??�表，�??? ${modelType || 'all'}，�??? ${status}`);

// eslint-disable-next-line no-unused-vars
      const models = await modelPersistenceService.getModelList({
        modelType,
        status,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        success: true,'
        data: models,''
        message: '模�??�表?�詢完�?',
      });'
    } catch (error) {''
      logger.error('模�??�表?�詢失�?:', error);
      res.status(500).json({'
        success: false,''
        message: error.message || '模�??�表?�詢失�?',''
        code: 'MODEL_LIST_ERROR',
      });
    }
  }
);

// ?��??��?模�?'
router.get(''
  '/models/:modelId','
  [''
    param('modelId').isInt({ min: 1 }).withMessage('模�?ID必�??�正?�數'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { modelId } = req.params;

      logger.info(`?�詢模�?詳�?，模?�ID: ${modelId}`);

// eslint-disable-next-line no-unused-vars
      const model = await modelPersistenceService.getModelById(
        parseInt(modelId)
      );

      if (!model) {
        return res.status(404).json({'
          success: false,''
          message: '模�?不�???,''
          code: 'MODEL_NOT_FOUND',
        });
      }
      res.json({
        success: true,'
        data: model,''
        message: '模�?詳�??�詢完�?',
      });'
    } catch (error) {''
      logger.error('模�?詳�??�詢失�?:', error);
      res.status(500).json({'
        success: false,''
        message: error.message || '模�?詳�??�詢失�?',''
        code: 'MODEL_DETAIL_ERROR',
      });
    }
  }
);

// ?�除模�?'
router.delete(''
  '/models/:modelId','
  [''
    param('modelId').isInt({ min: 1 }).withMessage('模�?ID必�??�正?�數'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { modelId } = req.params;

      logger.info(`?�除模�?，模?�ID: ${modelId}`);

// eslint-disable-next-line no-unused-vars
      const result = await modelPersistenceService.deleteModel(
        parseInt(modelId)
      );

      if (!result) {
        return res.status(404).json({'
          success: false,''
          message: '模�?不�???,''
          code: 'MODEL_NOT_FOUND',
        });
      }
      res.json({
        success: true,'
        data: { modelId: parseInt(modelId) },''
        message: '模�??�除?��?',
      });'
    } catch (error) {''
      logger.error('模�??�除失�?:', error);
      res.status(500).json({'
        success: false,''
        message: error.message || '模�??�除失�?',''
        code: 'MODEL_DELETE_ERROR',
      });
    }
  }
);

// 模�??�能評估'
router.post(''
  '/models/:modelId/evaluate','
  [''
    param('modelId').isInt({ min: 1 }).withMessage('模�?ID必�??�正?�數'),''
    body('testData').optional().isArray().withMessage('測試?��?必�??�數�?),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { modelId } = req.params;
      const { testData } = req.body;

      logger.info(`評估模�??�能，模?�ID: ${modelId}`);

      const evaluation = await modelPersistenceService.evaluateModelPerformance(
        parseInt(modelId),
        testData
      );

      if (!evaluation) {
        return res.status(404).json({'
          success: false,''
          message: '模�?不�???,''
          code: 'MODEL_NOT_FOUND',
        });
      }
      res.json({
        success: true,'
        data: evaluation,''
        message: '模�??�能評估完�?',
      });'
    } catch (error) {''
      logger.error('模�??�能評估失�?:', error);
      res.status(500).json({'
        success: false,''
        message: error.message || '模�??�能評估失�?',''
        code: 'MODEL_EVALUATION_ERROR',
      });
    }
  }
);

// 模�??�份'
router.post(''
  '/models/:modelId/backup','
  [''
    param('modelId').isInt({ min: 1 }).withMessage('模�?ID必�??�正?�數'),''
    body('description').optional().isString().withMessage('?�述必�??��?符串'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { modelId } = req.params;
      const { description } = req.body;

      logger.info(`?�份模�?，模?�ID: ${modelId}`);

      const backup = await modelPersistenceService.backupModel(
        parseInt(modelId),
        description
      );

      if (!backup) {
        return res.status(404).json({'
          success: false,''
          message: '模�?不�???,''
          code: 'MODEL_NOT_FOUND',
        });
      }
      res.json({
        success: true,'
        data: backup,''
        message: '模�??�份?��?',
      });'
    } catch (error) {''
      logger.error('模�??�份失�?:', error);
      res.status(500).json({'
        success: false,''
        message: error.message || '模�??�份失�?',''
        code: 'MODEL_BACKUP_ERROR',
      });
    }
  }
);

// 模�??�復'
router.post(''
  '/models/:modelId/restore','
  [''
    param('modelId').isInt({ min: 1 }).withMessage('模�?ID必�??�正?�數'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { modelId } = req.params;

      logger.info(`?�復模�?，模?�ID: ${modelId}`);

// eslint-disable-next-line no-unused-vars
      const restored = await modelPersistenceService.restoreModel(
        parseInt(modelId)
      );

      if (!restored) {
        return res.status(404).json({'
          success: false,''
          message: '模�?不�??��??��??�復',''
          code: 'MODEL_RESTORE_ERROR',
        });
      }
      res.json({
        success: true,'
        data: restored,''
        message: '模�??�復?��?',
      });'
    } catch (error) {''
      logger.error('模�??�復失�?:', error);
      res.status(500).json({'
        success: false,''
        message: error.message || '模�??�復失�?',''
        code: 'MODEL_RESTORE_ERROR',
      });
    }
  }
);

// 清�??��?模�?'
router.post(''
  '/models/cleanup','
  [''
    body('days')
      .optional()'
      .isInt({ min: 1, max: 365 });''
      .withMessage('天數必�???-365?�整??),''
    body('modelType')'
      .optional()''
      .isIn(['lstm', 'gru', 'transformer', 'ensemble'])''
      .withMessage('模�?類�?必�???lstm, gru, transformer ??ensemble'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { days = 30, modelType } = req.body;'
      logger.info(''
        `清�??��?模�?，天?? ${days}，模?��??? ${modelType || 'all'}`
      );

      const cleanupResult = await modelPersistenceService.cleanupExpiredModels(
        days,
        modelType
      );

      res.json({
        success: true,
        data: cleanupResult,
        message: `清�?完�?，刪?��? ${cleanupResult.deletedCount} ?��??�模?�`,
      });'
    } catch (error) {''
      logger.error('模�?清�?失�?:', error);
      res.status(500).json({'
        success: false,''
        message: error.message || '模�?清�?失�?',''
        code: 'MODEL_CLEANUP_ERROR',
      });
    }
  }
);'
module.exports = router;''
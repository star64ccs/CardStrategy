const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const deepLearningService = require('../services/deepLearningService');
// eslint-disable-next-line no-unused-vars
const modelPersistenceService = require('../services/modelPersistenceService');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');

const router = express.Router();

// ä¸­é?ä»¶ï?é©—è?è«‹æ?
// eslint-disable-next-line no-unused-vars
const validateRequest = (req, res, next) => {
  try {
// eslint-disable-next-line no-unused-vars
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'è«‹æ??ƒæ•¸é©—è?å¤±æ?',
        errors: errors.array(),
      });
    }
    next();
  } catch (error) {
    logger.error('è«‹æ?é©—è?ä¸­é?ä»¶éŒ¯èª?', error);
    return res.status(500).json({
      success: false,
      message: 'è«‹æ?é©—è?å¤±æ?',
      code: 'VALIDATION_MIDDLEWARE_ERROR',
    });
  }
};

// ?®å¡?æ¸¬
router.post(
  '/predict',
  [
    body('cardId').isInt({ min: 1 }).withMessage('?¡ç?IDå¿…é??¯æ­£?´æ•¸'),
    body('modelType')
      .optional()
      .isIn(['lstm', 'gru', 'transformer', 'ensemble'])
      .withMessage('æ¨¡å?é¡žå?å¿…é???lstm, gru, transformer ??ensemble'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { cardId, modelType = 'ensemble' } = req.body;

      logger.info(
        `?‹å?æ·±åº¦å­¸ç??æ¸¬ï¼Œå¡?ŒID: ${cardId}ï¼Œæ¨¡?‹é??? ${modelType}`
      );

// eslint-disable-next-line no-unused-vars
      const prediction = await deepLearningService.predictCardPrice(
        cardId,
        modelType
      );

      res.json({
        success: true,
        data: prediction,
        message: '?æ¸¬å®Œæ?',
      });
    } catch (error) {
      logger.error('æ·±åº¦å­¸ç??æ¸¬å¤±æ?:', error);
      res.status(500).json({
        success: false,
        message: error.message || '?æ¸¬å¤±æ?',
        code: 'PREDICTION_ERROR',
      });
    }
  }
);

// æ¨¡å?æ¯”è?
router.post(
  '/compare-models',
  [
    body('cardId').isInt({ min: 1 }).withMessage('?¡ç?IDå¿…é??¯æ­£?´æ•¸'),
    body('models').optional().isArray().withMessage('æ¨¡å??—è¡¨å¿…é??¯æ•¸çµ?),
    body('models.*')
      .optional()
      .isIn(['lstm', 'gru', 'transformer', 'ensemble'])
      .withMessage('æ¨¡å?é¡žå?å¿…é???lstm, gru, transformer ??ensemble'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { cardId, models = ['lstm', 'gru', 'transformer', 'ensemble'] } =
        req.body;

      logger.info(
        `?‹å?æ¨¡å?æ¯”è?ï¼Œå¡?ŒID: ${cardId}ï¼Œæ¨¡?? ${models.join(', ')}`
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
          logger.warn(`${modelType} æ¨¡å??æ¸¬å¤±æ?:`, error.message);
          comparisons.push({
            modelType,
            error: error.message,
          });
        }
      }

      // è¨ˆç?æ¨¡å?ä¸€?´æ€?      const validPredictions = comparisons.filter((c) => !c.error);
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
              : null,
        },
        message: 'æ¨¡å?æ¯”è?å®Œæ?',
      });
    } catch (error) {
      logger.error('æ¨¡å?æ¯”è?å¤±æ?:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'æ¨¡å?æ¯”è?å¤±æ?',
        code: 'COMPARISON_ERROR',
      });
    }
  }
);

// ?¹é??æ¸¬
router.post(
  '/batch-predict',
  [
    body('cardIds')
      .isArray({ min: 1, max: 50 })
      .withMessage('?¡ç?ID?—è¡¨å¿…é??…å«1-50?‹ID'),
    body('cardIds.*').isInt({ min: 1 }).withMessage('?¡ç?IDå¿…é??¯æ­£?´æ•¸'),
    body('modelType')
      .optional()
      .isIn(['lstm', 'gru', 'transformer', 'ensemble'])
      .withMessage('æ¨¡å?é¡žå?å¿…é???lstm, gru, transformer ??ensemble'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { cardIds, modelType = 'ensemble' } = req.body;

      logger.info(
        `?‹å??¹é??æ¸¬ï¼Œå¡?Œæ•¸?? ${cardIds.length}ï¼Œæ¨¡?‹é??? ${modelType}`
      );

// eslint-disable-next-line no-unused-vars
      const results = [];
// eslint-disable-next-line no-unused-vars
      const errors = [];

      // ä¸¦è??•ç??æ¸¬
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
          logger.warn(`?¡ç? ${cardId} ?æ¸¬å¤±æ?:`, error.message);
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
        message: `?¹é??æ¸¬å®Œæ?ï¼Œæ??? ${results.length}ï¼Œå¤±?? ${errors.length}`,
      });
    } catch (error) {
      logger.error('?¹é??æ¸¬å¤±æ?:', error);
      res.status(500).json({
        success: false,
        message: error.message || '?¹é??æ¸¬å¤±æ?',
        code: 'BATCH_PREDICTION_ERROR',
      });
    }
  }
);

// æ¨¡å??€?‹æŸ¥è©?router.get('/model-status', async (req, res) => {
  try {
    logger.info('?¥è©¢æ¨¡å??€??);

// eslint-disable-next-line no-unused-vars
    const status = await deepLearningService.getModelStatus();

    res.json({
      success: true,
      data: status,
      message: 'æ¨¡å??€?‹æŸ¥è©¢å???,
    });
  } catch (error) {
    logger.error('æ¨¡å??€?‹æŸ¥è©¢å¤±??', error);
    res.status(500).json({
      success: false,
      message: error.message || 'æ¨¡å??€?‹æŸ¥è©¢å¤±??,
      code: 'STATUS_QUERY_ERROR',
    });
  }
});

// æ¨¡å??ƒæ•¸?ªå?
router.post(
  '/optimize-model',
  [
    body('modelType')
      .isIn(['lstm', 'gru', 'transformer'])
      .withMessage('æ¨¡å?é¡žå?å¿…é???lstm, gru ??transformer'),
    body('cardId').isInt({ min: 1 }).withMessage('?¡ç?IDå¿…é??¯æ­£?´æ•¸'),
    body('parameters').optional().isObject().withMessage('?ƒæ•¸å¿…é??¯å?è±?),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { modelType, cardId, parameters = {} } = req.body;

      logger.info(
        `?‹å?æ¨¡å??ƒæ•¸?ªå?ï¼Œæ¨¡?‹é??? ${modelType}ï¼Œå¡?ŒID: ${cardId}`
      );

      // ?™è£¡?¯ä»¥å¯¦ç¾?´è??œç??ƒæ•¸?ªå??è¼¯
      // ?®å?è¿”å??¶å?æ¨¡å??€??// eslint-disable-next-line no-unused-vars
      const status = await deepLearningService.getModelStatus();

      res.json({
        success: true,
        data: {
          modelType,
          cardId,
          currentParameters: status.models[modelType]?.metadata || {},
          optimizationResult: '?ƒæ•¸?ªå??Ÿèƒ½?‹ç™¼ä¸?,
          recommendations: [
            'å¢žå?è¨“ç·´?¸æ??ä»¥?é?æº–ç¢º??,
            'èª¿æ•´å­¸ç??‡ä»¥?¹å??¶æ??Ÿåº¦',
            'å¢žå?æ¨¡å?è¤‡é?åº¦ä»¥?•æ??´è??œç?æ¨¡å?',
          ],
        },
        message: 'æ¨¡å??ƒæ•¸?ªå?å»ºè­°?Ÿæ?å®Œæ?',
      });
    } catch (error) {
      logger.error('æ¨¡å??ƒæ•¸?ªå?å¤±æ?:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'æ¨¡å??ƒæ•¸?ªå?å¤±æ?',
        code: 'OPTIMIZATION_ERROR',
      });
    }
  }
);

// æ¨¡å??ä??–ç›¸?œè·¯??
// ?²å?æ¨¡å??—è¡¨
router.get(
  '/models',
  [
    query('modelType')
      .optional()
      .isIn(['lstm', 'gru', 'transformer', 'ensemble'])
      .withMessage('æ¨¡å?é¡žå?å¿…é???lstm, gru, transformer ??ensemble'),
    query('status')
      .optional()
      .isIn(['active', 'deleted', 'archived'])
      .withMessage('?€?‹å??ˆæ˜¯ active, deleted ??archived'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('?åˆ¶?¸é?å¿…é???-100?„æ•´??),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('?ç§»?å??ˆæ˜¯?žè??´æ•¸'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const {
        modelType,
        status = 'active',
        limit = 20,
        offset = 0,
      } = req.query;

      logger.info(`?¥è©¢æ¨¡å??—è¡¨ï¼Œé??? ${modelType || 'all'}ï¼Œç??? ${status}`);

// eslint-disable-next-line no-unused-vars
      const models = await modelPersistenceService.getModelList({
        modelType,
        status,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        success: true,
        data: models,
        message: 'æ¨¡å??—è¡¨?¥è©¢å®Œæ?',
      });
    } catch (error) {
      logger.error('æ¨¡å??—è¡¨?¥è©¢å¤±æ?:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'æ¨¡å??—è¡¨?¥è©¢å¤±æ?',
        code: 'MODEL_LIST_ERROR',
      });
    }
  }
);

// ?²å??¹å?æ¨¡å?
router.get(
  '/models/:modelId',
  [
    param('modelId').isInt({ min: 1 }).withMessage('æ¨¡å?IDå¿…é??¯æ­£?´æ•¸'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { modelId } = req.params;

      logger.info(`?¥è©¢æ¨¡å?è©³æ?ï¼Œæ¨¡?‹ID: ${modelId}`);

// eslint-disable-next-line no-unused-vars
      const model = await modelPersistenceService.getModelById(
        parseInt(modelId)
      );

      if (!model) {
        return res.status(404).json({
          success: false,
          message: 'æ¨¡å?ä¸å???,
          code: 'MODEL_NOT_FOUND',
        });
      }

      res.json({
        success: true,
        data: model,
        message: 'æ¨¡å?è©³æ??¥è©¢å®Œæ?',
      });
    } catch (error) {
      logger.error('æ¨¡å?è©³æ??¥è©¢å¤±æ?:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'æ¨¡å?è©³æ??¥è©¢å¤±æ?',
        code: 'MODEL_DETAIL_ERROR',
      });
    }
  }
);

// ?ªé™¤æ¨¡å?
router.delete(
  '/models/:modelId',
  [
    param('modelId').isInt({ min: 1 }).withMessage('æ¨¡å?IDå¿…é??¯æ­£?´æ•¸'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { modelId } = req.params;

      logger.info(`?ªé™¤æ¨¡å?ï¼Œæ¨¡?‹ID: ${modelId}`);

// eslint-disable-next-line no-unused-vars
      const result = await modelPersistenceService.deleteModel(
        parseInt(modelId)
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'æ¨¡å?ä¸å???,
          code: 'MODEL_NOT_FOUND',
        });
      }

      res.json({
        success: true,
        data: { modelId: parseInt(modelId) },
        message: 'æ¨¡å??ªé™¤?å?',
      });
    } catch (error) {
      logger.error('æ¨¡å??ªé™¤å¤±æ?:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'æ¨¡å??ªé™¤å¤±æ?',
        code: 'MODEL_DELETE_ERROR',
      });
    }
  }
);

// æ¨¡å??§èƒ½è©•ä¼°
router.post(
  '/models/:modelId/evaluate',
  [
    param('modelId').isInt({ min: 1 }).withMessage('æ¨¡å?IDå¿…é??¯æ­£?´æ•¸'),
    body('testData').optional().isArray().withMessage('æ¸¬è©¦?¸æ?å¿…é??¯æ•¸çµ?),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { modelId } = req.params;
      const { testData } = req.body;

      logger.info(`è©•ä¼°æ¨¡å??§èƒ½ï¼Œæ¨¡?‹ID: ${modelId}`);

      const evaluation = await modelPersistenceService.evaluateModelPerformance(
        parseInt(modelId),
        testData
      );

      if (!evaluation) {
        return res.status(404).json({
          success: false,
          message: 'æ¨¡å?ä¸å???,
          code: 'MODEL_NOT_FOUND',
        });
      }

      res.json({
        success: true,
        data: evaluation,
        message: 'æ¨¡å??§èƒ½è©•ä¼°å®Œæ?',
      });
    } catch (error) {
      logger.error('æ¨¡å??§èƒ½è©•ä¼°å¤±æ?:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'æ¨¡å??§èƒ½è©•ä¼°å¤±æ?',
        code: 'MODEL_EVALUATION_ERROR',
      });
    }
  }
);

// æ¨¡å??™ä»½
router.post(
  '/models/:modelId/backup',
  [
    param('modelId').isInt({ min: 1 }).withMessage('æ¨¡å?IDå¿…é??¯æ­£?´æ•¸'),
    body('description').optional().isString().withMessage('?è¿°å¿…é??¯å?ç¬¦ä¸²'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { modelId } = req.params;
      const { description } = req.body;

      logger.info(`?™ä»½æ¨¡å?ï¼Œæ¨¡?‹ID: ${modelId}`);

      const backup = await modelPersistenceService.backupModel(
        parseInt(modelId),
        description
      );

      if (!backup) {
        return res.status(404).json({
          success: false,
          message: 'æ¨¡å?ä¸å???,
          code: 'MODEL_NOT_FOUND',
        });
      }

      res.json({
        success: true,
        data: backup,
        message: 'æ¨¡å??™ä»½?å?',
      });
    } catch (error) {
      logger.error('æ¨¡å??™ä»½å¤±æ?:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'æ¨¡å??™ä»½å¤±æ?',
        code: 'MODEL_BACKUP_ERROR',
      });
    }
  }
);

// æ¨¡å??¢å¾©
router.post(
  '/models/:modelId/restore',
  [
    param('modelId').isInt({ min: 1 }).withMessage('æ¨¡å?IDå¿…é??¯æ­£?´æ•¸'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { modelId } = req.params;

      logger.info(`?¢å¾©æ¨¡å?ï¼Œæ¨¡?‹ID: ${modelId}`);

// eslint-disable-next-line no-unused-vars
      const restored = await modelPersistenceService.restoreModel(
        parseInt(modelId)
      );

      if (!restored) {
        return res.status(404).json({
          success: false,
          message: 'æ¨¡å?ä¸å??¨æ??¡æ??¢å¾©',
          code: 'MODEL_RESTORE_ERROR',
        });
      }

      res.json({
        success: true,
        data: restored,
        message: 'æ¨¡å??¢å¾©?å?',
      });
    } catch (error) {
      logger.error('æ¨¡å??¢å¾©å¤±æ?:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'æ¨¡å??¢å¾©å¤±æ?',
        code: 'MODEL_RESTORE_ERROR',
      });
    }
  }
);

// æ¸…ç??Žæ?æ¨¡å?
router.post(
  '/models/cleanup',
  [
    body('days')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('å¤©æ•¸å¿…é???-365?„æ•´??),
    body('modelType')
      .optional()
      .isIn(['lstm', 'gru', 'transformer', 'ensemble'])
      .withMessage('æ¨¡å?é¡žå?å¿…é???lstm, gru, transformer ??ensemble'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { days = 30, modelType } = req.body;

      logger.info(
        `æ¸…ç??Žæ?æ¨¡å?ï¼Œå¤©?? ${days}ï¼Œæ¨¡?‹é??? ${modelType || 'all'}`
      );

      const cleanupResult = await modelPersistenceService.cleanupExpiredModels(
        days,
        modelType
      );

      res.json({
        success: true,
        data: cleanupResult,
        message: `æ¸…ç?å®Œæ?ï¼Œåˆª?¤ä? ${cleanupResult.deletedCount} ?‹é??Ÿæ¨¡?‹`,
      });
    } catch (error) {
      logger.error('æ¨¡å?æ¸…ç?å¤±æ?:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'æ¨¡å?æ¸…ç?å¤±æ?',
        code: 'MODEL_CLEANUP_ERROR',
      });
    }
  }
);

module.exports = router;

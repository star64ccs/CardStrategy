const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken: protect } = require('../middleware/auth');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
// eslint-disable-next-line no-unused-vars
const predictionService = require('../services/predictionService');

const router = express.Router();

// @route   POST /api/predictions/predict
// @desc    ?æ¸¬?¡ç??¹æ ¼
// @access  Private
router.post(
  '/predict',
  protect,
  [
    body('cardId').isInt({ min: 1 }).withMessage('?¡ç?IDå¿…é??¯æ­£?´æ•¸'),
    body('timeframe')
      .isIn(['1d', '7d', '30d', '90d', '180d', '365d'])
      .withMessage('?‚é?æ¡†æ¶å¿…é???d??d??0d??0d??80d??65d'),
    body('modelType')
      .optional()
      .isIn([
        'linear',
        'polynomial',
        'exponential',
        'arima',
        'lstm',
        'ensemble',
      ])
      .withMessage(
        'æ¨¡å?é¡å?å¿…é??¯linear?polynomial?exponential?arima?lstm?–ensemble'
      ),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'è¼¸å…¥é©—è?å¤±æ?',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { cardId, timeframe, modelType = 'ensemble' } = req.body;

      // ?·è??æ¸¬
// eslint-disable-next-line no-unused-vars
      const prediction = await predictionService.predictCardPrice(
        cardId,
        timeframe,
        modelType
      );

      logger.info(
        `?¹æ ¼?æ¸¬: ?¨æˆ¶ ${req.user.username} ?æ¸¬?¡ç? ${cardId}, æ¨¡å? ${modelType}, ?‚é?æ¡†æ¶ ${timeframe}`
      );

      res.json({
        success: true,
        message: '?æ¸¬å®Œæ?',
        data: { prediction },
      });
    } catch (error) {
      logger.error('?¹æ ¼?æ¸¬?¯èª¤:', error);
      res.status(500).json({
        success: false,
        message: error.message || '?æ¸¬å¤±æ?',
        code: 'PREDICTION_FAILED',
      });
    }
  }
);

// @route   GET /api/predictions/history/:cardId
// @desc    ?²å??æ¸¬æ­·å²
// @access  Private
router.get(
  '/history/:cardId',
  protect,
  [
    body('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('?åˆ¶?¸é?å¿…é???-100ä¹‹é?'),
  ],
  async (req, res) => {
    try {
      const { cardId } = req.params;
      const { limit = 50 } = req.query;

      // ?²å??æ¸¬æ­·å²
// eslint-disable-next-line no-unused-vars
      const predictions = await predictionService.getPredictionHistory(
        parseInt(cardId),
        parseInt(limit)
      );

      logger.info(
        `?²å??æ¸¬æ­·å²: ?¨æˆ¶ ${req.user.username} ?¥ç??¡ç? ${cardId} ?„é?æ¸¬æ­·?²`
      );

      res.json({
        success: true,
        message: '?æ¸¬æ­·å²?²å??å?',
        data: {
          predictions,
          total: predictions.length,
          cardId: parseInt(cardId),
        },
      });
    } catch (error) {
      logger.error('?²å??æ¸¬æ­·å²?¯èª¤:', error);
      res.status(500).json({
        success: false,
        message: error.message || '?²å??æ¸¬æ­·å²å¤±æ?',
        code: 'HISTORY_FETCH_FAILED',
      });
    }
  }
);

// @route   POST /api/predictions/accuracy/:predictionId
// @desc    è¨ˆç??æ¸¬æº–ç¢º??// @access  Private
router.post('/accuracy/:predictionId', protect, async (req, res) => {
  try {
    const { predictionId } = req.params;

    // è¨ˆç??æ¸¬æº–ç¢º??    const accuracy = await predictionService.calculatePredictionAccuracy(
      parseInt(predictionId)
    );

    if (!accuracy) {
      return res.json({
        success: true,
        message: '?®æ??¥æ??„æ??‰å¯¦?›æ•¸?šï??¡æ?è¨ˆç?æº–ç¢º??,
        data: { accuracy: null },
      });
    }

    logger.info(
      `è¨ˆç??æ¸¬æº–ç¢º?? ?¨æˆ¶ ${req.user.username} è¨ˆç??æ¸¬ ${predictionId} ?„æ?ç¢ºæ€§`
    );

    res.json({
      success: true,
      message: 'æº–ç¢º?§è?ç®—å???,
      data: { accuracy },
    });
  } catch (error) {
    logger.error('è¨ˆç??æ¸¬æº–ç¢º?§éŒ¯èª?', error);
    res.status(500).json({
      success: false,
      message: error.message || 'è¨ˆç?æº–ç¢º?§å¤±??,
      code: 'ACCURACY_CALCULATION_FAILED',
    });
  }
});

// @route   POST /api/predictions/batch
// @desc    ?¹é??æ¸¬
// @access  Private
router.post(
  '/batch',
  protect,
  [
    body('cardIds')
      .isArray({ min: 1, max: 10 })
      .withMessage('?¡ç?IDå¿…é??¯å???-10?‹å?ç´ ç??¸ç?'),
    body('timeframe')
      .isIn(['1d', '7d', '30d', '90d', '180d', '365d'])
      .withMessage('?‚é?æ¡†æ¶å¿…é???d??d??0d??0d??80d??65d'),
    body('modelType')
      .optional()
      .isIn([
        'linear',
        'polynomial',
        'exponential',
        'arima',
        'lstm',
        'ensemble',
      ])
      .withMessage(
        'æ¨¡å?é¡å?å¿…é??¯linear?polynomial?exponential?arima?lstm?–ensemble'
      ),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'è¼¸å…¥é©—è?å¤±æ?',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { cardIds, timeframe, modelType = 'ensemble' } = req.body;

      // ?¹é??æ¸¬
// eslint-disable-next-line no-unused-vars
      const predictions = [];
// eslint-disable-next-line no-unused-vars
      const predictionErrors = [];

      for (const cardId of cardIds) {
        try {
// eslint-disable-next-line no-unused-vars
          const prediction = await predictionService.predictCardPrice(
            cardId,
            timeframe,
            modelType
          );
          predictions.push(prediction);
        } catch (error) {
          predictionErrors.push({
            cardId,
            error: error.message,
          });
          logger.warn(`?¹é??æ¸¬å¤±æ? - ?¡ç? ${cardId}:`, error.message);
        }
      }

      logger.info(
        `?¹é??æ¸¬: ?¨æˆ¶ ${req.user.username} ?¹é??æ¸¬ ${cardIds.length} å¼µå¡?Œ`
      );

      res.json({
        success: true,
        message: '?¹é??æ¸¬å®Œæ?',
        data: {
          predictions,
          errors: predictionErrors,
          summary: {
            total: cardIds.length,
            successful: predictions.length,
            failed: predictionErrors.length,
          },
        },
      });
    } catch (error) {
      logger.error('?¹é??æ¸¬?¯èª¤:', error);
      res.status(500).json({
        success: false,
        message: error.message || '?¹é??æ¸¬å¤±æ?',
        code: 'BATCH_PREDICTION_FAILED',
      });
    }
  }
);

// @route   GET /api/predictions/models
// @desc    ?²å??¯ç”¨æ¨¡å??—è¡¨
// @access  Private
router.get('/models', protect, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const models = [
      {
        id: 'linear',
        name: 'ç·šæ€§å?æ­?,
        description: '?ºæ–¼ç·šæ€§è¶¨?¢ç?ç°¡å–®?æ¸¬æ¨¡å?',
        minDataPoints: 2,
        accuracy: 'ä¸­ç?',
        speed: 'å¿?,
        complexity: 'ä½?,
      },
      {
        id: 'polynomial',
        name: 'å¤šé?å¼å?æ­?,
        description: '?½å??•æ??ç??§è¶¨?¢ç??æ¸¬æ¨¡å?',
        minDataPoints: 3,
        accuracy: 'ä¸­é?',
        speed: 'ä¸­ç?',
        complexity: 'ä¸­ç?',
      },
      {
        id: 'exponential',
        name: '?‡æ•¸å¹³æ?',
        description: '?ºæ–¼?‚é?åºå??„å¹³æ»‘é?æ¸¬æ¨¡??,
        minDataPoints: 2,
        accuracy: 'ä¸­ç?',
        speed: 'å¿?,
        complexity: 'ä½?,
      },
      {
        id: 'arima',
        name: 'ARIMAæ¨¡å?',
        description: '?ªå?æ­¸ç??†ç§»?•å¹³?‡æ¨¡?‹ï??©å??‚é?åºå??æ¸¬',
        minDataPoints: 10,
        accuracy: 'é«?,
        speed: 'ä¸­ç?',
        complexity: 'é«?,
      },
      {
        id: 'lstm',
        name: 'LSTMç¥ç?ç¶²çµ¡',
        description: '?·çŸ­?Ÿè??¶ç¶²çµ¡ï??½å?å­¸ç?è¤‡é??„æ??“æ¨¡å¼?,
        minDataPoints: 20,
        accuracy: 'å¾ˆé?',
        speed: '??,
        complexity: 'å¾ˆé?',
      },
      {
        id: 'ensemble',
        name: '?†æ?æ¨¡å?',
        description: 'çµå?å¤šå€‹æ¨¡?‹ç??æ¸¬çµæ?ï¼Œæ?ä¾›æ?ç©©å??„é?æ¸?,
        minDataPoints: 5,
        accuracy: '?€é«?,
        speed: 'ä¸­ç?',
        complexity: 'ä¸­ç?',
      },
    ];

    logger.info(`?²å?æ¨¡å??—è¡¨: ?¨æˆ¶ ${req.user.username}`);

    res.json({
      success: true,
      message: 'æ¨¡å??—è¡¨?²å??å?',
      data: { models },
    });
  } catch (error) {
    logger.error('?²å?æ¨¡å??—è¡¨?¯èª¤:', error);
    res.status(500).json({
      success: false,
      message: '?²å?æ¨¡å??—è¡¨å¤±æ?',
      code: 'MODELS_FETCH_FAILED',
    });
  }
});

// @route   GET /api/predictions/statistics
// @desc    ?²å??æ¸¬çµ±è?ä¿¡æ¯
// @access  Private
router.get('/statistics', protect, async (req, res) => {
  try {
    const { getPredictionModel } = require('../models/PredictionModel');
    const PredictionModel = getPredictionModel();

    if (!PredictionModel) {
      throw new Error('?æ¸¬æ¨¡å??å??–å¤±??);
    }

    // ?²å?çµ±è?ä¿¡æ¯
    const totalPredictions = await PredictionModel.count({
      where: { isActive: true },
    });

// eslint-disable-next-line no-unused-vars
    const recentPredictions = await PredictionModel.count({
      where: {
        isActive: true,
        predictionDate: {
          [require('sequelize').Op.gte]: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ), // ?€è¿?å¤?        },
      },
    });

// eslint-disable-next-line no-unused-vars
    const modelStats = await PredictionModel.findAll({
      attributes: [
        'modelType',
        [
          require('sequelize').fn('COUNT', require('sequelize').col('id')),
          'count',
        ],
        [
          require('sequelize').fn(
            'AVG',
            require('sequelize').col('confidence')
          ),
          'avgConfidence',
        ],
        [
          require('sequelize').fn('AVG', require('sequelize').col('accuracy')),
          'avgAccuracy',
        ],
      ],
      where: { isActive: true },
      group: ['modelType'],
    });

    const accuracyStats = await PredictionModel.findAll({
      attributes: [
        [
          require('sequelize').fn('AVG', require('sequelize').col('accuracy')),
          'overallAccuracy',
        ],
        [
          require('sequelize').fn(
            'COUNT',
            require('sequelize').col('accuracy')
          ),
          'accuracyCount',
        ],
      ],
      where: {
        isActive: true,
        accuracy: {
          [require('sequelize').Op.not]: null,
        },
      },
    });

    logger.info(`?²å??æ¸¬çµ±è?: ?¨æˆ¶ ${req.user.username}`);

    res.json({
      success: true,
      message: 'çµ±è?ä¿¡æ¯?²å??å?',
      data: {
        totalPredictions,
        recentPredictions,
        modelStats,
        accuracyStats: accuracyStats[0] || {
          overallAccuracy: 0,
          accuracyCount: 0,
        },
      },
    });
  } catch (error) {
    logger.error('?²å??æ¸¬çµ±è??¯èª¤:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?²å?çµ±è?ä¿¡æ¯å¤±æ?',
      code: 'STATISTICS_FETCH_FAILED',
    });
  }
});

// @route   DELETE /api/predictions/:predictionId
// @desc    ?ªé™¤?æ¸¬è¨˜é?
// @access  Private
router.delete('/:predictionId', protect, async (req, res) => {
  try {
    const { predictionId } = req.params;
    const { getPredictionModel } = require('../models/PredictionModel');
    const PredictionModel = getPredictionModel();

    if (!PredictionModel) {
      throw new Error('?æ¸¬æ¨¡å??å??–å¤±??);
    }

// eslint-disable-next-line no-unused-vars
    const prediction = await PredictionModel.findByPk(predictionId);
    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: '?æ¸¬è¨˜é?ä¸å???,
        code: 'PREDICTION_NOT_FOUND',
      });
    }

    // è»Ÿåˆª??    await prediction.update({ isActive: false });

    logger.info(
      `?ªé™¤?æ¸¬è¨˜é?: ?¨æˆ¶ ${req.user.username} ?ªé™¤?æ¸¬ ${predictionId}`
    );

    res.json({
      success: true,
      message: '?æ¸¬è¨˜é??ªé™¤?å?',
    });
  } catch (error) {
    logger.error('?ªé™¤?æ¸¬è¨˜é??¯èª¤:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?ªé™¤?æ¸¬è¨˜é?å¤±æ?',
      code: 'PREDICTION_DELETE_FAILED',
    });
  }
});

module.exports = router;

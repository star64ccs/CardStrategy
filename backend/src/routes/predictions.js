const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken: protect } = require('../middleware/auth');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
// eslint-disable-next-line no-unused-vars
const predictionService = require('../services/predictionService');

const router = express.Router();

// @route   POST /api/predictions/predict
// @desc    ?�測?��??�格
// @access  Private
router.post(
  '/predict',
  protect,
  [
    body('cardId').isInt({ min: 1 }).withMessage('?��?ID必�??�正?�數'),
    body('timeframe')
      .isIn(['1d', '7d', '30d', '90d', '180d', '365d'])
      .withMessage('?��?框架必�???d??d??0d??0d??80d??65d'),
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
        '模�?類�?必�??�linear?�polynomial?�exponential?�arima?�lstm?�ensemble'
      ),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗�?失�?',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { cardId, timeframe, modelType = 'ensemble' } = req.body;

      // ?��??�測
// eslint-disable-next-line no-unused-vars
      const prediction = await predictionService.predictCardPrice(
        cardId,
        timeframe,
        modelType
      );

      logger.info(
        `?�格?�測: ?�戶 ${req.user.username} ?�測?��? ${cardId}, 模�? ${modelType}, ?��?框架 ${timeframe}`
      );

      res.json({
        success: true,
        message: '?�測完�?',
        data: { prediction },
      });
    } catch (error) {
      logger.error('?�格?�測?�誤:', error);
      res.status(500).json({
        success: false,
        message: error.message || '?�測失�?',
        code: 'PREDICTION_FAILED',
      });
    }
  }
);

// @route   GET /api/predictions/history/:cardId
// @desc    ?��??�測歷史
// @access  Private
router.get(
  '/history/:cardId',
  protect,
  [
    body('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('?�制?��?必�???-100之�?'),
  ],
  async (req, res) => {
    try {
      const { cardId } = req.params;
      const { limit = 50 } = req.query;

      // ?��??�測歷史
// eslint-disable-next-line no-unused-vars
      const predictions = await predictionService.getPredictionHistory(
        parseInt(cardId),
        parseInt(limit)
      );

      logger.info(
        `?��??�測歷史: ?�戶 ${req.user.username} ?��??��? ${cardId} ?��?測歷?�`
      );

      res.json({
        success: true,
        message: '?�測歷史?��??��?',
        data: {
          predictions,
          total: predictions.length,
          cardId: parseInt(cardId),
        },
      });
    } catch (error) {
      logger.error('?��??�測歷史?�誤:', error);
      res.status(500).json({
        success: false,
        message: error.message || '?��??�測歷史失�?',
        code: 'HISTORY_FETCH_FAILED',
      });
    }
  }
);

// @route   POST /api/predictions/accuracy/:predictionId
// @desc    計�??�測準確??// @access  Private
router.post('/accuracy/:predictionId', protect, async (req, res) => {
  try {
    const { predictionId } = req.params;

    // 計�??�測準確??    const accuracy = await predictionService.calculatePredictionAccuracy(
      parseInt(predictionId)
    );

    if (!accuracy) {
      return res.json({
        success: true,
        message: '?��??��??��??�實?�數?��??��?計�?準確??,
        data: { accuracy: null },
      });
    }

    logger.info(
      `計�??�測準確?? ?�戶 ${req.user.username} 計�??�測 ${predictionId} ?��?確性`
    );

    res.json({
      success: true,
      message: '準確?��?算�???,
      data: { accuracy },
    });
  } catch (error) {
    logger.error('計�??�測準確?�錯�?', error);
    res.status(500).json({
      success: false,
      message: error.message || '計�?準確?�失??,
      code: 'ACCURACY_CALCULATION_FAILED',
    });
  }
});

// @route   POST /api/predictions/batch
// @desc    ?��??�測
// @access  Private
router.post(
  '/batch',
  protect,
  [
    body('cardIds')
      .isArray({ min: 1, max: 10 })
      .withMessage('?��?ID必�??��???-10?��?素�??��?'),
    body('timeframe')
      .isIn(['1d', '7d', '30d', '90d', '180d', '365d'])
      .withMessage('?��?框架必�???d??d??0d??0d??80d??65d'),
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
        '模�?類�?必�??�linear?�polynomial?�exponential?�arima?�lstm?�ensemble'
      ),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗�?失�?',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { cardIds, timeframe, modelType = 'ensemble' } = req.body;

      // ?��??�測
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
          logger.warn(`?��??�測失�? - ?��? ${cardId}:`, error.message);
        }
      }

      logger.info(
        `?��??�測: ?�戶 ${req.user.username} ?��??�測 ${cardIds.length} 張卡?�`
      );

      res.json({
        success: true,
        message: '?��??�測完�?',
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
      logger.error('?��??�測?�誤:', error);
      res.status(500).json({
        success: false,
        message: error.message || '?��??�測失�?',
        code: 'BATCH_PREDICTION_FAILED',
      });
    }
  }
);

// @route   GET /api/predictions/models
// @desc    ?��??�用模�??�表
// @access  Private
router.get('/models', protect, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const models = [
      {
        id: 'linear',
        name: '線性�?�?,
        description: '?�於線性趨?��?簡單?�測模�?',
        minDataPoints: 2,
        accuracy: '中�?',
        speed: '�?,
        complexity: '�?,
      },
      {
        id: 'polynomial',
        name: '多�?式�?�?,
        description: '?��??��??��??�趨?��??�測模�?',
        minDataPoints: 3,
        accuracy: '中�?',
        speed: '中�?',
        complexity: '中�?',
      },
      {
        id: 'exponential',
        name: '?�數平�?',
        description: '?�於?��?序�??�平滑�?測模??,
        minDataPoints: 2,
        accuracy: '中�?',
        speed: '�?,
        complexity: '�?,
      },
      {
        id: 'arima',
        name: 'ARIMA模�?',
        description: '?��?歸�??�移?�平?�模?��??��??��?序�??�測',
        minDataPoints: 10,
        accuracy: '�?,
        speed: '中�?',
        complexity: '�?,
      },
      {
        id: 'lstm',
        name: 'LSTM神�?網絡',
        description: '?�短?��??�網絡�??��?學�?複�??��??�模�?,
        minDataPoints: 20,
        accuracy: '很�?',
        speed: '??,
        complexity: '很�?',
      },
      {
        id: 'ensemble',
        name: '?��?模�?',
        description: '結�?多個模?��??�測結�?，�?供�?穩�??��?�?,
        minDataPoints: 5,
        accuracy: '?��?,
        speed: '中�?',
        complexity: '中�?',
      },
    ];

    logger.info(`?��?模�??�表: ?�戶 ${req.user.username}`);

    res.json({
      success: true,
      message: '模�??�表?��??��?',
      data: { models },
    });
  } catch (error) {
    logger.error('?��?模�??�表?�誤:', error);
    res.status(500).json({
      success: false,
      message: '?��?模�??�表失�?',
      code: 'MODELS_FETCH_FAILED',
    });
  }
});

// @route   GET /api/predictions/statistics
// @desc    ?��??�測統�?信息
// @access  Private
router.get('/statistics', protect, async (req, res) => {
  try {
    const { getPredictionModel } = require('../models/PredictionModel');
    const PredictionModel = getPredictionModel();

    if (!PredictionModel) {
      throw new Error('?�測模�??��??�失??);
    }

    // ?��?統�?信息
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
          ), // ?��?�?        },
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

    logger.info(`?��??�測統�?: ?�戶 ${req.user.username}`);

    res.json({
      success: true,
      message: '統�?信息?��??��?',
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
    logger.error('?��??�測統�??�誤:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��?統�?信息失�?',
      code: 'STATISTICS_FETCH_FAILED',
    });
  }
});

// @route   DELETE /api/predictions/:predictionId
// @desc    ?�除?�測記�?
// @access  Private
router.delete('/:predictionId', protect, async (req, res) => {
  try {
    const { predictionId } = req.params;
    const { getPredictionModel } = require('../models/PredictionModel');
    const PredictionModel = getPredictionModel();

    if (!PredictionModel) {
      throw new Error('?�測模�??��??�失??);
    }

// eslint-disable-next-line no-unused-vars
    const prediction = await PredictionModel.findByPk(predictionId);
    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: '?�測記�?不�???,
        code: 'PREDICTION_NOT_FOUND',
      });
    }

    // 軟刪??    await prediction.update({ isActive: false });

    logger.info(
      `?�除?�測記�?: ?�戶 ${req.user.username} ?�除?�測 ${predictionId}`
    );

    res.json({
      success: true,
      message: '?�測記�??�除?��?',
    });
  } catch (error) {
    logger.error('?�除?�測記�??�誤:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?�除?�測記�?失�?',
      code: 'PREDICTION_DELETE_FAILED',
    });
  }
});

module.exports = router;

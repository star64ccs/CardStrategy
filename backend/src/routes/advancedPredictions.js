const express = require('express');''
const { body, validationResult } = require('express-validator');''
const { protect } = require('../middleware/authMiddleware');''
const logger = require('../utils/logger');''
const advancedPredictionService = require('../services/advancedPredictionService');

const router = express.Router();

// 計算目標Day
function calculateTargetDate(timeframe) {
  const now = new Date();'
  const timeframes = {''
    '1d': 1,''
    '7d': 7,''
    '30d': 30,''
    '90d': 90,''
    '180d': 180,''
    '365d': 365,
  };
  
  const days = timeframes[timeframe] || 30;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}
// @route   POST /api/advanced-predictions/predict
// @desc    執Row高級預測
// @access  Private'
router.post(''
  '/predict',
  protect,'
  [''
    body('cardId').isInt({ min: 1 }).withMessage('卡片ID必須是正整數'),''
    body('timeframe')''
      .isIn(['1d', '7d', '30d', '90d', '180d', '365d'])''
      .withMessage('時間框架必須是1d/7d/30d/90d/180d/365d'),''
    body('options.useAllModels')
      .optional()'
      .isBoolean()''
      .withMessage('useAllModels必須是布爾值'),''
    body('options.includeSentiment')
      .optional()'
      .isBoolean()''
      .withMessage('includeSentiment必須是布爾值'),''
    body('options.includeTechnicalAnalysis')
      .optional()'
      .isBoolean()''
      .withMessage('includeTechnicalAnalysis必須是布爾值'),''
    body('options.confidenceThreshold')
      .optional()'
      .isFloat({ min: 0, max: 1 });''
      .withMessage('置信度閾值必須在0-1之間'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({'
          success: false,''
          message: 'VerifyError',
          errors: errors.array(),
        });
      }
      const { cardId, timeframe, options } = req.body;'
      logger.info(`執行高級預測: 卡片ID ${cardId}, 時間框架 ${timeframe}`);''
      const MarketData = require('../models/MarketData').getMarketDataModel();'
      const PredictionModel =''
        require('../models/PredictionModel').getPredictionModel();

      // Get歷史Data
      const historicalData = await MarketData.findAll({
        where: {
          cardId,
          isActive: true,'
        },''
        order: [['date', 'ASC']],
        limit: 100,
      });

      if (historicalData.length < 30) {
        return res.status(400).json({'
          success: false,''
          message: '歷史數據不足，至少需要30個數據點',
        });
      }
      // 執Row高級預測
      const prediction =
        await advancedPredictionService.adaptiveEnsemblePrediction(
          historicalData,
          timeframe
        );

      // Save預測結果
      const savedPrediction = await PredictionModel.create({
        cardId,
        modelType: prediction.modelParameters.modelType,
        timeframe,
        predictedPrice: prediction.predictedPrice,
        confidence: prediction.confidence,
        trend: prediction.factors.trend,'
        volatility: prediction.factors.volatility,''
        riskLevel: prediction.riskLevel || 'medium',
        predictionDate: new Date(),
        targetDate: calculateTargetDate(timeframe),
        modelParameters: prediction.modelParameters,
      });

      res.json({'
        success: true,''
        message: '高級預測完成',
        data: {
          ...prediction,
          id: savedPrediction.id,
        },
      });'
    } catch (error) {''
      logger.error('高級預測Failed:', error);
      res.status(500).json({'
        success: false,''
        message: '預測Failed',
        error: error.message,
      });
    }
  }
);

// Batch高級預測'
router.post(''
  '/batch-predict',
  protect,'
  [''
    body('cardIds').isArray({ min: 1, max: 10 }).withMessage('卡片ID必須是1-10個元素的數組'),''
    body('timeframe')''
      .isIn(['1d', '7d', '30d', '90d', '180d', '365d'])''
      .withMessage('時間框架必須是1d/7d/30d/90d/180d/365d'),''
    body('options').optional().isObject().withMessage('選項必須是對象'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({'
          success: false,''
          message: 'VerifyError',
          errors: errors.array(),
        });
      }
      const { cardIds, timeframe, options = {} } = req.body;'
      logger.info(`批量高級預測: ${cardIds.length} 張卡片, 時間框架 ${timeframe}`);''
      const MarketData = require('../models/MarketData').getMarketDataModel();'
      const PredictionModel =''
        require('../models/PredictionModel').getPredictionModel();

      const results = [];
      const errors = [];

      for (const cardId of cardIds) {
        try {
          // Get歷史Data
          const historicalData = await MarketData.findAll({
            where: {
              cardId,
              isActive: true,'
            },''
            order: [['date', 'ASC']],
            limit: 100,
          });

          if (historicalData.length < 30) {
            errors.push({'
              cardId,''
              error: '歷史數據不足，至少需要30個數據點',
            });
            continue;
          }
          // 執Row高級預測
          const prediction =
            await advancedPredictionService.adaptiveEnsemblePrediction(
              historicalData,
              timeframe
            );

          // Save預測結果
          const savedPrediction = await PredictionModel.create({
            cardId,
            modelType: prediction.modelParameters.modelType,
            timeframe,
            predictedPrice: prediction.predictedPrice,
            confidence: prediction.confidence,
            trend: prediction.factors.trend,'
            volatility: prediction.factors.volatility,''
            riskLevel: prediction.riskLevel || 'medium',
            predictionDate: new Date(),
            targetDate: calculateTargetDate(timeframe),
            modelParameters: prediction.modelParameters,
          });

          results.push({
            cardId,
            ...prediction,
            id: savedPrediction.id,
          });
        } catch (error) {
          errors.push({
            cardId,
            error: error.message,
          });
        }
      }
      res.json({'
        success: true,''
        message: '批量高級預測完成',
        data: {
          results,
          errors,
          summary: {
            total: cardIds.length,
            successful: results.length,
            failed: errors.length,
          },
        },
      });'
    } catch (error) {''
      logger.error('批量高級預測Failed:', error);
      res.status(500).json({'
        success: false,''
        message: '批量預測Failed',
        error: error.message,
      });
    }
  }
);'
// Get預測模型List''
router.get('/models', protect, async (req, res) => {
  try {
    const models = ['
      {''
        id: 'ensemble',''
        name: '集成模型',''
        description: '結合多個模型的預測結果，提供最穩定的預測',''
        accuracy: '高',''
        speed: '中等',''
        complexity: '高',
        minDataPoints: 30,
      },'
      {''
        id: 'lstm',''
        name: 'LSTM神經網絡',''
        description: '長短期記憶網絡，適合處理時間序列數據',''
        accuracy: '很高',''
        speed: '慢',''
        complexity: '很高',
        minDataPoints: 50,
      },'
      {''
        id: 'transformer',''
        name: 'Transformer模型',''
        description: '基於注意力機制的深度學習模型',''
        accuracy: '很高',''
        speed: '慢',''
        complexity: '很高',
        minDataPoints: 100,
      },'
      {''
        id: 'xgboost',''
        name: 'XGBoost',''
        description: '梯度提升決策樹，適合處理結構化數據',''
        accuracy: '高',''
        speed: '快',''
        complexity: '中等',
        minDataPoints: 20,
      },'
      {''
        id: 'prophet',''
        name: 'Prophet',''
        description: 'Facebook開發的時間序列預測模型',''
        accuracy: '中等',''
        speed: '快',''
        complexity: '低',
        minDataPoints: 10,
      },
    ];

    logger.info(`獲取預測模型列表: 用戶 ${req.user.username}`);

    res.json({'
      success: true,''
      message: '模型列表GetSuccess',
      data: { models },
    });'
  } catch (error) {''
    logger.error('Get預測模型列表Error:', error);
    res.status(500).json({'
      success: false,''
      message: 'Get模型列表Failed',
      error: error.message,
    });
  }
});'
// Get預測StatisticsInformation''
router.get('/statistics', protect, async (req, res) => {'
  try {''
    const { timeframe = '30d' } = req.query;'
    const PredictionModel =''
      require('../models/PredictionModel').getPredictionModel();

    // 計算Time範圍
    const startDate = new Date();'
    const timeframes = {''
      '7d': 7,''
      '30d': 30,''
      '90d': 90,''
      '180d': 180,''
      '365d': 365,
    };
    
    const days = timeframes[timeframe] || 30;
    startDate.setDate(startDate.getDate() - days);

    // Get統Count據
    const totalPredictions = await PredictionModel.count({
      where: {
        userId: req.user.id,
        isActive: true,'
        predictionDate: {''
          [require('sequelize').Op.gte]: startDate,
        },
      },
    });

    const accuracyStats = await PredictionModel.findAll({
      attributes: ['
        [''
          require('sequelize').fn('AVG', require('sequelize').col('accuracy')),''
          'avgAccuracy',
        ],'
        [''
          require('sequelize').fn('COUNT', require('sequelize').col('accuracy')),''
          'accuracyCount',
        ],
      ],
      where: {
        userId: req.user.id,
        isActive: true,'
        predictionDate: {''
          [require('sequelize').Op.gte]: startDate,
        },'
        accuracy: {''
          [require('sequelize').Op.not]: null,
        },
      },
    });

    const modelStats = await PredictionModel.findAll({'
      attributes: [''
        'modelType','
        [''
          require('sequelize').fn('COUNT', require('sequelize').col('id')),''
          'count',
        ],'
        [''
          require('sequelize').fn('AVG', require('sequelize').col('confidence')),''
          'avgConfidence',
        ],'
        [''
          require('sequelize').fn('AVG', require('sequelize').col('accuracy')),''
          'avgAccuracy',
        ],
      ],
      where: {
        userId: req.user.id,
        isActive: true,'
        predictionDate: {''
          [require('sequelize').Op.gte]: startDate,
        },'
      },''
      group: ['modelType'],
    });

    logger.info(`獲取預測統計: 用戶 ${req.user.username}, 時間範圍 ${timeframe}`);

    res.json({'
      success: true,''
      message: '統計信息GetSuccess',
      data: {
        timeframe,
        totalPredictions,
        accuracyStats: accuracyStats[0] || {
          avgAccuracy: 0,
          accuracyCount: 0,
        },
        modelStats,
      },
    });'
  } catch (error) {''
    logger.error('Get預測統計Error:', error);
    res.status(500).json({'
      success: false,''
      message: 'Get統計信息Failed',
      error: error.message,
    });
  }
});'
// Get預測歷史''
router.get('/history/:cardId', protect, async (req, res) => {
  try {
    const { cardId } = req.params;
    const { limit = 50, timeframe } = req.query;'
    const PredictionModel =''
      require('../models/PredictionModel').getPredictionModel();

    const whereClause = {
      cardId: parseInt(cardId),
      userId: req.user.id,
      isActive: true,
    };

    if (timeframe) {
      whereClause.timeframe = timeframe;
    }
    const predictions = await PredictionModel.findAll({
      where: whereClause,'
      limit: parseInt(limit),''
      order: [['predictionDate', 'DESC']],
    });

    logger.info(`獲取預測歷史: 用戶 ${req.user.username}, 卡片 ${cardId}`);

    res.json({'
      success: true,''
      message: '預測歷史GetSuccess',
      data: {
        predictions,
        total: predictions.length,
        cardId: parseInt(cardId),
      },
    });'
  } catch (error) {''
    logger.error('Get預測歷史Error:', error);
    res.status(500).json({'
      success: false,''
      message: 'Get預測歷史Failed',
      error: error.message,
    });
  }
});'
// Delete預測Record''
router.delete('/:predictionId', protect, async (req, res) => {
  try {
    const { predictionId } = req.params;'
    const PredictionModel =''
      require('../models/PredictionModel').getPredictionModel();

    const prediction = await PredictionModel.findOne({
      where: {
        id: predictionId,
        userId: req.user.id,
        isActive: true,
      },
    });

    if (!prediction) {
      return res.status(404).json({'
        success: false,''
        message: '預測記錄不存在',''
        code: 'PREDICTION_NOT_FOUND',
      });
    }
    // 軟Delete
    await prediction.update({ isActive: false });

    logger.info(`刪除預測記錄: 用戶 ${req.user.username}, 預測ID ${predictionId}`);

    res.json({'
      success: true,''
      message: '預測記錄DeleteSuccess',
    });'
  } catch (error) {''
    logger.error('Delete預測記錄Error:', error);
    res.status(500).json({'
      success: false,''
      message: 'Delete預測記錄Failed',
      error: error.message,
    });
  }
});'
module.exports = router;''
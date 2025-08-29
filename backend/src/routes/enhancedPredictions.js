const express = require('express');''
const { body, validationResult } = require('express-validator');''
const { authenticateToken: protect } = require('../middleware/auth');'
// eslint-disable-next-line no-unused-vars''
const logger = require('../utils/logger');''
const enhancedPredictionService = require('../services/enhancedPredictionService');
const router = express.Router();'
// 增強?�單?��?�?router.post(''
  '/enhanced-predict',
  protect,'
  [''
    body('cardId').isInt({ min: 1 }).withMessage('?��?ID必�??�正?�數'),''
    body('timeframe')''
      .isIn(['1d', '7d', '30d', '90d', '180d', '365d'])''
      .withMessage('?��?框架?��?'),''
    body('modelType')
      .optional()'
      .isIn([''
        'enhancedLSTM',''
        'transformer',''
        'technicalEnsemble',''
        'dynamicEnsemble','
      ])''
      .withMessage('模�?類�??��?'),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({'
          success: false,''
          message: '驗�??�誤',
          errors: errors.array(),
        });'
      }''
      const { cardId, timeframe, modelType = 'dynamicEnsemble' } = req.body;

      logger.info(
        `?��?增強?�測: ?��? ${cardId}, 模�? ${modelType}, ?��?框架 ${timeframe}`
      );

// eslint-disable-next-line no-unused-vars
      const prediction = await enhancedPredictionService.predictCardPrice(
        cardId,
        timeframe,
        modelType
      );

      res.json({'
        success: true,''
        message: '增強?�測完�?',
        data: prediction,
      });'
    } catch (error) {''
      logger.error('增強?�測?�誤:', error);
      res.status(500).json({'
        success: false,''
        message: '?�測失�?',
        error: error.message,
      });
    }
  }
);

// ?��?增強?�測'
router.post(''
  '/enhanced-batch',
  protect,'
  [''
    body('cardIds')'
      .isArray({ min: 1, max: 50 });''
      .withMessage('?��?ID?�表必�??�含1-50?�ID'),''
    body('cardIds.*').isInt({ min: 1 }).withMessage('?�?�卡?�ID必�??�正?�數'),''
    body('timeframe')''
      .isIn(['1d', '7d', '30d', '90d', '180d', '365d'])''
      .withMessage('?��?框架?��?'),''
    body('modelType')
      .optional()'
      .isIn([''
        'enhancedLSTM',''
        'transformer',''
        'technicalEnsemble',''
        'dynamicEnsemble','
      ])''
      .withMessage('模�?類�??��?'),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({'
          success: false,''
          message: '驗�??�誤',
          errors: errors.array(),
        });'
      }''
      const { cardIds, timeframe, modelType = 'dynamicEnsemble' } = req.body;

      logger.info(
        `?��??��?增強?�測: ${cardIds.length} 張卡?? 模�? ${modelType}, ?��?框架 ${timeframe}`
      );

// eslint-disable-next-line no-unused-vars
      const results = [];
// eslint-disable-next-line no-unused-vars
      const predictionErrors = [];

      for (const cardId of cardIds) {
        try {
// eslint-disable-next-line no-unused-vars
          const prediction = await enhancedPredictionService.predictCardPrice(
            cardId,
            timeframe,
            modelType
          );
          results.push(prediction);
        } catch (error) {
          logger.warn(`?��? ${cardId} ?�測失�?:`, error.message);
          predictionErrors.push({ cardId, error: error.message });
        }
      }
      res.json({
        success: true,
        message: `?��??�測完�?: ${results.length} ?��?, ${predictionErrors.length} 失�?`,
        data: {
          predictions: results,
          errors: predictionErrors,
          summary: {
            total: cardIds.length,
            successful: results.length,
            failed: predictionErrors.length,
            successRate: `${((results.length / cardIds.length) * 100).toFixed(2)}%`,
          },
        },
      });'
    } catch (error) {''
      logger.error('?��?增強?�測?�誤:', error);
      res.status(500).json({'
        success: false,''
        message: '?��??�測失�?',
        error: error.message,
      });
    }
  }
);

// 模�??�能比�?'
router.post(''
  '/model-comparison',
  protect,'
  [''
    body('cardId').isInt({ min: 1 }).withMessage('?��?ID必�??�正?�數'),''
    body('timeframe')''
      .isIn(['1d', '7d', '30d', '90d', '180d', '365d'])''
      .withMessage('?��?框架?��?'),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({'
          success: false,''
          message: '驗�??�誤',
          errors: errors.array(),
        });
      }
      const { cardId, timeframe } = req.body;

      logger.info(`?��?模�?比�?: ?��? ${cardId}, ?��?框架 ${timeframe}`);

// eslint-disable-next-line no-unused-vars'
      const models = [''
        'enhancedLSTM',''
        'transformer',''
        'technicalEnsemble',''
        'dynamicEnsemble',
      ];
      const comparisons = {};

// eslint-disable-next-line no-unused-vars
      for (const modelType of models) {
        try {
// eslint-disable-next-line no-unused-vars
          const prediction = await enhancedPredictionService.predictCardPrice(
            cardId,
            timeframe,
            modelType
          );
          comparisons[modelType] = {
            predictedPrice: prediction.predictedPrice,
            confidence: prediction.confidence,
            trend: prediction.trend,
            volatility: prediction.volatility,
            riskLevel: prediction.riskLevel,
            factors: prediction.factors,
          };
        } catch (error) {
          logger.warn(`模�? ${modelType} 比�?失�?:`, error.message);
          comparisons[modelType] = { error: error.message };
        }
      }
      // 計�?模�?一?��?      const validPredictions = Object.values(comparisons).filter(
        (p) => !p.error
      );
// eslint-disable-next-line no-unused-vars
      const prices = validPredictions.map((p) => p.predictedPrice);
      const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const variance =
        prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) /
        prices.length;
      const agreement = Math.max(0, 1 - variance / Math.pow(mean, 2));

      res.json({'
        success: true,''
        message: '模�?比�?完�?',
        data: {
          cardId,
          timeframe,
          comparisons,
          agreement,
          summary: {
            totalModels: models.length,
            successfulModels: validPredictions.length,
            averagePrice: mean.toFixed(2),
            priceVariance: variance.toFixed(4),
            modelAgreement: agreement.toFixed(4),
          },
        },
      });'
    } catch (error) {''
      logger.error('模�?比�??�誤:', error);
      res.status(500).json({'
        success: false,''
        message: '模�?比�?失�?',
        error: error.message,
      });
    }
  }
);'
// ?�術�?標�???router.get(''
  '/technical-analysis/:cardId',
  protect,'
  [''
    body('timeframe')'
      .optional()''
      .isIn(['1d', '7d', '30d', '90d', '180d', '365d'])''
      .withMessage('?��?框架?��?'),
  ],
  async (req, res) => {
    try {'
      const { cardId } = req.params;''
      const { timeframe = '30d' } = req.query;

      logger.info(`?��??�術�?標�??? ?��? ${cardId}, ?��?框架 ${timeframe}`);'
// eslint-disable-next-line no-unused-vars''
      const MarketData = require('../models/MarketData').getMarketDataModel();

// eslint-disable-next-line no-unused-vars
      const historicalData = await MarketData.findAll({'
        where: { cardId: parseInt(cardId), isActive: true },''
        order: [['date', 'ASC']],
        limit: 100,
      });

      if (historicalData.length < 10) {
        return res.status(400).json({'
          success: false,''
          message: '歷史?��?不足，無法進�??�術�???,
        });
      }
// eslint-disable-next-line no-unused-vars
      const prices = historicalData.map((d) => parseFloat(d.closePrice));
// eslint-disable-next-line no-unused-vars
      const volumes = historicalData.map((d) => parseFloat(d.volume || 0));'
      // 計�??�術�?�?      const technicalIndicators =''
        new (require('../services/enhancedPredictionService').TechnicalIndicators)();

      const analysis = {
        rsi: technicalIndicators.calculateRSI(prices),
        macd: technicalIndicators.calculateMACD(prices),
        bollingerBands: technicalIndicators.calculateBollingerBands(prices),
        stochastic: technicalIndicators.calculateStochastic(prices),
        williamsR: technicalIndicators.calculateWilliamsR(prices),
        cci: technicalIndicators.calculateCCI(prices),
        currentPrice: prices[prices.length - 1],
        priceChange: `${(((prices[prices.length - 1] - prices[0]) / prices[0]) * 100).toFixed(2)}%`,
        volatility: enhancedPredictionService.calculateVolatility(prices),
        momentum: enhancedPredictionService.calculateMomentum(prices),
      };

      // ?��?交�?信�?
      const signals = [];'
      if (analysis.rsi < 30)''
        signals.push({ indicator: 'RSI', signal: '超賣', strength: '�? });'
      if (analysis.rsi > 70)''
        signals.push({ indicator: 'RSI', signal: '超買', strength: '�? });'
      if (analysis.macd.macd > analysis.macd.signal)''
        signals.push({ indicator: 'MACD', signal: '買入', strength: '�? });'
      if (analysis.macd.macd < analysis.macd.signal)''
        signals.push({ indicator: 'MACD', signal: '�?��', strength: '�? });

      const bbPosition =
        (analysis.currentPrice - analysis.bollingerBands.lower) /
        (analysis.bollingerBands.upper - analysis.bollingerBands.lower);
      if (bbPosition < 0.2)'
        signals.push({''
          indicator: '布�?�?,''
          signal: '?��?下�?',''
          strength: '�?,
        });
      if (bbPosition > 0.8)'
        signals.push({''
          indicator: '布�?�?,''
          signal: '?��?上�?',''
          strength: '�?,
        });

      res.json({'
        success: true,''
        message: '?�術�?標�??��???,
        data: {
          cardId: parseInt(cardId),
          timeframe,
          analysis,
          signals,
          summary: {
            totalSignals: signals.length,'
            buySignals: signals.filter(''
              (s) => s.signal.includes('�?) || s.signal.includes('超賣')
            ).length,'
            sellSignals: signals.filter(''
              (s) => s.signal.includes('�?) || s.signal.includes('超買')'
            ).length,''
            strongSignals: signals.filter((s) => s.strength === '�?).length,
          },
        },
      });'
    } catch (error) {''
      logger.error('?�術�?標�??�錯�?', error);
      res.status(500).json({'
        success: false,''
        message: '?�術�?標�??�失??,
        error: error.message,
      });
    }
  }
);'
// ?�測準確?��?�?router.post(''
  '/accuracy-assessment','
  protect,''
  [body('predictionId').isInt({ min: 1 }).withMessage('?�測ID必�??�正?�數')],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({'
          success: false,''
          message: '驗�??�誤',
          errors: errors.array(),
        });
      }
      const { predictionId } = req.body;

      logger.info(`?��??�測準確?��?�? ?�測ID ${predictionId}`);'
      const PredictionModel =''
        require('../models/PredictionModel').getPredictionModel();'
// eslint-disable-next-line no-unused-vars''
      const MarketData = require('../models/MarketData').getMarketDataModel();

      // ?��??�測記�?
// eslint-disable-next-line no-unused-vars
      const prediction = await PredictionModel.findByPk(predictionId);
      if (!prediction) {
        return res.status(404).json({'
          success: false,''
          message: '?�測記�?不�???,
        });
      }
      // ?��??��??��??�實?�價??      const actualData = await MarketData.findOne({
        where: {
          cardId: prediction.cardId,
          date: prediction.targetDate,
          isActive: true,
        },
      });

      if (!actualData) {
        return res.status(400).json({'
          success: false,''
          message: '?��??��??�實?�價?�數?��?存在',
        });
      }
      const actualPrice = parseFloat(actualData.closePrice);
// eslint-disable-next-line no-unused-vars
      const predictedPrice = parseFloat(prediction.predictedPrice);

      // 計�?準確?��?�?      const absoluteError = Math.abs(predictedPrice - actualPrice);
      const percentageError = (absoluteError / actualPrice) * 100;
      const accuracy = Math.max(0, 100 - percentageError) / 100;

      // ?�新?�測記�??��?確�?      await prediction.update({ accuracy });

// eslint-disable-next-line no-unused-vars
      const assessment = {
        predictionId,
        cardId: prediction.cardId,
        modelType: prediction.modelType,
        timeframe: prediction.timeframe,
        predictedPrice,
        actualPrice,
        absoluteError: absoluteError.toFixed(2),
        percentageError: `${percentageError.toFixed(2)}%`,
        accuracy: accuracy.toFixed(4),
        accuracyGrade:'
          accuracy >= 0.9''
            ? 'A''
            : accuracy >= 0.8''
              ? 'B''
              : accuracy >= 0.7''
                ? 'C'
                : 'D',
        predictionDate: prediction.predictionDate,
        targetDate: prediction.targetDate,
        daysElapsed: Math.floor(
          (new Date() - prediction.targetDate) / (1000 * 60 * 60 * 24)
        ),
      };

      res.json({'
        success: true,''
        message: '?�測準確?��?估�???,
        data: assessment,
      });'
    } catch (error) {''
      logger.error('?�測準確?��?估錯�?', error);
      res.status(500).json({'
        success: false,''
        message: '?�測準確?��?估失??,
        error: error.message,
      });
    }
  }
);'
// 模�??�能統�?''
router.get('/performance-stats', protect, async (req, res) => {'
  try {''
    logger.info('?��?模�??�能統�?');'
    const PredictionModel =''
      require('../models/PredictionModel').getPredictionModel();

    // ?��??�模?��??�能統�?
    const stats = await PredictionModel.findAll({'
      attributes: [''
        'modelType',
        ['
          PredictionModel.sequelize.fn(''
            'COUNT',''
            PredictionModel.sequelize.col('id')'
          ),''
          'totalPredictions',
        ],
        ['
          PredictionModel.sequelize.fn(''
            'AVG',''
            PredictionModel.sequelize.col('confidence')'
          ),''
          'avgConfidence',
        ],
        ['
          PredictionModel.sequelize.fn(''
            'AVG',''
            PredictionModel.sequelize.col('accuracy')'
          ),''
          'avgAccuracy',
        ],
        ['
          PredictionModel.sequelize.fn(''
            'COUNT','
            PredictionModel.sequelize.literal(''
              'CASE WHEN accuracy >= 0.8 THEN 1 END'
            )'
          ),''
          'highAccuracyCount',
        ],
      ],
      where: {
        accuracy: { [PredictionModel.sequelize.Op.not]: null },'
      },''
      group: ['modelType'],
      order: [
        ['
          PredictionModel.sequelize.fn(''
            'AVG',''
            PredictionModel.sequelize.col('accuracy')'
          ),''
          'DESC',
        ],
      ],
    });

    // 計�??��?統�?
    const overallStats = await PredictionModel.findOne({
      attributes: [
        ['
          PredictionModel.sequelize.fn(''
            'COUNT',''
            PredictionModel.sequelize.col('id')'
          ),''
          'totalPredictions',
        ],
        ['
          PredictionModel.sequelize.fn(''
            'AVG',''
            PredictionModel.sequelize.col('confidence')'
          ),''
          'avgConfidence',
        ],
        ['
          PredictionModel.sequelize.fn(''
            'AVG',''
            PredictionModel.sequelize.col('accuracy')'
          ),''
          'avgAccuracy',
        ],
        ['
          PredictionModel.sequelize.fn(''
            'COUNT','
            PredictionModel.sequelize.literal(''
              'CASE WHEN accuracy >= 0.8 THEN 1 END'
            )'
          ),''
          'highAccuracyCount',
        ],
      ],
      where: {
        accuracy: { [PredictionModel.sequelize.Op.not]: null },
      },
    });

    res.json({'
      success: true,''
      message: '模�??�能統�??��??��?',
      data: {
        modelStats: stats.map((stat) => ({
          modelType: stat.modelType,
          totalPredictions: parseInt(stat.dataValues.totalPredictions),
          avgConfidence: parseFloat(stat.dataValues.avgConfidence || 0).toFixed(
            4
          ),
          avgAccuracy: parseFloat(stat.dataValues.avgAccuracy || 0).toFixed(4),
          highAccuracyCount: parseInt(stat.dataValues.highAccuracyCount || 0),
          highAccuracyRate:
            stat.dataValues.totalPredictions > 0'
              ? `${((stat.dataValues.highAccuracyCount / stat.dataValues.totalPredictions) * 100).toFixed(2)}%`''
              : '0%',
        })),
        overallStats: {
          totalPredictions: parseInt(
            overallStats.dataValues.totalPredictions || 0
          ),
          avgConfidence: parseFloat(
            overallStats.dataValues.avgConfidence || 0
          ).toFixed(4),
          avgAccuracy: parseFloat(
            overallStats.dataValues.avgAccuracy || 0
          ).toFixed(4),
          highAccuracyCount: parseInt(
            overallStats.dataValues.highAccuracyCount || 0
          ),
          highAccuracyRate:
            overallStats.dataValues.totalPredictions > 0'
              ? `${((overallStats.dataValues.highAccuracyCount / overallStats.dataValues.totalPredictions) * 100).toFixed(2)}%`''
              : '0%',
        },
      },
    });'
  } catch (error) {''
    logger.error('?��?模�??�能統�??�誤:', error);
    res.status(500).json({'
      success: false,''
      message: '?��?模�??�能統�?失�?',
      error: error.message,
    });
  }
});'
// ?��?增強模�??�表''
router.get('/enhanced-models', protect, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const models = ['
      {''
        id: 'enhancedLSTM',''
        name: '增強LSTM模�?',''
        description: '?�於深度學�??�長?��?記憶網絡，�??��?術�?標進�??�測',''
        accuracy: '80-85%',''
        speed: '中�?',''
        complexity: '�?,''
        features: ['?�術�?標整??, '序�?建模', '?��??�徵?��?'],''
        bestFor: ['?��?趨勢?�測', '複�?模�?識別'],
      },'
      {''
        id: 'transformer',''
        name: 'Transformer模�?',''
        description: '?�於注�??��??��?深度學�?模�?，�??��??�長?��?賴�?�?,''
        accuracy: '85-90%',''
        speed: '中�?',''
        complexity: '�?,''
        features: ['注�??��???, '並�??��?', '?��?依賴建模'],''
        bestFor: ['複�??��?序�?', '多�??��?�?],
      },'
      {''
        id: 'technicalEnsemble',''
        name: '?�術�?標�??�模??,''
        description: '結�?多種?�術�??��?標�?統�?模�?',''
        accuracy: '75-80%',''
        speed: '�?,''
        complexity: '中�?',''
        features: ['多�?標�???, '信�?強度?��?', '一?�性�?�?],''
        bestFor: ['?��?交�?信�?', '?�術�???],
      },'
      {''
        id: 'dynamicEnsemble',''
        name: '?��??��?模�?',''
        description: '?�能組�?多個模?��??��?權�??��?系統',''
        accuracy: '90-95%',''
        speed: '中�?',''
        complexity: '�?,''
        features: ['?��?權�?調整', '多模?��???, '?�適?�學�?],''
        bestFor: ['綜�??�測', '高精度�?�?],
      },
    ];

    res.json({'
      success: true,''
      message: '增強模�??�表?��??��?',
      data: models,
    });'
  } catch (error) {''
    logger.error('?��?增強模�??�表?�誤:', error);
    res.status(500).json({'
      success: false,''
      message: '?��?增強模�??�表失�?',
      error: error.message,
    });
  }
});'
module.exports = router;''
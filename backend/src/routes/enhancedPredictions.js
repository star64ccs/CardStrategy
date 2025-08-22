const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken: protect } = require('../middleware/auth');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
const enhancedPredictionService = require('../services/enhancedPredictionService');
const router = express.Router();

// å¢å¼·?„å–®?¡é?æ¸?router.post(
  '/enhanced-predict',
  protect,
  [
    body('cardId').isInt({ min: 1 }).withMessage('?¡ç?IDå¿…é??¯æ­£?´æ•¸'),
    body('timeframe')
      .isIn(['1d', '7d', '30d', '90d', '180d', '365d'])
      .withMessage('?‚é?æ¡†æ¶?¡æ?'),
    body('modelType')
      .optional()
      .isIn([
        'enhancedLSTM',
        'transformer',
        'technicalEnsemble',
        'dynamicEnsemble',
      ])
      .withMessage('æ¨¡å?é¡å??¡æ?'),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'é©—è??¯èª¤',
          errors: errors.array(),
        });
      }

      const { cardId, timeframe, modelType = 'dynamicEnsemble' } = req.body;

      logger.info(
        `?‹å?å¢å¼·?æ¸¬: ?¡ç? ${cardId}, æ¨¡å? ${modelType}, ?‚é?æ¡†æ¶ ${timeframe}`
      );

// eslint-disable-next-line no-unused-vars
      const prediction = await enhancedPredictionService.predictCardPrice(
        cardId,
        timeframe,
        modelType
      );

      res.json({
        success: true,
        message: 'å¢å¼·?æ¸¬å®Œæ?',
        data: prediction,
      });
    } catch (error) {
      logger.error('å¢å¼·?æ¸¬?¯èª¤:', error);
      res.status(500).json({
        success: false,
        message: '?æ¸¬å¤±æ?',
        error: error.message,
      });
    }
  }
);

// ?¹é?å¢å¼·?æ¸¬
router.post(
  '/enhanced-batch',
  protect,
  [
    body('cardIds')
      .isArray({ min: 1, max: 50 })
      .withMessage('?¡ç?ID?—è¡¨å¿…é??…å«1-50?‹ID'),
    body('cardIds.*').isInt({ min: 1 }).withMessage('?€?‰å¡?ŒIDå¿…é??¯æ­£?´æ•¸'),
    body('timeframe')
      .isIn(['1d', '7d', '30d', '90d', '180d', '365d'])
      .withMessage('?‚é?æ¡†æ¶?¡æ?'),
    body('modelType')
      .optional()
      .isIn([
        'enhancedLSTM',
        'transformer',
        'technicalEnsemble',
        'dynamicEnsemble',
      ])
      .withMessage('æ¨¡å?é¡å??¡æ?'),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'é©—è??¯èª¤',
          errors: errors.array(),
        });
      }

      const { cardIds, timeframe, modelType = 'dynamicEnsemble' } = req.body;

      logger.info(
        `?‹å??¹é?å¢å¼·?æ¸¬: ${cardIds.length} å¼µå¡?? æ¨¡å? ${modelType}, ?‚é?æ¡†æ¶ ${timeframe}`
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
          logger.warn(`?¡ç? ${cardId} ?æ¸¬å¤±æ?:`, error.message);
          predictionErrors.push({ cardId, error: error.message });
        }
      }

      res.json({
        success: true,
        message: `?¹é??æ¸¬å®Œæ?: ${results.length} ?å?, ${predictionErrors.length} å¤±æ?`,
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
      });
    } catch (error) {
      logger.error('?¹é?å¢å¼·?æ¸¬?¯èª¤:', error);
      res.status(500).json({
        success: false,
        message: '?¹é??æ¸¬å¤±æ?',
        error: error.message,
      });
    }
  }
);

// æ¨¡å??§èƒ½æ¯”è?
router.post(
  '/model-comparison',
  protect,
  [
    body('cardId').isInt({ min: 1 }).withMessage('?¡ç?IDå¿…é??¯æ­£?´æ•¸'),
    body('timeframe')
      .isIn(['1d', '7d', '30d', '90d', '180d', '365d'])
      .withMessage('?‚é?æ¡†æ¶?¡æ?'),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'é©—è??¯èª¤',
          errors: errors.array(),
        });
      }

      const { cardId, timeframe } = req.body;

      logger.info(`?‹å?æ¨¡å?æ¯”è?: ?¡ç? ${cardId}, ?‚é?æ¡†æ¶ ${timeframe}`);

// eslint-disable-next-line no-unused-vars
      const models = [
        'enhancedLSTM',
        'transformer',
        'technicalEnsemble',
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
          logger.warn(`æ¨¡å? ${modelType} æ¯”è?å¤±æ?:`, error.message);
          comparisons[modelType] = { error: error.message };
        }
      }

      // è¨ˆç?æ¨¡å?ä¸€?´æ€?      const validPredictions = Object.values(comparisons).filter(
        (p) => !p.error
      );
// eslint-disable-next-line no-unused-vars
      const prices = validPredictions.map((p) => p.predictedPrice);
      const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const variance =
        prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) /
        prices.length;
      const agreement = Math.max(0, 1 - variance / Math.pow(mean, 2));

      res.json({
        success: true,
        message: 'æ¨¡å?æ¯”è?å®Œæ?',
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
      });
    } catch (error) {
      logger.error('æ¨¡å?æ¯”è??¯èª¤:', error);
      res.status(500).json({
        success: false,
        message: 'æ¨¡å?æ¯”è?å¤±æ?',
        error: error.message,
      });
    }
  }
);

// ?€è¡“æ?æ¨™å???router.get(
  '/technical-analysis/:cardId',
  protect,
  [
    body('timeframe')
      .optional()
      .isIn(['1d', '7d', '30d', '90d', '180d', '365d'])
      .withMessage('?‚é?æ¡†æ¶?¡æ?'),
  ],
  async (req, res) => {
    try {
      const { cardId } = req.params;
      const { timeframe = '30d' } = req.query;

      logger.info(`?‹å??€è¡“æ?æ¨™å??? ?¡ç? ${cardId}, ?‚é?æ¡†æ¶ ${timeframe}`);

// eslint-disable-next-line no-unused-vars
      const MarketData = require('../models/MarketData').getMarketDataModel();

// eslint-disable-next-line no-unused-vars
      const historicalData = await MarketData.findAll({
        where: { cardId: parseInt(cardId), isActive: true },
        order: [['date', 'ASC']],
        limit: 100,
      });

      if (historicalData.length < 10) {
        return res.status(400).json({
          success: false,
          message: 'æ­·å²?¸æ?ä¸è¶³ï¼Œç„¡æ³•é€²è??€è¡“å???,
        });
      }

// eslint-disable-next-line no-unused-vars
      const prices = historicalData.map((d) => parseFloat(d.closePrice));
// eslint-disable-next-line no-unused-vars
      const volumes = historicalData.map((d) => parseFloat(d.volume || 0));

      // è¨ˆç??€è¡“æ?æ¨?      const technicalIndicators =
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

      // ?Ÿæ?äº¤æ?ä¿¡è?
      const signals = [];

      if (analysis.rsi < 30)
        signals.push({ indicator: 'RSI', signal: 'è¶…è³£', strength: 'å¼? });
      if (analysis.rsi > 70)
        signals.push({ indicator: 'RSI', signal: 'è¶…è²·', strength: 'å¼? });

      if (analysis.macd.macd > analysis.macd.signal)
        signals.push({ indicator: 'MACD', signal: 'è²·å…¥', strength: 'ä¸? });
      if (analysis.macd.macd < analysis.macd.signal)
        signals.push({ indicator: 'MACD', signal: 'è³?‡º', strength: 'ä¸? });

      const bbPosition =
        (analysis.currentPrice - analysis.bollingerBands.lower) /
        (analysis.bollingerBands.upper - analysis.bollingerBands.lower);
      if (bbPosition < 0.2)
        signals.push({
          indicator: 'å¸ƒæ?å¸?,
          signal: '?¥è?ä¸‹è?',
          strength: 'å¼?,
        });
      if (bbPosition > 0.8)
        signals.push({
          indicator: 'å¸ƒæ?å¸?,
          signal: '?¥è?ä¸Šè?',
          strength: 'å¼?,
        });

      res.json({
        success: true,
        message: '?€è¡“æ?æ¨™å??å???,
        data: {
          cardId: parseInt(cardId),
          timeframe,
          analysis,
          signals,
          summary: {
            totalSignals: signals.length,
            buySignals: signals.filter(
              (s) => s.signal.includes('è²?) || s.signal.includes('è¶…è³£')
            ).length,
            sellSignals: signals.filter(
              (s) => s.signal.includes('è³?) || s.signal.includes('è¶…è²·')
            ).length,
            strongSignals: signals.filter((s) => s.strength === 'å¼?).length,
          },
        },
      });
    } catch (error) {
      logger.error('?€è¡“æ?æ¨™å??éŒ¯èª?', error);
      res.status(500).json({
        success: false,
        message: '?€è¡“æ?æ¨™å??å¤±??,
        error: error.message,
      });
    }
  }
);

// ?æ¸¬æº–ç¢º?§è?ä¼?router.post(
  '/accuracy-assessment',
  protect,
  [body('predictionId').isInt({ min: 1 }).withMessage('?æ¸¬IDå¿…é??¯æ­£?´æ•¸')],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'é©—è??¯èª¤',
          errors: errors.array(),
        });
      }

      const { predictionId } = req.body;

      logger.info(`?‹å??æ¸¬æº–ç¢º?§è?ä¼? ?æ¸¬ID ${predictionId}`);

      const PredictionModel =
        require('../models/PredictionModel').getPredictionModel();
// eslint-disable-next-line no-unused-vars
      const MarketData = require('../models/MarketData').getMarketDataModel();

      // ?²å??æ¸¬è¨˜é?
// eslint-disable-next-line no-unused-vars
      const prediction = await PredictionModel.findByPk(predictionId);
      if (!prediction) {
        return res.status(404).json({
          success: false,
          message: '?æ¸¬è¨˜é?ä¸å???,
        });
      }

      // ?²å??®æ??¥æ??„å¯¦?›åƒ¹??      const actualData = await MarketData.findOne({
        where: {
          cardId: prediction.cardId,
          date: prediction.targetDate,
          isActive: true,
        },
      });

      if (!actualData) {
        return res.status(400).json({
          success: false,
          message: '?®æ??¥æ??„å¯¦?›åƒ¹?¼æ•¸?šä?å­˜åœ¨',
        });
      }

      const actualPrice = parseFloat(actualData.closePrice);
// eslint-disable-next-line no-unused-vars
      const predictedPrice = parseFloat(prediction.predictedPrice);

      // è¨ˆç?æº–ç¢º?§æ?æ¨?      const absoluteError = Math.abs(predictedPrice - actualPrice);
      const percentageError = (absoluteError / actualPrice) * 100;
      const accuracy = Math.max(0, 100 - percentageError) / 100;

      // ?´æ–°?æ¸¬è¨˜é??„æ?ç¢ºæ€?      await prediction.update({ accuracy });

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
        accuracyGrade:
          accuracy >= 0.9
            ? 'A'
            : accuracy >= 0.8
              ? 'B'
              : accuracy >= 0.7
                ? 'C'
                : 'D',
        predictionDate: prediction.predictionDate,
        targetDate: prediction.targetDate,
        daysElapsed: Math.floor(
          (new Date() - prediction.targetDate) / (1000 * 60 * 60 * 24)
        ),
      };

      res.json({
        success: true,
        message: '?æ¸¬æº–ç¢º?§è?ä¼°å???,
        data: assessment,
      });
    } catch (error) {
      logger.error('?æ¸¬æº–ç¢º?§è?ä¼°éŒ¯èª?', error);
      res.status(500).json({
        success: false,
        message: '?æ¸¬æº–ç¢º?§è?ä¼°å¤±??,
        error: error.message,
      });
    }
  }
);

// æ¨¡å??§èƒ½çµ±è?
router.get('/performance-stats', protect, async (req, res) => {
  try {
    logger.info('?²å?æ¨¡å??§èƒ½çµ±è?');

    const PredictionModel =
      require('../models/PredictionModel').getPredictionModel();

    // ?²å??„æ¨¡?‹ç??§èƒ½çµ±è?
    const stats = await PredictionModel.findAll({
      attributes: [
        'modelType',
        [
          PredictionModel.sequelize.fn(
            'COUNT',
            PredictionModel.sequelize.col('id')
          ),
          'totalPredictions',
        ],
        [
          PredictionModel.sequelize.fn(
            'AVG',
            PredictionModel.sequelize.col('confidence')
          ),
          'avgConfidence',
        ],
        [
          PredictionModel.sequelize.fn(
            'AVG',
            PredictionModel.sequelize.col('accuracy')
          ),
          'avgAccuracy',
        ],
        [
          PredictionModel.sequelize.fn(
            'COUNT',
            PredictionModel.sequelize.literal(
              'CASE WHEN accuracy >= 0.8 THEN 1 END'
            )
          ),
          'highAccuracyCount',
        ],
      ],
      where: {
        accuracy: { [PredictionModel.sequelize.Op.not]: null },
      },
      group: ['modelType'],
      order: [
        [
          PredictionModel.sequelize.fn(
            'AVG',
            PredictionModel.sequelize.col('accuracy')
          ),
          'DESC',
        ],
      ],
    });

    // è¨ˆç??´é?çµ±è?
    const overallStats = await PredictionModel.findOne({
      attributes: [
        [
          PredictionModel.sequelize.fn(
            'COUNT',
            PredictionModel.sequelize.col('id')
          ),
          'totalPredictions',
        ],
        [
          PredictionModel.sequelize.fn(
            'AVG',
            PredictionModel.sequelize.col('confidence')
          ),
          'avgConfidence',
        ],
        [
          PredictionModel.sequelize.fn(
            'AVG',
            PredictionModel.sequelize.col('accuracy')
          ),
          'avgAccuracy',
        ],
        [
          PredictionModel.sequelize.fn(
            'COUNT',
            PredictionModel.sequelize.literal(
              'CASE WHEN accuracy >= 0.8 THEN 1 END'
            )
          ),
          'highAccuracyCount',
        ],
      ],
      where: {
        accuracy: { [PredictionModel.sequelize.Op.not]: null },
      },
    });

    res.json({
      success: true,
      message: 'æ¨¡å??§èƒ½çµ±è??²å??å?',
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
            stat.dataValues.totalPredictions > 0
              ? `${((stat.dataValues.highAccuracyCount / stat.dataValues.totalPredictions) * 100).toFixed(2)}%`
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
            overallStats.dataValues.totalPredictions > 0
              ? `${((overallStats.dataValues.highAccuracyCount / overallStats.dataValues.totalPredictions) * 100).toFixed(2)}%`
              : '0%',
        },
      },
    });
  } catch (error) {
    logger.error('?²å?æ¨¡å??§èƒ½çµ±è??¯èª¤:', error);
    res.status(500).json({
      success: false,
      message: '?²å?æ¨¡å??§èƒ½çµ±è?å¤±æ?',
      error: error.message,
    });
  }
});

// ?²å?å¢å¼·æ¨¡å??—è¡¨
router.get('/enhanced-models', protect, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const models = [
      {
        id: 'enhancedLSTM',
        name: 'å¢å¼·LSTMæ¨¡å?',
        description: '?ºæ–¼æ·±åº¦å­¸ç??„é•·?­æ?è¨˜æ†¶ç¶²çµ¡ï¼Œç??ˆæ?è¡“æ?æ¨™é€²è??æ¸¬',
        accuracy: '80-85%',
        speed: 'ä¸­ç?',
        complexity: 'é«?,
        features: ['?€è¡“æ?æ¨™æ•´??, 'åºå?å»ºæ¨¡', '?•æ??¹å¾µ?å?'],
        bestFor: ['?·æ?è¶¨å‹¢?æ¸¬', 'è¤‡é?æ¨¡å?è­˜åˆ¥'],
      },
      {
        id: 'transformer',
        name: 'Transformeræ¨¡å?',
        description: '?ºæ–¼æ³¨æ??›æ??¶ç?æ·±åº¦å­¸ç?æ¨¡å?ï¼Œæ??·æ??‰é•·?Ÿä?è³´é?ä¿?,
        accuracy: '85-90%',
        speed: 'ä¸­ç?',
        complexity: 'é«?,
        features: ['æ³¨æ??›æ???, 'ä¸¦è??•ç?', '?¨å?ä¾è³´å»ºæ¨¡'],
        bestFor: ['è¤‡é??‚é?åºå?', 'å¤šè??é?æ¸?],
      },
      {
        id: 'technicalEnsemble',
        name: '?€è¡“æ?æ¨™é??æ¨¡??,
        description: 'çµå?å¤šç¨®?€è¡“å??æ?æ¨™ç?çµ±è?æ¨¡å?',
        accuracy: '75-80%',
        speed: 'å¿?,
        complexity: 'ä¸­ç?',
        features: ['å¤šæ?æ¨™è???, 'ä¿¡è?å¼·åº¦?†æ?', 'ä¸€?´æ€§è?ä¼?],
        bestFor: ['?­æ?äº¤æ?ä¿¡è?', '?€è¡“å???],
      },
      {
        id: 'dynamicEnsemble',
        name: '?•æ??†æ?æ¨¡å?',
        description: '?ºèƒ½çµ„å?å¤šå€‹æ¨¡?‹ç??•æ?æ¬Šé??†æ?ç³»çµ±',
        accuracy: '90-95%',
        speed: 'ä¸­ç?',
        complexity: 'é«?,
        features: ['?•æ?æ¬Šé?èª¿æ•´', 'å¤šæ¨¡?‹è???, '?ªé©?‰å­¸ç¿?],
        bestFor: ['ç¶œå??æ¸¬', 'é«˜ç²¾åº¦è?æ±?],
      },
    ];

    res.json({
      success: true,
      message: 'å¢å¼·æ¨¡å??—è¡¨?²å??å?',
      data: models,
    });
  } catch (error) {
    logger.error('?²å?å¢å¼·æ¨¡å??—è¡¨?¯èª¤:', error);
    res.status(500).json({
      success: false,
      message: '?²å?å¢å¼·æ¨¡å??—è¡¨å¤±æ?',
      error: error.message,
    });
  }
});

module.exports = router;

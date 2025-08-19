const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');
const enhancedPredictionService = require('../services/enhancedPredictionService');
const router = express.Router();

// 增強的單卡預測
router.post('/enhanced-predict', protect, [
  body('cardId').isInt({ min: 1 }).withMessage('卡牌ID必須是正整數'),
  body('timeframe').isIn(['1d', '7d', '30d', '90d', '180d', '365d']).withMessage('時間框架無效'),
  body('modelType').optional().isIn(['enhancedLSTM', 'transformer', 'technicalEnsemble', 'dynamicEnsemble']).withMessage('模型類型無效')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '驗證錯誤',
        errors: errors.array()
      });
    }

    const { cardId, timeframe, modelType = 'dynamicEnsemble' } = req.body;

    logger.info(`開始增強預測: 卡牌 ${cardId}, 模型 ${modelType}, 時間框架 ${timeframe}`);

    const prediction = await enhancedPredictionService.predictCardPrice(cardId, timeframe, modelType);

    res.json({
      success: true,
      message: '增強預測完成',
      data: prediction
    });
  } catch (error) {
    logger.error('增強預測錯誤:', error);
    res.status(500).json({
      success: false,
      message: '預測失敗',
      error: error.message
    });
  }
});

// 批量增強預測
router.post('/enhanced-batch', protect, [
  body('cardIds').isArray({ min: 1, max: 50 }).withMessage('卡牌ID列表必須包含1-50個ID'),
  body('cardIds.*').isInt({ min: 1 }).withMessage('所有卡牌ID必須是正整數'),
  body('timeframe').isIn(['1d', '7d', '30d', '90d', '180d', '365d']).withMessage('時間框架無效'),
  body('modelType').optional().isIn(['enhancedLSTM', 'transformer', 'technicalEnsemble', 'dynamicEnsemble']).withMessage('模型類型無效')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '驗證錯誤',
        errors: errors.array()
      });
    }

    const { cardIds, timeframe, modelType = 'dynamicEnsemble' } = req.body;

    logger.info(`開始批量增強預測: ${cardIds.length} 張卡牌, 模型 ${modelType}, 時間框架 ${timeframe}`);

    const results = [];
    const errors = [];

    for (const cardId of cardIds) {
      try {
        const prediction = await enhancedPredictionService.predictCardPrice(cardId, timeframe, modelType);
        results.push(prediction);
      } catch (error) {
        logger.warn(`卡牌 ${cardId} 預測失敗:`, error.message);
        errors.push({ cardId, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `批量預測完成: ${results.length} 成功, ${errors.length} 失敗`,
      data: {
        predictions: results,
        errors,
        summary: {
          total: cardIds.length,
          successful: results.length,
          failed: errors.length,
          successRate: `${(results.length / cardIds.length * 100).toFixed(2)  }%`
        }
      }
    });
  } catch (error) {
    logger.error('批量增強預測錯誤:', error);
    res.status(500).json({
      success: false,
      message: '批量預測失敗',
      error: error.message
    });
  }
});

// 模型性能比較
router.post('/model-comparison', protect, [
  body('cardId').isInt({ min: 1 }).withMessage('卡牌ID必須是正整數'),
  body('timeframe').isIn(['1d', '7d', '30d', '90d', '180d', '365d']).withMessage('時間框架無效')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '驗證錯誤',
        errors: errors.array()
      });
    }

    const { cardId, timeframe } = req.body;

    logger.info(`開始模型比較: 卡牌 ${cardId}, 時間框架 ${timeframe}`);

    const models = ['enhancedLSTM', 'transformer', 'technicalEnsemble', 'dynamicEnsemble'];
    const comparisons = {};

    for (const modelType of models) {
      try {
        const prediction = await enhancedPredictionService.predictCardPrice(cardId, timeframe, modelType);
        comparisons[modelType] = {
          predictedPrice: prediction.predictedPrice,
          confidence: prediction.confidence,
          trend: prediction.trend,
          volatility: prediction.volatility,
          riskLevel: prediction.riskLevel,
          factors: prediction.factors
        };
      } catch (error) {
        logger.warn(`模型 ${modelType} 比較失敗:`, error.message);
        comparisons[modelType] = { error: error.message };
      }
    }

    // 計算模型一致性
    const validPredictions = Object.values(comparisons).filter(p => !p.error);
    const prices = validPredictions.map(p => p.predictedPrice);
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const agreement = Math.max(0, 1 - variance / Math.pow(mean, 2));

    res.json({
      success: true,
      message: '模型比較完成',
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
          modelAgreement: agreement.toFixed(4)
        }
      }
    });
  } catch (error) {
    logger.error('模型比較錯誤:', error);
    res.status(500).json({
      success: false,
      message: '模型比較失敗',
      error: error.message
    });
  }
});

// 技術指標分析
router.get('/technical-analysis/:cardId', protect, [
  body('timeframe').optional().isIn(['1d', '7d', '30d', '90d', '180d', '365d']).withMessage('時間框架無效')
], async (req, res) => {
  try {
    const { cardId } = req.params;
    const { timeframe = '30d' } = req.query;

    logger.info(`開始技術指標分析: 卡牌 ${cardId}, 時間框架 ${timeframe}`);

    const MarketData = require('../models/MarketData').getMarketDataModel();

    const historicalData = await MarketData.findAll({
      where: { cardId: parseInt(cardId), isActive: true },
      order: [['date', 'ASC']],
      limit: 100
    });

    if (historicalData.length < 10) {
      return res.status(400).json({
        success: false,
        message: '歷史數據不足，無法進行技術分析'
      });
    }

    const prices = historicalData.map(d => parseFloat(d.closePrice));
    const volumes = historicalData.map(d => parseFloat(d.volume || 0));

    // 計算技術指標
    const technicalIndicators = new (require('../services/enhancedPredictionService').TechnicalIndicators)();

    const analysis = {
      rsi: technicalIndicators.calculateRSI(prices),
      macd: technicalIndicators.calculateMACD(prices),
      bollingerBands: technicalIndicators.calculateBollingerBands(prices),
      stochastic: technicalIndicators.calculateStochastic(prices),
      williamsR: technicalIndicators.calculateWilliamsR(prices),
      cci: technicalIndicators.calculateCCI(prices),
      currentPrice: prices[prices.length - 1],
      priceChange: `${((prices[prices.length - 1] - prices[0]) / prices[0] * 100).toFixed(2)  }%`,
      volatility: enhancedPredictionService.calculateVolatility(prices),
      momentum: enhancedPredictionService.calculateMomentum(prices)
    };

    // 生成交易信號
    const signals = [];

    if (analysis.rsi < 30) signals.push({ indicator: 'RSI', signal: '超賣', strength: '強' });
    if (analysis.rsi > 70) signals.push({ indicator: 'RSI', signal: '超買', strength: '強' });

    if (analysis.macd.macd > analysis.macd.signal) signals.push({ indicator: 'MACD', signal: '買入', strength: '中' });
    if (analysis.macd.macd < analysis.macd.signal) signals.push({ indicator: 'MACD', signal: '賣出', strength: '中' });

    const bbPosition = (analysis.currentPrice - analysis.bollingerBands.lower) /
                      (analysis.bollingerBands.upper - analysis.bollingerBands.lower);
    if (bbPosition < 0.2) signals.push({ indicator: '布林帶', signal: '接近下軌', strength: '弱' });
    if (bbPosition > 0.8) signals.push({ indicator: '布林帶', signal: '接近上軌', strength: '弱' });

    res.json({
      success: true,
      message: '技術指標分析完成',
      data: {
        cardId: parseInt(cardId),
        timeframe,
        analysis,
        signals,
        summary: {
          totalSignals: signals.length,
          buySignals: signals.filter(s => s.signal.includes('買') || s.signal.includes('超賣')).length,
          sellSignals: signals.filter(s => s.signal.includes('賣') || s.signal.includes('超買')).length,
          strongSignals: signals.filter(s => s.strength === '強').length
        }
      }
    });
  } catch (error) {
    logger.error('技術指標分析錯誤:', error);
    res.status(500).json({
      success: false,
      message: '技術指標分析失敗',
      error: error.message
    });
  }
});

// 預測準確性評估
router.post('/accuracy-assessment', protect, [
  body('predictionId').isInt({ min: 1 }).withMessage('預測ID必須是正整數')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '驗證錯誤',
        errors: errors.array()
      });
    }

    const { predictionId } = req.body;

    logger.info(`開始預測準確性評估: 預測ID ${predictionId}`);

    const PredictionModel = require('../models/PredictionModel').getPredictionModel();
    const MarketData = require('../models/MarketData').getMarketDataModel();

    // 獲取預測記錄
    const prediction = await PredictionModel.findByPk(predictionId);
    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: '預測記錄不存在'
      });
    }

    // 獲取目標日期的實際價格
    const actualData = await MarketData.findOne({
      where: {
        cardId: prediction.cardId,
        date: prediction.targetDate,
        isActive: true
      }
    });

    if (!actualData) {
      return res.status(400).json({
        success: false,
        message: '目標日期的實際價格數據不存在'
      });
    }

    const actualPrice = parseFloat(actualData.closePrice);
    const predictedPrice = parseFloat(prediction.predictedPrice);

    // 計算準確性指標
    const absoluteError = Math.abs(predictedPrice - actualPrice);
    const percentageError = (absoluteError / actualPrice) * 100;
    const accuracy = Math.max(0, 100 - percentageError) / 100;

    // 更新預測記錄的準確性
    await prediction.update({ accuracy });

    const assessment = {
      predictionId,
      cardId: prediction.cardId,
      modelType: prediction.modelType,
      timeframe: prediction.timeframe,
      predictedPrice,
      actualPrice,
      absoluteError: absoluteError.toFixed(2),
      percentageError: `${percentageError.toFixed(2)  }%`,
      accuracy: accuracy.toFixed(4),
      accuracyGrade: accuracy >= 0.9 ? 'A' : accuracy >= 0.8 ? 'B' : accuracy >= 0.7 ? 'C' : 'D',
      predictionDate: prediction.predictionDate,
      targetDate: prediction.targetDate,
      daysElapsed: Math.floor((new Date() - prediction.targetDate) / (1000 * 60 * 60 * 24))
    };

    res.json({
      success: true,
      message: '預測準確性評估完成',
      data: assessment
    });
  } catch (error) {
    logger.error('預測準確性評估錯誤:', error);
    res.status(500).json({
      success: false,
      message: '預測準確性評估失敗',
      error: error.message
    });
  }
});

// 模型性能統計
router.get('/performance-stats', protect, async (req, res) => {
  try {
    logger.info('獲取模型性能統計');

    const PredictionModel = require('../models/PredictionModel').getPredictionModel();

    // 獲取各模型的性能統計
    const stats = await PredictionModel.findAll({
      attributes: [
        'modelType',
        [PredictionModel.sequelize.fn('COUNT', PredictionModel.sequelize.col('id')), 'totalPredictions'],
        [PredictionModel.sequelize.fn('AVG', PredictionModel.sequelize.col('confidence')), 'avgConfidence'],
        [PredictionModel.sequelize.fn('AVG', PredictionModel.sequelize.col('accuracy')), 'avgAccuracy'],
        [PredictionModel.sequelize.fn('COUNT', PredictionModel.sequelize.literal('CASE WHEN accuracy >= 0.8 THEN 1 END')), 'highAccuracyCount']
      ],
      where: {
        accuracy: { [PredictionModel.sequelize.Op.not]: null }
      },
      group: ['modelType'],
      order: [[PredictionModel.sequelize.fn('AVG', PredictionModel.sequelize.col('accuracy')), 'DESC']]
    });

    // 計算整體統計
    const overallStats = await PredictionModel.findOne({
      attributes: [
        [PredictionModel.sequelize.fn('COUNT', PredictionModel.sequelize.col('id')), 'totalPredictions'],
        [PredictionModel.sequelize.fn('AVG', PredictionModel.sequelize.col('confidence')), 'avgConfidence'],
        [PredictionModel.sequelize.fn('AVG', PredictionModel.sequelize.col('accuracy')), 'avgAccuracy'],
        [PredictionModel.sequelize.fn('COUNT', PredictionModel.sequelize.literal('CASE WHEN accuracy >= 0.8 THEN 1 END')), 'highAccuracyCount']
      ],
      where: {
        accuracy: { [PredictionModel.sequelize.Op.not]: null }
      }
    });

    res.json({
      success: true,
      message: '模型性能統計獲取成功',
      data: {
        modelStats: stats.map(stat => ({
          modelType: stat.modelType,
          totalPredictions: parseInt(stat.dataValues.totalPredictions),
          avgConfidence: parseFloat(stat.dataValues.avgConfidence || 0).toFixed(4),
          avgAccuracy: parseFloat(stat.dataValues.avgAccuracy || 0).toFixed(4),
          highAccuracyCount: parseInt(stat.dataValues.highAccuracyCount || 0),
          highAccuracyRate: stat.dataValues.totalPredictions > 0 ?
            `${((stat.dataValues.highAccuracyCount / stat.dataValues.totalPredictions) * 100).toFixed(2)  }%` : '0%'
        })),
        overallStats: {
          totalPredictions: parseInt(overallStats.dataValues.totalPredictions || 0),
          avgConfidence: parseFloat(overallStats.dataValues.avgConfidence || 0).toFixed(4),
          avgAccuracy: parseFloat(overallStats.dataValues.avgAccuracy || 0).toFixed(4),
          highAccuracyCount: parseInt(overallStats.dataValues.highAccuracyCount || 0),
          highAccuracyRate: overallStats.dataValues.totalPredictions > 0 ?
            `${((overallStats.dataValues.highAccuracyCount / overallStats.dataValues.totalPredictions) * 100).toFixed(2)  }%` : '0%'
        }
      }
    });
  } catch (error) {
    logger.error('獲取模型性能統計錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取模型性能統計失敗',
      error: error.message
    });
  }
});

// 獲取增強模型列表
router.get('/enhanced-models', protect, async (req, res) => {
  try {
    const models = [
      {
        id: 'enhancedLSTM',
        name: '增強LSTM模型',
        description: '基於深度學習的長短期記憶網絡，結合技術指標進行預測',
        accuracy: '80-85%',
        speed: '中等',
        complexity: '高',
        features: ['技術指標整合', '序列建模', '動態特徵提取'],
        bestFor: ['長期趨勢預測', '複雜模式識別']
      },
      {
        id: 'transformer',
        name: 'Transformer模型',
        description: '基於注意力機制的深度學習模型，擅長捕捉長期依賴關係',
        accuracy: '85-90%',
        speed: '中等',
        complexity: '高',
        features: ['注意力機制', '並行處理', '全局依賴建模'],
        bestFor: ['複雜時間序列', '多變量預測']
      },
      {
        id: 'technicalEnsemble',
        name: '技術指標集成模型',
        description: '結合多種技術分析指標的統計模型',
        accuracy: '75-80%',
        speed: '快',
        complexity: '中等',
        features: ['多指標融合', '信號強度分析', '一致性評估'],
        bestFor: ['短期交易信號', '技術分析']
      },
      {
        id: 'dynamicEnsemble',
        name: '動態集成模型',
        description: '智能組合多個模型的動態權重集成系統',
        accuracy: '90-95%',
        speed: '中等',
        complexity: '高',
        features: ['動態權重調整', '多模型融合', '自適應學習'],
        bestFor: ['綜合預測', '高精度要求']
      }
    ];

    res.json({
      success: true,
      message: '增強模型列表獲取成功',
      data: models
    });
  } catch (error) {
    logger.error('獲取增強模型列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取增強模型列表失敗',
      error: error.message
    });
  }
});

module.exports = router;

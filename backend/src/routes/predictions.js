const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');
const predictionService = require('../services/predictionService');

const router = express.Router();

// @route   POST /api/predictions/predict
// @desc    預測卡牌價格
// @access  Private
router.post('/predict', protect, [
  body('cardId').isInt({ min: 1 }).withMessage('卡牌ID必須是正整數'),
  body('timeframe').isIn(['1d', '7d', '30d', '90d', '180d', '365d']).withMessage('時間框架必須是1d、7d、30d、90d、180d或365d'),
  body('modelType').optional().isIn(['linear', 'polynomial', 'exponential', 'arima', 'lstm', 'ensemble']).withMessage('模型類型必須是linear、polynomial、exponential、arima、lstm或ensemble')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '輸入驗證失敗',
        code: 'VALIDATION_ERROR',
        errors: errors.array()
      });
    }

    const { cardId, timeframe, modelType = 'ensemble' } = req.body;

    // 執行預測
    const prediction = await predictionService.predictCardPrice(cardId, timeframe, modelType);

    logger.info(`價格預測: 用戶 ${req.user.username} 預測卡牌 ${cardId}, 模型 ${modelType}, 時間框架 ${timeframe}`);

    res.json({
      success: true,
      message: '預測完成',
      data: { prediction }
    });
  } catch (error) {
    logger.error('價格預測錯誤:', error);
    res.status(500).json({
      success: false,
      message: error.message || '預測失敗',
      code: 'PREDICTION_FAILED'
    });
  }
});

// @route   GET /api/predictions/history/:cardId
// @desc    獲取預測歷史
// @access  Private
router.get('/history/:cardId', protect, [
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('限制數量必須在1-100之間')
], async (req, res) => {
  try {
    const { cardId } = req.params;
    const { limit = 50 } = req.query;

    // 獲取預測歷史
    const predictions = await predictionService.getPredictionHistory(parseInt(cardId), parseInt(limit));

    logger.info(`獲取預測歷史: 用戶 ${req.user.username} 查看卡牌 ${cardId} 的預測歷史`);

    res.json({
      success: true,
      message: '預測歷史獲取成功',
      data: {
        predictions,
        total: predictions.length,
        cardId: parseInt(cardId)
      }
    });
  } catch (error) {
    logger.error('獲取預測歷史錯誤:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取預測歷史失敗',
      code: 'HISTORY_FETCH_FAILED'
    });
  }
});

// @route   POST /api/predictions/accuracy/:predictionId
// @desc    計算預測準確性
// @access  Private
router.post('/accuracy/:predictionId', protect, async (req, res) => {
  try {
    const { predictionId } = req.params;

    // 計算預測準確性
    const accuracy = await predictionService.calculatePredictionAccuracy(parseInt(predictionId));

    if (!accuracy) {
      return res.json({
        success: true,
        message: '目標日期還沒有實際數據，無法計算準確性',
        data: { accuracy: null }
      });
    }

    logger.info(`計算預測準確性: 用戶 ${req.user.username} 計算預測 ${predictionId} 的準確性`);

    res.json({
      success: true,
      message: '準確性計算完成',
      data: { accuracy }
    });
  } catch (error) {
    logger.error('計算預測準確性錯誤:', error);
    res.status(500).json({
      success: false,
      message: error.message || '計算準確性失敗',
      code: 'ACCURACY_CALCULATION_FAILED'
    });
  }
});

// @route   POST /api/predictions/batch
// @desc    批量預測
// @access  Private
router.post('/batch', protect, [
  body('cardIds').isArray({ min: 1, max: 10 }).withMessage('卡牌ID必須是包含1-10個元素的數組'),
  body('timeframe').isIn(['1d', '7d', '30d', '90d', '180d', '365d']).withMessage('時間框架必須是1d、7d、30d、90d、180d或365d'),
  body('modelType').optional().isIn(['linear', 'polynomial', 'exponential', 'arima', 'lstm', 'ensemble']).withMessage('模型類型必須是linear、polynomial、exponential、arima、lstm或ensemble')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '輸入驗證失敗',
        code: 'VALIDATION_ERROR',
        errors: errors.array()
      });
    }

    const { cardIds, timeframe, modelType = 'ensemble' } = req.body;

    // 批量預測
    const predictions = [];
    const errors = [];

    for (const cardId of cardIds) {
      try {
        const prediction = await predictionService.predictCardPrice(cardId, timeframe, modelType);
        predictions.push(prediction);
      } catch (error) {
        errors.push({
          cardId,
          error: error.message
        });
        logger.warn(`批量預測失敗 - 卡牌 ${cardId}:`, error.message);
      }
    }

    logger.info(`批量預測: 用戶 ${req.user.username} 批量預測 ${cardIds.length} 張卡牌`);

    res.json({
      success: true,
      message: '批量預測完成',
      data: {
        predictions,
        errors,
        summary: {
          total: cardIds.length,
          successful: predictions.length,
          failed: errors.length
        }
      }
    });
  } catch (error) {
    logger.error('批量預測錯誤:', error);
    res.status(500).json({
      success: false,
      message: error.message || '批量預測失敗',
      code: 'BATCH_PREDICTION_FAILED'
    });
  }
});

// @route   GET /api/predictions/models
// @desc    獲取可用模型列表
// @access  Private
router.get('/models', protect, async (req, res) => {
  try {
    const models = [
      {
        id: 'linear',
        name: '線性回歸',
        description: '基於線性趨勢的簡單預測模型',
        minDataPoints: 2,
        accuracy: '中等',
        speed: '快',
        complexity: '低'
      },
      {
        id: 'polynomial',
        name: '多項式回歸',
        description: '能夠捕捉非線性趨勢的預測模型',
        minDataPoints: 3,
        accuracy: '中高',
        speed: '中等',
        complexity: '中等'
      },
      {
        id: 'exponential',
        name: '指數平滑',
        description: '基於時間序列的平滑預測模型',
        minDataPoints: 2,
        accuracy: '中等',
        speed: '快',
        complexity: '低'
      },
      {
        id: 'arima',
        name: 'ARIMA模型',
        description: '自回歸積分移動平均模型，適合時間序列預測',
        minDataPoints: 10,
        accuracy: '高',
        speed: '中等',
        complexity: '高'
      },
      {
        id: 'lstm',
        name: 'LSTM神經網絡',
        description: '長短期記憶網絡，能夠學習複雜的時間模式',
        minDataPoints: 20,
        accuracy: '很高',
        speed: '慢',
        complexity: '很高'
      },
      {
        id: 'ensemble',
        name: '集成模型',
        description: '結合多個模型的預測結果，提供最穩定的預測',
        minDataPoints: 5,
        accuracy: '最高',
        speed: '中等',
        complexity: '中等'
      }
    ];

    logger.info(`獲取模型列表: 用戶 ${req.user.username}`);

    res.json({
      success: true,
      message: '模型列表獲取成功',
      data: { models }
    });
  } catch (error) {
    logger.error('獲取模型列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取模型列表失敗',
      code: 'MODELS_FETCH_FAILED'
    });
  }
});

// @route   GET /api/predictions/statistics
// @desc    獲取預測統計信息
// @access  Private
router.get('/statistics', protect, async (req, res) => {
  try {
    const { getPredictionModel } = require('../models/PredictionModel');
    const PredictionModel = getPredictionModel();

    if (!PredictionModel) {
      throw new Error('預測模型初始化失敗');
    }

    // 獲取統計信息
    const totalPredictions = await PredictionModel.count({
      where: { isActive: true }
    });

    const recentPredictions = await PredictionModel.count({
      where: {
        isActive: true,
        predictionDate: {
          [require('sequelize').Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 最近7天
        }
      }
    });

    const modelStats = await PredictionModel.findAll({
      attributes: [
        'modelType',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('AVG', require('sequelize').col('confidence')), 'avgConfidence'],
        [require('sequelize').fn('AVG', require('sequelize').col('accuracy')), 'avgAccuracy']
      ],
      where: { isActive: true },
      group: ['modelType']
    });

    const accuracyStats = await PredictionModel.findAll({
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('accuracy')), 'overallAccuracy'],
        [require('sequelize').fn('COUNT', require('sequelize').col('accuracy')), 'accuracyCount']
      ],
      where: {
        isActive: true,
        accuracy: {
          [require('sequelize').Op.not]: null
        }
      }
    });

    logger.info(`獲取預測統計: 用戶 ${req.user.username}`);

    res.json({
      success: true,
      message: '統計信息獲取成功',
      data: {
        totalPredictions,
        recentPredictions,
        modelStats,
        accuracyStats: accuracyStats[0] || { overallAccuracy: 0, accuracyCount: 0 }
      }
    });
  } catch (error) {
    logger.error('獲取預測統計錯誤:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取統計信息失敗',
      code: 'STATISTICS_FETCH_FAILED'
    });
  }
});

// @route   DELETE /api/predictions/:predictionId
// @desc    刪除預測記錄
// @access  Private
router.delete('/:predictionId', protect, async (req, res) => {
  try {
    const { predictionId } = req.params;
    const { getPredictionModel } = require('../models/PredictionModel');
    const PredictionModel = getPredictionModel();

    if (!PredictionModel) {
      throw new Error('預測模型初始化失敗');
    }

    const prediction = await PredictionModel.findByPk(predictionId);
    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: '預測記錄不存在',
        code: 'PREDICTION_NOT_FOUND'
      });
    }

    // 軟刪除
    await prediction.update({ isActive: false });

    logger.info(`刪除預測記錄: 用戶 ${req.user.username} 刪除預測 ${predictionId}`);

    res.json({
      success: true,
      message: '預測記錄刪除成功'
    });
  } catch (error) {
    logger.error('刪除預測記錄錯誤:', error);
    res.status(500).json({
      success: false,
      message: error.message || '刪除預測記錄失敗',
      code: 'PREDICTION_DELETE_FAILED'
    });
  }
});

module.exports = router;

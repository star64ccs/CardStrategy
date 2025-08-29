const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// @route   POST /api/predictions
// @desc    創建預測記錄
// @access  Private
router.post(
  '/',
  protect,
  [
    body('cardId').isInt().withMessage('卡片ID必須是整數'),
    body('predictedPrice').isFloat({ min: 0 }).withMessage('預測價格必須是正數'),
    body('confidence').isFloat({ min: 0, max: 1 }).withMessage('置信度必須在0-1之間'),
    body('timeframe').isIn(['short', 'medium', 'long']).withMessage('時間框架必須是short/medium/long'),
    body('modelType').optional().isString().withMessage('模型類型必須是字符串'),
    body('notes').optional().isString().withMessage('備註必須是字符串'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '驗證失敗',
          errors: errors.array(),
        });
      }

      const {
        cardId,
        predictedPrice,
        confidence,
        timeframe,
        modelType = 'default',
        notes = '',
      } = req.body;

      const { getPredictionModel } = require('../models/PredictionModel');
      const PredictionModel = getPredictionModel();

      if (!PredictionModel) {
        throw new Error('預測模型未正確初始化');
      }

      const prediction = await PredictionModel.create({
        userId: req.user.id,
        cardId,
        predictedPrice,
        confidence,
        timeframe,
        modelType,
        notes,
        isActive: true,
      });

      logger.info(`創建預測記錄: 用戶 ${req.user.username} 為卡片 ${cardId} 創建預測`);

      res.status(201).json({
        success: true,
        message: '預測記錄創建成功',
        data: { prediction },
      });
    } catch (error) {
      logger.error('創建預測記錄錯誤:', error);
      res.status(500).json({
        success: false,
        message: error.message || '創建預測記錄失敗',
        code: 'PREDICTION_CREATE_FAILED',
      });
    }
  }
);

// @route   GET /api/predictions
// @desc    獲取用戶的預測記錄
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, timeframe, modelType } = req.query;
    const offset = (page - 1) * limit;

    const { getPredictionModel } = require('../models/PredictionModel');
    const PredictionModel = getPredictionModel();

    if (!PredictionModel) {
      throw new Error('預測模型未正確初始化');
    }

    const whereClause = {
      userId: req.user.id,
      isActive: true,
    };

    if (timeframe) {
      whereClause.timeframe = timeframe;
    }

    if (modelType) {
      whereClause.modelType = modelType;
    }

    const predictions = await PredictionModel.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    logger.info(`獲取預測記錄: 用戶 ${req.user.username} 獲取 ${predictions.rows.length} 條記錄`);

    res.json({
      success: true,
      message: '預測記錄獲取成功',
      data: {
        predictions: predictions.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(predictions.count / limit),
          totalItems: predictions.count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    logger.error('獲取預測記錄錯誤:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取預測記錄失敗',
      code: 'PREDICTIONS_FETCH_FAILED',
    });
  }
});

// @route   GET /api/predictions/:predictionId
// @desc    獲取單個預測記錄
// @access  Private
router.get('/:predictionId', protect, async (req, res) => {
  try {
    const { predictionId } = req.params;

    const { getPredictionModel } = require('../models/PredictionModel');
    const PredictionModel = getPredictionModel();

    if (!PredictionModel) {
      throw new Error('預測模型未正確初始化');
    }

    const prediction = await PredictionModel.findOne({
      where: {
        id: predictionId,
        userId: req.user.id,
        isActive: true,
      },
    });

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: '預測記錄不存在',
        code: 'PREDICTION_NOT_FOUND',
      });
    }

    logger.info(`獲取預測記錄: 用戶 ${req.user.username} 獲取預測 ${predictionId}`);

    res.json({
      success: true,
      message: '預測記錄獲取成功',
      data: { prediction },
    });
  } catch (error) {
    logger.error('獲取預測記錄錯誤:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取預測記錄失敗',
      code: 'PREDICTION_FETCH_FAILED',
    });
  }
});

// @route   PUT /api/predictions/:predictionId
// @desc    更新預測記錄
// @access  Private
router.put(
  '/:predictionId',
  protect,
  [
    body('predictedPrice').optional().isFloat({ min: 0 }).withMessage('預測價格必須是正數'),
    body('confidence').optional().isFloat({ min: 0, max: 1 }).withMessage('置信度必須在0-1之間'),
    body('notes').optional().isString().withMessage('備註必須是字符串'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '驗證失敗',
          errors: errors.array(),
        });
      }

      const { predictionId } = req.params;
      const { predictedPrice, confidence, notes } = req.body;

      const { getPredictionModel } = require('../models/PredictionModel');
      const PredictionModel = getPredictionModel();

      if (!PredictionModel) {
        throw new Error('預測模型未正確初始化');
      }

      const prediction = await PredictionModel.findOne({
        where: {
          id: predictionId,
          userId: req.user.id,
          isActive: true,
        },
      });

      if (!prediction) {
        return res.status(404).json({
          success: false,
          message: '預測記錄不存在',
          code: 'PREDICTION_NOT_FOUND',
        });
      }

      const updateData = {};
      if (predictedPrice !== undefined) updateData.predictedPrice = predictedPrice;
      if (confidence !== undefined) updateData.confidence = confidence;
      if (notes !== undefined) updateData.notes = notes;

      await prediction.update(updateData);

      logger.info(`更新預測記錄: 用戶 ${req.user.username} 更新預測 ${predictionId}`);

      res.json({
        success: true,
        message: '預測記錄更新成功',
        data: { prediction },
      });
    } catch (error) {
      logger.error('更新預測記錄錯誤:', error);
      res.status(500).json({
        success: false,
        message: error.message || '更新預測記錄失敗',
        code: 'PREDICTION_UPDATE_FAILED',
      });
    }
  }
);

// @route   GET /api/predictions/stats/overview
// @desc    獲取預測統計信息
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const { getPredictionModel } = require('../models/PredictionModel');
    const PredictionModel = getPredictionModel();

    if (!PredictionModel) {
      throw new Error('預測模型未正確初始化');
    }

    const totalPredictions = await PredictionModel.count({
      where: {
        userId: req.user.id,
        isActive: true,
      },
    });

    const recentPredictions = await PredictionModel.count({
      where: {
        userId: req.user.id,
        isActive: true,
        createdAt: {
          [require('sequelize').Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const modelStats = await PredictionModel.findAll({
      attributes: [
        'modelType',
        [
          require('sequelize').fn('COUNT', require('sequelize').col('id')),
          'count',
        ],
        [
          require('sequelize').fn('AVG', require('sequelize').col('confidence')),
          'avgConfidence',
        ],
        [
          require('sequelize').fn('AVG', require('sequelize').col('accuracy')),
          'avgAccuracy',
        ],
      ],
      where: { 
        userId: req.user.id,
        isActive: true 
      },
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
        userId: req.user.id,
        isActive: true,
        accuracy: {
          [require('sequelize').Op.not]: null,
        },
      },
    });

    logger.info(`獲取預測統計: 用戶 ${req.user.username}`);

    res.json({
      success: true,
      message: '統計信息獲取成功',
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
    logger.error('獲取預測統計錯誤:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取統計信息失敗',
      code: 'STATISTICS_FETCH_FAILED',
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
      throw new Error('預測模型未正確初始化');
    }

    const prediction = await PredictionModel.findByPk(predictionId);
    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: '預測記錄不存在',
        code: 'PREDICTION_NOT_FOUND',
      });
    }

    // 軟刪除
    await prediction.update({ isActive: false });

    logger.info(
      `刪除預測記錄: 用戶 ${req.user.username} 刪除預測 ${predictionId}`
    );

    res.json({
      success: true,
      message: '預測記錄刪除成功',
    });
  } catch (error) {
    logger.error('刪除預測記錄錯誤:', error);
    res.status(500).json({
      success: false,
      message: error.message || '刪除預測記錄失敗',
      code: 'PREDICTION_DELETE_FAILED',
    });
  }
});

module.exports = router;

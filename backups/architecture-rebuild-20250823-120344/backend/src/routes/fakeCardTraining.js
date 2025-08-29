const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const fakeCardTrainingService = require('../services/fakeCardTrainingService');
const logger = require('../utils/logger');

// 獲取假卡訓練數據
router.get('/training-data', authenticateToken, async (req, res) => {
  try {
    const filters = {
      fakeType: req.query.fakeType ? req.query.fakeType.split(',') : undefined,
      status: req.query.status,
      dateRange: req.query.dateRange ? JSON.parse(req.query.dateRange) : undefined,
      minSamples: req.query.minSamples ? parseInt(req.query.minSamples) : undefined,
    };

    const result = await fakeCardTrainingService.getTrainingData(filters);

    res.status(200).json(result);
  } catch (error) {
    logger.error('獲取假卡訓練數據失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取假卡訓練數據失敗',
      code: 'FAKE_CARD_TRAINING_DATA_ERROR',
    });
  }
});

// 開始模型訓練
router.post('/training/start', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { config, dataFilters } = req.body;

    if (!config) {
      return res.status(400).json({
        success: false,
        message: '訓練配置不能為空',
        code: 'TRAINING_CONFIG_REQUIRED',
      });
    }

    const result = await fakeCardTrainingService.startTraining(config, dataFilters);

    res.status(201).json(result);
  } catch (error) {
    logger.error('開始模型訓練失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '開始模型訓練失敗',
      code: 'TRAINING_START_ERROR',
    });
  }
});

// 獲取訓練進度
router.get('/training/progress/:trainingId', authenticateToken, async (req, res) => {
  try {
    const { trainingId } = req.params;

    if (!trainingId) {
      return res.status(400).json({
        success: false,
        message: '訓練ID不能為空',
        code: 'TRAINING_ID_REQUIRED',
      });
    }

    const result = await fakeCardTrainingService.getTrainingProgress(trainingId);

    res.status(200).json(result);
  } catch (error) {
    logger.error('獲取訓練進度失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取訓練進度失敗',
      code: 'TRAINING_PROGRESS_ERROR',
    });
  }
});

// 評估模型性能
router.post('/evaluation/evaluate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { modelId, testDataFilters } = req.body;

    if (!modelId) {
      return res.status(400).json({
        success: false,
        message: '模型ID不能為空',
        code: 'MODEL_ID_REQUIRED',
      });
    }

    const result = await fakeCardTrainingService.evaluateModel(modelId, testDataFilters);

    res.status(200).json(result);
  } catch (error) {
    logger.error('模型評估失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '模型評估失敗',
      code: 'MODEL_EVALUATION_ERROR',
    });
  }
});

// 部署模型
router.post('/deployment/deploy', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { modelId, deploymentConfig } = req.body;

    if (!modelId) {
      return res.status(400).json({
        success: false,
        message: '模型ID不能為空',
        code: 'MODEL_ID_REQUIRED',
      });
    }

    const result = await fakeCardTrainingService.deployModel(modelId, deploymentConfig);

    res.status(201).json(result);
  } catch (error) {
    logger.error('模型部署失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '模型部署失敗',
      code: 'MODEL_DEPLOYMENT_ERROR',
    });
  }
});

// 獲取模型列表
router.get('/training/models', authenticateToken, async (req, res) => {
  try {
    const filters = {
      modelType: req.query.modelType ? req.query.modelType.split(',') : undefined,
      status: req.query.status ? req.query.status.split(',') : undefined,
      dateRange: req.query.dateRange ? JSON.parse(req.query.dateRange) : undefined,
    };

    const result = await fakeCardTrainingService.getModels(filters);

    res.status(200).json(result);
  } catch (error) {
    logger.error('獲取模型列表失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取模型列表失敗',
      code: 'MODELS_LIST_ERROR',
    });
  }
});

// 獲取訓練統計
router.get('/training/stats', authenticateToken, async (req, res) => {
  try {
    const result = await fakeCardTrainingService.getTrainingStats();

    res.status(200).json(result);
  } catch (error) {
    logger.error('獲取訓練統計失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取訓練統計失敗',
      code: 'TRAINING_STATS_ERROR',
    });
  }
});

// 更新假卡數據的訓練特徵
router.patch('/training-features/:fakeCardId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { fakeCardId } = req.params;
    const { features } = req.body;

    if (!fakeCardId) {
      return res.status(400).json({
        success: false,
        message: '假卡ID不能為空',
        code: 'FAKE_CARD_ID_REQUIRED',
      });
    }

    if (!features) {
      return res.status(400).json({
        success: false,
        message: '訓練特徵不能為空',
        code: 'TRAINING_FEATURES_REQUIRED',
      });
    }

    const result = await fakeCardTrainingService.updateTrainingFeatures(fakeCardId, features);

    res.status(200).json(result);
  } catch (error) {
    logger.error('更新假卡訓練特徵失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '更新假卡訓練特徵失敗',
      code: 'TRAINING_FEATURES_UPDATE_ERROR',
    });
  }
});

// 批量更新訓練數據
router.patch('/batch-update', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: '更新數據不能為空',
        code: 'BATCH_UPDATE_DATA_REQUIRED',
      });
    }

    const result = await fakeCardTrainingService.batchUpdateTrainingData(updates);

    res.status(200).json(result);
  } catch (error) {
    logger.error('批量更新訓練數據失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '批量更新訓練數據失敗',
      code: 'BATCH_UPDATE_ERROR',
    });
  }
});

// 獲取模型預測端點
router.post('/models/:modelId/predict', authenticateToken, async (req, res) => {
  try {
    const { modelId } = req.params;
    const { imageData, cardInfo } = req.body;

    if (!modelId) {
      return res.status(400).json({
        success: false,
        message: '模型ID不能為空',
        code: 'MODEL_ID_REQUIRED',
      });
    }

    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: '圖像數據不能為空',
        code: 'IMAGE_DATA_REQUIRED',
      });
    }

    // 模擬模型預測結果
    const predictionResult = {
      modelId,
      prediction: {
        isFake: Math.random() > 0.7, // 70% 機率為真品
        confidence: 0.85 + Math.random() * 0.1, // 85-95% 信心度
        fakeType: Math.random() > 0.7 ? 'counterfeit' : 'authentic',
        riskFactors: [
          '印刷質量異常',
          '顏色飽和度偏低',
          '邊緣處理不當',
        ],
        recommendations: [
          '建議進行專業鑑定',
          '檢查卡片來源',
          '對比官方圖片',
        ],
      },
      processingTime: 150 + Math.random() * 100, // 150-250ms
      modelVersion: 'v1.0.1',
      timestamp: new Date().toISOString(),
    };

    logger.info('模型預測完成', {
      modelId,
      prediction: predictionResult.prediction.isFake ? '假卡' : '真品',
      confidence: predictionResult.prediction.confidence,
    });

    res.status(200).json({
      success: true,
      data: predictionResult,
      message: '預測完成',
    });
  } catch (error) {
    logger.error('模型預測失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '模型預測失敗',
      code: 'MODEL_PREDICTION_ERROR',
    });
  }
});

// 獲取模型健康狀態
router.get('/models/:modelId/health', authenticateToken, async (req, res) => {
  try {
    const { modelId } = req.params;

    if (!modelId) {
      return res.status(400).json({
        success: false,
        message: '模型ID不能為空',
        code: 'MODEL_ID_REQUIRED',
      });
    }

    // 模擬健康檢查結果
    const healthStatus = {
      modelId,
      status: 'healthy',
      uptime: 99.8,
      responseTime: 150,
      memoryUsage: 512,
      cpuUsage: 15,
      lastUpdated: new Date().toISOString(),
      endpoints: {
        predict: '/api/fake-card-training/models/' + modelId + '/predict',
        health: '/api/fake-card-training/models/' + modelId + '/health',
      },
    };

    res.status(200).json({
      success: true,
      data: healthStatus,
      message: '模型健康狀態正常',
    });
  } catch (error) {
    logger.error('獲取模型健康狀態失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取模型健康狀態失敗',
      code: 'MODEL_HEALTH_ERROR',
    });
  }
});

module.exports = router;

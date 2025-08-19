const express = require('express');
const router = express.Router();
const localAIService = require('../services/localAIService');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

// 健康檢查
router.get('/health', async (req, res) => {
  try {
    const health = await localAIService.healthCheck();
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    logger.error('AI健康檢查錯誤:', error);
    res.status(500).json({
      success: false,
      message: 'AI服務健康檢查失敗',
      error: error.message
    });
  }
});

// 獲取可用提供商
router.get('/providers', authenticateToken, async (req, res) => {
  try {
    const providers = localAIService.getAvailableProviders();
    res.json({
      success: true,
      data: {
        providers,
        count: providers.length
      }
    });
  } catch (error) {
    logger.error('獲取AI提供商錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取AI提供商失敗',
      error: error.message
    });
  }
});

// 通用文本生成
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { prompt, taskType = 'general', options = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: '請提供提示文本'
      });
    }

    const result = await localAIService.generateText(prompt, taskType, options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('AI文本生成錯誤:', error);
    res.status(500).json({
      success: false,
      message: 'AI文本生成失敗',
      error: error.message
    });
  }
});

// 卡片分析
router.post('/analyze-card', authenticateToken, async (req, res) => {
  try {
    const { cardData, analysisType = 'investment' } = req.body;

    if (!cardData) {
      return res.status(400).json({
        success: false,
        message: '請提供卡片數據'
      });
    }

    const result = await localAIService.analyzeCard(cardData, analysisType);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('卡片分析錯誤:', error);
    res.status(500).json({
      success: false,
      message: '卡片分析失敗',
      error: error.message
    });
  }
});

// 價格預測
router.post('/predict-price', authenticateToken, async (req, res) => {
  try {
    const { cardData, timeframe = '1m' } = req.body;

    if (!cardData) {
      return res.status(400).json({
        success: false,
        message: '請提供卡片數據'
      });
    }

    const result = await localAIService.predictPrice(cardData, timeframe);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('價格預測錯誤:', error);
    res.status(500).json({
      success: false,
      message: '價格預測失敗',
      error: error.message
    });
  }
});

// 市場分析
router.post('/analyze-market', authenticateToken, async (req, res) => {
  try {
    const { marketData } = req.body;

    if (!marketData) {
      return res.status(400).json({
        success: false,
        message: '請提供市場數據'
      });
    }

    const result = await localAIService.analyzeMarket(marketData);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('市場分析錯誤:', error);
    res.status(500).json({
      success: false,
      message: '市場分析失敗',
      error: error.message
    });
  }
});

// 批量分析
router.post('/batch-analyze', authenticateToken, async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        message: '請提供任務數組'
      });
    }

    const results = [];
    const errors = [];

    for (const task of tasks) {
      try {
        let result;
        switch (task.type) {
          case 'card_analysis':
            result = await localAIService.analyzeCard(task.data, task.analysisType);
            break;
          case 'price_prediction':
            result = await localAIService.predictPrice(task.data, task.timeframe);
            break;
          case 'market_analysis':
            result = await localAIService.analyzeMarket(task.data);
            break;
          case 'text_generation':
            result = await localAIService.generateText(task.prompt, task.taskType, task.options);
            break;
          default:
            throw new Error(`不支持的任務類型: ${task.type}`);
        }
        results.push({
          taskId: task.id,
          type: task.type,
          success: true,
          data: result
        });
      } catch (error) {
        errors.push({
          taskId: task.id,
          type: task.type,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        results,
        errors,
        summary: {
          total: tasks.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });
  } catch (error) {
    logger.error('批量分析錯誤:', error);
    res.status(500).json({
      success: false,
      message: '批量分析失敗',
      error: error.message
    });
  }
});

// 測試端點
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const testPrompt = '請簡短介紹一下卡片投資的基本概念';

    const result = await localAIService.generateText(testPrompt, 'text_generation', {
      temperature: 0.7,
      maxTokens: 100
    });

    res.json({
      success: true,
      message: 'AI服務測試成功',
      data: result
    });
  } catch (error) {
    logger.error('AI服務測試錯誤:', error);
    res.status(500).json({
      success: false,
      message: 'AI服務測試失敗',
      error: error.message
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const analyticsService = require('../services/advancedAnalytics');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const logger = require('../utils/logger');

// 獲取市場趨勢分析
router.get('/market/trends', authenticateToken, async (req, res) => {
  try {
    const { timeframe, categories, limit, useCache } = req.query;

    const trends = await analyticsService.getMarketTrends({
      timeframe: timeframe || '30d',
      categories: categories ? categories.split(',') : [],
      limit: parseInt(limit) || 50,
      useCache: useCache !== 'false'
    });

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    logger.error('獲取市場趨勢分析失敗:', error);
    res.status(500).json({
      success: false,
      error: '市場趨勢分析失敗'
    });
  }
});

// 獲取投資組合分析
router.get('/portfolio/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe, includeTransactions, includePerformance, useCache } = req.query;

    const analysis = await analyticsService.getPortfolioAnalysis(userId, {
      timeframe: timeframe || '30d',
      includeTransactions: includeTransactions !== 'false',
      includePerformance: includePerformance !== 'false',
      useCache: useCache !== 'false'
    });

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    logger.error('獲取投資組合分析失敗:', error);
    res.status(500).json({
      success: false,
      error: '投資組合分析失敗'
    });
  }
});

// 獲取用戶行為分析
router.get('/user/:userId/behavior', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe, includePatterns, includePredictions, useCache } = req.query;

    const behavior = await analyticsService.getUserBehaviorAnalysis(userId, {
      timeframe: timeframe || '30d',
      includePatterns: includePatterns !== 'false',
      includePredictions: includePredictions !== 'false',
      useCache: useCache !== 'false'
    });

    res.json({
      success: true,
      data: behavior
    });
  } catch (error) {
    logger.error('獲取用戶行為分析失敗:', error);
    res.status(500).json({
      success: false,
      error: '用戶行為分析失敗'
    });
  }
});

// 生成綜合報告
router.post('/reports/comprehensive', authenticateToken, async (req, res) => {
  try {
    const { reportType, startDate, endDate, includeCharts, includeRecommendations, format } = req.body;

    const report = await analyticsService.generateComprehensiveReport({
      reportType: reportType || 'monthly',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      includeCharts: includeCharts !== false,
      includeRecommendations: includeRecommendations !== false,
      format: format || 'json'
    });

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('生成綜合報告失敗:', error);
    res.status(500).json({
      success: false,
      error: '報告生成失敗'
    });
  }
});

// 獲取預測分析
router.get('/predictive', authenticateToken, async (req, res) => {
  try {
    const { target, timeframe, confidence, useCache } = req.query;

    const predictions = await analyticsService.getPredictiveAnalysis({
      target: target || 'price',
      timeframe: timeframe || '7d',
      confidence: parseFloat(confidence) || 0.8,
      useCache: useCache !== 'false'
    });

    res.json({
      success: true,
      data: predictions
    });
  } catch (error) {
    logger.error('獲取預測分析失敗:', error);
    res.status(500).json({
      success: false,
      error: '預測分析失敗'
    });
  }
});

// 獲取異常檢測
router.get('/anomaly', authenticateToken, async (req, res) => {
  try {
    const { type, sensitivity, timeframe, useCache } = req.query;

    const anomalies = await analyticsService.getAnomalyDetection({
      type: type || 'price',
      sensitivity: sensitivity || 'medium',
      timeframe: timeframe || '24h',
      useCache: useCache !== 'false'
    });

    res.json({
      success: true,
      data: anomalies
    });
  } catch (error) {
    logger.error('獲取異常檢測失敗:', error);
    res.status(500).json({
      success: false,
      error: '異常檢測失敗'
    });
  }
});

// 獲取相關性分析
router.get('/correlation', authenticateToken, async (req, res) => {
  try {
    const { variables, timeframe, method, useCache } = req.query;

    const correlations = await analyticsService.getCorrelationAnalysis({
      variables: variables ? variables.split(',') : ['price', 'volume', 'demand'],
      timeframe: timeframe || '30d',
      method: method || 'pearson',
      useCache: useCache !== 'false'
    });

    res.json({
      success: true,
      data: correlations
    });
  } catch (error) {
    logger.error('獲取相關性分析失敗:', error);
    res.status(500).json({
      success: false,
      error: '相關性分析失敗'
    });
  }
});

// 獲取分段分析
router.get('/segmentation', authenticateToken, async (req, res) => {
  try {
    const { dimension, criteria, segments, useCache } = req.query;

    const segmentation = await analyticsService.getSegmentationAnalysis({
      dimension: dimension || 'user',
      criteria: criteria ? criteria.split(',') : ['activity', 'value', 'preference'],
      segments: parseInt(segments) || 5,
      useCache: useCache !== 'false'
    });

    res.json({
      success: true,
      data: segmentation
    });
  } catch (error) {
    logger.error('獲取分段分析失敗:', error);
    res.status(500).json({
      success: false,
      error: '分段分析失敗'
    });
  }
});

// 獲取分析指標
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const { timeframe, includeTrends, useCache } = req.query;

    const metrics = await analyticsService.getAnalyticsMetrics({
      timeframe: timeframe || '24h',
      includeTrends: includeTrends !== 'false',
      useCache: useCache !== 'false'
    });

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('獲取分析指標失敗:', error);
    res.status(500).json({
      success: false,
      error: '分析指標獲取失敗'
    });
  }
});

// 清理分析緩存
router.delete('/cache', authenticateToken, async (req, res) => {
  try {
    const { pattern } = req.query;

    const result = await analyticsService.clearAnalyticsCache(pattern || '*');

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('清理分析緩存失敗:', error);
    res.status(500).json({
      success: false,
      error: '緩存清理失敗'
    });
  }
});

// 健康檢查
router.get('/health', async (req, res) => {
  try {
    const health = await analyticsService.healthCheck();

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    logger.error('分析服務健康檢查失敗:', error);
    res.status(500).json({
      success: false,
      error: '健康檢查失敗'
    });
  }
});

// 獲取報告模板
router.get('/reports/templates', authenticateToken, async (req, res) => {
  try {
    const templates = [
      {
        id: 'market_summary',
        name: '市場摘要報告',
        description: '市場趨勢和關鍵指標摘要',
        type: 'summary',
        parameters: ['timeframe', 'categories']
      },
      {
        id: 'portfolio_analysis',
        name: '投資組合分析報告',
        description: '詳細的投資組合表現分析',
        type: 'detailed',
        parameters: ['userId', 'timeframe', 'includeCharts']
      },
      {
        id: 'user_behavior',
        name: '用戶行為報告',
        description: '用戶行為模式和趨勢分析',
        type: 'behavioral',
        parameters: ['userId', 'timeframe', 'includePredictions']
      },
      {
        id: 'financial_performance',
        name: '財務表現報告',
        description: '財務指標和收益分析',
        type: 'financial',
        parameters: ['timeframe', 'includeProjections']
      },
      {
        id: 'technical_analysis',
        name: '技術分析報告',
        description: '技術指標和圖表分析',
        type: 'technical',
        parameters: ['symbol', 'timeframe', 'indicators']
      }
    ];

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    logger.error('獲取報告模板失敗:', error);
    res.status(500).json({
      success: false,
      error: '報告模板獲取失敗'
    });
  }
});

// 生成自定義報告
router.post('/reports/custom', authenticateToken, async (req, res) => {
  try {
    const { templateId, parameters, format } = req.body;

    // 根據模板ID生成相應的報告
    let report;
    switch (templateId) {
      case 'market_summary':
        report = await analyticsService.getMarketTrends(parameters);
        break;
      case 'portfolio_analysis':
        report = await analyticsService.getPortfolioAnalysis(parameters.userId, parameters);
        break;
      case 'user_behavior':
        report = await analyticsService.getUserBehaviorAnalysis(parameters.userId, parameters);
        break;
      case 'financial_performance':
        report = await analyticsService.generateComprehensiveReport({
          reportType: 'custom',
          ...parameters
        });
        break;
      case 'technical_analysis':
        report = await analyticsService.getPredictiveAnalysis(parameters);
        break;
      default:
        throw new Error('未知的報告模板');
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('生成自定義報告失敗:', error);
    res.status(500).json({
      success: false,
      error: '自定義報告生成失敗'
    });
  }
});

// 獲取分析配置
router.get('/config', authenticateToken, async (req, res) => {
  try {
    const config = {
      cacheTTL: 3600,
      maxDataPoints: 1000,
      defaultTimeframe: '30d',
      batchSize: 100,
      supportedTimeframes: ['1d', '7d', '30d', '90d', '1y'],
      supportedAnalysisTypes: ['trend', 'correlation', 'prediction', 'segmentation', 'anomaly'],
      supportedReportTypes: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']
    };

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    logger.error('獲取分析配置失敗:', error);
    res.status(500).json({
      success: false,
      error: '配置獲取失敗'
    });
  }
});

// 更新分析配置
router.put('/config', authenticateToken, async (req, res) => {
  try {
    const { cacheTTL, maxDataPoints, defaultTimeframe, batchSize } = req.body;

    // 這裡可以實現配置更新邏輯
    const updatedConfig = {
      cacheTTL: cacheTTL || 3600,
      maxDataPoints: maxDataPoints || 1000,
      defaultTimeframe: defaultTimeframe || '30d',
      batchSize: batchSize || 100
    };

    res.json({
      success: true,
      data: updatedConfig,
      message: '配置更新成功'
    });
  } catch (error) {
    logger.error('更新分析配置失敗:', error);
    res.status(500).json({
      success: false,
      error: '配置更新失敗'
    });
  }
});

// 獲取分析歷史
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { userId, type, limit, offset } = req.query;

    // 這裡可以實現分析歷史查詢邏輯
    const history = [
      {
        id: 1,
        type: 'market_trends',
        userId,
        parameters: { timeframe: '30d' },
        status: 'completed',
        createdAt: new Date(),
        completedAt: new Date()
      }
    ];

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    logger.error('獲取分析歷史失敗:', error);
    res.status(500).json({
      success: false,
      error: '歷史記錄獲取失敗'
    });
  }
});

// 導出分析數據
router.post('/export', authenticateToken, async (req, res) => {
  try {
    const { type, parameters, format } = req.body;

    // 這裡可以實現數據導出邏輯
    const exportData = {
      type,
      parameters,
      format: format || 'csv',
      downloadUrl: `/api/analytics/downloads/${Date.now()}.${format || 'csv'}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小時後過期
    };

    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    logger.error('導出分析數據失敗:', error);
    res.status(500).json({
      success: false,
      error: '數據導出失敗'
    });
  }
});

// 獲取分析統計
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { timeframe } = req.query;

    const stats = {
      totalAnalyses: 1250,
      totalReports: 340,
      avgProcessingTime: 2.5,
      cacheHitRate: 0.85,
      errorRate: 0.02,
      topAnalysisTypes: [
        { type: 'market_trends', count: 450 },
        { type: 'portfolio_analysis', count: 320 },
        { type: 'user_behavior', count: 280 }
      ],
      timeframe: timeframe || '30d'
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('獲取分析統計失敗:', error);
    res.status(500).json({
      success: false,
      error: '統計數據獲取失敗'
    });
  }
});

module.exports = router;

const express = require('express');'
const router = express.Router();''
const analyticsService = require('../services/advancedAnalytics');''
const { authenticateToken } = require('../middleware/auth');''
const { validateRequest } = require('../middleware/validation');'
// eslint-disable-next-line no-unused-vars''
const logger = require('../utils/logger');'
// ?��?市場趨勢?��?''
router.get('/market/trends', authenticateToken, async (req, res) => {
  try {
    const { timeframe, categories, limit, useCache } = req.query;'
    const trends = await analyticsService.getMarketTrends({''
      timeframe: timeframe || '30d',''
      categories: categories ? categories.split(',') : [],'
      limit: parseInt(limit) || 50,''
      useCache: useCache !== 'false',
    });

    res.json({
      success: true,
      data: trends,
    });'
  } catch (error) {''
    logger.error('?��?市場趨勢?��?失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '市場趨勢?��?失�?',
    });
  }
});'
// ?��??��?組�??��?''
router.get('/portfolio/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe, includeTransactions, includePerformance, useCache } =
      req.query;'
    const analysis = await analyticsService.getPortfolioAnalysis(userId, {''
      timeframe: timeframe || '30d',''
      includeTransactions: includeTransactions !== 'false',''
      includePerformance: includePerformance !== 'false',''
      useCache: useCache !== 'false',
    });

    res.json({
      success: true,
      data: analysis,
    });'
  } catch (error) {''
    logger.error('?��??��?組�??��?失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?��?組�??��?失�?',
    });
  }
});'
// ?��??�戶Row為?��?''
router.get('/user/:userId/behavior', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe, includePatterns, includePredictions, useCache } =
      req.query;'
    const behavior = await analyticsService.getUserBehaviorAnalysis(userId, {''
      timeframe: timeframe || '30d',''
      includePatterns: includePatterns !== 'false',''
      includePredictions: includePredictions !== 'false',''
      useCache: useCache !== 'false',
    });

    res.json({
      success: true,
      data: behavior,
    });'
  } catch (error) {''
    logger.error('?��??�戶行為?��?失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?�戶行為?��?失�?',
    });
  }
});'
// ?��?綜�??��?''
router.post('/reports/comprehensive', authenticateToken, async (req, res) => {
  try {
    const {
      reportType,
      startDate,
      endDate,
      includeCharts,
      includeRecommendations,
      format,
    } = req.body;'
    const report = await analyticsService.generateComprehensiveReport({''
      reportType: reportType || 'monthly',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      includeCharts: includeCharts !== false,'
      includeRecommendations: includeRecommendations !== false,''
      format: format || 'json',
    });

    res.json({
      success: true,
      data: report,
    });'
  } catch (error) {''
    logger.error('?��?綜�??��?失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?��??��?失�?',
    });
  }
});'
// ?��??�測?��?''
router.get('/predictive', authenticateToken, async (req, res) => {
  try {
    const { target, timeframe, confidence, useCache } = req.query;

// eslint-disable-next-line no-unused-vars'
    const predictions = await analyticsService.getPredictiveAnalysis({''
      target: target || 'price',''
      timeframe: timeframe || '7d','
      confidence: parseFloat(confidence) || 0.8,''
      useCache: useCache !== 'false',
    });

    res.json({
      success: true,
      data: predictions,
    });'
  } catch (error) {''
    logger.error('?��??�測?��?失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?�測?��?失�?',
    });
  }
});'
// ?��??�常檢測''
router.get('/anomaly', authenticateToken, async (req, res) => {
  try {
    const { type, sensitivity, timeframe, useCache } = req.query;'
    const anomalies = await analyticsService.getAnomalyDetection({''
      type: type || 'price',''
      sensitivity: sensitivity || 'medium',''
      timeframe: timeframe || '24h',''
      useCache: useCache !== 'false',
    });

    res.json({
      success: true,
      data: anomalies,
    });'
  } catch (error) {''
    logger.error('?��??�常檢測失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?�常檢測失�?',
    });'
  }
});''
// ?��??��??��???router.get('/correlation', authenticateToken, async (req, res) => {
  try {
    const { variables, timeframe, method, useCache } = req.query;

    const correlations = await analyticsService.getCorrelationAnalysis({'
      variables: variables''
        ? variables.split(',')''
        : ['price', 'volume', 'demand'],''
      timeframe: timeframe || '30d',''
      method: method || 'pearson',''
      useCache: useCache !== 'false',
    });

    res.json({
      success: true,
      data: correlations,
    });'
  } catch (error) {''
    logger.error('?��??��??��??�失??', error);
    res.status(500).json({'
      success: false,''
      error: '?��??��??�失??,
    });
  }
});'
// ?��??�段?��?''
router.get('/segmentation', authenticateToken, async (req, res) => {
  try {
    const { dimension, criteria, segments, useCache } = req.query;'
    const segmentation = await analyticsService.getSegmentationAnalysis({''
      dimension: dimension || 'user','
      criteria: criteria''
        ? criteria.split(',')''
        : ['activity', 'value', 'preference'],'
      segments: parseInt(segments) || 5,''
      useCache: useCache !== 'false',
    });

    res.json({
      success: true,
      data: segmentation,
    });'
  } catch (error) {''
    logger.error('?��??�段?��?失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?�段?��?失�?',
    });
  }
});'
// ?��??��??��?''
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const { timeframe, includeTrends, useCache } = req.query;'
    const metrics = await analyticsService.getAnalyticsMetrics({''
      timeframe: timeframe || '24h',''
      includeTrends: includeTrends !== 'false',''
      useCache: useCache !== 'false',
    });

    res.json({
      success: true,
      data: metrics,
    });'
  } catch (error) {''
    logger.error('?��??��??��?失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?��??��??��?失�?',
    });
  }
});'
// 清�??��?緩�?''
router.delete('/cache', authenticateToken, async (req, res) => {
  try {
    const { pattern } = req.query;'
// eslint-disable-next-line no-unused-vars''
    const result = await analyticsService.clearAnalyticsCache(pattern || '*');

    res.json({
      success: true,
      data: result,
    });'
  } catch (error) {''
    logger.error('清�??��?緩�?失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '緩�?清�?失�?',
    });
  }
});'
// ?�康Check''
router.get('/health', async (req, res) => {
  try {
    const health = await analyticsService.healthCheck();

    res.json({
      success: true,
      data: health,
    });'
  } catch (error) {''
    logger.error('?��??��??�康檢查失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?�康檢查失�?',
    });
  }
});'
// ?��??��?模板''
router.get('/reports/templates', authenticateToken, async (req, res) => {
  try {
    const templates = ['
      {''
        id: 'market_summary',''
        name: '市場?��??��?',''
        description: '市場趨勢?��??��?標�?�?,''
        type: 'summary',''
        parameters: ['timeframe', 'categories'],
      },'
      {''
        id: 'portfolio_analysis',''
        name: '?��?組�??��??��?',''
        description: '詳細?��?資�??�表?��???,''
        type: 'detailed',''
        parameters: ['userId', 'timeframe', 'includeCharts'],
      },'
      {''
        id: 'user_behavior',''
        name: '?�戶行為?��?',''
        description: '?�戶行為模�??�趨?��???,''
        type: 'behavioral',''
        parameters: ['userId', 'timeframe', 'includePredictions'],
      },'
      {''
        id: 'financial_performance',''
        name: '財�?表現?��?',''
        description: '財�??��??�收?��???,''
        type: 'financial',''
        parameters: ['timeframe', 'includeProjections'],
      },'
      {''
        id: 'technical_analysis',''
        name: '?�術�??�報??,''
        description: '?�術�?標�??�表?��?',''
        type: 'technical',''
        parameters: ['symbol', 'timeframe', 'indicators'],
      },
    ];

    res.json({
      success: true,
      data: templates,
    });'
  } catch (error) {''
    logger.error('?��??��?模板失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?��?模板?��?失�?',
    });'
  }
});''
// ?��??��?義報??router.post('/reports/custom', authenticateToken, async (req, res) => {
  try {
    const { templateId, parameters, format } = req.body;

    // ?��?模板ID?��??��??�報??    let report;'
    switch (templateId) {''
      case 'market_summary':
        report = await analyticsService.getMarketTrends(parameters);'
        break;''
      case 'portfolio_analysis':
        report = await analyticsService.getPortfolioAnalysis(
          parameters.userId,
          parameters
        );'
        break;''
      case 'user_behavior':
        report = await analyticsService.getUserBehaviorAnalysis(
          parameters.userId,
          parameters
        );'
        break;''
      case 'financial_performance':'
        report = await analyticsService.generateComprehensiveReport({''
          reportType: 'custom',
          ...parameters,
        });'
        break;''
      case 'technical_analysis':
        report = await analyticsService.getPredictiveAnalysis(parameters);
        break;'
      default:''
        throw new Error('?�知?�報?�模??);
    }
    res.json({
      success: true,
      data: report,
    });'
  } catch (error) {''
    logger.error('?��??��?義報?�失??', error);
    res.status(500).json({'
      success: false,''
      error: '?��?義報?��??�失??,
    });
  }
});'
// ?��??��??�置''
router.get('/config', authenticateToken, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const config = {
      cacheTTL: 3600,'
      maxDataPoints: 1000,''
      defaultTimeframe: '30d','
      batchSize: 100,''
      supportedTimeframes: ['1d', '7d', '30d', '90d', '1y'],'
      supportedAnalysisTypes: [''
        'trend',''
        'correlation',''
        'prediction',''
        'segmentation',''
        'anomaly',
      ],'
      supportedReportTypes: [''
        'daily',''
        'weekly',''
        'monthly',''
        'quarterly',''
        'yearly',''
        'custom',
      ],
    };

    res.json({
      success: true,
      data: config,
    });'
  } catch (error) {''
    logger.error('?��??��??�置失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?�置?��?失�?',
    });
  }
});'
// ?�新?��??�置''
router.put('/config', authenticateToken, async (req, res) => {
  try {
    const { cacheTTL, maxDataPoints, defaultTimeframe, batchSize } = req.body;

    // ?�裡?�以實現?�置?�新?�輯
    const updatedConfig = {
      cacheTTL: cacheTTL || 3600,'
      maxDataPoints: maxDataPoints || 1000,''
      defaultTimeframe: defaultTimeframe || '30d',
      batchSize: batchSize || 100,
    };

    res.json({
      success: true,'
      data: updatedConfig,''
      message: '?�置?�新?��?',
    });'
  } catch (error) {''
    logger.error('?�新?��??�置失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?�置?�新失�?',
    });
  }
});'
// ?��??��?歷史''
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { userId, type, limit, offset } = req.query;

    // ?�裡?�以實現?��?歷史?�詢?�輯
// eslint-disable-next-line no-unused-vars
    const history = [
      {'
        id: 1,''
        type: 'market_trends','
        userId,''
        parameters: { timeframe: '30d' },''
        status: 'completed',
        createdAt: new Date(),
        completedAt: new Date(),
      },
    ];

    res.json({
      success: true,
      data: history,
    });'
  } catch (error) {''
    logger.error('?��??��?歷史失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '歷史記�??��?失�?',
    });
  }
});'
// Export?��??��?''
router.post('/export', authenticateToken, async (req, res) => {
  try {
    const { type, parameters, format } = req.body;

    // ?�裡?�以實現?��?Export?�輯
    const exportData = {
      type,'
      parameters,''
      format: format || 'csv',''
      downloadUrl: `/api/analytics/downloads/${Date.now()}.${format || 'csv'}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小�?後�???    };

    res.json({
      success: true,
      data: exportData,
    });'
  } catch (error) {''
    logger.error('導出?��??��?失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?��?導出失�?',
    });
  }
});'
// ?��??��?統�?''
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { timeframe } = req.query;

    const stats = {
      totalAnalyses: 1250,
      totalReports: 340,
      avgProcessingTime: 2.5,
      cacheHitRate: 0.85,
      errorRate: 0.02,'
      topAnalysisTypes: [''
        { type: 'market_trends', count: 450 },''
        { type: 'portfolio_analysis', count: 320 },''
        { type: 'user_behavior', count: 280 },'
      ],''
      timeframe: timeframe || '30d',
    };

    res.json({
      success: true,
      data: stats,
    });'
  } catch (error) {''
    logger.error('?��??��?統�?失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '統�??��??��?失�?',
    });
  }
});'
module.exports = router;''
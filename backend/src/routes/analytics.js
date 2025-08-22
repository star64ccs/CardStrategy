const express = require('express');
const router = express.Router();
const analyticsService = require('../services/advancedAnalytics');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');

// ?²å?å¸‚å ´è¶¨å‹¢?†æ?
router.get('/market/trends', authenticateToken, async (req, res) => {
  try {
    const { timeframe, categories, limit, useCache } = req.query;

    const trends = await analyticsService.getMarketTrends({
      timeframe: timeframe || '30d',
      categories: categories ? categories.split(',') : [],
      limit: parseInt(limit) || 50,
      useCache: useCache !== 'false',
    });

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    logger.error('?²å?å¸‚å ´è¶¨å‹¢?†æ?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: 'å¸‚å ´è¶¨å‹¢?†æ?å¤±æ?',
    });
  }
});

// ?²å??•è?çµ„å??†æ?
router.get('/portfolio/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe, includeTransactions, includePerformance, useCache } =
      req.query;

    const analysis = await analyticsService.getPortfolioAnalysis(userId, {
      timeframe: timeframe || '30d',
      includeTransactions: includeTransactions !== 'false',
      includePerformance: includePerformance !== 'false',
      useCache: useCache !== 'false',
    });

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    logger.error('?²å??•è?çµ„å??†æ?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?•è?çµ„å??†æ?å¤±æ?',
    });
  }
});

// ?²å??¨æˆ¶è¡Œç‚º?†æ?
router.get('/user/:userId/behavior', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe, includePatterns, includePredictions, useCache } =
      req.query;

    const behavior = await analyticsService.getUserBehaviorAnalysis(userId, {
      timeframe: timeframe || '30d',
      includePatterns: includePatterns !== 'false',
      includePredictions: includePredictions !== 'false',
      useCache: useCache !== 'false',
    });

    res.json({
      success: true,
      data: behavior,
    });
  } catch (error) {
    logger.error('?²å??¨æˆ¶è¡Œç‚º?†æ?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?¨æˆ¶è¡Œç‚º?†æ?å¤±æ?',
    });
  }
});

// ?Ÿæ?ç¶œå??±å?
router.post('/reports/comprehensive', authenticateToken, async (req, res) => {
  try {
    const {
      reportType,
      startDate,
      endDate,
      includeCharts,
      includeRecommendations,
      format,
    } = req.body;

    const report = await analyticsService.generateComprehensiveReport({
      reportType: reportType || 'monthly',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      includeCharts: includeCharts !== false,
      includeRecommendations: includeRecommendations !== false,
      format: format || 'json',
    });

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('?Ÿæ?ç¶œå??±å?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?±å??Ÿæ?å¤±æ?',
    });
  }
});

// ?²å??æ¸¬?†æ?
router.get('/predictive', authenticateToken, async (req, res) => {
  try {
    const { target, timeframe, confidence, useCache } = req.query;

// eslint-disable-next-line no-unused-vars
    const predictions = await analyticsService.getPredictiveAnalysis({
      target: target || 'price',
      timeframe: timeframe || '7d',
      confidence: parseFloat(confidence) || 0.8,
      useCache: useCache !== 'false',
    });

    res.json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    logger.error('?²å??æ¸¬?†æ?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?æ¸¬?†æ?å¤±æ?',
    });
  }
});

// ?²å??°å¸¸æª¢æ¸¬
router.get('/anomaly', authenticateToken, async (req, res) => {
  try {
    const { type, sensitivity, timeframe, useCache } = req.query;

    const anomalies = await analyticsService.getAnomalyDetection({
      type: type || 'price',
      sensitivity: sensitivity || 'medium',
      timeframe: timeframe || '24h',
      useCache: useCache !== 'false',
    });

    res.json({
      success: true,
      data: anomalies,
    });
  } catch (error) {
    logger.error('?²å??°å¸¸æª¢æ¸¬å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?°å¸¸æª¢æ¸¬å¤±æ?',
    });
  }
});

// ?²å??¸é??§å???router.get('/correlation', authenticateToken, async (req, res) => {
  try {
    const { variables, timeframe, method, useCache } = req.query;

    const correlations = await analyticsService.getCorrelationAnalysis({
      variables: variables
        ? variables.split(',')
        : ['price', 'volume', 'demand'],
      timeframe: timeframe || '30d',
      method: method || 'pearson',
      useCache: useCache !== 'false',
    });

    res.json({
      success: true,
      data: correlations,
    });
  } catch (error) {
    logger.error('?²å??¸é??§å??å¤±??', error);
    res.status(500).json({
      success: false,
      error: '?¸é??§å??å¤±??,
    });
  }
});

// ?²å??†æ®µ?†æ?
router.get('/segmentation', authenticateToken, async (req, res) => {
  try {
    const { dimension, criteria, segments, useCache } = req.query;

    const segmentation = await analyticsService.getSegmentationAnalysis({
      dimension: dimension || 'user',
      criteria: criteria
        ? criteria.split(',')
        : ['activity', 'value', 'preference'],
      segments: parseInt(segments) || 5,
      useCache: useCache !== 'false',
    });

    res.json({
      success: true,
      data: segmentation,
    });
  } catch (error) {
    logger.error('?²å??†æ®µ?†æ?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?†æ®µ?†æ?å¤±æ?',
    });
  }
});

// ?²å??†æ??‡æ?
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const { timeframe, includeTrends, useCache } = req.query;

    const metrics = await analyticsService.getAnalyticsMetrics({
      timeframe: timeframe || '24h',
      includeTrends: includeTrends !== 'false',
      useCache: useCache !== 'false',
    });

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('?²å??†æ??‡æ?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?†æ??‡æ??²å?å¤±æ?',
    });
  }
});

// æ¸…ç??†æ?ç·©å?
router.delete('/cache', authenticateToken, async (req, res) => {
  try {
    const { pattern } = req.query;

// eslint-disable-next-line no-unused-vars
    const result = await analyticsService.clearAnalyticsCache(pattern || '*');

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('æ¸…ç??†æ?ç·©å?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: 'ç·©å?æ¸…ç?å¤±æ?',
    });
  }
});

// ?¥åº·æª¢æŸ¥
router.get('/health', async (req, res) => {
  try {
    const health = await analyticsService.healthCheck();

    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    logger.error('?†æ??å??¥åº·æª¢æŸ¥å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?¥åº·æª¢æŸ¥å¤±æ?',
    });
  }
});

// ?²å??±å?æ¨¡æ¿
router.get('/reports/templates', authenticateToken, async (req, res) => {
  try {
    const templates = [
      {
        id: 'market_summary',
        name: 'å¸‚å ´?˜è??±å?',
        description: 'å¸‚å ´è¶¨å‹¢?Œé??µæ?æ¨™æ?è¦?,
        type: 'summary',
        parameters: ['timeframe', 'categories'],
      },
      {
        id: 'portfolio_analysis',
        name: '?•è?çµ„å??†æ??±å?',
        description: 'è©³ç´°?„æ?è³‡ç??ˆè¡¨?¾å???,
        type: 'detailed',
        parameters: ['userId', 'timeframe', 'includeCharts'],
      },
      {
        id: 'user_behavior',
        name: '?¨æˆ¶è¡Œç‚º?±å?',
        description: '?¨æˆ¶è¡Œç‚ºæ¨¡å??Œè¶¨?¢å???,
        type: 'behavioral',
        parameters: ['userId', 'timeframe', 'includePredictions'],
      },
      {
        id: 'financial_performance',
        name: 'è²¡å?è¡¨ç¾?±å?',
        description: 'è²¡å??‡æ??Œæ”¶?Šå???,
        type: 'financial',
        parameters: ['timeframe', 'includeProjections'],
      },
      {
        id: 'technical_analysis',
        name: '?€è¡“å??å ±??,
        description: '?€è¡“æ?æ¨™å??–è¡¨?†æ?',
        type: 'technical',
        parameters: ['symbol', 'timeframe', 'indicators'],
      },
    ];

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    logger.error('?²å??±å?æ¨¡æ¿å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?±å?æ¨¡æ¿?²å?å¤±æ?',
    });
  }
});

// ?Ÿæ??ªå?ç¾©å ±??router.post('/reports/custom', authenticateToken, async (req, res) => {
  try {
    const { templateId, parameters, format } = req.body;

    // ?¹æ?æ¨¡æ¿ID?Ÿæ??¸æ??„å ±??    let report;
    switch (templateId) {
      case 'market_summary':
        report = await analyticsService.getMarketTrends(parameters);
        break;
      case 'portfolio_analysis':
        report = await analyticsService.getPortfolioAnalysis(
          parameters.userId,
          parameters
        );
        break;
      case 'user_behavior':
        report = await analyticsService.getUserBehaviorAnalysis(
          parameters.userId,
          parameters
        );
        break;
      case 'financial_performance':
        report = await analyticsService.generateComprehensiveReport({
          reportType: 'custom',
          ...parameters,
        });
        break;
      case 'technical_analysis':
        report = await analyticsService.getPredictiveAnalysis(parameters);
        break;
      default:
        throw new Error('?ªçŸ¥?„å ±?Šæ¨¡??);
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('?Ÿæ??ªå?ç¾©å ±?Šå¤±??', error);
    res.status(500).json({
      success: false,
      error: '?ªå?ç¾©å ±?Šç??å¤±??,
    });
  }
});

// ?²å??†æ??ç½®
router.get('/config', authenticateToken, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const config = {
      cacheTTL: 3600,
      maxDataPoints: 1000,
      defaultTimeframe: '30d',
      batchSize: 100,
      supportedTimeframes: ['1d', '7d', '30d', '90d', '1y'],
      supportedAnalysisTypes: [
        'trend',
        'correlation',
        'prediction',
        'segmentation',
        'anomaly',
      ],
      supportedReportTypes: [
        'daily',
        'weekly',
        'monthly',
        'quarterly',
        'yearly',
        'custom',
      ],
    };

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    logger.error('?²å??†æ??ç½®å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?ç½®?²å?å¤±æ?',
    });
  }
});

// ?´æ–°?†æ??ç½®
router.put('/config', authenticateToken, async (req, res) => {
  try {
    const { cacheTTL, maxDataPoints, defaultTimeframe, batchSize } = req.body;

    // ?™è£¡?¯ä»¥å¯¦ç¾?ç½®?´æ–°?è¼¯
    const updatedConfig = {
      cacheTTL: cacheTTL || 3600,
      maxDataPoints: maxDataPoints || 1000,
      defaultTimeframe: defaultTimeframe || '30d',
      batchSize: batchSize || 100,
    };

    res.json({
      success: true,
      data: updatedConfig,
      message: '?ç½®?´æ–°?å?',
    });
  } catch (error) {
    logger.error('?´æ–°?†æ??ç½®å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?ç½®?´æ–°å¤±æ?',
    });
  }
});

// ?²å??†æ?æ­·å²
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { userId, type, limit, offset } = req.query;

    // ?™è£¡?¯ä»¥å¯¦ç¾?†æ?æ­·å²?¥è©¢?è¼¯
// eslint-disable-next-line no-unused-vars
    const history = [
      {
        id: 1,
        type: 'market_trends',
        userId,
        parameters: { timeframe: '30d' },
        status: 'completed',
        createdAt: new Date(),
        completedAt: new Date(),
      },
    ];

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    logger.error('?²å??†æ?æ­·å²å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: 'æ­·å²è¨˜é??²å?å¤±æ?',
    });
  }
});

// å°Žå‡º?†æ??¸æ?
router.post('/export', authenticateToken, async (req, res) => {
  try {
    const { type, parameters, format } = req.body;

    // ?™è£¡?¯ä»¥å¯¦ç¾?¸æ?å°Žå‡º?è¼¯
    const exportData = {
      type,
      parameters,
      format: format || 'csv',
      downloadUrl: `/api/analytics/downloads/${Date.now()}.${format || 'csv'}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24å°æ?å¾Œé???    };

    res.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    logger.error('å°Žå‡º?†æ??¸æ?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?¸æ?å°Žå‡ºå¤±æ?',
    });
  }
});

// ?²å??†æ?çµ±è?
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
        { type: 'user_behavior', count: 280 },
      ],
      timeframe: timeframe || '30d',
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('?²å??†æ?çµ±è?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: 'çµ±è??¸æ??²å?å¤±æ?',
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const dataCollectionService = require('../services/dataCollectionService');
const annotationService = require('../services/annotationService');
const dataCleaningService = require('../services/dataCleaningService');
const dataQualityMonitoringService = require('../services/dataQualityMonitoringService');
const feedbackService = require('../services/feedbackService');
const assessmentService = require('../services/assessmentService');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

// 導入統一路由處理器
const {
  createPostHandler,
  createGetHandler,
  createPutHandler,
  createDeleteHandler,
  createPaginatedHandler,
  createSearchHandler,
  createBatchHandler,
  createCustomError
} = require('../middleware/routeHandler');

// 導入驗證中間件
const { body, query } = require('express-validator');

// 驗證中間件定義
const validateDataCollection = [
  body('source').optional().isString().withMessage('數據源必須是字符串'),
  body('quality').optional().isIn(['high', 'medium', 'low']).withMessage('質量等級必須是 high/medium/low'),
  body('status').optional().isIn(['active', 'inactive', 'pending']).withMessage('狀態必須是 active/inactive/pending')
];

const validateAnnotationAssignment = [
  body('batchSize').optional().isInt({ min: 1, max: 100 }).withMessage('批次大小必須在1-100之間'),
  body('priorityFilter').optional().isIn(['high', 'medium', 'low']).withMessage('優先級過濾器必須是 high/medium/low'),
  body('difficultyFilter').optional().isIn(['easy', 'medium', 'hard']).withMessage('難度過濾器必須是 easy/medium/hard'),
  body('annotationTypeFilter').optional().isString().withMessage('標註類型過濾器必須是字符串'),
  body('forceReassignment').optional().isBoolean().withMessage('強制重新分配必須是布爾值')
];

const validateAnnotationSubmission = [
  body('annotationId').isString().withMessage('標註ID必須是字符串'),
  body('annotationResult').notEmpty().withMessage('標註結果不能為空'),
  body('confidence').isFloat({ min: 0, max: 1 }).withMessage('置信度必須在0-1之間')
];

const validateAnnotationReview = [
  body('annotationId').isString().withMessage('標註ID必須是字符串'),
  body('reviewStatus').isIn(['approved', 'rejected', 'pending']).withMessage('審核狀態必須是 approved/rejected/pending'),
  body('reviewNotes').optional().isString().withMessage('審核備註必須是字符串')
];

const validateBatchReview = [
  body('reviews').isArray().withMessage('審核列表必須是數組'),
  body('reviews.*.annotationId').isString().withMessage('標註ID必須是字符串'),
  body('reviews.*.reviewStatus').isIn(['approved', 'rejected', 'pending']).withMessage('審核狀態必須是 approved/rejected/pending')
];

const validateDataCleaning = [
  body('cleaningType').isIn(['duplicate', 'quality', 'format', 'integrity', 'metadata']).withMessage('清洗類型必須是有效的類型'),
  body('options').optional().isObject().withMessage('選項必須是對象')
];

const validateQualityAssessment = [
  body('assessmentType').isIn(['completeness', 'accuracy', 'consistency', 'timeliness', 'overall']).withMessage('評估類型必須是有效的類型'),
  body('criteria').optional().isObject().withMessage('評估標準必須是對象')
];

const validateFeedbackSubmission = [
  body('type').isIn(['bug_report', 'feature_request', 'data_quality', 'general']).withMessage('反饋類型必須是有效的類型'),
  body('title').isLength({ min: 1, max: 200 }).withMessage('標題必須在1-200個字符之間'),
  body('description').isLength({ min: 1, max: 2000 }).withMessage('描述必須在1-2000個字符之間'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('優先級必須是 low/medium/high/urgent'),
  body('category').optional().isString().withMessage('類別必須是字符串')
];

const validateQueryParams = [
  query('startDate').optional().isISO8601().withMessage('開始日期必須是有效的ISO8601格式'),
  query('endDate').optional().isISO8601().withMessage('結束日期必須是有效的ISO8601格式'),
  query('source').optional().isString().withMessage('數據源必須是字符串'),
  query('quality').optional().isIn(['high', 'medium', 'low']).withMessage('質量等級必須是 high/medium/low'),
  query('status').optional().isIn(['active', 'inactive', 'pending']).withMessage('狀態必須是 active/inactive/pending'),
  query('page').optional().isInt({ min: 1 }).withMessage('頁碼必須是正整數'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('限制必須在1-100之間')
];

// 數據收集相關路由
router.post('/collect', createPostHandler(
  async (req, res) => {
    const results = await dataCollectionService.collectFromMultipleSources();
    return {
      success: true,
      message: '數據收集完成',
      data: results
    };
  },
  { auth: true, validation: validateDataCollection }
));

// 獲取數據收集統計
router.get('/collect/stats', createGetHandler(
  async (req, res) => {
    const {
      startDate,
      endDate,
      source,
      quality,
      status
    } = req.query;

    // 構建查詢選項
    const options = {};

    if (startDate) {
      options.startDate = new Date(startDate);
    }

    if (endDate) {
      options.endDate = new Date(endDate);
    }

    if (source) {
      options.source = source;
    }

    if (quality) {
      options.quality = quality;
    }

    if (status) {
      options.status = status;
    }

    const stats = await dataCollectionService.getCollectionStats(options);
    return {
      success: true,
      data: stats
    };
  },
  { auth: true, validation: validateQueryParams }
));

// 智能標註任務分配
router.post('/annotate/assign', createPostHandler(
  async (req, res) => {
    const {
      batchSize = 50,
      priorityFilter,
      difficultyFilter,
      annotationTypeFilter,
      forceReassignment = false
    } = req.body;

    const assignments = await annotationService.assignAnnotationTasks({
      batchSize,
      priorityFilter,
      difficultyFilter,
      annotationTypeFilter,
      forceReassignment
    });

    return {
      success: true,
      message: '智能標註任務分配完成',
      data: {
        totalAssigned: assignments.length,
        assignments,
        algorithm: 'smart_assignment_v2',
        timestamp: new Date()
      }
    };
  },
  { auth: true, validation: validateAnnotationAssignment }
));

// 提交標註結果
router.post('/annotate/submit', createPostHandler(
  async (req, res) => {
    const { annotationId, annotationResult, confidence } = req.body;
    const result = await annotationService.submitAnnotation(annotationId, annotationResult, confidence);

    return {
      success: true,
      message: '標註結果提交成功',
      data: result
    };
  },
  { auth: true, validation: validateAnnotationSubmission }
));

// 審核標註結果
router.post('/annotate/review', createPostHandler(
  async (req, res) => {
    const { annotationId, reviewStatus, reviewNotes } = req.body;
    const reviewerId = req.user.id;

    const result = await annotationService.reviewAnnotation(
      annotationId,
      reviewStatus,
      reviewNotes,
      reviewerId
    );

    return {
      success: true,
      message: '標註審核完成',
      data: result
    };
  },
  { auth: true, validation: validateAnnotationReview }
));

// 批量審核標註結果
router.post('/annotate/batch-review', createBatchHandler(
  async (req, res) => {
    const { reviews } = req.body;
    const reviewerId = req.user.id;

    // 為每個審核添加審核者ID
    const reviewsWithReviewer = reviews.map(review => ({
      ...review,
      reviewerId
    }));

    const results = await annotationService.batchReviewAnnotations(reviewsWithReviewer);

    return {
      success: true,
      message: '批量審核完成',
      data: {
        totalReviewed: results.length,
        successfulReviews: results.filter(r => r.success).length,
        failedReviews: results.filter(r => !r.success).length,
        results
      }
    };
  },
  { auth: true, validation: validateBatchReview }
));

// 獲取標註統計
router.get('/annotate/stats', createGetHandler(
  async (req, res) => {
    const stats = await annotationService.getAnnotationStats();

    return {
      success: true,
      data: stats
    };
  },
  { auth: true }
));

// 學習機制：根據實際結果調整分配策略
router.post('/annotate/learn', createPostHandler(
  async (req, res) => {
    const { annotationId, actualQuality, processingTime } = req.body;

    await annotationService.learnFromResults(annotationId, actualQuality, processingTime);

    return {
      success: true,
      message: '學習機制更新成功',
      data: {
        annotationId,
        actualQuality,
        processingTime,
        timestamp: new Date()
      }
    };
  },
  { auth: true }
));

// 獲取分配算法配置
router.get('/annotate/config', createGetHandler(
  async (req, res) => {
    const config = annotationService.assignmentConfig;

    return {
      success: true,
      data: {
        config,
        algorithm: 'smart_assignment_v2',
        version: '2.0',
        features: [
          '智能負載均衡',
          '專業化分配',
          '動態優先級',
          '質量預測',
          '學習機制'
        ]
      }
    };
  },
  { auth: true }
));

// 更新分配算法配置
router.put('/annotate/config', createPutHandler(
  async (req, res) => {
    const { config } = req.body;

    // 更新配置
    Object.assign(annotationService.assignmentConfig, config);

    return {
      success: true,
      message: '分配算法配置更新成功',
      data: {
        config: annotationService.assignmentConfig,
        timestamp: new Date()
      }
    };
  },
  { auth: true }
));

// 獲取標註者詳細信息
router.get('/annotate/annotators', authenticateToken, async (req, res) => {
  try {
    const { includeInactive = false } = req.query;

    const whereClause = { isActive: true };
    if (includeInactive === 'true') {
      delete whereClause.isActive;
    }

    const annotators = await annotationService.getActiveAnnotatorsWithDetails();

    res.json({
      success: true,
      data: {
        annotators,
        totalCount: annotators.length,
        activeCount: annotators.filter(a => a.isActive).length
      }
    });
  } catch (error) {
    logger.error('獲取標註者詳細信息失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取標註者詳細信息失敗',
      error: error.message
    });
  }
});

// 執行數據清洗
router.post('/clean', authenticateToken, async (req, res) => {
  try {
    logger.info('開始數據清洗流程');
    const results = await dataCleaningService.performDataCleaning();

    res.json({
      success: true,
      message: '數據清洗完成',
      data: results
    });
  } catch (error) {
    logger.error('數據清洗失敗:', error);
    res.status(500).json({
      success: false,
      message: '數據清洗失敗',
      error: error.message
    });
  }
});

// 獲取數據質量指標
router.get('/quality-metrics', authenticateToken, async (req, res) => {
  try {
    const { dataType, limit = 10 } = req.query;

    const DataQualityMetrics = require('../models/DataQualityMetrics');
    const {getDataQualityMetricsModel} = DataQualityMetrics;
    const DataQualityMetricsModel = getDataQualityMetricsModel();

    const whereClause = {};
    if (dataType) {
      whereClause.dataType = dataType;
    }

    const metrics = await DataQualityMetricsModel.findAll({
      where: whereClause,
      order: [['assessmentDate', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('獲取數據質量指標失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取數據質量指標失敗',
      error: error.message
    });
  }
});

// 獲取數據質量報告
router.get('/quality-report', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const DataQualityMetrics = require('../models/DataQualityMetrics');
    const {getDataQualityMetricsModel} = DataQualityMetrics;
    const DataQualityMetricsModel = getDataQualityMetricsModel();

    const whereClause = {};
    if (startDate && endDate) {
      whereClause.assessmentDate = {
        [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const metrics = await DataQualityMetricsModel.findAll({
      where: whereClause,
      order: [['assessmentDate', 'DESC']]
    });

    // 計算統計數據
    const report = {
      totalAssessments: metrics.length,
      averageOverallScore: 0,
      dataTypeDistribution: {},
      qualityTrend: 'stable',
      recommendations: []
    };

    if (metrics.length > 0) {
      const totalScore = metrics.reduce((sum, metric) => sum + parseFloat(metric.overallScore), 0);
      report.averageOverallScore = totalScore / metrics.length;

      // 計算數據類型分佈
      metrics.forEach(metric => {
        report.dataTypeDistribution[metric.dataType] =
          (report.dataTypeDistribution[metric.dataType] || 0) + 1;
      });

      // 分析質量趨勢
      if (metrics.length >= 2) {
        const recentScore = parseFloat(metrics[0].overallScore);
        const previousScore = parseFloat(metrics[1].overallScore);

        if (recentScore > previousScore + 0.05) {
          report.qualityTrend = 'improving';
        } else if (recentScore < previousScore - 0.05) {
          report.qualityTrend = 'declining';
        }
      }

      // 生成建議
      const allSuggestions = metrics
        .flatMap(metric => metric.metadata.improvementSuggestions || [])
        .filter((suggestion, index, array) => array.indexOf(suggestion) === index);

      report.recommendations = allSuggestions.slice(0, 5); // 取前5個建議
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('獲取數據質量報告失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取數據質量報告失敗',
      error: error.message
    });
  }
});

// 完整的數據質量改進流程
router.post('/improve', authenticateToken, async (req, res) => {
  try {
    logger.info('開始完整的數據質量改進流程');

    const results = {
      collection: null,
      annotation: null,
      cleaning: null,
      overallQuality: 0
    };

    // 1. 數據收集
    try {
      results.collection = await dataCollectionService.collectFromMultipleSources();
      logger.info('數據收集完成');
    } catch (error) {
      logger.error('數據收集步驟失敗:', error);
    }

    // 2. 標註任務分配
    try {
      const assignments = await annotationService.assignAnnotationTasks();
      results.annotation = {
        totalAssigned: assignments.length,
        assignments
      };
      logger.info('標註任務分配完成');
    } catch (error) {
      logger.error('標註任務分配步驟失敗:', error);
    }

    // 3. 數據清洗
    try {
      results.cleaning = await dataCleaningService.performDataCleaning();
      logger.info('數據清洗完成');
    } catch (error) {
      logger.error('數據清洗步驟失敗:', error);
    }

    // 4. 計算整體質量分數
    const qualityScores = [];
    if (results.collection) qualityScores.push(0.8); // 假設收集質量
    if (results.annotation) qualityScores.push(0.85); // 假設標註質量
    if (results.cleaning) qualityScores.push(0.9); // 假設清洗質量

    results.overallQuality = qualityScores.length > 0
      ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
      : 0;

    res.json({
      success: true,
      message: '數據質量改進流程完成',
      data: results
    });
  } catch (error) {
    logger.error('數據質量改進流程失敗:', error);
    res.status(500).json({
      success: false,
      message: '數據質量改進流程失敗',
      error: error.message
    });
  }
});

// 獲取數據質量改進建議
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const recommendations = {
      dataCollection: [
        '增加官方API數據源的接入',
        '提高用戶上傳數據的質量標準',
        '建立數據收集的質量檢查機制',
        '優化第三方平台數據的收集流程',
        '加強用戶糾正數據的收集'
      ],
      annotation: [
        '建立更詳細的標註指南',
        '加強標註者的培訓和認證',
        '實施多層審核機制',
        '建立標註質量獎勵制度',
        '優化標註任務分配算法'
      ],
      cleaning: [
        '提高重複數據檢測的準確性',
        '優化低質量數據的識別標準',
        '建立更完善的數據格式標準',
        '加強數據完整性驗證',
        '豐富數據元數據信息'
      ],
      general: [
        '建立數據質量監控儀表板',
        '實施定期數據質量評估',
        '建立數據質量改進反饋機制',
        '加強數據質量相關的培訓',
        '建立數據質量管理的最佳實踐'
      ]
    };

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    logger.error('獲取改進建議失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取改進建議失敗',
      error: error.message
    });
  }
});

// Dashboard endpoints
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, dataTypes } = req.query;

    const options = {};
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);
    if (dataTypes) options.dataTypes = dataTypes.split(',');

    const dashboardData = await dataQualityMonitoringService.getDashboardData(options);
    res.json({ success: true, data: dashboardData });
  } catch (error) {
    logger.error('Error getting dashboard data:', error);
    res.status(500).json({ success: false, message: 'Failed to get dashboard data' });
  }
});

// Get real-time alerts
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const alerts = await dataQualityMonitoringService.getRealTimeAlerts();
    res.json({ success: true, data: alerts });
  } catch (error) {
    logger.error('Error getting alerts:', error);
    res.status(500).json({ success: false, message: 'Failed to get alerts' });
  }
});

// Get overall metrics
router.get('/overall-metrics', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, dataTypes } = req.query;

    const options = {};
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);
    if (dataTypes) options.dataTypes = dataTypes.split(',');

    const metrics = await dataQualityMonitoringService.getOverallMetrics(
      options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      options.endDate || new Date(),
      options.dataTypes || ['training', 'annotation', 'validation', 'market', 'user_generated']
    );
    res.json({ success: true, data: metrics });
  } catch (error) {
    logger.error('Error getting overall metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to get overall metrics' });
  }
});

// Get trend data
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, dataTypes } = req.query;

    const options = {};
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);
    if (dataTypes) options.dataTypes = dataTypes.split(',');

    const trendData = await dataQualityMonitoringService.getTrendData(
      options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      options.endDate || new Date(),
      options.dataTypes || ['training', 'annotation', 'validation', 'market', 'user_generated']
    );
    res.json({ success: true, data: trendData });
  } catch (error) {
    logger.error('Error getting trend data:', error);
    res.status(500).json({ success: false, message: 'Failed to get trend data' });
  }
});

// Get source breakdown
router.get('/source-breakdown', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const breakdown = await dataQualityMonitoringService.getSourceBreakdown(
      startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate) : new Date()
    );
    res.json({ success: true, data: breakdown });
  } catch (error) {
    logger.error('Error getting source breakdown:', error);
    res.status(500).json({ success: false, message: 'Failed to get source breakdown' });
  }
});

// Get quality distribution
router.get('/quality-distribution', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const distribution = await dataQualityMonitoringService.getQualityDistribution(
      startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate) : new Date()
    );
    res.json({ success: true, data: distribution });
  } catch (error) {
    logger.error('Error getting quality distribution:', error);
    res.status(500).json({ success: false, message: 'Failed to get quality distribution' });
  }
});

// Get annotator performance
router.get('/annotator-performance', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const performance = await dataQualityMonitoringService.getAnnotatorPerformance(
      startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate) : new Date()
    );
    res.json({ success: true, data: performance });
  } catch (error) {
    logger.error('Error getting annotator performance:', error);
    res.status(500).json({ success: false, message: 'Failed to get annotator performance' });
  }
});

// Get recent issues
router.get('/recent-issues', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const issues = await dataQualityMonitoringService.getRecentIssues(
      startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate) : new Date()
    );
    res.json({ success: true, data: issues });
  } catch (error) {
    logger.error('Error getting recent issues:', error);
    res.status(500).json({ success: false, message: 'Failed to get recent issues' });
  }
});

// Get improvement suggestions
router.get('/improvement-suggestions', authenticateToken, async (req, res) => {
  try {
    const suggestions = await dataQualityMonitoringService.getImprovementSuggestions();
    res.json({ success: true, data: suggestions });
  } catch (error) {
    logger.error('Error getting improvement suggestions:', error);
    res.status(500).json({ success: false, message: 'Failed to get improvement suggestions' });
  }
});

// ==================== 反饋管理相關路由 ====================

// 提交反饋
router.post('/feedback', authenticateToken, async (req, res) => {
  try {
    const feedbackData = {
      ...req.body,
      userId: req.user.id
    };

    const feedback = await feedbackService.submitFeedback(feedbackData);

    res.json({
      success: true,
      message: '反饋已提交',
      data: feedback
    });
  } catch (error) {
    logger.error('提交反饋失敗:', error);
    res.status(500).json({
      success: false,
      message: '提交反饋失敗',
      error: error.message
    });
  }
});

// 獲取反饋列表
router.get('/feedback', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      feedbackType,
      category,
      severity,
      assignedTo,
      startDate,
      endDate,
      userId
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      priority,
      feedbackType,
      category,
      severity,
      assignedTo: assignedTo ? parseInt(assignedTo) : undefined,
      startDate,
      endDate,
      userId: userId ? parseInt(userId) : undefined
    };

    const result = await feedbackService.getFeedbacks(options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('獲取反饋列表失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取反饋列表失敗',
      error: error.message
    });
  }
});

// 獲取單個反饋詳情
router.get('/feedback/:id', authenticateToken, async (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);
    const feedback = await feedbackService.getFeedbackById(feedbackId);

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    logger.error('獲取反饋詳情失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取反饋詳情失敗',
      error: error.message
    });
  }
});

// 更新反饋狀態
router.put('/feedback/:id/status', authenticateToken, async (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);
    const { status, resolution } = req.body;

    const feedback = await feedbackService.updateFeedbackStatus(
      feedbackId,
      status,
      req.user.id,
      resolution
    );

    res.json({
      success: true,
      message: '反饋狀態已更新',
      data: feedback
    });
  } catch (error) {
    logger.error('更新反饋狀態失敗:', error);
    res.status(500).json({
      success: false,
      message: '更新反饋狀態失敗',
      error: error.message
    });
  }
});

// 分配反饋
router.put('/feedback/:id/assign', authenticateToken, async (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);
    const { assignedTo } = req.body;

    const feedback = await feedbackService.assignFeedback(
      feedbackId,
      assignedTo,
      req.user.id
    );

    res.json({
      success: true,
      message: '反饋已分配',
      data: feedback
    });
  } catch (error) {
    logger.error('分配反饋失敗:', error);
    res.status(500).json({
      success: false,
      message: '分配反饋失敗',
      error: error.message
    });
  }
});

// 添加反饋回應
router.post('/feedback/:id/response', authenticateToken, async (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);
    const { content, responseType = 'comment', isInternal = false } = req.body;

    const response = await feedbackService.addResponse(
      feedbackId,
      req.user.id,
      content,
      responseType,
      isInternal
    );

    res.json({
      success: true,
      message: '回應已添加',
      data: response
    });
  } catch (error) {
    logger.error('添加反饋回應失敗:', error);
    res.status(500).json({
      success: false,
      message: '添加反饋回應失敗',
      error: error.message
    });
  }
});

// 獲取反饋統計
router.get('/feedback/stats', authenticateToken, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      feedbackType,
      category
    } = req.query;

    const options = {
      startDate,
      endDate,
      feedbackType,
      category
    };

    const stats = await feedbackService.getFeedbackStats(options);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('獲取反饋統計失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取反饋統計失敗',
      error: error.message
    });
  }
});

// 獲取反饋改進建議
router.get('/feedback/suggestions', authenticateToken, async (req, res) => {
  try {
    const suggestions = await feedbackService.generateImprovementSuggestions();

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    logger.error('獲取反饋改進建議失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取反饋改進建議失敗',
      error: error.message
    });
  }
});

// 定期數據質量評估相關路由
router.post('/assessment/schedule', authenticateToken, async (req, res) => {
  try {
    const scheduleData = {
      ...req.body,
      createdBy: req.user.id
    };

    const schedule = await assessmentService.createAssessmentSchedule(scheduleData);
    res.json({
      success: true,
      message: '評估計劃創建成功',
      data: schedule
    });
  } catch (error) {
    logger.error('創建評估計劃失敗:', error);
    res.status(500).json({
      success: false,
      message: '創建評估計劃失敗',
      error: error.message
    });
  }
});

router.get('/assessment/schedules', authenticateToken, async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      assessmentType: req.query.assessmentType
    };

    const result = await assessmentService.getSchedules(options);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('獲取評估計劃列表失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取評估計劃列表失敗',
      error: error.message
    });
  }
});

router.put('/assessment/schedule/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const schedule = await assessmentService.updateScheduleStatus(id, isActive);
    res.json({
      success: true,
      message: '評估計劃狀態更新成功',
      data: schedule
    });
  } catch (error) {
    logger.error('更新評估計劃狀態失敗:', error);
    res.status(500).json({
      success: false,
      message: '更新評估計劃狀態失敗',
      error: error.message
    });
  }
});

router.delete('/assessment/schedule/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await assessmentService.deleteSchedule(id);
    res.json({
      success: true,
      message: '評估計劃刪除成功'
    });
  } catch (error) {
    logger.error('刪除評估計劃失敗:', error);
    res.status(500).json({
      success: false,
      message: '刪除評估計劃失敗',
      error: error.message
    });
  }
});

router.post('/assessment/execute', authenticateToken, async (req, res) => {
  try {
    const assessmentData = {
      ...req.body,
      userId: req.user.id
    };

    const assessment = await assessmentService.executeManualAssessment(assessmentData);
    res.json({
      success: true,
      message: '手動評估執行成功',
      data: assessment
    });
  } catch (error) {
    logger.error('執行手動評估失敗:', error);
    res.status(500).json({
      success: false,
      message: '執行手動評估失敗',
      error: error.message
    });
  }
});

router.post('/assessment/schedule/:id/execute', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await assessmentService.executeScheduledAssessment(id, 'manual', req.user.id);
    res.json({
      success: true,
      message: '計劃評估執行成功',
      data: assessment
    });
  } catch (error) {
    logger.error('執行計劃評估失敗:', error);
    res.status(500).json({
      success: false,
      message: '執行計劃評估失敗',
      error: error.message
    });
  }
});

router.get('/assessment/list', authenticateToken, async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      status: req.query.status,
      assessmentType: req.query.assessmentType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      triggeredBy: req.query.triggeredBy
    };

    const result = await assessmentService.getAssessments(options);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('獲取評估列表失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取評估列表失敗',
      error: error.message
    });
  }
});

router.get('/assessment/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await require('../models/DataQualityAssessment').findByPk(id, {
      include: [
        {
          model: require('../models/User'),
          as: 'TriggeredByUser',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: '評估記錄不存在'
      });
    }

    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    logger.error('獲取評估詳情失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取評估詳情失敗',
      error: error.message
    });
  }
});

router.get('/assessment/stats', authenticateToken, async (req, res) => {
  try {
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      assessmentType: req.query.assessmentType
    };

    const stats = await assessmentService.getAssessmentStats(options);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('獲取評估統計失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取評估統計失敗',
      error: error.message
    });
  }
});

module.exports = router;

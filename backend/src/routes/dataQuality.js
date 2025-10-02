const express = require('express');
const router = express.Router();'
// eslint-disable-next-line no-unused-vars''
const dataCollectionService = require('../services/dataCollectionService');''
const annotationService = require('../services/annotationService');'
// eslint-disable-next-line no-unused-vars''
const dataCleaningService = require('../services/dataCleaningService');'
// eslint-disable-next-line no-unused-vars''
const dataQualityMonitoringService = require('../services/dataQualityMonitoringService');''
const feedbackService = require('../services/feedbackService');'
// eslint-disable-next-line no-unused-vars''
const assessmentService = require('../services/assessmentService');''
const { authenticateToken } = require('../middleware/auth');'
// eslint-disable-next-line no-unused-vars''
const logger = require('../utils/logger');

// Import統�?路由?��???const {
  createPostHandler,
  createGetHandler,
  createPutHandler,
  createDeleteHandler,
  createPaginatedHandler,
  createSearchHandler,
  createBatchHandler,'
  createCustomError,''
} = require('../middleware/routeHandler');''
// Import驗�?中�?�?const { body, query } = require('express-validator');'
// 驗�?中�?件�?�?const validateDataCollection = [''
  body('source').optional().isString().withMessage('?��?源�??�是字符�?),''
  body('quality')'
    .optional()''
    .isIn(['high', 'medium', 'low'])''
    .withMessage('質�?等�?必�???high/medium/low'),''
  body('status')'
    .optional()''
    .isIn(['active', 'inactive', 'pending'])''
    .withMessage('?�?��??�是 active/inactive/pending'),
];'
const validateAnnotationAssignment = [''
  body('batchSize')
    .optional()'
    .isInt({ min: 1, max: 100 });''
    .withMessage('?�次大�?必�???-100之�?'),''
  body('priorityFilter')'
    .optional()''
    .isIn(['high', 'medium', 'low'])''
    .withMessage('?��?級�?濾器必�???high/medium/low'),''
  body('difficultyFilter')'
    .optional()''
    .isIn(['easy', 'medium', 'hard'])''
    .withMessage('??��?�濾?��??�是 easy/medium/hard'),''
  body('annotationTypeFilter')
    .optional()'
    .isString()''
    .withMessage('標註類�??�濾?��??�是字符�?),''
  body('forceReassignment')
    .optional()'
    .isBoolean()''
    .withMessage('強制?�新?��?必�??��??��?),
];'
const validateAnnotationSubmission = [''
  body('annotationId').isString().withMessage('標註ID必�??��?符串'),''
  body('annotationResult').notEmpty().withMessage('標註結�?不能?�空'),''
  body('confidence')'
    .isFloat({ min: 0, max: 1 });''
    .withMessage('置信度�??�在0-1之�?'),
];'
const validateAnnotationReview = [''
  body('annotationId').isString().withMessage('標註ID必�??��?符串'),''
  body('reviewStatus')''
    .isIn(['approved', 'rejected', 'pending'])''
    .withMessage('審核?�?��??�是 approved/rejected/pending'),''
  body('reviewNotes').optional().isString().withMessage('審核?�註必�??��?符串'),
];'
const validateBatchReview = [''
  body('reviews').isArray().withMessage('審核?�表必�??�數�?),''
  body('reviews.*.annotationId').isString().withMessage('標註ID必�??��?符串'),''
  body('reviews.*.reviewStatus')''
    .isIn(['approved', 'rejected', 'pending'])''
    .withMessage('審核?�?��??�是 approved/rejected/pending'),
];'
const validateDataCleaning = [''
  body('cleaningType')''
    .isIn(['duplicate', 'quality', 'format', 'integrity', 'metadata'])''
    .withMessage('清�?類�?必�??��??��?類�?'),''
  body('options').optional().isObject().withMessage('?��?必�??��?�?),
];'
const validateQualityAssessment = [''
  body('assessmentType')''
    .isIn(['completeness', 'accuracy', 'consistency', 'timeliness', 'overall'])''
    .withMessage('評估類�?必�??��??��?類�?'),''
  body('criteria').optional().isObject().withMessage('評估標�?必�??��?�?),
];'
const validateFeedbackSubmission = [''
  body('type')''
    .isIn(['bug_report', 'feature_request', 'data_quality', 'general'])''
    .withMessage('?��?類�?必�??��??��?類�?'),''
  body('title')'
    .isLength({ min: 1, max: 200 });''
    .withMessage('標�?必�???-200?��?符�???),''
  body('description')'
    .isLength({ min: 1, max: 2000 });''
    .withMessage('?�述必�???-2000?��?符�???),''
  body('priority')'
    .optional()''
    .isIn(['low', 'medium', 'high', 'urgent'])''
    .withMessage('?��?級�??�是 low/medium/high/urgent'),''
  body('category').optional().isString().withMessage('類別必�??��?符串'),
];'
const validateQueryParams = [''
  query('startDate')
    .optional()'
    .isISO8601()''
    .withMessage('?��??��?必�??��??��?ISO8601?��?'),''
  query('endDate')
    .optional()'
    .isISO8601()''
    .withMessage('結�??��?必�??��??��?ISO8601?��?'),''
  query('source').optional().isString().withMessage('?��?源�??�是字符�?),''
  query('quality')'
    .optional()''
    .isIn(['high', 'medium', 'low'])''
    .withMessage('質�?等�?必�???high/medium/low'),''
  query('status')'
    .optional()''
    .isIn(['active', 'inactive', 'pending'])''
    .withMessage('?�?��??�是 active/inactive/pending'),''
  query('page').optional().isInt({ min: 1 }).withMessage('?�碼必�??�正?�數'),''
  query('limit')
    .optional()'
    .isInt({ min: 1, max: 100 });''
    .withMessage('?�制必�???-100之�?'),
];

// ?��??��??��?路由'
router.post(''
  '/collect',
  createPostHandler(
    async (req, res) => {
// eslint-disable-next-line no-unused-vars
      const results = await dataCollectionService.collectFromMultipleSources();
      return {'
        success: true,''
        message: '?��??��?完�?',
        data: results,
      };
    },
    { auth: true, validation: validateDataCollection });
);

// ?��??��??��?統�?'
router.get(''
  '/collect/stats',
  createGetHandler(
    async (req, res) => {
      const { startDate, endDate, source, quality, status } = req.query;

      // Build?�詢?��?
// eslint-disable-next-line no-unused-vars
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
        data: stats,
      };
    },
    { auth: true, validation: validateQueryParams });
);

// ?�能標註任�??��?'
router.post(''
  '/annotate/assign',
  createPostHandler(
    async (req, res) => {
      const {
        batchSize = 50,
        priorityFilter,
        difficultyFilter,
        annotationTypeFilter,
        forceReassignment = false,
      } = req.body;

      const assignments = await annotationService.assignAnnotationTasks({
        batchSize,
        priorityFilter,
        difficultyFilter,
        annotationTypeFilter,
        forceReassignment,
      });

      return {'
        success: true,''
        message: '?�能標註任�??��?完�?',
        data: {
          totalAssigned: assignments.length,'
          assignments,''
          algorithm: 'smart_assignment_v2',
          timestamp: new Date(),
        },
      };
    },
    { auth: true, validation: validateAnnotationAssignment });
);

// ?�交標註結�?'
router.post(''
  '/annotate/submit',
  createPostHandler(
    async (req, res) => {
      const { annotationId, annotationResult, confidence } = req.body;
// eslint-disable-next-line no-unused-vars
      const result = await annotationService.submitAnnotation(
        annotationId,
        annotationResult,
        confidence
      );

      return {'
        success: true,''
        message: '標註結�??�交?��?',
        data: result,
      };
    },
    { auth: true, validation: validateAnnotationSubmission });
);

// 審核標註結�?'
router.post(''
  '/annotate/review',
  createPostHandler(
    async (req, res) => {
      const { annotationId, reviewStatus, reviewNotes } = req.body;
      const reviewerId = req.user.id;

// eslint-disable-next-line no-unused-vars
      const result = await annotationService.reviewAnnotation(
        annotationId,
        reviewStatus,
        reviewNotes,
        reviewerId
      );

      return {'
        success: true,''
        message: '標註審核完�?',
        data: result,
      };
    },
    { auth: true, validation: validateAnnotationReview });
);

// ?��?審核標註結�?'
router.post(''
  '/annotate/batch-review',
  createBatchHandler(
    async (req, res) => {
      const { reviews } = req.body;
      const reviewerId = req.user.id;

      // ?��??�審?�添?�審?�者ID
      const reviewsWithReviewer = reviews.map((review) => ({
        ...review,
        reviewerId,
      }));

// eslint-disable-next-line no-unused-vars
      const results =
        await annotationService.batchReviewAnnotations(reviewsWithReviewer);

      return {'
        success: true,''
        message: '?��?審核完�?',
        data: {
          totalReviewed: results.length,
          successfulReviews: results.filter((r) => r.success).length,
          failedReviews: results.filter((r) => !r.success).length,
          results,
        },
      };
    },
    { auth: true, validation: validateBatchReview });
);

// ?��?標註統�?'
router.get(''
  '/annotate/stats',
  createGetHandler(
    async (req, res) => {
      const stats = await annotationService.getAnnotationStats();

      return {
        success: true,
        data: stats,
      };
    },
    { auth: true });
);'
// 學�?機制：Root?�實?��??�調?��??��???router.post(''
  '/annotate/learn',
  createPostHandler(
    async (req, res) => {
      const { annotationId, actualQuality, processingTime } = req.body;

      await annotationService.learnFromResults(
        annotationId,
        actualQuality,
        processingTime
      );

      return {'
        success: true,''
        message: '學�?機制?�新?��?',
        data: {
          annotationId,
          actualQuality,
          processingTime,
          timestamp: new Date(),
        },
      };
    },
    { auth: true });
);

// ?��??��?算�??�置'
router.get(''
  '/annotate/config',
  createGetHandler(
    async (req, res) => {
// eslint-disable-next-line no-unused-vars
      const config = annotationService.assignmentConfig;

      return {
        success: true,
        data: {'
          config,''
          algorithm: 'smart_assignment_v2',''
          version: '2.0','
          features: [''
            '?�能負�??�衡',''
            '專業?��???,''
            '?��??��?�?,''
            '質�??�測',''
            '學�?機制',
          ],
        },
      };
    },
    { auth: true });
);

// ?�新?��?算�??�置'
router.put(''
  '/annotate/config',
  createPutHandler(
    async (req, res) => {
      const { config } = req.body;

      // ?�新?�置
      Object.assign(annotationService.assignmentConfig, config);

      return {'
        success: true,''
        message: '?��?算�??�置?�新?��?',
        data: {
          config: annotationService.assignmentConfig,
          timestamp: new Date(),
        },
      };
    },'
    { auth: true });
);''
// ?��?標註?�詳細信??router.get('/annotate/annotators', authenticateToken, async (req, res) => {
  try {
    const { includeInactive = false } = req.query;'
    const whereClause = { isActive: true };''
    if (includeInactive === 'true') {
      delete whereClause.isActive;
    }
    const annotators = await annotationService.getActiveAnnotatorsWithDetails();

    res.json({
      success: true,
      data: {
        annotators,
        totalCount: annotators.length,
        activeCount: annotators.filter((a) => a.isActive).length,
      },
    });'
  } catch (error) {''
    logger.error('?��?標註?�詳細信?�失??', error);
    res.status(500).json({'
      success: false,''
      message: '?��?標註?�詳細信?�失??,
      error: error.message,
    });
  }
});'
// ?��??��?清�?''
router.post('/clean', authenticateToken, async (req, res) => {'
  try {''
    logger.info('?��??��?清�?流�?');
// eslint-disable-next-line no-unused-vars
    const results = await dataCleaningService.performDataCleaning();

    res.json({'
      success: true,''
      message: '?��?清�?完�?',
      data: results,
    });'
  } catch (error) {''
    logger.error('?��?清�?失�?:', error);
    res.status(500).json({'
      success: false,''
      message: '?��?清�?失�?',
      error: error.message,
    });
  }
});'
// ?��??��?質�??��?''
router.get('/quality-metrics', authenticateToken, async (req, res) => {
  try {
    const { dataType, limit = 10 } = req.query;'
// eslint-disable-next-line no-unused-vars''
    const DataQualityMetrics = require('../models/DataQualityMetrics');
    const { getDataQualityMetricsModel } = DataQualityMetrics;
// eslint-disable-next-line no-unused-vars
    const DataQualityMetricsModel = getDataQualityMetricsModel();

    const whereClause = {};
    if (dataType) {
      whereClause.dataType = dataType;
    }
    const metrics = await DataQualityMetricsModel.findAll({'
      where: whereClause,''
      order: [['assessmentDate', 'DESC']],
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: metrics,
    });'
  } catch (error) {''
    logger.error('?��??��?質�??��?失�?:', error);
    res.status(500).json({'
      success: false,''
      message: '?��??��?質�??��?失�?',
      error: error.message,
    });
  }
});'
// ?��??��?質�??��?''
router.get('/quality-report', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;'
// eslint-disable-next-line no-unused-vars''
    const DataQualityMetrics = require('../models/DataQualityMetrics');
    const { getDataQualityMetricsModel } = DataQualityMetrics;
// eslint-disable-next-line no-unused-vars
    const DataQualityMetricsModel = getDataQualityMetricsModel();

    const whereClause = {};
    if (startDate && endDate) {'
      whereClause.assessmentDate = {''
        [require('sequelize').Op.between]: [
          new Date(startDate),
          new Date(endDate),
        ],
      };
    }
    const metrics = await DataQualityMetricsModel.findAll({'
      where: whereClause,''
      order: [['assessmentDate', 'DESC']],
    });

    // 計�?統�??��?
    const report = {
      totalAssessments: metrics.length,
      averageOverallScore: 0,'
      dataTypeDistribution: {},''
      qualityTrend: 'stable',
      recommendations: [],
    };

    if (metrics.length > 0) {
      const totalScore = metrics.reduce(
        (sum, metric) => sum + parseFloat(metric.overallScore),
        0
      );
      report.averageOverallScore = totalScore / metrics.length;

      // 計�??��?Class�??��?
      metrics.forEach((metric) => {
        report.dataTypeDistribution[metric.dataType] =
          (report.dataTypeDistribution[metric.dataType] || 0) + 1;
      });

      // ?��?質�?趨勢
      if (metrics.length >= 2) {
// eslint-disable-next-line no-unused-vars
        const recentScore = parseFloat(metrics[0].overallScore);
        const previousScore = parseFloat(metrics[1].overallScore);'
        if (recentScore > previousScore + 0.05) {''
          report.qualityTrend = 'improving';'
        } else if (recentScore < previousScore - 0.05) {''
          report.qualityTrend = 'declining';
        }
      }
      // ?��?建議
      const allSuggestions = metrics
        .flatMap((metric) => metric.metadata.improvementSuggestions || [])
        .filter(
          (suggestion, index, array) => array.indexOf(suggestion) === index
        );

      report.recommendations = allSuggestions.slice(0, 5); // ?��?5?�建�?    }
    res.json({
      success: true,
      data: report,
    });'
  } catch (error) {''
    logger.error('?��??��?質�??��?失�?:', error);
    res.status(500).json({'
      success: false,''
      message: '?��??��?質�??��?失�?',
      error: error.message,
    });'
  }
});''
// 完整?�數?�質?�改?��?�?router.post('/improve', authenticateToken, async (req, res) => {'
  try {''
    logger.info('?��?完整?�數?�質?�改?��?�?);

// eslint-disable-next-line no-unused-vars
    const results = {
      collection: null,
      annotation: null,
      cleaning: null,
      overallQuality: 0,
    };

    // 1. ?��??��?
    try {
      results.collection ='
        await dataCollectionService.collectFromMultipleSources();''
      logger.info('?��??��?完�?');'
    } catch (error) {''
      logger.error('?��??��?步�?失�?:', error);
    }
    // 2. 標註任�??��?
    try {
      const assignments = await annotationService.assignAnnotationTasks();
      results.annotation = {
        totalAssigned: assignments.length,
        assignments,'
      };''
      logger.info('標註任�??��?完�?');'
    } catch (error) {''
      logger.error('標註任�??��?步�?失�?:', error);
    }
    // 3. ?��?清�?
    try {'
      results.cleaning = await dataCleaningService.performDataCleaning();''
      logger.info('?��?清�?完�?');'
    } catch (error) {''
      logger.error('?��?清�?步�?失�?:', error);
    }
    // 4. 計�??��?質�??�數
    const qualityScores = [];
    if (results.collection) qualityScores.push(0.8); // ?�設?��?質�?
    if (results.annotation) qualityScores.push(0.85); // ?�設標註質�?
    if (results.cleaning) qualityScores.push(0.9); // ?�設清�?質�?

    results.overallQuality =
      qualityScores.length > 0
        ? qualityScores.reduce((sum, score) => sum + score, 0) /
          qualityScores.length
        : 0;

    res.json({'
      success: true,''
      message: '?��?質�??�進�?程�???,
      data: results,
    });'
  } catch (error) {''
    logger.error('?��?質�??�進�?程失??', error);
    res.status(500).json({'
      success: false,''
      message: '?��?質�??�進�?程失??,
      error: error.message,
    });'
  }
});''
// ?��??��?質�??�進建�?router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const recommendations = {'
      dataCollection: [''
        '增�?官方API?��?源�??�入',''
        '?��??�戶上傳?��??�質?��?�?,''
        '建�??��??��??�質?�檢?��???,''
        '?��?第�??�平?�數?��??��?流�?',''
        '?�強?�戶糾正?��??�收??,
      ],'
      annotation: [''
        '建�??�詳細�?標註?��?',''
        '?�強標註?��??��??��?�?,''
        '實施多層審核機制',''
        '建�?標註質�??�勵?�度',''
        '?��?標註任�??��?算�?',
      ],'
      cleaning: [''
        '?��??��??��?檢測?��?確�?,''
        '?��?低質?�數?��?識別標�?',''
        '建�??��??��??��??��?標�?',''
        '?�強?��?完整?��?�?,''
        '豐�??��??�數?�信??,
      ],'
      general: [''
        '建�??��?質�???��?�表板',''
        '實施定�??��?質�?評估',''
        '建�??��?質�??�進�?饋�???,''
        '?�強?��?質�??��??�培�?,''
        '建�??��?質�?管�??��?佳實�?,
      ],
    };

    res.json({
      success: true,
      data: recommendations,
    });'
  } catch (error) {''
    logger.error('?��??�進建議失??', error);
    res.status(500).json({'
      success: false,''
      message: '?��??�進建議失??,
      error: error.message,
    });
  }
});'
// Dashboard endpoints''
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, dataTypes } = req.query;

// eslint-disable-next-line no-unused-vars
    const options = {};
    if (startDate) options.startDate = new Date(startDate);'
    if (endDate) options.endDate = new Date(endDate);''
    if (dataTypes) options.dataTypes = dataTypes.split(',');

    const dashboardData =
      await dataQualityMonitoringService.getDashboardData(options);
    res.json({ success: true, data: dashboardData });'
  } catch (error) {''
    logger.error('Error getting dashboard data:', error);
    res'
      .status(500)''
      .json({ success: false, message: 'Failed to get dashboard data' });
  }
});'
// Get real-time alerts''
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const alerts = await dataQualityMonitoringService.getRealTimeAlerts();
    res.json({ success: true, data: alerts });'
  } catch (error) {''
    logger.error('Error getting alerts:', error);''
    res.status(500).json({ success: false, message: 'Failed to get alerts' });
  }
});'
// Get overall metrics''
router.get('/overall-metrics', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, dataTypes } = req.query;

// eslint-disable-next-line no-unused-vars
    const options = {};
    if (startDate) options.startDate = new Date(startDate);'
    if (endDate) options.endDate = new Date(endDate);''
    if (dataTypes) options.dataTypes = dataTypes.split(',');

    const metrics = await dataQualityMonitoringService.getOverallMetrics(
      options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      options.endDate || new Date(),'
      options.dataTypes || [''
        'training',''
        'annotation',''
        'validation',''
        'market',''
        'user_generated',
      ]
    );
    res.json({ success: true, data: metrics });'
  } catch (error) {''
    logger.error('Error getting overall metrics:', error);
    res'
      .status(500)''
      .json({ success: false, message: 'Failed to get overall metrics' });
  }
});'
// Get trend data''
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, dataTypes } = req.query;

// eslint-disable-next-line no-unused-vars
    const options = {};
    if (startDate) options.startDate = new Date(startDate);'
    if (endDate) options.endDate = new Date(endDate);''
    if (dataTypes) options.dataTypes = dataTypes.split(',');

    const trendData = await dataQualityMonitoringService.getTrendData(
      options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      options.endDate || new Date(),'
      options.dataTypes || [''
        'training',''
        'annotation',''
        'validation',''
        'market',''
        'user_generated',
      ]
    );
    res.json({ success: true, data: trendData });'
  } catch (error) {''
    logger.error('Error getting trend data:', error);
    res'
      .status(500)''
      .json({ success: false, message: 'Failed to get trend data' });
  }
});'
// Get source breakdown''
router.get('/source-breakdown', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const breakdown = await dataQualityMonitoringService.getSourceBreakdown(
      startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate) : new Date()
    );
    res.json({ success: true, data: breakdown });'
  } catch (error) {''
    logger.error('Error getting source breakdown:', error);
    res'
      .status(500)''
      .json({ success: false, message: 'Failed to get source breakdown' });
  }
});'
// Get quality distribution''
router.get('/quality-distribution', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const distribution =
      await dataQualityMonitoringService.getQualityDistribution(
        startDate
          ? new Date(startDate)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate ? new Date(endDate) : new Date()
      );
    res.json({ success: true, data: distribution });'
  } catch (error) {''
    logger.error('Error getting quality distribution:', error);
    res'
      .status(500)''
      .json({ success: false, message: 'Failed to get quality distribution' });
  }
});'
// Get annotator performance''
router.get('/annotator-performance', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const performance =
      await dataQualityMonitoringService.getAnnotatorPerformance(
        startDate
          ? new Date(startDate)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate ? new Date(endDate) : new Date()
      );
    res.json({ success: true, data: performance });'
  } catch (error) {''
    logger.error('Error getting annotator performance:', error);
    res'
      .status(500)''
      .json({ success: false, message: 'Failed to get annotator performance' });
  }
});'
// Get recent issues''
router.get('/recent-issues', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const issues = await dataQualityMonitoringService.getRecentIssues(
      startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate) : new Date()
    );
    res.json({ success: true, data: issues });'
  } catch (error) {''
    logger.error('Error getting recent issues:', error);
    res'
      .status(500)''
      .json({ success: false, message: 'Failed to get recent issues' });
  }
});'
// Get improvement suggestions''
router.get('/improvement-suggestions', authenticateToken, async (req, res) => {
  try {
    const suggestions =
      await dataQualityMonitoringService.getImprovementSuggestions();
    res.json({ success: true, data: suggestions });'
  } catch (error) {''
    logger.error('Error getting improvement suggestions:', error);
    res.status(500).json({'
      success: false,''
      message: 'Failed to get improvement suggestions',
    });
  }
});

// ==================== ?��?管�??��?路由 ===================='
// ?�交?��?''
router.post('/feedback', authenticateToken, async (req, res) => {
  try {
    const feedbackData = {
      ...req.body,
      userId: req.user.id,
    };

    const feedback = await feedbackService.submitFeedback(feedbackData);

    res.json({'
      success: true,''
      message: '?��?已�?�?,
      data: feedback,
    });'
  } catch (error) {''
    logger.error('?�交?��?失�?:', error);
    res.status(500).json({'
      success: false,''
      message: '?�交?��?失�?',
      error: error.message,
    });
  }
});'
// ?��??��??�Table''
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
      userId,
    } = req.query;

// eslint-disable-next-line no-unused-vars
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
      userId: userId ? parseInt(userId) : undefined,
    };

// eslint-disable-next-line no-unused-vars
    const result = await feedbackService.getFeedbacks(options);

    res.json({
      success: true,
      data: result,
    });'
  } catch (error) {''
    logger.error('?��??��??�表失�?:', error);
    res.status(500).json({'
      success: false,''
      message: '?��??��??�表失�?',
      error: error.message,
    });'
  }
});''
// ?��??�個�?饋詳??router.get('/feedback/:id', authenticateToken, async (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);
    const feedback = await feedbackService.getFeedbackById(feedbackId);

    res.json({
      success: true,
      data: feedback,
    });'
  } catch (error) {''
    logger.error('?��??��?詳�?失�?:', error);
    res.status(500).json({'
      success: false,''
      message: '?��??��?詳�?失�?',
      error: error.message,
    });'
  }
});''
// ?�新?��??�??router.put('/feedback/:id/status', authenticateToken, async (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);
    const { status, resolution } = req.body;

    const feedback = await feedbackService.updateFeedbackStatus(
      feedbackId,
      status,
      req.user.id,
      resolution
    );

    res.json({'
      success: true,''
      message: '?��??�?�已?�新',
      data: feedback,
    });'
  } catch (error) {''
    logger.error('?�新?��??�?�失??', error);
    res.status(500).json({'
      success: false,''
      message: '?�新?��??�?�失??,
      error: error.message,
    });
  }
});'
// ?��??��?''
router.put('/feedback/:id/assign', authenticateToken, async (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);
    const { assignedTo } = req.body;

    const feedback = await feedbackService.assignFeedback(
      feedbackId,
      assignedTo,
      req.user.id
    );

    res.json({'
      success: true,''
      message: '?��?已�???,
      data: feedback,
    });'
  } catch (error) {''
    logger.error('?��??��?失�?:', error);
    res.status(500).json({'
      success: false,''
      message: '?��??��?失�?',
      error: error.message,
    });
  }
});'
// 添�??��??��?''
router.post('/feedback/:id/response', authenticateToken, async (req, res) => {
  try {'
    const feedbackId = parseInt(req.params.id);''
    const { content, responseType = 'comment', isInternal = false } = req.body;

// eslint-disable-next-line no-unused-vars
    const response = await feedbackService.addResponse(
      feedbackId,
      req.user.id,
      content,
      responseType,
      isInternal
    );

    res.json({'
      success: true,''
      message: '?��?已添??,
      data: response,
    });'
  } catch (error) {''
    logger.error('添�??��??��?失�?:', error);
    res.status(500).json({'
      success: false,''
      message: '添�??��??��?失�?',
      error: error.message,
    });
  }
});'
// ?��??��?統�?''
router.get('/feedback/stats', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, feedbackType, category } = req.query;

// eslint-disable-next-line no-unused-vars
    const options = {
      startDate,
      endDate,
      feedbackType,
      category,
    };

    const stats = await feedbackService.getFeedbackStats(options);

    res.json({
      success: true,
      data: stats,
    });'
  } catch (error) {''
    logger.error('?��??��?統�?失�?:', error);
    res.status(500).json({'
      success: false,''
      message: '?��??��?統�?失�?',
      error: error.message,
    });'
  }
});''
// ?��??��??�進建�?router.get('/feedback/suggestions', authenticateToken, async (req, res) => {
  try {
    const suggestions = await feedbackService.generateImprovementSuggestions();

    res.json({
      success: true,
      data: suggestions,
    });'
  } catch (error) {''
    logger.error('?��??��??�進建議失??', error);
    res.status(500).json({'
      success: false,''
      message: '?��??��??�進建議失??,
      error: error.message,
    });
  }
});'
// 定�??��?質�?評估?��?路由''
router.post('/assessment/schedule', authenticateToken, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const scheduleData = {
      ...req.body,
      createdBy: req.user.id,
    };

// eslint-disable-next-line no-unused-vars
    const schedule =
      await assessmentService.createAssessmentSchedule(scheduleData);
    res.json({'
      success: true,''
      message: '評估計�??�建?��?',
      data: schedule,
    });'
  } catch (error) {''
    logger.error('?�建評估計�?失�?:', error);
    res.status(500).json({'
      success: false,''
      message: '?�建評估計�?失�?',
      error: error.message,
    });'
  }
});''
router.get('/assessment/schedules', authenticateToken, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      isActive:'
        req.query.isActive !== undefined''
          ? req.query.isActive === 'true'
          : undefined,
      assessmentType: req.query.assessmentType,
    };

// eslint-disable-next-line no-unused-vars
    const result = await assessmentService.getSchedules(options);
    res.json({
      success: true,
      data: result,
    });'
  } catch (error) {''
    logger.error('?��?評估計�??�表失�?:', error);
    res.status(500).json({'
      success: false,''
      message: '?��?評估計�??�表失�?',
      error: error.message,
    });
  }
});'
router.put(''
  '/assessment/schedule/:id/status',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

// eslint-disable-next-line no-unused-vars
      const schedule = await assessmentService.updateScheduleStatus(
        id,
        isActive
      );
      res.json({'
        success: true,''
        message: '評估計�??�?�更?��???,
        data: schedule,
      });'
    } catch (error) {''
      logger.error('?�新評估計�??�?�失??', error);
      res.status(500).json({'
        success: false,''
        message: '?�新評估計�??�?�失??,
        error: error.message,
      });
    }
  }
);'
router.delete(''
  '/assessment/schedule/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      await assessmentService.deleteSchedule(id);
      res.json({'
        success: true,''
        message: '評估計�??�除?��?',
      });'
    } catch (error) {''
      logger.error('?�除評估計�?失�?:', error);
      res.status(500).json({'
        success: false,''
        message: '?�除評估計�?失�?',
        error: error.message,
      });
    }'
  }
);''
router.post('/assessment/execute', authenticateToken, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const assessmentData = {
      ...req.body,
      userId: req.user.id,
    };

// eslint-disable-next-line no-unused-vars
    const assessment =
      await assessmentService.executeManualAssessment(assessmentData);
    res.json({'
      success: true,''
      message: '?��?評估?��??��?',
      data: assessment,
    });'
  } catch (error) {''
    logger.error('?��??��?評估失�?:', error);
    res.status(500).json({'
      success: false,''
      message: '?��??��?評估失�?',
      error: error.message,
    });
  }
});'
router.post(''
  '/assessment/schedule/:id/execute',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

// eslint-disable-next-line no-unused-vars
      const assessment = await assessmentService.executeScheduledAssessment('
        id,''
        'manual',
        req.user.id
      );
      res.json({'
        success: true,''
        message: '計�?評估?��??��?',
        data: assessment,
      });'
    } catch (error) {''
      logger.error('?��?計�?評估失�?:', error);
      res.status(500).json({'
        success: false,''
        message: '?��?計�?評估失�?',
        error: error.message,
      });
    }'
  }
);''
router.get('/assessment/list', authenticateToken, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      status: req.query.status,
      assessmentType: req.query.assessmentType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      triggeredBy: req.query.triggeredBy,
    };

// eslint-disable-next-line no-unused-vars
    const result = await assessmentService.getAssessments(options);
    res.json({
      success: true,
      data: result,
    });'
  } catch (error) {''
    logger.error('?��?評估?�表失�?:', error);
    res.status(500).json({'
      success: false,''
      message: '?��?評估?�表失�?',
      error: error.message,
    });'
  }
});''
router.get('/assessment/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

// eslint-disable-next-line no-unused-vars'
    const assessment =''
      await require('../models/DataQualityAssessment').findByPk(id, {
        include: ['
          {''
            model: require('../models/User'),''
            as: 'TriggeredByUser',''
            attributes: ['id', 'username', 'email'],
          },
        ],
      });

    if (!assessment) {
      return res.status(404).json({'
        success: false,''
        message: '評估記�?不�???,
      });
    }
    res.json({
      success: true,
      data: assessment,
    });'
  } catch (error) {''
    logger.error('?��?評估詳�?失�?:', error);
    res.status(500).json({'
      success: false,''
      message: '?��?評估詳�?失�?',
      error: error.message,
    });'
  }
});''
router.get('/assessment/stats', authenticateToken, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      assessmentType: req.query.assessmentType,
    };

    const stats = await assessmentService.getAssessmentStats(options);
    res.json({
      success: true,
      data: stats,
    });'
  } catch (error) {''
    logger.error('?��?評估統�?失�?:', error);
    res.status(500).json({'
      success: false,''
      message: '?��?評估統�?失�?',
      error: error.message,
    });
  }
});'
module.exports = router;''
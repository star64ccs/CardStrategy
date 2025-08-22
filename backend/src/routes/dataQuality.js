const express = require('express');
const router = express.Router();
// eslint-disable-next-line no-unused-vars
const dataCollectionService = require('../services/dataCollectionService');
const annotationService = require('../services/annotationService');
// eslint-disable-next-line no-unused-vars
const dataCleaningService = require('../services/dataCleaningService');
// eslint-disable-next-line no-unused-vars
const dataQualityMonitoringService = require('../services/dataQualityMonitoringService');
const feedbackService = require('../services/feedbackService');
// eslint-disable-next-line no-unused-vars
const assessmentService = require('../services/assessmentService');
const { authenticateToken } = require('../middleware/auth');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');

// å°Žå…¥çµ±ä?è·¯ç”±?•ç???const {
  createPostHandler,
  createGetHandler,
  createPutHandler,
  createDeleteHandler,
  createPaginatedHandler,
  createSearchHandler,
  createBatchHandler,
  createCustomError,
} = require('../middleware/routeHandler');

// å°Žå…¥é©—è?ä¸­é?ä»?const { body, query } = require('express-validator');

// é©—è?ä¸­é?ä»¶å?ç¾?const validateDataCollection = [
  body('source').optional().isString().withMessage('?¸æ?æºå??ˆæ˜¯å­—ç¬¦ä¸?),
  body('quality')
    .optional()
    .isIn(['high', 'medium', 'low'])
    .withMessage('è³ªé?ç­‰ç?å¿…é???high/medium/low'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'pending'])
    .withMessage('?€?‹å??ˆæ˜¯ active/inactive/pending'),
];

const validateAnnotationAssignment = [
  body('batchSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('?¹æ¬¡å¤§å?å¿…é???-100ä¹‹é?'),
  body('priorityFilter')
    .optional()
    .isIn(['high', 'medium', 'low'])
    .withMessage('?ªå?ç´šé?æ¿¾å™¨å¿…é???high/medium/low'),
  body('difficultyFilter')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('??º¦?Žæ¿¾?¨å??ˆæ˜¯ easy/medium/hard'),
  body('annotationTypeFilter')
    .optional()
    .isString()
    .withMessage('æ¨™è¨»é¡žå??Žæ¿¾?¨å??ˆæ˜¯å­—ç¬¦ä¸?),
  body('forceReassignment')
    .optional()
    .isBoolean()
    .withMessage('å¼·åˆ¶?æ–°?†é?å¿…é??¯å??¾å€?),
];

const validateAnnotationSubmission = [
  body('annotationId').isString().withMessage('æ¨™è¨»IDå¿…é??¯å?ç¬¦ä¸²'),
  body('annotationResult').notEmpty().withMessage('æ¨™è¨»çµæ?ä¸èƒ½?ºç©º'),
  body('confidence')
    .isFloat({ min: 0, max: 1 })
    .withMessage('ç½®ä¿¡åº¦å??ˆåœ¨0-1ä¹‹é?'),
];

const validateAnnotationReview = [
  body('annotationId').isString().withMessage('æ¨™è¨»IDå¿…é??¯å?ç¬¦ä¸²'),
  body('reviewStatus')
    .isIn(['approved', 'rejected', 'pending'])
    .withMessage('å¯©æ ¸?€?‹å??ˆæ˜¯ approved/rejected/pending'),
  body('reviewNotes').optional().isString().withMessage('å¯©æ ¸?™è¨»å¿…é??¯å?ç¬¦ä¸²'),
];

const validateBatchReview = [
  body('reviews').isArray().withMessage('å¯©æ ¸?—è¡¨å¿…é??¯æ•¸çµ?),
  body('reviews.*.annotationId').isString().withMessage('æ¨™è¨»IDå¿…é??¯å?ç¬¦ä¸²'),
  body('reviews.*.reviewStatus')
    .isIn(['approved', 'rejected', 'pending'])
    .withMessage('å¯©æ ¸?€?‹å??ˆæ˜¯ approved/rejected/pending'),
];

const validateDataCleaning = [
  body('cleaningType')
    .isIn(['duplicate', 'quality', 'format', 'integrity', 'metadata'])
    .withMessage('æ¸…æ?é¡žå?å¿…é??¯æ??ˆç?é¡žå?'),
  body('options').optional().isObject().withMessage('?¸é?å¿…é??¯å?è±?),
];

const validateQualityAssessment = [
  body('assessmentType')
    .isIn(['completeness', 'accuracy', 'consistency', 'timeliness', 'overall'])
    .withMessage('è©•ä¼°é¡žå?å¿…é??¯æ??ˆç?é¡žå?'),
  body('criteria').optional().isObject().withMessage('è©•ä¼°æ¨™æ?å¿…é??¯å?è±?),
];

const validateFeedbackSubmission = [
  body('type')
    .isIn(['bug_report', 'feature_request', 'data_quality', 'general'])
    .withMessage('?é?é¡žå?å¿…é??¯æ??ˆç?é¡žå?'),
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('æ¨™é?å¿…é???-200?‹å?ç¬¦ä???),
  body('description')
    .isLength({ min: 1, max: 2000 })
    .withMessage('?è¿°å¿…é???-2000?‹å?ç¬¦ä???),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('?ªå?ç´šå??ˆæ˜¯ low/medium/high/urgent'),
  body('category').optional().isString().withMessage('é¡žåˆ¥å¿…é??¯å?ç¬¦ä¸²'),
];

const validateQueryParams = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('?‹å??¥æ?å¿…é??¯æ??ˆç?ISO8601?¼å?'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('çµæ??¥æ?å¿…é??¯æ??ˆç?ISO8601?¼å?'),
  query('source').optional().isString().withMessage('?¸æ?æºå??ˆæ˜¯å­—ç¬¦ä¸?),
  query('quality')
    .optional()
    .isIn(['high', 'medium', 'low'])
    .withMessage('è³ªé?ç­‰ç?å¿…é???high/medium/low'),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'pending'])
    .withMessage('?€?‹å??ˆæ˜¯ active/inactive/pending'),
  query('page').optional().isInt({ min: 1 }).withMessage('?ç¢¼å¿…é??¯æ­£?´æ•¸'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('?åˆ¶å¿…é???-100ä¹‹é?'),
];

// ?¸æ??¶é??¸é?è·¯ç”±
router.post(
  '/collect',
  createPostHandler(
    async (req, res) => {
// eslint-disable-next-line no-unused-vars
      const results = await dataCollectionService.collectFromMultipleSources();
      return {
        success: true,
        message: '?¸æ??¶é?å®Œæ?',
        data: results,
      };
    },
    { auth: true, validation: validateDataCollection }
  )
);

// ?²å??¸æ??¶é?çµ±è?
router.get(
  '/collect/stats',
  createGetHandler(
    async (req, res) => {
      const { startDate, endDate, source, quality, status } = req.query;

      // æ§‹å»º?¥è©¢?¸é?
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
    { auth: true, validation: validateQueryParams }
  )
);

// ?ºèƒ½æ¨™è¨»ä»»å??†é?
router.post(
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

      return {
        success: true,
        message: '?ºèƒ½æ¨™è¨»ä»»å??†é?å®Œæ?',
        data: {
          totalAssigned: assignments.length,
          assignments,
          algorithm: 'smart_assignment_v2',
          timestamp: new Date(),
        },
      };
    },
    { auth: true, validation: validateAnnotationAssignment }
  )
);

// ?äº¤æ¨™è¨»çµæ?
router.post(
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

      return {
        success: true,
        message: 'æ¨™è¨»çµæ??äº¤?å?',
        data: result,
      };
    },
    { auth: true, validation: validateAnnotationSubmission }
  )
);

// å¯©æ ¸æ¨™è¨»çµæ?
router.post(
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

      return {
        success: true,
        message: 'æ¨™è¨»å¯©æ ¸å®Œæ?',
        data: result,
      };
    },
    { auth: true, validation: validateAnnotationReview }
  )
);

// ?¹é?å¯©æ ¸æ¨™è¨»çµæ?
router.post(
  '/annotate/batch-review',
  createBatchHandler(
    async (req, res) => {
      const { reviews } = req.body;
      const reviewerId = req.user.id;

      // ?ºæ??‹å¯©?¸æ·»? å¯©?¸è€…ID
      const reviewsWithReviewer = reviews.map((review) => ({
        ...review,
        reviewerId,
      }));

// eslint-disable-next-line no-unused-vars
      const results =
        await annotationService.batchReviewAnnotations(reviewsWithReviewer);

      return {
        success: true,
        message: '?¹é?å¯©æ ¸å®Œæ?',
        data: {
          totalReviewed: results.length,
          successfulReviews: results.filter((r) => r.success).length,
          failedReviews: results.filter((r) => !r.success).length,
          results,
        },
      };
    },
    { auth: true, validation: validateBatchReview }
  )
);

// ?²å?æ¨™è¨»çµ±è?
router.get(
  '/annotate/stats',
  createGetHandler(
    async (req, res) => {
      const stats = await annotationService.getAnnotationStats();

      return {
        success: true,
        data: stats,
      };
    },
    { auth: true }
  )
);

// å­¸ç?æ©Ÿåˆ¶ï¼šæ ¹?šå¯¦?›ç??œèª¿?´å??ç???router.post(
  '/annotate/learn',
  createPostHandler(
    async (req, res) => {
      const { annotationId, actualQuality, processingTime } = req.body;

      await annotationService.learnFromResults(
        annotationId,
        actualQuality,
        processingTime
      );

      return {
        success: true,
        message: 'å­¸ç?æ©Ÿåˆ¶?´æ–°?å?',
        data: {
          annotationId,
          actualQuality,
          processingTime,
          timestamp: new Date(),
        },
      };
    },
    { auth: true }
  )
);

// ?²å??†é?ç®—æ??ç½®
router.get(
  '/annotate/config',
  createGetHandler(
    async (req, res) => {
// eslint-disable-next-line no-unused-vars
      const config = annotationService.assignmentConfig;

      return {
        success: true,
        data: {
          config,
          algorithm: 'smart_assignment_v2',
          version: '2.0',
          features: [
            '?ºèƒ½è² è??‡è¡¡',
            'å°ˆæ¥­?–å???,
            '?•æ??ªå?ç´?,
            'è³ªé??æ¸¬',
            'å­¸ç?æ©Ÿåˆ¶',
          ],
        },
      };
    },
    { auth: true }
  )
);

// ?´æ–°?†é?ç®—æ??ç½®
router.put(
  '/annotate/config',
  createPutHandler(
    async (req, res) => {
      const { config } = req.body;

      // ?´æ–°?ç½®
      Object.assign(annotationService.assignmentConfig, config);

      return {
        success: true,
        message: '?†é?ç®—æ??ç½®?´æ–°?å?',
        data: {
          config: annotationService.assignmentConfig,
          timestamp: new Date(),
        },
      };
    },
    { auth: true }
  )
);

// ?²å?æ¨™è¨»?…è©³ç´°ä¿¡??router.get('/annotate/annotators', authenticateToken, async (req, res) => {
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
        activeCount: annotators.filter((a) => a.isActive).length,
      },
    });
  } catch (error) {
    logger.error('?²å?æ¨™è¨»?…è©³ç´°ä¿¡?¯å¤±??', error);
    res.status(500).json({
      success: false,
      message: '?²å?æ¨™è¨»?…è©³ç´°ä¿¡?¯å¤±??,
      error: error.message,
    });
  }
});

// ?·è??¸æ?æ¸…æ?
router.post('/clean', authenticateToken, async (req, res) => {
  try {
    logger.info('?‹å??¸æ?æ¸…æ?æµç?');
// eslint-disable-next-line no-unused-vars
    const results = await dataCleaningService.performDataCleaning();

    res.json({
      success: true,
      message: '?¸æ?æ¸…æ?å®Œæ?',
      data: results,
    });
  } catch (error) {
    logger.error('?¸æ?æ¸…æ?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: '?¸æ?æ¸…æ?å¤±æ?',
      error: error.message,
    });
  }
});

// ?²å??¸æ?è³ªé??‡æ?
router.get('/quality-metrics', authenticateToken, async (req, res) => {
  try {
    const { dataType, limit = 10 } = req.query;

// eslint-disable-next-line no-unused-vars
    const DataQualityMetrics = require('../models/DataQualityMetrics');
    const { getDataQualityMetricsModel } = DataQualityMetrics;
// eslint-disable-next-line no-unused-vars
    const DataQualityMetricsModel = getDataQualityMetricsModel();

    const whereClause = {};
    if (dataType) {
      whereClause.dataType = dataType;
    }

    const metrics = await DataQualityMetricsModel.findAll({
      where: whereClause,
      order: [['assessmentDate', 'DESC']],
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('?²å??¸æ?è³ªé??‡æ?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: '?²å??¸æ?è³ªé??‡æ?å¤±æ?',
      error: error.message,
    });
  }
});

// ?²å??¸æ?è³ªé??±å?
router.get('/quality-report', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

// eslint-disable-next-line no-unused-vars
    const DataQualityMetrics = require('../models/DataQualityMetrics');
    const { getDataQualityMetricsModel } = DataQualityMetrics;
// eslint-disable-next-line no-unused-vars
    const DataQualityMetricsModel = getDataQualityMetricsModel();

    const whereClause = {};
    if (startDate && endDate) {
      whereClause.assessmentDate = {
        [require('sequelize').Op.between]: [
          new Date(startDate),
          new Date(endDate),
        ],
      };
    }

    const metrics = await DataQualityMetricsModel.findAll({
      where: whereClause,
      order: [['assessmentDate', 'DESC']],
    });

    // è¨ˆç?çµ±è??¸æ?
    const report = {
      totalAssessments: metrics.length,
      averageOverallScore: 0,
      dataTypeDistribution: {},
      qualityTrend: 'stable',
      recommendations: [],
    };

    if (metrics.length > 0) {
      const totalScore = metrics.reduce(
        (sum, metric) => sum + parseFloat(metric.overallScore),
        0
      );
      report.averageOverallScore = totalScore / metrics.length;

      // è¨ˆç??¸æ?é¡žå??†ä?
      metrics.forEach((metric) => {
        report.dataTypeDistribution[metric.dataType] =
          (report.dataTypeDistribution[metric.dataType] || 0) + 1;
      });

      // ?†æ?è³ªé?è¶¨å‹¢
      if (metrics.length >= 2) {
// eslint-disable-next-line no-unused-vars
        const recentScore = parseFloat(metrics[0].overallScore);
        const previousScore = parseFloat(metrics[1].overallScore);

        if (recentScore > previousScore + 0.05) {
          report.qualityTrend = 'improving';
        } else if (recentScore < previousScore - 0.05) {
          report.qualityTrend = 'declining';
        }
      }

      // ?Ÿæ?å»ºè­°
      const allSuggestions = metrics
        .flatMap((metric) => metric.metadata.improvementSuggestions || [])
        .filter(
          (suggestion, index, array) => array.indexOf(suggestion) === index
        );

      report.recommendations = allSuggestions.slice(0, 5); // ?–å?5?‹å»ºè­?    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('?²å??¸æ?è³ªé??±å?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: '?²å??¸æ?è³ªé??±å?å¤±æ?',
      error: error.message,
    });
  }
});

// å®Œæ•´?„æ•¸?šè³ª?æ”¹?²æ?ç¨?router.post('/improve', authenticateToken, async (req, res) => {
  try {
    logger.info('?‹å?å®Œæ•´?„æ•¸?šè³ª?æ”¹?²æ?ç¨?);

// eslint-disable-next-line no-unused-vars
    const results = {
      collection: null,
      annotation: null,
      cleaning: null,
      overallQuality: 0,
    };

    // 1. ?¸æ??¶é?
    try {
      results.collection =
        await dataCollectionService.collectFromMultipleSources();
      logger.info('?¸æ??¶é?å®Œæ?');
    } catch (error) {
      logger.error('?¸æ??¶é?æ­¥é?å¤±æ?:', error);
    }

    // 2. æ¨™è¨»ä»»å??†é?
    try {
      const assignments = await annotationService.assignAnnotationTasks();
      results.annotation = {
        totalAssigned: assignments.length,
        assignments,
      };
      logger.info('æ¨™è¨»ä»»å??†é?å®Œæ?');
    } catch (error) {
      logger.error('æ¨™è¨»ä»»å??†é?æ­¥é?å¤±æ?:', error);
    }

    // 3. ?¸æ?æ¸…æ?
    try {
      results.cleaning = await dataCleaningService.performDataCleaning();
      logger.info('?¸æ?æ¸…æ?å®Œæ?');
    } catch (error) {
      logger.error('?¸æ?æ¸…æ?æ­¥é?å¤±æ?:', error);
    }

    // 4. è¨ˆç??´é?è³ªé??†æ•¸
    const qualityScores = [];
    if (results.collection) qualityScores.push(0.8); // ?‡è¨­?¶é?è³ªé?
    if (results.annotation) qualityScores.push(0.85); // ?‡è¨­æ¨™è¨»è³ªé?
    if (results.cleaning) qualityScores.push(0.9); // ?‡è¨­æ¸…æ?è³ªé?

    results.overallQuality =
      qualityScores.length > 0
        ? qualityScores.reduce((sum, score) => sum + score, 0) /
          qualityScores.length
        : 0;

    res.json({
      success: true,
      message: '?¸æ?è³ªé??¹é€²æ?ç¨‹å???,
      data: results,
    });
  } catch (error) {
    logger.error('?¸æ?è³ªé??¹é€²æ?ç¨‹å¤±??', error);
    res.status(500).json({
      success: false,
      message: '?¸æ?è³ªé??¹é€²æ?ç¨‹å¤±??,
      error: error.message,
    });
  }
});

// ?²å??¸æ?è³ªé??¹é€²å»ºè­?router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const recommendations = {
      dataCollection: [
        'å¢žå?å®˜æ–¹API?¸æ?æºç??¥å…¥',
        '?é??¨æˆ¶ä¸Šå‚³?¸æ??„è³ª?æ?æº?,
        'å»ºç??¸æ??¶é??„è³ª?æª¢?¥æ???,
        '?ªå?ç¬¬ä??¹å¹³?°æ•¸?šç??¶é?æµç?',
        '? å¼·?¨æˆ¶ç³¾æ­£?¸æ??„æ”¶??,
      ],
      annotation: [
        'å»ºç??´è©³ç´°ç?æ¨™è¨»?‡å?',
        '? å¼·æ¨™è¨»?…ç??¹è??Œè?è­?,
        'å¯¦æ–½å¤šå±¤å¯©æ ¸æ©Ÿåˆ¶',
        'å»ºç?æ¨™è¨»è³ªé??Žå‹µ?¶åº¦',
        '?ªå?æ¨™è¨»ä»»å??†é?ç®—æ?',
      ],
      cleaning: [
        '?é??è??¸æ?æª¢æ¸¬?„æ?ç¢ºæ€?,
        '?ªå?ä½Žè³ª?æ•¸?šç?è­˜åˆ¥æ¨™æ?',
        'å»ºç??´å??„ç??¸æ??¼å?æ¨™æ?',
        '? å¼·?¸æ?å®Œæ•´?§é?è­?,
        'è±å??¸æ??ƒæ•¸?šä¿¡??,
      ],
      general: [
        'å»ºç??¸æ?è³ªé???Ž§?€è¡¨æ¿',
        'å¯¦æ–½å®šæ??¸æ?è³ªé?è©•ä¼°',
        'å»ºç??¸æ?è³ªé??¹é€²å?é¥‹æ???,
        '? å¼·?¸æ?è³ªé??¸é??„åŸ¹è¨?,
        'å»ºç??¸æ?è³ªé?ç®¡ç??„æ?ä½³å¯¦è¸?,
      ],
    };

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    logger.error('?²å??¹é€²å»ºè­°å¤±??', error);
    res.status(500).json({
      success: false,
      message: '?²å??¹é€²å»ºè­°å¤±??,
      error: error.message,
    });
  }
});

// Dashboard endpoints
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, dataTypes } = req.query;

// eslint-disable-next-line no-unused-vars
    const options = {};
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);
    if (dataTypes) options.dataTypes = dataTypes.split(',');

    const dashboardData =
      await dataQualityMonitoringService.getDashboardData(options);
    res.json({ success: true, data: dashboardData });
  } catch (error) {
    logger.error('Error getting dashboard data:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to get dashboard data' });
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

// eslint-disable-next-line no-unused-vars
    const options = {};
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);
    if (dataTypes) options.dataTypes = dataTypes.split(',');

    const metrics = await dataQualityMonitoringService.getOverallMetrics(
      options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      options.endDate || new Date(),
      options.dataTypes || [
        'training',
        'annotation',
        'validation',
        'market',
        'user_generated',
      ]
    );
    res.json({ success: true, data: metrics });
  } catch (error) {
    logger.error('Error getting overall metrics:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to get overall metrics' });
  }
});

// Get trend data
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, dataTypes } = req.query;

// eslint-disable-next-line no-unused-vars
    const options = {};
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);
    if (dataTypes) options.dataTypes = dataTypes.split(',');

    const trendData = await dataQualityMonitoringService.getTrendData(
      options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      options.endDate || new Date(),
      options.dataTypes || [
        'training',
        'annotation',
        'validation',
        'market',
        'user_generated',
      ]
    );
    res.json({ success: true, data: trendData });
  } catch (error) {
    logger.error('Error getting trend data:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to get trend data' });
  }
});

// Get source breakdown
router.get('/source-breakdown', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const breakdown = await dataQualityMonitoringService.getSourceBreakdown(
      startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate) : new Date()
    );
    res.json({ success: true, data: breakdown });
  } catch (error) {
    logger.error('Error getting source breakdown:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to get source breakdown' });
  }
});

// Get quality distribution
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
    res.json({ success: true, data: distribution });
  } catch (error) {
    logger.error('Error getting quality distribution:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to get quality distribution' });
  }
});

// Get annotator performance
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
    res.json({ success: true, data: performance });
  } catch (error) {
    logger.error('Error getting annotator performance:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to get annotator performance' });
  }
});

// Get recent issues
router.get('/recent-issues', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const issues = await dataQualityMonitoringService.getRecentIssues(
      startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate) : new Date()
    );
    res.json({ success: true, data: issues });
  } catch (error) {
    logger.error('Error getting recent issues:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to get recent issues' });
  }
});

// Get improvement suggestions
router.get('/improvement-suggestions', authenticateToken, async (req, res) => {
  try {
    const suggestions =
      await dataQualityMonitoringService.getImprovementSuggestions();
    res.json({ success: true, data: suggestions });
  } catch (error) {
    logger.error('Error getting improvement suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get improvement suggestions',
    });
  }
});

// ==================== ?é?ç®¡ç??¸é?è·¯ç”± ====================

// ?äº¤?é?
router.post('/feedback', authenticateToken, async (req, res) => {
  try {
    const feedbackData = {
      ...req.body,
      userId: req.user.id,
    };

    const feedback = await feedbackService.submitFeedback(feedbackData);

    res.json({
      success: true,
      message: '?é?å·²æ?äº?,
      data: feedback,
    });
  } catch (error) {
    logger.error('?äº¤?é?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: '?äº¤?é?å¤±æ?',
      error: error.message,
    });
  }
});

// ?²å??é??—è¡¨
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
    });
  } catch (error) {
    logger.error('?²å??é??—è¡¨å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: '?²å??é??—è¡¨å¤±æ?',
      error: error.message,
    });
  }
});

// ?²å??®å€‹å?é¥‹è©³??router.get('/feedback/:id', authenticateToken, async (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);
    const feedback = await feedbackService.getFeedbackById(feedbackId);

    res.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    logger.error('?²å??é?è©³æ?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: '?²å??é?è©³æ?å¤±æ?',
      error: error.message,
    });
  }
});

// ?´æ–°?é??€??router.put('/feedback/:id/status', authenticateToken, async (req, res) => {
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
      message: '?é??€?‹å·²?´æ–°',
      data: feedback,
    });
  } catch (error) {
    logger.error('?´æ–°?é??€?‹å¤±??', error);
    res.status(500).json({
      success: false,
      message: '?´æ–°?é??€?‹å¤±??,
      error: error.message,
    });
  }
});

// ?†é??é?
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
      message: '?é?å·²å???,
      data: feedback,
    });
  } catch (error) {
    logger.error('?†é??é?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: '?†é??é?å¤±æ?',
      error: error.message,
    });
  }
});

// æ·»å??é??žæ?
router.post('/feedback/:id/response', authenticateToken, async (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);
    const { content, responseType = 'comment', isInternal = false } = req.body;

// eslint-disable-next-line no-unused-vars
    const response = await feedbackService.addResponse(
      feedbackId,
      req.user.id,
      content,
      responseType,
      isInternal
    );

    res.json({
      success: true,
      message: '?žæ?å·²æ·»??,
      data: response,
    });
  } catch (error) {
    logger.error('æ·»å??é??žæ?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: 'æ·»å??é??žæ?å¤±æ?',
      error: error.message,
    });
  }
});

// ?²å??é?çµ±è?
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
    });
  } catch (error) {
    logger.error('?²å??é?çµ±è?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: '?²å??é?çµ±è?å¤±æ?',
      error: error.message,
    });
  }
});

// ?²å??é??¹é€²å»ºè­?router.get('/feedback/suggestions', authenticateToken, async (req, res) => {
  try {
    const suggestions = await feedbackService.generateImprovementSuggestions();

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    logger.error('?²å??é??¹é€²å»ºè­°å¤±??', error);
    res.status(500).json({
      success: false,
      message: '?²å??é??¹é€²å»ºè­°å¤±??,
      error: error.message,
    });
  }
});

// å®šæ??¸æ?è³ªé?è©•ä¼°?¸é?è·¯ç”±
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
    res.json({
      success: true,
      message: 'è©•ä¼°è¨ˆå??µå»º?å?',
      data: schedule,
    });
  } catch (error) {
    logger.error('?µå»ºè©•ä¼°è¨ˆå?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: '?µå»ºè©•ä¼°è¨ˆå?å¤±æ?',
      error: error.message,
    });
  }
});

router.get('/assessment/schedules', authenticateToken, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      isActive:
        req.query.isActive !== undefined
          ? req.query.isActive === 'true'
          : undefined,
      assessmentType: req.query.assessmentType,
    };

// eslint-disable-next-line no-unused-vars
    const result = await assessmentService.getSchedules(options);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('?²å?è©•ä¼°è¨ˆå??—è¡¨å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: '?²å?è©•ä¼°è¨ˆå??—è¡¨å¤±æ?',
      error: error.message,
    });
  }
});

router.put(
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
      res.json({
        success: true,
        message: 'è©•ä¼°è¨ˆå??€?‹æ›´?°æ???,
        data: schedule,
      });
    } catch (error) {
      logger.error('?´æ–°è©•ä¼°è¨ˆå??€?‹å¤±??', error);
      res.status(500).json({
        success: false,
        message: '?´æ–°è©•ä¼°è¨ˆå??€?‹å¤±??,
        error: error.message,
      });
    }
  }
);

router.delete(
  '/assessment/schedule/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      await assessmentService.deleteSchedule(id);
      res.json({
        success: true,
        message: 'è©•ä¼°è¨ˆå??ªé™¤?å?',
      });
    } catch (error) {
      logger.error('?ªé™¤è©•ä¼°è¨ˆå?å¤±æ?:', error);
      res.status(500).json({
        success: false,
        message: '?ªé™¤è©•ä¼°è¨ˆå?å¤±æ?',
        error: error.message,
      });
    }
  }
);

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
    res.json({
      success: true,
      message: '?‹å?è©•ä¼°?·è??å?',
      data: assessment,
    });
  } catch (error) {
    logger.error('?·è??‹å?è©•ä¼°å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: '?·è??‹å?è©•ä¼°å¤±æ?',
      error: error.message,
    });
  }
});

router.post(
  '/assessment/schedule/:id/execute',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

// eslint-disable-next-line no-unused-vars
      const assessment = await assessmentService.executeScheduledAssessment(
        id,
        'manual',
        req.user.id
      );
      res.json({
        success: true,
        message: 'è¨ˆå?è©•ä¼°?·è??å?',
        data: assessment,
      });
    } catch (error) {
      logger.error('?·è?è¨ˆå?è©•ä¼°å¤±æ?:', error);
      res.status(500).json({
        success: false,
        message: '?·è?è¨ˆå?è©•ä¼°å¤±æ?',
        error: error.message,
      });
    }
  }
);

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
    });
  } catch (error) {
    logger.error('?²å?è©•ä¼°?—è¡¨å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: '?²å?è©•ä¼°?—è¡¨å¤±æ?',
      error: error.message,
    });
  }
});

router.get('/assessment/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

// eslint-disable-next-line no-unused-vars
    const assessment =
      await require('../models/DataQualityAssessment').findByPk(id, {
        include: [
          {
            model: require('../models/User'),
            as: 'TriggeredByUser',
            attributes: ['id', 'username', 'email'],
          },
        ],
      });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'è©•ä¼°è¨˜é?ä¸å???,
      });
    }

    res.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    logger.error('?²å?è©•ä¼°è©³æ?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: '?²å?è©•ä¼°è©³æ?å¤±æ?',
      error: error.message,
    });
  }
});

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
    });
  } catch (error) {
    logger.error('?²å?è©•ä¼°çµ±è?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: '?²å?è©•ä¼°çµ±è?å¤±æ?',
      error: error.message,
    });
  }
});

module.exports = router;

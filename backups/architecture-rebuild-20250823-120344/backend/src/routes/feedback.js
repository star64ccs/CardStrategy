const express = require('express');
const logger = require('../utils/logger');
const router = express.Router();
const feedbackService = require('../services/feedbackService');
// eslint-disable-next-line no-unused-vars
const { authenticateToken: protect } = require('../middleware/auth');
const {
  validateFeedbackSubmission,
  validateFeedbackUpdate,
} = require('../middleware/validation');

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: ?�交?��?
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - feedbackType
 *               - category
 *               - severity
 *               - title
 *               - description
 *             properties:
 *               feedbackType:
 *                 type: string
 *                 enum: [data_quality, annotation_quality, system_suggestion, bug_report, feature_request]
 *               category:
 *                 type: string
 *                 enum: [card_recognition, centering_evaluation, authenticity_verification, price_prediction, data_collection, annotation_process, general]
 *               severity:
 *                 type: string
 *                 enum: [critical, high, medium, low]
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: ?��??�交?��?
 *       400:
 *         description: 請�??�數?�誤
 *       401:
 *         description: ?��?�? */
router.post('/', protect, validateFeedbackSubmission, async (req, res) => {
  try {
    const feedbackData = {
      ...req.body,
      userId: req.user.id,
    };

    const feedback = await feedbackService.submitFeedback(feedbackData);

    res.status(201).json({
      success: true,
      message: '?��??�交?��?',
      data: feedback,
    });
  } catch (error) {
    logger.error('?�交?��?失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?�交?��?失�?',
      code: 'FEEDBACK_SUBMISSION_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/feedback:
 *   get:
 *     summary: ?��??��??�表
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, resolved, closed]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [urgent, high, normal, low]
 *       - in: query
 *         name: feedbackType
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ?��??��??��??�表
 *       401:
 *         description: ?��?�? */
router.get('/', protect, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      status: req.query.status,
      priority: req.query.priority,
      feedbackType: req.query.feedbackType,
      category: req.query.category,
      severity: req.query.severity,
      userId: req.user.role === 'admin' ? undefined : req.user.id,
    };

// eslint-disable-next-line no-unused-vars
    const result = await feedbackService.getFeedbacks(options);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('?��??��??�表失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��??��??�表失�?',
      code: 'FEEDBACK_LIST_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/feedback/{id}:
 *   get:
 *     summary: ?��??��?詳�?
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ?��??��??��?詳�?
 *       404:
 *         description: ?��?不�??? *       401:
 *         description: ?��?�? */
router.get('/:id', protect, async (req, res) => {
  try {
    const feedback = await feedbackService.getFeedbackById(
      parseInt(req.params.id)
    );

    // 檢查權�?
    if (req.user.role !== 'admin' && feedback.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '?��??�查?�此?��?',
      });
    }

    res.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    logger.error('?��??��?詳�?失�?:', error);
    res.status(404).json({
      success: false,
      message: error.message || '?��?不�???,
      code: 'FEEDBACK_NOT_FOUND',
    });
  }
});

/**
 * @swagger
 * /api/feedback/{id}/status:
 *   put:
 *     summary: ?�新?��??�?? *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, resolved, closed]
 *               resolution:
 *                 type: string
 *     responses:
 *       200:
 *         description: ?�?�更?��??? *       400:
 *         description: 請�??�數?�誤
 *       401:
 *         description: ?��?�? */
router.put('/:id/status', protect, validateFeedbackUpdate, async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const feedbackId = parseInt(req.params.id);

    const feedback = await feedbackService.updateFeedbackStatus(
      feedbackId,
      status,
      req.user.id,
      resolution
    );

    res.json({
      success: true,
      message: '?��??�?�更?��???,
      data: feedback,
    });
  } catch (error) {
    logger.error('?�新?��??�?�失??', error);
    res.status(500).json({
      success: false,
      message: error.message || '?�新?��??�?�失??,
      code: 'FEEDBACK_STATUS_UPDATE_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/feedback/{id}/assign:
 *   put:
 *     summary: ?��??��?
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignedTo
 *             properties:
 *               assignedTo:
 *                 type: integer
 *     responses:
 *       200:
 *         description: ?��??��??��?
 *       400:
 *         description: 請�??�數?�誤
 *       401:
 *         description: ?��?�? */
router.put('/:id/assign', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '?��?管�??�可以�??��?�?,
      });
    }

    const { assignedTo } = req.body;
    const feedbackId = parseInt(req.params.id);

    const feedback = await feedbackService.assignFeedback(
      feedbackId,
      assignedTo,
      req.user.id
    );

    res.json({
      success: true,
      message: '?��??��??��?',
      data: feedback,
    });
  } catch (error) {
    logger.error('?��??��?失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��??��?失�?',
      code: 'FEEDBACK_ASSIGNMENT_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/feedback/{id}/responses:
 *   post:
 *     summary: 添�??��??��?
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 1000
 *               responseType:
 *                 type: string
 *                 enum: [comment, status_update, assignment]
 *                 default: comment
 *               isInternal:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: ?��?添�??��?
 *       400:
 *         description: 請�??�數?�誤
 *       401:
 *         description: ?��?�? */
router.post('/:id/responses', protect, async (req, res) => {
  try {
    const { content, responseType = 'comment', isInternal = false } = req.body;
    const feedbackId = parseInt(req.params.id);

// eslint-disable-next-line no-unused-vars
    const response = await feedbackService.addResponse(
      feedbackId,
      req.user.id,
      content,
      responseType,
      isInternal
    );

    res.status(201).json({
      success: true,
      message: '?��?添�??��?',
      data: response,
    });
  } catch (error) {
    logger.error('添�??��??��?失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '添�??��??��?失�?',
      code: 'FEEDBACK_RESPONSE_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/feedback/stats:
 *   get:
 *     summary: ?��??��?統�?
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: feedbackType
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ?��??��?統�??��?
 *       401:
 *         description: ?��?�? */
router.get('/stats', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '?��?管�??�可以查?�統計數??,
      });
    }

// eslint-disable-next-line no-unused-vars
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      feedbackType: req.query.feedbackType,
      category: req.query.category,
    };

    const stats = await feedbackService.getFeedbackStats(options);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('?��??��?統�?失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��??��?統�?失�?',
      code: 'FEEDBACK_STATS_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/feedback/suggestions:
 *   get:
 *     summary: ?��??�進建�? *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ?��??��??�進建�? *       401:
 *         description: ?��?�? */
router.get('/suggestions', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '?��?管�??�可以查?�改?�建�?,
      });
    }

    const suggestions = await feedbackService.generateImprovementSuggestions();

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    logger.error('?��??�進建議失??', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��??�進建議失??,
      code: 'FEEDBACK_SUGGESTIONS_ERROR',
    });
  }
});

module.exports = router;

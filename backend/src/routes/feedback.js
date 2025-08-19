const express = require('express');
const router = express.Router();
const feedbackService = require('../services/feedbackService');
const auth = require('../middleware/auth');
const { validateFeedbackSubmission, validateFeedbackUpdate } = require('../middleware/validation');

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: 提交反饋
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
 *         description: 反饋提交成功
 *       400:
 *         description: 請求參數錯誤
 *       401:
 *         description: 未授權
 */
router.post('/', auth, validateFeedbackSubmission, async (req, res) => {
  try {
    const feedbackData = {
      ...req.body,
      userId: req.user.id
    };

    const feedback = await feedbackService.submitFeedback(feedbackData);

    res.status(201).json({
      success: true,
      message: '反饋提交成功',
      data: feedback
    });
  } catch (error) {
    logger.error('提交反饋失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '提交反饋失敗',
      code: 'FEEDBACK_SUBMISSION_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/feedback:
 *   get:
 *     summary: 獲取反饋列表
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
 *         description: 成功獲取反饋列表
 *       401:
 *         description: 未授權
 */
router.get('/', auth, async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      status: req.query.status,
      priority: req.query.priority,
      feedbackType: req.query.feedbackType,
      category: req.query.category,
      severity: req.query.severity,
      userId: req.user.role === 'admin' ? undefined : req.user.id
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
      message: error.message || '獲取反饋列表失敗',
      code: 'FEEDBACK_LIST_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/feedback/{id}:
 *   get:
 *     summary: 獲取反饋詳情
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
 *         description: 成功獲取反饋詳情
 *       404:
 *         description: 反饋不存在
 *       401:
 *         description: 未授權
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const feedback = await feedbackService.getFeedbackById(parseInt(req.params.id));

    // 檢查權限
    if (req.user.role !== 'admin' && feedback.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '無權限查看此反饋'
      });
    }

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    logger.error('獲取反饋詳情失敗:', error);
    res.status(404).json({
      success: false,
      message: error.message || '反饋不存在',
      code: 'FEEDBACK_NOT_FOUND'
    });
  }
});

/**
 * @swagger
 * /api/feedback/{id}/status:
 *   put:
 *     summary: 更新反饋狀態
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, resolved, closed]
 *               resolution:
 *                 type: string
 *     responses:
 *       200:
 *         description: 狀態更新成功
 *       400:
 *         description: 請求參數錯誤
 *       401:
 *         description: 未授權
 */
router.put('/:id/status', auth, validateFeedbackUpdate, async (req, res) => {
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
      message: '反饋狀態更新成功',
      data: feedback
    });
  } catch (error) {
    logger.error('更新反饋狀態失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '更新反饋狀態失敗',
      code: 'FEEDBACK_STATUS_UPDATE_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/feedback/{id}/assign:
 *   put:
 *     summary: 分配反饋
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
 *         description: 反饋分配成功
 *       400:
 *         description: 請求參數錯誤
 *       401:
 *         description: 未授權
 */
router.put('/:id/assign', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '只有管理員可以分配反饋'
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
      message: '反饋分配成功',
      data: feedback
    });
  } catch (error) {
    logger.error('分配反饋失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '分配反饋失敗',
      code: 'FEEDBACK_ASSIGNMENT_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/feedback/{id}/responses:
 *   post:
 *     summary: 添加反饋回應
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
 *         description: 回應添加成功
 *       400:
 *         description: 請求參數錯誤
 *       401:
 *         description: 未授權
 */
router.post('/:id/responses', auth, async (req, res) => {
  try {
    const { content, responseType = 'comment', isInternal = false } = req.body;
    const feedbackId = parseInt(req.params.id);

    const response = await feedbackService.addResponse(
      feedbackId,
      req.user.id,
      content,
      responseType,
      isInternal
    );

    res.status(201).json({
      success: true,
      message: '回應添加成功',
      data: response
    });
  } catch (error) {
    logger.error('添加反饋回應失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '添加反饋回應失敗',
      code: 'FEEDBACK_RESPONSE_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/feedback/stats:
 *   get:
 *     summary: 獲取反饋統計
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
 *         description: 成功獲取統計數據
 *       401:
 *         description: 未授權
 */
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '只有管理員可以查看統計數據'
      });
    }

    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      feedbackType: req.query.feedbackType,
      category: req.query.category
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
      message: error.message || '獲取反饋統計失敗',
      code: 'FEEDBACK_STATS_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/feedback/suggestions:
 *   get:
 *     summary: 獲取改進建議
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取改進建議
 *       401:
 *         description: 未授權
 */
router.get('/suggestions', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '只有管理員可以查看改進建議'
      });
    }

    const suggestions = await feedbackService.generateImprovementSuggestions();

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    logger.error('獲取改進建議失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取改進建議失敗',
      code: 'FEEDBACK_SUGGESTIONS_ERROR'
    });
  }
});

module.exports = router;

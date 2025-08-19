const express = require('express');
const router = express.Router();
const alertService = require('../services/alertService');
const auth = require('../middleware/auth');
const { validateAlertCreation, validateAlertUpdate } = require('../middleware/validation');

/**
 * @swagger
 * /api/alerts:
 *   post:
 *     summary: 創建警報
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - severity
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [system, security, performance, data_quality, user_activity]
 *               severity:
 *                 type: string
 *                 enum: [critical, high, medium, low, info]
 *               message:
 *                 type: string
 *                 maxLength: 500
 *               details:
 *                 type: object
 *               source:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: 警報創建成功
 *       400:
 *         description: 請求參數錯誤
 *       401:
 *         description: 未授權
 */
router.post('/', auth, validateAlertCreation, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '只有管理員可以創建警報'
      });
    }

    const alertData = {
      ...req.body,
      createdBy: req.user.id
    };

    const alert = await alertService.createAlert(alertData);

    res.status(201).json({
      success: true,
      message: '警報創建成功',
      data: alert
    });
  } catch (error) {
    logger.error('創建警報失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '創建警報失敗',
      code: 'ALERT_CREATION_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: 獲取警報列表
 *     tags: [Alerts]
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
 *           enum: [active, resolved, dismissed]
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [critical, high, medium, low, info]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: 成功獲取警報列表
 *       401:
 *         description: 未授權
 */
router.get('/', auth, async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      status: req.query.status,
      severity: req.query.severity,
      type: req.query.type,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const result = await alertService.getAlerts(options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('獲取警報列表失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取警報列表失敗',
      code: 'ALERT_LIST_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/alerts/{id}:
 *   get:
 *     summary: 獲取警報詳情
 *     tags: [Alerts]
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
 *         description: 成功獲取警報詳情
 *       404:
 *         description: 警報不存在
 *       401:
 *         description: 未授權
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const alert = await alertService.getAlertById(parseInt(req.params.id));

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    logger.error('獲取警報詳情失敗:', error);
    res.status(404).json({
      success: false,
      message: error.message || '警報不存在',
      code: 'ALERT_NOT_FOUND'
    });
  }
});

/**
 * @swagger
 * /api/alerts/{id}/status:
 *   put:
 *     summary: 更新警報狀態
 *     tags: [Alerts]
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
 *                 enum: [active, resolved, dismissed]
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
router.put('/:id/status', auth, validateAlertUpdate, async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const alertId = parseInt(req.params.id);

    const alert = await alertService.updateAlertStatus(
      alertId,
      status,
      req.user.id,
      resolution
    );

    res.json({
      success: true,
      message: '警報狀態更新成功',
      data: alert
    });
  } catch (error) {
    logger.error('更新警報狀態失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '更新警報狀態失敗',
      code: 'ALERT_STATUS_UPDATE_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/alerts/{id}/acknowledge:
 *   post:
 *     summary: 確認警報
 *     tags: [Alerts]
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
 *         description: 警報確認成功
 *       400:
 *         description: 請求參數錯誤
 *       401:
 *         description: 未授權
 */
router.post('/:id/acknowledge', auth, async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);

    const alert = await alertService.acknowledgeAlert(alertId, req.user.id);

    res.json({
      success: true,
      message: '警報確認成功',
      data: alert
    });
  } catch (error) {
    logger.error('確認警報失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '確認警報失敗',
      code: 'ALERT_ACKNOWLEDGE_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/alerts/bulk/status:
 *   put:
 *     summary: 批量更新警報狀態
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alertIds
 *               - status
 *             properties:
 *               alertIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               status:
 *                 type: string
 *                 enum: [active, resolved, dismissed]
 *               resolution:
 *                 type: string
 *     responses:
 *       200:
 *         description: 批量更新成功
 *       400:
 *         description: 請求參數錯誤
 *       401:
 *         description: 未授權
 */
router.put('/bulk/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '只有管理員可以批量更新警報'
      });
    }

    const { alertIds, status, resolution } = req.body;

    const result = await alertService.bulkUpdateAlertStatus(
      alertIds,
      status,
      req.user.id,
      resolution
    );

    res.json({
      success: true,
      message: `成功更新 ${result.updatedCount} 個警報`,
      data: result
    });
  } catch (error) {
    logger.error('批量更新警報狀態失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '批量更新警報狀態失敗',
      code: 'ALERT_BULK_UPDATE_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/alerts/stats:
 *   get:
 *     summary: 獲取警報統計
 *     tags: [Alerts]
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
 *         name: type
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
      type: req.query.type
    };

    const stats = await alertService.getAlertStats(options);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('獲取警報統計失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取警報統計失敗',
      code: 'ALERT_STATS_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/alerts/active:
 *   get:
 *     summary: 獲取活躍警報
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取活躍警報
 *       401:
 *         description: 未授權
 */
router.get('/active', auth, async (req, res) => {
  try {
    const activeAlerts = await alertService.getActiveAlerts();

    res.json({
      success: true,
      data: activeAlerts
    });
  } catch (error) {
    logger.error('獲取活躍警報失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取活躍警報失敗',
      code: 'ALERT_ACTIVE_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/alerts/{id}:
 *   delete:
 *     summary: 刪除警報
 *     tags: [Alerts]
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
 *         description: 警報刪除成功
 *       400:
 *         description: 請求參數錯誤
 *       401:
 *         description: 未授權
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '只有管理員可以刪除警報'
      });
    }

    const alertId = parseInt(req.params.id);

    await alertService.deleteAlert(alertId);

    res.json({
      success: true,
      message: '警報刪除成功'
    });
  } catch (error) {
    logger.error('刪除警報失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '刪除警報失敗',
      code: 'ALERT_DELETE_ERROR'
    });
  }
});

module.exports = router;

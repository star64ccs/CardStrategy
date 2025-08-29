const express = require('express');
const logger = require('../utils/logger');
const router = express.Router();
const alertService = require('../services/alertService');
const { authenticateToken: protect } = require('../middleware/auth');
const {
  validateAlertCreation,
  validateAlertUpdate,
} = require('../middleware/validation');

/**
 * @swagger
 * /api/alerts:
 *   post:
 *     summary: ?�建警報
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
 *         description: 警報?�建?��?
 *       400:
 *         description: 請�??�數?�誤
 *       401:
 *         description: ?��?�? */
router.post('/', protect, validateAlertCreation, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '?��?管�??�可以創建警??,
      });
    }

    const alertData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const alert = await alertService.createAlert(alertData);

    res.status(201).json({
      success: true,
      message: '警報?�建?��?',
      data: alert,
    });
  } catch (error) {
    logger.error('?�建警報失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?�建警報失�?',
      code: 'ALERT_CREATION_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: ?��?警報?�表
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
 *         description: ?��??��?警報?�表
 *       401:
 *         description: ?��?�? */
router.get('/', protect, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      status: req.query.status,
      severity: req.query.severity,
      type: req.query.type,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

// eslint-disable-next-line no-unused-vars
    const result = await alertService.getAlerts(options);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('?��?警報?�表失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��?警報?�表失�?',
      code: 'ALERT_LIST_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/alerts/{id}:
 *   get:
 *     summary: ?��?警報詳�?
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
 *         description: ?��??��?警報詳�?
 *       404:
 *         description: 警報不�??? *       401:
 *         description: ?��?�? */
router.get('/:id', protect, async (req, res) => {
  try {
    const alert = await alertService.getAlertById(parseInt(req.params.id));

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    logger.error('?��?警報詳�?失�?:', error);
    res.status(404).json({
      success: false,
      message: error.message || '警報不�???,
      code: 'ALERT_NOT_FOUND',
    });
  }
});

/**
 * @swagger
 * /api/alerts/{id}/status:
 *   put:
 *     summary: ?�新警報?�?? *     tags: [Alerts]
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
 *         description: ?�?�更?��??? *       400:
 *         description: 請�??�數?�誤
 *       401:
 *         description: ?��?�? */
router.put('/:id/status', protect, validateAlertUpdate, async (req, res) => {
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
      message: '警報?�?�更?��???,
      data: alert,
    });
  } catch (error) {
    logger.error('?�新警報?�?�失??', error);
    res.status(500).json({
      success: false,
      message: error.message || '?�新警報?�?�失??,
      code: 'ALERT_STATUS_UPDATE_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/alerts/{id}/acknowledge:
 *   post:
 *     summary: 確�?警報
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
 *         description: 警報確�??��?
 *       400:
 *         description: 請�??�數?�誤
 *       401:
 *         description: ?��?�? */
router.post('/:id/acknowledge', protect, async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);

    const alert = await alertService.acknowledgeAlert(alertId, req.user.id);

    res.json({
      success: true,
      message: '警報確�??��?',
      data: alert,
    });
  } catch (error) {
    logger.error('確�?警報失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '確�?警報失�?',
      code: 'ALERT_ACKNOWLEDGE_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/alerts/bulk/status:
 *   put:
 *     summary: ?��??�新警報?�?? *     tags: [Alerts]
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
 *         description: ?��??�新?��?
 *       400:
 *         description: 請�??�數?�誤
 *       401:
 *         description: ?��?�? */
router.put('/bulk/status', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '?��?管�??�可以批?�更?�警??,
      });
    }

    const { alertIds, status, resolution } = req.body;

// eslint-disable-next-line no-unused-vars
    const result = await alertService.bulkUpdateAlertStatus(
      alertIds,
      status,
      req.user.id,
      resolution
    );

    res.json({
      success: true,
      message: `?��??�新 ${result.updatedCount} ?�警?�`,
      data: result,
    });
  } catch (error) {
    logger.error('?��??�新警報?�?�失??', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��??�新警報?�?�失??,
      code: 'ALERT_BULK_UPDATE_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/alerts/stats:
 *   get:
 *     summary: ?��?警報統�?
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
      type: req.query.type,
    };

    const stats = await alertService.getAlertStats(options);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('?��?警報統�?失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��?警報統�?失�?',
      code: 'ALERT_STATS_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/alerts/active:
 *   get:
 *     summary: ?��?活�?警報
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ?��??��?活�?警報
 *       401:
 *         description: ?��?�? */
router.get('/active', protect, async (req, res) => {
  try {
    const activeAlerts = await alertService.getActiveAlerts();

    res.json({
      success: true,
      data: activeAlerts,
    });
  } catch (error) {
    logger.error('?��?活�?警報失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��?活�?警報失�?',
      code: 'ALERT_ACTIVE_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/alerts/{id}:
 *   delete:
 *     summary: ?�除警報
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
 *         description: 警報?�除?��?
 *       400:
 *         description: 請�??�數?�誤
 *       401:
 *         description: ?��?�? */
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '?��?管�??�可以刪?�警??,
      });
    }

    const alertId = parseInt(req.params.id);

    await alertService.deleteAlert(alertId);

    res.json({
      success: true,
      message: '警報?�除?��?',
    });
  } catch (error) {
    logger.error('?�除警報失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?�除警報失�?',
      code: 'ALERT_DELETE_ERROR',
    });
  }
});

module.exports = router;

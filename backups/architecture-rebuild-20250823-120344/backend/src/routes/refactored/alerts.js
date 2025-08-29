const express = require('express');
const router = express.Router();
const alertService = require('../../services/alertService');
// eslint-disable-next-line no-unused-vars
const auth = require('../../middleware/auth');
const {
  validateAlertCreation,
  validateAlertUpdate,
} = require('../../middleware/validation');
const {
  createGetHandler,
  createPostHandler,
  createPutHandler,
  createDeleteHandler,
  createPaginatedHandler,
  createBatchHandler,
  createSearchHandler,
  createCustomError,
  createValidationError,
  createPermissionError,
} = require('../../middleware/routeHandler');

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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [system, security, performance, data_quality, user_activity]
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [critical, high, medium, low, info]
 *     responses:
 *       200:
 *         description: 警報列表獲取成功
 *       401:
 *         description: 未授權
 */
router.get(
  '/',
  createPaginatedHandler(
    async (filters, pagination, req, res) => {
      const { type, severity, startDate, endDate } = filters;

      // 構建查詢條件
      const query = {};
      if (type) query.type = type;
      if (severity) query.severity = severity;
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      // 獲取警報數據
      const alerts = await alertService.getAlerts(query, pagination);

      return {
        data: alerts.data,
        total: alerts.total,
      };
    },
    {
      auth: true,
      permissions: ['user', 'admin'],
    }
  )
);

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
 *       403:
 *         description: 權限不足
 */
router.post(
  '/',
  createPostHandler(
    async (req, res) => {
      // 檢查權限
      if (req.user.role !== 'admin') {
        throw createPermissionError('只有管理員可以創建警報');
      }

      // 構建警報數據
      const alertData = {
        ...req.body,
        createdBy: req.user.id,
        timestamp: new Date(),
      };

      // 創建警報
      const alert = await alertService.createAlert(alertData);

      return alert;
    },
    {
      auth: true,
      validation: validateAlertCreation,
      permissions: ['admin'],
    }
  )
);

/**
 * @swagger
 * /api/alerts/{id}:
 *   get:
 *     summary: 獲取單個警報
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 警報獲取成功
 *       404:
 *         description: 警報不存在
 *       401:
 *         description: 未授權
 */
router.get(
  '/:id',
  createGetHandler(
    async (req, res) => {
      const { id } = req.params;

      const alert = await alertService.getAlertById(id);
      if (!alert) {
        throw createCustomError('警報不存在', 404, 'ALERT_NOT_FOUND');
      }

      return alert;
    },
    {
      auth: true,
      permissions: ['user', 'admin'],
    }
  )
);

/**
 * @swagger
 * /api/alerts/{id}:
 *   put:
 *     summary: 更新警報
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, resolved, dismissed]
 *               message:
 *                 type: string
 *               details:
 *                 type: object
 *     responses:
 *       200:
 *         description: 警報更新成功
 *       404:
 *         description: 警報不存在
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.put(
  '/:id',
  createPutHandler(
    async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;

      // 檢查權限
      if (req.user.role !== 'admin') {
        throw createPermissionError('只有管理員可以更新警報');
      }

      // 檢查警報是否存在
      const existingAlert = await alertService.getAlertById(id);
      if (!existingAlert) {
        throw createCustomError('警報不存在', 404, 'ALERT_NOT_FOUND');
      }

      // 更新警報
      const updatedAlert = await alertService.updateAlert(id, {
        ...updateData,
        updatedBy: req.user.id,
        updatedAt: new Date(),
      });

      return updatedAlert;
    },
    {
      auth: true,
      validation: validateAlertUpdate,
      permissions: ['admin'],
    }
  )
);

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
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 警報刪除成功
 *       404:
 *         description: 警報不存在
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.delete(
  '/:id',
  createDeleteHandler(
    async (req, res) => {
      const { id } = req.params;

      // 檢查權限
      if (req.user.role !== 'admin') {
        throw createPermissionError('只有管理員可以刪除警報');
      }

      // 檢查警報是否存在
      const existingAlert = await alertService.getAlertById(id);
      if (!existingAlert) {
        throw createCustomError('警報不存在', 404, 'ALERT_NOT_FOUND');
      }

      // 刪除警報
      await alertService.deleteAlert(id);

      return { message: '警報刪除成功' };
    },
    {
      auth: true,
      permissions: ['admin'],
    }
  )
);

/**
 * @swagger
 * /api/alerts/batch:
 *   post:
 *     summary: 批量操作警報
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
 *               - items
 *               - action
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               action:
 *                 type: string
 *                 enum: [resolve, dismiss, delete]
 *     responses:
 *       200:
 *         description: 批量操作成功
 *       400:
 *         description: 請求參數錯誤
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.post(
  '/batch',
  createBatchHandler(
    async (alertId, params, req, res) => {
      const { action } = params;

      // 檢查權限
      if (req.user.role !== 'admin') {
        throw createPermissionError('只有管理員可以批量操作警報');
      }

      // 檢查警報是否存在
      const existingAlert = await alertService.getAlertById(alertId);
      if (!existingAlert) {
        throw createCustomError('警報不存在', 404, 'ALERT_NOT_FOUND');
      }

      // 執行批量操作
      switch (action) {
        case 'resolve':
          return await alertService.resolveAlert(alertId, req.user.id);
        case 'dismiss':
          return await alertService.dismissAlert(alertId, req.user.id);
        case 'delete':
          return await alertService.deleteAlert(alertId);
        default:
          throw createValidationError('無效的操作類型', [
            {
              field: 'action',
              message: '操作類型必須是 resolve、dismiss 或 delete',
            },
          ]);
      }
    },
    {
      auth: true,
      permissions: ['admin'],
    }
  )
);

/**
 * @swagger
 * /api/alerts/search:
 *   get:
 *     summary: 搜索警報
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 搜索成功
 *       401:
 *         description: 未授權
 */
router.get(
  '/search',
  createSearchHandler(
    async (searchParams, req, res) => {
      const { query, filters, category } = searchParams;

      // 構建搜索條件
      const searchCriteria = {
        query: query || '',
        filters: filters || {},
        category: category || 'all',
      };

      // 執行搜索
// eslint-disable-next-line no-unused-vars
      const results = await alertService.searchAlerts(searchCriteria);

      return {
        query: searchCriteria.query,
        results: results.data,
        total: results.total,
        filters: searchCriteria.filters,
      };
    },
    {
      auth: true,
      permissions: ['user', 'admin'],
    }
  )
);

/**
 * @swagger
 * /api/alerts/stats:
 *   get:
 *     summary: 獲取警報統計
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 統計獲取成功
 *       401:
 *         description: 未授權
 */
router.get(
  '/stats',
  createGetHandler(
    async (req, res) => {
      const stats = await alertService.getAlertStats();

      return {
        total: stats.total,
        byType: stats.byType,
        bySeverity: stats.bySeverity,
        byStatus: stats.byStatus,
        recentAlerts: stats.recentAlerts,
        trends: stats.trends,
      };
    },
    {
      auth: true,
      permissions: ['user', 'admin'],
    }
  )
);

/**
 * @swagger
 * /api/alerts/history:
 *   get:
 *     summary: 獲取警報歷史
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
 *           default: 100
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
 *         description: 歷史記錄獲取成功
 *       401:
 *         description: 未授權
 */
router.get(
  '/history',
  createPaginatedHandler(
    async (filters, pagination, req, res) => {
      const { startDate, endDate, type, severity } = filters;

      // 構建查詢條件
      const query = {};
      if (type) query.type = type;
      if (severity) query.severity = severity;
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      // 獲取歷史記錄
// eslint-disable-next-line no-unused-vars
      const history = await alertService.getAlertHistory(query, pagination);

      return {
        data: history.data,
        total: history.total,
      };
    },
    {
      auth: true,
      permissions: ['user', 'admin'],
    }
  )
);

module.exports = router;

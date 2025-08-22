const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
// eslint-disable-next-line no-unused-vars
const dataExportService = require('../services/dataExportService');
const { authenticateToken: protect, authorize } = require('../middleware/auth');

/**
 * 導出?��??��?
 * GET /api/export/cards
 */
router.get(
  '/cards',
  [
    query('format')
      .optional()
      .isIn(['excel', 'csv', 'pdf', 'json'])
      .withMessage('?��?必�???excel, csv, pdf ??json'),
    query('name').optional().isString().withMessage('?��??�稱必�??��?符串'),
    query('setName').optional().isString().withMessage('系�??�稱必�??��?符串'),
    query('rarity').optional().isString().withMessage('稀?�度必�??��?符串'),
    query('cardType').optional().isString().withMessage('?��?類�?必�??��?符串'),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('?�低價?��??�是�?��'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('?�高價?��??�是�?��'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50000 })
      .withMessage('?�制?��?必�???1-50000 之�?'),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '請�??�數驗�?失�?',
          errors: errors.array(),
        });
      }

      const {
        format = 'excel',
        name,
        setName,
        rarity,
        cardType,
        minPrice,
        maxPrice,
        limit,
      } = req.query;

      const filters = {};
      if (name) filters.name = name;
      if (setName) filters.setName = setName;
      if (rarity) filters.rarity = rarity;
      if (cardType) filters.cardType = cardType;
      if (minPrice) filters.minPrice = parseFloat(minPrice);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

// eslint-disable-next-line no-unused-vars
      const options = {};
      if (limit) options.limit = parseInt(limit);

      logger.info('?��?導出?��??��?', { format, filters, options });

// eslint-disable-next-line no-unused-vars
      const result = await dataExportService.exportCardsData(
        format,
        filters,
        options
      );

      res.json({
        success: true,
        message: '?��??��?導出?��?',
        data: result,
      });
    } catch (error) {
      logger.error('導出?��??��?失�?:', error);
      res.status(500).json({
        success: false,
        message: error.message || '導出?��??��?失�?',
        code: 'EXPORT_CARDS_ERROR',
      });
    }
  }
);

/**
 * 導出?��??��?
 * GET /api/export/investments
 */
router.get(
  '/investments',
  [
    protect,
    query('format')
      .optional()
      .isIn(['excel', 'csv', 'pdf', 'json'])
      .withMessage('?��?必�???excel, csv, pdf ??json'),
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('活�??�?��??�是布爾??),
    query('minPurchasePrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('?�低購買價?��??�是�?��'),
    query('maxPurchasePrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('?�高購買價?��??�是�?��'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50000 })
      .withMessage('?�制?��?必�???1-50000 之�?'),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '請�??�數驗�?失�?',
          errors: errors.array(),
        });
      }

      const {
        format = 'excel',
        isActive,
        minPurchasePrice,
        maxPurchasePrice,
        limit,
      } = req.query;

      const filters = {};
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (minPurchasePrice)
        filters.minPurchasePrice = parseFloat(minPurchasePrice);
      if (maxPurchasePrice)
        filters.maxPurchasePrice = parseFloat(maxPurchasePrice);

// eslint-disable-next-line no-unused-vars
      const options = {};
      if (limit) options.limit = parseInt(limit);

      logger.info('?��?導出?��??��?', {
        userId: req.user.id,
        format,
        filters,
        options,
      });

// eslint-disable-next-line no-unused-vars
      const result = await dataExportService.exportInvestmentsData(
        req.user.id,
        format,
        filters,
        options
      );

      res.json({
        success: true,
        message: '?��??��?導出?��?',
        data: result,
      });
    } catch (error) {
      logger.error('導出?��??��?失�?:', error);
      res.status(500).json({
        success: false,
        message: error.message || '導出?��??��?失�?',
        code: 'EXPORT_INVESTMENTS_ERROR',
      });
    }
  }
);

/**
 * 導出市場?��?
 * GET /api/export/market
 */
router.get(
  '/market',
  [
    query('format')
      .optional()
      .isIn(['excel', 'csv', 'pdf', 'json'])
      .withMessage('?��?必�???excel, csv, pdf ??json'),
    query('cardId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('?��? ID 必�??�正?�數'),
    query('startDate').optional().isISO8601().withMessage('?��??��??��?不正�?),
    query('endDate').optional().isISO8601().withMessage('結�??��??��?不正�?),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50000 })
      .withMessage('?�制?��?必�???1-50000 之�?'),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '請�??�數驗�?失�?',
          errors: errors.array(),
        });
      }

      const { format = 'excel', cardId, startDate, endDate, limit } = req.query;

      const filters = {};
      if (cardId) filters.cardId = parseInt(cardId);
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

// eslint-disable-next-line no-unused-vars
      const options = {};
      if (limit) options.limit = parseInt(limit);

      logger.info('?��?導出市場?��?', { format, filters, options });

// eslint-disable-next-line no-unused-vars
      const result = await dataExportService.exportMarketData(
        format,
        filters,
        options
      );

      res.json({
        success: true,
        message: '市場?��?導出?��?',
        data: result,
      });
    } catch (error) {
      logger.error('導出市場?��?失�?:', error);
      res.status(500).json({
        success: false,
        message: error.message || '導出市場?��?失�?',
        code: 'EXPORT_MARKET_ERROR',
      });
    }
  }
);

/**
 * 導出?�戶?��? (?�管?�員)
 * GET /api/export/users
 */
router.get(
  '/users',
  [
    protect,
    authorize('admin'),
    query('format')
      .optional()
      .isIn(['excel', 'csv', 'pdf', 'json'])
      .withMessage('?��?必�???excel, csv, pdf ??json'),
    query('role')
      .optional()
      .isIn(['user', 'admin', 'moderator'])
      .withMessage('角色必�???user, admin ??moderator'),
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('活�??�?��??�是布爾??),
    query('startDate').optional().isISO8601().withMessage('?��??��??��?不正�?),
    query('endDate').optional().isISO8601().withMessage('結�??��??��?不正�?),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50000 })
      .withMessage('?�制?��?必�???1-50000 之�?'),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '請�??�數驗�?失�?',
          errors: errors.array(),
        });
      }

      const {
        format = 'excel',
        role,
        isActive,
        startDate,
        endDate,
        limit,
      } = req.query;

      const filters = {};
      if (role) filters.role = role;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

// eslint-disable-next-line no-unused-vars
      const options = {};
      if (limit) options.limit = parseInt(limit);

      logger.info('?��?導出?�戶?��?', {
        adminId: req.user.id,
        format,
        filters,
        options,
      });

// eslint-disable-next-line no-unused-vars
      const result = await dataExportService.exportUsersData(
        format,
        filters,
        options
      );

      res.json({
        success: true,
        message: '?�戶?��?導出?��?',
        data: result,
      });
    } catch (error) {
      logger.error('導出?�戶?��?失�?:', error);
      res.status(500).json({
        success: false,
        message: error.message || '導出?�戶?��?失�?',
        code: 'EXPORT_USERS_ERROR',
      });
    }
  }
);

/**
 * ?��??��?組�??��?
 * GET /api/export/portfolio
 */
router.get(
  '/portfolio',
  [
    protect,
    query('format')
      .optional()
      .isIn(['pdf', 'excel', 'json'])
      .withMessage('?��?必�???pdf, excel ??json'),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '請�??�數驗�?失�?',
          errors: errors.array(),
        });
      }

      const { format = 'pdf' } = req.query;

      logger.info('?��??��??��?組�??��?', { userId: req.user.id, format });

// eslint-disable-next-line no-unused-vars
      const result = await dataExportService.generatePortfolioReport(
        req.user.id,
        format
      );

      res.json({
        success: true,
        message: '?��?組�??��??��??��?',
        data: result,
      });
    } catch (error) {
      logger.error('?��??��?組�??��?失�?:', error);
      res.status(500).json({
        success: false,
        message: error.message || '?��??��?組�??��?失�?',
        code: 'PORTFOLIO_REPORT_ERROR',
      });
    }
  }
);

/**
 * ?��?導出多種?��?
 * POST /api/export/batch
 */
router.post(
  '/batch',
  [
    protect,
    body('exports')
      .isArray({ min: 1, max: 10 })
      .withMessage('導出?�目必�???1-10 ?��??��?'),
    body('exports.*.type')
      .isIn(['cards', 'investments', 'market', 'portfolio'])
      .withMessage('導出類�?必�???cards, investments, market ??portfolio'),
    body('exports.*.format')
      .isIn(['excel', 'csv', 'pdf', 'json'])
      .withMessage('?��?必�???excel, csv, pdf ??json'),
    body('exports.*.filters')
      .optional()
      .isObject()
      .withMessage('?�濾條件必�??��?�?),
    body('exports.*.options')
      .optional()
      .isObject()
      .withMessage('?��?必�??��?�?),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '請�??�數驗�?失�?',
          errors: errors.array(),
        });
      }

      const { exports: exportItems } = req.body;
// eslint-disable-next-line no-unused-vars
      const results = [];

      logger.info('?��??��?導出', {
        userId: req.user.id,
        exportCount: exportItems.length,
      });

      for (const item of exportItems) {
        try {
// eslint-disable-next-line no-unused-vars
          let result;
          const { type, format, filters = {}, options = {} } = item;

          switch (type) {
            case 'cards':
              result = await dataExportService.exportCardsData(
                format,
                filters,
                options
              );
              break;
            case 'investments':
              result = await dataExportService.exportInvestmentsData(
                req.user.id,
                format,
                filters,
                options
              );
              break;
            case 'market':
              result = await dataExportService.exportMarketData(
                format,
                filters,
                options
              );
              break;
            case 'portfolio':
              result = await dataExportService.generatePortfolioReport(
                req.user.id,
                format,
                options
              );
              break;
            default:
              throw new Error(`不支?��?導出類�?: ${type}`);
          }

          results.push({
            type,
            format,
            success: true,
            data: result,
          });
        } catch (error) {
          logger.error(`?��?導出?�目失�?: ${item.type}`, error);
          results.push({
            type: item.type,
            format: item.format,
            success: false,
            error: error.message,
          });
        }
      }

// eslint-disable-next-line no-unused-vars
      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.length - successCount;

      res.json({
        success: true,
        message: `?��?導出完�?: ${successCount} ?��?, ${failureCount} 失�?`,
        data: {
          total: results.length,
          successful: successCount,
          failed: failureCount,
          results,
        },
      });
    } catch (error) {
      logger.error('?��?導出失�?:', error);
      res.status(500).json({
        success: false,
        message: error.message || '?��?導出失�?',
        code: 'BATCH_EXPORT_ERROR',
      });
    }
  }
);

/**
 * ?��?導出統�?信息
 * GET /api/export/stats
 */
router.get('/stats', [protect, authorize('admin')], async (req, res) => {
  try {
    logger.info('?��?導出統�?信息', { adminId: req.user.id });

    const stats = dataExportService.getExportStats();

    res.json({
      success: true,
      message: '導出統�?信息?��??��?',
      data: stats,
    });
  } catch (error) {
    logger.error('?��?導出統�?信息失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��?導出統�?信息失�?',
      code: 'EXPORT_STATS_ERROR',
    });
  }
});

/**
 * 清�??��?導出?�件
 * DELETE /api/export/cleanup
 */
router.delete(
  '/cleanup',
  [
    protect,
    authorize('admin'),
    query('daysToKeep')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('保�?天數必�???1-365 之�?'),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '請�??�數驗�?失�?',
          errors: errors.array(),
        });
      }

      const { daysToKeep = 7 } = req.query;

      logger.info('?��?清�??��?導出?�件', { adminId: req.user.id, daysToKeep });

      const deletedCount = dataExportService.cleanupExpiredFiles(
        parseInt(daysToKeep)
      );

      res.json({
        success: true,
        message: `清�??��??�件完�?: ?�除 ${deletedCount} ?��?件`,
        data: {
          deletedCount,
          daysToKeep: parseInt(daysToKeep),
        },
      });
    } catch (error) {
      logger.error('清�??��??�件失�?:', error);
      res.status(500).json({
        success: false,
        message: error.message || '清�??��??�件失�?',
        code: 'EXPORT_CLEANUP_ERROR',
      });
    }
  }
);

/**
 * 下�?導出?�件
 * GET /api/export/download/:filename
 */
router.get('/download/:filename', [protect], async (req, res) => {
  try {
    const { filename } = req.params;
// eslint-disable-next-line no-unused-vars
    const fs = require('fs');
    const path = require('path');

    // 驗�??�件?�格�?    if (!/^[a-zA-Z0-9_-]+\.(xlsx|csv|pdf|json)$/.test(filename)) {
      return res.status(400).json({
        success: false,
        message: '?��??��?件�??��?',
        code: 'INVALID_FILENAME',
      });
    }

    const filepath = path.join(__dirname, '../../exports', filename);

    // 檢查?�件?�否存在
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: '?�件不�???,
        code: 'FILE_NOT_FOUND',
      });
    }

    // 檢查?�件?�否屬於?��??�戶 (?�管?�員?�能下�??�己?��?�?
    if (req.user.role !== 'admin') {
      // ?�裡?�以添�??�嚴?��?權�?檢查?�輯
      // 例�?檢查?�件?�是?��??�用??ID �?    }

    logger.info('下�?導出?�件', { userId: req.user.id, filename });

    // 設置?��???    const ext = path.extname(filename).toLowerCase();
// eslint-disable-next-line no-unused-vars
    let contentType = 'application/octet-stream';

    switch (ext) {
      case '.xlsx':
        contentType =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case '.csv':
        contentType = 'text/csv';
        break;
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.json':
        contentType = 'application/json';
        break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // ?�送�?�?    res.sendFile(filepath);
  } catch (error) {
    logger.error('下�??�件失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '下�??�件失�?',
      code: 'DOWNLOAD_ERROR',
    });
  }
});

module.exports = router;

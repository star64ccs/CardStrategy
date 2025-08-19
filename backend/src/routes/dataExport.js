const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const logger = require('../utils/logger');
const dataExportService = require('../services/dataExportService');
const { protect, authorize } = require('../middleware/auth');

/**
 * 導出卡片數據
 * GET /api/export/cards
 */
router.get('/cards', [
  query('format').optional().isIn(['excel', 'csv', 'pdf', 'json']).withMessage('格式必須是 excel, csv, pdf 或 json'),
  query('name').optional().isString().withMessage('卡片名稱必須是字符串'),
  query('setName').optional().isString().withMessage('系列名稱必須是字符串'),
  query('rarity').optional().isString().withMessage('稀有度必須是字符串'),
  query('cardType').optional().isString().withMessage('卡片類型必須是字符串'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('最低價格必須是正數'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('最高價格必須是正數'),
  query('limit').optional().isInt({ min: 1, max: 50000 }).withMessage('限制數量必須在 1-50000 之間')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '請求參數驗證失敗',
        errors: errors.array()
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
      limit
    } = req.query;

    const filters = {};
    if (name) filters.name = name;
    if (setName) filters.setName = setName;
    if (rarity) filters.rarity = rarity;
    if (cardType) filters.cardType = cardType;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

    const options = {};
    if (limit) options.limit = parseInt(limit);

    logger.info('開始導出卡片數據', { format, filters, options });

    const result = await dataExportService.exportCardsData(format, filters, options);

    res.json({
      success: true,
      message: '卡片數據導出成功',
      data: result
    });
  } catch (error) {
    logger.error('導出卡片數據失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '導出卡片數據失敗',
      code: 'EXPORT_CARDS_ERROR'
    });
  }
});

/**
 * 導出投資數據
 * GET /api/export/investments
 */
router.get('/investments', [
  protect,
  query('format').optional().isIn(['excel', 'csv', 'pdf', 'json']).withMessage('格式必須是 excel, csv, pdf 或 json'),
  query('isActive').optional().isBoolean().withMessage('活躍狀態必須是布爾值'),
  query('minPurchasePrice').optional().isFloat({ min: 0 }).withMessage('最低購買價格必須是正數'),
  query('maxPurchasePrice').optional().isFloat({ min: 0 }).withMessage('最高購買價格必須是正數'),
  query('limit').optional().isInt({ min: 1, max: 50000 }).withMessage('限制數量必須在 1-50000 之間')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '請求參數驗證失敗',
        errors: errors.array()
      });
    }

    const {
      format = 'excel',
      isActive,
      minPurchasePrice,
      maxPurchasePrice,
      limit
    } = req.query;

    const filters = {};
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (minPurchasePrice) filters.minPurchasePrice = parseFloat(minPurchasePrice);
    if (maxPurchasePrice) filters.maxPurchasePrice = parseFloat(maxPurchasePrice);

    const options = {};
    if (limit) options.limit = parseInt(limit);

    logger.info('開始導出投資數據', { userId: req.user.id, format, filters, options });

    const result = await dataExportService.exportInvestmentsData(req.user.id, format, filters, options);

    res.json({
      success: true,
      message: '投資數據導出成功',
      data: result
    });
  } catch (error) {
    logger.error('導出投資數據失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '導出投資數據失敗',
      code: 'EXPORT_INVESTMENTS_ERROR'
    });
  }
});

/**
 * 導出市場數據
 * GET /api/export/market
 */
router.get('/market', [
  query('format').optional().isIn(['excel', 'csv', 'pdf', 'json']).withMessage('格式必須是 excel, csv, pdf 或 json'),
  query('cardId').optional().isInt({ min: 1 }).withMessage('卡片 ID 必須是正整數'),
  query('startDate').optional().isISO8601().withMessage('開始日期格式不正確'),
  query('endDate').optional().isISO8601().withMessage('結束日期格式不正確'),
  query('limit').optional().isInt({ min: 1, max: 50000 }).withMessage('限制數量必須在 1-50000 之間')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '請求參數驗證失敗',
        errors: errors.array()
      });
    }

    const {
      format = 'excel',
      cardId,
      startDate,
      endDate,
      limit
    } = req.query;

    const filters = {};
    if (cardId) filters.cardId = parseInt(cardId);
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const options = {};
    if (limit) options.limit = parseInt(limit);

    logger.info('開始導出市場數據', { format, filters, options });

    const result = await dataExportService.exportMarketData(format, filters, options);

    res.json({
      success: true,
      message: '市場數據導出成功',
      data: result
    });
  } catch (error) {
    logger.error('導出市場數據失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '導出市場數據失敗',
      code: 'EXPORT_MARKET_ERROR'
    });
  }
});

/**
 * 導出用戶數據 (僅管理員)
 * GET /api/export/users
 */
router.get('/users', [
  protect,
  authorize('admin'),
  query('format').optional().isIn(['excel', 'csv', 'pdf', 'json']).withMessage('格式必須是 excel, csv, pdf 或 json'),
  query('role').optional().isIn(['user', 'admin', 'moderator']).withMessage('角色必須是 user, admin 或 moderator'),
  query('isActive').optional().isBoolean().withMessage('活躍狀態必須是布爾值'),
  query('startDate').optional().isISO8601().withMessage('開始日期格式不正確'),
  query('endDate').optional().isISO8601().withMessage('結束日期格式不正確'),
  query('limit').optional().isInt({ min: 1, max: 50000 }).withMessage('限制數量必須在 1-50000 之間')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '請求參數驗證失敗',
        errors: errors.array()
      });
    }

    const {
      format = 'excel',
      role,
      isActive,
      startDate,
      endDate,
      limit
    } = req.query;

    const filters = {};
    if (role) filters.role = role;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const options = {};
    if (limit) options.limit = parseInt(limit);

    logger.info('開始導出用戶數據', { adminId: req.user.id, format, filters, options });

    const result = await dataExportService.exportUsersData(format, filters, options);

    res.json({
      success: true,
      message: '用戶數據導出成功',
      data: result
    });
  } catch (error) {
    logger.error('導出用戶數據失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '導出用戶數據失敗',
      code: 'EXPORT_USERS_ERROR'
    });
  }
});

/**
 * 生成投資組合報告
 * GET /api/export/portfolio
 */
router.get('/portfolio', [
  protect,
  query('format').optional().isIn(['pdf', 'excel', 'json']).withMessage('格式必須是 pdf, excel 或 json')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '請求參數驗證失敗',
        errors: errors.array()
      });
    }

    const { format = 'pdf' } = req.query;

    logger.info('開始生成投資組合報告', { userId: req.user.id, format });

    const result = await dataExportService.generatePortfolioReport(req.user.id, format);

    res.json({
      success: true,
      message: '投資組合報告生成成功',
      data: result
    });
  } catch (error) {
    logger.error('生成投資組合報告失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '生成投資組合報告失敗',
      code: 'PORTFOLIO_REPORT_ERROR'
    });
  }
});

/**
 * 批量導出多種數據
 * POST /api/export/batch
 */
router.post('/batch', [
  protect,
  body('exports').isArray({ min: 1, max: 10 }).withMessage('導出項目必須是 1-10 個的數組'),
  body('exports.*.type').isIn(['cards', 'investments', 'market', 'portfolio']).withMessage('導出類型必須是 cards, investments, market 或 portfolio'),
  body('exports.*.format').isIn(['excel', 'csv', 'pdf', 'json']).withMessage('格式必須是 excel, csv, pdf 或 json'),
  body('exports.*.filters').optional().isObject().withMessage('過濾條件必須是對象'),
  body('exports.*.options').optional().isObject().withMessage('選項必須是對象')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '請求參數驗證失敗',
        errors: errors.array()
      });
    }

    const { exports: exportItems } = req.body;
    const results = [];

    logger.info('開始批量導出', { userId: req.user.id, exportCount: exportItems.length });

    for (const item of exportItems) {
      try {
        let result;
        const { type, format, filters = {}, options = {} } = item;

        switch (type) {
          case 'cards':
            result = await dataExportService.exportCardsData(format, filters, options);
            break;
          case 'investments':
            result = await dataExportService.exportInvestmentsData(req.user.id, format, filters, options);
            break;
          case 'market':
            result = await dataExportService.exportMarketData(format, filters, options);
            break;
          case 'portfolio':
            result = await dataExportService.generatePortfolioReport(req.user.id, format, options);
            break;
          default:
            throw new Error(`不支持的導出類型: ${type}`);
        }

        results.push({
          type,
          format,
          success: true,
          data: result
        });
      } catch (error) {
        logger.error(`批量導出項目失敗: ${item.type}`, error);
        results.push({
          type: item.type,
          format: item.format,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      success: true,
      message: `批量導出完成: ${successCount} 成功, ${failureCount} 失敗`,
      data: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
        results
      }
    });
  } catch (error) {
    logger.error('批量導出失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '批量導出失敗',
      code: 'BATCH_EXPORT_ERROR'
    });
  }
});

/**
 * 獲取導出統計信息
 * GET /api/export/stats
 */
router.get('/stats', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    logger.info('獲取導出統計信息', { adminId: req.user.id });

    const stats = dataExportService.getExportStats();

    res.json({
      success: true,
      message: '導出統計信息獲取成功',
      data: stats
    });
  } catch (error) {
    logger.error('獲取導出統計信息失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取導出統計信息失敗',
      code: 'EXPORT_STATS_ERROR'
    });
  }
});

/**
 * 清理過期導出文件
 * DELETE /api/export/cleanup
 */
router.delete('/cleanup', [
  protect,
  authorize('admin'),
  query('daysToKeep').optional().isInt({ min: 1, max: 365 }).withMessage('保留天數必須在 1-365 之間')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '請求參數驗證失敗',
        errors: errors.array()
      });
    }

    const { daysToKeep = 7 } = req.query;

    logger.info('開始清理過期導出文件', { adminId: req.user.id, daysToKeep });

    const deletedCount = dataExportService.cleanupExpiredFiles(parseInt(daysToKeep));

    res.json({
      success: true,
      message: `清理過期文件完成: 刪除 ${deletedCount} 個文件`,
      data: {
        deletedCount,
        daysToKeep: parseInt(daysToKeep)
      }
    });
  } catch (error) {
    logger.error('清理過期文件失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '清理過期文件失敗',
      code: 'EXPORT_CLEANUP_ERROR'
    });
  }
});

/**
 * 下載導出文件
 * GET /api/export/download/:filename
 */
router.get('/download/:filename', [
  protect
], async (req, res) => {
  try {
    const { filename } = req.params;
    const fs = require('fs');
    const path = require('path');

    // 驗證文件名格式
    if (!/^[a-zA-Z0-9_-]+\.(xlsx|csv|pdf|json)$/.test(filename)) {
      return res.status(400).json({
        success: false,
        message: '無效的文件名格式',
        code: 'INVALID_FILENAME'
      });
    }

    const filepath = path.join(__dirname, '../../exports', filename);

    // 檢查文件是否存在
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: '文件不存在',
        code: 'FILE_NOT_FOUND'
      });
    }

    // 檢查文件是否屬於當前用戶 (非管理員只能下載自己的文件)
    if (req.user.role !== 'admin') {
      // 這裡可以添加更嚴格的權限檢查邏輯
      // 例如檢查文件名是否包含用戶 ID 等
    }

    logger.info('下載導出文件', { userId: req.user.id, filename });

    // 設置響應頭
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';

    switch (ext) {
      case '.xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
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

    // 發送文件
    res.sendFile(filepath);
  } catch (error) {
    logger.error('下載文件失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '下載文件失敗',
      code: 'DOWNLOAD_ERROR'
    });
  }
});

module.exports = router;

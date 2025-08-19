const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const simulatedGradingService = require('../services/simulatedGradingService');
const logger = require('../utils/logger');

// 創建模擬鑑定報告
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { cardId, gradingResult, imageData } = req.body;
    const userId = req.user.id;

    const result = await simulatedGradingService.createGradingReport(
      userId,
      cardId,
      gradingResult,
      imageData
    );

    logger.info('模擬鑑定報告創建成功', {
      userId,
      cardId,
      agency: result.agency,
      gradingNumber: result.gradingNumber
    });

    res.status(201).json({
      success: true,
      message: '模擬鑑定報告創建成功',
      data: result
    });
  } catch (error) {
    logger.error('創建模擬鑑定報告失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '創建模擬鑑定報告失敗',
      code: 'SIMULATED_GRADING_CREATE_ERROR'
    });
  }
});

// 查詢鑑定報告
router.get('/:gradingNumber', async (req, res) => {
  try {
    const { gradingNumber } = req.params;

    const result = await simulatedGradingService.getGradingReport(gradingNumber);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: '鑑定報告不存在或已失效',
        code: 'GRADING_REPORT_NOT_FOUND'
      });
    }

    logger.info('鑑定報告查詢成功', {
      gradingNumber,
      viewCount: result.viewCount
    });

    res.status(200).json({
      success: true,
      message: '鑑定報告查詢成功',
      data: result
    });
  } catch (error) {
    logger.error('查詢鑑定報告失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '查詢鑑定報告失敗',
      code: 'SIMULATED_GRADING_LOOKUP_ERROR'
    });
  }
});

// 獲取用戶的鑑定報告列表
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit, agency, sortBy, sortOrder } = req.query;

    // 驗證用戶權限
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '無權限訪問此用戶的鑑定報告',
        code: 'UNAUTHORIZED_ACCESS'
      });
    }

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      agency,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'DESC'
    };

    const result = await simulatedGradingService.getUserGradingReports(userId, options);

    logger.info('用戶鑑定報告列表獲取成功', {
      userId,
      totalReports: result.pagination.total
    });

    res.status(200).json({
      success: true,
      message: '用戶鑑定報告列表獲取成功',
      data: result
    });
  } catch (error) {
    logger.error('獲取用戶鑑定報告列表失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取用戶鑑定報告列表失敗',
      code: 'SIMULATED_GRADING_USER_REPORTS_ERROR'
    });
  }
});

// 搜索鑑定報告
router.get('/search', async (req, res) => {
  try {
    const { query, page, limit, agency, sortBy, sortOrder } = req.query;

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      agency,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'DESC'
    };

    const result = await simulatedGradingService.searchGradingReports(query, options);

    logger.info('鑑定報告搜索成功', {
      query,
      totalResults: result.pagination.total
    });

    res.status(200).json({
      success: true,
      message: '鑑定報告搜索成功',
      data: result
    });
  } catch (error) {
    logger.error('搜索鑑定報告失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '搜索鑑定報告失敗',
      code: 'SIMULATED_GRADING_SEARCH_ERROR'
    });
  }
});

// 獲取鑑定統計數據
router.get('/stats/:userId?', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // 驗證用戶權限
    if (userId && req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '無權限訪問此用戶的統計數據',
        code: 'UNAUTHORIZED_ACCESS'
      });
    }

    const stats = await simulatedGradingService.getGradingStats(userId || null);

    logger.info('鑑定統計數據獲取成功', {
      userId: userId || 'all',
      totalReports: stats.totalReports
    });

    res.status(200).json({
      success: true,
      message: '鑑定統計數據獲取成功',
      data: stats
    });
  } catch (error) {
    logger.error('獲取鑑定統計數據失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取鑑定統計數據失敗',
      code: 'SIMULATED_GRADING_STATS_ERROR'
    });
  }
});

// 獲取最受歡迎的鑑定報告
router.get('/popular/:userId?', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit } = req.query;

    const reports = await simulatedGradingService.getTopViewedReports(
      userId ? parseInt(userId) : null,
      parseInt(limit) || 10
    );

    logger.info('最受歡迎鑑定報告獲取成功', {
      userId: userId || 'all',
      reportCount: reports.length
    });

    res.status(200).json({
      success: true,
      message: '最受歡迎鑑定報告獲取成功',
      data: { reports }
    });
  } catch (error) {
    logger.error('獲取最受歡迎鑑定報告失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取最受歡迎鑑定報告失敗',
      code: 'SIMULATED_GRADING_POPULAR_ERROR'
    });
  }
});

module.exports = router;

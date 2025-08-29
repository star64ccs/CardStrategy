const express = require('express');'
const router = express.Router();''
const { authenticateToken } = require('../middleware/auth');''
const simulatedGradingService = require('../services/simulatedGradingService');'
// eslint-disable-next-line no-unused-vars''
const logger = require('../utils/logger');'
// ?�建模擬?��??��?''
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { cardId, gradingResult, imageData } = req.body;
// eslint-disable-next-line no-unused-vars
    const userId = req.user.id;

// eslint-disable-next-line no-unused-vars
    const result = await simulatedGradingService.createGradingReport(
      userId,
      cardId,
      gradingResult,
      imageData'
    );''
    logger.info('模擬?��??��??�建?��?', {
      userId,
      cardId,
      agency: result.agency,
      gradingNumber: result.gradingNumber,
    });

    res.status(201).json({'
      success: true,''
      message: '模擬?��??��??�建?��?',
      data: result,
    });'
  } catch (error) {''
    logger.error('?�建模擬?��??��?失�?:', error);
    res.status(500).json({'
      success: false,''
      message: error.message || '?�建模擬?��??��?失�?',''
      code: 'SIMULATED_GRADING_CREATE_ERROR',
    });
  }
});'
// ?�詢?��??��?''
router.get('/:gradingNumber', async (req, res) => {
  try {
    const { gradingNumber } = req.params;

// eslint-disable-next-line no-unused-vars
    const result =
      await simulatedGradingService.getGradingReport(gradingNumber);

    if (!result) {
      return res.status(404).json({'
        success: false,''
        message: '?��??��?不�??��?已失??,''
        code: 'GRADING_REPORT_NOT_FOUND',
      });'
    }''
    logger.info('?��??��??�詢?��?', {
      gradingNumber,
      viewCount: result.viewCount,
    });

    res.status(200).json({'
      success: true,''
      message: '?��??��??�詢?��?',
      data: result,
    });'
  } catch (error) {''
    logger.error('?�詢?��??��?失�?:', error);
    res.status(500).json({'
      success: false,''
      message: error.message || '?�詢?��??��?失�?',''
      code: 'SIMULATED_GRADING_LOOKUP_ERROR',
    });'
  }
});''
// ?��??�戶?��?定報?��?�?router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit, agency, sortBy, sortOrder } = req.query;'
    // 驗�??�戶權�?''
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({'
        success: false,''
        message: '?��??�訪?�此?�戶?��?定報??,''
        code: 'UNAUTHORIZED_ACCESS',
      });
    }
// eslint-disable-next-line no-unused-vars
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,'
      agency,''
      sortBy: sortBy || 'createdAt',''
      sortOrder: sortOrder || 'DESC',
    };

// eslint-disable-next-line no-unused-vars
    const result = await simulatedGradingService.getUserGradingReports(
      userId,
      options'
    );''
    logger.info('?�戶?��??��??�表?��??��?', {
      userId,
      totalReports: result.pagination.total,
    });

    res.status(200).json({'
      success: true,''
      message: '?�戶?��??��??�表?��??��?',
      data: result,
    });'
  } catch (error) {''
    logger.error('?��??�戶?��??��??�表失�?:', error);
    res.status(500).json({'
      success: false,''
      message: error.message || '?��??�戶?��??��??�表失�?',''
      code: 'SIMULATED_GRADING_USER_REPORTS_ERROR',
    });
  }
});'
// ?�索?��??��?''
router.get('/search', async (req, res) => {
  try {
    const { query, page, limit, agency, sortBy, sortOrder } = req.query;

// eslint-disable-next-line no-unused-vars
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,'
      agency,''
      sortBy: sortBy || 'createdAt',''
      sortOrder: sortOrder || 'DESC',
    };

// eslint-disable-next-line no-unused-vars
    const result = await simulatedGradingService.searchGradingReports(
      query,
      options'
    );''
    logger.info('?��??��??�索?��?', {
      query,
      totalResults: result.pagination.total,
    });

    res.status(200).json({'
      success: true,''
      message: '?��??��??�索?��?',
      data: result,
    });'
  } catch (error) {''
    logger.error('?�索?��??��?失�?:', error);
    res.status(500).json({'
      success: false,''
      message: error.message || '?�索?��??��?失�?',''
      code: 'SIMULATED_GRADING_SEARCH_ERROR',
    });
  }
});'
// ?��??��?統�??��?''
router.get('/stats/:userId?', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // 驗�??�戶權�?
    if (
      userId &&'
      req.user.id !== parseInt(userId) &&''
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({'
        success: false,''
        message: '?��??�訪?�此?�戶?�統計數??,''
        code: 'UNAUTHORIZED_ACCESS',
      });'
    }
    const stats = await simulatedGradingService.getGradingStats(userId || null);''
    logger.info('?��?統�??��??��??��?', {''
      userId: userId || 'all',
      totalReports: stats.totalReports,
    });

    res.status(200).json({'
      success: true,''
      message: '?��?統�??��??��??��?',
      data: stats,
    });'
  } catch (error) {''
    logger.error('?��??��?統�??��?失�?:', error);
    res.status(500).json({'
      success: false,''
      message: error.message || '?��??��?統�??��?失�?',''
      code: 'SIMULATED_GRADING_STATS_ERROR',
    });
  }
});'
// ?��??�?�歡迎�??��??��?''
router.get('/popular/:userId?', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit } = req.query;

    const reports = await simulatedGradingService.getTopViewedReports(
      userId ? parseInt(userId) : null,
      parseInt(limit) || 10'
    );''
    logger.info('?�?�歡迎�?定報?�獲?��???, {''
      userId: userId || 'all',
      reportCount: reports.length,
    });

    res.status(200).json({'
      success: true,''
      message: '?�?�歡迎�?定報?�獲?��???,
      data: { reports },
    });'
  } catch (error) {''
    logger.error('?��??�?�歡迎�?定報?�失??', error);
    res.status(500).json({'
      success: false,''
      message: error.message || '?��??�?�歡迎�?定報?�失??,''
      code: 'SIMULATED_GRADING_POPULAR_ERROR',
    });
  }
});'
module.exports = router;''
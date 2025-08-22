const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const simulatedGradingService = require('../services/simulatedGradingService');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');

// ?µå»ºæ¨¡æ“¬?‘å??±å?
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
      imageData
    );

    logger.info('æ¨¡æ“¬?‘å??±å??µå»º?å?', {
      userId,
      cardId,
      agency: result.agency,
      gradingNumber: result.gradingNumber,
    });

    res.status(201).json({
      success: true,
      message: 'æ¨¡æ“¬?‘å??±å??µå»º?å?',
      data: result,
    });
  } catch (error) {
    logger.error('?µå»ºæ¨¡æ“¬?‘å??±å?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?µå»ºæ¨¡æ“¬?‘å??±å?å¤±æ?',
      code: 'SIMULATED_GRADING_CREATE_ERROR',
    });
  }
});

// ?¥è©¢?‘å??±å?
router.get('/:gradingNumber', async (req, res) => {
  try {
    const { gradingNumber } = req.params;

// eslint-disable-next-line no-unused-vars
    const result =
      await simulatedGradingService.getGradingReport(gradingNumber);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: '?‘å??±å?ä¸å??¨æ?å·²å¤±??,
        code: 'GRADING_REPORT_NOT_FOUND',
      });
    }

    logger.info('?‘å??±å??¥è©¢?å?', {
      gradingNumber,
      viewCount: result.viewCount,
    });

    res.status(200).json({
      success: true,
      message: '?‘å??±å??¥è©¢?å?',
      data: result,
    });
  } catch (error) {
    logger.error('?¥è©¢?‘å??±å?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?¥è©¢?‘å??±å?å¤±æ?',
      code: 'SIMULATED_GRADING_LOOKUP_ERROR',
    });
  }
});

// ?²å??¨æˆ¶?„é?å®šå ±?Šå?è¡?router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit, agency, sortBy, sortOrder } = req.query;

    // é©—è??¨æˆ¶æ¬Šé?
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '?¡æ??è¨ª?æ­¤?¨æˆ¶?„é?å®šå ±??,
        code: 'UNAUTHORIZED_ACCESS',
      });
    }

// eslint-disable-next-line no-unused-vars
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      agency,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'DESC',
    };

// eslint-disable-next-line no-unused-vars
    const result = await simulatedGradingService.getUserGradingReports(
      userId,
      options
    );

    logger.info('?¨æˆ¶?‘å??±å??—è¡¨?²å??å?', {
      userId,
      totalReports: result.pagination.total,
    });

    res.status(200).json({
      success: true,
      message: '?¨æˆ¶?‘å??±å??—è¡¨?²å??å?',
      data: result,
    });
  } catch (error) {
    logger.error('?²å??¨æˆ¶?‘å??±å??—è¡¨å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?²å??¨æˆ¶?‘å??±å??—è¡¨å¤±æ?',
      code: 'SIMULATED_GRADING_USER_REPORTS_ERROR',
    });
  }
});

// ?œç´¢?‘å??±å?
router.get('/search', async (req, res) => {
  try {
    const { query, page, limit, agency, sortBy, sortOrder } = req.query;

// eslint-disable-next-line no-unused-vars
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      agency,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'DESC',
    };

// eslint-disable-next-line no-unused-vars
    const result = await simulatedGradingService.searchGradingReports(
      query,
      options
    );

    logger.info('?‘å??±å??œç´¢?å?', {
      query,
      totalResults: result.pagination.total,
    });

    res.status(200).json({
      success: true,
      message: '?‘å??±å??œç´¢?å?',
      data: result,
    });
  } catch (error) {
    logger.error('?œç´¢?‘å??±å?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?œç´¢?‘å??±å?å¤±æ?',
      code: 'SIMULATED_GRADING_SEARCH_ERROR',
    });
  }
});

// ?²å??‘å?çµ±è??¸æ?
router.get('/stats/:userId?', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // é©—è??¨æˆ¶æ¬Šé?
    if (
      userId &&
      req.user.id !== parseInt(userId) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: '?¡æ??è¨ª?æ­¤?¨æˆ¶?„çµ±è¨ˆæ•¸??,
        code: 'UNAUTHORIZED_ACCESS',
      });
    }

    const stats = await simulatedGradingService.getGradingStats(userId || null);

    logger.info('?‘å?çµ±è??¸æ??²å??å?', {
      userId: userId || 'all',
      totalReports: stats.totalReports,
    });

    res.status(200).json({
      success: true,
      message: '?‘å?çµ±è??¸æ??²å??å?',
      data: stats,
    });
  } catch (error) {
    logger.error('?²å??‘å?çµ±è??¸æ?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?²å??‘å?çµ±è??¸æ?å¤±æ?',
      code: 'SIMULATED_GRADING_STATS_ERROR',
    });
  }
});

// ?²å??€?—æ­¡è¿ç??‘å??±å?
router.get('/popular/:userId?', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit } = req.query;

    const reports = await simulatedGradingService.getTopViewedReports(
      userId ? parseInt(userId) : null,
      parseInt(limit) || 10
    );

    logger.info('?€?—æ­¡è¿é?å®šå ±?Šç²?–æ???, {
      userId: userId || 'all',
      reportCount: reports.length,
    });

    res.status(200).json({
      success: true,
      message: '?€?—æ­¡è¿é?å®šå ±?Šç²?–æ???,
      data: { reports },
    });
  } catch (error) {
    logger.error('?²å??€?—æ­¡è¿é?å®šå ±?Šå¤±??', error);
    res.status(500).json({
      success: false,
      message: error.message || '?²å??€?—æ­¡è¿é?å®šå ±?Šå¤±??,
      code: 'SIMULATED_GRADING_POPULAR_ERROR',
    });
  }
});

module.exports = router;

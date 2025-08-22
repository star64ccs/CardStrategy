const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const shareVerificationService = require('../services/shareVerificationService');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
// const { validateRequest } = require('../middleware/validation');

// ?�建?�享驗�?
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { cardId, analysisType, analysisResult, expiresInDays } = req.body;
// eslint-disable-next-line no-unused-vars
    const userId = req.user.id;

// eslint-disable-next-line no-unused-vars
    const result = await shareVerificationService.createShareVerification(
      userId,
      cardId,
      analysisType,
      analysisResult,
      expiresInDays
    );

    logger.info('?�享驗�??�建?��?', {
      userId,
      cardId,
      verificationCode: result.verificationCode,
    });

    res.status(201).json({
      success: true,
      message: '?�享驗�??�建?��?',
      data: result,
    });
  } catch (error) {
    logger.error('?�建?�享驗�?失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?�建?�享驗�?失�?',
      code: 'SHARE_VERIFICATION_CREATE_ERROR',
    });
  }
});

// ?�詢?�享驗�?
router.get('/lookup/:verificationCode', async (req, res) => {
  try {
    const { verificationCode } = req.params;

// eslint-disable-next-line no-unused-vars
    const result =
      await shareVerificationService.lookupVerification(verificationCode);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: '驗�?碼�?存在?�已失�?',
        code: 'VERIFICATION_NOT_FOUND',
      });
    }

    logger.info('?�享驗�??�詢?��?', {
      verificationCode,
      viewCount: result.viewCount,
    });

    res.status(200).json({
      success: true,
      message: '驗�??�詢?��?',
      data: result,
    });
  } catch (error) {
    logger.error('?�詢?�享驗�?失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?�詢?�享驗�?失�?',
      code: 'SHARE_VERIFICATION_LOOKUP_ERROR',
    });
  }
});

// 驗�??�享驗�?
router.get('/validate/:verificationCode', async (req, res) => {
  try {
    const { verificationCode } = req.params;

// eslint-disable-next-line no-unused-vars
    const result =
      await shareVerificationService.validateVerification(verificationCode);

    res.status(200).json({
      success: true,
      message: '驗�?完�?',
      data: result,
    });
  } catch (error) {
    logger.error('驗�??�享驗�?失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '驗�??�享驗�?失�?',
      code: 'SHARE_VERIFICATION_VALIDATE_ERROR',
    });
  }
});

// ?��??�戶?�享統�?
router.get('/stats', authenticateToken, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const userId = req.user.id;

    const stats = await shareVerificationService.getUserShareStats(userId);

    res.status(200).json({
      success: true,
      message: '?��??�享統�??��?',
      data: stats,
    });
  } catch (error) {
    logger.error('?��??�享統�?失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��??�享統�?失�?',
      code: 'SHARE_STATS_ERROR',
    });
  }
});

// ?�除?�享驗�?
router.delete('/:verificationCode', authenticateToken, async (req, res) => {
  try {
    const { verificationCode } = req.params;
// eslint-disable-next-line no-unused-vars
    const userId = req.user.id;

    await shareVerificationService.deleteShareVerification(
      userId,
      verificationCode
    );

    logger.info('?�享驗�??�除?��?', {
      userId,
      verificationCode,
    });

    res.status(200).json({
      success: true,
      message: '?�享驗�??�除?��?',
    });
  } catch (error) {
    logger.error('?�除?�享驗�?失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?�除?�享驗�?失�?',
      code: 'SHARE_VERIFICATION_DELETE_ERROR',
    });
  }
});

// ?��??��??�享驗�?
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popularVerifications =
      await shareVerificationService.getPopularVerifications(parseInt(limit));

    res.status(200).json({
      success: true,
      message: '?��??��??�享?��?',
      data: popularVerifications,
    });
  } catch (error) {
    logger.error('?��??��??�享失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��??��??�享失�?',
      code: 'POPULAR_SHARES_ERROR',
    });
  }
});

// ?��?社交媒�??�享?�接
router.post('/social-links', authenticateToken, async (req, res) => {
  try {
    const { verificationCode, platforms } = req.body;
// eslint-disable-next-line no-unused-vars
    const userId = req.user.id;

    const socialLinks = await shareVerificationService.generateSocialShareLinks(
      verificationCode,
      platforms
    );

    res.status(200).json({
      success: true,
      message: '?��?社交媒�??�享?�接?��?',
      data: socialLinks,
    });
  } catch (error) {
    logger.error('?��?社交媒�??�享?�接失�?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?��?社交媒�??�享?�接失�?',
      code: 'SOCIAL_LINKS_ERROR',
    });
  }
});

module.exports = router;

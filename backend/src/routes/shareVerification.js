const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const shareVerificationService = require('../services/shareVerificationService');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
// const { validateRequest } = require('../middleware/validation');

// ?µå»º?†äº«é©—è?
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

    logger.info('?†äº«é©—è??µå»º?å?', {
      userId,
      cardId,
      verificationCode: result.verificationCode,
    });

    res.status(201).json({
      success: true,
      message: '?†äº«é©—è??µå»º?å?',
      data: result,
    });
  } catch (error) {
    logger.error('?µå»º?†äº«é©—è?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?µå»º?†äº«é©—è?å¤±æ?',
      code: 'SHARE_VERIFICATION_CREATE_ERROR',
    });
  }
});

// ?¥è©¢?†äº«é©—è?
router.get('/lookup/:verificationCode', async (req, res) => {
  try {
    const { verificationCode } = req.params;

// eslint-disable-next-line no-unused-vars
    const result =
      await shareVerificationService.lookupVerification(verificationCode);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'é©—è?ç¢¼ä?å­˜åœ¨?–å·²å¤±æ?',
        code: 'VERIFICATION_NOT_FOUND',
      });
    }

    logger.info('?†äº«é©—è??¥è©¢?å?', {
      verificationCode,
      viewCount: result.viewCount,
    });

    res.status(200).json({
      success: true,
      message: 'é©—è??¥è©¢?å?',
      data: result,
    });
  } catch (error) {
    logger.error('?¥è©¢?†äº«é©—è?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?¥è©¢?†äº«é©—è?å¤±æ?',
      code: 'SHARE_VERIFICATION_LOOKUP_ERROR',
    });
  }
});

// é©—è??†äº«é©—è?
router.get('/validate/:verificationCode', async (req, res) => {
  try {
    const { verificationCode } = req.params;

// eslint-disable-next-line no-unused-vars
    const result =
      await shareVerificationService.validateVerification(verificationCode);

    res.status(200).json({
      success: true,
      message: 'é©—è?å®Œæ?',
      data: result,
    });
  } catch (error) {
    logger.error('é©—è??†äº«é©—è?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'é©—è??†äº«é©—è?å¤±æ?',
      code: 'SHARE_VERIFICATION_VALIDATE_ERROR',
    });
  }
});

// ?²å??¨æˆ¶?†äº«çµ±è?
router.get('/stats', authenticateToken, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const userId = req.user.id;

    const stats = await shareVerificationService.getUserShareStats(userId);

    res.status(200).json({
      success: true,
      message: '?²å??†äº«çµ±è??å?',
      data: stats,
    });
  } catch (error) {
    logger.error('?²å??†äº«çµ±è?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?²å??†äº«çµ±è?å¤±æ?',
      code: 'SHARE_STATS_ERROR',
    });
  }
});

// ?ªé™¤?†äº«é©—è?
router.delete('/:verificationCode', authenticateToken, async (req, res) => {
  try {
    const { verificationCode } = req.params;
// eslint-disable-next-line no-unused-vars
    const userId = req.user.id;

    await shareVerificationService.deleteShareVerification(
      userId,
      verificationCode
    );

    logger.info('?†äº«é©—è??ªé™¤?å?', {
      userId,
      verificationCode,
    });

    res.status(200).json({
      success: true,
      message: '?†äº«é©—è??ªé™¤?å?',
    });
  } catch (error) {
    logger.error('?ªé™¤?†äº«é©—è?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?ªé™¤?†äº«é©—è?å¤±æ?',
      code: 'SHARE_VERIFICATION_DELETE_ERROR',
    });
  }
});

// ?²å??±é??†äº«é©—è?
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popularVerifications =
      await shareVerificationService.getPopularVerifications(parseInt(limit));

    res.status(200).json({
      success: true,
      message: '?²å??±é??†äº«?å?',
      data: popularVerifications,
    });
  } catch (error) {
    logger.error('?²å??±é??†äº«å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?²å??±é??†äº«å¤±æ?',
      code: 'POPULAR_SHARES_ERROR',
    });
  }
});

// ?Ÿæ?ç¤¾äº¤åª’é??†äº«?ˆæ¥
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
      message: '?Ÿæ?ç¤¾äº¤åª’é??†äº«?ˆæ¥?å?',
      data: socialLinks,
    });
  } catch (error) {
    logger.error('?Ÿæ?ç¤¾äº¤åª’é??†äº«?ˆæ¥å¤±æ?:', error);
    res.status(500).json({
      success: false,
      message: error.message || '?Ÿæ?ç¤¾äº¤åª’é??†äº«?ˆæ¥å¤±æ?',
      code: 'SOCIAL_LINKS_ERROR',
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const shareVerificationService = require('../services/shareVerificationService');
const logger = require('../utils/logger');
// const { validateRequest } = require('../middleware/validation');

// 創建分享驗證
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { cardId, analysisType, analysisResult, expiresInDays } = req.body;
    const userId = req.user.id;

    const result = await shareVerificationService.createShareVerification(
      userId,
      cardId,
      analysisType,
      analysisResult,
      expiresInDays
    );

    logger.info('分享驗證創建成功', {
      userId,
      cardId,
      verificationCode: result.verificationCode
    });

    res.status(201).json({
      success: true,
      message: '分享驗證創建成功',
      data: result
    });
  } catch (error) {
    logger.error('創建分享驗證失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '創建分享驗證失敗',
      code: 'SHARE_VERIFICATION_CREATE_ERROR'
    });
  }
});

// 查詢分享驗證
router.get('/lookup/:verificationCode', async (req, res) => {
  try {
    const { verificationCode } = req.params;

    const result = await shareVerificationService.lookupVerification(verificationCode);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: '驗證碼不存在或已失效',
        code: 'VERIFICATION_NOT_FOUND'
      });
    }

    logger.info('分享驗證查詢成功', {
      verificationCode,
      viewCount: result.viewCount
    });

    res.status(200).json({
      success: true,
      message: '驗證查詢成功',
      data: result
    });
  } catch (error) {
    logger.error('查詢分享驗證失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '查詢分享驗證失敗',
      code: 'SHARE_VERIFICATION_LOOKUP_ERROR'
    });
  }
});

// 驗證分享驗證
router.get('/validate/:verificationCode', async (req, res) => {
  try {
    const { verificationCode } = req.params;

    const result = await shareVerificationService.validateVerification(verificationCode);

    res.status(200).json({
      success: true,
      message: '驗證完成',
      data: result
    });
  } catch (error) {
    logger.error('驗證分享驗證失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '驗證分享驗證失敗',
      code: 'SHARE_VERIFICATION_VALIDATE_ERROR'
    });
  }
});

// 獲取用戶分享統計
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await shareVerificationService.getUserShareStats(userId);

    res.status(200).json({
      success: true,
      message: '獲取分享統計成功',
      data: stats
    });
  } catch (error) {
    logger.error('獲取分享統計失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取分享統計失敗',
      code: 'SHARE_STATS_ERROR'
    });
  }
});

// 刪除分享驗證
router.delete('/:verificationCode', authenticateToken, async (req, res) => {
  try {
    const { verificationCode } = req.params;
    const userId = req.user.id;

    await shareVerificationService.deleteShareVerification(userId, verificationCode);

    logger.info('分享驗證刪除成功', {
      userId,
      verificationCode
    });

    res.status(200).json({
      success: true,
      message: '分享驗證刪除成功'
    });
  } catch (error) {
    logger.error('刪除分享驗證失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '刪除分享驗證失敗',
      code: 'SHARE_VERIFICATION_DELETE_ERROR'
    });
  }
});

// 獲取熱門分享驗證
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popularVerifications = await shareVerificationService.getPopularVerifications(parseInt(limit));

    res.status(200).json({
      success: true,
      message: '獲取熱門分享成功',
      data: popularVerifications
    });
  } catch (error) {
    logger.error('獲取熱門分享失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取熱門分享失敗',
      code: 'POPULAR_SHARES_ERROR'
    });
  }
});

// 生成社交媒體分享鏈接
router.post('/social-links', authenticateToken, async (req, res) => {
  try {
    const { verificationCode, platforms } = req.body;
    const userId = req.user.id;

    const socialLinks = await shareVerificationService.generateSocialShareLinks(
      verificationCode,
      platforms
    );

    res.status(200).json({
      success: true,
      message: '生成社交媒體分享鏈接成功',
      data: socialLinks
    });
  } catch (error) {
    logger.error('生成社交媒體分享鏈接失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '生成社交媒體分享鏈接失敗',
      code: 'SOCIAL_LINKS_ERROR'
    });
  }
});

module.exports = router;

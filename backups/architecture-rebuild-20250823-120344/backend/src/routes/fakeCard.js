const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const fakeCardService = require('../services/fakeCardService');
const logger = require('../utils/logger');

// 提交假卡報告
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      cardName,
      cardType,
      fakeType,
      imageData,
      description,
      fakeIndicators,
    } = req.body;

    // 驗證必填字段
    if (!cardName || !cardType || !imageData || !description || !fakeIndicators) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段',
        code: 'MISSING_REQUIRED_FIELDS',
      });
    }

    // 驗證圖片數據
    if (!Array.isArray(imageData) || imageData.length === 0) {
      return res.status(400).json({
        success: false,
        message: '至少需要一張圖片',
        code: 'INVALID_IMAGE_DATA',
      });
    }

    if (imageData.length > 5) {
      return res.status(400).json({
        success: false,
        message: '最多只能上傳5張圖片',
        code: 'TOO_MANY_IMAGES',
      });
    }

    // 驗證假卡特徵
    if (!Array.isArray(fakeIndicators) || fakeIndicators.length === 0) {
      return res.status(400).json({
        success: false,
        message: '至少需要選擇一個假卡原因',
        code: 'INVALID_FAKE_INDICATORS',
      });
    }

    // 驗證描述長度
    if (description.length < 10) {
      return res.status(400).json({
        success: false,
        message: '描述至少需要10個字符',
        code: 'DESCRIPTION_TOO_SHORT',
      });
    }

    if (description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: '描述不能超過1000個字符',
        code: 'DESCRIPTION_TOO_LONG',
      });
    }

    const result = await fakeCardService.submitFakeCard({
      userId,
      cardName,
      cardType,
      fakeType: fakeType || 'counterfeit',
      imageData,
      description,
      fakeIndicators,
    });

    logger.info('假卡報告提交成功', {
      userId,
      cardName,
      fakeType: fakeType || 'counterfeit',
      imageCount: imageData.length,
    });

    res.status(201).json({
      success: true,
      message: '假卡報告提交成功',
      data: result,
    });
  } catch (error) {
    logger.error('提交假卡報告失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '提交假卡報告失敗',
      code: 'SUBMIT_FAKE_CARD_ERROR',
    });
  }
});

// 獲取用戶提交的假卡列表
router.get('/user-submissions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const result = await fakeCardService.getUserSubmissions(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });

    res.json({
      success: true,
      message: '獲取用戶提交成功',
      data: result,
    });
  } catch (error) {
    logger.error('獲取用戶提交失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取用戶提交失敗',
      code: 'GET_USER_SUBMISSIONS_ERROR',
    });
  }
});

// 獲取假卡數據庫（僅供AI訓練，需要管理員權限）
router.get('/database', authenticateToken, async (req, res) => {
  try {
    // 檢查用戶權限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '權限不足',
        code: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    const { page = 1, limit = 50, status = 'approved' } = req.query;

    const result = await fakeCardService.getFakeCardDatabase({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });

    res.json({
      success: true,
      message: '獲取假卡數據庫成功',
      data: result,
    });
  } catch (error) {
    logger.error('獲取假卡數據庫失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取假卡數據庫失敗',
      code: 'GET_FAKE_CARD_DATABASE_ERROR',
    });
  }
});

// 獲取獎勵積分
router.get('/rewards', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await fakeCardService.getRewardPoints(userId);

    res.json({
      success: true,
      message: '獲取獎勵積分成功',
      data: result,
    });
  } catch (error) {
    logger.error('獲取獎勵積分失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取獎勵積分失敗',
      code: 'GET_REWARD_POINTS_ERROR',
    });
  }
});

// 審核假卡報告（管理員功能）
router.patch('/review/:id', authenticateToken, async (req, res) => {
  try {
    // 檢查用戶權限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '權限不足',
        code: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    const { id } = req.params;
    const { status, reviewerNotes, rewardPoints } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '無效的審核狀態',
        code: 'INVALID_REVIEW_STATUS',
      });
    }

    const result = await fakeCardService.reviewFakeCard(id, {
      status,
      reviewerNotes,
      rewardPoints,
      reviewerId: req.user.id,
    });

    logger.info('假卡報告審核完成', {
      fakeCardId: id,
      status,
      reviewerId: req.user.id,
    });

    res.json({
      success: true,
      message: '假卡報告審核成功',
      data: result,
    });
  } catch (error) {
    logger.error('審核假卡報告失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '審核假卡報告失敗',
      code: 'REVIEW_FAKE_CARD_ERROR',
    });
  }
});

// 獲取假卡統計信息（管理員功能）
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // 檢查用戶權限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '權限不足',
        code: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    const result = await fakeCardService.getFakeCardStats();

    res.json({
      success: true,
      message: '獲取假卡統計成功',
      data: result,
    });
  } catch (error) {
    logger.error('獲取假卡統計失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取假卡統計失敗',
      code: 'GET_FAKE_CARD_STATS_ERROR',
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const fakeCardService = require('../services/fakeCardService');
const logger = require('../utils/logger');

// SubmitFalse卡Report
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

    // Verify必填Field
    if (!cardName || !cardType || !imageData || !description || !fakeIndicators) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段',
        code: 'MISSING_REQUIRED_FIELDS',
      });
    }

    // VerifyGraph片Data
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

    // VerifyFalse卡特徵
    if (!Array.isArray(fakeIndicators) || fakeIndicators.length === 0) {
      return res.status(400).json({
        success: false,
        message: '至少需要選擇一個假卡原因',
        code: 'INVALID_FAKE_INDICATORS',
      });
    }

    // VerifyDescription長度
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

    logger.info('假卡報告提交Success', {
      userId,
      cardName,
      fakeType: fakeType || 'counterfeit',
      imageCount: imageData.length,
    });

    res.status(201).json({
      success: true,
      message: '假卡報告提交Success',
      data: result,
    });
  } catch (error) {
    logger.error('提交假卡報告Failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || '提交假卡報告Failed',
      code: 'SUBMIT_FAKE_CARD_ERROR',
    });
  }
});

// GetUserSubmit的False卡List
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
      message: 'Get用戶提交Success',
      data: result,
    });
  } catch (error) {
    logger.error('Get用戶提交Failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Get用戶提交Failed',
      code: 'GET_USER_SUBMISSIONS_ERROR',
    });
  }
});

// GetFalse卡Database（僅供AI訓練，需要Manage員權限）
router.get('/database', authenticateToken, async (req, res) => {
  try {
    // CheckUser權限
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
      message: 'Get假卡數據庫Success',
      data: result,
    });
  } catch (error) {
    logger.error('Get假卡數據庫Failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Get假卡數據庫Failed',
      code: 'GET_FAKE_CARD_DATABASE_ERROR',
    });
  }
});

// Get獎勵積分
router.get('/rewards', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await fakeCardService.getRewardPoints(userId);

    res.json({
      success: true,
      message: 'Get獎勵積分Success',
      data: result,
    });
  } catch (error) {
    logger.error('Get獎勵積分Failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Get獎勵積分Failed',
      code: 'GET_REWARD_POINTS_ERROR',
    });
  }
});

// 審核False卡Report（Manage員功能）
router.patch('/review/:id', authenticateToken, async (req, res) => {
  try {
    // CheckUser權限
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
      message: '假卡報告審核Success',
      data: result,
    });
  } catch (error) {
    logger.error('審核假卡報告Failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || '審核假卡報告Failed',
      code: 'REVIEW_FAKE_CARD_ERROR',
    });
  }
});

// GetFalse卡StatisticsInformation（Manage員功能）
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // CheckUser權限
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
      message: 'Get假卡統計Success',
      data: result,
    });
  } catch (error) {
    logger.error('Get假卡統計Failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Get假卡統計Failed',
      code: 'GET_FAKE_CARD_STATS_ERROR',
    });
  }
});

module.exports = router;

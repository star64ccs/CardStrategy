const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// 模擬會員計劃數據
const membershipPlans = [
  {
    id: 'free',
    name: '免費版',
    nameEn: 'Free',
    price: 0,
    currency: 'TWD',
    interval: 'monthly',
    features: [
      '基本卡牌瀏覽',
      '收藏管理',
      '基本市場數據',
      '社區討論'
    ],
    limits: {
      maxCollections: 3,
      maxCards: 100,
      aiAnalysisPerMonth: 5,
      marketInsights: false,
      prioritySupport: false
    }
  },
  {
    id: 'basic',
    name: '基礎版',
    nameEn: 'Basic',
    price: 299,
    currency: 'TWD',
    interval: 'monthly',
    features: [
      '所有免費版功能',
      '無限收藏管理',
      '無限卡牌管理',
      'AI分析（每月20次）',
      '基本市場洞察',
      '投資組合追蹤'
    ],
    limits: {
      maxCollections: -1,
      maxCards: -1,
      aiAnalysisPerMonth: 20,
      marketInsights: true,
      prioritySupport: false
    }
  },
  {
    id: 'premium',
    name: '高級版',
    nameEn: 'Premium',
    price: 599,
    currency: 'TWD',
    interval: 'monthly',
    features: [
      '所有基礎版功能',
      'AI分析（無限次）',
      '高級市場洞察',
      '投資建議',
      '價格預測',
      '優先客服支持',
      '獨家內容'
    ],
    limits: {
      maxCollections: -1,
      maxCards: -1,
      aiAnalysisPerMonth: -1,
      marketInsights: true,
      prioritySupport: true
    }
  },
  {
    id: 'pro',
    name: '專業版',
    nameEn: 'Pro',
    price: 999,
    currency: 'TWD',
    interval: 'monthly',
    features: [
      '所有高級版功能',
      '個人投資顧問',
      '獨家市場報告',
      'API訪問',
      '白標解決方案',
      '專屬客服經理'
    ],
    limits: {
      maxCollections: -1,
      maxCards: -1,
      aiAnalysisPerMonth: -1,
      marketInsights: true,
      prioritySupport: true
    }
  }
];

// @route   GET /api/membership/plans
// @desc    獲取會員計劃列表
// @access  Public
router.get('/plans', async (req, res) => {
  try {
    logger.info('獲取會員計劃列表');

    res.json({
      success: true,
      data: { plans: membershipPlans }
    });
  } catch (error) {
    logger.error('獲取會員計劃錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取會員計劃失敗',
      code: 'GET_PLANS_FAILED'
    });
  }
});

// @route   GET /api/membership/current
// @desc    獲取當前用戶會員狀態
// @access  Private
router.get('/current', protect, async (req, res) => {
  try {
    // 模擬用戶會員狀態
    const currentMembership = {
      type: 'basic',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      isActive: true,
      daysLeft: 334,
      plan: membershipPlans.find(p => p.id === 'basic'),
      usage: {
        aiAnalysisUsed: 12,
        aiAnalysisLimit: 20,
        collectionsCount: 5,
        cardsCount: 150
      },
      billing: {
        nextBillingDate: '2024-03-01T00:00:00Z',
        amount: 299,
        currency: 'TWD',
        autoRenew: true
      }
    };

    logger.info(`獲取會員狀態: ${req.user.username}`);

    res.json({
      success: true,
      data: { membership: currentMembership }
    });
  } catch (error) {
    logger.error('獲取會員狀態錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取會員狀態失敗',
      code: 'GET_MEMBERSHIP_FAILED'
    });
  }
});

// @route   POST /api/membership/subscribe
// @desc    訂閱會員計劃
// @access  Private
router.post('/subscribe', protect, [
  body('planId').isIn(['basic', 'premium', 'pro']).withMessage('計劃ID必須是basic、premium或pro'),
  body('paymentMethod').notEmpty().withMessage('支付方式為必填項'),
  body('autoRenew').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '輸入驗證失敗',
        code: 'VALIDATION_ERROR',
        errors: errors.array()
      });
    }

    const { planId, paymentMethod, autoRenew = true } = req.body;

    const selectedPlan = membershipPlans.find(p => p.id === planId);
    
    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: '無效的會員計劃',
        code: 'INVALID_PLAN'
      });
    }

    // 模擬訂閱處理
    const subscription = {
      id: Date.now().toString(),
      userId: req.user.id,
      planId,
      plan: selectedPlan,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天後
      status: 'active',
      paymentMethod,
      autoRenew,
      amount: selectedPlan.price,
      currency: selectedPlan.currency
    };

    logger.info(`會員訂閱: ${req.user.username} 訂閱了 ${selectedPlan.name}`);

    res.status(201).json({
      success: true,
      message: '會員訂閱成功',
      data: { subscription }
    });
  } catch (error) {
    logger.error('會員訂閱錯誤:', error);
    res.status(500).json({
      success: false,
      message: '會員訂閱失敗',
      code: 'SUBSCRIBE_FAILED'
    });
  }
});

// @route   POST /api/membership/cancel
// @desc    取消會員訂閱
// @access  Private
router.post('/cancel', protect, [
  body('reason').optional().isLength({ max: 500 }).withMessage('取消原因最多500個字符')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '輸入驗證失敗',
        code: 'VALIDATION_ERROR',
        errors: errors.array()
      });
    }

    const { reason = '' } = req.body;

    // 模擬取消訂閱
    const cancellation = {
      id: Date.now().toString(),
      userId: req.user.id,
      cancelledAt: new Date().toISOString(),
      reason,
      effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天後生效
      refundAmount: 0,
      refundReason: '按條款取消，無退款'
    };

    logger.info(`取消會員訂閱: ${req.user.username}, 原因: ${reason}`);

    res.json({
      success: true,
      message: '會員訂閱已取消',
      data: { cancellation }
    });
  } catch (error) {
    logger.error('取消會員訂閱錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取消會員訂閱失敗',
      code: 'CANCEL_FAILED'
    });
  }
});

// @route   PUT /api/membership/upgrade
// @desc    升級會員計劃
// @access  Private
router.put('/upgrade', protect, [
  body('newPlanId').isIn(['premium', 'pro']).withMessage('新計劃ID必須是premium或pro'),
  body('paymentMethod').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '輸入驗證失敗',
        code: 'VALIDATION_ERROR',
        errors: errors.array()
      });
    }

    const { newPlanId, paymentMethod } = req.body;

    const newPlan = membershipPlans.find(p => p.id === newPlanId);
    
    if (!newPlan) {
      return res.status(400).json({
        success: false,
        message: '無效的會員計劃',
        code: 'INVALID_PLAN'
      });
    }

    // 模擬升級處理
    const upgrade = {
      id: Date.now().toString(),
      userId: req.user.id,
      oldPlanId: 'basic',
      newPlanId,
      upgradedAt: new Date().toISOString(),
      effectiveDate: new Date().toISOString(),
      proratedAmount: 150, // 按比例計算的費用
      currency: 'TWD'
    };

    logger.info(`升級會員計劃: ${req.user.username} 升級到 ${newPlan.name}`);

    res.json({
      success: true,
      message: '會員計劃升級成功',
      data: { upgrade }
    });
  } catch (error) {
    logger.error('升級會員計劃錯誤:', error);
    res.status(500).json({
      success: false,
      message: '升級會員計劃失敗',
      code: 'UPGRADE_FAILED'
    });
  }
});

// @route   GET /api/membership/usage
// @desc    獲取會員使用情況
// @access  Private
router.get('/usage', protect, async (req, res) => {
  try {
    // 模擬使用情況數據
    const usage = {
      currentPeriod: {
        start: '2024-02-01T00:00:00Z',
        end: '2024-02-29T23:59:59Z'
      },
      aiAnalysis: {
        used: 12,
        limit: 20,
        remaining: 8,
        percentage: 60
      },
      collections: {
        count: 5,
        limit: -1,
        percentage: 0
      },
      cards: {
        count: 150,
        limit: -1,
        percentage: 0
      },
      marketInsights: {
        accessed: 25,
        lastAccess: '2024-02-15T10:30:00Z'
      },
      features: {
        aiAnalysis: true,
        marketInsights: true,
        investmentAdvice: false,
        pricePrediction: false,
        prioritySupport: false
      }
    };

    logger.info(`獲取使用情況: ${req.user.username}`);

    res.json({
      success: true,
      data: { usage }
    });
  } catch (error) {
    logger.error('獲取使用情況錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取使用情況失敗',
      code: 'GET_USAGE_FAILED'
    });
  }
});

// @route   GET /api/membership/billing
// @desc    獲取賬單歷史
// @access  Private
router.get('/billing', protect, async (req, res) => {
  try {
    // 模擬賬單歷史
    const billingHistory = [
      {
        id: '1',
        date: '2024-02-01T00:00:00Z',
        amount: 299,
        currency: 'TWD',
        status: 'paid',
        description: '基礎版會員 - 2024年2月',
        paymentMethod: '信用卡',
        invoiceUrl: 'https://example.com/invoice/1'
      },
      {
        id: '2',
        date: '2024-01-01T00:00:00Z',
        amount: 299,
        currency: 'TWD',
        status: 'paid',
        description: '基礎版會員 - 2024年1月',
        paymentMethod: '信用卡',
        invoiceUrl: 'https://example.com/invoice/2'
      }
    ];

    logger.info(`獲取賬單歷史: ${req.user.username}`);

    res.json({
      success: true,
      data: { billingHistory }
    });
  } catch (error) {
    logger.error('獲取賬單歷史錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取賬單歷史失敗',
      code: 'GET_BILLING_FAILED'
    });
  }
});

// @route   POST /api/membership/payment-method
// @desc    更新支付方式
// @access  Private
router.post('/payment-method', protect, [
  body('paymentMethod').notEmpty().withMessage('支付方式為必填項'),
  body('cardNumber').optional().isString(),
  body('expiryDate').optional().isString(),
  body('cvv').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '輸入驗證失敗',
        code: 'VALIDATION_ERROR',
        errors: errors.array()
      });
    }

    const { paymentMethod, cardNumber, expiryDate, cvv } = req.body;

    // 模擬更新支付方式
    const updatedPaymentMethod = {
      id: Date.now().toString(),
      userId: req.user.id,
      type: paymentMethod,
      lastFour: cardNumber ? cardNumber.slice(-4) : null,
      expiryDate,
      updatedAt: new Date().toISOString()
    };

    logger.info(`更新支付方式: ${req.user.username}`);

    res.json({
      success: true,
      message: '支付方式更新成功',
      data: { paymentMethod: updatedPaymentMethod }
    });
  } catch (error) {
    logger.error('更新支付方式錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新支付方式失敗',
      code: 'UPDATE_PAYMENT_METHOD_FAILED'
    });
  }
});

module.exports = router;

const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken: protect } = require('../middleware/auth');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');

const router = express.Router();

// Ê®°Êì¨?ÉÂì°Ë®àÂ??∏Ê?
const membershipPlans = [
  {
    id: 'free',
    name: '?çË≤ª??,
    nameEn: 'Free',
    price: 0,
    currency: 'TWD',
    interval: 'monthly',
    features: ['?∫Êú¨?°Á??èË¶Ω', '?∂Ë?ÁÆ°Á?', '?∫Êú¨Â∏ÇÂ†¥?∏Ê?', 'Á§æÂ?Ë®éË?'],
    limits: {
      maxCollections: 3,
      maxCards: 100,
      aiAnalysisPerMonth: 5,
      marketInsights: false,
      prioritySupport: false,
    },
  },
  {
    id: 'basic',
    name: '?∫Á???,
    nameEn: 'Basic',
    price: 299,
    currency: 'TWD',
    interval: 'monthly',
    features: [
      '?Ä?âÂ?Ë≤ªÁ??üËÉΩ',
      '?°È??∂Ë?ÁÆ°Á?',
      '?°È??°Á?ÁÆ°Á?',
      'AI?ÜÊ?ÔºàÊ???0Ê¨°Ô?',
      '?∫Êú¨Â∏ÇÂ†¥Ê¥ûÂ?',
      '?ïË?ÁµÑÂ?ËøΩËπ§',
    ],
    limits: {
      maxCollections: -1,
      maxCards: -1,
      aiAnalysisPerMonth: 20,
      marketInsights: true,
      prioritySupport: false,
    },
  },
  {
    id: 'premium',
    name: 'È´òÁ???,
    nameEn: 'Premium',
    price: 599,
    currency: 'TWD',
    interval: 'monthly',
    features: [
      '?Ä?âÂü∫Á§éÁ??üËÉΩ',
      'AI?ÜÊ?ÔºàÁÑ°?êÊ¨°Ôº?,
      'È´òÁ?Â∏ÇÂ†¥Ê¥ûÂ?',
      '?ïË?Âª∫Ë≠∞',
      '?πÊ†º?êÊ∏¨',
      '?™Â?ÂÆ¢Ê??ØÊ?',
      '?®ÂÆ∂?ßÂÆπ',
    ],
    limits: {
      maxCollections: -1,
      maxCards: -1,
      aiAnalysisPerMonth: -1,
      marketInsights: true,
      prioritySupport: true,
    },
  },
  {
    id: 'pro',
    name: 'Â∞àÊ•≠??,
    nameEn: 'Pro',
    price: 999,
    currency: 'TWD',
    interval: 'monthly',
    features: [
      '?Ä?âÈ?Á¥öÁ??üËÉΩ',
      '?ã‰∫∫?ïË?È°ßÂ?',
      '?®ÂÆ∂Â∏ÇÂ†¥?±Â?',
      'APIË®™Â?',
      '?ΩÊ?Ëß?±∫?πÊ?',
      'Â∞àÂ±¨ÂÆ¢Ê?Á∂ìÁ?',
    ],
    limits: {
      maxCollections: -1,
      maxCards: -1,
      aiAnalysisPerMonth: -1,
      marketInsights: true,
      prioritySupport: true,
    },
  },
];

// @route   GET /api/membership/plans
// @desc    ?≤Â??ÉÂì°Ë®àÂ??óË°®
// @access  Public
router.get('/plans', async (req, res) => {
  try {
    logger.info('?≤Â??ÉÂì°Ë®àÂ??óË°®');

    res.json({
      success: true,
      data: { plans: membershipPlans },
    });
  } catch (error) {
    logger.error('?≤Â??ÉÂì°Ë®àÂ??ØË™§:', error);
    res.status(500).json({
      success: false,
      message: '?≤Â??ÉÂì°Ë®àÂ?Â§±Ê?',
      code: 'GET_PLANS_FAILED',
    });
  }
});

// @route   GET /api/membership/current
// @desc    ?≤Â??∂Â??®Êà∂?ÉÂì°?Ä??// @access  Private
router.get('/current', protect, async (req, res) => {
  try {
    // Ê®°Êì¨?®Êà∂?ÉÂì°?Ä??    const currentMembership = {
      type: 'basic',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      isActive: true,
      daysLeft: 334,
      plan: membershipPlans.find((p) => p.id === 'basic'),
      usage: {
        aiAnalysisUsed: 12,
        aiAnalysisLimit: 20,
        collectionsCount: 5,
        cardsCount: 150,
      },
      billing: {
        nextBillingDate: '2024-03-01T00:00:00Z',
        amount: 299,
        currency: 'TWD',
        autoRenew: true,
      },
    };

    logger.info(`?≤Â??ÉÂì°?Ä?? ${req.user.username}`);

    res.json({
      success: true,
      data: { membership: currentMembership },
    });
  } catch (error) {
    logger.error('?≤Â??ÉÂì°?Ä?ãÈåØË™?', error);
    res.status(500).json({
      success: false,
      message: '?≤Â??ÉÂì°?Ä?ãÂ§±??,
      code: 'GET_MEMBERSHIP_FAILED',
    });
  }
});

// @route   POST /api/membership/subscribe
// @desc    Ë®ÇÈñ±?ÉÂì°Ë®àÂ?
// @access  Private
router.post(
  '/subscribe',
  protect,
  [
    body('planId')
      .isIn(['basic', 'premium', 'pro'])
      .withMessage('Ë®àÂ?IDÂøÖÈ??Øbasic?Åpremium?ñpro'),
    body('paymentMethod').notEmpty().withMessage('?Ø‰??πÂ??∫Â?Â°´È?'),
    body('autoRenew').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Ëº∏ÂÖ•È©óË?Â§±Ê?',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { planId, paymentMethod, autoRenew = true } = req.body;

      const selectedPlan = membershipPlans.find((p) => p.id === planId);

      if (!selectedPlan) {
        return res.status(400).json({
          success: false,
          message: '?°Ê??ÑÊ??°Ë???,
          code: 'INVALID_PLAN',
        });
      }

      // Ê®°Êì¨Ë®ÇÈñ±?ïÁ?
      const subscription = {
        id: Date.now().toString(),
        userId: req.user.id,
        planId,
        plan: selectedPlan,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30Â§©Â?
        status: 'active',
        paymentMethod,
        autoRenew,
        amount: selectedPlan.price,
        currency: selectedPlan.currency,
      };

      logger.info(`?ÉÂì°Ë®ÇÈñ±: ${req.user.username} Ë®ÇÈñ±‰∫?${selectedPlan.name}`);

      res.status(201).json({
        success: true,
        message: '?ÉÂì°Ë®ÇÈñ±?êÂ?',
        data: { subscription },
      });
    } catch (error) {
      logger.error('?ÉÂì°Ë®ÇÈñ±?ØË™§:', error);
      res.status(500).json({
        success: false,
        message: '?ÉÂì°Ë®ÇÈñ±Â§±Ê?',
        code: 'SUBSCRIBE_FAILED',
      });
    }
  }
);

// @route   POST /api/membership/cancel
// @desc    ?ñÊ??ÉÂì°Ë®ÇÈñ±
// @access  Private
router.post(
  '/cancel',
  protect,
  [
    body('reason')
      .optional()
      .isLength({ max: 500 })
      .withMessage('?ñÊ??üÂ??ÄÂ§?00?ãÂ?Á¨?),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Ëº∏ÂÖ•È©óË?Â§±Ê?',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { reason = '' } = req.body;

      // Ê®°Êì¨?ñÊ?Ë®ÇÈñ±
      const cancellation = {
        id: Date.now().toString(),
        userId: req.user.id,
        cancelledAt: new Date().toISOString(),
        reason,
        effectiveDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30Â§©Â??üÊ?
        refundAmount: 0,
        refundReason: '?âÊ?Ê¨æÂ?Ê∂àÔ??°ÈÄÄÊ¨?,
      };

      logger.info(`?ñÊ??ÉÂì°Ë®ÇÈñ±: ${req.user.username}, ?üÂ?: ${reason}`);

      res.json({
        success: true,
        message: '?ÉÂì°Ë®ÇÈñ±Â∑≤Â?Ê∂?,
        data: { cancellation },
      });
    } catch (error) {
      logger.error('?ñÊ??ÉÂì°Ë®ÇÈñ±?ØË™§:', error);
      res.status(500).json({
        success: false,
        message: '?ñÊ??ÉÂì°Ë®ÇÈñ±Â§±Ê?',
        code: 'CANCEL_FAILED',
      });
    }
  }
);

// @route   PUT /api/membership/upgrade
// @desc    ?áÁ??ÉÂì°Ë®àÂ?
// @access  Private
router.put(
  '/upgrade',
  protect,
  [
    body('newPlanId')
      .isIn(['premium', 'pro'])
      .withMessage('?∞Ë??ÉIDÂøÖÈ??Øpremium?ñpro'),
    body('paymentMethod').optional().isString(),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Ëº∏ÂÖ•È©óË?Â§±Ê?',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { newPlanId, paymentMethod } = req.body;

// eslint-disable-next-line no-unused-vars
      const newPlan = membershipPlans.find((p) => p.id === newPlanId);

      if (!newPlan) {
        return res.status(400).json({
          success: false,
          message: '?°Ê??ÑÊ??°Ë???,
          code: 'INVALID_PLAN',
        });
      }

      // Ê®°Êì¨?áÁ??ïÁ?
      const upgrade = {
        id: Date.now().toString(),
        userId: req.user.id,
        oldPlanId: 'basic',
        newPlanId,
        upgradedAt: new Date().toISOString(),
        effectiveDate: new Date().toISOString(),
        proratedAmount: 150, // ?âÊ?‰æãË?ÁÆóÁ?Ë≤ªÁî®
        currency: 'TWD',
      };

      logger.info(`?áÁ??ÉÂì°Ë®àÂ?: ${req.user.username} ?áÁ???${newPlan.name}`);

      res.json({
        success: true,
        message: '?ÉÂì°Ë®àÂ??áÁ??êÂ?',
        data: { upgrade },
      });
    } catch (error) {
      logger.error('?áÁ??ÉÂì°Ë®àÂ??ØË™§:', error);
      res.status(500).json({
        success: false,
        message: '?áÁ??ÉÂì°Ë®àÂ?Â§±Ê?',
        code: 'UPGRADE_FAILED',
      });
    }
  }
);

// @route   GET /api/membership/usage
// @desc    ?≤Â??ÉÂì°‰ΩøÁî®?ÖÊ?
// @access  Private
router.get('/usage', protect, async (req, res) => {
  try {
    // Ê®°Êì¨‰ΩøÁî®?ÖÊ??∏Ê?
    const usage = {
      currentPeriod: {
        start: '2024-02-01T00:00:00Z',
        end: '2024-02-29T23:59:59Z',
      },
      aiAnalysis: {
        used: 12,
        limit: 20,
        remaining: 8,
        percentage: 60,
      },
      collections: {
        count: 5,
        limit: -1,
        percentage: 0,
      },
      cards: {
        count: 150,
        limit: -1,
        percentage: 0,
      },
      marketInsights: {
        accessed: 25,
        lastAccess: '2024-02-15T10:30:00Z',
      },
      features: {
        aiAnalysis: true,
        marketInsights: true,
        investmentAdvice: false,
        pricePrediction: false,
        prioritySupport: false,
      },
    };

    logger.info(`?≤Â?‰ΩøÁî®?ÖÊ?: ${req.user.username}`);

    res.json({
      success: true,
      data: { usage },
    });
  } catch (error) {
    logger.error('?≤Â?‰ΩøÁî®?ÖÊ??ØË™§:', error);
    res.status(500).json({
      success: false,
      message: '?≤Â?‰ΩøÁî®?ÖÊ?Â§±Ê?',
      code: 'GET_USAGE_FAILED',
    });
  }
});

// @route   GET /api/membership/billing
// @desc    ?≤Â?Ë≥¨ÂñÆÊ≠∑Âè≤
// @access  Private
router.get('/billing', protect, async (req, res) => {
  try {
    // Ê®°Êì¨Ë≥¨ÂñÆÊ≠∑Âè≤
    const billingHistory = [
      {
        id: '1',
        date: '2024-02-01T00:00:00Z',
        amount: 299,
        currency: 'TWD',
        status: 'paid',
        description: '?∫Á??àÊ???- 2024Âπ???,
        paymentMethod: '‰ø°Áî®??,
        invoiceUrl: 'https://example.com/invoice/1',
      },
      {
        id: '2',
        date: '2024-01-01T00:00:00Z',
        amount: 299,
        currency: 'TWD',
        status: 'paid',
        description: '?∫Á??àÊ???- 2024Âπ???,
        paymentMethod: '‰ø°Áî®??,
        invoiceUrl: 'https://example.com/invoice/2',
      },
    ];

    logger.info(`?≤Â?Ë≥¨ÂñÆÊ≠∑Âè≤: ${req.user.username}`);

    res.json({
      success: true,
      data: { billingHistory },
    });
  } catch (error) {
    logger.error('?≤Â?Ë≥¨ÂñÆÊ≠∑Âè≤?ØË™§:', error);
    res.status(500).json({
      success: false,
      message: '?≤Â?Ë≥¨ÂñÆÊ≠∑Âè≤Â§±Ê?',
      code: 'GET_BILLING_FAILED',
    });
  }
});

// @route   POST /api/membership/payment-method
// @desc    ?¥Êñ∞?Ø‰??πÂ?
// @access  Private
router.post(
  '/payment-method',
  protect,
  [
    body('paymentMethod').notEmpty().withMessage('?Ø‰??πÂ??∫Â?Â°´È?'),
    body('cardNumber').optional().isString(),
    body('expiryDate').optional().isString(),
    body('cvv').optional().isString(),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Ëº∏ÂÖ•È©óË?Â§±Ê?',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { paymentMethod, cardNumber, expiryDate, cvv } = req.body;

      // Ê®°Êì¨?¥Êñ∞?Ø‰??πÂ?
      const updatedPaymentMethod = {
        id: Date.now().toString(),
        userId: req.user.id,
        type: paymentMethod,
        lastFour: cardNumber ? cardNumber.slice(-4) : null,
        expiryDate,
        updatedAt: new Date().toISOString(),
      };

      logger.info(`?¥Êñ∞?Ø‰??πÂ?: ${req.user.username}`);

      res.json({
        success: true,
        message: '?Ø‰??πÂ??¥Êñ∞?êÂ?',
        data: { paymentMethod: updatedPaymentMethod },
      });
    } catch (error) {
      logger.error('?¥Êñ∞?Ø‰??πÂ??ØË™§:', error);
      res.status(500).json({
        success: false,
        message: '?¥Êñ∞?Ø‰??πÂ?Â§±Ê?',
        code: 'UPDATE_PAYMENT_METHOD_FAILED',
      });
    }
  }
);

module.exports = router;

const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken: protect } = require('../middleware/auth');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/settings
// @desc    ?��??�戶設置
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // 模擬?�戶設置
    const settings = {
      preferences: {
        language: 'zh-TW',
        theme: 'auto',
        currency: 'TWD',
        timezone: 'Asia/Taipei',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
      },
      notifications: {
        email: {
          enabled: true,
          types: ['market_updates', 'price_alerts', 'investment_news'],
        },
        push: {
          enabled: true,
          types: ['price_alerts', 'market_updates'],
        },
        sms: {
          enabled: false,
          types: [],
        },
      },
      privacy: {
        profileVisibility: 'public',
        collectionVisibility: 'friends',
        showEmail: false,
        showPhone: false,
        allowDataCollection: true,
      },
      security: {
        twoFactorEnabled: false,
        loginNotifications: true,
        sessionTimeout: 30,
        passwordChangeRequired: false,
      },
      display: {
        defaultView: 'grid',
        cardsPerPage: 20,
        showPrices: true,
        showCondition: true,
        compactMode: false,
      },
    };

    logger.info(`?��??�戶設置: ${req.user.username}`);

    res.json({
      success: true,
      data: { settings },
    });
  } catch (error) {
    logger.error('?��??�戶設置?�誤:', error);
    res.status(500).json({
      success: false,
      message: '?��??�戶設置失�?',
      code: 'GET_SETTINGS_FAILED',
    });
  }
});

// @route   PUT /api/settings
// @desc    ?�新?�戶設置
// @access  Private
router.put(
  '/',
  protect,
  [
    body('preferences.language').optional().isIn(['zh-TW', 'en-US', 'ja-JP']),
    body('preferences.theme').optional().isIn(['light', 'dark', 'auto']),
    body('preferences.currency').optional().isIn(['TWD', 'USD', 'EUR', 'JPY']),
    body('notifications.email.enabled').optional().isBoolean(),
    body('notifications.push.enabled').optional().isBoolean(),
    body('privacy.profileVisibility')
      .optional()
      .isIn(['public', 'friends', 'private']),
    body('security.twoFactorEnabled').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗�?失�?',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const updatedSettings = req.body;

      logger.info(`?�新?�戶設置: ${req.user.username}`);

      res.json({
        success: true,
        message: '設置?�新?��?',
        data: { settings: updatedSettings },
      });
    } catch (error) {
      logger.error('?�新?�戶設置?�誤:', error);
      res.status(500).json({
        success: false,
        message: '?�新?�戶設置失�?',
        code: 'UPDATE_SETTINGS_FAILED',
      });
    }
  }
);

// @route   POST /api/settings/notifications
// @desc    ?�新?�知設置
// @access  Private
router.post(
  '/notifications',
  protect,
  [
    body('type')
      .isIn(['email', 'push', 'sms'])
      .withMessage('?�知類�?必�??�email?�push?�sms'),
    body('enabled').isBoolean().withMessage('?�用?�?��??�是布爾??),
    body('types').optional().isArray().withMessage('?�知類�?必�??�數�?),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗�?失�?',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { type, enabled, types = [] } = req.body;

      logger.info(
        `?�新?�知設置: ${req.user.username}, 類�?: ${type}, ?�用: ${enabled}`
      );

      res.json({
        success: true,
        message: '?�知設置?�新?��?',
        data: { type, enabled, types },
      });
    } catch (error) {
      logger.error('?�新?�知設置?�誤:', error);
      res.status(500).json({
        success: false,
        message: '?�新?�知設置失�?',
        code: 'UPDATE_NOTIFICATIONS_FAILED',
      });
    }
  }
);

// @route   POST /api/settings/security/two-factor
// @desc    ?�用/禁用?��?素�?�?// @access  Private
router.post(
  '/security/two-factor',
  protect,
  [
    body('enabled').isBoolean().withMessage('?�用?�?��??�是布爾??),
    body('method')
      .optional()
      .isIn(['app', 'sms', 'email'])
      .withMessage('認�??��?必�??�app?�sms?�email'),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗�?失�?',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { enabled, method = 'app' } = req.body;

      if (enabled) {
        // 模擬?��??��?素�?證設�?        const twoFactorSetup = {
          secret: 'JBSWY3DPEHPK3PXP',
          qrCode:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          backupCodes: ['123456', '234567', '345678', '456789', '567890'],
        };

        logger.info(`?�用?��?素�?�? ${req.user.username}, ?��?: ${method}`);

        res.json({
          success: true,
          message: '?��?素�?證已?�用',
          data: { twoFactorSetup },
        });
      } else {
        logger.info(`禁用?��?素�?�? ${req.user.username}`);

        res.json({
          success: true,
          message: '?��?素�?證已禁用',
        });
      }
    } catch (error) {
      logger.error('?��?素�?證設置錯�?', error);
      res.status(500).json({
        success: false,
        message: '?��?素�?證設置失??,
        code: 'TWO_FACTOR_SETUP_FAILED',
      });
    }
  }
);

// @route   POST /api/settings/security/verify-two-factor
// @desc    驗�??��?素�?�?// @access  Private
router.post(
  '/security/verify-two-factor',
  protect,
  [
    body('code')
      .isLength({ min: 6, max: 6 })
      .withMessage('驗�?碼�??�是6位數�?),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗�?失�?',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { code } = req.body;

      // 模擬驗�?（實?��?該�?證�?實�?TOTP�?���?      const isValid = code === '123456';

      if (isValid) {
        logger.info(`?��?素�?證�?證�??? ${req.user.username}`);

        res.json({
          success: true,
          message: '?��?素�?證�?證�???,
        });
      } else {
        logger.warn(`?��?素�?證�?證失?? ${req.user.username}`);

        res.status(400).json({
          success: false,
          message: '驗�?碼錯�?,
          code: 'INVALID_2FA_CODE',
        });
      }
    } catch (error) {
      logger.error('?��?素�?證�?證錯�?', error);
      res.status(500).json({
        success: false,
        message: '?��?素�?證�?證失??,
        code: 'VERIFY_2FA_FAILED',
      });
    }
  }
);

// @route   POST /api/settings/export-data
// @desc    導出?�戶?��?
// @access  Private
router.post(
  '/export-data',
  protect,
  [
    body('format')
      .isIn(['json', 'csv', 'pdf'])
      .withMessage('導出?��?必�??�json?�csv?�pdf'),
    body('dataTypes').isArray().withMessage('?��?類�?必�??�數�?),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗�?失�?',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { format, dataTypes } = req.body;

      // 模擬?��?導出
      const exportData = {
        id: Date.now().toString(),
        userId: req.user.id,
        format,
        dataTypes,
        status: 'processing',
        downloadUrl: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小�?後�???        createdAt: new Date().toISOString(),
      };

      logger.info(`?��?導出請�?: ${req.user.username}, ?��?: ${format}`);

      res.json({
        success: true,
        message: '?��?導出請�?已�?�?,
        data: { exportData },
      });
    } catch (error) {
      logger.error('?��?導出?�誤:', error);
      res.status(500).json({
        success: false,
        message: '?��?導出失�?',
        code: 'EXPORT_DATA_FAILED',
      });
    }
  }
);

// @route   DELETE /api/settings/delete-account
// @desc    ?�除?�戶賬戶
// @access  Private
router.delete(
  '/delete-account',
  protect,
  [
    body('reason')
      .optional()
      .isLength({ max: 500 })
      .withMessage('?�除?��??��?00?��?�?),
    body('password').notEmpty().withMessage('密碼?��?填�?'),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗�?失�?',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { reason = '', password } = req.body;

      // 模擬賬戶?�除
      const accountDeletion = {
        id: Date.now().toString(),
        userId: req.user.id,
        requestedAt: new Date().toISOString(),
        effectiveDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30天�??��?
        reason,
        status: 'pending',
      };

      logger.info(`賬戶?�除請�?: ${req.user.username}, ?��?: ${reason}`);

      res.json({
        success: true,
        message: '賬戶?�除請�?已�?交�?將在30天�??��?',
        data: { accountDeletion },
      });
    } catch (error) {
      logger.error('賬戶?�除?�誤:', error);
      res.status(500).json({
        success: false,
        message: '賬戶?�除失�?',
        code: 'DELETE_ACCOUNT_FAILED',
      });
    }
  }
);

// @route   POST /api/settings/cancel-deletion
// @desc    ?��?賬戶?�除
// @access  Private
router.post('/cancel-deletion', protect, async (req, res) => {
  try {
    logger.info(`?��?賬戶?�除: ${req.user.username}`);

    res.json({
      success: true,
      message: '賬戶?�除已�?�?,
    });
  } catch (error) {
    logger.error('?��?賬戶?�除?�誤:', error);
    res.status(500).json({
      success: false,
      message: '?��?賬戶?�除失�?',
      code: 'CANCEL_DELETION_FAILED',
    });
  }
});

module.exports = router;

const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/settings
// @desc    獲取用戶設置
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // 模擬用戶設置數據
    const settings = {
      notifications: {
        email: true,
        push: true,
        sms: false,
        types: ['price_alerts', 'market_updates', 'system_notifications'],
      },
      security: {
        twoFactorEnabled: false,
        twoFactorMethod: 'app',
        sessionTimeout: 3600,
        loginNotifications: true,
      },
      privacy: {
        profileVisibility: 'public',
        dataSharing: false,
        analyticsTracking: true,
      },
      preferences: {
        language: 'zh-TW',
        currency: 'TWD',
        timezone: 'Asia/Taipei',
        theme: 'light',
      },
      dataExport: {
        enabled: true,
        formats: ['json', 'csv', 'pdf'],
        retentionDays: 30,
      },
    };

    logger.info(`獲取用戶設置: ${req.user.username}`);

    res.json({
      success: true,
      message: '設置獲取成功',
      data: { settings },
    });
  } catch (error) {
    logger.error('獲取用戶設置錯誤:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取設置失敗',
      code: 'SETTINGS_FETCH_FAILED',
    });
  }
});

// @route   PUT /api/settings/notifications
// @desc    更新通知設置
// @access  Private
router.put(
  '/notifications',
  protect,
  [
    body('type')
      .isIn(['email', 'push', 'sms'])
      .withMessage('通知類型必須是email/push/sms'),
    body('enabled').isBoolean().withMessage('啟用狀態必須是布爾值'),
    body('types').optional().isArray().withMessage('通知類型必須是數組'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗證失敗',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { type, enabled, types = [] } = req.body;

      logger.info(
        `更新通知設置: ${req.user.username}, 類型: ${type}, 啟用: ${enabled}`
      );

      res.json({
        success: true,
        message: '通知設置更新成功',
        data: { type, enabled, types },
      });
    } catch (error) {
      logger.error('更新通知設置錯誤:', error);
      res.status(500).json({
        success: false,
        message: '更新通知設置失敗',
        code: 'UPDATE_NOTIFICATIONS_FAILED',
      });
    }
  }
);

// @route   POST /api/settings/security/two-factor
// @desc    啟用/禁用雙因素認證
// @access  Private
router.post(
  '/security/two-factor',
  protect,
  [
    body('enabled').isBoolean().withMessage('啟用狀態必須是布爾值'),
    body('method')
      .optional()
      .isIn(['app', 'sms', 'email'])
      .withMessage('認證方法必須是app/sms/email'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗證失敗',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { enabled, method = 'app' } = req.body;

      if (enabled) {
        // 模擬雙因素認證設置
        const twoFactorSetup = {
          secret: 'JBSWY3DPEHPK3PXP',
          qrCode:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          backupCodes: ['123456', '234567', '345678', '456789', '567890'],
        };

        logger.info(`啟用雙因素認證: ${req.user.username}, 方法: ${method}`);

        res.json({
          success: true,
          message: '雙因素認證已啟用',
          data: { twoFactorSetup },
        });
      } else {
        logger.info(`禁用雙因素認證: ${req.user.username}`);

        res.json({
          success: true,
          message: '雙因素認證已禁用',
        });
      }
    } catch (error) {
      logger.error('雙因素認證設置錯誤:', error);
      res.status(500).json({
        success: false,
        message: '雙因素認證設置失敗',
        code: 'TWO_FACTOR_SETUP_FAILED',
      });
    }
  }
);

// @route   POST /api/settings/security/two-factor/verify
// @desc    驗證雙因素認證
// @access  Private
router.post(
  '/security/two-factor/verify',
  protect,
  [
    body('code')
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('驗證碼必須是6位數字'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗證失敗',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { code } = req.body;

      // 模擬驗證邏輯
      if (code === '123456') {
        logger.info(`雙因素認證驗證成功: ${req.user.username}`);

        res.json({
          success: true,
          message: '雙因素認證驗證成功',
        });
      } else {
        logger.warn(`雙因素認證驗證失敗: ${req.user.username}, 代碼: ${code}`);

        res.status(400).json({
          success: false,
          message: '驗證碼錯誤',
          code: 'INVALID_2FA_CODE',
        });
      }
    } catch (error) {
      logger.error('雙因素認證驗證錯誤:', error);
      res.status(500).json({
        success: false,
        message: '雙因素認證驗證失敗',
        code: 'VERIFY_2FA_FAILED',
      });
    }
  }
);

// @route   PUT /api/settings/privacy
// @desc    更新隱私設置
// @access  Private
router.put(
  '/privacy',
  protect,
  [
    body('profileVisibility')
      .isIn(['public', 'private', 'friends'])
      .withMessage('個人資料可見性必須是public/private/friends'),
    body('dataSharing').isBoolean().withMessage('數據共享必須是布爾值'),
    body('analyticsTracking').isBoolean().withMessage('分析追蹤必須是布爾值'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗證失敗',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { profileVisibility, dataSharing, analyticsTracking } = req.body;

      logger.info(`更新隱私設置: ${req.user.username}`);

      res.json({
        success: true,
        message: '隱私設置更新成功',
        data: { profileVisibility, dataSharing, analyticsTracking },
      });
    } catch (error) {
      logger.error('更新隱私設置錯誤:', error);
      res.status(500).json({
        success: false,
        message: '更新隱私設置失敗',
        code: 'UPDATE_PRIVACY_FAILED',
      });
    }
  }
);

// @route   PUT /api/settings/preferences
// @desc    更新偏好設置
// @access  Private
router.put(
  '/preferences',
  protect,
  [
    body('language').isIn(['zh-TW', 'en-US', 'ja-JP']).withMessage('語言必須是zh-TW/en-US/ja-JP'),
    body('currency').isIn(['TWD', 'USD', 'JPY']).withMessage('貨幣必須是TWD/USD/JPY'),
    body('timezone').isString().withMessage('時區必須是字符串'),
    body('theme').isIn(['light', 'dark', 'auto']).withMessage('主題必須是light/dark/auto'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗證失敗',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { language, currency, timezone, theme } = req.body;

      logger.info(`更新偏好設置: ${req.user.username}`);

      res.json({
        success: true,
        message: '偏好設置更新成功',
        data: { language, currency, timezone, theme },
      });
    } catch (error) {
      logger.error('更新偏好設置錯誤:', error);
      res.status(500).json({
        success: false,
        message: '更新偏好設置失敗',
        code: 'UPDATE_PREFERENCES_FAILED',
      });
    }
  }
);

// @route   POST /api/settings/data-export
// @desc    請求數據導出
// @access  Private
router.post(
  '/data-export',
  protect,
  [
    body('dataTypes').isArray().withMessage('數據類型必須是數組'),
    body('format').isIn(['json', 'csv', 'pdf']).withMessage('格式必須是json/csv/pdf'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗證失敗',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { dataTypes, format } = req.body;

      // 模擬數據導出
      const exportData = {
        id: 'export_' + Date.now(),
        status: 'processing',
        dataTypes,
        format,
        createdAt: new Date(),
        estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000), // 5分鐘後
      };

      logger.info(`請求數據導出: ${req.user.username}, 格式: ${format}`);

      res.json({
        success: true,
        message: '數據導出請求已提交',
        data: { exportData },
      });
    } catch (error) {
      logger.error('數據導出請求錯誤:', error);
      res.status(500).json({
        success: false,
        message: '數據導出請求失敗',
        code: 'DATA_EXPORT_REQUEST_FAILED',
      });
    }
  }
);

// @route   GET /api/settings/data-export/:exportId
// @desc    獲取數據導出狀態
// @access  Private
router.get('/data-export/:exportId', protect, async (req, res) => {
  try {
    const { exportId } = req.params;

    // 模擬導出狀態
    const exportStatus = {
      id: exportId,
      status: 'completed',
      downloadUrl: `https://api.cardstrategy.com/exports/${exportId}.json`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小時後過期
    };

    logger.info(`獲取數據導出狀態: ${req.user.username}, 導出ID: ${exportId}`);

    res.json({
      success: true,
      message: '導出狀態獲取成功',
      data: { exportStatus },
    });
  } catch (error) {
    logger.error('獲取數據導出狀態錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取導出狀態失敗',
      code: 'EXPORT_STATUS_FETCH_FAILED',
    });
  }
});

// @route   DELETE /api/settings/account
// @desc    刪除賬戶
// @access  Private
router.delete(
  '/account',
  protect,
  [
    body('confirmation').equals('DELETE').withMessage('確認刪除必須輸入DELETE'),
    body('password').notEmpty().withMessage('密碼不能為空'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗證失敗',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { confirmation, password } = req.body;

      // 模擬賬戶刪除
      logger.info(`刪除賬戶: ${req.user.username}`);

      res.json({
        success: true,
        message: '賬戶刪除已確認',
        data: {
          deletedAt: new Date(),
          userId: req.user.id,
        },
      });
    } catch (error) {
      logger.error('刪除賬戶錯誤:', error);
      res.status(500).json({
        success: false,
        message: '刪除賬戶失敗',
        code: 'ACCOUNT_DELETE_FAILED',
      });
    }
  }
);

module.exports = router;

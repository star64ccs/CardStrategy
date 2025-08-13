const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/settings
// @desc    獲取用戶設置
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // 模擬用戶設置
    const settings = {
      preferences: {
        language: 'zh-TW',
        theme: 'auto',
        currency: 'TWD',
        timezone: 'Asia/Taipei',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h'
      },
      notifications: {
        email: {
          enabled: true,
          types: ['market_updates', 'price_alerts', 'investment_news']
        },
        push: {
          enabled: true,
          types: ['price_alerts', 'market_updates']
        },
        sms: {
          enabled: false,
          types: []
        }
      },
      privacy: {
        profileVisibility: 'public',
        collectionVisibility: 'friends',
        showEmail: false,
        showPhone: false,
        allowDataCollection: true
      },
      security: {
        twoFactorEnabled: false,
        loginNotifications: true,
        sessionTimeout: 30,
        passwordChangeRequired: false
      },
      display: {
        defaultView: 'grid',
        cardsPerPage: 20,
        showPrices: true,
        showCondition: true,
        compactMode: false
      }
    };

    logger.info(`獲取用戶設置: ${req.user.username}`);

    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    logger.error('獲取用戶設置錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取用戶設置失敗',
      code: 'GET_SETTINGS_FAILED'
    });
  }
});

// @route   PUT /api/settings
// @desc    更新用戶設置
// @access  Private
router.put('/', protect, [
  body('preferences.language').optional().isIn(['zh-TW', 'en-US', 'ja-JP']),
  body('preferences.theme').optional().isIn(['light', 'dark', 'auto']),
  body('preferences.currency').optional().isIn(['TWD', 'USD', 'EUR', 'JPY']),
  body('notifications.email.enabled').optional().isBoolean(),
  body('notifications.push.enabled').optional().isBoolean(),
  body('privacy.profileVisibility').optional().isIn(['public', 'friends', 'private']),
  body('security.twoFactorEnabled').optional().isBoolean()
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

    const updatedSettings = req.body;

    logger.info(`更新用戶設置: ${req.user.username}`);

    res.json({
      success: true,
      message: '設置更新成功',
      data: { settings: updatedSettings }
    });
  } catch (error) {
    logger.error('更新用戶設置錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新用戶設置失敗',
      code: 'UPDATE_SETTINGS_FAILED'
    });
  }
});

// @route   POST /api/settings/notifications
// @desc    更新通知設置
// @access  Private
router.post('/notifications', protect, [
  body('type').isIn(['email', 'push', 'sms']).withMessage('通知類型必須是email、push或sms'),
  body('enabled').isBoolean().withMessage('啟用狀態必須是布爾值'),
  body('types').optional().isArray().withMessage('通知類型必須是數組')
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

    const { type, enabled, types = [] } = req.body;

    logger.info(`更新通知設置: ${req.user.username}, 類型: ${type}, 啟用: ${enabled}`);

    res.json({
      success: true,
      message: '通知設置更新成功',
      data: { type, enabled, types }
    });
  } catch (error) {
    logger.error('更新通知設置錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新通知設置失敗',
      code: 'UPDATE_NOTIFICATIONS_FAILED'
    });
  }
});

// @route   POST /api/settings/security/two-factor
// @desc    啟用/禁用雙因素認證
// @access  Private
router.post('/security/two-factor', protect, [
  body('enabled').isBoolean().withMessage('啟用狀態必須是布爾值'),
  body('method').optional().isIn(['app', 'sms', 'email']).withMessage('認證方法必須是app、sms或email')
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

    const { enabled, method = 'app' } = req.body;

    if (enabled) {
      // 模擬生成雙因素認證設置
      const twoFactorSetup = {
        secret: 'JBSWY3DPEHPK3PXP',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        backupCodes: ['123456', '234567', '345678', '456789', '567890']
      };

      logger.info(`啟用雙因素認證: ${req.user.username}, 方法: ${method}`);

      res.json({
        success: true,
        message: '雙因素認證已啟用',
        data: { twoFactorSetup }
      });
    } else {
      logger.info(`禁用雙因素認證: ${req.user.username}`);

      res.json({
        success: true,
        message: '雙因素認證已禁用'
      });
    }
  } catch (error) {
    logger.error('雙因素認證設置錯誤:', error);
    res.status(500).json({
      success: false,
      message: '雙因素認證設置失敗',
      code: 'TWO_FACTOR_SETUP_FAILED'
    });
  }
});

// @route   POST /api/settings/security/verify-two-factor
// @desc    驗證雙因素認證
// @access  Private
router.post('/security/verify-two-factor', protect, [
  body('code').isLength({ min: 6, max: 6 }).withMessage('驗證碼必須是6位數字')
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

    const { code } = req.body;

    // 模擬驗證（實際應該驗證真實的TOTP代碼）
    const isValid = code === '123456';

    if (isValid) {
      logger.info(`雙因素認證驗證成功: ${req.user.username}`);

      res.json({
        success: true,
        message: '雙因素認證驗證成功'
      });
    } else {
      logger.warn(`雙因素認證驗證失敗: ${req.user.username}`);

      res.status(400).json({
        success: false,
        message: '驗證碼錯誤',
        code: 'INVALID_2FA_CODE'
      });
    }
  } catch (error) {
    logger.error('雙因素認證驗證錯誤:', error);
    res.status(500).json({
      success: false,
      message: '雙因素認證驗證失敗',
      code: 'VERIFY_2FA_FAILED'
    });
  }
});

// @route   POST /api/settings/export-data
// @desc    導出用戶數據
// @access  Private
router.post('/export-data', protect, [
  body('format').isIn(['json', 'csv', 'pdf']).withMessage('導出格式必須是json、csv或pdf'),
  body('dataTypes').isArray().withMessage('數據類型必須是數組')
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

    const { format, dataTypes } = req.body;

    // 模擬數據導出
    const exportData = {
      id: Date.now().toString(),
      userId: req.user.id,
      format,
      dataTypes,
      status: 'processing',
      downloadUrl: null,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小時後過期
      createdAt: new Date().toISOString()
    };

    logger.info(`數據導出請求: ${req.user.username}, 格式: ${format}`);

    res.json({
      success: true,
      message: '數據導出請求已提交',
      data: { exportData }
    });
  } catch (error) {
    logger.error('數據導出錯誤:', error);
    res.status(500).json({
      success: false,
      message: '數據導出失敗',
      code: 'EXPORT_DATA_FAILED'
    });
  }
});

// @route   DELETE /api/settings/delete-account
// @desc    刪除用戶賬戶
// @access  Private
router.delete('/delete-account', protect, [
  body('reason').optional().isLength({ max: 500 }).withMessage('刪除原因最多500個字符'),
  body('password').notEmpty().withMessage('密碼為必填項')
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

    const { reason = '', password } = req.body;

    // 模擬賬戶刪除
    const accountDeletion = {
      id: Date.now().toString(),
      userId: req.user.id,
      requestedAt: new Date().toISOString(),
      effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天後生效
      reason,
      status: 'pending'
    };

    logger.info(`賬戶刪除請求: ${req.user.username}, 原因: ${reason}`);

    res.json({
      success: true,
      message: '賬戶刪除請求已提交，將在30天後生效',
      data: { accountDeletion }
    });
  } catch (error) {
    logger.error('賬戶刪除錯誤:', error);
    res.status(500).json({
      success: false,
      message: '賬戶刪除失敗',
      code: 'DELETE_ACCOUNT_FAILED'
    });
  }
});

// @route   POST /api/settings/cancel-deletion
// @desc    取消賬戶刪除
// @access  Private
router.post('/cancel-deletion', protect, async (req, res) => {
  try {
    logger.info(`取消賬戶刪除: ${req.user.username}`);

    res.json({
      success: true,
      message: '賬戶刪除已取消'
    });
  } catch (error) {
    logger.error('取消賬戶刪除錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取消賬戶刪除失敗',
      code: 'CANCEL_DELETION_FAILED'
    });
  }
});

module.exports = router;

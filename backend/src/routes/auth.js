const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const getUserModel = require('../models/User');
const { authenticateToken: protect } = require('../middleware/auth');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');

const router = express.Router();

// 生成JWT令牌
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// 生成刷新令牌
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

// @route   POST /api/auth/register
// @desc    用戶註冊
// @access  Public
router.post(
  '/register',
  [
    body('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('用戶名必須在3-30個字符之間')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('用戶名只能包含字母、數字和下劃線'),
    body('email').isEmail().withMessage('請輸入有效的郵箱地址'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('密碼至少6個字符')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('密碼必須包含大小寫字母和數字'),
    body('displayName')
      .isLength({ min: 2, max: 50 })
      .withMessage('顯示名稱必須在2-50個字符之間'),
  ],
  async (req, res) => {
    try {
      // 檢查驗證錯誤
      // eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗證失敗',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { username, email, password, displayName } = req.body;
      const User = getUserModel();

      if (!User) {
        return res.status(500).json({
          success: false,
          message: '數據庫連接失敗',
          code: 'DATABASE_ERROR',
        });
      }

      // 檢查用戶是否已存在
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email }, { username }],
        },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message:
            existingUser.email === email ? '郵箱已被使用' : '用戶名已被使用',
          code: 'USER_EXISTS',
        });
      }

      // 創建新用戶
      // eslint-disable-next-line no-unused-vars
      const user = await User.create({
        username,
        email,
        password,
        displayName,
      });

      // 生成令牌
      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // 更新最後登錄時間
      await user.updateLastLogin();

      logger.info(`新用戶註冊: ${user.username} (${user.email})`);

      res.status(201).json({
        success: true,
        message: '註冊成功',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            isVerified: user.isVerified,
            preferences: user.preferences,
            membership: user.membership,
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      logger.error('註冊錯誤:', error);
      res.status(500).json({
        success: false,
        message: '註冊失敗',
        code: 'REGISTRATION_FAILED',
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    用戶登錄
// @access  Public
router.post(
  '/login',
  [
    body('identifier').notEmpty().withMessage('請輸入用戶名或郵箱'),
    body('password').notEmpty().withMessage('請輸入密碼'),
  ],
  async (req, res) => {
    try {
      // eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗證失敗',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { identifier, password } = req.body;
      const User = getUserModel();

      if (!User) {
        return res.status(500).json({
          success: false,
          message: '數據庫連接失敗',
          code: 'DATABASE_ERROR',
        });
      }

      // 查找用戶（支持用戶名或郵箱登錄）
      // eslint-disable-next-line no-unused-vars
      const user = await User.findOne({
        where: {
          [Op.or]: [{ username: identifier }, { email: identifier }],
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用戶名或密碼錯誤',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // 檢查用戶是否被禁用
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: '帳戶已被禁用',
          code: 'ACCOUNT_DISABLED',
        });
      }

      // 驗證密碼
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: '用戶名或密碼錯誤',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // 生成令牌
      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // 更新最後登錄時間
      await user.updateLastLogin();

      logger.info(`用戶登錄: ${user.username}`);

      res.json({
        success: true,
        message: '登錄成功',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            isVerified: user.isVerified,
            preferences: user.preferences,
            membership: user.membership,
            statistics: user.statistics,
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      logger.error('登錄錯誤:', error);
      res.status(500).json({
        success: false,
        message: '登錄失敗',
        code: 'LOGIN_FAILED',
      });
    }
  }
);

// @route   POST /api/auth/refresh
// @desc    刷新訪問令牌
// @access  Public
router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('刷新令牌為必填項')],
  async (req, res) => {
    try {
      // eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗證失敗',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { refreshToken } = req.body;
      const User = getUserModel();

      if (!User) {
        return res.status(500).json({
          success: false,
          message: '數據庫連接失敗',
          code: 'DATABASE_ERROR',
        });
      }

      // 驗證刷新令牌
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // 查找用戶
      // eslint-disable-next-line no-unused-vars
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '無效的刷新令牌',
          code: 'INVALID_REFRESH_TOKEN',
        });
      }

      // 生成新的訪問令牌
      // eslint-disable-next-line no-unused-vars
      const newToken = generateToken(user.id);
      // eslint-disable-next-line no-unused-vars
      const newRefreshToken = generateRefreshToken(user.id);

      logger.info(`令牌刷新: ${user.username}`);

      res.json({
        success: true,
        message: '令牌刷新成功',
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      logger.error('令牌刷新錯誤:', error);
      res.status(401).json({
        success: false,
        message: '無效的刷新令牌',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    獲取當前用戶信息
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const User = getUserModel();

    if (!User) {
      return res.status(500).json({
        success: false,
        message: '數據庫連接失敗',
        code: 'DATABASE_ERROR',
      });
    }

    // eslint-disable-next-line no-unused-vars
    const user = await User.findByPk(req.user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified,
          preferences: user.preferences,
          membership: user.membership,
          statistics: user.statistics,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    logger.error('獲取用戶信息錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取用戶信息失敗',
      code: 'GET_USER_FAILED',
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    更新用戶資料
// @access  Private
router.put(
  '/profile',
  protect,
  [
    body('displayName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('顯示名稱必須在2-50個字符之間'),
    body('preferences.language')
      .optional()
      .isIn(['zh-TW', 'en-US', 'ja-JP'])
      .withMessage('無效的語言設置'),
    body('preferences.theme')
      .optional()
      .isIn(['light', 'dark', 'auto'])
      .withMessage('無效的主題設置'),
  ],
  async (req, res) => {
    try {
      // eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗證失敗',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { displayName, preferences } = req.body;
      const User = getUserModel();

      if (!User) {
        return res.status(500).json({
          success: false,
          message: '數據庫連接失敗',
          code: 'DATABASE_ERROR',
        });
      }

      const updateData = {};

      if (displayName) updateData.displayName = displayName;
      if (preferences)
        updateData.preferences = { ...req.user.preferences, ...preferences };

      // eslint-disable-next-line no-unused-vars
      const user = await User.update(updateData, {
        where: { id: req.user.id },
        returning: true,
      });

      const updatedUser = await User.findByPk(req.user.id);

      logger.info(`用戶資料更新: ${updatedUser.username}`);

      res.json({
        success: true,
        message: '資料更新成功',
        data: {
          user: {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            displayName: updatedUser.displayName,
            avatar: updatedUser.avatar,
            role: updatedUser.role,
            isVerified: updatedUser.isVerified,
            preferences: updatedUser.preferences,
            membership: updatedUser.membership,
            statistics: updatedUser.statistics,
          },
        },
      });
    } catch (error) {
      logger.error('更新用戶資料錯誤:', error);
      res.status(500).json({
        success: false,
        message: '更新資料失敗',
        code: 'UPDATE_PROFILE_FAILED',
      });
    }
  }
);

// @route   POST /api/auth/logout
// @desc    用戶登出
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    logger.info(`用戶登出: ${req.user.username}`);

    res.json({
      success: true,
      message: '登出成功',
    });
  } catch (error) {
    logger.error('登出錯誤:', error);
    res.status(500).json({
      success: false,
      message: '登出失敗',
      code: 'LOGOUT_FAILED',
    });
  }
});

module.exports = router;

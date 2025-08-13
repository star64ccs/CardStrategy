const jwt = require('jsonwebtoken');
const getUserModel = require('../models/User');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 獲取token
      token = req.headers.authorization.split(' ')[1];

      // 驗證token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 獲取用戶信息（Sequelize方式）
      const User = getUserModel();
      if (User) {
        req.user = await User.findByPk(decoded.id, {
          attributes: { exclude: ['password'] }
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '用戶不存在',
          code: 'USER_NOT_FOUND'
        });
      }

      next();
    } catch (error) {
      logger.error('Token驗證失敗:', error);
      return res.status(401).json({
        success: false,
        message: '無效的認證令牌',
        code: 'INVALID_TOKEN'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未提供認證令牌',
      code: 'NO_TOKEN'
    });
  }
};

// 可選認證中間件（不強制要求登錄）
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const User = getUserModel();
      if (User) {
        req.user = await User.findByPk(decoded.id, {
          attributes: { exclude: ['password'] }
        });
      }
    } catch (error) {
      logger.warn('可選認證失敗:', error);
      // 不拋出錯誤，繼續執行
    }
  }

  next();
};

// 角色驗證中間件
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '需要登錄',
        code: 'LOGIN_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '權限不足',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

module.exports = {
  protect,
  optionalAuth,
  authorize
};

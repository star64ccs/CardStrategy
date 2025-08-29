const { verifyToken, logSecurityEvent } = require('../utils/security-utils');
const { logger } = require('../utils/unified-logger');

// JWT 認證中間件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logSecurityEvent('Missing Token', {
      ip: req.ip,
      url: req.url,
      method: req.method,
    });

    return res.status(401).json({
      success: false,
      message: 'Access token required',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      logSecurityEvent('Invalid Token', {
        ip: req.ip,
        url: req.url,
        method: req.method,
      });

      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString(),
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token verification error:', error);

    logSecurityEvent('Token Verification Error', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      error: error.message,
    });

    return res.status(403).json({
      success: false,
      message: 'Invalid token',
      timestamp: new Date().toISOString(),
    });
  }
};

// 角色驗證中間件
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
    }

    const userRole = req.user.role || 'user';
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      logSecurityEvent('Insufficient Permissions', {
        ip: req.ip,
        url: req.url,
        method: req.method,
        userRole,
        requiredRoles: allowedRoles,
      });

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

// 管理員驗證中間件
const requireAdmin = requireRole('admin');

// 用戶驗證中間件
const requireUser = requireRole(['user', 'admin']);

// 可選認證中間件（不強制要求認證）
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    } catch (error) {
      // 靜默處理錯誤，不影響請求
      logger.debug('Optional auth failed:', error.message);
    }
  }

  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireUser,
  optionalAuth,
};

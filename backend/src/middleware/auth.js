const { verifyToken, logSecurityEvent } = require('../utils/security-utils');
const { logger } = require('../utils/unified-logger');

// JWT Authenticate中間件
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

// 角色Verify中間件
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

// Manage員Verify中間件
const requireAdmin = requireRole('admin');

// UserVerify中間件
const requireUser = requireRole(['user', 'admin']);

// OptionalAuthenticate中間件（不Force要求Authenticate）
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
      // 靜默HandleError，不影響Request
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

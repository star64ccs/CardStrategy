const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// 安全中間件配置
const securityMiddleware = {
  // 設置安全頭部
  securityHeaders: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }),

  // 速率限制
  rateLimit: rateLimit({
    windowMs: 15 * 60 * 1000, // 15分鐘
    max: 100, // 限制每個IP 100個請求
    message: {
      error: '請求過於頻繁，請稍後再試',
      retryAfter: '15分鐘'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // 慢速攻擊防護
  slowDown: slowDown({
    windowMs: 15 * 60 * 1000, // 15分鐘
    delayAfter: 50, // 50個請求後開始延遲
    delayMs: 500, // 每次請求延遲500ms
  }),

  // 請求大小限制
  requestSizeLimit: (req, res, next) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (contentLength > maxSize) {
      return res.status(413).json({
        error: '請求體過大',
        maxSize: '10MB'
      });
    }
    next();
  }
};

module.exports = securityMiddleware;
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const { logger } = require('../utils/unified-logger');

// 速率LimitConfigure
const createRateLimit = (
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = 'Too many requests'
) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
      });
      res.status(429).json({
        success: false,
        message,
        timestamp: new Date().toISOString(),
      });
    },
  });
};

// 安全頭Configure
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
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
    preload: true,
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

// CORS Configure
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// InputVerify中間件
const inputValidation = (req, res, next) => {
  // CheckRequest體大小
  const contentLength = parseInt(req.get('Content-Length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    logger.warn('Request body too large', {
      size: contentLength,
      maxSize,
      ip: req.ip,
    });
    return res.status(413).json({
      success: false,
      message: 'Request body too large',
      timestamp: new Date().toISOString(),
    });
  }

  // Check SQL 注入
  const sqlInjectionPattern =
    /((union|select|insert|update|delete|drop|create|alter|exec|execute|script))/i;
  const body = JSON.stringify(req.body);
  const query = req.query ? JSON.stringify(req.query) : '';
  const params = body + query;

  if (sqlInjectionPattern.test(params)) {
    logger.warn('Potential SQL injection detected', {
      ip: req.ip,
      url: req.url,
      body: req.body,
      query: req.query,
    });
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected',
      timestamp: new Date().toISOString(),
    });
  }

  // Check XSS 攻擊
  const xssPattern = /<script[^>]*>.*?<\/script>/gi;
  if (xssPattern.test(params)) {
    logger.warn('Potential XSS attack detected', {
      ip: req.ip,
      url: req.url,
      body: req.body,
      query: req.query,
    });
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected',
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// RequestLog中間件
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    };

    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};

// ErrorHandle中間件
const errorHandler = (err, req, res, next) => { // eslint-disable-next-line no-unused-vars // eslint-disable-next-line no-unused-vars
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // 不要暴露InternalErrorInformation給Client
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
};

// 404 Handle中間件
const notFoundHandler = (req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    message: 'Route not found',
    timestamp: new Date().toISOString(),
  });
};

// 安全Configure
const securityConfig = {
  // 不同端點的速率Limit
  rateLimits: {
    // 一般 API Request
    general: createRateLimit(15 * 60 * 1000, 100, 'Too many requests'),

    // Authenticate相OffRequest
    auth: createRateLimit(
      15 * 60 * 1000,
      5,
      'Too many authentication attempts'
    ),

    // FileUpload
    upload: createRateLimit(15 * 60 * 1000, 10, 'Too many upload attempts'),

    // Manage員端點
    admin: createRateLimit(15 * 60 * 1000, 50, 'Too many admin requests'),
  },

  // 安全Check
  securityChecks: {
    // CheckRequest來源
    checkOrigin: (req, res, next) => {
      const origin = req.get('Origin');
      const referer = req.get('Referer');

      if (origin && !corsOptions.origin(origin, () => {})) {
        logger.warn('Invalid origin', { origin, ip: req.ip });
        return res.status(403).json({
          success: false,
          message: 'Invalid origin',
          timestamp: new Date().toISOString(),
        });
      }

      next();
    },

    // CheckUser代理
    checkUserAgent: (req, res, next) => {
      const userAgent = req.get('User-Agent');

      if (!userAgent || userAgent.length < 10) {
        logger.warn('Suspicious user agent', { userAgent, ip: req.ip });
        return res.status(403).json({
          success: false,
          message: 'Invalid user agent',
          timestamp: new Date().toISOString(),
        });
      }

      next();
    },
  },
};

module.exports = {
  securityHeaders,
  corsOptions,
  inputValidation,
  requestLogger,
  errorHandler,
  notFoundHandler,
  securityConfig,
  createRateLimit,
};

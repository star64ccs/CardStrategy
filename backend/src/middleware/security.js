const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const hpp = require('hpp');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const express = require('express');
const logger = require('../utils/logger');

/**
 * 安全中間件配置
 * 提供全面的安全保護措施
 */
const securityMiddleware = (app) => {
  // 1. Helmet - 安全頭部
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        scriptSrc: ["'self'", 'https://js.stripe.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: [
          "'self'",
          'https://api.cardstrategy.com',
          'https://staging-api.cardstrategy.com',
          'https://sentry.io',
          'https://api.openai.com',
          'https://generativelanguage.googleapis.com'
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        workerSrc: ["'self'"],
        manifestSrc: ["'self'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));

  // 2. CORS 配置
  const corsOptions = {
    origin (origin, callback) {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://cardstrategy.com',
        'https://www.cardstrategy.com',
        'https://staging.cardstrategy.com'
      ];

      // 允許沒有 origin 的請求（移動應用等）
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('不允許的 CORS 來源'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key'
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count']
  };

  app.use(cors(corsOptions));

  // 3. 速率限制
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分鐘
    max: 100, // 限制每個 IP 100 個請求
    message: {
      error: '請求過於頻繁，請稍後再試',
      retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress;
    }
  });

  // 嚴格限制（用於敏感操作）
  const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分鐘
    max: 5, // 限制每個 IP 5 個請求
    message: {
      error: '操作過於頻繁，請稍後再試',
      retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false
  });

  // 非常嚴格限制（用於登錄等）
  const veryStrictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分鐘
    max: 3, // 限制每個 IP 3 個請求
    message: {
      error: '登錄嘗試過於頻繁，請稍後再試',
      retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false
  });

  // 應用速率限制
  app.use('/api/', generalLimiter);
  app.use('/api/auth/login', veryStrictLimiter);
  app.use('/api/auth/register', veryStrictLimiter);
  app.use('/api/auth/forgot-password', veryStrictLimiter);
  app.use('/api/auth/reset-password', veryStrictLimiter);
  app.use('/api/cards/scan', strictLimiter);
  app.use('/api/ai/', strictLimiter);

  // 4. 防止 HTTP 參數污染
  app.use(hpp({
    whitelist: ['filter', 'sort', 'page', 'limit'] // 允許重複的參數
  }));

  // 5. XSS 保護
  app.use(xss());

  // 6. MongoDB 注入保護
  app.use(mongoSanitize());

  // 7. 請求大小限制
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 8. 防止點擊劫持
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });

  // 9. 防止 MIME 類型嗅探
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });

  // 10. 防止 XSS 反射攻擊
  app.use((req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // 11. 引用策略
  app.use((req, res, next) => {
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // 12. 權限策略
  app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });

  // 13. 防止 SQL 注入
  app.use((req, res, next) => {
    const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i;

    const checkForSQLInjection = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string' && sqlInjectionPattern.test(obj[key])) {
          logger.warn(`可能的 SQL 注入嘗試: ${obj[key]} from IP: ${req.ip}`);
          return true;
        }
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (checkForSQLInjection(obj[key])) return true;
        }
      }
      return false;
    };

    if (checkForSQLInjection(req.body) || checkForSQLInjection(req.query) || checkForSQLInjection(req.params)) {
      return res.status(400).json({
        success: false,
        message: '檢測到無效的輸入',
        code: 'INVALID_INPUT'
      });
    }

    next();
  });

  // 14. 防止 NoSQL 注入
  app.use((req, res, next) => {
    const noSqlInjectionPattern = /(\$where|\$ne|\$gt|\$lt|\$regex)/i;

    const checkForNoSQLInjection = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string' && noSqlInjectionPattern.test(obj[key])) {
          logger.warn(`可能的 NoSQL 注入嘗試: ${obj[key]} from IP: ${req.ip}`);
          return true;
        }
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (checkForNoSQLInjection(obj[key])) return true;
        }
      }
      return false;
    };

    if (checkForNoSQLInjection(req.body) || checkForNoSQLInjection(req.query)) {
      return res.status(400).json({
        success: false,
        message: '檢測到無效的輸入',
        code: 'INVALID_INPUT'
      });
    }

    next();
  });

  // 15. 防止路徑遍歷攻擊
  app.use((req, res, next) => {
    const pathTraversalPattern = /\.\.\/|\.\.\\/;

    if (pathTraversalPattern.test(req.url)) {
      logger.warn(`可能的路徑遍歷攻擊: ${req.url} from IP: ${req.ip}`);
      return res.status(400).json({
        success: false,
        message: '無效的請求路徑',
        code: 'INVALID_PATH'
      });
    }

    next();
  });

  // 16. 防止命令注入
  app.use((req, res, next) => {
    const commandInjectionPattern = /[;&|`$(){}[\]]/;

    const checkForCommandInjection = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string' && commandInjectionPattern.test(obj[key])) {
          logger.warn(`可能的命令注入嘗試: ${obj[key]} from IP: ${req.ip}`);
          return true;
        }
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (checkForCommandInjection(obj[key])) return true;
        }
      }
      return false;
    };

    if (checkForCommandInjection(req.body) || checkForCommandInjection(req.query)) {
      return res.status(400).json({
        success: false,
        message: '檢測到無效的輸入',
        code: 'INVALID_INPUT'
      });
    }

    next();
  });

  // 17. 防止 CSRF 攻擊
  app.use((req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE' || req.method === 'PATCH') {
      const csrfToken = req.headers['x-csrf-token'];
      const sessionToken = req.session?.csrfToken;

      if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
        logger.warn(`可能的 CSRF 攻擊嘗試 from IP: ${req.ip}`);
        return res.status(403).json({
          success: false,
          message: 'CSRF 令牌驗證失敗',
          code: 'CSRF_TOKEN_INVALID'
        });
      }
    }

    next();
  });

  // 18. 防止暴力破解
  const bruteForceProtection = new Map();

  app.use('/api/auth/', (req, res, next) => {
    const clientIp = req.ip;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 分鐘

    if (!bruteForceProtection.has(clientIp)) {
      bruteForceProtection.set(clientIp, {
        attempts: 0,
        firstAttempt: now,
        blocked: false
      });
    }

    const client = bruteForceProtection.get(clientIp);

    // 重置計數器（如果超過時間窗口）
    if (now - client.firstAttempt > windowMs) {
      client.attempts = 0;
      client.firstAttempt = now;
      client.blocked = false;
    }

    // 檢查是否被阻止
    if (client.blocked) {
      return res.status(429).json({
        success: false,
        message: '帳戶已被暫時鎖定，請稍後再試',
        code: 'ACCOUNT_LOCKED'
      });
    }

    // 增加嘗試次數
    client.attempts++;

    // 如果嘗試次數過多，阻止訪問
    if (client.attempts > 5) {
      client.blocked = true;
      logger.warn(`暴力破解嘗試被阻止: ${clientIp}`);
      return res.status(429).json({
        success: false,
        message: '帳戶已被暫時鎖定，請稍後再試',
        code: 'ACCOUNT_LOCKED'
      });
    }

    next();
  });

  // 19. 安全日誌記錄
  app.use((req, res, next) => {
    const securityEvents = [
      'login',
      'logout',
      'password_change',
      'profile_update',
      'admin_action'
    ];

    if (securityEvents.some(event => req.path.includes(event))) {
      logger.info(`安全事件: ${req.method} ${req.path} from IP: ${req.ip}`, {
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        userId: req.user?.id || 'anonymous'
      });
    }

    next();
  });

  // 20. 錯誤處理（不暴露敏感信息）
  app.use((err, req, res, next) => {
    logger.error('安全中間件錯誤:', err);

    // 不向客戶端暴露詳細錯誤信息
    res.status(500).json({
      success: false,
      message: '發生未知錯誤',
      code: 'INTERNAL_ERROR'
    });
  });
};

/**
 * 驗證 API 密鑰中間件
 */
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];

  if (!apiKey || !validApiKeys.includes(apiKey)) {
    logger.warn(`無效的 API 密鑰嘗試: ${apiKey} from IP: ${req.ip}`);
    return res.status(401).json({
      success: false,
      message: '無效的 API 密鑰',
      code: 'INVALID_API_KEY'
    });
  }

  next();
};

/**
 * 驗證 IP 白名單中間件
 */
const validateIpWhitelist = (req, res, next) => {
  const clientIp = req.ip;
  const whitelistedIps = process.env.IP_WHITELIST?.split(',') || [];

  if (whitelistedIps.length > 0 && !whitelistedIps.includes(clientIp)) {
    logger.warn(`未授權的 IP 訪問嘗試: ${clientIp}`);
    return res.status(403).json({
      success: false,
      message: '您的 IP 地址不被允許',
      code: 'IP_NOT_ALLOWED'
    });
  }

  next();
};

/**
 * 安全標頭中間件
 */
const securityHeaders = (req, res, next) => {
  // 防止點擊劫持
  res.setHeader('X-Frame-Options', 'DENY');

  // 防止 MIME 類型嗅探
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // 防止 XSS 反射攻擊
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // 引用策略
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 權限策略
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // 清除站點數據
  res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');

  next();
};

/**
 * 輸入驗證中間件
 */
const inputValidation = (req, res, next) => {
  const sanitizeInput = (input) => {
    if (typeof input === 'string') {
      // 移除危險字符
      return input
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
    }
    return input;
  };

  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeInput(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);

  next();
};

/**
 * 會話安全中間件
 */
const sessionSecurity = (req, res, next) => {
  if (req.session) {
    // 設置安全的會話配置
    req.session.cookie.secure = process.env.NODE_ENV === 'production';
    req.session.cookie.httpOnly = true;
    req.session.cookie.sameSite = 'strict';
    req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 小時

    // 重新生成會話 ID（防止會話固定攻擊）
    if (req.session.regenerate) {
      req.session.regenerate((err) => {
        if (err) {
          logger.error('會話重新生成失敗:', err);
        }
      });
    }
  }

  next();
};

/**
 * 文件上傳安全中間件
 */
const fileUploadSecurity = (req, res, next) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  if (req.files) {
    for (const file of req.files) {
      // 檢查文件類型
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: '不支持的文件類型',
          code: 'INVALID_FILE_TYPE'
        });
      }

      // 檢查文件大小
      if (file.size > maxFileSize) {
        return res.status(400).json({
          success: false,
          message: '文件大小超過限制',
          code: 'FILE_TOO_LARGE'
        });
      }

      // 檢查文件名
      const fileNamePattern = /^[a-zA-Z0-9._-]+$/;
      if (!fileNamePattern.test(file.originalname)) {
        return res.status(400).json({
          success: false,
          message: '無效的文件名',
          code: 'INVALID_FILENAME'
        });
      }
    }
  }

  next();
};

module.exports = {
  securityMiddleware,
  validateApiKey,
  validateIpWhitelist,
  securityHeaders,
  inputValidation,
  sessionSecurity,
  fileUploadSecurity
};

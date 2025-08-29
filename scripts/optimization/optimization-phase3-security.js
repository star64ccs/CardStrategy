#!/usr/bin/env node

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');

// 顏色輸出
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const log = {
  info: (msg) => {
    /* */
  },
  success: (msg) => {
    /* */
  },
  warning: (msg) => {
    /* */
  },
  error: (msg) => {
    /* */
  },
  header: (msg) => {
    /* */
  },
};

class Phase3SecurityOptimizer {
  constructor() {
    this.projectRoot = process.cwd();
    this.backendDir = path.join(this.projectRoot, 'backend');
  }

  // 創建安全中間件系統
  async createSecurityMiddlewareSystem() {
    log.header('🔒 創建安全中間件系統');

    const securityMiddleware = `const rateLimit = require('express-rate-limit');
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const helmet = require('helmet');
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const cors = require('cors');
const { logger } = require('./unified-logger');

// 速率限制配置
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url
      });
      res.status(429).json({
        success: false,
        message,
        timestamp: new Date().toISOString()
      });
    }
  });
};

// 安全頭配置
const securityHeaders = helmet({
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
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

// CORS 配置
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',') : 
      ['http://localhost:3000', 'http://localhost:3001'];
    
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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// 輸入驗證中間件
const inputValidation = (req, res, next) => {
  // 檢查請求體大小
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const contentLength = parseInt(req.get('Content-Length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    logger.warn('Request body too large', {
      size: contentLength,
      maxSize,
      ip: req.ip
    });
    return res.status(413).json({
      success: false,
      message: 'Request body too large',
      timestamp: new Date().toISOString()
    });
  }

  // 檢查 SQL 注入
  const sqlInjectionPattern = /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script)\b)/i;
  const body = JSON.stringify(req.body);
  const query = req.query ? JSON.stringify(req.query) : '';
  const params = body + query;

  if (sqlInjectionPattern.test(params)) {
    logger.warn('Potential SQL injection detected', {
      ip: req.ip,
      url: req.url,
      body: req.body,
      query: req.query
    });
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected',
      timestamp: new Date().toISOString()
    });
  }

  // 檢查 XSS 攻擊
  const xssPattern = /<script[^>]*>.*?</script>/gi;
  if (xssPattern.test(params)) {
    logger.warn('Potential XSS attack detected', {
      ip: req.ip,
      url: req.url,
      body: req.body,
      query: req.query
    });
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// 請求日誌中間件
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: \`\${duration}ms\`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };

    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};

// 錯誤處理中間件
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => { // eslint-disable-next-line no-unused-vars
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // 不要暴露內部錯誤信息給客戶端
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
};

// 404 處理中間件
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const notFoundHandler = (req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip
  });

  res.status(404).json({
    success: false,
    message: 'Route not found',
    timestamp: new Date().toISOString()
  });
};

// 安全配置
const securityConfig = {
  // 不同端點的速率限制
  rateLimits: {
    // 一般 API 請求
    general: createRateLimit(15 * 60 * 1000, 100, 'Too many requests'),
    
    // 認證相關請求
    auth: createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts'),
    
    // 文件上傳
    upload: createRateLimit(15 * 60 * 1000, 10, 'Too many upload attempts'),
    
    // 管理員端點
    admin: createRateLimit(15 * 60 * 1000, 50, 'Too many admin requests')
  },

  // 安全檢查
  securityChecks: {
    // 檢查請求來源
    checkOrigin: (req, res, next) => {
      const origin = req.get('Origin');
      const referer = req.get('Referer');
      
      if (origin && !corsOptions.origin(origin, () => {})) {
        logger.warn('Invalid origin', { origin, ip: req.ip });
        return res.status(403).json({
          success: false,
          message: 'Invalid origin',
          timestamp: new Date().toISOString()
        });
      }
      
      next();
    },

    // 檢查用戶代理
    checkUserAgent: (req, res, next) => {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const userAgent = req.get('User-Agent');
      
      if (!userAgent || userAgent.length < 10) {
        logger.warn('Suspicious user agent', { userAgent, ip: req.ip });
        return res.status(403).json({
          success: false,
          message: 'Invalid user agent',
          timestamp: new Date().toISOString()
        });
      }
      
      next();
    }
  }
};

module.exports = {
  securityHeaders,
  corsOptions,
  inputValidation,
  requestLogger,
  errorHandler,
  notFoundHandler,
  securityConfig,
  createRateLimit
};
`;

    const securityPath = path.join(
      this.backendDir,
      'src/middleware/security.js'
    );
    fs.writeFileSync(securityPath, securityMiddleware);
    log.success('安全中間件系統已創建');
  }

  // 創建安全工具函數
  async createSecurityUtils() {
    log.header('🛡️ 創建安全工具函數');

    const securityUtils = `const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { logger } = require('../utils/unified-logger');

// 密碼加密
const hashPassword = async (password) => {
  try {
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    logger.error('Password hashing failed:', error);
    throw new Error('Password hashing failed');
  }
};

// 密碼驗證
const verifyPassword = async (password, hash) => {
  try {
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  } catch (error) {
    logger.error('Password verification failed:', error);
    return false;
  }
};

// JWT Token 生成
const generateToken = (payload, expiresIn = '24h') => {
  try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const token = jwt.sign(payload, secret, { expiresIn });
    return token;
  } catch (error) {
    logger.error('Token generation failed:', error);
    throw new Error('Token generation failed');
  }
};

// JWT Token 驗證
const verifyToken = (token) => {
  try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    logger.error('Token verification failed:', error);
    return null;
  }
};

// 隨機字符串生成
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// 安全隨機數生成
const generateSecureRandom = (min = 100000, max = 999999) => {
  const range = max - min + 1;
  const bytes = crypto.randomBytes(4);
  const value = bytes.readUInt32BE(0);
  return min + (value % range);
};

// 數據加密
const encryptData = (data, key = process.env.ENCRYPTION_KEY) => {
  try {
    if (!key) {
      throw new Error('ENCRYPTION_KEY not configured');
    }
    
    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex')
    };
  } catch (error) {
    logger.error('Data encryption failed:', error);
    throw new Error('Data encryption failed');
  }
};

// 數據解密
const decryptData = (encryptedData, iv, key = process.env.ENCRYPTION_KEY) => {
  try {
    if (!key) {
      throw new Error('ENCRYPTION_KEY not configured');
    }
    
    const algorithm = 'aes-256-cbc';
    const decipher = crypto.createDecipher(algorithm, key);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Data decryption failed:', error);
    throw new Error('Data decryption failed');
  }
};

// 輸入清理
const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  return input
    .replace(/[<>]/g, '') // 移除 < 和 >
    .replace(/javascript:/gi, '') // 移除 javascript: 協議
    .replace(/on\\w+=/gi, '') // 移除事件處理器
    .trim();
};

// 電子郵件驗證
const validateEmail = (email) => {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
};

// 密碼強度檢查
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(\`Password must be at least \${minLength} characters long\`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 安全日誌記錄
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const logSecurityEvent = (event, details) => {
  logger.warn('Security Event', {
    event,
    details,
    timestamp: new Date().toISOString(),
    ip: details.ip || 'unknown'
  });
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  generateRandomString,
  generateSecureRandom,
  encryptData,
  decryptData,
  sanitizeInput,
  validateEmail,
  validatePassword,
  logSecurityEvent
};
`;

    const utilsPath = path.join(this.backendDir, 'src/utils/security-utils.js');
    fs.writeFileSync(utilsPath, securityUtils);
    log.success('安全工具函數已創建');
  }

  // 創建認證中間件
  async createAuthMiddleware() {
    log.header('🔐 創建認證中間件');

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const authMiddleware = `const { verifyToken, logSecurityEvent } = require('../utils/security-utils');
const { logger } = require('../utils/unified-logger');

// JWT 認證中間件
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const authenticateToken = (req, res, next) => {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logSecurityEvent('Missing Token', {
      ip: req.ip,
      url: req.url,
      method: req.method
    });
    
    return res.status(401).json({
      success: false,
      message: 'Access token required',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      logSecurityEvent('Invalid Token', {
        ip: req.ip,
        url: req.url,
        method: req.method
      });
      
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString()
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
      error: error.message
    });
    
    return res.status(403).json({
      success: false,
      message: 'Invalid token',
      timestamp: new Date().toISOString()
    });
  }
};

// 角色驗證中間件
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const userRole = req.user.role || 'user';
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      logSecurityEvent('Insufficient Permissions', {
        ip: req.ip,
        url: req.url,
        method: req.method,
        userRole,
        requiredRoles: allowedRoles
      });
      
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

// 管理員驗證中間件
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const requireAdmin = requireRole('admin');

// 用戶驗證中間件
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const requireUser = requireRole(['user', 'admin']);

// 可選認證中間件（不強制要求認證）
const optionalAuth = (req, res, next) => {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
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
  optionalAuth
};
`;

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const authPath = path.join(this.backendDir, 'src/middleware/auth.js');
    fs.writeFileSync(authPath, authMiddleware);
    log.success('認證中間件已創建');
  }

  // 生成安全報告
  generateReport() {
    log.header('🔒 安全中間件系統報告');

    const report = `
# 安全中間件系統實現報告

## 🔧 創建的文件

### 1. 安全中間件系統
- **文件**: \`src/middleware/security.js\`
- **功能**:
  - 速率限制防護
  - 安全頭配置
  - CORS 配置
  - 輸入驗證
  - 請求日誌
  - 錯誤處理
  - 404 處理

### 2. 安全工具函數
- **文件**: \`src/utils/security-utils.js\`
- **功能**:
  - 密碼加密/驗證
  - JWT Token 生成/驗證
  - 隨機字符串生成
  - 數據加密/解密
  - 輸入清理
  - 電子郵件驗證
  - 密碼強度檢查
  - 安全事件記錄

### 3. 認證中間件
- **文件**: \`src/middleware/auth.js\`
- **功能**:
  - JWT 認證
  - 角色驗證
  - 管理員驗證
  - 用戶驗證
  - 可選認證

## 🛡️ 安全特性

### 防護機制
- **速率限制**: 防止暴力攻擊和 DDoS
- **輸入驗證**: 防止 SQL 注入和 XSS 攻擊
- **安全頭**: 防止常見 Web 攻擊
- **CORS 保護**: 防止跨域攻擊
- **JWT 認證**: 安全的身份驗證

### 監控和日誌
- **安全事件記錄**: 記錄所有安全相關事件
- **請求日誌**: 記錄所有 API 請求
- **錯誤處理**: 統一的錯誤處理和日誌記錄
- **異常檢測**: 自動檢測可疑活動

### 數據保護
- **密碼加密**: 使用 bcrypt 進行密碼哈希
- **數據加密**: AES-256-CBC 加密敏感數據
- **Token 安全**: JWT 簽名驗證
- **輸入清理**: 防止惡意輸入

## 🎯 使用方式

### 1. 在服務器中集成
\`\`\`javascript
const { securityHeaders, corsOptions, inputValidation, requestLogger, errorHandler, notFoundHandler } = require('./middleware/security');
const { authenticateToken, requireAdmin } = require('./middleware/auth');

// 安全中間件
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(inputValidation);
app.use(requestLogger);

// 認證中間件
app.use('/api/admin', authenticateToken, requireAdmin);
app.use('/api/protected', authenticateToken);

// 錯誤處理
app.use(notFoundHandler);
app.use(errorHandler);
\`\`\`

### 2. 使用安全工具
\`\`\`javascript
const { hashPassword, generateToken, validateEmail } = require('./utils/security-utils');

// 密碼加密
const hashedPassword = await hashPassword('userPassword');

// 生成 Token
const token = generateToken({ userId: 1, role: 'user' });

// 驗證郵箱
const isValidEmail = validateEmail('user@example.com');
\`\`\`

## 📊 安全配置

### 速率限制
- 一般 API: 100 請求/15分鐘
- 認證 API: 5 請求/15分鐘
- 文件上傳: 10 請求/15分鐘
- 管理員 API: 50 請求/15分鐘

### 安全頭
- Content Security Policy
- HTTP Strict Transport Security
- X-Content-Type-Options
- X-Frame-Options
- Referrer Policy

### CORS 配置
- 允許的來源可配置
- 支持憑證
- 限制 HTTP 方法
- 自定義請求頭

## 🔄 下一步

1. **集成到統一服務器**
   - 在 \`server-unified.js\` 中添加安全中間件
   - 配置認證路由
   - 測試安全功能

2. **錯誤處理系統**
   - 統一錯誤處理
   - 自定義錯誤類
   - 優雅關閉機制

3. **監控和告警**
   - 安全事件監控
   - 異常行為檢測
   - 自動告警機制
`;

    const reportPath = path.join(
      this.projectRoot,
      'SECURITY_MIDDLEWARE_REPORT.md'
    );
    fs.writeFileSync(reportPath, report);
    log.success(`安全報告已生成: ${reportPath}`);
  }

  // 執行所有優化
  async run() {
    log.header('🚀 開始第三階段安全中間件優化');

    try {
      await this.createSecurityMiddlewareSystem();
      await this.createSecurityUtils();
      await this.createAuthMiddleware();
      this.generateReport();

      log.header('🎉 第三階段安全中間件優化完成！');
      log.success('安全中間件系統已創建完成');
      log.success('請查看 SECURITY_MIDDLEWARE_REPORT.md 了解詳細信息');
    } catch (error) {
      log.error(`優化過程中發生錯誤: ${error.message}`);
      process.exit(1);
    }
  }
}

// 執行優化
if (require.main === module) {
  const optimizer = new Phase3SecurityOptimizer();
  optimizer.run();
}

module.exports = Phase3SecurityOptimizer;

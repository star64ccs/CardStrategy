#!/usr/bin/env node

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');

// 顏色Output
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

class Phase3Optimizer {
  constructor() {
    this.projectRoot = process.cwd();
    this.backendDir = path.join(this.projectRoot, 'backend');
  }

  // 1. 實現統一Log系統
  async createUnifiedLoggingSystem() {
    log.header('📝 創建統一日誌系統');

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const loggingSystem = `const winston = require('winston');
const path = require('path');
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');

// CreateLogDirectory
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log格式
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Control台格式
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return \`\${timestamp} [\${level}]: \${message} \${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}\`;
  })
);

// Create logger Instance
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'cardstrategy-api' },
  transports: [
    // ErrorLogFile
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // 所有LogFile
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// On發環境AddControl台Output
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// LogToolFunction
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const logUtils = {
  // RequestLog
  logRequest: (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: \`\${duration}ms\`,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
    });
    next();
  },

  // ErrorLog
  logError: (error, req, res, next) => {
    logger.error('Application Error', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip
    });
    next(error);
  },

  // 性能Log
  logPerformance: (operation, duration, metadata = {}) => {
    logger.info('Performance Metric', {
      operation,
      duration: \`\${duration}ms\`,
      ...metadata
    });
  },

  // 安全Log
  logSecurity: (event, details) => {
    logger.warn('Security Event', {
      event,
      details,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  logger,
  logUtils
};
`;

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const logPath = path.join(this.backendDir, 'src/utils/unified-logger.js');
    fs.writeFileSync(logPath, loggingSystem);
    log.success('統一日誌系統已創建');
  }

  // 2. Create性能Monitor系統
  async createPerformanceMonitoring() {
    log.header('📊 創建性能監控系統');

    const monitoringSystem = `const { logger } = require('./unified-logger');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTimes: [],
      memoryUsage: [],
      cpuUsage: []
    };
    
    this.startTime = Date.now();
    this.interval = null;
  }

  // BeginMonitor
  start() {
    this.interval = setInterval(() => {
      this.collectMetrics();
    }, 60000); // 每Minute收集一次

    logger.info('Performance monitoring started');
  }

  // StopMonitor
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    logger.info('Performance monitoring stopped');
  }

  // 收集指標
  collectMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    this.metrics.memoryUsage.push({
      timestamp: Date.now(),
      rss: memUsage.rss,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external
    });

    this.metrics.cpuUsage.push({
      timestamp: Date.now(),
      user: cpuUsage.user,
      system: cpuUsage.system
    });

    // 只保留最近100個Data點
    if (this.metrics.memoryUsage.length > 100) {
      this.metrics.memoryUsage.shift();
    }
    if (this.metrics.cpuUsage.length > 100) {
      this.metrics.cpuUsage.shift();
    }

    this.logMetrics();
  }

  // RecordRequest
  recordRequest(duration) {
    this.metrics.requests++;
    this.metrics.responseTimes.push(duration);

    // 只保留最近1000個ResponseTime
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes.shift();
    }
  }

  // RecordError
  recordError() {
    this.metrics.errors++;
  }

  // Record指標
  logMetrics() {
    const avgResponseTime = this.metrics.responseTimes.length > 0
      ? this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length
      : 0;

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const errorRate = this.metrics.requests > 0
      ? (this.metrics.errors / this.metrics.requests * 100).toFixed(2)
      : 0;

    const latestMem = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
    const latestCpu = this.metrics.cpuUsage[this.metrics.cpuUsage.length - 1];

    logger.info('Performance Metrics', {
      uptime: Date.now() - this.startTime,
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      errorRate: \`\${errorRate}%\`,
      avgResponseTime: \`\${avgResponseTime.toFixed(2)}ms\`,
      memoryUsage: {
        rss: \`\${(latestMem?.rss / 1024 / 1024).toFixed(2)}MB\`,
        heapUsed: \`\${(latestMem?.heapUsed / 1024 / 1024).toFixed(2)}MB\`,
        heapTotal: \`\${(latestMem?.heapTotal / 1024 / 1024).toFixed(2)}MB\`
      },
      cpuUsage: {
        user: \`\${(latestCpu?.user / 1000).toFixed(2)}ms\`,
        system: \`\${(latestCpu?.system / 1000).toFixed(2)}ms\`
      }
    });
  }

  // Get指標
  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime
    };
  }

  // Reset指標
  reset() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTimes: [],
      memoryUsage: [],
      cpuUsage: []
    };
    this.startTime = Date.now();
    logger.info('Performance metrics reset');
  }
}

// CreateGlobalMonitorInstance
const performanceMonitor = new PerformanceMonitor();

module.exports = {
  PerformanceMonitor,
  performanceMonitor
};
`;

    const monitorPath = path.join(
      this.backendDir,
      'src/utils/performance-monitor.js'
    );
    fs.writeFileSync(monitorPath, monitoringSystem);
    log.success('性能監控系統已創建');
  }

  // 3. Create安全中間件
  async createSecurityMiddleware() {
    log.header('🔒 創建安全中間件');

    const securityMiddleware = `const rateLimit = require('express-rate-limit');
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const helmet = require('helmet');
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const cors = require('cors');
const { logger } = require('./unified-logger');

// 速率Limit
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: '請求過於頻繁，請稍後再試',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        url: req.url,
        userAgent: req.get('User-Agent')
      });
      res.status(429).json({
        error: '請求過於頻繁，請稍後再試',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// 安全中間件Configure
const securityConfig = {
  // 基本安全頭
  helmet: helmet({
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
    }
  }),

  // CORS Configure
  cors: cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }),

  // 速率Limit
  rateLimit: {
    general: createRateLimit(15 * 60 * 1000, 100), // 15Minute100次Request
    auth: createRateLimit(15 * 60 * 1000, 5),      // Authenticate端點更嚴格
    api: createRateLimit(15 * 60 * 1000, 1000)     // API端點較寬鬆
  }
};

// InputVerify中間件
const inputValidation = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        logger.warn('Input validation failed', {
          error: error.details[0].message,
          url: req.url,
          ip: req.ip
        });
        return res.status(400).json({
          error: '輸入VerifyFailed',
          details: error.details[0].message
        });
      }
      next();
    } catch (err) {
      logger.error('Input validation error', { error: err.message });
      res.status(500).json({ error: 'ServerError' });
    }
  };
};

// SQL 注入防護
const sqlInjectionProtection = (req, res, next) => {
  const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i;
  
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const checkValue = (value) => {
    if (typeof value === 'string' && sqlPattern.test(value)) {
      logger.warn('Potential SQL injection attempt', {
        value: value.substring(0, 100),
        url: req.url,
        ip: req.ip
      });
      return true;
    }
    return false;
  };

  // CheckRequest體
  if (req.body && typeof req.body === 'object') {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const checkObject = (obj) => {
      for (const [key, value] of Object.entries(obj)) {
        if (checkValue(value)) {
          return res.status(400).json({ error: '檢測到潛在的安全威脅' });
        }
        if (typeof value === 'object' && value !== null) {
          checkObject(value);
        }
      }
    };
    checkObject(req.body);
  }

  // CheckQueryParameter
  if (req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      if (checkValue(value)) {
        return res.status(400).json({ error: '檢測到潛在的安全威脅' });
      }
    }
  }

  next();
};

// XSS 防護
const xssProtection = (req, res, next) => {
  const xssPattern = /<script[^>]*>.*?</script>/gi;
  
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return value.replace(xssPattern, '');
    }
    return value;
  };

  // 清理Request體
  if (req.body && typeof req.body === 'object') {
    const sanitizeObject = (obj) => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          obj[key] = sanitizeValue(value);
        } else if (typeof value === 'object' && value !== null) {
          sanitizeObject(value);
        }
      }
    };
    sanitizeObject(req.body);
  }

  next();
};

module.exports = {
  securityConfig,
  inputValidation,
  sqlInjectionProtection,
  xssProtection
};
`;

    const securityPath = path.join(
      this.backendDir,
      'src/middleware/security.js'
    );
    fs.writeFileSync(securityPath, securityMiddleware);
    log.success('安全中間件已創建');
  }

  // 4. CreateErrorHandle系統
  async createErrorHandlingSystem() {
    log.header('🚨 CreateErrorHandle系統');

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const errorHandlingSystem = `const { logger } = require('../utils/unified-logger');

// CustomErrorClass
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = \`\${statusCode}\`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// ErrorHandle中間件
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => { // eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  let error = { ...err };
  error.message = err.message;

  // RecordError
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Sequelize ErrorHandle
  if (err.name === 'SequelizeValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = '數據已存在';
    error = new AppError(message, 400);
  }

  if (err.name === 'SequelizeConnectionError') {
    const message = '數據庫ConnectError';
    error = new AppError(message, 503);
  }

  // JWT ErrorHandle
  if (err.name === 'JsonWebTokenError') {
    const message = '無效的令牌';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = '令牌已過期';
    error = new AppError(message, 401);
  }

  // DefaultErrorResponse
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server內部Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// 404 ErrorHandle
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const notFoundHandler = (req, res, next) => {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const error = new AppError(\`路徑 \${req.originalUrl} 不存在\`, 404);
  next(error);
};

// AsyncErrorPackage裝
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ProcessErrorHandle
const setupProcessErrorHandling = () => {
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', {
      error: err.message,
      stack: err.stack
    });
    process.exit(1);
  });

  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection', {
      error: err.message,
      stack: err.stack
    });
    process.exit(1);
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  setupProcessErrorHandling
};
`;

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const errorPath = path.join(
      this.backendDir,
      'src/middleware/error-handler.js'
    );
    fs.writeFileSync(errorPath, errorHandlingSystem);
    log.success('ErrorHandle系統已Create');
  }

  // 5. Update統一Server以整合新功能
  async updateUnifiedServer() {
    log.header('🔄 Update統一Server');

    const updatedServer = `require('dotenv').config();
const express = require('express');
const { logger, logUtils } = require('./utils/unified-logger');
const { performanceMonitor } = require('./utils/performance-monitor');
const { securityConfig, sqlInjectionProtection, xssProtection } = require('./middleware/security');
const { errorHandler, notFoundHandler, setupProcessErrorHandling } = require('./middleware/error-handler');

// ImportConfigure
const { sequelize, testConnection } = require('./config/database-optimized');
const { connectRedis, healthCheck: redisHealthCheck } = require('./config/redis-optimized');

const app = express();

// SettingsProcessErrorHandle
setupProcessErrorHandling();

// 安全中間件
app.use(securityConfig.helmet);
app.use(securityConfig.cors);
app.use(sqlInjectionProtection);
app.use(xssProtection);

// 性能Monitor
performanceMonitor.start();

// RequestLog
app.use(logUtils.logRequest);

// 基本中間件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 速率Limit
app.use('/api/auth', securityConfig.rateLimit.auth);
app.use('/api', securityConfig.rateLimit.api);
app.use('/', securityConfig.rateLimit.general);

// 健康Check端點
app.get('/api/health', async (req, res) => {
  try {
    const start = Date.now();
    const dbStatus = await testConnection();
    const redisStatus = await redisHealthCheck();
    const duration = Date.now() - start;
    
    performanceMonitor.recordRequest(duration);
    
    res.json({
      success: true,
      message: 'CardStrategy API Service正常運行',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus ? 'connected' : 'disconnected',
        redis: redisStatus ? 'connected' : 'disconnected'
      },
      performance: {
        responseTime: \`\${duration}ms\`,
        uptime: \`\${Math.floor((Date.now() - performanceMonitor.startTime) / 1000)}s\`
      }
    });
  } catch (error) {
    performanceMonitor.recordError();
    logger.error('健康CheckFailed:', error);
    res.status(503).json({
      success: false,
      message: 'Service健康CheckFailed',
      error: error.message
    });
  }
});

// 性能指標端點
app.get('/api/metrics', (req, res) => {
  res.json({
    success: true,
    metrics: performanceMonitor.getMetrics()
  });
});

// Root端點
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CardStrategy API Server運行中',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Root據環境加載不同的路由
if (process.env.NODE_ENV === 'production') {
  // 生產環境：只加載核心功能
  logger.info('生產環境：加載核心功能');
} else {
  // On發環境：加載所有功能
  try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const authRoutes = require('./routes/auth');
    const cardsRoutes = require('./routes/cards');
    const collectionsRoutes = require('./routes/collections');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/cards', cardsRoutes);
    app.use('/api/collections', collectionsRoutes);
    
    logger.info('開發環境：加載所有路由');
  } catch (error) {
    logger.warn('部分路由加載Failed，使用簡化模式');
  }
}

// 404 ErrorHandle
app.use(notFoundHandler);

// ErrorHandle中間件
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // InitializeService
    try {
      await connectRedis();
      logger.info('Redis ConnectInitializeSuccess');
    } catch (error) {
      logger.error('Redis ConnectFailed:', error);
    }

    try {
      const dbConnected = await testConnection();
      if (dbConnected) {
        logger.info('數據庫Connect測試Success');
      } else {
        logger.warn('數據庫Connect測試Failed');
      }
    } catch (error) {
      logger.error('數據庫Connect測試Failed:', error);
    }

    const server = app.listen(PORT, () => {
      logger.info(\`🚀 CardStrategy API Server運行在端口 \${PORT}\`);
      logger.info(\`🏥 健康檢查端點: http://localhost:\${PORT}/api/health\`);
      logger.info(\`📊 性能指標端點: http://localhost:\${PORT}/api/metrics\`);
    });

    return server;
  } catch (error) {
    logger.error('Server啟動Failed:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
`;

    const serverPath = path.join(
      this.backendDir,
      'src/server-unified-enhanced.js'
    );
    fs.writeFileSync(serverPath, updatedServer);
    log.success('增強版統一Server已Create');
  }

  // 6. 生成第三階段Report
  generateReport() {
    log.header('📊 第三階段優化報告');

    const report = `
# 第三階段功能增強報告

## 🔧 完成的增強功能

### 1. 統一日誌系統
- ✅ 創建 \`src/utils/unified-logger.js\`
- ✅ 實現結構化日誌記錄
- ✅ 添加日誌輪轉和文件管理
- ✅ 支持不同環境的日誌格式

### 2. 性能監控系統
- ✅ 創建 \`src/utils/performance-monitor.js\`
- ✅ 實時監控請求數、錯誤率、響應時間
- ✅ 監控內存和 CPU 使用情況
- ✅ 提供性能指標 API 端點

### 3. 安全中間件
- ✅ 創建 \`src/middleware/security.js\`
- ✅ 實現速率限制和防護
- ✅ 添加 SQL 注入防護
- ✅ 實現 XSS 防護
- ✅ 配置安全頭和 CORS

### 4. 錯誤處理系統
- ✅ 創建 \`src/middleware/error-handler.js\`
- ✅ 實現統一的錯誤處理
- ✅ 添加自定義錯誤類
- ✅ 處理進程級錯誤

### 5. 增強版服務器
- ✅ 創建 \`src/server-unified-enhanced.js\`
- ✅ 整合所有新功能
- ✅ 添加性能指標端點
- ✅ 實現優雅的錯誤處理

## 🎯 新增功能

### 日誌功能
- 結構化日誌記錄
- 錯誤堆疊追蹤
- 請求/響應日誌
- 性能指標日誌
- 安全事件日誌

### 監控功能
- 實時性能指標
- 內存使用監控
- CPU 使用監控
- 錯誤率統計
- 響應時間分析

### 安全功能
- 速率限制防護
- SQL 注入防護
- XSS 攻擊防護
- 安全頭配置
- CORS 配置

### 錯誤處理
- 統一錯誤響應
- 自定義錯誤類
- 進程錯誤處理
- 優雅關閉
- 開發環境調試

## 📝 使用指南

### 1. 啟動增強版服務器
\`\`\`bash
cd backend
npm start
# 或使用增強版
node src/server-unified-enhanced.js
\`\`\`

### 2. 查看性能指標
\`\`\`bash
curl http://localhost:3000/api/metrics
\`\`\`

### 3. 健康檢查
\`\`\`bash
curl http://localhost:3000/api/health
\`\`\`

### 4. 查看日誌
\`\`\`bash
tail -f logs/combined.log
tail -f logs/error.log
\`\`\`

## 🔄 遷移指南

1. 更新 package.json 啟動腳本：
   \`\`\`json
   {
     "scripts": {
       "start": "node src/server-unified-enhanced.js"
     }
   }
   \`\`\`

2. 安裝新的依賴：
   \`\`\`bash
   npm install helmet express-rate-limit
   \`\`\`

3. 更新環境變數：
   \`\`\`env
   LOG_LEVEL=info
   CORS_ORIGIN=*
   \`\`\`

## 📊 性能提升

- 響應時間監控和優化
- 內存使用優化
- 錯誤處理改進
- 安全性增強
- 可觀測性提升

## 🎯 下一步建議

1. **部署測試**
   - 部署到測試環境
   - 進行負載測試
   - 驗證監控功能

2. **文檔完善**
   - 更新 API 文檔
   - 創建監控指南
   - 添加故障排除文檔

3. **持續改進**
   - 根據監控數據優化
   - 添加更多安全功能
   - 實現告警機制
`;

    const reportPath = path.join(
      this.projectRoot,
      'PHASE3_OPTIMIZATION_REPORT.md'
    );
    fs.writeFileSync(reportPath, report);
    log.success(`第三階段報告已生成: ${reportPath}`);
  }

  // 執Row所有優化
  async run() {
    log.header('🚀 開始第三階段功能增強');

    try {
      await this.createUnifiedLoggingSystem();
      await this.createPerformanceMonitoring();
      await this.createSecurityMiddleware();
      await this.createErrorHandlingSystem();
      await this.updateUnifiedServer();
      this.generateReport();

      log.header('🎉 第三階段優化完成！');
      log.success('請查看 PHASE3_OPTIMIZATION_REPORT.md 了解詳細結果');
    } catch (error) {
      log.error(`優化過程中發生Error: ${error.message}`);
      process.exit(1);
    }
  }
}

// 執Row優化
if (require.main === module) {
  const optimizer = new Phase3Optimizer();
  optimizer.run();
}

module.exports = Phase3Optimizer;

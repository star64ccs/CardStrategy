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

class Phase3ErrorHandlingOptimizer {
  constructor() {
    this.projectRoot = process.cwd();
    this.backendDir = path.join(this.projectRoot, 'backend');
  }

  // CreateCustomErrorClass
  async createCustomErrorClasses() {
    log.header('🚨 Create自定義Error類');

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const errorClasses = `const { logger } = require('./unified-logger');

// 基礎ErrorClass
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    this.name = this.constructor.name;

    // Catch堆疊Trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// VerifyError
class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
    this.name = 'ValidationError';
  }
}

// AuthenticateError
class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

// AuthorizeError
class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

// Resource未找到Error
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(\`\${resource} not found\`, 404);
    this.name = 'NotFoundError';
    this.resource = resource;
  }
}

// 衝突Error
class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

// Request過大Error
class PayloadTooLargeError extends AppError {
  constructor(message = 'Request payload too large') {
    super(message, 413);
    this.name = 'PayloadTooLargeError';
  }
}

// 速率LimitError
class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

// DatabaseError
class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', originalError = null) {
    super(message, 500);
    this.name = 'DatabaseError';
    this.originalError = originalError;
  }
}

// ExternalServiceError
class ExternalServiceError extends AppError {
  constructor(service, message = 'External service error') {
    super(\`\${service}: \${message}\`, 502);
    this.name = 'ExternalServiceError';
    this.service = service;
  }
}

// ConfigureError
class ConfigurationError extends AppError {
  constructor(message = 'Configuration error') {
    super(message, 500);
    this.name = 'ConfigurationError';
    this.isOperational = false;
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  PayloadTooLargeError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  ConfigurationError
};
`;

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const errorClassesPath = path.join(
      this.backendDir,
      'src/utils/custom-errors.js'
    );
    fs.writeFileSync(errorClassesPath, errorClasses);
    log.success('自定義Error類已Create');
  }

  // Create統一ErrorHandle器
  async createUnifiedErrorHandler() {
    log.header('🛠️ Create統一ErrorHandle器');

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const errorHandler = `const { logger } = require('./unified-logger');
const { 
  AppError, 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError,
  NotFoundError,
  ConflictError,
  PayloadTooLargeError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  ConfigurationError
} = require('./custom-errors');

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
  logError(err, req);

  // Sequelize ErrorHandle
  if (err.name === 'SequelizeValidationError') {
    const message = 'Validation Error';
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
    error = new ValidationError(message, errors);
  }

  // Sequelize Unique性約束Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value';
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
    error = new ConflictError(message);
  }

  // Sequelize 外Key約束Error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = new ValidationError('Invalid foreign key reference');
  }

  // JWT Error
  if (err.name === 'JsonWebTokenError') {
    error = new AuthenticationError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AuthenticationError('Token expired');
  }

  // Request體ParseError
  if (err.type === 'entity.too.large') {
    error = new PayloadTooLargeError();
  }

  // 速率LimitError
  if (err.status === 429) {
    error = new RateLimitError();
  }

  // DatabaseConnectError
  if (err.code === 'ECONNREFUSED' && err.syscall === 'connect') {
    error = new DatabaseError('Database connection failed', err);
  }

  // External API Error
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNRESET') {
    error = new ExternalServiceError('External API', 'Service unavailable');
  }

  // DefaultErrorResponse
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const response = {
    success: false,
    message: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  // On發環境Add額外Information
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
    response.error = {
      name: error.name,
      statusCode: error.statusCode,
      isOperational: error.isOperational
    };
  }

  // VerifyErrorPackage含詳細Information
  if (error instanceof ValidationError && error.errors) {
    response.errors = error.errors;
  }

  // SettingsStatus碼
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json(response);
};

// ErrorLogRecord
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const logError = (err, req) => {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const errorInfo = {
    name: err.name,
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    isOperational: err.isOperational !== false,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  };

  // Root據ErrorClass型SelectLog級別
  if (err.isOperational === false) {
    logger.error('Unhandled Error', errorInfo);
  } else if (err.statusCode >= 500) {
    logger.error('Server Error', errorInfo);
  } else if (err.statusCode >= 400) {
    logger.warn('Client Error', errorInfo);
  } else {
    logger.info('Application Error', errorInfo);
  }
};

// AsyncErrorHandlePackage裝器
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ProcessErrorHandle
const setupProcessErrorHandling = () => {
  // 未Catch的異常
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });

    // 優雅Off閉
    process.exit(1);
  });

  // 未Handle的 Promise Reject
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString(),
      timestamp: new Date().toISOString()
    });

    // 優雅Off閉
    process.exit(1);
  });

  // Warning
  process.on('warning', (warning) => {
    logger.warn('Process Warning', {
      name: warning.name,
      message: warning.message,
      stack: warning.stack,
      timestamp: new Date().toISOString()
    });
  });
};

// 優雅Off閉Handle
const setupGracefulShutdown = (server) => {
  const gracefulShutdown = (signal) => {
    logger.info(\`Received \${signal}. Starting graceful shutdown...\`);

    server.close((err) => {
      if (err) {
        logger.error('Error during server shutdown:', err);
        process.exit(1);
      }

      logger.info('Server closed successfully');
      process.exit(0);
    });

    // ForceOff閉超時
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

module.exports = {
  errorHandler,
  asyncHandler,
  setupProcessErrorHandling,
  setupGracefulShutdown,
  logError
};
`;

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const errorHandlerPath = path.join(
      this.backendDir,
      'src/utils/error-handler.js'
    );
    fs.writeFileSync(errorHandlerPath, errorHandler);
    log.success('統一ErrorHandle器已Create');
  }

  // CreateErrorResponseTool
  async createErrorResponseUtils() {
    log.header('📤 CreateError響應工具');

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const responseUtils = `const { logger } = require('./unified-logger');

// SuccessResponse
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

// ErrorResponse
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const errorResponse = (res, message = 'Error occurred', statusCode = 500, errors = null) => {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors) {
    response.errors = errors;
  }

  // RecordErrorResponse
  logger.warn('Error Response', {
    message,
    statusCode,
    errors,
    timestamp: new Date().toISOString()
  });

  return res.status(statusCode).json(response);
};

// VerifyErrorResponse
const validationErrorResponse = (res, errors) => {
  return errorResponse(res, 'Validation failed', 400, errors);
};

// AuthenticateErrorResponse
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const authenticationErrorResponse = (res, message = 'Authentication failed') => {
  return errorResponse(res, message, 401);
};

// AuthorizeErrorResponse
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const authorizationErrorResponse = (res, message = 'Insufficient permissions') => {
  return errorResponse(res, message, 403);
};

// 未找到ErrorResponse
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const notFoundErrorResponse = (res, resource = 'Resource') => {
  return errorResponse(res, \`\${resource} not found\`, 404);
};

// 衝突ErrorResponse
const conflictErrorResponse = (res, message = 'Resource conflict') => {
  return errorResponse(res, message, 409);
};

// ServerErrorResponse
const serverErrorResponse = (res, message = 'Internal server error') => {
  return errorResponse(res, message, 500);
};

// PaginateResponse
const paginatedResponse = (res, data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return successResponse(res, {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage
    }
  });
};

// FileUploadResponse
const fileUploadResponse = (res, fileInfo) => {
  return successResponse(res, {
    filename: fileInfo.filename,
    originalName: fileInfo.originalname,
    size: fileInfo.size,
    mimetype: fileInfo.mimetype,
    url: fileInfo.url || null
  }, 'File uploaded successfully');
};

// BatchOperationResponse
const batchOperationResponse = (res, results) => {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;

  return successResponse(res, {
    total: results.length,
    success: successCount,
    failed: failureCount,
    results
  }, \`Batch operation completed. \${successCount} succeeded, \${failureCount} failed\`);
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  authenticationErrorResponse,
  authorizationErrorResponse,
  notFoundErrorResponse,
  conflictErrorResponse,
  serverErrorResponse,
  paginatedResponse,
  fileUploadResponse,
  batchOperationResponse
};
`;

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const responseUtilsPath = path.join(
      this.backendDir,
      'src/utils/response-utils.js'
    );
    fs.writeFileSync(responseUtilsPath, responseUtils);
    log.success('Error響應工具已Create');
  }

  // CreateErrorMonitor系統
  async createErrorMonitoringSystem() {
    log.header('📊 CreateError監控系統');

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const errorMonitoring = `const { logger } = require('./unified-logger');

// ErrorStatistics
class ErrorMonitor {
  constructor() {
    this.errors = {
      total: 0,
      byType: {},
      byStatusCode: {},
      recent: []
    };
    this.maxRecentErrors = 100;
    this.startTime = Date.now();
  }

  // RecordError
  recordError(error, req = null) {
    this.errors.total++;
    
    // 按Class型Statistics
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const errorType = error.name || 'Unknown';
    this.errors.byType[errorType] = (this.errors.byType[errorType] || 0) + 1;
    
    // 按Status碼Statistics
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const statusCode = error.statusCode || 500;
    this.errors.byStatusCode[statusCode] = (this.errors.byStatusCode[statusCode] || 0) + 1;
    
    // Record最近Error
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const errorRecord = {
      type: errorType,
      message: error.message,
      statusCode,
      timestamp: new Date().toISOString(),
      url: req?.url,
      method: req?.method,
      ip: req?.ip
    };
    
    this.errors.recent.unshift(errorRecord);
    
    // 保持最近Error數量Limit
    if (this.errors.recent.length > this.maxRecentErrors) {
      this.errors.recent.pop();
    }
  }

  // GetErrorStatistics
  getErrorStats() {
    const uptime = Date.now() - this.startTime;
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const errorRate = this.errors.total / (uptime / 1000 / 60); // 每MinuteError率
    
    return {
      total: this.errors.total,
      errorRate: Math.round(errorRate * 100) / 100,
      uptime: Math.floor(uptime / 1000),
      byType: this.errors.byType,
      byStatusCode: this.errors.byStatusCode,
      recent: this.errors.recent.slice(0, 10) // 最近10個Error
    };
  }

  // ResetStatistics
  resetStats() {
    this.errors = {
      total: 0,
      byType: {},
      byStatusCode: {},
      recent: []
    };
    this.startTime = Date.now();
    logger.info('Error statistics reset');
  }

  // CheckError閾Value
  checkErrorThreshold(threshold = 10) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const recentErrors = this.errors.recent.filter(
      error => Date.now() - new Date(error.timestamp).getTime() < 60000 // 最近1Minute
    );
    
    if (recentErrors.length > threshold) {
      logger.error('Error threshold exceeded', {
        threshold,
        actual: recentErrors.length,
        errors: recentErrors
      });
      return true;
    }
    
    return false;
  }
}

// CreateGlobalErrorMonitorInstance
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const errorMonitor = new ErrorMonitor();

// ErrorMonitor中間件
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const errorMonitoringMiddleware = (err, req, res, next) => { // eslint-disable-next-line no-unused-vars
  errorMonitor.recordError(err, req);
  next(err);
};

// ErrorAlert系統
class ErrorAlertSystem {
  constructor() {
    this.alerts = [];
    this.alertThresholds = {
      errorRate: 5, // 每Minute5個Error
      consecutiveErrors: 3, // 連續3個Error
      criticalErrors: 1 // 1個嚴重Error
    };
  }

  // CheckYesNo需要SendAlert
  checkAlerts(errorStats) {
    const alerts = [];

    // CheckError率
    if (errorStats.errorRate > this.alertThresholds.errorRate) {
      alerts.push({
        type: 'HIGH_ERROR_RATE',
        message: \`High error rate detected: \${errorStats.errorRate} errors/minute\`,
        severity: 'warning',
        timestamp: new Date().toISOString()
      });
    }

    // Check連續Error
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const recentErrors = errorStats.recent.slice(0, this.alertThresholds.consecutiveErrors);
    if (recentErrors.length >= this.alertThresholds.consecutiveErrors) {
      const allSameType = recentErrors.every(error => error.type === recentErrors[0].type);
      if (allSameType) {
        alerts.push({
          type: 'CONSECUTIVE_ERRORS',
          message: \`Consecutive \${recentErrors[0].type} errors detected\`,
          severity: 'error',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Check嚴重Error
    const criticalErrors = recentErrors.filter(error => error.statusCode >= 500);
    if (criticalErrors.length >= this.alertThresholds.criticalErrors) {
      alerts.push({
        type: 'CRITICAL_ERRORS',
        message: \`Critical errors detected: \${criticalErrors.length} server errors\`,
        severity: 'critical',
        timestamp: new Date().toISOString()
      });
    }

    // RecordAlert
    alerts.forEach(alert => {
      logger.warn('Error Alert', alert);
      this.alerts.push(alert);
    });

    return alerts;
  }

  // GetAlert歷史
  getAlertHistory() {
    return this.alerts.slice(-50); // 最近50個Alert
  }

  // Clear舊Alert
  clearOldAlerts() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.alerts = this.alerts.filter(
      alert => new Date(alert.timestamp).getTime() > oneHourAgo
    );
  }
}

// CreateGlobalAlert系統Instance
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const errorAlertSystem = new ErrorAlertSystem();

module.exports = {
  errorMonitor,
  errorMonitoringMiddleware,
  errorAlertSystem
};
`;

    const monitoringPath = path.join(
      this.backendDir,
      'src/utils/error-monitor.js'
    );
    fs.writeFileSync(monitoringPath, errorMonitoring);
    log.success('Error監控系統已Create');
  }

  // 生成ErrorHandleReport
  generateReport() {
    log.header('🚨 ErrorHandle系統報告');

    const report = `
# 錯誤處理系統實現報告

## 🔧 創建的文件

### 1. 自定義錯誤類
- **文件**: \`src/utils/custom-errors.js\`
- **功能**:
  - 基礎錯誤類 (AppError)
  - 驗證錯誤 (ValidationError)
  - 認證錯誤 (AuthenticationError)
  - 授權錯誤 (AuthorizationError)
  - 資源未找到錯誤 (NotFoundError)
  - 衝突錯誤 (ConflictError)
  - 請求過大錯誤 (PayloadTooLargeError)
  - 速率限制錯誤 (RateLimitError)
  - 數據庫錯誤 (DatabaseError)
  - 外部服務錯誤 (ExternalServiceError)
  - 配置錯誤 (ConfigurationError)

### 2. 統一錯誤處理器
- **文件**: \`src/utils/error-handler.js\`
- **功能**:
  - 統一錯誤處理中間件
  - Sequelize 錯誤映射
  - JWT 錯誤處理
  - 異步錯誤處理包裝器
  - 進程錯誤處理
  - 優雅關閉處理

### 3. 錯誤響應工具
- **文件**: \`src/utils/response-utils.js\`
- **功能**:
  - 標準化響應格式
  - 成功響應工具
  - 錯誤響應工具
  - 分頁響應工具
  - 文件上傳響應
  - 批量操作響應

### 4. 錯誤監控系統
- **文件**: \`src/utils/error-monitor.js\`
- **功能**:
  - 錯誤統計收集
  - 錯誤率計算
  - 錯誤類型分析
  - 錯誤警報系統
  - 閾值監控

## 🎯 錯誤處理特性

### 分層錯誤處理
- **應用層**: 自定義錯誤類
- **中間件層**: 統一錯誤處理
- **響應層**: 標準化響應格式
- **監控層**: 錯誤統計和警報

### 錯誤分類
- **客戶端錯誤** (4xx): 驗證、認證、授權等
- **服務器錯誤** (5xx): 數據庫、外部服務等
- **操作錯誤**: 可預期的業務邏輯錯誤
- **系統錯誤**: 不可預期的系統錯誤

### 錯誤響應格式
\`\`\`json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint",
  "method": "POST",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
\`\`\`

## 🛠️ 使用方式

### 1. 在服務器中使用
\`\`\`javascript
const { errorHandler, asyncHandler, setupProcessErrorHandling, setupGracefulShutdown } = require('./utils/error-handler');
const { errorMonitoringMiddleware } = require('./utils/error-monitor');

// SettingsProcessErrorHandle
setupProcessErrorHandling();

// ErrorMonitor中間件
app.use(errorMonitoringMiddleware);

// 統一ErrorHandle
app.use(errorHandler);

// 優雅Off閉
setupGracefulShutdown(server);
\`\`\`

### 2. 在路由中使用
\`\`\`javascript
const { asyncHandler } = require('../utils/error-handler');
const { NotFoundError, ValidationError } = require('../utils/custom-errors');
const { successResponse, notFoundErrorResponse } = require('../utils/response-utils');

// 使用AsyncErrorHandlePackage裝器
router.get('/:id', asyncHandler(async (req, res) => {
  const item = await Item.findByPk(req.params.id);
  
  if (!item) {
    throw new NotFoundError('Item');
  }
  
  return successResponse(res, item);
}));
\`\`\`

### 3. 錯誤監控
\`\`\`javascript
const { errorMonitor, errorAlertSystem } = require('./utils/error-monitor');

// GetErrorStatistics
const stats = errorMonitor.getErrorStats();

// CheckAlert
const alerts = errorAlertSystem.checkAlerts(stats);
\`\`\`

## 📊 監控指標

### 錯誤統計
- 總錯誤數
- 錯誤率 (每分鐘)
- 按類型分類
- 按狀態碼分類
- 最近錯誤記錄

### 警報系統
- 高錯誤率警報
- 連續錯誤警報
- 嚴重錯誤警報
- 警報歷史記錄

### 性能指標
- 錯誤響應時間
- 錯誤處理效率
- 系統穩定性

## 🔄 下一步

1. **集成到統一服務器**
   - 在 \`server-unified.js\` 中添加錯誤處理
   - 配置錯誤監控
   - 測試錯誤處理功能

2. **增強版服務器**
   - 整合所有新功能
   - 添加錯誤處理端點
   - 實現完整的監控

3. **部署和測試**
   - 部署到測試環境
   - 進行錯誤處理測試
   - 驗證監控功能
`;

    const reportPath = path.join(this.projectRoot, 'ERROR_HANDLING_REPORT.md');
    fs.writeFileSync(reportPath, report);
    log.success(`ErrorHandle報告已生成: ${reportPath}`);
  }

  // 執Row所有優化
  async run() {
    log.header('🚀 開始第三階段ErrorHandle優化');

    try {
      await this.createCustomErrorClasses();
      await this.createUnifiedErrorHandler();
      await this.createErrorResponseUtils();
      await this.createErrorMonitoringSystem();
      this.generateReport();

      log.header('🎉 第三階段ErrorHandle優化完成！');
      log.success('ErrorHandle系統已Create完成');
      log.success('請查看 ERROR_HANDLING_REPORT.md 了解詳細信息');
    } catch (error) {
      log.error(`優化過程中發生Error: ${error.message}`);
      process.exit(1);
    }
  }
}

// 執Row優化
if (require.main === module) {
  const optimizer = new Phase3ErrorHandlingOptimizer();
  optimizer.run();
}

module.exports = Phase3ErrorHandlingOptimizer;

const logger = require('../utils/logger');

class ErrorHandler {
  constructor() {
    this.errorStats = {
      total: 0,
      byType: {},
      byStatus: {},
      byRoute: {},
      recentErrors: [],
    };
    this.maxRecentErrors = 100;
  }

  // 統一ErrorHandle中間件
  handleError(err, req, res, next) {
    const errorInfo = this.parseError(err, req);

    // RecordErrorStatistics
    this.recordError(errorInfo);

    // RecordErrorLog
    this.logError(errorInfo);

    // SendErrorResponse
    this.sendErrorResponse(errorInfo, res);
  }

  // ParseErrorInformation
  parseError(err, req) {
    const errorInfo = {
      id: this.generateErrorId(),
      message: err.message || 'Internal Server Error',
      stack: err.stack,
      status: err.status || 500,
      type: this.getErrorType(err),
      category: this.getErrorCategory(err),
      severity: this.getErrorSeverity(err),
      timestamp: Date.now(),
      userId: req.user?.id,
      sessionId: req.session?.id,
      requestInfo: {
        method: req.method,
        url: req.url,
        path: req.path,
        params: req.params,
        query: req.query,
        body: this.sanitizeBody(req.body),
        headers: this.sanitizeHeaders(req.headers),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      },
      context: {
        route: req.route?.path,
        controller: req.route?.stack?.[0]?.name,
        middleware: req.route?.stack?.map((s) => s.name).filter(Boolean),
      },
    };

    return errorInfo;
  }

  // GetErrorClass型
  getErrorType(err) {
    if (err.name === 'ValidationError') return 'validation';
    if (err.name === 'CastError') return 'cast';
    if (err.name === 'MongoError') return 'database';
    if (err.name === 'JsonWebTokenError') return 'auth';
    if (err.name === 'TokenExpiredError') return 'auth';
    if (err.code === 'ENOTFOUND') return 'network';
    if (err.code === 'ECONNREFUSED') return 'network';
    if (err.code === 'ETIMEDOUT') return 'network';
    return 'unknown';
  }

  // GetError分Class
  getErrorCategory(err) {
    if (err.status >= 500) return 'system';
    if (err.status === 401 || err.status === 403) return 'auth';
    if (err.status === 404) return 'api';
    if (err.status === 422) return 'validation';
    if (err.name === 'ValidationError') return 'validation';
    if (err.name === 'MongoError') return 'database';
    return 'api';
  }

  // GetError嚴重程度
  getErrorSeverity(err) {
    if (err.status >= 500) return 'high';
    if (err.status === 401 || err.status === 403) return 'medium';
    if (err.status === 404) return 'low';
    if (err.status === 422) return 'low';
    if (err.name === 'ValidationError') return 'low';
    return 'medium';
  }

  // RecordErrorStatistics
  recordError(errorInfo) {
    this.errorStats.total++;

    // 按Class型Statistics
    this.errorStats.byType[errorInfo.type] =
      (this.errorStats.byType[errorInfo.type] || 0) + 1;

    // 按Status碼Statistics
    this.errorStats.byStatus[errorInfo.status] =
      (this.errorStats.byStatus[errorInfo.status] || 0) + 1;

    // 按路由Statistics
    const route = errorInfo.context.route || 'unknown';
    this.errorStats.byRoute[route] = (this.errorStats.byRoute[route] || 0) + 1;

    // Record最近Error
    this.errorStats.recentErrors.push({
      id: errorInfo.id,
      message: errorInfo.message,
      status: errorInfo.status,
      type: errorInfo.type,
      timestamp: errorInfo.timestamp,
      route,
    });

    // Limit最近Error數量
    if (this.errorStats.recentErrors.length > this.maxRecentErrors) {
      this.errorStats.recentErrors.shift();
    }
  }

  // RecordErrorLog
  logError(errorInfo) {
    const logData = {
      id: errorInfo.id,
      message: errorInfo.message,
      status: errorInfo.status,
      type: errorInfo.type,
      category: errorInfo.category,
      severity: errorInfo.severity,
      route: errorInfo.context.route,
      userId: errorInfo.userId,
      requestInfo: {
        method: errorInfo.requestInfo.method,
        url: errorInfo.requestInfo.url,
        ip: errorInfo.requestInfo.ip,
      },
    };

    switch (errorInfo.severity) {
      case 'high':
        logger.error('嚴重Error', logData);
        break;
      case 'medium':
        logger.warn('中級Error', logData);
        break;
      case 'low':
        logger.info('低級Error', logData);
        break;
      default:
        logger.error('未知Error', logData);
    }
  }

  // SendErrorResponse
  sendErrorResponse(errorInfo, res) {
    const isDevelopment = process.env.NODE_ENV === 'development';

    const response = {
      success: false,
      error: {
        id: errorInfo.id,
        message: errorInfo.message,
        status: errorInfo.status,
        type: errorInfo.type,
      },
    };

    // On發環境Return詳細ErrorInformation
    if (isDevelopment) {
      response.error.stack = errorInfo.stack;
      response.error.context = errorInfo.context;
    }

    // Root據ErrorClass型Settings適當的Status碼
    const statusCode = errorInfo.status || 500;

    res.status(statusCode).json(response);
  }

  // 生成Error ID
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 清理Request體（Remove敏感Information）
  sanitizeBody(body) {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  // 清理Request頭（Remove敏感Information）
  sanitizeHeaders(headers) {
    if (!headers) return headers;

    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  // GetErrorStatistics
  getErrorStats() {
    return {
      ...this.errorStats,
      summary: {
        totalErrors: this.errorStats.total,
        errorRate: this.calculateErrorRate(),
        topErrorTypes: this.getTopErrorTypes(),
        topErrorRoutes: this.getTopErrorRoutes(),
        recentErrorCount: this.errorStats.recentErrors.length,
      },
    };
  }

  // 計算Error率
  calculateErrorRate() {
    // 這裡可以實現更複雜的Error率計算邏輯
    return this.errorStats.total;
  }

  // GetTopErrorClass型
  getTopErrorTypes() {
    return Object.entries(this.errorStats.byType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  // GetTopError路由
  getTopErrorRoutes() {
    return Object.entries(this.errorStats.byRoute)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([route, count]) => ({ route, count }));
  }

  // 清理ErrorStatistics
  clearErrorStats() {
    this.errorStats = {
      total: 0,
      byType: {},
      byStatus: {},
      byRoute: {},
      recentErrors: [],
    };
    logger.info('Error統計已清理');
  }

  // CustomErrorClass
  createCustomError(message, status = 500, type = 'unknown') {
    const error = new Error(message);
    error.status = status;
    error.type = type;
    return error;
  }

  // VerifyError
  createValidationError(message, fields = {}) {
    const error = this.createCustomError(message, 422, 'validation');
    error.fields = fields;
    return error;
  }

  // AuthenticateError
  createAuthError(message = '認證Failed') {
    return this.createCustomError(message, 401, 'auth');
  }

  // 權限Error
  createPermissionError(message = '權限不足') {
    return this.createCustomError(message, 403, 'auth');
  }

  // Resource不存在Error
  createNotFoundError(message = '資源不存在') {
    return this.createCustomError(message, 404, 'api');
  }

  // DatabaseError
  createDatabaseError(message = '數據庫操作Failed') {
    return this.createCustomError(message, 500, 'database');
  }

  // NetworkError
  createNetworkError(message = '網絡ConnectFailed') {
    return this.createCustomError(message, 500, 'network');
  }
}

// CreateErrorHandle器Instance
const errorHandler = new ErrorHandler();

// 中間件Function
const errorHandlerMiddleware = (err, req, res, next) => { // eslint-disable-next-line no-unused-vars // eslint-disable-next-line no-unused-vars
  errorHandler.handleError(err, req, res, next);
};

// AsyncErrorHandlePackage裝器
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 ErrorHandle
const handleNotFound = (req, res, next) => {
  const error = errorHandler.createNotFoundError(
    `路由不存在: ${req.method} ${req.url}`
  );
  next(error);
};

// Request超時Handle
const handleTimeout = (timeout = 30000) => {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      const error = errorHandler.createCustomError('請求超時', 408, 'timeout');
      next(error);
    }, timeout);

    res.on('finish', () => {
      clearTimeout(timer);
    });

    next();
  };
};

// Request大小LimitHandle
const handlePayloadTooLarge = (err, req, res, next) => { // eslint-disable-next-line no-unused-vars // eslint-disable-next-line no-unused-vars
  if (err.type === 'entity.too.large') {
    const error = errorHandler.createCustomError('請求體過大', 413, 'payload');
    next(error);
  } else {
    next(err);
  }
};

module.exports = {
  errorHandler,
  errorHandlerMiddleware,
  asyncHandler,
  handleNotFound,
  handleTimeout,
  handlePayloadTooLarge,
};

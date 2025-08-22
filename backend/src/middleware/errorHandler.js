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

  // 統一錯誤處理中間件
  handleError(err, req, res, next) {
    const errorInfo = this.parseError(err, req);

    // 記錄錯誤統計
    this.recordError(errorInfo);

    // 記錄錯誤日誌
    this.logError(errorInfo);

    // 發送錯誤響應
    this.sendErrorResponse(errorInfo, res);
  }

  // 解析錯誤信息
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

  // 獲取錯誤類型
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

  // 獲取錯誤分類
  getErrorCategory(err) {
    if (err.status >= 500) return 'system';
    if (err.status === 401 || err.status === 403) return 'auth';
    if (err.status === 404) return 'api';
    if (err.status === 422) return 'validation';
    if (err.name === 'ValidationError') return 'validation';
    if (err.name === 'MongoError') return 'database';
    return 'api';
  }

  // 獲取錯誤嚴重程度
  getErrorSeverity(err) {
    if (err.status >= 500) return 'high';
    if (err.status === 401 || err.status === 403) return 'medium';
    if (err.status === 404) return 'low';
    if (err.status === 422) return 'low';
    if (err.name === 'ValidationError') return 'low';
    return 'medium';
  }

  // 記錄錯誤統計
  recordError(errorInfo) {
    this.errorStats.total++;

    // 按類型統計
    this.errorStats.byType[errorInfo.type] =
      (this.errorStats.byType[errorInfo.type] || 0) + 1;

    // 按狀態碼統計
    this.errorStats.byStatus[errorInfo.status] =
      (this.errorStats.byStatus[errorInfo.status] || 0) + 1;

    // 按路由統計
    const route = errorInfo.context.route || 'unknown';
    this.errorStats.byRoute[route] = (this.errorStats.byRoute[route] || 0) + 1;

    // 記錄最近錯誤
    this.errorStats.recentErrors.push({
      id: errorInfo.id,
      message: errorInfo.message,
      status: errorInfo.status,
      type: errorInfo.type,
      timestamp: errorInfo.timestamp,
      route,
    });

    // 限制最近錯誤數量
    if (this.errorStats.recentErrors.length > this.maxRecentErrors) {
      this.errorStats.recentErrors.shift();
    }
  }

  // 記錄錯誤日誌
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
        logger.error('嚴重錯誤', logData);
        break;
      case 'medium':
        logger.warn('中級錯誤', logData);
        break;
      case 'low':
        logger.info('低級錯誤', logData);
        break;
      default:
        logger.error('未知錯誤', logData);
    }
  }

  // 發送錯誤響應
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

    // 開發環境返回詳細錯誤信息
    if (isDevelopment) {
      response.error.stack = errorInfo.stack;
      response.error.context = errorInfo.context;
    }

    // 根據錯誤類型設置適當的狀態碼
    const statusCode = errorInfo.status || 500;

    res.status(statusCode).json(response);
  }

  // 生成錯誤 ID
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 清理請求體（移除敏感信息）
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

  // 清理請求頭（移除敏感信息）
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

  // 獲取錯誤統計
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

  // 計算錯誤率
  calculateErrorRate() {
    // 這裡可以實現更複雜的錯誤率計算邏輯
    return this.errorStats.total;
  }

  // 獲取頂部錯誤類型
  getTopErrorTypes() {
    return Object.entries(this.errorStats.byType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  // 獲取頂部錯誤路由
  getTopErrorRoutes() {
    return Object.entries(this.errorStats.byRoute)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([route, count]) => ({ route, count }));
  }

  // 清理錯誤統計
  clearErrorStats() {
    this.errorStats = {
      total: 0,
      byType: {},
      byStatus: {},
      byRoute: {},
      recentErrors: [],
    };
    logger.info('錯誤統計已清理');
  }

  // 自定義錯誤類
  createCustomError(message, status = 500, type = 'unknown') {
    const error = new Error(message);
    error.status = status;
    error.type = type;
    return error;
  }

  // 驗證錯誤
  createValidationError(message, fields = {}) {
    const error = this.createCustomError(message, 422, 'validation');
    error.fields = fields;
    return error;
  }

  // 認證錯誤
  createAuthError(message = '認證失敗') {
    return this.createCustomError(message, 401, 'auth');
  }

  // 權限錯誤
  createPermissionError(message = '權限不足') {
    return this.createCustomError(message, 403, 'auth');
  }

  // 資源不存在錯誤
  createNotFoundError(message = '資源不存在') {
    return this.createCustomError(message, 404, 'api');
  }

  // 數據庫錯誤
  createDatabaseError(message = '數據庫操作失敗') {
    return this.createCustomError(message, 500, 'database');
  }

  // 網絡錯誤
  createNetworkError(message = '網絡連接失敗') {
    return this.createCustomError(message, 500, 'network');
  }
}

// 創建錯誤處理器實例
const errorHandler = new ErrorHandler();

// 中間件函數
const errorHandlerMiddleware = (err, req, res, next) => {
  errorHandler.handleError(err, req, res, next);
};

// 異步錯誤處理包裝器
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 錯誤處理
const handleNotFound = (req, res, next) => {
  const error = errorHandler.createNotFoundError(
    `路由不存在: ${req.method} ${req.url}`
  );
  next(error);
};

// 請求超時處理
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

// 請求大小限制處理
const handlePayloadTooLarge = (err, req, res, next) => {
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

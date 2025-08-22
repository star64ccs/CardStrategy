const { logger } = require('./unified-logger');
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
  ConfigurationError,
} = require('./custom-errors');

// 錯誤處理中間件
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
// eslint-disable-next-line no-unused-vars
  let error = { ...err };
  error.message = err.message;

  // 記錄錯誤
  logError(err, req);

  // Sequelize 錯誤處理
  if (err.name === 'SequelizeValidationError') {
    const message = 'Validation Error';
// eslint-disable-next-line no-unused-vars
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));
    error = new ValidationError(message, errors);
  }

  // Sequelize 唯一性約束錯誤
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value';
// eslint-disable-next-line no-unused-vars
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));
    error = new ConflictError(message);
  }

  // Sequelize 外鍵約束錯誤
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = new ValidationError('Invalid foreign key reference');
  }

  // JWT 錯誤
  if (err.name === 'JsonWebTokenError') {
    error = new AuthenticationError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AuthenticationError('Token expired');
  }

  // 請求體解析錯誤
  if (err.type === 'entity.too.large') {
    error = new PayloadTooLargeError();
  }

  // 速率限制錯誤
  if (err.status === 429) {
    error = new RateLimitError();
  }

  // 數據庫連接錯誤
  if (err.code === 'ECONNREFUSED' && err.syscall === 'connect') {
    error = new DatabaseError('Database connection failed', err);
  }

  // 外部 API 錯誤
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNRESET') {
    error = new ExternalServiceError('External API', 'Service unavailable');
  }

  // 默認錯誤響應
// eslint-disable-next-line no-unused-vars
  const response = {
    success: false,
    message: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  // 開發環境添加額外信息
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
    response.error = {
      name: error.name,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
    };
  }

  // 驗證錯誤包含詳細信息
  if (error instanceof ValidationError && error.errors) {
    response.errors = error.errors;
  }

  // 設置狀態碼
// eslint-disable-next-line no-unused-vars
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json(response);
};

// 錯誤日誌記錄
// eslint-disable-next-line no-unused-vars
const logError = (err, req) => {
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
    timestamp: new Date().toISOString(),
  };

  // 根據錯誤類型選擇日誌級別
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

// 異步錯誤處理包裝器
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 進程錯誤處理
const setupProcessErrorHandling = () => {
  // 未捕獲的異常
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });

    // 優雅關閉
    process.exit(1);
  });

  // 未處理的 Promise 拒絕
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString(),
      timestamp: new Date().toISOString(),
    });

    // 優雅關閉
    process.exit(1);
  });

  // 警告
  process.on('warning', (warning) => {
    logger.warn('Process Warning', {
      name: warning.name,
      message: warning.message,
      stack: warning.stack,
      timestamp: new Date().toISOString(),
    });
  });
};

// 優雅關閉處理
const setupGracefulShutdown = (server) => {
  const gracefulShutdown = (signal) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    server.close((err) => {
      if (err) {
        logger.error('Error during server shutdown:', err);
        process.exit(1);
      }

      logger.info('Server closed successfully');
      process.exit(0);
    });

    // 強制關閉超時
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
  logError,
};

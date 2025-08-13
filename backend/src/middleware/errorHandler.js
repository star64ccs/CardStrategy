const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 記錄錯誤
  logger.error(`錯誤: ${err.message}`);
  logger.error(`堆疊: ${err.stack}`);

  // Mongoose 錯誤處理
  if (err.name === 'CastError') {
    const message = '資源不存在';
    error = { message, statusCode: 404 };
  }

  if (err.code === 11000) {
    const message = '重複的字段值';
    error = { message, statusCode: 400 };
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  if (err.name === 'JsonWebTokenError') {
    const message = '無效的令牌';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = '令牌已過期';
    error = { message, statusCode: 401 };
  }

  // 默認錯誤響應
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || '服務器內部錯誤',
    code: error.code || 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;

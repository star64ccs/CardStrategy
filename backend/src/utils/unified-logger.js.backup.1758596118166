const winston = require('winston');
const path = require('path');
// eslint-disable-next-line no-unused-vars
const fs = require('fs');

// 創建日誌目錄
// eslint-disable-next-line no-unused-vars
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 日誌格式
// eslint-disable-next-line no-unused-vars
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 控制台格式
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

// 創建 logger 實例
// eslint-disable-next-line no-unused-vars
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'cardstrategy-api' },
  transports: [
    // 錯誤日誌文件
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 所有日誌文件
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// 開發環境添加控制台輸出
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// 日誌工具函數
// eslint-disable-next-line no-unused-vars
const logUtils = {
  // 請求日誌
  logRequest: (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });
    });
    next();
  },

  // 錯誤日誌
  logError: (error, req, res, next) => {
    logger.error('Application Error', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
    });
    next(error);
  },

  // 性能日誌
  logPerformance: (operation, duration, metadata = {}) => {
    logger.info('Performance Metric', {
      operation,
      duration: `${duration}ms`,
      ...metadata,
    });
  },

  // 安全日誌
  logSecurity: (event, details) => {
    logger.warn('Security Event', {
      event,
      details,
      timestamp: new Date().toISOString(),
    });
  },
};

module.exports = {
  logger,
  logUtils,
};

const winston = require('winston');
const path = require('path');
// eslint-disable-next-line no-unused-vars
const fs = require('fs');

// CreateLogDirectory
// eslint-disable-next-line no-unused-vars
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log格式
// eslint-disable-next-line no-unused-vars
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Control台格式
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

// Create logger Instance
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
      maxFiles: 5,
    }),
    // 所有LogFile
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// On發環境AddControl台Output
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// LogToolFunction
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
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
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
      ip: req.ip,
    });
    next(error);
  },

  // 性能Log
  logPerformance: (operation, duration, metadata = {}) => {
    logger.info('Performance Metric', {
      operation,
      duration: `${duration}ms`,
      ...metadata,
    });
  },

  // 安全Log
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

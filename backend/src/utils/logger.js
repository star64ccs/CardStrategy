const winston = require('winston');
const path = require('path');

// 定義Log級別
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Root據環境SelectLog級別
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// 定義Log顏色
// eslint-disable-next-line no-unused-vars
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// 定義Log格式
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// 定義傳輸器
const transports = [
  // Control台Output
  new winston.transports.Console(),

  // ErrorLogFile
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
  }),

  // 所有LogFile
  new winston.transports.File({
    filename: path.join('logs', 'all.log'),
  }),
];

// CreateloggerInstance
// eslint-disable-next-line no-unused-vars
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

module.exports = logger;

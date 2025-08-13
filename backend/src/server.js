require('express-async-errors');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./config/database');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const cardRoutes = require('./routes/cards');
const collectionRoutes = require('./routes/collections');
const marketRoutes = require('./routes/market');
const investmentRoutes = require('./routes/investments');
const aiRoutes = require('./routes/ai');
const membershipRoutes = require('./routes/membership');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3000;

// 連接數據庫
connectDB().catch(err => {
  logger.error('數據庫連接失敗:', err);
  process.exit(1);
});

// 安全中間件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS配置
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://cardstrategy.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 100, // 每個IP限制100個請求
  message: {
    error: '請求過於頻繁，請稍後再試',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// 壓縮響應
app.use(compression());

// 日誌記錄
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// 解析請求體
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康檢查端點
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CardStrategy API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API健康檢查端點
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CardStrategy API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/settings', settingsRoutes);

// 404處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API端點不存在',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.originalUrl
  });
});

// 錯誤處理中間件
app.use(errorHandler);

// 啟動服務器
app.listen(PORT, () => {
  logger.info(`服務器運行在端口 ${PORT}`);
  logger.info(`環境: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`健康檢查: http://localhost:${PORT}/health`);
});

// 優雅關閉
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信號，正在關閉服務器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('收到SIGINT信號，正在關閉服務器...');
  process.exit(0);
});

module.exports = app;

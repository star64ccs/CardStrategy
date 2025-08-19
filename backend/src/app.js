const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');

// 路由導入
const authRoutes = require('./routes/auth');
const cardRoutes = require('./routes/cards');
const collectionRoutes = require('./routes/collections');
const investmentRoutes = require('./routes/investments');
const marketRoutes = require('./routes/market');
const aiRoutes = require('./routes/ai');
const deepLearningRoutes = require('./routes/deepLearning');

const app = express();

// 安全中間件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  }
}));

// CORS 配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 100, // 限制每個IP 15分鐘內最多100個請求
  message: {
    success: false,
    message: '請求過於頻繁，請稍後再試',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// 日誌中間件
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// 壓縮中間件
app.use(compression());

// 解析 JSON 和 URL 編碼的請求體
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CardStrategy API 服務正常運行',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API 版本信息
app.get('/api/version', (req, res) => {
  res.json({
    success: true,
    data: {
      version: process.env.npm_package_version || '1.0.0',
      apiVersion: 'v1',
      features: {
        authentication: true,
        cardManagement: true,
        collectionManagement: true,
        investmentTracking: true,
        marketData: true,
        aiAnalysis: true,
        deepLearning: true
      },
      deepLearning: {
        models: ['lstm', 'gru', 'transformer', 'ensemble'],
        tensorflowVersion: '2.x',
        features: ['price_prediction', 'model_comparison', 'batch_prediction']
      }
    }
  });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/deep-learning', deepLearningRoutes);

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '請求的端點不存在',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.originalUrl
  });
});

// 全局錯誤處理中間件
app.use((error, req, res, next) => {
  logger.error('全局錯誤:', error);

  // 處理驗證錯誤
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: '數據驗證失敗',
      code: 'VALIDATION_ERROR',
      errors: error.errors
    });
  }

  // 處理 JWT 錯誤
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: '無效的認證令牌',
      code: 'INVALID_TOKEN'
    });
  }

  // 處理 Token 過期錯誤
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: '認證令牌已過期',
      code: 'TOKEN_EXPIRED'
    });
  }

  // 處理 Sequelize 錯誤
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: '數據庫驗證失敗',
      code: 'DATABASE_VALIDATION_ERROR',
      errors: error.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: '數據已存在',
      code: 'DUPLICATE_ENTRY',
      field: error.errors[0].path
    });
  }

  // 處理深度學習錯誤
  if (error.message && error.message.includes('TensorFlow')) {
    return res.status(500).json({
      success: false,
      message: '深度學習服務暫時不可用',
      code: 'DEEP_LEARNING_SERVICE_ERROR'
    });
  }

  // 處理內存不足錯誤
  if (error.code === 'ENOMEM') {
    return res.status(500).json({
      success: false,
      message: '系統資源不足',
      code: 'INSUFFICIENT_MEMORY'
    });
  }

  // 默認錯誤響應
  const statusCode = error.statusCode || 500;
  const message = error.message || '內部服務器錯誤';

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? '內部服務器錯誤' : message,
    code: error.code || 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 優雅關閉處理
process.on('SIGTERM', () => {
  logger.info('收到 SIGTERM 信號，開始優雅關閉...');

  // 清理深度學習資源
  if (require('./services/deepLearningService').cleanup) {
    require('./services/deepLearningService').cleanup();
  }

  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('收到 SIGINT 信號，開始優雅關閉...');

  // 清理深度學習資源
  if (require('./services/deepLearningService').cleanup) {
    require('./services/deepLearningService').cleanup();
  }

  process.exit(0);
});

module.exports = app;

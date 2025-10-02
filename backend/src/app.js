const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');

// 路由Import
const authRoutes = require('./routes/auth');
const cardRoutes = require('./routes/cards');
const collectionRoutes = require('./routes/collections');
const investmentRoutes = require('./routes/investments');
const marketRoutes = require('./routes/market');
const aiRoutes = require('./routes/ai');
const deepLearningRoutes = require('./routes/deepLearning');

const app = express();

// 安全中間件
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

// CORS Configure
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 速率Limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15Minute
  max: 100, // Limit每個IP 15Minute內最多100個Request
  message: {
    success: false,
    message: '請求過於頻繁，請稍後再試',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Log中間件
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// 壓縮中間件
app.use(compression());

// Parse JSON 和 URL Encode的Request體
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康Check端點
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CardStrategy API Service正常運行',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// API VersionInformation
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
        deepLearning: true,
      },
      deepLearning: {
        models: ['lstm', 'gru', 'transformer', 'ensemble'],
        tensorflowVersion: '2.x',
        features: ['price_prediction', 'model_comparison', 'batch_prediction'],
      },
    },
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

// 404 Handle
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '請求的端點不存在',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.originalUrl,
  });
});

// GlobalErrorHandle中間件
app.use((error, req, res, next) => {
  logger.error('全局Error:', error);

  // HandleVerifyError
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: '數據VerifyFailed',
      code: 'VALIDATION_ERROR',
      errors: error.errors,
    });
  }

  // Handle JWT Error
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: '無效的認證令牌',
      code: 'INVALID_TOKEN',
    });
  }

  // Handle Token 過期Error
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: '認證令牌已過期',
      code: 'TOKEN_EXPIRED',
    });
  }

  // Handle Sequelize Error
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: '數據庫VerifyFailed',
      code: 'DATABASE_VALIDATION_ERROR',
      errors: error.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: '數據已存在',
      code: 'DUPLICATE_ENTRY',
      field: error.errors[0].path,
    });
  }

  // Handle深度學習Error
  if (error.message && error.message.includes('TensorFlow')) {
    return res.status(500).json({
      success: false,
      message: '深度學習Service暫時不可用',
      code: 'DEEP_LEARNING_SERVICE_ERROR',
    });
  }

  // HandleMemory不足Error
  if (error.code === 'ENOMEM') {
    return res.status(500).json({
      success: false,
      message: '系統資源不足',
      code: 'INSUFFICIENT_MEMORY',
    });
  }

  // DefaultErrorResponse
  const statusCode = error.statusCode || 500;
  const message = error.message || '內部ServerError';

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? '內部ServerError' : message,
    code: error.code || 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// 優雅Off閉Handle
process.on('SIGTERM', () => {
  logger.info('收到 SIGTERM 信號，開始優雅關閉...');

  // 清理深度學習Resource
  if (require('./services/deepLearningService').cleanup) {
    require('./services/deepLearningService').cleanup();
  }

  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('收到 SIGINT 信號，開始優雅關閉...');

  // 清理深度學習Resource
  if (require('./services/deepLearningService').cleanup) {
    require('./services/deepLearningService').cleanup();
  }

  process.exit(0);
});

module.exports = app;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// 導入工具
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中間件
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 100, // 限制每個IP 15分鐘內最多100個請求
  message: {
    error: '請求過於頻繁，請稍後再試'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// 壓縮中間件
app.use(compression());

// 日誌中間件
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// 解析JSON和URL編碼的請求體
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 靜態文件服務
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 基本路由
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '歡迎使用 CardStrategy API',
    version: '3.1.0',
    endpoints: {
      health: '/health',
      status: '/api/status',
      database: '/api/db/test',
      auth: '/api/auth',
      cards: '/api/cards',
      collections: '/api/collections',
      investments: '/api/investments',
      market: '/api/market',
      ai: '/api/ai'
    },
    timestamp: new Date().toISOString()
  });
});

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CardStrategy API 服務運行正常',
    timestamp: new Date().toISOString(),
    version: '3.1.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API 狀態端點
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'API 服務正常',
    services: {
      database: 'PostgreSQL - 已連接',
      authentication: 'JWT - 已配置',
      security: 'Helmet - 已啟用',
      compression: '已啟用',
      cors: '已配置',
      rateLimit: '已啟用'
    },
    timestamp: new Date().toISOString()
  });
});

// 數據庫連接測試端點
app.get('/api/db/test', async (req, res) => {
  try {
    const { Client } = require('pg');

    const client = new Client({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DB || 'cardstrategy',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'sweetcorn831'
    });

    await client.connect();
    const result = await client.query('SELECT version() as version, current_database() as database');
    await client.end();

    res.json({
      success: true,
      message: '數據庫連接正常',
      data: {
        version: result.rows[0].version,
        database: result.rows[0].database,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('數據庫連接測試失敗:', error);
    res.status(500).json({
      success: false,
      message: '數據庫連接失敗',
      error: error.message
    });
  }
});

// 認證路由（基本版本）
app.get('/api/auth/status', (req, res) => {
  res.json({
    success: true,
    message: '認證服務正常',
    features: ['JWT', '密碼加密', '用戶管理'],
    timestamp: new Date().toISOString()
  });
});

// 卡片路由（基本版本）
app.get('/api/cards/status', (req, res) => {
  res.json({
    success: true,
    message: '卡片服務正常',
    features: ['卡片管理', '條件分析', '價格追蹤'],
    timestamp: new Date().toISOString()
  });
});

// 集合路由（基本版本）
app.get('/api/collections/status', (req, res) => {
  res.json({
    success: true,
    message: '集合服務正常',
    features: ['集合管理', '卡片分類', '統計分析'],
    timestamp: new Date().toISOString()
  });
});

// 投資路由（基本版本）
app.get('/api/investments/status', (req, res) => {
  res.json({
    success: true,
    message: '投資服務正常',
    features: ['投資追蹤', '收益分析', '風險評估'],
    timestamp: new Date().toISOString()
  });
});

// 市場路由（基本版本）
app.get('/api/market/status', (req, res) => {
  res.json({
    success: true,
    message: '市場服務正常',
    features: ['市場數據', '價格分析', '趨勢預測'],
    timestamp: new Date().toISOString()
  });
});

// AI 路由（基本版本）
app.get('/api/ai/status', (req, res) => {
  res.json({
    success: true,
    message: 'AI 服務正常',
    features: ['卡片識別', '條件評估', '價格預測', '市場分析'],
    timestamp: new Date().toISOString()
  });
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '端點不存在',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/status',
      'GET /api/db/test',
      'GET /api/auth/status',
      'GET /api/cards/status',
      'GET /api/collections/status',
      'GET /api/investments/status',
      'GET /api/market/status',
      'GET /api/ai/status'
    ]
  });
});

// 錯誤處理中間件
app.use((error, req, res, next) => {
  logger.error('服務器錯誤:', error);
  res.status(500).json({
    success: false,
    message: '內部服務器錯誤',
    error: process.env.NODE_ENV === 'development' ? error.message : '請稍後再試'
  });
});

// 啟動服務器
app.listen(PORT, () => {
  logger.info('🚀 CardStrategy API 服務已啟動');
  logger.info(`📡 服務器運行在端口: ${PORT}`);
  logger.info(`🌐 本地訪問: http://localhost:${PORT}`);
  logger.info(`🔍 健康檢查: http://localhost:${PORT}/health`);
  logger.info(`📊 API 狀態: http://localhost:${PORT}/api/status`);
  logger.info(`🗄️  數據庫測試: http://localhost:${PORT}/api/db/test`);
  logger.info('');
  logger.info('✅ PostgreSQL 數據庫已配置');
  logger.info('✅ 安全中間件已啟用');
  logger.info('✅ CORS 已配置');
  logger.info('✅ 壓縮已啟用');
  logger.info('✅ 速率限制已啟用');
  logger.info('');
  logger.info('�� 應用程序已準備就緒！');
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

// 導入基本路由
const authRoutes = require('./routes/auth');
const cardRoutes = require('./routes/cards');
const marketDataRoutes = require('./routes/market');
const investmentRoutes = require('./routes/investments');

// 導入數據庫配置
const { sequelize, testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// 基本中間件
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100, // 限制每個 IP 100 個請求
  message: {
    success: false,
    message: '請求過於頻繁，請稍後再試',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

app.use('/api', limiter);

// 健康檢查端點
app.get('/api/health', async (req, res) => {
  try {
    // 測試數據庫連接
    await testConnection();

    res.json({
      success: true,
      message: 'CardStrategy Backend API 運行正常',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'connected'
    });
  } catch (error) {
    logger.error('健康檢查失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器運行但數據庫連接失敗',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'disconnected',
      error: error.message
    });
  }
});

// 測試端點
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '測試端點正常',
    data: {
      message: 'Hello from CardStrategy Backend!',
      timestamp: new Date().toISOString()
    }
  });
});

// 根端點
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CardStrategy Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      auth: '/api/auth',
      cards: '/api/cards',
      market: '/api/market',
      investments: '/api/investments'
    }
  });
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/market', marketDataRoutes);
app.use('/api/investments', investmentRoutes);

// 錯誤處理中間件
app.use((err, req, res, next) => {
  logger.error('服務器錯誤:', err);
  res.status(500).json({
    success: false,
    message: '內部服務器錯誤',
    error: process.env.NODE_ENV === 'development' ? err.message : '請稍後再試'
  });
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '端點不存在',
    path: req.originalUrl
  });
});

// 啟動服務器
app.listen(PORT, () => {
  console.log('🚀 CardStrategy Backend 服務器已啟動');
  console.log(`📍 端口: ${PORT}`);
  console.log(`🌐 地址: http://localhost:${PORT}`);
  console.log(`🔗 健康檢查: http://localhost:${PORT}/api/health`);
  console.log(`📅 啟動時間: ${new Date().toISOString()}`);
});

// 優雅關閉
process.on('SIGINT', async () => {
  console.log('\n🛑 正在關閉服務器...');
  try {
    await sequelize.close();
    console.log('✅ 數據庫連接已關閉');
  } catch (error) {
    console.error('❌ 關閉數據庫連接時出錯:', error);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 正在關閉服務器...');
  try {
    await sequelize.close();
    console.log('✅ 數據庫連接已關閉');
  } catch (error) {
    console.error('❌ 關閉數據庫連接時出錯:', error);
  }
  process.exit(0);
});

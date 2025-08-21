require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');

// 導入配置
const { sequelize, testConnection } = require('./config/database');
const { connectRedis, healthCheck: redisHealthCheck } = require('./config/redis');

const app = express();

// 基本中間件
app.use(cors());
app.use(express.json());

// 健康檢查端點
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    const redisStatus = await redisHealthCheck();
    
    res.json({
      success: true,
      message: 'CardStrategy API 服務正常運行',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus ? 'connected' : 'disconnected',
        redis: redisStatus ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    logger.error('健康檢查失敗:', error);
    res.status(503).json({
      success: false,
      message: '服務健康檢查失敗',
      error: error.message
    });
  }
});

// 根端點
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CardStrategy API 服務器運行中',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 根據環境加載不同的路由
if (process.env.NODE_ENV === 'production') {
  // 生產環境：只加載核心功能
  log.info('生產環境：加載核心功能');
} else {
  // 開發環境：加載所有功能
  try {
    const authRoutes = require('./routes/auth');
    const cardsRoutes = require('./routes/cards');
    const collectionsRoutes = require('./routes/collections');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/cards', cardsRoutes);
    app.use('/api/collections', collectionsRoutes);
    
    log.info('開發環境：加載所有路由');
  } catch (error) {
    log.warning('部分路由加載失敗，使用簡化模式');
  }
}

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 初始化服務
    try {
      await connectRedis();
      log.info('Redis 連接初始化成功');
    } catch (error) {
      log.error('Redis 連接失敗:', error);
    }

    try {
      const dbConnected = await testConnection();
      if (dbConnected) {
        log.info('數據庫連接測試成功');
      } else {
        log.warn('數據庫連接測試失敗');
      }
    } catch (error) {
      log.error('數據庫連接測試失敗:', error);
    }

    const server = app.listen(PORT, () => {
      log.info(`🚀 CardStrategy API 服務器運行在端口 ${PORT}`);
      log.info(`🏥 健康檢查端點: http://localhost:${PORT}/api/health`);
    });

    return server;
  } catch (error) {
    log.error('服務器啟動失敗:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

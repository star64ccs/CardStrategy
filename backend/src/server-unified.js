require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');

// ImportConfigure
const { sequelize, testConnection } = require('./config/database');
const {
  connectRedis,
  healthCheck: redisHealthCheck,
} = require('./config/redis');

const app = express();

// 基本中間件
app.use(cors());
app.use(express.json());

// 健康Check端點
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    const redisStatus = await redisHealthCheck();

    res.json({
      success: true,
      message: 'CardStrategy API Service正常運行',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus ? 'connected' : 'disconnected',
        redis: redisStatus ? 'connected' : 'disconnected',
      },
    });
  } catch (error) {
    logger.error('健康CheckFailed:', error);
    res.status(503).json({
      success: false,
      message: 'Service健康CheckFailed',
      error: error.message,
    });
  }
});

// Root端點
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CardStrategy API Server運行中',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root據環境加載不同的路由
if (process.env.NODE_ENV === 'production') {
  // 生產環境：只加載核心功能
  // eslint-disable-next-line no-console
  console.log.info('生產環境：加載核心功能');
} else {
  // On發環境：加載所有功能
  try {
    const authRoutes = require('./routes/auth');
    const cardsRoutes = require('./routes/cards');
    const collectionsRoutes = require('./routes/collections');

    app.use('/api/auth', authRoutes);
    app.use('/api/cards', cardsRoutes);
    app.use('/api/collections', collectionsRoutes);

    // eslint-disable-next-line no-console
    console.log.info('開發環境：加載所有路由');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log.warning('部分路由加載Failed，使用簡化模式');
  }
}

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // InitializeService
    try {
      await connectRedis();
      // eslint-disable-next-line no-console
      console.log.info('Redis ConnectInitializeSuccess');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log.error('Redis ConnectFailed:', error);
    }

    try {
      const dbConnected = await testConnection();
      if (dbConnected) {
        // eslint-disable-next-line no-console
        console.log.info('數據庫Connect測試Success');
      } else {
        // eslint-disable-next-line no-console
        console.log.warn('數據庫Connect測試Failed');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log.error('數據庫Connect測試Failed:', error);
    }

    const server = app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log.info(`🚀 CardStrategy API Server運行在端口 ${PORT}`);
      // eslint-disable-next-line no-console
      console.log.info(`🏥 健康檢查端點: http://localhost:${PORT}/api/health`);
    });

    return server;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log.error('Server啟動Failed:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

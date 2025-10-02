require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');

// ImportDatabaseConfigure
const { sequelize, testConnection } = require('./config/database');

// Import Redis Configure
const {
  connectRedis,
  healthCheck: redisHealthCheck,
} = require('./config/redis');

const app = express();

// 基本中間件
app.use(cors());
app.use(express.json());

// 簡單的健康Check端點
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

// DatabaseTest端點
app.get('/api/test/db', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    if (dbStatus) {
      res.json({
        success: true,
        message: '數據庫Connect正常',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        success: false,
        message: '數據庫ConnectFailed',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    logger.error('數據庫測試Failed:', error);
    res.status(500).json({
      success: false,
      message: '數據庫測試Failed',
      error: error.message,
    });
  }
});

// Redis Test端點
app.get('/api/test/redis', async (req, res) => {
  try {
    const redisStatus = await redisHealthCheck();
    if (redisStatus) {
      res.json({
        success: true,
        message: 'Redis Connect正常',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Redis ConnectFailed',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    logger.error('Redis 測試Failed:', error);
    res.status(500).json({
      success: false,
      message: 'Redis 測試Failed',
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
    endpoints: {
      health: '/api/health',
      testDb: '/api/test/db',
      testRedis: '/api/test/redis',
    },
  });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Initialize Redis Connect
    try {
      await connectRedis();
      logger.info('Redis ConnectInitializeSuccess');
    } catch (error) {
      logger.error('Redis ConnectFailed:', error);
      // 不阻止ServerStart，但RecordError
    }

    // TestDatabaseConnect
    try {
      const dbConnected = await testConnection();
      if (dbConnected) {
        logger.info('數據庫Connect測試Success');
      } else {
        logger.warn('數據庫Connect測試Failed');
      }
    } catch (error) {
      logger.error('數據庫Connect測試Failed:', error);
    }

    const server = app.listen(PORT, () => {
      logger.info(`🚀 CardStrategy API Server運行在端口 ${PORT}`);
      logger.info(`🏥 健康檢查端點: http://localhost:${PORT}/api/health`);
      logger.info(`🗄️ 數據庫測試端點: http://localhost:${PORT}/api/test/db`);
      logger.info(`📡 Redis 測試端點: http://localhost:${PORT}/api/test/redis`);
    });

    return server;
  } catch (error) {
    logger.error('Server啟動Failed:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

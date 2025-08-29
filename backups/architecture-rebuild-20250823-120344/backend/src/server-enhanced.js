require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');

// 導入數據庫配置
const { sequelize, testConnection } = require('./config/database');

// 導入 Redis 配置
const {
  connectRedis,
  healthCheck: redisHealthCheck,
} = require('./config/redis');

const app = express();

// 基本中間件
app.use(cors());
app.use(express.json());

// 簡單的健康檢查端點
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
        redis: redisStatus ? 'connected' : 'disconnected',
      },
    });
  } catch (error) {
    logger.error('健康檢查失敗:', error);
    res.status(503).json({
      success: false,
      message: '服務健康檢查失敗',
      error: error.message,
    });
  }
});

// 數據庫測試端點
app.get('/api/test/db', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    if (dbStatus) {
      res.json({
        success: true,
        message: '數據庫連接正常',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        success: false,
        message: '數據庫連接失敗',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    logger.error('數據庫測試失敗:', error);
    res.status(500).json({
      success: false,
      message: '數據庫測試失敗',
      error: error.message,
    });
  }
});

// Redis 測試端點
app.get('/api/test/redis', async (req, res) => {
  try {
    const redisStatus = await redisHealthCheck();
    if (redisStatus) {
      res.json({
        success: true,
        message: 'Redis 連接正常',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Redis 連接失敗',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    logger.error('Redis 測試失敗:', error);
    res.status(500).json({
      success: false,
      message: 'Redis 測試失敗',
      error: error.message,
    });
  }
});

// 根端點
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CardStrategy API 服務器運行中',
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
    // 初始化 Redis 連接
    try {
      await connectRedis();
      logger.info('Redis 連接初始化成功');
    } catch (error) {
      logger.error('Redis 連接失敗:', error);
      // 不阻止服務器啟動，但記錄錯誤
    }

    // 測試數據庫連接
    try {
      const dbConnected = await testConnection();
      if (dbConnected) {
        logger.info('數據庫連接測試成功');
      } else {
        logger.warn('數據庫連接測試失敗');
      }
    } catch (error) {
      logger.error('數據庫連接測試失敗:', error);
    }

    const server = app.listen(PORT, () => {
      logger.info(`🚀 CardStrategy API 服務器運行在端口 ${PORT}`);
      logger.info(`🏥 健康檢查端點: http://localhost:${PORT}/api/health`);
      logger.info(`🗄️ 數據庫測試端點: http://localhost:${PORT}/api/test/db`);
      logger.info(`📡 Redis 測試端點: http://localhost:${PORT}/api/test/redis`);
    });

    return server;
  } catch (error) {
    logger.error('服務器啟動失敗:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

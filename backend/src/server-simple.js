require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');

const app = express();

// 基本中間件
app.use(cors());
app.use(express.json());

// 簡單的健康檢查端點
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CardStrategy API 服務正常運行',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// 根端點
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CardStrategy API 服務器運行中',
    version: '1.0.0',
  });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      logger.info(`🚀 CardStrategy API 服務器運行在端口 ${PORT}`);
      logger.info(`🏥 健康檢查端點: http://localhost:${PORT}/api/health`);
    });

    return server;
  } catch (error) {
    logger.error('服務器啟動失敗:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

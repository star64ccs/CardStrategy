require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');

const app = express();

// 基本中間件
app.use(cors());
app.use(express.json());

// 簡單的健康Check端點
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CardStrategy API Service正常運行',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root端點
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CardStrategy API Server運行中',
    version: '1.0.0',
  });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      logger.info(`🚀 CardStrategy API Server運行在端口 ${PORT}`);
      logger.info(`🏥 健康檢查端點: http://localhost:${PORT}/api/health`);
    });

    return server;
  } catch (error) {
    logger.error('Server啟動Failed:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

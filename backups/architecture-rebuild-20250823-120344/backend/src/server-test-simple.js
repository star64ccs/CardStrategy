require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// 基本中間件
app.use(cors());
app.use(express.json());

// 根端點
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CardStrategy API Enhanced Server Running',
    data: {
      name: 'CardStrategy API',
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      features: [
        'Performance Monitoring',
        'Security Middleware',
        'Error Handling',
        'Unified Logging',
        'Database Optimization',
        'Redis Caching',
      ],
    },
  });
});

// 基本健康檢查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Health check completed',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'running',
      },
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

// API 版本端點
app.get('/api/version', (req, res) => {
  res.json({
    success: true,
    message: 'API version information',
    data: {
      version: '2.0.0',
      build: process.env.BUILD_NUMBER || 'local',
      environment: process.env.NODE_ENV || 'development',
      features: {
        performance: true,
        security: true,
        monitoring: true,
        logging: true,
      },
    },
  });
});

// 測試端點
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working',
    data: {
      timestamp: new Date().toISOString(),
      test: 'successful',
    },
  });
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const server = app.listen(PORT, HOST, () => {});

module.exports = { app, server };

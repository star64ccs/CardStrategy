require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// 基本中間件
app.use(cors());
app.use(express.json());

// 簡單的請求日誌中間件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

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
      phase: 'progressive-enhancement',
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
        database: 'not-connected',
        redis: 'not-connected',
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
        performance: 'planned',
        security: 'planned',
        monitoring: 'planned',
        logging: 'basic',
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
      phase: 'progressive-enhancement',
    },
  });
});

// 性能測試端點
app.get('/api/test/performance', async (req, res) => {
  const start = Date.now();

  // 模擬一些處理時間
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));

  const duration = Date.now() - start;

  res.json({
    success: true,
    message: 'Performance test completed',
    data: {
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      randomDelay: Math.random() * 1000,
    },
  });
});

// 錯誤測試端點
app.get('/api/test/error', (req, res, next) => {
  const { type = 'generic' } = req.query;

  switch (type) {
    case 'validation':
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: [{ field: 'email', message: 'Invalid email format' }],
        timestamp: new Date().toISOString(),
      });
    case 'auth':
      return res.status(401).json({
        success: false,
        message: 'Authentication Error',
        timestamp: new Date().toISOString(),
      });
    case 'notfound':
      return res.status(404).json({
        success: false,
        message: 'Resource Not Found',
        timestamp: new Date().toISOString(),
      });
    default:
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        timestamp: new Date().toISOString(),
      });
  }
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    timestamp: new Date().toISOString(),
  });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const server = app.listen(PORT, HOST, () => {
  console.log(
    `🚀 CardStrategy Progressive Enhanced Server running on http://${HOST}:${PORT}`
  );
  console.log(`🏥 Health check: http://${HOST}:${PORT}/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(
    `📊 Performance test: http://${HOST}:${PORT}/api/test/performance`
  );
  console.log(`🧪 Error test: http://${HOST}:${PORT}/api/test/error`);
});

module.exports = { app, server };

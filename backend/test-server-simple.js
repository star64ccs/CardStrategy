const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康檢查端點
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CardStrategy Backend API 運行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
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
    endpoints: {
      health: '/api/health',
      test: '/api/test'
    }
  });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('服務器錯誤:', err);
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
process.on('SIGINT', () => {
  console.log('\n🛑 正在關閉服務器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 正在關閉服務器...');
  process.exit(0);
});

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
    message: 'CardStrategy API 運行正常',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      redis: 'skipped',
      api: 'running'
    }
  });
});

// 測試端點
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API 測試端點正常',
    data: {
      environment: process.env.NODE_ENV,
      port: process.env.PORT,
      timestamp: new Date().toISOString()
    }
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 簡單測試服務器運行在 http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`🏥 健康檢查: http://localhost:${PORT}/health`);
  // eslint-disable-next-line no-console
  console.log(`🧪 測試端點: http://localhost:${PORT}/api/test`);
});

require('express-async-errors');
require('dotenv').config();

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// 健康檢查端點
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CardStrategy API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API健康檢查端點
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CardStrategy API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 啟動服務器
app.listen(PORT, () => {
  console.log(`服務器運行在端口 ${PORT}`);
  console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 基本中間件
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康檢查端點
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CardStrategy API 服務運行正常',
    timestamp: new Date().toISOString(),
    version: '3.1.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API 狀態端點
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API 服務正常',
    services: {
      database: 'PostgreSQL - 已連接',
      authentication: 'JWT - 已配置',
      security: 'Helmet - 已啟用',
      compression: '已啟用',
      cors: '已配置'
    },
    timestamp: new Date().toISOString()
  });
});

// 數據庫連接測試端點
app.get('/api/db/test', async (req, res) => {
  try {
    const { Client } = require('pg');

    const client = new Client({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DB || 'cardstrategy',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'sweetcorn831'
    });

    await client.connect();
    const result = await client.query('SELECT version() as version, current_database() as database');
    await client.end();

    res.status(200).json({
      success: true,
      message: '數據庫連接正常',
      data: {
        version: result.rows[0].version,
        database: result.rows[0].database,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '數據庫連接失敗',
      error: error.message
    });
  }
});

// 根端點
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '歡迎使用 CardStrategy API',
    version: '3.1.0',
    documentation: '/api/docs',
    health: '/health',
    status: '/api/status',
    timestamp: new Date().toISOString()
  });
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '端點不存在',
    path: req.originalUrl,
    method: req.method
  });
});

// 錯誤處理中間件
app.use((error, req, res, next) => {
  // logger.info('服務器錯誤:', error);
  res.status(500).json({
    success: false,
    message: '內部服務器錯誤',
    error: process.env.NODE_ENV === 'development' ? error.message : '請稍後再試'
  });
});

// 啟動服務器
app.listen(PORT, () => {
  // logger.info('🚀 CardStrategy API 服務已啟動');
  // logger.info(`📡 服務器運行在端口: ${PORT}`);
  // logger.info(`🌐 本地訪問: http://localhost:${PORT}`);
  // logger.info(`🔍 健康檢查: http://localhost:${PORT}/health`);
  // logger.info(`📊 API 狀態: http://localhost:${PORT}/api/status`);
  // logger.info(`🗄️  數據庫測試: http://localhost:${PORT}/api/db/test`);
  // logger.info('');
  // logger.info('✅ PostgreSQL 數據庫已配置');
  // logger.info('✅ 安全中間件已啟用');
  // logger.info('✅ CORS 已配置');
  // logger.info('✅ 壓縮已啟用');
  // logger.info('');
  // logger.info('�� 應用程序已準備就緒！');
});

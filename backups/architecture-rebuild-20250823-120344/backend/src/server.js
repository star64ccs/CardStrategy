require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

// 導入性能優化中間件
const performanceMiddleware = require('./middleware/performance');
const databaseOptimizer = require('./services/databaseOptimizer');

// 導入安全中間件
const {
  securityMiddleware,
  securityHeaders,
  inputValidation,
  sessionSecurity,
  fileUploadSecurity,
} = require('./middleware/security');

// 導入路由
const authRoutes = require('./routes/auth');
const cardRoutes = require('./routes/cards');
const marketDataRoutes = require('./routes/market');
const investmentRoutes = require('./routes/investments');
const gradingRoutes = require('./routes/simulatedGrading');
const aiRoutes = require('./routes/ai');
const deepLearningRoutes = require('./routes/deepLearning');
const performanceRoutes = require('./routes/performance');
const dataExportRoutes = require('./routes/dataExport');
const batchRoutes = require('./routes/batch');

// 導入高級功能服務
const websocketService = require('./services/websocketService');
const notificationService = require('./services/notificationService');
const batchOperationService = require('./services/batchOperationService');

// 導入監控告警服務
const alertService = require('./services/alertService');
const monitoringService = require('./services/monitoringService');

// 導入數據庫配置
const {
  sequelize,
  testConnection,
  syncDatabase,
} = require('./config/database');

// 導入 Redis 配置
const {
  connectRedis,
  healthCheck: redisHealthCheck,
} = require('./config/redis');

const app = express();

// 應用安全中間件
securityMiddleware(app);

// 安全標頭
app.use(securityHeaders);

// 輸入驗證
app.use(inputValidation);

// 會話安全
app.use(sessionSecurity);

// 文件上傳安全
app.use(fileUploadSecurity);

// 壓縮中間件
app.use(compression());

// 性能監控中間件
app.use(performanceMiddleware.responseTimeMonitor());
app.use(performanceMiddleware.memoryMonitor());
app.use(performanceMiddleware.queryOptimizer());
app.use(performanceMiddleware.dbPoolMonitor());

// 緩存中間件
app.use('/api/cards', performanceMiddleware.cache(300));
app.use('/api/market-data', performanceMiddleware.cache(60));
app.use('/api/investments', performanceMiddleware.cache(180));

// 速率限制
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100, // 限制每個 IP 100 個請求
  message: {
    success: false,
    message: '請求過於頻繁，請稍後再試',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 5, // 限制每個 IP 5 個請求
  message: {
    success: false,
    message: '操作過於頻繁，請稍後再試',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 應用速率限制
app.use('/api/', generalLimiter);
app.use('/api/auth/', strictLimiter);
app.use('/api/ai/', strictLimiter);

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/market-data', marketDataRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/grading', gradingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/deep-learning', deepLearningRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/export', dataExportRoutes);
app.use('/api/batch', batchRoutes);

// 導入監控告警路由
const alertRoutes = require('./routes/alerts');
const feedbackRoutes = require('./routes/feedback');
const monitoringRoutes = require('./routes/monitoring');

app.use('/api/monitoring', monitoringRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/feedback', feedbackRoutes);

// 版本信息端點
app.get('/api/version', (req, res) => {
  res.json({
    success: true,
    data: {
      version: '1.0.0',
      name: 'CardStrategy API',
      environment: process.env.NODE_ENV || 'development',
      features: {
        authentication: true,
        cardManagement: true,
        marketData: true,
        investments: true,
        grading: true,
        ai: true,
        deepLearning: true,
        modelPersistence: true,
        performanceOptimization: true,
        securityEnhancement: true,
        advancedFeatures: true,
        monitoringAndTesting: true,
      },
      timestamp: new Date().toISOString(),
    },
  });
});

// 健康檢查端點
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    const memoryUsage = process.memoryUsage();

    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        services: {
          database: dbStatus ? 'connected' : 'disconnected',
          redis: (await redisHealthCheck()) ? 'connected' : 'disconnected',
          memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            external: Math.round(memoryUsage.external / 1024 / 1024),
          },
        },
      },
    });
  } catch (error) {
    logger.error('健康檢查失敗:', error);
    res.status(503).json({
      success: false,
      message: '服務不可用',
      code: 'SERVICE_UNAVAILABLE',
    });
  }
});

// 數據庫健康檢查端點
app.get('/api/health/db', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    const dbStats = await databaseOptimizer.getQueryStatsReport();

    res.json({
      success: true,
      data: {
        status: dbStatus ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: dbStatus,
          stats: dbStats,
        },
      },
    });
  } catch (error) {
    logger.error('數據庫健康檢查失敗:', error);
    res.status(503).json({
      success: false,
      message: '數據庫不可用',
      code: 'DATABASE_UNAVAILABLE',
    });
  }
});

// 全局錯誤處理
app.use((err, req, res, next) => { // eslint-disable-next-line no-unused-vars
  logger.error('全局錯誤:', err);

  // 處理特定錯誤類型
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      message: '數據庫連接失敗',
      code: 'DATABASE_CONNECTION_ERROR',
    });
  }

  if (err.name === 'SequelizeTimeoutError') {
    return res.status(408).json({
      success: false,
      message: '數據庫操作超時',
      code: 'DATABASE_TIMEOUT',
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: '數據驗證失敗',
      code: 'VALIDATION_ERROR',
      errors: err.errors,
    });
  }

  if (err.code === 'ENOMEM') {
    logger.error('內存不足錯誤:', err);
    return res.status(503).json({
      success: false,
      message: '系統資源不足',
      code: 'INSUFFICIENT_MEMORY',
    });
  }

  // TensorFlow.js 錯誤處理
  if (err.message && err.message.includes('TensorFlow')) {
    logger.error('TensorFlow 錯誤:', err);
    return res.status(500).json({
      success: false,
      message: 'AI 模型處理失敗',
      code: 'AI_MODEL_ERROR',
    });
  }

  // 默認錯誤響應
  res.status(500).json({
    success: false,
    message: '內部服務器錯誤',
    code: 'INTERNAL_SERVER_ERROR',
  });
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '請求的端點不存在',
    code: 'ENDPOINT_NOT_FOUND',
  });
});

// 優雅關閉
const gracefulShutdown = async (signal) => {
  logger.info(`收到 ${signal} 信號，開始優雅關閉...`);

  try {
    // 關閉高級功能服務
    try {
      await websocketService.close();
      logger.info('WebSocket 服務已關閉');
    } catch (error) {
      logger.error('關閉 WebSocket 服務失敗:', error);
    }

    try {
      await batchOperationService.close();
      logger.info('批量操作服務已關閉');
    } catch (error) {
      logger.error('關閉批量操作服務失敗:', error);
    }

    // 關閉監控告警服務
    try {
      await monitoringService.stopPeriodicMonitoring();
      logger.info('監控服務已關閉');
    } catch (error) {
      logger.error('關閉監控服務失敗:', error);
    }

    // 關閉數據庫連接
    await sequelize.close();
    logger.info('數據庫連接已關閉');

    // 清理性能監控緩存
    performanceMiddleware.clearCache();
    logger.info('性能監控緩存已清理');

    // 清理深度學習資源
    if (global.deepLearningService) {
      await global.deepLearningService.cleanup();
      logger.info('深度學習資源已清理');
    }

    logger.info('優雅關閉完成');
    process.exit(0);
  } catch (error) {
    logger.error('優雅關閉失敗:', error);
    process.exit(1);
  }
};

// 監聽關閉信號
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 處理未捕獲的異常
process.on('uncaughtException', (err) => {
  logger.error('未捕獲的異常:', err);
  gracefulShutdown('uncaughtException');
});

// 處理未處理的 Promise 拒絕
process.on('unhandledRejection', (reason, promise) => {
  logger.error('未處理的 Promise 拒絕:', reason);
  gracefulShutdown('unhandledRejection');
});

// 設置 sequelize 實例供中間件使用
app.set('sequelize', sequelize);

const PORT = process.env.PORT || 5000;

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
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('無法連接到數據庫');
      process.exit(1);
    }

    // 同步數據庫
    await syncDatabase();
    logger.info('數據庫同步完成');

    // 啟動服務器
    const server = app.listen(PORT, () => {
      logger.info(`🚀 CardStrategy API 服務器運行在端口 ${PORT}`);
      logger.info(`📊 性能監控端點: http://localhost:${PORT}/api/performance`);
      logger.info(`🏥 健康檢查端點: http://localhost:${PORT}/api/health`);
      logger.info('🔒 安全增強已啟用');
      logger.info('⚡ 性能優化已啟用');
      logger.info('🤖 AI 功能已啟用');
      logger.info('🧠 深度學習模型已啟用');
      logger.info('💾 模型持久化已啟用');
      logger.info('📊 監控告警已啟用');
    });

    // 初始化高級功能服務
    try {
      // 初始化 WebSocket 服務
      websocketService.initialize(server);
      logger.info('🔌 WebSocket 服務已初始化');

      // 初始化通知服務
      await notificationService.initialize();
      logger.info('📢 通知服務已初始化');

      // 初始化批量操作服務
      await batchOperationService.initialize();
      logger.info('⚙️ 批量操作服務已初始化');

      // 初始化監控告警服務
      await alertService.initialize();
      logger.info('🚨 警報服務已初始化');

      await monitoringService.initialize();
      monitoringService.startPeriodicMonitoring();
      logger.info('📊 監控服務已初始化');

      logger.info('🚀 高級功能已啟用');
    } catch (error) {
      logger.error('高級功能初始化失敗:', error);
      // 不阻止服務器啟動，但記錄錯誤
    }

    return server;
  } catch (error) {
    logger.error('服務器啟動失敗:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

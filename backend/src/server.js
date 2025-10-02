require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

// Import性能優化中間件
const performanceMiddleware = require('./middleware/performance');
const databaseOptimizer = require('./services/databaseOptimizer');

// Import安全中間件
const {
  securityMiddleware,
  securityHeaders,
  inputValidation,
  sessionSecurity,
  fileUploadSecurity,
} = require('./middleware/security');

// Import路由
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

// Import高級功能Service
const websocketService = require('./services/websocketService');
const notificationService = require('./services/notificationService');
const batchOperationService = require('./services/batchOperationService');

// ImportMonitor告警Service
const alertService = require('./services/alertService');
const monitoringService = require('./services/monitoringService');

// ImportDatabaseConfigure
const {
  sequelize,
  testConnection,
  syncDatabase,
} = require('./config/database');

// Import Redis Configure
const {
  connectRedis,
  healthCheck: redisHealthCheck,
} = require('./config/redis');

const app = express();

// Apply安全中間件
securityMiddleware(app);

// 安全標頭
app.use(securityHeaders);

// InputVerify
app.use(inputValidation);

// 會話安全
app.use(sessionSecurity);

// FileUpload安全
app.use(fileUploadSecurity);

// 壓縮中間件
app.use(compression());

// 性能Monitor中間件
app.use(performanceMiddleware.responseTimeMonitor());
app.use(performanceMiddleware.memoryMonitor());
app.use(performanceMiddleware.queryOptimizer());
app.use(performanceMiddleware.dbPoolMonitor());

// Cache中間件
app.use('/api/cards', performanceMiddleware.cache(300));
app.use('/api/market-data', performanceMiddleware.cache(60));
app.use('/api/investments', performanceMiddleware.cache(180));

// 速率Limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minute
  max: 100, // Limit每個 IP 100 個Request
  message: {
    success: false,
    message: '請求過於頻繁，請稍後再試',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minute
  max: 5, // Limit每個 IP 5 個Request
  message: {
    success: false,
    message: '操作過於頻繁，請稍後再試',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply速率Limit
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

// ImportMonitor告警路由
const alertRoutes = require('./routes/alerts');
const feedbackRoutes = require('./routes/feedback');
const monitoringRoutes = require('./routes/monitoring');

app.use('/api/monitoring', monitoringRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/feedback', feedbackRoutes);

// VersionInformation端點
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

// 健康Check端點
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
    logger.error('健康CheckFailed:', error);
    res.status(503).json({
      success: false,
      message: 'Service不可用',
      code: 'SERVICE_UNAVAILABLE',
    });
  }
});

// Database健康Check端點
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
    logger.error('數據庫健康CheckFailed:', error);
    res.status(503).json({
      success: false,
      message: '數據庫不可用',
      code: 'DATABASE_UNAVAILABLE',
    });
  }
});

// GlobalErrorHandle
app.use((err, req, res, next) => { // eslint-disable-next-line no-unused-vars
  logger.error('全局Error:', err);

  // HandleSpecificErrorClass型
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      message: '數據庫ConnectFailed',
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
      message: '數據VerifyFailed',
      code: 'VALIDATION_ERROR',
      errors: err.errors,
    });
  }

  if (err.code === 'ENOMEM') {
    logger.error('內存不足Error:', err);
    return res.status(503).json({
      success: false,
      message: '系統資源不足',
      code: 'INSUFFICIENT_MEMORY',
    });
  }

  // TensorFlow.js ErrorHandle
  if (err.message && err.message.includes('TensorFlow')) {
    logger.error('TensorFlow Error:', err);
    return res.status(500).json({
      success: false,
      message: 'AI 模型HandleFailed',
      code: 'AI_MODEL_ERROR',
    });
  }

  // DefaultErrorResponse
  res.status(500).json({
    success: false,
    message: '內部ServerError',
    code: 'INTERNAL_SERVER_ERROR',
  });
});

// 404 Handle
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '請求的端點不存在',
    code: 'ENDPOINT_NOT_FOUND',
  });
});

// 優雅Off閉
const gracefulShutdown = async (signal) => {
  logger.info(`收到 ${signal} 信號，開始優雅關閉...`);

  try {
    // Off閉高級功能Service
    try {
      await websocketService.close();
      logger.info('WebSocket Service已關閉');
    } catch (error) {
      logger.error('關閉 WebSocket ServiceFailed:', error);
    }

    try {
      await batchOperationService.close();
      logger.info('批量操作Service已關閉');
    } catch (error) {
      logger.error('關閉批量操作ServiceFailed:', error);
    }

    // Off閉Monitor告警Service
    try {
      await monitoringService.stopPeriodicMonitoring();
      logger.info('監控Service已關閉');
    } catch (error) {
      logger.error('關閉監控ServiceFailed:', error);
    }

    // Off閉DatabaseConnect
    await sequelize.close();
    logger.info('數據庫Connect已關閉');

    // 清理性能MonitorCache
    performanceMiddleware.clearCache();
    logger.info('性能監控緩存已清理');

    // 清理深度學習Resource
    if (global.deepLearningService) {
      await global.deepLearningService.cleanup();
      logger.info('深度學習資源已清理');
    }

    logger.info('優雅關閉完成');
    process.exit(0);
  } catch (error) {
    logger.error('優雅關閉Failed:', error);
    process.exit(1);
  }
};

// 監聽Off閉信號
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle未Catch的異常
process.on('uncaughtException', (err) => {
  logger.error('未捕獲的異常:', err);
  gracefulShutdown('uncaughtException');
});

// Handle未Handle的 Promise Reject
process.on('unhandledRejection', (reason, promise) => {
  logger.error('未處理的 Promise 拒絕:', reason);
  gracefulShutdown('unhandledRejection');
});

// Settings sequelize Instance供中間件使用
app.set('sequelize', sequelize);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize Redis Connect
    try {
      await connectRedis();
      logger.info('Redis ConnectInitializeSuccess');
    } catch (error) {
      logger.error('Redis ConnectFailed:', error);
      // 不阻止ServerStart，但RecordError
    }

    // TestDatabaseConnect
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('無法Connect到數據庫');
      process.exit(1);
    }

    // SyncDatabase
    await syncDatabase();
    logger.info('數據庫同步完成');

    // StartServer
    const server = app.listen(PORT, () => {
      logger.info(`🚀 CardStrategy API Server運行在端口 ${PORT}`);
      logger.info(`📊 性能監控端點: http://localhost:${PORT}/api/performance`);
      logger.info(`🏥 健康檢查端點: http://localhost:${PORT}/api/health`);
      logger.info('🔒 安全增強已啟用');
      logger.info('⚡ 性能優化已啟用');
      logger.info('🤖 AI 功能已啟用');
      logger.info('🧠 深度學習模型已啟用');
      logger.info('💾 模型持久化已啟用');
      logger.info('📊 監控告警已啟用');
    });

    // Initialize高級功能Service
    try {
      // Initialize WebSocket Service
      websocketService.initialize(server);
      logger.info('🔌 WebSocket Service已Initialize');

      // InitializeNotificationService
      await notificationService.initialize();
      logger.info('📢 通知Service已Initialize');

      // InitializeBatchOperationService
      await batchOperationService.initialize();
      logger.info('⚙️ 批量操作Service已Initialize');

      // InitializeMonitor告警Service
      await alertService.initialize();
      logger.info('🚨 警報Service已Initialize');

      await monitoringService.initialize();
      monitoringService.startPeriodicMonitoring();
      logger.info('📊 監控Service已Initialize');

      logger.info('🚀 高級功能已啟用');
    } catch (error) {
      logger.error('高級功能InitializeFailed:', error);
      // 不阻止ServerStart，但RecordError
    }

    return server;
  } catch (error) {
    logger.error('Server啟動Failed:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

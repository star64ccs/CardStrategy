require('dotenv').config();
const express = require('express');
const cors = require('cors');

// ImportConfigure
const { config, validateConfig } = require('./config/unified');
const { sequelize, testConnection } = require('./config/database-optimized');
const {
  connectRedis,
  healthCheck: redisHealthCheck,
} = require('./config/redis-skip');

// ImportLog系統
const { logger } = require('./utils/unified-logger');

// Import性能Monitor
const { performanceMiddleware } = require('./utils/performance-monitor');

// Import安全中間件
const {
  securityHeaders,
  corsOptions,
  inputValidation,
  requestLogger,
  errorHandler,
  notFoundHandler,
} = require('./middleware/security');

// ImportAuthenticate中間件
const {
  authenticateToken,
  requireAdmin,
  requireUser,
} = require('./middleware/auth');

// ImportErrorHandle
const {
  setupProcessErrorHandling,
  setupGracefulShutdown,
} = require('./utils/error-handler');

// ImportErrorMonitor
const { errorMonitoringMiddleware } = require('./utils/error-monitor');

// ImportResponseTool
const { successResponse } = require('./utils/response-utils');

// Import路由
const performanceRoutes = require('./routes/performance');
const fakeCardRoutes = require('./routes/fakeCard');
const fakeCardTrainingRoutes = require('./routes/fakeCardTraining');

const app = express();

// VerifyConfigure
try {
  validateConfig();
  logger.info('Configuration validated successfully');
} catch (error) {
  logger.error('Configuration validation failed:', error);
  process.exit(1);
}

// SettingsProcessErrorHandle
setupProcessErrorHandling();

// 安全中間件
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(inputValidation);
app.use(requestLogger);

// 性能Monitor中間件
app.use(performanceMiddleware);

// ErrorMonitor中間件
app.use(errorMonitoringMiddleware);

// 基本中間件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root端點
app.get('/', (req, res) => {
  successResponse(
    res,
    {
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
    'CardStrategy API Enhanced Server Running'
  );
});

// 基本健康Check
app.get('/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    const redisStatus = await redisHealthCheck();

    const healthData = {
      status: dbStatus && redisStatus ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus ? 'connected' : 'disconnected',
        redis: redisStatus ? 'connected' : 'disconnected',
      },
      environment: process.env.NODE_ENV || 'development',
    };

    const statusCode = healthData.status === 'healthy' ? 200 : 503;
    successResponse(res, healthData, 'Health check completed', statusCode);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// API Version端點
app.get('/api/version', (req, res) => {
  successResponse(
    res,
    {
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
    'API version information'
  );
});

// 性能指標路由
app.use('/api/performance', performanceRoutes);

// False卡相Off路由
app.use('/api/fake-card', fakeCardRoutes);
app.use('/api/fake-card-training', fakeCardTrainingRoutes);

// Manage員端點 (需要Authenticate)
app.get('/api/admin/status', authenticateToken, requireAdmin, (req, res) => {
  successResponse(
    res,
    {
      user: req.user,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
      },
      timestamp: new Date().toISOString(),
    },
    'Admin status retrieved successfully'
  );
});

// User端點 (需要Authenticate)
app.get('/api/user/profile', authenticateToken, requireUser, (req, res) => {
  successResponse(
    res,
    {
      user: req.user,
      permissions:
        req.user.role === 'admin'
          ? ['read', 'write', 'admin']
          : ['read', 'write'],
      timestamp: new Date().toISOString(),
    },
    'User profile retrieved successfully'
  );
});

// Test端點 (On發環境)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/test/error', (req, res, next) => {
    const { type = 'generic' } = req.query;

    switch (type) {
      case 'validation':
        const { ValidationError } = require('./utils/custom-errors');
        next(
          new ValidationError('Test validation error', [
            { field: 'email', message: 'Invalid email format' },
          ])
        );
        break;
      case 'auth':
        const { AuthenticationError } = require('./utils/custom-errors');
        next(new AuthenticationError('Test authentication error'));
        break;
      case 'notfound':
        const { NotFoundError } = require('./utils/custom-errors');
        next(new NotFoundError('Test Resource'));
        break;
      default:
        next(new Error('Test generic error'));
    }
  });

  app.get('/api/test/performance', async (req, res) => {
    // 模擬一些HandleTime
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
    successResponse(res, {
      message: 'Performance test completed',
      randomDelay: Math.random() * 1000,
    });
  });
}

// 404 Handle
app.use(notFoundHandler);

// 統一ErrorHandle
app.use(errorHandler);

const PORT = config.app.port;
const HOST = config.app.host;

const startServer = async () => {
  try {
    // InitializeService
    logger.info('Starting CardStrategy Enhanced Server...');

    // Connect Redis
    try {
      await connectRedis();
      logger.info('Redis connection established');
    } catch (error) {
      logger.error('Redis connection failed:', error);
    }

    // TestDatabaseConnect
    try {
      const dbConnected = await testConnection();
      if (dbConnected) {
        logger.info('Database connection established');
      } else {
        logger.warn('Database connection failed');
      }
    } catch (error) {
      logger.error('Database connection test failed:', error);
    }

    // StartServer
    const server = app.listen(PORT, HOST, () => {
      logger.info(
        `🚀 CardStrategy Enhanced Server running on http://${HOST}:${PORT}`
      );
      logger.info(`🏥 Health check: http://${HOST}:${PORT}/health`);
      logger.info(
        `📊 Performance metrics: http://${HOST}:${PORT}/api/performance/metrics`
      );
      logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Settings優雅Off閉
    setupGracefulShutdown(server);

    return server;
  } catch (error) {
    logger.error('Server startup failed:', error);
    process.exit(1);
  }
};

// StartServer
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };

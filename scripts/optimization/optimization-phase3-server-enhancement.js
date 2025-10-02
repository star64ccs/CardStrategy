#!/usr/bin/env node

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');

// 顏色Output
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const log = {
  info: (msg) => {
    /* */
  },
  success: (msg) => {
    /* */
  },
  warning: (msg) => {
    /* */
  },
  error: (msg) => {
    /* */
  },
  header: (msg) => {
    /* */
  },
};

class Phase3ServerEnhancementOptimizer {
  constructor() {
    this.projectRoot = process.cwd();
    this.backendDir = path.join(this.projectRoot, 'backend');
  }

  // Create增強版Server
  async createEnhancedServer() {
    log.header('🚀 Create增強版Server');

    const enhancedServer = `require('dotenv').config();
const express = require('express');
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const cors = require('cors');

// ImportConfigure
const { config, validateConfig } = require('./config/unified');
const { sequelize, testConnection } = require('./config/database-optimized');
const { connectRedis, healthCheck: redisHealthCheck } = require('./config/redis-optimized');

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
  notFoundHandler
} = require('./middleware/security');

// ImportAuthenticate中間件
const { authenticateToken, requireAdmin, requireUser } = require('./middleware/auth');

// ImportErrorHandle
const { 
  setupProcessErrorHandling, 
  setupGracefulShutdown 
} = require('./utils/error-handler');

// ImportErrorMonitor
const { errorMonitoringMiddleware } = require('./utils/error-monitor');

// ImportResponseTool
const { successResponse } = require('./utils/response-utils');

// Import路由
const performanceRoutes = require('./routes/performance');

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
  successResponse(res, {
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
      'Redis Caching'
    ]
  }, 'CardStrategy API Enhanced Server Running');
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
        redis: redisStatus ? 'connected' : 'disconnected'
      },
      environment: process.env.NODE_ENV || 'development'
    };

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const statusCode = healthData.status === 'healthy' ? 200 : 503;
    successResponse(res, healthData, 'Health check completed', statusCode);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Version端點
app.get('/api/version', (req, res) => {
  successResponse(res, {
    version: '2.0.0',
    build: process.env.BUILD_NUMBER || 'local',
    environment: process.env.NODE_ENV || 'development',
    features: {
      performance: true,
      security: true,
      monitoring: true,
      logging: true
    }
  }, 'API version information');
});

// 性能指標路由
app.use('/api/performance', performanceRoutes);

// Manage員端點 (需要Authenticate)
app.get('/api/admin/status', authenticateToken, requireAdmin, (req, res) => {
  successResponse(res, {
    user: req.user,
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform
    },
    timestamp: new Date().toISOString()
  }, 'Admin status retrieved successfully');
});

// User端點 (需要Authenticate)
app.get('/api/user/profile', authenticateToken, requireUser, (req, res) => {
  successResponse(res, {
    user: req.user,
    permissions: req.user.role === 'admin' ? ['read', 'write', 'admin'] : ['read', 'write'],
    timestamp: new Date().toISOString()
  }, 'User profile retrieved successfully');
});

// Test端點 (On發環境)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/test/error', (req, res, next) => {
    const { type = 'generic' } = req.query;
    
    switch (type) {
      case 'validation':
        const { ValidationError } = require('./utils/custom-errors');
        next(new ValidationError('Test validation error', [
          { field: 'email', message: 'Invalid email format' }
        ]));
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
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    successResponse(res, {
      message: 'Performance test completed',
      randomDelay: Math.random() * 1000
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
      logger.info(\`🚀 CardStrategy Enhanced Server running on http://\${HOST}:\${PORT}\`);
      logger.info(\`🏥 Health check: http://\${HOST}:\${PORT}/health\`);
      logger.info(\`📊 Performance metrics: http://\${HOST}:\${PORT}/api/performance/metrics\`);
      logger.info(\`🔧 Environment: \${process.env.NODE_ENV || 'development'}\`);
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
`;

    const serverPath = path.join(this.backendDir, 'src/server-enhanced-v2.js');
    fs.writeFileSync(serverPath, enhancedServer);
    log.success('增強版Server已Create');
  }

  // Update package.json
  async updatePackageJson() {
    log.header('📦 更新 package.json');

    const packagePath = path.join(this.backendDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // UpdateStart腳本
    packageJson.scripts.start = 'node src/server-enhanced-v2.js';
    packageJson.scripts['start:enhanced'] = 'node src/server-enhanced-v2.js';
    packageJson.scripts['dev:enhanced'] = 'nodemon src/server-enhanced-v2.js';

    // Add必要的依賴
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const requiredDeps = {
      'express-rate-limit': '^7.1.5',
      helmet: '^7.1.0',
      bcrypt: '^5.1.1',
      jsonwebtoken: '^9.0.2',
      winston: '^3.11.0',
      ioredis: '^5.3.2',
      sequelize: '^6.35.2',
      pg: '^8.11.3',
    };

    // Check並Add缺失的依賴
    for (const [dep, version] of Object.entries(requiredDeps)) {
      if (!packageJson.dependencies[dep]) {
        packageJson.dependencies[dep] = version;
        log.info(`添加依賴: ${dep}@${version}`);
      }
    }

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    log.success('package.json 已更新');
  }

  // 執Row所有優化
  async run() {
    log.header('🚀 開始第三階段Server增強優化');

    try {
      await this.createEnhancedServer();
      await this.updatePackageJson();

      log.header('🎉 第三階段Server增強優化完成！');
      log.success('增強版Server已Create完成');
    } catch (error) {
      log.error(`優化過程中發生Error: ${error.message}`);
      process.exit(1);
    }
  }
}

// 執Row優化
if (require.main === module) {
  const optimizer = new Phase3ServerEnhancementOptimizer();
  optimizer.run();
}

module.exports = Phase3ServerEnhancementOptimizer;

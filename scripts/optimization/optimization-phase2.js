#!/usr/bin/env node

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

class Phase2Optimizer {
  constructor() {
    this.projectRoot = process.cwd();
    this.backendDir = path.join(this.projectRoot, 'backend');
    this.srcDir = path.join(this.projectRoot, 'src');
  }

  // 1. 整合ServerFile
  async consolidateServerFiles() {
    log.header('🔧 整合Server文件');

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const serverFiles = [
      'src/server.js',
      'src/server-simple.js',
      'src/server-enhanced.js',
      'src/server-minimal.js',
      'server-fixed.js',
      'server-minimal.js',
    ];

    // Create統一的ServerConfigure
    const unifiedServer = `require('dotenv').config();
const express = require('express');
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const cors = require('cors');
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const logger = require('./utils/logger');

// ImportConfigure
const { sequelize, testConnection } = require('./config/database');
const { connectRedis, healthCheck: redisHealthCheck } = require('./config/redis');

const app = express();

// 基本中間件
app.use(cors());
app.use(express.json());

// 健康Check端點
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    const redisStatus = await redisHealthCheck();
    
    res.json({
      success: true,
      message: 'CardStrategy API Service正常運行',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus ? 'connected' : 'disconnected',
        redis: redisStatus ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    logger.error('健康CheckFailed:', error);
    res.status(503).json({
      success: false,
      message: 'Service健康CheckFailed',
      error: error.message
    });
  }
});

// Root端點
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CardStrategy API Server運行中',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root據環境加載不同的路由
if (process.env.NODE_ENV === 'production') {
  // 生產環境：只加載核心功能
  log.info('生產環境：加載核心功能');
} else {
  // On發環境：加載所有功能
  try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const authRoutes = require('./routes/auth');
    const cardsRoutes = require('./routes/cards');
    const collectionsRoutes = require('./routes/collections');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/cards', cardsRoutes);
    app.use('/api/collections', collectionsRoutes);
    
    log.info('開發環境：加載所有路由');
  } catch (error) {
    log.warning('部分路由加載Failed，使用簡化模式');
  }
}

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // InitializeService
    try {
      await connectRedis();
      log.info('Redis ConnectInitializeSuccess');
    } catch (error) {
      log.error('Redis ConnectFailed:', error);
    }

    try {
      const dbConnected = await testConnection();
      if (dbConnected) {
        log.info('數據庫Connect測試Success');
      } else {
        log.warn('數據庫Connect測試Failed');
      }
    } catch (error) {
      log.error('數據庫Connect測試Failed:', error);
    }

    const server = app.listen(PORT, () => {
      log.info(\`🚀 CardStrategy API Server運行在端口 \${PORT}\`);
      log.info(\`🏥 健康檢查端點: http://localhost:\${PORT}/api/health\`);
    });

    return server;
  } catch (error) {
    log.error('Server啟動Failed:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
`;

    const serverPath = path.join(this.backendDir, 'src/server-unified.js');
    fs.writeFileSync(serverPath, unifiedServer);
    log.success('統一Server文件已Create');

    // Update package.json
    const packagePath = path.join(this.backendDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    packageJson.scripts.start = 'node src/server-unified.js';
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    log.success('package.json 已更新');
  }

  // 2. Create統一Configure系統
  async createUnifiedConfig() {
    log.header('⚙️ 創建統一配置系統');

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const configContent = `const path = require('path');

// 環境Configure
const env = process.env.NODE_ENV || 'development';

// 基礎Configure
const baseConfig = {
  app: {
    name: 'CardStrategy',
    version: '1.0.0',
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'cardstrategy',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    dialect: 'postgres',
// eslint-disable-next-line no-console
    logging: env === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: process.env.REDIS_DB || 0,
    keyPrefix: 'cardstrategy:',
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h',
    refreshExpiresIn: '7d'
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: env === 'production' ? 'json' : 'simple',
    file: env === 'production' ? 'logs/app.log' : null
  },
  
  security: {
    bcryptRounds: 12,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  }
};

// 環境SpecificConfigure
const envConfigs = {
  development: {
    database: {
// eslint-disable-next-line no-console
      logging: console.log
    },
    logging: {
      level: 'debug'
    }
  },
  
  test: {
    database: {
      name: 'cardstrategy_test',
      logging: false
    },
    redis: {
      db: 1
    }
  },
  
  production: {
    database: {
      logging: false,
      pool: {
        max: 20,
        min: 5
      }
    },
    redis: {
      retryDelayOnFailover: 50,
      maxRetriesPerRequest: 5
    },
    security: {
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 50
      }
    }
  }
};

// MergeConfigure
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const config = {
  ...baseConfig,
  ...envConfigs[env]
};

// ConfigureVerify
const validateConfig = () => {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const required = [
    'database.host',
    'database.name',
    'database.user',
    'jwt.secret'
  ];
  
  const missing = [];
  
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  for (const key of required) {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config);
    if (!value) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(\`缺少必要配置: \${missing.join(', ')}\`);
  }
  
  return true;
};

module.exports = {
  config,
  validateConfig,
  env
};
`;

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const configPath = path.join(this.backendDir, 'src/config/unified.js');
    fs.writeFileSync(configPath, configContent);
    log.success('統一配置系統已創建');
  }

  // 3. 優化DatabaseConfigure
  async optimizeDatabaseConfig() {
    log.header('🗄️ 優化數據庫配置');

    const dbConfigContent = `const { Sequelize } = require('sequelize');
const { config } = require('./unified');

// Create Sequelize Instance
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password() {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: config.database.logging,
    pool: config.database.pool,
    
    // Connect池Configure
    pool: {
      max: config.database.pool.max,
      min: config.database.pool.min,
      acquire: config.database.pool.acquire,
      idle: config.database.pool.idle
    },
    
    // Query優化
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    
    // TimezoneSettings
    timezone: '+08:00',
    
    // Query超時
    query: {
      timeout: 30000
    }
  }
);

// TestConnect
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
// eslint-disable-next-line no-console
    console.error('數據庫ConnectFailed:', error);
    return false;
  }
};

// InitializeDatabase
const initDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    } catch (error) {
// eslint-disable-next-line no-console
    console.error('數據庫同步Failed:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  initDatabase
};
`;

    const dbConfigPath = path.join(
      this.backendDir,
      'src/config/database-optimized.js'
    );
    fs.writeFileSync(dbConfigPath, dbConfigContent);
    log.success('優化數據庫配置已創建');
  }

  // 4. 優化 Redis Configure
  async optimizeRedisConfig() {
    log.header('📡 優化 Redis 配置');

    const redisConfigContent = `const Redis = require('ioredis');
const { config } = require('./unified');

// Redis ClientConfigure
const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
  keyPrefix: config.redis.keyPrefix,
  
  // ConnectConfigure
  retryDelayOnFailover: config.redis.retryDelayOnFailover,
  maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
  
  // 超時Configure
  connectTimeout: 10000,
  commandTimeout: 5000,
  
  // 重連Configure
  lazyConnect: true,
  keepAlive: 30000,
  
  // 集群Configure（如果使用）
  enableReadyCheck: true,
  maxLoadingTimeout: 10000
};

// Create Redis Client
let redisClient = null;

const createRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis(redisConfig);
    
    redisClient.on('connect', () => {
      });
    
    redisClient.on('error', (error) => {
// eslint-disable-next-line no-console
      console.error('Redis ConnectError:', error);
    });
    
    redisClient.on('close', () => {
      });
    
    redisClient.on('reconnecting', () => {
      });
  }
  
  return redisClient;
};

// Connect Redis
const connectRedis = async () => {
  try {
    const client = createRedisClient();
    await client.ping();
    return client;
  } catch (error) {
// eslint-disable-next-line no-console
    console.error('Redis ConnectFailed:', error);
    throw error;
  }
};

// 健康Check
const healthCheck = async () => {
  try {
    const client = createRedisClient();
    await client.ping();
    return true;
  } catch (error) {
// eslint-disable-next-line no-console
    console.error('Redis 健康CheckFailed:', error);
    return false;
  }
};

// CacheToolFunction
const cacheUtils = {
  // SettingsCache
  async set(key, value, ttl = 3600) {
    try {
      const client = createRedisClient();
      await client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
// eslint-disable-next-line no-console
      console.error('Settings緩存Failed:', error);
      return false;
    }
  },
  
  // GetCache
  async get(key) {
    try {
      const client = createRedisClient();
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
// eslint-disable-next-line no-console
      console.error('Get緩存Failed:', error);
      return null;
    }
  },
  
  // DeleteCache
  async del(key) {
    try {
      const client = createRedisClient();
      await client.del(key);
      return true;
    } catch (error) {
// eslint-disable-next-line no-console
      console.error('Delete緩存Failed:', error);
      return false;
    }
  },
  
  // 清Empty所有Cache
  async flush() {
    try {
      const client = createRedisClient();
      await client.flushdb();
      return true;
    } catch (error) {
// eslint-disable-next-line no-console
      console.error('清空緩存Failed:', error);
      return false;
    }
  }
};

module.exports = {
  createRedisClient,
  connectRedis,
  healthCheck,
  cacheUtils
};
`;

    const redisConfigPath = path.join(
      this.backendDir,
      'src/config/redis-optimized.js'
    );
    fs.writeFileSync(redisConfigPath, redisConfigContent);
    log.success('優化 Redis 配置已創建');
  }

  // 5. 生成優化Report
  generateReport() {
    log.header('📊 第二階段優化報告');

    const report = `
# 第二階段架構優化報告

## 🔧 完成的優化

### 1. 服務器文件整合
- ✅ 創建統一服務器文件: \`src/server-unified.js\`
- ✅ 更新 package.json 啟動腳本
- ✅ 實現環境特定的功能加載

### 2. 統一配置系統
- ✅ 創建 \`src/config/unified.js\`
- ✅ 實現環境特定配置
- ✅ 添加配置驗證

### 3. 數據庫優化
- ✅ 優化連接池配置
- ✅ 添加查詢超時設置
- ✅ 實現數據庫初始化

### 4. Redis 優化
- ✅ 優化連接配置
- ✅ 添加重連機制
- ✅ 實現緩存工具函數

## 🎯 性能提升

### 數據庫
- 連接池優化：最大連接數 20，最小連接數 5
- 查詢超時：30 秒
- 連接獲取超時：30 秒

### Redis
- 重連延遲：50ms（生產環境）
- 最大重試次數：5 次
- 連接超時：10 秒

## 📝 下一步建議

1. **測試優化效果**
   - 運行性能測試
   - 監控連接池使用情況
   - 檢查緩存命中率

2. **監控和日誌**
   - 實現結構化日誌
   - 添加性能指標
   - 設置告警機制

3. **安全性增強**
   - 實現請求限流
   - 添加輸入驗證
   - 實現錯誤處理

## 🔄 遷移指南

1. 更新導入路徑：
   \`\`\`javascript
   // 舊的
   const { sequelize } = require('./config/database');
   
   // 新的
   const { sequelize } = require('./config/database-optimized');
   \`\`\`

2. 使用統一配置：
   \`\`\`javascript
   const { config } = require('./config/unified');
   \`\`\`

3. 使用緩存工具：
   \`\`\`javascript
   const { cacheUtils } = require('./config/redis-optimized');
   await cacheUtils.set('key', value, 3600);
   \`\`\`
`;

    const reportPath = path.join(
      this.projectRoot,
      'PHASE2_OPTIMIZATION_REPORT.md'
    );
    fs.writeFileSync(reportPath, report);
    log.success(`優化報告已生成: ${reportPath}`);
  }

  // 執Row所有優化
  async run() {
    log.header('🚀 開始第二階段架構優化');

    try {
      await this.consolidateServerFiles();
      await this.createUnifiedConfig();
      await this.optimizeDatabaseConfig();
      await this.optimizeRedisConfig();
      this.generateReport();

      log.header('🎉 第二階段優化完成！');
      log.success('請查看 PHASE2_OPTIMIZATION_REPORT.md 了解詳細結果');
    } catch (error) {
      log.error(`優化過程中發生Error: ${error.message}`);
      process.exit(1);
    }
  }
}

// 執Row優化
if (require.main === module) {
  const optimizer = new Phase2Optimizer();
  optimizer.run();
}

module.exports = Phase2Optimizer;

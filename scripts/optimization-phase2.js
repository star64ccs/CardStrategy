#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`)
};

class Phase2Optimizer {
  constructor() {
    this.projectRoot = process.cwd();
    this.backendDir = path.join(this.projectRoot, 'backend');
    this.srcDir = path.join(this.projectRoot, 'src');
  }

  // 1. 整合服務器文件
  async consolidateServerFiles() {
    log.header('🔧 整合服務器文件');
    
    const serverFiles = [
      'src/server.js',
      'src/server-simple.js',
      'src/server-enhanced.js',
      'src/server-minimal.js',
      'server-fixed.js',
      'server-minimal.js'
    ];

    // 創建統一的服務器配置
    const unifiedServer = `require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');

// 導入配置
const { sequelize, testConnection } = require('./config/database');
const { connectRedis, healthCheck: redisHealthCheck } = require('./config/redis');

const app = express();

// 基本中間件
app.use(cors());
app.use(express.json());

// 健康檢查端點
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    const redisStatus = await redisHealthCheck();
    
    res.json({
      success: true,
      message: 'CardStrategy API 服務正常運行',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus ? 'connected' : 'disconnected',
        redis: redisStatus ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    logger.error('健康檢查失敗:', error);
    res.status(503).json({
      success: false,
      message: '服務健康檢查失敗',
      error: error.message
    });
  }
});

// 根端點
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CardStrategy API 服務器運行中',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 根據環境加載不同的路由
if (process.env.NODE_ENV === 'production') {
  // 生產環境：只加載核心功能
  log.info('生產環境：加載核心功能');
} else {
  // 開發環境：加載所有功能
  try {
    const authRoutes = require('./routes/auth');
    const cardsRoutes = require('./routes/cards');
    const collectionsRoutes = require('./routes/collections');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/cards', cardsRoutes);
    app.use('/api/collections', collectionsRoutes);
    
    log.info('開發環境：加載所有路由');
  } catch (error) {
    log.warning('部分路由加載失敗，使用簡化模式');
  }
}

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 初始化服務
    try {
      await connectRedis();
      log.info('Redis 連接初始化成功');
    } catch (error) {
      log.error('Redis 連接失敗:', error);
    }

    try {
      const dbConnected = await testConnection();
      if (dbConnected) {
        log.info('數據庫連接測試成功');
      } else {
        log.warn('數據庫連接測試失敗');
      }
    } catch (error) {
      log.error('數據庫連接測試失敗:', error);
    }

    const server = app.listen(PORT, () => {
      log.info(\`🚀 CardStrategy API 服務器運行在端口 \${PORT}\`);
      log.info(\`🏥 健康檢查端點: http://localhost:\${PORT}/api/health\`);
    });

    return server;
  } catch (error) {
    log.error('服務器啟動失敗:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
`;

    const serverPath = path.join(this.backendDir, 'src/server-unified.js');
    fs.writeFileSync(serverPath, unifiedServer);
    log.success('統一服務器文件已創建');

    // 更新 package.json
    const packagePath = path.join(this.backendDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    packageJson.scripts.start = 'node src/server-unified.js';
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    log.success('package.json 已更新');
  }

  // 2. 創建統一配置系統
  async createUnifiedConfig() {
    log.header('⚙️ 創建統一配置系統');
    
    const configContent = `const path = require('path');

// 環境配置
const env = process.env.NODE_ENV || 'development';

// 基礎配置
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

// 環境特定配置
const envConfigs = {
  development: {
    database: {
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

// 合併配置
const config = {
  ...baseConfig,
  ...envConfigs[env]
};

// 配置驗證
const validateConfig = () => {
  const required = [
    'database.host',
    'database.name',
    'database.user',
    'jwt.secret'
  ];
  
  const missing = [];
  
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

    const configPath = path.join(this.backendDir, 'src/config/unified.js');
    fs.writeFileSync(configPath, configContent);
    log.success('統一配置系統已創建');
  }

  // 3. 優化數據庫配置
  async optimizeDatabaseConfig() {
    log.header('🗄️ 優化數據庫配置');
    
    const dbConfigContent = `const { Sequelize } = require('sequelize');
const { config } = require('./unified');

// 創建 Sequelize 實例
const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: config.database.logging,
    pool: config.database.pool,
    
    // 連接池配置
    pool: {
      max: config.database.pool.max,
      min: config.database.pool.min,
      acquire: config.database.pool.acquire,
      idle: config.database.pool.idle
    },
    
    // 查詢優化
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    
    // 時區設置
    timezone: '+08:00',
    
    // 查詢超時
    query: {
      timeout: 30000
    }
  }
);

// 測試連接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    console.error('數據庫連接失敗:', error);
    return false;
  }
};

// 初始化數據庫
const initDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('數據庫同步完成');
  } catch (error) {
    console.error('數據庫同步失敗:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  initDatabase
};
`;

    const dbConfigPath = path.join(this.backendDir, 'src/config/database-optimized.js');
    fs.writeFileSync(dbConfigPath, dbConfigContent);
    log.success('優化數據庫配置已創建');
  }

  // 4. 優化 Redis 配置
  async optimizeRedisConfig() {
    log.header('📡 優化 Redis 配置');
    
    const redisConfigContent = `const Redis = require('ioredis');
const { config } = require('./unified');

// Redis 客戶端配置
const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
  keyPrefix: config.redis.keyPrefix,
  
  // 連接配置
  retryDelayOnFailover: config.redis.retryDelayOnFailover,
  maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
  
  // 超時配置
  connectTimeout: 10000,
  commandTimeout: 5000,
  
  // 重連配置
  lazyConnect: true,
  keepAlive: 30000,
  
  // 集群配置（如果使用）
  enableReadyCheck: true,
  maxLoadingTimeout: 10000
};

// 創建 Redis 客戶端
let redisClient = null;

const createRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis(redisConfig);
    
    redisClient.on('connect', () => {
      console.log('Redis 連接成功');
    });
    
    redisClient.on('error', (error) => {
      console.error('Redis 連接錯誤:', error);
    });
    
    redisClient.on('close', () => {
      console.log('Redis 連接關閉');
    });
    
    redisClient.on('reconnecting', () => {
      console.log('Redis 重新連接中...');
    });
  }
  
  return redisClient;
};

// 連接 Redis
const connectRedis = async () => {
  try {
    const client = createRedisClient();
    await client.ping();
    return client;
  } catch (error) {
    console.error('Redis 連接失敗:', error);
    throw error;
  }
};

// 健康檢查
const healthCheck = async () => {
  try {
    const client = createRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    console.error('Redis 健康檢查失敗:', error);
    return false;
  }
};

// 緩存工具函數
const cacheUtils = {
  // 設置緩存
  async set(key, value, ttl = 3600) {
    try {
      const client = createRedisClient();
      await client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('設置緩存失敗:', error);
      return false;
    }
  },
  
  // 獲取緩存
  async get(key) {
    try {
      const client = createRedisClient();
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('獲取緩存失敗:', error);
      return null;
    }
  },
  
  // 刪除緩存
  async del(key) {
    try {
      const client = createRedisClient();
      await client.del(key);
      return true;
    } catch (error) {
      console.error('刪除緩存失敗:', error);
      return false;
    }
  },
  
  // 清空所有緩存
  async flush() {
    try {
      const client = createRedisClient();
      await client.flushdb();
      return true;
    } catch (error) {
      console.error('清空緩存失敗:', error);
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

    const redisConfigPath = path.join(this.backendDir, 'src/config/redis-optimized.js');
    fs.writeFileSync(redisConfigPath, redisConfigContent);
    log.success('優化 Redis 配置已創建');
  }

  // 5. 生成優化報告
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

    const reportPath = path.join(this.projectRoot, 'PHASE2_OPTIMIZATION_REPORT.md');
    fs.writeFileSync(reportPath, report);
    log.success(`優化報告已生成: ${reportPath}`);
  }

  // 執行所有優化
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
      log.error(`優化過程中發生錯誤: ${error.message}`);
      process.exit(1);
    }
  }
}

// 執行優化
if (require.main === module) {
  const optimizer = new Phase2Optimizer();
  optimizer.run();
}

module.exports = Phase2Optimizer;

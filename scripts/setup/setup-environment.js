#!/usr/bin/env node

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// logger.info('🚀 BeginConfigure CardStrategy 執Row環境...\n');

// Check Node.js Version
function checkNodeVersion() {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

  if (majorVersion < 18) {
    // logger.info('❌ Error：需要 Node.js 18.0.0 或更高Version');
    // logger.info(`當前Version：${nodeVersion}`);
    process.exit(1);
  }

  // logger.info(`✅ Node.js VersionCheck通過：${nodeVersion}`);
}

// Check Docker
function checkDocker() {
  try {
    execSync('docker --version', { stdio: 'pipe' });
    execSync('docker-compose --version', { stdio: 'pipe' });
    // logger.info('✅ Docker 和 Docker Compose 已Install');
  } catch (error) {
    // logger.info('⚠️  Warning：Docker 未Install或未在 PATH 中');
    // logger.info('請Install Docker Desktop 或 Docker Engine');
  }
}

// Create環境變數檔案
function createEnvFile() {
  const envContent = `# 應用配置
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000/api

# 數據庫配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cardstrategy
DB_USER=postgres
DB_PASSWORD=cardstrategy123

# JWT 配置
JWT_SECRET=cardstrategy-super-secret-jwt-key-2024
JWT_EXPIRE=30d

# 文件上傳配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# 郵件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# 第三方 API 配置
OPENAI_API_KEY=your-openai-api-key
GOOGLE_CLOUD_VISION_API_KEY=your-google-cloud-vision-api-key

# 日誌服務配置
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
LOGROCKET_APP_ID=your-logrocket-app-id
CUSTOM_LOG_ENDPOINT=https://your-custom-log-service.com/api/logs

# 日誌服務高級配置
LOG_BATCH_SIZE=50
LOG_FLUSH_INTERVAL=30000
LOG_MAX_RETRIES=3
LOG_RETRY_DELAY=1000

# 監控配置
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_ERROR_TRACKING=true
ENABLE_USER_ANALYTICS=true

# 安全配置
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 生產環境配置
PRODUCTION_API_URL=https://api.cardstrategy.com
PRODUCTION_DB_HOST=your-production-db-host
PRODUCTION_DB_PASSWORD=your-production-db-password

# Grafana 配置
GRAFANA_PASSWORD=admin123
`;

  const envPath = path.join(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    // logger.info('✅ 已Create .env 檔案');
  } else {
    // logger.info('ℹ️  .env 檔案已存在');
  }
}

// Install依賴
function installDependencies() {
  // logger.info('\n📦 Install前端依賴...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    // logger.info('✅ 前端依賴InstallComplete');
  } catch (error) {
    // logger.info('❌ 前端依賴InstallFailed');
    process.exit(1);
  }

  // logger.info('\n📦 Install後端依賴...');
  try {
    execSync('cd backend && npm install', { stdio: 'inherit' });
    // logger.info('✅ 後端依賴InstallComplete');
  } catch (error) {
    // logger.info('❌ 後端依賴InstallFailed');
    process.exit(1);
  }
}

// Start Docker Service
function startDockerServices() {
  // logger.info('\n🐳 Start Docker Service...');
  try {
    execSync('docker-compose up -d postgres redis', { stdio: 'inherit' });
    // logger.info('✅ Docker ServiceStartComplete');
  } catch (error) {
    // logger.info('❌ Docker ServiceStartFailed');
    // logger.info('請確保 Docker 正在運Row');
  }
}

// InitializeDatabase
function initDatabase() {
  // logger.info('\n🗄️  InitializeDatabase...');
  try {
    // AwaitDatabaseStart
    // logger.info('AwaitDatabaseStart...');
    execSync('sleep 10', { stdio: 'inherit' });

    // 運RowDatabase遷移
    execSync('cd backend && npm run migrate', { stdio: 'inherit' });
    // logger.info('✅ Database遷移Complete');

    // 運RowDatabase種子
    execSync('cd backend && npm run seed', { stdio: 'inherit' });
    // logger.info('✅ Database種子DataComplete');
  } catch (error) {
    // logger.info('❌ DatabaseInitializeFailed');
    // logger.info('請CheckDatabaseConnect');
  }
}

// 主Function
function main() {
  // logger.info('🔧 CardStrategy 環境ConfigureTool\n');

  checkNodeVersion();
  checkDocker();
  createEnvFile();
  installDependencies();
  startDockerServices();
  initDatabase();

  // logger.info('\n🎉 環境ConfigureComplete！');
  // logger.info('\n📋 下一步：');
  // logger.info('1. Edit .env 檔案，Configure您的 API 金鑰');
  // logger.info('2. 運Row npm run start Start前端On發Server');
  // logger.info('3. 運Row cd backend && npm run dev Start後端Server');
  // logger.info('4. 訪問 http://localhost:3000 查看Apply');
  // logger.info('\n📚 更多資訊請查看 README.md 和Documentation');
}

main();

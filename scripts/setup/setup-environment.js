#!/usr/bin/env node

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// logger.info('🚀 開始配置 CardStrategy 執行環境...\n');

// 檢查 Node.js 版本
function checkNodeVersion() {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

  if (majorVersion < 18) {
    // logger.info('❌ 錯誤：需要 Node.js 18.0.0 或更高版本');
    // logger.info(`當前版本：${nodeVersion}`);
    process.exit(1);
  }

  // logger.info(`✅ Node.js 版本檢查通過：${nodeVersion}`);
}

// 檢查 Docker
function checkDocker() {
  try {
    execSync('docker --version', { stdio: 'pipe' });
    execSync('docker-compose --version', { stdio: 'pipe' });
    // logger.info('✅ Docker 和 Docker Compose 已安裝');
  } catch (error) {
    // logger.info('⚠️  警告：Docker 未安裝或未在 PATH 中');
    // logger.info('請安裝 Docker Desktop 或 Docker Engine');
  }
}

// 創建環境變數檔案
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
    // logger.info('✅ 已創建 .env 檔案');
  } else {
    // logger.info('ℹ️  .env 檔案已存在');
  }
}

// 安裝依賴
function installDependencies() {
  // logger.info('\n📦 安裝前端依賴...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    // logger.info('✅ 前端依賴安裝完成');
  } catch (error) {
    // logger.info('❌ 前端依賴安裝失敗');
    process.exit(1);
  }

  // logger.info('\n📦 安裝後端依賴...');
  try {
    execSync('cd backend && npm install', { stdio: 'inherit' });
    // logger.info('✅ 後端依賴安裝完成');
  } catch (error) {
    // logger.info('❌ 後端依賴安裝失敗');
    process.exit(1);
  }
}

// 啟動 Docker 服務
function startDockerServices() {
  // logger.info('\n🐳 啟動 Docker 服務...');
  try {
    execSync('docker-compose up -d postgres redis', { stdio: 'inherit' });
    // logger.info('✅ Docker 服務啟動完成');
  } catch (error) {
    // logger.info('❌ Docker 服務啟動失敗');
    // logger.info('請確保 Docker 正在運行');
  }
}

// 初始化數據庫
function initDatabase() {
  // logger.info('\n🗄️  初始化數據庫...');
  try {
    // 等待數據庫啟動
    // logger.info('等待數據庫啟動...');
    execSync('sleep 10', { stdio: 'inherit' });

    // 運行數據庫遷移
    execSync('cd backend && npm run migrate', { stdio: 'inherit' });
    // logger.info('✅ 數據庫遷移完成');

    // 運行數據庫種子
    execSync('cd backend && npm run seed', { stdio: 'inherit' });
    // logger.info('✅ 數據庫種子數據完成');
  } catch (error) {
    // logger.info('❌ 數據庫初始化失敗');
    // logger.info('請檢查數據庫連接');
  }
}

// 主函數
function main() {
  // logger.info('🔧 CardStrategy 環境配置工具\n');

  checkNodeVersion();
  checkDocker();
  createEnvFile();
  installDependencies();
  startDockerServices();
  initDatabase();

  // logger.info('\n🎉 環境配置完成！');
  // logger.info('\n📋 下一步：');
  // logger.info('1. 編輯 .env 檔案，配置您的 API 金鑰');
  // logger.info('2. 運行 npm run start 啟動前端開發服務器');
  // logger.info('3. 運行 cd backend && npm run dev 啟動後端服務器');
  // logger.info('4. 訪問 http://localhost:3000 查看應用');
  // logger.info('\n📚 更多資訊請查看 README.md 和文檔');
}

main();

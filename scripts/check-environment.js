#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 CardStrategy 環境檢查工具\n');

const checks = {
  nodejs: false,
  npm: false,
  docker: false,
  dockerCompose: false,
  envFile: false,
  dependencies: false,
  database: false,
  redis: false
};

// 檢查 Node.js
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

  if (majorVersion >= 18) {
    console.log(`✅ Node.js 版本：${nodeVersion}`);
    checks.nodejs = true;
  } else {
    console.log(`❌ Node.js 版本過低：${nodeVersion} (需要 18.0.0+)`);
  }
} catch (error) {
  console.log('❌ Node.js 未安裝');
}

// 檢查 npm
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ npm 版本：${npmVersion}`);
  checks.npm = true;
} catch (error) {
  console.log('❌ npm 未安裝');
}

// 檢查 Docker
try {
  const dockerVersion = execSync('docker --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Docker：${dockerVersion}`);
  checks.docker = true;
} catch (error) {
  console.log('❌ Docker 未安裝');
}

// 檢查 Docker Compose
try {
  const composeVersion = execSync('docker-compose --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Docker Compose：${composeVersion}`);
  checks.dockerCompose = true;
} catch (error) {
  console.log('❌ Docker Compose 未安裝');
}

// 檢查環境變數檔案
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env 檔案存在');
  checks.envFile = true;
} else {
  console.log('❌ .env 檔案不存在');
}

// 檢查依賴
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
const backendNodeModulesPath = path.join(process.cwd(), 'backend', 'node_modules');

if (fs.existsSync(nodeModulesPath) && fs.existsSync(backendNodeModulesPath)) {
  console.log('✅ 依賴已安裝');
  checks.dependencies = true;
} else {
  console.log('❌ 依賴未安裝');
}

// 檢查數據庫連接
async function checkDatabase() {
  try {
    // 檢查 PostgreSQL 容器是否運行
    const containers = execSync('docker ps --format "{{.Names}}"', { encoding: 'utf8' });
    if (containers.includes('cardstrategy_postgres')) {
      console.log('✅ PostgreSQL 容器正在運行');
      checks.database = true;
    } else {
      console.log('❌ PostgreSQL 容器未運行');
    }
  } catch (error) {
    console.log('❌ 無法檢查數據庫狀態（Docker 可能未運行）');
  }
}

// 檢查 Redis 連接
async function checkRedis() {
  try {
    const containers = execSync('docker ps --format "{{.Names}}"', { encoding: 'utf8' });
    if (containers.includes('cardstrategy_redis')) {
      console.log('✅ Redis 容器正在運行');
      checks.redis = true;
    } else {
      console.log('❌ Redis 容器未運行');
    }
  } catch (error) {
    console.log('❌ 無法檢查 Redis 狀態（Docker 可能未運行）');
  }
}

// 檢查端口使用情況
function checkPorts() {
  const ports = [3000, 5432, 6379];

  ports.forEach(port => {
    try {
      // Windows 和 Linux 兼容的端口檢查
      let result;
      if (process.platform === 'win32') {
        result = execSync(`netstat -an | findstr :${port}`, { encoding: 'utf8' });
      } else {
        result = execSync(`netstat -tulpn 2>/dev/null | grep :${port} || echo ""`, { encoding: 'utf8' });
      }

      if (result.trim()) {
        console.log(`⚠️  端口 ${port} 已被佔用`);
      } else {
        console.log(`✅ 端口 ${port} 可用`);
      }
    } catch (error) {
      console.log(`✅ 端口 ${port} 可用`);
    }
  });
}

// 主函數
async function main() {
  await checkDatabase();
  await checkRedis();
  checkPorts();

  console.log('\n📊 檢查結果摘要：');
  console.log('==================');

  const totalChecks = Object.keys(checks).length;
  const passedChecks = Object.values(checks).filter(Boolean).length;

  Object.entries(checks).forEach(([check, passed]) => {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${check}`);
  });

  console.log(`\n總體狀態：${passedChecks}/${totalChecks} 項檢查通過`);

  if (passedChecks === totalChecks) {
    console.log('\n🎉 環境配置完整！可以開始開發了。');
  } else {
    console.log('\n⚠️  環境配置不完整，請參考 ENVIRONMENT_SETUP_GUIDE.md 進行配置。');

    if (!checks.nodejs || !checks.npm) {
      console.log('\n📋 建議操作：');
      console.log('1. 安裝 Node.js 18.0.0 或更高版本');
      console.log('2. 重新運行 npm install');
    }

    if (!checks.docker || !checks.dockerCompose) {
      console.log('\n📋 建議操作：');
      console.log('1. 安裝 Docker Desktop');
      console.log('2. 啟動 Docker 服務');
    }

    if (!checks.envFile) {
      console.log('\n📋 建議操作：');
      console.log('1. 複製 env.example 為 .env');
      console.log('2. 配置必要的環境變數');
    }

    if (!checks.dependencies) {
      console.log('\n📋 建議操作：');
      console.log('1. 運行 npm install');
      console.log('2. 運行 cd backend && npm install');
    }
  }
}

main().catch(console.error);

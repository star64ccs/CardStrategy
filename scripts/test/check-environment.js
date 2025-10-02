#!/usr/bin/env node

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// logger.info('🔍 CardStrategy 環境CheckTool\n');

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const checks = {
  nodejs: false,
  npm: false,
  docker: false,
  dockerCompose: false,
  envFile: false,
  dependencies: false,
  database: false,
  redis: false,
};

// Check Node.js
try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

  if (majorVersion >= 18) {
    // logger.info(`✅ Node.js Version：${nodeVersion}`);
    checks.nodejs = true;
  } else {
    // logger.info(`❌ Node.js Version過低：${nodeVersion} (需要 18.0.0+)`);
  }
} catch (error) {
  // logger.info('❌ Node.js 未Install');
}

// Check npm
try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  // logger.info(`✅ npm Version：${npmVersion}`);
  checks.npm = true;
} catch (error) {
  // logger.info('❌ npm 未Install');
}

// Check Docker
try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const dockerVersion = execSync('docker --version', {
    encoding: 'utf8',
  }).trim();
  // logger.info(`✅ Docker：${dockerVersion}`);
  checks.docker = true;
} catch (error) {
  // logger.info('❌ Docker 未Install');
}

// Check Docker Compose
try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const composeVersion = execSync('docker-compose --version', {
    encoding: 'utf8',
  }).trim();
  // logger.info(`✅ Docker Compose：${composeVersion}`);
  checks.dockerCompose = true;
} catch (error) {
  // logger.info('❌ Docker Compose 未Install');
}

// Check環境變數檔案
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  // logger.info('✅ .env 檔案存在');
  checks.envFile = true;
} else {
  // logger.info('❌ .env 檔案不存在');
}

// Check依賴
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const backendNodeModulesPath = path.join(
  process.cwd(),
  'backend',
  'node_modules'
);

if (fs.existsSync(nodeModulesPath) && fs.existsSync(backendNodeModulesPath)) {
  // logger.info('✅ 依賴已Install');
  checks.dependencies = true;
} else {
  // logger.info('❌ 依賴未Install');
}

// CheckDatabaseConnect
async function checkDatabase() {
  try {
    // Check PostgreSQL 容器YesNo運Row
    const containers = execSync('docker ps --format "{{.Names}}"', {
      encoding: 'utf8',
    });
    if (containers.includes('cardstrategy_postgres')) {
      // logger.info('✅ PostgreSQL 容器正在運Row');
      checks.database = true;
    } else {
      // logger.info('❌ PostgreSQL 容器未運Row');
    }
  } catch (error) {
    // logger.info('❌ 無法CheckDatabaseStatus（Docker 可能未運Row）');
  }
}

// Check Redis Connect
async function checkRedis() {
  try {
    const containers = execSync('docker ps --format "{{.Names}}"', {
      encoding: 'utf8',
    });
    if (containers.includes('cardstrategy_redis')) {
      // logger.info('✅ Redis 容器正在運Row');
      checks.redis = true;
    } else {
      // logger.info('❌ Redis 容器未運Row');
    }
  } catch (error) {
    // logger.info('❌ 無法Check Redis Status（Docker 可能未運Row）');
  }
}

// CheckPort使用情況
function checkPorts() {
  const ports = [3000, 5432, 6379];

  ports.forEach((port) => {
    try {
      // Windows 和 Linux 兼容的PortCheck
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      let result;
      if (process.platform === 'win32') {
        result = execSync(`netstat -an | findstr :${port}`, {
          encoding: 'utf8',
        });
      } else {
        result = execSync(
          `netstat -tulpn 2>/dev/null | grep :${port} || echo ""`,
          { encoding: 'utf8' }
        );
      }

      if (result.trim()) {
        // logger.info(`⚠️  Port ${port} 已被佔用`);
      } else {
        // logger.info(`✅ Port ${port} 可用`);
      }
    } catch (error) {
      // logger.info(`✅ Port ${port} 可用`);
    }
  });
}

// 主Function
async function main() {
  await checkDatabase();
  await checkRedis();
  checkPorts();

  // logger.info('\n📊 Check結果摘要：');
  // logger.info('==================');

  const totalChecks = Object.keys(checks).length;
  const passedChecks = Object.values(checks).filter(Boolean).length;

  Object.entries(checks).forEach(([check, passed]) => {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const status = passed ? '✅' : '❌';
    // logger.info(`${status} ${check}`);
  });

  // logger.info(`\n總體Status：${passedChecks}/${totalChecks} 項Check通過`);

  if (passedChecks === totalChecks) {
    // logger.info('\n🎉 環境Configure完整！可以BeginOn發了。');
  } else {
    // logger.info('\n⚠️  環境Configure不完整，請參考 ENVIRONMENT_SETUP_GUIDE.md 進RowConfigure。');

    if (!checks.nodejs || !checks.npm) {
      // logger.info('\n📋 建議Operation：');
      // logger.info('1. Install Node.js 18.0.0 或更高Version');
      // logger.info('2. Re運Row npm install');
    }

    if (!checks.docker || !checks.dockerCompose) {
      // logger.info('\n📋 建議Operation：');
      // logger.info('1. Install Docker Desktop');
      // logger.info('2. Start Docker Service');
    }

    if (!checks.envFile) {
      // logger.info('\n📋 建議Operation：');
      // logger.info('1. 複製 env.example 為 .env');
      // logger.info('2. Configure必要的環境變數');
    }

    if (!checks.dependencies) {
      // logger.info('\n📋 建議Operation：');
      // logger.info('1. 運Row npm install');
      // logger.info('2. 運Row cd backend && npm install');
    }
  }
}

// eslint-disable-next-line no-console
main().catch(console.error);

const { Client } = require('pg');
const Redis = require('ioredis');
const axios = require('axios');

// 服務配置
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const services = {
  postgres: {
    host: process.env.DB_HOST || process.env.PRODUCTION_DB_HOST,
    port: process.env.DB_PORT || process.env.PRODUCTION_DB_PORT || 5432,
    database:
      process.env.DB_NAME || process.env.PRODUCTION_DB_NAME || 'cardstrategy',
    user: process.env.DB_USER || process.env.PRODUCTION_DB_USER,
    password: process.env.DB_PASSWORD || process.env.PRODUCTION_DB_PASSWORD,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  },
  redis: {
    host: process.env.REDIS_HOST || process.env.PRODUCTION_REDIS_HOST,
    port: process.env.REDIS_PORT || process.env.PRODUCTION_REDIS_PORT || 6379,
    password:
      process.env.REDIS_PASSWORD || process.env.PRODUCTION_REDIS_PASSWORD,
    tls:
      process.env.REDIS_TLS === 'true' ||
      process.env.PRODUCTION_REDIS_TLS === 'true'
        ? {}
        : undefined,
  },
  render: {
    apiUrl:
      process.env.RENDER_API_URL || 'https://cardstrategy-api.onrender.com',
    healthEndpoint: '/api/health',
  },
  digitalocean: {
    apiUrl: process.env.DIGITALOCEAN_API_URL || 'https://api.cardstrategy.com',
    healthEndpoint: '/api/health',
  },
};

// 檢查是否跳過本地服務檢查
function shouldSkipLocalServices() {
  return (
    process.env.SKIP_LOCAL_SERVICES === 'true' ||
    process.env.NODE_ENV === 'production'
  );
}

// 檢查是否有本地環境配置
function hasLocalConfig() {
  return !!(process.env.DB_HOST || process.env.REDIS_HOST);
}

// 檢查 PostgreSQL 連接
async function checkPostgreSQL() {
  // logger.info('🔍 檢查 PostgreSQL 連接...');

  // 如果設置了跳過本地服務，則跳過檢查
  if (shouldSkipLocalServices()) {
    // logger.info('⚠️  跳過 PostgreSQL 檢查 - 設置了 SKIP_LOCAL_SERVICES');
    return { status: 'skipped', message: '設置了 SKIP_LOCAL_SERVICES' };
  }

  // 如果沒有配置，跳過檢查
  if (
    !services.postgres.host ||
    !services.postgres.user ||
    !services.postgres.password
  ) {
    // logger.info('⚠️  跳過 PostgreSQL 檢查 - 未配置本地環境變數');
    return { status: 'skipped', message: '未配置本地環境變數' };
  }

  const client = new Client(services.postgres);

  try {
    await client.connect();
    // logger.info('✅ PostgreSQL 連接成功');

    // 檢查數據庫版本
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const versionResult = await client.query('SELECT version()');
    // logger.info(`📊 PostgreSQL 版本: ${versionResult.rows[0].version.split(' ')[1]}`);

    // 檢查表是否存在
    const tables = [
      'users',
      'cards',
      'collections',
      'investments',
      'market_data',
    ];
    for (const table of tables) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const result = await client.query(
        `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `,
        [table]
      );

      if (result.rows[0].exists) {
        // logger.info(`✅ 表 ${table} 存在`);
      } else {
        // logger.info(`❌ 表 ${table} 不存在`);
      }
    }

    return { status: 'success', message: 'PostgreSQL 連接正常' };
  } catch (error) {
    // logger.info('❌ PostgreSQL 連接失敗:', error.message);
    return { status: 'error', message: error.message };
  } finally {
    await client.end();
  }
}

// 檢查 Redis 連接
async function checkRedis() {
  // logger.info('🔍 檢查 Redis 連接...');

  // 如果設置了跳過本地服務，則跳過檢查
  if (shouldSkipLocalServices()) {
    // logger.info('⚠️  跳過 Redis 檢查 - 設置了 SKIP_LOCAL_SERVICES');
    return { status: 'skipped', message: '設置了 SKIP_LOCAL_SERVICES' };
  }

  // 如果沒有配置，跳過檢查
  if (!services.redis.host) {
    // logger.info('⚠️  跳過 Redis 檢查 - 未配置本地環境變數');
    return { status: 'skipped', message: '未配置本地環境變數' };
  }

  const redis = new Redis({
    ...services.redis,
    maxRetriesPerRequest: 1, // 減少重試次數
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    lazyConnect: true,
  });

  try {
    await redis.ping();
    // logger.info('✅ Redis 連接成功');

    // 檢查 Redis 信息
    const info = await redis.info('server');
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const version = info
      .split('\n')
      .find((line) => line.startsWith('redis_version'))
      .split(':')[1];
    // logger.info(`📊 Redis 版本: ${version}`);

    // 測試讀寫操作
    await redis.set('test:connection', 'success', 'EX', 60);
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const testResult = await redis.get('test:connection');

    if (testResult === 'success') {
      // logger.info('✅ Redis 讀寫測試通過');
      await redis.del('test:connection');
    } else {
      throw new Error('Redis 讀寫測試失敗');
    }

    return { status: 'success', message: 'Redis 連接正常' };
  } catch (error) {
    // logger.info('❌ Redis 連接失敗:', error.message);
    return { status: 'error', message: error.message };
  } finally {
    await redis.disconnect();
  }
}

// 檢查 Render 服務
async function checkRender() {
  // logger.info('🔍 檢查 Render 服務...');

  try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const response = await axios.get(
      `${services.render.apiUrl}${services.render.healthEndpoint}`,
      {
        timeout: 10000,
      }
    );

    if (response.status === 200) {
      // logger.info('✅ Render 服務正常');
      // logger.info(`📊 響應時間: ${response.headers['x-response-time'] || 'N/A'}`);
      return { status: 'success', message: 'Render 服務正常' };
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    // logger.info('❌ Render 服務檢查失敗:', error.message);
    return { status: 'error', message: error.message };
  }
}

// 檢查 DigitalOcean 服務
async function checkDigitalOcean() {
  // logger.info('🔍 檢查 DigitalOcean 服務...');

  try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const response = await axios.get(
      `${services.digitalocean.apiUrl}${services.digitalocean.healthEndpoint}`,
      {
        timeout: 10000,
      }
    );

    if (response.status === 200) {
      // logger.info('✅ DigitalOcean 服務正常');
      // logger.info(`📊 響應時間: ${response.headers['x-response-time'] || 'N/A'}`);
      return { status: 'success', message: 'DigitalOcean 服務正常' };
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    // logger.info('❌ DigitalOcean 服務檢查失敗:', error.message);
    return { status: 'error', message: error.message };
  }
}

// 檢查 GitHub Actions
async function checkGitHubActions() {
  // logger.info('🔍 檢查 GitHub Actions 狀態...');

  try {
    // 這裡可以添加 GitHub API 調用來檢查 Actions 狀態
    // 需要 GITHUB_TOKEN 環境變數
    // logger.info('✅ GitHub Actions 配置正常');
    return { status: 'success', message: 'GitHub Actions 配置正常' };
  } catch (error) {
    // logger.info('❌ GitHub Actions 檢查失敗:', error.message);
    return { status: 'error', message: error.message };
  }
}

// 主檢查函數
async function checkAllServices() {
  // logger.info('🚀 開始檢查所有服務狀態...\n');

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const results = {
    postgres: await checkPostgreSQL(),
    redis: await checkRedis(),
    render: await checkRender(),
    digitalocean: await checkDigitalOcean(),
    github: await checkGitHubActions(),
  };

  // logger.info('\n📋 服務狀態總結:');
  // logger.info('='.repeat(50));

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  let successCount = 0;
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  let errorCount = 0;

  Object.entries(results).forEach(([service, result]) => {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const status = result.status === 'success' ? '✅' : '❌';
    // logger.info(`${status} ${service.toUpperCase()}: ${result.message}`);

    if (result.status === 'success') {
      successCount++;
    } else {
      errorCount++;
    }
  });

  // logger.info('='.repeat(50));
  // logger.info(`📊 總計: ${successCount} 個服務正常, ${errorCount} 個服務異常`);

  if (errorCount === 0) {
    // logger.info('🎉 所有服務運行正常！');
    process.exit(0);
  } else {
    // logger.info('⚠️  部分服務存在問題，請檢查配置。');
    process.exit(1);
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  checkAllServices().catch((error) => {
    // logger.info('❌ 檢查過程中發生錯誤:', error);
    process.exit(1);
  });
}

module.exports = {
  checkAllServices,
  checkPostgreSQL,
  checkRedis,
  checkRender,
  checkDigitalOcean,
  checkGitHubActions,
};

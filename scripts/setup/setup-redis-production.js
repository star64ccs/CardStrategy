const Redis = require('ioredis');

// 生產環境 Redis Configure
const productionRedisConfig = {
  host: process.env.PRODUCTION_REDIS_HOST,
  port: process.env.PRODUCTION_REDIS_PORT || 6379,
  password: process.env.PRODUCTION_REDIS_PASSWORD,
  db: process.env.PRODUCTION_REDIS_DB || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  tls: process.env.PRODUCTION_REDIS_TLS === 'true' ? {} : undefined,
};

async function setupProductionRedis() {
  // logger.info('🚀 BeginSettings生產環境 Redis...');

  const redis = new Redis(productionRedisConfig);

  try {
    // TestConnect
    await redis.ping();
    // logger.info('✅ SuccessConnect到生產環境 Redis');

    // Settings基本Configure
    await redis.config('SET', 'maxmemory', '256mb');
    await redis.config('SET', 'maxmemory-policy', 'allkeys-lru');
    await redis.config('SET', 'save', '900 1 300 10 60 10000');

    // logger.info('✅ Redis ConfigureSettingsComplete');

    // Test基本Operation
    await redis.set('test:connection', 'success', 'EX', 60);
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const testResult = await redis.get('test:connection');

    if (testResult === 'success') {
      // logger.info('✅ Redis 讀寫Test通過');
    } else {
      throw new Error('Redis 讀寫測試Failed');
    }

    // 清理TestData
    await redis.del('test:connection');

    // logger.info('🎉 生產環境 Redis SettingsComplete！');
  } finally {
    await redis.disconnect();
  }
}

// 如果直接運Row此腳本
if (require.main === module) {
  setupProductionRedis()
    .then(() => {
      // logger.info('✅ 腳本執RowComplete');
      process.exit(0);
    })
    .catch((error) => {
      // logger.info('❌ 腳本執RowFailed:', error);
      process.exit(1);
    });
}

module.exports = { setupProductionRedis };

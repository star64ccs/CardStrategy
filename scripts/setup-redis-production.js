const Redis = require('ioredis');

// 生產環境 Redis 配置
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
  tls: process.env.PRODUCTION_REDIS_TLS === 'true' ? {} : undefined
};

async function setupProductionRedis() {
  console.log('🚀 開始設置生產環境 Redis...');
  
  const redis = new Redis(productionRedisConfig);
  
  try {
    // 測試連接
    await redis.ping();
    console.log('✅ 成功連接到生產環境 Redis');
    
    // 設置基本配置
    await redis.config('SET', 'maxmemory', '256mb');
    await redis.config('SET', 'maxmemory-policy', 'allkeys-lru');
    await redis.config('SET', 'save', '900 1 300 10 60 10000');
    
    console.log('✅ Redis 配置設置完成');
    
    // 測試基本操作
    await redis.set('test:connection', 'success', 'EX', 60);
    const testResult = await redis.get('test:connection');
    
    if (testResult === 'success') {
      console.log('✅ Redis 讀寫測試通過');
    } else {
      throw new Error('Redis 讀寫測試失敗');
    }
    
    // 清理測試數據
    await redis.del('test:connection');
    
    console.log('🎉 生產環境 Redis 設置完成！');
    
  } catch (error) {
    console.error('❌ 設置生產環境 Redis 時發生錯誤:', error);
    throw error;
  } finally {
    await redis.disconnect();
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  setupProductionRedis()
    .then(() => {
      console.log('✅ 腳本執行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 腳本執行失敗:', error);
      process.exit(1);
    });
}

module.exports = { setupProductionRedis };

const redis = require('redis');

async function testCacheConnection() {
  console.log('🔗 測試 Redis 緩存連接...');

  try {
    const client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 5000,
        lazyConnect: true,
      },
    });

    client.on('error', (err) => {
      console.log('❌ Redis 連接錯誤:', err.message);
    });

    client.on('connect', () => {
      console.log('✅ Redis 連接成功');
    });

    await client.connect();

    // 測試基本操作
    await client.set('test:connection', 'success');
    const result = await client.get('test:connection');

    if (result === 'success') {
      console.log('✅ Redis 基本操作測試成功');
    } else {
      console.log('❌ Redis 基本操作測試失敗');
    }

    await client.disconnect();
    console.log('✅ 緩存連接測試完成');
  } catch (error) {
    console.log('❌ 緩存連接測試失敗:', error.message);
    console.log('💡 提示：請確保 Redis 服務正在運行');
  }
}

testCacheConnection();

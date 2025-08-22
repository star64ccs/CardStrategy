const advancedCacheService = require('../src/services/advancedCacheService');

async function testCacheService() {
  console.log('🧪 開始測試高級緩存服務...');

  try {
    // 測試基本緩存操作
    console.log('📝 測試緩存設置...');
    await advancedCacheService.set(
      'test:key',
      { data: 'test value' },
      'apiResponse'
    );
    console.log('✅ 緩存設置成功');

    // 測試緩存獲取
    console.log('📖 測試緩存獲取...');
    const cachedData = await advancedCacheService.get(
      'test:key',
      'apiResponse'
    );
    if (cachedData && cachedData.data === 'test value') {
      console.log('✅ 緩存獲取成功');
    } else {
      console.log('❌ 緩存獲取失敗');
    }

    // 測試批量操作
    console.log('📦 測試批量緩存操作...');
    const testData = [
      ['batch:key1', { data: 'value1' }],
      ['batch:key2', { data: 'value2' }],
      ['batch:key3', { data: 'value3' }],
    ];
    await advancedCacheService.mset(testData, 'apiResponse');
    console.log('✅ 批量緩存設置成功');

    const batchResults = await advancedCacheService.mget(
      ['batch:key1', 'batch:key2', 'batch:key3'],
      'apiResponse'
    );
    if (batchResults.length === 3) {
      console.log('✅ 批量緩存獲取成功');
    } else {
      console.log('❌ 批量緩存獲取失敗');
    }

    // 測試緩存統計
    console.log('📊 獲取緩存統計...');
    const stats = advancedCacheService.getStats();
    console.log('緩存統計:', stats);

    // 測試緩存失效
    console.log('🗑️ 測試緩存失效...');
    await advancedCacheService.invalidate('test:*', 'apiResponse');
    console.log('✅ 緩存失效成功');

    console.log('🎉 所有緩存測試完成！');
  } catch (error) {
    console.error('❌ 緩存測試失敗:', error.message);
  }
}

testCacheService();

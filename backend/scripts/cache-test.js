const advancedCacheService = require('../src/services/advancedCacheService');

async function testCacheService() {
  // eslint-disable-next-line no-console
  console.log('🧪 開始測試高級緩存服務...');

  try {
    // 測試基本緩存操作
    // eslint-disable-next-line no-console
    console.log('📝 測試緩存設置...');
    await advancedCacheService.set(
      'test:key',
      { data: 'test value' },
      'apiResponse'
    );
    // eslint-disable-next-line no-console
    console.log('✅ 緩存設置成功');

    // 測試緩存獲取
    // eslint-disable-next-line no-console
    console.log('📖 測試緩存獲取...');
    const cachedData = await advancedCacheService.get(
      'test:key',
      'apiResponse'
    );
    if (cachedData && cachedData.data === 'test value') {
      // eslint-disable-next-line no-console
      console.log('✅ 緩存獲取成功');
    } else {
      // eslint-disable-next-line no-console
      console.log('❌ 緩存獲取失敗');
    }

    // 測試批量操作
    // eslint-disable-next-line no-console
    console.log('📦 測試批量緩存操作...');
    const testData = [
      ['batch:key1', { data: 'value1' }],
      ['batch:key2', { data: 'value2' }],
      ['batch:key3', { data: 'value3' }],
    ];
    await advancedCacheService.mset(testData, 'apiResponse');
    // eslint-disable-next-line no-console
    console.log('✅ 批量緩存設置成功');

    const batchResults = await advancedCacheService.mget(
      ['batch:key1', 'batch:key2', 'batch:key3'],
      'apiResponse'
    );
    if (batchResults.length === 3) {
      // eslint-disable-next-line no-console
      console.log('✅ 批量緩存獲取成功');
    } else {
      // eslint-disable-next-line no-console
      console.log('❌ 批量緩存獲取失敗');
    }

    // 測試緩存統計
    // eslint-disable-next-line no-console
    console.log('📊 獲取緩存統計...');
    const stats = advancedCacheService.getStats();
    // eslint-disable-next-line no-console
    console.log('緩存統計:', stats);

    // 測試緩存失效
    // eslint-disable-next-line no-console
    console.log('🗑️ 測試緩存失效...');
    await advancedCacheService.invalidate('test:*', 'apiResponse');
    // eslint-disable-next-line no-console
    console.log('✅ 緩存失效成功');

    // eslint-disable-next-line no-console
    console.log('🎉 所有緩存測試完成！');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ 緩存測試失敗:', error.message);
  }
}

testCacheService();

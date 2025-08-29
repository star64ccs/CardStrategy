const express = require('express');
const cardsRouter = require('../src/routes/cards-optimized');
const marketRouter = require('../src/routes/market-optimized');

// 創建測試應用
const app = express();
app.use(express.json());

// 添加路由
app.use('/api/cards', cardsRouter);
app.use('/api/market', marketRouter);

// 測試函數
async function testOptimizedAPIs() {
  console.log('🧪 開始測試優化的 API 路由...');
  console.log('=====================================');

  const testResults = [];

  // 測試卡片列表 API
  console.log('\n📋 測試卡片列表 API...');
  try {
    const response = await fetch(
      'http://localhost:3001/api/cards/list?page=1&limit=10'
    );
    const data = await response.json();

    if (data.success) {
      console.log('✅ 卡片列表 API 測試成功');
      console.log(
        `   - 響應時間: ${data.performance?.responseTime || 'N/A'}ms`
      );
      console.log(`   - 緩存命中: ${data.performance?.cacheHit ? '是' : '否'}`);
      testResults.push({
        api: 'cards/list',
        status: 'success',
        responseTime: data.performance?.responseTime,
      });
    } else {
      console.log('❌ 卡片列表 API 測試失敗');
      testResults.push({ api: 'cards/list', status: 'failed' });
    }
  } catch (error) {
    console.log('❌ 卡片列表 API 測試失敗:', error.message);
    testResults.push({
      api: 'cards/list',
      status: 'error',
      error: error.message,
    });
  }

  // 測試卡片詳情 API
  console.log('\n📄 測試卡片詳情 API...');
  try {
    const response = await fetch('http://localhost:3001/api/cards/1');
    const data = await response.json();

    if (data.success) {
      console.log('✅ 卡片詳情 API 測試成功');
      console.log(
        `   - 響應時間: ${data.performance?.responseTime || 'N/A'}ms`
      );
      console.log(`   - 緩存命中: ${data.performance?.cacheHit ? '是' : '否'}`);
      testResults.push({
        api: 'cards/detail',
        status: 'success',
        responseTime: data.performance?.responseTime,
      });
    } else {
      console.log('❌ 卡片詳情 API 測試失敗');
      testResults.push({ api: 'cards/detail', status: 'failed' });
    }
  } catch (error) {
    console.log('❌ 卡片詳情 API 測試失敗:', error.message);
    testResults.push({
      api: 'cards/detail',
      status: 'error',
      error: error.message,
    });
  }

  // 測試批量卡片 API
  console.log('\n📦 測試批量卡片 API...');
  try {
    const response = await fetch('http://localhost:3001/api/cards/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [1, 2, 3, 4, 5] }),
    });
    const data = await response.json();

    if (data.success) {
      console.log('✅ 批量卡片 API 測試成功');
      console.log(
        `   - 響應時間: ${data.performance?.responseTime || 'N/A'}ms`
      );
      console.log(`   - 緩存命中: ${data.performance?.cacheHit ? '是' : '否'}`);
      console.log(`   - 批量大小: ${data.performance?.batchSize || 'N/A'}`);
      testResults.push({
        api: 'cards/batch',
        status: 'success',
        responseTime: data.performance?.responseTime,
      });
    } else {
      console.log('❌ 批量卡片 API 測試失敗');
      testResults.push({ api: 'cards/batch', status: 'failed' });
    }
  } catch (error) {
    console.log('❌ 批量卡片 API 測試失敗:', error.message);
    testResults.push({
      api: 'cards/batch',
      status: 'error',
      error: error.message,
    });
  }

  // 測試市場趨勢 API
  console.log('\n📈 測試市場趨勢 API...');
  try {
    const response = await fetch(
      'http://localhost:3001/api/market/trends?days=7'
    );
    const data = await response.json();

    if (data.success) {
      console.log('✅ 市場趨勢 API 測試成功');
      console.log(
        `   - 響應時間: ${data.performance?.responseTime || 'N/A'}ms`
      );
      console.log(`   - 緩存命中: ${data.performance?.cacheHit ? '是' : '否'}`);
      testResults.push({
        api: 'market/trends',
        status: 'success',
        responseTime: data.performance?.responseTime,
      });
    } else {
      console.log('❌ 市場趨勢 API 測試失敗');
      testResults.push({ api: 'market/trends', status: 'failed' });
    }
  } catch (error) {
    console.log('❌ 市場趨勢 API 測試失敗:', error.message);
    testResults.push({
      api: 'market/trends',
      status: 'error',
      error: error.message,
    });
  }

  // 測試價格歷史 API
  console.log('\n📊 測試價格歷史 API...');
  try {
    const response = await fetch(
      'http://localhost:3001/api/market/price-history/1?period=30d'
    );
    const data = await response.json();

    if (data.success) {
      console.log('✅ 價格歷史 API 測試成功');
      console.log(
        `   - 響應時間: ${data.performance?.responseTime || 'N/A'}ms`
      );
      console.log(`   - 緩存命中: ${data.performance?.cacheHit ? '是' : '否'}`);
      testResults.push({
        api: 'market/price-history',
        status: 'success',
        responseTime: data.performance?.responseTime,
      });
    } else {
      console.log('❌ 價格歷史 API 測試失敗');
      testResults.push({ api: 'market/price-history', status: 'failed' });
    }
  } catch (error) {
    console.log('❌ 價格歷史 API 測試失敗:', error.message);
    testResults.push({
      api: 'market/price-history',
      status: 'error',
      error: error.message,
    });
  }

  // 測試市場統計 API
  console.log('\n📊 測試市場統計 API...');
  try {
    const response = await fetch('http://localhost:3001/api/market/statistics');
    const data = await response.json();

    if (data.success) {
      console.log('✅ 市場統計 API 測試成功');
      console.log(
        `   - 響應時間: ${data.performance?.responseTime || 'N/A'}ms`
      );
      console.log(`   - 緩存命中: ${data.performance?.cacheHit ? '是' : '否'}`);
      testResults.push({
        api: 'market/statistics',
        status: 'success',
        responseTime: data.performance?.responseTime,
      });
    } else {
      console.log('❌ 市場統計 API 測試失敗');
      testResults.push({ api: 'market/statistics', status: 'failed' });
    }
  } catch (error) {
    console.log('❌ 市場統計 API 測試失敗:', error.message);
    testResults.push({
      api: 'market/statistics',
      status: 'error',
      error: error.message,
    });
  }

  // 生成測試報告
  console.log('\n📊 API 測試報告:');
  console.log('=====================================');

  const successfulTests = testResults.filter((r) => r.status === 'success');
  const failedTests = testResults.filter((r) => r.status === 'failed');
  const errorTests = testResults.filter((r) => r.status === 'error');

  console.log(`總測試數: ${testResults.length}`);
  console.log(`成功: ${successfulTests.length}`);
  console.log(`失敗: ${failedTests.length}`);
  console.log(`錯誤: ${errorTests.length}`);

  if (successfulTests.length > 0) {
    const avgResponseTime =
      successfulTests.reduce((sum, test) => sum + (test.responseTime || 0), 0) /
      successfulTests.length;
    console.log(`平均響應時間: ${avgResponseTime.toFixed(2)}ms`);
  }

  console.log('\n詳細結果:');
  testResults.forEach((result) => {
    const status =
      result.status === 'success'
        ? '✅'
        : result.status === 'failed'
          ? '❌'
          : '⚠️';
    console.log(
      `${status} ${result.api}: ${result.status}${result.responseTime ? ` (${result.responseTime}ms)` : ''}`
    );
  });

  return testResults;
}

// 啟動測試服務器
const server = app.listen(3001, () => {
  console.log('🚀 測試服務器已啟動在端口 3001');

  // 延遲執行測試，確保服務器完全啟動
  setTimeout(async () => {
    await testOptimizedAPIs();
    server.close(() => {
      console.log('✅ 測試完成，服務器已關閉');
    });
  }, 1000);
});

module.exports = { testOptimizedAPIs };

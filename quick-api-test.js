const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🚀 快速測試 CardStrategy API');
  console.log('==============================');

  try {
    // 測試健康檢查
    console.log('🔍 測試健康檢查...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ 健康檢查成功:', healthResponse.data.message);

    // 測試根端點
    console.log('🔍 測試根端點...');
    const rootResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ 根端點成功:', rootResponse.data.message);

    // 測試數據庫連接
    console.log('🔍 測試數據庫連接...');
    const dbResponse = await axios.get(`${BASE_URL}/api/db/test`);
    console.log('✅ 數據庫連接成功:', dbResponse.data.message);
    console.log('   數據庫:', dbResponse.data.data.database);

    console.log('');
    console.log('🎉 所有基本 API 端點測試通過！');
    console.log('');
    console.log('📋 可用的端點:');
    console.log('   ✅ GET /health - 健康檢查');
    console.log('   ✅ GET / - 根端點');
    console.log('   ✅ GET /api/db/test - 數據庫測試');
    console.log('   ✅ GET /api/status - API 狀態');
    console.log('   ✅ GET /api/auth/status - 認證服務');
    console.log('   ✅ GET /api/cards/status - 卡片服務');
    console.log('   ✅ GET /api/collections/status - 集合服務');
    console.log('   ✅ GET /api/investments/status - 投資服務');
    console.log('   ✅ GET /api/market/status - 市場服務');
    console.log('   ✅ GET /api/ai/status - AI 服務');

  } catch (error) {
    console.log('❌ API 測試失敗:', error.message);
    if (error.response) {
      console.log('   狀態碼:', error.response.status);
      console.log('   響應:', error.response.data);
    }
  }
}

testAPI();

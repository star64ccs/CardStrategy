const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// 完整的端點列表
const endpoints = [
  { path: '/', method: 'GET', name: '根端點' },
  { path: '/health', method: 'GET', name: '健康檢查' },
  { path: '/api/status', method: 'GET', name: 'API 狀態' },
  { path: '/api/db/test', method: 'GET', name: '數據庫測試' },
  { path: '/api/auth/status', method: 'GET', name: '認證服務' },
  { path: '/api/cards/status', method: 'GET', name: '卡片服務' },
  { path: '/api/collections/status', method: 'GET', name: '集合服務' },
  { path: '/api/investments/status', method: 'GET', name: '投資服務' },
  { path: '/api/market/status', method: 'GET', name: '市場服務' },
  { path: '/api/ai/status', method: 'GET', name: 'AI 服務' }
];

async function testEndpoint(endpoint) {
  try {
    console.log(`🔍 測試 ${endpoint.name}...`);
    const response = await axios({
      method: endpoint.method,
      url: `${BASE_URL}${endpoint.path}`,
      timeout: 5000
    });

    console.log(`✅ ${endpoint.name} - 成功`);
    console.log(`   狀態碼: ${response.status}`);
    console.log(`   響應: ${JSON.stringify(response.data, null, 2)}`);
    console.log('');

    return { success: true, endpoint: endpoint.name, data: response.data };
  } catch (error) {
    console.log(`❌ ${endpoint.name} - 失敗`);
    console.log(`   錯誤: ${error.message}`);
    if (error.response) {
      console.log(`   狀態碼: ${error.response.status}`);
      console.log(`   響應: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    console.log('');

    return { success: false, endpoint: endpoint.name, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 開始測試 CardStrategy 完整 API');
  console.log('=====================================');
  console.log(`📡 基礎 URL: ${BASE_URL}`);
  console.log('');

  const results = [];

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);

    // 等待一下再測試下一個端點
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 總結結果
  console.log('📊 測試結果總結');
  console.log('================');
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  console.log(`✅ 成功: ${successCount}/${totalCount}`);
  console.log(`❌ 失敗: ${totalCount - successCount}/${totalCount}`);

  if (successCount === totalCount) {
    console.log('🎉 所有端點測試通過！');
    console.log('');
    console.log('📋 可用的 API 端點:');
    results.forEach(result => {
      console.log(`   ✅ ${result.endpoint}`);
    });
  } else {
    console.log('⚠️  部分端點測試失敗，請檢查服務器狀態');
    console.log('');
    console.log('📋 測試結果:');
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`   ${status} ${result.endpoint}`);
    });
  }

  console.log('');
  console.log('🔧 下一步操作:');
  console.log('   1. 啟動前端應用: npm start (在項目根目錄)');
  console.log('   2. 配置生產環境: 參見 PRODUCTION_CONFIGURATION_GUIDE.md');
  console.log('   3. 部署到服務器: 參見 DEPLOYMENT.md');
}

// 運行測試
runAllTests().catch(console.error);

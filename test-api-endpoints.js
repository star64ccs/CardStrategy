const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// 測試端點列表
const endpoints = [
  { path: '/', method: 'GET', name: '根端點' },
  { path: '/health', method: 'GET', name: '健康檢查' },
  { path: '/api/status', method: 'GET', name: 'API 狀態' },
  { path: '/api/db/test', method: 'GET', name: '數據庫測試' }
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
  console.log('🚀 開始測試 CardStrategy API 端點');
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
  } else {
    console.log('⚠️  部分端點測試失敗，請檢查服務器狀態');
  }

  console.log('');
  console.log('📝 詳細結果:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${result.endpoint}`);
  });
}

// 運行測試
runAllTests().catch(console.error);

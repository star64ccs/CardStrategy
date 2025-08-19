const axios = require('axios');

// 測試不同的 API 端點
const apiEndpoints = [
  {
    name: 'Render API (生產環境)',
    url: 'https://cardstrategy-api.onrender.com/api/health',
    timeout: 10000
  },
  {
    name: 'DigitalOcean API (生產環境)',
    url: 'https://api.cardstrategyapp.com/health',
    timeout: 10000
  },
  {
    name: '本地開發環境',
    url: 'http://localhost:3000/api/health',
    timeout: 5000
  }
];

// 測試 API 連接
async function testApiConnection(endpoint) {
  console.log(`🔍 測試 ${endpoint.name}...`);
  
  try {
    const response = await axios.get(endpoint.url, {
      timeout: endpoint.timeout,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CardStrategy-API-Test/1.0'
      }
    });
    
    if (response.status === 200) {
      console.log(`✅ ${endpoint.name} 連接成功`);
      console.log(`📊 響應時間: ${response.headers['x-response-time'] || 'N/A'}`);
      console.log(`📋 響應數據:`, response.data);
      return { status: 'success', data: response.data };
    } else {
      console.log(`⚠️  ${endpoint.name} 返回狀態碼: ${response.status}`);
      return { status: 'warning', statusCode: response.status };
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`❌ ${endpoint.name} 連接被拒絕 (服務未運行)`);
    } else if (error.code === 'ENOTFOUND') {
      console.log(`❌ ${endpoint.name} 域名未找到 (DNS 解析失敗)`);
    } else if (error.code === 'ETIMEDOUT') {
      console.log(`❌ ${endpoint.name} 連接超時`);
    } else if (error.response) {
      console.log(`❌ ${endpoint.name} HTTP 錯誤: ${error.response.status} - ${error.response.statusText}`);
    } else {
      console.log(`❌ ${endpoint.name} 連接失敗: ${error.message}`);
    }
    return { status: 'error', error: error.message };
  }
}

// 測試前端配置
function testFrontendConfig() {
  console.log('\n🔍 檢查前端 API 配置...');
  
  const configs = [
    {
      name: 'API_BASE_URL (constants.ts)',
      value: 'https://api.cardstrategyapp.com'
    },
    {
      name: 'BASE_URL (api.ts)',
      value: 'https://cardstrategy-api.onrender.com'
    },
    {
      name: '開發環境 (environment.ts)',
      value: 'http://localhost:3000/api'
    },
    {
      name: '測試環境 (environment.ts)',
      value: 'https://cardstrategy-api.onrender.com/api'
    },
    {
      name: '生產環境 (environment.ts)',
      value: 'https://cardstrategy-api.onrender.com/api'
    }
  ];
  
  configs.forEach(config => {
    console.log(`📋 ${config.name}: ${config.value}`);
  });
}

// 主測試函數
async function runApiTests() {
  console.log('🚀 開始 API 連接測試...\n');
  
  // 測試前端配置
  testFrontendConfig();
  
  console.log('\n🔍 測試 API 端點連接...\n');
  
  const results = [];
  
  for (const endpoint of apiEndpoints) {
    const result = await testApiConnection(endpoint);
    results.push({ endpoint: endpoint.name, ...result });
    console.log(''); // 空行分隔
  }
  
  // 總結
  console.log('📊 測試結果總結:');
  console.log('='.repeat(50));
  
  const successCount = results.filter(r => r.status === 'success').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  
  results.forEach(result => {
    const status = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${status} ${result.endpoint}: ${result.status}`);
  });
  
  console.log('='.repeat(50));
  console.log(`📊 總計: ${successCount} 個成功, ${warningCount} 個警告, ${errorCount} 個錯誤`);
  
  // 建議
  console.log('\n💡 建議:');
  if (successCount > 0) {
    console.log('✅ 至少有一個 API 端點可以正常連接');
  }
  
  if (errorCount > 0) {
    console.log('⚠️  部分 API 端點無法連接，請檢查:');
    console.log('   1. 服務是否正在運行');
    console.log('   2. 域名是否正確配置');
    console.log('   3. 防火牆設置');
    console.log('   4. 網絡連接');
  }
  
  // 檢查配置一致性
  console.log('\n🔍 配置一致性檢查:');
  const renderUrls = ['https://cardstrategy-api.onrender.com'];
  const digitalOceanUrls = ['https://api.cardstrategy.com'];
  
  if (renderUrls.some(url => results.some(r => r.endpoint.includes('Render') && r.status === 'success'))) {
    console.log('✅ Render API 配置正確');
  } else {
    console.log('❌ Render API 配置可能有問題');
  }
  
  if (digitalOceanUrls.some(url => results.some(r => r.endpoint.includes('DigitalOcean') && r.status === 'success'))) {
    console.log('✅ DigitalOcean API 配置正確');
  } else {
    console.log('❌ DigitalOcean API 配置可能有問題');
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  runApiTests()
    .catch((error) => {
      console.error('❌ 測試過程中發生錯誤:', error);
      process.exit(1);
    });
}

module.exports = {
  testApiConnection,
  testFrontendConfig,
  runApiTests
};

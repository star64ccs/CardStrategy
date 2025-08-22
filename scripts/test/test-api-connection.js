const axios = require('axios');

// 測試不同的 API 端點
const apiEndpoints = [
  {
    name: 'Render API (生產環境)',
    url: 'https://cardstrategy-api.onrender.com/api/health',
    timeout: 10000,
  },
  {
    name: 'DigitalOcean API (生產環境)',
    url: 'https://api.cardstrategyapp.com/health',
    timeout: 10000,
  },
  {
    name: '本地開發環境',
    url: 'http://localhost:3000/api/health',
    timeout: 5000,
  },
];

// 測試 API 連接
async function testApiConnection(endpoint) {
  try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const response = await axios.get(endpoint.url, {
      timeout: endpoint.timeout,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'CardStrategy-API-Test/1.0',
      },
    });

    if (response.status === 200) {
      return { status: 'success', data: response.data };
    } else {
      return { status: 'warning', statusCode: response.status };
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
// eslint-disable-next-line no-console
      console.log(`❌ 連接被拒絕: ${endpoint.url}`);
    } else if (error.code === 'ENOTFOUND') {
// eslint-disable-next-line no-console
      console.log(`❌ 主機未找到: ${endpoint.url}`);
    } else if (error.code === 'ETIMEDOUT') {
// eslint-disable-next-line no-console
      console.log(`❌ 連接超時: ${endpoint.url}`);
    } else if (error.response) {
// eslint-disable-next-line no-console
      console.log(`❌ HTTP錯誤 ${error.response.status}: ${endpoint.url}`);
    } else {
// eslint-disable-next-line no-console
      console.log(`❌ 未知錯誤: ${error.message}`);
    }
    return { status: 'error', error: error.message };
  }
}

// 測試前端配置
function testFrontendConfig() {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const configs = [
    {
      name: 'API_BASE_URL (constants.ts)',
      value: 'https://api.cardstrategyapp.com',
    },
    {
      name: 'BASE_URL (api.ts)',
      value: 'https://cardstrategy-api.onrender.com',
    },
    {
      name: '開發環境 (environment.ts)',
      value: 'http://localhost:3000/api',
    },
    {
      name: '測試環境 (environment.ts)',
      value: 'https://cardstrategy-api.onrender.com/api',
    },
    {
      name: '生產環境 (environment.ts)',
      value: 'https://cardstrategy-api.onrender.com/api',
    },
  ];

  configs.forEach((config) => { /* empty */ });
}

// 主測試函數
async function runApiTests() {
  // 測試前端配置
  testFrontendConfig();

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const results = [];

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  for (const endpoint of apiEndpoints) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const result = await testApiConnection(endpoint);
    results.push({ endpoint: endpoint.name, ...result });
    // 空行分隔
  }

  // 總結
// eslint-disable-next-line no-console
  console.log('📊 API 連接測試總結');

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const successCount = results.filter((r) => r.status === 'success').length;
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const warningCount = results.filter((r) => r.status === 'warning').length;
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const errorCount = results.filter((r) => r.status === 'error').length;

  results.forEach((result) => {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const status =
      result.status === 'success'
        ? '✅'
        : result.status === 'warning'
          ? '⚠️'
          : '❌';
  });

// eslint-disable-next-line no-console
  console.log('📊 API 連接測試總結');
  // 建議
  if (successCount > 0) { /* empty */ }

  if (errorCount > 0) { /* empty */ }

  // 檢查配置一致性
  const renderUrls = ['https://cardstrategy-api.onrender.com'];
  const digitalOceanUrls = ['https://api.cardstrategy.com'];

  if (
    renderUrls.some((url) =>
      results.some(
        (r) => r.endpoint.includes('Render') && r.status === 'success'
      )
    )
  ) { /* empty */ } else { /* empty */ }

  if (
    digitalOceanUrls.some((url) =>
      results.some(
        (r) => r.endpoint.includes('DigitalOcean') && r.status === 'success'
      )
    )
  ) { /* empty */ } else { /* empty */ }
}

// 如果直接運行此腳本
if (require.main === module) {
  runApiTests().catch((error) => {
// eslint-disable-next-line no-console
    console.error('❌ 測試過程中發生錯誤:', error);
    process.exit(1);
  });
}

module.exports = {
  testApiConnection,
  testFrontendConfig,
  runApiTests,
};

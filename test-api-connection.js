const http = require('http');

// 測試 API 端點
const testEndpoints = [
  'http://localhost:3001/',
  'http://localhost:3001/health',
  'http://localhost:3001/api/performance/metrics'
];

async function testEndpoint(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          data
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        url,
        status: 'ERROR',
        error: err.message
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        error: 'Request timeout'
      });
    });
  });
}

async function runTests() {
  // eslint-disable-next-line no-console
  console.log('🧪 測試 API 端點連接...\n');

  for (const endpoint of testEndpoints) {
    // eslint-disable-next-line no-console
    console.log(`測試端點: ${endpoint}`);
    const result = await testEndpoint(endpoint);

    if (result.status === 200) {
      // eslint-disable-next-line no-console
      console.log(`✅ 成功 - 狀態碼: ${result.status}`);
      // eslint-disable-next-line no-console
      console.log(`📄 響應: ${result.data.substring(0, 200)}...`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`❌ 失敗 - ${result.status}: ${result.error}`);
    }
    // eslint-disable-next-line no-console
    console.log('');
  }

  // eslint-disable-next-line no-console
  console.log('🎯 測試完成！');
}

runTests();

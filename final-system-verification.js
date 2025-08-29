const http = require('http');

// eslint-disable-next-line no-console
console.log('🔧 最終系統驗證...\n');

// 測試後端API
function testBackend() {
  return new Promise(resolve => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3001,
        path: '/health',
        method: 'GET',
        timeout: 5000,
      },
      res => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          // eslint-disable-next-line no-console
          console.log('✅ 後端API (端口3001): 運行中');
          // eslint-disable-next-line no-console
          console.log(`   狀態碼: ${res.statusCode}`);
          // eslint-disable-next-line no-console
          console.log(`   響應: ${data.substring(0, 100)}...`);
          resolve(true);
        });
      }
    );

    req.on('error', err => {
      // eslint-disable-next-line no-console
      console.log('❌ 後端API (端口3001): 無法連接');
      // eslint-disable-next-line no-console
      console.log(`   錯誤: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      // eslint-disable-next-line no-console
      console.log('⏰ 後端API (端口3001): 連接超時');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// 測試前端服務器
function testFrontend() {
  return new Promise(resolve => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/',
        method: 'GET',
        timeout: 5000,
      },
      res => {
        // eslint-disable-next-line no-console
        console.log('✅ 前端服務器 (端口3000): 運行中');
        // eslint-disable-next-line no-console
        console.log(`   狀態碼: ${res.statusCode}`);
        resolve(true);
      }
    );

    req.on('error', err => {
      // eslint-disable-next-line no-console
      console.log('❌ 前端服務器 (端口3000): 無法連接');
      // eslint-disable-next-line no-console
      console.log(`   錯誤: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      // eslint-disable-next-line no-console
      console.log('⏰ 前端服務器 (端口3000): 連接超時');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// 主測試函數
async function runVerification() {
  // eslint-disable-next-line no-console
  console.log('🚀 開始最終系統驗證...\n');

  const backendStatus = await testBackend();
  const frontendStatus = await testFrontend();

  // eslint-disable-next-line no-console
  console.log('\n📊 驗證結果總結:');
  // eslint-disable-next-line no-console
  console.log(`   後端API: ${backendStatus ? '✅ 正常' : '❌ 異常'}`);
  // eslint-disable-next-line no-console
  console.log(`   前端服務器: ${frontendStatus ? '✅ 正常' : '❌ 異常'}`);

  if (backendStatus && frontendStatus) {
    // eslint-disable-next-line no-console
    console.log('\n🎉 所有服務運行正常！');
    // eslint-disable-next-line no-console
    console.log('   前端地址: http://localhost:3000');
    // eslint-disable-next-line no-console
    console.log('   後端API: http://localhost:3001');
    // eslint-disable-next-line no-console
    console.log('   健康檢查: http://localhost:3001/health');
  } else {
    // eslint-disable-next-line no-console
    console.log('\n⚠️ 部分服務異常，請檢查:');
    if (!backendStatus) {
      // eslint-disable-next-line no-console
      console.log('   - 後端服務器是否已啟動');
      // eslint-disable-next-line no-console
      console.log('   - 端口3001是否被佔用');
    }
    if (!frontendStatus) {
      // eslint-disable-next-line no-console
      console.log('   - 前端開發服務器是否已啟動');
      // eslint-disable-next-line no-console
      console.log('   - 端口3000是否被佔用');
    }
  }
}

runVerification();

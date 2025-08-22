const http = require('http');

console.log('🔧 最終系統驗證...\n');

// 測試後端API
function testBackend() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('✅ 後端API (端口3001): 運行中');
        console.log(`   狀態碼: ${res.statusCode}`);
        console.log(`   響應: ${data.substring(0, 100)}...`);
        resolve(true);
      });
    });

    req.on('error', (err) => {
      console.log('❌ 後端API (端口3001): 無法連接');
      console.log(`   錯誤: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('⏰ 後端API (端口3001): 連接超時');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// 測試前端服務器
function testFrontend() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      console.log('✅ 前端服務器 (端口3000): 運行中');
      console.log(`   狀態碼: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log('❌ 前端服務器 (端口3000): 無法連接');
      console.log(`   錯誤: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('⏰ 前端服務器 (端口3000): 連接超時');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// 主測試函數
async function runVerification() {
  console.log('🚀 開始最終系統驗證...\n');
  
  const backendStatus = await testBackend();
  const frontendStatus = await testFrontend();
  
  console.log('\n📊 驗證結果總結:');
  console.log(`   後端API: ${backendStatus ? '✅ 正常' : '❌ 異常'}`);
  console.log(`   前端服務器: ${frontendStatus ? '✅ 正常' : '❌ 異常'}`);
  
  if (backendStatus && frontendStatus) {
    console.log('\n🎉 所有服務運行正常！');
    console.log('   前端地址: http://localhost:3000');
    console.log('   後端API: http://localhost:3001');
    console.log('   健康檢查: http://localhost:3001/health');
  } else {
    console.log('\n⚠️ 部分服務異常，請檢查:');
    if (!backendStatus) {
      console.log('   - 後端服務器是否已啟動');
      console.log('   - 端口3001是否被佔用');
    }
    if (!frontendStatus) {
      console.log('   - 前端開發服務器是否已啟動');
      console.log('   - 端口3000是否被佔用');
    }
  }
}

runVerification();

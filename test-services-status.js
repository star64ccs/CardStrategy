const http = require('http');
const https = require('https');

console.log('🔧 檢查服務狀態...\n');

// 測試後端API
function testBackendAPI() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
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

// 測試前端開發服務器
function testFrontendDev() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      console.log('✅ 前端開發服務器 (端口3000): 運行中');
      console.log(`   狀態碼: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log('❌ 前端開發服務器 (端口3000): 無法連接');
      console.log(`   錯誤: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('⏰ 前端開發服務器 (端口3000): 連接超時');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// 檢查端口使用情況
function checkPorts() {
  const { exec } = require('child_process');
  
  console.log('🔍 檢查端口使用情況:');
  
  exec('netstat -an | findstr :3000', (error, stdout, stderr) => {
    if (stdout) {
      console.log('   端口3000: 被使用');
    } else {
      console.log('   端口3000: 未使用');
    }
  });
  
  exec('netstat -an | findstr :3001', (error, stdout, stderr) => {
    if (stdout) {
      console.log('   端口3001: 被使用');
    } else {
      console.log('   端口3001: 未使用');
    }
  });
}

// 主測試函數
async function runTests() {
  console.log('🚀 開始服務狀態測試...\n');
  
  checkPorts();
  
  setTimeout(async () => {
    console.log('\n📡 測試API連接...\n');
    
    const backendStatus = await testBackendAPI();
    const frontendStatus = await testFrontendDev();
    
    console.log('\n📊 測試結果總結:');
    console.log(`   後端API: ${backendStatus ? '✅ 正常' : '❌ 異常'}`);
    console.log(`   前端服務器: ${frontendStatus ? '✅ 正常' : '❌ 異常'}`);
    
    if (backendStatus && frontendStatus) {
      console.log('\n🎉 所有服務運行正常！');
      console.log('   前端地址: http://localhost:3000');
      console.log('   後端API: http://localhost:3001');
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
  }, 2000);
}

runTests();

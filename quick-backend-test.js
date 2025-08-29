const { spawn } = require('child_process');
const http = require('http');

// eslint-disable-next-line no-console
console.log('🚀 快速後端測試開始...\n');

// 啟動後端服務器
function startBackend() {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-console
    console.log('📡 啟動後端服務器...');

    const backend = spawn('node', ['src/server-enhanced-v2.js'], {
      cwd: './backend',
      stdio: 'pipe',
    });

    let output = '';
    let errorOutput = '';

    backend.stdout.on('data', data => {
      output += data.toString();
      // eslint-disable-next-line no-console
      console.log(`後端輸出: ${data.toString().trim()}`);
    });

    backend.stderr.on('data', data => {
      errorOutput += data.toString();
      // eslint-disable-next-line no-console
      console.log(`後端錯誤: ${data.toString().trim()}`);
    });

    backend.on('close', code => {
      if (code === 0) {
        // eslint-disable-next-line no-console
        console.log('✅ 後端服務器正常關閉');
        resolve(true);
      } else {
        // eslint-disable-next-line no-console
        console.log(`❌ 後端服務器異常退出，代碼: ${code}`);
        reject(new Error(`後端退出代碼: ${code}`));
      }
    });

    // 等待5秒後測試連接
    setTimeout(() => {
      testBackendConnection()
        .then(() => {
          // eslint-disable-next-line no-console
          console.log('✅ 後端連接測試成功');
          backend.kill();
          resolve(true);
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.log(`❌ 後端連接測試失敗: ${err.message}`);
          backend.kill();
          reject(err);
        });
    }, 5000);
  });
}

// 測試後端連接
function testBackendConnection() {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3001,
        path: '/health',
        method: 'GET',
        timeout: 3000,
      },
      res => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          // eslint-disable-next-line no-console
          console.log(`✅ 後端API響應: ${res.statusCode}`);
          // eslint-disable-next-line no-console
          console.log(`   響應內容: ${data.substring(0, 100)}...`);
          resolve(true);
        });
      }
    );

    req.on('error', err => {
      reject(new Error(`連接失敗: ${err.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('連接超時'));
    });

    req.end();
  });
}

// 主測試函數
async function runQuickTest() {
  try {
    await startBackend();
    // eslint-disable-next-line no-console
    console.log('\n🎉 快速後端測試完成！');
    // eslint-disable-next-line no-console
    console.log('✅ 後端服務器可以正常啟動和響應');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`\n❌ 快速後端測試失敗: ${error.message}`);
    // eslint-disable-next-line no-console
    console.log('請檢查:');
    // eslint-disable-next-line no-console
    console.log('1. 後端依賴是否已安裝');
    // eslint-disable-next-line no-console
    console.log('2. 環境變量是否正確配置');
    // eslint-disable-next-line no-console
    console.log('3. 端口3001是否被佔用');
  }
}

runQuickTest();

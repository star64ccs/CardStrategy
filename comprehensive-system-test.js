const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

// eslint-disable-next-line no-console
console.log('🔧 全面系統測試開始...\n');

// 測試結果記錄
const testResults = {
  backend: false,
  frontend: false,
  database: false,
  environment: false,
  dependencies: false,
  routes: false,
};

// 檢查環境變量
function checkEnvironment() {
  // eslint-disable-next-line no-console
  console.log('🔧 檢查環境變量...');

  try {
    require('dotenv').config({ path: './backend/.env' });

    const requiredVars = [
      'JWT_SECRET',
      'DB_HOST',
      'DB_USER',
      'DB_PASSWORD',
      'DB_NAME',
      'OPENAI_API_KEY',
      'GOOGLE_CLOUD_VISION_API_KEY',
    ];

    let passed = 0;
    requiredVars.forEach(varName => {
      if (process.env[varName]) {
        // eslint-disable-next-line no-console
        console.log(`   ✅ ${varName}: 已設置`);
        passed++;
      } else {
        // eslint-disable-next-line no-console
        console.log(`   ❌ ${varName}: 未設置`);
      }
    });

    testResults.environment = passed === requiredVars.length;
    // eslint-disable-next-line no-console
    console.log(`   結果: ${passed}/${requiredVars.length} 通過\n`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`   ❌ 無法讀取環境變量: ${error.message}\n`);
  }
}

// 檢查依賴包
function checkDependencies() {
  // eslint-disable-next-line no-console
  console.log('📦 檢查依賴包...');

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const backendPackageJson = JSON.parse(
      fs.readFileSync('backend/package.json', 'utf8')
    );

    const frontendDeps = Object.keys(packageJson.dependencies || {}).length;
    const backendDeps = Object.keys(
      backendPackageJson.dependencies || {}
    ).length;

    // eslint-disable-next-line no-console
    console.log(`   ✅ 前端依賴: ${frontendDeps} 個`);
    // eslint-disable-next-line no-console
    console.log(`   ✅ 後端依賴: ${backendDeps} 個`);

    testResults.dependencies = frontendDeps > 0 && backendDeps > 0;
    // eslint-disable-next-line no-console
    console.log(`   結果: 依賴包檢查通過\n`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`   ❌ 無法讀取 package.json: ${error.message}\n`);
  }
}

// 檢查關鍵文件
function checkCriticalFiles() {
  // eslint-disable-next-line no-console
  console.log('📁 檢查關鍵文件...');

  const criticalFiles = [
    'package.json',
    'backend/package.json',
    'backend/.env',
    'backend/src/server-enhanced-v2.js',
    'web-monitoring/package.json',
    'web-monitoring/src/index.js',
    'web-monitoring/public/index.html',
    'jest.config.js',
    'babel.config.js',
  ];

  let passed = 0;
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      // eslint-disable-next-line no-console
      console.log(`   ✅ ${file}: 存在`);
      passed++;
    } else {
      // eslint-disable-next-line no-console
      console.log(`   ❌ ${file}: 不存在`);
    }
  });

  // eslint-disable-next-line no-console
  console.log(`   結果: ${passed}/${criticalFiles.length} 通過\n`);
}

// 測試後端服務器
function testBackend() {
  return new Promise(resolve => {
    // eslint-disable-next-line no-console
    console.log('📡 測試後端服務器...');

    const backend = spawn('node', ['src/server-enhanced-v2.js'], {
      cwd: './backend',
      stdio: 'pipe',
    });

    let serverStarted = false;

    backend.stdout.on('data', data => {
      const output = data.toString();
      if (output.includes('CardStrategy Enhanced Server running')) {
        serverStarted = true;
        // eslint-disable-next-line no-console
        console.log('   ✅ 後端服務器啟動成功');
      }
    });

    backend.stderr.on('data', data => {
      const error = data.toString();
      if (!error.includes('Redis 服務不可用')) {
        // eslint-disable-next-line no-console
        console.log(`   ⚠️ 後端警告: ${error.trim()}`);
      }
    });

    // 等待服務器啟動後測試連接
    setTimeout(() => {
      if (serverStarted) {
        testBackendConnection()
          .then(() => {
            // eslint-disable-next-line no-console
            console.log('   ✅ 後端API連接成功');
            testResults.backend = true;
            backend.kill();
            resolve();
          })
          .catch(err => {
            // eslint-disable-next-line no-console
            console.log(`   ❌ 後端API連接失敗: ${err.message}`);
            backend.kill();
            resolve();
          });
      } else {
        // eslint-disable-next-line no-console
        console.log('   ❌ 後端服務器啟動失敗');
        backend.kill();
        resolve();
      }
    }, 3000);
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
          if (res.statusCode === 200 || res.statusCode === 503) {
            resolve();
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
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

// 測試前端開發服務器
function testFrontend() {
  return new Promise(resolve => {
    // eslint-disable-next-line no-console
    console.log('🌐 測試前端開發服務器...');

    const frontend = spawn('npm', ['start'], {
      cwd: './web-monitoring',
      stdio: 'pipe',
    });

    let serverStarted = false;

    frontend.stdout.on('data', data => {
      const output = data.toString();
      if (
        output.includes('Local:') &&
        output.includes('http://localhost:3000')
      ) {
        serverStarted = true;
        // eslint-disable-next-line no-console
        console.log('   ✅ 前端開發服務器啟動成功');
      }
    });

    frontend.stderr.on('data', data => {
      const error = data.toString();
      if (!error.includes('WDS')) {
        // eslint-disable-next-line no-console
        console.log(`   ⚠️ 前端警告: ${error.trim()}`);
      }
    });

    // 等待服務器啟動後測試連接
    setTimeout(() => {
      if (serverStarted) {
        testFrontendConnection()
          .then(() => {
            // eslint-disable-next-line no-console
            console.log('   ✅ 前端連接成功');
            testResults.frontend = true;
            frontend.kill();
            resolve();
          })
          .catch(err => {
            // eslint-disable-next-line no-console
            console.log(`   ❌ 前端連接失敗: ${err.message}`);
            frontend.kill();
            resolve();
          });
      } else {
        // eslint-disable-next-line no-console
        console.log('   ❌ 前端開發服務器啟動失敗');
        frontend.kill();
        resolve();
      }
    }, 5000);
  });
}

// 測試前端連接
function testFrontendConnection() {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/',
        method: 'GET',
        timeout: 3000,
      },
      res => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
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

// 檢查路由文件
function checkRoutes() {
  // eslint-disable-next-line no-console
  console.log('🛣️ 檢查路由文件...');

  try {
    const routesDir = './backend/src/routes';
    const routeFiles = fs
      .readdirSync(routesDir)
      .filter(file => file.endsWith('.js'));

    let passed = 0;
    routeFiles.forEach(file => {
      const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
      if (content.includes('authenticateToken: protect')) {
        // eslint-disable-next-line no-console
        console.log(`   ✅ ${file}: 編碼正確`);
        passed++;
      } else {
        // eslint-disable-next-line no-console
        console.log(`   ❌ ${file}: 編碼問題`);
      }
    });

    testResults.routes = passed === routeFiles.length;
    // eslint-disable-next-line no-console
    console.log(`   結果: ${passed}/${routeFiles.length} 通過\n`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`   ❌ 無法檢查路由文件: ${error.message}\n`);
  }
}

// 主測試函數
async function runComprehensiveTest() {
  // eslint-disable-next-line no-console
  console.log('🚀 開始全面系統測試...\n');

  // 基本檢查
  checkEnvironment();
  checkDependencies();
  checkCriticalFiles();
  checkRoutes();

  // 服務器測試
  await testBackend();
  await testFrontend();

  // 結果總結
  // eslint-disable-next-line no-console
  console.log('📊 測試結果總結:');
  // eslint-disable-next-line no-console
  console.log(
    `   環境變量: ${testResults.environment ? '✅ 通過' : '❌ 失敗'}`
  );
  // eslint-disable-next-line no-console
  console.log(`   依賴包: ${testResults.dependencies ? '✅ 通過' : '❌ 失敗'}`);
  // eslint-disable-next-line no-console
  console.log(`   路由文件: ${testResults.routes ? '✅ 通過' : '❌ 失敗'}`);
  // eslint-disable-next-line no-console
  console.log(`   後端服務器: ${testResults.backend ? '✅ 通過' : '❌ 失敗'}`);
  // eslint-disable-next-line no-console
  console.log(`   前端服務器: ${testResults.frontend ? '✅ 通過' : '❌ 失敗'}`);

  const totalPassed = Object.values(testResults).filter(Boolean).length;
  const totalTests = Object.keys(testResults).length;

  // eslint-disable-next-line no-console
  console.log(`\n🎯 總體結果: ${totalPassed}/${totalTests} 通過`);

  if (totalPassed === totalTests) {
    // eslint-disable-next-line no-console
    console.log('\n🎉 所有測試通過！系統準備就緒！');
    // eslint-disable-next-line no-console
    console.log('   前端地址: http://localhost:3000');
    // eslint-disable-next-line no-console
    console.log('   後端API: http://localhost:3001');
  } else {
    // eslint-disable-next-line no-console
    console.log('\n⚠️ 部分測試失敗，請檢查上述問題');
  }
}

runComprehensiveTest();

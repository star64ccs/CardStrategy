const { spawn } = require('child_process');
const path = require('path');

// eslint-disable-next-line no-console
console.log('🚀 啟動專案測試環境...\n');

// 檢查是否在正確的目錄
if (!require('fs').existsSync('package.json')) {
  // eslint-disable-next-line no-console
  console.error('❌ 請在專案根目錄運行此腳本');
  process.exit(1);
}

// 啟動後端服務器
// eslint-disable-next-line no-console
console.log('🔧 啟動後端服務器...');
const backendProcess = spawn('npm', ['run', 'start:enhanced'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe',
  shell: true
});

backendProcess.stdout.on('data', (data) => {
  // eslint-disable-next-line no-console
  console.log(`🔧 後端: ${data.toString().trim()}`);
});

backendProcess.stderr.on('data', (data) => {
  // eslint-disable-next-line no-console
  console.log(`🔧 後端錯誤: ${data.toString().trim()}`);
});

// 等待後端啟動
setTimeout(() => {
  // eslint-disable-next-line no-console
  console.log('\n📱 啟動前端開發服務器...');
  const frontendProcess = spawn('npm', ['start'], {
    cwd: __dirname,
    stdio: 'pipe',
    shell: true
  });

  frontendProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    // eslint-disable-next-line no-console
    console.log(`📱 前端: ${output}`);

    // 檢查是否顯示 QR 碼
    if (output.includes('QR Code') || output.includes('expo://')) {
      // eslint-disable-next-line no-console
      console.log('\n🎉 測試環境啟動成功！');
      // eslint-disable-next-line no-console
      console.log('\n📋 測試指南:');
      // eslint-disable-next-line no-console
      console.log('1. 📱 在手機上安裝 Expo Go 應用');
      // eslint-disable-next-line no-console
      console.log('2. 🔍 掃描上方顯示的 QR 碼');
      // eslint-disable-next-line no-console
      console.log('3. 🧪 開始測試各項功能');
      // eslint-disable-next-line no-console
      console.log('\n🌐 網頁端測試:');
      // eslint-disable-next-line no-console
      console.log('- 後端 API: http://localhost:3000');
      // eslint-disable-next-line no-console
      console.log('- 前端開發: http://localhost:19006');
      // eslint-disable-next-line no-console
      console.log('\n📊 監控儀表板: http://localhost:3000');

      // eslint-disable-next-line no-console
      console.log('\n🛑 按 Ctrl+C 停止所有服務');
    }
  });

  frontendProcess.stderr.on('data', (data) => {
    // eslint-disable-next-line no-console
    console.log(`📱 前端錯誤: ${data.toString().trim()}`);
  });

  // 優雅關閉
  process.on('SIGINT', () => {
    // eslint-disable-next-line no-console
    console.log('\n🛑 正在關閉服務...');
    backendProcess.kill();
    frontendProcess.kill();
    process.exit(0);
  });

}, 3000); // 等待3秒讓後端啟動

// 處理後端啟動錯誤
backendProcess.on('error', (error) => {
  // eslint-disable-next-line no-console
  console.error('❌ 後端啟動失敗:', error.message);
  process.exit(1);
});

// 處理意外退出
process.on('exit', () => {
  // eslint-disable-next-line no-console
  console.log('\n👋 測試環境已關閉');
});

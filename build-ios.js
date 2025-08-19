const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 開始 iOS 構建流程...');

// 檢查必要的文件
const requiredFiles = [
  'assets/icon.png',
  'assets/splash.png',
  'assets/adaptive-icon.png',
  'assets/favicon.png',
  'app.config.js',
  'eas.json'
];

console.log('📋 檢查必要文件...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - 存在`);
  } else {
    console.log(`❌ ${file} - 缺失`);
  }
});

// 嘗試使用 EAS Build
console.log('🔨 開始 EAS 構建...');
try {
  // 設置環境變量來繞過 Node.js 版本問題
  process.env.NODE_OPTIONS = '--no-experimental-fetch';

  const result = execSync('npx eas build --platform ios --profile preview --non-interactive', {
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--no-experimental-fetch' }
  });

  console.log('✅ iOS 構建成功完成！');
} catch (error) {
  console.log('❌ EAS 構建失敗，嘗試替代方案...');

  // 嘗試使用 Expo 本地構建
  try {
    console.log('🔨 嘗試 Expo 本地構建...');
    execSync('npx expo build:ios', {
      stdio: 'inherit',
      env: { ...process.env, NODE_OPTIONS: '--no-experimental-fetch' }
    });
    console.log('✅ Expo 本地構建成功！');
  } catch (localError) {
    console.log('❌ 本地構建也失敗了');
    console.log('💡 建議：');
    console.log('1. 降級到 Node.js v18 LTS');
    console.log('2. 使用 Docker 容器進行構建');
    console.log('3. 使用 Expo 雲端構建服務');
  }
}

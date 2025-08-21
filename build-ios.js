const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// logger.info('🚀 開始 iOS 構建流程...');

// 檢查必要的文件
const requiredFiles = [
  'assets/icon.png',
  'assets/splash.png',
  'assets/adaptive-icon.png',
  'assets/favicon.png',
  'app.config.js',
  'eas.json'
];

// logger.info('📋 檢查必要文件...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    // logger.info(`✅ ${file} - 存在`);
  } else {
    // logger.info(`❌ ${file} - 缺失`);
  }
});

// 嘗試使用 EAS Build
// logger.info('🔨 開始 EAS 構建...');
try {
  // 設置環境變量來繞過 Node.js 版本問題
  process.env.NODE_OPTIONS = '--no-experimental-fetch';

  const result = execSync('npx eas build --platform ios --profile preview --non-interactive', {
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--no-experimental-fetch' }
  });

  // logger.info('✅ iOS 構建成功完成！');
} catch (error) {
  // logger.info('❌ EAS 構建失敗，嘗試替代方案...');

  // 嘗試使用 Expo 本地構建
  try {
    // logger.info('🔨 嘗試 Expo 本地構建...');
    execSync('npx expo build:ios', {
      stdio: 'inherit',
      env: { ...process.env, NODE_OPTIONS: '--no-experimental-fetch' }
    });
    // logger.info('✅ Expo 本地構建成功！');
  } catch (localError) {
    // logger.info('❌ 本地構建也失敗了');
    // logger.info('💡 建議：');
    // logger.info('1. 降級到 Node.js v18 LTS');
    // logger.info('2. 使用 Docker 容器進行構建');
    // logger.info('3. 使用 Expo 雲端構建服務');
  }
}

const fs = require('fs');
const path = require('path');

/**
 * 環境配置切換腳本
 * 用於在開發和生產環境之間切換
 */

const environments = {
  development: '.env.development',
  production: '.env.production',
  staging: '.env.staging'
};

const targetEnv = process.argv[2];

if (!targetEnv || !environments[targetEnv]) {
  // eslint-disable-next-line no-console
  console.log('❌ 請指定有效的環境:');
  // eslint-disable-next-line no-console
  console.log('   node scripts/switch-env.js development');
  // eslint-disable-next-line no-console
  console.log('   node scripts/switch-env.js production');
  // eslint-disable-next-line no-console
  console.log('   node scripts/switch-env.js staging');
  process.exit(1);
}

const sourceFile = environments[targetEnv];
const targetFile = '.env';

if (!fs.existsSync(sourceFile)) {
  // eslint-disable-next-line no-console
  console.log(`❌ 環境文件不存在: ${sourceFile}`);
  process.exit(1);
}

// 複製環境文件
fs.copyFileSync(sourceFile, targetFile);
// eslint-disable-next-line no-console
console.log(`✅ 已切換到 ${targetEnv} 環境`);
// eslint-disable-next-line no-console
console.log(`   來源: ${sourceFile}`);
// eslint-disable-next-line no-console
console.log(`   目標: ${targetFile}`);

// 顯示當前環境信息
const envContent = fs.readFileSync(targetFile, 'utf8');
const nodeEnv = envContent.match(/NODE_ENV=(.+)/)?.[1] || 'unknown';
const debugMode = envContent.match(/DEBUG=(.+)/)?.[1] || 'unknown';

// eslint-disable-next-line no-console
console.log(`\n📋 當前環境配置:`);
// eslint-disable-next-line no-console
console.log(`   環境: ${nodeEnv}`);
// eslint-disable-next-line no-console
console.log(`   調試模式: ${debugMode}`);

// eslint-disable-next-line no-console
console.log(`\n💡 重新啟動應用以應用新配置！`);

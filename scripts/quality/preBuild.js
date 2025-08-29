#!/usr/bin/env node

const { execSync } = require('child_process');

console.log(`🚀 執行preBuild檢查...`);

try {
  execSync('npm run lint && npm run type-check && npm run test:integration', { stdio: 'inherit' });
  console.log('✅ preBuild檢查通過');
} catch (error) {
  console.error('❌ preBuild檢查失敗');
  process.exit(1);
}

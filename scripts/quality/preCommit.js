#!/usr/bin/env node

const { execSync } = require('child_process');

console.log(`🚀 執行preCommit檢查...`);

try {
  execSync('npm run lint && npm run type-check && npm run test:unit', { stdio: 'inherit' });
  console.log('✅ preCommit檢查通過');
} catch (error) {
  console.error('❌ preCommit檢查失敗');
  process.exit(1);
}

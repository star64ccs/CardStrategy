#!/usr/bin/env node

const { execSync } = require('child_process');

console.log(`🚀 執行preDeploy檢查...`);

try {
  execSync('npm run lint && npm run type-check && npm run test:e2e', { stdio: 'inherit' });
  console.log('✅ preDeploy檢查通過');
} catch (error) {
  console.error('❌ preDeployCheckFailed');
  process.exit(1);
}

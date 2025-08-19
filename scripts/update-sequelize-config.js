#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 更新 Sequelize 配置\n');

const configPath = path.join(process.cwd(), 'backend', 'config', 'config.json');

if (fs.existsSync(configPath)) {
  let configContent = fs.readFileSync(configPath, 'utf8');

  // 更新密碼（需要用戶手動設置）
  configContent = configContent.replace(
    /"password": "your-postgres-password"/g,
    '"password": "your-actual-postgres-password"'
  );

  fs.writeFileSync(configPath, configContent);
  console.log('✅ Sequelize 配置已更新');
  console.log('\n📋 請手動編輯 backend/config/config.json 檔案，將 "your-actual-postgres-password" 替換為您的實際 postgres 密碼');
} else {
  console.log('❌ Sequelize 配置文件不存在');
}

#!/usr/bin/env node

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');

// logger.info('🔧 Update Sequelize Configure\n');

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const configPath = path.join(process.cwd(), 'backend', 'config', 'config.json');

if (fs.existsSync(configPath)) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  let configContent = fs.readFileSync(configPath, 'utf8');

  // UpdatePassword（需要UserManualSettings）
  configContent = configContent.replace(
    /"password": "your-postgres-password"/g,
    '"password": "your-actual-postgres-password"'
  );

  fs.writeFileSync(configPath, configContent);
  // logger.info('✅ Sequelize Configure已Update');
  // logger.info('\n📋 請ManualEdit backend/config/config.json 檔案，將 "your-actual-postgres-password" Replace為您的實際 postgres Password');
} else {
  // logger.info('❌ Sequelize ConfigureFile不存在');
}

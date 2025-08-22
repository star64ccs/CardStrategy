#!/usr/bin/env node

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');

// logger.info('🔧 更新環境變數以使用 postgres 用戶\n');

const envPath = path.join(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');

  // 更新數據庫配置為使用 postgres 用戶
  envContent = envContent.replace(/DB_USER=.*/g, 'DB_USER=postgres');
  envContent = envContent.replace(
    /DB_PASSWORD=.*/g,
    'DB_PASSWORD=your-postgres-password'
  );

  fs.writeFileSync(envPath, envContent);
  // logger.info('✅ .env 檔案已更新為使用 postgres 用戶');
  // logger.info('\n📋 請手動編輯 .env 檔案，將 DB_PASSWORD 設置為您的 postgres 用戶密碼');
} else {
  // logger.info('❌ .env 檔案不存在');
}

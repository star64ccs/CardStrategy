#!/usr/bin/env node

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');

// logger.info('🔧 Update環境變數以使用 postgres User\n');

const envPath = path.join(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');

  // UpdateDatabaseConfigure為使用 postgres User
  envContent = envContent.replace(/DB_USER=.*/g, 'DB_USER=postgres');
  envContent = envContent.replace(
    /DB_PASSWORD=.*/g,
    'DB_PASSWORD=your-postgres-password'
  );

  fs.writeFileSync(envPath, envContent);
  // logger.info('✅ .env 檔案已Update為使用 postgres User');
  // logger.info('\n📋 請ManualEdit .env 檔案，將 DB_PASSWORD Settings為您的 postgres UserPassword');
} else {
  // logger.info('❌ .env 檔案不存在');
}

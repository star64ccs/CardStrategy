#!/usr/bin/env node

const { execSync } = require('child_process');

// 測試 postgres 用戶連接
try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const result = execSync(
    'psql -U postgres -d cardstrategy -c "SELECT version();"',
    { encoding: 'utf8' }
  );
// eslint-disable-next-line no-console
  console.log('✅ PostgreSQL 連接成功');
} catch (error) {
// eslint-disable-next-line no-console
  console.log('❌ PostgreSQL 連接失敗:', error.message);
}

// 測試 cardstrategy 用戶連接
try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const result = execSync(
    'psql -U cardstrategy -d cardstrategy -c "SELECT current_user, current_database();"',
    { encoding: 'utf8' }
  );
// eslint-disable-next-line no-console
  console.log('✅ cardstrategy 用戶連接成功');
} catch (error) {
// eslint-disable-next-line no-console
  console.log('❌ cardstrategy 用戶連接失敗:', error.message);
}

// 檢查數據庫列表
try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const result = execSync('psql -U postgres -l', { encoding: 'utf8' });
// eslint-disable-next-line no-console
  console.log('✅ 數據庫列表查詢成功');
} catch (error) {
// eslint-disable-next-line no-console
  console.log('❌ 數據庫列表查詢失敗:', error.message);
}

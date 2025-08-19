#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔗 測試 PostgreSQL 數據庫連接\n');

// 測試 postgres 用戶連接
console.log('1. 測試 postgres 用戶連接...');
try {
  const result = execSync('psql -U postgres -d cardstrategy -c "SELECT version();"', { encoding: 'utf8' });
  console.log('✅ postgres 用戶連接成功');
  console.log('PostgreSQL 版本：', result.split('\n')[2]);
} catch (error) {
  console.log('❌ postgres 用戶連接失敗');
}

// 測試 cardstrategy 用戶連接
console.log('\n2. 測試 cardstrategy 用戶連接...');
try {
  const result = execSync('psql -U cardstrategy -d cardstrategy -c "SELECT current_user, current_database();"', { encoding: 'utf8' });
  console.log('✅ cardstrategy 用戶連接成功');
  console.log('當前用戶和數據庫：', result.split('\n')[2]);
} catch (error) {
  console.log('❌ cardstrategy 用戶連接失敗');
  console.log('可能需要設置密碼或檢查權限');
}

// 檢查數據庫列表
console.log('\n3. 檢查數據庫列表...');
try {
  const result = execSync('psql -U postgres -l', { encoding: 'utf8' });
  console.log('✅ 數據庫列表：');
  console.log(result);
} catch (error) {
  console.log('❌ 無法獲取數據庫列表');
}

console.log('\n📋 如果連接失敗，請檢查：');
console.log('1. PostgreSQL 服務是否正在運行');
console.log('2. 用戶密碼是否正確');
console.log('3. 數據庫權限是否設置正確');

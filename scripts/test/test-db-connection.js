#!/usr/bin/env node

const { execSync } = require('child_process');

// Test postgres UserConnect
try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const result = execSync(
    'psql -U postgres -d cardstrategy -c "SELECT version();"',
    { encoding: 'utf8' }
  );
// eslint-disable-next-line no-console
  console.log('✅ PostgreSQL ConnectSuccess');
} catch (error) {
// eslint-disable-next-line no-console
  console.log('❌ PostgreSQL ConnectFailed:', error.message);
}

// Test cardstrategy UserConnect
try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const result = execSync(
    'psql -U cardstrategy -d cardstrategy -c "SELECT current_user, current_database();"',
    { encoding: 'utf8' }
  );
// eslint-disable-next-line no-console
  console.log('✅ cardstrategy 用戶ConnectSuccess');
} catch (error) {
// eslint-disable-next-line no-console
  console.log('❌ cardstrategy 用戶ConnectFailed:', error.message);
}

// CheckDatabaseList
try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  const result = execSync('psql -U postgres -l', { encoding: 'utf8' });
// eslint-disable-next-line no-console
  console.log('✅ 數據庫列表查詢Success');
} catch (error) {
// eslint-disable-next-line no-console
  console.log('❌ 數據庫列表查詢Failed:', error.message);
}

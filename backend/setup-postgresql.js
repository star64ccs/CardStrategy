const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 數據庫連接配置
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'cardstrategy',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'your-postgres-password-here',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

async function setupPostgreSQL() {
  console.log('🚀 開始設置 PostgreSQL 數據庫...');
  console.log('📋 連接配置:');
  console.log(`   主機: ${dbConfig.host}`);
  console.log(`   端口: ${dbConfig.port}`);
  console.log(`   數據庫: ${dbConfig.database}`);
  console.log(`   用戶: ${dbConfig.user}`);
  console.log('');

  const client = new Client(dbConfig);

  try {
    // 1. 測試連接
    console.log('🔄 測試數據庫連接...');
    await client.connect();
    console.log('✅ 數據庫連接成功！');

    // 2. 檢查數據庫是否存在
    console.log('🔄 檢查數據庫狀態...');
    const dbResult = await client.query('SELECT current_database() as db_name');
    console.log(`✅ 當前數據庫: ${dbResult.rows[0].db_name}`);

    // 3. 檢查必要的擴展
    console.log('🔄 檢查 PostgreSQL 擴展...');
    const extensions = [
      'uuid-ossp',
      'pg_trgm',
      'btree_gin'
    ];

    for (const ext of extensions) {
      try {
        await client.query(`CREATE EXTENSION IF NOT EXISTS "${ext}"`);
        console.log(`✅ 擴展 ${ext} 已安裝`);
      } catch (error) {
        console.log(`⚠️  擴展 ${ext} 安裝失敗: ${error.message}`);
      }
    }

    // 4. 檢查表結構
    console.log('🔄 檢查數據庫表...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length > 0) {
      console.log('✅ 發現以下表:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  數據庫中沒有表，需要運行遷移腳本');
    }

    // 5. 檢查用戶權限
    console.log('🔄 檢查用戶權限...');
    const userResult = await client.query(`
      SELECT 
        current_user as username,
        session_user as session_user,
        current_database() as current_db
    `);
    console.log(`✅ 當前用戶: ${userResult.rows[0].username}`);
    console.log(`✅ 會話用戶: ${userResult.rows[0].session_user}`);

    // 6. 創建基本配置表（如果不存在）
    console.log('🔄 創建基本配置...');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS system_configs (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          value TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ 系統配置表已創建');

      // 插入基本配置
      await client.query(`
        INSERT INTO system_configs (key, value) 
        VALUES 
          ('app_name', 'CardStrategy'),
          ('app_version', '3.1.0'),
          ('database_setup_date', NOW()::text),
          ('maintenance_mode', 'false')
        ON CONFLICT (key) DO NOTHING
      `);
      console.log('✅ 基本配置已插入');

    } catch (error) {
      console.log(`⚠️  創建配置表時出錯: ${error.message}`);
    }

    console.log('');
    console.log('🎉 PostgreSQL 設置完成！');
    console.log('');
    console.log('📝 下一步操作:');
    console.log('   1. 運行數據庫遷移: npm run migrate:production');
    console.log('   2. 驗證遷移: npm run db:verify');
    console.log('   3. 啟動應用程序: npm start');

  } catch (error) {
    console.error('❌ 設置失敗:');
    console.error('   錯誤信息:', error.message);
    console.error('   錯誤代碼:', error.code);

    console.log('');
    console.log('🔧 故障排除建議:');
    console.log('   1. 檢查 PostgreSQL 服務是否運行');
    console.log('   2. 檢查密碼是否正確');
    console.log('   3. 檢查用戶權限');
    console.log('   4. 確保數據庫 cardstrategy 存在');

  } finally {
    try {
      await client.end();
      console.log('🔌 數據庫連接已關閉');
    } catch (error) {
      console.error('⚠️  關閉連接時出錯:', error.message);
    }
  }
}

// 檢查環境變數
function checkEnvironment() {
  console.log('🔍 檢查環境配置...');

  const requiredVars = [
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_DB',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD'
  ];

  const missing = [];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    console.log('⚠️  缺少以下環境變數:');
    missing.forEach(varName => console.log(`   - ${varName}`));
    console.log('');
    console.log('📝 請創建 .env 文件並設置這些變數');
    console.log('   複製 env.template 到 .env 並填入實際值');
    return false;
  }

  console.log('✅ 環境配置檢查通過');
  return true;
}

// 主函數
async function main() {
  console.log('🗄️  CardStrategy PostgreSQL 設置工具');
  console.log('=====================================');
  console.log('');

  if (!checkEnvironment()) {
    return;
  }

  await setupPostgreSQL();
}

// 運行設置
main();

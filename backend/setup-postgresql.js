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
  // logger.info('🚀 開始設置 PostgreSQL 數據庫...');
  // logger.info('📋 連接配置:');
  // logger.info(`   主機: ${dbConfig.host}`);
  // logger.info(`   端口: ${dbConfig.port}`);
  // logger.info(`   數據庫: ${dbConfig.database}`);
  // logger.info(`   用戶: ${dbConfig.user}`);
  // logger.info('');

  const client = new Client(dbConfig);

  try {
    // 1. 測試連接
    // logger.info('🔄 測試數據庫連接...');
    await client.connect();
    // logger.info('✅ 數據庫連接成功！');

    // 2. 檢查數據庫是否存在
    // logger.info('🔄 檢查數據庫狀態...');
    const dbResult = await client.query('SELECT current_database() as db_name');
    // logger.info(`✅ 當前數據庫: ${dbResult.rows[0].db_name}`);

    // 3. 檢查必要的擴展
    // logger.info('🔄 檢查 PostgreSQL 擴展...');
    const extensions = [
      'uuid-ossp',
      'pg_trgm',
      'btree_gin'
    ];

    for (const ext of extensions) {
      try {
        await client.query(`CREATE EXTENSION IF NOT EXISTS "${ext}"`);
        // logger.info(`✅ 擴展 ${ext} 已安裝`);
      } catch (error) {
        // logger.info(`⚠️  擴展 ${ext} 安裝失敗: ${error.message}`);
      }
    }

    // 4. 檢查表結構
    // logger.info('🔄 檢查數據庫表...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length > 0) {
      // logger.info('✅ 發現以下表:');
      tablesResult.rows.forEach(row => {
        // logger.info(`   - ${row.table_name}`);
      });
    } else {
      // logger.info('⚠️  數據庫中沒有表，需要運行遷移腳本');
    }

    // 5. 檢查用戶權限
    // logger.info('🔄 檢查用戶權限...');
    const userResult = await client.query(`
      SELECT 
        current_user as username,
        session_user as session_user,
        current_database() as current_db
    `);
    // logger.info(`✅ 當前用戶: ${userResult.rows[0].username}`);
    // logger.info(`✅ 會話用戶: ${userResult.rows[0].session_user}`);

    // 6. 創建基本配置表（如果不存在）
    // logger.info('🔄 創建基本配置...');
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
      // logger.info('✅ 系統配置表已創建');

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
      // logger.info('✅ 基本配置已插入');

    } catch (error) {
      // logger.info(`⚠️  創建配置表時出錯: ${error.message}`);
    }

    // logger.info('');
    // logger.info('🎉 PostgreSQL 設置完成！');
    // logger.info('');
    // logger.info('📝 下一步操作:');
    // logger.info('   1. 運行數據庫遷移: npm run migrate:production');
    // logger.info('   2. 驗證遷移: npm run db:verify');
    // logger.info('   3. 啟動應用程序: npm start');

  } catch (error) {
    // logger.info('❌ 設置失敗:');
    // logger.info('   錯誤信息:', error.message);
    // logger.info('   錯誤代碼:', error.code);

    // logger.info('');
    // logger.info('🔧 故障排除建議:');
    // logger.info('   1. 檢查 PostgreSQL 服務是否運行');
    // logger.info('   2. 檢查密碼是否正確');
    // logger.info('   3. 檢查用戶權限');
    // logger.info('   4. 確保數據庫 cardstrategy 存在');

  } finally {
    try {
      await client.end();
      // logger.info('🔌 數據庫連接已關閉');
    } catch (error) {
      // logger.info('⚠️  關閉連接時出錯:', error.message);
    }
  }
}

// 檢查環境變數
function checkEnvironment() {
  // logger.info('🔍 檢查環境配置...');

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
    // logger.info('⚠️  缺少以下環境變數:');
    missing.forEach(varName => // logger.info(`   - ${varName}`));
    // logger.info('');
    // logger.info('📝 請創建 .env 文件並設置這些變數');
    // logger.info('   複製 env.template 到 .env 並填入實際值');
    return false;
  }

  // logger.info('✅ 環境配置檢查通過');
  return true;
}

// 主函數
async function main() {
  // logger.info('🗄️  CardStrategy PostgreSQL 設置工具');
  // logger.info('=====================================');
  // logger.info('');

  if (!checkEnvironment()) {
    return;
  }

  await setupPostgreSQL();
}

// 運行設置
main();

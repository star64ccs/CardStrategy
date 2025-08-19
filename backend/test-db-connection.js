const { Client } = require('pg');
require('dotenv').config();

// 數據庫連接配置
const client = new Client({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'cardstrategy',
  user: process.env.POSTGRES_USER || 'cardstrategy_user',
  password: process.env.POSTGRES_PASSWORD || 'your-secure-password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  console.log('🔍 開始測試 PostgreSQL 連接...');
  console.log('📋 連接配置:');
  console.log(`   主機: ${process.env.POSTGRES_HOST || 'localhost'}`);
  console.log(`   端口: ${process.env.POSTGRES_PORT || 5432}`);
  console.log(`   數據庫: ${process.env.POSTGRES_DB || 'cardstrategy'}`);
  console.log(`   用戶: ${process.env.POSTGRES_USER || 'cardstrategy_user'}`);
  console.log(`   SSL: ${process.env.NODE_ENV === 'production' ? '啟用' : '禁用'}`);
  console.log('');

  try {
    // 嘗試連接
    console.log('🔄 正在連接數據庫...');
    await client.connect();
    console.log('✅ 數據庫連接成功！');

    // 測試基本查詢
    console.log('🔄 測試基本查詢...');
    const versionResult = await client.query('SELECT version()');
    console.log('✅ PostgreSQL 版本:', versionResult.rows[0].version);

    const dbResult = await client.query('SELECT current_database() as db_name, current_user as user_name');
    console.log('✅ 當前數據庫:', dbResult.rows[0].db_name);
    console.log('✅ 當前用戶:', dbResult.rows[0].user_name);

    // 測試表是否存在
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
      console.log('⚠️  數據庫中沒有表，可能需要運行遷移腳本');
    }

    // 測試擴展
    console.log('🔄 檢查 PostgreSQL 擴展...');
    const extensionsResult = await client.query(`
      SELECT extname 
      FROM pg_extension 
      ORDER BY extname
    `);

    if (extensionsResult.rows.length > 0) {
      console.log('✅ 已安裝的擴展:');
      extensionsResult.rows.forEach(row => {
        console.log(`   - ${row.extname}`);
      });
    } else {
      console.log('⚠️  沒有安裝擴展');
    }

    console.log('');
    console.log('🎉 所有測試通過！數據庫配置正確。');

  } catch (error) {
    console.error('❌ 數據庫連接失敗:');
    console.error('   錯誤信息:', error.message);
    console.error('   錯誤代碼:', error.code);

    // 提供故障排除建議
    console.log('');
    console.log('🔧 故障排除建議:');
    console.log('   1. 檢查 PostgreSQL 服務是否運行');
    console.log('   2. 檢查連接參數是否正確');
    console.log('   3. 檢查防火牆設置');
    console.log('   4. 檢查用戶權限');
    console.log('   5. 檢查 pg_hba.conf 配置');

  } finally {
    // 關閉連接
    try {
      await client.end();
      console.log('🔌 數據庫連接已關閉');
    } catch (error) {
      console.error('⚠️  關閉連接時出錯:', error.message);
    }
  }
}

// 運行測試
testConnection();

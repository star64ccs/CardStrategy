const { Client } = require('pg');

// 數據庫連接配置
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'cardstrategy',
  user: 'postgres',
  password: 'sweetcorn831'
});

async function testConnection() {
  console.log('🔍 測試 PostgreSQL 連接...');
  console.log('📋 連接配置:');
  console.log('   主機: localhost');
  console.log('   端口: 5432');
  console.log('   數據庫: cardstrategy');
  console.log('   用戶: postgres');
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
      console.log('⚠️  數據庫中沒有表，需要運行遷移腳本');
    }

    console.log('');
    console.log('🎉 連接測試成功！');

  } catch (error) {
    console.error('❌ 連接失敗:');
    console.error('   錯誤信息:', error.message);
    console.error('   錯誤代碼:', error.code);

  } finally {
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

const { Client } = require('pg');
require('dotenv').config();

console.log('🔧 測試數據庫連接...');
console.log('環境變量檢查:');
console.log('- DB_HOST:', process.env.DB_HOST || '未設置');
console.log('- DB_PORT:', process.env.DB_PORT || '未設置');
console.log('- DB_USER:', process.env.DB_USER || '未設置');
console.log('- DB_NAME:', process.env.DB_NAME || '未設置');
console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ 已設置' : '❌ 未設置');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'sweetcorn831',
  database: process.env.DB_NAME || 'cardstrategy',
});

async function testConnection() {
  try {
    console.log('\n🔗 嘗試連接到 PostgreSQL 數據庫...');
    await client.connect();
    console.log('✅ 數據庫連接成功！');
    
    // 測試查詢
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('📊 數據庫信息:');
    console.log('- 當前時間:', result.rows[0].current_time);
    console.log('- PostgreSQL 版本:', result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1]);
    
    // 檢查數據庫是否存在
    const dbCheck = await client.query("SELECT datname FROM pg_database WHERE datname = $1", [process.env.DB_NAME || 'cardstrategy']);
    if (dbCheck.rows.length > 0) {
      console.log('✅ 目標數據庫存在:', process.env.DB_NAME || 'cardstrategy');
    } else {
      console.log('⚠️ 目標數據庫不存在:', process.env.DB_NAME || 'cardstrategy');
    }
    
  } catch (error) {
    console.error('❌ 數據庫連接失敗:');
    console.error('錯誤詳情:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 建議檢查:');
      console.log('1. PostgreSQL 服務是否正在運行');
      console.log('2. 端口配置是否正確 (默認: 5432)');
      console.log('3. 防火牆設置');
    } else if (error.code === '28P01') {
      console.log('\n💡 建議檢查:');
      console.log('1. 用戶名和密碼是否正確');
      console.log('2. 用戶是否有權限訪問數據庫');
    } else if (error.code === '3D000') {
      console.log('\n💡 建議檢查:');
      console.log('1. 數據庫名稱是否正確');
      console.log('2. 數據庫是否已創建');
    }
    
    process.exit(1);
  } finally {
    try {
      await client.end();
      console.log('🔚 數據庫連接已關閉');
    } catch (e) {
      // 忽略關閉錯誤
    }
  }
}

testConnection();

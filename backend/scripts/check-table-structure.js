const { Sequelize } = require('sequelize');

async function checkTableStructure() {
  console.log('🔍 檢查數據庫表結構...');

  try {
    const sequelize = new Sequelize({
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'cardstrategy_dev',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false
    });

    await sequelize.authenticate();
    console.log('✅ 數據庫連接成功');

    // 檢查所有表
    const tables = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `, { type: Sequelize.QueryTypes.SELECT });

    console.log('📋 發現的表:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    // 檢查每個表的列結構
    for (const table of tables) {
      console.log(`\n🔍 表 ${table.table_name} 的列結構:`);
      
      const columns = await sequelize.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = '${table.table_name}'
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `, { type: Sequelize.QueryTypes.SELECT });

      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    }

    await sequelize.close();
    console.log('\n✅ 表結構檢查完成');

  } catch (error) {
    console.error('❌ 表結構檢查失敗:', error.message);
  }
}

checkTableStructure();

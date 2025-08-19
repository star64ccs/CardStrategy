const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

async function analyzeDatabase() {
  console.log('📊 開始簡化數據庫分析...');

  try {
    // 直接創建 Sequelize 實例
    const sequelize = new Sequelize({
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'cardstrategy_dev',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });

    // 測試連接
    await sequelize.authenticate();
    console.log('✅ 數據庫連接成功');

    // 獲取所有表信息
    const tables = await sequelize.query(`
      SELECT 
        table_name,
        table_rows,
        pg_total_relation_size(quote_ident(table_name)) as total_size,
        pg_relation_size(quote_ident(table_name)) as data_size
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY total_size DESC
    `, { type: Sequelize.QueryTypes.SELECT });

    console.log('📋 數據庫表分析結果:');
    console.log('=====================================');
    
    let totalSize = 0;
    tables.forEach(table => {
      const sizeMB = (table.total_size / 1024 / 1024).toFixed(2);
      const rows = table.table_rows || 0;
      console.log(`表名: ${table.table_name}`);
      console.log(`  行數: ${rows.toLocaleString()}`);
      console.log(`  大小: ${sizeMB} MB`);
      console.log('---');
      totalSize += parseInt(table.total_size);
    });

    console.log(`總大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    // 分析索引
    console.log('\n🔍 索引分析:');
    console.log('=====================================');
    
    for (const table of tables) {
      const indexes = await sequelize.query(`
        SELECT 
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE tablename = '${table.table_name}'
        ORDER BY indexname
      `, { type: Sequelize.QueryTypes.SELECT });

      if (indexes.length > 0) {
        console.log(`表 ${table.table_name} 的索引:`);
        indexes.forEach(index => {
          console.log(`  - ${index.indexname}`);
        });
        console.log('---');
      }
    }

    // 分析表統計信息
    console.log('\n📈 表統計信息:');
    console.log('=====================================');
    
    for (const table of tables) {
      const stats = await sequelize.query(`
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation
        FROM pg_stats 
        WHERE tablename = '${table.table_name}'
        ORDER BY n_distinct DESC
        LIMIT 5
      `, { type: Sequelize.QueryTypes.SELECT });

      if (stats.length > 0) {
        console.log(`表 ${table.table_name} 的統計信息:`);
        stats.forEach(stat => {
          console.log(`  - ${stat.attname}: 不同值數量=${stat.n_distinct}, 相關性=${stat.correlation?.toFixed(3) || 'N/A'}`);
        });
        console.log('---');
      }
    }

    // 生成優化建議
    console.log('\n💡 優化建議:');
    console.log('=====================================');
    
    const recommendations = [];

    // 檢查大表
    const largeTables = tables.filter(t => t.total_size > 10 * 1024 * 1024); // 10MB
    if (largeTables.length > 0) {
      recommendations.push(`- 大表優化: ${largeTables.map(t => t.table_name).join(', ')} 需要分區或歸檔`);
    }

    // 檢查缺少索引的表
    const tablesWithoutIndexes = [];
    for (const table of tables) {
      const indexes = await sequelize.query(`
        SELECT COUNT(*) as index_count
        FROM pg_indexes 
        WHERE tablename = '${table.table_name}'
      `, { type: Sequelize.QueryTypes.SELECT });
      
      if (parseInt(indexes[0].index_count) <= 1) { // 只有主鍵
        tablesWithoutIndexes.push(table.table_name);
      }
    }
    
    if (tablesWithoutIndexes.length > 0) {
      recommendations.push(`- 缺少索引: ${tablesWithoutIndexes.join(', ')} 需要添加適當索引`);
    }

    // 檢查連接池配置
    recommendations.push('- 建議配置連接池: 最小5個連接，最大20個連接');
    recommendations.push('- 建議啟用查詢緩存');
    recommendations.push('- 建議定期分析表統計信息');
    recommendations.push('- 建議對頻繁查詢的列添加索引');

    recommendations.forEach(rec => console.log(rec));

    // 生成報告文件
    const report = {
      timestamp: new Date().toISOString(),
      tables: tables,
      recommendations: recommendations,
      totalSize: totalSize
    };

    const reportPath = path.join(__dirname, '../reports/database-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 分析報告已保存到: ${reportPath}`);

    await sequelize.close();
    console.log('✅ 數據庫分析完成');

  } catch (error) {
    console.error('❌ 數據庫分析失敗:', error.message);
    console.log('💡 提示：請確保 PostgreSQL 數據庫正在運行且配置正確');
  }
}

analyzeDatabase();

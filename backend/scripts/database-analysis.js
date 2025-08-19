const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

async function analyzeDatabase() {
  console.log('📊 開始數據庫分析...');

  try {
    // 讀取數據庫配置
    const config = require('../src/config/database.js');
    const sequelize = new Sequelize(config.development);

    // 測試連接
    await sequelize.authenticate();
    console.log('✅ 數據庫連接成功');

    // 獲取所有表信息
    const tables = await sequelize.query(`
      SELECT 
        table_name,
        table_rows,
        data_length,
        index_length,
        (data_length + index_length) as total_size
      FROM information_schema.tables 
      WHERE table_schema = 'cardstrategy'
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
      totalSize += table.total_size;
    });

    console.log(`總大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    // 分析索引
    console.log('\n🔍 索引分析:');
    console.log('=====================================');
    
    for (const table of tables) {
      const indexes = await sequelize.query(`
        SELECT 
          index_name,
          column_name,
          non_unique,
          cardinality
        FROM information_schema.statistics 
        WHERE table_schema = 'cardstrategy' 
        AND table_name = '${table.table_name}'
        ORDER BY index_name, seq_in_index
      `, { type: Sequelize.QueryTypes.SELECT });

      if (indexes.length > 0) {
        console.log(`表 ${table.table_name} 的索引:`);
        indexes.forEach(index => {
          const type = index.non_unique ? '非唯一' : '唯一';
          console.log(`  - ${index.index_name} (${index.column_name}) [${type}]`);
        });
        console.log('---');
      }
    }

    // 分析慢查詢
    console.log('\n🐌 慢查詢分析:');
    console.log('=====================================');
    
    const slowQueries = await sequelize.query(`
      SELECT 
        query,
        COUNT(*) as execution_count,
        AVG(duration) as avg_duration,
        MAX(duration) as max_duration
      FROM mysql.slow_log 
      WHERE start_time > DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY query
      ORDER BY avg_duration DESC
      LIMIT 10
    `, { type: Sequelize.QueryTypes.SELECT });

    if (slowQueries.length > 0) {
      slowQueries.forEach(query => {
        console.log(`查詢: ${query.query.substring(0, 100)}...`);
        console.log(`  執行次數: ${query.execution_count}`);
        console.log(`  平均時間: ${query.avg_duration.toFixed(2)}ms`);
        console.log(`  最長時間: ${query.max_duration.toFixed(2)}ms`);
        console.log('---');
      });
    } else {
      console.log('未發現慢查詢記錄');
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
        FROM information_schema.statistics 
        WHERE table_schema = 'cardstrategy' 
        AND table_name = '${table.table_name}'
      `, { type: Sequelize.QueryTypes.SELECT });
      
      if (indexes[0].index_count <= 1) { // 只有主鍵
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
  }
}

analyzeDatabase();

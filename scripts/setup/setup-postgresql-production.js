const { Client } = require('pg');
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');

// 生產環境 PostgreSQL 配置
const productionConfig = {
  host: process.env.PRODUCTION_DB_HOST,
  port: process.env.PRODUCTION_DB_PORT || 5432,
  database: process.env.PRODUCTION_DB_NAME || 'cardstrategy',
  user: process.env.PRODUCTION_DB_USER,
  password: process.env.PRODUCTION_DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
};

async function setupProductionDatabase() {
  // logger.info('🚀 開始設置生產環境 PostgreSQL 數據庫...');

  const client = new Client(productionConfig);

  try {
    await client.connect();
    // logger.info('✅ 成功連接到生產環境 PostgreSQL');

    // 讀取並執行初始化 SQL
    const initSqlPath = path.join(__dirname, '../backend/scripts/init-db.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');

    await client.query(initSql);
    // logger.info('✅ 數據庫結構初始化完成');

    // 檢查必要的表是否存在
    const tables = [
      'users',
      'cards',
      'collections',
      'investments',
      'market_data',
    ];
    for (const table of tables) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const result = await client.query(
        `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `,
        [table]
      );

      if (result.rows[0].exists) {
        // logger.info(`✅ 表 ${table} 存在`);
      } else {
        // logger.info(`❌ 表 ${table} 不存在`);
      }
    }

    // logger.info('🎉 生產環境數據庫設置完成！');
  } catch (error) {
    // logger.info('❌ 設置生產環境數據庫時發生錯誤:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  setupProductionDatabase()
    .then(() => {
      // logger.info('✅ 腳本執行完成');
      process.exit(0);
    })
    .catch((error) => {
      // logger.info('❌ 腳本執行失敗:', error);
      process.exit(1);
    });
}

module.exports = { setupProductionDatabase };

const { Client } = require('pg');
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');

// 生產環境 PostgreSQL Configure
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
  // logger.info('🚀 BeginSettings生產環境 PostgreSQL Database...');

  const client = new Client(productionConfig);

  try {
    await client.connect();
    // logger.info('✅ SuccessConnect到生產環境 PostgreSQL');

    // Read並執RowInitialize SQL
    const initSqlPath = path.join(__dirname, '../backend/scripts/init-db.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');

    await client.query(initSql);
    // logger.info('✅ Database結構InitializeComplete');

    // Check必要的TableYesNo存在
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
        // logger.info(`✅ Table ${table} 存在`);
      } else {
        // logger.info(`❌ Table ${table} 不存在`);
      }
    }

    // logger.info('🎉 生產環境DatabaseSettingsComplete！');
      } finally {
    await client.end();
  }
}

// 如果直接運Row此腳本
if (require.main === module) {
  setupProductionDatabase()
    .then(() => {
      // logger.info('✅ 腳本執RowComplete');
      process.exit(0);
    })
    .catch((error) => {
      // logger.info('❌ 腳本執RowFailed:', error);
      process.exit(1);
    });
}

module.exports = { setupProductionDatabase };

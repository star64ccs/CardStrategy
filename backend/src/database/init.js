const { Client } = require('pg');
const logger = require('../utils/logger');

const initDatabase = async () => {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'sweetcorn831',
    database: 'postgres', // Connect到DefaultDatabase
  });

  try {
    await client.connect();
    logger.info('已Connect到 PostgreSQL Server');

    // CheckDatabaseYesNo存在
    const dbCheckResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'cardstrategy'"
    );

    if (dbCheckResult.rows.length === 0) {
      // CreateDatabase
      await client.query('CREATE DATABASE cardstrategy');
      logger.info('✅ 數據庫 cardstrategy CreateSuccess');
    } else {
      logger.info('數據庫 cardstrategy 已存在');
    }

    await client.end();
    logger.info('數據庫初始化完成');
  } catch (error) {
    logger.error('❌ 數據庫InitializeFailed：', error.message);
    throw error;
  }
};

// 如果直接運Row此腳本
if (require.main === module) {
  initDatabase()
    .then(() => {
      logger.info('數據庫初始化完成，現在可以運行遷移腳本');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('數據庫InitializeFailed：', error);
      process.exit(1);
    });
}

module.exports = initDatabase;

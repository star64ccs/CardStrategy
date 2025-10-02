const { Client } = require('pg');
const logger = require('../utils/logger');

const initDatabase = async () => {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'sweetcorn831',
    database: 'postgres', // 連接到默認數據庫
  });

  try {
    await client.connect();
    logger.info('已連接到 PostgreSQL 服務器');

    // 檢查數據庫是否存在
    const dbCheckResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'cardstrategy'"
    );

    if (dbCheckResult.rows.length === 0) {
      // 創建數據庫
      await client.query('CREATE DATABASE cardstrategy');
      logger.info('✅ 數據庫 cardstrategy 創建成功');
    } else {
      logger.info('數據庫 cardstrategy 已存在');
    }

    await client.end();
    logger.info('數據庫初始化完成');
  } catch (error) {
    logger.error('❌ 數據庫初始化失敗：', error.message);
    throw error;
  }
};

// 如果直接運行此腳本
if (require.main === module) {
  initDatabase()
    .then(() => {
      logger.info('數據庫初始化完成，現在可以運行遷移腳本');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('數據庫初始化失敗：', error);
      process.exit(1);
    });
}

module.exports = initDatabase;

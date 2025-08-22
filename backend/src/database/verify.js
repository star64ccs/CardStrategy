require('dotenv').config({
  path: require('path').resolve(__dirname, '..', '..', '.env'),
});

const { connectDB, getSequelize } = require('../config/database');
const logger = require('../utils/logger');

const verifyDatabase = async () => {
  try {
    logger.info('開始驗證數據庫表結構...');

    // 連接數據庫
    await connectDB();
    const sequelize = getSequelize();

    if (!sequelize) {
      throw new Error('無法獲取 Sequelize 實例');
    }

    // 獲取所有表
    const tables = await sequelize.showAllSchemas();
    logger.info('數據庫中的所有表：');

    const expectedTables = [
      'users',
      'cards',
      'collections',
      'investments',
      'collection_cards',
      'price_alerts',
    ];

    for (const table of expectedTables) {
      const exists = tables.some((t) => t.name === table);
      if (exists) {
        logger.info(`✅ ${table} - 存在`);
      } else {
        logger.error(`❌ ${table} - 缺失`);
      }
    }

    // 檢查表結構
    logger.info('\n檢查表結構詳情...');

    for (const tableName of expectedTables) {
      try {
        const [results] = await sequelize.query(
          `SELECT column_name, data_type, is_nullable, column_default 
           FROM information_schema.columns 
           WHERE table_name = '${tableName}' 
           ORDER BY ordinal_position`
        );

        logger.info(`\n📋 ${tableName} 表結構：`);
        results.forEach((col) => {
          const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const defaultValue = col.column_default
            ? ` DEFAULT ${col.column_default}`
            : '';
          logger.info(
            `  - ${col.column_name}: ${col.data_type} ${nullable}${defaultValue}`
          );
        });
      } catch (error) {
        logger.error(`無法獲取 ${tableName} 表結構：`, error.message);
      }
    }

    // 檢查外鍵約束
    logger.info('\n檢查外鍵約束...');
    const [foreignKeys] = await sequelize.query(`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name, kcu.column_name
    `);

    logger.info('外鍵約束：');
    foreignKeys.forEach((fk) => {
      logger.info(
        `  - ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`
      );
    });

    logger.info('\n✅ 數據庫驗證完成！');
    process.exit(0);
  } catch (error) {
    logger.error('❌ 數據庫驗證失敗：', error.message);
    logger.error('錯誤詳情：', error);
    process.exit(1);
  }
};

// 如果直接運行此腳本
if (require.main === module) {
  verifyDatabase();
}

module.exports = verifyDatabase;

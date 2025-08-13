const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

let sequelize;

const connectDB = async () => {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      logger.error('DATABASE_URL environment variable is not set');
      process.exit(1);
    }

    sequelize = new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });

    await sequelize.authenticate();
    logger.info('PostgreSQL連接成功');

    // 同步所有模型到數據庫
    await sequelize.sync({ alter: true });
    logger.info('數據庫表同步完成');

  } catch (error) {
    logger.error('PostgreSQL連接失敗:', error.message);
    // 不要立即退出，讓服務繼續運行
    logger.warn('服務將在沒有數據庫連接的情況下運行');
  }
};

const getSequelize = () => sequelize;

module.exports = { connectDB, getSequelize };

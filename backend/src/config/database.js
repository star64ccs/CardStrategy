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
      logging: false, // 關閉SQL日誌
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });

    await sequelize.authenticate();
    logger.info('PostgreSQL連接成功');
    
    // 監聽連接事件
    sequelize.addHook('afterConnect', () => {
      logger.info('PostgreSQL連接建立');
    });

  } catch (error) {
    logger.error('PostgreSQL連接失敗:', error.message);
    process.exit(1);
  }
};

const getSequelize = () => sequelize;

module.exports = { connectDB, getSequelize };

const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// DatabaseConfigure
const config = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'cardstrategy_dev',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'cardstrategy_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};

// Get當前環境Configure
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create Sequelize Instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  }
);

// Import所有模型
const getCardModel = require('../models/Card');
const getMarketDataModel = require('../models/MarketData');
const getPredictionModel = require('../models/PredictionModel');
const getModelPersistenceModel = require('../models/ModelPersistence');

// Initialize模型
const Card = getCardModel();
const MarketData = getMarketDataModel();
const PredictionModel = getPredictionModel();
// const ModelPersistence = getModelPersistenceModel(); // 暫時Comment

// 定義模型Off聯
const defineAssociations = () => {
  // Card 與 MarketData 的一對多Off係
  Card.hasMany(MarketData, {
    foreignKey: 'cardId',
    as: 'marketData',
    onDelete: 'CASCADE',
  });
  MarketData.belongsTo(Card, {
    foreignKey: 'cardId',
    as: 'card',
  });

  // Card 與 PredictionModel 的一對多Off係
  Card.hasMany(PredictionModel, {
    foreignKey: 'cardId',
    as: 'predictions',
    onDelete: 'CASCADE',
  });
  PredictionModel.belongsTo(Card, {
    foreignKey: 'cardId',
    as: 'card',
  });

  // ModelPersistence 沒有直接Off聯，但可以通過 cardId Off聯到 Card
  // 這裡可以Add間接Off聯如果需要
};

// DatabaseConnectTest
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('數據庫ConnectSuccess');
    return true;
  } catch (error) {
    logger.error('數據庫ConnectFailed:', error);
    return false;
  }
};

// SyncDatabase（On發環境）
const syncDatabase = async (force = false) => {
  try {
    if (env === 'development' || force) {
      await sequelize.sync({ force });
      logger.info('數據庫同步完成');

      // 定義Off聯
      defineAssociations();

      return true;
    }
    logger.warn('生產環境不允許強制同步數據庫');
    return false;
  } catch (error) {
    logger.error('數據庫同步Failed:', error);
    return false;
  }
};

// Off閉DatabaseConnect
const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info('數據庫Connect已關閉');
  } catch (error) {
    logger.error('關閉數據庫ConnectFailed:', error);
  }
};

module.exports = {
  sequelize,
  Card,
  MarketData,
  PredictionModel,
  ModelPersistence,
  testConnection,
  syncDatabase,
  closeConnection,
  config: dbConfig,
};

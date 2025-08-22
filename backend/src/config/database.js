const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// 數據庫配置
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

// 獲取當前環境配置
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// 創建 Sequelize 實例
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

// 導入所有模型
const getCardModel = require('../models/Card');
const getMarketDataModel = require('../models/MarketData');
const getPredictionModel = require('../models/PredictionModel');
const getModelPersistenceModel = require('../models/ModelPersistence');

// 初始化模型
const Card = getCardModel();
const MarketData = getMarketDataModel();
const PredictionModel = getPredictionModel();
// const ModelPersistence = getModelPersistenceModel(); // 暫時註釋

// 定義模型關聯
const defineAssociations = () => {
  // Card 與 MarketData 的一對多關係
  Card.hasMany(MarketData, {
    foreignKey: 'cardId',
    as: 'marketData',
    onDelete: 'CASCADE',
  });
  MarketData.belongsTo(Card, {
    foreignKey: 'cardId',
    as: 'card',
  });

  // Card 與 PredictionModel 的一對多關係
  Card.hasMany(PredictionModel, {
    foreignKey: 'cardId',
    as: 'predictions',
    onDelete: 'CASCADE',
  });
  PredictionModel.belongsTo(Card, {
    foreignKey: 'cardId',
    as: 'card',
  });

  // ModelPersistence 沒有直接關聯，但可以通過 cardId 關聯到 Card
  // 這裡可以添加間接關聯如果需要
};

// 數據庫連接測試
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('數據庫連接成功');
    return true;
  } catch (error) {
    logger.error('數據庫連接失敗:', error);
    return false;
  }
};

// 同步數據庫（開發環境）
const syncDatabase = async (force = false) => {
  try {
    if (env === 'development' || force) {
      await sequelize.sync({ force });
      logger.info('數據庫同步完成');

      // 定義關聯
      defineAssociations();

      return true;
    }
    logger.warn('生產環境不允許強制同步數據庫');
    return false;
  } catch (error) {
    logger.error('數據庫同步失敗:', error);
    return false;
  }
};

// 關閉數據庫連接
const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info('數據庫連接已關閉');
  } catch (error) {
    logger.error('關閉數據庫連接失敗:', error);
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

const { Sequelize } = require('sequelize');
const { config } = require('./unified');

// 創建 Sequelize 實例
const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres', // 明確指定 dialect
    logging: config.database.logging,
    pool: config.database.pool,

    // 連接池配置
    pool: {
      max: config.database.pool.max,
      min: config.database.pool.min,
      acquire: config.database.pool.acquire,
      idle: config.database.pool.idle,
    },

    // 查詢優化
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },

    // 時區設置
    timezone: '+08:00',

    // 查詢超時
    query: {
      timeout: 30000,
    },
  }
);

// 測試連接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    console.error('數據庫連接失敗:', error);
    return false;
  }
};

// 初始化數據庫
const initDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
  } catch (error) {
    console.error('數據庫同步失敗:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  initDatabase,
};

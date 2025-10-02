const { Sequelize } = require('sequelize');
const { config } = require('./unified');

// Create Sequelize Instance
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

    // Connect池Configure
    pool: {
      max: config.database.pool.max,
      min: config.database.pool.min,
      acquire: config.database.pool.acquire,
      idle: config.database.pool.idle,
    },

    // Query優化
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },

    // TimezoneSettings
    timezone: '+08:00',

    // Query超時
    query: {
      timeout: 30000,
    },
  }
);

// TestConnect
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('數據庫ConnectFailed:', error);
    return false;
  }
};

// InitializeDatabase
const initDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('數據庫同步Failed:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  initDatabase,
};

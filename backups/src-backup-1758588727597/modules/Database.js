// 數據庫模塊索引
// 生成時間: 2025-09-22T01:59:58.522Z

// 核心模塊
const DatabaseManager = require('./utils/database/DatabaseManager');
const ConnectionManager = require('./utils/database/ConnectionManager');
const DatabaseTools = require('./utils/database/DatabaseTools');

// 配置
const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cardstrategy',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || ''
};

module.exports = {
  // 核心功能
  DatabaseManager,
  ConnectionManager,
  DatabaseTools,
  
  // 配置
  databaseConfig,
  
  // 初始化函數
  async initializeDatabase() {
    console.log('🚀 初始化數據庫系統...');
    
    try {
      // 初始化連接管理器
      const connectionManager = new ConnectionManager(databaseConfig);
      await connectionManager.connect();
      
      // 初始化數據庫管理器
      const databaseManager = new DatabaseManager(connectionManager);
      await databaseManager.initialize();
      
      console.log('✅ 數據庫系統初始化完成');
      return {
        connectionManager,
        databaseManager
      };
    } catch (error) {
      console.error('❌ 數據庫系統初始化失敗:', error);
      throw error;
    }
  }
};

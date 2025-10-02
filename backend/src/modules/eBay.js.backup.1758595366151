// eBay模塊索引
// 生成時間: 2025-09-22T02:05:45.764Z

// 核心模塊
const EBayCollector = require('./crawlers/ebay/EBayCollector');
const EBayAuth = require('./crawlers/ebay/EBayAuth');

// 配置
const ebayConfig = require('./config/ebay/tokens.json');

// 工具
const EBayTools = require('./crawlers/ebay/EBayTools');
const EBayConfigs = require('./config/ebay/EBayConfigs');

module.exports = {
  // 核心功能
  EBayCollector,
  EBayAuth,
  
  // 配置
  ebayConfig,
  
  // 工具
  EBayTools,
  EBayConfigs,
  
  // 初始化函數
  async initializeEBay() {
    console.log('🚀 初始化eBay系統...');
    
    try {
      // 初始化認證
      const auth = new EBayAuth();
      await auth.initialize();
      
      // 初始化收集器
      const collector = new EBayCollector();
      await collector.initialize();
      
      console.log('✅ eBay系統初始化完成');
      return {
        auth,
        collector
      };
    } catch (error) {
      console.error('❌ eBay系統初始化失敗:', error);
      throw error;
    }
  }
};

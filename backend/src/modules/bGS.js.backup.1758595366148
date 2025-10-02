// BGS模塊索引
// 生成時間: 2025-09-22T01:59:58.521Z

// 核心模塊
const BGSCrawler = require('./crawlers/BGSCrawler');
const BGSAnalyzer = require('./analyzers/anti-counterfeiting/BGSAnalyzer');
const BGSApi = require('./api/bgs/BGSApi');
const BGSWorker = require('./workers/data-collection/BGSWorker');
const BGSScheduler = require('./workers/data-collection/BGSScheduler');

// 配置
const bgsConfig = require('./config/bgs/schedule.json');

// 工具
const BGSTools = require('./workers/data-collection/BGSTools');
const BGSConfigs = require('./config/bgs/BGSConfigs');

module.exports = {
  // 核心功能
  BGSCrawler,
  BGSAnalyzer,
  BGSApi,
  BGSWorker,
  BGSScheduler,
  
  // 配置
  bgsConfig,
  
  // 工具
  BGSTools,
  BGSConfigs,
  
  // 初始化函數
  async initializeBGS() {
    console.log('🚀 初始化BGS系統...');
    
    try {
      // 初始化爬蟲
      const crawler = new BGSCrawler();
      await crawler.initialize();
      
      // 初始化分析器
      const analyzer = new BGSAnalyzer();
      await analyzer.initialize();
      
      // 初始化API
      const api = new BGSApi();
      await api.initialize();
      
      // 初始化Worker
      const worker = new BGSWorker();
      await worker.initialize();
      
      // 啟動調度器
      const scheduler = new BGSScheduler();
      await scheduler.start();
      
      console.log('✅ BGS系統初始化完成');
      return {
        crawler,
        analyzer,
        api,
        worker,
        scheduler
      };
    } catch (error) {
      console.error('❌ BGS系統初始化失敗:', error);
      throw error;
    }
  }
};

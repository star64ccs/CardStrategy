// 統一Worker管理器
// 生成時間: 2025-09-22T02:15:32.643Z

const config = require('../config');
const { EventEmitter } = require('events');

class UnifiedWorkerManager extends EventEmitter {
  constructor() {
    super();
    this.workers = new Map();
    this.isRunning = false;
    this.healthCheckInterval = null;
  }

  // 初始化所有Workers
  async initialize() {
    console.log('🚀 初始化統一Worker管理器...');
    
    try {
      // 導入所有Worker模塊
      const DataCollectionWorker = require('./data-collection/DataCollectionWorker');
      const PriceUpdateWorker = require('./price-update/PriceUpdateWorker');
      const ImageProcessingWorker = require('./image-processing/ImageProcessingWorker');
      const FeedbackProcessingWorker = require('./feedback-processing/FeedbackProcessingWorker');
      const ModelTrainingWorker = require('./model-training/ModelTrainingWorker');
      const QualityMonitoringWorker = require('./quality-monitoring/QualityMonitoringWorker');
      
      // 創建Worker實例
      const workerConfigs = [
        { name: 'dataCollection', Worker: DataCollectionWorker, config: config.workers.dataCollection },
        { name: 'priceUpdate', Worker: PriceUpdateWorker, config: config.workers.priceUpdate },
        { name: 'imageProcessing', Worker: ImageProcessingWorker, config: config.workers.imageProcessing },
        { name: 'feedbackProcessing', Worker: FeedbackProcessingWorker, config: config.workers.feedbackProcessing },
        { name: 'modelTraining', Worker: ModelTrainingWorker, config: config.workers.modelTraining },
        { name: 'qualityMonitoring', Worker: QualityMonitoringWorker, config: config.workers.qualityMonitoring }
      ];

      for (const { name, Worker, config: workerConfig } of workerConfigs) {
        if (workerConfig.enabled) {
          const worker = new Worker(workerConfig);
          await worker.initialize();
          this.workers.set(name, worker);
          console.log(`✅ ${name} Worker已初始化`);
        }
      }

      console.log('✅ 統一Worker管理器初始化完成');
    } catch (error) {
      console.error('❌ 統一Worker管理器初始化失敗:', error);
      throw error;
    }
  }

  // 啟動所有Workers
  async start() {
    console.log('🚀 啟動所有Workers...');
    
    try {
      for (const [name, worker] of this.workers) {
        await worker.start();
        console.log(`✅ ${name} Worker已啟動`);
      }

      this.isRunning = true;
      this.startHealthCheck();
      console.log('✅ 所有Workers已啟動');
    } catch (error) {
      console.error('❌ 啟動Workers失敗:', error);
      throw error;
    }
  }

  // 停止所有Workers
  async stop() {
    console.log('🛑 停止所有Workers...');
    
    try {
      for (const [name, worker] of this.workers) {
        await worker.stop();
        console.log(`✅ ${name} Worker已停止`);
      }

      this.isRunning = false;
      this.stopHealthCheck();
      console.log('✅ 所有Workers已停止');
    } catch (error) {
      console.error('❌ 停止Workers失敗:', error);
      throw error;
    }
  }

  // 啟動健康檢查
  startHealthCheck() {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 60000); // 每分鐘檢查一次
  }

  // 停止健康檢查
  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  // 執行健康檢查
  async performHealthCheck() {
    const healthStatus = {};
    
    for (const [name, worker] of this.workers) {
      try {
        const status = await worker.getStatus();
        healthStatus[name] = status;
      } catch (error) {
        healthStatus[name] = { status: 'error', error: error.message };
      }
    }

    this.emit('healthCheck', healthStatus);
  }

  // 獲取所有Worker狀態
  async getStatus() {
    const status = {
      isRunning: this.isRunning,
      workers: {}
    };

    for (const [name, worker] of this.workers) {
      status.workers[name] = await worker.getStatus();
    }

    return status;
  }
}

module.exports = UnifiedWorkerManager;

// Worker基類
// 生成時間: 2025-09-22T02:15:32.643Z

const { EventEmitter } = require('events');
const cron = require('node-cron');

class BaseWorker extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.isRunning = false;
    this.lastExecution = null;
    this.executionCount = 0;
    this.errorCount = 0;
    this.cronJob = null;
  }

  // 初始化Worker
  async initialize() {
    console.log(`🚀 初始化${this.constructor.name}...`);
    // 子類實現具體的初始化邏輯
  }

  // 啟動Worker
  async start() {
    if (this.isRunning) {
      console.log(`⚠️ ${this.constructor.name}已在運行中`);
      return;
    }

    console.log(`🚀 啟動${this.constructor.name}...`);
    
    try {
      // 設置定時任務
      if (this.config.interval && cron.validate(this.config.interval)) {
        this.cronJob = cron.schedule(this.config.interval, async () => {
          await this.execute();
        });
        console.log(`✅ ${this.constructor.name}定時任務已設置: ${this.config.interval}`);
      }

      this.isRunning = true;
      this.emit('started');
    } catch (error) {
      console.error(`❌ 啟動${this.constructor.name}失敗:`, error);
      throw error;
    }
  }

  // 停止Worker
  async stop() {
    if (!this.isRunning) {
      console.log(`⚠️ ${this.constructor.name}未在運行`);
      return;
    }

    console.log(`🛑 停止${this.constructor.name}...`);
    
    try {
      if (this.cronJob) {
        this.cronJob.destroy();
        this.cronJob = null;
      }

      this.isRunning = false;
      this.emit('stopped');
    } catch (error) {
      console.error(`❌ 停止${this.constructor.name}失敗:`, error);
      throw error;
    }
  }

  // 執行Worker任務
  async execute() {
    const startTime = Date.now();
    console.log(`🔄 執行${this.constructor.name}任務...`);

    try {
      await this.performTask();
      
      const duration = Date.now() - startTime;
      this.lastExecution = new Date();
      this.executionCount++;
      
      console.log(`✅ ${this.constructor.name}任務完成，耗時: ${duration}ms`);
      this.emit('completed', { duration, executionCount: this.executionCount });
    } catch (error) {
      this.errorCount++;
      console.error(`❌ ${this.constructor.name}任務失敗:`, error);
      this.emit('error', error);
    }
  }

  // 執行具體任務（子類實現）
  async performTask() {
    throw new Error('performTask方法必須由子類實現');
  }

  // 獲取Worker狀態
  async getStatus() {
    return {
      name: this.constructor.name,
      isRunning: this.isRunning,
      lastExecution: this.lastExecution,
      executionCount: this.executionCount,
      errorCount: this.errorCount,
      config: this.config
    };
  }

  // 健康檢查
  async healthCheck() {
    try {
      // 基本的健康檢查邏輯
      return {
        status: 'healthy',
        timestamp: new Date(),
        executionCount: this.executionCount,
        errorCount: this.errorCount
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date()
      };
    }
  }
}

module.exports = BaseWorker;

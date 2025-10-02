#!/usr/bin/env node

/**
 * BGS數據收集調度器
 * 設置定期執行BGS數據收集任務
 */

const cron = require('node-cron');
const BGSSimpleWorker = require('./src/workers/data-collection/BGSWorker.js');

class BGSScheduler {
  constructor() {
    this.worker = new BGSSimpleWorker();
    this.scheduledTasks = {};
    this.isRunning = false;
    this.config = {
      schedules: {
        // 每8小時執行一次BGS數據收集
        bgsDataCollection: {
          cron: '0 */8 * * *', // 每8小時的整點執行
          enabled: true,
          description: 'BGS數據收集 - 每8小時執行一次',
        },
        // 每天凌晨2點執行一次完整掃描
        fullScan: {
          cron: '0 2 * * *', // 每天凌晨2點
          enabled: true,
          description: 'BGS完整掃描 - 每天凌晨2點執行',
        },
        // 每週日晚上10點執行一次週報
        weeklyReport: {
          cron: '0 22 * * 0', // 每週日晚上10點
          enabled: true,
          description: 'BGS週報生成 - 每週日晚上10點執行',
        },
      },
      system: {
        maxConcurrentTasks: 1,
        retryFailedTasks: true,
        maxRetries: 3,
        retryDelay: 300000, // 5分鐘
        logLevel: 'info',
      },
    };
  }

  /**
   * 啟動調度器
   */
  async startScheduler() {
    if (this.isRunning) {
      console.log('⚠️ BGS調度器已經在運行中');
      return;
    }

    console.log('🚀 啟動BGS數據收集調度器...');

    try {
      // 設置所有調度任務
      await this.setupScheduledTasks();

      this.isRunning = true;
      console.log('✅ BGS調度器啟動成功');
      console.log('📅 調度任務:');
      Object.keys(this.scheduledTasks).forEach(taskName => {
        const task = this.scheduledTasks[taskName];
        console.log(`   - ${taskName}: ${task.schedule} (${task.description})`);
      });

      // 設置系統監控
      this.setupSystemMonitoring();

      // 保持程序運行
      this.keepAlive();
    } catch (error) {
      console.error('❌ BGS調度器啟動失敗:', error);
      throw error;
    }
  }

  /**
   * 設置調度任務
   */
  async setupScheduledTasks() {
    for (const [taskName, config] of Object.entries(this.config.schedules)) {
      if (config.enabled) {
        await this.scheduleTask(taskName, config);
      }
    }
  }

  /**
   * 調度單個任務
   */
  async scheduleTask(taskName, config) {
    try {
      const task = cron.schedule(
        config.cron,
        async () => {
          console.log(`\n🕐 執行調度任務: ${taskName} (${config.description})`);
          await this.executeScheduledTask(taskName);
        },
        {
          scheduled: false,
          timezone: 'Asia/Taipei',
        }
      );

      this.scheduledTasks[taskName] = {
        cron: task,
        schedule: config.cron,
        description: config.description,
        lastExecution: null,
        nextExecution: null,
        executionCount: 0,
        successCount: 0,
        failCount: 0,
      };

      // 啟動任務
      task.start();

      // 計算下次執行時間
      this.updateNextExecutionTime(taskName);

      console.log(`✅ 任務 ${taskName} 已調度: ${config.cron}`);
    } catch (error) {
      console.error(`❌ 調度任務 ${taskName} 失敗:`, error);
    }
  }

  /**
   * 執行調度任務
   */
  async executeScheduledTask(taskName) {
    const task = this.scheduledTasks[taskName];
    if (!task) {
      console.error(`❌ 找不到任務: ${taskName}`);
      return;
    }

    task.lastExecution = new Date();
    task.executionCount++;

    try {
      let result;

      switch (taskName) {
        case 'bgsDataCollection':
          result = await this.executeBGSDataCollection();
          break;
        case 'fullScan':
          result = await this.executeFullScan();
          break;
        case 'weeklyReport':
          result = await this.executeWeeklyReport();
          break;
        default:
          throw new Error(`未知的任務類型: ${taskName}`);
      }

      task.successCount++;
      console.log(`✅ 任務 ${taskName} 執行成功:`, result);

      // 更新下次執行時間
      this.updateNextExecutionTime(taskName);
    } catch (error) {
      task.failCount++;
      console.error(`❌ 任務 ${taskName} 執行失敗:`, error);

      // 如果啟用重試，安排重試
      if (
        this.config.system.retryFailedTasks &&
        task.failCount <= this.config.system.maxRetries
      ) {
        console.log(
          `🔄 安排任務 ${taskName} 重試 (${task.failCount}/${this.config.system.maxRetries})`
        );
        setTimeout(() => {
          this.executeScheduledTask(taskName);
        }, this.config.system.retryDelay);
      }
    }
  }

  /**
   * 執行BGS數據收集任務
   */
  async executeBGSDataCollection() {
    console.log('🔄 執行BGS數據收集任務...');
    const result = await this.worker.executeBGSTask();
    console.log('✅ BGS數據收集任務完成:', result);
    return result;
  }

  /**
   * 執行完整掃描任務
   */
  async executeFullScan() {
    console.log('🔍 執行BGS完整掃描任務...');

    // 獲取所有需要BGS數據的卡片
    const allCards = await this.worker.getCardsForBGSCollection();
    console.log(`📊 完整掃描找到 ${allCards.length} 張卡片需要BGS數據`);

    // 分批處理
    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < allCards.length; i += batchSize) {
      batches.push(allCards.slice(i, i + batchSize));
    }

    let totalProcessed = 0;
    let totalSuccess = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(
        `📦 處理批次 ${i + 1}/${batches.length} (${batch.length} 張卡片)`
      );

      // 臨時修改worker的配置以處理更多卡片
      const originalMaxCards = this.worker.config.maxCardsPerRun;
      this.worker.config.maxCardsPerRun = batch.length;

      try {
        const result = await this.worker.executeBGSTask();
        totalProcessed += result.processed;
        totalSuccess += result.collected;
      } catch (error) {
        console.error(`❌ 批次 ${i + 1} 處理失敗:`, error);
      }

      // 恢復原始配置
      this.worker.config.maxCardsPerRun = originalMaxCards;

      // 批次間延遲
      if (i < batches.length - 1) {
        console.log('⏳ 批次間延遲 30 秒...');
        await this.delay(30000);
      }
    }

    const result = {
      success: true,
      totalBatches: batches.length,
      totalProcessed,
      totalSuccess,
      totalFailed: totalProcessed - totalSuccess,
    };

    console.log('✅ BGS完整掃描任務完成:', result);
    return result;
  }

  /**
   * 執行週報任務
   */
  async executeWeeklyReport() {
    console.log('📊 生成BGS週報...');

    const report = {
      period: '本週',
      generatedAt: new Date(),
      statistics: {},
      trends: {},
      recommendations: [],
    };

    // 獲取統計數據
    const stats = await this.generateBGSStatistics();
    report.statistics = stats;

    // 生成趨勢分析
    const trends = await this.generateBGSTrends();
    report.trends = trends;

    // 生成建議
    const recommendations = await this.generateBGSRecommendations(stats);
    report.recommendations = recommendations;

    // 保存報告
    await this.saveWeeklyReport(report);

    console.log('✅ BGS週報生成完成:', report);
    return report;
  }

  /**
   * 生成BGS統計數據
   */
  async generateBGSStatistics() {
    try {
      const result = await this.worker.pool.query(`
        SELECT 
          COUNT(*) as total_records,
          COUNT(DISTINCT card_id) as unique_cards,
          AVG(grade) as avg_grade,
          MAX(grade) as max_grade,
          MIN(grade) as min_grade,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as records_this_week
        FROM grading_data 
        WHERE grading_company = 'BGS'
      `);

      return result.rows[0];
    } catch (error) {
      console.error('❌ 生成BGS統計數據失敗:', error);
      return {};
    }
  }

  /**
   * 生成BGS趨勢分析
   */
  async generateBGSTrends() {
    try {
      const result = await this.worker.pool.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as records_count,
          AVG(grade) as avg_grade
        FROM grading_data 
        WHERE grading_company = 'BGS'
          AND created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY date
      `);

      return result.rows;
    } catch (error) {
      console.error('❌ 生成BGS趨勢分析失敗:', error);
      return [];
    }
  }

  /**
   * 生成BGS建議
   */
  async generateBGSRecommendations(stats) {
    const recommendations = [];

    if (stats.total_records < 1000) {
      recommendations.push('建議增加BGS數據收集頻率以獲得更全面的數據');
    }

    if (stats.avg_grade && stats.avg_grade < 8.0) {
      recommendations.push('平均評級較低，建議檢查數據質量');
    }

    if (stats.records_this_week < 50) {
      recommendations.push('本週數據收集量較少，建議調整收集策略');
    }

    return recommendations;
  }

  /**
   * 保存週報
   */
  async saveWeeklyReport(report) {
    try {
      const fs = require('fs').promises;
      const reportContent = JSON.stringify(report, null, 2);
      const filename = `bgs-weekly-report-${
        new Date().toISOString().split('T')[0]
      }.json`;
      await fs.writeFile(filename, reportContent);
      console.log(`📄 週報已保存: ${filename}`);
    } catch (error) {
      console.error('❌ 保存週報失敗:', error);
    }
  }

  /**
   * 更新下次執行時間
   */
  updateNextExecutionTime(taskName) {
    // 這裡可以實現計算下次執行時間的邏輯
    // 簡化版本，實際應用中可以使用更複雜的計算
  }

  /**
   * 設置系統監控
   */
  setupSystemMonitoring() {
    // 每小時輸出系統狀態
    setInterval(() => {
      this.logSystemStatus();
    }, 60 * 60 * 1000); // 1小時
  }

  /**
   * 記錄系統狀態
   */
  logSystemStatus() {
    console.log('\n📊 BGS調度器系統狀態:');
    console.log(`   運行狀態: ${this.isRunning ? '運行中' : '已停止'}`);
    console.log(`   調度任務數: ${Object.keys(this.scheduledTasks).length}`);

    Object.entries(this.scheduledTasks).forEach(([taskName, task]) => {
      console.log(`   ${taskName}:`);
      console.log(`     執行次數: ${task.executionCount}`);
      console.log(`     成功次數: ${task.successCount}`);
      console.log(`     失敗次數: ${task.failCount}`);
      console.log(`     上次執行: ${task.lastExecution || '未執行'}`);
    });
  }

  /**
   * 保持程序運行
   */
  keepAlive() {
    console.log('\n🔄 BGS調度器正在運行中...');
    console.log('按 Ctrl+C 停止調度器');

    // 處理程序退出
    process.on('SIGINT', () => {
      console.log('\n🛑 收到停止信號，正在關閉BGS調度器...');
      this.stopScheduler();
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 收到終止信號，正在關閉BGS調度器...');
      this.stopScheduler();
    });
  }

  /**
   * 停止調度器
   */
  async stopScheduler() {
    if (!this.isRunning) {
      return;
    }

    console.log('🔄 正在停止所有調度任務...');

    // 停止所有調度任務
    Object.values(this.scheduledTasks).forEach(task => {
      task.cron.stop();
    });

    // 關閉worker連接
    await this.worker.close();

    this.isRunning = false;
    console.log('✅ BGS調度器已停止');
    process.exit(0);
  }

  /**
   * 延遲函數
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 如果直接執行此文件
if (require.main === module) {
  const scheduler = new BGSScheduler();

  scheduler.startScheduler().catch(error => {
    console.error('💥 BGS調度器啟動失敗:', error);
    process.exit(1);
  });
}

module.exports = BGSScheduler;

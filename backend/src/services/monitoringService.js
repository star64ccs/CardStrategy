const os = require('os');
const process = require('process');
const logger = require('../utils/logger');
const { sequelize } = require('../config/database');
const databaseOptimizer = require('./databaseOptimizer');
const performanceMiddleware = require('../middleware/performance');

class MonitoringService {
  constructor() {
    this.metrics = {
      system: {},
      application: {},
      database: {},
      performance: {},
      errors: []
    };
    this.startTime = Date.now();
    this.monitoringInterval = null;
    this.alertThresholds = {
      cpu: 80, // CPU 使用率閾值
      memory: 85, // 內存使用率閾值
      disk: 90, // 磁盤使用率閾值
      responseTime: 2000, // 響應時間閾值 (ms)
      errorRate: 5 // 錯誤率閾值 (%)
    };
  }

  /**
   * 初始化監控服務
   */
  async initialize() {
    try {
      logger.info('初始化監控服務...');

      // 開始定期監控
      this.startPeriodicMonitoring();

      // 設置系統事件監聽器
      this.setupEventListeners();

      logger.info('監控服務初始化完成');
    } catch (error) {
      logger.error('監控服務初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 開始定期監控
   */
  startPeriodicMonitoring() {
    // 每 30 秒收集一次系統指標
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectSystemMetrics();
        await this.collectApplicationMetrics();
        await this.collectDatabaseMetrics();
        await this.collectPerformanceMetrics();
        await this.checkAlertThresholds();
      } catch (error) {
        logger.error('監控數據收集失敗:', error);
      }
    }, 30000);

    logger.info('定期監控已啟動 (30秒間隔)');
  }

  /**
   * 設置事件監聽器
   */
  setupEventListeners() {
    // 監聽未捕獲的異常
    process.on('uncaughtException', (error) => {
      this.recordError('uncaughtException', error);
    });

    // 監聽未處理的 Promise 拒絕
    process.on('unhandledRejection', (reason, promise) => {
      this.recordError('unhandledRejection', reason);
    });

    // 監聽內存警告
    process.on('warning', (warning) => {
      this.recordWarning(warning);
    });

    logger.info('系統事件監聽器已設置');
  }

  /**
   * 收集系統指標
   */
  async collectSystemMetrics() {
    try {
      const cpuUsage = os.loadavg();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercent = (usedMemory / totalMemory) * 100;

      this.metrics.system = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        cpu: {
          loadAverage: cpuUsage,
          cores: os.cpus().length
        },
        memory: {
          total: totalMemory,
          free: freeMemory,
          used: usedMemory,
          usagePercent: memoryUsagePercent
        },
        network: {
          interfaces: os.networkInterfaces()
        }
      };

      logger.debug('系統指標已收集');
    } catch (error) {
      logger.error('收集系統指標失敗:', error);
    }
  }

  /**
   * 收集應用程序指標
   */
  async collectApplicationMetrics() {
    try {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      this.metrics.application = {
        timestamp: new Date().toISOString(),
        pid: process.pid,
        version: process.version,
        memory: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external,
          arrayBuffers: memoryUsage.arrayBuffers
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        uptime: process.uptime(),
        startTime: this.startTime
      };

      logger.debug('應用程序指標已收集');
    } catch (error) {
      logger.error('收集應用程序指標失敗:', error);
    }
  }

  /**
   * 收集數據庫指標
   */
  async collectDatabaseMetrics() {
    try {
      const dbStats = await databaseOptimizer.getQueryStatsReport();
      const poolStats = await this.getDatabasePoolStats();

      this.metrics.database = {
        timestamp: new Date().toISOString(),
        connection: {
          status: sequelize.authenticate() ? 'connected' : 'disconnected'
        },
        pool: poolStats,
        queries: dbStats,
        performance: {
          slowQueries: dbStats.slowQueries || 0,
          totalQueries: dbStats.totalQueries || 0,
          averageResponseTime: dbStats.averageResponseTime || 0
        }
      };

      logger.debug('數據庫指標已收集');
    } catch (error) {
      logger.error('收集數據庫指標失敗:', error);
    }
  }

  /**
   * 收集性能指標
   */
  async collectPerformanceMetrics() {
    try {
      const perfStats = performanceMiddleware.getPerformanceStats();
      const cacheStats = performanceMiddleware.getCacheStats();

      this.metrics.performance = {
        timestamp: new Date().toISOString(),
        responseTime: {
          average: perfStats.averageResponseTime || 0,
          min: perfStats.minResponseTime || 0,
          max: perfStats.maxResponseTime || 0,
          p95: perfStats.p95ResponseTime || 0,
          p99: perfStats.p99ResponseTime || 0
        },
        requests: {
          total: perfStats.totalRequests || 0,
          successful: perfStats.successfulRequests || 0,
          failed: perfStats.failedRequests || 0,
          rate: perfStats.requestRate || 0
        },
        cache: {
          hits: cacheStats.hits || 0,
          misses: cacheStats.misses || 0,
          hitRate: cacheStats.hitRate || 0,
          size: cacheStats.size || 0
        }
      };

      logger.debug('性能指標已收集');
    } catch (error) {
      logger.error('收集性能指標失敗:', error);
    }
  }

  /**
   * 獲取數據庫連接池統計
   */
  async getDatabasePoolStats() {
    try {
      const {pool} = sequelize.connectionManager;
      return {
        total: pool.size,
        idle: pool.idle,
        active: pool.length,
        waiting: pool.waiting
      };
    } catch (error) {
      logger.error('獲取數據庫連接池統計失敗:', error);
      return {};
    }
  }

  /**
   * 檢查警報閾值
   */
  async checkAlertThresholds() {
    try {
      const alerts = [];

      // 檢查 CPU 使用率
      const cpuLoad = this.metrics.system.cpu?.loadAverage?.[0] || 0;
      if (cpuLoad > this.alertThresholds.cpu) {
        alerts.push({
          type: 'HIGH_CPU_USAGE',
          severity: 'warning',
          message: `CPU 使用率過高: ${cpuLoad.toFixed(2)}%`,
          timestamp: new Date().toISOString()
        });
      }

      // 檢查內存使用率
      const memoryUsage = this.metrics.system.memory?.usagePercent || 0;
      if (memoryUsage > this.alertThresholds.memory) {
        alerts.push({
          type: 'HIGH_MEMORY_USAGE',
          severity: 'warning',
          message: `內存使用率過高: ${memoryUsage.toFixed(2)}%`,
          timestamp: new Date().toISOString()
        });
      }

      // 檢查響應時間
      const avgResponseTime = this.metrics.performance.responseTime?.average || 0;
      if (avgResponseTime > this.alertThresholds.responseTime) {
        alerts.push({
          type: 'HIGH_RESPONSE_TIME',
          severity: 'warning',
          message: `平均響應時間過高: ${avgResponseTime.toFixed(2)}ms`,
          timestamp: new Date().toISOString()
        });
      }

      // 檢查錯誤率
      const totalRequests = this.metrics.performance.requests?.total || 0;
      const failedRequests = this.metrics.performance.requests?.failed || 0;
      if (totalRequests > 0) {
        const errorRate = (failedRequests / totalRequests) * 100;
        if (errorRate > this.alertThresholds.errorRate) {
          alerts.push({
            type: 'HIGH_ERROR_RATE',
            severity: 'critical',
            message: `錯誤率過高: ${errorRate.toFixed(2)}%`,
            timestamp: new Date().toISOString()
          });
        }
      }

      // 記錄警報
      if (alerts.length > 0) {
        alerts.forEach(alert => {
          logger.warn(`監控警報: ${alert.message}`);
          this.recordAlert(alert);
        });
      }

      return alerts;
    } catch (error) {
      logger.error('檢查警報閾值失敗:', error);
      return [];
    }
  }

  /**
   * 記錄錯誤
   */
  recordError(type, error) {
    const errorRecord = {
      type,
      message: error.message || error,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };

    this.metrics.errors.push(errorRecord);

    // 保持錯誤記錄數量在合理範圍內
    if (this.metrics.errors.length > 100) {
      this.metrics.errors = this.metrics.errors.slice(-50);
    }

    logger.error(`監控記錄錯誤: ${type}`, error);
  }

  /**
   * 記錄警告
   */
  recordWarning(warning) {
    logger.warn(`系統警告: ${warning.name} - ${warning.message}`);
  }

  /**
   * 記錄警報
   */
  recordAlert(alert) {
    // 這裡可以集成外部警報系統，如 Slack、郵件等
    logger.warn(`監控警報: ${alert.type} - ${alert.message}`);
  }

  /**
   * 獲取監控指標
   */
  getMetrics() {
    return {
      ...this.metrics,
      summary: this.generateSummary()
    };
  }

  /**
   * 生成監控摘要
   */
  generateSummary() {
    const {system} = this.metrics;
    const {application} = this.metrics;
    const {performance} = this.metrics;

    return {
      status: 'healthy', // 可以根據警報動態計算
      uptime: application?.uptime || 0,
      memoryUsage: system?.memory?.usagePercent || 0,
      cpuLoad: system?.cpu?.loadAverage?.[0] || 0,
      averageResponseTime: performance?.responseTime?.average || 0,
      requestRate: performance?.requests?.rate || 0,
      errorCount: this.metrics.errors.length,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 獲取健康檢查狀態
   */
  async getHealthStatus() {
    try {
      const dbStatus = await sequelize.authenticate();
      const alerts = await this.checkAlertThresholds();

      const status = {
        overall: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: dbStatus ? 'healthy' : 'unhealthy',
          application: 'healthy',
          system: 'healthy'
        },
        alerts: alerts.length,
        metrics: this.generateSummary()
      };

      // 根據警報數量調整整體狀態
      if (alerts.length > 5) {
        status.overall = 'critical';
      } else if (alerts.length > 0) {
        status.overall = 'warning';
      }

      return status;
    } catch (error) {
      logger.error('獲取健康狀態失敗:', error);
      return {
        overall: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * 清理舊的監控數據
   */
  cleanupOldData() {
    try {
      // 清理超過 24 小時的錯誤記錄
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      this.metrics.errors = this.metrics.errors.filter(error =>
        new Date(error.timestamp) > oneDayAgo
      );

      logger.info('舊監控數據已清理');
    } catch (error) {
      logger.error('清理監控數據失敗:', error);
    }
  }

  /**
   * 停止監控服務
   */
  stop() {
    try {
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = null;
      }

      logger.info('監控服務已停止');
    } catch (error) {
      logger.error('停止監控服務失敗:', error);
    }
  }

  /**
   * 設置警報閾值
   */
  setAlertThresholds(thresholds) {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
    logger.info('警報閾值已更新', this.alertThresholds);
  }

  /**
   * 導出監控報告
   */
  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(),
      system: this.metrics.system,
      application: this.metrics.application,
      database: this.metrics.database,
      performance: this.metrics.performance,
      errors: this.metrics.errors.slice(-10), // 最近 10 個錯誤
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * 生成建議
   */
  generateRecommendations() {
    const recommendations = [];
    const summary = this.generateSummary();

    if (summary.memoryUsage > 80) {
      recommendations.push('考慮增加服務器內存或優化內存使用');
    }

    if (summary.cpuLoad > 70) {
      recommendations.push('考慮增加 CPU 核心數或優化計算密集型操作');
    }

    if (summary.averageResponseTime > 1000) {
      recommendations.push('考慮優化數據庫查詢或增加緩存');
    }

    if (summary.errorCount > 10) {
      recommendations.push('檢查系統錯誤日誌並修復潛在問題');
    }

    return recommendations;
  }
}

module.exports = new MonitoringService();

const os = require('os');
const { performance } = require('perf_hooks');

class PerformanceMonitorV2 {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        failed: 0,
        avgResponseTime: 0,
        responseTimes: [],
      },
      system: {
        cpu: 0,
        memory: 0,
        uptime: 0,
        loadAverage: [],
      },
      errors: {
        total: 0,
        byType: {},
        recent: [],
      },
      database: {
        queries: 0,
        slowQueries: 0,
        avgQueryTime: 0,
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0,
      },
    };

    this.startTime = Date.now();
    this.monitoringInterval = null;
    this.maxResponseTimes = 1000; // 保留最近1000個響應時間
  }

  // 開始監控
  startMonitoring(intervalMs = 30000) {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.updateSystemMetrics();
      this.cleanupOldData();
    }, intervalMs);

// eslint-disable-next-line no-console
    console.log(`🚀 性能監控已啟動 (間隔: ${intervalMs}ms)`);
  }

  // 停止監控
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
// eslint-disable-next-line no-console
      console.log('🛑 性能監控已停止');
    }
  }

  // 記錄請求
  recordRequest(req, res, next) {
    const startTime = performance.now();
    const originalSend = res.send;
    const originalJson = res.json;

    // 攔截響應
    res.send = function (data) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.metrics.requests.total++;
      this.metrics.requests.responseTimes.push(duration);

      if (res.statusCode >= 200 && res.statusCode < 400) {
        this.metrics.requests.success++;
      } else {
        this.metrics.requests.failed++;
      }

      // 更新平均響應時間
      this.updateAverageResponseTime();

      return originalSend.call(this, data);
    }.bind(this);

    res.json = function (data) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.metrics.requests.total++;
      this.metrics.requests.responseTimes.push(duration);

      if (res.statusCode >= 200 && res.statusCode < 400) {
        this.metrics.requests.success++;
      } else {
        this.metrics.requests.failed++;
      }

      this.updateAverageResponseTime();

      return originalJson.call(this, data);
    }.bind(this);

    next();
  }

  // 記錄錯誤
  recordError(error, req) {
    this.metrics.errors.total++;

// eslint-disable-next-line no-unused-vars
    const errorType = error.name || 'Unknown';
    this.metrics.errors.byType[errorType] =
      (this.metrics.errors.byType[errorType] || 0) + 1;

    this.metrics.errors.recent.push({
      timestamp: new Date().toISOString(),
      type: errorType,
      message: error.message,
      stack: error.stack,
      url: req?.url,
      method: req?.method,
    });

    // 只保留最近100個錯誤
    if (this.metrics.errors.recent.length > 100) {
      this.metrics.errors.recent = this.metrics.errors.recent.slice(-100);
    }
  }

  // 記錄數據庫查詢
  recordDatabaseQuery(duration, isSlow = false) {
    this.metrics.database.queries++;
    if (isSlow) {
      this.metrics.database.slowQueries++;
    }

    // 更新平均查詢時間
    const currentAvg = this.metrics.database.avgQueryTime;
    const totalQueries = this.metrics.database.queries;
    this.metrics.database.avgQueryTime =
      (currentAvg * (totalQueries - 1) + duration) / totalQueries;
  }

  // 記錄緩存操作
  recordCacheOperation(isHit) {
    if (isHit) {
      this.metrics.cache.hits++;
    } else {
      this.metrics.cache.misses++;
    }

    const total = this.metrics.cache.hits + this.metrics.cache.misses;
    this.metrics.cache.hitRate =
      total > 0 ? (this.metrics.cache.hits / total) * 100 : 0;
  }

  // 更新系統指標
  updateSystemMetrics() {
    const cpus = os.cpus();
    const totalCPU = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b);
      const idle = cpu.times.idle;
      return acc + (total - idle) / total;
    }, 0);

    this.metrics.system.cpu = (totalCPU / cpus.length) * 100;
    this.metrics.system.memory =
      ((os.totalmem() - os.freemem()) / os.totalmem()) * 100;
    this.metrics.system.uptime = os.uptime();
    this.metrics.system.loadAverage = os.loadavg();
  }

  // 更新平均響應時間
  updateAverageResponseTime() {
    const times = this.metrics.requests.responseTimes;
    if (times.length > 0) {
      const sum = times.reduce((a, b) => a + b, 0);
      this.metrics.requests.avgResponseTime = sum / times.length;
    }
  }

  // 清理舊數據
  cleanupOldData() {
    // 限制響應時間數組大小
    if (this.metrics.requests.responseTimes.length > this.maxResponseTimes) {
      this.metrics.requests.responseTimes =
        this.metrics.requests.responseTimes.slice(-this.maxResponseTimes);
    }
  }

  // 獲取性能指標
  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime,
      timestamp: new Date().toISOString(),
    };
  }

  // 獲取健康狀態
  getHealthStatus() {
    const cpuThreshold = 80;
    const memoryThreshold = 85;
// eslint-disable-next-line no-unused-vars
    const errorThreshold = 10;

    const issues = [];

    if (this.metrics.system.cpu > cpuThreshold) {
      issues.push(`CPU 使用率過高: ${this.metrics.system.cpu.toFixed(2)}%`);
    }

    if (this.metrics.system.memory > memoryThreshold) {
      issues.push(`內存使用率過高: ${this.metrics.system.memory.toFixed(2)}%`);
    }

    if (this.metrics.errors.total > errorThreshold) {
      issues.push(`錯誤數量過多: ${this.metrics.errors.total}`);
    }

    return {
      status: issues.length === 0 ? 'healthy' : 'warning',
      issues,
      metrics: this.getMetrics(),
    };
  }

  // 重置指標
  resetMetrics() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        failed: 0,
        avgResponseTime: 0,
        responseTimes: [],
      },
      system: {
        cpu: 0,
        memory: 0,
        uptime: 0,
        loadAverage: [],
      },
      errors: {
        total: 0,
        byType: {},
        recent: [],
      },
      database: {
        queries: 0,
        slowQueries: 0,
        avgQueryTime: 0,
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0,
      },
    };

// eslint-disable-next-line no-console
    console.log('🔄 性能指標已重置');
  }

  // 導出指標到文件
  exportMetrics() {
    const metrics = this.getMetrics();
// eslint-disable-next-line no-unused-vars
    const fs = require('fs');
    const path = require('path');

    const exportDir = path.join(__dirname, '..', '..', 'reports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filename = `performance-metrics-${Date.now()}.json`;
    const filepath = path.join(exportDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(metrics, null, 2));
// eslint-disable-next-line no-console
    console.log(`📊 性能指標已導出到: ${filepath}`);

    return filepath;
  }
}

// 創建單例實例
const performanceMonitor = new PerformanceMonitorV2();

module.exports = performanceMonitor;

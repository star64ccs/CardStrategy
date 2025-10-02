const os = require('os');
const { performance } = require('perf_hooks');
const { logger } = require('./unified-logger');

// 性能指標收集器
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        error: 0,
        avgResponseTime: 0,
      },
      memory: {
        used: 0,
        total: 0,
        percentage: 0,
      },
      cpu: {
        usage: 0,
        loadAverage: [],
      },
      uptime: {
        startTime: Date.now(),
        current: 0,
      },
    };

    this.responseTimes = [];
    this.maxResponseTimes = 100; // 保留最近100個ResponseTime

    // 定期Update系統指標
    this.startPeriodicUpdate();
  }

  // Begin定期Update
  startPeriodicUpdate() {
    setInterval(() => {
      this.updateSystemMetrics();
    }, 5000); // 每5SecondUpdate一次

    setInterval(() => {
      this.updateUptime();
    }, 1000); // 每SecondUpdate運RowTime
  }

  // Update系統指標
  updateSystemMetrics() {
    // Memory使用情況
    const memUsage = process.memoryUsage();
    this.metrics.memory.used = Math.round(memUsage.heapUsed / 1024 / 1024);
    this.metrics.memory.total = Math.round(memUsage.heapTotal / 1024 / 1024);
    this.metrics.memory.percentage = Math.round(
      (this.metrics.memory.used / this.metrics.memory.total) * 100
    );

    // CPU 使用情況
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach((cpu) => {
// eslint-disable-next-line no-unused-vars
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    this.metrics.cpu.usage = Math.round(100 - (100 * idle) / total);

    // 系統負載
    this.metrics.cpu.loadAverage = os.loadavg();

    // Record系統指標
    logger.info('System Metrics Updated', {
      memory: this.metrics.memory,
      cpu: this.metrics.cpu,
    });
  }

  // Update運RowTime
  updateUptime() {
    this.metrics.uptime.current = Date.now() - this.metrics.uptime.startTime;
  }

  // RecordRequest
  recordRequest(success = true, responseTime = 0) {
    this.metrics.requests.total++;

    if (success) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.error++;
    }

    // RecordResponseTime
    if (responseTime > 0) {
      this.responseTimes.push(responseTime);

      // 保持ResponseTimeArray大小
      if (this.responseTimes.length > this.maxResponseTimes) {
        this.responseTimes.shift();
      }

      // 計算平均ResponseTime
      this.metrics.requests.avgResponseTime = Math.round(
        this.responseTimes.reduce((a, b) => a + b, 0) /
          this.responseTimes.length
      );
    }
  }

  // Get性能指標
  getMetrics() {
    return {
      ...this.metrics,
      responseTimes: {
        count: this.responseTimes.length,
        average: this.metrics.requests.avgResponseTime,
        min:
          this.responseTimes.length > 0 ? Math.min(...this.responseTimes) : 0,
        max:
          this.responseTimes.length > 0 ? Math.max(...this.responseTimes) : 0,
        p95: this.calculatePercentile(95),
        p99: this.calculatePercentile(99),
      },
    };
  }

  // 計算百分位數
  calculatePercentile(percentile) {
    if (this.responseTimes.length === 0) return 0;

    const sorted = [...this.responseTimes].sort((a, b) => a - b);
// eslint-disable-next-line no-unused-vars
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  // Reset指標
  resetMetrics() {
    this.metrics.requests = {
      total: 0,
      success: 0,
      error: 0,
      avgResponseTime: 0,
    };
    this.responseTimes = [];
    logger.info('Performance metrics reset');
  }
}

// CreateGlobalMonitorInstance
const performanceMonitor = new PerformanceMonitor();

// 性能Monitor中間件
const performanceMiddleware = (req, res, next) => {
  const start = performance.now();

  // RecordResponseComplete
  res.on('finish', () => {
    const duration = performance.now() - start;
    const success = res.statusCode < 400;

    performanceMonitor.recordRequest(success, duration);

    // Record慢Request
    if (duration > 1000) {
      logger.warn('Slow Request Detected', {
        method: req.method,
        url: req.url,
        duration: Math.round(duration),
        statusCode: res.statusCode,
      });
    }
  });

  next();
};

// 性能指標 API 路由
const getPerformanceMetrics = (req, res) => {
  try {
    const metrics = performanceMonitor.getMetrics();

    res.json({
      success: true,
      message: 'Performance metrics retrieved successfully',
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error getting performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance metrics',
      error: error.message,
    });
  }
};

// Reset性能指標 API 路由
// eslint-disable-next-line no-unused-vars
const resetPerformanceMetrics = (req, res) => {
  try {
    performanceMonitor.resetMetrics();

    res.json({
      success: true,
      message: 'Performance metrics reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error resetting performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset performance metrics',
      error: error.message,
    });
  }
};

module.exports = {
  performanceMonitor,
  performanceMiddleware,
  getPerformanceMetrics,
  resetPerformanceMetrics,
};

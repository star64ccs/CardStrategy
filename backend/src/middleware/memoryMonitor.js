const logger = require('../utils/logger');
const v8 = require('v8');

class MemoryMonitor {
  constructor() {
    this.memoryHistory = [];
    this.maxHistorySize = 100;
    this.leakThreshold = 50 * 1024 * 1024; // 50MB
    this.checkInterval = null;
    this.isMonitoring = false;
    this.leakCallbacks = [];
    this.stats = {
      totalChecks: 0,
      leakDetections: 0,
      averageMemory: 0,
      peakMemory: 0
    };
  }

  startMonitoring(interval = 30000) {
    if (this.isMonitoring) {
      logger.warn('內存監控已在運行中');
      return;
    }

    this.isMonitoring = true;
    this.checkInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, interval);

    logger.info('後端內存監控已啟動', { interval });
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isMonitoring = false;
    logger.info('後端內存監控已停止');
  }

  checkMemoryUsage() {
    const memUsage = process.memoryUsage();
    const heapStats = v8.getHeapStatistics();

    const metrics = {
      timestamp: Date.now(),
      processMemory: {
        rss: memUsage.rss,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external
      },
      v8Heap: {
        totalHeapSize: heapStats.total_heap_size,
        totalHeapSizeExecutable: heapStats.total_heap_size_executable,
        totalPhysicalSize: heapStats.total_physical_size,
        usedHeapSize: heapStats.used_heap_size,
        heapSizeLimit: heapStats.heap_size_limit
      }
    };

    this.memoryHistory.push(metrics);
    this.stats.totalChecks++;

    // 限制歷史記錄大小
    if (this.memoryHistory.length > this.maxHistorySize) {
      this.memoryHistory.shift();
    }

    // 檢測內存洩漏
    this.detectMemoryLeak();

    // 更新統計信息
    this.updateStats(metrics);

    // 記錄內存使用情況
    logger.debug('後端內存使用情況', {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
      v8Used: `${Math.round(heapStats.used_heap_size / 1024 / 1024)}MB`,
      v8Limit: `${Math.round(heapStats.heap_size_limit / 1024 / 1024)}MB`
    });
  }

  detectMemoryLeak() {
    if (this.memoryHistory.length < 20) return;

    const recentMemory = this.memoryHistory.slice(-20);
    const firstMemory = recentMemory[0];
    const lastMemory = recentMemory[recentMemory.length - 1];
    const memoryGrowth = lastMemory.processMemory.heapUsed - firstMemory.processMemory.heapUsed;
    const duration = lastMemory.timestamp - firstMemory.timestamp;

    if (memoryGrowth > this.leakThreshold) {
      const report = {
        growth: memoryGrowth,
        duration,
        threshold: this.leakThreshold,
        timestamp: Date.now(),
        growthMB: Math.round(memoryGrowth / 1024 / 1024),
        durationSeconds: Math.round(duration / 1000)
      };

      this.reportMemoryLeak(report);
    }
  }

  reportMemoryLeak(report) {
    this.stats.leakDetections++;

    logger.warn('檢測到後端內存洩漏', {
      growth: `${report.growthMB}MB`,
      duration: `${report.durationSeconds}秒`,
      threshold: `${Math.round(this.leakThreshold / 1024 / 1024)}MB`
    });

    // 通知所有監聽器
    this.leakCallbacks.forEach(callback => {
      try {
        callback(report);
      } catch (error) {
        logger.error('內存洩漏回調執行失敗', { error: error.message });
      }
    });
  }

  onMemoryLeak(callback) {
    this.leakCallbacks.push(callback);
  }

  removeMemoryLeakCallback(callback) {
    const index = this.leakCallbacks.indexOf(callback);
    if (index > -1) {
      this.leakCallbacks.splice(index, 1);
    }
  }

  updateStats(metrics) {
    const usedMemory = this.memoryHistory.map(m => m.processMemory.heapUsed);
    const average = usedMemory.reduce((sum, val) => sum + val, 0) / usedMemory.length;
    const peak = Math.max(...usedMemory);

    this.stats.averageMemory = Math.round(average / 1024 / 1024);
    this.stats.peakMemory = Math.round(peak / 1024 / 1024);
  }

  getCurrentMemoryUsage() {
    const memUsage = process.memoryUsage();
    const heapStats = v8.getHeapStatistics();

    return {
      processMemory: {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      },
      v8Heap: {
        totalHeapSize: Math.round(heapStats.total_heap_size / 1024 / 1024),
        totalHeapSizeExecutable: Math.round(heapStats.total_heap_size_executable / 1024 / 1024),
        totalPhysicalSize: Math.round(heapStats.total_physical_size / 1024 / 1024),
        usedHeapSize: Math.round(heapStats.used_heap_size / 1024 / 1024),
        heapSizeLimit: Math.round(heapStats.heap_size_limit / 1024 / 1024)
      },
      timestamp: Date.now()
    };
  }

  getMemoryHistory() {
    return this.memoryHistory.map(metrics => ({
      timestamp: metrics.timestamp,
      processMemory: {
        rss: Math.round(metrics.processMemory.rss / 1024 / 1024),
        heapUsed: Math.round(metrics.processMemory.heapUsed / 1024 / 1024),
        heapTotal: Math.round(metrics.processMemory.heapTotal / 1024 / 1024),
        external: Math.round(metrics.processMemory.external / 1024 / 1024)
      },
      v8Heap: {
        totalHeapSize: Math.round(metrics.v8Heap.totalHeapSize / 1024 / 1024),
        usedHeapSize: Math.round(metrics.v8Heap.usedHeapSize / 1024 / 1024),
        heapSizeLimit: Math.round(metrics.v8Heap.heapSizeLimit / 1024 / 1024)
      }
    }));
  }

  getStats() {
    return {
      ...this.stats,
      isMonitoring: this.isMonitoring,
      historySize: this.memoryHistory.length,
      leakThreshold: Math.round(this.leakThreshold / 1024 / 1024)
    };
  }

  setLeakThreshold(threshold) {
    this.leakThreshold = threshold;
    logger.info('後端內存洩漏閾值已更新', {
      threshold: `${Math.round(threshold / 1024 / 1024)}MB`
    });
  }

  // 強制垃圾回收
  forceGarbageCollection() {
    if (global.gc) {
      try {
        global.gc();
        logger.debug('後端強制垃圾回收已執行');
        return true;
      } catch (error) {
        logger.warn('後端強制垃圾回收失敗', { error: error.message });
        return false;
      }
    } else {
      logger.warn('後端不支持強制垃圾回收');
      return false;
    }
  }

  // 清理資源
  cleanup() {
    this.stopMonitoring();
    this.memoryHistory = [];
    this.leakCallbacks = [];
    this.stats = {
      totalChecks: 0,
      leakDetections: 0,
      averageMemory: 0,
      peakMemory: 0
    };
    logger.info('後端內存監控服務已清理');
  }
}

// 創建單例實例
const memoryMonitor = new MemoryMonitor();

// 中間件函數
const memoryMonitorMiddleware = (req, res, next) => {
  // 在請求開始時記錄內存使用
  const startMemory = memoryMonitor.getCurrentMemoryUsage();
  req.memoryStart = startMemory;

  // 在響應結束時檢查內存變化
  res.on('finish', () => {
    const endMemory = memoryMonitor.getCurrentMemoryUsage();
    const memoryDiff = endMemory.processMemory.heapUsed - startMemory.processMemory.heapUsed;

    if (memoryDiff > 1024 * 1024) { // 1MB 增長
      logger.warn('請求處理後內存增長過大', {
        path: req.path,
        method: req.method,
        memoryDiff: `${Math.round(memoryDiff / 1024)}KB`,
        startMemory: `${startMemory.processMemory.heapUsed}MB`,
        endMemory: `${endMemory.processMemory.heapUsed}MB`
      });
    }
  });

  next();
};

module.exports = {
  memoryMonitor,
  memoryMonitorMiddleware
};

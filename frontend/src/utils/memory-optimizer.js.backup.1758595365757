const v8 = require('v8');
const { performance, PerformanceObserver } = require('perf_hooks');

class MemoryOptimizer {
  constructor() {
    this.memoryThreshold = 500 * 1024 * 1024; // 500MB
    this.gcInterval = 5 * 60 * 1000; // 5分鐘
    this.observers = [];
    this.setupPerformanceObserver();
    this.startGarbageCollection();
  }

  setupPerformanceObserver() {
    const obs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.duration > 1000) { // 超過1秒的操作
          console.warn(`性能警告: ${entry.name} 耗時 ${entry.duration}ms`);
        }
      });
    });
    obs.observe({ entryTypes: ['measure', 'function'] });
    this.observers.push(obs);
  }

  startGarbageCollection() {
    setInterval(() => {
      this.forceGarbageCollection();
    }, this.gcInterval);
  }

  forceGarbageCollection() {
    if (global.gc) {
      const before = process.memoryUsage();
      global.gc();
      const after = process.memoryUsage();
      
      console.log('垃圾回收執行:', {
        before: this.formatMemory(before.heapUsed),
        after: this.formatMemory(after.heapUsed),
        freed: this.formatMemory(before.heapUsed - after.heapUsed)
      });
    }
  }

  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: this.formatMemory(usage.rss),
      heapTotal: this.formatMemory(usage.heapTotal),
      heapUsed: this.formatMemory(usage.heapUsed),
      external: this.formatMemory(usage.external),
      arrayBuffers: this.formatMemory(usage.arrayBuffers)
    };
  }

  formatMemory(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  checkMemoryPressure() {
    const usage = process.memoryUsage();
    const isHighPressure = usage.heapUsed > this.memoryThreshold;
    
    if (isHighPressure) {
      console.warn('內存壓力警告:', this.getMemoryUsage());
      this.forceGarbageCollection();
    }
    
    return {
      isHighPressure,
      usage: this.getMemoryUsage()
    };
  }

  // 內存洩漏檢測
  detectMemoryLeaks() {
    const heapStats = v8.getHeapStatistics();
    return {
      totalHeapSize: this.formatMemory(heapStats.total_heap_size),
      usedHeapSize: this.formatMemory(heapStats.used_heap_size),
      heapSizeLimit: this.formatMemory(heapStats.heap_size_limit),
      mallocedMemory: this.formatMemory(heapStats.malloced_memory),
      peakMallocedMemory: this.formatMemory(heapStats.peak_malloced_memory)
    };
  }

  cleanup() {
    this.observers.forEach(obs => obs.disconnect());
  }
}

module.exports = new MemoryOptimizer();
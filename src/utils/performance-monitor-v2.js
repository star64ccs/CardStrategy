// import { performance } from 'perf_hooks';

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      memoryUsage: [],
      cpuUsage: [],
    };
    this.startTime = Date.now();
  }

  recordRequest(responseTime) {
    this.metrics.requests++;
    this.metrics.responseTime.push(responseTime);
  }

  recordError() {
    this.metrics.errors++;
  }

  getMetrics() {
    const avgResponseTime =
      this.metrics.responseTime.length > 0
        ? this.metrics.responseTime.reduce((a, b) => a + b, 0) /
          this.metrics.responseTime.length
        : 0;

    return {
      uptime: Date.now() - this.startTime,
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      avgResponseTime,
      errorRate:
        this.metrics.requests > 0
          ? (this.metrics.errors / this.metrics.requests) * 100
          : 0,
    };
  }

  getMemoryUsage() {
    const memUsage = process.memoryUsage();
    return {
      rss: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100,
      heapTotal: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100,
      heapUsed: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100,
      external: Math.round((memUsage.external / 1024 / 1024) * 100) / 100,
    };
  }
}

export default new PerformanceMonitor();

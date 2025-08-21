import { InteractionManager, Platform } from 'react-native';
import { PerformanceObserver, performance } from 'perf_hooks';

// 效能優化工具類
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: Map<string, number[]> = new Map();
  private observers: Set<PerformanceObserver> = new Set();

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // 延遲執行非關鍵任務
  static deferTask(task: () => void): void {
    InteractionManager.runAfterInteractions(() => {
      task();
    });
  }

  // 批量執行任務
  static batchTasks(tasks: (() => void)[]): void {
    const batchSize = 10;
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      setTimeout(() => {
        batch.forEach(task => task());
      }, i * 10); // 每批間隔 10ms
    }
  }

  // 記憶體使用監控
  static getMemoryUsage(): {
    used: number;
    total: number;
    external: number;
    heapUsed: number;
    heapTotal: number;
  } {
    if (Platform.OS === 'web' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        external: memory.jsHeapSizeLimit,
        heapUsed: memory.usedJSHeapSize,
        heapTotal: memory.totalJSHeapSize,
      };
    }

    // React Native 環境下的記憶體監控
    return {
      used: 0,
      total: 0,
      external: 0,
      heapUsed: 0,
      heapTotal: 0,
    };
  }

  // 效能指標測量
  measurePerformance(name: string, fn: () => void): number {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = end - start;

    // 記錄指標
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);

    // 如果執行時間過長，發出警告
    if (duration > 100) {
      // logger.info(`Performance warning: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  // 異步效能測量
  async measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      const duration = end - start;

      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      this.metrics.get(name)!.push(duration);

      if (duration > 1000) {
        // logger.info(`Async performance warning: ${name} took ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const end = performance.now();
      const duration = end - start;
      // logger.info(`Performance error in ${name}: ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }

  // 獲取效能統計
  getPerformanceStats(name: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  } | null {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((acc, val) => acc + val, 0);
    const avg = sum / count;
    const min = sorted[0];
    const max = sorted[count - 1];
    const p95Index = Math.floor(count * 0.95);
    const p99Index = Math.floor(count * 0.99);

    return {
      count,
      avg,
      min,
      max,
      p95: sorted[p95Index],
      p99: sorted[p99Index],
    };
  }

  // 清理舊的效能數據
  clearOldMetrics(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [name, measurements] of this.metrics.entries()) {
      // 這裡可以實現基於時間的清理邏輯
      // 目前簡單地保留最近的 100 個測量值
      if (measurements.length > 100) {
        this.metrics.set(name, measurements.slice(-100));
      }
    }
  }

  // 監控渲染效能
  startRenderMonitoring(): void {
    if (Platform.OS === 'web') {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure') {
            // logger.info(`Render performance: ${entry.name} took ${entry.duration}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ['measure'] });
      this.observers.add(observer);
    }
  }

  // 停止監控
  stopMonitoring(): void {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
  }

  // 生成效能報告
  generatePerformanceReport(): {
    memory: any;
    metrics: Record<string, any>;
    recommendations: string[];
  } {
    const memory = PerformanceOptimizer.getMemoryUsage();
    const metrics: Record<string, any> = {};
    const recommendations: string[] = [];

    // 收集所有指標
    for (const [name] of this.metrics.keys()) {
      const stats = this.getPerformanceStats(name);
      if (stats) {
        metrics[name] = stats;

        // 生成建議
        if (stats.avg > 100) {
          recommendations.push(`考慮優化 ${name} 的執行時間 (平均 ${stats.avg.toFixed(2)}ms)`);
        }
        if (stats.p95 > 500) {
          recommendations.push(`${name} 的 95% 執行時間過長 (${stats.p95.toFixed(2)}ms)`);
        }
      }
    }

    // 記憶體建議
    if (memory.used > 100 * 1024 * 1024) { // 100MB
      recommendations.push('記憶體使用量較高，考慮清理不必要的緩存');
    }

    return {
      memory,
      metrics,
      recommendations,
    };
  }
}

// 效能優化 Hook
export const usePerformanceOptimization = () => {
  const optimizer = PerformanceOptimizer.getInstance();

  return {
    measurePerformance: optimizer.measurePerformance.bind(optimizer),
    measureAsyncPerformance: optimizer.measureAsyncPerformance.bind(optimizer),
    getPerformanceStats: optimizer.getPerformanceStats.bind(optimizer),
    generateReport: optimizer.generatePerformanceReport.bind(optimizer),
  };
};

// 效能優化裝飾器
export function measurePerformance(name?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const methodName = name || `${target.constructor.name}.${propertyName}`;

    descriptor.value = function (...args: any[]) {
      const optimizer = PerformanceOptimizer.getInstance();
      return optimizer.measureAsyncPerformance(methodName, () => method.apply(this, args));
    };
  };
}

// 導出單例實例
export const performanceOptimizer = PerformanceOptimizer.getInstance();

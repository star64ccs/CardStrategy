
import { logger } from './logger';

/**
 * 性能監控工具
 * 用於監控應用程序性能指標
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private startTimes: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(operation: string): void {
    this.startTimes.set(operation, Date.now());
  }

  endTimer(operation: string): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) {
      logger.warn('Timer not started for operation:', operation);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.startTimes.delete(operation);

    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(duration);

    logger.info('Performance metric:', {
      operation,
      duration,
      average: this.getAverage(operation)
    });

    return duration;
  }

  getAverage(operation: string): number {
    const metrics = this.metrics.get(operation);
    if (!metrics || metrics.length === 0) return 0;
    
    return metrics.reduce((sum, metric) => sum + metric, 0) / metrics.length;
  }

  getMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [operation, metrics] of this.metrics.entries()) {
      result[operation] = this.getAverage(operation);
    }
    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
    this.startTimes.clear();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

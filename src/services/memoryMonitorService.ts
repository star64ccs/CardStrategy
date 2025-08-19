import { logger } from '@/utils/logger';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

export interface MemoryLeakReport {
  growth: number;
  duration: number;
  threshold: number;
  timestamp: number;
}

export class MemoryMonitorService {
  private static instance: MemoryMonitorService;
  private memoryHistory: MemoryMetrics[] = [];
  private leakThreshold = 10 * 1024 * 1024; // 10MB
  private checkInterval: NodeJS.Timeout | null = null;
  private maxHistorySize = 100;
  private isMonitoring = false;
  private leakCallbacks: ((report: MemoryLeakReport) => void)[] = [];

  static getInstance(): MemoryMonitorService {
    if (!MemoryMonitorService.instance) {
      MemoryMonitorService.instance = new MemoryMonitorService();
    }
    return MemoryMonitorService.instance;
  }

  startMonitoring(interval: number = 10000): void {
    if (this.isMonitoring) {
      logger.warn('內存監控已在運行中');
      return;
    }

    this.isMonitoring = true;
    this.checkInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, interval);

    logger.info('內存監控已啟動', { interval });
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isMonitoring = false;
    logger.info('內存監控已停止');
  }

  private checkMemoryUsage(): void {
    if (!('memory' in performance)) {
      logger.warn('瀏覽器不支持 performance.memory API');
      return;
    }

    const {memory} = (performance as any);
    const metrics: MemoryMetrics = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      timestamp: Date.now()
    };

    this.memoryHistory.push(metrics);

    // 限制歷史記錄大小
    if (this.memoryHistory.length > this.maxHistorySize) {
      this.memoryHistory.shift();
    }

    // 檢測內存洩漏
    this.detectMemoryLeak();

    // 記錄內存使用情況
    logger.debug('內存使用情況', {
      used: `${Math.round(metrics.usedJSHeapSize / 1024 / 1024)}MB`,
      total: `${Math.round(metrics.totalJSHeapSize / 1024 / 1024)}MB`,
      limit: `${Math.round(metrics.jsHeapSizeLimit / 1024 / 1024)}MB`
    });
  }

  private detectMemoryLeak(): void {
    if (this.memoryHistory.length < 10) return;

    const recentMemory = this.memoryHistory.slice(-10);
    const firstMemory = recentMemory[0];
    const lastMemory = recentMemory[recentMemory.length - 1];
    const memoryGrowth = lastMemory.usedJSHeapSize - firstMemory.usedJSHeapSize;
    const duration = lastMemory.timestamp - firstMemory.timestamp;

    if (memoryGrowth > this.leakThreshold) {
      const report: MemoryLeakReport = {
        growth: memoryGrowth,
        duration,
        threshold: this.leakThreshold,
        timestamp: Date.now()
      };

      this.reportMemoryLeak(report);
    }
  }

  private reportMemoryLeak(report: MemoryLeakReport): void {
    logger.warn('檢測到可能的內存洩漏', {
      growth: `${Math.round(report.growth / 1024 / 1024)}MB`,
      duration: `${Math.round(report.duration / 1000)}秒`,
      threshold: `${Math.round(report.threshold / 1024 / 1024)}MB`
    });

    // 通知所有監聽器
    this.leakCallbacks.forEach(callback => {
      try {
        callback(report);
      } catch (error) {
        logger.error('內存洩漏回調執行失敗', { error });
      }
    });
  }

  onMemoryLeak(callback: (report: MemoryLeakReport) => void): void {
    this.leakCallbacks.push(callback);
  }

  removeMemoryLeakCallback(callback: (report: MemoryLeakReport) => void): void {
    const index = this.leakCallbacks.indexOf(callback);
    if (index > -1) {
      this.leakCallbacks.splice(index, 1);
    }
  }

  getCurrentMemoryUsage(): MemoryMetrics | null {
    if (!('memory' in performance)) return null;

    const {memory} = (performance as any);
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      timestamp: Date.now()
    };
  }

  getMemoryHistory(): MemoryMetrics[] {
    return [...this.memoryHistory];
  }

  getMemoryStats(): {
    average: number;
    peak: number;
    current: number;
    growth: number;
    } {
    if (this.memoryHistory.length === 0) {
      return { average: 0, peak: 0, current: 0, growth: 0 };
    }

    const usedMemory = this.memoryHistory.map(m => m.usedJSHeapSize);
    const average = usedMemory.reduce((sum, val) => sum + val, 0) / usedMemory.length;
    const peak = Math.max(...usedMemory);
    const current = usedMemory[usedMemory.length - 1];
    const growth = usedMemory[usedMemory.length - 1] - usedMemory[0];

    return {
      average: Math.round(average / 1024 / 1024),
      peak: Math.round(peak / 1024 / 1024),
      current: Math.round(current / 1024 / 1024),
      growth: Math.round(growth / 1024 / 1024)
    };
  }

  setLeakThreshold(threshold: number): void {
    this.leakThreshold = threshold;
    logger.info('內存洩漏閾值已更新', { threshold: `${Math.round(threshold / 1024 / 1024)}MB` });
  }

  cleanup(): void {
    this.stopMonitoring();
    this.memoryHistory = [];
    this.leakCallbacks = [];
    logger.info('內存監控服務已清理');
  }
}

// 導出單例實例
export const memoryMonitorService = MemoryMonitorService.getInstance();

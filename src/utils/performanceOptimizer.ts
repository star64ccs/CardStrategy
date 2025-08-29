/**
 * 前端性能優化器
 * 提供內存監控、任務延遲、批量處理等功能
 */
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private deferredTasks: (() => void)[] = [];
  private batchTasks: (() => void)[] = [];
  private isProcessing = false;

  private constructor() {
    // 私有構造函數，實現單例模式
  }

  /**
   * 獲取單例實例
   */
  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * 獲取內存使用情況
   */
  public static getMemoryUsage(): {
    used: number;
    total: number;
    free: number;
  } {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const _memoryInfo = {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        free:
          (performance as any).memory.totalJSHeapSize -
          (performance as any).memory.usedJSHeapSize,
      };
      return memoryInfo;
    }
    return { used: 0, total: 0, free: 0 };
  }

  /**
   * 延遲執行任務
   */
  public static deferTask(task: () => void): void {
    const _optimizer = PerformanceOptimizer.getInstance();
    optimizer.deferredTasks.push(task);

    if (!optimizer.isProcessing) {
      optimizer.processDeferredTasks();
    }
  }

  /**
   * 批量處理任務
   */
  public static batchTasks(tasks: (() => void)[]): void {
    const _optimizer = PerformanceOptimizer.getInstance();
    optimizer.batchTasks.push(...tasks);

    if (!optimizer.isProcessing) {
      optimizer.processBatchTasks();
    }
  }

  /**
   * 處理延遲任務
   */
  private async processDeferredTasks(): Promise<void> {
    this.isProcessing = true;

    while (this.deferredTasks.length > 0) {
      const _task = this.deferredTasks.shift();
      if (task) {
        try {
          await new Promise<void>(resolve => {
            setTimeout(() => {
              task();
              resolve();
            }, 0);
          });
        } catch (error) {
          console.error('延遲任務執行失敗:', error);
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * 處理批量任務
   */
  private async processBatchTasks(): Promise<void> {
    this.isProcessing = true;

    const _tasks = [...this.batchTasks];
    this.batchTasks = [];

    // 並行執行所有任務
    await Promise.all(
      tasks.map(async task => {
        try {
          await new Promise<void>(resolve => {
            setTimeout(() => {
              task();
              resolve();
            }, 0);
          });
        } catch (error) {
          console.error('批量任務執行失敗:', error);
        }
      })
    );

    this.isProcessing = false;
  }

  /**
   * 測量函數執行時間
   */
  public static measureExecutionTime<T>(fn: () => T): {
    result: T;
    duration: number;
  } {
    const _startTime = performance.now();
    const _result = fn();
    const _endTime = performance.now();

    return {
      result,
      duration: endTime - startTime,
    };
  }

  /**
   * 異步測量函數執行時間
   */
  public static async measureAsyncExecutionTime<T>(
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const _startTime = performance.now();
    const _result = await fn();
    const _endTime = performance.now();

    return {
      result,
      duration: endTime - startTime,
    };
  }

  /**
   * 清理資源
   */
  public static cleanup(): void {
    const _optimizer = PerformanceOptimizer.getInstance();
    optimizer.deferredTasks = [];
    optimizer.batchTasks = [];
    optimizer.isProcessing = false;
  }
}

// 導出靜態方法作為全局函數
export const { getMemoryUsage } = PerformanceOptimizer;
export const { deferTask } = PerformanceOptimizer;
export const { batchTasks } = PerformanceOptimizer;
export const { measureExecutionTime } = PerformanceOptimizer;
export const { measureAsyncExecutionTime } = PerformanceOptimizer;
export const { cleanup } = PerformanceOptimizer;

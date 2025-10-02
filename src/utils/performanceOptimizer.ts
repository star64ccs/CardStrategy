/**
 * 前端性能優化器
 * 提供MemoryMonitor、Task延遲、BatchHandle等功能
 */
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private deferredTasks: (() => void)[] = [];
  private batchTasks: (() => void)[] = [];
  private isProcessing = false;

  private constructor() {
    // Private構造Function，實現單例模式
  }

  /**
   * Get單例Instance
   */
  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * GetMemory使用情況
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
   * 延遲執RowTask
   */
  public static deferTask(task: () => void): void {
    const _optimizer = PerformanceOptimizer.getInstance();
    optimizer.deferredTasks.push(task);

    if (!optimizer.isProcessing) {
      optimizer.processDeferredTasks();
    }
  }

  /**
   * BatchHandleTask
   */
  public static batchTasks(tasks: (() => void)[]): void {
    const _optimizer = PerformanceOptimizer.getInstance();
    optimizer.batchTasks.push(...tasks);

    if (!optimizer.isProcessing) {
      optimizer.processBatchTasks();
    }
  }

  /**
   * Handle延遲Task
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
          console.error('延遲任務執行Failed:', error);
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * HandleBatchTask
   */
  private async processBatchTasks(): Promise<void> {
    this.isProcessing = true;

    const _tasks = [...this.batchTasks];
    this.batchTasks = [];

    // Parallel執Row所有Task
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
          console.error('批量任務執行Failed:', error);
        }
      })
    );

    this.isProcessing = false;
  }

  /**
   * 測量Function執RowTime
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
   * Async測量Function執RowTime
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
   * 清理Resource
   */
  public static cleanup(): void {
    const _optimizer = PerformanceOptimizer.getInstance();
    optimizer.deferredTasks = [];
    optimizer.batchTasks = [];
    optimizer.isProcessing = false;
  }
}

// ExportStaticMethod作為GlobalFunction
export const { getMemoryUsage } = PerformanceOptimizer;
export const { deferTask } = PerformanceOptimizer;
export const { batchTasks } = PerformanceOptimizer;
export const { measureExecutionTime } = PerformanceOptimizer;
export const { measureAsyncExecutionTime } = PerformanceOptimizer;
export const { cleanup } = PerformanceOptimizer;

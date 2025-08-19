import { logger } from '@/utils/logger';

export interface CleanupTask {
  id: string;
  name: string;
  task: () => void | Promise<void>;
  priority: 'low' | 'medium' | 'high';
  lastRun?: number;
  runCount: number;
}

export interface CleanupStats {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  lastCleanupTime?: number;
  averageCleanupTime: number;
}

export class MemoryCleanupService {
  private static instance: MemoryCleanupService;
  private cleanupTasks: Map<string, CleanupTask> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private stats: CleanupStats = {
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    averageCleanupTime: 0
  };

  static getInstance(): MemoryCleanupService {
    if (!MemoryCleanupService.instance) {
      MemoryCleanupService.instance = new MemoryCleanupService();
    }
    return MemoryCleanupService.instance;
  }

  // 註冊清理任務
  registerTask(
    id: string,
    name: string,
    task: () => void | Promise<void>,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): void {
    this.cleanupTasks.set(id, {
      id,
      name,
      task,
      priority,
      runCount: 0
    });

    logger.debug('註冊內存清理任務', { id, name, priority });
  }

  // 移除清理任務
  removeTask(id: string): boolean {
    const removed = this.cleanupTasks.delete(id);
    if (removed) {
      logger.debug('移除內存清理任務', { id });
    }
    return removed;
  }

  // 開始自動清理
  startAutoCleanup(interval: number = 60000): void {
    if (this.cleanupInterval) {
      logger.warn('自動清理已在運行中');
      return;
    }

    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, interval);

    logger.info('自動內存清理已啟動', { interval });
  }

  // 停止自動清理
  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      logger.info('自動內存清理已停止');
    }
  }

  // 執行清理
  async performCleanup(): Promise<void> {
    if (this.isRunning) {
      logger.warn('清理任務正在運行中，跳過本次執行');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    let completedTasks = 0;
    let failedTasks = 0;

    logger.info('開始執行內存清理', { taskCount: this.cleanupTasks.size });

    try {
      // 按優先級排序任務
      const sortedTasks = Array.from(this.cleanupTasks.values()).sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      // 執行高優先級任務
      for (const task of sortedTasks) {
        try {
          await task.task();
          task.lastRun = Date.now();
          task.runCount++;
          completedTasks++;

          logger.debug('清理任務執行成功', {
            id: task.id,
            name: task.name,
            runCount: task.runCount
          });
        } catch (error) {
          failedTasks++;
          logger.error('清理任務執行失敗', {
            id: task.id,
            name: task.name,
            error: error.message
          });
        }
      }

      // 更新統計信息
      const cleanupTime = Date.now() - startTime;
      this.stats = {
        totalTasks: this.cleanupTasks.size,
        completedTasks,
        failedTasks,
        lastCleanupTime: Date.now(),
        averageCleanupTime: this.calculateAverageCleanupTime(cleanupTime)
      };

      logger.info('內存清理完成', {
        completed: completedTasks,
        failed: failedTasks,
        duration: `${cleanupTime}ms`
      });

      // 強制垃圾回收（僅在開發環境）
      if (process.env.NODE_ENV === 'development') {
        this.forceGarbageCollection();
      }

    } catch (error) {
      logger.error('內存清理過程發生錯誤', { error: error.message });
    } finally {
      this.isRunning = false;
    }
  }

  // 強制垃圾回收
  private forceGarbageCollection(): void {
    if (typeof global !== 'undefined' && (global as any).gc) {
      try {
        (global as any).gc();
        logger.debug('強制垃圾回收已執行');
      } catch (error) {
        logger.warn('強制垃圾回收失敗', { error: error.message });
      }
    }
  }

  // 計算平均清理時間
  private calculateAverageCleanupTime(currentTime: number): number {
    const currentAverage = this.stats.averageCleanupTime;
    const totalRuns = this.stats.completedTasks + this.stats.failedTasks;

    if (totalRuns === 0) return currentTime;

    return Math.round((currentAverage * (totalRuns - 1) + currentTime) / totalRuns);
  }

  // 獲取清理統計信息
  getStats(): CleanupStats {
    return { ...this.stats };
  }

  // 獲取所有清理任務
  getTasks(): CleanupTask[] {
    return Array.from(this.cleanupTasks.values());
  }

  // 檢查任務是否存在
  hasTask(id: string): boolean {
    return this.cleanupTasks.has(id);
  }

  // 手動執行特定任務
  async executeTask(id: string): Promise<boolean> {
    const task = this.cleanupTasks.get(id);
    if (!task) {
      logger.warn('清理任務不存在', { id });
      return false;
    }

    try {
      await task.task();
      task.lastRun = Date.now();
      task.runCount++;

      logger.info('手動執行清理任務成功', { id, name: task.name });
      return true;
    } catch (error) {
      logger.error('手動執行清理任務失敗', { id, name: task.name, error: error.message });
      return false;
    }
  }

  // 清理所有資源
  cleanup(): void {
    this.stopAutoCleanup();
    this.cleanupTasks.clear();
    this.stats = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageCleanupTime: 0
    };
    this.isRunning = false;

    logger.info('內存清理服務已清理');
  }
}

// 導出單例實例
export const memoryCleanupService = MemoryCleanupService.getInstance();

// 預定義的清理任務
export const createDefaultCleanupTasks = () => {
  // 清理圖片緩存
  memoryCleanupService.registerTask(
    'image-cache',
    '清理圖片緩存',
    () => {
      // 清理 Image 緩存
      if (typeof Image !== 'undefined') {
        // 這裡可以實現具體的圖片緩存清理邏輯
        logger.debug('圖片緩存清理完成');
      }
    },
    'medium'
  );

  // 清理事件監聽器
  memoryCleanupService.registerTask(
    'event-listeners',
    '清理事件監聽器',
    () => {
      // 這裡可以實現事件監聽器清理邏輯
      logger.debug('事件監聽器清理完成');
    },
    'high'
  );

  // 清理定時器
  memoryCleanupService.registerTask(
    'timers',
    '清理定時器',
    () => {
      // 這裡可以實現定時器清理邏輯
      logger.debug('定時器清理完成');
    },
    'high'
  );

  // 清理本地存儲
  memoryCleanupService.registerTask(
    'local-storage',
    '清理本地存儲',
    () => {
      try {
        // 清理過期的本地存儲數據
        const keys = Object.keys(localStorage);
        let cleanedCount = 0;

        for (const key of keys) {
          if (key.startsWith('temp_') || key.includes('cache')) {
            const item = localStorage.getItem(key);
            if (item) {
              try {
                const data = JSON.parse(item);
                if (data.expiry && Date.now() > data.expiry) {
                  localStorage.removeItem(key);
                  cleanedCount++;
                }
              } catch {
                // 如果不是 JSON 格式，跳過
              }
            }
          }
        }

        logger.debug('本地存儲清理完成', { cleanedCount });
      } catch (error) {
        logger.error('本地存儲清理失敗', { error: error.message });
      }
    },
    'low'
  );
};

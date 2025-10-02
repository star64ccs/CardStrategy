/**
 * 高性能任務隊列
 * 實現優先級隊列、並發控制、超時處理等功能
 */

import { logger } from '../../../core/utils/logger';
import type {
  TaskQueue,
  ProcessingTask,
  ProcessingResult,
  PerformanceMetrics,
} from '../types/processing';
import { ProcessingStatus, DataPriority } from '../types/processing';

/**
 * 優先級隊列節點
 */
interface PriorityQueueNode<T> {
  task: ProcessingTask<T>;
  priority: number;
  timestamp: number;
}

/**
 * 高性能任務隊列實現
 */
export class HighPerformanceTaskQueue implements TaskQueue {
  private priorityQueue: PriorityQueueNode<any>[] = [];
  private readonly taskMap = new Map<string, ProcessingTask>();
  private readonly maxSize: number;
  private readonly concurrency: number;
  private readonly timeout: number;
  private readonly activeTasks = new Set<string>();
  private metrics: PerformanceMetrics;
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor(
    maxSize = 1000,
    concurrency = 4,
    timeout = 30000 // 30秒
  ) {
    this.maxSize = maxSize;
    this.concurrency = concurrency;
    this.timeout = timeout;
    this.metrics = this.initializeMetrics();
    this.startProcessing();
  }

  /**
   * 入隊任務
   */
  async enqueue<T>(task: ProcessingTask<T>): Promise<void> {
    try {
      // 檢查隊列大小限制
      if (this.priorityQueue.length >= this.maxSize) {
        throw new Error('任務隊列已滿');
      }

      // 設置任務狀態
      task.status = ProcessingStatus.PENDING;
      task.createdAt = new Date();
      task.progress = 0;

      // 計算優先級分數
      const priorityScore = this.calculatePriorityScore(task);

      // 創建隊列節點
      const node: PriorityQueueNode<T> = {
        task,
        priority: priorityScore,
        timestamp: Date.now(),
      };

      // 插入到優先級隊列
      this.insertIntoPriorityQueue(node);
      this.taskMap.set(task.id, task);

      logger.debug(`任務入隊成功: ${task.id}`, { priority: priorityScore });
    } catch (error) {
      logger.error('任務入隊失敗:', { error, taskId: task.id });
      throw error;
    }
  }

  /**
   * 出隊任務
   */
  async dequeue(): Promise<ProcessingTask | null> {
    try {
      if (this.priorityQueue.length === 0) {
        return null;
      }

      // 檢查並發限制
      if (this.activeTasks.size >= this.concurrency) {
        return null;
      }

      // 取出最高優先級任務
      const node = this.priorityQueue.shift()!;
      const { task } = node;

      // 更新任務狀態
      task.status = ProcessingStatus.PROCESSING;
      task.startedAt = new Date();
      this.activeTasks.add(task.id);

      logger.debug(`任務出隊: ${task.id}`);
      return task;
    } catch (error) {
      logger.error('任務出隊失敗:', error);
      return null;
    }
  }

  /**
   * 查看隊列頭部任務
   */
  async peek(): Promise<ProcessingTask | null> {
    if (this.priorityQueue.length === 0) {
      return null;
    }
    return this.priorityQueue[0].task;
  }

  /**
   * 獲取隊列大小
   */
  async size(): Promise<number> {
    return this.priorityQueue.length;
  }

  /**
   * 清空隊列
   */
  async clear(): Promise<void> {
    try {
      this.priorityQueue = [];
      this.taskMap.clear();
      this.activeTasks.clear();
      this.metrics = this.initializeMetrics();
      logger.info('任務隊列已清空');
    } catch (error) {
      logger.error('清空任務隊列失敗:', error);
      throw error;
    }
  }

  /**
   * 移除指定任務
   */
  async remove(id: string): Promise<boolean> {
    try {
      // 從優先級隊列中移除
      const index = this.priorityQueue.findIndex(node => node.task.id === id);
      if (index !== -1) {
        this.priorityQueue.splice(index, 1);
      }

      // 從任務映射中移除
      const removed = this.taskMap.delete(id);
      this.activeTasks.delete(id);

      if (removed) {
        logger.debug(`任務已移除: ${id}`);
      }

      return removed;
    } catch (error) {
      logger.error('移除任務失敗:', { error, taskId: id });
      return false;
    }
  }

  /**
   * 獲取指定任務
   */
  async get(id: string): Promise<ProcessingTask | null> {
    return this.taskMap.get(id) || null;
  }

  /**
   * 完成任務
   */
  async completeTask(taskId: string, result: ProcessingResult): Promise<void> {
    try {
      const task = this.taskMap.get(taskId);
      if (!task) {
        throw new Error(`任務不存在: ${taskId}`);
      }

      // 更新任務狀態
      task.status = ProcessingStatus.COMPLETED;
      task.completedAt = new Date();
      task.progress = 100;
      task.result = result;

      // 從活動任務中移除
      this.activeTasks.delete(taskId);

      // 更新指標
      this.updateMetrics('completed', result.processingTime);

      logger.debug(`任務完成: ${taskId}`, {
        processingTime: result.processingTime,
      });
    } catch (error) {
      logger.error('完成任務失敗:', { error, taskId });
      throw error;
    }
  }

  /**
   * 失敗任務
   */
  async failTask(taskId: string, error: string): Promise<void> {
    try {
      const task = this.taskMap.get(taskId);
      if (!task) {
        throw new Error(`任務不存在: ${taskId}`);
      }

      // 更新任務狀態
      task.status = ProcessingStatus.FAILED;
      task.completedAt = new Date();
      task.error = error;

      // 從活動任務中移除
      this.activeTasks.delete(taskId);

      // 更新指標
      this.updateMetrics('failed', 0);

      logger.debug(`任務失敗: ${taskId}`, { error });
    } catch (error) {
      logger.error('標記任務失敗失敗:', { error, taskId });
      throw error;
    }
  }

  /**
   * 獲取隊列統計信息
   */
  async getStats(): Promise<{
    queueSize: number;
    activeTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageProcessingTime: number;
    throughput: number;
  }> {
    return {
      queueSize: this.priorityQueue.length,
      activeTasks: this.activeTasks.size,
      completedTasks: this.metrics.completedTasks,
      failedTasks: this.metrics.failedTasks,
      averageProcessingTime: this.metrics.averageProcessingTime,
      throughput: this.metrics.throughput,
    };
  }

  /**
   * 銷毀隊列
   */
  async destroy(): Promise<void> {
    try {
      if (this.processingInterval) {
        clearInterval(this.processingInterval);
      }
      await this.clear();
      logger.info('任務隊列已銷毀');
    } catch (error) {
      logger.error('銷毀任務隊列失敗:', error);
      throw error;
    }
  }

  // 私有方法實現

  private initializeMetrics(): PerformanceMetrics {
    return {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageProcessingTime: 0,
      throughput: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      cacheHitRate: 0,
      compressionRatio: 0,
      errorRate: 0,
      uptime: 0,
    };
  }

  private calculatePriorityScore(task: ProcessingTask): number {
    let score = 0;

    // 優先級權重
    switch (task.priority) {
      case DataPriority.CRITICAL:
        score += 1000;
        break;
      case DataPriority.HIGH:
        score += 500;
        break;
      case DataPriority.NORMAL:
        score += 100;
        break;
      case DataPriority.LOW:
        score += 10;
        break;
      case DataPriority.BACKGROUND:
        score += 1;
        break;
    }

    // 時間權重（越早創建的任務優先級越高）
    const age = Date.now() - task.createdAt.getTime();
    score += Math.max(0, 1000 - age / 1000); // 每秒減少1分

    // 任務類型權重
    switch (task.type) {
      case 'critical':
        score += 500;
        break;
      case 'urgent':
        score += 200;
        break;
      case 'normal':
        score += 50;
        break;
      case 'background':
        score += 10;
        break;
    }

    return score;
  }

  private insertIntoPriorityQueue<T>(node: PriorityQueueNode<T>): void {
    // 二分查找插入位置
    let left = 0;
    let right = this.priorityQueue.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midNode = this.priorityQueue[mid];

      if (node.priority > midNode.priority) {
        right = mid - 1;
      } else if (node.priority < midNode.priority) {
        left = mid + 1;
      } else {
        // 優先級相同，按時間戳排序
        if (node.timestamp < midNode.timestamp) {
          right = mid - 1;
        } else {
          left = mid + 1;
        }
      }
    }

    this.priorityQueue.splice(left, 0, node);
  }

  private updateMetrics(
    type: 'completed' | 'failed',
    processingTime: number
  ): void {
    this.metrics.totalTasks++;

    if (type === 'completed') {
      this.metrics.completedTasks++;

      // 更新平均處理時間
      const totalTime =
        this.metrics.averageProcessingTime * (this.metrics.completedTasks - 1) +
        processingTime;
      this.metrics.averageProcessingTime =
        totalTime / this.metrics.completedTasks;
    } else {
      this.metrics.failedTasks++;
    }

    // 更新吞吐量（每秒處理的任務數）
    const uptime = (Date.now() - this.metrics.uptime) / 1000;
    this.metrics.throughput =
      uptime > 0 ? this.metrics.completedTasks / uptime : 0;
    this.metrics.errorRate = this.metrics.failedTasks / this.metrics.totalTasks;
  }

  private startProcessing(): void {
    this.isProcessing = true;
    this.metrics.uptime = Date.now();

    this.processingInterval = setInterval(() => {
      this.processNextTask();
    }, 100); // 每100ms檢查一次
  }

  private async processNextTask(): Promise<void> {
    try {
      // 檢查是否有可執行的任務
      if (this.activeTasks.size >= this.concurrency) {
        return;
      }

      const task = await this.dequeue();
      if (!task) {
        return;
      }

      // 設置超時處理
      const timeoutId = setTimeout(() => {
        this.handleTaskTimeout(task.id);
      }, this.timeout);

      // 模擬任務處理
      this.simulateTaskProcessing(task, timeoutId);
    } catch (error) {
      logger.error('處理任務失敗:', error);
    }
  }

  private async simulateTaskProcessing(
    task: ProcessingTask,
    timeoutId: NodeJS.Timeout
  ): Promise<void> {
    try {
      // 模擬處理時間
      const processingTime = Math.random() * 5000 + 1000; // 1-6秒

      await new Promise(resolve => setTimeout(resolve, processingTime));

      // 清除超時
      clearTimeout(timeoutId);

      // 模擬處理結果
      const result: ProcessingResult = {
        success: Math.random() > 0.1, // 90%成功率
        data: { processed: true, taskId: task.id },
        processingTime,
        memoryUsage: Math.random() * 100 + 10, // 10-110MB
        cacheHit: Math.random() > 0.5, // 50%緩存命中率
        compressionRatio: Math.random() * 0.5 + 0.5, // 0.5-1.0
        metadata: { strategy: task.config.strategy },
      };

      if (result.success) {
        await this.completeTask(task.id, result);
      } else {
        await this.failTask(task.id, '模擬處理失敗');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      await this.failTask(
        task.id,
        error instanceof Error ? error.message : '未知錯誤'
      );
    }
  }

  private async handleTaskTimeout(taskId: string): Promise<void> {
    try {
      const task = this.taskMap.get(taskId);
      if (task && task.status === ProcessingStatus.PROCESSING) {
        await this.failTask(taskId, '任務處理超時');
        logger.warn(`任務處理超時: ${taskId}`);
      }
    } catch (error) {
      logger.error('處理任務超時失敗:', { error, taskId });
    }
  }
}

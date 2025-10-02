/**
 * 高性能TaskQueue
 * 實現優先級Queue、ConcurrentControl、超時Handle等功能
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
 * 優先級QueueNode
 */
interface PriorityQueueNode<T> {
  task: ProcessingTask<T>;
  priority: number;
  timestamp: number;
}

/**
 * 高性能TaskQueue實現
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
    timeout = 30000 // 30Second
  ) {
    this.maxSize = maxSize;
    this.concurrency = concurrency;
    this.timeout = timeout;
    this.metrics = this.initializeMetrics();
    this.startProcessing();
  }

  /**
   * 入隊Task
   */
  async enqueue<T>(task: ProcessingTask<T>): Promise<void> {
    try {
      // CheckQueue大小Limit
      if (this.priorityQueue.length >= this.maxSize) {
        throw new Error('任務隊列已滿');
      }

      // SettingsTaskStatus
      task.status = ProcessingStatus.PENDING;
      task.createdAt = new Date();
      task.progress = 0;

      // 計算優先級分數
      const _priorityScore = this.calculatePriorityScore(task);

      // CreateQueueNode
      const node: PriorityQueueNode<T> = {
        task,
        priority: priorityScore,
        timestamp: Date.now(),
      };

      // Insert到優先級Queue
      this.insertIntoPriorityQueue(node);
      this.taskMap.set(task.id, task);

      logger.debug(`任務入隊Success: ${task.id}`, { priority: priorityScore });
    } catch (error) {
      logger.error('任務入隊Failed:', { error, taskId: task.id });
      throw error;
    }
  }

  /**
   * 出隊Task
   */
  async dequeue(): Promise<ProcessingTask | null> {
    try {
      if (this.priorityQueue.length === 0) {
        return null;
      }

      // CheckConcurrentLimit
      if (this.activeTasks.size >= this.concurrency) {
        return null;
      }

      // 取出最高優先級Task
      const _node = this.priorityQueue.shift()!;
      const { task } = node;

      // UpdateTaskStatus
      task.status = ProcessingStatus.PROCESSING;
      task.startedAt = new Date();
      this.activeTasks.add(task.id);

      logger.debug(`任務出隊: ${task.id}`);
      return task;
    } catch (error) {
      logger.error('任務出隊Failed:', error);
      return null;
    }
  }

  /**
   * 查看Queue頭部Task
   */
  async peek(): Promise<ProcessingTask | null> {
    if (this.priorityQueue.length === 0) {
      return null;
    }
    return this.priorityQueue[0].task;
  }

  /**
   * GetQueue大小
   */
  async size(): Promise<number> {
    return this.priorityQueue.length;
  }

  /**
   * 清EmptyQueue
   */
  async clear(): Promise<void> {
    try {
      this.priorityQueue = [];
      this.taskMap.clear();
      this.activeTasks.clear();
      this.metrics = this.initializeMetrics();
      logger.info('任務隊列已清空');
    } catch (error) {
      logger.error('清空任務隊列Failed:', error);
      throw error;
    }
  }

  /**
   * Remove指定Task
   */
  async remove(id: string): Promise<boolean> {
    try {
      // 從優先級Queue中Remove
      const _index = this.priorityQueue.findIndex(node => node.task.id === id);
      if (index !== -1) {
        this.priorityQueue.splice(index, 1);
      }

      // 從TaskMap中Remove
      const _removed = this.taskMap.delete(id);
      this.activeTasks.delete(id);

      if (removed) {
        logger.debug(`任務已移除: ${id}`);
      }

      return removed;
    } catch (error) {
      logger.error('移除任務Failed:', { error, taskId: id });
      return false;
    }
  }

  /**
   * Get指定Task
   */
  async get(id: string): Promise<ProcessingTask | null> {
    return this.taskMap.get(id) || null;
  }

  /**
   * CompleteTask
   */
  async completeTask(taskId: string, result: ProcessingResult): Promise<void> {
    try {
      const _task = this.taskMap.get(taskId);
      if (!task) {
        throw new Error(`任務不存在: ${taskId}`);
      }

      // UpdateTaskStatus
      task.status = ProcessingStatus.COMPLETED;
      task.completedAt = new Date();
      task.progress = 100;
      task.result = result;

      // 從活動Task中Remove
      this.activeTasks.delete(taskId);

      // Update指標
      this.updateMetrics('completed', result.processingTime);

      logger.debug(`任務完成: ${taskId}`, {
        processingTime: result.processingTime,
      });
    } catch (error) {
      logger.error('完成任務Failed:', { error, taskId });
      throw error;
    }
  }

  /**
   * FailedTask
   */
  async failTask(taskId: string, error: string): Promise<void> {
    try {
      const _task = this.taskMap.get(taskId);
      if (!task) {
        throw new Error(`任務不存在: ${taskId}`);
      }

      // UpdateTaskStatus
      task.status = ProcessingStatus.FAILED;
      task.completedAt = new Date();
      task.error = error;

      // 從活動Task中Remove
      this.activeTasks.delete(taskId);

      // Update指標
      this.updateMetrics('failed', 0);

      logger.debug(`任務Failed: ${taskId}`, { error });
    } catch (error) {
      logger.error('標記任務FailedFailed:', { error, taskId });
      throw error;
    }
  }

  /**
   * GetQueueStatisticsInformation
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
   * 銷毀Queue
   */
  async destroy(): Promise<void> {
    try {
      if (this.processingInterval) {
        clearInterval(this.processingInterval);
      }
      await this.clear();
      logger.info('任務隊列已銷毀');
    } catch (error) {
      logger.error('銷毀任務隊列Failed:', error);
      throw error;
    }
  }

  // PrivateMethod實現

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

    // Time權重（越早Create的Task優先級越高）
    const _age = Date.now() - task.createdAt.getTime();
    score += Math.max(0, 1000 - age / 1000); // 每Second減少1分

    // TaskClass型權重
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
    // 二分FindInsert位置
    let left = 0;
    let right = this.priorityQueue.length - 1;

    while (left <= right) {
      const _mid = Math.floor((left + right) / 2);
      const _midNode = this.priorityQueue[mid];

      if (node.priority > midNode.priority) {
        right = mid - 1;
      } else if (node.priority < midNode.priority) {
        left = mid + 1;
      } else {
        // 優先級相同，按Time戳Sort
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

      // Update平均HandleTime
      const _totalTime =
        this.metrics.averageProcessingTime * (this.metrics.completedTasks - 1) +
        processingTime;
      this.metrics.averageProcessingTime =
        totalTime / this.metrics.completedTasks;
    } else {
      this.metrics.failedTasks++;
    }

    // Update吞吐量（每SecondHandle的Task數）
    const _uptime = (Date.now() - this.metrics.uptime) / 1000;
    this.metrics.throughput =
      uptime > 0 ? this.metrics.completedTasks / uptime : 0;
    this.metrics.errorRate = this.metrics.failedTasks / this.metrics.totalTasks;
  }

  private startProcessing(): void {
    this.isProcessing = true;
    this.metrics.uptime = Date.now();

    this.processingInterval = setInterval(() => {
      this.processNextTask();
    }, 100); // 每100msCheck一次
  }

  private async processNextTask(): Promise<void> {
    try {
      // CheckYesNo有可執Row的Task
      if (this.activeTasks.size >= this.concurrency) {
        return;
      }

      const _task = await this.dequeue();
      if (!task) {
        return;
      }

      // Settings超時Handle
      const _timeoutId = setTimeout(() => {
        this.handleTaskTimeout(task.id);
      }, this.timeout);

      // 模擬TaskHandle
      this.simulateTaskProcessing(task, timeoutId);
    } catch (error) {
      logger.error('Handle任務Failed:', error);
    }
  }

  private async simulateTaskProcessing(
    task: ProcessingTask,
    timeoutId: NodeJS.Timeout
  ): Promise<void> {
    try {
      // 模擬HandleTime
      const _processingTime = Math.random() * 5000 + 1000; // 1-6Second

      await new Promise(resolve => setTimeout(resolve, processingTime));

      // Clear超時
      clearTimeout(timeoutId);

      // 模擬Handle結果
      const result: ProcessingResult = {
        success: Math.random() > 0.1, // 90%Success率
        data: { processed: true, taskId: task.id },
        processingTime,
        memoryUsage: Math.random() * 100 + 10, // 10-110MB
        cacheHit: Math.random() > 0.5, // 50%Cache命中率
        compressionRatio: Math.random() * 0.5 + 0.5, // 0.5-1.0
        metadata: { strategy: task.config.strategy },
      };

      if (result.success) {
        await this.completeTask(task.id, result);
      } else {
        await this.failTask(task.id, '模擬HandleFailed');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      await this.failTask(
        task.id,
        error instanceof Error ? error.message : '未知Error'
      );
    }
  }

  private async handleTaskTimeout(taskId: string): Promise<void> {
    try {
      const _task = this.taskMap.get(taskId);
      if (task && task.status === ProcessingStatus.PROCESSING) {
        await this.failTask(taskId, '任務處理超時');
        logger.warn(`任務處理超時: ${taskId}`);
      }
    } catch (error) {
      logger.error('Handle任務超時Failed:', { error, taskId });
    }
  }
}

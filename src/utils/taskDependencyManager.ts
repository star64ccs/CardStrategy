import { EventEmitter } from 'events';
import { logger } from '@/utils/logger';
import { StorageManager } from './storage';
import { offlineSyncManager } from './offlineSyncManager';
import {
  encryptionManager,
  EncryptedData,
  EncryptionConfig,
} from './encryption';

// 任務狀態枚舉
export enum TaskStatus {
  PENDING = 'pending',
  READY = 'ready',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  BLOCKED = 'blocked',
}

// 任務優先級枚舉
export enum TaskPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// 依賴類型枚舉
export enum DependencyType {
  REQUIRES = 'requires', // 必須依賴
  OPTIONAL = 'optional', // 可選依賴
  BLOCKS = 'blocks', // 阻塞依賴
  TRIGGERS = 'triggers', // 觸發依賴
}

// 進度更新接口
export interface ProgressUpdate {
  taskId: string;
  percentage: number; // 0-100
  currentStep: string;
  totalSteps: number;
  currentStepIndex: number;
  estimatedTimeRemaining?: number; // 毫秒
  data?: any;
  timestamp: Date;
}

// 進度追蹤器接口
export interface ProgressTracker {
  updateProgress: (
    update: Omit<ProgressUpdate, 'taskId' | 'timestamp'>
  ) => void;
  complete: () => void;
  fail: (error: string) => void;
}

// 任務接口
export interface Task {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: TaskStatus;
  priority: TaskPriority;
  dependencies: TaskDependency[];
  dependents: string[]; // 依賴此任務的任務ID列表
  estimatedDuration: number; // 預估執行時間（毫秒）
  actualDuration?: number; // 實際執行時間
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  metadata?: Record<string, any>;
  retryCount: number;
  maxRetries: number;
  executor?: TaskExecutor;
  tags?: string[];
  // 新增進度相關字段
  progress?: ProgressUpdate;
  totalSteps?: number;
  currentStep?: string;
  currentStepIndex?: number;
  // 同步相關字段
  version: number;
  deviceId: string;
  lastSyncTime: number;
  isDirty: boolean;
}

// 任務依賴接口
export interface TaskDependency {
  taskId: string;
  type: DependencyType;
  condition?: (task: Task) => boolean; // 自定義依賴條件
  timeout?: number; // 依賴超時時間
}

// 任務執行器接口
export interface TaskExecutor {
  execute: (task: Task, progressTracker?: ProgressTracker) => Promise<any>;
  validate?: (task: Task) => boolean;
  cleanup?: (task: Task) => Promise<void>;
}

// 任務調度器配置
export interface TaskSchedulerConfig {
  maxConcurrentTasks: number;
  enableParallelExecution: boolean;
  enableRetry: boolean;
  defaultRetryAttempts: number;
  retryDelay: number;
  enableTimeout: boolean;
  defaultTimeout: number;
  enablePriorityPreemption: boolean;
  enableDeadlockDetection: boolean;
  enableCircularDependencyCheck: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// 任務執行結果
export interface TaskResult {
  taskId: string;
  success: boolean;
  data?: any;
  error?: string;
  duration: number;
  timestamp: Date;
}

// 依賴圖節點
interface DependencyNode {
  task: Task;
  inDegree: number;
  outDegree: number;
  visited: boolean;
  inStack: boolean;
}

// 跨設備同步相關接口
export interface TaskSyncData {
  taskId: string;
  deviceId: string;
  timestamp: number;
  operation:
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'STATUS_CHANGE'
    | 'PROGRESS_UPDATE';
  taskData: Partial<Task>;
  version: number;
  checksum: string;
}

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  platform: string;
  appVersion: string;
  lastSyncTime: number;
  isOnline: boolean;
}

export interface SyncConflict {
  taskId: string;
  localVersion: TaskSyncData;
  remoteVersion: TaskSyncData;
  conflictType: 'VERSION_MISMATCH' | 'CONCURRENT_UPDATE' | 'DELETION_CONFLICT';
  resolution: 'LOCAL_WINS' | 'REMOTE_WINS' | 'MERGE' | 'MANUAL';
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingSyncs: number;
  failedSyncs: number;
  syncProgress: number;
  connectedDevices: DeviceInfo[];
}

// 加密配置接口
export interface TaskEncryptionConfig {
  enabled: boolean;
  encryptTaskData: boolean;
  encryptSyncData: boolean;
  encryptMetadata: boolean;
  algorithm: 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';
  keyRotationEnabled: boolean;
  keyRotationInterval: number; // 毫秒
}

// 加密統計接口
export interface EncryptionStats {
  encryptedTasks: number;
  encryptedSyncs: number;
  encryptionErrors: number;
  decryptionErrors: number;
  lastEncryptionTime: number;
  lastDecryptionTime: number;
}

// 任務依賴管理器類
export class TaskDependencyManager extends EventEmitter {
  private tasks: Map<string, Task> = new Map();
  private taskQueue: Task[] = [];
  private runningTasks: Set<string> = new Set();
  private completedTasks: Map<string, TaskResult> = new Map();
  private config: TaskSchedulerConfig;
  private isProcessing = false;
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
  // 進度追蹤相關
  private progressUpdates: Map<string, ProgressUpdate[]> = new Map();
  private progressUpdateInterval: NodeJS.Timeout | null = null;

  // 同步相關屬性
  private deviceId: string = '';
  private syncInterval: NodeJS.Timeout | null = null;
  private syncListeners: Set<(status: SyncStatus) => void> = new Set();
  private pendingSyncs: TaskSyncData[] = [];
  private syncConflicts: SyncConflict[] = [];
  private connectedDevices: Map<string, DeviceInfo> = new Map();
  private isSyncing = false;
  private syncVersion = 1;

  // 加密相關屬性
  private encryptionConfig: TaskEncryptionConfig = {
    enabled: true,
    encryptTaskData: true,
    encryptSyncData: true,
    encryptMetadata: true,
    algorithm: 'AES-256-GCM',
    keyRotationEnabled: false,
    keyRotationInterval: 30 * 24 * 60 * 60 * 1000, // 30天
  };
  private encryptionStats: EncryptionStats = {
    encryptedTasks: 0,
    encryptedSyncs: 0,
    encryptionErrors: 0,
    decryptionErrors: 0,
    lastEncryptionTime: 0,
    lastDecryptionTime: 0,
  };
  private keyRotationInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<TaskSchedulerConfig> = {}) {
    super();
    this.config = {
      maxConcurrentTasks: 5,
      enableParallelExecution: true,
      enableRetry: true,
      defaultRetryAttempts: 3,
      retryDelay: 1000,
      enableTimeout: true,
      defaultTimeout: 30000,
      enablePriorityPreemption: true,
      enableDeadlockDetection: true,
      enableCircularDependencyCheck: true,
      logLevel: 'info',
      ...config,
    };

    // 初始化設備ID和同步
    this.initializeDeviceAndSync();

    // 啟動進度廣播
    this.startProgressBroadcast();

    logger.info('TaskDependencyManager initialized', {
      config: this.config,
    });
  }

  private async initializeDeviceAndSync(): Promise<void> {
    // 生成設備ID
    this.deviceId = await this.generateDeviceId();

    // 初始化同步
    await this.initializeSync();
  }

  // ==================== 任務管理方法 ====================

  /**
   * 添加任務
   */
  async addTask(
    task: Omit<
      Task,
      | 'id'
      | 'status'
      | 'dependents'
      | 'createdAt'
      | 'retryCount'
      | 'version'
      | 'deviceId'
      | 'lastSyncTime'
      | 'isDirty'
    >
  ): Promise<string> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTask: Task = {
      ...task,
      id: taskId,
      status: TaskStatus.PENDING,
      dependents: [],
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: task.maxRetries || this.config.defaultRetryAttempts,
      version: 1,
      deviceId: this.deviceId,
      lastSyncTime: Date.now(),
      isDirty: true,
    };

    // 驗證依賴關係
    if (this.config.enableCircularDependencyCheck) {
      this.validateDependencies(newTask);
    }

    this.tasks.set(taskId, newTask);
    this.updateDependents(newTask);
    this.addToQueue(newTask);

    this.emit('taskAdded', { task: newTask });
    logger.info(`[Task Manager] 任務已添加: ${taskId} - ${task.name}`);

    return taskId;
  }

  /**
   * 移除任務
   */
  async removeTask(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) {
      logger.warn(`[Task Manager] 任務不存在: ${taskId}`);
      return false;
    }

    // 檢查是否有其他任務依賴此任務
    if (task.dependents.length > 0) {
      logger.warn(
        `[Task Manager] 無法移除任務 ${taskId}，有 ${task.dependents.length} 個任務依賴它`
      );
      return false;
    }

    // 移除依賴關係
    task.dependencies.forEach((dep) => {
      const dependentTask = this.tasks.get(dep.taskId);
      if (dependentTask) {
        dependentTask.dependents = dependentTask.dependents.filter(
          (id) => id !== taskId
        );
      }
    });

    this.tasks.delete(taskId);
    this.taskQueue = this.taskQueue.filter((t) => t.id !== taskId);
    this.runningTasks.delete(taskId);

    this.emit('taskRemoved', { taskId });
    logger.info(`[Task Manager] 任務已移除: ${taskId}`);

    return true;
  }

  /**
   * 更新任務
   */
  async updateTask(
    taskId: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt' | 'version' | 'deviceId'>>
  ): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) {
      logger.warn(`[Task Manager] 任務不存在: ${taskId}`);
      return false;
    }

    const updatedTask: Task = {
      ...task,
      ...updates,
      updatedAt: new Date(),
      version: task.version + 1,
      lastSyncTime: Date.now(),
      isDirty: true,
    };

    // 如果依賴關係有變更，重新驗證
    if (updates.dependencies && this.config.enableCircularDependencyCheck) {
      this.validateDependencies(updatedTask);
    }

    this.tasks.set(taskId, updatedTask);
    this.updateDependents(updatedTask);
    this.updateQueue();

    this.emit('taskUpdated', { task: updatedTask });
    logger.info(`[Task Manager] 任務已更新: ${taskId}`);

    return true;
  }

  /**
   * 獲取任務
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 獲取所有任務
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * 獲取任務狀態
   */
  getTaskStatus(taskId: string): TaskStatus | undefined {
    const task = this.tasks.get(taskId);
    return task?.status;
  }

  // ==================== 依賴管理方法 ====================

  /**
   * 添加依賴關係
   */
  async addDependency(
    taskId: string,
    dependency: TaskDependency
  ): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) {
      logger.warn(`[Task Manager] 任務不存在: ${taskId}`);
      return false;
    }

    // 檢查依賴的任務是否存在
    const dependentTask = this.tasks.get(dependency.taskId);
    if (!dependentTask) {
      logger.warn(`[Task Manager] 依賴任務不存在: ${dependency.taskId}`);
      return false;
    }

    // 檢查是否會形成循環依賴
    if (
      this.config.enableCircularDependencyCheck &&
      this.wouldCreateCycle(taskId, dependency.taskId)
    ) {
      logger.error(
        `[Task Manager] 檢測到循環依賴: ${taskId} -> ${dependency.taskId}`
      );
      return false;
    }

    task.dependencies.push(dependency);
    dependentTask.dependents.push(taskId);

    this.updateTaskStatus(task);
    this.updateQueue();

    this.emit('dependencyAdded', { taskId, dependency });
    logger.info(
      `[Task Manager] 依賴關係已添加: ${taskId} -> ${dependency.taskId}`
    );

    return true;
  }

  /**
   * 移除依賴關係
   */
  async removeDependency(
    taskId: string,
    dependentTaskId: string
  ): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) {
      logger.warn(`[Task Manager] 任務不存在: ${taskId}`);
      return false;
    }

    const dependentTask = this.tasks.get(dependentTaskId);
    if (!dependentTask) {
      logger.warn(`[Task Manager] 依賴任務不存在: ${dependentTaskId}`);
      return false;
    }

    // 移除依賴關係
    task.dependencies = task.dependencies.filter(
      (dep) => dep.taskId !== dependentTaskId
    );
    dependentTask.dependents = dependentTask.dependents.filter(
      (id) => id !== taskId
    );

    this.updateTaskStatus(task);
    this.updateQueue();

    this.emit('dependencyRemoved', { taskId, dependentTaskId });
    logger.info(
      `[Task Manager] 依賴關係已移除: ${taskId} -> ${dependentTaskId}`
    );

    return true;
  }

  /**
   * 獲取任務依賴
   */
  getTaskDependencies(taskId: string): TaskDependency[] {
    const task = this.tasks.get(taskId);
    return task?.dependencies || [];
  }

  /**
   * 獲取依賴此任務的任務列表
   */
  getTaskDependents(taskId: string): string[] {
    const task = this.tasks.get(taskId);
    return task?.dependents || [];
  }

  /**
   * 檢查任務是否準備就緒
   */
  isTaskReady(task: Task): boolean {
    if (
      task.status !== TaskStatus.PENDING &&
      task.status !== TaskStatus.BLOCKED
    ) {
      return false;
    }

    return task.dependencies.every((dep) => {
      const dependentTask = this.tasks.get(dep.taskId);
      if (!dependentTask) {
        return false;
      }

      // 檢查依賴條件
      if (dep.condition && !dep.condition(dependentTask)) {
        return false;
      }

      // 根據依賴類型檢查狀態
      switch (dep.type) {
        case DependencyType.REQUIRES:
          return dependentTask.status === TaskStatus.COMPLETED;
        case DependencyType.OPTIONAL:
          return (
            dependentTask.status === TaskStatus.COMPLETED ||
            dependentTask.status === TaskStatus.FAILED
          );
        case DependencyType.BLOCKS:
          return dependentTask.status !== TaskStatus.RUNNING;
        case DependencyType.TRIGGERS:
          return dependentTask.status === TaskStatus.COMPLETED;
        default:
          return false;
      }
    });
  }

  // ==================== 執行調度方法 ====================

  /**
   * 開始執行任務
   */
  async startExecution(): Promise<void> {
    if (this.isProcessing) {
      logger.warn('[Task Manager] 任務執行器已在運行中');
      return;
    }

    this.isProcessing = true;
    logger.info('[Task Manager] 開始執行任務');

    try {
      while (this.taskQueue.length > 0 || this.runningTasks.size > 0) {
        // 檢查死鎖
        if (this.config.enableDeadlockDetection && this.detectDeadlock()) {
          logger.error('[Task Manager] 檢測到死鎖，停止執行');
          break;
        }

        // 啟動準備就緒的任務
        await this.startReadyTasks();

        // 等待一段時間再檢查
        await this.delay(100);
      }
    } catch (error) {
      logger.error('[Task Manager] 任務執行過程中發生錯誤:', error);
    } finally {
      this.isProcessing = false;
      logger.info('[Task Manager] 任務執行完成');
    }
  }

  /**
   * 停止執行任務
   */
  stopExecution(): void {
    this.isProcessing = false;
    logger.info('[Task Manager] 任務執行已停止');
  }

  /**
   * 暫停任務
   */
  pauseTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== TaskStatus.RUNNING) {
      return false;
    }

    task.status = TaskStatus.BLOCKED;
    this.runningTasks.delete(taskId);

    this.emit('taskPaused', { taskId });
    logger.info(`[Task Manager] 任務已暫停: ${taskId}`);

    return true;
  }

  /**
   * 恢復任務
   */
  resumeTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== TaskStatus.BLOCKED) {
      return false;
    }

    if (this.isTaskReady(task)) {
      task.status = TaskStatus.READY;
      this.addToQueue(task);
    } else {
      task.status = TaskStatus.PENDING;
    }

    this.emit('taskResumed', { taskId });
    logger.info(`[Task Manager] 任務已恢復: ${taskId}`);

    return true;
  }

  /**
   * 取消任務
   */
  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) {
      return false;
    }

    task.status = TaskStatus.CANCELLED;
    this.runningTasks.delete(taskId);

    // 取消依賴此任務的任務
    task.dependents.forEach((dependentId) => {
      const dependentTask = this.tasks.get(dependentId);
      if (dependentTask && dependentTask.status === TaskStatus.PENDING) {
        dependentTask.status = TaskStatus.CANCELLED;
      }
    });

    this.emit('taskCancelled', { taskId });
    logger.info(`[Task Manager] 任務已取消: ${taskId}`);

    return true;
  }

  // ==================== 進度追蹤方法 ====================

  /**
   * 獲取任務進度
   */
  getTaskProgress(taskId: string): ProgressUpdate | undefined {
    const task = this.tasks.get(taskId);
    return task?.progress;
  }

  /**
   * 獲取任務進度歷史
   */
  getTaskProgressHistory(taskId: string): ProgressUpdate[] {
    return this.progressUpdates.get(taskId) || [];
  }

  /**
   * 獲取所有任務的進度摘要
   */
  getProgressSummary(): {
    totalTasks: number;
    completedTasks: number;
    runningTasks: number;
    pendingTasks: number;
    failedTasks: number;
    overallProgress: number;
    averageProgress: number;
  } {
    const allTasks = Array.from(this.tasks.values());
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(
      (t) => t.status === TaskStatus.COMPLETED
    ).length;
    const runningTasks = allTasks.filter(
      (t) => t.status === TaskStatus.RUNNING
    ).length;
    const pendingTasks = allTasks.filter(
      (t) => t.status === TaskStatus.PENDING || t.status === TaskStatus.READY
    ).length;
    const failedTasks = allTasks.filter(
      (t) => t.status === TaskStatus.FAILED
    ).length;

    const progressValues = allTasks
      .map((t) => t.progress?.percentage || 0)
      .filter((p) => p > 0);

    const averageProgress =
      progressValues.length > 0
        ? progressValues.reduce((sum, p) => sum + p, 0) / progressValues.length
        : 0;

    const overallProgress =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      runningTasks,
      pendingTasks,
      failedTasks,
      overallProgress,
      averageProgress,
    };
  }

  /**
   * 創建進度追蹤器
   */
  private createProgressTracker(taskId: string): ProgressTracker {
    return {
      updateProgress: (
        update: Omit<ProgressUpdate, 'taskId' | 'timestamp'>
      ) => {
        const progressUpdate: ProgressUpdate = {
          ...update,
          taskId,
          timestamp: new Date(),
        };

        // 更新任務進度
        const task = this.tasks.get(taskId);
        if (task) {
          task.progress = progressUpdate;
          task.currentStep = update.currentStep;
          task.currentStepIndex = update.currentStepIndex;
          task.totalSteps = update.totalSteps;
        }

        // 保存進度歷史
        if (!this.progressUpdates.has(taskId)) {
          this.progressUpdates.set(taskId, []);
        }
        this.progressUpdates.get(taskId)!.push(progressUpdate);

        // 發送進度更新事件
        this.emit('progressUpdate', progressUpdate);
        this.emit('taskProgressUpdate', { taskId, progress: progressUpdate });

        logger.debug(
          `[Task Manager] 任務 ${taskId} 進度更新: ${update.percentage}% - ${update.currentStep}`
        );
      },
      complete: () => {
        const task = this.tasks.get(taskId);
        if (task) {
          task.progress = {
            taskId,
            percentage: 100,
            currentStep: '完成',
            totalSteps: task.totalSteps || 1,
            currentStepIndex: task.totalSteps || 1,
            timestamp: new Date(),
          };
        }
        this.emit('taskProgressComplete', { taskId });
      },
      fail: (error: string) => {
        const task = this.tasks.get(taskId);
        if (task) {
          task.progress = {
            taskId,
            percentage: 0,
            currentStep: '失敗',
            totalSteps: task.totalSteps || 1,
            currentStepIndex: 0,
            timestamp: new Date(),
            data: { error },
          };
        }
        this.emit('taskProgressFailed', { taskId, error });
      },
    };
  }

  /**
   * 開始進度更新廣播
   */
  startProgressBroadcast(intervalMs: number = 1000): void {
    if (this.progressUpdateInterval) {
      clearInterval(this.progressUpdateInterval);
    }

    this.progressUpdateInterval = setInterval(() => {
      const runningTasks = Array.from(this.tasks.values()).filter(
        (t) => t.status === TaskStatus.RUNNING && t.progress
      );

      if (runningTasks.length > 0) {
        const progressSummary = this.getProgressSummary();
        this.emit('progressBroadcast', {
          summary: progressSummary,
          runningTasks: runningTasks.map((t) => ({
            id: t.id,
            name: t.name,
            progress: t.progress,
          })),
        });
      }
    }, intervalMs);

    logger.info(`[Task Manager] 進度廣播已啟動，間隔: ${intervalMs}ms`);
  }

  /**
   * 停止進度更新廣播
   */
  stopProgressBroadcast(): void {
    if (this.progressUpdateInterval) {
      clearInterval(this.progressUpdateInterval);
      this.progressUpdateInterval = null;
      logger.info('[Task Manager] 進度廣播已停止');
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 生成任務ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成設備ID
   */
  private async generateDeviceId(): Promise<string> {
    const existingId = await StorageManager.get<string>('device_id');
    if (existingId) {
      return existingId;
    }

    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await StorageManager.set('device_id', deviceId);
    return deviceId;
  }

  /**
   * 初始化同步
   */
  private async initializeSync(): Promise<void> {
    try {
      // 載入本地任務數據
      await this.loadLocalTasks();

      // 設置同步監聽器
      offlineSyncManager.addStatusListener(
        this.handleSyncStatusChange.bind(this)
      );

      // 啟動自動同步
      this.startAutoSync();

      // 註冊同步操作
      this.registerSyncOperations();

      logger.info('Task sync initialized');
    } catch (error) {
      logger.error('Initialize task sync error:', { error });
    }
  }

  /**
   * 載入本地任務數據
   */
  private async loadLocalTasks(): Promise<void> {
    try {
      const taskKeys = await StorageManager.getAllKeys();
      const taskDataKeys = taskKeys.filter((key) => key.startsWith('task_'));

      const taskData = await StorageManager.multiGet(taskDataKeys);
      for (const [key, task] of taskData) {
        if (task) {
          this.tasks.set(task.id, task);
          this.dependencies.set(task.id, task.dependencies || []);
        }
      }

      logger.info('Local tasks loaded', { count: this.tasks.size });
    } catch (error) {
      logger.error('Load local tasks error:', { error });
    }
  }

  /**
   * 註冊同步操作
   */
  private registerSyncOperations(): void {
    // 監聽任務變更事件
    this.on('taskCreated', (task: Task) => {
      this.queueTaskSync(task, 'CREATE');
    });

    this.on('taskUpdated', (task: Task) => {
      this.queueTaskSync(task, 'UPDATE');
    });

    this.on('taskDeleted', (taskId: string) => {
      this.queueTaskSync({ id: taskId } as Task, 'DELETE');
    });

    this.on('taskStatusChanged', (task: Task) => {
      this.queueTaskSync(task, 'STATUS_CHANGE');
    });

    this.on(
      'taskProgressUpdate',
      (taskId: string, progress: ProgressUpdate) => {
        const task = this.tasks.get(taskId);
        if (task) {
          this.queueTaskSync(task, 'PROGRESS_UPDATE');
        }
      }
    );
  }

  /**
   * 隊列任務同步
   */
  private async queueTaskSync(
    task: Partial<Task>,
    operation: TaskSyncData['operation']
  ): Promise<void> {
    try {
      const syncData: TaskSyncData = {
        taskId: task.id!,
        deviceId: this.deviceId,
        timestamp: Date.now(),
        operation,
        taskData: task,
        version: (task.version || 0) + 1,
        checksum: this.calculateTaskChecksum(task),
      };

      this.pendingSyncs.push(syncData);

      // 保存到本地存儲
      await StorageManager.set(
        `sync_${syncData.taskId}_${syncData.timestamp}`,
        syncData
      );

      // 觸發同步
      this.triggerSync();

      logger.info('Task sync queued', { taskId: task.id, operation });
    } catch (error) {
      logger.error('Queue task sync error:', { error, taskId: task.id });
    }
  }

  /**
   * 計算任務校驗和
   */
  private calculateTaskChecksum(task: Partial<Task>): string {
    const data = JSON.stringify({
      id: task.id,
      name: task.name,
      status: task.status,
      priority: task.priority,
      dependencies: task.dependencies,
      version: task.version,
    });

    // 簡單的校驗和算法
    let checksum = 0;
    for (let i = 0; i < data.length; i++) {
      checksum = ((checksum << 5) - checksum + data.charCodeAt(i)) & 0xffffffff;
    }
    return checksum.toString(16);
  }

  /**
   * 觸發同步
   */
  private async triggerSync(): Promise<void> {
    if (this.isSyncing || this.pendingSyncs.length === 0) {
      return;
    }

    this.isSyncing = true;
    this.notifySyncListeners();

    try {
      // 檢查網絡連接
      const isOnline = await this.checkNetworkConnection();
      if (!isOnline) {
        logger.warn('Cannot sync: offline');
        return;
      }

      // 執行同步
      await this.performSync();

      // 更新最後同步時間
      await StorageManager.set('last_task_sync', Date.now());

      logger.info('Task sync completed');
    } catch (error) {
      logger.error('Task sync error:', { error });
    } finally {
      this.isSyncing = false;
      this.notifySyncListeners();
    }
  }

  /**
   * 檢查網絡連接
   */
  private async checkNetworkConnection(): Promise<boolean> {
    try {
      // 這裡可以集成現有的網絡監控
      return true; // 簡化實現
    } catch (error) {
      return false;
    }
  }

  /**
   * 執行同步
   */
  private async performSync(): Promise<void> {
    const syncBatch = this.pendingSyncs.splice(0, 10); // 每次同步10個操作

    for (const syncData of syncBatch) {
      try {
        await this.syncTaskOperation(syncData);

        // 移除已同步的操作
        await StorageManager.remove(
          `sync_${syncData.taskId}_${syncData.timestamp}`
        );

        logger.info('Task operation synced', {
          taskId: syncData.taskId,
          operation: syncData.operation,
        });
      } catch (error) {
        logger.error('Sync task operation error:', { error, syncData });

        // 重新加入隊列
        this.pendingSyncs.unshift(syncData);
      }
    }
  }

  /**
   * 同步任務操作
   */
  private async syncTaskOperation(syncData: TaskSyncData): Promise<void> {
    // 這裡應該發送到服務器
    // 簡化實現：模擬API調用
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 處理衝突檢測
    await this.handleSyncConflict(syncData);
  }

  /**
   * 處理同步衝突
   */
  private async handleSyncConflict(syncData: TaskSyncData): Promise<void> {
    const localTask = this.tasks.get(syncData.taskId);
    if (!localTask) {
      return;
    }

    // 檢查版本衝突
    if (localTask.version !== syncData.version - 1) {
      const conflict: SyncConflict = {
        taskId: syncData.taskId,
        localVersion: {
          taskId: syncData.taskId,
          deviceId: this.deviceId,
          timestamp: localTask.updatedAt.getTime(),
          operation: 'UPDATE',
          taskData: localTask,
          version: localTask.version,
          checksum: this.calculateTaskChecksum(localTask),
        },
        remoteVersion: syncData,
        conflictType: 'VERSION_MISMATCH',
        resolution: 'REMOTE_WINS', // 默認策略
      };

      this.syncConflicts.push(conflict);
      this.emit('syncConflict', conflict);

      logger.warn('Sync conflict detected', {
        taskId: syncData.taskId,
        conflict,
      });
    }
  }

  /**
   * 解決同步衝突
   */
  async resolveSyncConflict(
    conflictId: string,
    resolution: SyncConflict['resolution']
  ): Promise<void> {
    const conflictIndex = this.syncConflicts.findIndex(
      (c) => c.taskId === conflictId
    );
    if (conflictIndex === -1) {
      return;
    }

    const conflict = this.syncConflicts[conflictIndex];
    conflict.resolution = resolution;

    try {
      switch (resolution) {
        case 'LOCAL_WINS':
          // 保持本地版本
          break;
        case 'REMOTE_WINS':
          // 使用遠程版本
          await this.updateTaskFromSync(conflict.remoteVersion);
          break;
        case 'MERGE':
          // 合併版本
          await this.mergeTaskVersions(conflict);
          break;
        case 'MANUAL':
          // 需要用戶手動解決
          this.emit('manualConflictResolution', conflict);
          break;
      }

      // 移除衝突
      this.syncConflicts.splice(conflictIndex, 1);

      logger.info('Sync conflict resolved', { taskId: conflictId, resolution });
    } catch (error) {
      logger.error('Resolve sync conflict error:', { error, conflictId });
    }
  }

  /**
   * 從同步數據更新任務
   */
  private async updateTaskFromSync(syncData: TaskSyncData): Promise<void> {
    const task = this.tasks.get(syncData.taskId);
    if (!task) {
      return;
    }

    // 更新任務數據
    Object.assign(task, syncData.taskData);
    task.version = syncData.version;
    task.lastSyncTime = syncData.timestamp;
    task.isDirty = false;

    // 保存到本地存儲
    await StorageManager.set(`task_${task.id}`, task);

    this.emit('taskSynced', task);
  }

  /**
   * 合併任務版本
   */
  private async mergeTaskVersions(conflict: SyncConflict): Promise<void> {
    const localTask = this.tasks.get(conflict.taskId);
    if (!localTask) {
      return;
    }

    // 簡單的合併策略：保留最新的字段
    const mergedTask = { ...localTask };
    const remoteTask = conflict.remoteVersion.taskData;

    if (remoteTask.updatedAt && remoteTask.updatedAt > localTask.updatedAt) {
      Object.assign(mergedTask, remoteTask);
    }

    mergedTask.version =
      Math.max(localTask.version, conflict.remoteVersion.version) + 1;
    mergedTask.lastSyncTime = Date.now();
    mergedTask.isDirty = false;

    this.tasks.set(mergedTask.id, mergedTask);
    await StorageManager.set(`task_${mergedTask.id}`, mergedTask);

    this.emit('taskSynced', mergedTask);
  }

  /**
   * 啟動自動同步
   */
  private startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.pendingSyncs.length > 0) {
        this.triggerSync();
      }
    }, 30000); // 每30秒檢查一次

    logger.info('Auto sync started');
  }

  /**
   * 停止自動同步
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      logger.info('Auto sync stopped');
    }
  }

  /**
   * 處理同步狀態變更
   */
  private handleSyncStatusChange(status: any): void {
    // 這裡可以處理離線同步管理器的狀態變更
    this.notifySyncListeners();
  }

  /**
   * 通知同步監聽器
   */
  private async notifySyncListeners(): Promise<void> {
    const status = await this.getSyncStatus();
    this.syncListeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        logger.error('Notify sync listener error:', { error });
      }
    });
  }

  /**
   * 獲取同步狀態
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const isOnline = await this.checkNetworkConnection();
    const lastSyncTime = await StorageManager.get<number>('last_task_sync');

    return {
      isOnline,
      isSyncing: this.isSyncing,
      lastSyncTime,
      pendingSyncs: this.pendingSyncs.length,
      failedSyncs: 0, // 可以從離線同步管理器獲取
      syncProgress: 0,
      connectedDevices: Array.from(this.connectedDevices.values()),
    };
  }

  /**
   * 添加同步狀態監聽器
   */
  addSyncStatusListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners.add(listener);
  }

  /**
   * 移除同步狀態監聽器
   */
  removeSyncStatusListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners.delete(listener);
  }

  /**
   * 獲取同步衝突
   */
  getSyncConflicts(): SyncConflict[] {
    return [...this.syncConflicts];
  }

  /**
   * 手動觸發同步
   */
  async manualSync(): Promise<{ success: number; failed: number }> {
    const startTime = Date.now();
    let successCount = 0;
    let failedCount = 0;

    try {
      await this.triggerSync();
      successCount = this.pendingSyncs.length;
    } catch (error) {
      failedCount = this.pendingSyncs.length;
      logger.error('Manual sync error:', { error });
    }

    logger.info('Manual sync completed', {
      success: successCount,
      failed: failedCount,
      duration: Date.now() - startTime,
    });

    return { success: successCount, failed: failedCount };
  }

  /**
   * 清理同步數據
   */
  async cleanupSyncData(): Promise<void> {
    try {
      // 清理過期的同步操作
      const cutoffTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7天前
      const keys = await StorageManager.getAllKeys();
      const syncKeys = keys.filter((key) => key.startsWith('sync_'));

      for (const key of syncKeys) {
        const syncData = await StorageManager.get<TaskSyncData>(key);
        if (syncData && syncData.timestamp < cutoffTime) {
          await StorageManager.remove(key);
        }
      }

      // 清理已解決的衝突
      this.syncConflicts = [];

      logger.info('Sync data cleaned up');
    } catch (error) {
      logger.error('Cleanup sync data error:', { error });
    }
  }

  /**
   * 驗證依賴關係
   */
  private validateDependencies(task: Task): void {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (taskId: string): boolean => {
      if (recursionStack.has(taskId)) {
        return true;
      }

      if (visited.has(taskId)) {
        return false;
      }

      visited.add(taskId);
      recursionStack.add(taskId);

      const currentTask = this.tasks.get(taskId);
      if (currentTask) {
        for (const dep of currentTask.dependencies) {
          if (hasCycle(dep.taskId)) {
            return true;
          }
        }
      }

      recursionStack.delete(taskId);
      return false;
    };

    if (hasCycle(task.id)) {
      throw new Error(`檢測到循環依賴: ${task.id}`);
    }
  }

  /**
   * 檢查是否會形成循環依賴
   */
  private wouldCreateCycle(taskId: string, dependentTaskId: string): boolean {
    // 臨時添加依賴關係進行檢查
    const tempTask = this.tasks.get(taskId);
    if (!tempTask) return false;

    tempTask.dependencies.push({
      taskId: dependentTaskId,
      type: DependencyType.REQUIRES,
    });

    try {
      this.validateDependencies(tempTask);
      return false;
    } catch {
      return true;
    } finally {
      // 移除臨時依賴
      tempTask.dependencies.pop();
    }
  }

  /**
   * 更新依賴此任務的任務列表
   */
  private updateDependents(task: Task): void {
    // 清除舊的依賴關係
    task.dependencies.forEach((dep) => {
      const dependentTask = this.tasks.get(dep.taskId);
      if (dependentTask) {
        dependentTask.dependents = dependentTask.dependents.filter(
          (id) => id !== task.id
        );
      }
    });

    // 建立新的依賴關係
    task.dependencies.forEach((dep) => {
      const dependentTask = this.tasks.get(dep.taskId);
      if (dependentTask && !dependentTask.dependents.includes(task.id)) {
        dependentTask.dependents.push(task.id);
      }
    });
  }

  /**
   * 更新任務狀態
   */
  private updateTaskStatus(task: Task): void {
    if (
      task.status === TaskStatus.PENDING ||
      task.status === TaskStatus.BLOCKED
    ) {
      if (this.isTaskReady(task)) {
        task.status = TaskStatus.READY;
      } else {
        task.status = TaskStatus.BLOCKED;
      }
    }
  }

  /**
   * 添加到隊列
   */
  private addToQueue(task: Task): void {
    if (
      task.status === TaskStatus.READY &&
      !this.taskQueue.find((t) => t.id === task.id)
    ) {
      this.taskQueue.push(task);
      this.sortQueue();
    }
  }

  /**
   * 更新隊列
   */
  private updateQueue(): void {
    this.taskQueue = this.taskQueue.filter((task) => {
      this.updateTaskStatus(task);
      return task.status === TaskStatus.READY;
    });
    this.sortQueue();
  }

  /**
   * 排序隊列
   */
  private sortQueue(): void {
    this.taskQueue.sort((a, b) => {
      // 按優先級排序
      const priorityOrder = {
        [TaskPriority.CRITICAL]: 4,
        [TaskPriority.HIGH]: 3,
        [TaskPriority.NORMAL]: 2,
        [TaskPriority.LOW]: 1,
      };

      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // 同優先級按創建時間排序
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }

  /**
   * 啟動準備就緒的任務
   */
  private async startReadyTasks(): Promise<void> {
    const readyTasks = this.taskQueue.filter(
      (task) =>
        this.isTaskReady(task) &&
        this.runningTasks.size < this.config.maxConcurrentTasks
    );

    const executionPromises = readyTasks.map((task) => this.executeTask(task));
    await Promise.all(executionPromises);
  }

  /**
   * 執行單個任務
   */
  private async executeTask(task: Task): Promise<void> {
    if (!task.executor) {
      logger.error(`[Task Manager] 任務 ${task.id} 沒有執行器`);
      task.status = TaskStatus.FAILED;
      task.error = 'No executor provided';
      return;
    }

    // 從隊列中移除
    this.taskQueue = this.taskQueue.filter((t) => t.id !== task.id);
    this.runningTasks.add(task.id);

    task.status = TaskStatus.RUNNING;
    task.startedAt = new Date();

    // 創建進度追蹤器
    const progressTracker = this.createProgressTracker(task.id);

    this.emit('taskStarted', { taskId: task.id });

    try {
      // 設置超時
      const timeoutPromise = this.config.enableTimeout
        ? this.delay(task.metadata?.timeout || this.config.defaultTimeout)
        : new Promise(() => {});

      const executionPromise = task.executor.execute(task, progressTracker);

      const result = await Promise.race([
        executionPromise,
        timeoutPromise.then(() => {
          throw new Error('Task execution timeout');
        }),
      ]);

      // 任務成功完成
      progressTracker.complete();
      task.status = TaskStatus.COMPLETED;
      task.completedAt = new Date();
      task.actualDuration =
        task.completedAt.getTime() - task.startedAt.getTime();

      const taskResult: TaskResult = {
        taskId: task.id,
        success: true,
        data: result,
        duration: task.actualDuration,
        timestamp: task.completedAt,
      };

      this.completedTasks.set(task.id, taskResult);
      this.emit('taskCompleted', { taskId: task.id, result: taskResult });

      // 更新依賴此任務的任務狀態
      task.dependents.forEach((dependentId) => {
        const dependentTask = this.tasks.get(dependentId);
        if (dependentTask) {
          this.updateTaskStatus(dependentTask);
          this.addToQueue(dependentTask);
        }
      });
    } catch (error) {
      // 任務執行失敗
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      progressTracker.fail(errorMessage);
      task.error = errorMessage;
      task.failedAt = new Date();

      if (task.retryCount < task.maxRetries && this.config.enableRetry) {
        // 重試任務
        task.retryCount++;
        task.status = TaskStatus.PENDING;
        this.addToQueue(task);
        logger.warn(
          `[Task Manager] 任務 ${task.id} 執行失敗，將重試 (${task.retryCount}/${task.maxRetries})`
        );
      } else {
        // 任務最終失敗
        task.status = TaskStatus.FAILED;
        this.emit('taskFailed', { taskId: task.id, error: task.error });
        logger.error(`[Task Manager] 任務 ${task.id} 最終失敗: ${task.error}`);
      }
    } finally {
      this.runningTasks.delete(task.id);
    }
  }

  /**
   * 檢測死鎖
   */
  private detectDeadlock(): boolean {
    const nodes = new Map<string, DependencyNode>();

    // 初始化節點
    this.tasks.forEach((task) => {
      nodes.set(task.id, {
        task,
        inDegree: task.dependencies.length,
        outDegree: task.dependents.length,
        visited: false,
        inStack: false,
      });
    });

    // 使用拓撲排序檢測循環
    const hasCycle = (nodeId: string): boolean => {
      const node = nodes.get(nodeId);
      if (!node) return false;

      if (node.inStack) return true;
      if (node.visited) return false;

      node.visited = true;
      node.inStack = true;

      for (const dep of node.task.dependencies) {
        if (hasCycle(dep.taskId)) {
          return true;
        }
      }

      node.inStack = false;
      return false;
    };

    for (const [nodeId] of nodes) {
      if (hasCycle(nodeId)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 延遲函數
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ==================== 事件系統 ====================

  /**
   * 添加事件監聽器
   */
  on(event: string, listener: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * 移除事件監聽器
   */
  off(event: string, listener: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 發送事件
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          logger.error(`[Task Manager] 事件監聽器錯誤: ${error}`);
        }
      });
    }
  }

  // ==================== 統計和監控方法 ====================

  /**
   * 獲取統計信息
   */
  getStatistics(): {
    totalTasks: number;
    pendingTasks: number;
    runningTasks: number;
    completedTasks: number;
    failedTasks: number;
    cancelledTasks: number;
    blockedTasks: number;
    averageExecutionTime: number;
    successRate: number;
  } {
    const tasks = Array.from(this.tasks.values());
    const completedResults = Array.from(this.completedTasks.values());

    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(
      (t) => t.status === TaskStatus.PENDING
    ).length;
    const runningTasks = tasks.filter(
      (t) => t.status === TaskStatus.RUNNING
    ).length;
    const completedTasks = tasks.filter(
      (t) => t.status === TaskStatus.COMPLETED
    ).length;
    const failedTasks = tasks.filter(
      (t) => t.status === TaskStatus.FAILED
    ).length;
    const cancelledTasks = tasks.filter(
      (t) => t.status === TaskStatus.CANCELLED
    ).length;
    const blockedTasks = tasks.filter(
      (t) => t.status === TaskStatus.BLOCKED
    ).length;

    const averageExecutionTime =
      completedResults.length > 0
        ? completedResults.reduce((sum, result) => sum + result.duration, 0) /
          completedResults.length
        : 0;

    const successRate =
      completedResults.length > 0
        ? (completedResults.filter((r) => r.success).length /
            completedResults.length) *
          100
        : 0;

    return {
      totalTasks,
      pendingTasks,
      runningTasks,
      completedTasks,
      failedTasks,
      cancelledTasks,
      blockedTasks,
      averageExecutionTime,
      successRate,
    };
  }

  /**
   * 獲取依賴圖
   */
  getDependencyGraph(): {
    nodes: {
      id: string;
      name: string;
      status: TaskStatus;
      priority: TaskPriority;
    }[];
    edges: { from: string; to: string; type: DependencyType }[];
  } {
    const nodes = Array.from(this.tasks.values()).map((task) => ({
      id: task.id,
      name: task.name,
      status: task.status,
      priority: task.priority,
    }));

    const edges: { from: string; to: string; type: DependencyType }[] = [];
    this.tasks.forEach((task) => {
      task.dependencies.forEach((dep) => {
        edges.push({
          from: dep.taskId,
          to: task.id,
          type: dep.type,
        });
      });
    });

    return { nodes, edges };
  }

  /**
   * 清理完成的任務
   */
  cleanupCompletedTasks(maxAge: number = 24 * 60 * 60 * 1000): number {
    const cutoffTime = Date.now() - maxAge;
    let cleanedCount = 0;

    // 清理任務
    for (const [taskId, task] of this.tasks.entries()) {
      if (task.status === TaskStatus.COMPLETED && task.completedAt) {
        if (task.completedAt.getTime() < cutoffTime) {
          this.tasks.delete(taskId);
          this.completedTasks.delete(taskId);
          cleanedCount++;
        }
      }
    }

    logger.info(`[Task Manager] 清理了 ${cleanedCount} 個已完成的任務`);
    return cleanedCount;
  }

  // ==================== 加密相關方法 ====================

  /**
   * 加密任務數據
   */
  private async encryptTaskData(task: Task): Promise<EncryptedData | null> {
    if (
      !this.encryptionConfig.enabled ||
      !this.encryptionConfig.encryptTaskData
    ) {
      return null;
    }

    try {
      const startTime = Date.now();
      const encryptedData = await encryptionManager.encrypt(task);
      this.encryptionStats.encryptedTasks++;
      this.encryptionStats.lastEncryptionTime = startTime;
      logger.info('Task data encrypted successfully', { taskId: task.id });
      return encryptedData;
    } catch (error) {
      this.encryptionStats.encryptionErrors++;
      logger.error('Failed to encrypt task data', { error, taskId: task.id });
      return null;
    }
  }

  /**
   * 解密任務數據
   */
  private async decryptTaskData(
    encryptedData: EncryptedData
  ): Promise<Task | null> {
    if (!this.encryptionConfig.enabled) {
      return null;
    }

    try {
      const startTime = Date.now();
      const decryptedTask = await encryptionManager.decrypt(encryptedData);
      this.encryptionStats.lastDecryptionTime = startTime;
      logger.info('Task data decrypted successfully');
      return decryptedTask;
    } catch (error) {
      this.encryptionStats.decryptionErrors++;
      logger.error('Failed to decrypt task data', { error });
      return null;
    }
  }

  /**
   * 加密同步數據
   */
  private async encryptSyncData(
    syncData: TaskSyncData
  ): Promise<EncryptedData | null> {
    if (
      !this.encryptionConfig.enabled ||
      !this.encryptionConfig.encryptSyncData
    ) {
      return null;
    }

    try {
      const startTime = Date.now();
      const encryptedData = await encryptionManager.encrypt(syncData);
      this.encryptionStats.encryptedSyncs++;
      this.encryptionStats.lastEncryptionTime = startTime;
      logger.info('Sync data encrypted successfully');
      return encryptedData;
    } catch (error) {
      this.encryptionStats.encryptionErrors++;
      logger.error('Failed to encrypt sync data', { error });
      return null;
    }
  }

  /**
   * 解密同步數據
   */
  private async decryptSyncData(
    encryptedData: EncryptedData
  ): Promise<TaskSyncData | null> {
    if (!this.encryptionConfig.enabled) {
      return null;
    }

    try {
      const startTime = Date.now();
      const decryptedSyncData = await encryptionManager.decrypt(encryptedData);
      this.encryptionStats.lastDecryptionTime = startTime;
      logger.info('Sync data decrypted successfully');
      return decryptedSyncData;
    } catch (error) {
      this.encryptionStats.decryptionErrors++;
      logger.error('Failed to decrypt sync data', { error });
      return null;
    }
  }

  /**
   * 更新加密配置
   */
  updateEncryptionConfig(config: Partial<TaskEncryptionConfig>): void {
    this.encryptionConfig = { ...this.encryptionConfig, ...config };

    // 如果啟用密鑰輪換，啟動定時器
    if (this.encryptionConfig.keyRotationEnabled && !this.keyRotationInterval) {
      this.startKeyRotation();
    } else if (
      !this.encryptionConfig.keyRotationEnabled &&
      this.keyRotationInterval
    ) {
      this.stopKeyRotation();
    }

    logger.info('Encryption config updated', { config: this.encryptionConfig });
  }

  /**
   * 獲取加密配置
   */
  getEncryptionConfig(): TaskEncryptionConfig {
    return { ...this.encryptionConfig };
  }

  /**
   * 獲取加密統計
   */
  getEncryptionStats(): EncryptionStats {
    return { ...this.encryptionStats };
  }

  /**
   * 重置加密統計
   */
  resetEncryptionStats(): void {
    this.encryptionStats = {
      encryptedTasks: 0,
      encryptedSyncs: 0,
      encryptionErrors: 0,
      decryptionErrors: 0,
      lastEncryptionTime: 0,
      lastDecryptionTime: 0,
    };
    logger.info('Encryption stats reset');
  }

  /**
   * 啟動密鑰輪換
   */
  private startKeyRotation(): void {
    if (this.keyRotationInterval) {
      clearInterval(this.keyRotationInterval);
    }

    this.keyRotationInterval = setInterval(async () => {
      try {
        await this.rotateEncryptionKeys();
      } catch (error) {
        logger.error('Key rotation failed', { error });
      }
    }, this.encryptionConfig.keyRotationInterval);

    logger.info('Key rotation started', {
      interval: this.encryptionConfig.keyRotationInterval,
    });
  }

  /**
   * 停止密鑰輪換
   */
  private stopKeyRotation(): void {
    if (this.keyRotationInterval) {
      clearInterval(this.keyRotationInterval);
      this.keyRotationInterval = null;
      logger.info('Key rotation stopped');
    }
  }

  /**
   * 輪換加密密鑰
   */
  private async rotateEncryptionKeys(): Promise<void> {
    try {
      // 生成新密鑰
      const newKey = await encryptionManager.generateKey(
        `rotation_${Date.now()}`,
        this.encryptionConfig.algorithm
      );

      // 重新加密所有敏感數據
      const tasks = Array.from(this.tasks.values());
      let reencryptedCount = 0;

      for (const task of tasks) {
        if (task.metadata && Object.keys(task.metadata).length > 0) {
          const encryptedMetadata = await this.encryptTaskData(task);
          if (encryptedMetadata) {
            reencryptedCount++;
          }
        }
      }

      logger.info('Key rotation completed', {
        newKeyId: newKey.id,
        reencryptedCount,
      });

      // 發出密鑰輪換事件
      this.emit('keyRotated', { keyId: newKey.id, reencryptedCount });
    } catch (error) {
      logger.error('Key rotation failed', { error });
      throw error;
    }
  }

  /**
   * 檢查加密支持
   */
  isEncryptionSupported(): boolean {
    return encryptionManager.isEncryptionSupported();
  }

  /**
   * 測試加密功能
   */
  async testEncryption(): Promise<{ success: boolean; error?: string }> {
    try {
      const testData = { test: 'data', timestamp: Date.now() };
      const encrypted = await encryptionManager.encrypt(testData);
      const decrypted = await encryptionManager.decrypt(encrypted);

      const success = JSON.stringify(testData) === JSON.stringify(decrypted);

      if (success) {
        logger.info('Encryption test passed');
      } else {
        logger.error('Encryption test failed - data mismatch');
      }

      return { success };
    } catch (error) {
      logger.error('Encryption test failed', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 清理過期加密數據
   */
  async cleanupEncryptedData(
    maxAge: number = 90 * 24 * 60 * 60 * 1000
  ): Promise<number> {
    try {
      const cutoffTime = Date.now() - maxAge;
      let cleanedCount = 0;

      // 清理過期的加密統計數據
      if (this.encryptionStats.lastEncryptionTime < cutoffTime) {
        this.encryptionStats.lastEncryptionTime = 0;
        cleanedCount++;
      }

      if (this.encryptionStats.lastDecryptionTime < cutoffTime) {
        this.encryptionStats.lastDecryptionTime = 0;
        cleanedCount++;
      }

      // 清理過期密鑰
      const expiredKeys = await encryptionManager.cleanupExpiredKeys(maxAge);
      cleanedCount += expiredKeys;

      logger.info('Encrypted data cleanup completed', { cleanedCount });
      return cleanedCount;
    } catch (error) {
      logger.error('Failed to cleanup encrypted data', { error });
      return 0;
    }
  }
}

// 創建單例實例
export const taskDependencyManager = new TaskDependencyManager();

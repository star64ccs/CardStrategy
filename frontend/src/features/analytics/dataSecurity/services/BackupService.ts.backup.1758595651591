/**
 * 備份服務
 * 負責數據的備份、恢復、調度等操作
 */

import { logger } from '../../../core/utils/logger';
import type {
  BackupService,
  BackupConfig,
  BackupTask,
  RestoreRequest,
  RestoreResult,
} from '../types/security';
import {
  BackupType,
  BackupStatus,
  EncryptionAlgorithm,
  HashAlgorithm,
} from '../types/security';

import { CryptoEncryptionService } from './encryptionService';

/**
 * 備份服務實現
 */
export class CryptoBackupService implements BackupService {
  private static instance: CryptoBackupService;
  private readonly encryptionService: CryptoEncryptionService;
  private readonly backupConfigs = new Map<string, BackupConfig>();
  private readonly backupTasks = new Map<string, BackupTask>();
  private readonly scheduledJobs = new Map<string, NodeJS.Timeout>();
  private isInitialized = false;

  private constructor() {
    this.encryptionService = CryptoEncryptionService.getInstance();
  }

  /**
   * 獲取服務實例（單例模式）
   */
  public static getInstance(): CryptoBackupService {
    if (!CryptoBackupService.instance) {
      CryptoBackupService.instance = new CryptoBackupService();
    }
    return CryptoBackupService.instance;
  }

  /**
   * 初始化服務
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      logger.warn('CryptoBackupService 已經初始化');
      return true;
    }

    try {
      // 初始化加密服務
      await this.encryptionService.initialize();

      // 加載現有配置
      await this.loadBackupConfigs();

      // 恢復調度任務
      await this.restoreScheduledJobs();

      this.isInitialized = true;
      logger.info('CryptoBackupService 初始化成功');
      return true;
    } catch (error) {
      logger.error('CryptoBackupService 初始化失敗:', error);
      return false;
    }
  }

  /**
   * 創建備份
   */
  public async createBackup(config: BackupConfig): Promise<BackupTask> {
    try {
      // 驗證配置
      this.validateBackupConfig(config);

      // 創建備份任務
      const task: BackupTask = {
        id: this.generateTaskId(),
        configId: config.id,
        type: config.type,
        status: BackupStatus.PENDING,
        startedAt: new Date(),
        progress: 0,
        statistics: {
          totalFiles: 0,
          processedFiles: 0,
          totalSize: 0,
          processedSize: 0,
          compressedSize: 0,
          compressionRatio: 1.0,
          transferSpeed: 0,
        },
        metadata: {
          triggerType: 'manual',
          encryptionUsed: config.encryption.enabled,
          compressionUsed: config.compression.enabled,
        },
        errors: [],
      };

      // 存儲任務
      this.backupTasks.set(task.id, task);

      // 執行備份（延遲執行以保持 pending 狀態）
      setTimeout(() => {
        this.executeBackup(task, config).catch(error => {
          logger.error(`備份任務執行失敗: ${task.id}`, error);
          this.updateTaskStatus(task.id, BackupStatus.FAILED, error.message);
        });
      }, 0);

      logger.info(`備份任務已創建: ${task.id}`, {
        configId: config.id,
        type: config.type,
      });
      return task;
    } catch (error) {
      logger.error('創建備份失敗:', error);
      throw error;
    }
  }

  /**
   * 調度備份
   */
  public async scheduleBackup(config: BackupConfig): Promise<boolean> {
    try {
      // 存儲配置
      this.backupConfigs.set(config.id, config);
      await this.persistBackupConfig(config);

      // 解析 cron 表達式並創建調度
      const interval = this.parseCronExpression(config.schedule);

      const scheduledJob = setInterval(async () => {
        try {
          logger.info(`執行調度備份: ${config.id}`);
          const task = await this.createBackup(config);
          task.metadata.triggerType = 'scheduled';
        } catch (error) {
          logger.error(`調度備份執行失敗: ${config.id}`, error);
        }
      }, interval);

      this.scheduledJobs.set(config.id, scheduledJob);

      logger.info(`備份調度已設置: ${config.id}`, {
        schedule: config.schedule,
      });
      return true;
    } catch (error) {
      logger.error('調度備份失敗:', error);
      return false;
    }
  }

  /**
   * 取消備份
   */
  public async cancelBackup(taskId: string): Promise<boolean> {
    try {
      const task = this.backupTasks.get(taskId);

      if (!task) {
        logger.warn(`備份任務不存在: ${taskId}`);
        return false;
      }

      if (
        task.status === BackupStatus.COMPLETED ||
        task.status === BackupStatus.FAILED
      ) {
        logger.warn(`備份任務已完成，無法取消: ${taskId}`);
        return false;
      }

      // 更新任務狀態
      task.status = BackupStatus.CANCELLED;
      task.completedAt = new Date();

      logger.info(`備份任務已取消: ${taskId}`);
      return true;
    } catch (error) {
      logger.error('取消備份失敗:', error);
      return false;
    }
  }

  /**
   * 獲取備份狀態
   */
  public async getBackupStatus(taskId: string): Promise<BackupTask | null> {
    try {
      return this.backupTasks.get(taskId) || null;
    } catch (error) {
      logger.error('獲取備份狀態失敗:', error);
      return null;
    }
  }

  /**
   * 列出備份
   */
  public async listBackups(
    filter?: Partial<BackupTask>
  ): Promise<BackupTask[]> {
    try {
      let tasks = Array.from(this.backupTasks.values());

      // 應用過濾器
      if (filter) {
        tasks = tasks.filter(task => {
          return Object.entries(filter).every(([field, value]) => {
            if (value === undefined) return true;
            return (task as any)[field] === value;
          });
        });
      }

      // 排序（按開始時間降序）
      tasks.sort((a, b) => {
        const timeA = a.startedAt?.getTime() || 0;
        const timeB = b.startedAt?.getTime() || 0;
        return timeB - timeA;
      });

      return tasks;
    } catch (error) {
      logger.error('列出備份失敗:', error);
      return [];
    }
  }

  /**
   * 刪除備份
   */
  public async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const task = this.backupTasks.get(backupId);

      if (!task) {
        logger.warn(`備份任務不存在: ${backupId}`);
        return false;
      }

      // 刪除備份文件
      await this.deleteBackupFiles(task);

      // 從內存中移除
      this.backupTasks.delete(backupId);

      // 從持久化存儲中移除
      await this.removePersistedTask(backupId);

      logger.info(`備份已刪除: ${backupId}`);
      return true;
    } catch (error) {
      logger.error('刪除備份失敗:', error);
      return false;
    }
  }

  /**
   * 恢復備份
   */
  public async restoreBackup(request: RestoreRequest): Promise<RestoreResult> {
    try {
      const startTime = Date.now();

      // 驗證請求
      this.validateRestoreRequest(request);

      // 獲取備份任務
      const backupTask = this.backupTasks.get(request.backupId);
      if (!backupTask) {
        throw new Error(`備份任務不存在: ${request.backupId}`);
      }

      if (backupTask.status !== BackupStatus.COMPLETED) {
        throw new Error(`備份任務未完成: ${request.backupId}`);
      }

      // 創建恢復任務ID
      const restoreTaskId = this.generateTaskId();

      // 執行恢復操作
      const result = await this.executeRestore(
        backupTask,
        request,
        restoreTaskId
      );

      const duration = Date.now() - startTime;
      result.duration = duration;

      logger.info(`備份恢復完成: ${request.backupId}`, {
        restoreTaskId,
        restoredFiles: result.restoredFiles,
        duration,
      });

      return result;
    } catch (error) {
      logger.error('恢復備份失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '恢復失敗',
      };
    }
  }

  /**
   * 驗證備份
   */
  public async verifyBackup(backupId: string): Promise<{
    valid: boolean;
    checksum: string;
    errors?: string[];
  }> {
    try {
      const task = this.backupTasks.get(backupId);

      if (!task) {
        throw new Error(`備份任務不存在: ${backupId}`);
      }

      if (task.status !== BackupStatus.COMPLETED) {
        throw new Error(`備份任務未完成: ${backupId}`);
      }

      // 計算備份文件的校驗和
      const checksum = await this.calculateBackupChecksum(task);

      // 驗證完整性
      const valid = task.metadata.checksum === checksum;

      const errors: string[] = [];
      if (!valid) {
        errors.push('校驗和不匹配');
      }

      logger.info(`備份驗證完成: ${backupId}`, { valid, checksum });

      return {
        valid,
        checksum,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      logger.error('驗證備份失敗:', error);
      return {
        valid: false,
        checksum: '',
        errors: [error instanceof Error ? error.message : '驗證失敗'],
      };
    }
  }

  /**
   * 獲取備份統計信息
   */
  public async getBackupStatistics(): Promise<{
    totalBackups: number;
    completedBackups: number;
    failedBackups: number;
    totalSize: number;
    averageBackupTime: number;
    compressionRatio: number;
    encryptionUsage: number;
  }> {
    const tasks = Array.from(this.backupTasks.values());

    const stats = {
      totalBackups: tasks.length,
      completedBackups: tasks.filter(t => t.status === BackupStatus.COMPLETED)
        .length,
      failedBackups: tasks.filter(t => t.status === BackupStatus.FAILED).length,
      totalSize: tasks.reduce((sum, t) => sum + t.statistics.totalSize, 0),
      averageBackupTime: 0,
      compressionRatio: 0,
      encryptionUsage: 0,
    };

    const completedTasks = tasks.filter(
      t => t.status === BackupStatus.COMPLETED
    );

    if (completedTasks.length > 0) {
      const totalTime = completedTasks.reduce((sum, t) => {
        if (t.startedAt && t.completedAt) {
          return sum + (t.completedAt.getTime() - t.startedAt.getTime());
        }
        return sum;
      }, 0);

      stats.averageBackupTime = totalTime / completedTasks.length;

      stats.compressionRatio =
        completedTasks.reduce(
          (sum, t) => sum + (t.statistics.compressionRatio || 1.0),
          0
        ) / completedTasks.length;

      stats.encryptionUsage =
        completedTasks.filter(t => t.metadata.encryptionUsed).length /
        completedTasks.length;
    }

    return stats;
  }

  /**
   * 銷毀服務
   */
  public async destroy(): Promise<void> {
    try {
      // 清除所有調度任務
      this.scheduledJobs.forEach(job => clearInterval(job));
      this.scheduledJobs.clear();

      // 取消所有進行中的備份
      const activeTasks = Array.from(this.backupTasks.values()).filter(
        task => task.status === BackupStatus.IN_PROGRESS
      );

      for (const task of activeTasks) {
        await this.cancelBackup(task.id);
      }

      this.backupConfigs.clear();
      this.backupTasks.clear();
      this.isInitialized = false;

      logger.info('CryptoBackupService 已銷毀');
    } catch (error) {
      logger.error('CryptoBackupService 銷毀失敗:', error);
    }
  }

  // 私有方法

  private generateTaskId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `backup_${timestamp}_${random}`;
  }

  private validateBackupConfig(config: BackupConfig): void {
    if (!config.id || !config.name) {
      throw new Error('備份配置缺少必要字段');
    }

    if (!config.destination.path) {
      throw new Error('備份目標路徑不能為空');
    }

    if (
      config.encryption.enabled &&
      !config.encryption.keyId &&
      !config.encryption.algorithm
    ) {
      throw new Error('啟用加密時必須提供密鑰ID或算法');
    }
  }

  private validateRestoreRequest(request: RestoreRequest): void {
    if (!request.backupId || !request.destination) {
      throw new Error('恢復請求缺少必要字段');
    }
  }

  private async executeBackup(
    task: BackupTask,
    config: BackupConfig
  ): Promise<void> {
    try {
      // 更新任務狀態
      task.status = BackupStatus.IN_PROGRESS;
      task.progress = 0;

      // 模擬文件掃描
      await this.scanFiles(task, config);

      // 模擬數據處理
      await this.processFiles(task, config);

      // 計算校驗和
      task.metadata.checksum = await this.calculateBackupChecksum(task);

      // 完成備份
      task.status = BackupStatus.COMPLETED;
      task.completedAt = new Date();
      task.progress = 100;

      // 持久化任務
      await this.persistBackupTask(task);

      logger.info(`備份任務完成: ${task.id}`, {
        totalFiles: task.statistics.totalFiles,
        totalSize: task.statistics.totalSize,
        duration: task.completedAt.getTime() - task.startedAt.getTime(),
      });
    } catch (error) {
      task.status = BackupStatus.FAILED;
      task.completedAt = new Date();
      task.errors.push({
        timestamp: new Date(),
        level: 'critical',
        message: error instanceof Error ? error.message : '未知錯誤',
        details: error,
      });

      throw error;
    }
  }

  private async scanFiles(
    task: BackupTask,
    config: BackupConfig
  ): Promise<void> {
    // 模擬文件掃描
    await new Promise(resolve => setTimeout(resolve, 500));

    // 模擬統計數據
    task.statistics.totalFiles = Math.floor(Math.random() * 1000) + 100;
    task.statistics.totalSize =
      Math.floor(Math.random() * 1000000000) + 10000000; // 10MB-1GB

    task.progress = 10;
  }

  private async processFiles(
    task: BackupTask,
    config: BackupConfig
  ): Promise<void> {
    const { totalFiles } = task.statistics;

    for (let i = 0; i < totalFiles; i++) {
      // 模擬文件處理
      await new Promise(resolve => setTimeout(resolve, 1));

      task.statistics.processedFiles = i + 1;
      task.statistics.processedSize += Math.floor(
        task.statistics.totalSize / totalFiles
      );
      task.progress = 10 + Math.floor((i / totalFiles) * 80);

      // 模擬壓縮
      if (config.compression.enabled) {
        task.statistics.compressedSize = Math.floor(
          task.statistics.processedSize * 0.7
        );
        task.statistics.compressionRatio =
          task.statistics.compressedSize / task.statistics.processedSize;
      }

      // 模擬加密
      if (config.encryption.enabled) {
        // 加密處理（模擬）
        await new Promise(resolve => setTimeout(resolve, 0.5));
      }
    }
  }

  private async executeRestore(
    backupTask: BackupTask,
    request: RestoreRequest,
    restoreTaskId: string
  ): Promise<RestoreResult> {
    // 模擬恢復操作
    await new Promise(resolve => setTimeout(resolve, 1000));

    const restoredFiles = backupTask.statistics.totalFiles;
    const restoredSize = backupTask.statistics.totalSize;

    // 模擬校驗和計算
    const checksum = await this.encryptionService.hash(
      `restore_${restoreTaskId}_${Date.now()}`,
      HashAlgorithm.SHA256
    );

    return {
      success: true,
      taskId: restoreTaskId,
      restoredFiles,
      restoredSize,
      checksum,
      verified: true,
      errors: [],
    };
  }

  private async calculateBackupChecksum(task: BackupTask): Promise<string> {
    // 模擬校驗和計算
    const data = `backup_${task.id}_${task.statistics.totalSize}_${task.statistics.totalFiles}`;
    return this.encryptionService.hash(data, HashAlgorithm.SHA256);
  }

  private async deleteBackupFiles(task: BackupTask): Promise<void> {
    // 在真實環境中，這裡會刪除實際的備份文件
    logger.debug(`刪除備份文件: ${task.id}`);
  }

  private updateTaskStatus(
    taskId: string,
    status: BackupStatus,
    errorMessage?: string
  ): void {
    const task = this.backupTasks.get(taskId);
    if (task) {
      task.status = status;
      task.completedAt = new Date();

      if (errorMessage) {
        task.errors.push({
          timestamp: new Date(),
          level: 'error',
          message: errorMessage,
        });
      }
    }
  }

  private parseCronExpression(schedule: string): number {
    // 簡化的 cron 解析，返回毫秒間隔
    // 在真實環境中，會使用專門的 cron 解析庫

    // 默認每小時執行一次
    return 60 * 60 * 1000; // 1 hour
  }

  private async loadBackupConfigs(): Promise<void> {
    try {
      // 從持久化存儲加載配置
      const storage = localStorage || {};

      Object.keys(storage).forEach(key => {
        if (key.startsWith('backup_config_')) {
          try {
            const config = JSON.parse(storage[key]);
            this.backupConfigs.set(config.id, config);
          } catch (error) {
            logger.warn(`載入備份配置失敗: ${key}`, error);
          }
        }
      });

      logger.info(`載入 ${this.backupConfigs.size} 個備份配置`);
    } catch (error) {
      logger.error('載入備份配置失敗:', error);
    }
  }

  private async restoreScheduledJobs(): Promise<void> {
    try {
      // 恢復調度任務
      for (const config of this.backupConfigs.values()) {
        if (config.schedule) {
          await this.scheduleBackup(config);
        }
      }

      logger.info(`恢復 ${this.scheduledJobs.size} 個調度任務`);
    } catch (error) {
      logger.error('恢復調度任務失敗:', error);
    }
  }

  private async persistBackupConfig(config: BackupConfig): Promise<void> {
    try {
      const storage = localStorage || {};
      storage[`backup_config_${config.id}`] = JSON.stringify(config);
    } catch (error) {
      logger.error('持久化備份配置失敗:', error);
    }
  }

  private async persistBackupTask(task: BackupTask): Promise<void> {
    try {
      const storage = localStorage || {};
      storage[`backup_task_${task.id}`] = JSON.stringify({
        ...task,
        startedAt: task.startedAt?.toISOString(),
        completedAt: task.completedAt?.toISOString(),
      });
    } catch (error) {
      logger.error('持久化備份任務失敗:', error);
    }
  }

  private async removePersistedTask(taskId: string): Promise<void> {
    try {
      const storage = localStorage || {};
      delete storage[`backup_task_${taskId}`];
    } catch (error) {
      logger.error('移除持久化任務失敗:', error);
    }
  }
}

import { logger } from '@/utils/logger';

// 衝突解決策略類型
export type ConflictResolutionStrategy =
  | 'server-wins' // 服務器優先
  | 'client-wins' // 客戶端優先
  | 'merge' // 智能合併
  | 'timestamp-based' // 基於時間戳
  | 'user-choice' // 用戶選擇
  | 'field-level' // 字段級別合併
  | 'version-based' // 基於版本號
  | 'custom'; // 自定義策略

// 衝突信息
export interface ConflictInfo {
  taskId: string;
  field: string;
  clientValue: any;
  serverValue: any;
  clientTimestamp: number;
  serverTimestamp: number;
  clientVersion?: string;
  serverVersion?: string;
  conflictType: 'update' | 'delete' | 'create';
  severity: 'low' | 'medium' | 'high';
}

// 衝突解決結果
export interface ConflictResolution {
  resolved: boolean;
  finalValue: any;
  strategy: ConflictResolutionStrategy;
  confidence: number; // 0-1，解決策略的置信度
  metadata?: Record<string, any>;
}

// 衝突解決配置
export interface ConflictResolutionConfig {
  defaultStrategy: ConflictResolutionStrategy;
  enableAutoResolution: boolean;
  enableUserChoice: boolean;
  timestampThreshold: number; // 時間戳差異閾值（毫秒）
  versionCheckEnabled: boolean;
  fieldLevelMerge: boolean;
  customResolvers: Record<string, (client: any, server: any) => any>;
}

// 同步任務類型
export interface SyncTask {
  id: string;
  type: 'api' | 'data' | 'file' | 'notification';
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  body?: any;
  priority: 'high' | 'medium' | 'low';
  retryCount: number;
  maxRetries: number;
  retryDelay: number;
  createdAt: number;
  lastAttempt?: number;
  error?: string;
  metadata?: Record<string, any>;
  // 新增衝突解決相關字段
  conflictResolutionStrategy?: ConflictResolutionStrategy;
  version?: string;
  lastModified?: number;
  etag?: string;
}

// 同步配置
export interface SyncConfig {
  maxConcurrentTasks: number;
  defaultRetryCount: number;
  defaultRetryDelay: number;
  maxRetryDelay: number;
  retryBackoffMultiplier: number;
  syncInterval: number;
  enableAutoSync: boolean;
  enableConflictResolution: boolean;
  // 新增衝突解決配置
  conflictResolution: ConflictResolutionConfig;
}

// 同步狀態
export interface SyncStatus {
  isRunning: boolean;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  pendingTasks: number;
  lastSyncTime?: number;
  nextSyncTime?: number;
  errors: string[];
}

// 同步統計
export interface SyncStats {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageSyncTime: number;
  lastSyncDuration?: number;
  syncHistory: {
    timestamp: number;
    duration: number;
    success: boolean;
    taskCount: number;
  }[];
}

// 背景同步管理器
export class BackgroundSyncManager {
  private tasks: Map<string, SyncTask> = new Map();
  private config: SyncConfig;
  private status: SyncStatus;
  private stats: SyncStats;
  private syncInterval?: NodeJS.Timeout;
  private isProcessing = false;

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = {
      maxConcurrentTasks: 3,
      defaultRetryCount: 3,
      defaultRetryDelay: 1000,
      maxRetryDelay: 30000,
      retryBackoffMultiplier: 2,
      syncInterval: 5 * 60 * 1000, // 5分鐘
      enableAutoSync: true,
      enableConflictResolution: true,
      conflictResolution: {
        defaultStrategy: 'server-wins',
        enableAutoResolution: true,
        enableUserChoice: true,
        timestampThreshold: 1000, // 1秒
        versionCheckEnabled: false,
        fieldLevelMerge: true,
        customResolvers: {},
      },
      ...config,
    };

    this.status = {
      isRunning: false,
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      pendingTasks: 0,
      errors: [],
    };

    this.stats = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      averageSyncTime: 0,
      syncHistory: [],
    };

    this.loadTasks();
    this.startAutoSync();
  }

  // 添加同步任務
  addTask(task: Omit<SyncTask, 'id' | 'retryCount' | 'createdAt'>): string {
    const id = this.generateTaskId();
    const syncTask: SyncTask = {
      ...task,
      id,
      retryCount: 0,
      createdAt: Date.now(),
    };

    this.tasks.set(id, syncTask);
    this.updateStatus();
    this.saveTasks();

    logger.info('[Background Sync] 添加同步任務:', id, task.type);
    return id;
  }

  // 批量添加任務
  addTasks(
    tasks: Omit<SyncTask, 'id' | 'retryCount' | 'createdAt'>[]
  ): string[] {
    const ids: string[] = [];

    for (const task of tasks) {
      const id = this.addTask(task);
      ids.push(id);
    }

    return ids;
  }

  // 移除任務
  removeTask(id: string): boolean {
    const removed = this.tasks.delete(id);
    if (removed) {
      this.updateStatus();
      this.saveTasks();
      logger.info('[Background Sync] 移除同步任務:', id);
    }
    return removed;
  }

  // 清空所有任務
  clearTasks(): void {
    this.tasks.clear();
    this.updateStatus();
    this.saveTasks();
    logger.info('[Background Sync] 清空所有同步任務');
  }

  // 獲取任務
  getTask(id: string): SyncTask | undefined {
    return this.tasks.get(id);
  }

  // 獲取所有任務
  getAllTasks(): SyncTask[] {
    return Array.from(this.tasks.values());
  }

  // 獲取待處理任務
  getPendingTasks(): SyncTask[] {
    return Array.from(this.tasks.values())
      .filter((task) => task.retryCount < task.maxRetries)
      .sort((a, b) => {
        // 按優先級排序
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];

        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }

        // 按創建時間排序
        return a.createdAt - b.createdAt;
      });
  }

  // 開始同步
  async startSync(): Promise<void> {
    if (this.isProcessing) {
      logger.warn('[Background Sync] 同步已在進行中');
      return;
    }

    this.isProcessing = true;
    this.status.isRunning = true;
    this.status.lastSyncTime = Date.now();
    this.status.errors = [];

    const startTime = Date.now();
    logger.info('[Background Sync] 開始同步');

    try {
      const pendingTasks = this.getPendingTasks();
      this.status.totalTasks = pendingTasks.length;
      this.status.pendingTasks = pendingTasks.length;

      if (pendingTasks.length === 0) {
        logger.info('[Background Sync] 沒有待同步的任務');
        return;
      }

      // 並行處理任務
      const chunks = this.chunkArray(
        pendingTasks,
        this.config.maxConcurrentTasks
      );

      for (const chunk of chunks) {
        await Promise.allSettled(chunk.map((task) => this.processTask(task)));
      }

      const duration = Date.now() - startTime;
      this.updateStats(true, duration, pendingTasks.length);

      logger.info('[Background Sync] 同步完成', {
        duration,
        totalTasks: this.status.totalTasks,
        completedTasks: this.status.completedTasks,
        failedTasks: this.status.failedTasks,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateStats(false, duration, this.status.totalTasks);
      this.status.errors.push(
        error instanceof Error ? error.message : '同步失敗'
      );

      logger.error('[Background Sync] 同步失敗:', error);
    } finally {
      this.isProcessing = false;
      this.status.isRunning = false;
      this.status.nextSyncTime = Date.now() + this.config.syncInterval;
    }
  }

  // 處理單個任務
  private async processTask(task: SyncTask): Promise<void> {
    try {
      logger.info('[Background Sync] 處理任務:', task.id, task.type);

      const response = await this.executeTask(task);

      if (response.ok) {
        // 檢查是否需要衝突解決
        if (response.status === 409) {
          // Conflict
          const serverData = await response.json();
          const resolution = await this.resolveConflict(task, serverData);

          if (resolution.resolved) {
            // 使用解決後的數據重新提交
            const retryResponse = await this.executeTask({
              ...task,
              body: resolution.finalValue,
            });

            if (retryResponse.ok) {
              this.completeTask(task);
              logger.info(
                '[Background Sync] 衝突解決成功，任務完成:',
                task.id,
                resolution.strategy
              );
            } else {
              throw new Error(
                `衝突解決後重試失敗: HTTP ${retryResponse.status}`
              );
            }
          } else {
            throw new Error('衝突解決失敗');
          }
        } else {
          this.completeTask(task);
          logger.info('[Background Sync] 任務完成:', task.id);
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      this.handleTaskError(task, error);
    }
  }

  // 執行任務
  private async executeTask(task: SyncTask): Promise<Response> {
    const { url, method, headers, body } = task;

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    return fetch(url, requestOptions);
  }

  // 完成任務
  private completeTask(task: SyncTask): void {
    this.tasks.delete(task.id);
    this.status.completedTasks++;
    this.status.pendingTasks--;
    this.updateStatus();
    this.saveTasks();
  }

  // 處理任務錯誤
  private handleTaskError(task: SyncTask, error: any): void {
    task.retryCount++;
    task.lastAttempt = Date.now();
    task.error = error instanceof Error ? error.message : '未知錯誤';

    if (task.retryCount >= task.maxRetries) {
      this.tasks.delete(task.id);
      this.status.failedTasks++;
      this.status.pendingTasks--;
      logger.error(
        '[Background Sync] 任務失敗，已達最大重試次數:',
        task.id,
        task.error
      );
    } else {
      // 計算下次重試延遲
      const delay = Math.min(
        task.retryDelay *
          Math.pow(this.config.retryBackoffMultiplier, task.retryCount - 1),
        this.config.maxRetryDelay
      );
      task.retryDelay = delay;

      logger.warn(
        '[Background Sync] 任務重試:',
        task.id,
        `重試 ${task.retryCount}/${task.maxRetries}`
      );
    }

    this.updateStatus();
    this.saveTasks();
  }

  // 衝突解決
  private async resolveConflict(
    task: SyncTask,
    serverData: any
  ): Promise<ConflictResolution> {
    if (!this.config.enableConflictResolution) {
      return {
        resolved: true,
        finalValue: task.body,
        strategy: 'client-wins',
        confidence: 1.0,
      };
    }

    const strategy =
      task.conflictResolutionStrategy ||
      this.config.conflictResolution.defaultStrategy;
    const conflictInfo = this.detectConflict(task, serverData);

    if (!conflictInfo) {
      return {
        resolved: true,
        finalValue: serverData,
        strategy: 'server-wins',
        confidence: 1.0,
      };
    }

    logger.info('[Background Sync] 檢測到衝突:', task.id, conflictInfo);

    try {
      switch (strategy) {
        case 'server-wins':
          return this.resolveServerWins(conflictInfo);
        case 'client-wins':
          return this.resolveClientWins(conflictInfo);
        case 'merge':
          return this.resolveMerge(conflictInfo);
        case 'timestamp-based':
          return this.resolveTimestampBased(conflictInfo);
        case 'field-level':
          return this.resolveFieldLevel(conflictInfo);
        case 'version-based':
          return this.resolveVersionBased(conflictInfo);
        case 'user-choice':
          return this.resolveUserChoice(conflictInfo);
        case 'custom':
          return this.resolveCustom(conflictInfo, task);
        default:
          return this.resolveServerWins(conflictInfo);
      }
    } catch (error) {
      logger.error('[Background Sync] 衝突解決失敗:', task.id, error);
      return {
        resolved: false,
        finalValue: task.body,
        strategy: 'client-wins',
        confidence: 0.0,
        metadata: {
          error: error instanceof Error ? error.message : '未知錯誤',
        },
      };
    }
  }

  // 檢測衝突
  private detectConflict(task: SyncTask, serverData: any): ConflictInfo | null {
    if (!task.body || !serverData) {
      return null;
    }

    const clientData = task.body;
    const clientTimestamp = task.lastModified || task.createdAt;
    const serverTimestamp = Date.now(); // 假設服務器時間戳

    // 檢查是否有實際衝突
    if (JSON.stringify(clientData) === JSON.stringify(serverData)) {
      return null;
    }

    return {
      taskId: task.id,
      field: 'root',
      clientValue: clientData,
      serverValue: serverData,
      clientTimestamp,
      serverTimestamp,
      clientVersion: task.version,
      serverVersion: serverData.version,
      conflictType: 'update',
      severity: this.calculateConflictSeverity(clientData, serverData),
    };
  }

  // 計算衝突嚴重程度
  private calculateConflictSeverity(
    clientData: any,
    serverData: any
  ): 'low' | 'medium' | 'high' {
    if (typeof clientData !== 'object' || typeof serverData !== 'object') {
      return 'medium';
    }

    const clientKeys = Object.keys(clientData);
    const serverKeys = Object.keys(serverData);
    const commonKeys = clientKeys.filter((key) => serverKeys.includes(key));

    if (commonKeys.length === 0) {
      return 'low'; // 沒有共同字段，衝突較輕
    }

    const conflictingFields = commonKeys.filter(
      (key) =>
        JSON.stringify(clientData[key]) !== JSON.stringify(serverData[key])
    );

    const conflictRatio = conflictingFields.length / commonKeys.length;

    if (conflictRatio < 0.3) return 'low';
    if (conflictRatio < 0.7) return 'medium';
    return 'high';
  }

  // 服務器優先策略
  private resolveServerWins(conflictInfo: ConflictInfo): ConflictResolution {
    return {
      resolved: true,
      finalValue: conflictInfo.serverValue,
      strategy: 'server-wins',
      confidence: 0.8,
      metadata: { reason: '服務器數據優先' },
    };
  }

  // 客戶端優先策略
  private resolveClientWins(conflictInfo: ConflictInfo): ConflictResolution {
    return {
      resolved: true,
      finalValue: conflictInfo.clientValue,
      strategy: 'client-wins',
      confidence: 0.8,
      metadata: { reason: '客戶端數據優先' },
    };
  }

  // 智能合併策略
  private resolveMerge(conflictInfo: ConflictInfo): ConflictResolution {
    const merged = this.deepMerge(
      conflictInfo.clientValue,
      conflictInfo.serverValue
    );
    return {
      resolved: true,
      finalValue: merged,
      strategy: 'merge',
      confidence: 0.7,
      metadata: {
        mergedFields: this.getMergedFields(
          conflictInfo.clientValue,
          conflictInfo.serverValue
        ),
      },
    };
  }

  // 基於時間戳策略
  private resolveTimestampBased(
    conflictInfo: ConflictInfo
  ): ConflictResolution {
    const timeDiff = Math.abs(
      conflictInfo.serverTimestamp - conflictInfo.clientTimestamp
    );
    const threshold = this.config.conflictResolution.timestampThreshold;

    if (timeDiff <= threshold) {
      // 時間差異小，合併數據
      const merged = this.deepMerge(
        conflictInfo.clientValue,
        conflictInfo.serverValue
      );
      return {
        resolved: true,
        finalValue: merged,
        strategy: 'timestamp-based',
        confidence: 0.6,
        metadata: { timeDiff, threshold, action: 'merged' },
      };
    }
    // 時間差異大，選擇較新的數據
    const newerValue =
      conflictInfo.serverTimestamp > conflictInfo.clientTimestamp
        ? conflictInfo.serverValue
        : conflictInfo.clientValue;
    return {
      resolved: true,
      finalValue: newerValue,
      strategy: 'timestamp-based',
      confidence: 0.9,
      metadata: { timeDiff, threshold, action: 'newer_wins' },
    };
  }

  // 字段級別合併策略
  private resolveFieldLevel(conflictInfo: ConflictInfo): ConflictResolution {
    if (!this.config.conflictResolution.fieldLevelMerge) {
      return this.resolveServerWins(conflictInfo);
    }

    const merged = this.fieldLevelMerge(
      conflictInfo.clientValue,
      conflictInfo.serverValue
    );
    return {
      resolved: true,
      finalValue: merged,
      strategy: 'field-level',
      confidence: 0.8,
      metadata: {
        mergedFields: this.getMergedFields(
          conflictInfo.clientValue,
          conflictInfo.serverValue
        ),
      },
    };
  }

  // 基於版本號策略
  private resolveVersionBased(conflictInfo: ConflictInfo): ConflictResolution {
    if (!conflictInfo.clientVersion || !conflictInfo.serverVersion) {
      return this.resolveTimestampBased(conflictInfo);
    }

    const clientVersion = this.parseVersion(conflictInfo.clientVersion);
    const serverVersion = this.parseVersion(conflictInfo.serverVersion);

    if (this.compareVersions(clientVersion, serverVersion) > 0) {
      return {
        resolved: true,
        finalValue: conflictInfo.clientValue,
        strategy: 'version-based',
        confidence: 0.9,
        metadata: {
          clientVersion: conflictInfo.clientVersion,
          serverVersion: conflictInfo.serverVersion,
        },
      };
    }
    return {
      resolved: true,
      finalValue: conflictInfo.serverValue,
      strategy: 'version-based',
      confidence: 0.9,
      metadata: {
        clientVersion: conflictInfo.clientVersion,
        serverVersion: conflictInfo.serverVersion,
      },
    };
  }

  // 用戶選擇策略
  private resolveUserChoice(conflictInfo: ConflictInfo): ConflictResolution {
    if (!this.config.conflictResolution.enableUserChoice) {
      return this.resolveServerWins(conflictInfo);
    }

    // 這裡應該觸發用戶界面讓用戶選擇
    // 暫時返回服務器優先
    return {
      resolved: true,
      finalValue: conflictInfo.serverValue,
      strategy: 'user-choice',
      confidence: 0.5,
      metadata: { reason: '用戶選擇功能待實現' },
    };
  }

  // 自定義策略
  private resolveCustom(
    conflictInfo: ConflictInfo,
    task: SyncTask
  ): ConflictResolution {
    const { customResolvers } = this.config.conflictResolution;
    const resolverKey = `${task.type}_${task.url}`;

    if (customResolvers[resolverKey]) {
      try {
        const result = customResolvers[resolverKey](
          conflictInfo.clientValue,
          conflictInfo.serverValue
        );
        return {
          resolved: true,
          finalValue: result,
          strategy: 'custom',
          confidence: 0.8,
          metadata: { customResolver: resolverKey },
        };
      } catch (error) {
        logger.error(
          '[Background Sync] 自定義衝突解決器失敗:',
          resolverKey,
          error
        );
      }
    }

    return this.resolveServerWins(conflictInfo);
  }

  // 深度合併
  private deepMerge(client: any, server: any): any {
    if (typeof client !== 'object' || client === null) return server;
    if (typeof server !== 'object' || server === null) return client;

    const result = { ...client };

    for (const key in server) {
      if (server.hasOwnProperty(key)) {
        if (
          key in result &&
          typeof result[key] === 'object' &&
          typeof server[key] === 'object'
        ) {
          result[key] = this.deepMerge(result[key], server[key]);
        } else {
          result[key] = server[key];
        }
      }
    }

    return result;
  }

  // 字段級別合併
  private fieldLevelMerge(client: any, server: any): any {
    if (typeof client !== 'object' || client === null) return server;
    if (typeof server !== 'object' || server === null) return client;

    const result = { ...client };

    for (const key in server) {
      if (server.hasOwnProperty(key)) {
        if (key in result) {
          // 檢查是否有字段級別的自定義解決器
          const fieldResolver =
            this.config.conflictResolution.customResolvers[key];
          if (fieldResolver) {
            result[key] = fieldResolver(result[key], server[key]);
          } else {
            result[key] = server[key]; // 服務器優先
          }
        } else {
          result[key] = server[key];
        }
      }
    }

    return result;
  }

  // 獲取合併的字段
  private getMergedFields(client: any, server: any): string[] {
    if (typeof client !== 'object' || typeof server !== 'object') return [];

    const clientKeys = Object.keys(client);
    const serverKeys = Object.keys(server);
    return clientKeys.filter((key) => serverKeys.includes(key));
  }

  // 解析版本號
  private parseVersion(version: string): number[] {
    return version.split('.').map((v) => parseInt(v, 10) || 0);
  }

  // 比較版本號
  private compareVersions(v1: number[], v2: number[]): number {
    const maxLength = Math.max(v1.length, v2.length);

    for (let i = 0; i < maxLength; i++) {
      const num1 = v1[i] || 0;
      const num2 = v2[i] || 0;

      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }

    return 0;
  }

  // 更新狀態
  private updateStatus(): void {
    const allTasks = Array.from(this.tasks.values());
    this.status.totalTasks = allTasks.length;
    this.status.pendingTasks = allTasks.filter(
      (t) => t.retryCount < t.maxRetries
    ).length;
  }

  // 更新統計
  private updateStats(
    success: boolean,
    duration: number,
    taskCount: number
  ): void {
    this.stats.totalSyncs++;

    if (success) {
      this.stats.successfulSyncs++;
    } else {
      this.stats.failedSyncs++;
    }

    this.stats.lastSyncDuration = duration;

    // 更新平均同步時間
    const totalTime =
      this.stats.averageSyncTime * (this.stats.totalSyncs - 1) + duration;
    this.stats.averageSyncTime = totalTime / this.stats.totalSyncs;

    // 添加同步歷史
    this.stats.syncHistory.push({
      timestamp: Date.now(),
      duration,
      success,
      taskCount,
    });

    // 保留最近100條記錄
    if (this.stats.syncHistory.length > 100) {
      this.stats.syncHistory = this.stats.syncHistory.slice(-100);
    }
  }

  // 啟動自動同步
  private startAutoSync(): void {
    if (!this.config.enableAutoSync) return;

    this.syncInterval = setInterval(() => {
      this.startSync();
    }, this.config.syncInterval);

    logger.info(
      '[Background Sync] 自動同步已啟動，間隔:',
      this.config.syncInterval
    );
  }

  // 停止自動同步
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
      logger.info('[Background Sync] 自動同步已停止');
    }
  }

  // 獲取狀態
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  // 獲取統計
  getStats(): SyncStats {
    return { ...this.stats };
  }

  // 獲取配置
  getConfig(): SyncConfig {
    return { ...this.config };
  }

  // 更新配置
  updateConfig(newConfig: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // 如果更改了自動同步設置，重新啟動
    if (newConfig.enableAutoSync !== undefined) {
      this.stopAutoSync();
      if (this.config.enableAutoSync) {
        this.startAutoSync();
      }
    }

    logger.info('[Background Sync] 配置已更新:', newConfig);
  }

  // 生成任務ID
  private generateTaskId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 數組分塊
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // 保存任務到本地存儲
  private saveTasks(): void {
    try {
      const tasksArray = Array.from(this.tasks.values());
      localStorage.setItem('background_sync_tasks', JSON.stringify(tasksArray));
    } catch (error) {
      logger.error('[Background Sync] 保存任務失敗:', error);
    }
  }

  // 從本地存儲加載任務
  private loadTasks(): void {
    try {
      const saved = localStorage.getItem('background_sync_tasks');
      if (saved) {
        const tasksArray = JSON.parse(saved) as SyncTask[];
        this.tasks.clear();

        for (const task of tasksArray) {
          this.tasks.set(task.id, task);
        }

        this.updateStatus();
        logger.info('[Background Sync] 已加載任務:', tasksArray.length);
      }
    } catch (error) {
      logger.error('[Background Sync] 加載任務失敗:', error);
    }
  }

  // 清理過期任務
  cleanupExpiredTasks(maxAge: number = 7 * 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [id, task] of this.tasks.entries()) {
      if (now - task.createdAt > maxAge) {
        this.tasks.delete(id);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.updateStatus();
      this.saveTasks();
      logger.info('[Background Sync] 清理過期任務:', cleanedCount);
    }

    return cleanedCount;
  }

  // 獲取任務統計
  getTaskStats(): {
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    byStatus: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    const byStatus: Record<string, number> = {
      pending: 0,
      completed: 0,
      failed: 0,
    };

    for (const task of this.tasks.values()) {
      // 按類型統計
      byType[task.type] = (byType[task.type] || 0) + 1;

      // 按優先級統計
      byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;

      // 按狀態統計
      if (task.retryCount >= task.maxRetries) {
        byStatus.failed++;
      } else {
        byStatus.pending++;
      }
    }

    byStatus.completed = this.status.completedTasks;

    return { byType, byPriority, byStatus };
  }

  // 設置衝突解決策略
  setConflictResolutionStrategy(
    taskId: string,
    strategy: ConflictResolutionStrategy
  ): boolean {
    const task = this.tasks.get(taskId);
    if (task) {
      task.conflictResolutionStrategy = strategy;
      this.saveTasks();
      logger.info('[Background Sync] 設置衝突解決策略:', taskId, strategy);
      return true;
    }
    return false;
  }

  // 添加自定義衝突解決器
  addCustomResolver(
    key: string,
    resolver: (client: any, server: any) => any
  ): void {
    this.config.conflictResolution.customResolvers[key] = resolver;
    logger.info('[Background Sync] 添加自定義衝突解決器:', key);
  }

  // 移除自定義衝突解決器
  removeCustomResolver(key: string): boolean {
    const removed = delete this.config.conflictResolution.customResolvers[key];
    if (removed) {
      logger.info('[Background Sync] 移除自定義衝突解決器:', key);
    }
    return removed;
  }

  // 獲取衝突解決配置
  getConflictResolutionConfig(): ConflictResolutionConfig {
    return { ...this.config.conflictResolution };
  }

  // 更新衝突解決配置
  updateConflictResolutionConfig(
    config: Partial<ConflictResolutionConfig>
  ): void {
    this.config.conflictResolution = {
      ...this.config.conflictResolution,
      ...config,
    };
    logger.info('[Background Sync] 更新衝突解決配置:', config);
  }

  // 測試衝突解決策略
  async testConflictResolution(
    clientData: any,
    serverData: any,
    strategy: ConflictResolutionStrategy
  ): Promise<ConflictResolution> {
    const mockTask: SyncTask = {
      id: 'test-task',
      type: 'api',
      url: '/test',
      method: 'POST',
      headers: {},
      body: clientData,
      priority: 'medium',
      retryCount: 0,
      maxRetries: 3,
      retryDelay: 1000,
      createdAt: Date.now(),
      conflictResolutionStrategy: strategy,
    };

    return await this.resolveConflict(mockTask, serverData);
  }
}

// 創建單例實例
export const backgroundSyncManager = new BackgroundSyncManager();

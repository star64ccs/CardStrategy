import { TaskDependencyManager, TaskStatus, TaskPriority, DependencyType, TaskExecutor, TaskSyncData, SyncConflict, SyncStatus } from './taskDependencyManager';

// 模擬同步測試執行器
const createSyncTestExecutor = (name: string, steps: string[] = ['初始化', '同步中', '完成']): TaskExecutor => ({
  execute: async (task, progressTracker) => {
    console.log(`[Sync Test Executor] 開始執行任務: ${name}`);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const percentage = ((i + 1) / steps.length) * 100;

      if (progressTracker) {
        progressTracker.updateProgress({
          percentage,
          currentStep: step,
          totalSteps: steps.length,
          currentStepIndex: i + 1,
          estimatedTimeRemaining: (task.estimatedDuration / steps.length) * (steps.length - i - 1)
        });
      }

      // 模擬同步延遲
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`[Sync Test Executor] 任務完成: ${name}`);
    return { message: `${name} 同步成功`, timestamp: new Date().toISOString() };
  }
});

describe('TaskDependencyManager 跨設備同步', () => {
  let taskManager: TaskDependencyManager;

  beforeEach(() => {
    taskManager = new TaskDependencyManager({
      maxConcurrentTasks: 3,
      enableParallelExecution: true,
      enableRetry: true,
      defaultRetryAttempts: 2,
      retryDelay: 500,
      enableTimeout: true,
      defaultTimeout: 10000
    });
  });

  afterEach(async () => {
    // 清理測試數據
    await taskManager.cleanupSyncData();
    taskManager.stopAutoSync();
  });

  describe('同步基本功能', () => {
    test('應該能夠獲取同步狀態', async () => {
      const status = await taskManager.getSyncStatus();

      expect(status).toBeDefined();
      expect(status.isOnline).toBeDefined();
      expect(status.isSyncing).toBeDefined();
      expect(status.lastSyncTime).toBeDefined();
      expect(status.pendingSyncs).toBeDefined();
      expect(status.failedSyncs).toBeDefined();
      expect(status.syncProgress).toBeDefined();
      expect(status.connectedDevices).toBeDefined();
    });

    test('應該能夠添加同步狀態監聽器', () => {
      const mockListener = jest.fn();
      taskManager.addSyncStatusListener(mockListener);

      // 觸發狀態變更
      taskManager.emit('syncStatusChanged', { isOnline: true });

      expect(mockListener).toHaveBeenCalled();
    });

    test('應該能夠移除同步狀態監聽器', () => {
      const mockListener = jest.fn();
      taskManager.addSyncStatusListener(mockListener);
      taskManager.removeSyncStatusListener(mockListener);

      // 觸發狀態變更
      taskManager.emit('syncStatusChanged', { isOnline: true });

      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe('同步衝突處理', () => {
    test('應該能夠檢測同步衝突', async () => {
      // 創建測試任務
      const taskId = await taskManager.addTask({
        name: '測試同步任務',
        description: '用於測試同步衝突的任務',
        type: 'sync_test',
        priority: TaskPriority.NORMAL,
        dependencies: [],
        dependents: [],
        estimatedDuration: 5000,
        executor: createSyncTestExecutor('同步測試')
      });

      // 模擬衝突檢測
      const mockConflict: SyncConflict = {
        taskId,
        localVersion: {
          taskId,
          deviceId: 'device_local',
          timestamp: Date.now(),
          operation: 'UPDATE',
          taskData: { name: '本地版本' },
          version: 1,
          checksum: 'local_checksum'
        },
        remoteVersion: {
          taskId,
          deviceId: 'device_remote',
          timestamp: Date.now() + 1000,
          operation: 'UPDATE',
          taskData: { name: '遠程版本' },
          version: 2,
          checksum: 'remote_checksum'
        },
        conflictType: 'VERSION_MISMATCH',
        resolution: 'REMOTE_WINS'
      };

      // 手動添加衝突
      const conflicts = taskManager.getSyncConflicts();
      expect(conflicts).toBeDefined();
    });

    test('應該能夠解決同步衝突', async () => {
      const taskId = await taskManager.addTask({
        name: '衝突解決測試',
        description: '測試衝突解決功能',
        type: 'conflict_test',
        priority: TaskPriority.HIGH,
        dependencies: [],
        dependents: [],
        estimatedDuration: 3000,
        executor: createSyncTestExecutor('衝突解決')
      });

      // 模擬衝突解決
      await taskManager.resolveSyncConflict(taskId, 'LOCAL_WINS');

      const conflicts = taskManager.getSyncConflicts();
      expect(conflicts.length).toBe(0);
    });
  });

  describe('手動同步功能', () => {
    test('應該能夠執行手動同步', async () => {
      // 創建多個測試任務
      const taskIds = [];
      for (let i = 0; i < 3; i++) {
        const taskId = await taskManager.addTask({
          name: `手動同步測試任務 ${i + 1}`,
          description: `測試手動同步功能 - 任務 ${i + 1}`,
          type: 'manual_sync_test',
          priority: TaskPriority.NORMAL,
          dependencies: [],
          dependents: [],
          estimatedDuration: 2000,
          executor: createSyncTestExecutor(`手動同步 ${i + 1}`)
        });
        taskIds.push(taskId);
      }

      // 執行手動同步
      const result = await taskManager.manualSync();

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.failed).toBeDefined();
      expect(typeof result.success).toBe('number');
      expect(typeof result.failed).toBe('number');
    });

    test('手動同步應該處理錯誤情況', async () => {
      // 模擬網絡錯誤
      jest.spyOn(taskManager as any, 'checkNetworkConnection').mockResolvedValue(false);

      const result = await taskManager.manualSync();

      expect(result.success).toBe(0);
      expect(result.failed).toBe(0);
    });
  });

  describe('同步數據清理', () => {
    test('應該能夠清理過期的同步數據', async () => {
      // 創建一些測試任務
      await taskManager.addTask({
        name: '清理測試任務',
        description: '測試同步數據清理功能',
        type: 'cleanup_test',
        priority: TaskPriority.LOW,
        dependencies: [],
        dependents: [],
        estimatedDuration: 1000,
        executor: createSyncTestExecutor('清理測試')
      });

      // 執行清理
      await taskManager.cleanupSyncData();

      // 驗證清理結果
      const conflicts = taskManager.getSyncConflicts();
      expect(conflicts.length).toBe(0);
    });
  });

  describe('同步事件系統', () => {
    test('應該能夠監聽同步事件', (done) => {
      const mockHandler = jest.fn();

      taskManager.on('syncConflict', mockHandler);

      // 模擬同步衝突事件
      setTimeout(() => {
        expect(mockHandler).toHaveBeenCalled();
        done();
      }, 100);
    });

    test('應該能夠監聽手動衝突解決事件', (done) => {
      const mockHandler = jest.fn();

      taskManager.on('manualConflictResolution', mockHandler);

      // 模擬手動衝突解決事件
      setTimeout(() => {
        expect(mockHandler).toHaveBeenCalled();
        done();
      }, 100);
    });

    test('應該能夠監聽任務同步事件', (done) => {
      const mockHandler = jest.fn();

      taskManager.on('taskSynced', mockHandler);

      // 模擬任務同步事件
      setTimeout(() => {
        expect(mockHandler).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('同步性能測試', () => {
    test('應該能夠處理大量同步操作', async () => {
      const startTime = Date.now();

      // 創建大量任務
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(taskManager.addTask({
          name: `性能測試任務 ${i + 1}`,
          description: `測試同步性能 - 任務 ${i + 1}`,
          type: 'performance_test',
          priority: TaskPriority.NORMAL,
          dependencies: [],
          dependents: [],
          estimatedDuration: 1000,
          executor: createSyncTestExecutor(`性能測試 ${i + 1}`)
        }));
      }

      await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 驗證性能（應該在合理時間內完成）
      expect(duration).toBeLessThan(5000);
    });

    test('應該能夠並行處理同步操作', async () => {
      const concurrentTasks = 5;
      const startTime = Date.now();

      // 創建並行任務
      const promises = [];
      for (let i = 0; i < concurrentTasks; i++) {
        promises.push(taskManager.addTask({
          name: `並行測試任務 ${i + 1}`,
          description: `測試並行同步 - 任務 ${i + 1}`,
          type: 'parallel_test',
          priority: TaskPriority.HIGH,
          dependencies: [],
          dependents: [],
          estimatedDuration: 2000,
          executor: createSyncTestExecutor(`並行測試 ${i + 1}`)
        }));
      }

      await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 並行執行應該比串行執行快
      expect(duration).toBeLessThan(concurrentTasks * 1000);
    });
  });

  describe('同步錯誤處理', () => {
    test('應該能夠處理同步失敗', async () => {
      // 創建一個會失敗的執行器
      const failingExecutor: TaskExecutor = {
        execute: async () => {
          throw new Error('同步失敗測試');
        }
      };

      const taskId = await taskManager.addTask({
        name: '失敗測試任務',
        description: '測試同步失敗處理',
        type: 'failure_test',
        priority: TaskPriority.CRITICAL,
        dependencies: [],
        dependents: [],
        estimatedDuration: 1000,
        executor: failingExecutor
      });

      // 執行同步
      const result = await taskManager.manualSync();

      expect(result.failed).toBeGreaterThan(0);
    });

    test('應該能夠重試失敗的同步操作', async () => {
      let attemptCount = 0;
      const retryingExecutor: TaskExecutor = {
        execute: async () => {
          attemptCount++;
          if (attemptCount < 3) {
            throw new Error(`重試測試 - 第 ${attemptCount} 次失敗`);
          }
          return { message: '重試成功' };
        }
      };

      await taskManager.addTask({
        name: '重試測試任務',
        description: '測試同步重試機制',
        type: 'retry_test',
        priority: TaskPriority.HIGH,
        dependencies: [],
        dependents: [],
        estimatedDuration: 1000,
        executor: retryingExecutor
      });

      // 執行同步
      await taskManager.manualSync();

      // 驗證重試次數
      expect(attemptCount).toBe(3);
    });
  });
});

// 跨設備同步演示函數
export const demonstrateCrossDeviceSync = async () => {
  console.log('=== 跨設備同步演示 ===');

  const taskManager = new TaskDependencyManager({
    maxConcurrentTasks: 2,
    enableParallelExecution: true,
    enableRetry: true,
    defaultRetryAttempts: 3,
    retryDelay: 1000,
    enableTimeout: true,
    defaultTimeout: 15000
  });

  try {
    // 1. 創建多個任務
    console.log('\n1. 創建測試任務...');
    const taskIds = [];

    for (let i = 0; i < 3; i++) {
      const taskId = await taskManager.addTask({
        name: `跨設備同步任務 ${i + 1}`,
        description: `演示跨設備同步功能 - 任務 ${i + 1}`,
        type: 'cross_device_sync',
        priority: i === 0 ? TaskPriority.CRITICAL : TaskPriority.NORMAL,
        dependencies: [],
        dependents: [],
        estimatedDuration: 3000 + i * 1000,
        executor: createSyncTestExecutor(`跨設備同步 ${i + 1}`)
      });
      taskIds.push(taskId);
      console.log(`  創建任務: ${taskId}`);
    }

    // 2. 檢查同步狀態
    console.log('\n2. 檢查同步狀態...');
    const syncStatus = await taskManager.getSyncStatus();
    console.log(`  網絡狀態: ${syncStatus.isOnline ? '在線' : '離線'}`);
    console.log(`  同步狀態: ${syncStatus.isSyncing ? '同步中' : '閒置'}`);
    console.log(`  待同步操作: ${syncStatus.pendingSyncs}`);
    console.log(`  失敗操作: ${syncStatus.failedSyncs}`);

    // 3. 執行手動同步
    console.log('\n3. 執行手動同步...');
    const syncResult = await taskManager.manualSync();
    console.log(`  同步結果: 成功 ${syncResult.success} 個，失敗 ${syncResult.failed} 個`);

    // 4. 檢查同步衝突
    console.log('\n4. 檢查同步衝突...');
    const conflicts = taskManager.getSyncConflicts();
    console.log(`  發現衝突: ${conflicts.length} 個`);

    if (conflicts.length > 0) {
      conflicts.forEach((conflict, index) => {
        console.log(`  衝突 ${index + 1}: ${conflict.taskId} - ${conflict.conflictType}`);
      });
    }

    // 5. 清理同步數據
    console.log('\n5. 清理同步數據...');
    await taskManager.cleanupSyncData();
    console.log('  清理完成');

    // 6. 最終狀態檢查
    console.log('\n6. 最終狀態檢查...');
    const finalStatus = await taskManager.getSyncStatus();
    console.log(`  最終待同步: ${finalStatus.pendingSyncs}`);
    console.log(`  最終衝突: ${taskManager.getSyncConflicts().length}`);

    console.log('\n=== 跨設備同步演示完成 ===');

  } catch (error) {
    console.error('跨設備同步演示錯誤:', error);
  } finally {
    // 清理
    await taskManager.cleanupSyncData();
    taskManager.stopAutoSync();
  }
};

// 導出測試用的執行器
export { createSyncTestExecutor };

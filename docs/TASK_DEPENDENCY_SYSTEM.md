# 任務依賴管理系統文檔

## 概述

任務依賴管理系統是一個強大的任務調度和依賴關係管理工具，支持複雜的任務工作流程、依賴關係管理、並行執行和實時監控。系統提供了完整的任務生命週期管理，包括創建、調度、執行、監控和清理。

## 核心功能

### 1. 任務管理
- **任務創建**: 支持創建具有不同優先級、類型和執行器的任務
- **任務狀態管理**: 完整的任務狀態生命週期（待處理、準備就緒、執行中、已完成、失敗、取消、阻塞）
- **任務優先級**: 支持低、正常、高、緊急四個優先級
- **任務執行器**: 可自定義的任務執行邏輯

### 2. 依賴關係管理
- **多種依賴類型**:
  - `REQUIRES`: 必須依賴 - 依賴任務必須成功完成
  - `OPTIONAL`: 可選依賴 - 依賴任務完成或失敗都可以
  - `BLOCKS`: 阻塞依賴 - 依賴任務不能正在執行
  - `TRIGGERS`: 觸發依賴 - 依賴任務完成時觸發
- **循環依賴檢測**: 自動檢測和防止循環依賴
- **自定義依賴條件**: 支持複雜的依賴條件邏輯

### 3. 執行調度
- **並行執行**: 支持多個任務同時執行
- **優先級調度**: 基於優先級的任務排序
- **死鎖檢測**: 自動檢測和處理死鎖情況
- **超時控制**: 任務執行超時管理
- **重試機制**: 失敗任務自動重試

### 4. 監控和統計
- **實時統計**: 任務執行統計信息
- **進度追蹤**: 實時進度更新、步驟追蹤、進度歷史
- **依賴圖可視化**: 任務依賴關係圖形化展示
- **進度顯示**: 同步進度條、整體進度統計
- **跨設備同步**: 多設備數據同步、衝突解決、同步狀態監控
- **同步加密**: 數據加密保護、密鑰管理、加密統計監控
- **事件系統**: 完整的事件監聽和通知機制
- **性能監控**: 執行時間和成功率統計

## 架構設計

### 核心組件

#### TaskDependencyManager
主要的任務管理器類，負責：
- 任務的增刪改查
- 依賴關係管理
- 執行調度
- 狀態管理
- 事件分發

#### Task
任務實體，包含：
- 基本信息（ID、名稱、描述、類型）
- 狀態信息（狀態、創建時間、開始時間、完成時間）
- 執行信息（執行器、預估時間、實際時間）
- 依賴信息（依賴列表、被依賴列表）

#### TaskExecutor
任務執行器接口，定義：
- `execute(task, progressTracker)`: 執行任務的具體邏輯，支持進度追蹤
- `validate(task)`: 驗證任務參數（可選）
- `cleanup(task)`: 清理任務資源（可選）

#### ProgressTracker
進度追蹤器接口，提供：
- `updateProgress(update)`: 更新任務進度
- `complete()`: 標記任務完成
- `fail(error)`: 標記任務失敗

### 數據結構

```typescript
interface Task {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: TaskStatus;
  priority: TaskPriority;
  dependencies: TaskDependency[];
  dependents: string[];
  estimatedDuration: number;
  actualDuration?: number;
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
}

interface TaskDependency {
  taskId: string;
  type: DependencyType;
  condition?: (task: Task) => boolean;
  timeout?: number;
}
```

## 使用指南

### 基本使用

#### 1. 創建任務管理器

```typescript
import { TaskDependencyManager, TaskPriority, DependencyType } from '@/utils/taskDependencyManager';

const taskManager = new TaskDependencyManager({
  maxConcurrentTasks: 5,
  enableParallelExecution: true,
  enableRetry: true,
  defaultRetryAttempts: 3,
  enableTimeout: true,
  defaultTimeout: 30000,
  enableDeadlockDetection: true,
  enableCircularDependencyCheck: true
});
```

#### 2. 創建任務

```typescript
// 定義任務執行器
const dataCollectionExecutor: TaskExecutor = {
  execute: async (task) => {
    // 執行數據收集邏輯
    await collectMarketData();
    return { collectedData: marketData };
  }
};

// 創建任務
const taskId = taskManager.addTask({
  name: '數據收集',
  description: '收集市場數據',
  type: 'data_collection',
  priority: TaskPriority.HIGH,
  estimatedDuration: 5000,
  executor: dataCollectionExecutor,
  dependencies: []
});
```

#### 3. 建立依賴關係

```typescript
// 添加依賴關係
taskManager.addDependency(analysisTaskId, {
  taskId: dataCollectionTaskId,
  type: DependencyType.REQUIRES
});
```

#### 4. 開始執行

```typescript
// 開始執行所有任務
await taskManager.startExecution();
```

### 高級功能

#### 1. 自定義依賴條件

```typescript
taskManager.addDependency(taskId, {
  taskId: dependentTaskId,
  type: DependencyType.REQUIRES,
  condition: (task) => {
    // 自定義條件：只有當任務結果包含特定數據時才滿足依賴
    return task.status === TaskStatus.COMPLETED && 
           task.metadata?.hasRequiredData === true;
  }
});
```

#### 2. 事件監聽

```typescript
// 監聽任務事件
taskManager.on('taskStarted', (data) => {
  console.log(`任務開始: ${data.taskId}`);
});

taskManager.on('taskCompleted', (data) => {
  console.log(`任務完成: ${data.taskId}`, data.result);
});

taskManager.on('taskFailed', (data) => {
  console.log(`任務失敗: ${data.taskId}`, data.error);
});
```

#### 3. 獲取統計信息

```typescript
const stats = taskManager.getStatistics();
console.log('任務統計:', {
  總任務數: stats.totalTasks,
  執行中: stats.runningTasks,
  已完成: stats.completedTasks,
  成功率: `${stats.successRate.toFixed(1)}%`
});
```

#### 4. 依賴圖可視化

```typescript
const graph = taskManager.getDependencyGraph();
console.log('依賴圖:', {
  節點: graph.nodes,
  邊: graph.edges
});
```

#### 5. 進度追蹤

```typescript
// 定義支持進度追蹤的任務執行器
const dataProcessingExecutor: TaskExecutor = {
  execute: async (task, progressTracker) => {
    const steps = ['初始化', '數據載入', '處理計算', '結果驗證', '保存完成'];
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const percentage = ((i + 1) / steps.length) * 100;
      
      // 更新進度
      if (progressTracker) {
        progressTracker.updateProgress({
          percentage,
          currentStep: step,
          totalSteps: steps.length,
          currentStepIndex: i + 1,
          estimatedTimeRemaining: (task.estimatedDuration / steps.length) * (steps.length - i - 1)
        });
      }
      
      // 執行步驟邏輯
      await processStep(step);
    }
    
    return { processedData: result };
  }
};

// 監聽進度更新事件
taskManager.on('taskProgressUpdate', (data) => {
  console.log(`任務 ${data.taskId} 進度: ${data.progress.percentage}% - ${data.progress.currentStep}`);
});

taskManager.on('progressBroadcast', (data) => {
  console.log(`整體進度: ${data.summary.overallProgress}%`);
});

// 獲取進度信息
const progress = taskManager.getTaskProgress(taskId);
const history = taskManager.getTaskProgressHistory(taskId);
const summary = taskManager.getProgressSummary();
```

#### 6. 跨設備同步
```typescript
// 監聽同步狀態變更
taskManager.addSyncStatusListener((status) => {
  console.log('同步狀態:', status);
});

// 監聽同步衝突
taskManager.on('syncConflict', (conflict) => {
  console.log('檢測到同步衝突:', conflict);
});

// 監聽手動衝突解決
taskManager.on('manualConflictResolution', (conflict) => {
  console.log('需要手動解決衝突:', conflict);
});

// 手動觸發同步
const result = await taskManager.manualSync();
console.log('同步結果:', result);

// 解決同步衝突
await taskManager.resolveSyncConflict(taskId, 'LOCAL_WINS');

// 獲取同步狀態
const syncStatus = await taskManager.getSyncStatus();
const conflicts = taskManager.getSyncConflicts();

// 清理同步數據
await taskManager.cleanupSyncData();
```

#### 7. 同步加密
```typescript
// 更新加密配置
taskManager.updateEncryptionConfig({
  enabled: true,
  encryptTaskData: true,
  encryptSyncData: true,
  encryptMetadata: true,
  algorithm: 'AES-256-GCM',
  keyRotationEnabled: false
});

// 獲取加密配置
const config = taskManager.getEncryptionConfig();

// 獲取加密統計
const stats = taskManager.getEncryptionStats();

// 測試加密功能
const testResult = await taskManager.testEncryption();
if (testResult.success) {
  console.log('加密功能正常');
}

// 重置加密統計
taskManager.resetEncryptionStats();

// 清理過期加密數據
const cleanedCount = await taskManager.cleanupEncryptedData();

// 監聽密鑰輪換事件
taskManager.on('keyRotated', (data) => {
  console.log('密鑰已輪換:', data);
});
```
```

## 實際應用場景

### 1. 數據處理管道

```typescript
// 創建數據處理管道
const pipeline = [
  { name: '數據收集', type: 'collection', duration: 3000 },
  { name: '數據清洗', type: 'cleaning', duration: 2000 },
  { name: '數據分析', type: 'analysis', duration: 5000 },
  { name: '生成報告', type: 'reporting', duration: 1500 },
  { name: '發送通知', type: 'notification', duration: 1000 }
];

// 創建任務和依賴關係
const taskIds = [];
for (const step of pipeline) {
  const taskId = taskManager.addTask({
    name: step.name,
    type: step.type,
    priority: TaskPriority.NORMAL,
    estimatedDuration: step.duration,
    executor: createExecutor(step.type)
  });
  taskIds.push(taskId);
}

// 建立順序依賴
for (let i = 1; i < taskIds.length; i++) {
  taskManager.addDependency(taskIds[i], {
    taskId: taskIds[i - 1],
    type: DependencyType.REQUIRES
  });
}
```

### 2. 並行任務處理

```typescript
// 創建多個並行任務
const parallelTasks = [
  { name: '處理圖片A', type: 'image_processing' },
  { name: '處理圖片B', type: 'image_processing' },
  { name: '處理圖片C', type: 'image_processing' }
];

const parallelTaskIds = parallelTasks.map(task => 
  taskManager.addTask({
    name: task.name,
    type: task.type,
    priority: TaskPriority.NORMAL,
    estimatedDuration: 4000,
    executor: imageProcessingExecutor
  })
);

// 創建依賴於所有並行任務的匯總任務
const summaryTaskId = taskManager.addTask({
  name: '生成匯總報告',
  type: 'summary',
  priority: TaskPriority.HIGH,
  estimatedDuration: 2000,
  executor: summaryExecutor
});

// 添加依賴關係
parallelTaskIds.forEach(taskId => {
  taskManager.addDependency(summaryTaskId, {
    taskId,
    type: DependencyType.REQUIRES
  });
});
```

### 3. 條件執行

```typescript
// 創建條件分支任務
const conditionTaskId = taskManager.addTask({
  name: '檢查數據質量',
  type: 'quality_check',
  priority: TaskPriority.HIGH,
  estimatedDuration: 1000,
  executor: qualityCheckExecutor
});

const goodDataTaskId = taskManager.addTask({
  name: '處理高質量數據',
  type: 'process_good_data',
  priority: TaskPriority.NORMAL,
  estimatedDuration: 3000,
  executor: goodDataProcessor
});

const badDataTaskId = taskManager.addTask({
  name: '處理低質量數據',
  type: 'process_bad_data',
  priority: TaskPriority.NORMAL,
  estimatedDuration: 5000,
  executor: badDataProcessor
});

// 添加條件依賴
taskManager.addDependency(goodDataTaskId, {
  taskId: conditionTaskId,
  type: DependencyType.REQUIRES,
  condition: (task) => task.metadata?.dataQuality === 'good'
});

taskManager.addDependency(badDataTaskId, {
  taskId: conditionTaskId,
  type: DependencyType.REQUIRES,
  condition: (task) => task.metadata?.dataQuality === 'bad'
});
```

## 配置選項

### TaskSchedulerConfig

```typescript
interface TaskSchedulerConfig {
  maxConcurrentTasks: number;           // 最大並行任務數
  enableParallelExecution: boolean;     // 啟用並行執行
  enableRetry: boolean;                 // 啟用重試機制
  defaultRetryAttempts: number;         // 默認重試次數
  retryDelay: number;                   // 重試延遲（毫秒）
  enableTimeout: boolean;               // 啟用超時控制
  defaultTimeout: number;               // 默認超時時間（毫秒）
  enablePriorityPreemption: boolean;    // 啟用優先級搶占
  enableDeadlockDetection: boolean;     // 啟用死鎖檢測
  enableCircularDependencyCheck: boolean; // 啟用循環依賴檢查
  logLevel: 'debug' | 'info' | 'warn' | 'error'; // 日誌級別
}
```

## 最佳實踐

### 1. 任務設計
- 將複雜任務分解為小的、可重用的任務
- 為每個任務設置合理的預估執行時間
- 使用描述性的任務名稱和類型

### 2. 依賴關係設計
- 避免過於複雜的依賴關係
- 使用適當的依賴類型
- 定期檢查和清理不必要的依賴

### 3. 錯誤處理
- 為任務執行器實現適當的錯誤處理
- 設置合理的重試次數和超時時間
- 監聽任務失敗事件並記錄詳細信息

### 4. 性能優化
- 根據系統資源調整並行任務數
- 使用任務標籤進行分類和過濾
- 定期清理已完成的任務

### 5. 監控和調試
- 使用事件監聽器監控任務執行
- 定期檢查統計信息
- 使用依賴圖可視化工具調試複雜工作流

## 故障排除

### 常見問題

#### 1. 任務卡在 PENDING 狀態
- 檢查依賴任務是否已完成
- 確認依賴條件是否滿足
- 檢查是否有循環依賴

#### 2. 任務執行超時
- 調整任務的超時時間
- 檢查任務執行器是否有阻塞操作
- 考慮將長時間任務分解為多個小任務

#### 3. 死鎖檢測
- 檢查依賴關係是否形成循環
- 使用依賴圖可視化工具分析
- 考慮重新設計任務依賴關係

#### 4. 內存使用過高
- 定期清理已完成的任務
- 減少並行任務數量
- 檢查任務執行器是否有內存洩漏

## 擴展功能

### 1. 持久化存儲
可以擴展系統以支持任務和依賴關係的持久化存儲：

```typescript
interface TaskStorage {
  saveTask(task: Task): Promise<void>;
  loadTasks(): Promise<Task[]>;
  saveDependencyGraph(graph: DependencyGraph): Promise<void>;
  loadDependencyGraph(): Promise<DependencyGraph>;
}
```

### 2. 分布式執行
可以擴展支持分布式任務執行：

```typescript
interface DistributedTaskManager {
  registerWorker(workerId: string, capabilities: string[]): Promise<void>;
  assignTaskToWorker(taskId: string, workerId: string): Promise<void>;
  getWorkerStatus(workerId: string): Promise<WorkerStatus>;
}
```

### 3. 工作流模板
可以創建預定義的工作流模板：

```typescript
interface WorkflowTemplate {
  name: string;
  description: string;
  tasks: TaskTemplate[];
  dependencies: DependencyTemplate[];
}

interface TaskTemplate {
  name: string;
  type: string;
  priority: TaskPriority;
  estimatedDuration: number;
  executorType: string;
}
```

## 總結

任務依賴管理系統提供了一個強大而靈活的框架來管理複雜的任務工作流程。通過合理的設計和使用，可以大大提高系統的可維護性、可擴展性和可靠性。系統的核心優勢包括：

- **靈活性**: 支持多種依賴類型和自定義條件
- **可靠性**: 內建錯誤處理、重試機制和死鎖檢測
- **可視化**: 提供依賴圖可視化和實時監控
- **可擴展性**: 模塊化設計支持功能擴展
- **易用性**: 簡潔的 API 和豐富的文檔

通過遵循最佳實踐和合理使用系統功能，可以構建出高效、可靠的任務處理系統。

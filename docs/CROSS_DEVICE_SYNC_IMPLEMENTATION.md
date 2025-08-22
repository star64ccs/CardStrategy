# 跨設備同步實現文檔

## 概述

本文檔詳細描述了任務依賴管理系統的跨設備同步功能實現。該功能允許任務數據在多個設備之間實時同步，支持離線操作、衝突檢測和解決。

## 核心功能

### 1. 設備識別和管理

- **設備ID生成**: 每個設備都有唯一的設備ID，用於識別同步來源
- **設備信息追蹤**: 記錄設備名稱、平台、應用版本等基本信息
- **設備狀態監控**: 實時監控設備的在線狀態和最後同步時間

### 2. 數據同步機制

#### 同步操作類型

- `CREATE`: 創建新任務
- `UPDATE`: 更新現有任務
- `DELETE`: 刪除任務
- `STATUS_CHANGE`: 任務狀態變更
- `PROGRESS_UPDATE`: 進度更新

#### 同步數據結構

```typescript
interface TaskSyncData {
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
```

### 3. 衝突檢測和解決

#### 衝突類型

- `VERSION_MISMATCH`: 版本不匹配
- `CONCURRENT_UPDATE`: 並發更新
- `DELETION_CONFLICT`: 刪除衝突

#### 解決策略

- `LOCAL_WINS`: 使用本地版本
- `REMOTE_WINS`: 使用遠程版本
- `MERGE`: 合併版本
- `MANUAL`: 手動解決

### 4. 離線支持

- **離線操作隊列**: 在離線時將操作加入隊列
- **自動重試機制**: 網絡恢復時自動重試失敗的操作
- **數據持久化**: 使用本地存儲保存同步數據

## 技術實現

### 1. 核心類和方法

#### TaskDependencyManager 擴展

```typescript
class TaskDependencyManager extends EventEmitter {
  // 同步相關屬性
  private deviceId: string;
  private syncInterval: NodeJS.Timeout | null;
  private pendingSyncs: TaskSyncData[];
  private syncConflicts: SyncConflict[];
  private connectedDevices: Map<string, DeviceInfo>;
  private isSyncing: boolean;

  // 同步方法
  async getSyncStatus(): Promise<SyncStatus>;
  async manualSync(): Promise<{ success: number; failed: number }>;
  async resolveSyncConflict(taskId: string, resolution: string): Promise<void>;
  async cleanupSyncData(): Promise<void>;

  // 事件監聽
  addSyncStatusListener(listener: (status: SyncStatus) => void): void;
  removeSyncStatusListener(listener: (status: SyncStatus) => void): void;
}
```

### 2. 同步流程

#### 自動同步流程

1. **初始化**: 生成設備ID，載入本地任務數據
2. **監聽變更**: 監聽任務創建、更新、刪除等事件
3. **隊列操作**: 將變更操作加入同步隊列
4. **定期檢查**: 每30秒檢查並執行同步
5. **衝突處理**: 檢測並處理同步衝突
6. **狀態更新**: 更新同步狀態並通知監聽器

#### 手動同步流程

1. **觸發同步**: 用戶手動觸發同步
2. **網絡檢查**: 檢查網絡連接狀態
3. **批量處理**: 批量處理待同步操作
4. **結果返回**: 返回同步成功和失敗數量

### 3. 數據存儲

#### 本地存儲結構

```
task_[taskId] -> Task 對象
sync_[taskId]_[timestamp] -> TaskSyncData 對象
device_id -> 設備ID
last_task_sync -> 最後同步時間
```

#### 數據清理機制

- 自動清理7天前的同步操作記錄
- 清理已解決的衝突記錄
- 定期清理過期數據

## UI 組件

### TaskSyncDisplay 組件

#### 功能特性

- **同步狀態顯示**: 實時顯示網絡狀態、同步狀態、待同步數量
- **設備列表**: 顯示已連接設備的詳細信息
- **衝突管理**: 顯示和解決同步衝突
- **操作控制**: 手動同步、刷新、清理數據

#### 主要方法

```typescript
interface TaskSyncDisplayProps {
  taskManager: TaskDependencyManager;
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}
```

#### 狀態監控

- 自動刷新同步狀態（默認5秒）
- 實時監聽同步事件
- 衝突自動檢測和提示

## 事件系統

### 同步相關事件

#### 事件類型

- `syncStatusChanged`: 同步狀態變更
- `syncConflict`: 檢測到同步衝突
- `manualConflictResolution`: 需要手動解決衝突
- `taskSynced`: 任務同步完成

#### 事件監聽示例

```typescript
// 監聽同步狀態
taskManager.addSyncStatusListener((status) => {
  console.log('同步狀態:', status);
});

// 監聽衝突
taskManager.on('syncConflict', (conflict) => {
  console.log('檢測到衝突:', conflict);
});

// 監聽手動解決
taskManager.on('manualConflictResolution', (conflict) => {
  showConflictDialog(conflict);
});
```

## 性能優化

### 1. 批量處理

- 每次同步最多處理10個操作
- 避免一次性處理過多數據

### 2. 並行執行

- 支持並行同步多個任務
- 提高同步效率

### 3. 智能重試

- 指數退避重試策略
- 避免無限重試

### 4. 數據壓縮

- 同步數據校驗和計算
- 減少傳輸數據量

## 安全考慮

### 1. 數據驗證

- 校驗和驗證數據完整性
- 版本號防止數據覆蓋

### 2. 衝突解決

- 安全的衝突檢測機制
- 用戶可控的解決策略

### 3. 錯誤處理

- 完善的錯誤處理機制
- 失敗操作的記錄和重試

## 測試覆蓋

### 1. 單元測試

- 同步基本功能測試
- 衝突處理測試
- 錯誤處理測試

### 2. 集成測試

- 跨設備同步測試
- 性能測試
- 並發測試

### 3. 演示功能

- 控制台演示函數
- 完整的同步流程演示

## 使用示例

### 基本使用

```typescript
// 創建任務管理器
const taskManager = new TaskDependencyManager();

// 監聽同步狀態
taskManager.addSyncStatusListener((status) => {
  console.log('同步狀態:', status);
});

// 手動同步
const result = await taskManager.manualSync();
console.log('同步結果:', result);
```

### 衝突解決

```typescript
// 監聽衝突
taskManager.on('syncConflict', async (conflict) => {
  // 自動解決衝突
  await taskManager.resolveSyncConflict(conflict.taskId, 'REMOTE_WINS');
});
```

### UI 集成

```typescript
// 在 React Native 中使用
<TaskSyncDisplay
  taskManager={taskManager}
  showDetails={true}
  autoRefresh={true}
  refreshInterval={5000}
/>
```

## 未來改進

### 1. 功能增強

- 支持更複雜的合併策略
- 增加同步優先級
- 支持部分同步

### 2. 性能優化

- 增量同步
- 數據壓縮
- 智能緩存

### 3. 用戶體驗

- 更直觀的衝突解決界面
- 同步進度動畫
- 離線提示

### 4. 安全性

- 端到端加密
- 身份驗證
- 訪問控制

## 總結

跨設備同步功能為任務依賴管理系統提供了強大的多設備支持，確保用戶可以在不同設備間無縫協作。通過完善的衝突解決機制、離線支持和實時同步，為用戶提供了可靠和高效的任務管理體驗。

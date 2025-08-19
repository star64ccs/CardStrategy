# 增量同步功能指南

## 概述

增量同步功能允許應用程序在離線狀態下繼續工作，並在網絡恢復時自動同步數據變更。這個系統確保數據的一致性和可靠性，同時提供良好的用戶體驗。

## 功能特性

### 核心功能
- **離線支持**: 在無網絡連接時繼續工作
- **自動同步**: 網絡恢復時自動同步待處理的變更
- **衝突解決**: 智能處理數據衝突
- **批量處理**: 支持批量數據同步
- **錯誤重試**: 自動重試失敗的同步操作
- **狀態監控**: 實時監控同步狀態

### 支持的數據類型
- 卡片 (Card)
- 收藏 (Collection)
- 用戶設置 (User)
- 註釋 (Annotation)

## 架構設計

### 前端組件

#### 1. IncrementalSyncManager (`src/utils/incrementalSyncManager.ts`)
核心同步管理器，負責：
- 管理同步隊列
- 處理網絡狀態變化
- 執行同步操作
- 錯誤處理和重試

#### 2. useIncrementalSync Hook (`src/hooks/useIncrementalSync.ts`)
React Hook，提供：
- 同步狀態管理
- 同步操作方法
- 網絡狀態監聽
- Redux 狀態更新

#### 3. SyncStatusIndicator (`src/components/common/SyncStatusIndicator.tsx`)
UI 組件，顯示：
- 同步狀態指示器
- 待同步項目數量
- 最後同步時間
- 錯誤信息

### 後端 API

#### 同步端點 (`backend/src/routes/sync.js`)
- `POST /api/sync/incremental`: 處理增量同步
- `GET /api/sync/status`: 獲取同步狀態

## 使用方法

### 基本使用

#### 1. 在組件中使用 Hook

```typescript
import { useIncrementalSync } from '@/hooks/useIncrementalSync';

const MyComponent = () => {
  const {
    syncStatus,
    pendingChangesCount,
    addChange,
    forceSync,
    isSyncing,
    hasError
  } = useIncrementalSync();

  const handleAddCard = () => {
    addChange({
      id: 'card_123',
      type: 'card',
      data: {
        name: '新卡片',
        description: '卡片描述',
        rarity: 'rare'
      }
    });
  };

  return (
    <View>
      <Text>同步狀態: {syncStatus}</Text>
      <Text>待同步項目: {pendingChangesCount}</Text>
      <Button onPress={handleAddCard} title="添加卡片" />
      <Button onPress={forceSync} title="強制同步" />
    </View>
  );
};
```

#### 2. 使用同步狀態指示器

```typescript
import { SyncStatusIndicator } from '@/components/common/SyncStatusIndicator';

const AppHeader = () => {
  return (
    <View>
      <SyncStatusIndicator showDetails={true} />
    </View>
  );
};
```

#### 3. 直接使用同步管理器

```typescript
import { incrementalSyncManager } from '@/utils/incrementalSyncManager';

// 添加單個變更
incrementalSyncManager.addChange({
  id: 'item_123',
  type: 'card',
  data: { name: '卡片名稱' }
});

// 批量添加變更
incrementalSyncManager.addBatchChanges([
  {
    id: 'item_1',
    type: 'card',
    data: { name: '卡片1' }
  },
  {
    id: 'item_2',
    type: 'collection',
    data: { name: '收藏1' }
  }
]);

// 強制同步
await incrementalSyncManager.forceSync();
```

### 高級用法

#### 1. 自定義同步處理

```typescript
import { incrementalSyncManager } from '@/utils/incrementalSyncManager';

// 監聽同步狀態變化
const syncState = incrementalSyncManager.getSyncState();
console.log('當前同步狀態:', syncState);

// 獲取待同步項目數量
const pendingCount = incrementalSyncManager.getPendingChangesCount();

// 清除所有待同步項目
incrementalSyncManager.clearPendingChanges();
```

#### 2. 錯誤處理

```typescript
const { error, clearError, hasError } = useIncrementalSync();

useEffect(() => {
  if (hasError) {
    Alert.alert('同步錯誤', error);
  }
}, [hasError, error]);

const handleRetry = () => {
  clearError();
  forceSync();
};
```

#### 3. 網絡狀態監聽

```typescript
const { isOnline, isOffline } = useIncrementalSync();

useEffect(() => {
  if (isOffline) {
    // 顯示離線提示
    showOfflineMessage();
  } else if (isOnline) {
    // 隱藏離線提示
    hideOfflineMessage();
  }
}, [isOnline, isOffline]);
```

## 配置選項

### 同步間隔
默認每 5 分鐘自動同步一次，可以通過修改 `IncrementalSyncManager` 中的 `startPeriodicSync` 方法來調整：

```typescript
// 修改為每 10 分鐘同步一次
this.syncInterval = setInterval(() => {
  if (navigator.onLine && this.syncState.pendingChanges.length > 0) {
    this.triggerSync();
  }
}, 10 * 60 * 1000); // 10 分鐘
```

### 重試策略
默認最多重試 3 次，使用指數退避策略：

```typescript
private maxRetryAttempts = 3; // 修改重試次數

// 重試延遲計算
const delay = Math.pow(2, this.retryAttempts) * 1000;
```

## 數據結構

### SyncItem
```typescript
interface SyncItem {
  id: string;                    // 項目唯一標識
  type: 'card' | 'collection' | 'user' | 'annotation'; // 數據類型
  data: any;                     // 數據內容
  timestamp: number;             // 時間戳
  version: number;               // 版本號
  isDeleted?: boolean;           // 是否為刪除操作
}
```

### SyncBatch
```typescript
interface SyncBatch {
  id: string;                    // 批次唯一標識
  items: SyncItem[];             // 同步項目列表
  timestamp: number;             // 批次時間戳
  version: number;               // 批次版本號
}
```

## 最佳實踐

### 1. 數據變更處理
- 在用戶進行數據變更時立即添加到同步隊列
- 使用有意義的 ID 來避免衝突
- 確保數據結構的一致性

### 2. 錯誤處理
- 始終檢查同步狀態
- 提供用戶友好的錯誤信息
- 實現適當的重試機制

### 3. 性能優化
- 避免過於頻繁的同步操作
- 使用批量操作來減少網絡請求
- 合理設置同步間隔

### 4. 用戶體驗
- 提供清晰的同步狀態指示
- 在離線時顯示適當的提示
- 允許用戶手動觸發同步

## 故障排除

### 常見問題

#### 1. 同步失敗
- 檢查網絡連接
- 查看錯誤日誌
- 確認服務器端點是否可用

#### 2. 數據衝突
- 檢查時間戳和版本號
- 實現適當的衝突解決策略
- 考慮用戶手動解決衝突

#### 3. 性能問題
- 減少同步頻率
- 優化數據結構
- 使用批量操作

### 調試技巧

#### 1. 啟用詳細日誌
```typescript
// 在開發環境中啟用詳細日誌
if (__DEV__) {
  console.log('同步狀態:', incrementalSyncManager.getSyncState());
}
```

#### 2. 監控同步狀態
```typescript
const { syncStatus, pendingChangesCount } = useIncrementalSync();

useEffect(() => {
  console.log('同步狀態變化:', { syncStatus, pendingChangesCount });
}, [syncStatus, pendingChangesCount]);
```

## 測試

### 單元測試
```typescript
import { incrementalSyncManager } from '@/utils/incrementalSyncManager';

describe('IncrementalSyncManager', () => {
  test('應該正確添加變更', () => {
    const item = {
      id: 'test_1',
      type: 'card' as const,
      data: { name: '測試卡片' }
    };
    
    incrementalSyncManager.addChange(item);
    expect(incrementalSyncManager.getPendingChangesCount()).toBe(1);
  });
});
```

### 集成測試
```typescript
describe('同步功能集成測試', () => {
  test('應該成功同步到服務器', async () => {
    // 模擬網絡請求
    // 測試同步流程
    // 驗證結果
  });
});
```

## 更新日誌

### v1.0.0
- 初始版本發布
- 支持基本的增量同步功能
- 實現離線支持和自動重試

### 計劃功能
- 支持更多數據類型
- 改進衝突解決策略
- 添加同步統計和分析
- 支持多設備同步

# 錯誤處理指南

## 概述
本文檔提供了 CardStrategy 專案的錯誤處理最佳實踐和指導原則。

## 錯誤處理原則

### 1. 分層錯誤處理
- **UI 層**: 使用 ErrorBoundary 捕獲 React 錯誤
- **服務層**: 使用裝飾器和錯誤處理器
- **API 層**: 使用統一的錯誤處理邏輯
- **數據層**: 使用事務和回滾機制

### 2. 錯誤分類
- **NetworkError**: 網絡連接問題
- **ValidationError**: 數據驗證錯誤
- **AuthenticationError**: 認證錯誤
- **AuthorizationError**: 授權錯誤
- **DatabaseError**: 數據庫錯誤
- **ExternalServiceError**: 外部服務錯誤
- **ConfigurationError**: 配置錯誤

### 3. 錯誤嚴重程度
- **LOW**: 信息性錯誤，不影響功能
- **MEDIUM**: 警告性錯誤，可能影響部分功能
- **HIGH**: 嚴重錯誤，影響主要功能
- **CRITICAL**: 致命錯誤，影響整個系統

## 使用方式

### 1. 使用裝飾器
```typescript
import { withErrorHandling, handleErrors } from '@/core/utils/errorHandler';

// 函數裝飾器
const safeFunction = withErrorHandling(async () => {
  // 你的代碼
}, 'context-name');

// 方法裝飾器
class MyService {
  @handleErrors
  async myMethod() {
    // 你的代碼
  }
}
```

### 2. 使用錯誤邊界
```typescript
import { ErrorBoundary } from '@/templates/error-handling/componentTemplate';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### 3. 使用 Hook
```typescript
import { useErrorHandler } from '@/templates/error-handling/componentTemplate';

function MyComponent() {
  const { handleAsyncError } = useErrorHandler();
  
  const handleClick = async () => {
    await handleAsyncError(async () => {
      // 你的異步操作
    }, 'button-click');
  };
}
```

## 最佳實踐

### 1. 錯誤日誌
- 記錄錯誤的完整上下文
- 包含錯誤堆疊信息
- 記錄用戶操作步驟

### 2. 用戶體驗
- 提供清晰的錯誤信息
- 提供恢復建議
- 避免技術術語

### 3. 錯誤恢復
- 實現重試機制
- 提供降級方案
- 保存用戶數據

### 4. 監控和警報
- 監控錯誤率
- 設置錯誤閾值
- 及時發送警報

## 常見錯誤處理模式

### 1. 重試模式
```typescript
const result = await handleWithRetry(
  () => apiCall(),
  'api-operation',
  3
);
```

### 2. 降級模式
```typescript
const result = await handleWithFallback(
  () => primaryService(),
  () => fallbackService(),
  'service-operation'
);
```

### 3. 超時模式
```typescript
const result = await handleWithTimeout(
  () => slowOperation(),
  'slow-operation',
  5000
);
```

## 測試錯誤處理

### 1. 單元測試
```typescript
it('應該處理網絡錯誤', async () => {
  const mockApi = jest.fn().mockRejectedValue(new Error('Network error'));
  
  await expect(
    handleAsyncError(mockApi, 'test')
  ).rejects.toThrow();
});
```

### 2. 集成測試
```typescript
it('應該在 API 失敗時使用降級服務', async () => {
  // 測試降級邏輯
});
```

## 錯誤處理檢查清單

- [ ] 所有異步操作都有錯誤處理
- [ ] 所有 API 調用都有重試機制
- [ ] 所有用戶輸入都有驗證
- [ ] 所有外部服務調用都有降級方案
- [ ] 所有錯誤都有適當的日誌記錄
- [ ] 所有錯誤都有用戶友好的信息
- [ ] 所有錯誤都有恢復建議
- [ ] 所有錯誤都有監控和警報

## 常見問題

### Q: 什麼時候使用 try-catch vs 裝飾器？
A: 對於簡單的錯誤處理使用 try-catch，對於複雜的錯誤處理邏輯使用裝飾器。

### Q: 如何處理第三方庫的錯誤？
A: 將第三方錯誤包裝為應用錯誤，提供統一的錯誤處理接口。

### Q: 如何測試錯誤處理邏輯？
A: 使用 mock 和 spy 來模擬錯誤情況，確保錯誤處理邏輯正確執行。

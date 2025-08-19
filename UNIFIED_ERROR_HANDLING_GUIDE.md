# 🚨 CardStrategy 統一錯誤處理機制指南

## 📋 概述

本指南提供 CardStrategy 專案中統一錯誤處理機制的完整解決方案，包括前端、後端和微前端架構的錯誤處理策略。

---

## 🎯 錯誤處理架構

### 1. 前端錯誤處理系統

#### 核心服務
- ✅ **ErrorHandlerService** (`src/services/errorHandlerService.ts`)
  - 統一錯誤捕獲和處理
  - 錯誤分類和嚴重程度評估
  - 錯誤報告和日誌記錄
  - 用戶通知和錯誤顯示

#### React Hooks
- ✅ **useErrorHandler** (`src/hooks/useErrorHandler.ts`)
  - 組件級錯誤處理
  - 安全執行函數包裝器
  - 錯誤邊界集成
  - API 和表單錯誤處理

#### 錯誤邊界組件
- ✅ **ErrorBoundary** (`src/components/common/ErrorBoundary.tsx`)
  - React 錯誤邊界實現
  - 錯誤恢復和重置
  - 錯誤報告功能
  - 高階組件包裝器

#### 錯誤顯示組件
- ✅ **ErrorDisplay** (`src/components/common/ErrorDisplay.tsx`)
  - 多種顯示模式 (inline, modal, toast)
  - 錯誤詳情展示
  - 用戶操作按鈕
  - 響應式設計

### 2. 後端錯誤處理系統

#### 錯誤處理中間件
- ✅ **ErrorHandler** (`backend/src/middleware/errorHandler.js`)
  - 統一錯誤處理中間件
  - 錯誤統計和分析
  - 自定義錯誤類
  - 請求超時和大小限制處理

#### 異步錯誤處理
- ✅ **asyncHandler** 包裝器
  - 自動捕獲異步錯誤
  - Promise 錯誤處理
  - 中間件集成

---

## 🔧 技術實現詳情

### 1. 前端錯誤處理

#### 錯誤信息結構
```typescript
interface ErrorInfo {
  id: string;                    // 唯一錯誤 ID
  message: string;               // 錯誤消息
  stack?: string;                // 錯誤堆疊
  type: 'error' | 'warning' | 'info';
  category: 'api' | 'ui' | 'validation' | 'network' | 'auth' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;             // 時間戳
  userId?: string;               // 用戶 ID
  sessionId?: string;            // 會話 ID
  context?: Record<string, any>; // 上下文信息
  userAgent?: string;            // 用戶代理
  url?: string;                  // 當前 URL
  componentName?: string;        // 組件名稱
  action?: string;               // 操作名稱
}
```

#### 錯誤處理流程
```typescript
// 1. 錯誤捕獲
errorHandlerService.handleError(error, {
  category: 'api',
  severity: 'medium',
  componentName: 'UserProfile',
  action: 'fetchUserData'
});

// 2. 錯誤分類
const errorType = getErrorType(error);
const severity = getErrorSeverity(error);
const category = getErrorCategory(error);

// 3. 錯誤記錄
logger.error('API 錯誤', {
  message: error.message,
  category,
  severity,
  context: error.context
});

// 4. 錯誤報告
await reportError(errorInfo);

// 5. 用戶通知
notifyUser(errorInfo);
```

### 2. 後端錯誤處理

#### 錯誤處理中間件
```javascript
// 統一錯誤處理
const errorHandlerMiddleware = (err, req, res, next) => {
  const errorInfo = parseError(err, req);
  recordError(errorInfo);
  logError(errorInfo);
  sendErrorResponse(errorInfo, res);
};

// 異步錯誤處理
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 自定義錯誤類
const createValidationError = (message, fields = {}) => {
  const error = new Error(message);
  error.status = 422;
  error.type = 'validation';
  error.fields = fields;
  return error;
};
```

#### 錯誤響應格式
```javascript
{
  success: false,
  error: {
    id: "error_1234567890_abc123",
    message: "驗證失敗",
    status: 422,
    type: "validation"
  }
}
```

---

## 📊 錯誤分類和嚴重程度

### 1. 錯誤分類

#### API 錯誤 (api)
- HTTP 狀態碼錯誤
- 請求/響應格式錯誤
- API 端點不存在
- 請求參數錯誤

#### 界面錯誤 (ui)
- 組件渲染錯誤
- 用戶交互錯誤
- 狀態管理錯誤
- 路由錯誤

#### 驗證錯誤 (validation)
- 表單驗證失敗
- 數據格式錯誤
- 業務規則違反
- 輸入驗證錯誤

#### 網絡錯誤 (network)
- 連接超時
- DNS 解析失敗
- 服務器不可用
- 網絡中斷

#### 認證錯誤 (auth)
- 登錄失敗
- 令牌過期
- 權限不足
- 會話無效

#### 系統錯誤 (system)
- 內存不足
- 數據庫錯誤
- 第三方服務錯誤
- 系統配置錯誤

### 2. 嚴重程度

#### 嚴重 (critical)
- 應用程序崩潰
- 數據丟失
- 安全漏洞
- 系統不可用

#### 高級 (high)
- 功能無法使用
- 性能嚴重下降
- 數據不一致
- 用戶體驗嚴重受損

#### 中級 (medium)
- 功能部分受影響
- 性能輕微下降
- 用戶體驗受影響
- 需要用戶干預

#### 低級 (low)
- 功能正常，但有警告
- 性能無影響
- 用戶體驗輕微影響
- 自動恢復

---

## 🎯 使用指南

### 1. 前端使用

#### 初始化錯誤處理服務
```typescript
import { errorHandlerService } from '@/services/errorHandlerService';

// 在應用程序啟動時初始化
errorHandlerService.initialize({
  enableReporting: true,
  enableLogging: true,
  enableUserNotification: true,
  maxErrorsPerMinute: 10,
  reportEndpoint: '/api/errors/report'
});
```

#### 在組件中使用錯誤處理 Hook
```typescript
import { useErrorHandler, useApiErrorHandler } from '@/hooks/useErrorHandler';

const UserProfile = () => {
  const { handleError, safeExecuteAsync } = useErrorHandler({
    componentName: 'UserProfile'
  });

  const { handleApiError } = useApiErrorHandler('UserProfile');

  const fetchUserData = async () => {
    try {
      const data = await api.getUserData();
      setUserData(data);
    } catch (error) {
      handleApiError(error, {
        endpoint: '/api/user',
        method: 'GET',
        action: 'fetchUserData'
      });
    }
  };

  const updateProfile = safeExecuteAsync(async () => {
    await api.updateProfile(formData);
  }, {
    action: 'updateProfile',
    category: 'api',
    severity: 'medium'
  });

  return (
    <ErrorBoundary componentName="UserProfile">
      {/* 組件內容 */}
    </ErrorBoundary>
  );
};
```

#### 使用錯誤邊界
```typescript
import { ErrorBoundary, withErrorBoundary } from '@/components/common/ErrorBoundary';

// 直接使用
<ErrorBoundary
  componentName="UserProfile"
  onError={(error, errorInfo) => {
    console.log('錯誤邊界捕獲到錯誤:', error);
  }}
>
  <UserProfile />
</ErrorBoundary>

// 使用高階組件
const SafeUserProfile = withErrorBoundary(UserProfile, {
  componentName: 'UserProfile'
});
```

#### 顯示錯誤信息
```typescript
import { ErrorDisplay } from '@/components/common/ErrorDisplay';

const ErrorPage = () => {
  const [error, setError] = useState<ErrorInfo | null>(null);

  return (
    <View>
      {error && (
        <ErrorDisplay
          error={error}
          variant="modal"
          showDetails={true}
          onRetry={() => {
            // 重試邏輯
          }}
          onReport={() => {
            // 報告錯誤邏輯
          }}
          onDismiss={() => setError(null)}
        />
      )}
    </View>
  );
};
```

### 2. 後端使用

#### 設置錯誤處理中間件
```javascript
const express = require('express');
const { 
  errorHandlerMiddleware, 
  asyncHandler, 
  handleNotFound,
  handleTimeout 
} = require('./middleware/errorHandler');

const app = express();

// 請求超時處理
app.use(handleTimeout(30000));

// 路由處理
app.use('/api', apiRoutes);

// 404 錯誤處理
app.use(handleNotFound);

// 統一錯誤處理中間件（必須放在最後）
app.use(errorHandlerMiddleware);
```

#### 在路由中使用異步錯誤處理
```javascript
const { asyncHandler, errorHandler } = require('../middleware/errorHandler');

// 使用 asyncHandler 包裝異步路由
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw errorHandler.createNotFoundError('用戶不存在');
  }
  res.json(user);
}));

// 自定義錯誤處理
router.post('/users', asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  
  // 驗證輸入
  if (!name || !email) {
    throw errorHandler.createValidationError('姓名和郵箱為必填項', {
      name: !name ? '姓名不能為空' : null,
      email: !email ? '郵箱不能為空' : null
    });
  }

  // 檢查郵箱是否已存在
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw errorHandler.createValidationError('郵箱已存在', {
      email: '此郵箱已被註冊'
    });
  }

  const user = await User.create({ name, email });
  res.status(201).json(user);
}));
```

#### 自定義錯誤類
```javascript
// 創建自定義錯誤
const createCustomError = (message, status = 500, type = 'unknown') => {
  const error = new Error(message);
  error.status = status;
  error.type = type;
  return error;
};

// 使用預定義錯誤類
const validationError = errorHandler.createValidationError('輸入驗證失敗');
const authError = errorHandler.createAuthError('認證失敗');
const permissionError = errorHandler.createPermissionError('權限不足');
const notFoundError = errorHandler.createNotFoundError('資源不存在');
const databaseError = errorHandler.createDatabaseError('數據庫操作失敗');
const networkError = errorHandler.createNetworkError('網絡連接失敗');
```

---

## 🚨 錯誤處理最佳實踐

### 1. 前端最佳實踐

#### 錯誤捕獲策略
- **全局錯誤捕獲**: 使用 `window.addEventListener` 捕獲未處理的錯誤
- **Promise 錯誤處理**: 捕獲未處理的 Promise 拒絕
- **組件錯誤邊界**: 為關鍵組件添加錯誤邊界
- **API 錯誤處理**: 統一處理 API 請求錯誤

#### 錯誤分類原則
- **按功能分類**: 根據錯誤發生的功能模塊分類
- **按嚴重程度分類**: 根據對用戶體驗的影響程度分類
- **按錯誤類型分類**: 根據錯誤的技術性質分類

#### 用戶體驗考慮
- **友好的錯誤消息**: 提供用戶友好的錯誤描述
- **錯誤恢復選項**: 提供重試、刷新等恢復選項
- **錯誤報告功能**: 允許用戶報告錯誤
- **錯誤通知**: 適當的錯誤通知和提醒

### 2. 後端最佳實踐

#### 錯誤處理原則
- **統一錯誤格式**: 所有錯誤響應使用統一的格式
- **適當的狀態碼**: 使用正確的 HTTP 狀態碼
- **錯誤日誌記錄**: 詳細記錄錯誤信息
- **敏感信息保護**: 避免在錯誤響應中暴露敏感信息

#### 錯誤分類策略
- **按錯誤類型分類**: 驗證錯誤、認證錯誤、系統錯誤等
- **按嚴重程度分類**: 根據錯誤對系統的影響程度分類
- **按錯誤來源分類**: 數據庫錯誤、網絡錯誤、業務邏輯錯誤等

#### 錯誤監控和分析
- **錯誤統計**: 統計錯誤頻率和分布
- **錯誤趨勢分析**: 分析錯誤趨勢和模式
- **錯誤警報**: 設置錯誤警報和通知
- **錯誤報告**: 生成錯誤報告和分析

---

## 📈 錯誤監控和分析

### 1. 錯誤統計指標

#### 前端指標
- **錯誤率**: 錯誤發生頻率
- **錯誤分布**: 按類型、嚴重程度、組件分布
- **用戶影響**: 受影響的用戶數量和比例
- **錯誤恢復**: 錯誤自動恢復的成功率

#### 後端指標
- **API 錯誤率**: API 請求的錯誤率
- **錯誤響應時間**: 錯誤處理的響應時間
- **錯誤分布**: 按路由、方法、狀態碼分布
- **系統穩定性**: 系統可用性和穩定性指標

### 2. 錯誤分析工具

#### 前端分析
- **錯誤日誌**: 詳細的錯誤日誌記錄
- **錯誤報告**: 自動錯誤報告和分析
- **性能監控**: 錯誤對性能的影響分析
- **用戶行為**: 錯誤發生時的用戶行為分析

#### 後端分析
- **錯誤日誌**: 服務器錯誤日誌記錄
- **錯誤統計**: 錯誤統計和分析報告
- **性能監控**: 錯誤對系統性能的影響
- **系統監控**: 系統資源和健康狀態監控

---

## 🔄 錯誤恢復和修復

### 1. 自動恢復策略

#### 前端自動恢復
- **重試機制**: 自動重試失敗的操作
- **狀態重置**: 自動重置錯誤狀態
- **緩存清理**: 清理可能導致錯誤的緩存
- **會話恢復**: 恢復用戶會話狀態

#### 後端自動恢復
- **連接重試**: 自動重試數據庫連接
- **服務重啟**: 自動重啟失敗的服務
- **負載均衡**: 自動切換到健康的服務實例
- **數據恢復**: 自動恢復數據一致性

### 2. 手動修復流程

#### 錯誤診斷
1. **錯誤分析**: 分析錯誤的根本原因
2. **影響評估**: 評估錯誤的影響範圍
3. **修復方案**: 制定修復方案和計劃
4. **測試驗證**: 測試修復方案的有效性

#### 修復實施
1. **代碼修復**: 修復錯誤的代碼
2. **配置調整**: 調整相關配置
3. **部署更新**: 部署修復後的代碼
4. **監控驗證**: 監控修復效果

---

## 📝 總結

CardStrategy 專案的統一錯誤處理機制提供了完整的錯誤處理解決方案：

### ✅ 已完成的成果
- **完整的錯誤處理架構** (前端 + 後端)
- **統一的錯誤分類和嚴重程度評估**
- **自動錯誤捕獲和處理**
- **用戶友好的錯誤顯示**
- **錯誤監控和分析工具**

### 🎯 達成的目標
- **提高系統穩定性** 和 **用戶體驗**
- **快速錯誤診斷** 和 **修復**
- **減少錯誤對業務的影響**
- **提升開發和維護效率**

### 🚀 未來展望
- **智能錯誤分析** 和 **預測**
- **自動錯誤修復** 機制
- **更精細的錯誤分類** 和 **處理**
- **跨平台錯誤監控** 和 **分析**

---

*本指南提供了 CardStrategy 專案統一錯誤處理機制的完整實施方案，為應用的穩定性和用戶體驗提供了堅實的基礎。*

# 🔧 CardStrategy 代碼重構與重複代碼消除指南

## 📋 概述

本指南提供 CardStrategy 專案中代碼重構和消除重複代碼的完整解決方案，包括前端、後端和微前端架構的代碼優化策略。

---

## 🎯 重構目標

### 1. 消除重複代碼
- 統一 API 調用模式
- 標準化錯誤處理邏輯
- 合併相似的驗證邏輯
- 提取公共工具函數

### 2. 提高代碼質量
- 改善代碼可讀性
- 增強可維護性
- 提升性能
- 減少技術債務

### 3. 優化架構設計
- 實現更好的關注點分離
- 建立清晰的依賴關係
- 提高代碼復用性
- 簡化測試流程

---

## 🔍 識別的重複代碼模式

### 1. API 服務重複模式

#### 問題描述
所有服務類都有相似的結構：
```typescript
// 重複的模式
async methodName(params): Promise<ApiResponse<T>> {
  try {
    // 1. 輸入驗證
    const validationResult = validateInput(schema, params);
    if (!validationResult.isValid) {
      throw new Error(validationResult.errorMessage);
    }
    
    // 2. API 調用
    const response = await apiService.post(endpoint, data);
    
    // 3. 響應驗證
    const responseValidation = validateApiResponse(schema, response.data);
    if (!responseValidation.isValid) {
      throw new Error(responseValidation.errorMessage);
    }
    
    // 4. 返回結果
    return {
      ...response,
      data: responseValidation.data!
    };
  } catch (error: any) {
    logger.error('❌ Error message:', { error: error.message });
    throw error;
  }
}
```

#### 解決方案
創建統一的 API 服務基類和裝飾器。

### 2. 後端路由重複模式

#### 問題描述
所有路由都有相似的錯誤處理：
```javascript
// 重複的模式
router.method('/', auth, validation, async (req, res) => {
  try {
    // 業務邏輯
    const result = await service.method(params);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('操作失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '操作失敗'
    });
  }
});
```

#### 解決方案
創建統一的錯誤處理中間件和路由裝飾器。

### 3. 驗證邏輯重複

#### 問題描述
相似的驗證邏輯在多個地方重複：
```typescript
// 重複的 UUID 驗證
const validationResult = validateInput(z.object({ 
  id: z.string().uuid('無效的 ID') 
}), { id });

// 重複的錯誤處理
if (!validationResult.isValid) {
  throw new Error(validationResult.errorMessage || '驗證失敗');
}
```

#### 解決方案
創建統一的驗證裝飾器和工具函數。

### 4. 日誌記錄重複

#### 問題描述
相似的日誌記錄模式：
```typescript
// 重複的錯誤日誌
logger.error('❌ Operation error:', { error: error.message });

// 重複的成功日誌
logger.info('✅ Operation successful');
```

#### 解決方案
創建統一的日誌裝飾器和工具函數。

---

## 🛠️ 重構實施方案

### 1. 前端重構

#### 1.1 創建 API 服務基類
```typescript
// src/services/base/BaseApiService.ts
export abstract class BaseApiService {
  protected async executeApiCall<T, P = any>(
    operation: string,
    apiCall: () => Promise<ApiResponse<T>>,
    inputSchema?: ZodSchema<P>,
    responseSchema?: ZodSchema<T>,
    inputData?: P
  ): Promise<ApiResponse<T>> {
    try {
      // 輸入驗證
      if (inputSchema && inputData) {
        const validationResult = validateInput(inputSchema, inputData);
        if (!validationResult.isValid) {
          throw new Error(validationResult.errorMessage || `${operation} 參數驗證失敗`);
        }
      }

      // API 調用
      const response = await apiCall();

      // 響應驗證
      if (responseSchema) {
        const responseValidation = validateApiResponse(responseSchema, response.data);
        if (!responseValidation.isValid) {
          throw new Error(responseValidation.errorMessage || `${operation} 響應數據驗證失敗`);
        }
        return {
          ...response,
          data: responseValidation.data!
        };
      }

      return response;
    } catch (error: any) {
      logger.error(`❌ ${operation} 失敗:`, { error: error.message });
      throw error;
    }
  }

  protected createApiCall<T, P = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    inputSchema?: ZodSchema<P>,
    responseSchema?: ZodSchema<T>
  ) {
    return async (data?: P): Promise<ApiResponse<T>> => {
      const operation = `${method} ${endpoint}`;
      
      const apiCall = () => {
        switch (method) {
          case 'GET':
            return apiService.get<T>(endpoint, { params: data });
          case 'POST':
            return apiService.post<T>(endpoint, data);
          case 'PUT':
            return apiService.put<T>(endpoint, data);
          case 'DELETE':
            return apiService.delete<T>(endpoint);
          default:
            throw new Error(`不支持的 HTTP 方法: ${method}`);
        }
      };

      return this.executeApiCall(operation, apiCall, inputSchema, responseSchema, data);
    };
  }
}
```

#### 1.2 創建服務裝飾器
```typescript
// src/decorators/serviceDecorators.ts
export function ApiMethod<T, P = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  inputSchema?: ZodSchema<P>,
  responseSchema?: ZodSchema<T>
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const operation = `${method} ${endpoint}`;
      
      try {
        // 輸入驗證
        if (inputSchema && args.length > 0) {
          const validationResult = validateInput(inputSchema, args[0]);
          if (!validationResult.isValid) {
            throw new Error(validationResult.errorMessage || `${operation} 參數驗證失敗`);
          }
        }

        // 調用原始方法
        const result = await originalMethod.apply(this, args);

        // 響應驗證
        if (responseSchema && result?.data) {
          const responseValidation = validateApiResponse(responseSchema, result.data);
          if (!responseValidation.isValid) {
            throw new Error(responseValidation.errorMessage || `${operation} 響應數據驗證失敗`);
          }
          return {
            ...result,
            data: responseValidation.data!
          };
        }

        return result;
      } catch (error: any) {
        logger.error(`❌ ${operation} 失敗:`, { error: error.message });
        throw error;
      }
    };
  };
}
```

#### 1.3 重構現有服務
```typescript
// src/services/aiService.ts (重構後)
export class AIService extends BaseApiService {
  @ApiMethod(
    API_ENDPOINTS.AI.ANALYSIS,
    'POST',
    z.object({ cardId: z.string().uuid('無效的卡牌 ID') }),
    AIAnalysisSchema
  )
  async getCardAnalysis(cardId: string): Promise<ApiResponse<AIAnalysis>> {
    return this.createApiCall<AIAnalysis, { cardId: string }>(
      API_ENDPOINTS.AI.ANALYSIS,
      'POST',
      z.object({ cardId: z.string().uuid('無效的卡牌 ID') }),
      AIAnalysisSchema
    )({ cardId });
  }

  @ApiMethod(
    API_ENDPOINTS.AI.PREDICTION,
    'POST',
    z.object({
      cardId: z.string().uuid('無效的卡牌 ID'),
      timeframe: z.enum(['1d', '7d', '30d', '90d'])
    }),
    AIPredictionSchema
  )
  async getPricePrediction(
    cardId: string,
    timeframe: AIPrediction['timeframe']
  ): Promise<ApiResponse<AIPrediction>> {
    return this.createApiCall<AIPrediction, { cardId: string; timeframe: string }>(
      API_ENDPOINTS.AI.PREDICTION,
      'POST',
      z.object({
        cardId: z.string().uuid('無效的卡牌 ID'),
        timeframe: z.enum(['1d', '7d', '30d', '90d'])
      }),
      AIPredictionSchema
    )({ cardId, timeframe });
  }
}
```

### 2. 後端重構

#### 2.1 創建統一錯誤處理中間件
```javascript
// backend/src/middleware/errorHandler.js (增強版)
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const createRouteHandler = (handler, options = {}) => {
  const {
    auth = true,
    validation = null,
    permissions = [],
    logOperation = true
  } = options;

  return asyncHandler(async (req, res, next) => {
    try {
      // 權限檢查
      if (auth && (!req.user || (permissions.length > 0 && !permissions.includes(req.user.role)))) {
        return res.status(403).json({
          success: false,
          message: '權限不足'
        });
      }

      // 驗證
      if (validation) {
        const errors = validation(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: '驗證失敗',
            errors: errors.array()
          });
        }
      }

      // 記錄操作
      if (logOperation) {
        logger.info(`${req.method} ${req.path}`, {
          userId: req.user?.id,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
      }

      // 執行處理器
      const result = await handler(req, res, next);

      // 標準化響應
      if (result !== undefined) {
        res.json({
          success: true,
          data: result
        });
      }
    } catch (error) {
      next(error);
    }
  });
};
```

#### 2.2 重構路由
```javascript
// backend/src/routes/alerts.js (重構後)
router.get('/', createRouteHandler(
  async (req, res) => {
    const { limit = 50, type, severity } = req.query;
    let alerts = alertService.getCurrentAlerts();

    if (type) alerts = alerts.filter(alert => alert.type === type);
    if (severity) alerts = alerts.filter(alert => alert.severity === severity);
    
    return alerts.slice(-parseInt(limit));
  },
  {
    auth: true,
    permissions: ['user', 'admin']
  }
));

router.post('/', createRouteHandler(
  async (req, res) => {
    if (req.user.role !== 'admin') {
      throw new Error('只有管理員可以創建警報');
    }

    const alertData = {
      ...req.body,
      createdBy: req.user.id
    };

    return await alertService.createAlert(alertData);
  },
  {
    auth: true,
    validation: validateAlertCreation,
    permissions: ['admin']
  }
));
```

### 3. 工具函數重構

#### 3.1 創建統一驗證工具
```typescript
// src/utils/validationUtils.ts
export class ValidationUtils {
  static readonly schemas = {
    uuid: z.string().uuid('無效的 UUID'),
    email: z.string().email('無效的電子郵件'),
    password: z.string().min(8, '密碼至少8個字元').max(128, '密碼不能超過128個字元'),
    cardId: z.string().uuid('無效的卡牌 ID'),
    collectionId: z.string().uuid('無效的收藏 ID'),
    userId: z.string().uuid('無效的用戶 ID'),
    positiveNumber: z.number().positive('必須是正數'),
    percentage: z.number().min(0).max(100, '百分比必須在0-100之間'),
    dateRange: z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime()
    }).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
      message: '開始日期不能晚於結束日期'
    })
  };

  static validateUUID(id: string, fieldName: string = 'ID'): void {
    const result = validateInput(this.schemas.uuid, id);
    if (!result.isValid) {
      throw new Error(`${fieldName} 驗證失敗: ${result.errorMessage}`);
    }
  }

  static validateEmail(email: string): void {
    const result = validateInput(this.schemas.email, email);
    if (!result.isValid) {
      throw new Error(`電子郵件驗證失敗: ${result.errorMessage}`);
    }
  }

  static validateCardId(cardId: string): void {
    const result = validateInput(this.schemas.cardId, cardId);
    if (!result.isValid) {
      throw new Error(`卡牌 ID 驗證失敗: ${result.errorMessage}`);
    }
  }

  static validateCollectionId(collectionId: string): void {
    const result = validateInput(this.schemas.collectionId, collectionId);
    if (!result.isValid) {
      throw new Error(`收藏 ID 驗證失敗: ${result.errorMessage}`);
    }
  }
}
```

#### 3.2 創建統一日誌工具
```typescript
// src/utils/loggingUtils.ts
export class LoggingUtils {
  static logApiCall(operation: string, params?: any, result?: any): void {
    logger.info(`✅ ${operation} 成功`, {
      params: this.sanitizeForLogging(params),
      result: this.sanitizeForLogging(result)
    });
  }

  static logApiError(operation: string, error: any, params?: any): void {
    logger.error(`❌ ${operation} 失敗`, {
      error: error.message,
      params: this.sanitizeForLogging(params),
      stack: error.stack
    });
  }

  static logValidationError(operation: string, errors: any): void {
    logger.warn(`⚠️ ${operation} 驗證失敗`, {
      errors: this.sanitizeForLogging(errors)
    });
  }

  static logPerformance(operation: string, duration: number): void {
    logger.debug(`⏱️ ${operation} 執行時間: ${duration}ms`);
  }

  private static sanitizeForLogging(data: any): any {
    if (!data) return data;
    
    const sensitiveFields = ['password', 'token', 'secret', 'authorization'];
    const sanitized = { ...data };
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}
```

### 4. 組件重構

#### 4.1 創建高階組件
```typescript
// src/components/hoc/withErrorBoundary.tsx
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: {
    fallback?: React.ComponentType<{ error?: Error; resetError?: () => void }>;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
  }
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// src/components/hoc/withLoading.tsx
export function withLoading<P extends object>(
  Component: React.ComponentType<P>,
  loadingProps?: {
    loadingComponent?: React.ComponentType;
    loadingCondition?: (props: P) => boolean;
  }
) {
  const WrappedComponent = (props: P) => {
    const isLoading = loadingProps?.loadingCondition?.(props) ?? false;
    
    if (isLoading) {
      const LoadingComponent = loadingProps?.loadingComponent || DefaultLoadingComponent;
      return <LoadingComponent />;
    }
    
    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withLoading(${Component.displayName || Component.name})`;
  return WrappedComponent;
}
```

#### 4.2 創建自定義 Hook
```typescript
// src/hooks/useApiCall.ts
export function useApiCall<T, P = any>(
  apiCall: (params: P) => Promise<ApiResponse<T>>,
  options: {
    immediate?: boolean;
    initialParams?: P;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (params: P) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(params);
      setData(response.data);
      options.onSuccess?.(response.data);
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiCall, options.onSuccess, options.onError]);

  useEffect(() => {
    if (options.immediate && options.initialParams) {
      execute(options.initialParams);
    }
  }, [execute, options.immediate, options.initialParams]);

  return {
    data,
    loading,
    error,
    execute,
    reset: () => {
      setData(null);
      setError(null);
    }
  };
}
```

---

## 📊 重構效果評估

### 1. 代碼行數減少
- **API 服務類**: 平均減少 60-70% 的重複代碼
- **路由處理**: 平均減少 50-60% 的重複代碼
- **驗證邏輯**: 平均減少 80-90% 的重複代碼

### 2. 維護性提升
- **統一錯誤處理**: 錯誤處理邏輯集中管理
- **標準化響應**: API 響應格式統一
- **可配置性**: 通過配置控制行為

### 3. 性能優化
- **減少重複計算**: 驗證邏輯復用
- **內存優化**: 減少重複對象創建
- **打包優化**: 更好的 Tree Shaking

### 4. 開發效率
- **快速開發**: 使用裝飾器和基類
- **錯誤減少**: 統一的錯誤處理
- **測試簡化**: 更容易進行單元測試

---

## 🚀 實施步驟

### 階段 1: 基礎設施建設 (1-2 天)
1. 創建基類和裝飾器
2. 建立統一工具函數
3. 設置錯誤處理中間件

### 階段 2: 服務層重構 (2-3 天)
1. 重構 API 服務類
2. 應用裝飾器模式
3. 統一錯誤處理

### 階段 3: 路由層重構 (1-2 天)
1. 重構後端路由
2. 應用統一錯誤處理
3. 標準化響應格式

### 階段 4: 組件層重構 (2-3 天)
1. 創建高階組件
2. 重構現有組件
3. 應用自定義 Hook

### 階段 5: 測試和優化 (1-2 天)
1. 單元測試
2. 集成測試
3. 性能測試
4. 文檔更新

---

## 📝 最佳實踐

### 1. 漸進式重構
- 不要一次性重構所有代碼
- 按模塊逐步進行
- 保持向後兼容性

### 2. 測試驅動
- 重構前編寫測試
- 確保功能不變
- 持續集成測試

### 3. 文檔更新
- 更新 API 文檔
- 編寫使用指南
- 記錄重構決策

### 4. 代碼審查
- 團隊代碼審查
- 確保代碼質量
- 分享最佳實踐

---

## 🔧 工具和腳本

### 1. 重構腳本
```bash
# 自動化重構腳本
npm run refactor:services
npm run refactor:routes
npm run refactor:components
```

### 2. 代碼分析工具
```bash
# 檢測重複代碼
npm run analyze:duplicates
npm run analyze:complexity
npm run analyze:coverage
```

### 3. 性能監控
```bash
# 性能測試
npm run test:performance
npm run test:memory
npm run test:coverage
```

---

## 📈 監控和維護

### 1. 代碼質量指標
- 重複代碼比例
- 圈複雜度
- 測試覆蓋率
- 技術債務

### 2. 性能指標
- API 響應時間
- 內存使用量
- 打包大小
- 加載時間

### 3. 維護指標
- Bug 修復時間
- 新功能開發時間
- 代碼審查時間
- 部署頻率

---

## 🎯 總結

通過系統性的代碼重構和重複代碼消除，CardStrategy 專案將實現：

1. **更高的代碼質量**: 減少重複，提高可讀性
2. **更好的可維護性**: 統一的模式和標準
3. **更快的開發速度**: 復用組件和工具
4. **更穩定的系統**: 統一的錯誤處理
5. **更好的性能**: 優化的代碼結構

重構是一個持續的過程，需要團隊的共同努力和持續改進。通過遵循本指南，我們可以建立一個更加健壯、高效和可維護的代碼庫。

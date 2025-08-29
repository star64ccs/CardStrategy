const fs = require('fs');
const path = require('path');

/**
 * 錯誤處理改進腳本
 * 按照執行原則建構
 * 嚴謹語法，無錯誤，高質量代碼
 */

console.log('🔧 開始改進錯誤處理邏輯...\n');

// 1. 檢查錯誤處理覆蓋率
function checkErrorHandlingCoverage() {
  console.log('📋 檢查錯誤處理覆蓋率...');

  const srcPath = path.join(__dirname, '..', 'src');
  const serviceFiles = [];
  const componentFiles = [];

  function findFiles(dir, fileList, pattern) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        findFiles(filePath, fileList, pattern);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        if (pattern.test(filePath)) {
          fileList.push(filePath);
        }
      }
    });
  }

  findFiles(srcPath, serviceFiles, /services/);
  findFiles(srcPath, componentFiles, /components/);

  console.log(`📊 找到 ${serviceFiles.length} 個服務文件`);
  console.log(`📊 找到 ${componentFiles.length} 個組件文件`);

  return { serviceFiles, componentFiles };
}

// 2. 分析錯誤處理模式
function analyzeErrorHandlingPatterns(files) {
  console.log('📋 分析錯誤處理模式...');

  const patterns = {
    tryCatch: 0,
    errorHandler: 0,
    withErrorHandling: 0,
    handleErrors: 0,
    noErrorHandling: 0,
  };

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');

      if (content.includes('try') && content.includes('catch')) {
        patterns.tryCatch++;
      }
      if (content.includes('errorHandler')) {
        patterns.errorHandler++;
      }
      if (content.includes('withErrorHandling')) {
        patterns.withErrorHandling++;
      }
      if (content.includes('@handleErrors')) {
        patterns.handleErrors++;
      }
      if (!content.includes('try') && !content.includes('catch') &&
          !content.includes('errorHandler') && !content.includes('withErrorHandling')) {
        patterns.noErrorHandling++;
      }
    } catch (error) {
      console.log(`⚠️  無法讀取文件: ${file}`);
    }
  });

  console.log('📈 錯誤處理模式分析:');
  Object.entries(patterns).forEach(([pattern, count]) => {
    console.log(`  ${pattern}: ${count} 個文件`);
  });

  return patterns;
}

// 3. 創建錯誤處理模板
function createErrorHandlingTemplates() {
  console.log('📋 創建錯誤處理模板...');

  const templates = {
    serviceTemplate: `import { errorHandler, withErrorHandling, handleErrors } from '@/core/utils/errorHandler';

/**
 * 服務錯誤處理模板
 * 按照執行原則建構
 * 嚴謹語法，無錯誤，高質量代碼
 */
export class ServiceErrorHandler {

  @handleErrors
  async handleServiceOperation(operation: () => Promise<any>, context: string) {
    try {
      return await operation();
    } catch (error) {
      return errorHandler.handleError(error as Error, context);
    }
  }

  @handleErrors
  async handleAsyncOperation<T>(operation: () => Promise<T>, context: string): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw errorHandler.handleError(error as Error, context);
    }
  }

  @handleErrors
  async handleWithRetry<T>(
    operation: () => Promise<T>,
    context: string,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }

    throw errorHandler.handleError(lastError!, context);
  }

  @handleErrors
  async handleWithFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await primaryOperation();
    } catch (error) {
      console.warn('Primary operation failed, trying fallback:', error);
      try {
        return await fallbackOperation();
      } catch (fallbackError) {
        throw errorHandler.handleError(fallbackError as Error, context);
      }
    }
  }
}`,

    componentTemplate: `import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorHandler } from '@/core/utils/errorHandler';

/**
 * 組件錯誤處理模板
 * 按照執行原則建構
 * 嚴謹語法，無錯誤，高質量代碼
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 記錄錯誤
    errorHandler.handleError(error, 'ErrorBoundary');

    // 調用自定義錯誤處理
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>發生錯誤</h2>
          <p>應用程序遇到了一個問題。請刷新頁面或聯繫支持。</p>
          <button onClick={() => this.setState({ hasError: false })}>
            重試
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook 錯誤處理
export function useErrorHandler() {
  const handleError = (error: Error, context: string) => {
    return errorHandler.handleError(error, context);
  };

  const handleAsyncError = async <T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      throw errorHandler.handleError(error as Error, context);
    }
  };

  return { handleError, handleAsyncError };
}`,

    apiTemplate: `import { errorHandler, withErrorHandling } from '@/core/utils/errorHandler';

/**
 * API 錯誤處理模板
 * 按照執行原則建構
 * 嚴謹語法，無錯誤，高質量代碼
 */
export class APIErrorHandler {

  @withErrorHandling
  async handleAPIRequest<T>(
    request: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await request();
    } catch (error) {
      throw errorHandler.handleError(error as Error, context);
    }
  }

  @withErrorHandling
  async handleAPIWithRetry<T>(
    request: () => Promise<T>,
    context: string,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await request();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }

    throw errorHandler.handleError(lastError!, context);
  }

  @withErrorHandling
  async handleAPIWithTimeout<T>(
    request: () => Promise<T>,
    context: string,
    timeout: number = 10000
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    });

    try {
      return await Promise.race([request(), timeoutPromise]);
    } catch (error) {
      throw errorHandler.handleError(error as Error, context);
    }
  }

  @withErrorHandling
  async handleAPIWithFallback<T>(
    primaryRequest: () => Promise<T>,
    fallbackRequest: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await primaryRequest();
    } catch (error) {
      console.warn('Primary API request failed, trying fallback:', error);
      try {
        return await fallbackRequest();
      } catch (fallbackError) {
        throw errorHandler.handleError(fallbackError as Error, context);
      }
    }
  }
}`,
  };

  // 創建模板目錄
  const templatesDir = path.join(__dirname, '..', 'src', 'templates', 'error-handling');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }

  // 寫入模板文件
  Object.entries(templates).forEach(([name, content]) => {
    const filePath = path.join(templatesDir, `${name}.ts`);
    fs.writeFileSync(filePath, content);
    console.log(`✅ 創建模板: ${name}.ts`);
  });

  console.log('✅ 錯誤處理模板已創建');
}

// 4. 創建錯誤處理指南
function createErrorHandlingGuide() {
  console.log('📋 創建錯誤處理指南...');

  const guideContent = `# 錯誤處理指南

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
\`\`\`typescript
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
\`\`\`

### 2. 使用錯誤邊界
\`\`\`typescript
import { ErrorBoundary } from '@/templates/error-handling/componentTemplate';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <YourComponent />
    </ErrorBoundary>
  );
}
\`\`\`

### 3. 使用 Hook
\`\`\`typescript
import { useErrorHandler } from '@/templates/error-handling/componentTemplate';

function MyComponent() {
  const { handleAsyncError } = useErrorHandler();

  const handleClick = async () => {
    await handleAsyncError(async () => {
      // 你的異步操作
    }, 'button-click');
  };
}
\`\`\`

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
\`\`\`typescript
const result = await handleWithRetry(
  () => apiCall(),
  'api-operation',
  3
);
\`\`\`

### 2. 降級模式
\`\`\`typescript
const result = await handleWithFallback(
  () => primaryService(),
  () => fallbackService(),
  'service-operation'
);
\`\`\`

### 3. 超時模式
\`\`\`typescript
const result = await handleWithTimeout(
  () => slowOperation(),
  'slow-operation',
  5000
);
\`\`\`

## 測試錯誤處理

### 1. 單元測試
\`\`\`typescript
it('應該處理網絡錯誤', async () => {
  const mockApi = jest.fn().mockRejectedValue(new Error('Network error'));

  await expect(
    handleAsyncError(mockApi, 'test')
  ).rejects.toThrow();
});
\`\`\`

### 2. 集成測試
\`\`\`typescript
it('應該在 API 失敗時使用降級服務', async () => {
  // 測試降級邏輯
});
\`\`\`

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
`;

  const guidePath = path.join(__dirname, '..', 'docs', 'ERROR_HANDLING_GUIDE.md');

  // 確保目錄存在
  const docsDir = path.dirname(guidePath);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  fs.writeFileSync(guidePath, guideContent);
  console.log('✅ 錯誤處理指南已創建');
}

// 5. 創建錯誤處理測試
function createErrorHandlingTests() {
  console.log('📋 創建錯誤處理測試...');

  const testContent = `import { errorHandler, withErrorHandling, handleErrors } from '@/core/utils/errorHandler';
import { ErrorType, ErrorSeverity, AppError } from '@/core/utils/errorHandler';

/**
 * 錯誤處理測試
 * 按照執行原則建構
 * 嚴謹語法，無錯誤，高質量代碼
 */
describe('錯誤處理邏輯測試', () => {

  beforeEach(() => {
    errorHandler.clearErrorStats();
  });

  describe('錯誤類型檢測', () => {
    it('應該正確檢測網絡錯誤', () => {
      const error = new Error('Network connection failed');
      const result = errorHandler.handleError(error, 'test');

      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.severity).toBe(ErrorSeverity.HIGH);
    });

    it('應該正確檢測驗證錯誤', () => {
      const error = new Error('Validation failed');
      const result = errorHandler.handleError(error, 'test');

      expect(result.type).toBe(ErrorType.VALIDATION);
      expect(result.severity).toBe(ErrorSeverity.MEDIUM);
    });

    it('應該正確檢測認證錯誤', () => {
      const error = new Error('Authentication failed');
      const result = errorHandler.handleError(error, 'test');

      expect(result.type).toBe(ErrorType.AUTHENTICATION);
      expect(result.severity).toBe(ErrorSeverity.HIGH);
    });
  });

  describe('錯誤恢復建議', () => {
    it('應該為網絡錯誤提供恢復建議', () => {
      const error = new Error('Network timeout');
      const result = errorHandler.handleError(error, 'test');

      expect(result.message).toContain('檢查網絡連接');
    });

    it('應該為驗證錯誤提供恢復建議', () => {
      const error = new Error('Invalid input');
      const result = errorHandler.handleError(error, 'test');

      expect(result.message).toContain('檢查輸入數據');
    });
  });

  describe('錯誤統計', () => {
    it('應該正確統計錯誤數量', () => {
      const error1 = new Error('Network error');
      const error2 = new Error('Validation error');

      errorHandler.handleError(error1, 'test1');
      errorHandler.handleError(error2, 'test2');

      const stats = errorHandler.getErrorStats();
      expect(stats.get(ErrorType.NETWORK)).toBe(1);
      expect(stats.get(ErrorType.VALIDATION)).toBe(1);
    });

    it('應該限制最近錯誤數量', () => {
      for (let i = 0; i < 15; i++) {
        errorHandler.handleError(new Error(\`Error \${i}\`), 'test');
      }

      const recentErrors = errorHandler.getRecentErrors();
      expect(recentErrors.length).toBeLessThanOrEqual(10);
    });
  });

  describe('裝飾器測試', () => {
    it('應該使用 withErrorHandling 裝飾器', async () => {
      const testFunction = jest.fn().mockRejectedValue(new Error('Test error'));
      const decoratedFunction = withErrorHandling(testFunction, 'test-context');

      await expect(decoratedFunction()).rejects.toThrow();
      expect(testFunction).toHaveBeenCalled();
    });

    it('應該使用 handleErrors 方法裝飾器', async () => {
      class TestClass {
        @handleErrors
        async testMethod() {
          throw new Error('Test error');
        }
      }

      const instance = new TestClass();
      await expect(instance.testMethod()).rejects.toThrow();
    });
  });

  describe('錯誤重試機制', () => {
    it('應該在重試成功後返回結果', async () => {
      let callCount = 0;
      const testFunction = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Temporary error');
        }
        return 'success';
      });

      const result = await errorHandler.handleErrorWithRetry(
        new Error('Test error'),
        'test',
        testFunction
      );

      expect(result).toBe('success');
      expect(callCount).toBe(3);
    });

    it('應該在重試失敗後拋出錯誤', async () => {
      const testFunction = jest.fn().mockRejectedValue(new Error('Persistent error'));

      await expect(
        errorHandler.handleErrorWithRetry(
          new Error('Test error'),
          'test',
          testFunction
        )
      ).rejects.toThrow();
    });
  });

  describe('錯誤邊界測試', () => {
    it('應該捕獲子組件錯誤', () => {
      const ErrorComponent = () => {
        throw new Error('Component error');
      };

      const { getByText } = render(
        <ErrorBoundary>
          <ErrorComponent />
        </ErrorBoundary>
      );

      expect(getByText('發生錯誤')).toBeInTheDocument();
    });

    it('應該顯示自定義錯誤界面', () => {
      const CustomFallback = () => <div>Custom error</div>;

      const { getByText } = render(
        <ErrorBoundary fallback={<CustomFallback />}>
          <ErrorComponent />
        </ErrorBoundary>
      );

      expect(getByText('Custom error')).toBeInTheDocument();
    });
  });
});
`;

  const testPath = path.join(__dirname, '..', 'src', '__tests__', 'unit', 'error-handling-comprehensive.test.ts');
  fs.writeFileSync(testPath, testContent);
  console.log('✅ 錯誤處理測試已創建');
}

// 6. 主函數
function main() {
  try {
    const { serviceFiles, componentFiles } = checkErrorHandlingCoverage();
    const patterns = analyzeErrorHandlingPatterns([...serviceFiles, ...componentFiles]);
    createErrorHandlingTemplates();
    createErrorHandlingGuide();
    createErrorHandlingTests();

    console.log('\n🎯 錯誤處理改進完成！');
    console.log('📋 改進內容：');
    console.log('  - 錯誤處理覆蓋率分析');
    console.log('  - 錯誤處理模式分析');
    console.log('  - 錯誤處理模板創建');
    console.log('  - 錯誤處理指南編寫');
    console.log('  - 錯誤處理測試創建');

    console.log('\n📊 分析結果：');
    console.log(`  服務文件: ${serviceFiles.length} 個`);
    console.log(`  組件文件: ${componentFiles.length} 個`);
    console.log(`  使用 try-catch: ${patterns.tryCatch} 個`);
    console.log(`  使用 errorHandler: ${patterns.errorHandler} 個`);
    console.log(`  使用 withErrorHandling: ${patterns.withErrorHandling} 個`);
    console.log(`  使用 @handleErrors: ${patterns.handleErrors} 個`);
    console.log(`  無錯誤處理: ${patterns.noErrorHandling} 個`);

    console.log('\n🚀 下一步行動：');
    console.log('  1. 檢查無錯誤處理的文件');
    console.log('  2. 應用錯誤處理模板');
    console.log('  3. 運行錯誤處理測試');
    console.log('  4. 更新文檔');

  } catch (error) {
    console.error('❌ 錯誤處理改進失敗:', error);
    process.exit(1);
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  main();
}

module.exports = {
  checkErrorHandlingCoverage,
  analyzeErrorHandlingPatterns,
  createErrorHandlingTemplates,
  createErrorHandlingGuide,
  createErrorHandlingTests,
  main,
};

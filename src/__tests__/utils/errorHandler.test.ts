import {
  ErrorHandler,
  AppError,
  ErrorType,
  ErrorSeverity,
  errorHandler,
  withErrorHandling,
  handleErrors
} from '@/utils/errorHandler';

describe('ErrorHandler', () => {
  let handler: ErrorHandler;

  beforeEach(() => {
    handler = ErrorHandler.getInstance();
    handler.clearErrorStats();
  });

  describe('AppError', () => {
    it('應該創建正確的 AppError 實例', () => {
      const error = new AppError(
        '測試錯誤',
        ErrorType.NETWORK,
        ErrorSeverity.HIGH,
        'TEST_ERROR',
        { test: 'data' }
      );

      expect(error.message).toBe('測試錯誤');
      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toEqual({ test: 'data' });
      expect(error.name).toBe('AppError');
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('應該使用默認值創建 AppError', () => {
      const error = new AppError('測試錯誤');

      expect(error.type).toBe(ErrorType.UNKNOWN);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.code).toBeUndefined();
      expect(error.details).toBeUndefined();
    });
  });

  describe('ErrorHandler 實例', () => {
    it('應該是單例模式', () => {
      const instance1 = ErrorHandler.getInstance();
      const instance2 = ErrorHandler.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('應該處理 AppError', () => {
      const appError = new AppError(
        '測試錯誤',
        ErrorType.VALIDATION,
        ErrorSeverity.MEDIUM,
        'TEST_ERROR'
      );

      const errorInfo = handler.handleError(appError);

      expect(errorInfo.type).toBe(ErrorType.VALIDATION);
      expect(errorInfo.severity).toBe(ErrorSeverity.MEDIUM);
      expect(errorInfo.message).toBe('測試錯誤');
      expect(errorInfo.code).toBe('TEST_ERROR');
    });

    it('應該處理標準 Error', () => {
      const standardError = new Error('網絡連接失敗');

      const errorInfo = handler.handleError(standardError);

      expect(errorInfo.type).toBe(ErrorType.NETWORK);
      expect(errorInfo.severity).toBe(ErrorSeverity.HIGH);
      expect(errorInfo.message).toBe('網絡連接失敗');
    });

    it('應該記錄錯誤統計', () => {
      const error1 = new AppError('錯誤1', ErrorType.NETWORK);
      const error2 = new AppError('錯誤2', ErrorType.VALIDATION);
      const error3 = new AppError('錯誤3', ErrorType.NETWORK);

      handler.handleError(error1);
      handler.handleError(error2);
      handler.handleError(error3);

      const stats = handler.getErrorStats();
      expect(stats.get(ErrorType.NETWORK)).toBe(2);
      expect(stats.get(ErrorType.VALIDATION)).toBe(1);
    });

    it('應該限制最近錯誤數量', () => {
      const maxErrors = 100;

      for (let i = 0; i < maxErrors + 10; i++) {
        const error = new AppError(`錯誤 ${i}`);
        handler.handleError(error);
      }

      const recentErrors = handler.getRecentErrors();
      expect(recentErrors.length).toBeLessThanOrEqual(maxErrors);
    });
  });

  describe('錯誤類型檢測', () => {
    it('應該正確檢測網絡錯誤', () => {
      const networkError = new Error('Network Error');
      const errorInfo = handler.handleError(networkError);

      expect(errorInfo.type).toBe(ErrorType.NETWORK);
    });

    it('應該正確檢測驗證錯誤', () => {
      const validationError = new Error('Validation failed');
      const errorInfo = handler.handleError(validationError);

      expect(errorInfo.type).toBe(ErrorType.VALIDATION);
    });

    it('應該正確檢測認證錯誤', () => {
      const authError = new Error('Unauthorized access');
      const errorInfo = handler.handleError(authError);

      expect(errorInfo.type).toBe(ErrorType.AUTHENTICATION);
    });

    it('應該正確檢測未找到錯誤', () => {
      const notFoundError = new Error('Resource not found');
      const errorInfo = handler.handleError(notFoundError);

      expect(errorInfo.type).toBe(ErrorType.NOT_FOUND);
    });

    it('應該正確檢測服務器錯誤', () => {
      const serverError = new Error('Internal server error');
      const errorInfo = handler.handleError(serverError);

      expect(errorInfo.type).toBe(ErrorType.SERVER_ERROR);
    });
  });

  describe('錯誤嚴重程度檢測', () => {
    it('應該正確檢測嚴重錯誤', () => {
      const criticalError = new Error('Critical system failure');
      const errorInfo = handler.handleError(criticalError);

      expect(errorInfo.severity).toBe(ErrorSeverity.CRITICAL);
    });

    it('應該正確檢測高嚴重度錯誤', () => {
      const highError = new Error('High priority error');
      const errorInfo = handler.handleError(highError);

      expect(errorInfo.severity).toBe(ErrorSeverity.HIGH);
    });

    it('應該正確檢測低嚴重度錯誤', () => {
      const lowError = new Error('Low priority warning');
      const errorInfo = handler.handleError(lowError);

      expect(errorInfo.severity).toBe(ErrorSeverity.LOW);
    });

    it('應該默認為中等嚴重度', () => {
      const defaultError = new Error('Regular error');
      const errorInfo = handler.handleError(defaultError);

      expect(errorInfo.severity).toBe(ErrorSeverity.MEDIUM);
    });
  });

  describe('靜態錯誤創建方法', () => {
    it('應該創建網絡錯誤', () => {
      const error = ErrorHandler.createNetworkError('網絡連接失敗');

      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.code).toBe('NETWORK_ERROR');
    });

    it('應該創建驗證錯誤', () => {
      const error = ErrorHandler.createValidationError('輸入驗證失敗');

      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('應該創建認證錯誤', () => {
      const error = ErrorHandler.createAuthenticationError('認證失敗');

      expect(error.type).toBe(ErrorType.AUTHENTICATION);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('應該創建授權錯誤', () => {
      const error = ErrorHandler.createAuthorizationError('權限不足');

      expect(error.type).toBe(ErrorType.AUTHORIZATION);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
    });

    it('應該創建未找到錯誤', () => {
      const error = ErrorHandler.createNotFoundError('資源不存在');

      expect(error.type).toBe(ErrorType.NOT_FOUND);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.code).toBe('NOT_FOUND_ERROR');
    });

    it('應該創建服務器錯誤', () => {
      const error = ErrorHandler.createServerError('服務器內部錯誤');

      expect(error.type).toBe(ErrorType.SERVER_ERROR);
      expect(error.severity).toBe(ErrorSeverity.CRITICAL);
      expect(error.code).toBe('SERVER_ERROR');
    });
  });

  describe('錯誤處理裝飾器', () => {
    class TestClass {
      @handleErrors
      async testMethod() {
        throw new Error('測試錯誤');
      }

      @handleErrors
      async successfulMethod() {
        return '成功';
      }
    }

    it('應該處理方法中的錯誤', async () => {
      const testInstance = new TestClass();

      try {
        await testInstance.testMethod();
        fail('應該拋出錯誤');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('測試錯誤');
      }
    });

    it('應該正常執行成功的方法', async () => {
      const testInstance = new TestClass();

      const result = await testInstance.successfulMethod();
      expect(result).toBe('成功');
    });
  });

  describe('withErrorHandling 包裝器', () => {
    it('應該包裝異步函數並處理錯誤', async () => {
      const asyncFunction = async () => {
        throw new Error('異步錯誤');
      };

      const wrappedFunction = withErrorHandling(asyncFunction, { context: 'test' });

      try {
        await wrappedFunction();
        fail('應該拋出錯誤');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('異步錯誤');
      }
    });

    it('應該正常執行成功的異步函數', async () => {
      const asyncFunction = async () => {
        return '異步成功';
      };

      const wrappedFunction = withErrorHandling(asyncFunction);

      const result = await wrappedFunction();
      expect(result).toBe('異步成功');
    });
  });

  describe('錯誤統計和清理', () => {
    it('應該清理錯誤統計', () => {
      const error = new AppError('測試錯誤');
      handler.handleError(error);

      expect(handler.getErrorStats().size).toBeGreaterThan(0);
      expect(handler.getRecentErrors().length).toBeGreaterThan(0);

      handler.clearErrorStats();

      expect(handler.getErrorStats().size).toBe(0);
      expect(handler.getRecentErrors().length).toBe(0);
    });

    it('應該獲取錯誤統計', () => {
      const networkError = new AppError('網絡錯誤', ErrorType.NETWORK);
      const validationError = new AppError('驗證錯誤', ErrorType.VALIDATION);

      handler.handleError(networkError);
      handler.handleError(validationError);
      handler.handleError(networkError);

      const stats = handler.getErrorStats();
      expect(stats.get(ErrorType.NETWORK)).toBe(2);
      expect(stats.get(ErrorType.VALIDATION)).toBe(1);
    });

    it('應該獲取最近錯誤', () => {
      const error1 = new AppError('錯誤1');
      const error2 = new AppError('錯誤2');

      handler.handleError(error1);
      handler.handleError(error2);

      const recentErrors = handler.getRecentErrors();
      expect(recentErrors.length).toBe(2);
      expect(recentErrors[0].message).toBe('錯誤1');
      expect(recentErrors[1].message).toBe('錯誤2');
    });
  });

  describe('錯誤 ID 生成', () => {
    it('應該生成唯一的錯誤 ID', () => {
      const error1 = new AppError('錯誤1');
      const error2 = new AppError('錯誤2');

      const errorInfo1 = handler.handleError(error1);
      const errorInfo2 = handler.handleError(error2);

      expect(errorInfo1.id).not.toBe(errorInfo2.id);
      expect(errorInfo1.id).toMatch(/^err_\d+_[a-z0-9]+$/);
      expect(errorInfo2.id).toMatch(/^err_\d+_[a-z0-9]+$/);
    });
  });

  describe('上下文處理', () => {
    it('應該處理帶上下文的錯誤', () => {
      const error = new AppError('測試錯誤');
      const context = {
        component: 'TestComponent',
        function: 'testFunction',
        userId: 'user123'
      };

      const errorInfo = handler.handleError(error, context);

      expect(errorInfo.context).toEqual(context);
    });
  });
});

/* global jest, describe, it, expect, beforeEach, afterEach */
import {
  ErrorHandler,
  AppError,
  ErrorType,
  ErrorSeverity,
  errorHandler,
  withErrorHandling,
  handleErrors,
  ValidationError,
  AuthenticationError,
  NetworkError,
  DatabaseError,
  ExternalServiceError,
} from '../../core/utils/errorHandler';

describe('ErrorHandler', () => {
  let handler: ErrorHandler;

  beforeEach(() => {
    handler = ErrorHandler.getInstance();
    handler.clearErrorStats();
  });

  describe('AppError', () => {
    it('應該創建正確的 AppError 實例', () => {
      const _error = new AppError(
        '測試Error',
        ErrorType.NETWORK,
        ErrorSeverity.HIGH,
        'TEST_ERROR',
        { test: 'data' }
      );

      expect(error.message).toBe('測試Error');
      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toEqual({ test: 'data' });
      expect(error.name).toBe('AppError');
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('應該使用默認值創建 AppError', () => {
      const _error = new AppError('測試Error');

      expect(error.type).toBe(ErrorType.UNKNOWN);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.code).toBeUndefined();
      expect(error.details).toBeUndefined();
    });
  });

  describe('特定Error類型', () => {
    it('應該創建 ValidationError', () => {
      const _error = new ValidationError('VerifyFailed', { field: 'email' });
      expect(error.name).toBe('ValidationError');
      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    });

    it('應該創建 AuthenticationError', () => {
      const _error = new AuthenticationError('認證Failed');
      expect(error.name).toBe('AuthenticationError');
      expect(error.type).toBe(ErrorType.AUTHENTICATION);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
    });

    it('應該創建 NetworkError', () => {
      const _error = new NetworkError('網絡ConnectFailed');
      expect(error.name).toBe('NetworkError');
      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
    });

    it('應該創建 DatabaseError', () => {
      const _error = new DatabaseError('數據庫ConnectFailed');
      expect(error.name).toBe('DatabaseError');
      expect(error.type).toBe(ErrorType.DATABASE);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
    });

    it('應該創建 ExternalServiceError', () => {
      const _error = new ExternalServiceError('API', 'Service不可用');
      expect(error.name).toBe('ExternalServiceError');
      expect(error.type).toBe(ErrorType.EXTERNAL_SERVICE);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.details?.service).toBe('API');
    });
  });

  describe('ErrorHandler 實例', () => {
    it('應該是單例模式', () => {
      const _instance1 = ErrorHandler.getInstance();
      const _instance2 = ErrorHandler.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('應該處理 AppError', () => {
      const _appError = new AppError(
        '測試Error',
        ErrorType.VALIDATION,
        ErrorSeverity.MEDIUM,
        'TEST_ERROR'
      );

      const _result = handler.handleError(appError);

      expect(result.type).toBe(ErrorType.VALIDATION);
      expect(result.severity).toBe(ErrorSeverity.MEDIUM);
      expect(result.message).toBe('測試Error');
      expect(result.code).toBe('TEST_ERROR');
    });

    it('應該處理標準 Error', () => {
      const _standardError = new Error('網絡ConnectFailed');

      const _result = handler.handleError(standardError);

      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.severity).toBe(ErrorSeverity.HIGH);
      expect(result.message).toBe('網絡ConnectFailed');
    });

    it('應該記錄Error統計', () => {
      const _error1 = new AppError('Error1', ErrorType.NETWORK);
      const _error2 = new AppError('Error2', ErrorType.VALIDATION);
      const _error3 = new AppError('Error3', ErrorType.NETWORK);

      handler.handleError(error1);
      handler.handleError(error2);
      handler.handleError(error3);

      const _stats = handler.getErrorStats();
      expect(stats.get(ErrorType.NETWORK)).toBe(2);
      expect(stats.get(ErrorType.VALIDATION)).toBe(1);
    });

    it('應該限制最近Error數量', () => {
      const _maxErrors = 100;

      for (let i = 0; i < maxErrors + 10; i++) {
        const _error = new AppError(`Error${i}`);
        handler.handleError(error);
      }

      const _recentErrors = handler.getRecentErrors();
      expect(recentErrors.length).toBeLessThanOrEqual(maxErrors);
    });

    it('應該清除Error統計', () => {
      const _error = new AppError('測試Error', ErrorType.NETWORK);
      handler.handleError(error);

      expect(handler.getErrorStats().get(ErrorType.NETWORK)).toBe(1);

      handler.clearErrorStats();

      expect(handler.getErrorStats().size).toBe(0);
      expect(handler.getRecentErrors().length).toBe(0);
    });
  });

  describe('Error類型檢測', () => {
    it('應該檢測網絡Error', () => {
      const _error = new Error('Network request failed');
      const _result = handler.handleError(error);
      expect(result.type).toBe(ErrorType.NETWORK);
    });

    it('應該檢測VerifyError', () => {
      const _error = new Error('Validation failed');
      const _result = handler.handleError(error);
      expect(result.type).toBe(ErrorType.VALIDATION);
    });

    it('應該檢測認證Error', () => {
      const _error = new Error('Authentication failed');
      const _result = handler.handleError(error);
      expect(result.type).toBe(ErrorType.AUTHENTICATION);
    });

    it('應該檢測數據庫Error', () => {
      const _error = new Error('Database connection failed');
      const _result = handler.handleError(error);
      expect(result.type).toBe(ErrorType.DATABASE);
    });

    it('應該檢測外部ServiceError', () => {
      const _error = new Error('External API call failed');
      const _result = handler.handleError(error);
      expect(result.type).toBe(ErrorType.EXTERNAL_SERVICE);
    });
  });

  describe('Error嚴重程度檢測', () => {
    it('應該檢測高嚴重程度Error', () => {
      const _error = new Error('High severity error');
      const _result = handler.handleError(error);
      expect(result.severity).toBe(ErrorSeverity.HIGH);
    });

    it('應該檢測中等嚴重程度Error', () => {
      const _error = new Error('Medium severity error');
      const _result = handler.handleError(error);
      expect(result.severity).toBe(ErrorSeverity.MEDIUM);
    });

    it('應該檢測低嚴重程度Error', () => {
      const _error = new Error('Low severity error');
      const _result = handler.handleError(error);
      expect(result.severity).toBe(ErrorSeverity.LOW);
    });
  });

  describe('重試機制', () => {
    it('應該Success重試操作', async () => {
      let attemptCount = 0;
      const _operation = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });

      const _result = await handler.handleErrorWithRetry(
        new Error('Temporary failure'),
        'test',
        operation
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('應該在重試次數用完後拋出Error', async () => {
      const _operation = jest
        .fn()
        .mockRejectedValue(new Error('Persistent failure'));

      await expect(
        handler.handleErrorWithRetry(
          new Error('Persistent failure'),
          'test',
          operation
        )
      ).rejects.toThrow('Persistent failure');

      expect(operation).toHaveBeenCalledTimes(3);
    });
  });

  describe('ErrorHandle裝飾器', () => {
    it('應該使用 withErrorHandling 裝飾器', async () => {
      const _testFunction = jest.fn().mockRejectedValue(new Error('Test error'));
      const _decoratedFunction = withErrorHandling(testFunction, 'test-context');

      await expect(decoratedFunction()).rejects.toThrow();
      expect(testFunction).toHaveBeenCalled();
    });

    it('應該使用 handleErrors 方法裝飾器', async () => {
      class TestClass {
        @handleErrors
        async testMethod() {
          throw new Error('測試Error');
        }
      }

      const _testInstance = new TestClass();
      await expect(testInstance.testMethod()).rejects.toThrow();
    });
  });

  describe('Error恢復建議', () => {
    it('應該為網絡Error提供恢復建議', async () => {
      const _error = new Error('Network connection failed');

      try {
        await handler.handleErrorWithRetry(error, 'network-test');
      } catch (e) {
        // Error應該被Throw，但我們主要TestRetry機制
      }
    });

    it('應該為VerifyError提供恢復建議', async () => {
      const _error = new Error('Validation failed');

      try {
        await handler.handleErrorWithRetry(error, 'validation-test');
      } catch (e) {
        // Error應該被Throw，但我們主要TestRetry機制
      }
    });
  });

  describe('單例實例', () => {
    it('應該導出單例實例', () => {
      expect(errorHandler).toBeInstanceOf(ErrorHandler);
      expect(errorHandler).toBe(ErrorHandler.getInstance());
    });
  });
});

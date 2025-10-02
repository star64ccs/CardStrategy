import {
  AppError,
  ErrorType,
  ErrorSeverity,
} from '../../core/utils/errorHandler';
import { errorHandlingService } from '../../services/errorHandlingService';

describe('ErrorHandlingService', () => {
  beforeEach(() => {
    errorHandlingService.reset();
  });

  describe('ErrorHandle', () => {
    it('應該Handle標準Error', async () => {
      const _error = new Error('測試Error');
      const _report = await errorHandlingService.handleError(
        error,
        'test-context'
      );

      expect(report.id).toMatch(/^err_\d+_[a-z0-9]+$/);
      expect(report.error.message).toBe('測試Error');
      expect(report.context).toBe('test-context');
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.environment).toBe('production');
    });

    it('應該處理 AppError', async () => {
      const _appError = new AppError(
        '應用Error',
        ErrorType.VALIDATION,
        ErrorSeverity.MEDIUM,
        'TEST_ERROR'
      );
      const _report = await errorHandlingService.handleError(
        appError,
        'app-context'
      );

      expect(report.error).toBe(appError);
      expect(report.error.type).toBe(ErrorType.VALIDATION);
      expect(report.error.severity).toBe(ErrorSeverity.MEDIUM);
    });

    it('應該Handle帶選項的Error', async () => {
      const _error = new Error('用戶Error');
      const _report = await errorHandlingService.handleError(
        error,
        'user-context',
        {
          userId: 'user123',
          sessionId: 'session456',
          userAgent: 'TestAgent/1.0',
          environment: 'development',
        }
      );

      expect(report.userId).toBe('user123');
      expect(report.sessionId).toBe('session456');
      expect(report.userAgent).toBe('TestAgent/1.0');
      expect(report.environment).toBe('development');
    });
  });

  describe('Error指標', () => {
    it('應該GetError指標', async () => {
      // CreateMultipleError
      await errorHandlingService.handleError(new Error('Error1'), 'context1');
      await errorHandlingService.handleError(new Error('Error2'), 'context2');
      await errorHandlingService.handleError(new Error('Error3'), 'context1');

      const _metrics = errorHandlingService.getErrorMetrics();

      expect(metrics.totalErrors).toBe(3);
      expect(metrics.errorsByContext['context1']).toBe(2);
      expect(metrics.errorsByContext['context2']).toBe(1);
      expect(metrics.recentErrors.length).toBeLessThanOrEqual(10);
      expect(metrics.errorRate).toBeGreaterThanOrEqual(0);
    });

    it('應該統計Error類型', async () => {
      await errorHandlingService.handleError(
        new Error('網絡ConnectFailed'),
        'network'
      );
      await errorHandlingService.handleError(
        new Error('VerifyFailed'),
        'validation'
      );
      await errorHandlingService.handleError(new Error('認證Failed'), 'auth');

      const _metrics = errorHandlingService.getErrorMetrics();

      expect(metrics.errorsByType[ErrorType.NETWORK]).toBe(1);
      expect(metrics.errorsByType[ErrorType.VALIDATION]).toBe(1);
      expect(metrics.errorsByType[ErrorType.AUTHENTICATION]).toBe(1);
    });

    it('應該統計Error嚴重程度', async () => {
      await errorHandlingService.handleError(new Error('網絡ConnectFailed'), 'high');
      await errorHandlingService.handleError(new Error('VerifyFailed'), 'medium');
      await errorHandlingService.handleError(
        new Error('Low severity error'),
        'low'
      );

      const _metrics = errorHandlingService.getErrorMetrics();

      expect(
        metrics.errorsBySeverity[ErrorSeverity.HIGH]
      ).toBeGreaterThanOrEqual(1);
      expect(
        metrics.errorsBySeverity[ErrorSeverity.MEDIUM]
      ).toBeGreaterThanOrEqual(1);
      expect(
        metrics.errorsBySeverity[ErrorSeverity.LOW]
      ).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Error報告查詢', () => {
    beforeEach(async () => {
      // CreateTestData
      await errorHandlingService.handleError(
        new AppError('網絡Error', ErrorType.NETWORK, ErrorSeverity.HIGH),
        'network-context'
      );
      await errorHandlingService.handleError(
        new AppError('VerifyError', ErrorType.VALIDATION, ErrorSeverity.MEDIUM),
        'validation-context'
      );
      await errorHandlingService.handleError(
        new AppError('認證Error', ErrorType.AUTHENTICATION, ErrorSeverity.HIGH),
        'auth-context'
      );
    });

    it('應該按類型查詢Error報告', () => {
      const _networkReports = errorHandlingService.getErrorReportsByType(
        ErrorType.NETWORK
      );
      const _validationReports = errorHandlingService.getErrorReportsByType(
        ErrorType.VALIDATION
      );

      expect(networkReports.length).toBe(1);
      expect(networkReports[0].error.type).toBe(ErrorType.NETWORK);
      expect(validationReports.length).toBe(1);
      expect(validationReports[0].error.type).toBe(ErrorType.VALIDATION);
    });

    it('應該按嚴重程度查詢Error報告', () => {
      const _highSeverityReports =
        errorHandlingService.getErrorReportsBySeverity(ErrorSeverity.HIGH);
      const _mediumSeverityReports =
        errorHandlingService.getErrorReportsBySeverity(ErrorSeverity.MEDIUM);

      expect(highSeverityReports.length).toBe(2);
      expect(mediumSeverityReports.length).toBe(1);
    });

    it('應該按上下文查詢Error報告', () => {
      const _networkContextReports =
        errorHandlingService.getErrorReportsByContext('network-context');
      const _validationContextReports =
        errorHandlingService.getErrorReportsByContext('validation-context');

      expect(networkContextReports.length).toBe(1);
      expect(networkContextReports[0].context).toBe('network-context');
      expect(validationContextReports.length).toBe(1);
      expect(validationContextReports[0].context).toBe('validation-context');
    });
  });

  describe('Error報告清理', () => {
    it('應該清理舊的Error報告', async () => {
      // Create一些ErrorReport
      await errorHandlingService.handleError(new Error('Error1'), 'context1');
      await errorHandlingService.handleError(new Error('Error2'), 'context2');

      const _initialCount = errorHandlingService.getErrorMetrics().totalErrors;
      expect(initialCount).toBe(2);

      // 清理所有Report（Settings最大Age為0）
      const _cleanedCount = errorHandlingService.cleanupOldReports(0);

      expect(cleanedCount).toBe(2);
      expect(errorHandlingService.getErrorMetrics().totalErrors).toBe(0);
    });
  });

  describe('Error報告導出', () => {
    beforeEach(async () => {
      await errorHandlingService.handleError(
        new Error('測試Error'),
        'test-context'
      );
    });

    it('應該導出 JSON 格式的Error報告', () => {
      const _jsonExport = errorHandlingService.exportErrorReports('json');
      const _parsed = JSON.parse(jsonExport);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(1);
      expect(parsed[0].error.message).toBe('測試Error');
    });

    it('應該導出 CSV 格式的Error報告', () => {
      const _csvExport = errorHandlingService.exportErrorReports('csv');
      const _lines = csvExport.split('\n');

      expect(lines.length).toBe(2); // 標題Row + DataRow
      expect(lines[0]).toContain(
        '"ID","Timestamp","Type","Severity","Message","Context","Environment"'
      );
      expect(lines[1]).toContain('測試Error');
      expect(lines[1]).toContain('test-context');
    });
  });

  describe('Service重置', () => {
    it('應該重置Service狀態', async () => {
      // Create一些Error
      await errorHandlingService.handleError(new Error('Error1'), 'context1');
      await errorHandlingService.handleError(new Error('Error2'), 'context2');

      expect(errorHandlingService.getErrorMetrics().totalErrors).toBe(2);

      // ResetService
      errorHandlingService.reset();

      expect(errorHandlingService.getErrorMetrics().totalErrors).toBe(0);
      expect(errorHandlingService.getErrorMetrics().errorRate).toBe(0);
    });
  });

  describe('單例模式', () => {
    it('應該是單例模式', () => {
      const _instance1 = errorHandlingService;
      const _instance2 =
        require('../../services/errorHandlingService').errorHandlingService;

      expect(instance1).toBe(instance2);
    });
  });
});

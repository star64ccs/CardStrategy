import { logger } from './logger';

/**
 * 統一日誌工具類
 * 提供標準化的日誌記錄方法
 */
export class LoggingUtils {
  /**
   * 記錄 API 調用成功
   * @param operation 操作名稱
   * @param params 參數（可選）
   * @param result 結果（可選）
   * @param duration 執行時間（毫秒）
   */
  static logApiCall(
    operation: string,
    params?: any,
    result?: any,
    duration?: number
  ): void {
    const logData: any = {};

    if (params) {
      logData.params = this.sanitizeForLogging(params);
    }

    if (result) {
      logData.result = this.sanitizeForLogging(result);
    }

    if (duration !== undefined) {
      logData.duration = `${duration}ms`;
    }

    logger.info(`✅ ${operation} 成功`, logData);
  }

  /**
   * 記錄 API 調用失敗
   * @param operation 操作名稱
   * @param error 錯誤對象
   * @param params 參數（可選）
   * @param duration 執行時間（毫秒）
   */
  static logApiError(
    operation: string,
    error: any,
    params?: any,
    duration?: number
  ): void {
    const logData: any = {
      error: error.message || String(error),
      stack: error.stack,
    };

    if (params) {
      logData.params = this.sanitizeForLogging(params);
    }

    if (duration !== undefined) {
      logData.duration = `${duration}ms`;
    }

    logger.error(`❌ ${operation} 失敗`, logData);
  }

  /**
   * 記錄驗證錯誤
   * @param operation 操作名稱
   * @param errors 驗證錯誤
   * @param data 驗證的數據（可選）
   */
  static logValidationError(operation: string, errors: any, data?: any): void {
    const logData: any = {
      errors: this.sanitizeForLogging(errors),
    };

    if (data) {
      logData.data = this.sanitizeForLogging(data);
    }

    logger.warn(`⚠️ ${operation} 驗證失敗`, logData);
  }

  /**
   * 記錄性能信息
   * @param operation 操作名稱
   * @param duration 執行時間（毫秒）
   * @param additionalInfo 額外信息（可選）
   */
  static logPerformance(
    operation: string,
    duration: number,
    additionalInfo?: Record<string, any>
  ): void {
    const logData: any = {
      duration: `${duration}ms`,
    };

    if (additionalInfo) {
      Object.assign(logData, additionalInfo);
    }

    logger.debug(`⏱️ ${operation} 執行時間`, logData);
  }

  /**
   * 記錄緩存操作
   * @param operation 操作名稱
   * @param action 緩存動作（hit/miss/set）
   * @param key 緩存鍵（可選）
   */
  static logCache(
    operation: string,
    action: 'hit' | 'miss' | 'set' | 'clear',
    key?: string
  ): void {
    const icons = {
      hit: '📦',
      miss: '❌',
      set: '💾',
      clear: '🗑️',
    };

    const logData: any = {
      action,
    };

    if (key) {
      logData.key = key;
    }

    logger.debug(`${icons[action]} ${operation} 緩存${action}`, logData);
  }

  /**
   * 記錄數據庫操作
   * @param operation 操作名稱
   * @param table 表名
   * @param action 操作類型（select/insert/update/delete）
   * @param duration 執行時間（毫秒）
   * @param rowCount 影響行數（可選）
   */
  static logDatabase(
    operation: string,
    table: string,
    action: 'select' | 'insert' | 'update' | 'delete',
    duration: number,
    rowCount?: number
  ): void {
    const logData: any = {
      table,
      action,
      duration: `${duration}ms`,
    };

    if (rowCount !== undefined) {
      logData.rowCount = rowCount;
    }

    logger.debug(`🗄️ ${operation} 數據庫操作`, logData);
  }

  /**
   * 記錄文件操作
   * @param operation 操作名稱
   * @param action 操作類型（upload/download/delete/process）
   * @param filename 文件名
   * @param size 文件大小（字節）
   * @param duration 執行時間（毫秒）
   */
  static logFileOperation(
    operation: string,
    action: 'upload' | 'download' | 'delete' | 'process',
    filename: string,
    size?: number,
    duration?: number
  ): void {
    const icons = {
      upload: '📤',
      download: '📥',
      delete: '🗑️',
      process: '⚙️',
    };

    const logData: any = {
      action,
      filename,
    };

    if (size !== undefined) {
      logData.size = `${Math.round(size / 1024)}KB`;
    }

    if (duration !== undefined) {
      logData.duration = `${duration}ms`;
    }

    logger.info(`${icons[action]} ${operation} 文件操作`, logData);
  }

  /**
   * 記錄用戶操作
   * @param operation 操作名稱
   * @param userId 用戶 ID
   * @param action 用戶動作
   * @param details 詳細信息（可選）
   */
  static logUserAction(
    operation: string,
    userId: string,
    action: string,
    details?: any
  ): void {
    const logData: any = {
      userId,
      action,
    };

    if (details) {
      logData.details = this.sanitizeForLogging(details);
    }

    logger.info(`👤 ${operation} 用戶操作`, logData);
  }

  /**
   * 記錄系統事件
   * @param event 事件名稱
   * @param level 事件級別（info/warn/error）
   * @param details 詳細信息（可選）
   */
  static logSystemEvent(
    event: string,
    level: 'info' | 'warn' | 'error' = 'info',
    details?: any
  ): void {
    const logData: any = {};

    if (details) {
      logData.details = this.sanitizeForLogging(details);
    }

    switch (level) {
      case 'info':
        logger.info(`🔧 ${event} 系統事件`, logData);
        break;
      case 'warn':
        logger.warn(`⚠️ ${event} 系統警告`, logData);
        break;
      case 'error':
        logger.error(`❌ ${event} 系統錯誤`, logData);
        break;
    }
  }

  /**
   * 記錄安全事件
   * @param event 安全事件名稱
   * @param severity 嚴重程度（low/medium/high/critical）
   * @param details 詳細信息（可選）
   */
  static logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details?: any
  ): void {
    const icons = {
      low: '🔒',
      medium: '🛡️',
      high: '🚨',
      critical: '🚨🚨',
    };

    const logData: any = {
      severity,
    };

    if (details) {
      logData.details = this.sanitizeForLogging(details);
    }

    logger.warn(`${icons[severity]} ${event} 安全事件`, logData);
  }

  /**
   * 記錄業務邏輯
   * @param operation 操作名稱
   * @param businessLogic 業務邏輯描述
   * @param result 結果（可選）
   * @param duration 執行時間（毫秒）
   */
  static logBusinessLogic(
    operation: string,
    businessLogic: string,
    result?: any,
    duration?: number
  ): void {
    const logData: any = {
      businessLogic,
    };

    if (result) {
      logData.result = this.sanitizeForLogging(result);
    }

    if (duration !== undefined) {
      logData.duration = `${duration}ms`;
    }

    logger.info(`💼 ${operation} 業務邏輯`, logData);
  }

  /**
   * 記錄外部服務調用
   * @param service 服務名稱
   * @param operation 操作名稱
   * @param success 是否成功
   * @param duration 執行時間（毫秒）
   * @param details 詳細信息（可選）
   */
  static logExternalService(
    service: string,
    operation: string,
    success: boolean,
    duration: number,
    details?: any
  ): void {
    const icon = success ? '✅' : '❌';
    const status = success ? '成功' : '失敗';

    const logData: any = {
      service,
      success,
      duration: `${duration}ms`,
    };

    if (details) {
      logData.details = this.sanitizeForLogging(details);
    }

    logger.info(`${icon} ${service} ${operation} ${status}`, logData);
  }

  /**
   * 記錄批量操作
   * @param operation 操作名稱
   * @param totalCount 總數量
   * @param successCount 成功數量
   * @param failedCount 失敗數量
   * @param duration 執行時間（毫秒）
   */
  static logBatchOperation(
    operation: string,
    totalCount: number,
    successCount: number,
    failedCount: number,
    duration: number
  ): void {
    const successRate =
      totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(2) : '0';

    const logData = {
      totalCount,
      successCount,
      failedCount,
      successRate: `${successRate}%`,
      duration: `${duration}ms`,
    };

    if (failedCount === 0) {
      logger.info(`✅ ${operation} 批量操作完成`, logData);
    } else {
      logger.warn(`⚠️ ${operation} 批量操作部分失敗`, logData);
    }
  }

  /**
   * 記錄內存使用情況
   * @param operation 操作名稱
   * @param memoryUsage 內存使用量（字節）
   * @param threshold 閾值（字節）
   */
  static logMemoryUsage(
    operation: string,
    memoryUsage: number,
    threshold?: number
  ): void {
    const usageMB = Math.round(memoryUsage / 1024 / 1024);

    const logData: any = {
      memoryUsage: `${usageMB}MB`,
    };

    if (threshold) {
      const thresholdMB = Math.round(threshold / 1024 / 1024);
      logData.threshold = `${thresholdMB}MB`;

      if (memoryUsage > threshold) {
        logger.warn(`⚠️ ${operation} 內存使用過高`, logData);
        return;
      }
    }

    logger.debug(`🧠 ${operation} 內存使用`, logData);
  }

  /**
   * 清理敏感信息用於日誌記錄
   * @param data 要清理的數據
   * @returns 清理後的數據
   */
  private static sanitizeForLogging(data: any): any {
    if (!data) return data;

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'apiKey',
      'privateKey',
      'accessToken',
      'refreshToken',
      'sessionId',
      'creditCard',
      'ssn',
      'phone',
    ];

    if (typeof data === 'object') {
      const sanitized = Array.isArray(data) ? [...data] : { ...data };

      for (const field of sensitiveFields) {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      }

      // 遞歸處理嵌套對象
      for (const key in sanitized) {
        if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
          sanitized[key] = this.sanitizeForLogging(sanitized[key]);
        }
      }

      return sanitized;
    }

    return data;
  }
}

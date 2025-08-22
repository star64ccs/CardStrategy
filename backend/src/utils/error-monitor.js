const { logger } = require('./unified-logger');

// 錯誤統計
class ErrorMonitor {
  constructor() {
    this.errors = {
      total: 0,
      byType: {},
      byStatusCode: {},
      recent: [],
    };
    this.maxRecentErrors = 100;
    this.startTime = Date.now();
  }

  // 記錄錯誤
  recordError(error, req = null) {
    this.errors.total++;

    // 按類型統計
// eslint-disable-next-line no-unused-vars
    const errorType = error.name || 'Unknown';
    this.errors.byType[errorType] = (this.errors.byType[errorType] || 0) + 1;

    // 按狀態碼統計
// eslint-disable-next-line no-unused-vars
    const statusCode = error.statusCode || 500;
    this.errors.byStatusCode[statusCode] =
      (this.errors.byStatusCode[statusCode] || 0) + 1;

    // 記錄最近錯誤
// eslint-disable-next-line no-unused-vars
    const errorRecord = {
      type: errorType,
      message: error.message,
      statusCode,
      timestamp: new Date().toISOString(),
      url: req?.url,
      method: req?.method,
      ip: req?.ip,
    };

    this.errors.recent.unshift(errorRecord);

    // 保持最近錯誤數量限制
    if (this.errors.recent.length > this.maxRecentErrors) {
      this.errors.recent.pop();
    }
  }

  // 獲取錯誤統計
  getErrorStats() {
    const uptime = Date.now() - this.startTime;
// eslint-disable-next-line no-unused-vars
    const errorRate = this.errors.total / (uptime / 1000 / 60); // 每分鐘錯誤率

    return {
      total: this.errors.total,
      errorRate: Math.round(errorRate * 100) / 100,
      uptime: Math.floor(uptime / 1000),
      byType: this.errors.byType,
      byStatusCode: this.errors.byStatusCode,
      recent: this.errors.recent.slice(0, 10), // 最近10個錯誤
    };
  }

  // 重置統計
  resetStats() {
    this.errors = {
      total: 0,
      byType: {},
      byStatusCode: {},
      recent: [],
    };
    this.startTime = Date.now();
    logger.info('Error statistics reset');
  }

  // 檢查錯誤閾值
  checkErrorThreshold(threshold = 10) {
// eslint-disable-next-line no-unused-vars
    const recentErrors = this.errors.recent.filter(
      (error) => Date.now() - new Date(error.timestamp).getTime() < 60000 // 最近1分鐘
    );

    if (recentErrors.length > threshold) {
      logger.error('Error threshold exceeded', {
        threshold,
        actual: recentErrors.length,
        errors: recentErrors,
      });
      return true;
    }

    return false;
  }
}

// 創建全局錯誤監控實例
// eslint-disable-next-line no-unused-vars
const errorMonitor = new ErrorMonitor();

// 錯誤監控中間件
// eslint-disable-next-line no-unused-vars
const errorMonitoringMiddleware = (err, req, res, next) => {
  errorMonitor.recordError(err, req);
  next(err);
};

// 錯誤警報系統
class ErrorAlertSystem {
  constructor() {
    this.alerts = [];
    this.alertThresholds = {
      errorRate: 5, // 每分鐘5個錯誤
      consecutiveErrors: 3, // 連續3個錯誤
      criticalErrors: 1, // 1個嚴重錯誤
    };
  }

  // 檢查是否需要發送警報
  checkAlerts(errorStats) {
    const alerts = [];

    // 檢查錯誤率
    if (errorStats.errorRate > this.alertThresholds.errorRate) {
      alerts.push({
        type: 'HIGH_ERROR_RATE',
        message: `High error rate detected: ${errorStats.errorRate} errors/minute`,
        severity: 'warning',
        timestamp: new Date().toISOString(),
      });
    }

    // 檢查連續錯誤
// eslint-disable-next-line no-unused-vars
    const recentErrors = errorStats.recent.slice(
      0,
      this.alertThresholds.consecutiveErrors
    );
    if (recentErrors.length >= this.alertThresholds.consecutiveErrors) {
      const allSameType = recentErrors.every(
        (error) => error.type === recentErrors[0].type
      );
      if (allSameType) {
        alerts.push({
          type: 'CONSECUTIVE_ERRORS',
          message: `Consecutive ${recentErrors[0].type} errors detected`,
          severity: 'error',
          timestamp: new Date().toISOString(),
        });
      }
    }

    // 檢查嚴重錯誤
    const criticalErrors = recentErrors.filter(
      (error) => error.statusCode >= 500
    );
    if (criticalErrors.length >= this.alertThresholds.criticalErrors) {
      alerts.push({
        type: 'CRITICAL_ERRORS',
        message: `Critical errors detected: ${criticalErrors.length} server errors`,
        severity: 'critical',
        timestamp: new Date().toISOString(),
      });
    }

    // 記錄警報
    alerts.forEach((alert) => {
      logger.warn('Error Alert', alert);
      this.alerts.push(alert);
    });

    return alerts;
  }

  // 獲取警報歷史
  getAlertHistory() {
    return this.alerts.slice(-50); // 最近50個警報
  }

  // 清除舊警報
  clearOldAlerts() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.alerts = this.alerts.filter(
      (alert) => new Date(alert.timestamp).getTime() > oneHourAgo
    );
  }
}

// 創建全局警報系統實例
// eslint-disable-next-line no-unused-vars
const errorAlertSystem = new ErrorAlertSystem();

module.exports = {
  errorMonitor,
  errorMonitoringMiddleware,
  errorAlertSystem,
};

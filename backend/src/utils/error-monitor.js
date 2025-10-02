const { logger } = require('./unified-logger');

// ErrorStatistics
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

  // RecordError
  recordError(error, req = null) {
    this.errors.total++;

    // 按Class型Statistics
// eslint-disable-next-line no-unused-vars
    const errorType = error.name || 'Unknown';
    this.errors.byType[errorType] = (this.errors.byType[errorType] || 0) + 1;

    // 按Status碼Statistics
// eslint-disable-next-line no-unused-vars
    const statusCode = error.statusCode || 500;
    this.errors.byStatusCode[statusCode] =
      (this.errors.byStatusCode[statusCode] || 0) + 1;

    // Record最近Error
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

    // 保持最近Error數量Limit
    if (this.errors.recent.length > this.maxRecentErrors) {
      this.errors.recent.pop();
    }
  }

  // GetErrorStatistics
  getErrorStats() {
    const uptime = Date.now() - this.startTime;
// eslint-disable-next-line no-unused-vars
    const errorRate = this.errors.total / (uptime / 1000 / 60); // 每MinuteError率

    return {
      total: this.errors.total,
      errorRate: Math.round(errorRate * 100) / 100,
      uptime: Math.floor(uptime / 1000),
      byType: this.errors.byType,
      byStatusCode: this.errors.byStatusCode,
      recent: this.errors.recent.slice(0, 10), // 最近10個Error
    };
  }

  // ResetStatistics
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

  // CheckError閾Value
  checkErrorThreshold(threshold = 10) {
// eslint-disable-next-line no-unused-vars
    const recentErrors = this.errors.recent.filter(
      (error) => Date.now() - new Date(error.timestamp).getTime() < 60000 // 最近1Minute
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

// CreateGlobalErrorMonitorInstance
// eslint-disable-next-line no-unused-vars
const errorMonitor = new ErrorMonitor();

// ErrorMonitor中間件
// eslint-disable-next-line no-unused-vars
const errorMonitoringMiddleware = (err, req, res, next) => { // eslint-disable-next-line no-unused-vars
  errorMonitor.recordError(err, req);
  next(err);
};

// ErrorAlert系統
class ErrorAlertSystem {
  constructor() {
    this.alerts = [];
    this.alertThresholds = {
      errorRate: 5, // 每Minute5個Error
      consecutiveErrors: 3, // 連續3個Error
      criticalErrors: 1, // 1個嚴重Error
    };
  }

  // CheckYesNo需要SendAlert
  checkAlerts(errorStats) {
    const alerts = [];

    // CheckError率
    if (errorStats.errorRate > this.alertThresholds.errorRate) {
      alerts.push({
        type: 'HIGH_ERROR_RATE',
        message: `High error rate detected: ${errorStats.errorRate} errors/minute`,
        severity: 'warning',
        timestamp: new Date().toISOString(),
      });
    }

    // Check連續Error
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

    // Check嚴重Error
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

    // RecordAlert
    alerts.forEach((alert) => {
      logger.warn('Error Alert', alert);
      this.alerts.push(alert);
    });

    return alerts;
  }

  // GetAlert歷史
  getAlertHistory() {
    return this.alerts.slice(-50); // 最近50個Alert
  }

  // Clear舊Alert
  clearOldAlerts() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.alerts = this.alerts.filter(
      (alert) => new Date(alert.timestamp).getTime() > oneHourAgo
    );
  }
}

// CreateGlobalAlert系統Instance
// eslint-disable-next-line no-unused-vars
const errorAlertSystem = new ErrorAlertSystem();

module.exports = {
  errorMonitor,
  errorMonitoringMiddleware,
  errorAlertSystem,
};

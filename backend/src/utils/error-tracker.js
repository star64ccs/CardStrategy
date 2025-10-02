// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');

class ErrorTracker {
  constructor() {
    this.errors = [];
    this.errorStats = {
      total: 0,
      byType: {},
      byEndpoint: {},
      byHour: {},
      recent: [],
    };

    this.maxErrors = 1000;
    this.alertThreshold = 10; // 每HourError閾Value
    this.alertCallbacks = [];

    // CreateErrorLogDirectory
    this.logDir = path.join(__dirname, '..', '..', 'logs', 'errors');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  // RecordError
  trackError(error, req = null, additionalInfo = {}) {
// eslint-disable-next-line no-unused-vars
    const errorRecord = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      type: error.name || 'UnknownError',
      message: error.message,
      stack: error.stack,
      url: req?.url || 'unknown',
      method: req?.method || 'unknown',
      userAgent: req?.headers?.['user-agent'] || 'unknown',
      ip: req?.ip || req?.connection?.remoteAddress || 'unknown',
      userId: req?.user?.id || 'anonymous',
      ...additionalInfo,
    };

    // Add到ErrorList
    this.errors.push(errorRecord);

    // LimitError數量
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // UpdateStatisticsInformation
    this.updateErrorStats(errorRecord);

    // WriteErrorLog
    this.writeErrorLog(errorRecord);

    // CheckYesNo需要SendAlert
    this.checkAlertThreshold(errorRecord);

    return errorRecord;
  }

  // 生成ErrorID
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // UpdateErrorStatistics
  updateErrorStats(errorRecord) {
    this.errorStats.total++;

    // 按Class型Statistics
// eslint-disable-next-line no-unused-vars
    const type = errorRecord.type;
    this.errorStats.byType[type] = (this.errorStats.byType[type] || 0) + 1;

    // 按端點Statistics
// eslint-disable-next-line no-unused-vars
    const endpoint = errorRecord.url;
    this.errorStats.byEndpoint[endpoint] =
      (this.errorStats.byEndpoint[endpoint] || 0) + 1;

    // 按HourStatistics
    const hour = new Date(errorRecord.timestamp).getHours();
    this.errorStats.byHour[hour] = (this.errorStats.byHour[hour] || 0) + 1;

    // 最近Error
    this.errorStats.recent.push(errorRecord);
    if (this.errorStats.recent.length > 50) {
      this.errorStats.recent = this.errorStats.recent.slice(-50);
    }
  }

  // WriteErrorLog
  writeErrorLog(errorRecord) {
    const date = new Date().toISOString().split('T')[0];
// eslint-disable-next-line no-unused-vars
    const logFile = path.join(this.logDir, `errors-${date}.log`);

// eslint-disable-next-line no-unused-vars
    const logEntry = {
      timestamp: errorRecord.timestamp,
      level: 'ERROR',
      type: errorRecord.type,
      message: errorRecord.message,
      url: errorRecord.url,
      method: errorRecord.method,
      userId: errorRecord.userId,
      ip: errorRecord.ip,
    };

// eslint-disable-next-line no-unused-vars
    const logLine = JSON.stringify(logEntry) + '\n';

    try {
      fs.appendFileSync(logFile, logLine);
    } catch (err) {
// eslint-disable-next-line no-console
      console.error('無法寫入Error日誌:', err.message);
    }
  }

  // CheckAlert閾Value
  checkAlertThreshold(errorRecord) {
    const currentHour = new Date().getHours();
    const hourlyErrors = this.errorStats.byHour[currentHour] || 0;

    if (hourlyErrors >= this.alertThreshold) {
      this.sendAlert({
        type: 'ERROR_THRESHOLD_EXCEEDED',
        message: `每小時Error數量超過閾值: ${hourlyErrors}/${this.alertThreshold}`,
        hour: currentHour,
        errorCount: hourlyErrors,
        recentErrors: this.errorStats.recent.slice(-10),
      });
    }
  }

  // SendAlert
  sendAlert(alertData) {
    this.alertCallbacks.forEach((callback) => {
      try {
        callback(alertData);
      } catch (err) {
// eslint-disable-next-line no-console
        console.error('警報回調執行Failed:', err.message);
      }
    });
  }

  // RegisterAlertCallback
  onAlert(callback) {
    this.alertCallbacks.push(callback);
  }

  // GetErrorStatistics
  getErrorStats() {
    return {
      ...this.errorStats,
      timestamp: new Date().toISOString(),
    };
  }

  // GetSpecificTime範圍的Error
  getErrorsByTimeRange(startTime, endTime) {
    return this.errors.filter((error) => {
// eslint-disable-next-line no-unused-vars
      const errorTime = new Date(error.timestamp);
      return errorTime >= startTime && errorTime <= endTime;
    });
  }

  // GetSpecificClass型的Error
  getErrorsByType(type) {
    return this.errors.filter((error) => error.type === type);
  }

  // GetSpecific端點的Error
  getErrorsByEndpoint(endpoint) {
    return this.errors.filter((error) => error.url === endpoint);
  }

  // GetError趨勢
  getErrorTrends(hours = 24) {
    const trends = [];
// eslint-disable-next-line no-unused-vars
    const now = new Date();

    for (let i = hours - 1; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000).getHours();
      trends.push({
        hour,
        count: this.errorStats.byHour[hour] || 0,
      });
    }

    return trends;
  }

  // 清理舊Error
  cleanupOldErrors(daysToKeep = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    this.errors = this.errors.filter(
      (error) => new Date(error.timestamp) > cutoffDate
    );

// eslint-disable-next-line no-console
    console.log(`🧹 已清理 ${daysToKeep} 天前的Error記錄`);
  }

  // ExportErrorReport
  exportErrorReport() {
    const report = {
      summary: {
        totalErrors: this.errorStats.total,
        uniqueTypes: Object.keys(this.errorStats.byType).length,
        uniqueEndpoints: Object.keys(this.errorStats.byEndpoint).length,
        timeRange: {
          start: this.errors[0]?.timestamp,
          end: this.errors[this.errors.length - 1]?.timestamp,
        },
      },
      stats: this.errorStats,
      trends: this.getErrorTrends(),
      recentErrors: this.errorStats.recent,
    };

    const reportDir = path.join(__dirname, '..', '..', 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const filename = `error-report-${Date.now()}.json`;
    const filepath = path.join(reportDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
// eslint-disable-next-line no-console
    console.log(`📊 Error報告已導出到: ${filepath}`);

    return filepath;
  }

  // ResetErrorTrace器
  reset() {
    this.errors = [];
    this.errorStats = {
      total: 0,
      byType: {},
      byEndpoint: {},
      byHour: {},
      recent: [],
    };

// eslint-disable-next-line no-console
    console.log('🔄 Error追蹤器已重置');
  }

  // Get健康Status
  getHealthStatus() {
    const currentHour = new Date().getHours();
    const hourlyErrors = this.errorStats.byHour[currentHour] || 0;

    const issues = [];

    if (hourlyErrors > this.alertThreshold) {
      issues.push(`當前小時Error數量過多: ${hourlyErrors}`);
    }

    if (this.errorStats.total > 1000) {
      issues.push(`總Error數量過多: ${this.errorStats.total}`);
    }

    return {
      status: issues.length === 0 ? 'healthy' : 'warning',
      issues,
      stats: this.getErrorStats(),
    };
  }
}

// Create單例Instance
// eslint-disable-next-line no-unused-vars
const errorTracker = new ErrorTracker();

module.exports = errorTracker;

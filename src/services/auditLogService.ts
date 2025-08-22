import { apiService } from './apiService';
import { logger } from '../utils/logger';
import { storage } from '../utils/storage';
import { notificationService } from './notificationService';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';
import {
  AuditEvent,
  AuditEventType,
  AuditSeverity,
  AuditEventStatus,
  OperationResult,
  AuditLogConfig,
  AuditLogQuery,
  AuditLogStatistics,
  AuditLogReport,
  AuditLogAlert,
  AuditLogExportOptions,
  AuditLogCleanupOptions,
  AuditLogSearchResult,
  AuditLogMonitor,
} from '../types/audit';

// 審計日誌服務類
class AuditLogService {
  private config: AuditLogConfig;
  private isInitialized: boolean = false;
  private eventQueue: AuditEvent[] = [];
  private processingQueue: boolean = false;
  private batchSize: number = 50;
  private flushInterval: number = 5000; // 5秒
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    this.config = this.getDefaultConfig();
  }

  /**
   * 初始化審計日誌服務
   */
  async initialize(): Promise<void> {
    try {
      logger.info('初始化審計日誌服務');

      // 加載配置
      await this.loadConfiguration();

      // 啟動批量處理
      this.startBatchProcessing();

      this.isInitialized = true;
      logger.info('審計日誌服務初始化完成');
    } catch (error) {
      logger.error('初始化審計日誌服務失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取默認配置
   */
  private getDefaultConfig(): AuditLogConfig {
    return {
      enabled: true,
      logLevel: 'medium',
      retentionDays: 365,
      maxLogSize: 1000, // 1GB
      compressionEnabled: true,
      encryptionEnabled: false,
      excludeEvents: [],
      includeOnlyEvents: [],
      alertOnCritical: true,
      alertOnHigh: true,
      notificationChannels: ['email', 'push'],
      autoExportEnabled: false,
      exportFormat: 'json',
      exportSchedule: '0 0 * * 0', // 每週日午夜
    };
  }

  /**
   * 加載配置
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const config = await storage.get<AuditLogConfig>('auditLogConfig');
      if (config) {
        this.config = { ...this.config, ...config };
      }
    } catch (error) {
      logger.warn('無法加載審計日誌配置，使用默認配置:', error);
    }
  }

  /**
   * 記錄審計事件
   */
  async logEvent(eventData: Partial<AuditEvent>): Promise<string> {
    if (!this.config.enabled) {
      return '';
    }

    try {
      // 檢查日誌級別
      if (!this.shouldLogEvent(eventData.severity || 'medium')) {
        return '';
      }

      // 創建審計事件
      const event: AuditEvent = {
        id: this.generateEventId(),
        eventType: eventData.eventType || 'unknown',
        severity: eventData.severity || 'medium',
        status: eventData.status || 'success',
        result: eventData.result || 'success',
        title: eventData.title || '審計事件',
        description: eventData.description || '系統審計事件',
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...eventData,
      };

      // 添加到隊列
      this.eventQueue.push(event);

      // 檢查是否需要立即處理
      if (this.eventQueue.length >= this.batchSize) {
        await this.processEventQueue();
      }

      // 檢查是否需要觸發警報
      await this.checkAlerts(event);

      logger.debug('審計事件已記錄:', event.id);
      return event.id;
    } catch (error) {
      logger.error('記錄審計事件失敗:', error);
      throw error;
    }
  }

  /**
   * 檢查是否應該記錄事件
   */
  private shouldLogEvent(severity: AuditSeverity): boolean {
    const severityLevels: Record<AuditSeverity, number> = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };

    const configLevel = severityLevels[this.config.logLevel];
    const eventLevel = severityLevels[severity];

    return eventLevel >= configLevel;
  }

  /**
   * 啟動批量處理
   */
  private startBatchProcessing(): void {
    this.flushTimer = setInterval(async () => {
      if (this.eventQueue.length > 0 && !this.processingQueue) {
        await this.processEventQueue();
      }
    }, this.flushInterval);
  }

  /**
   * 處理事件隊列
   */
  private async processEventQueue(): Promise<void> {
    if (this.processingQueue || this.eventQueue.length === 0) {
      return;
    }

    this.processingQueue = true;

    try {
      const events = this.eventQueue.splice(0, this.batchSize);

      // 批量保存事件
      await this.saveEvents(events);

      logger.debug(`批量處理了 ${events.length} 個審計事件`);
    } catch (error) {
      logger.error('處理事件隊列失敗:', error);
      // 將事件重新放回隊列
      this.eventQueue.unshift(...this.eventQueue.splice(0, this.batchSize));
    } finally {
      this.processingQueue = false;
    }
  }

  /**
   * 保存事件
   */
  private async saveEvents(events: AuditEvent[]): Promise<void> {
    try {
      // 保存到本地存儲
      const existingEvents = await this.getEvents();
      existingEvents.push(...events);

      // 限制本地存儲大小
      if (existingEvents.length > 10000) {
        existingEvents.splice(0, existingEvents.length - 10000);
      }

      await storage.set('auditEvents', existingEvents);

      // 發送到服務器
      await this.sendEventsToServer(events);
    } catch (error) {
      logger.error('保存審計事件失敗:', error);
      throw error;
    }
  }

  /**
   * 發送事件到服務器
   */
  private async sendEventsToServer(events: AuditEvent[]): Promise<void> {
    try {
      await apiService.post('/audit/events/batch', { events });
    } catch (error) {
      logger.error('發送審計事件到服務器失敗:', error);
      // 不拋出錯誤，避免影響本地存儲
    }
  }

  /**
   * 檢查警報
   */
  private async checkAlerts(event: AuditEvent): Promise<void> {
    try {
      // 檢查嚴重性警報
      if (event.severity === 'critical' && this.config.alertOnCritical) {
        await this.triggerAlert(event, 'critical');
      } else if (event.severity === 'high' && this.config.alertOnHigh) {
        await this.triggerAlert(event, 'high');
      }

      // 檢查模式警報
      await this.checkPatternAlerts(event);
    } catch (error) {
      logger.error('檢查警報失敗:', error);
    }
  }

  /**
   * 觸發警報
   */
  private async triggerAlert(
    event: AuditEvent,
    severity: AuditSeverity
  ): Promise<void> {
    try {
      const alert: AuditLogAlert = {
        id: this.generateAlertId(),
        title: `審計警報: ${event.title}`,
        description: `檢測到 ${severity} 級別的審計事件`,
        severity: severity as AuditSeverity,
        triggerType: 'threshold',
        triggerConditions: { severity },
        status: 'triggered',
        triggeredAt: new Date(),
        relatedEvents: [event.id],
        eventCount: 1,
        notificationChannels: this.config.notificationChannels,
        recipients: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
      };

      // 保存警報
      await this.saveAlert(alert);

      // 發送通知
      await this.sendAlertNotification(alert, event);
    } catch (error) {
      logger.error('觸發警報失敗:', error);
    }
  }

  /**
   * 檢查模式警報
   */
  private async checkPatternAlerts(event: AuditEvent): Promise<void> {
    try {
      // 檢查失敗登錄嘗試
      if (event.eventType === 'failed_login_attempt') {
        const recentFailures = await this.getRecentEvents({
          eventTypes: ['failed_login_attempt'],
          userIds: event.userId ? [event.userId] : undefined,
          startDate: new Date(Date.now() - 15 * 60 * 1000), // 15分鐘內
        });

        if (recentFailures.length >= 5) {
          await this.triggerAlert(event, 'high');
        }
      }

      // 檢查可疑活動
      if (event.eventType === 'suspicious_activity') {
        await this.triggerAlert(event, 'critical');
      }
    } catch (error) {
      logger.error('檢查模式警報失敗:', error);
    }
  }

  /**
   * 保存警報
   */
  private async saveAlert(alert: AuditLogAlert): Promise<void> {
    try {
      const alerts = await this.getAlerts();
      alerts.push(alert);
      await storage.set('auditAlerts', alerts);
    } catch (error) {
      logger.error('保存警報失敗:', error);
    }
  }

  /**
   * 發送警報通知
   */
  private async sendAlertNotification(
    alert: AuditLogAlert,
    event: AuditEvent
  ): Promise<void> {
    try {
      const notification = {
        type: 'audit_alert',
        title: alert.title,
        message: `${alert.description}\n\n事件詳情:\n${event.description}`,
        priority: alert.severity === 'critical' ? 'high' : 'medium',
        data: {
          alertId: alert.id,
          eventId: event.id,
          severity: alert.severity,
        },
      };

      await notificationService.sendNotification(notification);
    } catch (error) {
      logger.error('發送警報通知失敗:', error);
    }
  }

  /**
   * 查詢審計事件
   */
  async queryEvents(query: AuditLogQuery): Promise<AuditLogSearchResult> {
    try {
      const startTime = Date.now();
      const events = await this.getEvents();

      // 應用過濾器
      let filteredEvents = this.applyFilters(events, query);

      // 排序
      if (query.sortBy) {
        filteredEvents = this.sortEvents(
          filteredEvents,
          query.sortBy,
          query.sortOrder || 'desc'
        );
      }

      // 分頁
      const totalCount = filteredEvents.length;
      const totalPages = Math.ceil(totalCount / query.limit);
      const startIndex = (query.page - 1) * query.limit;
      const endIndex = startIndex + query.limit;
      const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

      const searchTime = Date.now() - startTime;

      return {
        events: paginatedEvents,
        totalCount,
        page: query.page,
        totalPages,
        hasMore: query.page < totalPages,
        searchTime,
      };
    } catch (error) {
      logger.error('查詢審計事件失敗:', error);
      throw error;
    }
  }

  /**
   * 應用過濾器
   */
  private applyFilters(
    events: AuditEvent[],
    query: AuditLogQuery
  ): AuditEvent[] {
    return events.filter((event) => {
      // 日期過濾
      if (query.startDate && event.timestamp < query.startDate) return false;
      if (query.endDate && event.timestamp > query.endDate) return false;

      // 事件類型過濾
      if (query.eventTypes && !query.eventTypes.includes(event.eventType))
        return false;

      // 嚴重性過濾
      if (query.severities && !query.severities.includes(event.severity))
        return false;

      // 用戶ID過濾
      if (
        query.userIds &&
        event.userId &&
        !query.userIds.includes(event.userId)
      )
        return false;

      // 狀態過濾
      if (query.statuses && !query.statuses.includes(event.status))
        return false;

      // 資源類型過濾
      if (
        query.resourceTypes &&
        event.resourceType &&
        !query.resourceTypes.includes(event.resourceType)
      )
        return false;

      // 資源ID過濾
      if (
        query.resourceIds &&
        event.resourceId &&
        !query.resourceIds.includes(event.resourceId)
      )
        return false;

      // IP地址過濾
      if (
        query.ipAddresses &&
        event.ipAddress &&
        !query.ipAddresses.includes(event.ipAddress)
      )
        return false;

      // 文本搜索
      if (query.searchText) {
        const searchText = query.searchText.toLowerCase();
        const searchableText = [
          event.title,
          event.description,
          event.userEmail,
          event.resourceName,
          event.errorMessage,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchableText.includes(searchText)) return false;
      }

      return true;
    });
  }

  /**
   * 排序事件
   */
  private sortEvents(
    events: AuditEvent[],
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): AuditEvent[] {
    return events.sort((a, b) => {
      let aValue: any = a[sortBy as keyof AuditEvent];
      let bValue: any = b[sortBy as keyof AuditEvent];

      if (aValue instanceof Date) aValue = aValue.getTime();
      if (bValue instanceof Date) bValue = bValue.getTime();

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * 獲取統計信息
   */
  async getStatistics(
    query?: Partial<AuditLogQuery>
  ): Promise<AuditLogStatistics> {
    try {
      const events = await this.getEvents();
      const filteredEvents = query
        ? this.applyFilters(events, query as AuditLogQuery)
        : events;

      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // 基本統計
      const eventsByType: Record<AuditEventType, number> = {} as Record<
        AuditEventType,
        number
      >;
      const eventsBySeverity: Record<AuditSeverity, number> = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      };
      const eventsByStatus: Record<AuditEventStatus, number> = {
        success: 0,
        failure: 0,
        pending: 0,
        cancelled: 0,
      };
      const eventsByUser: Record<string, number> = {};
      const eventsByResource: Record<string, number> = {};

      // 時間統計
      const eventsByHour: Record<number, number> = {};
      const eventsByDay: Record<string, number> = {};
      const eventsByMonth: Record<string, number> = {};

      // 性能統計
      let totalDuration = 0;
      let durationCount = 0;
      const operationDurations: Record<AuditEventType, number[]> = {};

      // 錯誤統計
      let errorCount = 0;
      const errorCodes: Record<string, number> = {};

      // 安全統計
      let securityEvents = 0;
      let failedLoginAttempts = 0;
      let suspiciousActivities = 0;

      // 合規統計
      let complianceEvents = 0;
      let regulatoryViolations = 0;

      filteredEvents.forEach((event) => {
        // 按類型統計
        eventsByType[event.eventType] =
          (eventsByType[event.eventType] || 0) + 1;

        // 按嚴重性統計
        eventsBySeverity[event.severity]++;

        // 按狀態統計
        eventsByStatus[event.status]++;

        // 按用戶統計
        if (event.userId) {
          eventsByUser[event.userId] = (eventsByUser[event.userId] || 0) + 1;
        }

        // 按資源統計
        if (event.resourceType) {
          eventsByResource[event.resourceType] =
            (eventsByResource[event.resourceType] || 0) + 1;
        }

        // 時間統計
        const hour = event.timestamp.getHours();
        eventsByHour[hour] = (eventsByHour[hour] || 0) + 1;

        const day = event.timestamp.toISOString().split('T')[0];
        eventsByDay[day] = (eventsByDay[day] || 0) + 1;

        const month = event.timestamp.toISOString().slice(0, 7);
        eventsByMonth[month] = (eventsByMonth[month] || 0) + 1;

        // 性能統計
        if (event.duration) {
          totalDuration += event.duration;
          durationCount++;

          if (!operationDurations[event.eventType]) {
            operationDurations[event.eventType] = [];
          }
          operationDurations[event.eventType].push(event.duration);
        }

        // 錯誤統計
        if (event.status === 'failure') {
          errorCount++;
          if (event.errorCode) {
            errorCodes[event.errorCode] =
              (errorCodes[event.errorCode] || 0) + 1;
          }
        }

        // 安全統計
        if (
          [
            'security_alert',
            'failed_login_attempt',
            'suspicious_activity',
          ].includes(event.eventType)
        ) {
          securityEvents++;
        }
        if (event.eventType === 'failed_login_attempt') {
          failedLoginAttempts++;
        }
        if (event.eventType === 'suspicious_activity') {
          suspiciousActivities++;
        }

        // 合規統計
        if (event.complianceTags && event.complianceTags.length > 0) {
          complianceEvents++;
        }
        if (
          event.regulatoryRequirements &&
          event.regulatoryRequirements.length > 0
        ) {
          regulatoryViolations++;
        }
      });

      // 計算最慢操作
      const slowestOperations = Object.entries(operationDurations)
        .map(([eventType, durations]) => ({
          eventType: eventType as AuditEventType,
          averageDuration:
            durations.reduce((sum, d) => sum + d, 0) / durations.length,
          count: durations.length,
        }))
        .sort((a, b) => b.averageDuration - a.averageDuration)
        .slice(0, 10);

      // 計算常見錯誤
      const topErrors = Object.entries(errorCodes)
        .map(([errorCode, count]) => ({
          errorCode,
          count,
          percentage: (count / errorCount) * 100,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalEvents: filteredEvents.length,
        eventsByType,
        eventsBySeverity,
        eventsByStatus,
        eventsByUser,
        eventsByResource,
        eventsByHour,
        eventsByDay,
        eventsByMonth,
        averageResponseTime:
          durationCount > 0 ? totalDuration / durationCount : 0,
        slowestOperations,
        errorRate:
          filteredEvents.length > 0
            ? (errorCount / filteredEvents.length) * 100
            : 0,
        topErrors,
        securityEvents,
        failedLoginAttempts,
        suspiciousActivities,
        complianceEvents,
        regulatoryViolations,
      };
    } catch (error) {
      logger.error('獲取統計信息失敗:', error);
      throw error;
    }
  }

  /**
   * 生成審計報告
   */
  async generateReport(options: {
    type: AuditLogReport['type'];
    startDate: Date;
    endDate: Date;
    filters?: Partial<AuditLogQuery>;
    format?: AuditLogReport['format'];
  }): Promise<AuditLogReport> {
    try {
      const reportId = this.generateReportId();
      const query: AuditLogQuery = {
        startDate: options.startDate,
        endDate: options.endDate,
        page: 1,
        limit: 1000,
        ...options.filters,
      };

      const [statistics, searchResult] = await Promise.all([
        this.getStatistics(query),
        this.queryEvents(query),
      ]);

      const report: AuditLogReport = {
        id: reportId,
        title: `${options.type} 審計報告`,
        description: `從 ${options.startDate.toISOString()} 到 ${options.endDate.toISOString()} 的審計報告`,
        type: options.type,
        startDate: options.startDate,
        endDate: options.endDate,
        filters: query,
        statistics,
        events: searchResult.events,
        summary: this.generateReportSummary(statistics, options.type),
        recommendations: this.generateRecommendations(statistics, options.type),
        generatedBy: 'system',
        generatedAt: new Date(),
        format: options.format || 'json',
        status: 'completed',
      };

      // 保存報告
      await this.saveReport(report);

      return report;
    } catch (error) {
      logger.error('生成審計報告失敗:', error);
      throw error;
    }
  }

  /**
   * 生成報告摘要
   */
  private generateReportSummary(
    statistics: AuditLogStatistics,
    type: string
  ): string {
    const { totalEvents } = statistics;
    const { errorRate } = statistics;
    const { securityEvents } = statistics;

    let summary = `總共記錄了 ${totalEvents} 個審計事件。`;

    if (errorRate > 0) {
      summary += ` 錯誤率為 ${errorRate.toFixed(2)}%。`;
    }

    if (securityEvents > 0) {
      summary += ` 檢測到 ${securityEvents} 個安全事件。`;
    }

    return summary;
  }

  /**
   * 生成建議
   */
  private generateRecommendations(
    statistics: AuditLogStatistics,
    type: string
  ): string[] {
    const recommendations: string[] = [];

    if (statistics.errorRate > 5) {
      recommendations.push('建議檢查系統錯誤率較高的原因');
    }

    if (statistics.failedLoginAttempts > 10) {
      recommendations.push('建議加強登錄安全措施');
    }

    if (statistics.suspiciousActivities > 0) {
      recommendations.push('建議調查可疑活動');
    }

    return recommendations;
  }

  /**
   * 保存報告
   */
  private async saveReport(report: AuditLogReport): Promise<void> {
    try {
      const reports = await this.getReports();
      reports.push(report);
      await storage.set('auditReports', reports);
    } catch (error) {
      logger.error('保存報告失敗:', error);
    }
  }

  /**
   * 導出審計日誌
   */
  async exportLogs(options: AuditLogExportOptions): Promise<string> {
    try {
      const searchResult = await this.queryEvents({
        ...options.filters,
        page: 1,
        limit: options.maxRecords || 10000,
      });

      let exportData = searchResult.events;

      // 過濾詳細信息
      if (!options.includeDetails) {
        exportData = exportData.map((event) => ({
          ...event,
          details: undefined,
          metadata: undefined,
        }));
      }

      if (!options.includeMetadata) {
        exportData = exportData.map((event) => ({
          ...event,
          metadata: undefined,
        }));
      }

      if (!options.includeStackTrace) {
        exportData = exportData.map((event) => ({
          ...event,
          stackTrace: undefined,
        }));
      }

      // 轉換格式
      let exportContent: string;
      switch (options.format) {
        case 'json':
          exportContent = JSON.stringify(exportData, null, 2);
          break;
        case 'csv':
          exportContent = this.convertToCSV(exportData);
          break;
        case 'xml':
          exportContent = this.convertToXML(exportData);
          break;
        default:
          throw new Error(`不支持的導出格式: ${options.format}`);
      }

      // 保存導出文件
      const fileName = `audit_logs_${new Date().toISOString().split('T')[0]}.${options.format}`;
      await storage.set(`exports/${fileName}`, exportContent);

      return fileName;
    } catch (error) {
      logger.error('導出審計日誌失敗:', error);
      throw error;
    }
  }

  /**
   * 轉換為CSV格式
   */
  private convertToCSV(events: AuditEvent[]): string {
    if (events.length === 0) return '';

    const headers = Object.keys(events[0]);
    const csvRows = [headers.join(',')];

    for (const event of events) {
      const values = headers.map((header) => {
        const value = event[header as keyof AuditEvent];
        if (value instanceof Date) {
          return value.toISOString();
        }
        if (typeof value === 'object') {
          return JSON.stringify(value);
        }
        return String(value || '');
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * 轉換為XML格式
   */
  private convertToXML(events: AuditEvent[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<auditLogs>\n';

    for (const event of events) {
      xml += '  <event>\n';
      for (const [key, value] of Object.entries(event)) {
        if (value instanceof Date) {
          xml += `    <${key}>${value.toISOString()}</${key}>\n`;
        } else if (typeof value === 'object') {
          xml += `    <${key}>${JSON.stringify(value)}</${key}>\n`;
        } else {
          xml += `    <${key}>${value}</${key}>\n`;
        }
      }
      xml += '  </event>\n';
    }

    xml += '</auditLogs>';
    return xml;
  }

  /**
   * 清理舊日誌
   */
  async cleanupLogs(options: AuditLogCleanupOptions): Promise<void> {
    try {
      const events = await this.getEvents();
      const cutoffDate = new Date(
        Date.now() - options.retentionDays * 24 * 60 * 60 * 1000
      );

      // 分離要刪除和歸檔的事件
      const toDelete: AuditEvent[] = [];
      const toArchive: AuditEvent[] = [];
      const toKeep: AuditEvent[] = [];

      for (const event of events) {
        if (event.timestamp < cutoffDate) {
          if (options.deleteEvents.includes(event.eventType)) {
            toDelete.push(event);
          } else if (options.archiveEvents.includes(event.eventType)) {
            toArchive.push(event);
          } else {
            toKeep.push(event);
          }
        } else {
          toKeep.push(event);
        }
      }

      // 備份
      if (options.backupBeforeCleanup) {
        await this.createBackup(events);
      }

      // 歸檔
      if (toArchive.length > 0) {
        await this.archiveEvents(toArchive, options.compressArchives);
      }

      // 更新存儲
      await storage.set('auditEvents', toKeep);

      logger.info(
        `清理完成: 刪除 ${toDelete.length} 個事件, 歸檔 ${toArchive.length} 個事件, 保留 ${toKeep.length} 個事件`
      );
    } catch (error) {
      logger.error('清理審計日誌失敗:', error);
      throw error;
    }
  }

  /**
   * 創建備份
   */
  private async createBackup(events: AuditEvent[]): Promise<void> {
    try {
      const backupId = `backup_${Date.now()}`;
      await storage.set(`backups/${backupId}`, events);
      logger.info(`創建備份: ${backupId}`);
    } catch (error) {
      logger.error('創建備份失敗:', error);
    }
  }

  /**
   * 歸檔事件
   */
  private async archiveEvents(
    events: AuditEvent[],
    compress: boolean
  ): Promise<void> {
    try {
      const archiveId = `archive_${Date.now()}`;
      let archiveData = events;

      if (compress) {
        // 簡單的壓縮（實際應用中應使用專業壓縮庫）
        archiveData = events.map((event) => ({
          ...event,
          description: event.description.substring(0, 100), // 截斷描述
        }));
      }

      await storage.set(`archives/${archiveId}`, archiveData);
      logger.info(`歸檔事件: ${archiveId}, 數量: ${events.length}`);
    } catch (error) {
      logger.error('歸檔事件失敗:', error);
    }
  }

  /**
   * 獲取事件
   */
  private async getEvents(): Promise<AuditEvent[]> {
    try {
      const events = await storage.get<AuditEvent[]>('auditEvents');
      return events || [];
    } catch (error) {
      logger.error('獲取審計事件失敗:', error);
      return [];
    }
  }

  /**
   * 獲取警報
   */
  private async getAlerts(): Promise<AuditLogAlert[]> {
    try {
      const alerts = await storage.get<AuditLogAlert[]>('auditAlerts');
      return alerts || [];
    } catch (error) {
      logger.error('獲取警報失敗:', error);
      return [];
    }
  }

  /**
   * 獲取報告
   */
  private async getReports(): Promise<AuditLogReport[]> {
    try {
      const reports = await storage.get<AuditLogReport[]>('auditReports');
      return reports || [];
    } catch (error) {
      logger.error('獲取報告失敗:', error);
      return [];
    }
  }

  /**
   * 獲取最近事件
   */
  private async getRecentEvents(
    query: Partial<AuditLogQuery>
  ): Promise<AuditEvent[]> {
    const events = await this.getEvents();
    return this.applyFilters(events, {
      ...query,
      page: 1,
      limit: 1000,
    });
  }

  /**
   * 生成事件ID
   */
  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成警報ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成報告ID
   */
  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 停止服務
   */
  async stop(): Promise<void> {
    try {
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
        this.flushTimer = undefined;
      }

      // 處理剩餘事件
      if (this.eventQueue.length > 0) {
        await this.processEventQueue();
      }

      this.isInitialized = false;
      logger.info('審計日誌服務已停止');
    } catch (error) {
      logger.error('停止審計日誌服務失敗:', error);
    }
  }
}

// 創建單例實例
export { AuditLogService };
export const auditLogService = new AuditLogService();

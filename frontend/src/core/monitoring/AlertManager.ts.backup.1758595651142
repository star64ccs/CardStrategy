/**
 * 告警管理器
 * 處理性能告警的通知和自動化響應
 */

import { logger } from '../../utils/logger';

export interface AlertConfig {
  enabled: boolean;
  channels: AlertChannel[];
  escalationPolicy: EscalationPolicy;
  enableAutoResolution: boolean;
  enableAutoActions: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  rateLimit: {
    enabled: boolean;
    maxAlertsPerMinute: number;
    maxAlertsPerHour: number;
  };
}

export interface AlertChannel {
  id: string;
  type: 'email' | 'sms' | 'webhook' | 'slack' | 'teams' | 'pagerduty';
  enabled: boolean;
  config: Record<string, any>;
  filters: AlertFilter[];
}

export interface AlertFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'in';
  value: any;
}

export interface EscalationPolicy {
  levels: EscalationLevel[];
  autoEscalate: boolean;
  escalateAfter: number; // 分鐘
}

export interface EscalationLevel {
  level: number;
  name: string;
  channels: string[];
  delay: number; // 分鐘
  actions: string[];
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  source: string;
  timestamp: number;
  acknowledged: boolean;
  resolved: boolean;
  escalated: boolean;
  escalationLevel: number;
  channels: string[];
  actions: AlertAction[];
  metadata: Record<string, any>;
  tags: Record<string, string>;
}

export interface AlertAction {
  id: string;
  type: 'notification' | 'webhook' | 'script' | 'auto-fix';
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  timestamp: number;
}

export interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  acknowledgedAlerts: number;
  escalatedAlerts: number;
  alertsBySeverity: Record<string, number>;
  alertsByCategory: Record<string, number>;
  averageResolutionTime: number;
  averageEscalationTime: number;
  alertTrends: {
    last24Hours: number;
    last7Days: number;
    last30Days: number;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: string;
  subject?: string;
  body: string;
  variables: string[];
}

class AlertManager {
  private static instance: AlertManager;
  private config: AlertConfig;
  private alerts: Map<string, Alert> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private stats: AlertStats;
  private rateLimitTracker: Map<string, number[]> = new Map();
  private isInitialized: boolean = false;

  private constructor(config: AlertConfig) {
    this.config = {
      channels: [],
      escalationPolicy: {
        levels: [],
        autoEscalate: true,
        escalateAfter: 15,
      },
      enableAutoResolution: true,
      enableAutoActions: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        timezone: 'UTC',
      },
      rateLimit: {
        enabled: true,
        maxAlertsPerMinute: 10,
        maxAlertsPerHour: 100,
      },
      ...config,
    };

    this.stats = {
      totalAlerts: 0,
      activeAlerts: 0,
      resolvedAlerts: 0,
      acknowledgedAlerts: 0,
      escalatedAlerts: 0,
      alertsBySeverity: {},
      alertsByCategory: {},
      averageResolutionTime: 0,
      averageEscalationTime: 0,
      alertTrends: {
        last24Hours: 0,
        last7Days: 0,
        last30Days: 0,
      },
    };

    this.initializeDefaultTemplates();
  }

  public static getInstance(config?: AlertConfig): AlertManager {
    if (!AlertManager.instance) {
      if (!config) {
        throw new Error(
          'Alert manager configuration is required for first initialization'
        );
      }
      AlertManager.instance = new AlertManager(config);
    }
    return AlertManager.instance;
  }

  /**
   * 初始化告警管理器
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.isInitialized = true;
      logger.info('Alert manager initialized successfully', {
        enabled: this.config.enabled,
        channels: this.config.channels.length,
        escalationLevels: this.config.escalationPolicy.levels.length,
        autoActions: this.config.enableAutoActions,
      });

      // 啟動定期任務
      this.startPeriodicTasks();
    } catch (error) {
      logger.error('Failed to initialize alert manager', error);
      throw error;
    }
  }

  /**
   * 創建告警
   */
  public async createAlert(
    title: string,
    message: string,
    severity: Alert['severity'],
    category: string,
    source: string,
    metadata: Record<string, any> = {},
    tags: Record<string, string> = {}
  ): Promise<string> {
    if (!this.config.enabled) {
      return '';
    }

    try {
      // 檢查速率限制
      if (!this.checkRateLimit(source)) {
        logger.warn('Alert rate limit exceeded', { source });
        return '';
      }

      const alertId = this.generateAlertId();

      const alert: Alert = {
        id: alertId,
        title,
        message,
        severity,
        category,
        source,
        timestamp: Date.now(),
        acknowledged: false,
        resolved: false,
        escalated: false,
        escalationLevel: 0,
        channels: this.getChannelsForAlert(severity, category),
        actions: [],
        metadata,
        tags,
      };

      this.alerts.set(alertId, alert);
      this.updateStats(alert, 'created');

      // 發送通知
      await this.sendNotifications(alert);

      // 執行自動動作
      if (this.config.enableAutoActions) {
        await this.executeAutoActions(alert);
      }

      // 設置升級計時器
      if (this.config.escalationPolicy.autoEscalate) {
        this.scheduleEscalation(alertId);
      }

      logger.info('Alert created', {
        id: alertId,
        title,
        severity,
        category,
        source,
        channels: alert.channels.length,
      });

      return alertId;
    } catch (error) {
      logger.error('Failed to create alert', { title, severity, error });
      return '';
    }
  }

  /**
   * 確認告警
   */
  public async acknowledgeAlert(
    alertId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const alert = this.alerts.get(alertId);
      if (!alert) {
        logger.warn('Alert not found for acknowledgment', { alertId });
        return false;
      }

      alert.acknowledged = true;
      alert.metadata.acknowledgedBy = userId;
      alert.metadata.acknowledgedAt = Date.now();

      this.updateStats(alert, 'acknowledged');

      logger.info('Alert acknowledged', { alertId, userId });
      return true;
    } catch (error) {
      logger.error('Failed to acknowledge alert', { alertId, userId, error });
      return false;
    }
  }

  /**
   * 解決告警
   */
  public async resolveAlert(
    alertId: string,
    userId: string,
    resolution?: string
  ): Promise<boolean> {
    try {
      const alert = this.alerts.get(alertId);
      if (!alert) {
        logger.warn('Alert not found for resolution', { alertId });
        return false;
      }

      alert.resolved = true;
      alert.metadata.resolvedBy = userId;
      alert.metadata.resolvedAt = Date.now();
      alert.metadata.resolution = resolution;

      this.updateStats(alert, 'resolved');

      // 發送解決通知
      await this.sendResolutionNotification(alert);

      logger.info('Alert resolved', { alertId, userId, resolution });
      return true;
    } catch (error) {
      logger.error('Failed to resolve alert', { alertId, userId, error });
      return false;
    }
  }

  /**
   * 獲取告警列表
   */
  public getAlerts(
    filters: {
      severity?: Alert['severity'][];
      category?: string[];
      status?: ('active' | 'acknowledged' | 'resolved')[];
      source?: string[];
      limit?: number;
    } = {}
  ): Alert[] {
    let filteredAlerts = Array.from(this.alerts.values());

    if (filters.severity && filters.severity.length > 0) {
      filteredAlerts = filteredAlerts.filter(alert =>
        filters.severity!.includes(alert.severity)
      );
    }

    if (filters.category && filters.category.length > 0) {
      filteredAlerts = filteredAlerts.filter(alert =>
        filters.category!.includes(alert.category)
      );
    }

    if (filters.status && filters.status.length > 0) {
      filteredAlerts = filteredAlerts.filter(alert => {
        if (alert.resolved) return filters.status!.includes('resolved');
        if (alert.acknowledged) return filters.status!.includes('acknowledged');
        return filters.status!.includes('active');
      });
    }

    if (filters.source && filters.source.length > 0) {
      filteredAlerts = filteredAlerts.filter(alert =>
        filters.source!.includes(alert.source)
      );
    }

    // 按時間排序（最新的在前）
    filteredAlerts.sort((a, b) => b.timestamp - a.timestamp);

    // 限制結果數量
    if (filters.limit && filters.limit > 0) {
      filteredAlerts = filteredAlerts.slice(0, filters.limit);
    }

    return filteredAlerts;
  }

  /**
   * 獲取告警統計
   */
  public getStats(): AlertStats {
    this.calculateTrends();
    return { ...this.stats };
  }

  /**
   * 健康檢查
   */
  public async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      const stats = this.getStats();
      const healthy =
        stats.activeAlerts < 50 && stats.alertsBySeverity.critical < 5;

      return {
        healthy,
        details: {
          initialized: this.isInitialized,
          config: {
            enabled: this.config.enabled,
            channels: this.config.channels.length,
            escalationLevels: this.config.escalationPolicy.levels.length,
            autoActions: this.config.enableAutoActions,
          },
          stats,
          recentAlerts: this.getAlerts({ limit: 5 }),
        },
      };
    } catch (error) {
      logger.error('Alert manager health check failed', error);
      return {
        healthy: false,
        details: {
          initialized: this.isInitialized,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private initializeDefaultTemplates(): void {
    // 默認通知模板
    this.templates.set('default-email', {
      id: 'default-email',
      name: 'Default Email Template',
      channel: 'email',
      subject: '[{{severity}}] {{title}}',
      body: `
        <h2>{{title}}</h2>
        <p><strong>Severity:</strong> {{severity}}</p>
        <p><strong>Source:</strong> {{source}}</p>
        <p><strong>Time:</strong> {{timestamp}}</p>
        <p>{{message}}</p>
        <hr>
        <p><small>Alert ID: {{alertId}}</small></p>
      `,
      variables: [
        'title',
        'severity',
        'source',
        'timestamp',
        'message',
        'alertId',
      ],
    });

    this.templates.set('default-slack', {
      id: 'default-slack',
      name: 'Default Slack Template',
      channel: 'slack',
      body: `
        *{{title}}*
        Severity: {{severity}}
        Source: {{source}}
        Time: {{timestamp}}
        {{message}}
        Alert ID: {{alertId}}
      `,
      variables: [
        'title',
        'severity',
        'source',
        'timestamp',
        'message',
        'alertId',
      ],
    });
  }

  private checkRateLimit(source: string): boolean {
    if (!this.config.rateLimit.enabled) {
      return true;
    }

    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const hour = Math.floor(now / 3600000);

    if (!this.rateLimitTracker.has(source)) {
      this.rateLimitTracker.set(source, []);
    }

    const timestamps = this.rateLimitTracker.get(source)!;

    // 清理舊的時間戳
    const minuteAgo = now - 60000;
    const hourAgo = now - 3600000;

    const recentTimestamps = timestamps.filter(ts => ts > minuteAgo);
    this.rateLimitTracker.set(source, recentTimestamps);

    // 檢查分鐘限制
    if (recentTimestamps.length >= this.config.rateLimit.maxAlertsPerMinute) {
      return false;
    }

    // 檢查小時限制
    const hourTimestamps = timestamps.filter(ts => ts > hourAgo);
    if (hourTimestamps.length >= this.config.rateLimit.maxAlertsPerHour) {
      return false;
    }

    // 添加當前時間戳
    recentTimestamps.push(now);
    return true;
  }

  private getChannelsForAlert(
    severity: Alert['severity'],
    category: string
  ): string[] {
    const channels: string[] = [];

    for (const channel of this.config.channels) {
      if (!channel.enabled) {
        continue;
      }

      // 檢查過濾器
      if (this.matchesFilters(channel.filters, severity, category)) {
        channels.push(channel.id);
      }
    }

    return channels;
  }

  private matchesFilters(
    filters: AlertFilter[],
    severity: Alert['severity'],
    category: string
  ): boolean {
    if (filters.length === 0) {
      return true;
    }

    return filters.some(filter => {
      switch (filter.field) {
        case 'severity':
          return this.evaluateFilter(filter, severity);
        case 'category':
          return this.evaluateFilter(filter, category);
        default:
          return true;
      }
    });
  }

  private evaluateFilter(filter: AlertFilter, value: any): boolean {
    switch (filter.operator) {
      case 'equals':
        return value === filter.value;
      case 'contains':
        return String(value).includes(String(filter.value));
      case 'greater':
        return Number(value) > Number(filter.value);
      case 'less':
        return Number(value) < Number(filter.value);
      case 'in':
        return Array.isArray(filter.value) && filter.value.includes(value);
      default:
        return true;
    }
  }

  private async sendNotifications(alert: Alert): Promise<void> {
    if (this.isQuietHours()) {
      logger.debug('Alert suppressed due to quiet hours', {
        alertId: alert.id,
      });
      return;
    }

    for (const channelId of alert.channels) {
      try {
        await this.sendNotificationToChannel(alert, channelId);
      } catch (error) {
        logger.error('Failed to send notification', {
          alertId: alert.id,
          channelId,
          error,
        });
      }
    }
  }

  private async sendNotificationToChannel(
    alert: Alert,
    channelId: string
  ): Promise<void> {
    const channel = this.config.channels.find(c => c.id === channelId);
    if (!channel) {
      return;
    }

    const template =
      this.templates.get(`default-${channel.type}`) ||
      this.templates.get('default-email')!;

    // 渲染模板
    const rendered = this.renderTemplate(template, alert);

    // 發送通知（模擬）
    logger.info('Notification sent', {
      alertId: alert.id,
      channel: channel.type,
      channelId,
      title: alert.title,
      severity: alert.severity,
    });
  }

  private async sendResolutionNotification(alert: Alert): Promise<void> {
    // 發送解決通知
    logger.info('Resolution notification sent', {
      alertId: alert.id,
      title: alert.title,
      resolvedBy: alert.metadata.resolvedBy,
    });
  }

  private async executeAutoActions(alert: Alert): Promise<void> {
    const actions = this.getAutoActionsForAlert(alert);

    for (const action of actions) {
      try {
        const alertAction: AlertAction = {
          id: this.generateActionId(),
          type: action,
          status: 'pending',
          timestamp: Date.now(),
        };

        alert.actions.push(alertAction);

        // 執行動作（模擬）
        await this.executeAction(alertAction, alert);
      } catch (error) {
        logger.error('Failed to execute auto action', {
          alertId: alert.id,
          action,
          error,
        });
      }
    }
  }

  private getAutoActionsForAlert(alert: Alert): string[] {
    const actions: string[] = [];

    // 根據嚴重性和類別確定自動動作
    if (alert.severity === 'critical') {
      actions.push('notification', 'webhook', 'auto-fix');
    } else if (alert.severity === 'high') {
      actions.push('notification', 'webhook');
    } else {
      actions.push('notification');
    }

    return actions;
  }

  private async executeAction(
    action: AlertAction,
    alert: Alert
  ): Promise<void> {
    action.status = 'running';

    try {
      // 模擬動作執行
      await new Promise(resolve => setTimeout(resolve, 1000));

      action.status = 'completed';
      action.result = { success: true, timestamp: Date.now() };

      logger.debug('Auto action executed', {
        alertId: alert.id,
        actionId: action.id,
        type: action.type,
        status: action.status,
      });
    } catch (error) {
      action.status = 'failed';
      action.error = error instanceof Error ? error.message : 'Unknown error';

      logger.error('Auto action failed', {
        alertId: alert.id,
        actionId: action.id,
        type: action.type,
        error: action.error,
      });
    }
  }

  private scheduleEscalation(alertId: string): void {
    setTimeout(
      async () => {
        await this.escalateAlert(alertId);
      },
      this.config.escalationPolicy.escalateAfter * 60 * 1000
    );
  }

  private async escalateAlert(alertId: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.resolved || alert.acknowledged) {
      return;
    }

    const nextLevel = alert.escalationLevel + 1;
    const escalationLevel = this.config.escalationPolicy.levels.find(
      level => level.level === nextLevel
    );

    if (!escalationLevel) {
      return;
    }

    alert.escalated = true;
    alert.escalationLevel = nextLevel;
    alert.channels = [...alert.channels, ...escalationLevel.channels];

    this.updateStats(alert, 'escalated');

    // 發送升級通知
    await this.sendNotifications(alert);

    // 執行升級動作
    for (const action of escalationLevel.actions) {
      await this.executeAutoActions(alert);
    }

    logger.info('Alert escalated', {
      alertId,
      level: nextLevel,
      channels: escalationLevel.channels,
      actions: escalationLevel.actions,
    });
  }

  private renderTemplate(template: NotificationTemplate, alert: Alert): string {
    let rendered = template.body;

    for (const variable of template.variables) {
      const value = this.getTemplateVariable(alert, variable);
      const regex = new RegExp(`{{${variable}}}`, 'g');
      rendered = rendered.replace(regex, String(value));
    }

    return rendered;
  }

  private getTemplateVariable(alert: Alert, variable: string): any {
    switch (variable) {
      case 'title':
        return alert.title;
      case 'message':
        return alert.message;
      case 'severity':
        return alert.severity;
      case 'source':
        return alert.source;
      case 'timestamp':
        return new Date(alert.timestamp).toISOString();
      case 'alertId':
        return alert.id;
      default:
        return alert.metadata[variable] || '';
    }
  }

  private isQuietHours(): boolean {
    if (!this.config.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.toTimeString().substr(0, 5); // HH:MM

    return (
      currentTime >= this.config.quietHours.start ||
      currentTime <= this.config.quietHours.end
    );
  }

  private updateStats(alert: Alert, action: string): void {
    this.stats.totalAlerts++;

    switch (action) {
      case 'created':
        this.stats.activeAlerts++;
        break;
      case 'acknowledged':
        this.stats.acknowledgedAlerts++;
        break;
      case 'resolved':
        this.stats.activeAlerts--;
        this.stats.resolvedAlerts++;
        break;
      case 'escalated':
        this.stats.escalatedAlerts++;
        break;
    }

    // 更新按嚴重性統計
    if (!this.stats.alertsBySeverity[alert.severity]) {
      this.stats.alertsBySeverity[alert.severity] = 0;
    }
    this.stats.alertsBySeverity[alert.severity]++;

    // 更新按類別統計
    if (!this.stats.alertsByCategory[alert.category]) {
      this.stats.alertsByCategory[alert.category] = 0;
    }
    this.stats.alertsByCategory[alert.category]++;
  }

  private calculateTrends(): void {
    const now = Date.now();
    const last24Hours = now - 24 * 60 * 60 * 1000;
    const last7Days = now - 7 * 24 * 60 * 60 * 1000;
    const last30Days = now - 30 * 24 * 60 * 60 * 1000;

    this.stats.alertTrends.last24Hours = Array.from(
      this.alerts.values()
    ).filter(alert => alert.timestamp > last24Hours).length;

    this.stats.alertTrends.last7Days = Array.from(this.alerts.values()).filter(
      alert => alert.timestamp > last7Days
    ).length;

    this.stats.alertTrends.last30Days = Array.from(this.alerts.values()).filter(
      alert => alert.timestamp > last30Days
    ).length;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateActionId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startPeriodicTasks(): void {
    // 定期清理舊告警
    setInterval(
      () => {
        this.cleanupOldAlerts();
      },
      60 * 60 * 1000
    ); // 每小時清理一次

    // 定期檢查升級
    setInterval(
      () => {
        this.checkPendingEscalations();
      },
      5 * 60 * 1000
    ); // 每5分鐘檢查一次
  }

  private cleanupOldAlerts(): void {
    const cutoffTime = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30天前
    let cleanedCount = 0;

    for (const [id, alert] of this.alerts.entries()) {
      if (alert.resolved && alert.timestamp < cutoffTime) {
        this.alerts.delete(id);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.debug('Old alerts cleaned up', { count: cleanedCount });
    }
  }

  private checkPendingEscalations(): void {
    const now = Date.now();
    const escalateAfter =
      this.config.escalationPolicy.escalateAfter * 60 * 1000;

    for (const [id, alert] of this.alerts.entries()) {
      if (!alert.resolved && !alert.acknowledged && !alert.escalated) {
        if (now - alert.timestamp > escalateAfter) {
          this.escalateAlert(id);
        }
      }
    }
  }
}

export default AlertManager;

import { HybridArchitectureCore } from './HybridArchitectureCore';
import { TechnicalDebtManagement } from './TechnicalDebtManagement';

// 合規監控類型定義
export interface ComplianceEvent {
  id: string;
  timestamp: Date;
  eventType: ComplianceEventType;
  severity: ComplianceSeverity;
  source: string;
  description: string;
  details: unknown;
  jurisdiction: string;
  regulation: string;
  status: ComplianceEventStatus;
  assignedTo?: string;
  resolution?: ComplianceResolution;
  metadata: ComplianceMetadata;
}

export enum ComplianceEventType {
  VIOLATION_DETECTED = 'VIOLATION_DETECTED',
  COMPLIANCE_CHECK = 'COMPLIANCE_CHECK',
  AUDIT_EVENT = 'AUDIT_EVENT',
  POLICY_UPDATE = 'POLICY_UPDATE',
  REGULATION_CHANGE = 'REGULATION_CHANGE',
  DATA_BREACH = 'DATA_BREACH',
  PRIVACY_VIOLATION = 'PRIVACY_VIOLATION',
  SECURITY_INCIDENT = 'SECURITY_INCIDENT',
  ACCESS_CONTROL = 'ACCESS_CONTROL',
  DATA_PROCESSING = 'DATA_PROCESSING',
}

export enum ComplianceSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ComplianceEventStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  ESCALATED = 'ESCALATED',
}

export interface ComplianceResolution {
  action: string;
  description: string;
  implementedBy: string;
  implementedAt: Date;
  verificationRequired: boolean;
  followUpDate?: Date;
}

export interface ComplianceMetadata {
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  deviceInfo?: string;
  tags: string[];
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  regulation: string;
  jurisdiction: string;
  category: ComplianceCategory;
  conditions: ComplianceCondition[];
  actions: ComplianceAction[];
  enabled: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum ComplianceCategory {
  PRIVACY = 'PRIVACY',
  SECURITY = 'SECURITY',
  DATA_PROTECTION = 'DATA_PROTECTION',
  ACCESS_CONTROL = 'ACCESS_CONTROL',
  AUDIT = 'AUDIT',
  REPORTING = 'REPORTING',
}

export interface ComplianceCondition {
  field: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'greater_than'
    | 'less_than'
    | 'in'
    | 'not_in';
  value: unknown;
  logicalOperator?: 'AND' | 'OR';
}

export interface ComplianceAction {
  type: 'ALERT' | 'BLOCK' | 'LOG' | 'NOTIFY' | 'ESCALATE';
  parameters: Record<string, any>;
}

export interface ComplianceReport {
  summary: {
    totalEvents: number;
    bySeverity: Record<ComplianceSeverity, number>;
    byStatus: Record<ComplianceEventStatus, number>;
    byType: Record<ComplianceEventType, number>;
    byJurisdiction: Record<string, number>;
    openViolations: number;
    resolvedViolations: number;
  };
  events: ComplianceEvent[];
  trends: {
    newEvents: number;
    resolvedEvents: number;
    averageResolutionTime: number;
    violationRate: number;
  };
  recommendations: ComplianceRecommendation[];
  complianceScore: number;
}

export interface ComplianceRecommendation {
  type: 'IMMEDIATE' | 'SHORT_TERM' | 'LONG_TERM';
  priority: ComplianceSeverity;
  title: string;
  description: string;
  actions: string[];
  expectedImpact: string;
  estimatedEffort: number;
  regulations: string[];
}

export interface ComplianceAlert {
  id: string;
  timestamp: Date;
  severity: ComplianceSeverity;
  title: string;
  message: string;
  eventId: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  escalationLevel: number;
}

// 合規規則引擎
export class ComplianceRuleEngine {
  private readonly rules: Map<string, ComplianceRule> = new Map();
  private readonly hybridCore: HybridArchitectureCore;

  constructor() {
    this.hybridCore = HybridArchitectureCore.getInstance();
  }

  addRule(rule: ComplianceRule): void {
    this.rules.set(rule.id, rule);
  }

  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  getRule(ruleId: string): ComplianceRule | undefined {
    return this.rules.get(ruleId);
  }

  getAllRules(): ComplianceRule[] {
    return Array.from(this.rules.values());
  }

  getRulesByCategory(category: ComplianceCategory): ComplianceRule[] {
    return this.getAllRules().filter(rule => rule.category === category);
  }

  getRulesByJurisdiction(jurisdiction: string): ComplianceRule[] {
    return this.getAllRules().filter(
      rule => rule.jurisdiction === jurisdiction
    );
  }

  evaluateEvent(event: ComplianceEvent): ComplianceEvent[] {
    const triggeredEvents: ComplianceEvent[] = [];
    const _applicableRules = this.getAllRules().filter(rule => rule.enabled);

    for (const rule of applicableRules) {
      if (this.matchesRule(event, rule)) {
        const _triggeredEvent = this.createTriggeredEvent(event, rule);
        triggeredEvents.push(triggeredEvent);
      }
    }

    return triggeredEvents;
  }

  private matchesRule(event: ComplianceEvent, rule: ComplianceRule): boolean {
    for (const condition of rule.conditions) {
      const _eventValue = this.getEventValue(event, condition.field);
      if (!this.evaluateCondition(eventValue, condition)) {
        return false;
      }
    }
    return true;
  }

  private getEventValue(event: ComplianceEvent, field: string): unknown {
    const _fieldPath = field.split('.');
    let value: unknown = event;

    for (const path of fieldPath) {
      if (value && typeof value === 'object' && path in value) {
        value = value[path];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private evaluateCondition(
    value: unknown,
    condition: ComplianceCondition
  ): boolean {
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'contains':
        return typeof value === 'string' && value.includes(condition.value);
      case 'greater_than':
        return typeof value === 'number' && value > condition.value;
      case 'less_than':
        return typeof value === 'number' && value < condition.value;
      case 'in':
        return (
          Array.isArray(condition.value) && condition.value.includes(value)
        );
      case 'not_in':
        return (
          Array.isArray(condition.value) && !condition.value.includes(value)
        );
      default:
        return false;
    }
  }

  private createTriggeredEvent(
    originalEvent: ComplianceEvent,
    rule: ComplianceRule
  ): ComplianceEvent {
    return {
      id: `triggered_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      eventType: ComplianceEventType.VIOLATION_DETECTED,
      severity: this.determineSeverity(originalEvent, rule),
      source: 'ComplianceRuleEngine',
      description: `Rule "${rule.name}" triggered`,
      details: {
        originalEvent: originalEvent.id,
        rule: rule.id,
        conditions: rule.conditions,
        actions: rule.actions,
      },
      jurisdiction: rule.jurisdiction,
      regulation: rule.regulation,
      status: ComplianceEventStatus.OPEN,
      metadata: {
        tags: ['rule-triggered', rule.category.toLowerCase()],
      },
    };
  }

  private determineSeverity(
    event: ComplianceEvent,
    rule: ComplianceRule
  ): ComplianceSeverity {
    // 基於規則優先級和原始事件嚴重性確定嚴重性
    const _baseSeverity = event.severity;
    const _rulePriority = rule.priority;

    if (rulePriority >= 8 || baseSeverity === ComplianceSeverity.CRITICAL) {
      return ComplianceSeverity.CRITICAL;
    } else if (rulePriority >= 6 || baseSeverity === ComplianceSeverity.HIGH) {
      return ComplianceSeverity.HIGH;
    } else if (
      rulePriority >= 4 ||
      baseSeverity === ComplianceSeverity.MEDIUM
    ) {
      return ComplianceSeverity.MEDIUM;
    } else {
      return ComplianceSeverity.LOW;
    }
  }
}

// 合規事件追蹤器
export class ComplianceEventTracker {
  private readonly events: Map<string, ComplianceEvent> = new Map();
  private readonly alerts: Map<string, ComplianceAlert> = new Map();
  private readonly ruleEngine: ComplianceRuleEngine;

  constructor() {
    this.ruleEngine = new ComplianceRuleEngine();
  }

  addEvent(event: ComplianceEvent): void {
    this.events.set(event.id, event);

    // 評估規則並創建觸發的事件
    const _triggeredEvents = this.ruleEngine.evaluateEvent(event);
    triggeredEvents.forEach(triggeredEvent => {
      this.events.set(triggeredEvent.id, triggeredEvent);
      this.createAlert(triggeredEvent);
    });
  }

  updateEvent(eventId: string, updates: Partial<ComplianceEvent>): boolean {
    const _event = this.events.get(eventId);
    if (!event) return false;

    const _updatedEvent = { ...event, ...updates, timestamp: new Date() };
    this.events.set(eventId, updatedEvent);
    return true;
  }

  getEvent(eventId: string): ComplianceEvent | undefined {
    return this.events.get(eventId);
  }

  getAllEvents(): ComplianceEvent[] {
    return Array.from(this.events.values());
  }

  getEventsByStatus(status: ComplianceEventStatus): ComplianceEvent[] {
    return this.getAllEvents().filter(event => event.status === status);
  }

  getEventsBySeverity(severity: ComplianceSeverity): ComplianceEvent[] {
    return this.getAllEvents().filter(event => event.severity === severity);
  }

  getEventsByType(type: ComplianceEventType): ComplianceEvent[] {
    return this.getAllEvents().filter(event => event.eventType === type);
  }

  getEventsByJurisdiction(jurisdiction: string): ComplianceEvent[] {
    return this.getAllEvents().filter(
      event => event.jurisdiction === jurisdiction
    );
  }

  getOpenViolations(): ComplianceEvent[] {
    return this.getAllEvents().filter(
      event =>
        event.eventType === ComplianceEventType.VIOLATION_DETECTED &&
        event.status !== ComplianceEventStatus.RESOLVED
    );
  }

  private createAlert(event: ComplianceEvent): void {
    const alert: ComplianceAlert = {
      id: `alert_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      severity: event.severity,
      title: `合規違規檢測: ${event.description}`,
      message: `檢測到合規違規事件。事件ID: ${event.id}, 嚴重性: ${event.severity}`,
      eventId: event.id,
      acknowledged: false,
      escalationLevel: this.getEscalationLevel(event.severity),
    };

    this.alerts.set(alert.id, alert);
  }

  private getEscalationLevel(severity: ComplianceSeverity): number {
    switch (severity) {
      case ComplianceSeverity.CRITICAL:
        return 3;
      case ComplianceSeverity.HIGH:
        return 2;
      case ComplianceSeverity.MEDIUM:
        return 1;
      case ComplianceSeverity.LOW:
        return 0;
      default:
        return 0;
    }
  }

  getAlerts(): ComplianceAlert[] {
    return Array.from(this.alerts.values());
  }

  getUnacknowledgedAlerts(): ComplianceAlert[] {
    return this.getAlerts().filter(alert => !alert.acknowledged);
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const _alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();
    return true;
  }
}

// 合規審計追蹤器
export class ComplianceAuditTrail {
  private auditLog: ComplianceEvent[] = [];
  private readonly maxLogSize = 10000;

  addAuditEvent(event: ComplianceEvent): void {
    this.auditLog.push(event);

    // 如果日誌超過最大大小，移除最舊的記錄
    if (this.auditLog.length > this.maxLogSize) {
      this.auditLog = this.auditLog.slice(-this.maxLogSize);
    }
  }

  getAuditLog(): ComplianceEvent[] {
    return [...this.auditLog];
  }

  getAuditLogByDateRange(startDate: Date, endDate: Date): ComplianceEvent[] {
    return this.auditLog.filter(
      event => event.timestamp >= startDate && event.timestamp <= endDate
    );
  }

  getAuditLogByUser(userId: string): ComplianceEvent[] {
    return this.auditLog.filter(event => event.metadata.userId === userId);
  }

  getAuditLogByEventType(eventType: ComplianceEventType): ComplianceEvent[] {
    return this.auditLog.filter(event => event.eventType === eventType);
  }

  exportAuditLog(format: 'json' | 'csv'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.auditLog, null, 2);
      case 'csv':
        return this.convertToCSV(this.auditLog);
      default:
        return JSON.stringify(this.auditLog, null, 2);
    }
  }

  private convertToCSV(events: ComplianceEvent[]): string {
    if (events.length === 0) return '';

    const _headers = [
      'ID',
      'Timestamp',
      'Event Type',
      'Severity',
      'Source',
      'Description',
      'Jurisdiction',
      'Regulation',
      'Status',
    ];
    const _rows = events.map(event => [
      event.id,
      event.timestamp.toISOString(),
      event.eventType,
      event.severity,
      event.source,
      event.description,
      event.jurisdiction,
      event.regulation,
      event.status,
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

// 合規監控主類
export class ComplianceMonitoring {
  private static instance: ComplianceMonitoring;
  private readonly eventTracker: ComplianceEventTracker;
  private readonly auditTrail: ComplianceAuditTrail;
  private readonly ruleEngine: ComplianceRuleEngine;
  private readonly technicalDebtManagement: TechnicalDebtManagement;
  private isInitialized = false;

  private constructor() {
    this.eventTracker = new ComplianceEventTracker();
    this.auditTrail = new ComplianceAuditTrail();
    this.ruleEngine = new ComplianceRuleEngine();
    this.technicalDebtManagement = TechnicalDebtManagement.getInstance();
  }

  public static getInstance(): ComplianceMonitoring {
    if (!ComplianceMonitoring.instance) {
      ComplianceMonitoring.instance = new ComplianceMonitoring();
    }
    return ComplianceMonitoring.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // 初始化預設合規規則
      await this.initializeDefaultRules();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('合規監控初始化失敗:', error);
      return false;
    }
  }

  private async initializeDefaultRules(): Promise<void> {
    // 隱私保護規則
    const privacyRule: ComplianceRule = {
      id: 'privacy_gdpr_consent',
      name: 'GDPR 同意檢查',
      description: '檢查用戶是否已提供 GDPR 同意',
      regulation: 'GDPR',
      jurisdiction: 'EU',
      category: ComplianceCategory.PRIVACY,
      conditions: [
        {
          field: 'eventType',
          operator: 'equals',
          value: ComplianceEventType.DATA_PROCESSING,
        },
      ],
      actions: [
        {
          type: 'ALERT',
          parameters: { message: '檢測到數據處理事件，需要 GDPR 同意' },
        },
      ],
      enabled: true,
      priority: 8,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 安全訪問規則
    const securityRule: ComplianceRule = {
      id: 'security_access_control',
      name: '訪問控制檢查',
      description: '檢查敏感數據的訪問權限',
      regulation: 'ISO 27001',
      jurisdiction: 'Global',
      category: ComplianceCategory.SECURITY,
      conditions: [
        {
          field: 'eventType',
          operator: 'equals',
          value: ComplianceEventType.ACCESS_CONTROL,
        },
      ],
      actions: [
        {
          type: 'LOG',
          parameters: { level: 'INFO' },
        },
        {
          type: 'ALERT',
          parameters: { message: '檢測到訪問控制事件' },
        },
      ],
      enabled: true,
      priority: 6,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.ruleEngine.addRule(privacyRule);
    this.ruleEngine.addRule(securityRule);
  }

  monitorEvent(event: ComplianceEvent): void {
    if (!this.isInitialized) {
      throw new Error('合規監控尚未初始化');
    }

    // 添加到事件追蹤器
    this.eventTracker.addEvent(event);

    // 添加到審計追蹤
    this.auditTrail.addAuditEvent(event);

    // 檢查是否需要創建技術債務
    if (
      event.severity === ComplianceSeverity.HIGH ||
      event.severity === ComplianceSeverity.CRITICAL
    ) {
      this.createTechnicalDebt(event);
    }
  }

  private createTechnicalDebt(event: ComplianceEvent): void {
    const _technicalDebtItem = {
      id: `compliance_${event.id}`,
      title: `合規違規: ${event.description}`,
      description: `檢測到合規違規事件，需要立即處理`,
      category: 'COMPLIANCE' as any,
      severity: 'HIGH' as any,
      priority: 'HIGH' as any,
      estimatedEffort: 8,
      impact: 'SIGNIFICANT' as any,
      location: event.source,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'IDENTIFIED' as any,
      tags: ['compliance', 'violation', event.jurisdiction.toLowerCase()],
      dependencies: [],
      metrics: {
        codeComplexity: 5,
        testCoverage: 80,
        performanceScore: 85,
        securityScore: 60,
        maintainabilityIndex: 70,
        technicalDebtRatio: 15,
      },
    };

    // 注意：這裡需要根據實際的 TechnicalDebtManagement 接口進行調整
    // this.technicalDebtManagement.addItem(technicalDebtItem);
  }

  getComplianceReport(): ComplianceReport {
    const _events = this.eventTracker.getAllEvents();
    const _summary = {
      totalEvents: events.length,
      bySeverity: this.getSeverityDistribution(events),
      byStatus: this.getStatusDistribution(events),
      byType: this.getTypeDistribution(events),
      byJurisdiction: this.getJurisdictionDistribution(events),
      openViolations: this.eventTracker.getOpenViolations().length,
      resolvedViolations: events.filter(
        e =>
          e.eventType === ComplianceEventType.VIOLATION_DETECTED &&
          e.status === ComplianceEventStatus.RESOLVED
      ).length,
    };

    const _trends = {
      newEvents: this.getNewEventsCount(events),
      resolvedEvents: this.getResolvedEventsCount(events),
      averageResolutionTime: this.getAverageResolutionTime(events),
      violationRate: this.calculateViolationRate(events),
    };

    const _recommendations = this.generateRecommendations(events);
    const _complianceScore = this.calculateComplianceScore(events);

    return {
      summary,
      events,
      trends,
      recommendations,
      complianceScore,
    };
  }

  private getSeverityDistribution(
    events: ComplianceEvent[]
  ): Record<ComplianceSeverity, number> {
    const distribution: Record<ComplianceSeverity, number> = {
      [ComplianceSeverity.LOW]: 0,
      [ComplianceSeverity.MEDIUM]: 0,
      [ComplianceSeverity.HIGH]: 0,
      [ComplianceSeverity.CRITICAL]: 0,
    };

    events.forEach(event => {
      distribution[event.severity]++;
    });

    return distribution;
  }

  private getStatusDistribution(
    events: ComplianceEvent[]
  ): Record<ComplianceEventStatus, number> {
    const distribution: Record<ComplianceEventStatus, number> = {
      [ComplianceEventStatus.OPEN]: 0,
      [ComplianceEventStatus.INVESTIGATING]: 0,
      [ComplianceEventStatus.RESOLVED]: 0,
      [ComplianceEventStatus.CLOSED]: 0,
      [ComplianceEventStatus.ESCALATED]: 0,
    };

    events.forEach(event => {
      distribution[event.status]++;
    });

    return distribution;
  }

  private getTypeDistribution(
    events: ComplianceEvent[]
  ): Record<ComplianceEventType, number> {
    const distribution: Record<ComplianceEventType, number> = {
      [ComplianceEventType.VIOLATION_DETECTED]: 0,
      [ComplianceEventType.COMPLIANCE_CHECK]: 0,
      [ComplianceEventType.AUDIT_EVENT]: 0,
      [ComplianceEventType.POLICY_UPDATE]: 0,
      [ComplianceEventType.REGULATION_CHANGE]: 0,
      [ComplianceEventType.DATA_BREACH]: 0,
      [ComplianceEventType.PRIVACY_VIOLATION]: 0,
      [ComplianceEventType.SECURITY_INCIDENT]: 0,
      [ComplianceEventType.ACCESS_CONTROL]: 0,
      [ComplianceEventType.DATA_PROCESSING]: 0,
    };

    events.forEach(event => {
      distribution[event.eventType]++;
    });

    return distribution;
  }

  private getJurisdictionDistribution(
    events: ComplianceEvent[]
  ): Record<string, number> {
    const distribution: Record<string, number> = {};

    events.forEach(event => {
      distribution[event.jurisdiction] =
        (distribution[event.jurisdiction] || 0) + 1;
    });

    return distribution;
  }

  private getNewEventsCount(events: ComplianceEvent[]): number {
    const _oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return events.filter(event => event.timestamp > oneWeekAgo).length;
  }

  private getResolvedEventsCount(events: ComplianceEvent[]): number {
    const _oneWeekAgo = new Date(Date.now() - 7 * 60 * 60 * 1000);
    return events.filter(
      event =>
        event.status === ComplianceEventStatus.RESOLVED &&
        event.timestamp > oneWeekAgo
    ).length;
  }

  private getAverageResolutionTime(events: ComplianceEvent[]): number {
    const _resolvedEvents = events.filter(
      event => event.status === ComplianceEventStatus.RESOLVED
    );
    if (resolvedEvents.length === 0) return 0;

    const _totalTime = resolvedEvents.reduce((sum, event) => {
      const _resolutionTime =
        event.timestamp.getTime() - event.timestamp.getTime();
      return sum + resolutionTime;
    }, 0);

    return totalTime / resolvedEvents.length / (1000 * 60 * 60 * 24); // 轉換為天
  }

  private calculateViolationRate(events: ComplianceEvent[]): number {
    if (events.length === 0) return 0;

    const _violations = events.filter(
      event => event.eventType === ComplianceEventType.VIOLATION_DETECTED
    );

    return (violations.length / events.length) * 100;
  }

  private generateRecommendations(
    events: ComplianceEvent[]
  ): ComplianceRecommendation[] {
    const recommendations: ComplianceRecommendation[] = [];

    // 檢查高嚴重性違規
    const _criticalViolations = events.filter(
      event =>
        event.severity === ComplianceSeverity.CRITICAL &&
        event.status !== ComplianceEventStatus.RESOLVED
    );

    if (criticalViolations.length > 0) {
      recommendations.push({
        type: 'IMMEDIATE',
        priority: ComplianceSeverity.CRITICAL,
        title: '立即處理嚴重合規違規',
        description: `發現 ${criticalViolations.length} 個嚴重合規違規需要立即處理`,
        actions: [
          '立即審查違規事件',
          '實施緊急修復措施',
          '通知相關監管機構',
          '更新合規程序',
        ],
        expectedImpact: '高',
        estimatedEffort: criticalViolations.length * 4,
        regulations: [...new Set(criticalViolations.map(v => v.regulation))],
      });
    }

    // 檢查隱私違規
    const _privacyViolations = events.filter(
      event => event.eventType === ComplianceEventType.PRIVACY_VIOLATION
    );

    if (privacyViolations.length > 0) {
      recommendations.push({
        type: 'SHORT_TERM',
        priority: ComplianceSeverity.HIGH,
        title: '加強隱私保護措施',
        description: `發現 ${privacyViolations.length} 個隱私違規事件`,
        actions: [
          '審查數據處理流程',
          '更新隱私政策',
          '加強用戶同意機制',
          '實施數據最小化原則',
        ],
        expectedImpact: '中高',
        estimatedEffort: 16,
        regulations: ['GDPR', 'CCPA', 'PDPA'],
      });
    }

    return recommendations;
  }

  private calculateComplianceScore(events: ComplianceEvent[]): number {
    if (events.length === 0) return 100;

    const _violations = events.filter(
      event => event.eventType === ComplianceEventType.VIOLATION_DETECTED
    );

    const _severityWeights = {
      [ComplianceSeverity.LOW]: 1,
      [ComplianceSeverity.MEDIUM]: 2,
      [ComplianceSeverity.HIGH]: 3,
      [ComplianceSeverity.CRITICAL]: 4,
    };

    const _totalWeight = violations.reduce((sum, violation) => {
      return sum + severityWeights[violation.severity];
    }, 0);

    const _maxPossibleWeight = events.length * 4; // 假設所有事件都是嚴重違規
    const _complianceScore = Math.max(
      0,
      100 - (totalWeight / maxPossibleWeight) * 100
    );

    return Math.round(complianceScore);
  }

  getAlerts(): ComplianceAlert[] {
    return this.eventTracker.getAlerts();
  }

  getUnacknowledgedAlerts(): ComplianceAlert[] {
    return this.eventTracker.getUnacknowledgedAlerts();
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    return this.eventTracker.acknowledgeAlert(alertId, acknowledgedBy);
  }

  getAuditLog(): ComplianceEvent[] {
    return this.auditTrail.getAuditLog();
  }

  exportAuditLog(format: 'json' | 'csv'): string {
    return this.auditTrail.exportAuditLog(format);
  }

  addRule(rule: ComplianceRule): void {
    this.ruleEngine.addRule(rule);
  }

  removeRule(ruleId: string): boolean {
    return this.ruleEngine.removeRule(ruleId);
  }

  getRules(): ComplianceRule[] {
    return this.ruleEngine.getAllRules();
  }

  getInitializationStatus(): boolean {
    return this.isInitialized;
  }
}

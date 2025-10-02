/**
 * 智能提醒系統
 * 提供基於用戶行為和市場數據的智能提醒功能
 */

import { logger } from '../utils/logger';

export interface Alert {
  id: string;
  type:
    | 'price'
    | 'opportunity'
    | 'risk'
    | 'reminder'
    | 'market'
    | 'portfolio'
    | 'custom';
  category: 'buy' | 'sell' | 'watch' | 'warning' | 'info' | 'urgent';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  description?: string;
  action?: string;
  data: AlertData;
  conditions: AlertCondition[];
  user: string;
  isActive: boolean;
  isRead: boolean;
  createdAt: Date;
  triggeredAt?: Date;
  expiresAt?: Date;
  acknowledgedAt?: Date;
  metadata: AlertMetadata;
}

export interface AlertData {
  cardId?: string;
  cardName?: string;
  currentPrice?: number;
  targetPrice?: number;
  thresholdPrice?: number;
  percentage?: number;
  volume?: number;
  marketCap?: number;
  portfolioId?: string;
  portfolioValue?: number;
  category?: string;
  subcategory?: string;
  tags?: string[];
  [key: string]: any;
}

export interface AlertCondition {
  field: string;
  operator:
    | 'greater_than'
    | 'less_than'
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'in_range'
    | 'out_of_range';
  value: any;
  threshold?: number;
  description: string;
}

export interface AlertMetadata {
  source: string;
  confidence: number; // 0-1
  priority: number; // 1-10
  tags: string[];
  relatedAlerts: string[];
  escalationLevel: number;
  autoResolve: boolean;
  notificationChannels: NotificationChannel[];
  customFields?: Record<string, any>;
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'push' | 'webhook' | 'slack' | 'teams';
  enabled: boolean;
  config: Record<string, any>;
  template?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: Alert['type'];
  category: Alert['category'];
  severity: Alert['severity'];
  conditions: AlertCondition[];
  isActive: boolean;
  cooldown: number; // milliseconds
  maxTriggers: number; // per day
  currentTriggers: number;
  lastTriggered?: Date;
  user: string;
  metadata: AlertMetadata;
}

export interface User {
  id: string;
  email: string;
  preferences: UserPreferences;
  portfolio: any;
  watchlist: any[];
  alertSettings: AlertSettings;
}

export interface UserPreferences {
  notificationFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  preferredChannels: NotificationChannel['type'][];
  quietHours: { start: string; end: string };
  timezone: string;
  language: string;
}

export interface AlertSettings {
  enablePriceAlerts: boolean;
  enableOpportunityAlerts: boolean;
  enableRiskAlerts: boolean;
  enableMarketAlerts: boolean;
  enablePortfolioAlerts: boolean;
  maxAlertsPerDay: number;
  alertAggregation: boolean;
  escalationRules: EscalationRule[];
}

export interface EscalationRule {
  condition: string;
  action: 'increase_severity' | 'notify_manager' | 'auto_resolve' | 'custom';
  parameters: Record<string, any>;
}

export interface AlertGenerationResult {
  alerts: Alert[];
  skipped: number;
  errors: string[];
  summary: {
    totalGenerated: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
  };
}

class SmartAlertSystem {
  private static instance: SmartAlertSystem;
  private alerts: Map<string, Alert> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private users: Map<string, User> = new Map();
  private marketData: Map<string, any> = new Map();
  private isInitialized = false;

  private constructor() {
    this.initializeDefaultRules();
  }

  public static getInstance(): SmartAlertSystem {
    if (!SmartAlertSystem.instance) {
      SmartAlertSystem.instance = new SmartAlertSystem();
    }
    return SmartAlertSystem.instance;
  }

  /**
   * 初始化智能提醒系統
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.loadUsers();
    await this.loadMarketData();
    await this.initializeDefaultRules();

    this.isInitialized = true;
    logger.info('Smart alert system initialized');
  }

  /**
   * 生成智能提醒
   */
  public async generateAlerts(
    user: User,
    marketData: any
  ): Promise<AlertGenerationResult> {
    logger.info('Generating smart alerts', { userId: user.id });

    try {
      const alerts: Alert[] = [];
      let skipped = 0;
      const errors: string[] = [];

      // 獲取用戶的活躍規則
      const activeRules = Array.from(this.alertRules.values()).filter(
        rule => rule.isActive && rule.user === user.id
      );

      for (const rule of activeRules) {
        try {
          // 檢查冷卻時間
          if (this.isInCooldown(rule)) {
            skipped++;
            continue;
          }

          // 檢查最大觸發次數
          if (rule.currentTriggers >= rule.maxTriggers) {
            skipped++;
            continue;
          }

          // 評估規則條件
          const shouldTrigger = await this.evaluateRuleConditions(
            rule,
            user,
            marketData
          );

          if (shouldTrigger) {
            const alert = await this.createAlert(rule, user, marketData);
            if (alert) {
              alerts.push(alert);
              this.updateRuleTrigger(rule);
              this.alerts.set(alert.id, alert);
            }
          }
        } catch (error) {
          errors.push(`Rule ${rule.id}: ${error}`);
          logger.error('Error processing alert rule', {
            ruleId: rule.id,
            error,
          });
        }
      }

      // 生成基於用戶行為的智能提醒
      const behavioralAlerts = await this.generateBehavioralAlerts(
        user,
        marketData
      );
      alerts.push(...behavioralAlerts);

      // 生成基於市場機會的提醒
      const opportunityAlerts = await this.generateOpportunityAlerts(
        user,
        marketData
      );
      alerts.push(...opportunityAlerts);

      // 生成風險提醒
      const riskAlerts = await this.generateRiskAlerts(user, marketData);
      alerts.push(...riskAlerts);

      // 聚合相似提醒
      const aggregatedAlerts = await this.aggregateSimilarAlerts(alerts);

      // 按優先級排序
      aggregatedAlerts.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });

      const summary = this.generateAlertSummary(aggregatedAlerts);

      const result: AlertGenerationResult = {
        alerts: aggregatedAlerts,
        skipped,
        errors,
        summary,
      };

      logger.info('Smart alerts generated', {
        userId: user.id,
        totalAlerts: aggregatedAlerts.length,
        skipped,
        errors: errors.length,
      });

      return result;
    } catch (error) {
      logger.error('Failed to generate smart alerts', {
        userId: user.id,
        error,
      });
      throw error;
    }
  }

  /**
   * 評估規則條件
   */
  private async evaluateRuleConditions(
    rule: AlertRule,
    user: User,
    marketData: any
  ): Promise<boolean> {
    for (const condition of rule.conditions) {
      const value = this.getValueFromData(condition.field, user, marketData);
      const shouldTrigger = this.evaluateCondition(condition, value);

      if (!shouldTrigger) {
        return false;
      }
    }

    return true;
  }

  /**
   * 評估單個條件
   */
  private evaluateCondition(condition: AlertCondition, value: any): boolean {
    switch (condition.operator) {
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'not_contains':
        return !String(value).includes(String(condition.value));
      case 'in_range':
        return (
          Number(value) >= Number(condition.value) &&
          Number(value) <= Number(condition.threshold)
        );
      case 'out_of_range':
        return (
          Number(value) < Number(condition.value) ||
          Number(value) > Number(condition.threshold)
        );
      default:
        return false;
    }
  }

  /**
   * 從數據中獲取值
   */
  private getValueFromData(field: string, user: User, marketData: any): any {
    const fields = field.split('.');
    let value: any = { user, marketData };

    for (const f of fields) {
      value = value?.[f];
    }

    return value;
  }

  /**
   * 創建提醒
   */
  private async createAlert(
    rule: AlertRule,
    user: User,
    marketData: any
  ): Promise<Alert | null> {
    const alertData = await this.extractAlertData(rule, user, marketData);

    if (!alertData) {
      return null;
    }

    const alert: Alert = {
      id: `alert_${rule.id}_${Date.now()}`,
      type: rule.type,
      category: rule.category,
      severity: rule.severity,
      title: this.generateAlertTitle(rule, alertData),
      message: this.generateAlertMessage(rule, alertData),
      description: this.generateAlertDescription(rule, alertData),
      action: this.generateAlertAction(rule, alertData),
      data: alertData,
      conditions: rule.conditions,
      user: user.id,
      isActive: true,
      isRead: false,
      createdAt: new Date(),
      triggeredAt: new Date(),
      expiresAt: this.calculateExpirationDate(rule),
      metadata: {
        ...rule.metadata,
        confidence: await this.calculateAlertConfidence(rule, alertData),
      },
    };

    return alert;
  }

  /**
   * 提取提醒數據
   */
  private async extractAlertData(
    rule: AlertRule,
    user: User,
    marketData: any
  ): Promise<AlertData | null> {
    // 根據規則類型提取相關數據
    switch (rule.type) {
      case 'price':
        return this.extractPriceAlertData(rule, user, marketData);
      case 'opportunity':
        return this.extractOpportunityAlertData(rule, user, marketData);
      case 'risk':
        return this.extractRiskAlertData(rule, user, marketData);
      case 'portfolio':
        return this.extractPortfolioAlertData(rule, user, marketData);
      case 'market':
        return this.extractMarketAlertData(rule, user, marketData);
      default:
        return {};
    }
  }

  /**
   * 提取價格提醒數據
   */
  private extractPriceAlertData(
    rule: AlertRule,
    user: User,
    marketData: any
  ): AlertData | null {
    // 從用戶的關注列表中找到相關卡片
    const watchedCard = user.watchlist.find(card =>
      rule.conditions.some(
        condition =>
          condition.field.includes(card.id) ||
          condition.field.includes(card.name)
      )
    );

    if (!watchedCard) return null;

    const currentPrice = marketData.cards?.[watchedCard.id]?.price;
    if (!currentPrice) return null;

    return {
      cardId: watchedCard.id,
      cardName: watchedCard.name,
      currentPrice,
      category: watchedCard.category,
      subcategory: watchedCard.subcategory,
      tags: watchedCard.tags,
    };
  }

  /**
   * 提取機會提醒數據
   */
  private extractOpportunityAlertData(
    rule: AlertRule,
    user: User,
    marketData: any
  ): AlertData | null {
    // 分析市場數據尋找機會
    const opportunities = this.identifyMarketOpportunities(marketData, user);

    if (opportunities.length === 0) return null;

    const opportunity = opportunities[0]; // 選擇最佳機會
    return {
      cardId: opportunity.cardId,
      cardName: opportunity.cardName,
      currentPrice: opportunity.currentPrice,
      targetPrice: opportunity.targetPrice,
      percentage: opportunity.expectedReturn,
      category: opportunity.category,
      tags: opportunity.tags,
    };
  }

  /**
   * 提取風險提醒數據
   */
  private extractRiskAlertData(
    rule: AlertRule,
    user: User,
    marketData: any
  ): AlertData | null {
    // 分析用戶投資組合的風險
    const risks = this.identifyPortfolioRisks(user.portfolio, marketData);

    if (risks.length === 0) return null;

    const risk = risks[0]; // 選擇最嚴重的風險
    return {
      portfolioId: user.portfolio.id,
      portfolioValue: user.portfolio.totalValue,
      currentPrice: risk.currentValue,
      thresholdPrice: risk.thresholdValue,
      percentage: risk.riskPercentage,
      category: risk.category,
      tags: risk.tags,
    };
  }

  /**
   * 提取投資組合提醒數據
   */
  private extractPortfolioAlertData(
    rule: AlertRule,
    user: User,
    marketData: any
  ): AlertData | null {
    const portfolio = user.portfolio;
    if (!portfolio) return null;

    return {
      portfolioId: portfolio.id,
      portfolioValue: portfolio.totalValue,
      percentage: this.calculatePortfolioChange(portfolio, marketData),
      category: 'portfolio',
    };
  }

  /**
   * 提取市場提醒數據
   */
  private extractMarketAlertData(
    rule: AlertRule,
    user: User,
    marketData: any
  ): AlertData | null {
    return {
      category: 'market',
      percentage: marketData.overallChange,
      volume: marketData.totalVolume,
      marketCap: marketData.totalMarketCap,
    };
  }

  /**
   * 生成提醒標題
   */
  private generateAlertTitle(rule: AlertRule, data: AlertData): string {
    switch (rule.type) {
      case 'price':
        return `${data.cardName} Price Alert`;
      case 'opportunity':
        return `Investment Opportunity: ${data.cardName}`;
      case 'risk':
        return `Risk Alert: ${data.category}`;
      case 'portfolio':
        return `Portfolio Alert`;
      case 'market':
        return `Market Alert: ${data.category}`;
      default:
        return rule.name;
    }
  }

  /**
   * 生成提醒消息
   */
  private generateAlertMessage(rule: AlertRule, data: AlertData): string {
    switch (rule.type) {
      case 'price':
        return `${data.cardName} has reached your target price of $${data.targetPrice}`;
      case 'opportunity':
        return `Potential ${data.percentage}% return opportunity detected for ${data.cardName}`;
      case 'risk':
        return `High risk detected in ${data.category}: ${data.percentage}% loss threshold exceeded`;
      case 'portfolio':
        return `Portfolio value has changed by ${data.percentage}%`;
      case 'market':
        return `Market ${data.category} has changed by ${data.percentage}%`;
      default:
        return rule.description;
    }
  }

  /**
   * 生成提醒描述
   */
  private generateAlertDescription(rule: AlertRule, data: AlertData): string {
    return `${rule.description} - Current value: ${JSON.stringify(data)}`;
  }

  /**
   * 生成提醒操作
   */
  private generateAlertAction(rule: AlertRule, data: AlertData): string {
    switch (rule.category) {
      case 'buy':
        return 'Consider buying this card';
      case 'sell':
        return 'Consider selling this position';
      case 'watch':
        return 'Monitor this opportunity';
      case 'warning':
        return 'Review your portfolio';
      case 'info':
        return 'Stay informed';
      case 'urgent':
        return 'Take immediate action';
      default:
        return 'Review this alert';
    }
  }

  /**
   * 計算過期日期
   */
  private calculateExpirationDate(rule: AlertRule): Date {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24); // 24小時後過期
    return expiration;
  }

  /**
   * 計算提醒置信度
   */
  private async calculateAlertConfidence(
    rule: AlertRule,
    data: AlertData
  ): Promise<number> {
    // 基於規則條件和數據質量計算置信度
    let confidence = 0.5; // 基礎置信度

    // 根據條件數量調整
    confidence += rule.conditions.length * 0.1;

    // 根據數據完整性調整
    const dataCompleteness = this.calculateDataCompleteness(data);
    confidence += dataCompleteness * 0.2;

    // 根據規則歷史準確性調整
    const ruleAccuracy = await this.getRuleAccuracy(rule.id);
    confidence += ruleAccuracy * 0.3;

    return Math.min(1.0, Math.max(0.0, confidence));
  }

  /**
   * 生成基於行為的提醒
   */
  private async generateBehavioralAlerts(
    user: User,
    marketData: any
  ): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // 分析用戶行為模式
    const behaviorPattern = await this.analyzeUserBehavior(user);

    // 生成基於行為的提醒
    if (behaviorPattern.shouldNotify) {
      alerts.push({
        id: `behavioral_${user.id}_${Date.now()}`,
        type: 'reminder',
        category: 'info',
        severity: 'medium',
        title: 'Behavioral Insight',
        message: behaviorPattern.message,
        description: behaviorPattern.description,
        action: behaviorPattern.action,
        data: behaviorPattern.data,
        conditions: [],
        user: user.id,
        isActive: true,
        isRead: false,
        createdAt: new Date(),
        triggeredAt: new Date(),
        metadata: {
          source: 'behavioral_analysis',
          confidence: behaviorPattern.confidence,
          priority: 5,
          tags: ['behavioral', 'insight'],
          relatedAlerts: [],
          escalationLevel: 1,
          autoResolve: true,
          notificationChannels: [],
        },
      });
    }

    return alerts;
  }

  /**
   * 生成機會提醒
   */
  private async generateOpportunityAlerts(
    user: User,
    marketData: any
  ): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const opportunities = this.identifyMarketOpportunities(marketData, user);

    for (const opportunity of opportunities.slice(0, 3)) {
      // 限制最多3個機會
      alerts.push({
        id: `opportunity_${opportunity.id}_${Date.now()}`,
        type: 'opportunity',
        category: 'buy',
        severity: opportunity.expectedReturn > 20 ? 'high' : 'medium',
        title: `Investment Opportunity: ${opportunity.cardName}`,
        message: `Potential ${opportunity.expectedReturn}% return in ${opportunity.timeframe}`,
        description: opportunity.description,
        action: 'Consider adding to watchlist',
        data: {
          cardId: opportunity.cardId,
          cardName: opportunity.cardName,
          currentPrice: opportunity.currentPrice,
          targetPrice: opportunity.targetPrice,
          percentage: opportunity.expectedReturn,
          category: opportunity.category,
        },
        conditions: [],
        user: user.id,
        isActive: true,
        isRead: false,
        createdAt: new Date(),
        triggeredAt: new Date(),
        metadata: {
          source: 'opportunity_detection',
          confidence: opportunity.confidence,
          priority: opportunity.expectedReturn > 20 ? 8 : 6,
          tags: ['opportunity', opportunity.category],
          relatedAlerts: [],
          escalationLevel: 1,
          autoResolve: false,
          notificationChannels: [],
        },
      });
    }

    return alerts;
  }

  /**
   * 生成風險提醒
   */
  private async generateRiskAlerts(
    user: User,
    marketData: any
  ): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const risks = this.identifyPortfolioRisks(user.portfolio, marketData);

    for (const risk of risks) {
      if (risk.severity === 'critical' || risk.severity === 'high') {
        alerts.push({
          id: `risk_${risk.id}_${Date.now()}`,
          type: 'risk',
          category: 'warning',
          severity: risk.severity,
          title: `Risk Alert: ${risk.category}`,
          message: risk.message,
          description: risk.description,
          action: risk.action,
          data: {
            portfolioId: user.portfolio.id,
            portfolioValue: user.portfolio.totalValue,
            currentPrice: risk.currentValue,
            thresholdPrice: risk.thresholdValue,
            percentage: risk.riskPercentage,
            category: risk.category,
          },
          conditions: [],
          user: user.id,
          isActive: true,
          isRead: false,
          createdAt: new Date(),
          triggeredAt: new Date(),
          metadata: {
            source: 'risk_analysis',
            confidence: risk.confidence,
            priority: risk.severity === 'critical' ? 10 : 8,
            tags: ['risk', risk.category],
            relatedAlerts: [],
            escalationLevel: risk.severity === 'critical' ? 3 : 2,
            autoResolve: false,
            notificationChannels: [],
          },
        });
      }
    }

    return alerts;
  }

  /**
   * 聚合相似提醒
   */
  private async aggregateSimilarAlerts(alerts: Alert[]): Promise<Alert[]> {
    const aggregated: Alert[] = [];
    const grouped = new Map<string, Alert[]>();

    // 按類型和嚴重程度分組
    for (const alert of alerts) {
      const key = `${alert.type}_${alert.category}_${alert.severity}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(alert);
    }

    // 聚合每個組
    for (const [key, group] of grouped.entries()) {
      if (group.length === 1) {
        aggregated.push(group[0]);
      } else {
        const aggregatedAlert = await this.aggregateAlertGroup(group);
        aggregated.push(aggregatedAlert);
      }
    }

    return aggregated;
  }

  /**
   * 聚合提醒組
   */
  private async aggregateAlertGroup(alerts: Alert[]): Promise<Alert> {
    const baseAlert = alerts[0];
    const count = alerts.length;

    return {
      ...baseAlert,
      id: `aggregated_${baseAlert.type}_${Date.now()}`,
      title: `${count} ${baseAlert.type} alerts`,
      message: `${count} similar ${baseAlert.type} alerts have been triggered`,
      description: `Multiple ${baseAlert.type} alerts aggregated for efficiency`,
      metadata: {
        ...baseAlert.metadata,
        aggregatedCount: count,
        originalAlerts: alerts.map(a => a.id),
      },
    };
  }

  /**
   * 生成提醒摘要
   */
  private generateAlertSummary(alerts: Alert[]): any {
    const byType = alerts.reduce(
      (acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const bySeverity = alerts.reduce(
      (acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byCategory = alerts.reduce(
      (acc, alert) => {
        acc[alert.category] = (acc[alert.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalGenerated: alerts.length,
      byType,
      bySeverity,
      byCategory,
    };
  }

  // 輔助方法
  private isInCooldown(rule: AlertRule): boolean {
    if (!rule.lastTriggered) return false;
    return Date.now() - rule.lastTriggered.getTime() < rule.cooldown;
  }

  private updateRuleTrigger(rule: AlertRule): void {
    rule.currentTriggers++;
    rule.lastTriggered = new Date();

    // 重置每日計數器
    const now = new Date();
    const lastTriggered = rule.lastTriggered;
    if (now.toDateString() !== lastTriggered.toDateString()) {
      rule.currentTriggers = 1;
    }
  }

  private calculateDataCompleteness(data: AlertData): number {
    const fields = Object.keys(data);
    const nonEmptyFields = fields.filter(
      key => data[key] !== null && data[key] !== undefined
    );
    return nonEmptyFields.length / fields.length;
  }

  private async getRuleAccuracy(ruleId: string): Promise<number> {
    // 這裡應該從歷史數據計算規則準確性
    return 0.8; // 默認80%準確性
  }

  private async analyzeUserBehavior(user: User): Promise<any> {
    // 分析用戶行為模式
    return {
      shouldNotify: false,
      message: '',
      description: '',
      action: '',
      data: {},
      confidence: 0.5,
    };
  }

  private identifyMarketOpportunities(marketData: any, user: User): any[] {
    // 識別市場機會
    return [];
  }

  private identifyPortfolioRisks(portfolio: any, marketData: any): any[] {
    // 識別投資組合風險
    return [];
  }

  private calculatePortfolioChange(portfolio: any, marketData: any): number {
    // 計算投資組合變化
    return 0;
  }

  private async loadUsers(): Promise<void> {
    // 加載用戶數據
    logger.info('Users loaded');
  }

  private async loadMarketData(): Promise<void> {
    // 加載市場數據
    logger.info('Market data loaded');
  }

  private initializeDefaultRules(): void {
    // 初始化默認規則
    logger.info('Default alert rules initialized');
  }

  /**
   * 添加提醒規則
   */
  public addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    logger.info('Alert rule added', { ruleId: rule.id });
  }

  /**
   * 移除提醒規則
   */
  public removeAlertRule(ruleId: string): void {
    this.alertRules.delete(ruleId);
    logger.info('Alert rule removed', { ruleId });
  }

  /**
   * 更新提醒規則
   */
  public updateAlertRule(ruleId: string, updates: Partial<AlertRule>): void {
    const rule = this.alertRules.get(ruleId);
    if (rule) {
      this.alertRules.set(ruleId, { ...rule, ...updates });
      logger.info('Alert rule updated', { ruleId });
    }
  }

  /**
   * 標記提醒為已讀
   */
  public markAlertAsRead(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.isRead = true;
      alert.acknowledgedAt = new Date();
      logger.debug('Alert marked as read', { alertId });
    }
  }

  /**
   * 獲取用戶提醒
   */
  public getUserAlerts(userId: string): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => alert.user === userId && alert.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * 獲取提醒統計
   */
  public getAlertStats(): {
    totalAlerts: number;
    activeAlerts: number;
    readAlerts: number;
    alertsByType: Record<string, number>;
    alertsBySeverity: Record<string, number>;
    averageResponseTime: number;
  } {
    const alerts = Array.from(this.alerts.values());
    const activeAlerts = alerts.filter(a => a.isActive);
    const readAlerts = alerts.filter(a => a.isRead);

    const alertsByType = alerts.reduce(
      (acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const alertsBySeverity = alerts.reduce(
      (acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const averageResponseTime =
      readAlerts.length > 0
        ? readAlerts.reduce((sum, alert) => {
            if (alert.acknowledgedAt && alert.triggeredAt) {
              return (
                sum +
                (alert.acknowledgedAt.getTime() - alert.triggeredAt.getTime())
              );
            }
            return sum;
          }, 0) / readAlerts.length
        : 0;

    return {
      totalAlerts: alerts.length,
      activeAlerts: activeAlerts.length,
      readAlerts: readAlerts.length,
      alertsByType,
      alertsBySeverity,
      averageResponseTime,
    };
  }

  /**
   * 清除過期提醒
   */
  public clearExpiredAlerts(): void {
    const now = new Date();
    let clearedCount = 0;

    for (const [id, alert] of this.alerts.entries()) {
      if (alert.expiresAt && alert.expiresAt < now) {
        this.alerts.delete(id);
        clearedCount++;
      }
    }

    logger.info('Expired alerts cleared', { count: clearedCount });
  }
}

export default SmartAlertSystem;

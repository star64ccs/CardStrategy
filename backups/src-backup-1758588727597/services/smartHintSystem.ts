/**
 * 智能提示系統
 * 基於用戶行為和當前狀態提供上下文相關的智能提示
 */

import { logger } from '../utils/logger';

export interface Hint {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'tip';
  title: string;
  message: string;
  action?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category:
    | 'navigation'
    | 'feature'
    | 'optimization'
    | 'error'
    | 'tutorial'
    | 'reminder';
  context: string[];
  conditions: HintCondition[];
  expiresAt?: Date;
  dismissedAt?: Date;
  autoHide?: boolean;
  autoHideDelay?: number;
  icon?: string;
  color?: string;
  position?: 'top' | 'bottom' | 'center' | 'floating';
}

export interface HintCondition {
  type: 'user_action' | 'state' | 'time' | 'frequency' | 'error' | 'success';
  operator:
    | 'equals'
    | 'not_equals'
    | 'greater_than'
    | 'less_than'
    | 'contains'
    | 'exists';
  value: any;
  field: string;
}

export interface UserContext {
  currentScreen: string;
  userActions: string[];
  errors: string[];
  successes: string[];
  sessionDuration: number;
  featureUsage: Record<string, number>;
  lastAction: string;
  lastActionTime: Date;
  isNewUser: boolean;
  userLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferences: Record<string, any>;
  deviceInfo: {
    platform: string;
    screenSize: string;
    connectionType: string;
  };
}

export interface HintRule {
  id: string;
  name: string;
  description: string;
  conditions: HintCondition[];
  hint: Omit<Hint, 'id' | 'conditions'>;
  enabled: boolean;
  priority: number;
  cooldown: number; // 冷卻時間（毫秒）
  maxShows: number; // 最大顯示次數
  currentShows: number;
  lastShown?: Date;
}

class SmartHintSystem {
  private static instance: SmartHintSystem;
  private hints: Map<string, Hint> = new Map();
  private rules: Map<string, HintRule> = new Map();
  private userContext: UserContext;
  private hintHistory: Array<{
    hintId: string;
    shownAt: Date;
    dismissedAt?: Date;
  }> = [];
  private isInitialized = false;

  private constructor() {
    this.userContext = this.getDefaultUserContext();
    this.initializeDefaultRules();
  }

  public static getInstance(): SmartHintSystem {
    if (!SmartHintSystem.instance) {
      SmartHintSystem.instance = new SmartHintSystem();
    }
    return SmartHintSystem.instance;
  }

  /**
   * 初始化智能提示系統
   */
  public async initialize(userContext?: Partial<UserContext>): Promise<void> {
    if (this.isInitialized) return;

    if (userContext) {
      this.userContext = { ...this.userContext, ...userContext };
    }

    await this.loadHintRules();
    await this.loadUserPreferences();

    this.isInitialized = true;
    logger.info('Smart hint system initialized', { context: this.userContext });
  }

  /**
   * 更新用戶上下文
   */
  public updateUserContext(updates: Partial<UserContext>): void {
    this.userContext = { ...this.userContext, ...updates };
    logger.debug('User context updated', { updates });
  }

  /**
   * 記錄用戶行為
   */
  public recordUserAction(action: string, metadata?: any): void {
    this.userContext.userActions.push(action);
    this.userContext.lastAction = action;
    this.userContext.lastActionTime = new Date();

    // 更新功能使用統計
    if (!this.userContext.featureUsage[action]) {
      this.userContext.featureUsage[action] = 0;
    }
    this.userContext.featureUsage[action]++;

    logger.debug('User action recorded', { action, metadata });
  }

  /**
   * 記錄錯誤
   */
  public recordError(error: string, metadata?: any): void {
    this.userContext.errors.push(error);
    logger.debug('Error recorded', { error, metadata });
  }

  /**
   * 記錄成功操作
   */
  public recordSuccess(success: string, metadata?: any): void {
    this.userContext.successes.push(success);
    logger.debug('Success recorded', { success, metadata });
  }

  /**
   * 生成智能提示
   */
  public generateHints(context?: Partial<UserContext>): Hint[] {
    const currentContext = context
      ? { ...this.userContext, ...context }
      : this.userContext;
    const activeHints: Hint[] = [];

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      // 檢查冷卻時間
      if (
        rule.lastShown &&
        Date.now() - rule.lastShown.getTime() < rule.cooldown
      ) {
        continue;
      }

      // 檢查最大顯示次數
      if (rule.currentShows >= rule.maxShows) {
        continue;
      }

      // 檢查條件
      if (this.evaluateConditions(rule.conditions, currentContext)) {
        const hint: Hint = {
          ...rule.hint,
          id: rule.id,
          conditions: rule.conditions,
        };

        activeHints.push(hint);
        rule.currentShows++;
        rule.lastShown = new Date();
      }
    }

    // 按優先級排序
    activeHints.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    logger.debug('Generated hints', { count: activeHints.length });
    return activeHints;
  }

  /**
   * 獲取特定類型的提示
   */
  public getHintsByCategory(category: Hint['category']): Hint[] {
    return Array.from(this.hints.values()).filter(
      hint => hint.category === category
    );
  }

  /**
   * 獲取特定優先級的提示
   */
  public getHintsByPriority(priority: Hint['priority']): Hint[] {
    return Array.from(this.hints.values()).filter(
      hint => hint.priority === priority
    );
  }

  /**
   * 添加自定義提示規則
   */
  public addHintRule(rule: HintRule): void {
    this.rules.set(rule.id, rule);
    logger.info('Hint rule added', { ruleId: rule.id });
  }

  /**
   * 移除提示規則
   */
  public removeHintRule(ruleId: string): void {
    this.rules.delete(ruleId);
    logger.info('Hint rule removed', { ruleId });
  }

  /**
   * 更新提示規則
   */
  public updateHintRule(ruleId: string, updates: Partial<HintRule>): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      this.rules.set(ruleId, { ...rule, ...updates });
      logger.info('Hint rule updated', { ruleId });
    }
  }

  /**
   * 標記提示為已讀
   */
  public markHintAsRead(hintId: string): void {
    const hint = this.hints.get(hintId);
    if (hint) {
      hint.dismissedAt = new Date();
      this.hintHistory.push({
        hintId,
        shownAt: new Date(),
        dismissedAt: new Date(),
      });
      logger.debug('Hint marked as read', { hintId });
    }
  }

  /**
   * 獲取提示統計
   */
  public getHintStats(): {
    totalHints: number;
    activeHints: number;
    dismissedHints: number;
    hintsByCategory: Record<string, number>;
    hintsByPriority: Record<string, number>;
    averageDismissalTime: number;
  } {
    const hints = Array.from(this.hints.values());
    const activeHints = hints.filter(h => !h.dismissedAt);
    const dismissedHints = hints.filter(h => h.dismissedAt);

    const hintsByCategory = hints.reduce(
      (acc, hint) => {
        acc[hint.category] = (acc[hint.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const hintsByPriority = hints.reduce(
      (acc, hint) => {
        acc[hint.priority] = (acc[hint.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const averageDismissalTime =
      dismissedHints.length > 0
        ? dismissedHints.reduce((sum, hint) => {
            if (hint.dismissedAt) {
              return sum + (hint.dismissedAt.getTime() - Date.now());
            }
            return sum;
          }, 0) / dismissedHints.length
        : 0;

    return {
      totalHints: hints.length,
      activeHints: activeHints.length,
      dismissedHints: dismissedHints.length,
      hintsByCategory,
      hintsByPriority,
      averageDismissalTime,
    };
  }

  /**
   * 評估提示條件
   */
  private evaluateConditions(
    conditions: HintCondition[],
    context: UserContext
  ): boolean {
    return conditions.every(condition => {
      const value = this.getValueFromContext(condition.field, context);
      return this.evaluateCondition(condition, value);
    });
  }

  /**
   * 評估單個條件
   */
  private evaluateCondition(condition: HintCondition, value: any): boolean {
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'exists':
        return value !== undefined && value !== null;
      default:
        return false;
    }
  }

  /**
   * 從上下文中獲取值
   */
  private getValueFromContext(field: string, context: UserContext): any {
    const fields = field.split('.');
    let value: any = context;

    for (const f of fields) {
      value = value?.[f];
    }

    return value;
  }

  /**
   * 獲取默認用戶上下文
   */
  private getDefaultUserContext(): UserContext {
    return {
      currentScreen: 'home',
      userActions: [],
      errors: [],
      successes: [],
      sessionDuration: 0,
      featureUsage: {},
      lastAction: '',
      lastActionTime: new Date(),
      isNewUser: true,
      userLevel: 'beginner',
      preferences: {},
      deviceInfo: {
        platform: 'unknown',
        screenSize: 'unknown',
        connectionType: 'unknown',
      },
    };
  }

  /**
   * 初始化默認提示規則
   */
  private initializeDefaultRules(): void {
    const defaultRules: HintRule[] = [
      {
        id: 'welcome_new_user',
        name: '歡迎新用戶',
        description: '向新用戶顯示歡迎提示',
        conditions: [
          {
            type: 'user_action',
            operator: 'equals',
            value: 'first_visit',
            field: 'lastAction',
          },
          {
            type: 'state',
            operator: 'equals',
            value: true,
            field: 'isNewUser',
          },
        ],
        hint: {
          type: 'info',
          title: '歡迎使用 CardStrategy！',
          message: '開始探索我們的卡牌分析功能吧！',
          priority: 'high',
          category: 'tutorial',
          context: ['home', 'dashboard'],
          autoHide: true,
          autoHideDelay: 5000,
          icon: 'welcome',
          color: '#4CAF50',
        },
        enabled: true,
        priority: 1,
        cooldown: 0,
        maxShows: 1,
        currentShows: 0,
      },
      {
        id: 'feature_discovery',
        name: '功能發現提示',
        description: '提示用戶未使用的功能',
        conditions: [
          {
            type: 'frequency',
            operator: 'less_than',
            value: 3,
            field: 'featureUsage.scan',
          },
          {
            type: 'state',
            operator: 'greater_than',
            value: 300000,
            field: 'sessionDuration',
          }, // 5分鐘後
        ],
        hint: {
          type: 'tip',
          title: '發現新功能！',
          message: '試試我們的卡牌掃描功能，快速識別您的收藏品！',
          priority: 'medium',
          category: 'feature',
          context: ['home', 'scan'],
          action: '開始掃描',
          autoHide: true,
          autoHideDelay: 8000,
          icon: 'scan',
          color: '#2196F3',
        },
        enabled: true,
        priority: 2,
        cooldown: 3600000, // 1小時
        maxShows: 3,
        currentShows: 0,
      },
      {
        id: 'error_help',
        name: '錯誤幫助提示',
        description: '當用戶遇到錯誤時提供幫助',
        conditions: [
          { type: 'error', operator: 'exists', value: true, field: 'errors' },
        ],
        hint: {
          type: 'warning',
          title: '需要幫助？',
          message: '看起來您遇到了問題，讓我們來幫助您解決！',
          priority: 'high',
          category: 'error',
          context: ['error', 'scan', 'analysis'],
          action: '獲取幫助',
          autoHide: false,
          icon: 'help',
          color: '#FF9800',
        },
        enabled: true,
        priority: 3,
        cooldown: 1800000, // 30分鐘
        maxShows: 5,
        currentShows: 0,
      },
      {
        id: 'performance_tip',
        name: '性能優化提示',
        description: '提示用戶優化應用性能',
        conditions: [
          {
            type: 'frequency',
            operator: 'greater_than',
            value: 10,
            field: 'userActions.length',
          },
          {
            type: 'state',
            operator: 'greater_than',
            value: 600000,
            field: 'sessionDuration',
          }, // 10分鐘後
        ],
        hint: {
          type: 'tip',
          title: '優化建議',
          message: '關閉不必要的功能可以提升應用性能！',
          priority: 'low',
          category: 'optimization',
          context: ['settings', 'performance'],
          action: '查看設置',
          autoHide: true,
          autoHideDelay: 6000,
          icon: 'optimize',
          color: '#9C27B0',
        },
        enabled: true,
        priority: 4,
        cooldown: 7200000, // 2小時
        maxShows: 2,
        currentShows: 0,
      },
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });

    logger.info('Default hint rules initialized', {
      count: defaultRules.length,
    });
  }

  /**
   * 加載提示規則
   */
  private async loadHintRules(): Promise<void> {
    // 這裡可以從本地存儲或服務器加載自定義規則
    // 暫時使用默認規則
    logger.debug('Hint rules loaded');
  }

  /**
   * 加載用戶偏好
   */
  private async loadUserPreferences(): Promise<void> {
    // 這裡可以從本地存儲加載用戶偏好
    logger.debug('User preferences loaded');
  }
}

export default SmartHintSystem;

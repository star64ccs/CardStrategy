import { logger } from '../../../core/utils/logger';

export interface RateLimitRule {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  windowMs: number; // 時間窗口（毫秒）
  maxRequests: number; // 最大請求數
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: unknown) => string;
  onLimitReached?: (req: unknown) => void;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RateLimitConfig {
  defaultWindowMs: number;
  defaultMaxRequests: number;
  enableGlobalLimit: boolean;
  globalWindowMs: number;
  globalMaxRequests: number;
  trustProxy: boolean;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  status: RateLimitStatus;
  rule?: RateLimitRule;
  reason?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

export class RateLimitService {
  private readonly config: RateLimitConfig;
  private isInitialized = false;
  private readonly rules: Map<string, RateLimitRule> = new Map();
  private readonly requestCounts: Map<
    string,
    Map<string, { count: number; resetTime: number }>
  > = new Map();
  private readonly globalCounts: Map<
    string,
    { count: number; resetTime: number }
  > = new Map();

  constructor() {
    this.config = {
      defaultWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 分鐘
      defaultMaxRequests: parseInt(
        process.env.RATE_LIMIT_MAX_REQUESTS || '100'
      ),
      enableGlobalLimit: process.env.RATE_LIMIT_ENABLE_GLOBAL === 'true',
      globalWindowMs: parseInt(
        process.env.RATE_LIMIT_GLOBAL_WINDOW_MS || '900000'
      ), // 15 分鐘
      globalMaxRequests: parseInt(
        process.env.RATE_LIMIT_GLOBAL_MAX_REQUESTS || '1000'
      ),
      trustProxy: process.env.RATE_LIMIT_TRUST_PROXY === 'true',
      standardHeaders: process.env.RATE_LIMIT_STANDARD_HEADERS !== 'false',
      legacyHeaders: process.env.RATE_LIMIT_LEGACY_HEADERS === 'true',
    };
  }

  isAvailable(): boolean {
    return this.isInitialized;
  }

  async initialize(): Promise<ApiResponse> {
    try {
      logger.info('初始化速率限制服務');

      // 創建默認規則
      await this.createDefaultRules();

      // 啟動清理定時器
      this.startCleanupTimer();

      this.isInitialized = true;
      logger.info('速率限制服務初始化完成');

      return {
        success: true,
        data: {
          defaultWindowMs: this.config.defaultWindowMs,
          defaultMaxRequests: this.config.defaultMaxRequests,
          enableGlobalLimit: this.config.enableGlobalLimit,
          totalRules: this.rules.size,
        },
        message: '速率限制服務初始化成功',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('速率限制服務初始化失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  // 規則管理
  async createRule(
    rule: Omit<RateLimitRule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<RateLimitRule>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '速率限制服務未初始化',
          timestamp: Date.now(),
        };
      }

      const id = this.generateId();
      const now = new Date();
      const newRule: RateLimitRule = {
        ...rule,
        id,
        createdAt: now,
        updatedAt: now,
      };

      this.rules.set(id, newRule);
      logger.info(`創建速率限制規則: ${rule.name}`);

      return {
        success: true,
        data: newRule,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('創建速率限制規則失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  async updateRule(
    id: string,
    updates: Partial<RateLimitRule>
  ): Promise<ApiResponse<RateLimitRule>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '速率限制服務未初始化',
          timestamp: Date.now(),
        };
      }

      const rule = this.rules.get(id);
      if (!rule) {
        return {
          success: false,
          error: '規則不存在',
          timestamp: Date.now(),
        };
      }

      const updatedRule = {
        ...rule,
        ...updates,
        updatedAt: new Date(),
      };

      this.rules.set(id, updatedRule);
      logger.info(`更新速率限制規則: ${rule.name}`);

      return {
        success: true,
        data: updatedRule,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('更新速率限制規則失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  async deleteRule(id: string): Promise<ApiResponse> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '速率限制服務未初始化',
          timestamp: Date.now(),
        };
      }

      const rule = this.rules.get(id);
      if (!rule) {
        return {
          success: false,
          error: '規則不存在',
          timestamp: Date.now(),
        };
      }

      this.rules.delete(id);
      // 清理相關的計數器
      this.requestCounts.delete(id);
      logger.info(`刪除速率限制規則: ${rule.name}`);

      return {
        success: true,
        message: '規則已刪除',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('刪除速率限制規則失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  // 速率限制檢查
  async checkLimit(request: {
    endpoint: string;
    method: string;
    clientId: string;
    ip?: string;
    userId?: string;
  }): Promise<ApiResponse<RateLimitResult>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '速率限制服務未初始化',
          timestamp: Date.now(),
        };
      }

      const { endpoint, method, clientId, ip, userId } = request;

      // 檢查全局限制
      if (this.config.enableGlobalLimit) {
        const globalResult = this.checkGlobalLimit(clientId);
        if (!globalResult.allowed) {
          return {
            success: true,
            data: globalResult,
            timestamp: Date.now(),
          };
        }
      }

      // 查找匹配的規則
      const matchingRule = this.findMatchingRule(endpoint, method);
      if (!matchingRule?.enabled) {
        // 沒有匹配的規則，使用默認限制
        const defaultResult = this.checkDefaultLimit(clientId);
        return {
          success: true,
          data: defaultResult,
          timestamp: Date.now(),
        };
      }

      // 檢查特定規則限制
      const ruleResult = this.checkRuleLimit(
        matchingRule,
        clientId,
        ip,
        userId
      );

      // 記錄限制檢查
      if (!ruleResult.allowed) {
        logger.warn(`速率限制觸發: ${clientId} - ${endpoint} ${method}`);
        if (matchingRule.onLimitReached) {
          matchingRule.onLimitReached({
            clientId,
            endpoint,
            method,
            ip,
            userId,
          });
        }
      }

      return {
        success: true,
        data: ruleResult,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('速率限制檢查失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  // 記錄請求
  async recordRequest(request: {
    endpoint: string;
    method: string;
    clientId: string;
    ip?: string;
    userId?: string;
    success: boolean;
  }): Promise<ApiResponse> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '速率限制服務未初始化',
          timestamp: Date.now(),
        };
      }

      const { endpoint, method, clientId, success } = request;

      // 記錄全局請求
      if (this.config.enableGlobalLimit) {
        this.recordGlobalRequest(clientId);
      }

      // 查找匹配的規則
      const matchingRule = this.findMatchingRule(endpoint, method);
      if (matchingRule && matchingRule.enabled) {
        // 檢查是否應該跳過此請求
        if (success && matchingRule.skipSuccessfulRequests) {
          return { success: true, timestamp: Date.now() };
        }
        if (!success && matchingRule.skipFailedRequests) {
          return { success: true, timestamp: Date.now() };
        }

        this.recordRuleRequest(matchingRule, clientId);
      } else {
        // 記錄默認請求
        this.recordDefaultRequest(clientId);
      }

      return {
        success: true,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('記錄請求失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  // 獲取限制狀態
  async getLimitStatus(
    clientId: string,
    endpoint?: string,
    method?: string
  ): Promise<ApiResponse<RateLimitStatus[]>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '速率限制服務未初始化',
          timestamp: Date.now(),
        };
      }

      const statuses: RateLimitStatus[] = [];

      // 全局限制狀態
      if (this.config.enableGlobalLimit) {
        const globalStatus = this.getGlobalStatus(clientId);
        statuses.push(globalStatus);
      }

      // 特定規則狀態
      if (endpoint && method) {
        const matchingRule = this.findMatchingRule(endpoint, method);
        if (matchingRule) {
          const ruleStatus = this.getRuleStatus(matchingRule, clientId);
          statuses.push(ruleStatus);
        }
      }

      return {
        success: true,
        data: statuses,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('獲取限制狀態失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  // 重置限制
  async resetLimit(clientId: string, ruleId?: string): Promise<ApiResponse> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '速率限制服務未初始化',
          timestamp: Date.now(),
        };
      }

      if (ruleId) {
        // 重置特定規則的限制
        const ruleCounts = this.requestCounts.get(ruleId);
        if (ruleCounts) {
          ruleCounts.delete(clientId);
        }
      } else {
        // 重置所有限制
        this.globalCounts.delete(clientId);
        for (const ruleCounts of this.requestCounts.values()) {
          ruleCounts.delete(clientId);
        }
      }

      logger.info(
        `重置速率限制: ${clientId} ${ruleId ? `規則 ${ruleId}` : '所有規則'}`
      );

      return {
        success: true,
        message: '限制已重置',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('重置限制失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  getAllRules(): RateLimitRule[] {
    return Array.from(this.rules.values());
  }

  // 私有方法
  private async createDefaultRules(): Promise<void> {
    const defaultRules = [
      {
        name: 'API 登錄限制',
        endpoint: '/api/auth/login',
        method: 'POST',
        windowMs: 900000, // 15 分鐘
        maxRequests: 5,
        enabled: true,
      },
      {
        name: 'API 註冊限制',
        endpoint: '/api/auth/register',
        method: 'POST',
        windowMs: 3600000, // 1 小時
        maxRequests: 3,
        enabled: true,
      },
      {
        name: 'API 密碼重置限制',
        endpoint: '/api/auth/reset-password',
        method: 'POST',
        windowMs: 3600000, // 1 小時
        maxRequests: 3,
        enabled: true,
      },
      {
        name: '一般 API 限制',
        endpoint: '/api/*',
        method: '*',
        windowMs: 900000, // 15 分鐘
        maxRequests: 100,
        enabled: true,
      },
    ];

    for (const rule of defaultRules) {
      await this.createRule(rule);
    }
  }

  private findMatchingRule(
    endpoint: string,
    method: string
  ): RateLimitRule | null {
    for (const rule of this.rules.values()) {
      if (this.matchesRule(rule, endpoint, method)) {
        return rule;
      }
    }
    return null;
  }

  private matchesRule(
    rule: RateLimitRule,
    endpoint: string,
    method: string
  ): boolean {
    // 檢查方法匹配
    if (
      rule.method !== '*' &&
      rule.method.toLowerCase() !== method.toLowerCase()
    ) {
      return false;
    }

    // 檢查端點匹配
    if (rule.endpoint === '*') {
      return true;
    }

    if (rule.endpoint.endsWith('*')) {
      const prefix = rule.endpoint.slice(0, -1);
      return endpoint.startsWith(prefix);
    }

    return rule.endpoint === endpoint;
  }

  private checkGlobalLimit(clientId: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.config.globalWindowMs;

    let clientData = this.globalCounts.get(clientId);
    if (!clientData || clientData.resetTime <= now) {
      clientData = {
        count: 0,
        resetTime: now + this.config.globalWindowMs,
      };
      this.globalCounts.set(clientId, clientData);
    }

    const remaining = Math.max(
      0,
      this.config.globalMaxRequests - clientData.count
    );
    const allowed = clientData.count < this.config.globalMaxRequests;

    return {
      allowed,
      status: {
        limit: this.config.globalMaxRequests,
        remaining,
        reset: clientData.resetTime,
        retryAfter: allowed
          ? undefined
          : Math.ceil((clientData.resetTime - now) / 1000),
      },
      reason: allowed ? undefined : '全局速率限制',
    };
  }

  private checkDefaultLimit(clientId: string): RateLimitResult {
    // 使用默認限制規則
    const now = Date.now();
    const ruleId = 'default';

    let ruleCounts = this.requestCounts.get(ruleId);
    if (!ruleCounts) {
      ruleCounts = new Map();
      this.requestCounts.set(ruleId, ruleCounts);
    }

    let clientData = ruleCounts.get(clientId);
    if (!clientData || clientData.resetTime <= now) {
      clientData = {
        count: 0,
        resetTime: now + this.config.defaultWindowMs,
      };
      ruleCounts.set(clientId, clientData);
    }

    const remaining = Math.max(
      0,
      this.config.defaultMaxRequests - clientData.count
    );
    const allowed = clientData.count < this.config.defaultMaxRequests;

    return {
      allowed,
      status: {
        limit: this.config.defaultMaxRequests,
        remaining,
        reset: clientData.resetTime,
        retryAfter: allowed
          ? undefined
          : Math.ceil((clientData.resetTime - now) / 1000),
      },
      reason: allowed ? undefined : '默認速率限制',
    };
  }

  private checkRuleLimit(
    rule: RateLimitRule,
    clientId: string,
    ip?: string,
    userId?: string
  ): RateLimitResult {
    const now = Date.now();
    const key = rule.keyGenerator
      ? rule.keyGenerator({ clientId, ip, userId })
      : clientId;

    let ruleCounts = this.requestCounts.get(rule.id);
    if (!ruleCounts) {
      ruleCounts = new Map();
      this.requestCounts.set(rule.id, ruleCounts);
    }

    let clientData = ruleCounts.get(key);
    if (!clientData || clientData.resetTime <= now) {
      clientData = {
        count: 0,
        resetTime: now + rule.windowMs,
      };
      ruleCounts.set(key, clientData);
    }

    const remaining = Math.max(0, rule.maxRequests - clientData.count);
    const allowed = clientData.count < rule.maxRequests;

    return {
      allowed,
      status: {
        limit: rule.maxRequests,
        remaining,
        reset: clientData.resetTime,
        retryAfter: allowed
          ? undefined
          : Math.ceil((clientData.resetTime - now) / 1000),
      },
      rule,
      reason: allowed ? undefined : `規則 ${rule.name} 速率限制`,
    };
  }

  private recordGlobalRequest(clientId: string): void {
    const now = Date.now();
    let clientData = this.globalCounts.get(clientId);

    if (!clientData || clientData.resetTime <= now) {
      clientData = {
        count: 1,
        resetTime: now + this.config.globalWindowMs,
      };
    } else {
      clientData.count++;
    }

    this.globalCounts.set(clientId, clientData);
  }

  private recordDefaultRequest(clientId: string): void {
    const now = Date.now();
    const ruleId = 'default';

    let ruleCounts = this.requestCounts.get(ruleId);
    if (!ruleCounts) {
      ruleCounts = new Map();
      this.requestCounts.set(ruleId, ruleCounts);
    }

    let clientData = ruleCounts.get(clientId);
    if (!clientData || clientData.resetTime <= now) {
      clientData = {
        count: 1,
        resetTime: now + this.config.defaultWindowMs,
      };
    } else {
      clientData.count++;
    }

    ruleCounts.set(clientId, clientData);
  }

  private recordRuleRequest(rule: RateLimitRule, clientId: string): void {
    const now = Date.now();

    let ruleCounts = this.requestCounts.get(rule.id);
    if (!ruleCounts) {
      ruleCounts = new Map();
      this.requestCounts.set(rule.id, ruleCounts);
    }

    let clientData = ruleCounts.get(clientId);
    if (!clientData || clientData.resetTime <= now) {
      clientData = {
        count: 1,
        resetTime: now + rule.windowMs,
      };
    } else {
      clientData.count++;
    }

    ruleCounts.set(clientId, clientData);
  }

  private getGlobalStatus(clientId: string): RateLimitStatus {
    const now = Date.now();
    const clientData = this.globalCounts.get(clientId);

    if (!clientData || clientData.resetTime <= now) {
      return {
        limit: this.config.globalMaxRequests,
        remaining: this.config.globalMaxRequests,
        reset: now + this.config.globalWindowMs,
      };
    }

    return {
      limit: this.config.globalMaxRequests,
      remaining: Math.max(0, this.config.globalMaxRequests - clientData.count),
      reset: clientData.resetTime,
    };
  }

  private getRuleStatus(
    rule: RateLimitRule,
    clientId: string
  ): RateLimitStatus {
    const now = Date.now();
    const ruleCounts = this.requestCounts.get(rule.id);
    const clientData = ruleCounts?.get(clientId);

    if (!clientData || clientData.resetTime <= now) {
      return {
        limit: rule.maxRequests,
        remaining: rule.maxRequests,
        reset: now + rule.windowMs,
      };
    }

    return {
      limit: rule.maxRequests,
      remaining: Math.max(0, rule.maxRequests - clientData.count),
      reset: clientData.resetTime,
    };
  }

  private startCleanupTimer(): void {
    // 每小時清理過期的計數器
    setInterval(() => {
      this.cleanupExpiredCounts();
    }, 3600000); // 1 小時
  }

  private cleanupExpiredCounts(): void {
    const now = Date.now();

    // 清理全局計數器
    for (const [clientId, data] of this.globalCounts.entries()) {
      if (data.resetTime <= now) {
        this.globalCounts.delete(clientId);
      }
    }

    // 清理規則計數器
    for (const [ruleId, ruleCounts] of this.requestCounts.entries()) {
      for (const [clientId, data] of ruleCounts.entries()) {
        if (data.resetTime <= now) {
          ruleCounts.delete(clientId);
        }
      }

      // 如果規則計數器為空，刪除整個規則
      if (ruleCounts.size === 0) {
        this.requestCounts.delete(ruleId);
      }
    }

    logger.info('清理過期的速率限制計數器');
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  async getServiceStats(): Promise<ApiResponse> {
    return {
      success: true,
      data: {
        initialized: this.isInitialized,
        totalRules: this.rules.size,
        activeClients: this.globalCounts.size,
        totalRequestCounts: Array.from(this.requestCounts.values()).reduce(
          (sum, ruleCounts) => sum + ruleCounts.size,
          0
        ),
        config: this.config,
      },
      timestamp: Date.now(),
    };
  }
}

export const rateLimitService = new RateLimitService();

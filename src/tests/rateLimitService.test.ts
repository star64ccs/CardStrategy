import { rateLimitService } from '../shared/services/security/rateLimitService';

// 模擬 logger
const _mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

// 模擬速率LimitService
class MockRateLimitService {
  private isInitialized = false;
  private rules = new Map();
  private requestCounts = new Map();
  private globalCounts = new Map();
  private config = {
    defaultWindowMs: 900000, // 15 Minute
    defaultMaxRequests: 100,
    enableGlobalLimit: true,
    globalWindowMs: 900000,
    globalMaxRequests: 1000,
  };

  async initialize() {
    this.isInitialized = true;

    // CreateDefault規則
    const _defaultRules = [
      {
        id: 'rule1',
        name: 'API 登錄限制',
        endpoint: '/api/auth/login',
        method: 'POST',
        windowMs: 900000,
        maxRequests: 5,
        enabled: true,
      },
      {
        id: 'rule2',
        name: '一般 API 限制',
        endpoint: '/api/*',
        method: '*',
        windowMs: 900000,
        maxRequests: 100,
        enabled: true,
      },
    ];

    defaultRules.forEach(rule => this.rules.set(rule.id, rule));

    return {
      success: true,
      data: {
        totalRules: this.rules.size,
        defaultWindowMs: this.config.defaultWindowMs,
      },
    };
  }

  isAvailable() {
    return this.isInitialized;
  }

  async createRule(rule: unknown) {
    if (this.isInitialized) {
      const _id = `rule${Date.now()}`;
      const _newRule = {
        ...rule,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.rules.set(id, newRule);
      return { success: true, data: newRule };
    }
    return { success: false, error: 'Service not initialized' };
  }

  async updateRule(id: string, updates: unknown) {
    if (this.isInitialized && this.rules.has(id)) {
      const _rule = this.rules.get(id);
      const _updatedRule = { ...rule, ...updates, updatedAt: new Date() };
      this.rules.set(id, updatedRule);
      return { success: true, data: updatedRule };
    }
    return { success: false, error: 'Rule not found' };
  }

  async deleteRule(id: string) {
    if (this.isInitialized && this.rules.has(id)) {
      this.rules.delete(id);
      this.requestCounts.delete(id);
      return { success: true, message: 'Rule deleted' };
    }
    return { success: false, error: 'Rule not found' };
  }

  async checkLimit(request: unknown) {
    if (!this.isInitialized) {
      return { success: false, error: 'Service not initialized' };
    }

    const { endpoint, method, clientId } = request;
    const _now = Date.now();

    // CheckGlobalLimit
    if (this.config.enableGlobalLimit) {
      let globalData = this.globalCounts.get(clientId);
      if (!globalData || globalData.resetTime <= now) {
        globalData = {
          count: 0,
          resetTime: now + this.config.globalWindowMs,
        };
        this.globalCounts.set(clientId, globalData);
      }

      if (globalData.count >= this.config.globalMaxRequests) {
        return {
          success: true,
          data: {
            allowed: false,
            status: {
              limit: this.config.globalMaxRequests,
              remaining: 0,
              reset: globalData.resetTime,
              retryAfter: Math.ceil((globalData.resetTime - now) / 1000),
            },
            reason: '全局速率限制',
          },
        };
      }
    }

    // Find匹配的規則
    const _matchingRule = this.findMatchingRule(endpoint, method);
    if (!matchingRule) {
      // 使用DefaultLimit
      return {
        success: true,
        data: {
          allowed: true,
          status: {
            limit: this.config.defaultMaxRequests,
            remaining: this.config.defaultMaxRequests - 1,
            reset: now + this.config.defaultWindowMs,
          },
        },
      };
    }

    // Check規則Limit
    let ruleCounts = this.requestCounts.get(matchingRule.id);
    if (!ruleCounts) {
      ruleCounts = new Map();
      this.requestCounts.set(matchingRule.id, ruleCounts);
    }

    let clientData = ruleCounts.get(clientId);
    if (!clientData || clientData.resetTime <= now) {
      clientData = {
        count: 0,
        resetTime: now + matchingRule.windowMs,
      };
      ruleCounts.set(clientId, clientData);
    }

    const _remaining = Math.max(0, matchingRule.maxRequests - clientData.count);
    const _allowed = clientData.count < matchingRule.maxRequests;

    return {
      success: true,
      data: {
        allowed,
        status: {
          limit: matchingRule.maxRequests,
          remaining,
          reset: clientData.resetTime,
          retryAfter: allowed
            ? undefined
            : Math.ceil((clientData.resetTime - now) / 1000),
        },
        rule: matchingRule,
        reason: allowed ? undefined : `規則 ${matchingRule.name} 速率限制`,
      },
    };
  }

  async recordRequest(request: unknown) {
    if (!this.isInitialized) {
      return { success: false, error: 'Service not initialized' };
    }

    const { endpoint, method, clientId, success } = request;
    const _now = Date.now();

    // RecordGlobalRequest
    if (this.config.enableGlobalLimit) {
      let globalData = this.globalCounts.get(clientId);
      if (!globalData || globalData.resetTime <= now) {
        globalData = {
          count: 1,
          resetTime: now + this.config.globalWindowMs,
        };
      } else {
        globalData.count++;
      }
      this.globalCounts.set(clientId, globalData);
    }

    // Record規則Request
    const _matchingRule = this.findMatchingRule(endpoint, method);
    if (matchingRule) {
      let ruleCounts = this.requestCounts.get(matchingRule.id);
      if (!ruleCounts) {
        ruleCounts = new Map();
        this.requestCounts.set(matchingRule.id, ruleCounts);
      }

      let clientData = ruleCounts.get(clientId);
      if (!clientData || clientData.resetTime <= now) {
        clientData = {
          count: 1,
          resetTime: now + matchingRule.windowMs,
        };
      } else {
        clientData.count++;
      }
      ruleCounts.set(clientId, clientData);
    }

    return { success: true };
  }

  async getLimitStatus(clientId: string, endpoint?: string, method?: string) {
    if (!this.isInitialized) {
      return { success: false, error: 'Service not initialized' };
    }

    const _statuses = [];
    const _now = Date.now();

    // GlobalStatus
    if (this.config.enableGlobalLimit) {
      const _globalData = this.globalCounts.get(clientId);
      if (!globalData || globalData.resetTime <= now) {
        statuses.push({
          limit: this.config.globalMaxRequests,
          remaining: this.config.globalMaxRequests,
          reset: now + this.config.globalWindowMs,
        });
      } else {
        statuses.push({
          limit: this.config.globalMaxRequests,
          remaining: Math.max(
            0,
            this.config.globalMaxRequests - globalData.count
          ),
          reset: globalData.resetTime,
        });
      }
    }

    // 規則Status
    if (endpoint && method) {
      const _matchingRule = this.findMatchingRule(endpoint, method);
      if (matchingRule) {
        const _ruleCounts = this.requestCounts.get(matchingRule.id);
        const _clientData = ruleCounts?.get(clientId);

        if (!clientData || clientData.resetTime <= now) {
          statuses.push({
            limit: matchingRule.maxRequests,
            remaining: matchingRule.maxRequests,
            reset: now + matchingRule.windowMs,
          });
        } else {
          statuses.push({
            limit: matchingRule.maxRequests,
            remaining: Math.max(0, matchingRule.maxRequests - clientData.count),
            reset: clientData.resetTime,
          });
        }
      }
    }

    return { success: true, data: statuses };
  }

  async resetLimit(clientId: string, ruleId?: string) {
    if (!this.isInitialized) {
      return { success: false, error: 'Service not initialized' };
    }

    if (ruleId) {
      const _ruleCounts = this.requestCounts.get(ruleId);
      if (ruleCounts) {
        ruleCounts.delete(clientId);
      }
    } else {
      this.globalCounts.delete(clientId);
      for (const ruleCounts of this.requestCounts.values()) {
        ruleCounts.delete(clientId);
      }
    }

    return { success: true, message: 'Limit reset' };
  }

  getAllRules() {
    return Array.from(this.rules.values());
  }

  private findMatchingRule(endpoint: string, method: string) {
    for (const rule of this.rules.values()) {
      if (this.matchesRule(rule, endpoint, method)) {
        return rule;
      }
    }
    return null;
  }

  private matchesRule(rule: unknown, endpoint: string, method: string) {
    // CheckMethod匹配
    if (
      rule.method !== '*' &&
      rule.method.toLowerCase() !== method.toLowerCase()
    ) {
      return false;
    }

    // Check端點匹配
    if (rule.endpoint === '*') {
      return true;
    }

    if (rule.endpoint.endsWith('*')) {
      const _prefix = rule.endpoint.slice(0, -1);
      return endpoint.startsWith(prefix);
    }

    return rule.endpoint === endpoint;
  }
}

describe('Rate Limit Service Tests', () => {
  let mockRateLimitService: MockRateLimitService;

  beforeEach(async () => {
    mockRateLimitService = new MockRateLimitService();
    await mockRateLimitService.initialize();
  });

  describe('MockRateLimitService', () => {
    test('Initialize應該Success', async () => {
      const _result = await mockRateLimitService.initialize();
      expect(result.success).toBe(true);
      expect(result.data?.totalRules).toBe(2);
    });

    test('Create規則應該Success', async () => {
      const _rule = {
        name: '測試規則',
        endpoint: '/api/test',
        method: 'GET',
        windowMs: 60000,
        maxRequests: 10,
        enabled: true,
      };

      const _result = await mockRateLimitService.createRule(rule);
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('測試規則');
      expect(result.data?.id).toBeDefined();
    });

    test('Update規則應該Success', async () => {
      const _rule = {
        name: '測試規則',
        endpoint: '/api/test',
        method: 'GET',
        windowMs: 60000,
        maxRequests: 10,
        enabled: true,
      };

      const _createResult = await mockRateLimitService.createRule(rule);
      const _ruleId = createResult.data?.id;

      const _updateResult = await mockRateLimitService.updateRule(ruleId, {
        maxRequests: 20,
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.data?.maxRequests).toBe(20);
    });

    test('Delete規則應該Success', async () => {
      const _rule = {
        name: '測試規則',
        endpoint: '/api/test',
        method: 'GET',
        windowMs: 60000,
        maxRequests: 10,
        enabled: true,
      };

      const _createResult = await mockRateLimitService.createRule(rule);
      const _ruleId = createResult.data?.id;

      const _deleteResult = await mockRateLimitService.deleteRule(ruleId);
      expect(deleteResult.success).toBe(true);
      expect(deleteResult.message).toBe('Rule deleted');
    });

    test('速率限制檢查應該正確', async () => {
      const _request = {
        endpoint: '/api/auth/login',
        method: 'POST',
        clientId: 'test-client',
      };

      const _result = await mockRateLimitService.checkLimit(request);
      expect(result.success).toBe(true);
      expect(result.data?.allowed).toBe(true);
      expect(result.data?.status.limit).toBe(5); // LoginLimit為5次
    });

    test('超過限制應該被拒絕', async () => {
      const _request = {
        endpoint: '/api/auth/login',
        method: 'POST',
        clientId: 'test-client',
      };

      // Record5次Request
      for (let i = 0; i < 5; i++) {
        await mockRateLimitService.recordRequest({
          ...request,
          success: true,
        });
      }

      // 第6次Request應該被Reject
      const _result = await mockRateLimitService.checkLimit(request);
      expect(result.success).toBe(true);
      expect(result.data?.allowed).toBe(false);
      expect(result.data?.reason).toContain('速率限制');
    });

    test('記錄請求應該Success', async () => {
      const _request = {
        endpoint: '/api/test',
        method: 'GET',
        clientId: 'test-client',
        success: true,
      };

      const _result = await mockRateLimitService.recordRequest(request);
      expect(result.success).toBe(true);
    });

    test('獲取限制狀態應該正確', async () => {
      const _clientId = 'test-client';
      const _endpoint = '/api/auth/login';
      const _method = 'POST';

      const _result = await mockRateLimitService.getLimitStatus(
        clientId,
        endpoint,
        method
      );
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2); // Global + 規則Status
    });

    test('重置限制應該Success', async () => {
      const _clientId = 'test-client';

      // 先Record一些Request
      await mockRateLimitService.recordRequest({
        endpoint: '/api/test',
        method: 'GET',
        clientId,
        success: true,
      });

      // ResetLimit
      const _result = await mockRateLimitService.resetLimit(clientId);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Limit reset');
    });

    test('獲取所有規則應該正確', () => {
      const _rules = mockRateLimitService.getAllRules();
      expect(rules).toHaveLength(2);
      expect(rules.some((r: unknown) => r.name === 'API 登錄限制')).toBe(true);
      expect(rules.some((r: unknown) => r.name === '一般 API 限制')).toBe(true);
    });

    test('規則匹配應該正確', async () => {
      // Test精確匹配
      let result = await mockRateLimitService.checkLimit({
        endpoint: '/api/auth/login',
        method: 'POST',
        clientId: 'test-client',
      });
      expect(result.data?.rule?.name).toBe('API 登錄限制');

      // Test通配符匹配
      result = await mockRateLimitService.checkLimit({
        endpoint: '/api/users',
        method: 'GET',
        clientId: 'test-client',
      });
      expect(result.data?.rule?.name).toBe('一般 API 限制');
    });

    test('全局限制應該生效', async () => {
      const _clientId = 'heavy-user';

      // 模擬達到GlobalLimit
      (mockRateLimitService as any).globalCounts.set(clientId, {
        count: 1000,
        resetTime: Date.now() + 900000,
      });

      const _result = await mockRateLimitService.checkLimit({
        endpoint: '/api/test',
        method: 'GET',
        clientId,
      });

      expect(result.success).toBe(true);
      expect(result.data?.allowed).toBe(false);
      expect(result.data?.reason).toBe('全局速率限制');
    });

    test('不同客戶端應該有獨立的限制', async () => {
      const _request1 = {
        endpoint: '/api/auth/login',
        method: 'POST',
        clientId: 'client1',
      };

      const _request2 = {
        endpoint: '/api/auth/login',
        method: 'POST',
        clientId: 'client2',
      };

      // Client1達到Limit
      for (let i = 0; i < 5; i++) {
        await mockRateLimitService.recordRequest({
          ...request1,
          success: true,
        });
      }

      // Client1應該被Limit
      const _result1 = await mockRateLimitService.checkLimit(request1);
      expect(result1.data?.allowed).toBe(false);

      // Client2應該仍然可以訪問
      const _result2 = await mockRateLimitService.checkLimit(request2);
      expect(result2.data?.allowed).toBe(true);
    });
  });

  describe('ErrorHandle測試', () => {
    test('未InitializeService應該返回Error', async () => {
      const _uninitializedService = new MockRateLimitService();
      const _result = await uninitializedService.createRule({
        name: '測試規則',
        endpoint: '/api/test',
        method: 'GET',
        windowMs: 60000,
        maxRequests: 10,
        enabled: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Service not initialized');
    });

    test('Update不存在的規則應該Failed', async () => {
      const _result = await mockRateLimitService.updateRule('nonexistent-rule', {
        maxRequests: 20,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Rule not found');
    });

    test('Delete不存在的規則應該Failed', async () => {
      const _result = await mockRateLimitService.deleteRule('nonexistent-rule');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Rule not found');
    });
  });

  describe('Service可用性測試', () => {
    test('Service可用性Check', () => {
      expect(mockRateLimitService.isAvailable()).toBe(true);
    });
  });
});

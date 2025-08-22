import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';
import {
  setupTestEnvironment,
  cleanupTestEnvironment,
} from '../setup/e2e-setup';

// 高級負載測試配置
const ADVANCED_LOAD_CONFIG = {
  // 漸進式負載測試
  progressive: {
    stages: [
      { users: 10, duration: 30000, rampUp: 10000 },
      { users: 25, duration: 30000, rampUp: 15000 },
      { users: 50, duration: 30000, rampUp: 20000 },
      { users: 100, duration: 30000, rampUp: 25000 },
      { users: 200, duration: 30000, rampUp: 30000 },
    ],
    expectedResponseTime: 3000,
    expectedErrorRate: 0.1,
  },
  // 尖峰負載測試
  spike: {
    baseUsers: 20,
    spikeUsers: 150,
    spikeDuration: 30000,
    recoveryDuration: 60000,
    expectedResponseTime: 5000,
    expectedErrorRate: 0.15,
  },
  // 持續負載測試
  endurance: {
    concurrentUsers: 50,
    duration: 300000, // 5分鐘
    expectedResponseTime: 2000,
    expectedErrorRate: 0.05,
    memoryThreshold: 512, // MB
  },
  // 突發負載測試
  burst: {
    burstSize: 50,
    burstCount: 5,
    burstInterval: 10000,
    expectedResponseTime: 4000,
    expectedErrorRate: 0.12,
  },
};

// 高級性能指標收集器
class AdvancedPerformanceMetrics {
  private metrics: {
    responseTimes: number[];
    errors: number;
    totalRequests: number;
    startTime: number;
    endTime?: number;
    memorySnapshots: Array<{ timestamp: number; memory: number }>;
    cpuSnapshots: Array<{ timestamp: number; cpu: number }>;
    networkSnapshots: Array<{
      timestamp: number;
      bytesIn: number;
      bytesOut: number;
    }>;
    userSessions: Array<{
      userId: string;
      startTime: number;
      endTime?: number;
      actions: number;
    }>;
  };

  constructor() {
    this.metrics = {
      responseTimes: [],
      errors: 0,
      totalRequests: 0,
      startTime: Date.now(),
      memorySnapshots: [],
      cpuSnapshots: [],
      networkSnapshots: [],
      userSessions: [],
    };
  }

  addResponseTime(responseTime: number) {
    this.metrics.responseTimes.push(responseTime);
    this.metrics.totalRequests++;
  }

  addError() {
    this.metrics.errors++;
    this.metrics.totalRequests++;
  }

  addMemorySnapshot(memory: number) {
    this.metrics.memorySnapshots.push({
      timestamp: Date.now(),
      memory,
    });
  }

  addCpuSnapshot(cpu: number) {
    this.metrics.cpuSnapshots.push({
      timestamp: Date.now(),
      cpu,
    });
  }

  addNetworkSnapshot(bytesIn: number, bytesOut: number) {
    this.metrics.networkSnapshots.push({
      timestamp: Date.now(),
      bytesIn,
      bytesOut,
    });
  }

  startUserSession(userId: string) {
    this.metrics.userSessions.push({
      userId,
      startTime: Date.now(),
      actions: 0,
    });
  }

  endUserSession(userId: string) {
    const session = this.metrics.userSessions.find((s) => s.userId === userId);
    if (session) {
      session.endTime = Date.now();
    }
  }

  incrementUserActions(userId: string) {
    const session = this.metrics.userSessions.find((s) => s.userId === userId);
    if (session) {
      session.actions++;
    }
  }

  finish() {
    this.metrics.endTime = Date.now();
  }

  getResults() {
    const {
      responseTimes,
      errors,
      totalRequests,
      startTime,
      endTime,
      memorySnapshots,
      cpuSnapshots,
      networkSnapshots,
      userSessions,
    } = this.metrics;
    const duration = endTime ? endTime - startTime : 0;

    if (responseTimes.length === 0) {
      return {
        averageResponseTime: 0,
        medianResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        errorRate: totalRequests > 0 ? errors / totalRequests : 0,
        requestsPerSecond: duration > 0 ? totalRequests / (duration / 1000) : 0,
        totalRequests,
        errors,
        duration,
        memoryUsage: this.calculateMemoryUsage(),
        cpuUsage: this.calculateCpuUsage(),
        networkUsage: this.calculateNetworkUsage(),
        userSessionStats: this.calculateUserSessionStats(),
      };
    }

    const sortedTimes = [...responseTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p99Index = Math.floor(sortedTimes.length * 0.99);

    return {
      averageResponseTime:
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      medianResponseTime: sortedTimes[Math.floor(sortedTimes.length / 2)],
      p95ResponseTime: sortedTimes[p95Index],
      p99ResponseTime: sortedTimes[p99Index],
      errorRate: errors / totalRequests,
      requestsPerSecond: totalRequests / (duration / 1000),
      totalRequests,
      errors,
      duration,
      memoryUsage: this.calculateMemoryUsage(),
      cpuUsage: this.calculateCpuUsage(),
      networkUsage: this.calculateNetworkUsage(),
      userSessionStats: this.calculateUserSessionStats(),
    };
  }

  private calculateMemoryUsage() {
    if (this.metrics.memorySnapshots.length === 0)
      return { average: 0, peak: 0, trend: 'stable' };

    const memories = this.metrics.memorySnapshots.map((s) => s.memory);
    const average = memories.reduce((a, b) => a + b, 0) / memories.length;
    const peak = Math.max(...memories);

    // 計算趨勢
    const firstHalf = memories.slice(0, Math.floor(memories.length / 2));
    const secondHalf = memories.slice(Math.floor(memories.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    let trend = 'stable';
    if (secondAvg > firstAvg * 1.1) trend = 'increasing';
    else if (secondAvg < firstAvg * 0.9) trend = 'decreasing';

    return { average, peak, trend };
  }

  private calculateCpuUsage() {
    if (this.metrics.cpuSnapshots.length === 0) return { average: 0, peak: 0 };

    const cpus = this.metrics.cpuSnapshots.map((s) => s.cpu);
    const average = cpus.reduce((a, b) => a + b, 0) / cpus.length;
    const peak = Math.max(...cpus);

    return { average, peak };
  }

  private calculateNetworkUsage() {
    if (this.metrics.networkSnapshots.length === 0)
      return { totalBytesIn: 0, totalBytesOut: 0, averageBytesPerSecond: 0 };

    const totalBytesIn = this.metrics.networkSnapshots.reduce(
      (sum, s) => sum + s.bytesIn,
      0
    );
    const totalBytesOut = this.metrics.networkSnapshots.reduce(
      (sum, s) => sum + s.bytesOut,
      0
    );
    const duration =
      this.metrics.networkSnapshots[this.metrics.networkSnapshots.length - 1]
        .timestamp - this.metrics.networkSnapshots[0].timestamp;
    const averageBytesPerSecond =
      (totalBytesIn + totalBytesOut) / (duration / 1000);

    return { totalBytesIn, totalBytesOut, averageBytesPerSecond };
  }

  private calculateUserSessionStats() {
    if (this.metrics.userSessions.length === 0)
      return {
        totalSessions: 0,
        averageSessionDuration: 0,
        averageActionsPerSession: 0,
      };

    const completedSessions = this.metrics.userSessions.filter(
      (s) => s.endTime
    );
    const totalSessions = completedSessions.length;
    const averageSessionDuration =
      completedSessions.reduce(
        (sum, s) => sum + (s.endTime! - s.startTime),
        0
      ) / totalSessions;
    const averageActionsPerSession =
      completedSessions.reduce((sum, s) => sum + s.actions, 0) / totalSessions;

    return { totalSessions, averageSessionDuration, averageActionsPerSession };
  }
}

// 負載測試場景生成器
class LoadTestScenario {
  static generateProgressiveLoad() {
    return ADVANCED_LOAD_CONFIG.progressive.stages.map((stage, index) => ({
      stage: index + 1,
      users: stage.users,
      duration: stage.duration,
      rampUp: stage.rampUp,
      description: `階段 ${index + 1}: ${stage.users} 個用戶，持續 ${stage.duration / 1000} 秒`,
    }));
  }

  static generateSpikeLoad() {
    return {
      base: { users: ADVANCED_LOAD_CONFIG.spike.baseUsers, duration: 30000 },
      spike: {
        users: ADVANCED_LOAD_CONFIG.spike.spikeUsers,
        duration: ADVANCED_LOAD_CONFIG.spike.spikeDuration,
      },
      recovery: {
        users: ADVANCED_LOAD_CONFIG.spike.baseUsers,
        duration: ADVANCED_LOAD_CONFIG.spike.recoveryDuration,
      },
    };
  }

  static generateBurstLoad() {
    return Array(ADVANCED_LOAD_CONFIG.burst.burstCount)
      .fill(null)
      .map((_, index) => ({
        burst: index + 1,
        users: ADVANCED_LOAD_CONFIG.burst.burstSize,
        duration: 10000,
        interval: ADVANCED_LOAD_CONFIG.burst.burstInterval,
      }));
  }
}

// 用戶行為模擬器
class UserBehaviorSimulator {
  private behaviors = {
    cardManagement: [
      { action: 'browse_cards', weight: 0.3, duration: [1000, 3000] },
      { action: 'search_cards', weight: 0.2, duration: [500, 1500] },
      { action: 'view_card_detail', weight: 0.25, duration: [2000, 5000] },
      { action: 'add_to_collection', weight: 0.15, duration: [800, 2000] },
      { action: 'scan_card', weight: 0.1, duration: [3000, 8000] },
    ],
    marketAnalysis: [
      { action: 'view_market_data', weight: 0.4, duration: [1500, 4000] },
      { action: 'analyze_trends', weight: 0.25, duration: [2000, 6000] },
      { action: 'set_price_alert', weight: 0.15, duration: [1000, 2500] },
      { action: 'view_charts', weight: 0.2, duration: [3000, 7000] },
    ],
    aiEcosystem: [
      { action: 'ai_scan', weight: 0.3, duration: [5000, 15000] },
      { action: 'get_predictions', weight: 0.25, duration: [2000, 6000] },
      { action: 'view_recommendations', weight: 0.25, duration: [1500, 4000] },
      { action: 'train_ai_model', weight: 0.2, duration: [10000, 30000] },
    ],
  };

  getRandomBehavior(module: string) {
    const moduleBehaviors =
      this.behaviors[module as keyof typeof this.behaviors] ||
      this.behaviors.cardManagement;
    const totalWeight = moduleBehaviors.reduce((sum, b) => sum + b.weight, 0);
    let random = Math.random() * totalWeight;

    for (const behavior of moduleBehaviors) {
      random -= behavior.weight;
      if (random <= 0) {
        return {
          action: behavior.action,
          duration:
            Math.random() * (behavior.duration[1] - behavior.duration[0]) +
            behavior.duration[0],
        };
      }
    }

    return moduleBehaviors[0];
  }
}

describe('CardStrategy 高級負載測試', () => {
  let browser: Browser;
  let metrics: AdvancedPerformanceMetrics;
  let userSimulator: UserBehaviorSimulator;

  beforeAll(async () => {
    await setupTestEnvironment();
    userSimulator = new UserBehaviorSimulator();
  });

  beforeEach(async ({ browser: testBrowser }) => {
    browser = testBrowser;
    metrics = new AdvancedPerformanceMetrics();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  // 輔助方法
  async function createUsers(count: number): Promise<Page[]> {
    const users: Page[] = [];
    for (let i = 0; i < count; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto('http://localhost:3000');
      users.push(page);
      metrics.startUserSession(`user-${i}`);
    }
    return users;
  }

  test('漸進式負載測試 - 逐步增加用戶負載', async () => {
    console.log('🚀 開始漸進式負載測試...');

    const scenarios = LoadTestScenario.generateProgressiveLoad();
    const config = ADVANCED_LOAD_CONFIG.progressive;

    for (const scenario of scenarios) {
      console.log(`📊 執行 ${scenario.description}`);

      const stageMetrics = new AdvancedPerformanceMetrics();
      const userPages: Page[] = [];

      // 創建用戶
      for (let i = 0; i < scenario.users; i++) {
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto('http://localhost:3000');
        userPages.push(page);
        stageMetrics.startUserSession(`user-${scenario.stage}-${i}`);
      }

      // 執行用戶操作
      const userPromises = userPages.map(async (page, index) => {
        const userId = `user-${scenario.stage}-${index}`;
        return this.simulateAdvancedUserWorkload(
          page,
          stageMetrics,
          scenario.duration,
          userId
        );
      });

      await Promise.all(userPromises);
      stageMetrics.finish();

      const results = stageMetrics.getResults();

      // 驗證階段性能
      expect(results.averageResponseTime).toBeLessThan(
        config.expectedResponseTime
      );
      expect(results.errorRate).toBeLessThan(config.expectedErrorRate);

      console.log(`✅ 階段 ${scenario.stage} 完成:`);
      console.log(
        `   平均響應時間: ${results.averageResponseTime.toFixed(2)}ms`
      );
      console.log(`   錯誤率: ${(results.errorRate * 100).toFixed(2)}%`);
      console.log(`   每秒請求數: ${results.requestsPerSecond.toFixed(2)}`);

      // 清理頁面
      for (const page of userPages) {
        await page.context().close();
      }

      // 階段間休息
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  });

  test('尖峰負載測試 - 模擬突發流量', async () => {
    console.log('🚀 開始尖峰負載測試...');

    const scenario = LoadTestScenario.generateSpikeLoad();
    const config = ADVANCED_LOAD_CONFIG.spike;

    // 基礎負載階段
    console.log('📊 基礎負載階段...');
    const baseUsers = await this.createUsers(scenario.base.users);
    const basePromise = this.runUserWorkload(baseUsers, scenario.base.duration);

    // 等待基礎負載穩定
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // 尖峰負載階段
    console.log('📊 尖峰負載階段...');
    const spikeUsers = await this.createUsers(scenario.spike.users);
    const spikePromise = this.runUserWorkload(
      spikeUsers,
      scenario.spike.duration
    );

    await Promise.all([basePromise, spikePromise]);

    // 恢復階段
    console.log('📊 恢復階段...');
    const recoveryUsers = await this.createUsers(scenario.recovery.users);
    await this.runUserWorkload(recoveryUsers, scenario.recovery.duration);

    metrics.finish();
    const results = metrics.getResults();

    // 驗證尖峰負載性能
    expect(results.averageResponseTime).toBeLessThan(
      config.expectedResponseTime
    );
    expect(results.errorRate).toBeLessThan(config.expectedErrorRate);

    console.log('✅ 尖峰負載測試完成:');
    console.log(`   平均響應時間: ${results.averageResponseTime.toFixed(2)}ms`);
    console.log(`   錯誤率: ${(results.errorRate * 100).toFixed(2)}%`);
    console.log(`   總請求數: ${results.totalRequests}`);
    console.log(`   內存使用趨勢: ${results.memoryUsage.trend}`);
  });

  test('持續負載測試 - 長時間穩定性測試', async () => {
    console.log('🚀 開始持續負載測試...');

    const config = ADVANCED_LOAD_CONFIG.endurance;

    // 創建持續用戶
    const users = await this.createUsers(config.concurrentUsers);

    // 開始內存監控
    const memoryMonitor = setInterval(async () => {
      const memory = await this.getMemoryUsage();
      metrics.addMemorySnapshot(memory);
    }, 10000);

    // 執行長時間負載
    await this.runUserWorkload(users, config.duration);

    clearInterval(memoryMonitor);
    metrics.finish();

    const results = metrics.getResults();

    // 驗證持續負載性能
    expect(results.averageResponseTime).toBeLessThan(
      config.expectedResponseTime
    );
    expect(results.errorRate).toBeLessThan(config.expectedErrorRate);
    expect(results.memoryUsage.peak).toBeLessThan(
      config.memoryThreshold * 1024 * 1024
    );

    console.log('✅ 持續負載測試完成:');
    console.log(
      `   測試時長: ${(results.duration / 1000 / 60).toFixed(2)} 分鐘`
    );
    console.log(`   平均響應時間: ${results.averageResponseTime.toFixed(2)}ms`);
    console.log(`   錯誤率: ${(results.errorRate * 100).toFixed(2)}%`);
    console.log(
      `   峰值內存使用: ${(results.memoryUsage.peak / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(`   內存趨勢: ${results.memoryUsage.trend}`);
    console.log(
      `   平均會話時長: ${(results.userSessionStats.averageSessionDuration / 1000).toFixed(2)}秒`
    );
  });

  test('突發負載測試 - 模擬間歇性高負載', async () => {
    console.log('🚀 開始突發負載測試...');

    const bursts = LoadTestScenario.generateBurstLoad();
    const config = ADVANCED_LOAD_CONFIG.burst;

    for (const burst of bursts) {
      console.log(`📊 執行突發 ${burst.burst}...`);

      const users = await this.createUsers(burst.users);
      const burstPromise = this.runUserWorkload(users, burst.duration);

      await burstPromise;

      // 突發間隔
      if (burst.burst < bursts.length) {
        console.log(`⏳ 等待 ${burst.interval / 1000} 秒...`);
        await new Promise((resolve) => setTimeout(resolve, burst.interval));
      }
    }

    metrics.finish();
    const results = metrics.getResults();

    // 驗證突發負載性能
    expect(results.averageResponseTime).toBeLessThan(
      config.expectedResponseTime
    );
    expect(results.errorRate).toBeLessThan(config.expectedErrorRate);

    console.log('✅ 突發負載測試完成:');
    console.log(`   平均響應時間: ${results.averageResponseTime.toFixed(2)}ms`);
    console.log(`   錯誤率: ${(results.errorRate * 100).toFixed(2)}%`);
    console.log(`   總請求數: ${results.totalRequests}`);
    console.log(
      `   網絡使用: ${(results.networkUsage.totalBytesIn / 1024 / 1024).toFixed(2)}MB 輸入, ${(results.networkUsage.totalBytesOut / 1024 / 1024).toFixed(2)}MB 輸出`
    );
  });

  test('混合負載測試 - 多種用戶行為組合', async () => {
    console.log('🚀 開始混合負載測試...');

    const userTypes = [
      { type: 'cardManagement', count: 30, weight: 0.4 },
      { type: 'marketAnalysis', count: 25, weight: 0.35 },
      { type: 'aiEcosystem', count: 20, weight: 0.25 },
    ];

    const totalUsers = userTypes.reduce((sum, type) => sum + type.count, 0);
    const users = await this.createUsers(totalUsers);

    // 分配用戶類型
    let userIndex = 0;
    const typedUsers = userTypes.map((type) => {
      const typeUsers = users.slice(userIndex, userIndex + type.count);
      userIndex += type.count;
      return { type: type.type, users: typeUsers };
    });

    // 執行混合負載
    const workloadPromises = typedUsers.map(({ type, users }) =>
      this.runTypedUserWorkload(users, type, 60000)
    );

    await Promise.all(workloadPromises);
    metrics.finish();

    const results = metrics.getResults();

    console.log('✅ 混合負載測試完成:');
    console.log(`   總用戶數: ${totalUsers}`);
    console.log(`   平均響應時間: ${results.averageResponseTime.toFixed(2)}ms`);
    console.log(`   錯誤率: ${(results.errorRate * 100).toFixed(2)}%`);
    console.log(`   每秒請求數: ${results.requestsPerSecond.toFixed(2)}`);
    console.log(
      `   平均會話時長: ${(results.userSessionStats.averageSessionDuration / 1000).toFixed(2)}秒`
    );
    console.log(
      `   平均每會話操作數: ${results.userSessionStats.averageActionsPerSession.toFixed(2)}`
    );
  });

  async function runUserWorkload(
    users: Page[],
    duration: number
  ): Promise<void> {
    const userPromises = users.map(async (page, index) => {
      const userId = `user-${index}`;
      return simulateAdvancedUserWorkload(page, metrics, duration, userId);
    });

    await Promise.all(userPromises);
  }

  async function runTypedUserWorkload(
    users: Page[],
    userType: string,
    duration: number
  ): Promise<void> {
    const userPromises = users.map(async (page, index) => {
      const userId = `user-${userType}-${index}`;
      return simulateTypedUserWorkload(
        page,
        metrics,
        duration,
        userId,
        userType
      );
    });

    await Promise.all(userPromises);
  }

  async function simulateAdvancedUserWorkload(
    page: Page,
    metrics: AdvancedPerformanceMetrics,
    duration: number,
    userId: string
  ): Promise<void> {
    const startTime = Date.now();
    const endTime = startTime + duration;

    while (Date.now() < endTime) {
      const operationStartTime = Date.now();

      try {
        // 隨機選擇模組和行為
        const modules = ['cardManagement', 'marketAnalysis', 'aiEcosystem'];
        const randomModule =
          modules[Math.floor(Math.random() * modules.length)];
        const behavior = userSimulator.getRandomBehavior(randomModule);

        // 執行用戶操作
        await executeUserAction(page, randomModule, behavior.action);

        const operationEndTime = Date.now();
        const responseTime = operationEndTime - operationStartTime;
        metrics.addResponseTime(responseTime);
        metrics.incrementUserActions(userId);

        // 隨機延遲
        const delay = Math.random() * 3000 + 1000; // 1-4秒延遲
        await new Promise((resolve) => setTimeout(resolve, delay));
      } catch (error) {
        metrics.addError();
        console.warn(`用戶 ${userId} 操作失敗:`, error.message);
      }
    }

    metrics.endUserSession(userId);
  }

  async function simulateTypedUserWorkload(
    page: Page,
    metrics: AdvancedPerformanceMetrics,
    duration: number,
    userId: string,
    userType: string
  ): Promise<void> {
    const startTime = Date.now();
    const endTime = startTime + duration;

    while (Date.now() < endTime) {
      const operationStartTime = Date.now();

      try {
        const behavior = userSimulator.getRandomBehavior(userType);
        await executeUserAction(page, userType, behavior.action);

        const operationEndTime = Date.now();
        const responseTime = operationEndTime - operationStartTime;
        metrics.addResponseTime(responseTime);
        metrics.incrementUserActions(userId);

        // 根據行為類型調整延遲
        const delay = behavior.duration * (0.5 + Math.random() * 0.5);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } catch (error) {
        metrics.addError();
        console.warn(`用戶 ${userId} 操作失敗:`, error.message);
      }
    }

    metrics.endUserSession(userId);
  }

  async function executeUserAction(
    page: Page,
    module: string,
    action: string
  ): Promise<void> {
    switch (module) {
      case 'cardManagement':
        await executeCardManagementAction(page, action);
        break;
      case 'marketAnalysis':
        await executeMarketAnalysisAction(page, action);
        break;
      case 'aiEcosystem':
        await executeAIEcosystemAction(page, action);
        break;
    }
  }

  async function executeCardManagementAction(
    page: Page,
    action: string
  ): Promise<void> {
    switch (action) {
      case 'browse_cards':
        await page.click('[data-testid="card-management-nav"]');
        await page.waitForSelector('[data-testid="card-list"]', {
          timeout: 5000,
        });
        break;
      case 'search_cards':
        await page.click('[data-testid="card-management-nav"]');
        await page.fill('[data-testid="search-input"]', 'Test Card');
        await page.click('[data-testid="search-button"]');
        break;
      case 'view_card_detail':
        await page.click('[data-testid="card-management-nav"]');
        await page.click('[data-testid="card-item"]');
        await page.waitForSelector('[data-testid="card-detail"]', {
          timeout: 5000,
        });
        break;
      case 'add_to_collection':
        await page.click('[data-testid="card-management-nav"]');
        await page.click('[data-testid="add-to-collection"]');
        break;
      case 'scan_card':
        await page.click('[data-testid="card-management-nav"]');
        await page.click('[data-testid="scan-card"]');
        break;
    }
  }

  async function executeMarketAnalysisAction(
    page: Page,
    action: string
  ): Promise<void> {
    switch (action) {
      case 'view_market_data':
        await page.click('[data-testid="market-analysis-nav"]');
        await page.waitForSelector('[data-testid="market-dashboard"]', {
          timeout: 5000,
        });
        break;
      case 'analyze_trends':
        await page.click('[data-testid="market-analysis-nav"]');
        await page.click('[data-testid="trends-analysis"]');
        break;
      case 'set_price_alert':
        await page.click('[data-testid="market-analysis-nav"]');
        await page.click('[data-testid="price-alert"]');
        break;
      case 'view_charts':
        await page.click('[data-testid="market-analysis-nav"]');
        await page.click('[data-testid="price-chart"]');
        break;
    }
  }

  async function executeAIEcosystemAction(
    page: Page,
    action: string
  ): Promise<void> {
    switch (action) {
      case 'ai_scan':
        await page.click('[data-testid="ai-ecosystem-nav"]');
        await page.click('[data-testid="ai-scan"]');
        break;
      case 'get_predictions':
        await page.click('[data-testid="ai-ecosystem-nav"]');
        await page.click('[data-testid="market-predictor"]');
        break;
      case 'view_recommendations':
        await page.click('[data-testid="ai-ecosystem-nav"]');
        await page.click('[data-testid="recommendation-engine"]');
        break;
      case 'train_ai_model':
        await page.click('[data-testid="ai-ecosystem-nav"]');
        await page.click('[data-testid="ai-training"]');
        break;
    }
  }

  async function getMemoryUsage(): Promise<number> {
    // 這裡可以實現實際的內存監控
    // 目前返回模擬值
    return Math.random() * 200 * 1024 * 1024 + 100 * 1024 * 1024; // 100-300MB
  }
});

import { Page, Browser, BrowserContext } from '@playwright/test';

// 負載測試配置接口
export interface LoadTestConfig {
  concurrentUsers: number;
  duration: number;
  rampUpTime: number;
  expectedResponseTime: number;
  expectedErrorRate: number;
  userBehavior?: UserBehavior;
  monitoring?: MonitoringConfig;
}

// 用戶行為配置
export interface UserBehavior {
  thinkTime: [number, number]; // 思考時間範圍 [min, max]
  actions: UserAction[];
  moduleDistribution: { [key: string]: number }; // 模組使用分布
}

// 用戶操作
export interface UserAction {
  name: string;
  weight: number; // 權重
  duration: [number, number]; // 持續時間範圍 [min, max]
  selector: string;
  timeout?: number;
  validation?: string;
}

// 監控配置
export interface MonitoringConfig {
  enableMemoryMonitoring: boolean;
  enableCpuMonitoring: boolean;
  enableNetworkMonitoring: boolean;
  monitoringInterval: number;
  alertThresholds: {
    memoryUsage: number;
    cpuUsage: number;
    responseTime: number;
    errorRate: number;
  };
}

// 負載測試結果
export interface LoadTestResult {
  summary: {
    totalUsers: number;
    totalRequests: number;
    totalErrors: number;
    duration: number;
    averageResponseTime: number;
    medianResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    errorRate: number;
    requestsPerSecond: number;
  };
  stages: LoadTestStage[];
  alerts: LoadTestAlert[];
  recommendations: string[];
}

// 負載測試階段
export interface LoadTestStage {
  stage: number;
  users: number;
  duration: number;
  metrics: {
    requests: number;
    errors: number;
    averageResponseTime: number;
    errorRate: number;
  };
}

// 負載測試警報
export interface LoadTestAlert {
  type: 'warning' | 'error' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  message: string;
}

/**
 * 負載測試工具類
 */
export class LoadTestingUtils {
  private browser: Browser;
  private config: LoadTestConfig;
  private metrics: LoadTestMetrics;
  private alerts: LoadTestAlert[] = [];

  constructor(browser: Browser, config: LoadTestConfig) {
    this.browser = browser;
    this.config = config;
    this.metrics = new LoadTestMetrics();
  }

  /**
   * 執行負載測試
   */
  async runLoadTest(): Promise<LoadTestResult> {
    console.log(`🚀 開始負載測試: ${this.config.concurrentUsers} 個並發用戶，持續 ${this.config.duration / 1000} 秒`);

    // 創建用戶
    const users = await this.createUsers(this.config.concurrentUsers);

    // 開始監控
    const monitoringInterval = this.startMonitoring();

    // 執行負載測試
    await this.executeLoadTest(users);

    // 停止監控
    clearInterval(monitoringInterval);

    // 生成結果
    return this.generateResults();
  }

  /**
   * 執行漸進式負載測試
   */
  async runProgressiveLoadTest(stages: { users: number; duration: number }[]): Promise<LoadTestResult> {
    console.log(`🚀 開始漸進式負載測試: ${stages.length} 個階段`);

    const allStages: LoadTestStage[] = [];

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      console.log(`📊 階段 ${i + 1}: ${stage.users} 個用戶，持續 ${stage.duration / 1000} 秒`);

      // 創建階段用戶
      const users = await this.createUsers(stage.users);

      // 執行階段測試
      const stageMetrics = new LoadTestMetrics();
      await this.executeStageTest(users, stage.duration, stageMetrics);

      // 記錄階段結果
      const stageResult = stageMetrics.getResults();
      allStages.push({
        stage: i + 1,
        users: stage.users,
        duration: stage.duration,
        metrics: {
          requests: stageResult.totalRequests,
          errors: stageResult.errors,
          averageResponseTime: stageResult.averageResponseTime,
          errorRate: stageResult.errorRate
        }
      });

      // 清理用戶
      await this.cleanupUsers(users);

      // 階段間休息
      if (i < stages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    return {
      summary: this.calculateSummary(allStages),
      stages: allStages,
      alerts: this.alerts,
      recommendations: this.generateRecommendations(allStages)
    };
  }

  /**
   * 執行尖峰負載測試
   */
  async runSpikeLoadTest(baseUsers: number, spikeUsers: number, spikeDuration: number, recoveryDuration: number): Promise<LoadTestResult> {
    console.log(`🚀 開始尖峰負載測試: 基礎 ${baseUsers} 用戶，尖峰 ${spikeUsers} 用戶`);

    // 基礎負載階段
    console.log('📊 基礎負載階段...');
    const baseUserPages = await this.createUsers(baseUsers);
    const basePromise = this.executeLoadTest(baseUserPages);

    // 等待基礎負載穩定
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 尖峰負載階段
    console.log('📊 尖峰負載階段...');
    const spikeUserPages = await this.createUsers(spikeUsers);
    const spikePromise = this.executeLoadTest(spikeUserPages);

    await Promise.all([basePromise, spikePromise]);

    // 恢復階段
    console.log('📊 恢復階段...');
    const recoveryUserPages = await this.createUsers(baseUsers);
    await this.executeLoadTest(recoveryUserPages);

    return this.generateResults();
  }

  /**
   * 創建用戶
   */
  private async createUsers(count: number): Promise<Page[]> {
    const users: Page[] = [];
    console.log(`👥 創建 ${count} 個用戶...`);

    for (let i = 0; i < count; i++) {
      const context = await this.browser.newContext();
      const page = await context.newPage();
      await page.goto('http://localhost:3000');
      users.push(page);
      this.metrics.startUserSession(`user-${i}`);
    }

    return users;
  }

  /**
   * 執行負載測試
   */
  private async executeLoadTest(users: Page[]): Promise<void> {
    const userPromises = users.map(async (page, index) => {
      const userId = `user-${index}`;
      return this.simulateUserWorkload(page, userId);
    });

    await Promise.all(userPromises);
    this.metrics.finish();
  }

  /**
   * 執行階段測試
   */
  private async executeStageTest(users: Page[], duration: number, metrics: LoadTestMetrics): Promise<void> {
    const userPromises = users.map(async (page, index) => {
      const userId = `user-${index}`;
      return this.simulateUserWorkload(page, userId, duration, metrics);
    });

    await Promise.all(userPromises);
    metrics.finish();
  }

  /**
   * 模擬用戶工作負載
   */
  private async simulateUserWorkload(page: Page, userId: string, duration?: number, customMetrics?: LoadTestMetrics): Promise<void> {
    const testDuration = duration || this.config.duration;
    const metrics = customMetrics || this.metrics;
    const startTime = Date.now();
    const endTime = startTime + testDuration;

    while (Date.now() < endTime) {
      const operationStartTime = Date.now();

      try {
        // 執行用戶操作
        await this.executeRandomUserAction(page);

        const operationEndTime = Date.now();
        const responseTime = operationEndTime - operationStartTime;
        metrics.addResponseTime(responseTime);
        metrics.incrementUserActions(userId);

        // 思考時間
        const thinkTime = this.getRandomThinkTime();
        await new Promise(resolve => setTimeout(resolve, thinkTime));

      } catch (error) {
        metrics.addError();
        console.warn(`用戶 ${userId} 操作失敗:`, error.message);
      }
    }

    metrics.endUserSession(userId);
  }

  /**
   * 執行隨機用戶操作
   */
  private async executeRandomUserAction(page: Page): Promise<void> {
    const actions = this.config.userBehavior?.actions || this.getDefaultActions();
    const action = this.selectRandomAction(actions);

    try {
      await page.click(action.selector, { timeout: action.timeout || 5000 });

      if (action.validation) {
        await page.waitForSelector(action.validation, { timeout: action.timeout || 5000 });
      }

      // 操作持續時間
      const duration = this.getRandomDuration(action.duration);
      await new Promise(resolve => setTimeout(resolve, duration));

    } catch (error) {
      throw new Error(`操作 ${action.name} 失敗: ${error.message}`);
    }
  }

  /**
   * 選擇隨機操作
   */
  private selectRandomAction(actions: UserAction[]): UserAction {
    const totalWeight = actions.reduce((sum, action) => sum + action.weight, 0);
    let random = Math.random() * totalWeight;

    for (const action of actions) {
      random -= action.weight;
      if (random <= 0) {
        return action;
      }
    }

    return actions[0];
  }

  /**
   * 獲取隨機思考時間
   */
  private getRandomThinkTime(): number {
    const [min, max] = this.config.userBehavior?.thinkTime || [1000, 3000];
    return Math.random() * (max - min) + min;
  }

  /**
   * 獲取隨機持續時間
   */
  private getRandomDuration(duration: [number, number]): number {
    return Math.random() * (duration[1] - duration[0]) + duration[0];
  }

  /**
   * 獲取默認操作
   */
  private getDefaultActions(): UserAction[] {
    return [
      {
        name: '瀏覽卡片',
        weight: 0.3,
        duration: [1000, 3000],
        selector: '[data-testid="card-management-nav"]',
        validation: '[data-testid="card-list"]'
      },
      {
        name: '查看市場數據',
        weight: 0.25,
        duration: [1500, 4000],
        selector: '[data-testid="market-analysis-nav"]',
        validation: '[data-testid="market-dashboard"]'
      },
      {
        name: 'AI 掃描',
        weight: 0.2,
        duration: [3000, 8000],
        selector: '[data-testid="ai-ecosystem-nav"]',
        validation: '[data-testid="ai-dashboard"]'
      },
      {
        name: '搜索卡片',
        weight: 0.15,
        duration: [500, 1500],
        selector: '[data-testid="search-input"]'
      },
      {
        name: '查看圖表',
        weight: 0.1,
        duration: [2000, 5000],
        selector: '[data-testid="price-chart"]'
      }
    ];
  }

  /**
   * 開始監控
   */
  private startMonitoring(): NodeJS.Timeout {
    if (!this.config.monitoring) return setInterval(() => {}, 1000);

    return setInterval(async () => {
      await this.collectMetrics();
      this.checkAlerts();
    }, this.config.monitoring.monitoringInterval);
  }

  /**
   * 收集指標
   */
  private async collectMetrics(): Promise<void> {
    if (this.config.monitoring?.enableMemoryMonitoring) {
      const memory = await this.getMemoryUsage();
      this.metrics.addMemorySnapshot(memory);
    }

    if (this.config.monitoring?.enableCpuMonitoring) {
      const cpu = await this.getCpuUsage();
      this.metrics.addCpuSnapshot(cpu);
    }

    if (this.config.monitoring?.enableNetworkMonitoring) {
      const network = await this.getNetworkUsage();
      this.metrics.addNetworkSnapshot(network.bytesIn, network.bytesOut);
    }
  }

  /**
   * 檢查警報
   */
  private checkAlerts(): void {
    if (!this.config.monitoring) return;

    const results = this.metrics.getResults();
    const thresholds = this.config.monitoring.alertThresholds;

    // 檢查響應時間
    if (results.averageResponseTime > thresholds.responseTime) {
      this.alerts.push({
        type: 'warning',
        metric: 'responseTime',
        value: results.averageResponseTime,
        threshold: thresholds.responseTime,
        timestamp: Date.now(),
        message: `平均響應時間 ${results.averageResponseTime.toFixed(2)}ms 超過閾值 ${thresholds.responseTime}ms`
      });
    }

    // 檢查錯誤率
    if (results.errorRate > thresholds.errorRate) {
      this.alerts.push({
        type: 'error',
        metric: 'errorRate',
        value: results.errorRate,
        threshold: thresholds.errorRate,
        timestamp: Date.now(),
        message: `錯誤率 ${(results.errorRate * 100).toFixed(2)}% 超過閾值 ${(thresholds.errorRate * 100).toFixed(2)}%`
      });
    }
  }

  /**
   * 生成結果
   */
  private generateResults(): LoadTestResult {
    const results = this.metrics.getResults();

    return {
      summary: {
        totalUsers: this.config.concurrentUsers,
        totalRequests: results.totalRequests,
        totalErrors: results.errors,
        duration: results.duration,
        averageResponseTime: results.averageResponseTime,
        medianResponseTime: results.medianResponseTime,
        p95ResponseTime: results.p95ResponseTime,
        p99ResponseTime: results.p99ResponseTime,
        errorRate: results.errorRate,
        requestsPerSecond: results.requestsPerSecond
      },
      stages: [],
      alerts: this.alerts,
      recommendations: this.generateRecommendations([])
    };
  }

  /**
   * 計算摘要
   */
  private calculateSummary(stages: LoadTestStage[]): LoadTestResult['summary'] {
    const totalRequests = stages.reduce((sum, stage) => sum + stage.metrics.requests, 0);
    const totalErrors = stages.reduce((sum, stage) => sum + stage.metrics.errors, 0);
    const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);

    return {
      totalUsers: Math.max(...stages.map(s => s.users)),
      totalRequests,
      totalErrors,
      duration: totalDuration,
      averageResponseTime: stages.reduce((sum, stage) => sum + stage.metrics.averageResponseTime, 0) / stages.length,
      medianResponseTime: 0, // 需要從原始數據計算
      p95ResponseTime: 0, // 需要從原始數據計算
      p99ResponseTime: 0, // 需要從原始數據計算
      errorRate: totalRequests > 0 ? totalErrors / totalRequests : 0,
      requestsPerSecond: totalRequests / (totalDuration / 1000)
    };
  }

  /**
   * 生成建議
   */
  private generateRecommendations(stages: LoadTestStage[]): string[] {
    const recommendations: string[] = [];
    const results = this.metrics.getResults();

    if (results.averageResponseTime > this.config.expectedResponseTime) {
      recommendations.push('優化響應時間：考慮使用緩存、數據庫優化或代碼分割');
    }

    if (results.errorRate > this.config.expectedErrorRate) {
      recommendations.push('降低錯誤率：檢查服務器穩定性、錯誤處理和網絡連接');
    }

    if (results.requestsPerSecond < 1) {
      recommendations.push('提高吞吐量：優化服務器配置、使用負載均衡或增加服務器資源');
    }

    if (this.alerts.length > 0) {
      recommendations.push(`處理 ${this.alerts.length} 個性能警報`);
    }

    if (recommendations.length === 0) {
      recommendations.push('性能表現良好，保持當前配置');
    }

    return recommendations;
  }

  /**
   * 清理用戶
   */
  private async cleanupUsers(users: Page[]): Promise<void> {
    for (const page of users) {
      await page.context().close();
    }
  }

  /**
   * 獲取內存使用
   */
  private async getMemoryUsage(): Promise<number> {
    // 這裡可以實現實際的內存監控
    return Math.random() * 200 * 1024 * 1024 + 100 * 1024 * 1024; // 100-300MB
  }

  /**
   * 獲取 CPU 使用
   */
  private async getCpuUsage(): Promise<number> {
    // 這裡可以實現實際的 CPU 監控
    return Math.random() * 50 + 20; // 20-70%
  }

  /**
   * 獲取網絡使用
   */
  private async getNetworkUsage(): Promise<{ bytesIn: number; bytesOut: number }> {
    // 這裡可以實現實際的網絡監控
    return {
      bytesIn: Math.random() * 10 * 1024 * 1024, // 0-10MB
      bytesOut: Math.random() * 5 * 1024 * 1024   // 0-5MB
    };
  }
}

/**
 * 負載測試指標收集器
 */
class LoadTestMetrics {
  private metrics: {
    responseTimes: number[];
    errors: number;
    totalRequests: number;
    startTime: number;
    endTime?: number;
    memorySnapshots: { timestamp: number; memory: number }[];
    cpuSnapshots: { timestamp: number; cpu: number }[];
    networkSnapshots: { timestamp: number; bytesIn: number; bytesOut: number }[];
    userSessions: { userId: string; startTime: number; endTime?: number; actions: number }[];
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
      userSessions: []
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
      memory
    });
  }

  addCpuSnapshot(cpu: number) {
    this.metrics.cpuSnapshots.push({
      timestamp: Date.now(),
      cpu
    });
  }

  addNetworkSnapshot(bytesIn: number, bytesOut: number) {
    this.metrics.networkSnapshots.push({
      timestamp: Date.now(),
      bytesIn,
      bytesOut
    });
  }

  startUserSession(userId: string) {
    this.metrics.userSessions.push({
      userId,
      startTime: Date.now(),
      actions: 0
    });
  }

  endUserSession(userId: string) {
    const session = this.metrics.userSessions.find(s => s.userId === userId);
    if (session) {
      session.endTime = Date.now();
    }
  }

  incrementUserActions(userId: string) {
    const session = this.metrics.userSessions.find(s => s.userId === userId);
    if (session) {
      session.actions++;
    }
  }

  finish() {
    this.metrics.endTime = Date.now();
  }

  getResults() {
    const { responseTimes, errors, totalRequests, startTime, endTime } = this.metrics;
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
        duration
      };
    }

    const sortedTimes = [...responseTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p99Index = Math.floor(sortedTimes.length * 0.99);

    return {
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      medianResponseTime: sortedTimes[Math.floor(sortedTimes.length / 2)],
      p95ResponseTime: sortedTimes[p95Index],
      p99ResponseTime: sortedTimes[p99Index],
      errorRate: errors / totalRequests,
      requestsPerSecond: totalRequests / (duration / 1000),
      totalRequests,
      errors,
      duration
    };
  }
}

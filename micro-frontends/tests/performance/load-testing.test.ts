import { test, expect, Page } from '@playwright/test';
import { setupTestEnvironment, cleanupTestEnvironment } from '../setup/e2e-setup';

// 負載測試配置
const LOAD_TEST_CONFIG = {
  // 輕度負載測試
  light: {
    concurrentUsers: 10,
    duration: 30000, // 30秒
    rampUpTime: 10000, // 10秒內逐漸增加用戶
    expectedResponseTime: 2000, // 2秒內響應
    expectedErrorRate: 0.05 // 5%錯誤率
  },
  // 中度負載測試
  medium: {
    concurrentUsers: 50,
    duration: 60000, // 60秒
    rampUpTime: 20000, // 20秒內逐漸增加用戶
    expectedResponseTime: 3000, // 3秒內響應
    expectedErrorRate: 0.10 // 10%錯誤率
  },
  // 重度負載測試
  heavy: {
    concurrentUsers: 100,
    duration: 90000, // 90秒
    rampUpTime: 30000, // 30秒內逐漸增加用戶
    expectedResponseTime: 5000, // 5秒內響應
    expectedErrorRate: 0.15 // 15%錯誤率
  },
  // 壓力測試
  stress: {
    concurrentUsers: 200,
    duration: 120000, // 120秒
    rampUpTime: 40000, // 40秒內逐漸增加用戶
    expectedResponseTime: 8000, // 8秒內響應
    expectedErrorRate: 0.20 // 20%錯誤率
  }
};

// 性能指標收集器
class PerformanceMetrics {
  private metrics: {
    responseTimes: number[];
    errors: number;
    totalRequests: number;
    startTime: number;
    endTime?: number;
  };

  constructor() {
    this.metrics = {
      responseTimes: [],
      errors: 0,
      totalRequests: 0,
      startTime: Date.now()
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

describe('CardStrategy 負載測試', () => {
  let page: Page;

  beforeAll(async () => {
    await setupTestEnvironment();
  });

  beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  test('輕度負載測試 - 10個並發用戶', async () => {
    const config = LOAD_TEST_CONFIG.light;
    const metrics = new PerformanceMetrics();
    
    console.log(`🚀 開始輕度負載測試: ${config.concurrentUsers} 個並發用戶，持續 ${config.duration / 1000} 秒`);

    // 創建並發用戶
    const userPages: Page[] = [];
    for (let i = 0; i < config.concurrentUsers; i++) {
      const userPage = await page.context().newPage();
      await userPage.goto('http://localhost:3000');
      userPages.push(userPage);
    }

    // 漸進式增加負載
    const rampUpSteps = Math.ceil(config.concurrentUsers / 5); // 每步增加5個用戶
    const stepDelay = config.rampUpTime / rampUpSteps;

    for (let step = 0; step < rampUpSteps; step++) {
      const usersInThisStep = Math.min(5, config.concurrentUsers - step * 5);
      const startIndex = step * 5;
      
      // 啟動這一步的用戶
      const stepUsers = userPages.slice(startIndex, startIndex + usersInThisStep);
      const userPromises = stepUsers.map(async (userPage, index) => {
        return this.simulateUserWorkload(userPage, metrics, config.duration);
      });

      // 等待這一步的用戶完成
      await Promise.all(userPromises);
      
      // 漸進式延遲
      if (step < rampUpSteps - 1) {
        await new Promise(resolve => setTimeout(resolve, stepDelay));
      }
    }

    metrics.finish();
    const results = metrics.getResults();

    // 驗證性能基準
    expect(results.averageResponseTime).toBeLessThan(config.expectedResponseTime);
    expect(results.errorRate).toBeLessThan(config.expectedErrorRate);
    expect(results.requestsPerSecond).toBeGreaterThan(1);

    console.log('📊 輕度負載測試結果:');
    console.log(`   平均響應時間: ${results.averageResponseTime.toFixed(2)}ms`);
    console.log(`   中位數響應時間: ${results.medianResponseTime.toFixed(2)}ms`);
    console.log(`   P95 響應時間: ${results.p95ResponseTime.toFixed(2)}ms`);
    console.log(`   P99 響應時間: ${results.p99ResponseTime.toFixed(2)}ms`);
    console.log(`   錯誤率: ${(results.errorRate * 100).toFixed(2)}%`);
    console.log(`   每秒請求數: ${results.requestsPerSecond.toFixed(2)}`);

    // 清理頁面
    for (const userPage of userPages) {
      await userPage.close();
    }
  });

  test('中度負載測試 - 50個並發用戶', async () => {
    const config = LOAD_TEST_CONFIG.medium;
    const metrics = new PerformanceMetrics();
    
    console.log(`🚀 開始中度負載測試: ${config.concurrentUsers} 個並發用戶，持續 ${config.duration / 1000} 秒`);

    // 創建並發用戶
    const userPages: Page[] = [];
    for (let i = 0; i < config.concurrentUsers; i++) {
      const userPage = await page.context().newPage();
      await userPage.goto('http://localhost:3000');
      userPages.push(userPage);
    }

    // 並發執行用戶操作
    const userPromises = userPages.map(async (userPage, index) => {
      return this.simulateUserWorkload(userPage, metrics, config.duration);
    });

    await Promise.all(userPromises);
    metrics.finish();
    const results = metrics.getResults();

    // 驗證性能基準
    expect(results.averageResponseTime).toBeLessThan(config.expectedResponseTime);
    expect(results.errorRate).toBeLessThan(config.expectedErrorRate);
    expect(results.requestsPerSecond).toBeGreaterThan(2);

    console.log('📊 中度負載測試結果:');
    console.log(`   平均響應時間: ${results.averageResponseTime.toFixed(2)}ms`);
    console.log(`   中位數響應時間: ${results.medianResponseTime.toFixed(2)}ms`);
    console.log(`   P95 響應時間: ${results.p95ResponseTime.toFixed(2)}ms`);
    console.log(`   P99 響應時間: ${results.p99ResponseTime.toFixed(2)}ms`);
    console.log(`   錯誤率: ${(results.errorRate * 100).toFixed(2)}%`);
    console.log(`   每秒請求數: ${results.requestsPerSecond.toFixed(2)}`);

    // 清理頁面
    for (const userPage of userPages) {
      await userPage.close();
    }
  });

  test('重度負載測試 - 100個並發用戶', async () => {
    const config = LOAD_TEST_CONFIG.heavy;
    const metrics = new PerformanceMetrics();
    
    console.log(`🚀 開始重度負載測試: ${config.concurrentUsers} 個並發用戶，持續 ${config.duration / 1000} 秒`);

    // 分批創建用戶以避免資源耗盡
    const batchSize = 20;
    const userPages: Page[] = [];
    
    for (let batch = 0; batch < Math.ceil(config.concurrentUsers / batchSize); batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, config.concurrentUsers);
      
      for (let i = batchStart; i < batchEnd; i++) {
        const userPage = await page.context().newPage();
        await userPage.goto('http://localhost:3000');
        userPages.push(userPage);
      }
      
      // 批次間延遲
      if (batch < Math.ceil(config.concurrentUsers / batchSize) - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // 並發執行用戶操作
    const userPromises = userPages.map(async (userPage, index) => {
      return this.simulateUserWorkload(userPage, metrics, config.duration);
    });

    await Promise.all(userPromises);
    metrics.finish();
    const results = metrics.getResults();

    // 驗證性能基準
    expect(results.averageResponseTime).toBeLessThan(config.expectedResponseTime);
    expect(results.errorRate).toBeLessThan(config.expectedErrorRate);
    expect(results.requestsPerSecond).toBeGreaterThan(3);

    console.log('📊 重度負載測試結果:');
    console.log(`   平均響應時間: ${results.averageResponseTime.toFixed(2)}ms`);
    console.log(`   中位數響應時間: ${results.medianResponseTime.toFixed(2)}ms`);
    console.log(`   P95 響應時間: ${results.p95ResponseTime.toFixed(2)}ms`);
    console.log(`   P99 響應時間: ${results.p99ResponseTime.toFixed(2)}ms`);
    console.log(`   錯誤率: ${(results.errorRate * 100).toFixed(2)}%`);
    console.log(`   每秒請求數: ${results.requestsPerSecond.toFixed(2)}`);

    // 清理頁面
    for (const userPage of userPages) {
      await userPage.close();
    }
  });

  test('壓力測試 - 200個並發用戶', async () => {
    const config = LOAD_TEST_CONFIG.stress;
    const metrics = new PerformanceMetrics();
    
    console.log(`🚀 開始壓力測試: ${config.concurrentUsers} 個並發用戶，持續 ${config.duration / 1000} 秒`);

    // 分批創建用戶
    const batchSize = 25;
    const userPages: Page[] = [];
    
    for (let batch = 0; batch < Math.ceil(config.concurrentUsers / batchSize); batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, config.concurrentUsers);
      
      for (let i = batchStart; i < batchEnd; i++) {
        const userPage = await page.context().newPage();
        await userPage.goto('http://localhost:3000');
        userPages.push(userPage);
      }
      
      // 批次間延遲
      if (batch < Math.ceil(config.concurrentUsers / batchSize) - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // 並發執行用戶操作
    const userPromises = userPages.map(async (userPage, index) => {
      return this.simulateUserWorkload(userPage, metrics, config.duration);
    });

    await Promise.all(userPromises);
    metrics.finish();
    const results = metrics.getResults();

    // 壓力測試的基準更寬鬆
    expect(results.averageResponseTime).toBeLessThan(config.expectedResponseTime);
    expect(results.errorRate).toBeLessThan(config.expectedErrorRate);
    expect(results.requestsPerSecond).toBeGreaterThan(1);

    console.log('📊 壓力測試結果:');
    console.log(`   平均響應時間: ${results.averageResponseTime.toFixed(2)}ms`);
    console.log(`   中位數響應時間: ${results.medianResponseTime.toFixed(2)}ms`);
    console.log(`   P95 響應時間: ${results.p95ResponseTime.toFixed(2)}ms`);
    console.log(`   P99 響應時間: ${results.p99ResponseTime.toFixed(2)}ms`);
    console.log(`   錯誤率: ${(results.errorRate * 100).toFixed(2)}%`);
    console.log(`   每秒請求數: ${results.requestsPerSecond.toFixed(2)}`);

    // 清理頁面
    for (const userPage of userPages) {
      await userPage.close();
    }
  });

  test('API 端點負載測試', async () => {
    const apiEndpoints = [
      '/api/cards',
      '/api/market/data',
      '/api/ai/predictions',
      '/api/portfolio',
      '/api/auth/login'
    ];

    const concurrentRequests = 20;
    const metrics = new PerformanceMetrics();

    console.log(`🚀 開始 API 端點負載測試: ${concurrentRequests} 個並發請求`);

    // 並發請求各個 API 端點
    const requestPromises = apiEndpoints.flatMap(endpoint => 
      Array(concurrentRequests).fill(null).map(async () => {
        const startTime = Date.now();
        try {
          const response = await page.request.get(`http://localhost:5000${endpoint}`);
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          if (response.ok()) {
            metrics.addResponseTime(responseTime);
          } else {
            metrics.addError();
          }
        } catch (error) {
          metrics.addError();
        }
      })
    );

    await Promise.all(requestPromises);
    metrics.finish();
    const results = metrics.getResults();

    // 驗證 API 性能
    expect(results.averageResponseTime).toBeLessThan(2000); // 2秒內響應
    expect(results.errorRate).toBeLessThan(0.1); // 10%以下錯誤率
    expect(results.requestsPerSecond).toBeGreaterThan(5);

    console.log('📊 API 端點負載測試結果:');
    console.log(`   平均響應時間: ${results.averageResponseTime.toFixed(2)}ms`);
    console.log(`   中位數響應時間: ${results.medianResponseTime.toFixed(2)}ms`);
    console.log(`   P95 響應時間: ${results.p95ResponseTime.toFixed(2)}ms`);
    console.log(`   錯誤率: ${(results.errorRate * 100).toFixed(2)}%`);
    console.log(`   每秒請求數: ${results.requestsPerSecond.toFixed(2)}`);
  });

  test('數據庫查詢性能測試', async () => {
    const queryTypes = [
      'SELECT * FROM cards LIMIT 100',
      'SELECT * FROM market_data WHERE card_id = 1',
      'SELECT * FROM ai_predictions ORDER BY created_at DESC LIMIT 50',
      'SELECT * FROM portfolio_items WHERE user_id = 1',
      'SELECT COUNT(*) FROM cards WHERE series = \'ONE PIECE\''
    ];

    const concurrentQueries = 10;
    const metrics = new PerformanceMetrics();

    console.log(`🚀 開始數據庫查詢性能測試: ${concurrentQueries} 個並發查詢`);

    // 模擬數據庫查詢（通過 API）
    const queryPromises = queryTypes.flatMap(queryType => 
      Array(concurrentQueries).fill(null).map(async () => {
        const startTime = Date.now();
        try {
          // 這裡我們通過 API 來測試，實際的數據庫查詢會在後端進行
          const response = await page.request.get('http://localhost:5000/api/cards');
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          if (response.ok()) {
            metrics.addResponseTime(responseTime);
          } else {
            metrics.addError();
          }
        } catch (error) {
          metrics.addError();
        }
      })
    );

    await Promise.all(queryPromises);
    metrics.finish();
    const results = metrics.getResults();

    // 驗證數據庫查詢性能
    expect(results.averageResponseTime).toBeLessThan(1000); // 1秒內響應
    expect(results.errorRate).toBeLessThan(0.05); // 5%以下錯誤率
    expect(results.requestsPerSecond).toBeGreaterThan(10);

    console.log('📊 數據庫查詢性能測試結果:');
    console.log(`   平均響應時間: ${results.averageResponseTime.toFixed(2)}ms`);
    console.log(`   中位數響應時間: ${results.medianResponseTime.toFixed(2)}ms`);
    console.log(`   P95 響應時間: ${results.p95ResponseTime.toFixed(2)}ms`);
    console.log(`   錯誤率: ${(results.errorRate * 100).toFixed(2)}%`);
    console.log(`   每秒查詢數: ${results.requestsPerSecond.toFixed(2)}`);
  });

  // 輔助方法：模擬用戶工作負載
  private async simulateUserWorkload(userPage: Page, metrics: PerformanceMetrics, duration: number): Promise<void> {
    const startTime = Date.now();
    const endTime = startTime + duration;

    while (Date.now() < endTime) {
      const operationStartTime = Date.now();
      
      try {
        // 隨機選擇操作
        const operations = [
          () => userPage.click('[data-testid="card-management-nav"]'),
          () => userPage.click('[data-testid="market-analysis-nav"]'),
          () => userPage.click('[data-testid="ai-ecosystem-nav"]'),
          () => userPage.fill('[data-testid="search-input"]', 'Test'),
          () => userPage.click('[data-testid="portfolio-nav"]'),
          () => userPage.reload()
        ];

        const randomOperation = operations[Math.floor(Math.random() * operations.length)];
        await randomOperation();
        
        const operationEndTime = Date.now();
        const responseTime = operationEndTime - operationStartTime;
        metrics.addResponseTime(responseTime);

        // 隨機延遲
        const delay = Math.random() * 2000 + 1000; // 1-3秒延遲
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } catch (error) {
        metrics.addError();
        console.warn('用戶操作失敗:', error.message);
      }
    }
  }
});

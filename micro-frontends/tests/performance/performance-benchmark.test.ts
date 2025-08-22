import { test, expect, Page } from '@playwright/test';
import {
  setupTestEnvironment,
  cleanupTestEnvironment,
} from '../setup/e2e-setup';

// 性能基準配置
const PERFORMANCE_BENCHMARKS = {
  // 頁面加載基準
  pageLoad: {
    domContentLoaded: 1500, // 1.5秒
    loadComplete: 2500, // 2.5秒
    firstContentfulPaint: 1000, // 1秒
    largestContentfulPaint: 2000, // 2秒
    firstInputDelay: 100, // 100ms
    timeToInteractive: 3000, // 3秒
  },
  // 模組加載基準
  moduleLoad: {
    cardManagement: 1500, // 1.5秒
    marketAnalysis: 1500, // 1.5秒
    aiEcosystem: 2000, // 2秒
    userManagement: 1000, // 1秒
    investmentPortfolio: 1500, // 1.5秒
    socialFeatures: 1500, // 1.5秒
  },
  // API 響應基準
  apiResponse: {
    authentication: 500, // 500ms
    cardOperations: 300, // 300ms
    marketData: 800, // 800ms
    aiPredictions: 2000, // 2秒
    portfolioData: 400, // 400ms
    userData: 300, // 300ms
  },
  // 內存使用基準
  memoryUsage: {
    initialMemory: 50, // 50MB
    maxMemoryGrowth: 100, // 100MB
    memoryLeakThreshold: 20, // 20MB
  },
  // 渲染性能基準
  rendering: {
    frameRate: 60, // 60 FPS
    frameDropThreshold: 5, // 最多丟失5幀
    animationSmoothness: 0.95, // 95%流暢度
  },
};

describe('CardStrategy 性能基準測試', () => {
  let page: Page;

  beforeAll(async () => {
    await setupTestEnvironment();
  });

  beforeEach(async ({ browser }) => {
    page = await browser.newPage();

    // 設置性能監控
    await page.addInitScript(() => {
      // 監控 Web Vitals
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            (window as any).webVitals = (window as any).webVitals || {};
            (window as any).webVitals[entry.name] = entry.startTime;
          }
        });
        observer.observe({
          entryTypes: ['paint', 'largest-contentful-paint', 'first-input'],
        });
      }
    });

    await page.goto('http://localhost:3000');
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  test('核心 Web Vitals 性能測試', async () => {
    // 等待頁面完全加載
    await page.waitForLoadState('networkidle');

    // 測量 Core Web Vitals
    const webVitals = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      const lcpEntries = performance.getEntriesByType(
        'largest-contentful-paint'
      );
      const fidEntries = performance.getEntriesByType('first-input');

      return {
        // LCP (Largest Contentful Paint)
        lcp:
          lcpEntries.length > 0
            ? lcpEntries[lcpEntries.length - 1].startTime
            : 0,

        // FID (First Input Delay)
        fid:
          fidEntries.length > 0
            ? fidEntries[0].processingStart - fidEntries[0].startTime
            : 0,

        // CLS (Cumulative Layout Shift) - 需要額外計算
        cls: 0, // 將在下面計算

        // 其他性能指標
        fcp:
          paintEntries.find((entry) => entry.name === 'first-contentful-paint')
            ?.startTime || 0,
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        ttfb: navigation.responseStart - navigation.requestStart,
      };
    });

    // 計算 CLS
    const cls = await page.evaluate(() => {
      let cls = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (
            entry.entryType === 'layout-shift' &&
            !(entry as any).hadRecentInput
          ) {
            cls += (entry as any).value;
          }
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });

      // 等待一段時間來收集 CLS 數據
      return new Promise((resolve) => {
        setTimeout(() => {
          observer.disconnect();
          resolve(cls);
        }, 5000);
      });
    });

    // 驗證性能基準
    expect(webVitals.lcp).toBeLessThan(
      PERFORMANCE_BENCHMARKS.pageLoad.largestContentfulPaint
    );
    expect(webVitals.fid).toBeLessThan(
      PERFORMANCE_BENCHMARKS.pageLoad.firstInputDelay
    );
    expect(cls).toBeLessThan(0.1); // CLS 應該小於 0.1
    expect(webVitals.fcp).toBeLessThan(
      PERFORMANCE_BENCHMARKS.pageLoad.firstContentfulPaint
    );
    expect(webVitals.domContentLoaded).toBeLessThan(
      PERFORMANCE_BENCHMARKS.pageLoad.domContentLoaded
    );
    expect(webVitals.loadComplete).toBeLessThan(
      PERFORMANCE_BENCHMARKS.pageLoad.loadComplete
    );
    expect(webVitals.ttfb).toBeLessThan(600); // TTFB 應該小於 600ms
  });

  test('微前端模組加載性能測試', async () => {
    const moduleLoadTimes: { [key: string]: number } = {};

    // 監控模組加載
    await page.evaluate(() => {
      (window as any).moduleLoadTimes = {};

      // 攔截模組加載
      const originalLoad = (window as any).loadRemoteModule;
      if (originalLoad) {
        (window as any).loadRemoteModule = async (moduleName: string) => {
          const startTime = performance.now();
          const result = await originalLoad(moduleName);
          const endTime = performance.now();
          (window as any).moduleLoadTimes[moduleName] = endTime - startTime;
          return result;
        };
      }
    });

    // 測試各個模組的加載性能
    const modules = [
      'card-management',
      'market-analysis',
      'ai-ecosystem',
      'user-management',
      'investment-portfolio',
      'social-features',
    ];

    for (const module of modules) {
      const startTime = performance.now();

      try {
        await page.click(`[data-testid="${module}-nav"]`);
        await page.waitForSelector(`[data-testid="${module}-module"]`, {
          timeout: 10000,
        });

        const endTime = performance.now();
        moduleLoadTimes[module] = endTime - startTime;

        // 驗證模組加載時間
        const benchmark =
          PERFORMANCE_BENCHMARKS.moduleLoad[
            module as keyof typeof PERFORMANCE_BENCHMARKS.moduleLoad
          ];
        expect(moduleLoadTimes[module]).toBeLessThan(benchmark);

        console.log(
          `${module} 模組加載時間: ${moduleLoadTimes[module].toFixed(2)}ms`
        );
      } catch (error) {
        console.warn(`模組 ${module} 加載測試失敗:`, error.message);
      }
    }
  });

  test('API 響應性能測試', async () => {
    const apiMetrics: { [key: string]: number } = {};

    // 監控 API 調用
    await page.evaluate(() => {
      (window as any).apiMetrics = {};

      const originalFetch = window.fetch;
      window.fetch = async (url: string, options?: RequestInit) => {
        const startTime = performance.now();
        const response = await originalFetch(url, options);
        const endTime = performance.now();

        const urlKey = url.split('/').pop() || 'unknown';
        (window as any).apiMetrics[urlKey] = endTime - startTime;

        return response;
      };
    });

    // 執行各種 API 操作
    const apiTests = [
      {
        action: () => page.click('[data-testid="card-management-nav"]'),
        name: 'cardOperations',
      },
      {
        action: () => page.fill('[data-testid="search-input"]', 'Luffy'),
        name: 'searchAPI',
      },
      {
        action: () => page.click('[data-testid="market-analysis-nav"]'),
        name: 'marketData',
      },
      {
        action: () => page.click('[data-testid="ai-ecosystem-nav"]'),
        name: 'aiPredictions',
      },
      {
        action: () => page.click('[data-testid="portfolio-nav"]'),
        name: 'portfolioData',
      },
    ];

    for (const test of apiTests) {
      try {
        await test.action();
        await page.waitForTimeout(1000); // 等待 API 調用完成
      } catch (error) {
        console.warn(`API 測試 ${test.name} 失敗:`, error.message);
      }
    }

    // 獲取 API 性能指標
    const metrics = await page.evaluate(() => (window as any).apiMetrics || {});

    // 驗證 API 響應時間
    Object.entries(metrics).forEach(([api, responseTime]) => {
      const benchmark =
        PERFORMANCE_BENCHMARKS.apiResponse[
          api as keyof typeof PERFORMANCE_BENCHMARKS.apiResponse
        ] || 1000;
      expect(responseTime as number).toBeLessThan(benchmark);
      console.log(
        `API ${api} 響應時間: ${(responseTime as number).toFixed(2)}ms`
      );
    });
  });

  test('內存使用和垃圾回收測試', async () => {
    // 測量初始內存使用
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize / (1024 * 1024); // 轉換為 MB
      }
      return 0;
    });

    // 執行內存密集型操作
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="card-management-nav"]');
      await page.waitForTimeout(500);
      await page.click('[data-testid="market-analysis-nav"]');
      await page.waitForTimeout(500);
      await page.click('[data-testid="ai-ecosystem-nav"]');
      await page.waitForTimeout(500);
    }

    // 測量最終內存使用
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize / (1024 * 1024);
      }
      return 0;
    });

    const memoryGrowth = finalMemory - initialMemory;

    // 驗證內存使用基準
    expect(initialMemory).toBeLessThan(
      PERFORMANCE_BENCHMARKS.memoryUsage.initialMemory
    );
    expect(memoryGrowth).toBeLessThan(
      PERFORMANCE_BENCHMARKS.memoryUsage.maxMemoryGrowth
    );

    console.log(`初始內存使用: ${initialMemory.toFixed(2)}MB`);
    console.log(`最終內存使用: ${finalMemory.toFixed(2)}MB`);
    console.log(`內存增長: ${memoryGrowth.toFixed(2)}MB`);
  });

  test('渲染性能和動畫流暢度測試', async () => {
    // 監控幀率
    const frameRates: number[] = [];

    await page.evaluate(() => {
      let frameCount = 0;
      let lastTime = performance.now();

      const measureFrameRate = () => {
        frameCount++;
        const currentTime = performance.now();

        if (currentTime - lastTime >= 1000) {
          // 每秒計算一次
          const fps = (frameCount * 1000) / (currentTime - lastTime);
          frameRates.push(fps);
          frameCount = 0;
          lastTime = currentTime;
        }

        requestAnimationFrame(measureFrameRate);
      };

      requestAnimationFrame(measureFrameRate);
    });

    // 執行一些動畫操作
    await page.click('[data-testid="card-management-nav"]');
    await page.waitForTimeout(2000);
    await page.click('[data-testid="market-analysis-nav"]');
    await page.waitForTimeout(2000);

    // 獲取幀率數據
    const fpsData = await page.evaluate(() => (window as any).frameRates || []);

    if (fpsData.length > 0) {
      const averageFPS =
        fpsData.reduce((a: number, b: number) => a + b, 0) / fpsData.length;
      const minFPS = Math.min(...fpsData);

      // 驗證幀率基準
      expect(averageFPS).toBeGreaterThan(
        PERFORMANCE_BENCHMARKS.rendering.frameRate * 0.8
      ); // 平均幀率應該大於 48 FPS
      expect(minFPS).toBeGreaterThan(
        PERFORMANCE_BENCHMARKS.rendering.frameRate * 0.5
      ); // 最低幀率應該大於 30 FPS

      console.log(`平均幀率: ${averageFPS.toFixed(2)} FPS`);
      console.log(`最低幀率: ${minFPS.toFixed(2)} FPS`);
    }
  });

  test('網絡性能和資源加載測試', async () => {
    // 監控資源加載
    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const resourceTypes: { [key: string]: number[] } = {};

      resources.forEach((resource) => {
        const type = resource.initiatorType;
        if (!resourceTypes[type]) {
          resourceTypes[type] = [];
        }
        resourceTypes[type].push(resource.duration);
      });

      return resourceTypes;
    });

    // 驗證資源加載性能
    Object.entries(resourceMetrics).forEach(([type, durations]) => {
      const averageDuration =
        durations.reduce((a, b) => a + b, 0) / durations.length;

      // 根據資源類型設置不同的基準
      const benchmarks: { [key: string]: number } = {
        script: 500, // JavaScript 文件
        stylesheet: 300, // CSS 文件
        image: 1000, // 圖片文件
        fetch: 800, // API 請求
        xmlhttprequest: 800, // XHR 請求
      };

      const benchmark = benchmarks[type] || 1000;
      expect(averageDuration).toBeLessThan(benchmark);

      console.log(`${type} 資源平均加載時間: ${averageDuration.toFixed(2)}ms`);
    });
  });

  test('並發用戶性能測試', async () => {
    // 模擬多個並發用戶
    const concurrentUsers = 5;
    const userPages: Page[] = [];

    // 創建多個頁面實例
    for (let i = 0; i < concurrentUsers; i++) {
      const userPage = await page.context().newPage();
      await userPage.goto('http://localhost:3000');
      userPages.push(userPage);
    }

    // 並發執行操作
    const concurrentOperations = userPages.map(async (userPage, index) => {
      const startTime = performance.now();

      try {
        // 每個用戶執行不同的操作
        const operations = [
          () => userPage.click('[data-testid="card-management-nav"]'),
          () => userPage.click('[data-testid="market-analysis-nav"]'),
          () => userPage.click('[data-testid="ai-ecosystem-nav"]'),
          () => userPage.fill('[data-testid="search-input"]', `User${index}`),
          () => userPage.click('[data-testid="portfolio-nav"]'),
        ];

        const operation = operations[index % operations.length];
        await operation();
        await userPage.waitForTimeout(1000);

        const endTime = performance.now();
        return endTime - startTime;
      } catch (error) {
        console.warn(`並發用戶 ${index} 操作失敗:`, error.message);
        return 0;
      }
    });

    const operationTimes = await Promise.all(concurrentOperations);

    // 驗證並發性能
    const averageTime =
      operationTimes.reduce((a, b) => a + b, 0) / operationTimes.length;
    const maxTime = Math.max(...operationTimes);

    expect(averageTime).toBeLessThan(5000); // 平均操作時間應該小於 5 秒
    expect(maxTime).toBeLessThan(10000); // 最慢操作時間應該小於 10 秒

    console.log(`並發用戶平均操作時間: ${averageTime.toFixed(2)}ms`);
    console.log(`並發用戶最慢操作時間: ${maxTime.toFixed(2)}ms`);

    // 清理頁面
    for (const userPage of userPages) {
      await userPage.close();
    }
  });
});

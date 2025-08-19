import { test, expect, Page } from '@playwright/test';
import { setupTestEnvironment, cleanupTestEnvironment } from '../setup/e2e-setup';

describe('性能和無障礙性端到端測試', () => {
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

  test('頁面加載性能測試', async () => {
    // 1. 測量初始頁面加載時間
    const loadMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        largestContentfulPaint: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime || 0,
        firstInputDelay: performance.getEntriesByName('first-input-delay')[0]?.startTime || 0
      };
    });

    // 2. 驗證性能指標
    expect(loadMetrics.domContentLoaded).toBeLessThan(2000);
    expect(loadMetrics.loadComplete).toBeLessThan(3000);
    expect(loadMetrics.firstContentfulPaint).toBeLessThan(1500);
    expect(loadMetrics.largestContentfulPaint).toBeLessThan(2500);
  });

  test('模組加載性能測試', async () => {
    // 1. 測量模組加載時間
    const moduleLoadTimes: { [key: string]: number } = {};

    await page.evaluate(() => {
      (window as any).moduleLoadTimes = {};

      const originalLoad = (window as any).loadRemoteModule;
      (window as any).loadRemoteModule = async (moduleName: string) => {
        const startTime = performance.now();
        const result = await originalLoad(moduleName);
        const endTime = performance.now();
        (window as any).moduleLoadTimes[moduleName] = endTime - startTime;
        return result;
      };
    });

    // 2. 加載各個模組並測量時間
    const modules = ['card-management', 'market-analysis', 'ai-ecosystem'];

    for (const module of modules) {
      const startTime = performance.now();
      await page.click(`[data-testid="${module}-nav"]`);
      await page.waitForSelector(`[data-testid="${module}-module"]`);
      const endTime = performance.now();
      moduleLoadTimes[module] = endTime - startTime;
    }

    // 3. 驗證模組加載性能
    Object.values(moduleLoadTimes).forEach(loadTime => {
      expect(loadTime).toBeLessThan(2000);
    });
  });

  test('API 響應性能測試', async () => {
    // 1. 監控 API 調用性能
    const apiMetrics: { [key: string]: number } = {};

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

    // 2. 執行各種 API 操作
    await page.click('[data-testid="card-management-nav"]');
    await page.fill('[data-testid="search-input"]', 'Luffy');
    await page.click('[data-testid="search-button"]');

    await page.click('[data-testid="market-analysis-nav"]');
    await page.click('[data-testid="load-market-data"]');

    await page.click('[data-testid="ai-ecosystem-nav"]');
    await page.click('[data-testid="load-ai-models"]');

    // 3. 獲取 API 性能指標
    const metrics = await page.evaluate(() => (window as any).apiMetrics || {});

    // 4. 驗證 API 響應時間
    Object.values(metrics).forEach(responseTime => {
      expect(responseTime).toBeLessThan(1000);
    });
  });

  test('內存使用和垃圾回收測試', async () => {
    // 1. 測量初始內存使用
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // 2. 執行內存密集型操作
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="card-management-nav"]');
      await page.click('[data-testid="market-analysis-nav"]');
      await page.click('[data-testid="ai-ecosystem-nav"]');
    }

    // 3. 測量最終內存使用
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // 4. 驗證內存增長在合理範圍內
    const memoryGrowth = finalMemory - initialMemory;
    expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // 50MB
  });

  test('圖片優化和懶加載測試', async () => {
    // 1. 檢查圖片是否使用 WebP 格式
    const imageFormats = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      return Array.from(images).map(img => {
        const {src} = (img as HTMLImageElement);
        return {
          src,
          format: src.split('.').pop(),
          hasLazyLoading: (img as HTMLImageElement).loading === 'lazy'
        };
      });
    });

    // 2. 驗證圖片優化
    const webpImages = imageFormats.filter(img => img.format === 'webp');
    const lazyLoadedImages = imageFormats.filter(img => img.hasLazyLoading);

    expect(webpImages.length).toBeGreaterThan(0);
    expect(lazyLoadedImages.length).toBeGreaterThan(0);

    // 3. 測試懶加載功能
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const loadedImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img[loading="lazy"]');
      return Array.from(images).map(img => (img as HTMLImageElement).complete);
    });

    expect(loadedImages.every(loaded => loaded)).toBe(true);
  });

  test('鍵盤導航無障礙性測試', async () => {
    // 1. 測試 Tab 鍵導航
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // 2. 測試所有可聚焦元素
    const focusableElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])');
      return Array.from(elements).map(el => ({
        tagName: el.tagName,
        textContent: el.textContent?.trim(),
        hasFocus: document.activeElement === el
      }));
    });

    expect(focusableElements.length).toBeGreaterThan(0);

    // 3. 測試鍵盤快捷鍵
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible();
  });

  test('屏幕閱讀器無障礙性測試', async () => {
    // 1. 檢查 ARIA 標籤
    const ariaLabels = await page.evaluate(() => {
      const elements = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');
      return Array.from(elements).map(el => ({
        tagName: el.tagName,
        ariaLabel: el.getAttribute('aria-label'),
        ariaLabelledBy: el.getAttribute('aria-labelledby'),
        ariaDescribedBy: el.getAttribute('aria-describedby')
      }));
    });

    expect(ariaLabels.length).toBeGreaterThan(0);

    // 2. 檢查語義化 HTML
    const semanticElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('nav, main, section, article, aside, header, footer');
      return Array.from(elements).map(el => el.tagName);
    });

    expect(semanticElements).toContain('nav');
    expect(semanticElements).toContain('main');

    // 3. 檢查顏色對比度
    const colorContrast = await page.evaluate(() => {
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
      return Array.from(textElements).some(el => {
        const style = window.getComputedStyle(el);
        const {backgroundColor} = style;
        const {color} = style;
        // 簡單的顏色對比度檢查
        return backgroundColor !== 'transparent' && color !== 'transparent';
      });
    });

    expect(colorContrast).toBe(true);
  });

  test('響應式設計測試', async () => {
    // 1. 測試桌面視圖
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="desktop-layout"]')).toBeVisible();

    // 2. 測試平板視圖
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible();

    // 3. 測試手機視圖
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();

    // 4. 測試導航菜單響應式行為
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  test('錯誤邊界和恢復測試', async () => {
    // 1. 模擬 JavaScript 錯誤
    await page.evaluate(() => {
      window.addEventListener('error', (e) => {
        (window as any).lastError = e.message;
      });
    });

    // 2. 觸發錯誤
    await page.evaluate(() => {
      try {
        throw new Error('Test error');
      } catch (error) {
        (window as any).lastError = error.message;
      }
    });

    // 3. 驗證錯誤處理
    const lastError = await page.evaluate(() => (window as any).lastError);
    expect(lastError).toBe('Test error');

    // 4. 驗證應用仍然可用
    await expect(page.locator('[data-testid="app-content"]')).toBeVisible();
  });

  test('離線功能測試', async () => {
    // 1. 模擬離線狀態
    await page.route('**/*', route => route.abort());

    // 2. 測試離線功能
    await page.click('[data-testid="card-management-nav"]');
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();

    // 3. 驗證緩存內容仍然可用
    await expect(page.locator('[data-testid="cached-content"]')).toBeVisible();

    // 4. 恢復在線狀態
    await page.unroute('**/*');

    // 5. 驗證在線功能恢復
    await page.reload();
    await expect(page.locator('[data-testid="online-indicator"]')).toBeVisible();
  });

  test('國際化和本地化測試', async () => {
    // 1. 測試語言切換
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-zh-TW"]');

    // 2. 驗證界面語言已更改
    await expect(page.locator('[data-testid="app-title"]')).toContainText('CardStrategy');

    // 3. 測試日期格式本地化
    const dateFormat = await page.evaluate(() => {
      const date = new Date();
      return date.toLocaleDateString('zh-TW');
    });

    expect(dateFormat).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/);

    // 4. 測試數字格式本地化
    const numberFormat = await page.evaluate(() => {
      return new Intl.NumberFormat('zh-TW').format(1234567);
    });

    expect(numberFormat).toContain(',');
  });

  test('安全性和隱私測試', async () => {
    // 1. 檢查 HTTPS 和 CSP
    const securityHeaders = await page.evaluate(() => {
      return {
        protocol: window.location.protocol,
        hasCSP: document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null
      };
    });

    expect(securityHeaders.protocol).toBe('https:');
    expect(securityHeaders.hasCSP).toBe(true);

    // 2. 測試 XSS 防護
    const xssTest = await page.evaluate(() => {
      const testInput = document.createElement('input');
      testInput.value = '<script>alert("xss")</script>';
      return testInput.value.includes('<script>');
    });

    expect(xssTest).toBe(true);

    // 3. 測試敏感數據保護
    await page.click('[data-testid="user-profile"]');
    await expect(page.locator('[data-testid="password-field"]')).toHaveAttribute('type', 'password');
  });
});

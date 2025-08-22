import { test, expect, Page } from '@playwright/test';
import {
  setupTestEnvironment,
  cleanupTestEnvironment,
} from '../setup/e2e-setup';

describe('微前端模組集成端到端測試', () => {
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

  test('Shell 應用動態加載微前端模組', async () => {
    // 1. 訪問 Shell 應用
    await expect(page).toHaveTitle(/CardStrategy/);

    // 2. 驗證 Shell 應用已加載
    await expect(page.locator('[data-testid="shell-app"]')).toBeVisible();

    // 3. 檢查微前端模組是否可用
    const moduleStatus = await page.evaluate(() => {
      return {
        cardManagement: window.cardManagement !== undefined,
        marketAnalysis: window.marketAnalysis !== undefined,
        aiEcosystem: window.aiEcosystem !== undefined,
        userManagement: window.userManagement !== undefined,
        investmentPortfolio: window.investmentPortfolio !== undefined,
        socialFeatures: window.socialFeatures !== undefined,
      };
    });

    expect(moduleStatus.cardManagement).toBe(true);
    expect(moduleStatus.marketAnalysis).toBe(true);
    expect(moduleStatus.aiEcosystem).toBe(true);
  });

  test('卡片管理模組動態加載和渲染', async () => {
    // 1. 導航到卡片管理模組
    await page.click('[data-testid="card-management-nav"]');
    await expect(page).toHaveURL(/.*card-management/);

    // 2. 等待模組加載
    await expect(
      page.locator('[data-testid="card-management-module"]')
    ).toBeVisible();

    // 3. 驗證模組組件已渲染
    await expect(page.locator('[data-testid="card-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-search"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-filters"]')).toBeVisible();

    // 4. 測試模組功能
    await page.fill('[data-testid="search-input"]', 'Luffy');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('市場分析模組動態加載和數據共享', async () => {
    // 1. 導航到市場分析模組
    await page.click('[data-testid="market-analysis-nav"]');
    await expect(page).toHaveURL(/.*market-analysis/);

    // 2. 等待模組加載
    await expect(
      page.locator('[data-testid="market-analysis-module"]')
    ).toBeVisible();

    // 3. 驗證模組組件已渲染
    await expect(
      page.locator('[data-testid="market-dashboard"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="price-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="market-trends"]')).toBeVisible();

    // 4. 測試數據共享
    await page.click('[data-testid="select-card-button"]');
    await page.click('[data-testid="card-item-luffy"]');

    // 5. 驗證數據已傳遞到其他模組
    await page.click('[data-testid="card-management-nav"]');
    await expect(page.locator('[data-testid="selected-card"]')).toContainText(
      'Luffy'
    );
  });

  test('AI 生態系統模組動態加載和 AI 功能', async () => {
    // 1. 導航到 AI 生態系統模組
    await page.click('[data-testid="ai-ecosystem-nav"]');
    await expect(page).toHaveURL(/.*ai-ecosystem/);

    // 2. 等待模組加載
    await expect(
      page.locator('[data-testid="ai-ecosystem-module"]')
    ).toBeVisible();

    // 3. 驗證模組組件已渲染
    await expect(page.locator('[data-testid="ai-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-scanner"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="market-predictor"]')
    ).toBeVisible();

    // 4. 測試 AI 掃描功能
    const fileInput = page.locator('[data-testid="ai-scan-input"]');
    await fileInput.setInputFiles('tests/fixtures/test-card.jpg');

    await expect(page.locator('[data-testid="scanning-status"]')).toContainText(
      'AI 分析中'
    );
    await expect(page.locator('[data-testid="scanning-status"]')).toContainText(
      '分析完成',
      { timeout: 10000 }
    );

    // 5. 驗證 AI 預測結果
    await expect(page.locator('[data-testid="ai-prediction"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="confidence-score"]')
    ).toBeVisible();
  });

  test('模組間狀態同步和通信', async () => {
    // 1. 在卡片管理模組中選擇卡片
    await page.click('[data-testid="card-management-nav"]');
    await page.click('[data-testid="card-item-luffy"]');

    // 2. 驗證狀態已更新
    await expect(
      page.locator('[data-testid="selected-card-name"]')
    ).toContainText('Luffy');

    // 3. 切換到市場分析模組
    await page.click('[data-testid="market-analysis-nav"]');

    // 4. 驗證狀態已同步
    await expect(page.locator('[data-testid="current-card"]')).toContainText(
      'Luffy'
    );

    // 5. 在市場分析中設置價格提醒
    await page.fill('[data-testid="price-alert-input"]', '100');
    await page.click('[data-testid="set-alert-button"]');

    // 6. 切換回卡片管理模組
    await page.click('[data-testid="card-management-nav"]');

    // 7. 驗證提醒狀態已同步
    await expect(
      page.locator('[data-testid="price-alert-status"]')
    ).toContainText('已設置');
  });

  test('模組間事件通信', async () => {
    // 1. 監聽自定義事件
    const eventLog: string[] = [];
    await page.evaluate(() => {
      window.addEventListener('card-selected', (e: any) => {
        eventLog.push(`card-selected: ${e.detail.cardName}`);
      });
      window.addEventListener('price-alert-set', (e: any) => {
        eventLog.push(`price-alert-set: ${e.detail.price}`);
      });
    });

    // 2. 在卡片管理模組中觸發事件
    await page.click('[data-testid="card-management-nav"]');
    await page.click('[data-testid="card-item-luffy"]');

    // 3. 在市場分析模組中設置價格提醒
    await page.click('[data-testid="market-analysis-nav"]');
    await page.fill('[data-testid="price-alert-input"]', '100');
    await page.click('[data-testid="set-alert-button"]');

    // 4. 驗證事件已觸發
    const events = await page.evaluate(() => (window as any).eventLog || []);
    expect(events).toContain('card-selected: Luffy');
    expect(events).toContain('price-alert-set: 100');
  });

  test('模組加載性能監控', async () => {
    // 1. 監控模組加載時間
    const loadTimes: { [key: string]: number } = {};

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

    // 2. 加載各個模組
    await page.click('[data-testid="card-management-nav"]');
    await page.waitForTimeout(1000);

    await page.click('[data-testid="market-analysis-nav"]');
    await page.waitForTimeout(1000);

    await page.click('[data-testid="ai-ecosystem-nav"]');
    await page.waitForTimeout(1000);

    // 3. 獲取加載時間
    const times = await page.evaluate(
      () => (window as any).moduleLoadTimes || {}
    );

    // 4. 驗證性能指標
    expect(times.cardManagement).toBeLessThan(2000);
    expect(times.marketAnalysis).toBeLessThan(2000);
    expect(times.aiEcosystem).toBeLessThan(2000);
  });

  test('模組錯誤處理和恢復', async () => {
    // 1. 模擬模組加載失敗
    await page.evaluate(() => {
      const originalLoad = (window as any).loadRemoteModule;
      (window as any).loadRemoteModule = async (moduleName: string) => {
        if (moduleName === 'userManagement') {
          throw new Error('Module load failed');
        }
        return originalLoad(moduleName);
      };
    });

    // 2. 嘗試加載失敗的模組
    await page.click('[data-testid="user-management-nav"]');

    // 3. 驗證錯誤處理
    await expect(page.locator('[data-testid="module-error"]')).toContainText(
      '模組加載失敗'
    );
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();

    // 4. 恢復正常加載
    await page.evaluate(() => {
      (window as any).loadRemoteModule = (
        window as any
      ).originalLoadRemoteModule;
    });

    // 5. 重試加載
    await page.click('[data-testid="retry-button"]');
    await expect(
      page.locator('[data-testid="user-management-module"]')
    ).toBeVisible();
  });

  test('模組版本兼容性測試', async () => {
    // 1. 檢查模組版本信息
    const moduleVersions = await page.evaluate(() => {
      return {
        cardManagement: (window as any).cardManagement?.version,
        marketAnalysis: (window as any).marketAnalysis?.version,
        aiEcosystem: (window as any).aiEcosystem?.version,
      };
    });

    // 2. 驗證版本格式
    expect(moduleVersions.cardManagement).toMatch(/^\d+\.\d+\.\d+$/);
    expect(moduleVersions.marketAnalysis).toMatch(/^\d+\.\d+\.\d+$/);
    expect(moduleVersions.aiEcosystem).toMatch(/^\d+\.\d+\.\d+$/);

    // 3. 測試版本兼容性
    await page.evaluate(() => {
      const shellVersion = '1.0.0';
      const moduleVersions = [
        (window as any).cardManagement?.version,
        (window as any).marketAnalysis?.version,
        (window as any).aiEcosystem?.version,
      ];

      // 簡單的版本兼容性檢查
      const isCompatible = moduleVersions.every((version) => {
        const major = parseInt(version.split('.')[0]);
        return major >= 1;
      });

      (window as any).compatibilityCheck = isCompatible;
    });

    const isCompatible = await page.evaluate(
      () => (window as any).compatibilityCheck
    );
    expect(isCompatible).toBe(true);
  });

  test('模組間路由和導航', async () => {
    // 1. 測試直接 URL 訪問
    await page.goto('http://localhost:3000/card-management');
    await expect(
      page.locator('[data-testid="card-management-module"]')
    ).toBeVisible();

    await page.goto('http://localhost:3000/market-analysis');
    await expect(
      page.locator('[data-testid="market-analysis-module"]')
    ).toBeVisible();

    await page.goto('http://localhost:3000/ai-ecosystem');
    await expect(
      page.locator('[data-testid="ai-ecosystem-module"]')
    ).toBeVisible();

    // 2. 測試瀏覽器後退/前進
    await page.goBack();
    await expect(
      page.locator('[data-testid="market-analysis-module"]')
    ).toBeVisible();

    await page.goBack();
    await expect(
      page.locator('[data-testid="card-management-module"]')
    ).toBeVisible();

    await page.goForward();
    await expect(
      page.locator('[data-testid="market-analysis-module"]')
    ).toBeVisible();
  });

  test('模組間數據持久化', async () => {
    // 1. 在卡片管理模組中設置偏好
    await page.click('[data-testid="card-management-nav"]');
    await page.click('[data-testid="settings-button"]');
    await page.selectOption('[data-testid="sort-order-select"]', 'price-desc');
    await page.click('[data-testid="save-settings"]');

    // 2. 刷新頁面
    await page.reload();

    // 3. 驗證設置已保存
    await page.click('[data-testid="card-management-nav"]');
    await expect(page.locator('[data-testid="sort-order-select"]')).toHaveValue(
      'price-desc'
    );

    // 4. 在其他模組中驗證設置同步
    await page.click('[data-testid="market-analysis-nav"]');
    await expect(
      page.locator('[data-testid="sort-order-indicator"]')
    ).toContainText('價格降序');
  });
});

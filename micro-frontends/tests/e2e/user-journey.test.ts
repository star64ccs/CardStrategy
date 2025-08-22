import { test, expect, Page } from '@playwright/test';
import {
  setupTestEnvironment,
  cleanupTestEnvironment,
} from '../setup/e2e-setup';

// 測試數據
const testUser = {
  email: 'test@cardstrategy.com',
  password: 'TestPassword123!',
  username: 'testuser',
};

const testCard = {
  name: 'Monkey D. Luffy',
  series: 'ONE PIECE',
  rarity: 'Rare',
  condition: 'Near Mint',
};

describe('CardStrategy 用戶旅程端到端測試', () => {
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

  test('完整用戶註冊和登錄流程', async () => {
    // 1. 訪問首頁
    await expect(page).toHaveTitle(/CardStrategy/);

    // 2. 點擊註冊按鈕
    await page.click('[data-testid="register-button"]');
    await expect(page).toHaveURL(/.*register/);

    // 3. 填寫註冊表單
    await page.fill('[data-testid="username-input"]', testUser.username);
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.fill(
      '[data-testid="confirm-password-input"]',
      testUser.password
    );

    // 4. 提交註冊
    await page.click('[data-testid="submit-register"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // 5. 驗證用戶已登錄
    await expect(page.locator('[data-testid="user-profile"]')).toContainText(
      testUser.username
    );
  });

  test('卡片掃描和識別流程', async () => {
    // 1. 登錄用戶
    await loginUser(page, testUser);

    // 2. 導航到卡片掃描頁面
    await page.click('[data-testid="card-scanner-nav"]');
    await expect(page).toHaveURL(/.*scanner/);

    // 3. 上傳卡片圖片
    const fileInput = page.locator('[data-testid="card-image-input"]');
    await fileInput.setInputFiles('tests/fixtures/test-card.jpg');

    // 4. 等待 AI 識別
    await expect(page.locator('[data-testid="scanning-status"]')).toContainText(
      '識別中'
    );
    await expect(page.locator('[data-testid="scanning-status"]')).toContainText(
      '識別完成',
      { timeout: 10000 }
    );

    // 5. 驗證識別結果
    await expect(page.locator('[data-testid="card-name"]')).toContainText(
      testCard.name
    );
    await expect(page.locator('[data-testid="card-series"]')).toContainText(
      testCard.series
    );
  });

  test('市場分析和價格預測流程', async () => {
    // 1. 登錄用戶
    await loginUser(page, testUser);

    // 2. 導航到市場分析頁面
    await page.click('[data-testid="market-analysis-nav"]');
    await expect(page).toHaveURL(/.*market/);

    // 3. 搜索卡片
    await page.fill('[data-testid="card-search-input"]', testCard.name);
    await page.click('[data-testid="search-button"]');

    // 4. 等待搜索結果
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await page.click(`[data-testid="card-item-${testCard.name}"]`);

    // 5. 查看價格圖表
    await expect(page.locator('[data-testid="price-chart"]')).toBeVisible();

    // 6. 查看 AI 預測
    await page.click('[data-testid="ai-prediction-tab"]');
    await expect(
      page.locator('[data-testid="prediction-chart"]')
    ).toBeVisible();

    // 7. 設置價格提醒
    await page.fill('[data-testid="price-alert-input"]', '100');
    await page.click('[data-testid="set-alert-button"]');
    await expect(page.locator('[data-testid="alert-success"]')).toContainText(
      '提醒已設置'
    );
  });

  test('投資組合管理流程', async () => {
    // 1. 登錄用戶
    await loginUser(page, testUser);

    // 2. 導航到投資組合頁面
    await page.click('[data-testid="portfolio-nav"]');
    await expect(page).toHaveURL(/.*portfolio/);

    // 3. 添加卡片到投資組合
    await page.click('[data-testid="add-card-button"]');
    await page.fill('[data-testid="card-name-input"]', testCard.name);
    await page.fill('[data-testid="purchase-price-input"]', '50');
    await page.fill('[data-testid="quantity-input"]', '2');
    await page.click('[data-testid="save-card-button"]');

    // 4. 驗證卡片已添加
    await expect(page.locator('[data-testid="portfolio-card"]')).toContainText(
      testCard.name
    );

    // 5. 查看投資組合分析
    await page.click('[data-testid="portfolio-analysis-tab"]');
    await expect(page.locator('[data-testid="total-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="profit-loss"]')).toBeVisible();
  });

  test('AI 生態系統互動流程', async () => {
    // 1. 登錄用戶
    await loginUser(page, testUser);

    // 2. 導航到 AI 生態系統頁面
    await page.click('[data-testid="ai-ecosystem-nav"]');
    await expect(page).toHaveURL(/.*ai-ecosystem/);

    // 3. 啟動 AI 聊天
    await page.click('[data-testid="ai-chat-button"]');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();

    // 4. 發送消息給 AI
    await page.fill('[data-testid="chat-input"]', '分析這張卡片的投資價值');
    await page.click('[data-testid="send-message-button"]');

    // 5. 等待 AI 回應
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({
      timeout: 10000,
    });

    // 6. 查看 AI 建議
    await expect(page.locator('[data-testid="ai-suggestions"]')).toBeVisible();
  });

  test('社交功能和分享流程', async () => {
    // 1. 登錄用戶
    await loginUser(page, testUser);

    // 2. 導航到社交功能頁面
    await page.click('[data-testid="social-features-nav"]');
    await expect(page).toHaveURL(/.*social/);

    // 3. 創建帖子
    await page.click('[data-testid="create-post-button"]');
    await page.fill('[data-testid="post-content"]', '分享我的新卡片收藏！');
    await page.click('[data-testid="publish-post-button"]');

    // 4. 驗證帖子已發布
    await expect(page.locator('[data-testid="user-post"]')).toContainText(
      '分享我的新卡片收藏！'
    );

    // 5. 添加評論
    await page.fill('[data-testid="comment-input"]', '很棒的收藏！');
    await page.click('[data-testid="add-comment-button"]');

    // 6. 驗證評論已添加
    await expect(page.locator('[data-testid="comment"]')).toContainText(
      '很棒的收藏！'
    );
  });

  test('數據質量評估流程', async () => {
    // 1. 登錄用戶
    await loginUser(page, testUser);

    // 2. 導航到數據質量頁面
    await page.click('[data-testid="data-quality-nav"]');
    await expect(page).toHaveURL(/.*data-quality/);

    // 3. 運行數據質量檢查
    await page.click('[data-testid="run-quality-check"]');
    await expect(
      page.locator('[data-testid="quality-check-status"]')
    ).toContainText('檢查中');
    await expect(
      page.locator('[data-testid="quality-check-status"]')
    ).toContainText('完成', { timeout: 15000 });

    // 4. 查看質量報告
    await expect(page.locator('[data-testid="quality-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="quality-issues"]')).toBeVisible();

    // 5. 修復數據問題
    await page.click('[data-testid="fix-issues-button"]');
    await expect(page.locator('[data-testid="fix-progress"]')).toBeVisible();
  });

  test('隱私設置和數據管理流程', async () => {
    // 1. 登錄用戶
    await loginUser(page, testUser);

    // 2. 導航到隱私設置頁面
    await page.click('[data-testid="privacy-settings-nav"]');
    await expect(page).toHaveURL(/.*privacy/);

    // 3. 修改隱私設置
    await page.click('[data-testid="data-sharing-toggle"]');
    await page.click('[data-testid="analytics-toggle"]');

    // 4. 保存設置
    await page.click('[data-testid="save-privacy-settings"]');
    await expect(page.locator('[data-testid="settings-saved"]')).toContainText(
      '設置已保存'
    );

    // 5. 導出個人數據
    await page.click('[data-testid="export-data-button"]');
    await expect(page.locator('[data-testid="export-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="export-complete"]')).toBeVisible({
      timeout: 10000,
    });
  });

  test('錯誤處理和恢復流程', async () => {
    // 1. 登錄用戶
    await loginUser(page, testUser);

    // 2. 模擬網絡錯誤
    await page.route('**/api/cards', (route) => route.abort('failed'));

    // 3. 嘗試加載卡片列表
    await page.click('[data-testid="cards-nav"]');

    // 4. 驗證錯誤處理
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      '加載失敗'
    );
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();

    // 5. 恢復正常網絡
    await page.unroute('**/api/cards');

    // 6. 重試操作
    await page.click('[data-testid="retry-button"]');
    await expect(page.locator('[data-testid="cards-list"]')).toBeVisible();
  });

  test('性能監控和優化流程', async () => {
    // 1. 登錄用戶
    await loginUser(page, testUser);

    // 2. 監控頁面加載性能
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        firstContentfulPaint:
          performance.getEntriesByName('first-contentful-paint')[0]
            ?.startTime || 0,
      };
    });

    // 3. 驗證性能指標
    expect(performanceMetrics.loadTime).toBeLessThan(3000);
    expect(performanceMetrics.domContentLoaded).toBeLessThan(2000);

    // 4. 測試圖片懶加載
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // 5. 驗證圖片已加載
    const imageLoadStatus = await page.evaluate(() => {
      const images = document.querySelectorAll('img[data-testid="lazy-image"]');
      return Array.from(images).map(
        (img) => (img as HTMLImageElement).complete
      );
    });

    expect(imageLoadStatus.every((loaded) => loaded)).toBe(true);
  });
});

// 輔助函數
async function loginUser(page: Page, user: typeof testUser) {
  await page.click('[data-testid="login-button"]');
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);
  await page.click('[data-testid="submit-login"]');
  await expect(page).toHaveURL(/.*dashboard/);
}

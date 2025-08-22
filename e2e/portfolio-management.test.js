/* eslint-env jest, detox */

const { by, device, element } = require('detox');

describe('Portfolio Management Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  describe('Portfolio Overview', () => {
    beforeEach(async () => {
      // 先登錄
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await expect(element(by.text('首頁'))).toBeVisible();
    });

    it('should display portfolio overview on home screen', async () => {
      // 檢查投資組合概覽區域
      await expect(element(by.text('💎 投資組合'))).toBeVisible();
      await expect(element(by.text('查看全部'))).toBeVisible();

      // 檢查投資組合統計
      await expect(element(by.id('portfolio-total-value'))).toBeVisible();
      await expect(element(by.id('portfolio-profit-loss'))).toBeVisible();
      await expect(element(by.id('portfolio-percentage'))).toBeVisible();
    });

    it('should navigate to portfolio detail screen', async () => {
      // 點擊查看全部
      await element(by.text('查看全部')).tap();

      // 檢查投資組合詳細屏幕
      await expect(element(by.text('我的投資組合'))).toBeVisible();
      await expect(element(by.text('總價值'))).toBeVisible();
      await expect(element(by.text('總收益'))).toBeVisible();
      await expect(element(by.text('收益率'))).toBeVisible();
    });

    it('should display portfolio performance chart', async () => {
      // 導航到投資組合詳細屏幕
      await element(by.text('查看全部')).tap();

      // 檢查性能圖表
      await expect(element(by.id('performance-chart'))).toBeVisible();
      await expect(element(by.text('7天'))).toBeVisible();
      await expect(element(by.text('30天'))).toBeVisible();
      await expect(element(by.text('1年'))).toBeVisible();
    });
  });

  describe('Portfolio Cards Management', () => {
    beforeEach(async () => {
      // 登錄並導航到投資組合
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('查看全部')).tap();
    });

    it('should display portfolio cards list', async () => {
      // 檢查卡片列表
      await expect(element(by.id('portfolio-cards-list'))).toBeVisible();
      await expect(element(by.text('添加卡片'))).toBeVisible();
    });

    it('should add new card to portfolio', async () => {
      // 點擊添加卡片
      await element(by.text('添加卡片')).tap();

      // 檢查添加卡片界面
      await expect(element(by.text('添加卡片到投資組合'))).toBeVisible();
      await expect(element(by.id('card-search-input'))).toBeVisible();
      await expect(element(by.text('掃描卡片'))).toBeVisible();
      await expect(element(by.text('手動添加'))).toBeVisible();
    });

    it('should search and add card manually', async () => {
      // 導航到添加卡片界面
      await element(by.text('添加卡片')).tap();
      await element(by.text('手動添加')).tap();

      // 填寫卡片信息
      await element(by.id('card-name-input')).typeText('青眼白龍');
      await element(by.id('card-set-input')).typeText('遊戲王');
      await element(by.id('card-condition-input')).tap();
      await element(by.text('全新')).tap();
      await element(by.id('purchase-price-input')).typeText('1000');
      await element(by.id('purchase-date-input')).tap();
      await element(by.text('今天')).tap();

      // 保存卡片
      await element(by.text('保存')).tap();

      // 檢查是否成功添加
      await expect(element(by.text('卡片已成功添加到投資組合'))).toBeVisible();
    });

    it('should edit portfolio card', async () => {
      // 長按卡片進行編輯
      await element(by.id('portfolio-card-0')).longPress();

      // 檢查編輯選項
      await expect(element(by.text('編輯'))).toBeVisible();
      await expect(element(by.text('刪除'))).toBeVisible();
      await expect(element(by.text('查看詳情'))).toBeVisible();

      // 點擊編輯
      await element(by.text('編輯')).tap();

      // 修改價格
      await element(by.id('purchase-price-input')).clearText();
      await element(by.id('purchase-price-input')).typeText('1200');

      // 保存修改
      await element(by.text('保存')).tap();

      // 檢查是否成功更新
      await expect(element(by.text('卡片信息已更新'))).toBeVisible();
    });

    it('should delete portfolio card', async () => {
      // 長按卡片
      await element(by.id('portfolio-card-0')).longPress();

      // 點擊刪除
      await element(by.text('刪除')).tap();

      // 確認刪除
      await expect(element(by.text('確認刪除'))).toBeVisible();
      await element(by.text('確認')).tap();

      // 檢查是否成功刪除
      await expect(element(by.text('卡片已從投資組合中刪除'))).toBeVisible();
    });
  });

  describe('Portfolio Analytics', () => {
    beforeEach(async () => {
      // 登錄並導航到投資組合
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('查看全部')).tap();
    });

    it('should display portfolio analytics', async () => {
      // 點擊分析標籤
      await element(by.text('分析')).tap();

      // 檢查分析界面
      await expect(element(by.text('投資組合分析'))).toBeVisible();
      await expect(element(by.text('資產分配'))).toBeVisible();
      await expect(element(by.text('收益分析'))).toBeVisible();
      await expect(element(by.text('風險評估'))).toBeVisible();
    });

    it('should show asset allocation chart', async () => {
      // 導航到分析界面
      await element(by.text('分析')).tap();

      // 檢查資產分配圖表
      await expect(element(by.id('asset-allocation-chart'))).toBeVisible();
      await expect(element(by.text('遊戲王'))).toBeVisible();
      await expect(element(by.text('寶可夢'))).toBeVisible();
    });

    it('should show profit analysis', async () => {
      // 導航到分析界面
      await element(by.text('分析')).tap();

      // 點擊收益分析
      await element(by.text('收益分析')).tap();

      // 檢查收益分析詳情
      await expect(element(by.text('總收益'))).toBeVisible();
      await expect(element(by.text('平均收益率'))).toBeVisible();
      await expect(element(by.text('最佳表現'))).toBeVisible();
      await expect(element(by.text('最差表現'))).toBeVisible();
    });

    it('should show risk assessment', async () => {
      // 導航到分析界面
      await element(by.text('分析')).tap();

      // 點擊風險評估
      await element(by.text('風險評估')).tap();

      // 檢查風險評估詳情
      await expect(element(by.text('風險評級'))).toBeVisible();
      await expect(element(by.text('波動性'))).toBeVisible();
      await expect(element(by.text('建議'))).toBeVisible();
    });
  });

  describe('Portfolio Settings', () => {
    beforeEach(async () => {
      // 登錄並導航到投資組合
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('查看全部')).tap();
    });

    it('should access portfolio settings', async () => {
      // 點擊設置按鈕
      await element(by.id('portfolio-settings-button')).tap();

      // 檢查設置界面
      await expect(element(by.text('投資組合設置'))).toBeVisible();
      await expect(element(by.text('通知設置'))).toBeVisible();
      await expect(element(by.text('數據同步'))).toBeVisible();
      await expect(element(by.text('導出數據'))).toBeVisible();
    });

    it('should configure portfolio notifications', async () => {
      // 導航到設置
      await element(by.id('portfolio-settings-button')).tap();
      await element(by.text('通知設置')).tap();

      // 配置通知
      await element(by.id('price-alert-toggle')).tap();
      await element(by.id('market-update-toggle')).tap();
      await element(by.id('portfolio-summary-toggle')).tap();

      // 保存設置
      await element(by.text('保存')).tap();

      // 檢查是否成功保存
      await expect(element(by.text('設置已保存'))).toBeVisible();
    });

    it('should export portfolio data', async () => {
      // 導航到設置
      await element(by.id('portfolio-settings-button')).tap();
      await element(by.text('導出數據')).tap();

      // 選擇導出格式
      await expect(element(by.text('選擇導出格式'))).toBeVisible();
      await element(by.text('CSV')).tap();

      // 選擇導出範圍
      await element(by.text('全部數據')).tap();

      // 開始導出
      await element(by.text('導出')).tap();

      // 檢查導出成功
      await expect(element(by.text('數據導出成功'))).toBeVisible();
    });
  });

  describe('Portfolio Performance Tracking', () => {
    beforeEach(async () => {
      // 登錄並導航到投資組合
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('查看全部')).tap();
    });

    it('should track portfolio performance over time', async () => {
      // 點擊性能標籤
      await element(by.text('性能')).tap();

      // 檢查性能追蹤界面
      await expect(element(by.text('性能追蹤'))).toBeVisible();
      await expect(element(by.id('performance-chart'))).toBeVisible();
      await expect(element(by.text('歷史記錄'))).toBeVisible();
    });

    it('should show performance milestones', async () => {
      // 導航到性能界面
      await element(by.text('性能')).tap();

      // 檢查里程碑
      await expect(element(by.text('里程碑'))).toBeVisible();
      await expect(element(by.text('首次投資'))).toBeVisible();
      await expect(element(by.text('最佳單日收益'))).toBeVisible();
      await expect(element(by.text('投資組合價值里程碑'))).toBeVisible();
    });

    it('should compare portfolio performance', async () => {
      // 導航到性能界面
      await element(by.text('性能')).tap();

      // 點擊比較功能
      await element(by.text('比較')).tap();

      // 選擇比較基準
      await expect(element(by.text('選擇比較基準'))).toBeVisible();
      await element(by.text('市場指數')).tap();

      // 查看比較結果
      await expect(element(by.id('comparison-chart'))).toBeVisible();
      await expect(element(by.text('相對表現'))).toBeVisible();
    });
  });
});

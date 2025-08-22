/* eslint-env jest, detox */

const { by, device, element } = require('detox');

describe('Market Analysis Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  describe('Market Overview', () => {
    beforeEach(async () => {
      // 先登錄
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await expect(element(by.text('首頁'))).toBeVisible();
    });

    it('should navigate to market analysis screen', async () => {
      // 點擊投資標籤
      await element(by.text('投資')).tap();

      // 檢查市場分析界面
      await expect(element(by.text('市場分析'))).toBeVisible();
      await expect(element(by.text('市場概覽'))).toBeVisible();
      await expect(element(by.text('熱門卡片'))).toBeVisible();
      await expect(element(by.text('價格趨勢'))).toBeVisible();
    });

    it('should display market overview', async () => {
      // 導航到市場分析
      await element(by.text('投資')).tap();

      // 檢查市場概覽
      await expect(element(by.text('市場概覽'))).toBeVisible();
      await expect(element(by.id('market-index-chart'))).toBeVisible();
      await expect(element(by.text('市場指數'))).toBeVisible();
      await expect(element(by.text('交易量'))).toBeVisible();
      await expect(element(by.text('活躍度'))).toBeVisible();
    });

    it('should show market statistics', async () => {
      // 導航到市場分析
      await element(by.text('投資')).tap();

      // 檢查市場統計
      await expect(element(by.text('今日漲幅'))).toBeVisible();
      await expect(element(by.text('今日跌幅'))).toBeVisible();
      await expect(element(by.text('交易量'))).toBeVisible();
      await expect(element(by.text('活躍卡片'))).toBeVisible();
    });
  });

  describe('Price Tracking', () => {
    beforeEach(async () => {
      // 登錄並導航到市場分析
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('投資')).tap();
    });

    it('should search for card prices', async () => {
      // 點擊搜索按鈕
      await element(by.id('market-search-button')).tap();

      // 搜索卡片
      await element(by.id('search-input')).typeText('青眼白龍');
      await element(by.text('搜索')).tap();

      // 檢查搜索結果
      await expect(element(by.text('青眼白龍'))).toBeVisible();
      await expect(element(by.text('當前價格'))).toBeVisible();
      await expect(element(by.text('24小時變化'))).toBeVisible();
    });

    it('should view card price history', async () => {
      // 搜索卡片
      await element(by.id('market-search-button')).tap();
      await element(by.id('search-input')).typeText('青眼白龍');
      await element(by.text('搜索')).tap();

      // 點擊卡片查看詳情
      await element(by.text('青眼白龍')).tap();

      // 檢查價格歷史
      await expect(element(by.text('價格歷史'))).toBeVisible();
      await expect(element(by.id('price-chart'))).toBeVisible();
      await expect(element(by.text('7天'))).toBeVisible();
      await expect(element(by.text('30天'))).toBeVisible();
      await expect(element(by.text('1年'))).toBeVisible();
    });

    it('should set price alerts', async () => {
      // 搜索卡片
      await element(by.id('market-search-button')).tap();
      await element(by.id('search-input')).typeText('青眼白龍');
      await element(by.text('搜索')).tap();
      await element(by.text('青眼白龍')).tap();

      // 設置價格提醒
      await element(by.text('設置提醒')).tap();

      // 配置提醒條件
      await element(by.id('alert-price-input')).typeText('1500');
      await element(by.id('alert-condition-select')).tap();
      await element(by.text('價格上漲到')).tap();

      // 保存提醒
      await element(by.text('保存提醒')).tap();

      // 檢查提醒設置成功
      await expect(element(by.text('價格提醒已設置'))).toBeVisible();
    });

    it('should view price alerts list', async () => {
      // 點擊提醒標籤
      await element(by.text('提醒')).tap();

      // 檢查提醒列表
      await expect(element(by.text('我的提醒'))).toBeVisible();
      await expect(element(by.text('添加新提醒'))).toBeVisible();
    });
  });

  describe('Trend Analysis', () => {
    beforeEach(async () => {
      // 登錄並導航到市場分析
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('投資')).tap();
    });

    it('should display trending cards', async () => {
      // 點擊熱門標籤
      await element(by.text('熱門')).tap();

      // 檢查熱門卡片
      await expect(element(by.text('熱門卡片'))).toBeVisible();
      await expect(element(by.text('漲幅榜'))).toBeVisible();
      await expect(element(by.text('跌幅榜'))).toBeVisible();
      await expect(element(by.text('交易量榜'))).toBeVisible();
    });

    it('should show trend analysis', async () => {
      // 點擊趨勢標籤
      await element(by.text('趨勢')).tap();

      // 檢查趨勢分析
      await expect(element(by.text('趨勢分析'))).toBeVisible();
      await expect(element(by.text('上升趨勢'))).toBeVisible();
      await expect(element(by.text('下降趨勢'))).toBeVisible();
      await expect(element(by.text('橫盤整理'))).toBeVisible();
    });

    it('should filter trends by time period', async () => {
      // 導航到趨勢分析
      await element(by.text('趨勢')).tap();

      // 選擇時間週期
      await element(by.text('時間週期')).tap();
      await element(by.text('7天')).tap();

      // 檢查過濾結果
      await expect(element(by.id('trend-chart'))).toBeVisible();
      await expect(element(by.text('7天趨勢'))).toBeVisible();
    });

    it('should show market sentiment', async () => {
      // 導航到趨勢分析
      await element(by.text('趨勢')).tap();

      // 點擊市場情緒
      await element(by.text('市場情緒')).tap();

      // 檢查市場情緒分析
      await expect(element(by.text('市場情緒'))).toBeVisible();
      await expect(element(by.text('樂觀'))).toBeVisible();
      await expect(element(by.text('中性'))).toBeVisible();
      await expect(element(by.text('悲觀'))).toBeVisible();
    });
  });

  describe('Market Research', () => {
    beforeEach(async () => {
      // 登錄並導航到市場分析
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('投資')).tap();
    });

    it('should access market research tools', async () => {
      // 點擊研究標籤
      await element(by.text('研究')).tap();

      // 檢查研究工具
      await expect(element(by.text('市場研究'))).toBeVisible();
      await expect(element(by.text('技術分析'))).toBeVisible();
      await expect(element(by.text('基本面分析'))).toBeVisible();
      await expect(element(by.text('新聞分析'))).toBeVisible();
    });

    it('should perform technical analysis', async () => {
      // 導航到研究工具
      await element(by.text('研究')).tap();
      await element(by.text('技術分析')).tap();

      // 選擇分析工具
      await expect(element(by.text('技術分析工具'))).toBeVisible();
      await element(by.text('移動平均線')).tap();

      // 配置分析參數
      await element(by.id('ma-period-input')).typeText('20');
      await element(by.text('應用')).tap();

      // 檢查分析結果
      await expect(element(by.id('technical-chart'))).toBeVisible();
      await expect(element(by.text('買入信號'))).toBeVisible();
      await expect(element(by.text('賣出信號'))).toBeVisible();
    });

    it('should view fundamental analysis', async () => {
      // 導航到研究工具
      await element(by.text('研究')).tap();
      await element(by.text('基本面分析')).tap();

      // 檢查基本面分析
      await expect(element(by.text('基本面分析'))).toBeVisible();
      await expect(element(by.text('稀有度'))).toBeVisible();
      await expect(element(by.text('發行量'))).toBeVisible();
      await expect(element(by.text('收藏價值'))).toBeVisible();
    });

    it('should read market news', async () => {
      // 導航到研究工具
      await element(by.text('研究')).tap();
      await element(by.text('新聞分析')).tap();

      // 檢查新聞列表
      await expect(element(by.text('市場新聞'))).toBeVisible();
      await expect(element(by.text('最新消息'))).toBeVisible();
      await expect(element(by.text('熱門話題'))).toBeVisible();
    });
  });

  describe('Market Comparison', () => {
    beforeEach(async () => {
      // 登錄並導航到市場分析
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('投資')).tap();
    });

    it('should compare multiple cards', async () => {
      // 點擊比較標籤
      await element(by.text('比較')).tap();

      // 添加卡片到比較
      await element(by.text('添加卡片')).tap();
      await element(by.id('search-input')).typeText('青眼白龍');
      await element(by.text('添加')).tap();

      await element(by.text('添加卡片')).tap();
      await element(by.id('search-input')).typeText('黑魔導');
      await element(by.text('添加')).tap();

      // 開始比較
      await element(by.text('開始比較')).tap();

      // 檢查比較結果
      await expect(element(by.text('卡片比較'))).toBeVisible();
      await expect(element(by.text('青眼白龍'))).toBeVisible();
      await expect(element(by.text('黑魔導'))).toBeVisible();
      await expect(element(by.id('comparison-chart'))).toBeVisible();
    });

    it('should compare market sectors', async () => {
      // 點擊比較標籤
      await element(by.text('比較')).tap();

      // 選擇市場板塊比較
      await element(by.text('板塊比較')).tap();

      // 選擇板塊
      await element(by.text('遊戲王')).tap();
      await element(by.text('寶可夢')).tap();

      // 查看比較結果
      await expect(element(by.text('板塊比較'))).toBeVisible();
      await expect(element(by.text('遊戲王'))).toBeVisible();
      await expect(element(by.text('寶可夢'))).toBeVisible();
    });
  });

  describe('Market Alerts and Notifications', () => {
    beforeEach(async () => {
      // 登錄並導航到市場分析
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('投資')).tap();
    });

    it('should manage market alerts', async () => {
      // 點擊提醒標籤
      await element(by.text('提醒')).tap();

      // 創建新提醒
      await element(by.text('添加新提醒')).tap();

      // 配置提醒
      await element(by.id('alert-name-input')).typeText('市場波動提醒');
      await element(by.id('alert-condition-select')).tap();
      await element(by.text('市場指數變化超過')).tap();
      await element(by.id('alert-threshold-input')).typeText('5');

      // 保存提醒
      await element(by.text('保存')).tap();

      // 檢查提醒創建成功
      await expect(element(by.text('提醒創建成功'))).toBeVisible();
    });

    it('should view alert history', async () => {
      // 點擊提醒標籤
      await element(by.text('提醒')).tap();

      // 查看歷史記錄
      await element(by.text('歷史記錄')).tap();

      // 檢查歷史記錄
      await expect(element(by.text('提醒歷史'))).toBeVisible();
      await expect(element(by.text('已觸發'))).toBeVisible();
      await expect(element(by.text('未觸發'))).toBeVisible();
    });

    it('should configure notification settings', async () => {
      // 點擊提醒標籤
      await element(by.text('提醒')).tap();

      // 點擊設置
      await element(by.id('alert-settings-button')).tap();

      // 配置通知設置
      await element(by.id('email-notifications-toggle')).tap();
      await element(by.id('push-notifications-toggle')).tap();
      await element(by.id('sound-notifications-toggle')).tap();

      // 保存設置
      await element(by.text('保存設置')).tap();

      // 檢查設置保存成功
      await expect(element(by.text('設置已保存'))).toBeVisible();
    });
  });
});

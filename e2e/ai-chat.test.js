const { by, device, element, expect } = require('detox');

describe('AI Chat Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  describe('AI Chat Navigation', () => {
    beforeEach(async () => {
      // 先登錄
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await expect(element(by.text('首頁'))).toBeVisible();
    });

    it('should navigate to AI chat screen', async () => {
      // 點擊AI聊天按鈕
      await element(by.text('AI助手')).tap();

      // 檢查AI聊天界面
      await expect(element(by.text('AI助手'))).toBeVisible();
      await expect(element(by.text('智能卡牌分析'))).toBeVisible();
      await expect(element(by.id('chat-input'))).toBeVisible();
      await expect(element(by.text('發送'))).toBeVisible();
    });

    it('should display welcome message', async () => {
      // 導航到AI聊天
      await element(by.text('AI助手')).tap();

      // 檢查歡迎消息
      await expect(element(by.text('歡迎使用卡策AI助手'))).toBeVisible();
      await expect(element(by.text('我可以幫助您分析卡片、提供投資建議、回答問題等'))).toBeVisible();
    });

    it('should show quick action buttons', async () => {
      // 導航到AI聊天
      await element(by.text('AI助手')).tap();

      // 檢查快速操作按鈕
      await expect(element(by.text('卡片分析'))).toBeVisible();
      await expect(element(by.text('投資建議'))).toBeVisible();
      await expect(element(by.text('市場趨勢'))).toBeVisible();
      await expect(element(by.text('價格預測'))).toBeVisible();
    });
  });

  describe('Basic Chat Functionality', () => {
    beforeEach(async () => {
      // 登錄並導航到AI聊天
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('AI助手')).tap();
    });

    it('should send and receive messages', async () => {
      // 發送消息
      await element(by.id('chat-input')).typeText('你好');
      await element(by.text('發送')).tap();

      // 檢查消息是否發送
      await expect(element(by.text('你好'))).toBeVisible();

      // 等待AI回應
      await expect(element(by.text('您好！我是卡策AI助手'))).toBeVisible();
    });

    it('should handle empty message', async () => {
      // 嘗試發送空消息
      await element(by.text('發送')).tap();

      // 檢查是否顯示錯誤提示
      await expect(element(by.text('請輸入消息'))).toBeVisible();
    });

    it('should show typing indicator', async () => {
      // 發送消息
      await element(by.id('chat-input')).typeText('分析青眼白龍');
      await element(by.text('發送')).tap();

      // 檢查輸入指示器
      await expect(element(by.text('AI正在思考...'))).toBeVisible();
    });

    it('should scroll chat history', async () => {
      // 發送多條消息
      for (let i = 0; i < 5; i++) {
        await element(by.id('chat-input')).typeText(`消息${i + 1}`);
        await element(by.text('發送')).tap();
        await element(by.id('chat-input')).clearText();
      }

      // 檢查聊天歷史可以滾動
      await element(by.id('chat-scroll-view')).scrollTo('top');
      await expect(element(by.text('消息1'))).toBeVisible();
    });
  });

  describe('Card Analysis Features', () => {
    beforeEach(async () => {
      // 登錄並導航到AI聊天
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('AI助手')).tap();
    });

    it('should analyze card using quick action', async () => {
      // 點擊卡片分析快速操作
      await element(by.text('卡片分析')).tap();

      // 檢查分析界面
      await expect(element(by.text('卡片分析'))).toBeVisible();
      await expect(element(by.text('請輸入卡片名稱或上傳圖片'))).toBeVisible();
      await expect(element(by.text('拍照'))).toBeVisible();
      await expect(element(by.text('從相冊選擇'))).toBeVisible();
    });

    it('should analyze card by name', async () => {
      // 發送卡片分析請求
      await element(by.id('chat-input')).typeText('分析青眼白龍的投資價值');
      await element(by.text('發送')).tap();

      // 檢查AI回應
      await expect(element(by.text('青眼白龍分析結果'))).toBeVisible();
      await expect(element(by.text('稀有度'))).toBeVisible();
      await expect(element(by.text('市場價格'))).toBeVisible();
      await expect(element(by.text('投資建議'))).toBeVisible();
    });

    it('should analyze card condition', async () => {
      // 發送條件分析請求
      await element(by.id('chat-input')).typeText('這張青眼白龍的品相如何？');
      await element(by.text('發送')).tap();

      // 檢查條件分析結果
      await expect(element(by.text('品相分析'))).toBeVisible();
      await expect(element(by.text('磨損程度'))).toBeVisible();
      await expect(element(by.text('建議評級'))).toBeVisible();
    });

    it('should provide card pricing information', async () => {
      // 發送價格查詢
      await element(by.id('chat-input')).typeText('青眼白龍現在多少錢？');
      await element(by.text('發送')).tap();

      // 檢查價格信息
      await expect(element(by.text('價格信息'))).toBeVisible();
      await expect(element(by.text('當前價格'))).toBeVisible();
      await expect(element(by.text('歷史價格'))).toBeVisible();
      await expect(element(by.text('價格趨勢'))).toBeVisible();
    });
  });

  describe('Investment Advice', () => {
    beforeEach(async () => {
      // 登錄並導航到AI聊天
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('AI助手')).tap();
    });

    it('should provide investment advice', async () => {
      // 點擊投資建議快速操作
      await element(by.text('投資建議')).tap();

      // 檢查投資建議界面
      await expect(element(by.text('投資建議'))).toBeVisible();
      await expect(element(by.text('請描述您的投資目標和風險偏好'))).toBeVisible();
    });

    it('should analyze portfolio', async () => {
      // 發送投資組合分析請求
      await element(by.id('chat-input')).typeText('分析我的投資組合');
      await element(by.text('發送')).tap();

      // 檢查投資組合分析
      await expect(element(by.text('投資組合分析'))).toBeVisible();
      await expect(element(by.text('資產分配'))).toBeVisible();
      await expect(element(by.text('風險評估'))).toBeVisible();
      await expect(element(by.text('優化建議'))).toBeVisible();
    });

    it('should provide market timing advice', async () => {
      // 發送時機建議請求
      await element(by.id('chat-input')).typeText('現在是買入青眼白龍的好時機嗎？');
      await element(by.text('發送')).tap();

      // 檢查時機建議
      await expect(element(by.text('時機分析'))).toBeVisible();
      await expect(element(by.text('市場趨勢'))).toBeVisible();
      await expect(element(by.text('建議操作'))).toBeVisible();
    });

    it('should suggest diversification', async () => {
      // 發送多元化建議請求
      await element(by.id('chat-input')).typeText('如何分散投資風險？');
      await element(by.text('發送')).tap();

      // 檢查多元化建議
      await expect(element(by.text('風險分散建議'))).toBeVisible();
      await expect(element(by.text('推薦卡片'))).toBeVisible();
      await expect(element(by.text('投資比例'))).toBeVisible();
    });
  });

  describe('Market Trend Analysis', () => {
    beforeEach(async () => {
      // 登錄並導航到AI聊天
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('AI助手')).tap();
    });

    it('should analyze market trends', async () => {
      // 點擊市場趨勢快速操作
      await element(by.text('市場趨勢')).tap();

      // 檢查市場趨勢分析
      await expect(element(by.text('市場趨勢分析'))).toBeVisible();
      await expect(element(by.text('熱門板塊'))).toBeVisible();
      await expect(element(by.text('價格趨勢'))).toBeVisible();
    });

    it('should predict price movements', async () => {
      // 發送價格預測請求
      await element(by.id('chat-input')).typeText('預測青眼白龍未來價格走勢');
      await element(by.text('發送')).tap();

      // 檢查價格預測
      await expect(element(by.text('價格預測'))).toBeVisible();
      await expect(element(by.text('短期預測'))).toBeVisible();
      await expect(element(by.text('長期預測'))).toBeVisible();
      await expect(element(by.text('風險因素'))).toBeVisible();
    });

    it('should identify market opportunities', async () => {
      // 發送機會識別請求
      await element(by.id('chat-input')).typeText('目前市場有什麼投資機會？');
      await element(by.text('發送')).tap();

      // 檢查機會分析
      await expect(element(by.text('市場機會'))).toBeVisible();
      await expect(element(by.text('低估卡片'))).toBeVisible();
      await expect(element(by.text('新興趨勢'))).toBeVisible();
    });
  });

  describe('AI Chat Settings', () => {
    beforeEach(async () => {
      // 登錄並導航到AI聊天
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('AI助手')).tap();
    });

    it('should access chat settings', async () => {
      // 點擊設置按鈕
      await element(by.id('chat-settings-button')).tap();

      // 檢查設置界面
      await expect(element(by.text('聊天設置'))).toBeVisible();
      await expect(element(by.text('AI模型'))).toBeVisible();
      await expect(element(by.text('回應長度'))).toBeVisible();
      await expect(element(by.text('語言'))).toBeVisible();
    });

    it('should change AI model', async () => {
      // 導航到設置
      await element(by.id('chat-settings-button')).tap();
      await element(by.text('AI模型')).tap();

      // 選擇不同的AI模型
      await element(by.text('GPT-4')).tap();

      // 保存設置
      await element(by.text('保存')).tap();

      // 檢查設置保存成功
      await expect(element(by.text('設置已保存'))).toBeVisible();
    });

    it('should adjust response length', async () => {
      // 導航到設置
      await element(by.id('chat-settings-button')).tap();
      await element(by.text('回應長度')).tap();

      // 調整回應長度
      await element(by.text('詳細')).tap();

      // 保存設置
      await element(by.text('保存')).tap();

      // 檢查設置保存成功
      await expect(element(by.text('設置已保存'))).toBeVisible();
    });

    it('should change language', async () => {
      // 導航到設置
      await element(by.id('chat-settings-button')).tap();
      await element(by.text('語言')).tap();

      // 選擇語言
      await element(by.text('English')).tap();

      // 保存設置
      await element(by.text('保存')).tap();

      // 檢查設置保存成功
      await expect(element(by.text('Settings saved'))).toBeVisible();
    });
  });

  describe('Chat History and Export', () => {
    beforeEach(async () => {
      // 登錄並導航到AI聊天
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('AI助手')).tap();
    });

    it('should view chat history', async () => {
      // 點擊歷史記錄按鈕
      await element(by.id('chat-history-button')).tap();

      // 檢查歷史記錄界面
      await expect(element(by.text('聊天歷史'))).toBeVisible();
      await expect(element(by.text('今天的對話'))).toBeVisible();
      await expect(element(by.text('更早的對話'))).toBeVisible();
    });

    it('should search chat history', async () => {
      // 導航到歷史記錄
      await element(by.id('chat-history-button')).tap();

      // 搜索歷史記錄
      await element(by.id('history-search-input')).typeText('青眼白龍');
      await element(by.text('搜索')).tap();

      // 檢查搜索結果
      await expect(element(by.text('搜索結果'))).toBeVisible();
      await expect(element(by.text('青眼白龍'))).toBeVisible();
    });

    it('should export chat conversation', async () => {
      // 導航到歷史記錄
      await element(by.id('chat-history-button')).tap();

      // 選擇對話
      await element(by.text('今天的對話')).tap();

      // 點擊導出
      await element(by.text('導出')).tap();

      // 選擇導出格式
      await expect(element(by.text('選擇導出格式'))).toBeVisible();
      await element(by.text('PDF')).tap();

      // 開始導出
      await element(by.text('導出')).tap();

      // 檢查導出成功
      await expect(element(by.text('對話已導出'))).toBeVisible();
    });

    it('should clear chat history', async () => {
      // 導航到歷史記錄
      await element(by.id('chat-history-button')).tap();

      // 點擊清除歷史
      await element(by.text('清除歷史')).tap();

      // 確認清除
      await expect(element(by.text('確認清除'))).toBeVisible();
      await element(by.text('確認')).tap();

      // 檢查清除成功
      await expect(element(by.text('歷史記錄已清除'))).toBeVisible();
    });
  });

  describe('Error Handling and Offline Mode', () => {
    beforeEach(async () => {
      // 登錄並導航到AI聊天
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('AI助手')).tap();
    });

    it('should handle network errors gracefully', async () => {
      // 模擬網絡錯誤
      await element(by.id('chat-input')).typeText('測試網絡錯誤');
      await element(by.text('發送')).tap();

      // 檢查錯誤處理
      await expect(element(by.text('網絡連接錯誤'))).toBeVisible();
      await expect(element(by.text('請檢查網絡連接'))).toBeVisible();
      await expect(element(by.text('重試'))).toBeVisible();
    });

    it('should provide offline responses', async () => {
      // 發送離線模式請求
      await element(by.id('chat-input')).typeText('離線模式');
      await element(by.text('發送')).tap();

      // 檢查離線回應
      await expect(element(by.text('離線模式已啟用'))).toBeVisible();
      await expect(element(by.text('部分功能可能受限'))).toBeVisible();
    });

    it('should retry failed requests', async () => {
      // 發送可能失敗的請求
      await element(by.id('chat-input')).typeText('複雜分析請求');
      await element(by.text('發送')).tap();

      // 如果失敗，點擊重試
      if (await element(by.text('重試')).isVisible()) {
        await element(by.text('重試')).tap();
        await expect(element(by.text('正在重試...'))).toBeVisible();
      }
    });
  });
});

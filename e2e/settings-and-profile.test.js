/* eslint-env jest, detox */

const { by, device, element } = require('detox');

describe('Settings and Profile Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  describe('Settings Navigation', () => {
    beforeEach(async () => {
      // 先登錄
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await expect(element(by.text('首頁'))).toBeVisible();
    });

    it('should navigate to settings screen', async () => {
      // 點擊設置標籤
      await element(by.text('設置')).tap();

      // 檢查設置界面
      await expect(element(by.text('設置'))).toBeVisible();
      await expect(element(by.text('個人資料'))).toBeVisible();
      await expect(element(by.text('應用設置'))).toBeVisible();
      await expect(element(by.text('隱私設置'))).toBeVisible();
      await expect(element(by.text('通知設置'))).toBeVisible();
      await expect(element(by.text('安全設置'))).toBeVisible();
    });

    it('should display user profile summary', async () => {
      // 導航到設置
      await element(by.text('設置')).tap();

      // 檢查用戶資料摘要
      await expect(element(by.id('user-avatar'))).toBeVisible();
      await expect(element(by.text('test@example.com'))).toBeVisible();
      await expect(element(by.text('會員等級'))).toBeVisible();
    });
  });

  describe('Profile Management', () => {
    beforeEach(async () => {
      // 登錄並導航到設置
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('設置')).tap();
    });

    it('should access profile settings', async () => {
      // 點擊個人資料
      await element(by.text('個人資料')).tap();

      // 檢查個人資料界面
      await expect(element(by.text('個人資料'))).toBeVisible();
      await expect(element(by.text('基本信息'))).toBeVisible();
      await expect(element(by.text('頭像'))).toBeVisible();
      await expect(element(by.text('用戶名'))).toBeVisible();
      await expect(element(by.text('電子郵件'))).toBeVisible();
    });

    it('should edit user profile', async () => {
      // 導航到個人資料
      await element(by.text('個人資料')).tap();

      // 編輯用戶名
      await element(by.id('username-input')).clearText();
      await element(by.id('username-input')).typeText('新用戶名');

      // 編輯個人簡介
      await element(by.id('bio-input')).clearText();
      await element(by.id('bio-input')).typeText('卡牌收藏愛好者');

      // 保存修改
      await element(by.text('保存')).tap();

      // 檢查保存成功
      await expect(element(by.text('個人資料已更新'))).toBeVisible();
    });

    it('should change profile avatar', async () => {
      // 導航到個人資料
      await element(by.text('個人資料')).tap();

      // 點擊頭像
      await element(by.id('avatar-button')).tap();

      // 選擇頭像來源
      await expect(element(by.text('選擇頭像'))).toBeVisible();
      await element(by.text('拍照')).tap();

      // 檢查相機權限請求
      await expect(element(by.text('需要相機權限'))).toBeVisible();
      await element(by.text('允許')).tap();

      // 拍照並確認
      await element(by.id('capture-button')).tap();
      await element(by.text('使用照片')).tap();

      // 檢查頭像更新
      await expect(element(by.text('頭像已更新'))).toBeVisible();
    });

    it('should view profile statistics', async () => {
      // 導航到個人資料
      await element(by.text('個人資料')).tap();

      // 點擊統計標籤
      await element(by.text('統計')).tap();

      // 檢查統計信息
      await expect(element(by.text('收藏統計'))).toBeVisible();
      await expect(element(by.text('投資統計'))).toBeVisible();
      await expect(element(by.text('掃描統計'))).toBeVisible();
      await expect(element(by.text('活躍度'))).toBeVisible();
    });
  });

  describe('Application Settings', () => {
    beforeEach(async () => {
      // 登錄並導航到設置
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('設置')).tap();
    });

    it('should access app settings', async () => {
      // 點擊應用設置
      await element(by.text('應用設置')).tap();

      // 檢查應用設置界面
      await expect(element(by.text('應用設置'))).toBeVisible();
      await expect(element(by.text('主題'))).toBeVisible();
      await expect(element(by.text('語言'))).toBeVisible();
      await expect(element(by.text('字體大小'))).toBeVisible();
      await expect(element(by.text('動畫效果'))).toBeVisible();
    });

    it('should change app theme', async () => {
      // 導航到應用設置
      await element(by.text('應用設置')).tap();

      // 點擊主題設置
      await element(by.text('主題')).tap();

      // 選擇深色主題
      await element(by.text('深色主題')).tap();

      // 檢查主題切換
      await expect(element(by.text('主題已切換'))).toBeVisible();
    });

    it('should change app language', async () => {
      // 導航到應用設置
      await element(by.text('應用設置')).tap();

      // 點擊語言設置
      await element(by.text('語言')).tap();

      // 選擇英語
      await element(by.text('English')).tap();

      // 確認語言切換
      await element(by.text('確認')).tap();

      // 檢查語言切換
      await expect(element(by.text('Language changed'))).toBeVisible();
    });

    it('should adjust font size', async () => {
      // 導航到應用設置
      await element(by.text('應用設置')).tap();

      // 點擊字體大小設置
      await element(by.text('字體大小')).tap();

      // 選擇大字體
      await element(by.text('大')).tap();

      // 檢查字體大小調整
      await expect(element(by.text('字體大小已調整'))).toBeVisible();
    });

    it('should toggle animations', async () => {
      // 導航到應用設置
      await element(by.text('應用設置')).tap();

      // 點擊動畫效果設置
      await element(by.text('動畫效果')).tap();

      // 關閉動畫
      await element(by.id('animations-toggle')).tap();

      // 檢查動畫設置
      await expect(element(by.text('動畫設置已更新'))).toBeVisible();
    });
  });

  describe('Notification Settings', () => {
    beforeEach(async () => {
      // 登錄並導航到設置
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('設置')).tap();
    });

    it('should access notification settings', async () => {
      // 點擊通知設置
      await element(by.text('通知設置')).tap();

      // 檢查通知設置界面
      await expect(element(by.text('通知設置'))).toBeVisible();
      await expect(element(by.text('推送通知'))).toBeVisible();
      await expect(element(by.text('電子郵件通知'))).toBeVisible();
      await expect(element(by.text('價格提醒'))).toBeVisible();
      await expect(element(by.text('市場更新'))).toBeVisible();
    });

    it('should configure push notifications', async () => {
      // 導航到通知設置
      await element(by.text('通知設置')).tap();

      // 配置推送通知
      await element(by.id('push-notifications-toggle')).tap();
      await element(by.id('price-alerts-toggle')).tap();
      await element(by.id('market-updates-toggle')).tap();

      // 保存設置
      await element(by.text('保存')).tap();

      // 檢查設置保存成功
      await expect(element(by.text('通知設置已保存'))).toBeVisible();
    });

    it('should configure email notifications', async () => {
      // 導航到通知設置
      await element(by.text('通知設置')).tap();

      // 配置電子郵件通知
      await element(by.id('email-notifications-toggle')).tap();
      await element(by.id('weekly-summary-toggle')).tap();
      await element(by.id('portfolio-updates-toggle')).tap();

      // 保存設置
      await element(by.text('保存')).tap();

      // 檢查設置保存成功
      await expect(element(by.text('通知設置已保存'))).toBeVisible();
    });

    it('should set notification schedule', async () => {
      // 導航到通知設置
      await element(by.text('通知設置')).tap();

      // 點擊通知時間設置
      await element(by.text('通知時間')).tap();

      // 設置通知時間
      await element(by.id('start-time-picker')).tap();
      await element(by.text('09:00')).tap();

      await element(by.id('end-time-picker')).tap();
      await element(by.text('21:00')).tap();

      // 保存時間設置
      await element(by.text('保存')).tap();

      // 檢查時間設置保存成功
      await expect(element(by.text('通知時間已設置'))).toBeVisible();
    });
  });

  describe('Security Settings', () => {
    beforeEach(async () => {
      // 登錄並導航到設置
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('設置')).tap();
    });

    it('should access security settings', async () => {
      // 點擊安全設置
      await element(by.text('安全設置')).tap();

      // 檢查安全設置界面
      await expect(element(by.text('安全設置'))).toBeVisible();
      await expect(element(by.text('修改密碼'))).toBeVisible();
      await expect(element(by.text('生物識別'))).toBeVisible();
      await expect(element(by.text('兩步驗證'))).toBeVisible();
      await expect(element(by.text('登錄設備'))).toBeVisible();
    });

    it('should change password', async () => {
      // 導航到安全設置
      await element(by.text('安全設置')).tap();

      // 點擊修改密碼
      await element(by.text('修改密碼')).tap();

      // 輸入當前密碼
      await element(by.id('current-password-input')).typeText('Password123!');

      // 輸入新密碼
      await element(by.id('new-password-input')).typeText('NewPassword123!');
      await element(by.id('confirm-password-input')).typeText(
        'NewPassword123!'
      );

      // 保存新密碼
      await element(by.text('保存')).tap();

      // 檢查密碼修改成功
      await expect(element(by.text('密碼已成功修改'))).toBeVisible();
    });

    it('should enable biometric authentication', async () => {
      // 導航到安全設置
      await element(by.text('安全設置')).tap();

      // 點擊生物識別
      await element(by.text('生物識別')).tap();

      // 啟用指紋識別
      await element(by.id('fingerprint-toggle')).tap();

      // 檢查生物識別設置
      await expect(element(by.text('生物識別已啟用'))).toBeVisible();
    });

    it('should enable two-factor authentication', async () => {
      // 導航到安全設置
      await element(by.text('安全設置')).tap();

      // 點擊兩步驗證
      await element(by.text('兩步驗證')).tap();

      // 啟用兩步驗證
      await element(by.id('2fa-toggle')).tap();

      // 設置驗證方式
      await element(by.text('短信驗證')).tap();

      // 輸入手機號碼
      await element(by.id('phone-input')).typeText('13800138000');

      // 發送驗證碼
      await element(by.text('發送驗證碼')).tap();

      // 輸入驗證碼
      await element(by.id('verification-code-input')).typeText('123456');

      // 確認設置
      await element(by.text('確認')).tap();

      // 檢查兩步驗證設置成功
      await expect(element(by.text('兩步驗證已啟用'))).toBeVisible();
    });

    it('should manage login devices', async () => {
      // 導航到安全設置
      await element(by.text('安全設置')).tap();

      // 點擊登錄設備
      await element(by.text('登錄設備')).tap();

      // 檢查設備列表
      await expect(element(by.text('登錄設備'))).toBeVisible();
      await expect(element(by.text('當前設備'))).toBeVisible();
      await expect(element(by.text('其他設備'))).toBeVisible();

      // 登出其他設備
      await element(by.text('登出所有其他設備')).tap();

      // 確認登出
      await element(by.text('確認')).tap();

      // 檢查登出成功
      await expect(element(by.text('其他設備已登出'))).toBeVisible();
    });
  });

  describe('Data Management', () => {
    beforeEach(async () => {
      // 登錄並導航到設置
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('設置')).tap();
    });

    it('should access data management', async () => {
      // 點擊數據管理
      await element(by.text('數據管理')).tap();

      // 檢查數據管理界面
      await expect(element(by.text('數據管理'))).toBeVisible();
      await expect(element(by.text('數據導出'))).toBeVisible();
      await expect(element(by.text('數據備份'))).toBeVisible();
      await expect(element(by.text('數據恢復'))).toBeVisible();
      await expect(element(by.text('清除數據'))).toBeVisible();
    });

    it('should export user data', async () => {
      // 導航到數據管理
      await element(by.text('數據管理')).tap();

      // 點擊數據導出
      await element(by.text('數據導出')).tap();

      // 選擇導出內容
      await element(by.id('export-profile-toggle')).tap();
      await element(by.id('export-portfolio-toggle')).tap();
      await element(by.id('export-history-toggle')).tap();

      // 選擇導出格式
      await element(by.text('JSON')).tap();

      // 開始導出
      await element(by.text('開始導出')).tap();

      // 檢查導出成功
      await expect(element(by.text('數據導出成功'))).toBeVisible();
    });

    it('should backup data', async () => {
      // 導航到數據管理
      await element(by.text('數據管理')).tap();

      // 點擊數據備份
      await element(by.text('數據備份')).tap();

      // 選擇備份位置
      await element(by.text('雲端備份')).tap();

      // 開始備份
      await element(by.text('開始備份')).tap();

      // 檢查備份成功
      await expect(element(by.text('數據備份成功'))).toBeVisible();
    });

    it('should restore data', async () => {
      // 導航到數據管理
      await element(by.text('數據管理')).tap();

      // 點擊數據恢復
      await element(by.text('數據恢復')).tap();

      // 選擇恢復點
      await element(by.text('最近的備份')).tap();

      // 確認恢復
      await element(by.text('確認恢復')).tap();

      // 檢查恢復成功
      await expect(element(by.text('數據恢復成功'))).toBeVisible();
    });

    it('should clear app data', async () => {
      // 導航到數據管理
      await element(by.text('數據管理')).tap();

      // 點擊清除數據
      await element(by.text('清除數據')).tap();

      // 選擇清除內容
      await element(by.id('clear-cache-toggle')).tap();
      await element(by.id('clear-history-toggle')).tap();

      // 確認清除
      await element(by.text('確認清除')).tap();

      // 檢查清除成功
      await expect(element(by.text('數據清除成功'))).toBeVisible();
    });
  });

  describe('Account Management', () => {
    beforeEach(async () => {
      // 登錄並導航到設置
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('設置')).tap();
    });

    it('should access account settings', async () => {
      // 點擊帳戶設置
      await element(by.text('帳戶設置')).tap();

      // 檢查帳戶設置界面
      await expect(element(by.text('帳戶設置'))).toBeVisible();
      await expect(element(by.text('會員等級'))).toBeVisible();
      await expect(element(by.text('訂閱管理'))).toBeVisible();
      await expect(element(by.text('付款方式'))).toBeVisible();
      await expect(element(by.text('帳單歷史'))).toBeVisible();
    });

    it('should view membership details', async () => {
      // 導航到帳戶設置
      await element(by.text('帳戶設置')).tap();

      // 點擊會員等級
      await element(by.text('會員等級')).tap();

      // 檢查會員詳情
      await expect(element(by.text('當前等級'))).toBeVisible();
      await expect(element(by.text('權益詳情'))).toBeVisible();
      await expect(element(by.text('升級選項'))).toBeVisible();
    });

    it('should manage subscription', async () => {
      // 導航到帳戶設置
      await element(by.text('帳戶設置')).tap();

      // 點擊訂閱管理
      await element(by.text('訂閱管理')).tap();

      // 檢查訂閱詳情
      await expect(element(by.text('訂閱詳情'))).toBeVisible();
      await expect(element(by.text('續費'))).toBeVisible();
      await expect(element(by.text('取消訂閱'))).toBeVisible();
    });

    it('should logout user', async () => {
      // 滾動到底部
      await element(by.id('settings-scroll')).scrollTo('bottom');

      // 點擊登出
      await element(by.text('登出')).tap();

      // 確認登出
      await expect(element(by.text('確認登出'))).toBeVisible();
      await element(by.text('確認')).tap();

      // 檢查是否返回登錄界面
      await expect(element(by.text('登錄'))).toBeVisible();
    });

    it('should delete account', async () => {
      // 滾動到底部
      await element(by.id('settings-scroll')).scrollTo('bottom');

      // 點擊刪除帳戶
      await element(by.text('刪除帳戶')).tap();

      // 確認刪除
      await expect(element(by.text('確認刪除帳戶'))).toBeVisible();
      await element(by.text('確認')).tap();

      // 輸入密碼確認
      await element(by.id('confirm-password-input')).typeText('Password123!');

      // 最終確認
      await element(by.text('永久刪除')).tap();

      // 檢查帳戶刪除成功
      await expect(element(by.text('帳戶已刪除'))).toBeVisible();
    });
  });
});

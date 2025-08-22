/* eslint-env jest, detox */

const { by, device, element } = require('detox');

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  describe('Login Flow', () => {
    it('should display login screen with all required elements', async () => {
      // 檢查登錄屏幕是否正確顯示
      await expect(element(by.text('登錄'))).toBeVisible();
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('password-input'))).toBeVisible();
      await expect(element(by.id('login-button'))).toBeVisible();
      await expect(element(by.text('還沒有帳號？立即註冊'))).toBeVisible();
    });

    it('should show validation errors for empty fields', async () => {
      // 點擊登錄按鈕而不輸入任何內容
      await element(by.id('login-button')).tap();

      // 檢查是否顯示驗證錯誤
      await expect(element(by.text('請輸入電子郵件'))).toBeVisible();
      await expect(element(by.text('請輸入密碼'))).toBeVisible();
    });

    it('should show validation error for invalid email format', async () => {
      // 輸入無效的電子郵件格式
      await element(by.id('email-input')).typeText('invalid-email');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();

      // 檢查是否顯示電子郵件格式錯誤
      await expect(element(by.text('請輸入有效的電子郵件地址'))).toBeVisible();
    });

    it('should show validation error for short password', async () => {
      // 輸入短密碼
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('123');
      await element(by.id('login-button')).tap();

      // 檢查是否顯示密碼長度錯誤
      await expect(element(by.text('密碼至少需要8個字符'))).toBeVisible();
    });

    it('should successfully login with valid credentials', async () => {
      // 輸入有效的登錄憑據
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();

      // 等待登錄成功並檢查是否跳轉到主屏幕
      await expect(element(by.text('首頁'))).toBeVisible();
      await expect(element(by.text('掃描'))).toBeVisible();
      await expect(element(by.text('收藏'))).toBeVisible();
      await expect(element(by.text('投資'))).toBeVisible();
      await expect(element(by.text('設置'))).toBeVisible();
    });

    it('should show error message for invalid credentials', async () => {
      // 輸入無效的登錄憑據
      await element(by.id('email-input')).typeText('invalid@example.com');
      await element(by.id('password-input')).typeText('WrongPassword123!');
      await element(by.id('login-button')).tap();

      // 檢查是否顯示錯誤消息
      await expect(element(by.text('電子郵件或密碼錯誤'))).toBeVisible();
    });

    it('should navigate to forgot password screen', async () => {
      // 點擊忘記密碼鏈接
      await element(by.text('忘記密碼？')).tap();

      // 檢查是否跳轉到忘記密碼屏幕
      await expect(element(by.text('重置密碼'))).toBeVisible();
      await expect(element(by.id('reset-email-input'))).toBeVisible();
      await expect(element(by.id('reset-button'))).toBeVisible();
    });
  });

  describe('Registration Flow', () => {
    it('should navigate to registration screen', async () => {
      // 點擊註冊鏈接
      await element(by.text('還沒有帳號？立即註冊')).tap();

      // 檢查是否跳轉到註冊屏幕
      await expect(element(by.text('註冊'))).toBeVisible();
      await expect(element(by.id('username-input'))).toBeVisible();
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('password-input'))).toBeVisible();
      await expect(element(by.id('confirm-password-input'))).toBeVisible();
      await expect(element(by.id('register-button'))).toBeVisible();
    });

    it('should show validation errors for registration form', async () => {
      // 導航到註冊屏幕
      await element(by.text('還沒有帳號？立即註冊')).tap();

      // 點擊註冊按鈕而不輸入任何內容
      await element(by.id('register-button')).tap();

      // 檢查是否顯示驗證錯誤
      await expect(element(by.text('請輸入用戶名'))).toBeVisible();
      await expect(element(by.text('請輸入電子郵件'))).toBeVisible();
      await expect(element(by.text('請輸入密碼'))).toBeVisible();
      await expect(element(by.text('請確認密碼'))).toBeVisible();
    });

    it('should show validation error for username format', async () => {
      // 導航到註冊屏幕
      await element(by.text('還沒有帳號？立即註冊')).tap();

      // 輸入無效的用戶名格式
      await element(by.id('username-input')).typeText('user@name');
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('confirm-password-input')).typeText('Password123!');
      await element(by.id('register-button')).tap();

      // 檢查是否顯示用戶名格式錯誤
      await expect(
        element(by.text('用戶名只能包含字母、數字、下劃線和連字符'))
      ).toBeVisible();
    });

    it('should show validation error for password mismatch', async () => {
      // 導航到註冊屏幕
      await element(by.text('還沒有帳號？立即註冊')).tap();

      // 輸入不匹配的密碼
      await element(by.id('username-input')).typeText('testuser');
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('confirm-password-input')).typeText(
        'DifferentPassword123!'
      );
      await element(by.id('register-button')).tap();

      // 檢查是否顯示密碼不匹配錯誤
      await expect(element(by.text('密碼不匹配'))).toBeVisible();
    });

    it('should successfully register with valid information', async () => {
      // 導航到註冊屏幕
      await element(by.text('還沒有帳號？立即註冊')).tap();

      // 輸入有效的註冊信息
      await element(by.id('username-input')).typeText('testuser');
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('confirm-password-input')).typeText('Password123!');

      // 同意條款
      await element(by.id('terms-checkbox')).tap();

      // 點擊註冊按鈕
      await element(by.id('register-button')).tap();

      // 等待註冊成功並檢查是否跳轉到主屏幕
      await expect(element(by.text('註冊成功'))).toBeVisible();
      await expect(element(by.text('首頁'))).toBeVisible();
    });

    it('should show error for existing email', async () => {
      // 導航到註冊屏幕
      await element(by.text('還沒有帳號？立即註冊')).tap();

      // 輸入已存在的電子郵件
      await element(by.id('username-input')).typeText('existinguser');
      await element(by.id('email-input')).typeText('existing@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('confirm-password-input')).typeText('Password123!');
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();

      // 檢查是否顯示電子郵件已存在錯誤
      await expect(element(by.text('此電子郵件已被註冊'))).toBeVisible();
    });
  });

  describe('Password Reset Flow', () => {
    it('should navigate to password reset screen', async () => {
      // 點擊忘記密碼鏈接
      await element(by.text('忘記密碼？')).tap();

      // 檢查密碼重置屏幕元素
      await expect(element(by.text('重置密碼'))).toBeVisible();
      await expect(element(by.id('reset-email-input'))).toBeVisible();
      await expect(element(by.id('reset-button'))).toBeVisible();
      await expect(element(by.text('返回登錄'))).toBeVisible();
    });

    it('should show validation error for invalid email in reset', async () => {
      // 導航到密碼重置屏幕
      await element(by.text('忘記密碼？')).tap();

      // 輸入無效的電子郵件
      await element(by.id('reset-email-input')).typeText('invalid-email');
      await element(by.id('reset-button')).tap();

      // 檢查是否顯示電子郵件格式錯誤
      await expect(element(by.text('請輸入有效的電子郵件地址'))).toBeVisible();
    });

    it('should successfully send reset email', async () => {
      // 導航到密碼重置屏幕
      await element(by.text('忘記密碼？')).tap();

      // 輸入有效的電子郵件
      await element(by.id('reset-email-input')).typeText('test@example.com');
      await element(by.id('reset-button')).tap();

      // 檢查是否顯示成功消息
      await expect(element(by.text('重置密碼郵件已發送'))).toBeVisible();
    });

    it('should navigate back to login screen', async () => {
      // 導航到密碼重置屏幕
      await element(by.text('忘記密碼？')).tap();

      // 點擊返回登錄按鈕
      await element(by.text('返回登錄')).tap();

      // 檢查是否返回登錄屏幕
      await expect(element(by.text('登錄'))).toBeVisible();
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('password-input'))).toBeVisible();
    });
  });

  describe('Logout Flow', () => {
    beforeEach(async () => {
      // 先登錄
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await expect(element(by.text('首頁'))).toBeVisible();
    });

    it('should successfully logout', async () => {
      // 導航到設置屏幕
      await element(by.text('設置')).tap();

      // 滾動到登出按鈕
      await element(by.id('settings-scroll')).scrollTo('bottom');

      // 點擊登出按鈕
      await element(by.id('logout-button')).tap();

      // 確認登出
      await element(by.text('確認')).tap();

      // 檢查是否返回登錄屏幕
      await expect(element(by.text('登錄'))).toBeVisible();
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('password-input'))).toBeVisible();
    });

    it('should cancel logout when user cancels confirmation', async () => {
      // 導航到設置屏幕
      await element(by.text('設置')).tap();

      // 滾動到登出按鈕
      await element(by.id('settings-scroll')).scrollTo('bottom');

      // 點擊登出按鈕
      await element(by.id('logout-button')).tap();

      // 取消登出
      await element(by.text('取消')).tap();

      // 檢查是否仍在設置屏幕
      await expect(element(by.text('設置'))).toBeVisible();
      await expect(element(by.id('logout-button'))).toBeVisible();
    });
  });
});

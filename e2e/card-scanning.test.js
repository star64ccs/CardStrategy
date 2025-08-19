const { by, device, element, expect } = require('detox');

describe('Card Scanning Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  describe('Scanner Screen Navigation', () => {
    beforeEach(async () => {
      // 先登錄
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await expect(element(by.text('首頁'))).toBeVisible();
    });

    it('should navigate to scanner screen', async () => {
      // 點擊掃描標籤
      await element(by.text('掃描')).tap();

      // 檢查掃描屏幕元素
      await expect(element(by.text('卡片掃描'))).toBeVisible();
      await expect(element(by.id('camera-view'))).toBeVisible();
      await expect(element(by.id('capture-button'))).toBeVisible();
      await expect(element(by.id('gallery-button'))).toBeVisible();
      await expect(element(by.id('flash-toggle'))).toBeVisible();
      await expect(element(by.id('switch-camera'))).toBeVisible();
    });

    it('should display camera permissions dialog', async () => {
      // 點擊掃描標籤
      await element(by.text('掃描')).tap();

      // 檢查是否顯示相機權限請求
      await expect(element(by.text('需要相機權限'))).toBeVisible();
      await expect(element(by.text('允許'))).toBeVisible();
      await expect(element(by.text('拒絕'))).toBeVisible();
    });

    it('should handle camera permission denied', async () => {
      // 點擊掃描標籤
      await element(by.text('掃描')).tap();

      // 拒絕相機權限
      await element(by.text('拒絕')).tap();

      // 檢查是否顯示權限被拒絕的提示
      await expect(element(by.text('相機權限被拒絕'))).toBeVisible();
      await expect(element(by.text('請在設置中啟用相機權限'))).toBeVisible();
      await expect(element(by.text('打開設置'))).toBeVisible();
    });

    it('should handle camera permission granted', async () => {
      // 點擊掃描標籤
      await element(by.text('掃描')).tap();

      // 允許相機權限
      await element(by.text('允許')).tap();

      // 檢查相機是否正常啟動
      await expect(element(by.id('camera-view'))).toBeVisible();
      await expect(element(by.id('capture-button'))).toBeVisible();
    });
  });

  describe('Camera Controls', () => {
    beforeEach(async () => {
      // 登錄並導航到掃描屏幕
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('掃描')).tap();
      await element(by.text('允許')).tap(); // 允許相機權限
    });

    it('should toggle flash on/off', async () => {
      // 檢查閃光燈按鈕
      await expect(element(by.id('flash-toggle'))).toBeVisible();

      // 點擊閃光燈按鈕
      await element(by.id('flash-toggle')).tap();

      // 檢查閃光燈狀態是否改變
      await expect(element(by.id('flash-on-icon'))).toBeVisible();

      // 再次點擊關閉閃光燈
      await element(by.id('flash-toggle')).tap();
      await expect(element(by.id('flash-off-icon'))).toBeVisible();
    });

    it('should switch between front and back camera', async () => {
      // 檢查切換相機按鈕
      await expect(element(by.id('switch-camera'))).toBeVisible();

      // 點擊切換相機按鈕
      await element(by.id('switch-camera')).tap();

      // 檢查相機是否切換（可能需要檢查某些視覺指示器）
      await expect(element(by.id('camera-view'))).toBeVisible();
    });

    it('should capture photo', async () => {
      // 點擊拍照按鈕
      await element(by.id('capture-button')).tap();

      // 檢查是否顯示拍照結果
      await expect(element(by.text('掃描結果'))).toBeVisible();
      await expect(element(by.id('captured-image'))).toBeVisible();
      await expect(element(by.text('重新拍照'))).toBeVisible();
      await expect(element(by.text('確認使用'))).toBeVisible();
    });
  });

  describe('Gallery Selection', () => {
    beforeEach(async () => {
      // 登錄並導航到掃描屏幕
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('掃描')).tap();
      await element(by.text('允許')).tap(); // 允許相機權限
    });

    it('should open gallery picker', async () => {
      // 點擊相冊按鈕
      await element(by.id('gallery-button')).tap();

      // 檢查是否顯示相冊選擇器
      await expect(element(by.text('選擇圖片'))).toBeVisible();
      await expect(element(by.text('取消'))).toBeVisible();
    });

    it('should handle gallery permission denied', async () => {
      // 點擊相冊按鈕
      await element(by.id('gallery-button')).tap();

      // 拒絕相冊權限
      await element(by.text('拒絕')).tap();

      // 檢查是否顯示權限被拒絕的提示
      await expect(element(by.text('相冊權限被拒絕'))).toBeVisible();
      await expect(element(by.text('請在設置中啟用相冊權限'))).toBeVisible();
    });

    it('should select image from gallery', async () => {
      // 點擊相冊按鈕
      await element(by.id('gallery-button')).tap();

      // 選擇第一張圖片
      await element(by.id('gallery-item-0')).tap();

      // 檢查是否顯示選中的圖片
      await expect(element(by.text('掃描結果'))).toBeVisible();
      await expect(element(by.id('selected-image'))).toBeVisible();
    });
  });

  describe('Scan Results', () => {
    beforeEach(async () => {
      // 登錄並導航到掃描屏幕
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('掃描')).tap();
      await element(by.text('允許')).tap(); // 允許相機權限
    });

    it('should display scan results after capture', async () => {
      // 拍照
      await element(by.id('capture-button')).tap();

      // 檢查掃描結果屏幕
      await expect(element(by.text('掃描結果'))).toBeVisible();
      await expect(element(by.id('captured-image'))).toBeVisible();
      await expect(element(by.text('卡片信息'))).toBeVisible();
      await expect(element(by.text('重新拍照'))).toBeVisible();
      await expect(element(by.text('確認使用'))).toBeVisible();
    });

    it('should retake photo', async () => {
      // 拍照
      await element(by.id('capture-button')).tap();

      // 點擊重新拍照
      await element(by.text('重新拍照')).tap();

      // 檢查是否返回相機界面
      await expect(element(by.id('camera-view'))).toBeVisible();
      await expect(element(by.id('capture-button'))).toBeVisible();
    });

    it('should confirm scan result', async () => {
      // 拍照
      await element(by.id('capture-button')).tap();

      // 點擊確認使用
      await element(by.text('確認使用')).tap();

      // 檢查是否跳轉到卡片詳情頁面
      await expect(element(by.text('卡片詳情'))).toBeVisible();
      await expect(element(by.text('卡片名稱'))).toBeVisible();
      await expect(element(by.text('價格信息'))).toBeVisible();
    });

    it('should handle scan failure', async () => {
      // 模擬掃描失敗的情況
      await element(by.id('capture-button')).tap();

      // 檢查是否顯示掃描失敗提示
      await expect(element(by.text('掃描失敗'))).toBeVisible();
      await expect(element(by.text('無法識別卡片，請重試'))).toBeVisible();
      await expect(element(by.text('重試'))).toBeVisible();
      await expect(element(by.text('手動輸入'))).toBeVisible();
    });

    it('should retry scan after failure', async () => {
      // 模擬掃描失敗
      await element(by.id('capture-button')).tap();

      // 點擊重試
      await element(by.text('重試')).tap();

      // 檢查是否返回相機界面
      await expect(element(by.id('camera-view'))).toBeVisible();
      await expect(element(by.id('capture-button'))).toBeVisible();
    });

    it('should navigate to manual input after failure', async () => {
      // 模擬掃描失敗
      await element(by.id('capture-button')).tap();

      // 點擊手動輸入
      await element(by.text('手動輸入')).tap();

      // 檢查是否跳轉到手動輸入界面
      await expect(element(by.text('手動輸入卡片信息'))).toBeVisible();
      await expect(element(by.id('card-name-input'))).toBeVisible();
      await expect(element(by.id('card-type-input'))).toBeVisible();
    });
  });

  describe('Manual Input', () => {
    beforeEach(async () => {
      // 登錄並導航到掃描屏幕
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('掃描')).tap();
      await element(by.text('允許')).tap();
      await element(by.id('capture-button')).tap();
      await element(by.text('手動輸入')).tap();
    });

    it('should display manual input form', async () => {
      // 檢查手動輸入表單
      await expect(element(by.text('手動輸入卡片信息'))).toBeVisible();
      await expect(element(by.id('card-name-input'))).toBeVisible();
      await expect(element(by.id('card-type-input'))).toBeVisible();
      await expect(element(by.id('card-rarity-input'))).toBeVisible();
      await expect(element(by.id('card-set-input'))).toBeVisible();
      await expect(element(by.text('保存'))).toBeVisible();
      await expect(element(by.text('取消'))).toBeVisible();
    });

    it('should validate required fields', async () => {
      // 點擊保存而不輸入任何內容
      await element(by.text('保存')).tap();

      // 檢查是否顯示驗證錯誤
      await expect(element(by.text('請輸入卡片名稱'))).toBeVisible();
      await expect(element(by.text('請選擇卡片類型'))).toBeVisible();
    });

    it('should successfully save manual input', async () => {
      // 輸入卡片信息
      await element(by.id('card-name-input')).typeText('Blue-Eyes White Dragon');
      await element(by.id('card-type-input')).tap();
      await element(by.text('Monster')).tap();
      await element(by.id('card-rarity-input')).tap();
      await element(by.text('Ultra Rare')).tap();
      await element(by.id('card-set-input')).typeText('Legend of Blue Eyes White Dragon');

      // 點擊保存
      await element(by.text('保存')).tap();

      // 檢查是否跳轉到卡片詳情頁面
      await expect(element(by.text('卡片詳情'))).toBeVisible();
      await expect(element(by.text('Blue-Eyes White Dragon'))).toBeVisible();
    });

    it('should cancel manual input', async () => {
      // 點擊取消
      await element(by.text('取消')).tap();

      // 檢查是否返回掃描界面
      await expect(element(by.id('camera-view'))).toBeVisible();
      await expect(element(by.id('capture-button'))).toBeVisible();
    });
  });

  describe('Scan History', () => {
    beforeEach(async () => {
      // 登錄並導航到掃描屏幕
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Password123!');
      await element(by.id('login-button')).tap();
      await element(by.text('掃描')).tap();
      await element(by.text('允許')).tap();
    });

    it('should access scan history', async () => {
      // 點擊掃描歷史按鈕
      await element(by.id('scan-history-button')).tap();

      // 檢查掃描歷史界面
      await expect(element(by.text('掃描歷史'))).toBeVisible();
      await expect(element(by.id('scan-history-list'))).toBeVisible();
    });

    it('should display scan history items', async () => {
      // 訪問掃描歷史
      await element(by.id('scan-history-button')).tap();

      // 檢查歷史記錄項目
      await expect(element(by.text('Blue-Eyes White Dragon'))).toBeVisible();
      await expect(element(by.text('2024-12-19'))).toBeVisible();
      await expect(element(by.text('成功'))).toBeVisible();
    });

    it('should view scan history detail', async () => {
      // 訪問掃描歷史
      await element(by.id('scan-history-button')).tap();

      // 點擊歷史記錄項目
      await element(by.text('Blue-Eyes White Dragon')).tap();

      // 檢查詳情頁面
      await expect(element(by.text('掃描詳情'))).toBeVisible();
      await expect(element(by.text('Blue-Eyes White Dragon'))).toBeVisible();
      await expect(element(by.text('掃描時間'))).toBeVisible();
      await expect(element(by.text('掃描結果'))).toBeVisible();
    });
  });
});

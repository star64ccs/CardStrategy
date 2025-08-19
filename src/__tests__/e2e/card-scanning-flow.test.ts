import { device, element, by, expect, waitFor } from 'detox';

describe('卡片掃描流程', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('基本掃描流程', () => {
    it('應該完成完整的卡片掃描流程', async () => {
      // 1. 導航到掃描頁面
      await element(by.id('scan-tab')).tap();
      await expect(element(by.text('卡片掃描'))).toBeVisible();

      // 2. 點擊掃描按鈕
      await element(by.id('scan-button')).tap();

      // 3. 等待相機權限請求
      await waitFor(element(by.text('相機權限'))).toBeVisible().withTimeout(5000);

      // 4. 授予相機權限
      await element(by.text('允許')).tap();

      // 5. 等待相機界面載入
      await waitFor(element(by.id('camera-view'))).toBeVisible().withTimeout(3000);

      // 6. 模擬拍照
      await element(by.id('capture-button')).tap();

      // 7. 等待AI識別
      await waitFor(element(by.text('正在識別...'))).toBeVisible().withTimeout(10000);

      // 8. 驗證識別結果
      await waitFor(element(by.text('識別結果'))).toBeVisible().withTimeout(15000);

      // 9. 確認卡片信息
      await element(by.text('確認')).tap();

      // 10. 驗證保存成功
      await waitFor(element(by.text('卡片已保存'))).toBeVisible().withTimeout(5000);
    });

    it('應該處理掃描失敗的情況', async () => {
      // 1. 導航到掃描頁面
      await element(by.id('scan-tab')).tap();

      // 2. 點擊掃描按鈕
      await element(by.id('scan-button')).tap();

      // 3. 拒絕相機權限
      await element(by.text('拒絕')).tap();

      // 4. 驗證錯誤提示
      await expect(element(by.text('需要相機權限才能掃描卡片'))).toBeVisible();

      // 5. 點擊設置按鈕
      await element(by.text('去設置')).tap();
    });
  });

  describe('圖片選擇流程', () => {
    it('應該支持從相冊選擇圖片', async () => {
      // 1. 導航到掃描頁面
      await element(by.id('scan-tab')).tap();

      // 2. 點擊相冊按鈕
      await element(by.id('gallery-button')).tap();

      // 3. 等待相冊權限請求
      await waitFor(element(by.text('相冊權限'))).toBeVisible().withTimeout(3000);

      // 4. 授予相冊權限
      await element(by.text('允許')).tap();

      // 5. 選擇圖片
      await element(by.id('image-item-0')).tap();

      // 6. 等待AI識別
      await waitFor(element(by.text('正在識別...'))).toBeVisible().withTimeout(10000);

      // 7. 驗證識別結果
      await waitFor(element(by.text('識別結果'))).toBeVisible().withTimeout(15000);
    });
  });

  describe('識別結果處理', () => {
    it('應該正確顯示識別結果', async () => {
      // 模擬已識別的狀態
      await device.sendToHome();
      await device.launchApp({ newInstance: true });

      // 導航到掃描頁面並模擬識別完成
      await element(by.id('scan-tab')).tap();

      // 驗證識別結果包含必要信息
      await expect(element(by.text('卡片名稱'))).toBeVisible();
      await expect(element(by.text('稀有度'))).toBeVisible();
      await expect(element(by.text('價格'))).toBeVisible();
    });

    it('應該支持手動編輯識別結果', async () => {
      // 1. 進入識別結果頁面
      await element(by.id('scan-tab')).tap();
      await element(by.id('scan-button')).tap();

      // 2. 模擬識別完成
      await waitFor(element(by.text('識別結果'))).toBeVisible().withTimeout(15000);

      // 3. 點擊編輯按鈕
      await element(by.id('edit-button')).tap();

      // 4. 修改卡片名稱
      await element(by.id('card-name-input')).clearText();
      await element(by.id('card-name-input')).typeText('修改後的卡片名稱');

      // 5. 修改價格
      await element(by.id('price-input')).clearText();
      await element(by.id('price-input')).typeText('1500');

      // 6. 保存修改
      await element(by.text('保存')).tap();

      // 7. 驗證修改成功
      await waitFor(element(by.text('修改已保存'))).toBeVisible().withTimeout(3000);
    });
  });

  describe('條件評估', () => {
    it('應該支持卡片條件評估', async () => {
      // 1. 進入識別結果頁面
      await element(by.id('scan-tab')).tap();
      await element(by.id('scan-button')).tap();

      // 2. 等待識別完成
      await waitFor(element(by.text('識別結果'))).toBeVisible().withTimeout(15000);

      // 3. 點擊條件評估按鈕
      await element(by.id('condition-assessment-button')).tap();

      // 4. 選擇條件等級
      await element(by.text('Near Mint')).tap();

      // 5. 添加條件描述
      await element(by.id('condition-description-input')).typeText('卡片狀況良好，只有輕微磨損');

      // 6. 保存條件評估
      await element(by.text('保存評估')).tap();

      // 7. 驗證評估成功
      await waitFor(element(by.text('條件評估已保存'))).toBeVisible().withTimeout(3000);
    });
  });

  describe('收藏功能', () => {
    it('應該支持添加卡片到收藏', async () => {
      // 1. 進入識別結果頁面
      await element(by.id('scan-tab')).tap();
      await element(by.id('scan-button')).tap();

      // 2. 等待識別完成
      await waitFor(element(by.text('識別結果'))).toBeVisible().withTimeout(15000);

      // 3. 點擊收藏按鈕
      await element(by.id('favorite-button')).tap();

      // 4. 驗證收藏成功
      await waitFor(element(by.text('已添加到收藏'))).toBeVisible().withTimeout(3000);

      // 5. 導航到收藏頁面驗證
      await element(by.id('favorites-tab')).tap();
      await expect(element(by.text('修改後的卡片名稱'))).toBeVisible();
    });
  });

  describe('價格監控', () => {
    it('應該支持設置價格警報', async () => {
      // 1. 進入識別結果頁面
      await element(by.id('scan-tab')).tap();
      await element(by.id('scan-button')).tap();

      // 2. 等待識別完成
      await waitFor(element(by.text('識別結果'))).toBeVisible().withTimeout(15000);

      // 3. 點擊價格監控按鈕
      await element(by.id('price-monitor-button')).tap();

      // 4. 設置目標價格
      await element(by.id('target-price-input')).typeText('1200');

      // 5. 選擇警報類型
      await element(by.text('價格下降時通知')).tap();

      // 6. 保存價格警報
      await element(by.text('設置警報')).tap();

      // 7. 驗證警報設置成功
      await waitFor(element(by.text('價格警報已設置'))).toBeVisible().withTimeout(3000);
    });
  });

  describe('分享功能', () => {
    it('應該支持分享卡片', async () => {
      // 1. 進入識別結果頁面
      await element(by.id('scan-tab')).tap();
      await element(by.id('scan-button')).tap();

      // 2. 等待識別完成
      await waitFor(element(by.text('識別結果'))).toBeVisible().withTimeout(15000);

      // 3. 點擊分享按鈕
      await element(by.id('share-button')).tap();

      // 4. 選擇分享平台
      await element(by.text('Facebook')).tap();

      // 5. 驗證分享成功
      await waitFor(element(by.text('分享成功'))).toBeVisible().withTimeout(5000);
    });
  });

  describe('掃描歷史', () => {
    it('應該正確記錄掃描歷史', async () => {
      // 1. 完成一次掃描
      await element(by.id('scan-tab')).tap();
      await element(by.id('scan-button')).tap();
      await waitFor(element(by.text('識別結果'))).toBeVisible().withTimeout(15000);
      await element(by.text('確認')).tap();

      // 2. 導航到掃描歷史頁面
      await element(by.id('history-tab')).tap();

      // 3. 驗證歷史記錄
      await expect(element(by.text('修改後的卡片名稱'))).toBeVisible();
      await expect(element(by.text('今天'))).toBeVisible();
    });

    it('應該支持查看掃描詳情', async () => {
      // 1. 導航到掃描歷史頁面
      await element(by.id('history-tab')).tap();

      // 2. 點擊歷史記錄
      await element(by.id('history-item-0')).tap();

      // 3. 驗證詳情頁面
      await expect(element(by.text('掃描詳情'))).toBeVisible();
      await expect(element(by.text('修改後的卡片名稱'))).toBeVisible();
      await expect(element(by.text('$1,500'))).toBeVisible();
    });
  });

  describe('錯誤處理', () => {
    it('應該處理網絡錯誤', async () => {
      // 模擬網絡錯誤
      await device.setURLBlacklist(['.*api.*']);

      // 1. 嘗試掃描
      await element(by.id('scan-tab')).tap();
      await element(by.id('scan-button')).tap();

      // 2. 等待識別
      await waitFor(element(by.text('正在識別...'))).toBeVisible().withTimeout(10000);

      // 3. 驗證錯誤提示
      await waitFor(element(by.text('網絡連接失敗'))).toBeVisible().withTimeout(15000);

      // 4. 點擊重試
      await element(by.text('重試')).tap();

      // 恢復網絡
      await device.setURLBlacklist([]);
    });

    it('應該處理識別失敗', async () => {
      // 1. 進入掃描頁面
      await element(by.id('scan-tab')).tap();
      await element(by.id('scan-button')).tap();

      // 2. 模擬識別失敗
      await waitFor(element(by.text('正在識別...'))).toBeVisible().withTimeout(10000);

      // 3. 驗證失敗提示
      await waitFor(element(by.text('無法識別卡片'))).toBeVisible().withTimeout(15000);

      // 4. 選擇手動輸入
      await element(by.text('手動輸入')).tap();

      // 5. 驗證手動輸入界面
      await expect(element(by.text('手動輸入卡片信息'))).toBeVisible();
    });
  });

  describe('性能測試', () => {
    it('應該在合理時間內完成掃描', async () => {
      const startTime = Date.now();

      // 1. 開始掃描
      await element(by.id('scan-tab')).tap();
      await element(by.id('scan-button')).tap();

      // 2. 等待識別完成
      await waitFor(element(by.text('識別結果'))).toBeVisible().withTimeout(20000);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 驗證掃描時間在合理範圍內（30秒內）
      expect(duration).toBeLessThan(30000);
    });

    it('應該處理連續掃描', async () => {
      // 1. 第一次掃描
      await element(by.id('scan-tab')).tap();
      await element(by.id('scan-button')).tap();
      await waitFor(element(by.text('識別結果'))).toBeVisible().withTimeout(15000);
      await element(by.text('確認')).tap();

      // 2. 第二次掃描
      await element(by.id('scan-button')).tap();
      await waitFor(element(by.text('識別結果'))).toBeVisible().withTimeout(15000);
      await element(by.text('確認')).tap();

      // 3. 驗證兩次掃描都成功
      await element(by.id('history-tab')).tap();
      await expect(element(by.id('history-item-0'))).toBeVisible();
      await expect(element(by.id('history-item-1'))).toBeVisible();
    });
  });
});

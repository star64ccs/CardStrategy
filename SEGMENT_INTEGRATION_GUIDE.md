# Segment 與 Mixpanel 集成指南

## 概述
本指南說明如何設置 Segment 與 Mixpanel 的集成，用於 CardStrategy 項目的用戶行為分析。

## 步驟 1：安裝 Segment 庫

### 使用 npm
```bash
npm install @segment/analytics-next
```

### 使用 CDN
```html
<script src="https://cdn.segment.com/analytics.js/v1/analytics.min.js"></script>
```

## 步驟 2：初始化 Segment

```javascript
import Analytics from '@segment/analytics-next';

const analytics = Analytics({
  writeKey: 'YOUR_SEGMENT_WRITE_KEY'
});
```

## 步驟 3：設置 Mixpanel 目標

1. 登錄 Segment 控制台
2. 進入 Sources → Destinations
3. 添加 Mixpanel (Actions) 目標
4. 配置連接參數：
   - Project Token: e2f3e5f69c25b4681b5b0e49f80991fe
   - API Secret: [您的 API Secret]

## 步驟 4：實現事件追蹤

### 用戶識別
```javascript
// 用戶註冊
analytics.identify('user123', {
  name: 'John Doe',
  email: 'john@example.com'
});

// 用戶登錄
analytics.identify('user123');
```

### 事件追蹤
```javascript
// 卡片查看
analytics.track('Card Viewed', {
  card_id: 'card_123',
  card_name: 'Black Lotus',
  card_category: 'Magic',
  card_rarity: 'Rare',
  card_price: 299.99,
  view_source: 'search',
  user_id: 'user123'
});

// 卡片購買
analytics.track('Card Purchased', {
  card_id: 'card_123',
  card_name: 'Black Lotus',
  card_price: 299.99,
  payment_method: 'credit_card',
  purchase_source: 'wishlist',
  user_id: 'user123'
});
```

## 步驟 5：測試集成

1. 在應用中觸發事件
2. 檢查 Segment 控制台
3. 檢查 Mixpanel 事件視圖
4. 確認數據正確傳輸

## 注意事項

- 確保所有事件名稱和屬性與 Mixpanel 設置一致
- 定期檢查數據傳輸狀態
- 監控 Segment 和 Mixpanel 的使用量
- 保護用戶隱私，不要傳輸敏感信息

## 故障排除

### 常見問題
1. 事件不顯示在 Mixpanel
   - 檢查 Segment 目標配置
   - 確認 Project Token 正確
   - 檢查網絡連接

2. 數據延遲
   - Segment 通常有 1-2 分鐘延遲
   - 檢查 Segment 控制台狀態

3. 事件屬性缺失
   - 確認事件屬性名稱正確
   - 檢查 JavaScript 代碼

## 支持資源

- [Segment 文檔](https://segment.com/docs/)
- [Mixpanel 文檔](https://developer.mixpanel.com/)
- [Segment-Mixpanel 集成指南](https://segment.com/docs/connections/destinations/catalog/actions-mixpanel/)

const fs = require('fs');
const path = require('path');

/**
 * Segment 集成Settings腳本
 * 用於Configure Segment 與 Mixpanel 的集成
 */

// eslint-disable-next-line no-console
console.log('🔗 設置 Segment 與 Mixpanel 集成...\n');

// Segment Configure模板
const segmentConfig = {
  name: 'segment-config.json',
  content: {
    provider: 'segment',
    description: 'Segment 客戶數據平台配置',
    integration: {
      source: 'javascript',
      destination: 'mixpanel',
      status: 'pending'
    },
    events: {
      userIdentification: [
        'identify',
        'login',
        'logout'
      ],
      userActions: [
        'Card Viewed',
        'Card Purchased',
        'Search Performed',
        'Wishlist Added',
        'Sign Up',
        'Page View'
      ]
    },
    properties: {
      cardViewed: [
        'card_id',
        'card_name',
        'card_category',
        'card_rarity',
        'card_price',
        'view_source',
        'user_id'
      ],
      cardPurchased: [
        'card_id',
        'card_name',
        'card_price',
        'payment_method',
        'purchase_source',
        'user_id'
      ],
      searchPerformed: [
        'search_query',
        'search_category',
        'search_results_count',
        'search_filters',
        'search_source',
        'user_id'
      ],
      wishlistAdded: [
        'card_id',
        'card_name',
        'card_price',
        'wishlist_source',
        'wishlist_position',
        'user_id'
      ]
    },
    lastUpdated: new Date().toISOString(),
    notes: [
      '需要安裝 Segment JavaScript 庫',
      '需要配置 Mixpanel 目標',
      '需要實現用戶識別和事件追蹤'
    ]
  }
};

// CreateConfigureFile
const configDir = path.join(__dirname, '../src/config/ai-keys');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

const configPath = path.join(configDir, segmentConfig.name);
fs.writeFileSync(configPath, JSON.stringify(segmentConfig.content, null, 2));
// eslint-disable-next-line no-console
console.log(`✅ 創建 Segment 配置文件: ${segmentConfig.name}`);

// Create JavaScript 集成代碼模板
const jsIntegrationCode = `// Segment 與 Mixpanel 集成代碼
// 請將此代碼Add到您的前端Apply中

// 1. Install Segment JavaScript Library
// npm install @segment/analytics-next
// 或使用 CDN: https://cdn.segment.com/analytics.js/v1/analytics.min.js

// 2. Initialize Segment
import Analytics from '@segment/analytics-next';

const analytics = Analytics({
  writeKey: 'YOUR_SEGMENT_WRITE_KEY'
});

// 3. User識別
export const identifyUser = (userId, traits = {}) => {
  analytics.identify(userId, traits);
};

// 4. TraceEvent
export const trackEvent = (eventName, properties = {}) => {
  analytics.track(eventName, properties);
};

// 5. 卡片查看Event
export const trackCardViewed = (cardData) => {
  trackEvent('Card Viewed', {
    card_id: cardData.id,
    card_name: cardData.name,
    card_category: cardData.category,
    card_rarity: cardData.rarity,
    card_price: cardData.price,
    view_source: cardData.source,
    user_id: cardData.userId
  });
};

// 6. 卡片購買Event
export const trackCardPurchased = (purchaseData) => {
  trackEvent('Card Purchased', {
    card_id: purchaseData.cardId,
    card_name: purchaseData.cardName,
    card_price: purchaseData.price,
    payment_method: purchaseData.paymentMethod,
    purchase_source: purchaseData.source,
    user_id: purchaseData.userId
  });
};

// 7. SearchEvent
export const trackSearch = (searchData) => {
  trackEvent('Search Performed', {
    search_query: searchData.query,
    search_category: searchData.category,
    search_results_count: searchData.resultsCount,
    search_filters: searchData.filters,
    search_source: searchData.source,
    user_id: searchData.userId
  });
};

// 8. 願望清單Event
export const trackWishlistAdded = (wishlistData) => {
  trackEvent('Wishlist Added', {
    card_id: wishlistData.cardId,
    card_name: wishlistData.cardName,
    card_price: wishlistData.price,
    wishlist_source: wishlistData.source,
    wishlist_position: wishlistData.position,
    user_id: wishlistData.userId
  });
};

// 9. 頁面瀏覽Event
export const trackPageView = (pageData) => {
  trackEvent('Page View', {
    page_name: pageData.name,
    page_url: pageData.url,
    page_category: pageData.category,
    user_id: pageData.userId
  });
};

// 10. UserRegisterEvent
export const trackSignUp = (userData) => {
  trackEvent('Sign Up', {
    signup_method: userData.method,
    signup_source: userData.source,
    user_id: userData.userId
  });
};

// 使用示例
// identifyUser('user123', { name: 'John Doe', email: 'john@example.com' });
// trackCardViewed({ id: 'card_123', name: 'Black Lotus', category: 'Magic', rarity: 'Rare', price: 299.99, source: 'search', userId: 'user123' });
`;

const jsPath = path.join(__dirname, '../src/integrations/segment-integration.js');
fs.writeFileSync(jsPath, jsIntegrationCode);
// eslint-disable-next-line no-console
console.log('✅ 創建 Segment 集成代碼模板');

// CreateSettings指南
const setupGuide = `# Segment 與 Mixpanel 集成指南

## 概述
本指南說明如何設置 Segment 與 Mixpanel 的集成，用於 CardStrategy 項目的用戶行為分析。

## 步驟 1：安裝 Segment 庫

### 使用 npm
\`\`\`bash
npm install @segment/analytics-next
\`\`\`

### 使用 CDN
\`\`\`html
<script src="https://cdn.segment.com/analytics.js/v1/analytics.min.js"></script>
\`\`\`

## 步驟 2：初始化 Segment

\`\`\`javascript
import Analytics from '@segment/analytics-next';

const analytics = Analytics({
  writeKey: 'YOUR_SEGMENT_WRITE_KEY'
});
\`\`\`

## 步驟 3：設置 Mixpanel 目標

1. 登錄 Segment 控制台
2. 進入 Sources → Destinations
3. 添加 Mixpanel (Actions) 目標
4. 配置連接參數：
   - Project Token: e2f3e5f69c25b4681b5b0e49f80991fe
   - API Secret: [您的 API Secret]

## 步驟 4：實現事件追蹤

### 用戶識別
\`\`\`javascript
// UserRegister
analytics.identify('user123', {
  name: 'John Doe',
  email: 'john@example.com'
});

// UserLogin
analytics.identify('user123');
\`\`\`

### 事件追蹤
\`\`\`javascript
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
\`\`\`

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
`;

const guidePath = path.join(__dirname, '../SEGMENT_INTEGRATION_GUIDE.md');
fs.writeFileSync(guidePath, setupGuide);
// eslint-disable-next-line no-console
console.log('✅ 創建 Segment 集成指南');

// eslint-disable-next-line no-console
console.log('\n🎉 Segment 集成設置完成！');
// eslint-disable-next-line no-console
console.log('\n📋 下一步:');
// eslint-disable-next-line no-console
console.log('1. 獲取 Segment Write Key');
// eslint-disable-next-line no-console
console.log('2. 獲取 Mixpanel API Secret');
// eslint-disable-next-line no-console
console.log('3. 在 Segment 中設置 Mixpanel 目標');
// eslint-disable-next-line no-console
console.log('4. 集成 JavaScript 代碼到前端應用');
// eslint-disable-next-line no-console
console.log('5. 測試事件追蹤');

// eslint-disable-next-line no-console
console.log('\n📚 文檔:');
// eslint-disable-next-line no-console
console.log('- Segment 集成指南: SEGMENT_INTEGRATION_GUIDE.md');
// eslint-disable-next-line no-console
console.log('- 集成代碼模板: src/integrations/segment-integration.js');

// Segment 與 Mixpanel 集成代碼
// 請將此代碼添加到您的前端應用中

// 1. 安裝 Segment JavaScript 庫
// npm install @segment/analytics-next
// 或使用 CDN: https://cdn.segment.com/analytics.js/v1/analytics.min.js

// 2. 初始化 Segment
import Analytics from '@segment/analytics-next';

const analytics = Analytics({
  writeKey: 'mdGZ0xW3RFNPGXgMP6tbxIB25HPR7wLC'
});

// 3. 用戶識別
export const identifyUser = (userId, traits = {}) => {
  analytics.identify(userId, traits);
};

// 4. 追蹤事件
export const trackEvent = (eventName, properties = {}) => {
  analytics.track(eventName, properties);
};

// 5. 卡片查看事件
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

// 6. 卡片購買事件
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

// 7. 搜索事件
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

// 8. 願望清單事件
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

// 9. 頁面瀏覽事件
export const trackPageView = (pageData) => {
  trackEvent('Page View', {
    page_name: pageData.name,
    page_url: pageData.url,
    page_category: pageData.category,
    user_id: pageData.userId
  });
};

// 10. 用戶註冊事件
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

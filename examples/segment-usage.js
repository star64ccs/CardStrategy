// CardStrategy Segment 使用範例
import { 
  identifyUser, 
  trackEvent, 
  trackCardViewed, 
  trackCardPurchased,
  trackSearch,
  trackWishlistAdded,
  trackPageView,
  trackSignUp
} from '../src/integrations/segment-integration';

// ========================================
// 🔐 用戶識別和管理
// ========================================

// 1. 用戶註冊時識別
export const handleUserSignUp = async (userData) => {
  // 識別用戶
  identifyUser(userData.id, {
    name: userData.name,
    email: userData.email,
    signupDate: new Date().toISOString(),
    plan: 'free',
    source: 'mobile_app'
  });

  // 追蹤註冊事件
  trackSignUp({
    method: userData.signupMethod, // 'email', 'google', 'facebook'
    source: 'registration_screen',
    userId: userData.id
  });
};

// 2. 用戶登錄時識別
export const handleUserLogin = async (userData) => {
  identifyUser(userData.id, {
    name: userData.name,
    email: userData.email,
    lastLogin: new Date().toISOString(),
    plan: userData.plan || 'free'
  });

  trackEvent('User Login', {
    loginMethod: userData.loginMethod,
    loginTime: new Date().toISOString(),
    userId: userData.id
  });
};

// ========================================
// 🃏 卡片相關事件
// ========================================

// 3. 卡片瀏覽追蹤
export const handleCardView = (cardData, viewContext) => {
  trackCardViewed({
    id: cardData.id,
    name: cardData.name,
    category: cardData.category, // 'Magic', 'Pokemon', 'YuGiOh'
    rarity: cardData.rarity,     // 'Common', 'Rare', 'Legendary'
    price: cardData.currentPrice,
    source: viewContext.source, // 'search', 'featured', 'category'
    userId: viewContext.userId
  });

  // 頁面瀏覽追蹤
  trackPageView({
    name: 'Card Detail',
    url: `/cards/${cardData.id}`,
    category: 'product',
    userId: viewContext.userId
  });
};

// 4. 卡片購買追蹤
export const handleCardPurchase = (purchaseData) => {
  trackCardPurchased({
    cardId: purchaseData.cardId,
    cardName: purchaseData.cardName,
    price: purchaseData.finalPrice,
    originalPrice: purchaseData.originalPrice,
    discount: purchaseData.discount,
    paymentMethod: purchaseData.paymentMethod, // 'credit_card', 'paypal', 'crypto'
    purchase_source: purchaseData.source, // 'wishlist', 'search', 'recommendation'
    userId: purchaseData.userId,
    transactionId: purchaseData.transactionId
  });

  // 追蹤收入
  trackEvent('Revenue', {
    amount: purchaseData.finalPrice,
    currency: 'USD',
    productType: 'trading_card',
    userId: purchaseData.userId
  });
};

// ========================================
// 🔍 搜索和瀏覽
// ========================================

// 5. 搜索行為追蹤
export const handleSearch = (searchData) => {
  trackSearch({
    query: searchData.query,
    category: searchData.selectedCategory,
    resultsCount: searchData.resultsCount,
    filters: JSON.stringify(searchData.appliedFilters),
    source: searchData.source, // 'header_search', 'category_page'
    userId: searchData.userId
  });

  // 無結果搜索特別追蹤
  if (searchData.resultsCount === 0) {
    trackEvent('Search No Results', {
      query: searchData.query,
      category: searchData.selectedCategory,
      userId: searchData.userId
    });
  }
};

// 6. 分類瀏覽追蹤
export const handleCategoryBrowse = (categoryData, userId) => {
  trackEvent('Category Browsed', {
    category: categoryData.name,
    itemCount: categoryData.itemCount,
    sortBy: categoryData.sortBy,
    filterApplied: categoryData.hasFilters,
    userId: userId
  });
};

// ========================================
// ❤️ 用戶互動
// ========================================

// 7. 願望清單操作
export const handleWishlistAdd = (wishlistData) => {
  trackWishlistAdded({
    cardId: wishlistData.cardId,
    cardName: wishlistData.cardName,
    price: wishlistData.cardPrice,
    source: wishlistData.source, // 'card_page', 'search_results'
    position: wishlistData.wishlistPosition,
    userId: wishlistData.userId
  });
};

export const handleWishlistRemove = (wishlistData) => {
  trackEvent('Wishlist Removed', {
    cardId: wishlistData.cardId,
    cardName: wishlistData.cardName,
    timeInWishlist: wishlistData.timeInWishlist, // 毫秒
    userId: wishlistData.userId
  });
};

// 8. 評價和評論
export const handleCardRating = (ratingData) => {
  trackEvent('Card Rated', {
    cardId: ratingData.cardId,
    rating: ratingData.rating, // 1-5 星
    hasComment: !!ratingData.comment,
    userId: ratingData.userId
  });
};

// ========================================
// 🎯 應用行為分析
// ========================================

// 9. 應用使用模式
export const handleAppSession = (sessionData) => {
  trackEvent('App Session', {
    sessionDuration: sessionData.duration,
    pagesViewed: sessionData.pagesViewed,
    actionsPerformed: sessionData.actionsCount,
    platform: sessionData.platform, // 'ios', 'android'
    userId: sessionData.userId
  });
};

// 10. 功能使用追蹤
export const handleFeatureUsage = (featureName, userId, metadata = {}) => {
  trackEvent('Feature Used', {
    featureName: featureName, // 'ai_recommendation', 'price_alert', 'collection_tracker'
    userId: userId,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

// ========================================
// 💡 使用示例
// ========================================

// 完整的用戶旅程示例
export const exampleUserJourney = async () => {
  const userId = 'user_123';
  const userName = 'John Collector';
  const userEmail = 'john@example.com';

  // 1. 用戶註冊
  await handleUserSignUp({
    id: userId,
    name: userName,
    email: userEmail,
    signupMethod: 'email'
  });

  // 2. 搜索卡片
  handleSearch({
    query: 'Black Lotus',
    selectedCategory: 'Magic',
    resultsCount: 5,
    appliedFilters: { priceRange: '100-500', condition: 'mint' },
    source: 'header_search',
    userId: userId
  });

  // 3. 查看卡片詳情
  handleCardView({
    id: 'card_001',
    name: 'Black Lotus',
    category: 'Magic',
    rarity: 'Legendary',
    currentPrice: 299.99
  }, {
    source: 'search',
    userId: userId
  });

  // 4. 添加到願望清單
  handleWishlistAdd({
    cardId: 'card_001',
    cardName: 'Black Lotus',
    cardPrice: 299.99,
    source: 'card_page',
    wishlistPosition: 1,
    userId: userId
  });

  // 5. 購買卡片
  handleCardPurchase({
    cardId: 'card_001',
    cardName: 'Black Lotus',
    finalPrice: 279.99,
    originalPrice: 299.99,
    discount: 20.00,
    paymentMethod: 'credit_card',
    source: 'wishlist',
    userId: userId,
    transactionId: 'txn_123456'
  });

  console.log('✅ 用戶旅程事件追蹤完成');
};

// 導出所有函數
export {
  handleUserSignUp,
  handleUserLogin,
  handleCardView,
  handleCardPurchase,
  handleSearch,
  handleCategoryBrowse,
  handleWishlistAdd,
  handleWishlistRemove,
  handleCardRating,
  handleAppSession,
  handleFeatureUsage,
  exampleUserJourney
};
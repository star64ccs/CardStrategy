const fs = require('fs');
const path = require('path');

/**
 * 使用範例Create腳本
 * 為 CardStrategy 項目Create詳細的使用範例
 */

// eslint-disable-next-line no-console
console.log('📖 創建 CardStrategy 使用範例...\n');

// Create examples Directory
const examplesDir = path.join(__dirname, '../examples');
if (!fs.existsSync(examplesDir)) {
  fs.mkdirSync(examplesDir, { recursive: true });
}

// Segment 使用範例
const segmentExample = `// CardStrategy Segment 使用範例
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
// 🔐 User識別和Manage
// ========================================

// 1. UserRegister時識別
export const handleUserSignUp = async (userData) => {
  // 識別User
  identifyUser(userData.id, {
    name: userData.name,
    email: userData.email,
    signupDate: new Date().toISOString(),
    plan: 'free',
    source: 'mobile_app'
  });

  // TraceRegisterEvent
  trackSignUp({
    method: userData.signupMethod, // 'email', 'google', 'facebook'
    source: 'registration_screen',
    userId: userData.id
  });
};

// 2. UserLogin時識別
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
// 🃏 卡片相OffEvent
// ========================================

// 3. 卡片瀏覽Trace
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

  // 頁面瀏覽Trace
  trackPageView({
    name: 'Card Detail',
    url: \`/cards/\${cardData.id}\`,
    category: 'product',
    userId: viewContext.userId
  });
};

// 4. 卡片購買Trace
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

  // Trace收入
  trackEvent('Revenue', {
    amount: purchaseData.finalPrice,
    currency: 'USD',
    productType: 'trading_card',
    userId: purchaseData.userId
  });
};

// ========================================
// 🔍 Search和瀏覽
// ========================================

// 5. SearchRow為Trace
export const handleSearch = (searchData) => {
  trackSearch({
    query: searchData.query,
    category: searchData.selectedCategory,
    resultsCount: searchData.resultsCount,
    filters: JSON.stringify(searchData.appliedFilters),
    source: searchData.source, // 'header_search', 'category_page'
    userId: searchData.userId
  });

  // 無結果Search特別Trace
  if (searchData.resultsCount === 0) {
    trackEvent('Search No Results', {
      query: searchData.query,
      category: searchData.selectedCategory,
      userId: searchData.userId
    });
  }
};

// 6. 分Class瀏覽Trace
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
// ❤️ User互動
// ========================================

// 7. 願望清單Operation
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
    timeInWishlist: wishlistData.timeInWishlist, // 毫Second
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
// 🎯 ApplyRow為Analysis
// ========================================

// 9. Apply使用模式
export const handleAppSession = (sessionData) => {
  trackEvent('App Session', {
    sessionDuration: sessionData.duration,
    pagesViewed: sessionData.pagesViewed,
    actionsPerformed: sessionData.actionsCount,
    platform: sessionData.platform, // 'ios', 'android'
    userId: sessionData.userId
  });
};

// 10. 功能使用Trace
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

// 完整的User旅程示例
export const exampleUserJourney = async () => {
  const userId = 'user_123';
  const userName = 'John Collector';
  const userEmail = 'john@example.com';

  // 1. UserRegister
  await handleUserSignUp({
    id: userId,
    name: userName,
    email: userEmail,
    signupMethod: 'email'
  });

  // 2. Search卡片
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

  // 4. Add到願望清單
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

// Export所有Function
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
};`;

// SendGrid 郵件範例
const sendGridExample = `// CardStrategy SendGrid 郵件範例
const sgMail = require('@sendgrid/mail');

// Settings API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ========================================
// 📧 基本郵件模板
// ========================================

// 1. 歡迎郵件
export const sendWelcomeEmail = async (userEmail, userName) => {
  const msg = {
    to: userEmail,
    from: 'noreply@cardstrategyapp.com',
    subject: '🎉 歡迎加入 CardStrategy！',
    html: \`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4CAF50;">歡迎來到 CardStrategy！</h1>
        <p>親愛的 \${userName}，</p>
        <p>感謝您註冊 CardStrategy！您現在可以：</p>
        <ul>
          <li>🔍 搜索和瀏覽數千張卡片</li>
          <li>💰 追蹤市場價格變化</li>
          <li>📊 使用 AI 分析工具</li>
          <li>💝 建立您的願望清單</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://cardstrategy.app" 
             style="background: #4CAF50; color: white; padding: 15px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            開始探索
          </a>
        </div>
        <p>祝您收藏愉快！<br>CardStrategy 團隊</p>
      </div>
    \`
  };

  try {
    await sgMail.send(msg);
    console.log('✅ 歡迎郵件發送Success');
  } catch (error) {
    console.error('❌ 歡迎郵件發送Failed:', error);
  }
};

// 2. 價格提醒郵件
export const sendPriceAlertEmail = async (userEmail, cardData) => {
  const msg = {
    to: userEmail,
    from: 'alerts@cardstrategyapp.com',
    subject: \`💰 價格提醒：\${cardData.name} 價格變動\`,
    html: \`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF9800;">🚨 價格提醒</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin: 0;">\${cardData.name}</h3>
          <p style="margin: 10px 0;">
            <strong>當前價格：</strong> 
            <span style="color: \${cardData.priceChange > 0 ? '#4CAF50' : '#F44336'}; font-size: 1.2em;">
              $\${cardData.currentPrice}
            </span>
          </p>
          <p style="margin: 10px 0;">
            <strong>價格變化：</strong> 
            <span style="color: \${cardData.priceChange > 0 ? '#4CAF50' : '#F44336'};">
              \${cardData.priceChange > 0 ? '+' : ''}\${cardData.priceChange}%
            </span>
          </p>
          <p style="margin: 10px 0;"><strong>您的目標價格：</strong> $\${cardData.targetPrice}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://cardstrategy.app/cards/\${cardData.id}" 
             style="background: #FF9800; color: white; padding: 15px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            查看詳情
          </a>
        </div>
      </div>
    \`
  };

  try {
    await sgMail.send(msg);
    console.log('✅ 價格提醒郵件發送Success');
  } catch (error) {
    console.error('❌ 價格提醒郵件發送Failed:', error);
  }
};

// 3. 訂單Confirm郵件
export const sendOrderConfirmationEmail = async (userEmail, orderData) => {
  const msg = {
    to: userEmail,
    from: 'orders@cardstrategyapp.com',
    subject: \`✅ 訂單確認 #\${orderData.orderNumber}\`,
    html: \`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4CAF50;">✅ 訂單確認</h1>
        <p>您的訂單已確認！</p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>訂單詳情</h3>
          <p><strong>訂單編號：</strong> #\${orderData.orderNumber}</p>
          <p><strong>訂單日期：</strong> \${new Date(orderData.orderDate).toLocaleDateString('zh-TW')}</p>
          <p><strong>預計送達：</strong> \${orderData.estimatedDelivery}</p>
        </div>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>商品清單</h3>
          \${orderData.items.map(item => \`
            <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
              <p><strong>\${item.name}</strong></p>
              <p>數量: \${item.quantity} × $\${item.price} = $\${item.total}</p>
            </div>
          \`).join('')}
          <div style="text-align: right; margin-top: 15px; font-size: 1.2em;">
            <strong>總計: $\${orderData.total}</strong>
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://cardstrategy.app/orders/\${orderData.orderNumber}" 
             style="background: #4CAF50; color: white; padding: 15px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            追蹤訂單
          </a>
        </div>
      </div>
    \`
  };

  try {
    await sgMail.send(msg);
    console.log('✅ 訂單確認郵件發送Success');
  } catch (error) {
    console.error('❌ 訂單確認郵件發送Failed:', error);
  }
};

// 4. PasswordReset郵件
export const sendPasswordResetEmail = async (userEmail, resetToken) => {
  const resetUrl = \`https://cardstrategy.app/reset-password?token=\${resetToken}\`;
  
  const msg = {
    to: userEmail,
    from: 'security@cardstrategyapp.com',
    subject: '🔒 重置您的 CardStrategy 密碼',
    html: \`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F44336;">🔒 密碼重置請求</h2>
        <p>我們收到了重置您密碼的請求。</p>
        <p>如果這是您的操作，請點擊下方按鈕重置密碼：</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="\${resetUrl}" 
             style="background: #F44336; color: white; padding: 15px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            重置密碼
          </a>
        </div>
        
        <p style="color: #666; font-size: 0.9em;">
          這個鏈接將在 24 小時後過期。<br>
          如果您沒有請求重置密碼，請忽略此郵件。
        </p>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            <strong>安全提醒：</strong> 如果您無法點擊按鈕，請複製以下鏈接到瀏覽器：<br>
            <code>\${resetUrl}</code>
          </p>
        </div>
      </div>
    \`
  };

  try {
    await sgMail.send(msg);
    console.log('✅ 密碼重置郵件發送Success');
  } catch (error) {
    console.error('❌ 密碼重置郵件發送Failed:', error);
  }
};

// 5. 每週摘要郵件
export const sendWeeklySummaryEmail = async (userEmail, summaryData) => {
  const msg = {
    to: userEmail,
    from: 'insights@cardstrategyapp.com',
    subject: '📊 您的週度 CardStrategy 摘要',
    html: \`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #667eea;">📊 您的週度摘要</h1>
        <p>以下是您這週在 CardStrategy 的活動摘要：</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0;">
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #1976d2;">卡片瀏覽</h3>
            <p style="font-size: 2em; margin: 10px 0; font-weight: bold;">\${summaryData.cardsViewed}</p>
          </div>
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #388e3c;">願望清單</h3>
            <p style="font-size: 2em; margin: 10px 0; font-weight: bold;">\${summaryData.wishlistItems}</p>
          </div>
        </div>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3>🎯 本週熱門卡片</h3>
          \${summaryData.trendingCards.map(card => \`
            <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
              <strong>\${card.name}</strong> - 價格趨勢: 
              <span style="color: \${card.trend === 'up' ? '#4CAF50' : '#F44336'};">
                \${card.trend === 'up' ? '📈' : '📉'} \${card.changePercent}%
              </span>
            </div>
          \`).join('')}
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://cardstrategy.app/dashboard" 
             style="background: #667eea; color: white; padding: 15px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            查看完整報告
          </a>
        </div>
      </div>
    \`
  };

  try {
    await sgMail.send(msg);
    console.log('✅ 週度摘要郵件發送Success');
  } catch (error) {
    console.error('❌ 週度摘要郵件發送Failed:', error);
  }
};

// Export所有Function
export {
  sendWelcomeEmail,
  sendPriceAlertEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendWeeklySummaryEmail
};`;

// Firebase 使用範例
const firebaseExample = `// CardStrategy Firebase 使用範例
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';

// ========================================
// 🔐 身份Verify
// ========================================

// 1. UserRegister
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // UpdateUser資料
    await user.updateProfile({
      displayName: displayName
    });
    
    // 在 Firestore 中CreateUser檔案
    await firestore().collection('users').doc(user.uid).set({
      email: email,
      displayName: displayName,
      createdAt: firestore.FieldValue.serverTimestamp(),
      plan: 'free',
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        priceAlerts: true
      }
    });
    
    console.log('✅ 用戶註冊Success:', user.uid);
    return user;
  } catch (error) {
    console.error('❌ 用戶註冊Failed:', error);
    throw error;
  }
};

// 2. UserLogin
export const loginUser = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Update最後LoginTime
    await firestore().collection('users').doc(user.uid).update({
      lastLoginAt: firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ 用戶登錄Success:', user.uid);
    return user;
  } catch (error) {
    console.error('❌ 用戶登錄Failed:', error);
    throw error;
  }
};

// 3. User登出
export const logoutUser = async () => {
  try {
    await auth().signOut();
    console.log('✅ 用戶登出Success');
  } catch (error) {
    console.error('❌ 用戶登出Failed:', error);
    throw error;
  }
};

// ========================================
// 📊 Firestore DataOperation
// ========================================

// 4. User收藏Manage
export const addToCollection = async (userId, cardData) => {
  try {
    const collectionRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('collection');
    
    await collectionRef.add({
      cardId: cardData.id,
      cardName: cardData.name,
      cardImage: cardData.image,
      purchasePrice: cardData.purchasePrice,
      currentPrice: cardData.currentPrice,
      condition: cardData.condition,
      addedAt: firestore.FieldValue.serverTimestamp(),
      tags: cardData.tags || []
    });
    
    console.log('✅ 卡片已添加到收藏');
  } catch (error) {
    console.error('❌ 添加收藏Failed:', error);
    throw error;
  }
};

// 5. 願望清單Manage
export const addToWishlist = async (userId, cardData) => {
  try {
    const wishlistRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('wishlist');
    
    await wishlistRef.add({
      cardId: cardData.id,
      cardName: cardData.name,
      cardImage: cardData.image,
      targetPrice: cardData.targetPrice,
      currentPrice: cardData.currentPrice,
      priority: cardData.priority || 'medium',
      addedAt: firestore.FieldValue.serverTimestamp(),
      notifyOnPriceDrop: true
    });
    
    console.log('✅ 卡片已添加到願望清單');
  } catch (error) {
    console.error('❌ 添加願望清單Failed:', error);
    throw error;
  }
};

// 6. GetUser收藏
export const getUserCollection = async (userId) => {
  try {
    const snapshot = await firestore()
      .collection('users')
      .doc(userId)
      .collection('collection')
      .orderBy('addedAt', 'desc')
      .get();
    
    const collection = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(\`✅ Get收藏Success，共 \${collection.length} 張卡片\`);
    return collection;
  } catch (error) {
    console.error('❌ Get收藏Failed:', error);
    throw error;
  }
};

// 7. 實時價格Monitor
export const setupPriceMonitoring = (userId, callback) => {
  try {
    const unsubscribe = firestore()
      .collection('users')
      .doc(userId)
      .collection('wishlist')
      .where('notifyOnPriceDrop', '==', true)
      .onSnapshot(snapshot => {
        const wishlistItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        callback(wishlistItems);
      });
    
    console.log('✅ 價格監控已設置');
    return unsubscribe;
  } catch (error) {
    console.error('❌ Settings價格監控Failed:', error);
    throw error;
  }
};

// ========================================
// 📁 Storage FileOperation
// ========================================

// 8. Upload卡片Graph片
export const uploadCardImage = async (userId, imageUri, cardId) => {
  try {
    const filename = \`cards/\${userId}/\${cardId}_\${Date.now()}.jpg\`;
    const reference = storage().ref(filename);
    
    await reference.putFile(imageUri);
    const downloadUrl = await reference.getDownloadURL();
    
    console.log('✅ 圖片上傳Success:', downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error('❌ 圖片上傳Failed:', error);
    throw error;
  }
};

// 9. UploadUser頭像
export const uploadUserAvatar = async (userId, imageUri) => {
  try {
    const filename = \`avatars/\${userId}/avatar.jpg\`;
    const reference = storage().ref(filename);
    
    await reference.putFile(imageUri);
    const downloadUrl = await reference.getDownloadURL();
    
    // UpdateUser資料中的頭像 URL
    await firestore().collection('users').doc(userId).update({
      avatarUrl: downloadUrl,
      updatedAt: firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ 頭像上傳Success:', downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error('❌ 頭像上傳Failed:', error);
    throw error;
  }
};

// ========================================
// 🔔 PushNotification
// ========================================

// 10. SettingsPushNotification
export const setupPushNotifications = async (userId) => {
  try {
    // Request權限
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      // Get FCM Token
      const fcmToken = await messaging().getToken();
      
      // Save Token 到 Firestore
      await firestore().collection('users').doc(userId).update({
        fcmToken: fcmToken,
        notificationSettings: {
          enabled: true,
          lastUpdated: firestore.FieldValue.serverTimestamp()
        }
      });
      
      console.log('✅ 推送通知SettingsSuccess');
      return fcmToken;
    } else {
      console.log('❌ 推送通知權限被拒絕');
      return null;
    }
  } catch (error) {
    console.error('❌ Settings推送通知Failed:', error);
    throw error;
  }
};

// 11. 監聽PushNotification
export const setupNotificationListeners = () => {
  // 前台Message監聽
  const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    console.log('收到前台通知:', remoteMessage);
    // 這裡可以ShowApply內Notification
  });

  // 背景/ExitStatus下點擊Notification
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('從背景狀態打開應用:', remoteMessage);
    // Handle導航邏輯
  });

  // Apply完全Off閉時點擊NotificationStart
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('從關閉狀態啟動應用:', remoteMessage);
        // Handle導航邏輯
      }
    });

  return unsubscribeForeground;
};

// ========================================
// 📊 Analysis和Statistics
// ========================================

// 12. RecordUserRow為
export const logUserActivity = async (userId, activity) => {
  try {
    await firestore().collection('analytics').add({
      userId: userId,
      activity: activity.type,
      data: activity.data,
      timestamp: firestore.FieldValue.serverTimestamp(),
      platform: 'mobile',
      version: '1.0.0'
    });
    
    console.log('✅ 用戶行為記錄Success');
  } catch (error) {
    console.error('❌ 記錄用戶行為Failed:', error);
  }
};

// 13. GetUserStatistics
export const getUserStats = async (userId) => {
  try {
    const userDoc = await firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    // Get收藏Statistics
    const collectionSnapshot = await firestore()
      .collection('users')
      .doc(userId)
      .collection('collection')
      .get();
    
    // Get願望清單Statistics
    const wishlistSnapshot = await firestore()
      .collection('users')
      .doc(userId)
      .collection('wishlist')
      .get();
    
    const stats = {
      user: userData,
      collection: {
        count: collectionSnapshot.size,
        totalValue: 0 // 需要計算
      },
      wishlist: {
        count: wishlistSnapshot.size
      },
      activity: {
        lastLogin: userData?.lastLoginAt,
        joinDate: userData?.createdAt
      }
    };
    
    console.log('✅ Get用戶統計Success');
    return stats;
  } catch (error) {
    console.error('❌ Get用戶統計Failed:', error);
    throw error;
  }
};

// Export所有Function
export {
  registerUser,
  loginUser,
  logoutUser,
  addToCollection,
  addToWishlist,
  getUserCollection,
  setupPriceMonitoring,
  uploadCardImage,
  uploadUserAvatar,
  setupPushNotifications,
  setupNotificationListeners,
  logUserActivity,
  getUserStats
};`;

try {
  // Write範例File
  fs.writeFileSync(path.join(examplesDir, 'segment-usage.js'), segmentExample);
  // eslint-disable-next-line no-console
  console.log('✅ 創建 Segment 使用範例: examples/segment-usage.js');

  fs.writeFileSync(path.join(examplesDir, 'sendgrid-examples.js'), sendGridExample);
  // eslint-disable-next-line no-console
  console.log('✅ 創建 SendGrid 郵件範例: examples/sendgrid-examples.js');

  fs.writeFileSync(path.join(examplesDir, 'firebase-examples.js'), firebaseExample);
  // eslint-disable-next-line no-console
  console.log('✅ 創建 Firebase 使用範例: examples/firebase-examples.js');

  // Create範例IndexFile
  const indexExample = `// CardStrategy 使用範例Index
// Import所有範例模組

// Segment Analysis範例
export * from './segment-usage';

// SendGrid 郵件範例
export * from './sendgrid-examples';

// Firebase Service範例
export * from './firebase-examples';

// 快速Begin範例
export const quickStartExamples = {
  // UserRegister流程
  userRegistration: async (userData) => {
    const { registerUser } = await import('./firebase-examples');
    const { handleUserSignUp } = await import('./segment-usage');
    const { sendWelcomeEmail } = await import('./sendgrid-examples');
    
    // 1. Firebase Register
    const user = await registerUser(userData.email, userData.password, userData.name);
    
    // 2. Segment Trace
    await handleUserSignUp({
      id: user.uid,
      name: userData.name,
      email: userData.email,
      signupMethod: 'email'
    });
    
    // 3. Send歡迎郵件
    await sendWelcomeEmail(userData.email, userData.name);
    
    return user;
  },

  // 卡片購買流程
  cardPurchase: async (purchaseData) => {
    const { handleCardPurchase } = await import('./segment-usage');
    const { sendOrderConfirmationEmail } = await import('./sendgrid-examples');
    const { logUserActivity } = await import('./firebase-examples');
    
    // 1. Segment Trace購買
    await handleCardPurchase(purchaseData);
    
    // 2. Firebase Record活動
    await logUserActivity(purchaseData.userId, {
      type: 'card_purchase',
      data: purchaseData
    });
    
    // 3. SendConfirm郵件
    await sendOrderConfirmationEmail(purchaseData.userEmail, purchaseData);
    
    return { success: true };
  }
};

console.log('📖 CardStrategy 使用範例已載入');
console.log('💡 查看 examples/ 目錄獲取詳細範例代碼');`;

  fs.writeFileSync(path.join(examplesDir, 'index.js'), indexExample);
  // eslint-disable-next-line no-console
  console.log('✅ 創建範例索引: examples/index.js');

  // eslint-disable-next-line no-console
  console.log('\n🎉 使用範例創建完成！');
  // eslint-disable-next-line no-console
  console.log('\n📚 可用範例:');
  // eslint-disable-next-line no-console
  console.log('   📊 Segment 分析: examples/segment-usage.js');
  // eslint-disable-next-line no-console
  console.log('   📧 SendGrid 郵件: examples/sendgrid-examples.js');
  // eslint-disable-next-line no-console
  console.log('   🔥 Firebase Service: examples/firebase-examples.js');
  // eslint-disable-next-line no-console
  console.log('   📖 快速開始: examples/index.js');

  // eslint-disable-next-line no-console
  console.log('\n💡 使用方式:');
  // eslint-disable-next-line no-console
  console.log('   import { handleUserSignUp } from "./examples/segment-usage";');
  // eslint-disable-next-line no-console
  console.log('   import { sendWelcomeEmail } from "./examples/sendgrid-examples";');
  // eslint-disable-next-line no-console
  console.log('   import { registerUser } from "./examples/firebase-examples";');

} catch (error) {
  // eslint-disable-next-line no-console
  console.error('❌ Create使用範例Failed:', error.message);
  process.exit(1);
}

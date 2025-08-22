// CardStrategy Firebase 使用範例
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';

// ========================================
// 🔐 身份驗證
// ========================================

// 1. 用戶註冊
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // 更新用戶資料
    await user.updateProfile({
      displayName: displayName
    });
    
    // 在 Firestore 中創建用戶檔案
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
    
    console.log('✅ 用戶註冊成功:', user.uid);
    return user;
  } catch (error) {
    console.error('❌ 用戶註冊失敗:', error);
    throw error;
  }
};

// 2. 用戶登錄
export const loginUser = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // 更新最後登錄時間
    await firestore().collection('users').doc(user.uid).update({
      lastLoginAt: firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ 用戶登錄成功:', user.uid);
    return user;
  } catch (error) {
    console.error('❌ 用戶登錄失敗:', error);
    throw error;
  }
};

// 3. 用戶登出
export const logoutUser = async () => {
  try {
    await auth().signOut();
    console.log('✅ 用戶登出成功');
  } catch (error) {
    console.error('❌ 用戶登出失敗:', error);
    throw error;
  }
};

// ========================================
// 📊 Firestore 數據操作
// ========================================

// 4. 用戶收藏管理
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
    console.error('❌ 添加收藏失敗:', error);
    throw error;
  }
};

// 5. 願望清單管理
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
    console.error('❌ 添加願望清單失敗:', error);
    throw error;
  }
};

// 6. 獲取用戶收藏
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
    
    console.log(`✅ 獲取收藏成功，共 ${collection.length} 張卡片`);
    return collection;
  } catch (error) {
    console.error('❌ 獲取收藏失敗:', error);
    throw error;
  }
};

// 7. 實時價格監控
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
    console.error('❌ 設置價格監控失敗:', error);
    throw error;
  }
};

// ========================================
// 📁 Storage 文件操作
// ========================================

// 8. 上傳卡片圖片
export const uploadCardImage = async (userId, imageUri, cardId) => {
  try {
    const filename = `cards/${userId}/${cardId}_${Date.now()}.jpg`;
    const reference = storage().ref(filename);
    
    await reference.putFile(imageUri);
    const downloadUrl = await reference.getDownloadURL();
    
    console.log('✅ 圖片上傳成功:', downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error('❌ 圖片上傳失敗:', error);
    throw error;
  }
};

// 9. 上傳用戶頭像
export const uploadUserAvatar = async (userId, imageUri) => {
  try {
    const filename = `avatars/${userId}/avatar.jpg`;
    const reference = storage().ref(filename);
    
    await reference.putFile(imageUri);
    const downloadUrl = await reference.getDownloadURL();
    
    // 更新用戶資料中的頭像 URL
    await firestore().collection('users').doc(userId).update({
      avatarUrl: downloadUrl,
      updatedAt: firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ 頭像上傳成功:', downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error('❌ 頭像上傳失敗:', error);
    throw error;
  }
};

// ========================================
// 🔔 推送通知
// ========================================

// 10. 設置推送通知
export const setupPushNotifications = async (userId) => {
  try {
    // 請求權限
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      // 獲取 FCM Token
      const fcmToken = await messaging().getToken();
      
      // 保存 Token 到 Firestore
      await firestore().collection('users').doc(userId).update({
        fcmToken: fcmToken,
        notificationSettings: {
          enabled: true,
          lastUpdated: firestore.FieldValue.serverTimestamp()
        }
      });
      
      console.log('✅ 推送通知設置成功');
      return fcmToken;
    } else {
      console.log('❌ 推送通知權限被拒絕');
      return null;
    }
  } catch (error) {
    console.error('❌ 設置推送通知失敗:', error);
    throw error;
  }
};

// 11. 監聽推送通知
export const setupNotificationListeners = () => {
  // 前台消息監聽
  const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    console.log('收到前台通知:', remoteMessage);
    // 這裡可以顯示應用內通知
  });

  // 背景/退出狀態下點擊通知
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('從背景狀態打開應用:', remoteMessage);
    // 處理導航邏輯
  });

  // 應用完全關閉時點擊通知啟動
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('從關閉狀態啟動應用:', remoteMessage);
        // 處理導航邏輯
      }
    });

  return unsubscribeForeground;
};

// ========================================
// 📊 分析和統計
// ========================================

// 12. 記錄用戶行為
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
    
    console.log('✅ 用戶行為記錄成功');
  } catch (error) {
    console.error('❌ 記錄用戶行為失敗:', error);
  }
};

// 13. 獲取用戶統計
export const getUserStats = async (userId) => {
  try {
    const userDoc = await firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    // 獲取收藏統計
    const collectionSnapshot = await firestore()
      .collection('users')
      .doc(userId)
      .collection('collection')
      .get();
    
    // 獲取願望清單統計
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
    
    console.log('✅ 獲取用戶統計成功');
    return stats;
  } catch (error) {
    console.error('❌ 獲取用戶統計失敗:', error);
    throw error;
  }
};

// 導出所有函數
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
};
// CardStrategy 使用範例索引
// 導入所有範例模組

// Segment 分析範例
export * from './segment-usage';

// SendGrid 郵件範例
export * from './sendgrid-examples';

// Firebase 服務範例
export * from './firebase-examples';

// 快速開始範例
export const quickStartExamples = {
  // 用戶註冊流程
  userRegistration: async (userData) => {
    const { registerUser } = await import('./firebase-examples');
    const { handleUserSignUp } = await import('./segment-usage');
    const { sendWelcomeEmail } = await import('./sendgrid-examples');
    
    // 1. Firebase 註冊
    const user = await registerUser(userData.email, userData.password, userData.name);
    
    // 2. Segment 追蹤
    await handleUserSignUp({
      id: user.uid,
      name: userData.name,
      email: userData.email,
      signupMethod: 'email'
    });
    
    // 3. 發送歡迎郵件
    await sendWelcomeEmail(userData.email, userData.name);
    
    return user;
  },

  // 卡片購買流程
  cardPurchase: async (purchaseData) => {
    const { handleCardPurchase } = await import('./segment-usage');
    const { sendOrderConfirmationEmail } = await import('./sendgrid-examples');
    const { logUserActivity } = await import('./firebase-examples');
    
    // 1. Segment 追蹤購買
    await handleCardPurchase(purchaseData);
    
    // 2. Firebase 記錄活動
    await logUserActivity(purchaseData.userId, {
      type: 'card_purchase',
      data: purchaseData
    });
    
    // 3. 發送確認郵件
    await sendOrderConfirmationEmail(purchaseData.userEmail, purchaseData);
    
    return { success: true };
  }
};

console.log('📖 CardStrategy 使用範例已載入');
console.log('💡 查看 examples/ 目錄獲取詳細範例代碼');
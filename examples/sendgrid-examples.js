// CardStrategy SendGrid 郵件範例
const sgMail = require('@sendgrid/mail');

// 設置 API Key
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
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4CAF50;">歡迎來到 CardStrategy！</h1>
        <p>親愛的 ${userName}，</p>
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
    `
  };

  try {
    await sgMail.send(msg);
    console.log('✅ 歡迎郵件發送成功');
  } catch (error) {
    console.error('❌ 歡迎郵件發送失敗:', error);
  }
};

// 2. 價格提醒郵件
export const sendPriceAlertEmail = async (userEmail, cardData) => {
  const msg = {
    to: userEmail,
    from: 'alerts@cardstrategyapp.com',
    subject: `💰 價格提醒：${cardData.name} 價格變動`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF9800;">🚨 價格提醒</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin: 0;">${cardData.name}</h3>
          <p style="margin: 10px 0;">
            <strong>當前價格：</strong> 
            <span style="color: ${cardData.priceChange > 0 ? '#4CAF50' : '#F44336'}; font-size: 1.2em;">
              $${cardData.currentPrice}
            </span>
          </p>
          <p style="margin: 10px 0;">
            <strong>價格變化：</strong> 
            <span style="color: ${cardData.priceChange > 0 ? '#4CAF50' : '#F44336'};">
              ${cardData.priceChange > 0 ? '+' : ''}${cardData.priceChange}%
            </span>
          </p>
          <p style="margin: 10px 0;"><strong>您的目標價格：</strong> $${cardData.targetPrice}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://cardstrategy.app/cards/${cardData.id}" 
             style="background: #FF9800; color: white; padding: 15px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            查看詳情
          </a>
        </div>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log('✅ 價格提醒郵件發送成功');
  } catch (error) {
    console.error('❌ 價格提醒郵件發送失敗:', error);
  }
};

// 3. 訂單確認郵件
export const sendOrderConfirmationEmail = async (userEmail, orderData) => {
  const msg = {
    to: userEmail,
    from: 'orders@cardstrategyapp.com',
    subject: `✅ 訂單確認 #${orderData.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4CAF50;">✅ 訂單確認</h1>
        <p>您的訂單已確認！</p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>訂單詳情</h3>
          <p><strong>訂單編號：</strong> #${orderData.orderNumber}</p>
          <p><strong>訂單日期：</strong> ${new Date(orderData.orderDate).toLocaleDateString('zh-TW')}</p>
          <p><strong>預計送達：</strong> ${orderData.estimatedDelivery}</p>
        </div>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>商品清單</h3>
          ${orderData.items.map(item => `
            <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
              <p><strong>${item.name}</strong></p>
              <p>數量: ${item.quantity} × $${item.price} = $${item.total}</p>
            </div>
          `).join('')}
          <div style="text-align: right; margin-top: 15px; font-size: 1.2em;">
            <strong>總計: $${orderData.total}</strong>
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://cardstrategy.app/orders/${orderData.orderNumber}" 
             style="background: #4CAF50; color: white; padding: 15px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            追蹤訂單
          </a>
        </div>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log('✅ 訂單確認郵件發送成功');
  } catch (error) {
    console.error('❌ 訂單確認郵件發送失敗:', error);
  }
};

// 4. 密碼重置郵件
export const sendPasswordResetEmail = async (userEmail, resetToken) => {
  const resetUrl = `https://cardstrategy.app/reset-password?token=${resetToken}`;
  
  const msg = {
    to: userEmail,
    from: 'security@cardstrategyapp.com',
    subject: '🔒 重置您的 CardStrategy 密碼',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F44336;">🔒 密碼重置請求</h2>
        <p>我們收到了重置您密碼的請求。</p>
        <p>如果這是您的操作，請點擊下方按鈕重置密碼：</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
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
            <code>${resetUrl}</code>
          </p>
        </div>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log('✅ 密碼重置郵件發送成功');
  } catch (error) {
    console.error('❌ 密碼重置郵件發送失敗:', error);
  }
};

// 5. 每週摘要郵件
export const sendWeeklySummaryEmail = async (userEmail, summaryData) => {
  const msg = {
    to: userEmail,
    from: 'insights@cardstrategyapp.com',
    subject: '📊 您的週度 CardStrategy 摘要',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #667eea;">📊 您的週度摘要</h1>
        <p>以下是您這週在 CardStrategy 的活動摘要：</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0;">
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #1976d2;">卡片瀏覽</h3>
            <p style="font-size: 2em; margin: 10px 0; font-weight: bold;">${summaryData.cardsViewed}</p>
          </div>
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #388e3c;">願望清單</h3>
            <p style="font-size: 2em; margin: 10px 0; font-weight: bold;">${summaryData.wishlistItems}</p>
          </div>
        </div>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3>🎯 本週熱門卡片</h3>
          ${summaryData.trendingCards.map(card => `
            <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
              <strong>${card.name}</strong> - 價格趨勢: 
              <span style="color: ${card.trend === 'up' ? '#4CAF50' : '#F44336'};">
                ${card.trend === 'up' ? '📈' : '📉'} ${card.changePercent}%
              </span>
            </div>
          `).join('')}
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://cardstrategy.app/dashboard" 
             style="background: #667eea; color: white; padding: 15px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            查看完整報告
          </a>
        </div>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log('✅ 週度摘要郵件發送成功');
  } catch (error) {
    console.error('❌ 週度摘要郵件發送失敗:', error);
  }
};

// 導出所有函數
export {
  sendWelcomeEmail,
  sendPriceAlertEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendWeeklySummaryEmail
};
# 📱 CardStrategy 開發完整指南

## 🎯 項目概述

CardStrategy 是一款結合 AI 與市場分析的卡牌投資與收藏管理平台，使用 Expo React Native 開發，集成了多項第三方服務。

## 🏗️ 技術架構

### 📱 前端技術棧
- **Expo React Native** - 跨平台移動應用開發
- **React Redux** - 狀態管理
- **TypeScript** - 類型安全
- **React Navigation** - 路由導航

### 💾 後端技術棧
- **Node.js** - 後端運行環境
- **PostgreSQL** - 主數據庫
- **Firebase** - 身份驗證和實時數據庫

### ☁️ 第三方服務
- **AWS S3** - 文件存儲
- **Firebase** - 身份驗證、推送通知、數據存儲
- **Segment** - 數據收集平台 (Write Key: mdGZ0xW3RFNPGXgMP6tbxIB25HPR7wLC)
- **Mixpanel** - 用戶行為分析 (Token: e2f3e5f69c25b4681b5b0e49f80991fe)
- **SendGrid** - 郵件發送服務 (100 郵件/天)
- **Gmail SMTP** - 備用郵件服務 (500 郵件/天)
- **LogRocket** - 前端錯誤監控 (App ID: lzzz2v/card-strategy)

## 🚀 開發環境設置

### 1. 環境要求
```bash
Node.js >= 18.0.0
npm >= 8.0.0
Expo CLI
Android Studio (Android 開發)
Xcode (iOS 開發)
```

### 2. 項目安裝
```bash
git clone [您的倉庫URL]
cd CardStrategy
npm install --legacy-peer-deps
```

### 3. 環境配置
```bash
# 切換到開發環境
node scripts/switch-env.js development

# 切換到生產環境
node scripts/switch-env.js production
```

### 4. 啟動開發服務器
```bash
# 基本啟動
expo start

# 清除緩存啟動
expo start --clear

# Android 調試
expo start --android

# iOS 調試
expo start --ios
```

## 📊 服務集成使用指南

### 🎯 Segment 數據收集

#### 基本用法
```javascript
import { trackEvent, identifyUser } from './src/integrations/segment-integration';

// 用戶識別
identifyUser('user123', {
  name: 'John Doe',
  email: 'john@example.com',
  plan: 'premium'
});

// 事件追蹤
trackEvent('Card Viewed', {
  card_id: 'card_123',
  card_name: 'Black Lotus',
  card_price: 299.99
});
```

#### 預定義事件
```javascript
import { 
  trackCardViewed, 
  trackCardPurchased, 
  trackSearch, 
  trackWishlistAdded 
} from './src/integrations/segment-integration';

// 卡片查看
trackCardViewed({
  id: 'card_123',
  name: 'Black Lotus',
  category: 'Magic',
  price: 299.99
});

// 卡片購買
trackCardPurchased({
  cardId: 'card_123',
  cardName: 'Black Lotus',
  price: 299.99,
  paymentMethod: 'credit_card'
});
```

### 📧 郵件發送

#### SendGrid 使用
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'user@example.com',
  from: 'noreply@cardstrategyapp.com',
  subject: 'Welcome to CardStrategy',
  html: '<h1>歡迎使用 CardStrategy！</h1>'
};

await sgMail.send(msg);
```

#### Gmail SMTP 使用
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

await transporter.sendMail({
  from: process.env.GMAIL_USER,
  to: 'user@example.com',
  subject: 'Test Email',
  html: '<p>Hello from CardStrategy!</p>'
});
```

### 🔍 LogRocket 監控

LogRocket 已自動集成到 App.tsx 中，會自動記錄：
- 用戶會話
- 錯誤和異常
- 網絡請求
- 用戶交互

查看數據：https://app.logrocket.com/lzzz2v/card-strategy/

### 🔥 Firebase 服務

#### 身份驗證
```javascript
import auth from '@react-native-firebase/auth';

// 註冊用戶
const createUser = async (email, password) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error('註冊失敗:', error);
  }
};

// 登錄用戶
const signInUser = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error('登錄失敗:', error);
  }
};
```

#### 推送通知
```javascript
import messaging from '@react-native-firebase/messaging';

// 獲取 FCM Token
const getFCMToken = async () => {
  const token = await messaging().getToken();
  console.log('FCM Token:', token);
  return token;
};

// 監聽通知
messaging().onMessage(async remoteMessage => {
  console.log('收到通知:', remoteMessage);
});
```

## 🧪 測試指南

### 服務測試
```bash
# 測試所有服務
node scripts/check-free-services-config.js

# 測試特定服務
node scripts/test-sendgrid-service.js
node scripts/test-gmail-smtp.js
node scripts/test-logrocket-config.js
node scripts/test-segment-mixpanel-integration.js

# 服務健康檢查
node scripts/monitor-services.js
```

### 應用測試
```bash
# 單元測試
npm test

# 覆蓋率測試
npm run test:coverage

# E2E 測試
npm run test:e2e
```

## 📊 監控和分析

### 監控儀表板
打開 `monitoring/dashboard.html` 查看：
- 服務狀態
- 使用量統計
- 性能指標
- 快速連結

### 分析平台連結
- **Mixpanel**: https://mixpanel.com/project/2818294
- **Segment**: https://app.segment.com/chan-yat-sang/sources/javascript/overview
- **LogRocket**: https://app.logrocket.com/lzzz2v/card-strategy/
- **SendGrid**: https://app.sendgrid.com
- **Firebase**: https://console.firebase.google.com/project/cardstrategy-406cc

## 🔧 常用開發命令

```bash
# 環境管理
node scripts/switch-env.js development    # 開發環境
node scripts/switch-env.js production     # 生產環境

# 服務管理
node scripts/check-free-services-config.js  # 檢查服務狀態
node scripts/monitor-services.js            # 健康檢查

# 開發調試
expo start                    # 啟動開發服務器
expo start --clear           # 清除緩存啟動
expo start --tunnel          # 隧道模式
npm run lint                 # 代碼檢查
npm run type-check           # 類型檢查

# 構建部署
npm run build               # 構建應用
npx expo run:android       # Android 構建
npx expo run:ios           # iOS 構建
```

## 📝 開發最佳實踐

### 1. 代碼規範
- 使用 TypeScript 確保類型安全
- 遵循 ESLint 規則
- 使用 Prettier 格式化代碼
- 寫清晰的注釋和文檔

### 2. 狀態管理
- 使用 Redux Toolkit 管理全局狀態
- 組件內部狀態使用 useState
- 異步操作使用 createAsyncThunk

### 3. 性能優化
- 使用 React.memo 優化組件渲染
- 實施圖片懶加載
- 避免不必要的重新渲染
- 使用 FlatList 處理長列表

### 4. 錯誤處理
- 實施錯誤邊界 (Error Boundaries)
- 使用 try-catch 處理異步錯誤
- LogRocket 自動記錄錯誤
- 提供用戶友好的錯誤信息

### 5. 安全性
- API 密鑰存儲在環境變量中
- 使用 HTTPS 進行所有網絡請求
- 實施適當的身份驗證
- 定期更新依賴包

## 🚀 部署指南

### 開發部署
```bash
# 使用 Expo EAS
npx eas build --platform android
npx eas build --platform ios
npx eas submit --platform android
npx eas submit --platform ios
```

### 生產部署
```bash
# 切換到生產環境
node scripts/switch-env.js production

# 構建生產版本
npx eas build --platform all --profile production
```

## 🐛 故障排除

### 常見問題

1. **Metro 緩存問題**
```bash
npx expo start --clear
```

2. **依賴衝突**
```bash
npm install --legacy-peer-deps
```

3. **Android 構建失敗**
```bash
cd android && ./gradlew clean && cd ..
npx expo run:android
```

4. **iOS 構建失敗**
```bash
cd ios && rm -rf Pods && pod install && cd ..
npx expo run:ios
```

## 📚 相關文檔

- **Expo 文檔**: https://docs.expo.dev/
- **React Native 文檔**: https://reactnative.dev/docs/getting-started
- **Firebase 文檔**: https://firebase.google.com/docs
- **Mixpanel 文檔**: https://developer.mixpanel.com/
- **SendGrid 文檔**: https://docs.sendgrid.com/

## 📞 支持和幫助

如果遇到問題，請：
1. 查看相關文檔和指南
2. 檢查監控儀表板
3. 運行健康檢查腳本
4. 查看 LogRocket 錯誤日誌

---

**祝您開發愉快！🚀**

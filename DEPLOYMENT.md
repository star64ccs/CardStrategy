# 卡策（CardStrategy）部署指南

## 概述

本文檔說明如何將卡策應用程序部署到RENDER平台，包括前端和後端API的部署步驟。

## 系統架構

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   RENDER API    │    │   MongoDB       │
│   Mobile App    │◄──►│   Service       │◄──►│   Database      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 後端API部署

### 1. 準備工作

1. 確保您有RENDER帳戶
2. 將代碼推送到GitHub倉庫
3. 準備環境變量

### 2. 在RENDER上創建服務

1. 登錄RENDER控制台
2. 點擊"New +" → "Web Service"
3. 連接您的GitHub倉庫
4. 配置服務設置：

#### 基本配置
- **Name**: `cardstrategy-api`
- **Environment**: `Node`
- **Region**: 選擇離您最近的區域
- **Branch**: `main`
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`

#### 環境變量
在RENDER控制台中設置以下環境變量：

```bash
# 服務器配置
NODE_ENV=production
PORT=10000

# 數據庫配置
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cardstrategy

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_REFRESH_EXPIRE=7d

# 跨域配置
ALLOWED_ORIGINS=https://cardstrategy.com,https://cardstrategy.onrender.com

# 雲存儲配置（可選）
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# 第三方API配置（可選）
OPENAI_API_KEY=your-openai-api-key
GOOGLE_PALM_API_KEY=your-google-palm-api-key
AZURE_OPENAI_API_KEY=your-azure-openai-api-key

# 支付配置（可選）
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# 短信配置（可選）
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# 郵件配置（可選）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 日誌配置
LOG_LEVEL=info

# 安全配置
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 文件上傳配置
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

### 3. 創建MongoDB數據庫

1. 在RENDER控制台中點擊"New +" → "MongoDB"
2. 配置數據庫：
   - **Name**: `cardstrategy-mongodb`
   - **Database Name**: `cardstrategy`
   - **Plan**: 選擇適合的計劃

### 4. 部署

1. 點擊"Create Web Service"
2. RENDER將自動構建和部署您的應用程序
3. 等待部署完成，獲取服務URL

## 前端部署

### 1. 更新API配置

確保前端代碼中的API配置指向RENDER服務：

```typescript
// src/config/environment.ts
const production: Environment = {
  apiBaseUrl: 'https://your-api-service.onrender.com/api',
  // ... 其他配置
};
```

### 2. 構建和部署

#### 使用Expo
```bash
# 構建生產版本
expo build --platform all --release-channel production

# 或使用EAS Build
eas build --platform all --profile production
```

#### 使用RENDER部署前端（可選）
如果您想將前端也部署到RENDER：

1. 創建新的Web Service
2. 配置構建命令：`npm run build`
3. 配置啟動命令：`npm start`
4. 設置環境變量

## 自動部署

### 使用render.yaml

項目根目錄包含`render.yaml`文件，可以自動化部署：

```yaml
services:
  - type: web
    name: cardstrategy-api
    env: node
    plan: starter
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      # ... 其他環境變量

databases:
  - name: cardstrategy-mongodb
    databaseName: cardstrategy
    plan: starter
```

## 監控和維護

### 1. 健康檢查

API服務包含健康檢查端點：
```
GET https://your-api-service.onrender.com/health
```

### 2. 日誌監控

在RENDER控制台中查看：
- 實時日誌
- 錯誤報告
- 性能指標

### 3. 數據庫監控

- 連接狀態
- 查詢性能
- 存儲使用情況

## 安全考慮

### 1. 環境變量
- 不要在代碼中硬編碼敏感信息
- 使用RENDER的環境變量功能
- 定期輪換密鑰

### 2. CORS配置
確保`ALLOWED_ORIGINS`包含正確的前端域名

### 3. 速率限制
API已配置速率限制，防止濫用

### 4. 數據驗證
所有API端點都包含輸入驗證

## 故障排除

### 常見問題

1. **部署失敗**
   - 檢查構建日誌
   - 確認所有依賴都已安裝
   - 驗證環境變量

2. **數據庫連接失敗**
   - 檢查MongoDB URI
   - 確認網絡連接
   - 驗證數據庫憑證

3. **API請求失敗**
   - 檢查CORS配置
   - 驗證JWT令牌
   - 查看服務器日誌

### 調試技巧

1. 使用RENDER的實時日誌功能
2. 在開發環境中測試API
3. 使用Postman或類似工具測試端點

## 擴展和優化

### 1. 性能優化
- 啟用數據庫索引
- 實現緩存策略
- 優化查詢

### 2. 擴展
- 升級RENDER計劃
- 添加更多服務實例
- 實現負載均衡

### 3. 監控
- 設置告警
- 監控關鍵指標
- 定期備份數據

## 聯繫支持

如果遇到問題：
1. 查看RENDER文檔
2. 檢查應用程序日誌
3. 聯繫技術支持

---

**注意**: 請確保在生產環境中使用強密碼和安全的配置。定期更新依賴項和安全補丁。

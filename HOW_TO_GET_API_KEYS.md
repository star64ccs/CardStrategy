# 如何獲取各服務的 API Key 和配置信息

## 概述

本文檔詳細說明如何從各個免費服務獲取所需的 API Key、Token 和其他配置信息。

## 1. Mixpanel - 用戶行為分析

### 註冊步驟
1. 訪問 [Mixpanel 官網](https://mixpanel.com)
2. 點擊 "Sign Up" 註冊帳戶
3. 選擇免費計劃

### 獲取 Project Token
1. 登錄後點擊 "Create Project"
2. 項目名稱：CardStrategy
3. 選擇 "Web" 平台
4. 選擇 "JavaScript" 語言
5. 在設置過程中會顯示 Project Token
6. 複製這個 Token（格式：長字符串）

### 獲取 API Secret
1. 進入 Settings → API
2. 找到 "API Secret"
3. 複製這個 Secret

### 更新配置
```bash
node scripts/update-service-config.js mixpanel projectToken=YOUR_PROJECT_TOKEN apiSecret=YOUR_API_SECRET
```

## 2. SendGrid - 郵件發送服務

### 註冊步驟
1. 訪問 [SendGrid 官網](https://sendgrid.com)
2. 點擊 "Start for Free"
3. 填寫基本信息
4. 完成郵箱驗證

### 獲取 API Key
1. 登錄後進入 Settings → API Keys
2. 點擊 "Create API Key"
3. 選擇 "Full Access" 或 "Restricted Access"
4. 複製生成的 API Key（格式：SG.xxxxxxxxxxxxxxxxxxxxx）

### 驗證發件人域名
1. 進入 Settings → Sender Authentication
2. 選擇 "Domain Authentication"
3. 按照步驟配置 DNS 記錄
4. 等待驗證完成

### 更新配置
```bash
node scripts/update-service-config.js sendgrid apiKey=SG.YOUR_API_KEY
```

## 3. LogRocket - 前端錯誤監控

### 註冊步驟
1. 訪問 [LogRocket 官網](https://logrocket.com)
2. 點擊 "Start Free"
3. 選擇免費計劃

### 獲取 App ID
1. 登錄後點擊 "Create App"
2. 應用名稱：CardStrategy
3. 選擇 "Web" 平台
4. 選擇框架（React/Vue/Angular）
5. 在應用設置中找到 "App ID"
6. 複製這個 ID

### 更新配置
```bash
node scripts/update-service-config.js logrocket appId=YOUR_APP_ID
```

## 4. Slack - 團隊溝通通知

### 創建工作區
1. 訪問 [Slack 官網](https://slack.com)
2. 點擊 "Get Started"
3. 填寫工作區信息
4. 邀請團隊成員（可選）

### 創建 Slack 應用
1. 訪問 [Slack API 網站](https://api.slack.com/apps)
2. 點擊 "Create New App"
3. 選擇 "From scratch"
4. 應用名稱：CardStrategy
5. 選擇工作區

### 配置應用權限
1. 進入 "OAuth & Permissions"
2. 添加 Bot Token Scopes：
   - `chat:write`
   - `channels:read`
   - `users:read`
   - `incoming-webhook`
3. 安裝應用到工作區

### 獲取配置信息
1. **Bot User OAuth Token**：
   - 位置：OAuth & Permissions → Bot User OAuth Token
   - 格式：xoxb-xxxxxxxxxxxxxxxxxxxxx

2. **Signing Secret**：
   - 位置：Basic Information → Signing Secret
   - 格式：長字符串

3. **Incoming Webhook**：
   - 進入 "Incoming Webhooks"
   - 點擊 "Add New Webhook to Workspace"
   - 選擇頻道
   - 複製 Webhook URL（格式：https://hooks.slack.com/services/xxx/xxx/xxx）

### 更新配置
```bash
node scripts/update-service-config.js slack botToken=xoxb-YOUR_BOT_TOKEN signingSecret=YOUR_SIGNING_SECRET webhookUrl=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## 5. SMTP - 郵件發送

### Gmail SMTP 配置

#### 啟用兩步驗證
1. 登錄 Google 帳戶
2. 進入 [安全設置](https://myaccount.google.com/security)
3. 啟用兩步驗證

#### 生成應用密碼
1. 在安全設置中找到 "應用密碼"
2. 點擊 "生成新的應用密碼"
3. 選擇應用類型：郵件
4. 複製生成的應用密碼

#### SMTP 設置
- 主機：smtp.gmail.com
- 端口：587
- 安全：STARTTLS
- 用戶名：您的 Gmail 地址
- 密碼：應用密碼（不是登錄密碼）

### Outlook SMTP 配置
- 主機：smtp-mail.outlook.com
- 端口：587
- 安全：STARTTLS
- 用戶名：您的 Outlook 地址
- 密碼：登錄密碼

### 更新配置
```bash
# Gmail 示例
node scripts/update-service-config.js smtp host=smtp.gmail.com port=587 user=your-email@gmail.com pass=your-app-password

# Outlook 示例
node scripts/update-service-config.js smtp host=smtp-mail.outlook.com port=587 user=your-email@outlook.com pass=your-password
```

## 通用更新腳本使用

### 查看幫助
```bash
node scripts/update-service-config.js help
```

### 更新所有服務的示例
```bash
# Mixpanel
node scripts/update-service-config.js mixpanel projectToken=1234567890abcdef1234567890abcdef apiSecret=your-api-secret

# SendGrid
node scripts/update-service-config.js sendgrid apiKey=SG.your-api-key

# LogRocket
node scripts/update-service-config.js logrocket appId=your-app-id

# Slack
node scripts/update-service-config.js slack botToken=xoxb-your-bot-token signingSecret=your-signing-secret webhookUrl=https://hooks.slack.com/services/xxx/xxx/xxx

# SMTP
node scripts/update-service-config.js smtp host=smtp.gmail.com port=587 user=your-email@gmail.com pass=your-app-password
```

## 安全注意事項

### 保護敏感信息
1. **不要將 API Key 提交到 Git**：
   - 所有配置文件都受到 `.gitignore` 保護
   - 使用環境變量存儲敏感信息

2. **定期輪換 API Key**：
   - 定期檢查和更新 API Key
   - 及時撤銷不再使用的 Key

3. **監控使用量**：
   - 定期檢查各服務的使用情況
   - 避免超出免費限制

### 最佳實踐
1. **使用應用密碼**：
   - 對於 SMTP 服務，使用應用密碼而非登錄密碼
   - 啟用兩步驗證

2. **驗證域名**：
   - 對於郵件服務，驗證發件人域名
   - 配置 SPF、DKIM 記錄

3. **測試配置**：
   - 更新配置後立即測試
   - 確保服務正常工作

## 故障排除

### 常見問題
1. **API Key 無效**：
   - 檢查 Key 是否正確複製
   - 確認 Key 是否已激活
   - 檢查權限設置

2. **服務連接失敗**：
   - 檢查網絡連接
   - 確認防火牆設置
   - 檢查服務狀態

3. **超出免費限制**：
   - 監控使用量
   - 實現使用量控制
   - 考慮升級或切換服務

### 支持資源
- 各服務官方文檔
- 配置指南文檔
- 項目技術文檔

---

**最後更新**: 2025-08-21
**版本**: 1.0.0
**維護者**: CardStrategy 開發團隊

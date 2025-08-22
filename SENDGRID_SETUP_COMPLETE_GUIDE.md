# SendGrid 設置完整指南

## 📧 SendGrid 配置步驟

### 🔐 1. 完成域名驗證

#### 當前步驟：
1. **選擇 DNS 主機**：
   - 從下拉選單選擇您的域名服務商
   - 常見選項：Cloudflare, GoDaddy, Namecheap, Google Domains

2. **域名品牌設置**：
   - 保持選擇 "No"（推薦）
   - 這會使用 sendgrid.net 域名

3. **點擊 "Next" 繼續**

#### DNS 記錄設置：
SendGrid 會提供需要添加的 DNS 記錄，通常包括：
- **CNAME 記錄**：用於域名驗證
- **SPF 記錄**：防止郵件被標記為垃圾郵件
- **DKIM 記錄**：數字簽名驗證

### 🔑 2. 獲取 API Key

完成域名驗證後：

1. **進入 Settings → API Keys**
2. **點擊 "Create API Key"**
3. **選擇權限級別**：
   - **Restricted Access** (推薦)
   - 只需要 "Mail Send" 權限
4. **複製並保存 API Key**

### ⚙️ 3. 更新項目配置

使用我們的配置腳本：

```bash
node scripts/update-service-config.js sendgrid apiKey=YOUR_API_KEY
```

### 📧 4. 測試郵件發送

使用測試腳本驗證配置：

```bash
node scripts/test-sendgrid-service.js
```

## 🔧 集成到應用

### Node.js 示例：

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'test@example.com',
  from: 'noreply@yourdomain.com',
  subject: 'Test Email',
  text: 'Hello from SendGrid!',
  html: '<strong>Hello from SendGrid!</strong>',
};

sgMail.send(msg);
```

## 💡 最佳實踐

1. **安全性**：
   - 使用受限 API Key
   - 定期輪換 API Key
   - 不要在代碼中硬編碼 API Key

2. **發送限制**：
   - 免費版：100 郵件/天
   - 避免一次發送大量郵件
   - 實施郵件隊列

3. **內容優化**：
   - 避免垃圾郵件關鍵詞
   - 包含取消訂閱鏈接
   - 使用響應式郵件模板

## 🛠️ 故障排除

### 常見問題：

1. **域名驗證失敗**：
   - 檢查 DNS 記錄是否正確添加
   - 等待 DNS 傳播（最多 48 小時）
   - 使用 DNS 查詢工具驗證

2. **郵件未送達**：
   - 檢查收件箱的垃圾郵件文件夾
   - 驗證發件人郵箱地址
   - 檢查 SendGrid 活動日誌

3. **API 錯誤**：
   - 驗證 API Key 權限
   - 檢查請求格式
   - 查看 SendGrid 錯誤代碼文檔

## 📊 監控和分析

SendGrid 提供詳細的郵件統計：
- 發送量
- 開信率
- 點擊率
- 退信率
- 垃圾郵件報告

定期檢查這些指標以優化郵件效果。

---

需要幫助？請參考：
- SendGrid 官方文檔：https://docs.sendgrid.com
- 配置文件：src/config/ai-keys/sendgrid-config.json
- 測試腳本：scripts/test-sendgrid-service.js

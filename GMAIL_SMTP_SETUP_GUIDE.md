# Gmail SMTP 設置完整指南

## 📧 Gmail SMTP 配置步驟

### 🔐 1. 啟用 Gmail 兩步驗證

1. **登錄 Gmail 帳戶**
   - 訪問 https://myaccount.google.com
   - 登錄您的 Gmail 帳戶

2. **進入安全設置**
   - 點擊左側菜單的 "安全性"
   - 找到 "登錄 Google" 部分

3. **啟用兩步驗證**
   - 點擊 "兩步驗證"
   - 按照提示完成設置
   - 這一步是必需的，無法跳過

### 🔑 2. 生成應用密碼

1. **進入應用密碼設置**
   - 在兩步驗證頁面
   - 點擊 "應用密碼"

2. **創建新的應用密碼**
   - 選擇 "其他（自定義名稱）"
   - 輸入名稱：CardStrategy SMTP
   - 點擊 "生成"

3. **保存應用密碼**
   - 複製生成的 16 位密碼
   - 這個密碼只顯示一次，請務必保存

### ⚙️ 3. 更新項目配置

使用我們的配置腳本：

```bash
node scripts/update-service-config.js gmail-smtp user=YOUR_GMAIL@gmail.com pass=YOUR_APP_PASSWORD
```

### 📧 4. 測試郵件發送

使用測試腳本驗證配置：

```bash
node scripts/test-gmail-smtp.js
```

## 🔧 集成到應用

### Node.js 示例：

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const mailOptions = {
  from: process.env.GMAIL_USER,
  to: 'recipient@example.com',
  subject: 'Test Email',
  text: 'Hello from Gmail SMTP!'
};

transporter.sendMail(mailOptions);
```

## 💡 最佳實踐

1. **安全性**：
   - 使用應用密碼，不要使用 Gmail 密碼
   - 定期更換應用密碼
   - 不要在代碼中硬編碼密碼

2. **發送限制**：
   - 免費版：500 郵件/天
   - 避免一次發送大量郵件
   - 實施郵件隊列

3. **內容優化**：
   - 避免垃圾郵件關鍵詞
   - 包含取消訂閱鏈接
   - 使用響應式郵件模板

## 🛠️ 故障排除

### 常見問題：

1. **認證失敗**：
   - 確認已啟用兩步驗證
   - 檢查應用密碼是否正確
   - 確認 Gmail 帳戶沒有被鎖定

2. **郵件未送達**：
   - 檢查收件箱的垃圾郵件文件夾
   - 確認發件人郵箱地址正確
   - 檢查 Gmail 發送限制

3. **連接錯誤**：
   - 確認網絡連接正常
   - 檢查防火牆設置
   - 確認 SMTP 端口 587 開放

## 📊 監控和分析

Gmail 提供基本的發送統計：
- 發送量
- 退信率
- 垃圾郵件報告

定期檢查這些指標以優化郵件效果。

---

需要幫助？請參考：
- Gmail 官方文檔：https://support.google.com/mail
- 配置文件：src/config/ai-keys/gmail-smtp-config.json
- 測試腳本：scripts/test-gmail-smtp.js

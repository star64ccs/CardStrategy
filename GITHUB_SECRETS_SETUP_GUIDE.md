# 🔐 GitHub Secrets 設置指南

## 📋 **需要設置的 Secrets**

### **已完成的 Secrets (1-7)**
✅ **RENDER_TOKEN** - Render API Token  
✅ **RENDER_STAGING_SERVICE_ID** - Render 測試環境服務 ID  
✅ **DIGITALOCEAN_ACCESS_TOKEN** - DigitalOcean API Token  
✅ **DROPLET_ID** - DigitalOcean Droplet ID  
✅ **PRODUCTION_SSH_KEY** - 生產環境 SSH 私鑰  
✅ **PRODUCTION_USER** - 生產環境用戶名  
✅ **PRODUCTION_HOST** - 生產環境主機地址  

### **可選的 Secrets (8)**
⚠️ **SLACK_WEBHOOK_URL** - Slack 通知 Webhook (可選)

## 🚀 **設置方法**

### **步驟 1: 前往 GitHub 倉庫**
1. 打開瀏覽器，前往: https://github.com/star64ccs/CardStrategy
2. 點擊 **Settings** 標籤
3. 在左側菜單中點擊 **Secrets and variables** → **Actions**

### **步驟 2: 添加 Secrets**
1. 點擊 **New repository secret** 按鈕
2. 在 **Name** 欄位輸入 Secret 名稱
3. 在 **Value** 欄位輸入對應的值
4. 點擊 **Add secret** 保存

## 📊 **Secret 詳細說明**

### **RENDER_TOKEN**
- **用途**: 用於觸發 Render 自動部署
- **獲取方法**: 
  1. 登錄 Render 控制台: https://dashboard.render.com/
  2. 點擊右上角用戶頭像 → **Account Settings**
  3. 點擊 **API Keys** 標籤
  4. 點擊 **New API Key**
  5. 輸入名稱: `CardStrategy GitHub Actions`
  6. 複製生成的 Token

### **RENDER_STAGING_SERVICE_ID**
- **用途**: 指定要部署的 Render 服務
- **獲取方法**:
  1. 在 Render 控制台找到 `cardstrategy-api` 服務
  2. 點擊服務名稱進入詳情頁
  3. 在 URL 中找到服務 ID: `https://dashboard.render.com/web/srv-xxxxxxxxxxxx`
  4. 複製 `srv-xxxxxxxxxxxx` 部分

### **DIGITALOCEAN_ACCESS_TOKEN**
- **用途**: 用於 DigitalOcean API 操作
- **獲取方法**:
  1. 登錄 DigitalOcean 控制台: https://cloud.digitalocean.com/
  2. 點擊 **API** → **Tokens/Keys**
  3. 點擊 **Generate New Token**
  4. 輸入名稱: `CardStrategy Production`
  5. 選擇 **Write** 權限
  6. 複製生成的 Token

### **DROPLET_ID**
- **用途**: 指定要部署的 DigitalOcean Droplet
- **獲取方法**:
  1. 在 DigitalOcean 控制台點擊 **Droplets**
  2. 找到您的生產環境 Droplet
  3. 點擊 Droplet 名稱進入詳情頁
  4. 在 URL 中找到 ID: `https://cloud.digitalocean.com/droplets/xxxxxxxxxx`
  5. 複製數字 ID

### **PRODUCTION_SSH_KEY**
- **用途**: SSH 連接到生產服務器
- **獲取方法**:
  1. 運行: `npm run setup:ssh`
  2. 複製生成的私鑰內容
  3. 將私鑰添加到 DigitalOcean Droplet

### **PRODUCTION_USER**
- **用途**: SSH 連接用戶名
- **值**: `root` (DigitalOcean Droplet 默認用戶)

### **PRODUCTION_HOST**
- **用途**: 生產服務器 IP 地址
- **值**: `159.223.84.189` (您的 Droplet IP)

### **SLACK_WEBHOOK_URL** (可選)
- **用途**: 部署成功/失敗通知
- **獲取方法**:
  1. 在 Slack 中創建 Webhook
  2. 複製 Webhook URL

## 🔍 **驗證設置**

### **檢查 Secrets 是否正確設置**
```bash
# 檢查自動部署狀態
npm run check:auto-deploy

# 測試 API 連接
node scripts/test-api-connection.js

# 檢查服務狀態
npm run check:services
```

### **測試自動部署**
1. 推送代碼到 `develop` 分支
2. 檢查 GitHub Actions 是否觸發
3. 查看 Render 是否自動部署
4. 推送代碼到 `main` 分支
5. 檢查 DigitalOcean 是否自動部署

## 🚨 **安全注意事項**

### **保護 Secrets**
- ✅ 永遠不要在代碼中硬編碼 Secrets
- ✅ 定期輪換 API Tokens
- ✅ 使用最小權限原則
- ✅ 監控 API 使用情況

### **備份 Secrets**
- 📝 將所有 Secrets 保存在安全的密碼管理器中
- 📝 記錄每個 Secret 的用途和過期時間
- 📝 設置提醒以便及時更新

## 📞 **故障排除**

### **常見問題**

**Q: GitHub Actions 失敗，顯示 "Secret not found"**
A: 檢查 Secret 名稱是否正確，確保沒有多餘的空格

**Q: Render 部署失敗**
A: 檢查 RENDER_TOKEN 是否有效，RENDER_STAGING_SERVICE_ID 是否正確

**Q: DigitalOcean 部署失敗**
A: 檢查 DIGITALOCEAN_ACCESS_TOKEN 權限，DROPLET_ID 是否正確

**Q: SSH 連接失敗**
A: 確保 PRODUCTION_SSH_KEY 已添加到 DigitalOcean Droplet

### **獲取幫助**
- 📧 檢查 GitHub Actions 日誌
- 📧 查看 Render 部署日誌
- 📧 檢查 DigitalOcean 控制台

## ✅ **完成檢查清單**

- [ ] RENDER_TOKEN 已設置
- [ ] RENDER_STAGING_SERVICE_ID 已設置
- [ ] DIGITALOCEAN_ACCESS_TOKEN 已設置
- [ ] DROPLET_ID 已設置
- [ ] PRODUCTION_SSH_KEY 已設置
- [ ] PRODUCTION_USER 已設置
- [ ] PRODUCTION_HOST 已設置
- [ ] SLACK_WEBHOOK_URL 已設置 (可選)
- [ ] 測試 develop 分支部署
- [ ] 測試 main 分支部署

## 🎉 **完成後的效果**

設置完成後，您的專案將具備：
- ✅ 自動測試和部署
- ✅ 多環境部署 (Render 測試 + DigitalOcean 生產)
- ✅ 部署通知 (如果設置了 Slack)
- ✅ 完整的 CI/CD 流程

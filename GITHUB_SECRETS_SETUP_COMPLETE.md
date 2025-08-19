# 🔐 GitHub Secrets 完整設置指南

## **🎯 設置目標**

完成 GitHub Secrets 設置，實現自動部署到：
- **Render** (測試環境) - 當推送代碼到 `develop` 分支時
- **DigitalOcean** (生產環境) - 當推送代碼到 `main` 分支時

## **📋 需要設置的 Secrets**

### **1. RENDER_TOKEN**
- **用途**: 觸發 Render 自動部署
- **獲取方法**: 
  1. 登錄 Render 控制台: https://dashboard.render.com/
  2. 點擊右上角用戶頭像 → **Account Settings**
  3. 點擊 **API Keys** 標籤
  4. 點擊 **New API Key**
  5. 輸入名稱: `CardStrategy GitHub Actions`
  6. 複製生成的 Token

### **2. RENDER_STAGING_SERVICE_ID**
- **用途**: 指定要部署的 Render 服務
- **獲取方法**:
  1. 在 Render 控制台找到 `cardstrategy-api` 服務
  2. 點擊服務名稱進入詳情頁
  3. 在 URL 中找到服務 ID: `https://dashboard.render.com/web/srv-xxxxxxxxxxxx`
  4. 複製 `srv-xxxxxxxxxxxx` 部分

### **3. DIGITALOCEAN_ACCESS_TOKEN**
- **用途**: 用於 DigitalOcean API 操作
- **獲取方法**:
  1. 登錄 DigitalOcean 控制台: https://cloud.digitalocean.com/
  2. 點擊 **API** → **Tokens/Keys**
  3. 點擊 **Generate New Token**
  4. 輸入名稱: `CardStrategy Production`
  5. 選擇 **Write** 權限
  6. 複製生成的 Token

### **4. DROPLET_ID**
- **用途**: 指定要部署的 DigitalOcean Droplet
- **值**: `您的 Droplet ID` (從 DigitalOcean 控制台獲取)
- **獲取方法**:
  1. 在 DigitalOcean 控制台點擊 **Droplets**
  2. 找到您的生產環境 Droplet
  3. 點擊 Droplet 名稱進入詳情頁
  4. 在 URL 中找到 ID: `https://cloud.digitalocean.com/droplets/xxxxxxxxxx`
  5. 複製數字 ID

### **5. PRODUCTION_SSH_KEY**
- **用途**: SSH 連接到生產服務器
- **值**: 
```
-----BEGIN OPENSSH PRIVATE KEY-----
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
-----END OPENSSH PRIVATE KEY-----
```

### **6. PRODUCTION_USER**
- **用途**: SSH 連接用戶名
- **值**: `root`

### **7. PRODUCTION_HOST**
- **用途**: 生產服務器 IP 地址
- **值**: `159.223.84.189`

### **8. SLACK_WEBHOOK_URL** (可選)
- **用途**: 部署成功/失敗通知
- **獲取方法**:
  1. 在 Slack 中創建 Webhook
  2. 複製 Webhook URL

## **🚀 設置步驟**

### **步驟 1: 前往 GitHub 倉庫**
1. 打開瀏覽器，前往: https://github.com/star64ccs/CardStrategy
2. 點擊 **Settings** 標籤
3. 在左側菜單中點擊 **Secrets and variables** → **Actions**

### **步驟 2: 添加 Secrets**
1. 點擊 **New repository secret** 按鈕
2. 在 **Name** 欄位輸入 Secret 名稱
3. 在 **Value** 欄位輸入對應的值
4. 點擊 **Add secret** 保存

### **步驟 3: 添加所有 Secrets**

按照以下順序添加：

| Secret 名稱 | 值 | 說明 |
|-------------|-----|------|
| `RENDER_TOKEN` | [從 Render 獲取] | Render API Token |
| `RENDER_STAGING_SERVICE_ID` | [從 Render 獲取] | Render 服務 ID |
| `DIGITALOCEAN_ACCESS_TOKEN` | [從 DigitalOcean 獲取] | DigitalOcean API Token |
| `DROPLET_ID` | [從 DigitalOcean 獲取] | Droplet ID |
| `PRODUCTION_SSH_KEY` | [上面的私鑰內容] | SSH 私鑰 |
| `PRODUCTION_USER` | `root` | SSH 用戶名 |
| `PRODUCTION_HOST` | `159.223.84.189` | 服務器 IP |
| `SLACK_WEBHOOK_URL` | [可選] | Slack 通知 |

## **🔍 驗證設置**

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
1. **測試 Render 部署**:
   ```bash
   # 推送代碼到 develop 分支
   git checkout develop
   git add .
   git commit -m "test: 測試 Render 自動部署"
   git push origin develop
   ```

2. **測試 DigitalOcean 部署**:
   ```bash
   # 推送代碼到 main 分支
   git checkout main
   git merge develop
   git push origin main
   ```

## **📊 部署流程**

### **develop 分支推送**
```
推送代碼 → GitHub Actions → 運行測試 → 部署到 Render (測試環境)
```

### **main 分支推送**
```
推送代碼 → GitHub Actions → 運行測試 → 部署到 DigitalOcean (生產環境)
```

## **✅ 完成檢查清單**

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

## **🎉 完成後的效果**

設置完成後，您的專案將具備：
- ✅ 自動測試和部署
- ✅ 多環境部署 (Render 測試 + DigitalOcean 生產)
- ✅ 部署通知 (如果設置了 Slack)
- ✅ 完整的 CI/CD 流程

## **🚨 安全注意事項**

### **保護 Secrets**
- ✅ 永遠不要在代碼中硬編碼 Secrets
- ✅ 定期輪換 API Tokens
- ✅ 使用最小權限原則
- ✅ 監控 API 使用情況

### **備份 Secrets**
- 📝 將所有 Secrets 保存在安全的密碼管理器中
- 📝 記錄每個 Secret 的用途和過期時間
- 📝 設置提醒以便及時更新

## **📞 故障排除**

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

---

**🎯 現在開始設置 GitHub Secrets，完成您的自動部署流程！**

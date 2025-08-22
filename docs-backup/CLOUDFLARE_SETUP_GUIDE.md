# 🌐 Cloudflare 設置指南 - cardstrategyapp.com

## 📊 當前狀態

✅ **已完成**:

- 域名 `cardstrategyapp.com` 已添加到 Cloudflare
- 狀態: `✓ Active`
- 計劃: `Free`
- 唯一訪客: 321

⚠️ **待完成**:

- API Token 配置
- DNS 記錄設置
- SSL/TLS 配置
- 性能優化設置

## 🚀 快速設置步驟

### 第一步：獲取 Cloudflare API Token

1. **登錄 Cloudflare 控制台**

   - 訪問 https://dash.cloudflare.com
   - 使用您的賬號登錄

2. **創建 API Token**

   - 點擊右上角個人頭像 → "My Profile"
   - 左側菜單選擇 "API Tokens"
   - 點擊 "Create Token"

3. **選擇 Token 模板**

   - 選擇 "Custom token"
   - 或者使用 "Edit zone DNS" 模板

4. **設置權限**

   ```
   Permissions:
   - Zone:Zone:Read (所有區域)
   - Zone:DNS:Edit (所有區域)
   - Zone:Zone Settings:Edit (所有區域)
   - Zone:Page Rules:Edit (所有區域)
   ```

5. **設置 Zone Resources**

   ```
   Include: Specific zone
   Zone: cardstrategyapp.com
   ```

6. **創建 Token**
   - 點擊 "Continue to summary"
   - 點擊 "Create Token"
   - **重要**: 複製並保存 Token，它只會顯示一次！

### 第二步：獲取 Zone ID

1. **在 Cloudflare 控制台**
   - 選擇您的域名 `cardstrategyapp.com`
   - 在右側邊欄找到 "Zone ID"
   - 複製這個 ID

### 第三步：設置環境變數

在您的系統中設置以下環境變數：

```bash
# Cloudflare 配置
export CLOUDFLARE_API_TOKEN="your-api-token-here"
export CLOUDFLARE_ZONE_ID="your-zone-id-here"

# DigitalOcean Droplet IP (用於 DNS 記錄)
export DROPLET_IP="your-droplet-ip-here"
```

### 第四步：運行自動配置腳本

```bash
# 安裝依賴 (如果還沒有)
npm install axios

# 運行 Cloudflare 配置腳本
npm run setup:cloudflare
```

## 🔧 手動配置選項

如果您想手動配置，請按照以下步驟：

### 1. DNS 記錄配置

在 Cloudflare DNS 設置中添加以下記錄：

| 類型  | 名稱 | 內容                | 代理狀態  |
| ----- | ---- | ------------------- | --------- |
| A     | @    | YOUR_DROPLET_IP     | ✅ 已代理 |
| CNAME | www  | cardstrategyapp.com | ✅ 已代理 |
| CNAME | api  | cardstrategyapp.com | ✅ 已代理 |
| CNAME | cdn  | cardstrategyapp.com | ✅ 已代理 |

### 2. SSL/TLS 設置

1. **加密模式**: 設置為 "Full (strict)"
2. **Always Use HTTPS**: 啟用
3. **最低 TLS 版本**: 設置為 1.2

### 3. 頁面規則配置

#### 規則 1: API 端點 (不緩存)

```
URL: api.cardstrategyapp.com/*
設置:
- Cache Level: Bypass
- SSL: Full
- Security Level: Medium
```

#### 規則 2: 靜態資源 (緩存)

```
URL: cardstrategyapp.com/*
設置:
- Cache Level: Standard
- Edge Cache TTL: 4 hours
- Browser Cache TTL: 1 hour
```

### 4. 安全設置

1. **安全級別**: Medium
2. **HSTS**: 啟用
   - Max Age: 31536000 (1 年)
   - Include Subdomains: 啟用
   - Preload: 啟用

### 5. 性能優化

啟用以下功能：

- ✅ Auto Minify (JavaScript, CSS, HTML)
- ✅ Brotli Compression
- ✅ Early Hints
- ✅ HTTP/2 Server Push
- ✅ Rocket Loader
- ✅ Polish (Lossy)
- ✅ WebP

## 🔍 驗證配置

### 檢查 DNS 解析

```bash
# 檢查主域名
nslookup cardstrategyapp.com

# 檢查子域名
nslookup www.cardstrategyapp.com
nslookup api.cardstrategyapp.com
nslookup cdn.cardstrategyapp.com
```

### 檢查 SSL 證書

```bash
# 檢查 SSL 證書
openssl s_client -connect cardstrategyapp.com:443 -servername cardstrategyapp.com
```

### 檢查性能

```bash
# 使用 curl 測試響應時間
curl -w "@curl-format.txt" -o /dev/null -s "https://cardstrategyapp.com"
```

## 📋 配置檢查清單

- [ ] API Token 已創建並保存
- [ ] Zone ID 已獲取
- [ ] 環境變數已設置
- [ ] DNS 記錄已配置
- [ ] SSL/TLS 設置完成
- [ ] 頁面規則已創建
- [ ] 安全設置已配置
- [ ] 性能優化已啟用
- [ ] 域名可以正常訪問
- [ ] HTTPS 重定向正常
- [ ] 子域名可以訪問

## 🚨 故障排除

### 常見問題

1. **API Token 權限不足**

   ```
   錯誤: 403 Forbidden
   解決: 檢查 Token 權限，確保包含所有必要的權限
   ```

2. **Zone ID 錯誤**

   ```
   錯誤: Zone not found
   解決: 確認 Zone ID 正確，域名在您的賬號下
   ```

3. **DNS 記錄衝突**

   ```
   錯誤: Record already exists
   解決: 刪除現有記錄或使用不同的名稱
   ```

4. **SSL 證書問題**
   ```
   錯誤: SSL certificate error
   解決: 確保 DigitalOcean Droplet 配置了 SSL 證書
   ```

### 調試命令

```bash
# 檢查環境變數
echo $CLOUDFLARE_API_TOKEN
echo $CLOUDFLARE_ZONE_ID
echo $DROPLET_IP

# 測試 API 連接
curl -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID"
```

## 📞 支持

### Cloudflare 支持

- **文檔**: https://developers.cloudflare.com/
- **社區**: https://community.cloudflare.com/
- **支持**: https://support.cloudflare.com/

### 相關文檔

- **API 文檔**: https://api.cloudflare.com/
- **DNS 設置**: https://developers.cloudflare.com/dns/
- **SSL/TLS**: https://developers.cloudflare.com/ssl/

## 🎉 完成後的效果

配置完成後，您的域名將具備：

✅ **安全性**

- 免費 SSL 證書
- DDoS 防護
- WAF 保護
- HSTS 強制 HTTPS

✅ **性能**

- 全球 CDN 加速
- 圖片優化
- 代碼壓縮
- HTTP/2/3 支持

✅ **可用性**

- 99.9% 可用性保證
- 自動故障轉移
- 負載均衡

您的 `cardstrategyapp.com` 將成為一個高性能、安全的生產級域名！

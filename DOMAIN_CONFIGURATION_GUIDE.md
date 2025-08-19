# CardStrategy 域名配置指南

## 🌐 **域名信息**
- **域名**: cardstrategyapp.com
- **註冊商**: Cloudflare
- **狀態**: 已購買並激活

## 📋 **DNS 配置步驟**

### 1. **A 記錄配置**
在 Cloudflare 控制面板中添加以下 A 記錄：

| 類型 | 名稱 | 內容 | TTL | 代理狀態 |
|------|------|------|-----|----------|
| A | @ | [您的服務器IP] | Auto | 已代理 |
| A | www | [您的服務器IP] | Auto | 已代理 |
| A | api | [您的服務器IP] | Auto | 已代理 |

### 2. **CNAME 記錄配置**
| 類型 | 名稱 | 內容 | TTL | 代理狀態 |
|------|------|------|-----|----------|
| CNAME | www | cardstrategyapp.com | Auto | 已代理 |

### 3. **MX 記錄配置 (郵件服務)**
| 類型 | 名稱 | 內容 | 優先級 | TTL | 代理狀態 |
|------|------|------|--------|-----|----------|
| MX | @ | mail.cardstrategyapp.com | 10 | Auto | 已代理 |

## 🔧 **SSL/TLS 配置**

### 1. **SSL/TLS 模式**
- 設置為: **Full (strict)**
- 確保所有流量都通過 HTTPS

### 2. **始終使用 HTTPS**
- 啟用: **Always Use HTTPS**
- 啟用: **HSTS (HTTP Strict Transport Security)**

## 🛡️ **安全配置**

### 1. **防火牆規則**
在 Cloudflare 中配置以下防火牆規則：

```javascript
// 允許 API 請求
(http.request.uri.path contains "/api/") and (ip.src ne 127.0.0.1)

// 阻止惡意請求
(http.request.uri.path contains "wp-admin") or (http.request.uri.path contains "phpmyadmin")

// 限制請求頻率
(http.request.uri.path contains "/api/") and (http.rate_limit > 100)
```

### 2. **速率限制**
- API 端點: 100 請求/分鐘
- 登錄端點: 5 請求/分鐘
- 一般頁面: 1000 請求/分鐘

## 📊 **性能優化**

### 1. **緩存配置**
- 靜態資源: 1 天
- API 響應: 5 分鐘
- 圖片: 7 天

### 2. **壓縮**
- 啟用: **Brotli 壓縮**
- 啟用: **Gzip 壓縮**

## 🔄 **下一步操作**

1. **配置服務器**
   - 設置 Nginx 反向代理
   - 配置 SSL 證書
   - 設置環境變數

2. **部署應用程序**
   - 上傳代碼到服務器
   - 配置 PM2 進程管理
   - 設置數據庫連接

3. **監控和維護**
   - 設置日誌監控
   - 配置備份策略
   - 設置性能監控

## 📞 **技術支持**

如果遇到配置問題，請參考：
- Cloudflare 文檔: https://developers.cloudflare.com/
- 我們的部署指南: DEPLOYMENT.md
- 生產配置指南: PRODUCTION_CONFIGURATION_GUIDE.md

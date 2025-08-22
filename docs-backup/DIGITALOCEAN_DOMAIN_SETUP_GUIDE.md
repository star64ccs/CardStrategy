# 🌐 DigitalOcean 域名配置指南

## 📋 **當前狀態**

### ✅ **已完成的配置**

- **Cloudflare 域名**: `cardstrategyapp.com` 已配置
- **Cloudflare API Token**: 已設置
- **Zone ID**: `ceadb25b709450bbd450ad7cbd03bb68`
- **Droplet IP**: `159.223.84.189`

### ❌ **需要完成的配置**

- **DNS 記錄**: 需要配置 `api.cardstrategy.com` 指向 DigitalOcean Droplet
- **SSL 證書**: 需要配置 SSL/TLS 證書
- **域名驗證**: 需要測試域名解析

## 🚀 **配置步驟**

### **步驟 1: 配置 Cloudflare DNS 記錄**

#### **方法 A: 使用自動化腳本**

```bash
# 運行 Cloudflare 配置腳本
npm run setup:cloudflare
```

#### **方法 B: 手動配置**

1. 登錄 Cloudflare 控制台: https://dash.cloudflare.com/
2. 選擇域名: `cardstrategyapp.com`
3. 點擊 **DNS** 標籤
4. 添加以下 DNS 記錄:

| 類型  | 名稱 | 內容                    | 代理狀態  |
| ----- | ---- | ----------------------- | --------- |
| A     | api  | 159.223.84.189          | ✅ 已代理 |
| A     | www  | 159.223.84.189          | ✅ 已代理 |
| A     | @    | 159.223.84.189          | ✅ 已代理 |
| CNAME | cdn  | api.cardstrategyapp.com | ✅ 已代理 |

### **步驟 2: 配置 SSL/TLS 設置**

1. 在 Cloudflare 控制台點擊 **SSL/TLS** 標籤
2. 設置 **加密模式** 為: **Full (strict)**
3. 在 **邊緣證書** 中啟用:
   - ✅ **始終使用 HTTPS**
   - ✅ **最低 TLS 版本**: TLS 1.2
   - ✅ **機會性加密**
   - ✅ **TLS 1.3**

### **步驟 3: 配置頁面規則**

#### **API 路由規則**

1. 點擊 **頁面規則** 標籤
2. 創建新規則:
   - **URL**: `api.cardstrategyapp.com/*`
   - **設置**:
     - ✅ **緩存級別**: 繞過
     - ✅ **SSL**: 始終使用 HTTPS
     - ✅ **安全級別**: 高

#### **前端路由規則**

1. 創建新規則:
   - **URL**: `cardstrategyapp.com/*`
   - **設置**:
     - ✅ **緩存級別**: 標準
     - ✅ **SSL**: 始終使用 HTTPS
     - ✅ **安全級別**: 中

### **步驟 4: 配置安全設置**

#### **WAF (Web Application Firewall)**

1. 點擊 **安全** → **WAF**
2. 啟用 **托管規則集**
3. 配置自定義規則:
   - 阻止惡意 IP
   - 限制 API 請求頻率
   - 保護敏感端點

#### **速率限制**

1. 點擊 **安全** → **速率限制**
2. 創建規則:
   - **表達式**: `(http.request.uri.path contains "/api/")`
   - **請求數**: 100
   - **時間窗口**: 1 分鐘
   - **操作**: 阻止

## 🔍 **驗證配置**

### **測試域名解析**

```bash
# 測試 API 域名解析
nslookup api.cardstrategyapp.com

# 測試主域名解析
nslookup cardstrategyapp.com

# 測試 HTTPS 連接
curl -I https://api.cardstrategyapp.com/api/health
```

### **測試 API 連接**

```bash
# 運行 API 連接測試
node scripts/test-api-connection.js
```

### **檢查 SSL 證書**

```bash
# 檢查 SSL 證書
openssl s_client -connect api.cardstrategyapp.com:443 -servername api.cardstrategyapp.com
```

## 📊 **預期結果**

### **成功配置後**

- ✅ `api.cardstrategyapp.com` 解析到 `159.223.84.189`
- ✅ HTTPS 連接正常
- ✅ SSL 證書有效
- ✅ API 端點可訪問
- ✅ 安全設置生效

### **測試端點**

- **健康檢查**: https://api.cardstrategyapp.com/api/health
- **版本信息**: https://api.cardstrategyapp.com/api/version
- **前端應用**: https://cardstrategyapp.com

## 🚨 **故障排除**

### **常見問題**

**Q: 域名無法解析**
A:

1. 檢查 DNS 記錄是否正確
2. 等待 DNS 傳播 (最多 24 小時)
3. 清除本地 DNS 緩存

**Q: HTTPS 連接失敗**
A:

1. 檢查 SSL/TLS 設置
2. 確保使用 Full (strict) 模式
3. 檢查 DigitalOcean Droplet 配置

**Q: API 端點無法訪問**
A:

1. 檢查 DigitalOcean Droplet 是否運行
2. 檢查防火牆設置
3. 檢查 Nginx 配置

### **調試命令**

```bash
# 檢查 DNS 解析
dig api.cardstrategyapp.com

# 檢查端口開放
telnet api.cardstrategyapp.com 443

# 檢查 HTTP 響應
curl -v https://api.cardstrategyapp.com/api/health
```

## 🔧 **DigitalOcean Droplet 配置**

### **確保 Droplet 正確配置**

1. **Nginx 配置**: 確保正確代理 API 請求
2. **防火牆設置**: 開放 80, 443, 3000 端口
3. **SSL 證書**: 配置 Let's Encrypt 證書
4. **域名配置**: 設置 server_name

### **Nginx 配置示例**

```nginx
server {
    listen 80;
    server_name api.cardstrategyapp.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.cardstrategyapp.com;

    ssl_certificate /etc/letsencrypt/live/api.cardstrategyapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.cardstrategyapp.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## ✅ **完成檢查清單**

- [ ] DNS 記錄已配置
- [ ] SSL/TLS 設置完成
- [ ] 頁面規則已創建
- [ ] 安全設置已配置
- [ ] 域名解析測試通過
- [ ] HTTPS 連接測試通過
- [ ] API 端點可訪問
- [ ] 前端應用可訪問

## 🎉 **完成後的效果**

配置完成後，您將擁有：

- ✅ 完整的域名系統
- ✅ 安全的 HTTPS 連接
- ✅ 高性能的 CDN
- ✅ 強大的安全防護
- ✅ 專業的 SSL 證書

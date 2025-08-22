# Cloudflare 配置指南

## 1. DNS 設置

### 添加域名記錄

在 Cloudflare DNS 設置中添加以下記錄：

```
A     @      YOUR_DROPLET_IP     Auto
CNAME www    cardstrategy.com    Auto
CNAME api    cardstrategy.com    Auto
```

### 設置子域名

- `cardstrategy.com` - 主網站
- `api.cardstrategy.com` - API 服務
- `cdn.cardstrategy.com` - 靜態資源

## 2. SSL/TLS 設置

### 加密模式

- 設置為 "Full (strict)"
- 啟用 "Always Use HTTPS"
- 啟用 "Minimum TLS Version" 為 1.2

### 證書設置

- 啟用 "Opportunistic Encryption"
- 啟用 "TLS 1.3"
- 啟用 "Automatic HTTPS Rewrites"

## 3. 緩存設置

### 頁面規則

創建以下頁面規則：

```
URL: api.cardstrategy.com/*
設置:
- Cache Level: Bypass
- SSL: Full
- Security Level: Medium
```

```
URL: cardstrategy.com/*
設置:
- Cache Level: Standard
- Edge Cache TTL: 4 hours
- Browser Cache TTL: 1 hour
```

## 4. 安全設置

### 防火牆規則

```
規則名稱: Block Suspicious Requests
表達式: (http.request.method eq "POST" and http.request.uri contains "/api/auth") and (ip.src in $suspicious_ips or http.user_agent contains "bot")
動作: Block
```

### 速率限制

```
規則名稱: API Rate Limiting
表達式: http.request.uri contains "/api/"
動作: Challenge (Captcha)
速率: 100 requests per 10 minutes
```

## 5. 性能優化

### 啟用功能

- ✅ Auto Minify (JavaScript, CSS, HTML)
- ✅ Brotli Compression
- ✅ Early Hints
- ✅ HTTP/2 Server Push
- ✅ Rocket Loader
- ✅ Minify JavaScript
- ✅ Minify CSS
- ✅ Minify HTML

### 圖片優化

- ✅ Polish (Lossy)
- ✅ WebP
- ✅ Image Resizing

## 6. 監控設置

### 分析

- 啟用 Web Analytics
- 設置自定義事件追蹤
- 配置錯誤監控

### 日誌

- 啟用 Logpush
- 設置日誌保留期為 30 天
- 配置日誌格式

## 7. Workers (可選)

### API 代理 Worker

```javascript
addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // API 請求代理到後端
  if (url.pathname.startsWith('/api/')) {
    const apiUrl = `https://api.cardstrategy.com${url.pathname}${url.search}`;
    return fetch(apiUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
  }

  // 靜態資源緩存
  return fetch(request);
}
```

## 8. 環境變數設置

在 Cloudflare 中設置以下環境變數：

```bash
# 在 Cloudflare Workers 或 Pages 中設置
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ZONE_ID=your_zone_id
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

## 9. 測試檢查清單

- [ ] DNS 解析正常
- [ ] SSL 證書有效
- [ ] HTTPS 重定向正常
- [ ] API 端點可訪問
- [ ] 緩存策略生效
- [ ] 安全規則正常
- [ ] 性能優化生效
- [ ] 監控數據正常

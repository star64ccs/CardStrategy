# CardStrategy 生產環境配置指南

## 🌐 **域名配置**
- **主域名**: cardstrategyapp.com
- **API 子域名**: api.cardstrategyapp.com
- **管理後台**: admin.cardstrategyapp.com
- **CDN**: cdn.cardstrategyapp.com

## 🖥️ **服務器配置**

### 1. **服務器規格建議**
- **CPU**: 2-4 核心
- **內存**: 4-8 GB RAM
- **存儲**: 50-100 GB SSD
- **帶寬**: 1-5 Mbps
- **操作系統**: Ubuntu 24.04 LTS (推薦) 或 Ubuntu 22.04 LTS

### 2. **推薦服務器提供商**
- **DigitalOcean**: 性價比高，適合初創
- **AWS EC2**: 功能豐富，可擴展性強
- **Google Cloud**: 性能優異，AI 集成
- **Vultr**: 價格實惠，全球節點

### 3. **DigitalOcean 具體配置**
```
操作系統: Ubuntu 24.04 (LTS) x64
計劃: Basic
CPU: 2 vCPUs
內存: 2 GB RAM
存儲: 50 GB SSD
數據中心: 選擇離您最近的區域
```

## 🔧 **環境變數配置**

創建 `.env` 文件：

```bash
# ==================== 服務器配置 ====================
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# ==================== 域名配置 ====================
DOMAIN=cardstrategyapp.com
API_DOMAIN=api.cardstrategyapp.com
ADMIN_DOMAIN=admin.cardstrategyapp.com
CDN_DOMAIN=cdn.cardstrategyapp.com

# ==================== 數據庫配置 ====================
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=cardstrategy
POSTGRES_USER=cardstrategy_user
POSTGRES_PASSWORD=your-secure-postgres-password
POSTGRES_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}

# ==================== Redis 配置 ====================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-redis-password
REDIS_URL=redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}

# ==================== JWT配置 ====================
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_REFRESH_EXPIRE=7d

# ==================== 跨域配置 ====================
ALLOWED_ORIGINS=https://cardstrategyapp.com,https://www.cardstrategyapp.com,https://api.cardstrategyapp.com

# ==================== 郵件配置 ====================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# ==================== 雲存儲配置 ====================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ==================== 第三方API配置 ====================
OPENAI_API_KEY=your-openai-api-key
GOOGLE_PALM_API_KEY=your-google-palm-api-key
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
COHERE_API_KEY=your-cohere-api-key
HUGGING_FACE_API_KEY=your-hugging-face-api-key

# ==================== 支付配置 ====================
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# ==================== 短信配置 ====================
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# ==================== 日誌配置 ====================
LOG_LEVEL=info
LOG_FILE_PATH=logs

# ==================== 安全配置 ====================
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ==================== 文件上傳配置 ====================
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

## 🛡️ **SSL/TLS 證書配置**

### 1. **Let's Encrypt 證書**
```bash
# 更新系統
sudo apt update && sudo apt upgrade -y

# 安裝 Certbot
sudo apt install certbot python3-certbot-nginx

# 獲取證書
sudo certbot --nginx -d cardstrategyapp.com -d www.cardstrategyapp.com -d api.cardstrategyapp.com

# 自動續期
sudo crontab -e
# 添加以下行
0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. **Nginx SSL 配置**
```nginx
server {
    listen 80;
    server_name cardstrategyapp.com www.cardstrategyapp.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cardstrategyapp.com www.cardstrategyapp.com;
    
    ssl_certificate /etc/letsencrypt/live/cardstrategyapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cardstrategyapp.com/privkey.pem;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全頭部
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # 反向代理到 Node.js 應用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API 路由
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # API 緩存配置
        proxy_cache api_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_valid 404 1m;
    }
    
    # 靜態文件
    location /static/ {
        alias /var/www/cardstrategy/static/;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
    
    # 圖片文件
    location /uploads/ {
        alias /var/www/cardstrategy/uploads/;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔄 **部署腳本**

### 1. **部署腳本 (deploy.sh)**
```bash
#!/bin/bash

# CardStrategy 部署腳本
echo "🚀 開始部署 CardStrategy 應用程序..."

# 更新代碼
echo "📥 更新代碼..."
git pull origin main

# 安裝依賴
echo "📦 安裝依賴..."
npm ci --production

# 構建應用程序
echo "🔨 構建應用程序..."
npm run build

# 重啟 PM2 進程
echo "🔄 重啟應用程序..."
pm2 restart cardstrategy

# 檢查狀態
echo "✅ 檢查部署狀態..."
pm2 status

echo "🎉 部署完成！"
echo "🌐 訪問地址: https://cardstrategyapp.com"
```

### 2. **PM2 配置 (ecosystem.config.js)**
```javascript
module.exports = {
  apps: [{
    name: 'cardstrategy',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

## 📊 **監控配置**

### 1. **日誌監控**
```bash
# 安裝 PM2 日誌管理
pm2 install pm2-logrotate

# 配置日誌輪轉
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### 2. **性能監控**
```bash
# 安裝 PM2 監控
pm2 install pm2-server-monit
```

## 🔒 **安全配置**

### 1. **防火牆配置**
```bash
# 安裝 UFW
sudo apt install ufw

# 配置防火牆規則
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. **數據庫安全**
```sql
-- 創建專用用戶
CREATE USER cardstrategy_user WITH PASSWORD 'your-secure-password';

-- 授予權限
GRANT CONNECT ON DATABASE cardstrategy TO cardstrategy_user;
GRANT USAGE ON SCHEMA public TO cardstrategy_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO cardstrategy_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO cardstrategy_user;

-- 限制連接
ALTER USER cardstrategy_user CONNECTION LIMIT 10;
```

## 📋 **部署檢查清單**

- [ ] 服務器已購買並配置 (Ubuntu 24.04 LTS)
- [ ] 域名 DNS 記錄已設置
- [ ] SSL 證書已安裝
- [ ] 環境變數已配置
- [ ] 數據庫已設置
- [ ] 應用程序已部署
- [ ] PM2 進程管理已配置
- [ ] 日誌監控已設置
- [ ] 防火牆已配置
- [ ] 備份策略已實施

## 🚀 **啟動命令**

```bash
# 啟動應用程序
pm2 start ecosystem.config.js --env production

# 查看狀態
pm2 status

# 查看日誌
pm2 logs cardstrategy

# 重啟應用程序
pm2 restart cardstrategy

# 停止應用程序
pm2 stop cardstrategy
```

## 📞 **技術支持**

如果遇到問題，請檢查：
1. 日誌文件: `logs/combined.log`
2. PM2 狀態: `pm2 status`
3. 服務器資源: `htop`
4. 網絡連接: `netstat -tulpn`

# 🔧 DigitalOcean Droplet 配置指南

## **概述**

本指南將幫助您配置 DigitalOcean Droplet 作為生產環境服務器。

## **前提條件**

- ✅ DigitalOcean 賬戶
- ✅ Droplet IP: `159.223.84.189`
- ✅ SSH 密鑰已生成
- ✅ Cloudflare 域名已配置

## **步驟 1: 添加 SSH 公鑰到 DigitalOcean**

### **1.1 登錄 DigitalOcean 控制台**
1. 前往: https://cloud.digitalocean.com/
2. 使用您的賬戶登錄

### **1.2 添加 SSH 密鑰**
1. 點擊左側導航中的 **"Settings"** → **"Security"**
2. 點擊 **"SSH Keys"** 標籤
3. 點擊 **"Add SSH Key"**

### **1.3 輸入密鑰信息**
- **Name**: `CardStrategy Production`
- **SSH Key content**: 貼上以下公鑰內容：

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCpFTwYuZee5txkOZB7dUH5/wMzUJIVa6f/kMkocXBOuMuNwyB5J3QN0jZXaK4Uai9WdQOZxzwOU0MwLmv6Zsk7DMFrDs8/uBZhdKiLVY0pCDDP+fq+YdcoRjXKsVs660wR0YNlEz1p6X6HnmfAD9c+J2V4ocyJW12OprZrtzmfGg0sxhyKFlho5/oybcwMYZS4Stobhw3DStDzKnmlWJRCds8DCD3HUJnTlmkg6ODJiK4uJYtfZtTEPH3+JFT7b3tErXQ7OcrfxExy7d2bsedVlOlMIPZXEt/m/CX/RDVdiS/zhcX4SCjVtNUMMtmWwdgAqXLUhcIyrRKs103vOKr5d1thhmvplQCO5uav4it9+oA9IJ3GgM3dGC7xSU/AcyqqmRhSH7Syl896BZImLPwU/yWMhzxRCzPg603aIcLrwpjeFH5OvsHQ7uVRPfFYkXMzMH5ZxB9Jhghis8UiDM/UgPFGgQNfkQwZGW94ltU3Fs510KCuuUhgJFW9pJMDQK4zETK/oVJw5gOmOdH4LgOxENdFxMmc3ESEa9idetAGy2E4WyuI9TBtVtH3jdv92j470FipTkrA0riCd1W1mLSX1Wuvif5CJF5AOa1yo5HOdHRDRXmGi4vwBfz/IwM2deDSFss/nCexzq/RMszPSzfkiGYX91bVXR2DO4qE0iLnXw== cardstrategy@digitalocean.com
```

4. 點擊 **"Add SSH Key"**

## **步驟 2: 連接到 Droplet**

### **2.1 使用 SSH 連接**
```bash
ssh -i "C:\Users\user\.ssh\cardstrategy_digitalocean" root@159.223.84.189
```

### **2.2 首次連接確認**
- 系統會詢問是否信任主機，輸入 `yes`
- 如果連接成功，您會看到 Droplet 的命令行界面

## **步驟 3: 系統更新和基礎配置**

### **3.1 更新系統**
```bash
# 更新包列表
apt update

# 升級系統
apt upgrade -y

# 安裝必要的軟件
apt install -y nginx certbot python3-certbot-nginx ufw git curl wget
```

### **3.2 配置防火牆**
```bash
# 啟用 UFW
ufw enable

# 允許 SSH
ufw allow ssh

# 允許 HTTP
ufw allow 80

# 允許 HTTPS
ufw allow 443

# 檢查防火牆狀態
ufw status
```

## **步驟 4: 配置 Nginx**

### **4.1 創建 Nginx 配置**
```bash
# 備份默認配置
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# 創建新的配置文件
nano /etc/nginx/sites-available/cardstrategy
```

### **4.2 添加 Nginx 配置內容**
```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name api.cardstrategyapp.com cardstrategyapp.com www.cardstrategyapp.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name api.cardstrategyapp.com;

    # SSL 證書 (稍後配置)
    # ssl_certificate /etc/letsencrypt/live/api.cardstrategyapp.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.cardstrategyapp.com/privkey.pem;

    # 安全設置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # 日誌
    access_log /var/log/nginx/api.access.log;
    error_log /var/log/nginx/api.error.log;

    # API 代理
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超時設置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康檢查端點
    location /health {
        proxy_pass http://localhost:3000/api/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 前端應用配置
server {
    listen 443 ssl http2;
    server_name cardstrategyapp.com www.cardstrategyapp.com;

    # SSL 證書 (稍後配置)
    # ssl_certificate /etc/letsencrypt/live/cardstrategyapp.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/cardstrategyapp.com/privkey.pem;

    # 安全設置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # 日誌
    access_log /var/log/nginx/frontend.access.log;
    error_log /var/log/nginx/frontend.error.log;

    # 靜態文件服務
    root /var/www/cardstrategy;
    index index.html;

    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 靜態資源緩存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### **4.3 啟用配置**
```bash
# 啟用新配置
ln -s /etc/nginx/sites-available/cardstrategy /etc/nginx/sites-enabled/

# 移除默認配置
rm /etc/nginx/sites-enabled/default

# 測試 Nginx 配置
nginx -t

# 重啟 Nginx
systemctl restart nginx
systemctl enable nginx
```

## **步驟 5: 配置 SSL 證書**

### **5.1 獲取 Let's Encrypt 證書**
```bash
# 為 API 域名獲取證書
certbot --nginx -d api.cardstrategyapp.com

# 為前端域名獲取證書
certbot --nginx -d cardstrategyapp.com -d www.cardstrategyapp.com
```

### **5.2 設置自動續期**
```bash
# 測試自動續期
certbot renew --dry-run

# 添加到 crontab
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

## **步驟 6: 部署應用**

### **6.1 創建應用目錄**
```bash
# 創建應用目錄
mkdir -p /opt/cardstrategy
cd /opt/cardstrategy

# 克隆代碼
git clone https://github.com/star64ccs/CardStrategy.git .
```

### **6.2 安裝 Node.js**
```bash
# 安裝 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 驗證安裝
node --version
npm --version
```

### **6.3 安裝應用依賴**
```bash
# 安裝依賴
npm install

# 構建應用
npm run build
```

### **6.4 配置環境變數**
```bash
# 創建環境文件
nano /opt/cardstrategy/.env.production
```

添加以下內容：
```bash
NODE_ENV=production
PORT=3000
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=cardstrategy
DB_USER=cardstrategy_user
DB_PASSWORD=your-database-password
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
JWT_SECRET=your-jwt-secret
```

### **6.5 配置 PM2**
```bash
# 安裝 PM2
npm install -g pm2

# 創建 PM2 配置文件
nano /opt/cardstrategy/ecosystem.config.js
```

添加以下內容：
```javascript
module.exports = {
  apps: [{
    name: 'cardstrategy-api',
    script: 'backend/src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.production',
    log_file: '/var/log/cardstrategy/combined.log',
    out_file: '/var/log/cardstrategy/out.log',
    error_file: '/var/log/cardstrategy/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

### **6.6 啟動應用**
```bash
# 創建日誌目錄
mkdir -p /var/log/cardstrategy

# 啟動應用
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 設置開機自啟
pm2 startup
```

## **步驟 7: 測試配置**

### **7.1 測試 API 端點**
```bash
# 測試健康檢查
curl -I https://api.cardstrategyapp.com/api/health

# 測試主頁
curl -I https://cardstrategyapp.com
```

### **7.2 檢查服務狀態**
```bash
# 檢查 Nginx 狀態
systemctl status nginx

# 檢查 PM2 狀態
pm2 status

# 檢查防火牆狀態
ufw status
```

## **步驟 8: 監控和維護**

### **8.1 設置日誌輪轉**
```bash
# 創建日誌輪轉配置
nano /etc/logrotate.d/cardstrategy
```

添加以下內容：
```
/var/log/cardstrategy/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        pm2 reloadLogs
    endscript
}
```

### **8.2 設置監控**
```bash
# 安裝監控工具
apt install -y htop iotop

# 設置系統監控
nano /etc/systemd/system/cardstrategy-monitor.service
```

## **故障排除**

### **常見問題**

1. **SSL 證書問題**
   ```bash
   # 檢查證書狀態
   certbot certificates
   
   # 重新獲取證書
   certbot --nginx -d api.cardstrategyapp.com --force-renewal
   ```

2. **Nginx 配置問題**
   ```bash
   # 檢查配置語法
   nginx -t
   
   # 重新加載配置
   systemctl reload nginx
   ```

3. **應用啟動問題**
   ```bash
   # 查看應用日誌
   pm2 logs cardstrategy-api
   
   # 重啟應用
   pm2 restart cardstrategy-api
   ```

## **完成檢查清單**

- [ ] SSH 密鑰已添加到 DigitalOcean
- [ ] 成功連接到 Droplet
- [ ] 系統已更新
- [ ] 防火牆已配置
- [ ] Nginx 已安裝和配置
- [ ] SSL 證書已獲取
- [ ] 應用已部署
- [ ] PM2 已配置
- [ ] 所有服務正常運行
- [ ] 域名可以正常訪問

## **下一步**

完成 Droplet 配置後，您可以：

1. **設置 GitHub Secrets** - 完成自動部署
2. **測試自動部署流程** - 推送代碼測試
3. **配置監控系統** - 設置告警和監控

恭喜！您的 DigitalOcean Droplet 配置完成！

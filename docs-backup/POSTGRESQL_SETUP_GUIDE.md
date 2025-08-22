# 🗄️ PostgreSQL 生產環境配置指南

## 📋 配置概覽

本指南詳細說明如何為 CardStrategy 專案配置 PostgreSQL 生產環境。

---

## 🚀 1. PostgreSQL 服務器配置

### 1.1 如果您使用雲端 PostgreSQL 服務

#### **AWS RDS PostgreSQL**

```bash
# 配置參數
引擎: PostgreSQL 15
實例類型: db.t3.micro (免費層) 或 db.t3.small
存儲: 20GB SSD
多可用區: 否 (免費層)
備份保留: 7天
維護窗口: 選擇合適時間

# 連接信息
主機: your-db-instance.region.rds.amazonaws.com
端口: 5432
數據庫名稱: cardstrategy
用戶名: cardstrategy_user
密碼: your-secure-password
```

#### **Google Cloud SQL PostgreSQL**

```bash
# 配置參數
版本: PostgreSQL 15
機器類型: db-f1-micro (免費層) 或 db-g1-small
存儲: 10GB SSD
備份: 啟用
高可用性: 否 (免費層)

# 連接信息
主機: your-instance-ip
端口: 5432
數據庫名稱: cardstrategy
用戶名: cardstrategy_user
密碼: your-secure-password
```

#### **DigitalOcean Managed Databases**

```bash
# 配置參數
版本: PostgreSQL 15
計劃: Basic ($15/月)
存儲: 25GB SSD
節點: 1個
備份: 自動備份

# 連接信息
主機: your-db-host.digitalocean.com
端口: 25060
數據庫名稱: cardstrategy
用戶名: doadmin
密碼: your-secure-password
```

### 1.2 如果您自建 PostgreSQL 服務器

#### **Ubuntu 服務器安裝**

```bash
# 更新系統
sudo apt update && sudo apt upgrade -y

# 安裝 PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# 啟動服務
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 檢查狀態
sudo systemctl status postgresql
```

---

## 🔧 2. 數據庫初始配置

### 2.1 創建數據庫和用戶

```sql
-- 連接到 PostgreSQL
sudo -u postgres psql

-- 創建數據庫
CREATE DATABASE cardstrategy;

-- 創建用戶
CREATE USER cardstrategy_user WITH PASSWORD 'your-secure-password';

-- 授予權限
GRANT ALL PRIVILEGES ON DATABASE cardstrategy TO cardstrategy_user;

-- 創建必要的擴展
\c cardstrategy
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- 退出
\q
```

### 2.2 配置 PostgreSQL 連接

#### **編輯 PostgreSQL 配置**

```bash
# 編輯 postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf

# 添加或修改以下配置
listen_addresses = '*'
port = 5432
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

#### **配置客戶端認證**

```bash
# 編輯 pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# 添加以下行 (允許密碼認證)
host    cardstrategy    cardstrategy_user    0.0.0.0/0    md5
host    cardstrategy    cardstrategy_user    ::/0         md5

# 重啟 PostgreSQL
sudo systemctl restart postgresql
```

---

## 🔐 3. 安全配置

### 3.1 防火牆配置

```bash
# 配置 UFW 防火牆
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 5432/tcp  # PostgreSQL (僅在內網使用)

# 檢查防火牆狀態
sudo ufw status
```

### 3.2 SSL 配置 (推薦)

```bash
# 生成 SSL 證書
sudo mkdir -p /etc/ssl/certs/postgresql
cd /etc/ssl/certs/postgresql

# 生成自簽名證書
sudo openssl req -new -x509 -days 365 -nodes -text -out server.crt -keyout server.key -subj "/CN=your-db-host"

# 設置權限
sudo chmod 600 server.key
sudo chown postgres:postgres server.key server.crt

# 編輯 postgresql.conf 啟用 SSL
sudo nano /etc/postgresql/15/main/postgresql.conf

# 添加以下配置
ssl = on
ssl_cert_file = '/etc/ssl/certs/postgresql/server.crt'
ssl_key_file = '/etc/ssl/certs/postgresql/server.key'

# 重啟 PostgreSQL
sudo systemctl restart postgresql
```

---

## 📊 4. 性能優化配置

### 4.1 內存配置

```sql
-- 連接到 PostgreSQL
sudo -u postgres psql

-- 查看當前配置
SHOW shared_buffers;
SHOW effective_cache_size;
SHOW work_mem;

-- 優化配置 (根據服務器內存調整)
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- 重新加載配置
SELECT pg_reload_conf();
```

### 4.2 索引優化

```sql
-- 創建常用索引
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_cards_name ON cards USING gin(to_tsvector('english', name));
CREATE INDEX CONCURRENTLY idx_cards_created_at ON cards(created_at);
CREATE INDEX CONCURRENTLY idx_collections_user_id ON collections(user_id);
CREATE INDEX CONCURRENTLY idx_investments_user_id ON investments(user_id);
```

---

## 🔄 5. 數據庫遷移

### 5.1 運行遷移腳本

```bash
# 進入後端目錄
cd backend

# 安裝依賴
npm install

# 運行遷移
npm run migrate:production

# 驗證遷移
npm run db:verify
```

### 5.2 創建初始數據

```sql
-- 連接到數據庫
psql -h your-host -U cardstrategy_user -d cardstrategy

-- 創建初始管理員用戶
INSERT INTO users (email, password, role, is_active, created_at)
VALUES ('admin@cardstrategy.com', '$2b$12$your-hashed-password', 'admin', true, NOW());

-- 創建初始配置
INSERT INTO system_configs (key, value, created_at)
VALUES
('app_name', 'CardStrategy', NOW()),
('app_version', '3.1.0', NOW()),
('maintenance_mode', 'false', NOW());
```

---

## 📈 6. 監控和維護

### 6.1 備份配置

```bash
# 創建備份腳本
sudo nano /usr/local/bin/backup_postgresql.sh

#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="cardstrategy"
DB_USER="cardstrategy_user"

# 創建備份目錄
mkdir -p $BACKUP_DIR

# 執行備份
pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_DIR/cardstrategy_$DATE.sql

# 壓縮備份
gzip $BACKUP_DIR/cardstrategy_$DATE.sql

# 刪除7天前的備份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# 設置執行權限
sudo chmod +x /usr/local/bin/backup_postgresql.sh

# 添加到 crontab (每天凌晨2點備份)
sudo crontab -e
# 添加以下行
0 2 * * * /usr/local/bin/backup_postgresql.sh
```

### 6.2 性能監控

```sql
-- 查看數據庫大小
SELECT pg_size_pretty(pg_database_size('cardstrategy'));

-- 查看表大小
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 查看連接數
SELECT count(*) FROM pg_stat_activity;

-- 查看慢查詢
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## 🔍 7. 連接測試

### 7.1 測試數據庫連接

```bash
# 使用 psql 測試連接
psql -h your-host -U cardstrategy_user -d cardstrategy

# 測試查詢
SELECT version();
SELECT current_database();
SELECT current_user;

# 退出
\q
```

### 7.2 應用程序連接測試

```bash
# 創建測試腳本
nano test-db-connection.js

const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ 數據庫連接成功');

    const result = await client.query('SELECT version()');
    console.log('PostgreSQL 版本:', result.rows[0].version);

    await client.end();
  } catch (error) {
    console.error('❌ 數據庫連接失敗:', error.message);
  }
}

testConnection();

# 運行測試
node test-db-connection.js
```

---

## 🚨 8. 故障排除

### 8.1 常見問題

#### **連接被拒絕**

```bash
# 檢查 PostgreSQL 是否運行
sudo systemctl status postgresql

# 檢查端口是否監聽
sudo netstat -tlnp | grep 5432

# 檢查防火牆
sudo ufw status
```

#### **認證失敗**

```bash
# 檢查 pg_hba.conf 配置
sudo cat /etc/postgresql/15/main/pg_hba.conf

# 重新加載配置
sudo systemctl reload postgresql
```

#### **內存不足**

```bash
# 檢查系統內存
free -h

# 調整 PostgreSQL 內存配置
sudo nano /etc/postgresql/15/main/postgresql.conf
# 減少 shared_buffers 和 effective_cache_size
```

---

## 📝 9. 環境變數配置

### 9.1 創建生產環境變數文件

```bash
# 創建 .env 文件
nano backend/.env

# 添加以下配置
NODE_ENV=production
PORT=3000

# PostgreSQL 配置
POSTGRES_HOST=your-postgres-host
POSTGRES_PORT=5432
POSTGRES_DB=cardstrategy
POSTGRES_USER=cardstrategy_user
POSTGRES_PASSWORD=your-secure-password
POSTGRES_URL=postgresql://cardstrategy_user:your-secure-password@your-postgres-host:5432/cardstrategy

# 其他配置...
```

---

## ✅ 10. 驗證清單

### 10.1 配置完成檢查

- [ ] PostgreSQL 服務器已安裝並運行
- [ ] 數據庫和用戶已創建
- [ ] 權限已正確設置
- [ ] SSL 證書已配置 (可選)
- [ ] 防火牆已配置
- [ ] 性能優化已應用
- [ ] 備份腳本已設置
- [ ] 連接測試已通過
- [ ] 環境變數已配置
- [ ] 數據庫遷移已執行

---

**配置完成後，您的 PostgreSQL 數據庫將具備生產環境的安全性和性能。**

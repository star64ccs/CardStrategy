# 🔧 Redis 設置指南

## 📋 **概述**

Redis 連接失敗是因為本地環境沒有運行 Redis 服務。以下是幾種解決方案：

## 🚀 **解決方案選項**

### **選項 1: 跳過本地 Redis 檢查 (推薦)**

如果您不需要在本地運行 Redis，可以設置環境變數跳過檢查：

```bash
# 在 PowerShell 中設置環境變數
$env:SKIP_LOCAL_SERVICES="true"

# 然後運行檢查
npm run check:services
```

或者在 `.env` 文件中添加：

```bash
SKIP_LOCAL_SERVICES=true
```

### **選項 2: 使用 Docker Desktop**

1. **啟動 Docker Desktop**

   - 在 Windows 開始菜單中搜索 "Docker Desktop"
   - 啟動應用程序
   - 等待 Docker 引擎完全啟動

2. **運行 Redis 容器**

   ```bash
   docker run -d --name redis-cardstrategy -p 6379:6379 redis:7-alpine
   ```

3. **設置本地環境變數**
   ```bash
   # 在 .env 文件中添加
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   ```

### **選項 3: 使用 Docker Compose**

如果 Docker Desktop 已運行：

```bash
# 啟動 Redis 服務
docker-compose up redis -d

# 檢查狀態
docker-compose ps
```

### **選項 4: 安裝 Windows 版本的 Redis**

1. **下載 Redis for Windows**

   - 前往: https://github.com/microsoftarchive/redis/releases
   - 下載最新版本的 Redis-x64-xxx.msi

2. **安裝 Redis**

   - 運行下載的 .msi 文件
   - 按照安裝嚮導完成安裝

3. **啟動 Redis 服務**

   ```bash
   # 啟動 Redis 服務
   net start Redis

   # 或者手動啟動
   redis-server
   ```

## 🔍 **驗證設置**

設置完成後，運行以下命令驗證：

```bash
# 檢查服務狀態
npm run check:services

# 或者直接測試 Redis 連接
redis-cli ping
```

## 📊 **預期結果**

### **成功設置後**:

```
🔍 檢查 Redis 連接...
✅ Redis 連接成功
📊 Redis 版本: 7.x.x
✅ Redis 讀寫測試通過
```

### **跳過檢查後**:

```
🔍 檢查 Redis 連接...
⚠️  跳過 Redis 檢查 - 設置了 SKIP_LOCAL_SERVICES
```

## 💡 **建議**

- **開發環境**: 使用選項 1 (跳過檢查) 最簡單
- **測試環境**: 使用選項 2 (Docker) 最靈活
- **生產環境**: 使用選項 4 (Windows 服務) 最穩定

## 🚨 **故障排除**

### **Docker 連接問題**:

```bash
# 檢查 Docker 是否運行
docker --version
docker ps

# 重啟 Docker Desktop
# 然後重新運行容器
```

### **端口衝突**:

```bash
# 檢查端口是否被佔用
netstat -an | findstr :6379

# 如果端口被佔用，使用不同端口
docker run -d --name redis-cardstrategy -p 6380:6379 redis:7-alpine
```

### **權限問題**:

```bash
# 以管理員身份運行 PowerShell
# 然後執行 Docker 命令
```

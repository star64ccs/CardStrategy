# 🧪 Render 測試環境處理指南

## 📋 **概述**

Render 作為您的**測試/開發環境**，用於：
- 🧪 **功能測試** - 新功能開發和測試
- 🔍 **集成測試** - 數據庫和服務集成測試
- 👥 **團隊協作** - 開發團隊共享測試環境
- 🚀 **預發布** - 生產環境部署前的驗證

## 🏗️ **環境架構**

### **Render 服務配置**
```
cardstrategy-api (後端 API)
├── 環境: Node.js
├── 計劃: Free
├── 自動部署: 是
└── 健康檢查: /api/health

cardstrategy-frontend (前端)
├── 環境: Static Site
├── 計劃: Free
├── 自動部署: 是
└── API 端點: https://cardstrategy-api.onrender.com/api

cardstrategy-postgres (數據庫)
├── 類型: PostgreSQL
├── 計劃: Free
└── 數據庫名: cardstrategy

cardstrategy-redis (緩存)
├── 類型: Redis
└── 計劃: Free
```

## 🔄 **部署流程**

### **1. 開發分支部署 (develop)**
```bash
# 推送到 develop 分支
git push origin develop

# GitHub Actions 自動觸發
# 1. 運行測試
# 2. 部署到 Render
# 3. 健康檢查
```

### **2. 生產分支部署 (main)**
```bash
# 合併到 main 分支
git merge develop
git push origin main

# GitHub Actions 自動觸發
# 1. 運行測試
# 2. 部署到 DigitalOcean (生產)
# 3. 健康檢查
```

## 🛠️ **環境變數配置**

### **Render 控制台設置**
在 Render 控制台中設置以下環境變數：

```bash
# 基本配置
NODE_ENV=staging
PORT=3000

# 數據庫配置 (自動從服務獲取)
DB_HOST=cardstrategy-postgres
DB_PORT=5432
DB_NAME=cardstrategy
DB_USER=cardstrategy_user
DB_PASSWORD=<自動生成>

# Redis 配置 (自動從服務獲取)
REDIS_HOST=cardstrategy-redis
REDIS_PORT=6379
REDIS_PASSWORD=<自動生成>

# JWT 配置
JWT_SECRET=<自動生成>
JWT_EXPIRE=24h

# CORS 配置
CORS_ORIGIN=https://cardstrategy-frontend.onrender.com

# 其他配置
UPLOAD_PATH=/app/uploads
LOG_PATH=/app/logs
MODEL_PATH=/app/models
EXPORT_PATH=/app/exports
```

## 📊 **測試環境 URL**

### **服務端點**
- 🌐 **前端**: https://cardstrategy-frontend.onrender.com
- 🔧 **API**: https://cardstrategy-api.onrender.com
- 📊 **健康檢查**: https://cardstrategy-api.onrender.com/api/health

### **API 端點**
```
GET  /api/health          # 健康檢查
GET  /api/status          # 服務狀態
GET  /api/db/test         # 數據庫測試
POST /api/auth/login      # 用戶登錄
GET  /api/cards           # 卡片列表
GET  /api/collections     # 收藏列表
GET  /api/investments     # 投資列表
GET  /api/market          # 市場數據
POST /api/ai/analyze      # AI 分析
```

## 🔍 **測試和驗證**

### **1. 自動化測試**
```bash
# 運行測試套件
npm run test:ci

# 運行特定測試
npm run test:unit
npm run test:integration
npm run test:e2e
```

### **2. 手動測試**
```bash
# 健康檢查
curl https://cardstrategy-api.onrender.com/api/health

# 數據庫連接測試
curl https://cardstrategy-api.onrender.com/api/db/test

# API 端點測試
curl https://cardstrategy-api.onrender.com/api/status
```

### **3. 性能測試**
```bash
# 使用 Apache Bench 測試
ab -n 100 -c 10 https://cardstrategy-api.onrender.com/api/health

# 使用 wrk 測試
wrk -t12 -c400 -d30s https://cardstrategy-api.onrender.com/api/health
```

## 🚨 **監控和警報**

### **健康檢查**
- **端點**: `/api/health`
- **頻率**: 每 30 秒
- **超時**: 10 秒
- **重試**: 3 次

### **日誌監控**
```bash
# 查看應用日誌
# 在 Render 控制台 -> Services -> cardstrategy-api -> Logs

# 常見日誌級別
INFO  - 正常操作
WARN  - 警告信息
ERROR - 錯誤信息
DEBUG - 調試信息
```

### **性能指標**
- **響應時間**: < 500ms
- **可用性**: > 99.9%
- **錯誤率**: < 0.1%

## 🔧 **故障排除**

### **常見問題**

#### **1. 部署失敗**
```bash
# 檢查構建日誌
# Render 控制台 -> Services -> Build Logs

# 常見原因
- 依賴安裝失敗
- 構建腳本錯誤
- 環境變數缺失
```

#### **2. 數據庫連接問題**
```bash
# 檢查數據庫狀態
# Render 控制台 -> Databases -> cardstrategy-postgres

# 測試連接
curl https://cardstrategy-api.onrender.com/api/db/test
```

#### **3. Redis 連接問題**
```bash
# 檢查 Redis 狀態
# Render 控制台 -> Redis -> cardstrategy-redis

# 測試連接
curl https://cardstrategy-api.onrender.com/api/redis/test
```

### **調試步驟**
1. **檢查日誌** - 查看應用和服務日誌
2. **驗證配置** - 檢查環境變數和服務配置
3. **測試端點** - 手動測試 API 端點
4. **重啟服務** - 在 Render 控制台重啟服務

## 📈 **最佳實踐**

### **1. 開發流程**
```bash
# 1. 創建功能分支
git checkout -b feature/new-feature

# 2. 開發和測試
npm run test
npm run lint

# 3. 推送到 develop 分支
git push origin develop

# 4. 自動部署到 Render
# 5. 驗證功能
# 6. 合併到 main 分支
```

### **2. 數據管理**
- **測試數據**: 使用專門的測試數據集
- **數據備份**: 定期備份測試數據庫
- **數據清理**: 定期清理測試數據

### **3. 安全考慮**
- **環境隔離**: 測試環境與生產環境完全隔離
- **敏感數據**: 不要在測試環境使用生產敏感數據
- **訪問控制**: 限制測試環境的訪問權限

## 🎯 **下一步行動**

### **立即需要完成的配置**

1. **設置 GitHub Secrets**
   ```bash
   RENDER_TOKEN=<您的 Render API Token>
   RENDER_STAGING_SERVICE_ID=<您的 Render 服務 ID>
   ```

2. **配置環境變數**
   - 在 Render 控制台設置所有必要的環境變數
   - 確保服務間的正確連接

3. **測試部署流程**
   ```bash
   # 推送到 develop 分支測試
   git push origin develop
   ```

4. **驗證服務**
   - 檢查所有服務是否正常運行
   - 測試 API 端點
   - 驗證數據庫連接

### **可選優化**

1. **監控設置**
   - 設置 Uptime Robot 監控
   - 配置錯誤追蹤 (Sentry)
   - 設置性能監控

2. **自動化測試**
   - 設置端到端測試
   - 配置性能測試
   - 設置安全掃描

3. **文檔更新**
   - 更新 API 文檔
   - 創建部署文檔
   - 設置故障排除指南

## 📞 **支持資源**

- **Render 文檔**: https://render.com/docs
- **GitHub Actions**: https://docs.github.com/en/actions
- **Node.js 文檔**: https://nodejs.org/docs
- **PostgreSQL 文檔**: https://www.postgresql.org/docs
- **Redis 文檔**: https://redis.io/documentation

---

**🎉 您的 Render 測試環境已經配置完成！現在可以開始進行開發和測試了。**

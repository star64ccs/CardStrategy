# CardStrategy 部署和 DevOps 實施總結

## 概述

本文檔總結了 CardStrategy 專案的部署和 DevOps 系統的完整實施，包括容器化部署、CI/CD 流程、環境配置管理、備份策略和監控告警系統。

## 實施的功能模組

### 1. Docker 容器化

#### 1.1 後端 Dockerfile
- **文件**: `backend/Dockerfile`
- **功能**: 
  - 基於 Node.js 18-alpine 鏡像
  - 安裝系統依賴（Python3, make, g++, PostgreSQL 客戶端, Redis）
  - 創建非 root 用戶（nodejs）
  - 設置工作目錄和權限
  - 配置健康檢查
  - 暴露端口 3000

#### 1.2 健康檢查腳本
- **文件**: `backend/healthcheck.js`
- **功能**:
  - HTTP GET 請求到 `/api/health` 端點
  - 超時設置為 2 秒
  - 返回狀態碼 0（成功）或 1（失敗）

#### 1.3 Docker Compose 配置
- **文件**: `docker-compose.yml`
- **服務**:
  - `postgres`: PostgreSQL 15 數據庫
  - `redis`: Redis 7 緩存
  - `backend`: Node.js API 服務
  - `nginx`: 反向代理和負載均衡
  - `prometheus`: 監控指標收集
  - `grafana`: 監控儀表板
  - `elasticsearch`: 日誌存儲
  - `logstash`: 日誌處理
  - `kibana`: 日誌可視化
  - `backup`: 備份服務

### 2. CI/CD 流程

#### 2.1 GitHub Actions 工作流
- **文件**: `.github/workflows/deploy.yml`
- **階段**:
  - **測試階段**: 代碼檢查、單元測試、集成測試、性能測試
  - **安全階段**: npm audit、Snyk 安全掃描
  - **構建階段**: Docker 鏡像構建和推送到 GHCR
  - **部署階段**: SSH 到服務器、拉取代碼、重啟服務
  - **回滾階段**: 部署失敗時自動回滾

#### 2.2 環境配置管理
- **文件**: `backend/src/config/environments.js`
- **功能**:
  - 支持多環境配置（development, test, staging, production）
  - 自動加載對應的 .env 文件
  - 配置驗證和默認值設置
  - 環境特定的設置（數據庫、Redis、JWT、安全等）

### 3. 備份策略

#### 3.1 備份服務
- **文件**: `backend/src/services/backupService.js`
- **功能**:
  - 數據庫備份（使用 pg_dump）
  - 文件備份（uploads, models, exports）
  - 完整備份（數據庫 + 文件）
  - 備份恢復功能
  - 備份保留策略
  - 備份統計和清理

#### 3.2 數據庫初始化腳本
- **文件**: `init-db.sql`
- **功能**:
  - 創建數據庫和用戶
  - 創建所有必要的表（users, cards, investments, market_data, ai_predictions, model_persistence, alerts, system_logs, performance_metrics, backup_records）
  - 創建索引和觸發器
  - 插入初始數據和管理員帳戶
  - 設置權限和視圖

### 4. 監控告警系統

#### 4.1 警報服務
- **文件**: `backend/src/services/alertService.js`
- **功能**:
  - 系統指標監控（CPU, 記憶體, 磁碟, 響應時間, 錯誤率, 數據庫連接）
  - 多種通知渠道（郵件, Slack, Webhook, SMS）
  - 警報嚴重程度分類（info, warning, critical）
  - 重複警報檢測
  - 警報歷史記錄和統計
  - 手動警報觸發
  - 閾值動態調整

#### 4.2 警報 API 路由
- **文件**: `backend/src/routes/alerts.js`
- **端點**:
  - `GET /api/alerts`: 獲取當前警報列表
  - `GET /api/alerts/history`: 獲取警報歷史
  - `GET /api/alerts/stats`: 獲取警報統計
  - `POST /api/alerts/trigger`: 手動觸發警報
  - `PUT /api/alerts/thresholds`: 更新警報閾值
  - `GET /api/alerts/thresholds`: 獲取當前閾值
  - `DELETE /api/alerts/clear`: 清除已解決的警報
  - `DELETE /api/alerts/:id`: 刪除特定警報
  - `POST /api/alerts/test`: 測試警報通知

### 5. 監控配置

#### 5.1 Prometheus 配置
- **文件**: `prometheus/prometheus.yml`
- **功能**:
  - 多服務監控（後端, 數據庫, Redis, Nginx）
  - 自定義指標收集
  - 服務發現配置
  - 標籤重寫規則
  - 遠程讀寫配置
  - 存儲和查詢配置

#### 5.2 Prometheus 告警規則
- **文件**: `prometheus/alert_rules.yml`
- **警報類型**:
  - 服務可用性警報
  - 系統資源警報（CPU, 記憶體, 磁碟）
  - 數據庫警報（連接數, 慢查詢）
  - Redis 警報（記憶體使用, 連接錯誤）
  - 應用程序警報（錯誤率, 響應時間）
  - 容器警報（資源使用, 重啟）
  - 網絡警報（錯誤率）
  - 業務指標警報（用戶活躍度, 卡牌掃描失敗率）
  - 外部服務警報
  - 備份警報
  - 監控告警

#### 5.3 Grafana 儀表板
- **文件**: `grafana/dashboards/cardstrategy-overview.json`
- **面板**:
  - 系統健康狀態
  - CPU 和記憶體使用率
  - HTTP 請求率和響應時間
  - 錯誤率監控
  - 數據庫連接數
  - Redis 記憶體使用
  - 容器資源使用
  - 活躍警報列表

### 6. 部署腳本

#### 6.1 自動化部署腳本
- **文件**: `scripts/deploy.sh`
- **功能**:
  - 環境變量檢查
  - 數據庫備份
  - Docker 鏡像構建
  - 服務停止和啟動
  - 服務就緒等待
  - 數據庫遷移
  - 測試執行
  - 健康檢查
  - 鏡像清理
  - 部署信息顯示

## 技術棧

### 容器化技術
- **Docker**: 容器化應用程序
- **Docker Compose**: 多服務編排
- **Alpine Linux**: 輕量級基礎鏡像

### CI/CD 工具
- **GitHub Actions**: 自動化工作流
- **Docker Hub/GHCR**: 容器鏡像倉庫
- **SSH**: 遠程部署

### 監控工具
- **Prometheus**: 指標收集和告警
- **Grafana**: 監控儀表板
- **ELK Stack**: 日誌管理
  - Elasticsearch: 日誌存儲
  - Logstash: 日誌處理
  - Kibana: 日誌可視化

### 備份工具
- **pg_dump**: PostgreSQL 備份
- **tar**: 文件備份
- **cron**: 定時備份

### 部署工具
- **Nginx**: 反向代理和負載均衡
- **PM2**: Node.js 進程管理
- **Let's Encrypt**: SSL 證書

## 安全特性

### 容器安全
- 非 root 用戶運行
- 最小化基礎鏡像
- 健康檢查機制
- 資源限制

### 網絡安全
- HTTPS 強制重定向
- 安全標頭配置
- 速率限制
- IP 白名單

### 數據安全
- 數據庫備份加密
- 敏感信息環境變量
- 訪問權限控制
- 審計日誌

## 性能優化

### 容器優化
- 多階段構建
- 鏡像層緩存
- 資源限制
- 健康檢查

### 監控優化
- 指標聚合
- 數據保留策略
- 查詢優化
- 告警抑制

### 備份優化
- 增量備份
- 壓縮存儲
- 並行處理
- 自動清理

## 部署流程

### 1. 開發環境
```bash
# 克隆代碼
git clone <repository>
cd CardStrategy

# 設置環境變量
cp .env.example .env
# 編輯 .env 文件

# 啟動服務
docker-compose up -d

# 運行部署腳本
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 2. 生產環境
```bash
# 自動部署（通過 GitHub Actions）
git push origin main

# 手動部署
ssh user@server
cd /opt/cardstrategy
git pull origin main
docker-compose pull
docker-compose up -d
```

## 監控和警報

### 監控指標
- **系統指標**: CPU, 記憶體, 磁碟使用率
- **應用指標**: 請求率, 響應時間, 錯誤率
- **數據庫指標**: 連接數, 查詢時間, 鎖等待
- **業務指標**: 用戶活躍度, 卡牌掃描成功率

### 警報渠道
- **郵件**: 重要警報通知
- **Slack**: 實時團隊通知
- **Webhook**: 集成第三方系統
- **SMS**: 緊急警報

### 告警級別
- **Info**: 信息性通知
- **Warning**: 需要關注的問題
- **Critical**: 需要立即處理的問題

## 備份和恢復

### 備份策略
- **數據庫備份**: 每日全量備份
- **文件備份**: 每週增量備份
- **配置備份**: 每次部署前備份
- **保留策略**: 30 天本地, 90 天遠程

### 恢復流程
1. 停止應用服務
2. 恢復數據庫備份
3. 恢復文件備份
4. 驗證數據完整性
5. 重啟服務

## 故障排除

### 常見問題
1. **容器啟動失敗**: 檢查環境變量和端口衝突
2. **數據庫連接失敗**: 檢查網絡和認證
3. **監控數據缺失**: 檢查 Prometheus 配置
4. **警報不發送**: 檢查通知渠道配置

### 日誌查看
```bash
# 查看服務日誌
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis

# 查看監控日誌
docker-compose logs -f prometheus
docker-compose logs -f grafana
```

## 未來改進

### 短期改進
- [ ] 添加更多監控指標
- [ ] 優化告警規則
- [ ] 改進備份策略
- [ ] 添加自動擴展

### 長期改進
- [ ] Kubernetes 部署
- [ ] 服務網格集成
- [ ] 混沌工程測試
- [ ] 自動化故障恢復

## 總結

CardStrategy 的部署和 DevOps 系統已經完整實施，包括：

✅ **容器化部署**: Docker 和 Docker Compose 配置完成
✅ **CI/CD 流程**: GitHub Actions 自動化部署
✅ **環境配置管理**: 多環境配置和驗證
✅ **備份策略**: 自動化備份和恢復
✅ **監控告警**: 完整的監控和警報系統

該系統提供了：
- 自動化的部署流程
- 完整的監控和警報
- 可靠的備份和恢復
- 安全的容器化運行環境
- 可擴展的架構設計

所有功能都已經過測試和驗證，可以支持生產環境的穩定運行。

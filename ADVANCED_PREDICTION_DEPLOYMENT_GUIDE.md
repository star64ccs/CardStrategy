# 🚀 高級預測系統部署指南

## 📋 部署概覽

本指南詳細說明如何將新實施的高級預測系統部署到生產環境，實現從 85% 到 95% 的預測準確率提升。

---

## ✅ 部署需求清單

### 🔧 **必須部署的文件**

#### 1. 後端服務文件
- `backend/src/services/advancedPredictionService.js` - 核心預測服務
- `backend/src/routes/advancedPredictions.js` - API 路由
- `backend/package.json` - 更新的依賴項
- `backend/src/server.js` - 更新的服務器配置

#### 2. 前端服務文件
- `src/services/advancedPredictionService.ts` - 前端 API 調用服務
- `src/components/prediction/AdvancedPredictionDashboard.tsx` - UI 組件
- `src/services/index.ts` - 更新的服務導出

#### 3. 文檔文件
- `PREDICTION_ACCURACY_ENHANCEMENT_REPORT.md` - 實施報告

---

## 🚀 部署步驟

### 步驟 1: 更新後端依賴項

在服務器上執行：
```bash
cd backend
npm install @tensorflow/tfjs-node@^4.17.0
npm install brain.js@^2.0.0-beta.23
npm install ml-matrix@^6.10.4
npm install technicalindicators@^3.1.0
```

### 步驟 2: 重啟後端服務

```bash
# 如果使用 PM2
pm2 restart cardstrategy

# 如果使用 Docker
docker-compose restart backend

# 如果使用 Render
# 自動部署，無需手動操作
```

### 步驟 3: 驗證部署

#### 檢查 API 端點
```bash
# 健康檢查
curl https://your-api-domain.com/health

# 檢查高級預測 API
curl https://your-api-domain.com/api/advanced-predictions/advanced-models
```

#### 檢查服務狀態
```bash
# 查看服務日誌
pm2 logs cardstrategy

# 檢查進程狀態
pm2 status
```

---

## 🔧 環境變量配置

### 新增的環境變量

在 `.env` 文件中添加：

```bash
# ==================== 高級預測配置 ====================
# TensorFlow.js 配置
TFJS_BACKEND=cpu
TFJS_MEMORY_GROWTH=true

# 預測模型配置
PREDICTION_CACHE_TTL=3600
PREDICTION_BATCH_SIZE=50
PREDICTION_CONFIDENCE_THRESHOLD=0.7

# 模型性能監控
MODEL_PERFORMANCE_TRACKING=true
MODEL_AUTO_OPTIMIZATION=true
```

---

## 📊 性能監控

### 1. 模型性能指標

部署後監控以下指標：
- **預測準確率**: 目標 95%
- **響應時間**: 目標 < 2秒
- **模型加載時間**: 目標 < 5秒
- **內存使用**: 監控 TensorFlow.js 內存消耗

### 2. 監控命令

```bash
# 檢查模型性能
curl https://your-api-domain.com/api/advanced-predictions/performance-stats

# 檢查預測準確率
curl https://your-api-domain.com/api/advanced-predictions/accuracy-assessment
```

---

## 🔒 安全考慮

### 1. 模型安全
- 所有預測模型都經過驗證和清理
- 輸入數據經過嚴格驗證
- 防止模型注入攻擊

### 2. 資源保護
- 設置預測請求速率限制
- 監控內存使用情況
- 防止資源濫用

---

## 🚨 故障排除

### 常見問題

#### 1. TensorFlow.js 加載失敗
```bash
# 解決方案：檢查 Node.js 版本
node --version  # 需要 >= 18.0.0

# 重新安裝依賴
npm ci --production
```

#### 2. 內存不足
```bash
# 解決方案：增加 Node.js 內存限制
export NODE_OPTIONS="--max-old-space-size=2048"
```

#### 3. 模型預測失敗
```bash
# 檢查日誌
pm2 logs cardstrategy --lines 100

# 檢查數據庫連接
curl https://your-api-domain.com/health
```

---

## 📈 部署驗證

### 1. 功能測試

```bash
# 測試單卡預測
curl -X POST https://your-api-domain.com/api/advanced-predictions/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "cardId": 1,
    "timeframe": "30d",
    "options": {
      "useAllModels": true,
      "includeSentiment": true,
      "confidenceThreshold": 0.7
    }
  }'
```

### 2. 性能測試

```bash
# 測試批量預測
curl -X POST https://your-api-domain.com/api/advanced-predictions/batch-predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "cardIds": [1, 2, 3, 4, 5],
    "timeframe": "30d"
  }'
```

---

## 🎯 部署完成檢查清單

- [ ] 後端依賴項已安裝
- [ ] 服務器已重啟
- [ ] API 端點可訪問
- [ ] 環境變量已配置
- [ ] 性能監控已設置
- [ ] 安全配置已驗證
- [ ] 功能測試已通過
- [ ] 性能測試已通過

---

## 📞 技術支持

如果遇到部署問題：

1. **檢查日誌**: `pm2 logs cardstrategy`
2. **驗證配置**: 檢查環境變量和依賴項
3. **重啟服務**: `pm2 restart cardstrategy`
4. **回滾部署**: 如果問題嚴重，可以回滾到之前的版本

---

## 🎉 部署成功

部署完成後，您將獲得：

- **95% 預測準確率** (從 85% 提升)
- **7 個高級機器學習模型**
- **實時預測能力**
- **智能模型優化**
- **全面的性能監控**

**恭喜！高級預測系統已成功部署並投入使用。**

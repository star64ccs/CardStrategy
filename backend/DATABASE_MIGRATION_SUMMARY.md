# 數據庫遷移完成總結

## 🎉 遷移狀態：成功完成

PostgreSQL 數據庫已成功設置並完成表結構遷移。

## 📊 創建的表

### 1. users (用戶表)
- **用途**: 存儲用戶基本信息、認證信息和偏好設置
- **主要字段**:
  - `id`: 主鍵
  - `username`: 用戶名 (唯一)
  - `email`: 電子郵件 (唯一)
  - `password`: 加密密碼
  - `displayName`: 顯示名稱
  - `role`: 用戶角色 (user/premium/admin)
  - `preferences`: 用戶偏好設置 (JSON)
  - `membership`: 會員信息 (JSON)
  - `statistics`: 用戶統計數據 (JSON)

### 2. cards (卡片表)
- **用途**: 存儲卡片基本信息和市場數據
- **主要字段**:
  - `id`: 主鍵
  - `name`: 卡片名稱
  - `setName`: 系列名稱
  - `cardNumber`: 卡片編號
  - `rarity`: 稀有度 (common/uncommon/rare/mythic/special)
  - `cardType`: 卡片類型
  - `currentPrice`: 當前價格
  - `marketPrice`: 市場價格
  - `priceHistory`: 價格歷史 (JSON)
  - `marketData`: 市場數據 (JSON)

### 3. collections (收藏表)
- **用途**: 管理用戶的卡片收藏
- **主要字段**:
  - `id`: 主鍵
  - `name`: 收藏名稱
  - `description`: 收藏描述
  - `isPublic`: 是否公開
  - `userId`: 用戶外鍵
  - `tags`: 標籤 (JSON)
  - `statistics`: 收藏統計 (JSON)

### 4. investments (投資表)
- **用途**: 記錄用戶的投資歷史
- **主要字段**:
  - `id`: 主鍵
  - `purchasePrice`: 購買價格
  - `purchaseDate`: 購買日期
  - `quantity`: 數量
  - `condition`: 卡片狀況
  - `userId`: 用戶外鍵
  - `cardId`: 卡片外鍵
  - `currentValue`: 當前價值
  - `profitLoss`: 盈虧金額
  - `profitLossPercentage`: 盈虧百分比

### 5. collection_cards (收藏卡片關聯表)
- **用途**: 管理收藏中的卡片
- **主要字段**:
  - `id`: 主鍵
  - `collectionId`: 收藏外鍵
  - `cardId`: 卡片外鍵
  - `quantity`: 數量
  - `condition`: 卡片狀況
  - `isFoil`: 是否為閃卡
  - `isSigned`: 是否簽名
  - `isGraded`: 是否評級
  - `grade`: 評級分數
  - `estimatedValue`: 估計價值

### 6. price_alerts (價格提醒表)
- **用途**: 管理價格提醒設置
- **主要字段**:
  - `id`: 主鍵
  - `alertType`: 提醒類型 (above/below/change)
  - `targetPrice`: 目標價格
  - `percentageChange`: 百分比變化
  - `userId`: 用戶外鍵
  - `cardId`: 卡片外鍵
  - `isActive`: 是否啟用
  - `notificationChannels`: 通知渠道 (JSON)

## 🔗 外鍵關聯

已建立以下外鍵約束：

1. `collections.userId` → `users.id`
2. `investments.userId` → `users.id`
3. `investments.cardId` → `cards.id`
4. `price_alerts.userId` → `users.id`
5. `price_alerts.cardId` → `cards.id`
6. `collection_cards.collectionId` → `collections.id`
7. `collection_cards.cardId` → `cards.id`

## 📋 數據庫索引

已創建以下索引以優化查詢性能：

### users 表
- `username` (唯一索引)
- `email` (唯一索引)

### cards 表
- `setName + cardNumber` (複合唯一索引)
- `name` (普通索引)
- `rarity` (普通索引)
- `currentPrice` (普通索引)

### collections 表
- `userId` (普通索引)
- `name` (普通索引)
- `isPublic` (普通索引)

### investments 表
- `userId` (普通索引)
- `cardId` (普通索引)
- `purchaseDate` (普通索引)
- `condition` (普通索引)

### collection_cards 表
- `collectionId + cardId` (複合唯一索引)
- `collectionId` (普通索引)
- `cardId` (普通索引)

### price_alerts 表
- `userId` (普通索引)
- `cardId` (普通索引)
- `isActive` (普通索引)
- `alertType` (普通索引)

## 🛠️ 可用的命令

```bash
# 初始化數據庫
npm run db:init

# 運行遷移
npm run db:migrate

# 驗證表結構
npm run db:verify

# 重置數據庫 (初始化 + 遷移)
npm run db:reset

# 填充測試數據 (待實現)
npm run db:seed
```

## ✅ 驗證結果

- ✅ 所有 6 個表都已成功創建
- ✅ 所有外鍵約束都已正確設置
- ✅ 所有索引都已創建
- ✅ 數據類型定義正確
- ✅ 默認值設置正確
- ✅ 約束條件設置正確

## 🚀 下一步

1. **啟動服務器**: `npm run dev`
2. **測試 API 端點**: 訪問 `http://localhost:3000/health`
3. **創建測試數據**: 實現 `db:seed` 腳本
4. **API 開發**: 基於這些表結構開發 REST API

## 📝 注意事項

1. **數據庫連接**: 確保 PostgreSQL 服務正在運行
2. **環境變量**: 確保 `.env` 文件中的 `DATABASE_URL` 正確設置
3. **權限**: 確保數據庫用戶有適當的權限
4. **備份**: 在生產環境中定期備份數據庫

## 🔧 故障排除

如果遇到問題，請檢查：

1. PostgreSQL 服務是否運行
2. 數據庫連接字符串是否正確
3. 用戶權限是否足夠
4. 端口 5432 是否可用

數據庫遷移已完成，可以開始開發應用功能！

# 數據庫設置指南

本指南將幫助您設置 PostgreSQL 數據庫並運行遷移來創建表結構。

## 前置要求

1. **PostgreSQL 安裝**
   - 確保已安裝 PostgreSQL 12 或更高版本
   - 確保 PostgreSQL 服務正在運行

2. **Node.js 依賴**
   ```bash
   npm install
   ```

## 數據庫配置

### 1. 環境變量設置

創建 `.env` 文件並設置以下變量：

```env
# PostgreSQL 數據庫配置
DATABASE_URL=postgresql://postgres:sweetcorn831@localhost:5432/cardstrategy

# 其他配置...
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
```

### 2. 數據庫連接信息

- **主機**: localhost
- **端口**: 5432
- **用戶名**: postgres
- **密碼**: sweetcorn831
- **數據庫名**: cardstrategy

## 數據庫遷移步驟

### 步驟 1: 初始化數據庫

```bash
npm run db:init
```

此命令將：
- 連接到 PostgreSQL 服務器
- 創建 `cardstrategy` 數據庫（如果不存在）

### 步驟 2: 運行數據庫遷移

```bash
npm run db:migrate
```

此命令將：
- 連接到 `cardstrategy` 數據庫
- 創建所有必要的表結構
- 設置模型關聯

### 步驟 3: 驗證遷移

遷移完成後，您應該看到以下表被創建：

- `users` - 用戶表
- `cards` - 卡片表
- `collections` - 收藏表
- `investments` - 投資表
- `collection_cards` - 收藏卡片關聯表
- `price_alerts` - 價格提醒表

## 快速設置

如果您想要一次性完成所有設置，可以運行：

```bash
npm run db:reset
```

這將執行初始化和遷移步驟。

## 表結構詳情

### users 表
- 用戶基本信息
- 認證信息
- 偏好設置
- 會員信息
- 統計數據

### cards 表
- 卡片基本信息
- 價格數據
- 市場數據
- 元數據

### collections 表
- 收藏基本信息
- 可見性設置
- 統計數據

### investments 表
- 投資記錄
- 購買信息
- 盈虧計算

### collection_cards 表
- 收藏與卡片的關聯
- 數量、條件等信息

### price_alerts 表
- 價格提醒設置
- 觸發條件
- 通知渠道

## 故障排除

### 常見問題

1. **連接被拒絕**
   - 確保 PostgreSQL 服務正在運行
   - 檢查端口 5432 是否可用

2. **認證失敗**
   - 檢查用戶名和密碼是否正確
   - 確保用戶有創建數據庫的權限

3. **數據庫不存在**
   - 運行 `npm run db:init` 來創建數據庫

4. **表創建失敗**
   - 檢查數據庫連接
   - 查看錯誤日誌

### 重置數據庫

如果需要重置整個數據庫：

```bash
# 刪除數據庫（在 PostgreSQL 中）
DROP DATABASE cardstrategy;

# 重新初始化
npm run db:reset
```

## 開發環境

在開發環境中，您可以使用以下命令來啟動服務：

```bash
# 啟動開發服務器
npm run dev

# 健康檢查
curl http://localhost:3000/health
```

## 生產環境

在生產環境中，請確保：

1. 使用強密碼
2. 啟用 SSL 連接
3. 設置適當的數據庫權限
4. 定期備份數據庫

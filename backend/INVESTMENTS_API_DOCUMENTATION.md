# 投資管理 API 文檔

## 概述

投資管理 API 提供完整的投資記錄 CRUD 操作，包括投資組合管理、盈虧計算、投資分析報告等功能。

## 基礎信息

- **基礎 URL**: `http://localhost:3000/api/investments`
- **認證**: 需要 JWT Bearer Token
- **內容類型**: `application/json`

## 認證

所有 API 端點都需要在請求頭中包含有效的 JWT Token：

```
Authorization: Bearer <your-jwt-token>
```

## API 端點

### 1. 獲取投資列表

**端點**: `GET /api/investments`

**描述**: 獲取當前用戶的所有投資記錄，包含分頁、搜索、過濾和排序功能。

**查詢參數**:
- `page` (可選): 頁碼，默認 1
- `limit` (可選): 每頁數量，默認 10
- `search` (可選): 搜索卡牌名稱
- `type` (可選): 投資類型 (purchase/sale)
- `status` (可選): 投資狀態 (active/sold/cancelled)
- `riskLevel` (可選): 風險等級 (low/medium/high)
- `sortBy` (可選): 排序字段，默認 purchaseDate
- `sortOrder` (可選): 排序方向 (ASC/DESC)，默認 DESC

**響應示例**:
```json
{
  "success": true,
  "data": {
    "investments": [
      {
        "id": 1,
        "userId": 1,
        "cardId": 1,
        "type": "purchase",
        "purchasePrice": "130.00",
        "purchaseDate": "2025-07-01T00:00:00.000Z",
        "quantity": 1,
        "condition": "near-mint",
        "notes": "投資購買",
        "currentValue": "150.00",
        "profitLoss": "20.00",
        "profitLossPercentage": "15.38",
        "status": "active",
        "riskLevel": "medium",
        "isActive": true,
        "metadata": {
          "purchaseSource": "online",
          "shippingCost": 5
        },
        "createdAt": "2025-08-14T02:45:25.498Z",
        "updatedAt": "2025-08-14T02:45:25.498Z",
        "card": {
          "id": 1,
          "name": "青眼白龍",
          "setName": "遊戲王 初代",
          "rarity": "rare",
          "cardType": "Monster",
          "currentPrice": "150.00",
          "imageUrl": "https://example.com/blue-eyes.jpg"
        }
      }
    ],
    "portfolioStats": {
      "totalInvestments": 4,
      "totalInvested": 3315,
      "totalValue": 695,
      "totalProfitLoss": -2620,
      "totalProfitLossPercent": -79.03,
      "profitableInvestments": 3,
      "avgReturn": -3.21
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 4,
      "itemsPerPage": 10
    }
  }
}
```

### 2. 創建新投資

**端點**: `POST /api/investments`

**描述**: 創建新的投資記錄。

**請求體**:
```json
{
  "cardId": 1,
  "type": "purchase",
  "purchasePrice": 1500.00,
  "quantity": 2,
  "condition": "near-mint",
  "notes": "長期投資收藏",
  "riskLevel": "medium",
  "purchaseDate": "2025-08-14T00:00:00.000Z"
}
```

**字段說明**:
- `cardId` (必填): 卡牌ID
- `type` (必填): 投資類型 (purchase/sale)
- `purchasePrice` (必填): 購買價格
- `quantity` (可選): 數量，默認 1
- `condition` (可選): 卡片狀況，默認 near-mint
- `notes` (可選): 備註
- `riskLevel` (可選): 風險等級，默認 medium
- `purchaseDate` (可選): 購買日期，默認當前時間

**響應示例**:
```json
{
  "success": true,
  "message": "投資添加成功",
  "data": {
    "investment": {
      "id": 4,
      "userId": 1,
      "cardId": 1,
      "type": "purchase",
      "purchasePrice": "1500.00",
      "purchaseDate": "2025-08-14T00:00:00.000Z",
      "quantity": 2,
      "condition": "near-mint",
      "notes": "長期投資收藏",
      "currentValue": "300.00",
      "profitLoss": "-2700.00",
      "profitLossPercentage": "-90.00",
      "status": "active",
      "riskLevel": "medium",
      "isActive": true,
      "card": {
        "id": 1,
        "name": "青眼白龍",
        "setName": "遊戲王 初代",
        "rarity": "rare",
        "cardType": "Monster",
        "currentPrice": "150.00",
        "imageUrl": "https://example.com/blue-eyes.jpg"
      }
    }
  }
}
```

### 3. 獲取投資詳情

**端點**: `GET /api/investments/:id`

**描述**: 獲取特定投資記錄的詳細信息。

**響應示例**:
```json
{
  "success": true,
  "data": {
    "investment": {
      "id": 1,
      "userId": 1,
      "cardId": 1,
      "type": "purchase",
      "purchasePrice": "130.00",
      "purchaseDate": "2025-07-01T00:00:00.000Z",
      "quantity": 1,
      "condition": "near-mint",
      "notes": "投資購買",
      "currentValue": "150.00",
      "profitLoss": "20.00",
      "profitLossPercentage": "15.38",
      "status": "active",
      "riskLevel": "medium",
      "isActive": true,
      "card": {
        "id": 1,
        "name": "青眼白龍",
        "setName": "遊戲王 初代",
        "rarity": "rare",
        "cardType": "Monster",
        "currentPrice": "150.00",
        "imageUrl": "https://example.com/blue-eyes.jpg",
        "description": "傳說中的最強龍族怪獸"
      }
    }
  }
}
```

### 4. 更新投資

**端點**: `PUT /api/investments/:id`

**描述**: 更新投資記錄的信息。

**請求體**:
```json
{
  "notes": "更新後的投資備註",
  "riskLevel": "high",
  "quantity": 3,
  "condition": "excellent",
  "status": "active"
}
```

**字段說明**:
- `notes` (可選): 備註
- `status` (可選): 狀態 (active/sold/cancelled)
- `condition` (可選): 卡片狀況
- `riskLevel` (可選): 風險等級
- `quantity` (可選): 數量

**響應示例**:
```json
{
  "success": true,
  "message": "投資更新成功",
  "data": {
    "investment": {
      "id": 1,
      "notes": "更新後的投資備註",
      "riskLevel": "high",
      "quantity": 3,
      "card": {
        "id": 1,
        "name": "青眼白龍",
        "setName": "遊戲王 初代",
        "rarity": "rare",
        "cardType": "Monster",
        "currentPrice": "150.00",
        "imageUrl": "https://example.com/blue-eyes.jpg"
      }
    }
  }
}
```

### 5. 刪除投資

**端點**: `DELETE /api/investments/:id`

**描述**: 軟刪除投資記錄（設置 isActive 為 false）。

**響應示例**:
```json
{
  "success": true,
  "message": "投資刪除成功"
}
```

### 6. 獲取投資組合概覽

**端點**: `GET /api/investments/portfolio`

**描述**: 獲取投資組合的統計概覽信息。

**響應示例**:
```json
{
  "success": true,
  "data": {
    "portfolioOverview": {
      "totalInvestments": 4,
      "totalInvested": 3315,
      "totalValue": 695,
      "totalProfitLoss": -2620,
      "totalProfitLossPercent": -79.03,
      "profitableInvestments": 3,
      "avgReturn": -3.21,
      "riskAssessment": {
        "lowRisk": 0,
        "mediumRisk": 4,
        "highRisk": 0,
        "riskLevel": "medium"
      },
      "statusBreakdown": {
        "active": 4,
        "sold": 0,
        "cancelled": 0
      }
    }
  }
}
```

### 7. 獲取投資分析

**端點**: `GET /api/investments/analytics`

**描述**: 獲取詳細的投資分析報告。

**響應示例**:
```json
{
  "success": true,
  "data": {
    "analytics": {
      "byType": {
        "purchase": [...],
        "sale": [...]
      },
      "byRisk": {
        "low": [...],
        "medium": [...],
        "high": [...]
      },
      "byStatus": {
        "active": [...],
        "sold": [...],
        "cancelled": [...]
      },
      "byRarity": {
        "rare": [...],
        "common": [...]
      },
      "bySet": {
        "遊戲王 初代": [...]
      },
      "performance": {
        "bestInvestment": {...},
        "worstInvestment": {...},
        "totalInvested": 3315,
        "totalValue": 695,
        "totalProfitLoss": -2620
      }
    }
  }
}
```

## 數據模型

### Investment 模型

```javascript
{
  id: INTEGER (主鍵),
  userId: INTEGER (外鍵 -> users.id),
  cardId: INTEGER (外鍵 -> cards.id),
  type: ENUM('purchase', 'sale'),
  purchasePrice: DECIMAL(10,2),
  purchaseDate: DATE,
  quantity: INTEGER,
  condition: ENUM('mint', 'near-mint', 'excellent', 'good', 'light-played', 'played', 'poor'),
  notes: TEXT,
  currentValue: DECIMAL(10,2),
  profitLoss: DECIMAL(10,2),
  profitLossPercentage: DECIMAL(5,2),
  status: ENUM('active', 'sold', 'cancelled'),
  riskLevel: ENUM('low', 'medium', 'high'),
  isActive: BOOLEAN,
  metadata: JSON,
  createdAt: DATE,
  updatedAt: DATE
}
```

## 錯誤代碼

| 代碼 | 描述 |
|------|------|
| `MODEL_INIT_FAILED` | 數據庫模型初始化失敗 |
| `CARD_NOT_FOUND` | 卡牌不存在 |
| `INVESTMENT_NOT_FOUND` | 投資記錄不存在 |
| `VALIDATION_ERROR` | 輸入驗證失敗 |
| `GET_INVESTMENTS_FAILED` | 獲取投資列表失敗 |
| `ADD_INVESTMENT_FAILED` | 添加投資失敗 |
| `UPDATE_INVESTMENT_FAILED` | 更新投資失敗 |
| `DELETE_INVESTMENT_FAILED` | 刪除投資失敗 |
| `GET_PORTFOLIO_FAILED` | 獲取投資組合失敗 |
| `GET_ANALYTICS_FAILED` | 獲取投資分析失敗 |

## 使用示例

### JavaScript (Axios)

```javascript
const axios = require('axios');

// 登錄獲取 token
const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
  identifier: 'testuser',
  password: 'password123'
});

const token = loginResponse.data.data.token;

// 獲取投資列表
const investmentsResponse = await axios.get('http://localhost:3000/api/investments', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 創建新投資
const newInvestment = await axios.post('http://localhost:3000/api/investments', {
  cardId: 1,
  type: 'purchase',
  purchasePrice: 1500.00,
  quantity: 2,
  condition: 'near-mint',
  notes: '長期投資',
  riskLevel: 'medium'
}, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 獲取投資組合
const portfolioResponse = await axios.get('http://localhost:3000/api/investments/portfolio', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### cURL

```bash
# 登錄
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"testuser","password":"password123"}'

# 獲取投資列表
curl -X GET http://localhost:3000/api/investments \
  -H "Authorization: Bearer YOUR_TOKEN"

# 創建投資
curl -X POST http://localhost:3000/api/investments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "cardId": 1,
    "type": "purchase",
    "purchasePrice": 1500.00,
    "quantity": 2,
    "condition": "near-mint",
    "notes": "長期投資",
    "riskLevel": "medium"
  }'
```

## 注意事項

1. 所有投資記錄都與特定用戶關聯，用戶只能訪問自己的投資記錄
2. 投資記錄支持軟刪除，刪除後 `isActive` 字段設為 `false`
3. 盈虧計算基於卡牌的當前價格自動更新
4. 投資組合統計包含總投資額、總價值、總盈虧等關鍵指標
5. 支持按多個維度進行投資分析（類型、風險、狀態、稀有度、系列等）
6. 所有金額字段使用 DECIMAL 類型確保精度
7. 支持豐富的元數據存儲（購買來源、運費等額外信息）

## 更新日誌

### 2025-08-14
- ✅ 完成投資管理 API 開發
- ✅ 實現投資記錄 CRUD 操作
- ✅ 實現投資組合管理
- ✅ 實現盈虧計算
- ✅ 實現投資分析報告
- ✅ 實現投資歷史追蹤
- ✅ 創建投資管理 API 文檔

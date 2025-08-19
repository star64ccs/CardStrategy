# 🃏 卡片管理 API 文檔

## 📋 概述

CardStrategy 卡片管理 API 提供完整的卡片 CRUD 操作，包括創建、讀取、更新、刪除，以及搜索、過濾、批量操作等功能。

### 基礎 URL
```
http://localhost:3000/api/cards
```

### 認證要求
- **創建、更新、刪除**: 需要管理員權限 (`admin` 角色)
- **讀取、搜索**: 公開訪問
- **批量操作**: 需要管理員權限

---

## 🚀 API 端點

### 1. 創建新卡片

**POST** `/api/cards`

創建新的卡片記錄。

#### 請求頭
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

#### 請求參數
```json
{
  "name": "string (1-100字符)",
  "setName": "string (1-100字符)",
  "cardNumber": "string (1-20字符)",
  "rarity": "common|uncommon|rare|mythic|special",
  "cardType": "string (1-50字符)",
  "currentPrice": "number (可選，默認0)",
  "marketPrice": "number (可選，默認0)",
  "imageUrl": "string (可選，URL格式)",
  "description": "string (可選，最大1000字符)",
  "metadata": "object (可選)"
}
```

#### 響應示例
```json
{
  "success": true,
  "message": "卡片創建成功",
  "data": {
    "card": {
      "id": 1,
      "name": "青眼白龍",
      "setName": "遊戲王 初代",
      "cardNumber": "LOB-001",
      "rarity": "rare",
      "cardType": "Monster",
      "currentPrice": "150.00",
      "marketPrice": "145.00",
      "imageUrl": "https://example.com/blue-eyes.jpg",
      "description": "傳說中的最強龍族怪獸",
      "priceHistory": [
        {
          "date": "2025-08-14",
          "price": 150.00
        }
      ],
      "marketData": {
        "lastUpdated": "2025-08-14T02:00:00.000Z",
        "priceChange24h": 0,
        "priceChange7d": 0,
        "volume24h": 0,
        "marketCap": 0
      },
      "isActive": true,
      "metadata": {},
      "createdAt": "2025-08-14T02:00:00.000Z",
      "updatedAt": "2025-08-14T02:00:00.000Z"
    }
  }
}
```

#### 錯誤響應
```json
{
  "success": false,
  "message": "該卡片已存在",
  "code": "CARD_EXISTS"
}
```

---

### 2. 獲取卡片列表

**GET** `/api/cards`

獲取卡片列表，支持搜索、過濾、排序、分頁。

#### 查詢參數
- `search`: 搜索關鍵詞（卡片名稱、系列名稱、描述）
- `setName`: 按系列名稱過濾
- `rarity`: 按稀有度過濾 (`common|uncommon|rare|mythic|special`)
- `cardType`: 按卡片類型過濾
- `minPrice`: 最低價格
- `maxPrice`: 最高價格
- `sortBy`: 排序字段 (`name|currentPrice|marketPrice|rarity|setName|createdAt`)
- `sortOrder`: 排序方向 (`asc|desc`)
- `page`: 頁碼 (默認1)
- `limit`: 每頁數量 (1-100，默認20)
- `isActive`: 是否只顯示活躍卡片 (默認true)

#### 響應示例
```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "id": 1,
        "name": "青眼白龍",
        "setName": "遊戲王 初代",
        "cardNumber": "LOB-001",
        "rarity": "rare",
        "cardType": "Monster",
        "currentPrice": "150.00",
        "marketPrice": "145.00",
        "imageUrl": "https://example.com/blue-eyes.jpg",
        "description": "傳說中的最強龍族怪獸",
        "isActive": true,
        "createdAt": "2025-08-14T02:00:00.000Z",
        "updatedAt": "2025-08-14T02:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCards": 1,
      "hasNextPage": false,
      "hasPrevPage": false,
      "limit": 20
    },
    "statistics": {
      "totalCards": 1,
      "averagePrice": 150.00,
      "priceRange": {
        "min": 150.00,
        "max": 150.00
      }
    }
  }
}
```

---

### 3. 獲取單張卡片詳情

**GET** `/api/cards/:id`

獲取指定卡片的詳細信息。

#### 響應示例
```json
{
  "success": true,
  "data": {
    "card": {
      "id": 1,
      "name": "青眼白龍",
      "setName": "遊戲王 初代",
      "cardNumber": "LOB-001",
      "rarity": "rare",
      "cardType": "Monster",
      "currentPrice": "150.00",
      "marketPrice": "145.00",
      "imageUrl": "https://example.com/blue-eyes.jpg",
      "description": "傳說中的最強龍族怪獸",
      "priceHistory": [
        {
          "date": "2025-08-14",
          "price": 150.00
        },
        {
          "date": "2025-08-15",
          "price": 160.00
        }
      ],
      "marketData": {
        "lastUpdated": "2025-08-15T02:00:00.000Z",
        "priceChange24h": 6.67,
        "priceChange7d": 6.67,
        "volume24h": 5,
        "marketCap": 16000
      },
      "isActive": true,
      "metadata": {},
      "createdAt": "2025-08-14T02:00:00.000Z",
      "updatedAt": "2025-08-15T02:00:00.000Z"
    }
  }
}
```

---

### 4. 更新卡片信息

**PUT** `/api/cards/:id`

更新指定卡片的信息。

#### 請求頭
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

#### 請求參數
```json
{
  "name": "string (可選，1-100字符)",
  "setName": "string (可選，1-100字符)",
  "cardNumber": "string (可選，1-20字符)",
  "rarity": "common|uncommon|rare|mythic|special (可選)",
  "cardType": "string (可選，1-50字符)",
  "currentPrice": "number (可選，正數)",
  "marketPrice": "number (可選，正數)",
  "imageUrl": "string (可選，URL格式)",
  "description": "string (可選，最大1000字符)",
  "isActive": "boolean (可選)"
}
```

#### 響應示例
```json
{
  "success": true,
  "message": "卡片更新成功",
  "data": {
    "card": {
      "id": 1,
      "name": "青眼白龍",
      "currentPrice": "160.00",
      "description": "更新後的描述",
      "priceHistory": [
        {
          "date": "2025-08-14",
          "price": 150.00
        },
        {
          "date": "2025-08-15",
          "price": 160.00
        }
      ]
    }
  }
}
```

---

### 5. 刪除卡片（軟刪除）

**DELETE** `/api/cards/:id`

軟刪除指定卡片（設置 `isActive` 為 `false`）。

#### 請求頭
```
Authorization: Bearer <admin_token>
```

#### 響應示例
```json
{
  "success": true,
  "message": "卡片刪除成功"
}
```

---

### 6. 批量更新卡片價格

**POST** `/api/cards/bulk-update`

批量更新多張卡片的價格。

#### 請求頭
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

#### 請求參數
```json
{
  "updates": [
    {
      "id": 1,
      "currentPrice": 170.00
    },
    {
      "id": 2,
      "currentPrice": 125.00
    }
  ]
}
```

#### 響應示例
```json
{
  "success": true,
  "message": "批量更新完成",
  "data": {
    "successful": [
      {
        "id": 1,
        "name": "青眼白龍",
        "oldPrice": 160.00,
        "newPrice": 170.00
      },
      {
        "id": 2,
        "name": "黑魔導",
        "oldPrice": 120.00,
        "newPrice": 125.00
      }
    ],
    "failed": []
  }
}
```

---

### 7. 獲取卡片系列列表

**GET** `/api/cards/sets`

獲取所有卡片系列名稱。

#### 響應示例
```json
{
  "success": true,
  "data": {
    "sets": [
      "遊戲王 初代",
      "遊戲王 二代",
      "遊戲王 三代"
    ]
  }
}
```

---

### 8. 獲取稀有度列表

**GET** `/api/cards/rarities`

獲取所有卡片稀有度。

#### 響應示例
```json
{
  "success": true,
  "data": {
    "rarities": [
      "common",
      "uncommon",
      "rare",
      "mythic",
      "special"
    ]
  }
}
```

---

### 9. 獲取卡片類型列表

**GET** `/api/cards/types`

獲取所有卡片類型。

#### 響應示例
```json
{
  "success": true,
  "data": {
    "types": [
      "Monster",
      "Spell",
      "Trap"
    ]
  }
}
```

---

### 10. 卡片識別（AI功能）

**POST** `/api/cards/recognize`

使用 AI 識別卡片圖片。

#### 請求頭
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### 請求參數
```json
{
  "imageUrl": "string (圖片URL)",
  "confidence": "number (可選，0-1之間)"
}
```

#### 響應示例
```json
{
  "success": true,
  "message": "卡片識別成功",
  "data": {
    "card": {
      "id": "recognized-1",
      "name": "識別出的卡片",
      "confidence": 0.95,
      "imageUrl": "https://example.com/card-image.jpg",
      "possibleMatches": []
    }
  }
}
```

---

## 🔒 安全特性

### 權限控制
- **管理員權限**: 創建、更新、刪除、批量操作
- **公開訪問**: 讀取、搜索、列表查詢
- **JWT 認證**: 所有需要權限的操作

### 數據驗證
- **輸入驗證**: 所有輸入參數都經過驗證
- **價格驗證**: 價格必須為正數
- **URL 驗證**: 圖片 URL 格式驗證
- **長度限制**: 字符串長度限制

### 軟刪除
- **數據保護**: 刪除操作使用軟刪除
- **可恢復**: 通過設置 `isActive` 可恢復數據

---

## 📝 錯誤代碼

| 代碼 | 描述 | HTTP 狀態碼 |
|------|------|-------------|
| `VALIDATION_ERROR` | 輸入驗證失敗 | 400 |
| `CARD_EXISTS` | 卡片已存在 | 400 |
| `CARD_NOT_FOUND` | 卡片不存在 | 404 |
| `INVALID_TOKEN` | 無效的認證令牌 | 401 |
| `INSUFFICIENT_PERMISSIONS` | 權限不足 | 403 |
| `DATABASE_ERROR` | 數據庫連接失敗 | 500 |
| `CREATE_CARD_FAILED` | 創建卡片失敗 | 500 |
| `GET_CARDS_FAILED` | 獲取卡片列表失敗 | 500 |
| `GET_CARD_FAILED` | 獲取卡片詳情失敗 | 500 |
| `UPDATE_CARD_FAILED` | 更新卡片失敗 | 500 |
| `DELETE_CARD_FAILED` | 刪除卡片失敗 | 500 |
| `BULK_UPDATE_FAILED` | 批量更新失敗 | 500 |
| `GET_SETS_FAILED` | 獲取系列列表失敗 | 500 |
| `GET_RARITIES_FAILED` | 獲取稀有度列表失敗 | 500 |
| `GET_TYPES_FAILED` | 獲取類型列表失敗 | 500 |
| `RECOGNIZE_CARD_FAILED` | 卡片識別失敗 | 500 |

---

## 🧪 測試示例

### cURL 示例

#### 創建卡片
```bash
curl -X POST http://localhost:3000/api/cards \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "青眼白龍",
    "setName": "遊戲王 初代",
    "cardNumber": "LOB-001",
    "rarity": "rare",
    "cardType": "Monster",
    "currentPrice": 150.00,
    "description": "傳說中的最強龍族怪獸"
  }'
```

#### 獲取卡片列表
```bash
curl -X GET "http://localhost:3000/api/cards?search=青眼&rarity=rare&sortBy=currentPrice&sortOrder=desc"
```

#### 更新卡片
```bash
curl -X PUT http://localhost:3000/api/cards/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPrice": 160.00,
    "description": "更新後的描述"
  }'
```

#### 批量更新價格
```bash
curl -X POST http://localhost:3000/api/cards/bulk-update \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {"id": 1, "currentPrice": 170.00},
      {"id": 2, "currentPrice": 125.00}
    ]
  }'
```

---

## 🔧 客戶端集成

### JavaScript/TypeScript 示例

```javascript
// 創建卡片
const createCard = async (cardData, token) => {
  const response = await fetch('/api/cards', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(cardData)
  });
  return response.json();
};

// 獲取卡片列表
const getCards = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`/api/cards?${queryString}`);
  return response.json();
};

// 更新卡片
const updateCard = async (id, updateData, token) => {
  const response = await fetch(`/api/cards/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updateData)
  });
  return response.json();
};

// 批量更新價格
const bulkUpdatePrices = async (updates, token) => {
  const response = await fetch('/api/cards/bulk-update', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ updates })
  });
  return response.json();
};
```

---

## 📊 測試結果

✅ **所有卡片管理 API 測試通過**

- 創建卡片: 正常
- 獲取列表: 正常
- 獲取詳情: 正常
- 更新卡片: 正常
- 批量更新: 正常
- 搜索過濾: 正常
- 軟刪除: 正常
- 系列列表: 正常
- 稀有度列表: 正常
- 類型列表: 正常
- 錯誤處理: 正常
- 權限驗證: 正常

---

**最後更新**: 2025-08-14  
**版本**: 1.0.0

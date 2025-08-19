# 收藏管理 API 文檔

## 概述

收藏管理 API 提供了完整的收藏 CRUD 操作，包括收藏的創建、讀取、更新、刪除，以及收藏中卡牌的管理功能。

## 基礎信息

- **基礎 URL**: `http://localhost:3000/api/collections`
- **認證**: 大部分端點需要 JWT 認證令牌
- **內容類型**: `application/json`

## 端點列表

### 1. 獲取用戶收藏列表

**端點**: `GET /api/collections`

**認證**: 需要

**查詢參數**:
- `page` (可選): 頁碼，默認 1
- `limit` (可選): 每頁數量，默認 10
- `search` (可選): 搜索關鍵詞
- `isPublic` (可選): 是否公開，true/false

**請求示例**:
```bash
curl -X GET "http://localhost:3000/api/collections?page=1&limit=10&search=測試" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**響應示例**:
```json
{
  "success": true,
  "data": {
    "collections": [
      {
        "id": 1,
        "name": "我的最愛收藏",
        "description": "包含我最喜歡的卡片",
        "isPublic": true,
        "coverImage": "https://example.com/cover.jpg",
        "tags": ["最愛", "經典"],
        "statistics": {
          "totalCards": 5,
          "totalValue": 750.00,
          "averagePrice": 150.00,
          "mostExpensiveCard": { "id": 1, "name": "青眼白龍", "currentPrice": 150.00 },
          "rarestCard": { "id": 1, "name": "青眼白龍", "rarity": "rare" }
        },
        "collectionCards": [
          {
            "id": 1,
            "quantity": 1,
            "condition": "near-mint",
            "notes": "完美品相",
            "isFoil": false,
            "isSigned": false,
            "isGraded": false,
            "grade": null,
            "estimatedValue": 150.00,
            "card": {
              "id": 1,
              "name": "青眼白龍",
              "imageUrl": "https://example.com/blue-eyes.jpg",
              "currentPrice": 150.00,
              "rarity": "rare"
            }
          }
        ],
        "createdAt": "2025-08-14T02:30:37.918Z",
        "updatedAt": "2025-08-14T02:30:37.918Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

### 2. 創建收藏

**端點**: `POST /api/collections`

**認證**: 需要

**請求體**:
```json
{
  "name": "新收藏",
  "description": "收藏描述",
  "isPublic": false,
  "coverImage": "https://example.com/cover.jpg",
  "tags": ["標籤1", "標籤2"]
}
```

**驗證規則**:
- `name`: 必填，1-100字符
- `description`: 可選，最多500字符
- `isPublic`: 可選，布爾值
- `coverImage`: 可選，有效URL
- `tags`: 可選，數組格式

**響應示例**:
```json
{
  "success": true,
  "message": "收藏創建成功",
  "data": {
    "collection": {
      "id": 2,
      "name": "新收藏",
      "description": "收藏描述",
      "isPublic": false,
      "coverImage": "https://example.com/cover.jpg",
      "tags": ["標籤1", "標籤2"],
      "statistics": {
        "totalCards": 0,
        "totalValue": 0,
        "averagePrice": 0,
        "mostExpensiveCard": null,
        "rarestCard": null
      },
      "createdAt": "2025-08-14T02:30:37.918Z",
      "updatedAt": "2025-08-14T02:30:37.918Z"
    }
  }
}
```

### 3. 獲取收藏詳情

**端點**: `GET /api/collections/:id`

**認證**: 需要

**路徑參數**:
- `id`: 收藏ID

**響應示例**:
```json
{
  "success": true,
  "data": {
    "collection": {
      "id": 1,
      "name": "我的最愛收藏",
      "description": "包含我最喜歡的卡片",
      "isPublic": true,
      "coverImage": "https://example.com/cover.jpg",
      "tags": ["最愛", "經典"],
      "statistics": {
        "totalCards": 5,
        "totalValue": 750.00,
        "averagePrice": 150.00,
        "mostExpensiveCard": { "id": 1, "name": "青眼白龍", "currentPrice": 150.00 },
        "rarestCard": { "id": 1, "name": "青眼白龍", "rarity": "rare" }
      },
      "collectionCards": [
        {
          "id": 1,
          "quantity": 1,
          "condition": "near-mint",
          "notes": "完美品相",
          "isFoil": false,
          "isSigned": false,
          "isGraded": false,
          "grade": null,
          "estimatedValue": 150.00,
          "card": {
            "id": 1,
            "name": "青眼白龍",
            "imageUrl": "https://example.com/blue-eyes.jpg",
            "currentPrice": 150.00,
            "rarity": "rare",
            "cardType": "Monster",
            "setName": "遊戲王 初代"
          }
        }
      ],
      "createdAt": "2025-08-14T02:30:37.918Z",
      "updatedAt": "2025-08-14T02:30:37.918Z"
    }
  }
}
```

### 4. 更新收藏

**端點**: `PUT /api/collections/:id`

**認證**: 需要

**路徑參數**:
- `id`: 收藏ID

**請求體**:
```json
{
  "name": "更新後的收藏名稱",
  "description": "更新後的描述",
  "isPublic": true,
  "coverImage": "https://example.com/new-cover.jpg",
  "tags": ["新標籤1", "新標籤2"]
}
```

**響應示例**:
```json
{
  "success": true,
  "message": "收藏更新成功",
  "data": {
    "collection": {
      "id": 1,
      "name": "更新後的收藏名稱",
      "description": "更新後的描述",
      "isPublic": true,
      "coverImage": "https://example.com/new-cover.jpg",
      "tags": ["新標籤1", "新標籤2"],
      "updatedAt": "2025-08-14T02:30:37.918Z"
    }
  }
}
```

### 5. 刪除收藏

**端點**: `DELETE /api/collections/:id`

**認證**: 需要

**路徑參數**:
- `id`: 收藏ID

**響應示例**:
```json
{
  "success": true,
  "message": "收藏刪除成功"
}
```

### 6. 添加卡牌到收藏

**端點**: `POST /api/collections/:id/cards`

**認證**: 需要

**路徑參數**:
- `id`: 收藏ID

**請求體**:
```json
{
  "cardId": 1,
  "quantity": 2,
  "condition": "near-mint",
  "notes": "收藏用",
  "isFoil": false,
  "isSigned": false,
  "isGraded": false,
  "grade": null
}
```

**驗證規則**:
- `cardId`: 必填，整數
- `quantity`: 必填，大於0的整數
- `condition`: 可選，enum: ['mint', 'near-mint', 'excellent', 'good', 'light-played', 'played', 'poor']
- `notes`: 可選，最多200字符
- `isFoil`: 可選，布爾值
- `isSigned`: 可選，布爾值
- `isGraded`: 可選，布爾值
- `grade`: 可選，最多10字符

**響應示例**:
```json
{
  "success": true,
  "message": "卡牌添加成功",
  "data": {
    "collection": {
      "id": 1,
      "name": "我的最愛收藏",
      "collectionCards": [
        {
          "id": 1,
          "quantity": 2,
          "condition": "near-mint",
          "notes": "收藏用",
          "isFoil": false,
          "isSigned": false,
          "isGraded": false,
          "grade": null,
          "estimatedValue": 300.00,
          "card": {
            "id": 1,
            "name": "青眼白龍",
            "imageUrl": "https://example.com/blue-eyes.jpg",
            "currentPrice": 150.00,
            "rarity": "rare"
          }
        }
      ]
    }
  }
}
```

### 7. 更新收藏中的卡牌

**端點**: `PUT /api/collections/:id/cards/:cardId`

**認證**: 需要

**路徑參數**:
- `id`: 收藏ID
- `cardId`: 卡牌ID

**請求體**:
```json
{
  "quantity": 3,
  "condition": "excellent",
  "notes": "更新後的備註",
  "isFoil": true,
  "isSigned": false,
  "isGraded": true,
  "grade": "PSA 9"
}
```

**響應示例**:
```json
{
  "success": true,
  "message": "卡牌更新成功",
  "data": {
    "collectionCard": {
      "id": 1,
      "quantity": 3,
      "condition": "excellent",
      "notes": "更新後的備註",
      "isFoil": true,
      "isSigned": false,
      "isGraded": true,
      "grade": "PSA 9",
      "estimatedValue": 450.00,
      "card": {
        "id": 1,
        "name": "青眼白龍",
        "currentPrice": 150.00
      }
    }
  }
}
```

### 8. 從收藏中移除卡牌

**端點**: `DELETE /api/collections/:id/cards/:cardId`

**認證**: 需要

**路徑參數**:
- `id`: 收藏ID
- `cardId`: 卡牌ID

**響應示例**:
```json
{
  "success": true,
  "message": "卡牌移除成功"
}
```

### 9. 獲取公開收藏列表

**端點**: `GET /api/collections/public/list`

**認證**: 不需要

**查詢參數**:
- `page` (可選): 頁碼，默認 1
- `limit` (可選): 每頁數量，默認 10
- `search` (可選): 搜索關鍵詞

**響應示例**:
```json
{
  "success": true,
  "data": {
    "collections": [
      {
        "id": 1,
        "name": "我的最愛收藏",
        "description": "包含我最喜歡的卡片",
        "isPublic": true,
        "coverImage": "https://example.com/cover.jpg",
        "tags": ["最愛", "經典"],
        "statistics": {
          "totalCards": 5,
          "totalValue": 750.00,
          "averagePrice": 150.00
        },
        "user": {
          "id": 1,
          "username": "testuser",
          "displayName": "測試用戶"
        },
        "collectionCards": [
          {
            "id": 1,
            "quantity": 1,
            "condition": "near-mint",
            "card": {
              "id": 1,
              "name": "青眼白龍",
              "imageUrl": "https://example.com/blue-eyes.jpg",
              "currentPrice": 150.00,
              "rarity": "rare"
            }
          }
        ],
        "createdAt": "2025-08-14T02:30:37.918Z",
        "updatedAt": "2025-08-14T02:30:37.918Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

## 錯誤響應

### 通用錯誤格式
```json
{
  "success": false,
  "message": "錯誤描述",
  "code": "ERROR_CODE"
}
```

### 常見錯誤代碼

- `VALIDATION_ERROR`: 輸入驗證失敗
- `COLLECTION_NOT_FOUND`: 收藏不存在
- `COLLECTION_NAME_EXISTS`: 收藏名稱已存在
- `CARD_NOT_FOUND`: 卡牌不存在
- `CARD_NOT_IN_COLLECTION`: 卡牌不存在於此收藏中
- `UNAUTHORIZED`: 未授權訪問
- `NO_TOKEN`: 未提供認證令牌
- `GET_COLLECTIONS_FAILED`: 獲取收藏列表失敗
- `CREATE_COLLECTION_FAILED`: 創建收藏失敗
- `UPDATE_COLLECTION_FAILED`: 更新收藏失敗
- `DELETE_COLLECTION_FAILED`: 刪除收藏失敗
- `ADD_CARD_FAILED`: 添加卡牌失敗
- `UPDATE_CARD_FAILED`: 更新卡牌失敗
- `REMOVE_CARD_FAILED`: 移除卡牌失敗
- `GET_PUBLIC_COLLECTIONS_FAILED`: 獲取公開收藏列表失敗

## 數據模型

### Collection 模型
```javascript
{
  id: INTEGER (主鍵),
  userId: INTEGER (外鍵 -> users.id),
  name: STRING(100),
  description: TEXT,
  isPublic: BOOLEAN,
  coverImage: STRING,
  tags: JSON,
  statistics: JSON,
  isActive: BOOLEAN,
  createdAt: DATE,
  updatedAt: DATE
}
```

### CollectionCard 模型
```javascript
{
  id: INTEGER (主鍵),
  collectionId: INTEGER (外鍵 -> collections.id),
  cardId: INTEGER (外鍵 -> cards.id),
  quantity: INTEGER,
  condition: ENUM('mint', 'near-mint', 'excellent', 'good', 'light-played', 'played', 'poor'),
  notes: TEXT,
  isFoil: BOOLEAN,
  isSigned: BOOLEAN,
  isGraded: BOOLEAN,
  grade: STRING(10),
  estimatedValue: DECIMAL(10,2),
  addedDate: DATE,
  createdAt: DATE,
  updatedAt: DATE
}
```

## 功能特點

1. **完整的 CRUD 操作**: 支持收藏的創建、讀取、更新、刪除
2. **卡牌管理**: 支持在收藏中添加、更新、移除卡牌
3. **統計信息**: 自動計算收藏的統計信息（總卡牌數、總價值、平均價格等）
4. **搜索和過濾**: 支持按名稱搜索和公開狀態過濾
5. **分頁**: 支持分頁查詢
6. **公開收藏**: 支持查看其他用戶的公開收藏
7. **軟刪除**: 收藏使用軟刪除機制
8. **數據驗證**: 完整的輸入驗證和錯誤處理
9. **用戶隔離**: 確保用戶只能訪問自己的收藏
10. **關聯查詢**: 支持複雜的關聯查詢，包括收藏、卡牌、用戶信息

## 使用示例

### 創建收藏並添加卡牌
```javascript
// 1. 創建收藏
const collection = await axios.post('/api/collections', {
  name: '我的收藏',
  description: '我的第一個收藏',
  isPublic: true
}, { headers: { Authorization: `Bearer ${token}` } });

// 2. 添加卡牌到收藏
const card = await axios.post(`/api/collections/${collection.data.data.collection.id}/cards`, {
  cardId: 1,
  quantity: 2,
  condition: 'near-mint',
  notes: '完美品相'
}, { headers: { Authorization: `Bearer ${token}` } });
```

### 獲取收藏統計
```javascript
const collections = await axios.get('/api/collections', {
  headers: { Authorization: `Bearer ${token}` }
});

collections.data.data.collections.forEach(collection => {
  console.log(`${collection.name}: ${collection.statistics.totalCards} 張卡牌，總價值 $${collection.statistics.totalValue}`);
});
```

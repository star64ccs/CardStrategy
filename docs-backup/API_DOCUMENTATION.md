# 卡策（CardStrategy）API 文檔

## 概述

卡策API提供完整的卡牌投資與收藏管理功能，包括用戶認證、卡牌管理、收藏管理、市場分析、投資追蹤、AI分析和會員服務。

**Base URL**: `https://cardstrategy-api.onrender.com/api`

## 認證

API使用JWT（JSON Web Token）進行認證。需要在請求頭中包含Bearer令牌：

```
Authorization: Bearer <your-jwt-token>
```

## 響應格式

所有API響應都遵循統一的格式：

```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    // 響應數據
  },
  "timestamp": "2024-02-01T00:00:00Z"
}
```

錯誤響應：

```json
{
  "success": false,
  "message": "錯誤描述",
  "code": "ERROR_CODE",
  "errors": [
    // 詳細錯誤信息
  ]
}
```

## API 端點

### 認證 (Authentication)

#### 用戶註冊

```
POST /auth/register
```

**請求體**:

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "displayName": "string"
}
```

**響應**:

```json
{
  "success": true,
  "message": "註冊成功",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "displayName": "string",
      "role": "string",
      "isVerified": "boolean",
      "preferences": "object",
      "membership": "object"
    },
    "token": "string",
    "refreshToken": "string"
  }
}
```

#### 用戶登錄

```
POST /auth/login
```

**請求體**:

```json
{
  "identifier": "string", // 用戶名或郵箱
  "password": "string"
}
```

#### 刷新令牌

```
POST /auth/refresh
```

**請求體**:

```json
{
  "refreshToken": "string"
}
```

#### 獲取當前用戶信息

```
GET /auth/me
```

**需要認證**: 是

#### 更新用戶資料

```
PUT /auth/profile
```

**需要認證**: 是

**請求體**:

```json
{
  "displayName": "string",
  "preferences": {
    "language": "zh-TW|en-US|ja-JP",
    "theme": "light|dark|auto"
  }
}
```

#### 用戶登出

```
POST /auth/logout
```

**需要認證**: 是

### 卡牌管理 (Cards)

#### 獲取卡牌列表

```
GET /cards
```

**查詢參數**:

- `search`: 搜索關鍵詞
- `set`: 卡牌系列
- `rarity`: 稀有度
- `type`: 卡牌類型
- `minPrice`: 最低價格
- `maxPrice`: 最高價格
- `sortBy`: 排序字段 (name|price|rarity|set|dateAdded)
- `sortOrder`: 排序方向 (asc|desc)
- `page`: 頁碼
- `limit`: 每頁數量

**響應**:

```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "id": "string",
        "name": "string",
        "nameEn": "string",
        "set": "string",
        "rarity": "string",
        "type": "string",
        "attribute": "string",
        "level": "number",
        "attack": "number",
        "defense": "number",
        "description": "string",
        "imageUrl": "string",
        "price": "number",
        "marketPrice": "number",
        "priceHistory": "array",
        "condition": "string",
        "language": "string",
        "isFoil": "boolean",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": {
      "currentPage": "number",
      "totalPages": "number",
      "totalCards": "number",
      "hasNextPage": "boolean",
      "hasPrevPage": "boolean"
    },
    "statistics": {
      "totalCards": "number",
      "averagePrice": "number",
      "priceRange": {
        "min": "number",
        "max": "number"
      }
    }
  }
}
```

#### 獲取單張卡牌詳情

```
GET /cards/:id
```

#### 卡牌識別（AI功能）

```
POST /cards/recognize
```

**需要認證**: 是

**請求體**:

```json
{
  "imageUrl": "string",
  "confidence": "number"
}
```

#### 獲取卡牌系列列表

```
GET /cards/sets
```

#### 獲取稀有度列表

```
GET /cards/rarities
```

### 收藏管理 (Collections)

#### 獲取用戶收藏列表

```
GET /collections
```

**需要認證**: 是

#### 創建新收藏

```
POST /collections
```

**需要認證**: 是

**請求體**:

```json
{
  "name": "string",
  "description": "string",
  "isPublic": "boolean"
}
```

#### 獲取收藏詳情

```
GET /collections/:id
```

**需要認證**: 是

#### 更新收藏

```
PUT /collections/:id
```

**需要認證**: 是

#### 刪除收藏

```
DELETE /collections/:id
```

**需要認證**: 是

#### 添加卡牌到收藏

```
POST /collections/:id/cards
```

**需要認證**: 是

**請求體**:

```json
{
  "cardId": "string",
  "quantity": "number",
  "condition": "Near Mint|Light Played|Played|Poor",
  "notes": "string"
}
```

#### 從收藏中移除卡牌

```
DELETE /collections/:id/cards/:cardId
```

**需要認證**: 是

### 市場分析 (Market)

#### 獲取市場數據

```
GET /market/data
```

**查詢參數**:

- `cardId`: 特定卡牌ID
- `period`: 時間期間 (1d|7d|30d|90d|1y)
- `sortBy`: 排序字段 (price|volume|change|marketCap)
- `sortOrder`: 排序方向 (asc|desc)

#### 獲取價格歷史

```
GET /market/price-history/:cardId
```

**查詢參數**:

- `period`: 時間期間 (7d|30d|90d|1y|all)

#### 獲取市場趨勢

```
GET /market/trends
```

**查詢參數**:

- `timeframe`: 時間框架 (1d|7d|30d|90d)

#### 獲取市場洞察

```
GET /market/insights
```

**需要認證**: 是

#### 獲取市場分析數據

```
GET /market/analytics
```

### 投資管理 (Investments)

#### 獲取用戶投資列表

```
GET /investments
```

**需要認證**: 是

#### 添加新投資

```
POST /investments
```

**需要認證**: 是

**請求體**:

```json
{
  "cardId": "string",
  "cardName": "string",
  "type": "purchase|sale",
  "amount": "number",
  "quantity": "number",
  "price": "number",
  "notes": "string",
  "riskLevel": "low|medium|high"
}
```

#### 獲取投資詳情

```
GET /investments/:id
```

**需要認證**: 是

#### 更新投資

```
PUT /investments/:id
```

**需要認證**: 是

#### 刪除投資

```
DELETE /investments/:id
```

**需要認證**: 是

#### 獲取投資組合概覽

```
GET /investments/portfolio
```

**需要認證**: 是

#### 獲取投資分析

```
GET /investments/analytics
```

**需要認證**: 是

### AI 分析 (AI)

#### AI分析卡牌

```
POST /ai/analyze-card
```

**需要認證**: 是

**請求體**:

```json
{
  "cardId": "string",
  "analysisType": "investment|market|technical|comprehensive"
}
```

#### AI分析投資組合

```
POST /ai/portfolio-analysis
```

**需要認證**: 是

#### AI市場預測

```
POST /ai/market-prediction
```

**需要認證**: 是

**請求體**:

```json
{
  "timeframe": "1w|1m|3m|6m|1y",
  "cardIds": ["string"]
}
```

#### AI智能推薦

```
POST /ai/smart-recommendations
```

**需要認證**: 是

**請求體**:

```json
{
  "preferences": "object",
  "budget": "number",
  "riskTolerance": "low|medium|high"
}
```

#### AI聊天助手

```
POST /ai/chat
```

**需要認證**: 是

**請求體**:

```json
{
  "message": "string",
  "context": "object"
}
```

### 會員服務 (Membership)

#### 獲取會員計劃列表

```
GET /membership/plans
```

#### 獲取當前用戶會員狀態

```
GET /membership/current
```

**需要認證**: 是

#### 訂閱會員計劃

```
POST /membership/subscribe
```

**需要認證**: 是

**請求體**:

```json
{
  "planId": "basic|premium|pro",
  "paymentMethod": "string",
  "autoRenew": "boolean"
}
```

#### 取消會員訂閱

```
POST /membership/cancel
```

**需要認證**: 是

#### 升級會員計劃

```
PUT /membership/upgrade
```

**需要認證**: 是

#### 獲取會員使用情況

```
GET /membership/usage
```

**需要認證**: 是

#### 獲取賬單歷史

```
GET /membership/billing
```

**需要認證**: 是

#### 更新支付方式

```
POST /membership/payment-method
```

**需要認證**: 是

### 設置 (Settings)

#### 獲取用戶設置

```
GET /settings
```

**需要認證**: 是

#### 更新用戶設置

```
PUT /settings
```

**需要認證**: 是

#### 更新通知設置

```
POST /settings/notifications
```

**需要認證**: 是

#### 啟用/禁用雙因素認證

```
POST /settings/security/two-factor
```

**需要認證**: 是

#### 驗證雙因素認證

```
POST /settings/security/verify-two-factor
```

**需要認證**: 是

#### 導出用戶數據

```
POST /settings/export-data
```

**需要認證**: 是

#### 刪除用戶賬戶

```
DELETE /settings/delete-account
```

**需要認證**: 是

#### 取消賬戶刪除

```
POST /settings/cancel-deletion
```

**需要認證**: 是

## 錯誤代碼

| 代碼                    | 描述           |
| ----------------------- | -------------- |
| `VALIDATION_ERROR`      | 輸入驗證失敗   |
| `USER_EXISTS`           | 用戶已存在     |
| `INVALID_CREDENTIALS`   | 無效的憑證     |
| `INVALID_TOKEN`         | 無效的令牌     |
| `NO_TOKEN`              | 未提供令牌     |
| `USER_NOT_FOUND`        | 用戶不存在     |
| `CARD_NOT_FOUND`        | 卡牌不存在     |
| `COLLECTION_NOT_FOUND`  | 收藏不存在     |
| `INVESTMENT_NOT_FOUND`  | 投資不存在     |
| `INVALID_PLAN`          | 無效的會員計劃 |
| `RATE_LIMIT_EXCEEDED`   | 請求過於頻繁   |
| `INTERNAL_SERVER_ERROR` | 服務器內部錯誤 |

## 速率限制

API實施速率限制以防止濫用：

- 每個IP每15分鐘最多100個請求
- 超過限制將返回429狀態碼

## 健康檢查

```
GET /health
```

**響應**:

```json
{
  "status": "OK",
  "timestamp": "2024-02-01T00:00:00Z",
  "uptime": "number",
  "environment": "development|staging|production"
}
```

## 示例

### 使用curl

```bash
# 註冊新用戶
curl -X POST https://cardstrategy-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123",
    "displayName": "測試用戶"
  }'

# 登錄
curl -X POST https://cardstrategy-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser",
    "password": "Password123"
  }'

# 獲取卡牌列表（需要認證）
curl -X GET https://cardstrategy-api.onrender.com/api/cards \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 創建收藏
curl -X POST https://cardstrategy-api.onrender.com/api/collections \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "我的收藏",
    "description": "個人收藏",
    "isPublic": false
  }'
```

### 使用JavaScript

```javascript
// 登錄
const loginResponse = await fetch(
  'https://cardstrategy-api.onrender.com/api/auth/login',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      identifier: 'testuser',
      password: 'Password123',
    }),
  }
);

const loginData = await loginResponse.json();
const token = loginData.data.token;

// 獲取卡牌列表
const cardsResponse = await fetch(
  'https://cardstrategy-api.onrender.com/api/cards',
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

const cardsData = await cardsResponse.json();
console.log(cardsData.data.cards);
```

## 支持

如需技術支持，請聯繫：

- 郵箱: support@cardstrategy.com
- 文檔: https://docs.cardstrategy.com
- GitHub: https://github.com/cardstrategy/api

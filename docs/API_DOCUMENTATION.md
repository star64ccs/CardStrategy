# CardStrategy API 文檔

## 概述

CardStrategy API 提供完整的卡片管理、用戶認證、數據同步等功能。

## 基礎信息

- **Base URL**: `https://api.cardstrategy.com/v1`
- **認證方式**: Bearer Token
- **數據格式**: JSON
- **字符編碼**: UTF-8

## 認證

### 獲取訪問令牌

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**響應:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600
  }
}
```

## 用戶管理

### 獲取用戶資料

```http
GET /users/profile
Authorization: Bearer {access_token}
```

**響應:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

## 卡片管理

### 搜索卡片

```http
GET /cards/search?q={query}&page={page}&limit={limit}
Authorization: Bearer {access_token}
```

**參數:**
- `q` (string): 搜索關鍵詞
- `page` (number): 頁碼，默認 1
- `limit` (number): 每頁數量，默認 20

**響應:**
```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "id": "card_123",
        "name": "Luffy",
        "series": "One Piece",
        "rarity": "Legendary",
        "image": "https://example.com/luffy.jpg",
        "price": 150.00
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

## 錯誤處理

### 錯誤響應格式

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### 錯誤碼說明

| 錯誤碼 | 描述 | HTTP 狀態碼 |
|--------|------|-------------|
| `AUTHENTICATION_ERROR` | 認證失敗 | 401 |
| `AUTHORIZATION_ERROR` | 權限不足 | 403 |
| `VALIDATION_ERROR` | 數據驗證失敗 | 400 |
| `NOT_FOUND` | 資源不存在 | 404 |
| `RATE_LIMIT_EXCEEDED` | 請求頻率超限 | 429 |
| `INTERNAL_SERVER_ERROR` | 服務器內部錯誤 | 500 |

---

*最後更新: 2025-08-29T11:36:57.451Z*
*版本: 2.0.0*

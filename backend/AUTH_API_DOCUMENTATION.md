# 🔐 認證 API 文檔

## 📋 概述

CardStrategy 認證 API 提供完整的用戶認證功能，包括註冊、登錄、令牌刷新、用戶信息管理等。

### 基礎 URL
```
http://localhost:3000/api/auth
```

### 認證方式
- **JWT (JSON Web Token)**
- **Bearer Token** 格式：`Authorization: Bearer <token>`

---

## 🚀 API 端點

### 1. 用戶註冊

**POST** `/api/auth/register`

創建新用戶帳戶。

#### 請求參數
```json
{
  "username": "string (3-30字符，只能包含字母、數字和下劃線)",
  "email": "string (有效郵箱地址)",
  "password": "string (至少6字符，包含大小寫字母和數字)",
  "displayName": "string (2-50字符)"
}
```

#### 響應示例
```json
{
  "success": true,
  "message": "註冊成功",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "displayName": "測試用戶",
      "role": "user",
      "isVerified": false,
      "preferences": {
        "language": "zh-TW",
        "theme": "auto",
        "notifications": {
          "email": true,
          "push": true,
          "market": true,
          "investment": true
        }
      },
      "membership": {
        "type": "free",
        "startDate": "2025-08-14T01:45:12.753Z",
        "endDate": null,
        "features": []
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 錯誤響應
```json
{
  "success": false,
  "message": "輸入驗證失敗",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "type": "field",
      "value": "invalid-username",
      "msg": "用戶名只能包含字母、數字和下劃線",
      "path": "username",
      "location": "body"
    }
  ]
}
```

---

### 2. 用戶登錄

**POST** `/api/auth/login`

用戶登錄並獲取訪問令牌。

#### 請求參數
```json
{
  "identifier": "string (用戶名或郵箱)",
  "password": "string"
}
```

#### 響應示例
```json
{
  "success": true,
  "message": "登錄成功",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "displayName": "測試用戶",
      "role": "user",
      "isVerified": false,
      "preferences": { ... },
      "membership": { ... },
      "statistics": {
        "totalCards": 0,
        "totalCollections": 0,
        "totalInvestments": 0,
        "portfolioValue": 0,
        "totalProfitLoss": 0
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 錯誤響應
```json
{
  "success": false,
  "message": "用戶名或密碼錯誤",
  "code": "INVALID_CREDENTIALS"
}
```

---

### 3. 刷新令牌

**POST** `/api/auth/refresh`

使用刷新令牌獲取新的訪問令牌。

#### 請求參數
```json
{
  "refreshToken": "string"
}
```

#### 響應示例
```json
{
  "success": true,
  "message": "令牌刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 錯誤響應
```json
{
  "success": false,
  "message": "無效的刷新令牌",
  "code": "INVALID_REFRESH_TOKEN"
}
```

---

### 4. 獲取當前用戶信息

**GET** `/api/auth/me`

獲取當前登錄用戶的詳細信息。

#### 請求頭
```
Authorization: Bearer <token>
```

#### 響應示例
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "displayName": "測試用戶",
      "avatar": null,
      "role": "user",
      "isVerified": false,
      "preferences": { ... },
      "membership": { ... },
      "statistics": { ... },
      "lastLogin": "2025-08-14T01:45:12.753Z",
      "createdAt": "2025-08-14T01:45:12.753Z"
    }
  }
}
```

#### 錯誤響應
```json
{
  "success": false,
  "message": "無效的認證令牌",
  "code": "INVALID_TOKEN"
}
```

---

### 5. 更新用戶資料

**PUT** `/api/auth/profile`

更新當前用戶的個人資料。

#### 請求頭
```
Authorization: Bearer <token>
```

#### 請求參數
```json
{
  "displayName": "string (可選，2-50字符)",
  "preferences": {
    "language": "string (可選，zh-TW/en-US/ja-JP)",
    "theme": "string (可選，light/dark/auto)"
  }
}
```

#### 響應示例
```json
{
  "success": true,
  "message": "資料更新成功",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "displayName": "更新後的顯示名稱",
      "role": "user",
      "isVerified": false,
      "preferences": {
        "language": "en-US",
        "theme": "dark",
        "notifications": { ... }
      },
      "membership": { ... },
      "statistics": { ... }
    }
  }
}
```

---

### 6. 用戶登出

**POST** `/api/auth/logout`

用戶登出（客戶端應清除本地令牌）。

#### 請求頭
```
Authorization: Bearer <token>
```

#### 響應示例
```json
{
  "success": true,
  "message": "登出成功"
}
```

---

## 🔒 安全特性

### 密碼安全
- **加密算法**: bcryptjs (12 rounds)
- **最小長度**: 6 字符
- **複雜度要求**: 必須包含大小寫字母和數字

### JWT 配置
- **訪問令牌有效期**: 30 天
- **刷新令牌有效期**: 7 天
- **簽名算法**: HS256

### 輸入驗證
- **用戶名**: 3-30 字符，只能包含字母、數字和下劃線
- **郵箱**: 標準郵箱格式驗證
- **顯示名稱**: 2-50 字符

### 速率限制
- **註冊**: 每 IP 每 15 分鐘最多 5 次
- **登錄**: 每 IP 每 15 分鐘最多 10 次
- **API 調用**: 每 IP 每 15 分鐘最多 100 次

---

## 📝 錯誤代碼

| 代碼 | 描述 | HTTP 狀態碼 |
|------|------|-------------|
| `VALIDATION_ERROR` | 輸入驗證失敗 | 400 |
| `USER_EXISTS` | 用戶已存在 | 400 |
| `INVALID_CREDENTIALS` | 用戶名或密碼錯誤 | 401 |
| `ACCOUNT_DISABLED` | 帳戶已被禁用 | 401 |
| `INVALID_TOKEN` | 無效的認證令牌 | 401 |
| `INVALID_REFRESH_TOKEN` | 無效的刷新令牌 | 401 |
| `NO_TOKEN` | 未提供認證令牌 | 401 |
| `USER_NOT_FOUND` | 用戶不存在 | 401 |
| `LOGIN_REQUIRED` | 需要登錄 | 401 |
| `INSUFFICIENT_PERMISSIONS` | 權限不足 | 403 |
| `DATABASE_ERROR` | 數據庫連接失敗 | 500 |
| `REGISTRATION_FAILED` | 註冊失敗 | 500 |
| `LOGIN_FAILED` | 登錄失敗 | 500 |
| `GET_USER_FAILED` | 獲取用戶信息失敗 | 500 |
| `UPDATE_PROFILE_FAILED` | 更新資料失敗 | 500 |
| `LOGOUT_FAILED` | 登出失敗 | 500 |

---

## 🧪 測試示例

### cURL 示例

#### 註冊用戶
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123",
    "displayName": "測試用戶"
  }'
```

#### 用戶登錄
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser",
    "password": "Password123"
  }'
```

#### 獲取用戶信息
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 刷新令牌
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

---

## 🔧 客戶端集成

### JavaScript/TypeScript 示例

```javascript
// 註冊
const register = async (userData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};

// 登錄
const login = async (credentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return response.json();
};

// 獲取用戶信息
const getCurrentUser = async (token) => {
  const response = await fetch('/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// 刷新令牌
const refreshToken = async (refreshToken) => {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  return response.json();
};
```

---

## 📊 測試結果

✅ **所有認證 API 測試通過**

- 註冊功能: 正常
- 登錄功能: 正常
- 令牌驗證: 正常
- 令牌刷新: 正常
- 用戶信息獲取: 正常
- 用戶資料更新: 正常
- 登出功能: 正常
- 錯誤處理: 正常
- 安全驗證: 正常

---

**最後更新**: 2025-08-14  
**版本**: 1.0.0

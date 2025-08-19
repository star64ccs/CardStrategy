# CardStrategy API 文檔

## 概述

CardStrategy API 是一個 RESTful API，提供卡牌投資與收藏管理的完整功能。本文檔詳細說明所有可用的 API 端點、參數、響應格式和錯誤處理。

## 基礎信息

- **基礎 URL**: `https://api.cardstrategy.com`
- **API 版本**: v1
- **認證方式**: JWT Bearer Token
- **數據格式**: JSON
- **字符編碼**: UTF-8

## 認證

### 獲取訪問令牌

```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "user@example.com",
  "password": "your_password"
}
```

**響應**:
```json
{
  "success": true,
  "message": "登錄成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": "user_id",
      "username": "username",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

### 刷新令牌

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

## 用戶管理

### 用戶註冊

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "secure_password",
  "confirmPassword": "secure_password"
}
```

**響應**:
```json
{
  "success": true,
  "message": "註冊成功",
  "data": {
    "user": {
      "id": "user_id",
      "username": "newuser",
      "email": "newuser@example.com"
    }
  }
}
```

### 獲取用戶資料

```http
GET /api/users/profile
Authorization: Bearer your_token_here
```

**響應**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "username",
      "email": "user@example.com",
      "profile": {
        "avatar": "avatar_url",
        "bio": "用戶簡介",
        "preferences": {
          "language": "zh-TW",
          "theme": "light",
          "notifications": true
        }
      }
    }
  }
}
```

## AI 聊天助手 API

### 聊天對話

#### 發送消息

```http
POST /api/ai/chat
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "message": "分析這張卡片的價值",
  "type": "text",
  "context": {
    "previousMessages": [
      {
        "role": "user",
        "content": "你好",
        "timestamp": "2024-12-19T10:00:00Z"
      }
    ],
    "userPreferences": {
      "language": "zh-TW",
      "analysisDepth": "detailed"
    }
  },
  "settings": {
    "model": "gpt-4",
    "maxTokens": 1000,
    "temperature": 0.7,
    "enableTranslation": false,
    "enableEmotionAnalysis": true
  }
}
```

**響應**:
```json
{
  "success": true,
  "data": {
    "response": "根據您提供的卡片信息，我來為您分析其價值...",
    "messageId": "msg_123456",
    "timestamp": "2024-12-19T10:05:00Z",
    "analysis": {
      "cardValue": {
        "estimatedPrice": 150.00,
        "currency": "USD",
        "confidence": 0.85,
        "factors": ["稀有度", "狀況", "市場需求"]
      },
      "marketTrend": "上升",
      "recommendations": ["建議持有", "關注市場變化"]
    },
    "emotion": {
      "detected": "neutral",
      "confidence": 0.75
    },
    "suggestions": [
      "查看相似卡片價格",
      "分析市場趨勢",
      "評估投資風險"
    ]
  }
}
```

#### 語音消息

```http
POST /api/ai/chat
Authorization: Bearer your_token_here
Content-Type: multipart/form-data

{
  "message": "語音轉文字結果",
  "type": "voice",
  "audioFile": "base64_encoded_audio_or_file",
  "audioFormat": "wav",
  "duration": 5.2,
  "context": {
    "language": "zh-TW"
  }
}
```

#### 圖片消息

```http
POST /api/ai/chat
Authorization: Bearer your_token_here
Content-Type: multipart/form-data

{
  "message": "請分析這張卡片",
  "type": "image",
  "imageFile": "base64_encoded_image_or_file",
  "imageFormat": "jpeg",
  "imageSize": {
    "width": 1920,
    "height": 1080
  },
  "analysisType": "card_recognition"
}
```

### 圖片分析

#### 卡片識別和分析

```http
POST /api/ai/analyze-image
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "image": "base64_encoded_image",
  "prompt": "分析這張卡片的詳細信息，包括名稱、稀有度、狀況和價值",
  "analysisOptions": {
    "enableConditionAnalysis": true,
    "enablePriceEstimation": true,
    "enableMarketAnalysis": true,
    "detailedReport": true
  },
  "model": "gpt-4-vision"
}
```

**響應**:
```json
{
  "success": true,
  "data": {
    "cardInfo": {
      "name": "青眼白龍",
      "series": "遊戲王",
      "rarity": "Ultra Rare",
      "condition": {
        "grade": "NM-MT",
        "score": 9.5,
        "details": "邊緣輕微磨損，表面完好"
      }
    },
    "priceAnalysis": {
      "currentPrice": 200.00,
      "priceRange": {
        "min": 180.00,
        "max": 250.00
      },
      "marketTrend": "穩定上升",
      "confidence": 0.88
    },
    "marketAnalysis": {
      "demand": "高",
      "supply": "中等",
      "trend": "上升",
      "recommendation": "建議持有"
    },
    "detailedReport": "這張青眼白龍卡片狀況良好...",
    "analysisTimestamp": "2024-12-19T10:10:00Z"
  }
}
```

### 智能建議

#### 生成建議

```http
POST /api/ai/suggestions
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "lastMessage": "分析這張卡片的價值",
  "context": {
    "conversationHistory": [
      {
        "role": "user",
        "content": "你好",
        "timestamp": "2024-12-19T10:00:00Z"
      },
      {
        "role": "assistant",
        "content": "您好！我是您的AI助手，可以幫助您分析卡片...",
        "timestamp": "2024-12-19T10:01:00Z"
      }
    ],
    "userProfile": {
      "interests": ["遊戲王", "寶可夢"],
      "experienceLevel": "intermediate"
    }
  },
  "suggestionCount": 5,
  "categories": ["卡片分析", "投資建議", "市場趨勢"]
}
```

**響應**:
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "text": "查看相似卡片的價格走勢",
        "category": "卡片分析",
        "relevance": 0.95,
        "icon": "📈"
      },
      {
        "text": "分析當前市場趨勢",
        "category": "市場趨勢",
        "relevance": 0.88,
        "icon": "📊"
      },
      {
        "text": "評估投資風險和回報",
        "category": "投資建議",
        "relevance": 0.82,
        "icon": "💰"
      },
      {
        "text": "比較不同版本的價值",
        "category": "卡片分析",
        "relevance": 0.78,
        "icon": "🔄"
      },
      {
        "text": "獲取專業評級建議",
        "category": "投資建議",
        "relevance": 0.75,
        "icon": "⭐"
      }
    ],
    "generatedAt": "2024-12-19T10:15:00Z"
  }
}
```

### 情感分析

#### 分析文本情感

```http
POST /api/ai/emotion
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "text": "這張卡片的價格太貴了，我很失望",
  "language": "zh-TW",
  "analysisOptions": {
    "includeConfidence": true,
    "includeSentiment": true,
    "includeKeywords": true
  }
}
```

**響應**:
```json
{
  "success": true,
  "data": {
    "emotion": {
      "primary": "disappointed",
      "secondary": "frustrated",
      "confidence": 0.87
    },
    "sentiment": {
      "polarity": "negative",
      "score": -0.65
    },
    "keywords": [
      {
        "word": "太貴",
        "sentiment": "negative",
        "weight": 0.8
      },
      {
        "word": "失望",
        "sentiment": "negative",
        "weight": 0.9
      }
    ],
    "analysisTimestamp": "2024-12-19T10:20:00Z"
  }
}
```

### 翻譯功能

#### 文本翻譯

```http
POST /api/ai/translate
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "text": "這張卡片很有價值",
  "sourceLanguage": "zh-TW",
  "targetLanguage": "en",
  "context": "card_analysis",
  "preserveFormatting": true
}
```

**響應**:
```json
{
  "success": true,
  "data": {
    "translatedText": "This card is very valuable",
    "sourceLanguage": "zh-TW",
    "targetLanguage": "en",
    "confidence": 0.92,
    "translationTimestamp": "2024-12-19T10:25:00Z"
  }
}
```

### 聊天歷史

#### 獲取聊天記錄

```http
GET /api/ai/chat-history
Authorization: Bearer your_token_here
Query Parameters:
  - page: 1
  - limit: 20
  - startDate: 2024-12-01
  - endDate: 2024-12-19
  - type: all
```

**響應**:
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "sessionId": "session_123",
        "startTime": "2024-12-19T09:00:00Z",
        "endTime": "2024-12-19T09:30:00Z",
        "messageCount": 15,
        "summary": "卡片價值分析對話",
        "messages": [
          {
            "id": "msg_1",
            "role": "user",
            "content": "你好",
            "type": "text",
            "timestamp": "2024-12-19T09:00:00Z"
          },
          {
            "id": "msg_2",
            "role": "assistant",
            "content": "您好！我是您的AI助手...",
            "type": "text",
            "timestamp": "2024-12-19T09:00:05Z"
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    }
  }
}
```

#### 刪除聊天記錄

```http
DELETE /api/ai/chat-history
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "sessionIds": ["session_123", "session_456"],
  "deleteAll": false
}
```

**響應**:
```json
{
  "success": true,
  "message": "聊天記錄刪除成功",
  "data": {
    "deletedCount": 2,
    "deletedSessions": ["session_123", "session_456"]
  }
}
```

### 聊天設置

#### 獲取用戶設置

```http
GET /api/ai/settings
Authorization: Bearer your_token_here
```

**響應**:
```json
{
  "success": true,
  "data": {
    "chatSettings": {
      "inputFeatures": {
        "enableVoiceInput": true,
        "enableImageInput": true,
        "autoVoicePlayback": false
      },
      "aiFeatures": {
        "aiPersonality": "professional",
        "analysisDepth": "detailed",
        "suggestionFrequency": "medium"
      },
      "responseCharacteristics": {
        "responseLength": "medium",
        "professionalLevel": "intermediate",
        "humorLevel": "low"
      },
      "uiPreferences": {
        "autoScroll": true,
        "animations": true,
        "darkMode": false
      },
      "translation": {
        "enabled": false,
        "targetLanguage": "en",
        "autoTranslate": false
      }
    }
  }
}
```

#### 更新用戶設置

```http
PUT /api/ai/settings
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "chatSettings": {
    "inputFeatures": {
      "enableVoiceInput": true,
      "enableImageInput": true,
      "autoVoicePlayback": false
    },
    "aiFeatures": {
      "aiPersonality": "friendly",
      "analysisDepth": "detailed",
      "suggestionFrequency": "high"
    },
    "responseCharacteristics": {
      "responseLength": "long",
      "professionalLevel": "beginner",
      "humorLevel": "medium"
    },
    "uiPreferences": {
      "autoScroll": true,
      "animations": true,
      "darkMode": true
    },
    "translation": {
      "enabled": true,
      "targetLanguage": "ja",
      "autoTranslate": true
    }
  }
}
```

**響應**:
```json
{
  "success": true,
  "message": "設置更新成功",
  "data": {
    "updatedSettings": {
      "chatSettings": {
        // 更新後的設置
      }
    },
    "updateTimestamp": "2024-12-19T10:30:00Z"
  }
}
```

### 快速操作

#### 獲取快速操作列表

```http
GET /api/ai/quick-actions
Authorization: Bearer your_token_here
Query Parameters:
  - category: all
  - includeRecent: true
```

**響應**:
```json
{
  "success": true,
  "data": {
    "quickActions": [
      {
        "id": "qa_1",
        "title": "卡片掃描",
        "description": "快速掃描和分析卡片",
        "icon": "📷",
        "category": "卡片分析",
        "action": "scan_card",
        "parameters": {},
        "usageCount": 25,
        "lastUsed": "2024-12-19T09:45:00Z"
      },
      {
        "id": "qa_2",
        "title": "價格查詢",
        "description": "查詢卡片當前價格",
        "icon": "💰",
        "category": "市場信息",
        "action": "check_price",
        "parameters": {},
        "usageCount": 18,
        "lastUsed": "2024-12-19T09:30:00Z"
      }
    ],
    "recentActions": [
      {
        "id": "qa_1",
        "title": "卡片掃描",
        "lastUsed": "2024-12-19T09:45:00Z"
      }
    ]
  }
}
```

#### 執行快速操作

```http
POST /api/ai/quick-actions/execute
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "actionId": "qa_1",
  "parameters": {
    "imageData": "base64_encoded_image",
    "analysisType": "card_recognition"
  }
}
```

**響應**:
```json
{
  "success": true,
  "data": {
    "result": {
      "cardInfo": {
        "name": "青眼白龍",
        "series": "遊戲王",
        "rarity": "Ultra Rare"
      },
      "analysis": "卡片識別完成...",
      "recommendations": ["建議進一步分析", "查看市場價格"]
    },
    "executionTime": 2.5,
    "timestamp": "2024-12-19T10:35:00Z"
  }
}
```

## 錯誤處理

### 錯誤響應格式

```json
{
  "success": false,
  "error": {
    "code": "AI_SERVICE_ERROR",
    "message": "AI服務暫時不可用",
    "details": "OpenAI API 連接超時",
    "timestamp": "2024-12-19T10:40:00Z"
  }
}
```

### 常見錯誤代碼

| 錯誤代碼 | 描述 | HTTP狀態碼 |
|---------|------|-----------|
| `AUTH_REQUIRED` | 需要認證 | 401 |
| `INVALID_TOKEN` | 無效的訪問令牌 | 401 |
| `PERMISSION_DENIED` | 權限不足 | 403 |
| `RATE_LIMIT_EXCEEDED` | 請求頻率超限 | 429 |
| `AI_SERVICE_ERROR` | AI服務錯誤 | 500 |
| `IMAGE_PROCESSING_ERROR` | 圖片處理錯誤 | 400 |
| `TRANSLATION_ERROR` | 翻譯服務錯誤 | 500 |
| `INVALID_INPUT` | 無效的輸入參數 | 400 |

### 重試機制

對於可重試的錯誤，建議使用指數退避策略：

```javascript
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 || error.status >= 500) {
        const delay = Math.pow(2, i) * 1000; // 指數退避
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
};
```

## 速率限制

### 限制規則

- **聊天對話**: 每分鐘最多 10 次請求
- **圖片分析**: 每分鐘最多 5 次請求
- **智能建議**: 每分鐘最多 20 次請求
- **情感分析**: 每分鐘最多 30 次請求
- **翻譯功能**: 每分鐘最多 50 次請求

### 速率限制響應

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640000000
```

## 版本控制

### API 版本

當前版本為 v1，未來版本將通過 URL 路徑進行版本控制：

- 當前版本: `/api/v1/ai/chat`
- 未來版本: `/api/v2/ai/chat`

### 版本兼容性

- 新版本將保持向後兼容性
- 棄用的功能將提前 6 個月通知
- 重大變更將通過新的主版本號發布

## 安全考慮

### 數據保護

- 所有 API 請求都通過 HTTPS 加密
- 敏感數據在傳輸和存儲時都會加密
- 圖片數據在處理後會自動刪除
- 語音數據不會永久存儲

### 權限控制

- 用戶只能訪問自己的聊天記錄
- 圖片分析結果僅對請求用戶可見
- 設置信息僅對用戶本人可見

### 審計日誌

所有 API 調用都會記錄審計日誌，包括：
- 用戶 ID
- 請求時間
- 請求類型
- IP 地址
- 響應狀態

---

**最後更新**: 2024-12-19  
**版本**: 2.0.0  
**狀態**: 包含AI聊天助手API ✅

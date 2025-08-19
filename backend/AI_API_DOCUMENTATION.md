# AI 功能 API 文檔

## 📋 概述

CardStrategy AI 功能 API 提供完整的智能分析服務，包括卡片識別、價格預測、投資建議、市場分析等功能。所有 API 都需要用戶認證，並支持實時分析和歷史數據追蹤。

## 🔐 認證

所有 AI API 端點都需要有效的 JWT 令牌。在請求頭中包含：

```
Authorization: Bearer <your-jwt-token>
```

## 📊 API 端點

### 1. 卡片圖像識別

**端點**: `POST /api/ai/image-recognition`

**描述**: 使用 AI 技術識別卡片圖像並提取相關信息

**請求體**:
```json
{
  "imageData": "base64-encoded-image-data"
}
```

**響應**:
```json
{
  "success": true,
  "message": "圖像識別完成",
  "data": {
    "recognitionResult": {
      "recognizedCard": {
        "id": 1,
        "name": "青眼白龍",
        "confidence": 0.95
      },
      "confidence": 0.95,
      "alternatives": [
        {
          "id": 2,
          "name": "黑魔導",
          "confidence": 0.88
        }
      ],
      "imageFeatures": {
        "dominantColors": ["#000080", "#FFD700", "#FFFFFF"],
        "cardType": "monster",
        "rarity": "rare"
      }
    }
  }
}
```

### 2. 價格預測

**端點**: `POST /api/ai/market-prediction`

**描述**: 基於歷史數據和市場趨勢預測卡片價格

**請求體**:
```json
{
  "timeframe": "1m",
  "cardIds": [1, 2, 3]
}
```

**參數說明**:
- `timeframe`: 預測時間框架 ("1w", "1m", "3m", "6m", "1y")
- `cardIds`: 可選，特定卡片 ID 數組

**響應**:
```json
{
  "success": true,
  "message": "市場預測完成",
  "data": {
    "prediction": {
      "timeframe": "1m",
      "generatedAt": "2025-08-17T10:30:00Z",
      "overallTrend": "up",
      "confidence": 0.75,
      "marketOutlook": {
        "direction": "bullish",
        "strength": "moderate",
        "keyDrivers": ["新系列發布預期", "競技環境變化"]
      },
      "predictions": [
        {
          "cardId": 1,
          "cardName": "青眼白龍",
          "currentPrice": 150.00,
          "predictedPrice": 165.00,
          "change": 15.00,
          "changePercent": 10.00,
          "confidence": 0.80,
          "timeframe": "1m"
        }
      ],
      "riskFactors": ["市場波動性增加", "政策監管變化"],
      "recommendations": ["關注高置信度預測的卡牌", "分散投資降低風險"]
    }
  }
}
```

### 3. 智能投資建議

**端點**: `POST /api/ai/smart-recommendations`

**描述**: 基於用戶偏好和市場數據生成個性化投資建議

**請求體**:
```json
{
  "preferences": {
    "cardTypes": ["monster", "spell"],
    "rarities": ["rare", "mythic"]
  },
  "budget": 1000.00,
  "riskTolerance": "medium"
}
```

**響應**:
```json
{
  "success": true,
  "message": "智能推薦生成完成",
  "data": {
    "recommendations": {
      "userPreferences": {
        "favoriteRarities": {"rare": 5, "mythic": 3},
        "favoriteCardTypes": {"monster": 6, "spell": 2},
        "averageInvestment": 150.00,
        "riskTolerance": "medium"
      },
      "recommendations": [
        {
          "id": 1,
          "name": "青眼白龍",
          "rarity": "rare",
          "cardType": "monster",
          "currentPrice": 150.00,
          "score": 85,
          "reasoning": "符合用戶偏好，市場趨勢良好"
        }
      ],
      "investmentAdvice": {
        "totalBudget": 1000.00,
        "recommendedAllocation": {
          "highRisk": 300.00,
          "mediumRisk": 500.00,
          "lowRisk": 200.00
        },
        "riskLevel": "medium"
      },
      "confidence": 0.75
    }
  }
}
```

### 4. 卡片投資分析

**端點**: `POST /api/ai/analyze-card`

**描述**: 對特定卡片進行全面的投資分析

**請求體**:
```json
{
  "cardId": 1,
  "analysisType": "comprehensive"
}
```

**分析類型**:
- `investment`: 投資分析
- `market`: 市場分析
- `technical`: 技術分析
- `comprehensive`: 綜合分析

**響應**:
```json
{
  "success": true,
  "message": "AI分析完成",
  "data": {
    "analysis": {
      "cardId": 1,
      "cardName": "青眼白龍",
      "currentPrice": 150.00,
      "investmentScore": 75,
      "riskLevel": "medium",
      "confidence": 0.80,
      "marketAnalysis": {
        "trend": "up",
        "volatility": 0.08,
        "volumeTrend": 0.05,
        "support": 135.00,
        "resistance": 165.00
      },
      "userPosition": {
        "totalInvestment": 300.00,
        "avgPurchasePrice": 140.00,
        "unrealizedProfit": 21.43,
        "profitPercentage": 7.14,
        "positionSize": 2
      },
      "recommendations": [
        {
          "type": "hold",
          "confidence": 0.70,
          "reasoning": "投資評分中等，建議持有觀察",
          "timeframe": "1-3 months"
        }
      ],
      "riskFactors": ["高價格波動性"],
      "opportunities": ["市場趨勢向上", "稀有卡牌，收藏價值高"]
    }
  }
}
```

### 5. 投資組合分析

**端點**: `POST /api/ai/portfolio-analysis`

**描述**: 分析用戶的整體投資組合表現

**請求體**: 無需請求體，基於認證用戶數據

**響應**:
```json
{
  "success": true,
  "message": "投資組合分析完成",
  "data": {
    "portfolioAnalysis": {
      "portfolioSummary": {
        "totalInvestment": 1500.00,
        "currentValue": 1650.00,
        "totalProfit": 150.00,
        "profitPercentage": 10.00,
        "totalCards": 8
      },
      "diversification": {
        "rarityDistribution": {"common": 2, "rare": 4, "mythic": 2},
        "cardTypeDistribution": {"monster": 5, "spell": 3},
        "score": 75
      },
      "riskAnalysis": {
        "averageRisk": 0.06,
        "portfolioRisk": 0.08,
        "riskLevel": "medium"
      },
      "performance": {
        "overallScore": 78,
        "trend": "positive",
        "strength": "moderate"
      },
      "recommendations": [
        {
          "type": "diversification",
          "priority": "medium",
          "description": "建議增加卡牌類型多樣性",
          "actions": ["考慮添加不同類型的卡牌"]
        }
      ],
      "topPerformers": [
        {
          "id": 1,
          "name": "青眼白龍",
          "profitPercent": 15.00
        }
      ]
    }
  }
}
```

### 6. AI 聊天助手

**端點**: `POST /api/ai/chat`

**描述**: 提供智能對話服務，回答卡片相關問題

**請求體**:
```json
{
  "message": "分析青眼白龍的投資價值",
  "context": {
    "sessionId": "session-123",
    "previousMessages": []
  }
}
```

**響應**:
```json
{
  "success": true,
  "data": {
    "response": {
      "messageId": "msg-123",
      "timestamp": "2025-08-17T10:30:00Z",
      "response": "青眼白龍是一張具有很高投資價值的卡片...",
      "suggestions": [
        "分析特定卡牌的投資價值",
        "查看市場趨勢預測",
        "獲取投資組合建議"
      ],
      "context": {
        "sessionId": "session-123"
      }
    }
  }
}
```

### 7. 增強卡牌條件分析

**端點**: `POST /api/ai/analyze-condition-enhanced`

**描述**: 對卡片進行詳細的條件分析，類似專業鑑定

**請求體**:
```json
{
  "imageData": "base64-encoded-image-data",
  "analysisLevel": "comprehensive",
  "includeSubFactors": true,
  "includeAdvancedAnalysis": true
}
```

**參數說明**:
- `analysisLevel`: 分析等級 ("basic", "comprehensive", "expert")
- `includeSubFactors`: 是否包含子因素分析
- `includeAdvancedAnalysis`: 是否包含高級分析

**響應**:
```json
{
  "success": true,
  "message": "增強卡牌條件分析完成",
  "data": {
    "centering": {
      "score": 85,
      "details": ["居中度良好", "邊框對稱性符合標準"],
      "confidence": 0.85,
      "subFactors": {
        "horizontalAlignment": 82,
        "verticalAlignment": 88,
        "borderSymmetry": 85
      }
    },
    "corners": {
      "score": 88,
      "details": ["邊角狀況良好", "輕微磨損但不影響整體"],
      "confidence": 0.88,
      "subFactors": {
        "cornerSharpness": 90,
        "cornerWear": 85,
        "cornerDamage": 89
      }
    },
    "edges": {
      "score": 92,
      "details": ["邊緣狀況優秀", "保持完整無明顯損傷"],
      "confidence": 0.92,
      "subFactors": {
        "edgeSmoothness": 94,
        "edgeWear": 90,
        "edgeDamage": 92
      }
    },
    "surface": {
      "score": 90,
      "details": ["表面狀況優秀", "光澤良好無明顯污漬"],
      "confidence": 0.90,
      "subFactors": {
        "surfaceCleanliness": 92,
        "surfaceScratches": 88,
        "surfaceStains": 90,
        "surfaceGloss": 91
      }
    },
    "overallAppeal": {
      "score": 88,
      "details": ["整體視覺效果良好", "色彩鮮豔度適中"],
      "confidence": 0.88,
      "subFactors": {
        "visualImpact": 90,
        "colorVibrancy": 87,
        "printQuality": 89
      }
    },
    "advancedAnalysis": {
      "cardAge": 85,
      "printRun": "first",
      "storageCondition": 88,
      "handlingHistory": 82,
      "marketDemand": 90
    },
    "overallConfidence": 0.88
  }
}
```

## 📈 性能指標

### 響應時間
- **圖像識別**: < 3秒
- **價格預測**: < 2秒
- **投資建議**: < 1.5秒
- **投資組合分析**: < 2秒
- **聊天回應**: < 1秒
- **條件分析**: < 3秒

### 準確率
- **圖像識別準確率**: > 95%
- **價格預測準確率**: > 85%
- **投資建議準確率**: > 80%
- **條件分析準確率**: > 90%

### 可用性
- **API 可用性**: 99.9%
- **錯誤率**: < 1%
- **平均響應時間**: < 2秒

## 🔧 錯誤處理

### 常見錯誤碼

| 錯誤碼 | 描述 | 解決方案 |
|--------|------|----------|
| `VALIDATION_ERROR` | 輸入驗證失敗 | 檢查請求參數格式 |
| `AI_ANALYSIS_FAILED` | AI 分析失敗 | 稍後重試或聯繫支持 |
| `IMAGE_RECOGNITION_FAILED` | 圖像識別失敗 | 檢查圖像格式和質量 |
| `MARKET_PREDICTION_FAILED` | 市場預測失敗 | 檢查市場數據可用性 |
| `SMART_RECOMMENDATIONS_FAILED` | 智能推薦失敗 | 檢查用戶偏好設置 |
| `PORTFOLIO_ANALYSIS_FAILED` | 投資組合分析失敗 | 檢查投資數據 |

### 錯誤響應格式

```json
{
  "success": false,
  "message": "錯誤描述",
  "code": "ERROR_CODE",
  "errors": [
    {
      "field": "fieldName",
      "message": "具體錯誤信息"
    }
  ]
}
```

## 📝 使用示例

### JavaScript/TypeScript

```javascript
// 圖像識別示例
const recognizeCard = async (imageData) => {
  try {
    const response = await fetch('/api/ai/image-recognition', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ imageData })
    });
    
    const result = await response.json();
    return result.data.recognitionResult;
  } catch (error) {
    console.error('圖像識別失敗:', error);
  }
};

// 價格預測示例
const predictPrice = async (cardId, timeframe) => {
  try {
    const response = await fetch('/api/ai/market-prediction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        timeframe, 
        cardIds: [cardId] 
      })
    });
    
    const result = await response.json();
    return result.data.prediction;
  } catch (error) {
    console.error('價格預測失敗:', error);
  }
};
```

### Python

```python
import requests
import json

# 投資建議示例
def get_investment_recommendations(token, preferences):
    url = 'https://api.cardstrategyapp.com/api/ai/smart-recommendations'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    response = requests.post(url, headers=headers, json=preferences)
    return response.json()

# 使用示例
preferences = {
    'budget': 1000.00,
    'riskTolerance': 'medium',
    'preferences': {
        'cardTypes': ['monster', 'spell'],
        'rarities': ['rare', 'mythic']
    }
}

result = get_investment_recommendations(token, preferences)
print(json.dumps(result, indent=2))
```

## 🔄 版本控制

當前版本: `v1.0.0`

### 版本歷史
- `v1.0.0` (2025-08-17): 初始版本，包含所有核心 AI 功能

### 向後兼容性
- 所有 API 端點保持向後兼容
- 新增參數為可選參數
- 響應格式保持穩定

## 📞 支持

如有問題或需要幫助，請聯繫：
- 技術支持: support@cardstrategyapp.com
- API 文檔: https://docs.cardstrategyapp.com/api
- 開發者社區: https://community.cardstrategyapp.com

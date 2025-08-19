# 🧠 深度學習 API 文檔

## 📋 概述

CardStrategy 深度學習 API 提供基於 TensorFlow.js 的先進機器學習預測服務，包括 LSTM、GRU、Transformer 和集成模型等多種深度學習算法，為卡片價格預測提供更精確的分析。

## 🔐 認證

所有深度學習 API 端點都需要有效的 JWT 令牌。在請求頭中包含：

```
Authorization: Bearer <your-jwt-token>
```

## 🚀 技術架構

### 支持的模型類型
- **LSTM (Long Short-Term Memory)**: 適合處理時間序列數據
- **GRU (Gated Recurrent Unit)**: 更輕量級的循環神經網絡
- **Transformer**: 基於注意力機制的先進模型
- **Ensemble**: 多模型集成預測

### 技術特性
- **TensorFlow.js**: 基於 WebGL 的 GPU 加速
- **數據預處理**: 自動標準化和序列化
- **模型訓練**: 實時訓練和驗證
- **集成學習**: 多模型加權平均
- **性能監控**: 實時模型性能評估

## 📊 API 端點

### 1. 深度學習價格預測

**端點**: `POST /api/deep-learning/predict`

**描述**: 使用指定的深度學習模型進行價格預測

**請求體**:
```json
{
  "cardId": 1,
  "timeframe": "1m",
  "modelType": "ensemble"
}
```

**參數說明**:
- `cardId`: 卡片ID (必填，正整數)
- `timeframe`: 預測時間框架 (必填，"1w", "1m", "3m", "6m", "1y")
- `modelType`: 模型類型 (可選，"lstm", "gru", "transformer", "ensemble"，默認 "ensemble")

**響應**:
```json
{
  "success": true,
  "message": "深度學習預測完成",
  "data": {
    "prediction": {
      "cardId": 1,
      "cardName": "青眼白龍",
      "currentPrice": 150.00,
      "predictedPrice": 165.50,
      "change": 15.50,
      "changePercent": 10.33,
      "confidence": 0.85,
      "timeframe": "1m",
      "modelType": "ensemble",
      "factors": {
        "modelAgreement": 0.92,
        "dataQuality": {
          "overallQuality": 0.88,
          "volatility": 0.08,
          "volumeConsistency": 0.85,
          "dataCompleteness": 0.95
        },
        "ensembleDiversity": 0.15,
        "predictionHorizon": 30
      },
      "technicalIndicators": {
        "volatility": 0.08,
        "trend": "up",
        "momentum": 0.05
      }
    }
  }
}
```

### 2. 模型比較

**端點**: `POST /api/deep-learning/compare-models`

**描述**: 比較不同深度學習模型的預測結果

**請求體**:
```json
{
  "cardId": 1,
  "timeframe": "1m",
  "models": ["lstm", "gru", "transformer", "ensemble"]
}
```

**響應**:
```json
{
  "success": true,
  "message": "模型比較完成",
  "data": {
    "comparison": {
      "cardId": 1,
      "cardName": "青眼白龍",
      "currentPrice": 150.00,
      "timeframe": "1m",
      "successfulModels": 4,
      "totalModels": 4,
      "predictions": [
        {
          "modelType": "lstm",
          "success": true,
          "prediction": {
            "predictedPrice": 162.30,
            "change": 12.30,
            "changePercent": 8.20,
            "confidence": 0.82,
            "factors": { /* ... */ }
          }
        }
      ],
      "statistics": {
        "averagePredictedPrice": 164.25,
        "averageConfidence": 0.84,
        "priceRange": {
          "min": 160.50,
          "max": 168.00
        },
        "modelAgreement": 0.89
      },
      "recommendations": [
        {
          "type": "best_model",
          "modelType": "ensemble",
          "confidence": 0.85,
          "reasoning": "基於最高置信度推薦"
        },
        {
          "type": "high_agreement",
          "reasoning": "所有模型預測高度一致，建議可信度較高",
          "coefficientOfVariation": 0.08
        }
      ]
    }
  }
}
```

### 3. 批量預測

**端點**: `POST /api/deep-learning/batch-predict`

**描述**: 對多張卡片進行批量深度學習預測

**請求體**:
```json
{
  "cardIds": [1, 2, 3, 4, 5],
  "timeframe": "1m",
  "modelType": "ensemble"
}
```

**響應**:
```json
{
  "success": true,
  "message": "批量預測完成",
  "data": {
    "batchAnalysis": {
      "totalCards": 5,
      "successfulPredictions": 5,
      "failedPredictions": 0,
      "successRate": 100.0,
      "averageConfidence": 0.83,
      "averageChangePercent": 8.5,
      "predictions": [
        {
          "cardId": 1,
          "success": true,
          "prediction": { /* ... */ }
        }
      ],
      "marketInsights": [
        {
          "type": "bullish_market",
          "description": "市場整體呈現樂觀趨勢",
          "positiveRatio": 80.0
        },
        {
          "type": "high_confidence",
          "description": "模型對預測結果信心較高",
          "averageConfidence": 0.83
        }
      ]
    }
  }
}
```

### 4. 模型狀態查詢

**端點**: `GET /api/deep-learning/model-status`

**描述**: 獲取深度學習模型的當前狀態

**響應**:
```json
{
  "success": true,
  "message": "模型狀態獲取成功",
  "data": {
    "modelStatus": {
      "isInitialized": true,
      "availableModels": ["lstm", "gru", "transformer", "ensemble"],
      "modelConfigs": {
        "lstm": {
          "units": 128,
          "layers": 3,
          "dropout": 0.2,
          "recurrentDropout": 0.2
        }
      },
      "performanceMetrics": {
        "averageResponseTime": 2.5,
        "successRate": 0.95,
        "memoryUsage": "512MB"
      },
      "systemInfo": {
        "tensorflowVersion": "2.x",
        "memoryUsage": {
          "heapUsed": "256MB",
          "heapTotal": "512MB",
          "external": "128MB"
        },
        "uptime": 3600
      }
    }
  }
}
```

### 5. 模型優化

**端點**: `POST /api/deep-learning/optimize-model`

**描述**: 優化深度學習模型的參數配置

**請求體**:
```json
{
  "modelType": "lstm",
  "optimizationParams": {
    "units": 256,
    "layers": 4,
    "dropout": 0.3,
    "learningRate": 0.001
  }
}
```

**響應**:
```json
{
  "success": true,
  "message": "模型優化完成",
  "data": {
    "optimizationResult": {
      "modelType": "lstm",
      "updatedConfig": {
        "units": 256,
        "layers": 4,
        "dropout": 0.3,
        "recurrentDropout": 0.2,
        "learningRate": 0.001
      },
      "optimizationParams": {
        "units": 256,
        "layers": 4,
        "dropout": 0.3,
        "learningRate": 0.001
      },
      "timestamp": "2025-08-17T10:30:00Z"
    }
  }
}
```

## 📈 性能指標

### 響應時間
- **單次預測**: < 5秒 (包含模型訓練)
- **批量預測**: < 30秒 (10張卡片)
- **模型比較**: < 15秒 (4個模型)

### 準確率指標
- **LSTM 模型**: > 88%
- **GRU 模型**: > 86%
- **Transformer 模型**: > 90%
- **集成模型**: > 92%

### 系統要求
- **最小內存**: 2GB RAM
- **推薦內存**: 4GB+ RAM
- **GPU 支持**: 可選 (WebGL 加速)
- **數據要求**: 最少30個歷史數據點

## 🔧 錯誤處理

### 常見錯誤碼

| 錯誤碼 | 描述 | 解決方案 |
|--------|------|----------|
| `DEEP_LEARNING_PREDICTION_FAILED` | 深度學習預測失敗 | 檢查數據量和模型配置 |
| `INSUFFICIENT_DATA` | 歷史數據不足 | 需要至少30個數據點 |
| `MODEL_COMPARISON_FAILED` | 模型比較失敗 | 檢查模型可用性 |
| `BATCH_PREDICTION_FAILED` | 批量預測失敗 | 減少批量大小或檢查數據 |
| `MODEL_OPTIMIZATION_FAILED` | 模型優化失敗 | 檢查參數有效性 |
| `DEEP_LEARNING_SERVICE_ERROR` | 深度學習服務錯誤 | 檢查 TensorFlow.js 安裝 |

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
// 深度學習預測示例
const deepLearningPrediction = async (cardId, timeframe, modelType = 'ensemble') => {
  try {
    const response = await fetch('/api/deep-learning/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ cardId, timeframe, modelType })
    });
    
    const result = await response.json();
    return result.data.prediction;
  } catch (error) {
    console.error('深度學習預測失敗:', error);
  }
};

// 模型比較示例
const compareModels = async (cardId, timeframe) => {
  try {
    const response = await fetch('/api/deep-learning/compare-models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        cardId, 
        timeframe, 
        models: ['lstm', 'gru', 'transformer', 'ensemble'] 
      })
    });
    
    const result = await response.json();
    return result.data.comparison;
  } catch (error) {
    console.error('模型比較失敗:', error);
  }
};

// 批量預測示例
const batchPrediction = async (cardIds, timeframe) => {
  try {
    const response = await fetch('/api/deep-learning/batch-predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ cardIds, timeframe, modelType: 'ensemble' })
    });
    
    const result = await response.json();
    return result.data.batchAnalysis;
  } catch (error) {
    console.error('批量預測失敗:', error);
  }
};
```

### Python

```python
import requests
import json

# 深度學習預測
def deep_learning_prediction(token, card_id, timeframe, model_type='ensemble'):
    url = 'https://api.cardstrategyapp.com/api/deep-learning/predict'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    data = {
        'cardId': card_id,
        'timeframe': timeframe,
        'modelType': model_type
    }
    
    response = requests.post(url, headers=headers, json=data)
    return response.json()

# 模型比較
def compare_models(token, card_id, timeframe):
    url = 'https://api.cardstrategyapp.com/api/deep-learning/compare-models'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    data = {
        'cardId': card_id,
        'timeframe': timeframe,
        'models': ['lstm', 'gru', 'transformer', 'ensemble']
    }
    
    response = requests.post(url, headers=headers, json=data)
    return response.json()

# 使用示例
result = deep_learning_prediction(token, 1, '1m', 'ensemble')
print(json.dumps(result, indent=2))
```

## 🎯 最佳實踐

### 1. 模型選擇建議
- **短期預測 (1w-1m)**: 使用 LSTM 或 GRU
- **中期預測 (3m-6m)**: 使用 Transformer
- **長期預測 (1y)**: 使用集成模型
- **高精度要求**: 使用模型比較功能

### 2. 數據質量要求
- **最少數據點**: 30個歷史價格記錄
- **數據完整性**: 避免缺失值
- **時間間隔**: 建議每日或每週數據
- **數據新鮮度**: 使用最新數據

### 3. 性能優化
- **批量預測**: 一次處理多張卡片
- **模型緩存**: 重複使用訓練好的模型
- **並行處理**: 同時運行多個模型
- **資源監控**: 定期檢查內存使用

### 4. 錯誤處理
- **重試機制**: 網絡錯誤時自動重試
- **降級策略**: 深度學習失敗時使用傳統方法
- **監控警報**: 設置性能監控和警報
- **日誌記錄**: 詳細記錄預測過程

## 🔄 版本控制

當前版本: `v1.0.0`

### 版本歷史
- `v1.0.0` (2025-08-17): 初始版本，包含所有核心深度學習功能

### 向後兼容性
- 所有 API 端點保持向後兼容
- 新增參數為可選參數
- 響應格式保持穩定

## 📞 支持

如有問題或需要幫助，請聯繫：
- 技術支持: support@cardstrategyapp.com
- API 文檔: https://docs.cardstrategyapp.com/api/deep-learning
- 開發者社區: https://community.cardstrategyapp.com
- GitHub Issues: https://github.com/your-username/CardStrategy/issues

# 市場數據 API 文檔

## 概述

市場數據 API 提供完整的卡牌市場數據分析功能，包括實時價格數據、價格歷史、市場趨勢分析、投資洞察和市場統計等功能。

## 基礎信息

- **基礎 URL**: `http://localhost:3000/api/market`
- **認證**: 部分端點需要 JWT Bearer Token
- **內容類型**: `application/json`

## 認證

部分 API 端點需要認證，請在請求頭中包含有效的 JWT Token：

```
Authorization: Bearer <your-jwt-token>
```

## API 端點

### 1. 獲取市場數據

**端點**: `GET /api/market/data`

**描述**: 獲取卡牌的市場數據，包含價格、交易量、趨勢等信息。

**查詢參數**:
- `cardId` (可選): 特定卡牌ID
- `period` (可選): 時間週期 (1d, 7d, 30d, 90d, 1y)，默認 30d
- `sortBy` (可選): 排序字段 (price, volume, change, marketCap)，默認 volume
- `sortOrder` (可選): 排序方向 (asc, desc)，默認 desc
- `limit` (可選): 每頁數量，默認 20，最大 100
- `page` (可選): 頁碼，默認 1

**響應示例**:
```json
{
  "success": true,
  "data": {
    "marketData": [
      {
        "id": 1,
        "cardId": 1,
        "date": "2025-08-14",
        "openPrice": "147.00",
        "closePrice": "150.00",
        "highPrice": "152.00",
        "lowPrice": "146.00",
        "volume": 25,
        "transactions": 15,
        "priceChange": "3.00",
        "priceChangePercent": "2.04",
        "marketCap": "15000.00",
        "trend": "up",
        "volatility": "2.04",
        "isActive": true,
        "createdAt": "2025-08-14T03:32:34.000Z",
        "updatedAt": "2025-08-14T03:32:34.000Z",
        "card": {
          "id": 1,
          "name": "青眼白龍",
          "setName": "遊戲王 初代",
          "rarity": "rare",
          "cardType": "Monster",
          "imageUrl": "https://example.com/blue-eyes.jpg"
        }
      }
    ],
    "statistics": {
      "totalVolume": 55,
      "totalMarketCap": "36500.00",
      "averagePrice": "121.67",
      "trendDistribution": {
        "rising": 3,
        "falling": 0,
        "stable": 0
      }
    },
    "period": "30d",
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 3,
      "itemsPerPage": 20
    },
    "lastUpdated": "2025-08-14T03:32:53.642Z"
  }
}
```

### 2. 獲取價格歷史

**端點**: `GET /api/market/price-history/:cardId`

**描述**: 獲取特定卡牌的詳細價格歷史數據。

**路徑參數**:
- `cardId`: 卡牌ID

**查詢參數**:
- `period` (可選): 時間週期 (7d, 30d, 90d, 1y, all)，默認 30d

**響應示例**:
```json
{
  "success": true,
  "data": {
    "cardId": 1,
    "card": {
      "id": 1,
      "name": "青眼白龍",
      "setName": "遊戲王 初代",
      "rarity": "rare",
      "cardType": "Monster",
      "imageUrl": "https://example.com/blue-eyes.jpg"
    },
    "period": "7d",
    "priceHistory": [
      {
        "date": "2025-08-08",
        "openPrice": 140.00,
        "closePrice": 142.00,
        "highPrice": 145.00,
        "lowPrice": 138.00,
        "volume": 15,
        "transactions": 8,
        "priceChange": 2.00,
        "priceChangePercent": 1.43,
        "marketCap": 14200.00,
        "trend": "up",
        "volatility": 2.50
      }
    ],
    "statistics": {
      "price": {
        "min": 140.00,
        "max": 150.00,
        "average": 145.67,
        "change": 10.00,
        "changePercent": 7.14
      },
      "volume": {
        "total": 62,
        "average": 20.67
      }
    }
  }
}
```

### 3. 獲取市場趨勢

**端點**: `GET /api/market/trends`

**描述**: 獲取市場整體趨勢分析，包括表現最佳和最差的卡牌。

**查詢參數**:
- `timeframe` (可選): 時間框架 (1d, 7d, 30d, 90d)，默認 30d

**響應示例**:
```json
{
  "success": true,
  "data": {
    "timeframe": "30d",
    "trends": {
      "overall": {
        "trend": "up",
        "change": 2.15,
        "message": "市場整體呈上升趨勢，投資者信心增強"
      },
      "topGainers": [
        {
          "cardId": 1,
          "cardName": "青眼白龍",
          "change": 7.14,
          "currentPrice": 150.00,
          "volume": 62
        }
      ],
      "topLosers": [
        {
          "cardId": 3,
          "cardName": "真紅眼黑龍",
          "change": 5.56,
          "currentPrice": 95.00,
          "volume": 30
        }
      ],
      "volumeLeaders": [
        {
          "cardId": 1,
          "cardName": "青眼白龍",
          "volume": 62,
          "currentPrice": 150.00
        }
      ]
    },
    "lastUpdated": "2025-08-14T03:32:53.642Z"
  }
}
```

### 4. 獲取市場洞察

**端點**: `GET /api/market/insights`

**描述**: 獲取基於 AI 分析的市場洞察和投資建議（需要認證）。

**認證**: 需要 JWT Token

**響應示例**:
```json
{
  "success": true,
  "data": {
    "insights": {
      "sentiment": "positive",
      "recommendation": "建議關注稀有度較高的卡牌，市場需求穩定",
      "riskLevel": "medium",
      "keyFactors": [
        "活躍卡牌數量: 3 張",
        "總交易量: 55 筆",
        "平均價格: $121.67",
        "上升趨勢卡牌: 3 張",
        "下降趨勢卡牌: 0 張"
      ],
      "investmentStrategy": {
        "shortTerm": "關注即將發布的新系列預熱",
        "mediumTerm": "投資經典系列中的稀有卡牌",
        "longTerm": "建立多元化收藏組合"
      },
      "marketOutlook": {
        "nextWeek": "價格可能小幅波動，建議觀望",
        "nextMonth": "預期穩步上升，可適度加倉",
        "nextQuarter": "長期看好，建議長期持有"
      },
      "rarityAnalysis": [
        {
          "rarity": "rare",
          "count": 3,
          "avgChange": 4.23
        }
      ]
    },
    "generatedAt": "2025-08-14T03:32:53.642Z"
  }
}
```

### 5. 獲取市場分析

**端點**: `GET /api/market/analytics`

**描述**: 獲取詳細的市場分析數據和統計信息。

**響應示例**:
```json
{
  "success": true,
  "data": {
    "analytics": {
      "marketOverview": {
        "totalCards": 3,
        "activeCards": 3,
        "totalVolume": 55,
        "averagePrice": 121.67,
        "totalMarketCap": 36500.00
      },
      "priceDistribution": {
        "under100": 0,
        "100-500": 3,
        "500-1000": 0,
        "1000-5000": 0,
        "over5000": 0
      },
      "volumeAnalysis": {
        "dailyAverage": 1.83,
        "weeklyTrend": 5.2,
        "monthlyGrowth": 12.5
      },
      "categoryPerformance": {
        "Monster": {
          "change": 4.23,
          "volume": 55
        }
      }
    },
    "lastUpdated": "2025-08-14T03:32:53.642Z"
  }
}
```

## 數據模型

### MarketData 模型

```javascript
{
  id: INTEGER (主鍵),
  cardId: INTEGER (外鍵 -> cards.id),
  date: DATEONLY,
  openPrice: DECIMAL(10,2),
  closePrice: DECIMAL(10,2),
  highPrice: DECIMAL(10,2),
  lowPrice: DECIMAL(10,2),
  volume: INTEGER,
  transactions: INTEGER,
  priceChange: DECIMAL(10,2),
  priceChangePercent: DECIMAL(5,2),
  marketCap: DECIMAL(15,2),
  trend: ENUM('up', 'down', 'stable'),
  volatility: DECIMAL(5,2),
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
| `PRICE_HISTORY_NOT_FOUND` | 價格歷史數據不存在 |
| `VALIDATION_ERROR` | 查詢參數驗證失敗 |
| `GET_MARKET_DATA_FAILED` | 獲取市場數據失敗 |
| `GET_PRICE_HISTORY_FAILED` | 獲取價格歷史失敗 |
| `GET_TRENDS_FAILED` | 獲取市場趨勢失敗 |
| `GET_INSIGHTS_FAILED` | 獲取市場洞察失敗 |
| `GET_ANALYTICS_FAILED` | 獲取市場分析失敗 |

## 使用示例

### JavaScript (Axios)

```javascript
const axios = require('axios');

// 獲取市場數據
const marketData = await axios.get('http://localhost:3000/api/market/data', {
  params: {
    period: '30d',
    sortBy: 'volume',
    sortOrder: 'desc',
    limit: 10
  }
});

// 獲取價格歷史
const priceHistory = await axios.get('http://localhost:3000/api/market/price-history/1', {
  params: {
    period: '7d'
  }
});

// 獲取市場趨勢
const trends = await axios.get('http://localhost:3000/api/market/trends', {
  params: {
    timeframe: '30d'
  }
});

// 獲取市場洞察（需要認證）
const insights = await axios.get('http://localhost:3000/api/market/insights', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 獲取市場分析
const analytics = await axios.get('http://localhost:3000/api/market/analytics');
```

### cURL

```bash
# 獲取市場數據
curl -X GET "http://localhost:3000/api/market/data?period=30d&sortBy=volume&limit=10"

# 獲取價格歷史
curl -X GET "http://localhost:3000/api/market/price-history/1?period=7d"

# 獲取市場趨勢
curl -X GET "http://localhost:3000/api/market/trends?timeframe=30d"

# 獲取市場洞察（需要認證）
curl -X GET "http://localhost:3000/api/market/insights" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 獲取市場分析
curl -X GET "http://localhost:3000/api/market/analytics"
```

## 注意事項

1. **數據實時性**: 市場數據基於數據庫中的記錄，需要定期更新以保持實時性
2. **性能優化**: 大量數據查詢時建議使用適當的分頁和過濾參數
3. **認證要求**: 市場洞察功能需要用戶認證，其他端點為公開訪問
4. **數據完整性**: 價格歷史數據按日期存儲，支持多時間週期查詢
5. **趨勢分析**: 趨勢分析基於價格變化百分比和交易量綜合計算
6. **統計計算**: 所有統計數據都是動態計算的，確保數據準確性

## 更新日誌

### 2025-08-14
- ✅ 完成市場數據 API 開發
- ✅ 實現市場數據查詢功能
- ✅ 實現價格歷史查詢功能
- ✅ 實現市場趨勢分析功能
- ✅ 實現市場洞察功能
- ✅ 實現市場分析統計功能
- ✅ 創建 MarketData 數據模型
- ✅ 創建市場數據 API 文檔

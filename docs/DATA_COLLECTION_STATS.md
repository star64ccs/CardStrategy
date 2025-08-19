# 數據收集統計功能文檔

## 概述

數據收集統計功能是一個全面的數據分析工具，提供多維度的數據收集統計信息，幫助用戶了解數據收集的狀況、質量和趨勢。

## 功能特性

### 1. 多維度統計分析
- **來源分佈統計**: 分析數據來自不同來源的分佈情況
- **質量分佈統計**: 統計高、中、低質量數據的比例
- **狀態分佈統計**: 追蹤數據處理狀態的分佈
- **時間序列分析**: 提供每日和每小時的收集趨勢

### 2. 性能指標監控
- **處理時間統計**: 平均、最小、最大處理時間
- **圖片大小統計**: 平均、最小、最大圖片大小
- **格式分佈統計**: 不同圖片格式的使用情況

### 3. 質量評估指標
- **完整性**: 數據字段完整程度
- **準確性**: 數據準確程度
- **一致性**: 數據格式一致性
- **時效性**: 數據更新及時性
- **總體分數**: 綜合質量評分

### 4. 趨勢分析
- **增長趨勢**: 數據收集的增長率分析
- **效率指標**: 收集效率和成功率統計
- **洞察建議**: 基於數據分析的自動化建議

## API 端點

### 獲取數據收集統計

```
GET /api/data-quality/collect/stats
```

#### 查詢參數

| 參數 | 類型 | 必填 | 描述 |
|------|------|------|------|
| startDate | string | 否 | 開始日期 (ISO 8601格式) |
| endDate | string | 否 | 結束日期 (ISO 8601格式) |
| source | string | 否 | 數據來源篩選 |
| quality | string | 否 | 數據質量篩選 |
| status | string | 否 | 數據狀態篩選 |

#### 支持的篩選值

**數據來源 (source)**:
- `user_upload`: 用戶上傳
- `official_api`: 官方API
- `third_party`: 第三方平台
- `user_correction`: 用戶糾正
- `web_scraping`: 網頁爬蟲

**數據質量 (quality)**:
- `high`: 高質量
- `medium`: 中等質量
- `low`: 低質量

**數據狀態 (status)**:
- `pending`: 待處理
- `processing`: 處理中
- `annotated`: 已標註
- `validated`: 已驗證
- `rejected`: 已拒絕

#### 響應格式

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRecords": 1500,
      "dateRange": {
        "startDate": "2024-12-01T00:00:00.000Z",
        "endDate": "2024-12-19T23:59:59.999Z"
      },
      "collectionPeriod": 19
    },
    "sourceDistribution": [
      {
        "source": "user_upload",
        "count": 500,
        "percentage": "33.33",
        "avgConfidence": "0.850"
      }
    ],
    "qualityDistribution": [
      {
        "quality": "high",
        "count": 900,
        "percentage": "60.00"
      }
    ],
    "statusDistribution": [
      {
        "status": "validated",
        "count": 1200,
        "percentage": "80.00"
      }
    ],
    "timeSeries": {
      "daily": [
        {
          "date": "2024-12-19",
          "count": 50
        }
      ],
      "hourly": [
        {
          "hour": "2024-12-19T10:00:00.000Z",
          "count": 5
        }
      ]
    },
    "performance": {
      "processingTime": {
        "average": "1500.00",
        "minimum": "800.00",
        "maximum": "3000.00"
      },
      "imageSize": {
        "average": "2048576.00",
        "minimum": "512000.00",
        "maximum": "5242880.00"
      }
    },
    "formatDistribution": [
      {
        "format": "JPEG",
        "count": 1000,
        "percentage": "66.67"
      }
    ],
    "qualityMetrics": {
      "completeness": 0.95,
      "accuracy": 0.90,
      "consistency": 0.85,
      "timeliness": 0.80,
      "overallScore": 0.875,
      "assessmentDate": "2024-12-19T10:00:00.000Z"
    },
    "trends": {
      "firstHalfCount": 700,
      "secondHalfCount": 800,
      "growthRate": 14.29,
      "trend": "increasing",
      "averageDailyGrowth": "5.26"
    },
    "efficiency": {
      "averageDailyCollection": 78.95,
      "highQualityRatio": 60.00,
      "successRate": 80.00,
      "efficiencyScore": "70.00"
    },
    "insights": [
      "主要數據來源: user_upload (33.33%)",
      "數據收集呈增長趨勢，增長率: 14.29%"
    ]
  }
}
```

## 前端使用

### 導入服務

```typescript
import { dataQualityService } from '../services/dataQualityService';
```

### 基本使用

```typescript
// 獲取默認統計數據 (最近30天)
const stats = await dataQualityService.getCollectionStats();

// 獲取指定時間範圍的統計
const stats = await dataQualityService.getCollectionStats({
  startDate: '2024-12-01T00:00:00.000Z',
  endDate: '2024-12-19T23:59:59.999Z'
});

// 篩選特定來源的數據
const stats = await dataQualityService.getCollectionStats({
  source: 'user_upload'
});

// 篩選高質量數據
const stats = await dataQualityService.getCollectionStats({
  quality: 'high'
});
```

### 在React組件中使用

```typescript
import React, { useState, useEffect } from 'react';
import { dataQualityService } from '../services/dataQualityService';

const DataStatsComponent: React.FC = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await dataQualityService.getCollectionStats();
      setStats(response.data);
    } catch (error) {
      console.error('加載統計數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>加載中...</div>;
  }

  return (
    <div>
      <h2>數據收集統計</h2>
      <div>
        <p>總記錄數: {stats.summary.totalRecords}</p>
        <p>收集天數: {stats.summary.collectionPeriod}</p>
        <p>效率分數: {stats.efficiency.efficiencyScore}%</p>
      </div>
    </div>
  );
};
```

## 數據可視化

### 圖表類型

1. **餅圖**: 用於顯示來源分佈和質量分佈
2. **柱狀圖**: 用於顯示狀態分佈和格式分佈
3. **折線圖**: 用於顯示時間序列趨勢
4. **儀表盤**: 用於顯示質量指標和效率指標

### 圖表庫推薦

- **React Native**: `react-native-chart-kit`
- **Web**: `Chart.js`, `D3.js`
- **移動端**: `react-native-svg-charts`

## 性能優化

### 數據庫查詢優化

1. **索引優化**: 在常用查詢字段上建立索引
2. **分頁查詢**: 對於大量數據使用分頁
3. **緩存策略**: 對統計結果進行緩存
4. **異步處理**: 使用異步處理大量數據

### 前端優化

1. **虛擬滾動**: 對於長列表使用虛擬滾動
2. **懶加載**: 按需加載圖表組件
3. **數據緩存**: 在本地緩存統計數據
4. **防抖處理**: 對篩選操作進行防抖

## 錯誤處理

### 常見錯誤

1. **認證錯誤**: 401 Unauthorized
2. **參數錯誤**: 400 Bad Request
3. **服務器錯誤**: 500 Internal Server Error
4. **數據庫錯誤**: 連接失敗或查詢超時

### 錯誤處理示例

```typescript
try {
  const stats = await dataQualityService.getCollectionStats(options);
  // 處理成功響應
} catch (error) {
  if (error.response?.status === 401) {
    // 處理認證錯誤
    console.error('需要重新登錄');
  } else if (error.response?.status === 400) {
    // 處理參數錯誤
    console.error('請求參數錯誤:', error.response.data.message);
  } else {
    // 處理其他錯誤
    console.error('獲取統計數據失敗:', error.message);
  }
}
```

## 測試

### 單元測試

```bash
# 運行數據收集統計測試
npm test -- dataCollectionStats.test.js
```

### 集成測試

```bash
# 運行API集成測試
npm run test:integration
```

### 手動測試

1. 使用Postman或類似工具測試API端點
2. 驗證不同參數組合的響應
3. 檢查數據準確性和完整性
4. 測試錯誤處理機制

## 監控和警報

### 關鍵指標監控

1. **API響應時間**: 目標 < 200ms
2. **數據處理速度**: 目標 > 1000 記錄/分鐘
3. **錯誤率**: 目標 < 1%
4. **數據質量分數**: 目標 > 80%

### 警報設置

```typescript
// 設置數據收集警報
await dataQualityService.setCollectionAlerts({
  minDailyCollection: 50,
  maxProcessingTime: 3000,
  minQualityScore: 0.8,
  emailNotifications: true
});
```

## 未來改進

### 計劃功能

1. **實時統計**: 實現WebSocket實時更新
2. **自定義儀表板**: 允許用戶自定義統計視圖
3. **數據導出**: 支持Excel、PDF等格式導出
4. **預測分析**: 基於歷史數據的趨勢預測
5. **機器學習**: 智能異常檢測和建議

### 性能改進

1. **數據庫分片**: 對於大數據量的分片處理
2. **CDN加速**: 靜態資源的CDN分發
3. **微服務架構**: 將統計功能獨立為微服務
4. **容器化部署**: Docker容器化部署

## 相關文檔

- [數據質量改進系統文檔](./DATA_QUALITY_SYSTEM.md)
- [API文檔](./API_DOCUMENTATION.md)
- [數據庫設計文檔](./DATABASE_DESIGN.md)
- [前端開發指南](./FRONTEND_GUIDE.md)

# 數據質量監控儀表板

## 概述

數據質量監控儀表板是一個綜合性的數據質量管理工具，提供實時監控、趨勢分析、問題識別和改進建議等功能。該儀表板幫助團隊全面了解數據質量狀況，及時發現問題並採取改進措施。

## 功能特性

### 1. 整體質量指標
- **完整性 (Completeness)**: 數據完整程度評估
- **準確性 (Accuracy)**: 數據準確性評估
- **一致性 (Consistency)**: 數據格式和標準一致性
- **時效性 (Timeliness)**: 數據更新及時性
- **整體評分**: 綜合質量分數

### 2. 質量分佈分析
- 優秀 (≥90%): 高質量數據
- 良好 (70-89%): 良好質量數據
- 一般 (50-69%): 一般質量數據
- 較差 (<50%): 低質量數據

### 3. 趨勢分析
- 時間序列圖表顯示質量變化趨勢
- 支持多種數據類型趨勢對比
- 可自定義時間範圍

### 4. 數據來源分佈
- 用戶上傳數據統計
- 官方API數據統計
- 第三方平台數據統計
- 用戶糾正數據統計

### 5. 標註者績效分析
- 標註者工作量統計
- 準確率分析
- 處理時間分析
- 審核通過率

### 6. 問題監控
- 實時問題檢測
- 問題嚴重程度分類
- 問題歷史記錄
- 自動警報機制

### 7. 改進建議
- 基於數據分析的自動建議
- 優先級分類
- 具體改進行動建議

## API 端點

### 主要儀表板數據
```http
GET /api/data-quality/dashboard
```

**查詢參數:**
- `startDate`: 開始日期 (YYYY-MM-DD)
- `endDate`: 結束日期 (YYYY-MM-DD)
- `dataTypes`: 數據類型篩選 (逗號分隔)

**響應格式:**
```json
{
  "success": true,
  "data": {
    "overallMetrics": {
      "averageCompleteness": 0.85,
      "averageAccuracy": 0.92,
      "averageConsistency": 0.78,
      "averageTimeliness": 0.88,
      "overallScore": 0.86,
      "totalAssessments": 150
    },
    "trendData": {
      "dateLabels": ["2024-12-15", "2024-12-16", "2024-12-17"],
      "trendData": {
        "training": {
          "completeness": [0.85, 0.87, 0.89],
          "accuracy": [0.92, 0.93, 0.94],
          "consistency": [0.78, 0.80, 0.82],
          "timeliness": [0.88, 0.89, 0.90],
          "overallScore": [0.86, 0.87, 0.89]
        }
      }
    },
    "sourceBreakdown": {
      "sourceBreakdown": [
        {"source": "user_upload", "count": 45, "percentage": 30},
        {"source": "official_api", "count": 60, "percentage": 40},
        {"source": "third_party", "count": 30, "percentage": 20},
        {"source": "user_correction", "count": 15, "percentage": 10}
      ],
      "totalRecords": 150
    },
    "qualityDistribution": {
      "overallDistribution": {
        "excellent": {"count": 60, "percentage": 40},
        "good": {"count": 45, "percentage": 30},
        "fair": {"count": 30, "percentage": 20},
        "poor": {"count": 15, "percentage": 10}
      },
      "totalAssessments": 150
    },
    "annotatorPerformance": {
      "annotatorStats": [
        {
          "username": "annotator1",
          "totalAnnotations": 50,
          "approvedAnnotations": 48,
          "rejectedAnnotations": 2,
          "averageConfidence": 0.92,
          "averageProcessingTime": 120,
          "approvalRate": 96
        }
      ],
      "totalAnnotations": 150
    },
    "recentIssues": [
      {
        "type": "low_quality",
        "severity": "high",
        "title": "Low Quality Data: training",
        "description": "Overall score: 0.45, Completeness: 0.40, Accuracy: 0.50",
        "date": "2024-12-17T10:30:00.000Z"
      }
    ],
    "improvementSuggestions": [
      {
        "priority": "high",
        "category": "data_collection",
        "title": "Improve Data Completeness",
        "description": "Current completeness score is 85%. Consider expanding data collection sources.",
        "action": "Review data collection processes and add missing data sources"
      }
    ],
    "lastUpdated": "2024-12-17T15:30:00.000Z",
    "dateRange": {
      "startDate": "2024-12-15T00:00:00.000Z",
      "endDate": "2024-12-17T23:59:59.999Z"
    }
  }
}
```

### 實時警報
```http
GET /api/data-quality/alerts
```

**響應格式:**
```json
{
  "success": true,
  "data": [
    {
      "type": "critical",
      "title": "Critical: Low Quality Data Detected",
      "message": "Data quality score dropped to 45%",
      "timestamp": "2024-12-17T15:30:00.000Z"
    }
  ]
}
```

### 整體指標
```http
GET /api/data-quality/overall-metrics
```

### 趨勢數據
```http
GET /api/data-quality/trends
```

### 來源分佈
```http
GET /api/data-quality/source-breakdown
```

### 質量分佈
```http
GET /api/data-quality/quality-distribution
```

### 標註者績效
```http
GET /api/data-quality/annotator-performance
```

### 最近問題
```http
GET /api/data-quality/recent-issues
```

### 改進建議
```http
GET /api/data-quality/improvement-suggestions
```

## 前端使用

### 基本用法
```typescript
import { dataQualityService } from '@/services/dataQualityService';

// 獲取儀表板數據
const fetchDashboardData = async () => {
  try {
    const response = await dataQualityService.getDashboardData({
      startDate: '2024-12-15',
      endDate: '2024-12-17',
      dataTypes: ['training', 'annotation', 'validation']
    });
    
    const dashboardData = response.data;
    // 處理數據...
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  }
};

// 獲取實時警報
const fetchAlerts = async () => {
  try {
    const response = await dataQualityService.getRealTimeAlerts();
    const alerts = response.data;
    // 處理警報...
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
  }
};
```

### 圖表配置
```typescript
const chartConfig = {
  backgroundColor: theme.colors.background,
  backgroundGradientFrom: theme.colors.background,
  backgroundGradientTo: theme.colors.background,
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: theme.colors.primary,
  },
};
```

## 數據可視化

### 1. 餅圖 - 質量分佈
```typescript
<PieChart
  data={[
    {
      name: '優秀',
      population: dashboardData.qualityDistribution.overallDistribution.excellent.count,
      color: theme.colors.success,
      legendFontColor: theme.colors.text,
    },
    {
      name: '良好',
      population: dashboardData.qualityDistribution.overallDistribution.good.count,
      color: theme.colors.warning,
      legendFontColor: theme.colors.text,
    },
    // ... 其他分類
  ]}
  width={screenWidth - 80}
  height={200}
  chartConfig={chartConfig}
  accessor="population"
  backgroundColor="transparent"
  paddingLeft="15"
/>
```

### 2. 折線圖 - 趨勢分析
```typescript
<LineChart
  data={{
    labels: dashboardData.trendData.dateLabels.slice(-7),
    datasets: [
      {
        data: Object.values(dashboardData.trendData.trendData)[0]?.overallScore.slice(-7) || [],
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  }}
  width={screenWidth - 80}
  height={220}
  chartConfig={chartConfig}
  bezier
  style={styles.chart}
/>
```

### 3. 柱狀圖 - 來源分佈
```typescript
<BarChart
  data={{
    labels: dashboardData.sourceBreakdown.sourceBreakdown.map(item => item.source),
    datasets: [
      {
        data: dashboardData.sourceBreakdown.sourceBreakdown.map(item => item.count),
      },
    ],
  }}
  width={screenWidth - 80}
  height={220}
  chartConfig={chartConfig}
  style={styles.chart}
/>
```

## 性能優化

### 1. 數據緩存
- 實現儀表板數據緩存機制
- 設置合理的緩存過期時間
- 支持強制刷新功能

### 2. 分頁加載
- 大量數據分頁顯示
- 虛擬滾動優化
- 懶加載圖表組件

### 3. 實時更新
- WebSocket 連接實時數據更新
- 定期輪詢機制
- 增量數據更新

## 監控指標

### 1. 性能指標
- API 響應時間
- 數據處理時間
- 前端渲染時間
- 內存使用情況

### 2. 業務指標
- 數據質量分數趨勢
- 問題發現率
- 改進建議採納率
- 用戶使用頻率

### 3. 系統指標
- 服務器負載
- 數據庫查詢性能
- 緩存命中率
- 錯誤率統計

## 錯誤處理

### 1. API 錯誤
```typescript
try {
  const response = await dataQualityService.getDashboardData();
  // 處理成功響應
} catch (error) {
  if (error.response?.status === 401) {
    // 處理認證錯誤
    Toast.show('請重新登錄', 'error');
  } else if (error.response?.status === 500) {
    // 處理服務器錯誤
    Toast.show('服務器錯誤，請稍後重試', 'error');
  } else {
    // 處理其他錯誤
    Toast.show('獲取數據失敗', 'error');
  }
}
```

### 2. 數據驗證
```typescript
const validateDashboardData = (data: DashboardData) => {
  if (!data.overallMetrics || !data.trendData) {
    throw new Error('Invalid dashboard data structure');
  }
  
  if (data.overallMetrics.overallScore < 0 || data.overallMetrics.overallScore > 1) {
    throw new Error('Invalid overall score range');
  }
  
  return true;
};
```

## 測試

### 1. 單元測試
```javascript
describe('Data Quality Dashboard', () => {
  it('should return comprehensive dashboard data', async () => {
    const response = await request(app)
      .get('/api/data-quality/dashboard')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('overallMetrics');
    expect(response.body.data).toHaveProperty('trendData');
  });
});
```

### 2. 集成測試
- API 端點測試
- 數據庫查詢測試
- 認證授權測試
- 錯誤處理測試

### 3. 端到端測試
- 用戶界面測試
- 數據流測試
- 性能測試
- 兼容性測試

## 部署

### 1. 環境配置
```bash
# 生產環境變量
DATA_QUALITY_DASHBOARD_ENABLED=true
DASHBOARD_CACHE_TTL=300
DASHBOARD_REFRESH_INTERVAL=60
DASHBOARD_ALERT_THRESHOLD=0.6
```

### 2. 數據庫遷移
```bash
# 運行數據庫遷移
npm run migrate

# 初始化測試數據
npm run seed
```

### 3. 服務啟動
```bash
# 啟動後端服務
npm start

# 啟動前端開發服務器
npm run dev
```

## 維護

### 1. 日誌監控
- API 訪問日誌
- 錯誤日誌
- 性能日誌
- 用戶行為日誌

### 2. 數據備份
- 定期備份數據庫
- 配置文件備份
- 日誌文件備份

### 3. 版本更新
- 功能更新
- 性能優化
- 安全修補
- 兼容性改進

## 未來改進

### 1. 功能擴展
- 自定義儀表板
- 高級篩選器
- 數據導出功能
- 報表生成

### 2. 智能分析
- 機器學習預測
- 異常檢測
- 自動建議優化
- 智能警報

### 3. 用戶體驗
- 響應式設計
- 深色模式
- 多語言支持
- 無障礙訪問

## 版本歷史

### v1.0.0 (2024-12-19)
- 初始版本發布
- 基本儀表板功能
- 核心 API 端點
- 基礎數據可視化

### 計劃功能
- 自定義儀表板配置
- 高級分析工具
- 移動端優化
- 實時協作功能

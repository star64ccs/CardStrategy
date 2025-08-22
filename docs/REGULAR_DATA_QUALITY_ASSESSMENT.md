# 定期數據質量評估系統

## 概述

定期數據質量評估系統是一個自動化的數據質量監控和管理工具，提供計劃性評估、手動評估、結果分析和改進建議等功能。該系統幫助團隊持續監控數據質量狀況，及時發現問題並採取改進措施。

## 功能特性

### 1. 評估計劃管理

- **計劃創建**: 支持創建每日、每週、每月、每季度和自定義評估計劃
- **頻率設置**: 靈活的頻率配置，支持多種時間間隔
- **數據類型選擇**: 可選擇評估的數據類型（訓練數據、標註數據、市場數據等）
- **評估標準配置**: 自定義完整性、準確性、一致性和時效性的權重和閾值
- **通知設置**: 配置成功、失敗和完成通知

### 2. 評估執行

- **自動執行**: 根據計劃自動執行定期評估
- **手動執行**: 支持手動觸發評估
- **實時監控**: 評估執行狀態的實時監控
- **錯誤處理**: 完善的錯誤處理和重試機制

### 3. 結果分析

- **綜合評分**: 基於多維度指標的綜合質量評分
- **詳細指標**: 完整性、準確性、一致性、時效性的詳細分析
- **問題識別**: 自動識別數據質量問題
- **改進建議**: 基於評估結果生成改進建議

### 4. 統計報告

- **執行統計**: 評估執行次數、成功率、平均執行時間等
- **趨勢分析**: 數據質量變化趨勢分析
- **分佈統計**: 評估狀態和類型分佈統計
- **性能監控**: 評估系統性能監控

## 數據庫模型

### DataQualityAssessment

存儲評估記錄和結果

```javascript
{
  id: INTEGER (主鍵),
  assessmentType: ENUM('daily', 'weekly', 'monthly', 'quarterly', 'custom'),
  assessmentDate: DATE,
  scheduledDate: DATE,
  status: ENUM('scheduled', 'in_progress', 'completed', 'failed', 'cancelled'),
  dataTypes: JSON,
  assessmentCriteria: JSON,
  results: JSON,
  executionTime: INTEGER,
  errorMessage: TEXT,
  triggeredBy: ENUM('system', 'manual', 'api'),
  triggeredByUserId: INTEGER,
  nextAssessmentDate: DATE,
  metadata: JSON
}
```

### AssessmentSchedule

存儲評估計劃配置

```javascript
{
  id: INTEGER (主鍵),
  name: STRING(100),
  description: TEXT,
  assessmentType: ENUM('daily', 'weekly', 'monthly', 'quarterly', 'custom'),
  frequency: JSON,
  dataTypes: JSON,
  assessmentCriteria: JSON,
  isActive: BOOLEAN,
  startDate: DATE,
  endDate: DATE,
  lastRunDate: DATE,
  nextRunDate: DATE,
  totalRuns: INTEGER,
  successfulRuns: INTEGER,
  failedRuns: INTEGER,
  averageExecutionTime: INTEGER,
  notificationSettings: JSON,
  createdBy: INTEGER,
  metadata: JSON
}
```

## API 端點

### 評估計劃管理

#### 創建評估計劃

```http
POST /api/data-quality/assessment/schedule
```

**請求體:**

```json
{
  "name": "每日質量檢查",
  "description": "每日數據質量評估",
  "assessmentType": "daily",
  "frequency": {
    "interval": 1,
    "unit": "days",
    "timeOfDay": "00:00"
  },
  "dataTypes": ["training", "annotation"],
  "assessmentCriteria": {
    "completeness": { "weight": 0.25, "threshold": 0.8 },
    "accuracy": { "weight": 0.3, "threshold": 0.85 },
    "consistency": { "weight": 0.25, "threshold": 0.8 },
    "timeliness": { "weight": 0.2, "threshold": 0.75 }
  },
  "notificationSettings": {
    "onSuccess": false,
    "onFailure": true,
    "onCompletion": false,
    "recipients": [],
    "emailNotifications": false,
    "slackNotifications": false
  }
}
```

#### 獲取評估計劃列表

```http
GET /api/data-quality/assessment/schedules?page=1&limit=20&isActive=true&assessmentType=daily
```

#### 更新計劃狀態

```http
PUT /api/data-quality/assessment/schedule/:id/status
```

**請求體:**

```json
{
  "isActive": false
}
```

#### 刪除評估計劃

```http
DELETE /api/data-quality/assessment/schedule/:id
```

### 評估執行

#### 執行手動評估

```http
POST /api/data-quality/assessment/execute
```

**請求體:**

```json
{
  "dataTypes": ["training", "annotation"],
  "assessmentCriteria": {
    "completeness": { "weight": 0.25, "threshold": 0.8 },
    "accuracy": { "weight": 0.3, "threshold": 0.85 },
    "consistency": { "weight": 0.25, "threshold": 0.8 },
    "timeliness": { "weight": 0.2, "threshold": 0.75 }
  }
}
```

#### 執行計劃評估

```http
POST /api/data-quality/assessment/schedule/:id/execute
```

### 評估數據查詢

#### 獲取評估列表

```http
GET /api/data-quality/assessment/list?page=1&limit=20&status=completed&assessmentType=daily&startDate=2024-01-01&endDate=2024-12-31&triggeredBy=manual
```

#### 獲取評估詳情

```http
GET /api/data-quality/assessment/:id
```

#### 獲取評估統計

```http
GET /api/data-quality/assessment/stats?startDate=2024-01-01&endDate=2024-12-31&assessmentType=daily
```

## 服務層

### AssessmentService

#### 主要方法

**createAssessmentSchedule(scheduleData)**

- 創建新的評估計劃
- 計算下次運行時間
- 返回創建的計劃對象

**executeScheduledAssessment(scheduleId, triggeredBy, triggeredByUserId)**

- 執行計劃評估
- 更新計劃統計信息
- 發送通知
- 返回評估結果

**executeManualAssessment(assessmentData)**

- 執行手動評估
- 返回評估結果

**performAssessment(dataTypes, criteria)**

- 執行實際評估邏輯
- 計算各項質量指標
- 生成改進建議
- 返回綜合評估結果

**getAssessments(options)**

- 獲取評估記錄列表
- 支持分頁和篩選
- 返回評估記錄和統計信息

**getAssessmentStats(options)**

- 獲取評估統計數據
- 計算各種統計指標
- 返回統計結果

## 前端界面

### DataQualityAssessmentScreen

#### 主要組件

**概覽標籤**

- 統計概覽卡片（總評估次數、成功完成、執行失敗、平均分數）
- 評估狀態分佈餅圖
- 每日評估趨勢線圖

**計劃標籤**

- 評估計劃列表
- 計劃狀態管理（啟用/停用）
- 手動執行計劃
- 創建新計劃

**記錄標籤**

- 評估記錄列表
- 評估詳情查看
- 手動評估執行

#### 主要功能

**數據加載**

```typescript
const loadData = async () => {
  await Promise.all([loadStats(), loadSchedules(), loadAssessments()]);
};
```

**評估執行**

```typescript
const handleExecuteAssessment = async (scheduleId: number) => {
  await dataQualityService.executeScheduledAssessment(scheduleId);
  await loadData();
};
```

**詳情查看**

```typescript
const handleViewAssessmentDetail = async (assessmentId: number) => {
  const assessment = await dataQualityService.getAssessmentById(assessmentId);
  setSelectedAssessment(assessment);
  setShowAssessmentDetailModal(true);
};
```

## 評估算法

### 質量指標計算

**完整性 (Completeness)**

```javascript
calculateCompleteness(data, dataType) {
  const requiredFields = this.getRequiredFields(dataType);
  let totalFields = 0;
  let filledFields = 0;

  data.forEach(item => {
    totalFields += requiredFields.length;
    requiredFields.forEach(field => {
      if (item[field] !== null && item[field] !== undefined && item[field] !== '') {
        filledFields++;
      }
    });
  });

  return totalFields > 0 ? filledFields / totalFields : 0;
}
```

**準確性 (Accuracy)**

```javascript
calculateAccuracy(data, dataType) {
  let totalItems = data.length;
  let accurateItems = 0;

  data.forEach(item => {
    if (this.isDataAccurate(item, dataType)) {
      accurateItems++;
    }
  });

  return totalItems > 0 ? accurateItems / totalItems : 0;
}
```

**一致性 (Consistency)**

```javascript
calculateConsistency(data, dataType) {
  let totalComparisons = 0;
  let consistentComparisons = 0;

  for (let i = 0; i < data.length - 1; i++) {
    for (let j = i + 1; j < data.length; j++) {
      if (this.isDataConsistent(data[i], data[j], dataType)) {
        consistentComparisons++;
      }
      totalComparisons++;
    }
  }

  return totalComparisons > 0 ? consistentComparisons / totalComparisons : 0;
}
```

**時效性 (Timeliness)**

```javascript
calculateTimeliness(data, dataType) {
  const now = new Date();
  let totalAge = 0;

  data.forEach(item => {
    const updateTime = item.updatedAt || item.createdAt;
    const ageInDays = (now - new Date(updateTime)) / (1000 * 60 * 60 * 24);
    totalAge += ageInDays;
  });

  const averageAge = totalAge / data.length;
  const maxAcceptableAge = this.getMaxAcceptableAge(dataType);

  return Math.max(0, 1 - (averageAge / maxAcceptableAge));
}
```

### 總體分數計算

```javascript
overallScore =
  completeness * criteria.completeness.weight +
  accuracy * criteria.accuracy.weight +
  consistency * criteria.consistency.weight +
  timeliness * criteria.timeliness.weight;
```

## 使用指南

### 1. 創建評估計劃

1. 進入"定期數據質量評估"頁面
2. 點擊"計劃"標籤
3. 點擊"創建計劃"按鈕
4. 填寫計劃信息：
   - 名稱和描述
   - 評估類型（每日、每週、每月等）
   - 頻率設置
   - 數據類型選擇
   - 評估標準配置
   - 通知設置
5. 點擊"創建"完成

### 2. 執行評估

**自動執行**

- 系統根據計劃自動執行評估
- 可在"記錄"標籤查看執行結果

**手動執行**

- 在"計劃"標籤點擊"執行"按鈕
- 或在"記錄"標籤點擊"手動評估"

### 3. 查看結果

1. 在"概覽"標籤查看整體統計
2. 在"記錄"標籤查看詳細記錄
3. 點擊"查看詳情"查看具體評估結果
4. 查看改進建議和問題分析

### 4. 管理計劃

- 啟用/停用計劃
- 修改計劃配置
- 刪除不需要的計劃

## 配置選項

### 評估標準配置

```javascript
{
  completeness: { weight: 0.25, threshold: 0.8 },
  accuracy: { weight: 0.30, threshold: 0.85 },
  consistency: { weight: 0.25, threshold: 0.8 },
  timeliness: { weight: 0.20, threshold: 0.75 }
}
```

### 通知設置

```javascript
{
  onSuccess: false,
  onFailure: true,
  onCompletion: false,
  recipients: [],
  emailNotifications: false,
  slackNotifications: false
}
```

### 頻率配置

```javascript
// 每日
{
  interval: 1,
  unit: 'days',
  timeOfDay: '00:00'
}

// 每週
{
  interval: 1,
  unit: 'weeks',
  timeOfDay: '00:00',
  daysOfWeek: [1] // 週一
}

// 每月
{
  interval: 1,
  unit: 'months',
  timeOfDay: '00:00',
  dayOfMonth: 1
}
```

## 測試

### 單元測試

- 評估服務方法測試
- 數據計算邏輯測試
- 計劃管理功能測試

### API 測試

- 端點功能測試
- 認證和授權測試
- 錯誤處理測試

### 集成測試

- 端到端流程測試
- 數據庫操作測試
- 前端交互測試

## 監控和維護

### 性能監控

- 評估執行時間監控
- 系統資源使用監控
- 錯誤率監控

### 日誌記錄

- 評估執行日誌
- 錯誤日誌
- 性能日誌

### 備份和恢復

- 評估數據備份
- 計劃配置備份
- 災難恢復計劃

## 故障排除

### 常見問題

**評估執行失敗**

- 檢查數據庫連接
- 檢查數據源可用性
- 查看錯誤日誌

**計劃不執行**

- 檢查計劃是否啟用
- 檢查時間設置
- 檢查系統時間

**結果不準確**

- 檢查評估標準配置
- 檢查數據樣本
- 檢查計算邏輯

### 調試方法

- 查看詳細日誌
- 檢查數據庫記錄
- 使用測試模式

## 版本歷史

### v1.0.0 (2024-12-19)

- 初始版本發布
- 基本評估功能
- 計劃管理功能
- 前端界面

## 未來計劃

### 短期目標

- 優化評估算法
- 增加更多數據類型支持
- 改進通知機制

### 長期目標

- 機器學習集成
- 預測性分析
- 自動化改進建議

## 技術架構

### 後端技術棧

- Node.js + Express.js
- Sequelize ORM
- PostgreSQL 數據庫
- JWT 認證

### 前端技術棧

- React Native
- TypeScript
- React Native Chart Kit
- Redux Toolkit

### 部署架構

- Docker 容器化
- 負載均衡
- 數據庫集群
- 監控系統

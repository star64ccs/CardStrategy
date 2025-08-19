# 智能標註任務分配算法優化

## 概述

本文檔詳細介紹了標註任務分配算法的優化實現，從簡單的循環分配升級為智能化的多維度分配策略。

## 算法特性

### 1. 智能負載均衡
- **動態工作負載計算**：實時計算每個標註者的當前任務數量和處理能力
- **容量管理**：設置最大同時任務數限制，防止標註者過載
- **可用性評估**：根據最後活躍時間和當前狀態評估標註者可用性

### 2. 專業化分配
- **專業領域識別**：為每個標註者建立專業領域評分（card_identification, condition_assessment, authenticity_verification, centering_analysis）
- **匹配度計算**：根據任務類型與標註者專業度的匹配程度進行分配
- **等級調整**：根據標註者等級（expert, senior, junior）調整專業度評分

### 3. 動態優先級
- **任務優先級**：支持 high, normal, low 三級優先級
- **難度評估**：根據數據質量和置信度評估任務難度（easy, medium, hard）
- **時間優先**：優先分配較早創建的任務

### 4. 質量預測
- **預期質量計算**：基於標註者歷史表現預測任務完成質量
- **置信度評估**：綜合考慮標註者準確率、專業度和當前狀態
- **風險評估**：識別高風險任務並分配給合適的標註者

### 5. 學習機制
- **反饋學習**：根據實際完成質量調整標註者專業度評分
- **參數自適應**：動態調整算法權重參數
- **性能追蹤**：持續監控和優化分配效果

## 技術實現

### 核心算法流程

```javascript
async assignAnnotationTasks(options) {
  // 1. 獲取待分配數據
  const pendingData = await this.getPendingTrainingData(filters);
  
  // 2. 獲取標註者詳細信息
  const activeAnnotators = await this.getActiveAnnotatorsWithDetails();
  
  // 3. 計算工作負載
  const annotatorWorkloads = await this.calculateAnnotatorWorkloads(activeAnnotators);
  
  // 4. 執行智能分配
  const assignments = await this.performSmartAssignment(
    pendingData, activeAnnotators, annotatorWorkloads
  );
  
  // 5. 批量創建任務
  const createdTasks = await this.batchCreateAnnotationTasks(assignments);
  
  // 6. 更新統計
  await this.updateAssignmentStatistics(assignments);
  
  return createdTasks;
}
```

### 評分計算公式

```javascript
// 綜合評分 = (工作量評分 × 工作量權重 + 專業度評分 × 專業度權重 + 質量評分 × 質量權重) × 可用性分數

const totalScore = (
  workloadScore * this.assignmentConfig.workloadWeight +
  expertiseScore * this.assignmentConfig.expertiseWeight +
  qualityScore * this.assignmentConfig.qualityWeight
) * availabilityScore;

// 應用難度調整
const adjustedScore = this.applyDifficultyAdjustment(totalScore, difficulty, annotator);
```

### 配置參數

| 參數 | 默認值 | 說明 |
|------|--------|------|
| maxTasksPerAnnotator | 10 | 每個標註者最大同時任務數 |
| qualityThreshold | 0.85 | 質量閾值 |
| workloadWeight | 0.3 | 工作量權重 |
| expertiseWeight | 0.4 | 專業度權重 |
| qualityWeight | 0.3 | 質量權重 |
| learningRate | 0.1 | 學習率 |
| priorityBoost | 1.5 | 優先級提升倍數 |
| difficultyPenalty | 0.8 | 難度懲罰係數 |

## API 端點

### 智能分配任務
```http
POST /api/data-quality/annotate/assign
Content-Type: application/json

{
  "batchSize": 50,
  "priorityFilter": "high",
  "difficultyFilter": "easy",
  "annotationTypeFilter": "card_identification",
  "forceReassignment": false
}
```

### 獲取算法配置
```http
GET /api/data-quality/annotate/config
```

### 更新算法配置
```http
PUT /api/data-quality/annotate/config
Content-Type: application/json

{
  "config": {
    "maxTasksPerAnnotator": 15,
    "qualityThreshold": 0.9,
    "workloadWeight": 0.4
  }
}
```

### 學習機制
```http
POST /api/data-quality/annotate/learn
Content-Type: application/json

{
  "annotationId": 123,
  "actualQuality": 0.92,
  "processingTime": 3000000
}
```

### 獲取標註者詳情
```http
GET /api/data-quality/annotate/annotators?includeInactive=false
```

## 前端界面

### 主要功能
- **算法特性展示**：顯示智能負載均衡、專業化分配等特性
- **配置管理**：可視化編輯分配算法參數
- **標註者分佈**：餅圖展示不同等級標註者分佈
- **分配統計**：柱狀圖展示按類型的分配分佈
- **智能分配**：支持多種過濾條件的任務分配

### 界面組件
- `AnnotationAssignmentScreen`：主界面
- 配置編輯模態框
- 分配設置模態框
- 統計圖表展示

## 測試覆蓋

### 單元測試
- 標註者專業度計算
- 可用性評估
- 工作負載計算
- 數據優先級排序
- 評分計算邏輯

### API 測試
- 智能分配端點
- 配置管理端點
- 學習機制端點
- 錯誤處理

### 集成測試
- 完整分配流程
- 學習機制驗證
- 統計更新驗證

## 性能優化

### 數據庫優化
- 索引優化：為常用查詢字段建立索引
- 查詢優化：使用批量查詢減少數據庫訪問次數
- 緩存策略：緩存標註者信息和配置參數

### 算法優化
- 批量處理：支持批量分配任務
- 並行計算：並行計算標註者評分
- 記憶化：緩存計算結果避免重複計算

## 監控指標

### 分配效率
- 平均分配時間
- 分配成功率
- 任務完成率

### 質量指標
- 預期質量 vs 實際質量
- 標註者專業度變化
- 算法參數調整趨勢

### 負載指標
- 標註者工作負載分佈
- 任務積壓情況
- 系統響應時間

## 未來改進

### 短期改進
- [ ] 支持更多標註類型
- [ ] 增加任務緊急程度評估
- [ ] 實現動態權重調整

### 中期改進
- [ ] 機器學習模型集成
- [ ] 預測性分配
- [ ] 自動化配置優化

### 長期改進
- [ ] 多目標優化
- [ ] 實時學習
- [ ] 跨項目知識遷移

## 故障排除

### 常見問題

1. **分配失敗**
   - 檢查標註者是否活躍
   - 驗證待分配數據狀態
   - 檢查配置參數有效性

2. **分配不均勻**
   - 調整權重參數
   - 檢查標註者專業度設置
   - 驗證工作負載計算

3. **學習效果不佳**
   - 檢查學習率設置
   - 驗證反饋數據質量
   - 調整參數更新策略

### 調試工具
- 詳細日誌記錄
- 分配過程追蹤
- 性能監控面板

## 版本歷史

### v2.0 (當前版本)
- 實現智能分配算法
- 添加學習機制
- 支持配置管理
- 完善前端界面

### v1.0 (原始版本)
- 簡單循環分配
- 基礎任務管理
- 基本統計功能

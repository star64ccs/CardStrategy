const path = require('path');
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');

// 添加後端路徑到模組搜索路徑
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const backendPath = path.join(__dirname, '..', 'backend');
require('module').globalPaths.push(backendPath);

const EnhancedTensorFlowService = require('../backend/src/services/enhancedTensorFlowService');

async function testEnhancedTensorFlow() {
  try {
    // 初始化服務
    await EnhancedTensorFlowService.initialize();
    // 創建 LSTM 模型
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const model = await EnhancedTensorFlowService.createLSTMModel();
    // 顯示模型摘要
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const summary = EnhancedTensorFlowService.getModelSummary(model);
    // 生成測試數據
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const testData = Array.from(
      { length: 100 },
      (_, i) => Math.sin(i * 0.1) + Math.random() * 0.1
    );
    // 訓練模型
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const history = await EnhancedTensorFlowService.trainModel(
      model,
      testData,
      50,
      16
    );
    // 進行預測
    const inputData = testData.slice(-10);
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const prediction = await EnhancedTensorFlowService.predict(
      model,
      inputData
    );
// eslint-disable-next-line no-console
    console.log(`預測結果: ${prediction}`);
// eslint-disable-next-line no-console
    console.log(`預測準確率: ${prediction.accuracy}`);
    // 評估模型
    const evaluation = await EnhancedTensorFlowService.evaluateModel(
      model,
      testData.slice(-20)
    );
// eslint-disable-next-line no-console
    console.log(`模型評估結果: ${evaluation}`);

    // 創建模型目錄
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const modelsDir = path.join(__dirname, '..', 'backend', 'models');
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }

    // 保存模型
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const savePath = await EnhancedTensorFlowService.saveModel(
      model,
      'test-lstm-model'
    );
    // 加載模型
    const loadedModel =
      await EnhancedTensorFlowService.loadModel('test-lstm-model');
    // 使用加載的模型進行預測
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const newPrediction = await EnhancedTensorFlowService.predict(
      loadedModel,
      inputData
    );
// eslint-disable-next-line no-console
    console.log(`加載模型預測結果: ${newPrediction}`);

    // 清理資源
    EnhancedTensorFlowService.dispose();
  } catch (error) {
// eslint-disable-next-line no-console
    console.error('❌ 增強版 TensorFlow.js 服務測試失敗:', error.message);
// eslint-disable-next-line no-console
    console.error('詳細錯誤:', error);
  }
}

// 運行測試
testEnhancedTensorFlow();

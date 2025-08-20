const path = require('path');
const fs = require('fs');

// 添加後端路徑到模組搜索路徑
const backendPath = path.join(__dirname, '..', 'backend');
require('module').globalPaths.push(backendPath);

const EnhancedTensorFlowService = require('../backend/src/services/enhancedTensorFlowService');

async function testEnhancedTensorFlow() {
  console.log('🧠 開始測試增強版 TensorFlow.js 服務...\n');

  try {
    // 初始化服務
    console.log('📊 初始化 TensorFlow.js 服務...');
    await EnhancedTensorFlowService.initialize();
    console.log('✅ 服務初始化成功\n');

    // 創建 LSTM 模型
    console.log('🏗️ 創建 LSTM 模型...');
    const model = await EnhancedTensorFlowService.createLSTMModel();
    console.log('✅ LSTM 模型創建成功\n');

    // 顯示模型摘要
    console.log('📋 模型摘要:');
    const summary = EnhancedTensorFlowService.getModelSummary(model);
    console.log(summary);
    console.log('');

    // 生成測試數據
    console.log('📊 生成測試數據...');
    const testData = Array.from({ length: 100 }, (_, i) => Math.sin(i * 0.1) + Math.random() * 0.1);
    console.log(`✅ 生成 ${testData.length} 個測試數據點\n`);

    // 訓練模型
    console.log('🎯 開始訓練模型...');
    const history = await EnhancedTensorFlowService.trainModel(model, testData, 50, 16);
    console.log('✅ 模型訓練完成\n');

    // 進行預測
    console.log('🔮 進行預測...');
    const inputData = testData.slice(-10);
    const prediction = await EnhancedTensorFlowService.predict(model, inputData);
    console.log('✅ 預測完成');
    console.log(`📈 預測值: ${prediction.toFixed(4)}`);
    console.log(`📊 實際值: ${testData[testData.length - 1].toFixed(4)}`);
    console.log('');

    // 評估模型
    console.log('📊 評估模型性能...');
    const evaluation = await EnhancedTensorFlowService.evaluateModel(model, testData.slice(-20));
    console.log('✅ 模型評估完成');
    console.log(`📉 損失: ${evaluation.loss.toFixed(4)}`);
    console.log(`📊 平均絕對誤差: ${evaluation.mae.toFixed(4)}`);
    console.log('');

    // 創建模型目錄
    const modelsDir = path.join(__dirname, '..', 'backend', 'models');
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }

    // 保存模型
    console.log('💾 保存模型...');
    const savePath = await EnhancedTensorFlowService.saveModel(model, 'test-lstm-model');
    console.log(`✅ 模型已保存到: ${savePath}\n`);

    // 加載模型
    console.log('📂 加載模型...');
    const loadedModel = await EnhancedTensorFlowService.loadModel('test-lstm-model');
    console.log('✅ 模型加載成功\n');

    // 使用加載的模型進行預測
    console.log('🔮 使用加載的模型進行預測...');
    const newPrediction = await EnhancedTensorFlowService.predict(loadedModel, inputData);
    console.log('✅ 預測完成');
    console.log(`📈 新預測值: ${newPrediction.toFixed(4)}`);
    console.log('');

    // 清理資源
    console.log('🧹 清理資源...');
    EnhancedTensorFlowService.dispose();
    console.log('✅ 資源清理完成');

    console.log('\n🎉 增強版 TensorFlow.js 服務測試完成！');
    console.log('✅ 所有功能正常運作');
    console.log('✅ 可以開始進行深度學習模型開發');

  } catch (error) {
    console.error('❌ 增強版 TensorFlow.js 服務測試失敗:', error.message);
    console.error('詳細錯誤:', error);
  }
}

// 運行測試
testEnhancedTensorFlow();

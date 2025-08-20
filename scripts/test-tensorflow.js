const tf = require('@tensorflow/tfjs');

async function testTensorFlow() {
  console.log('🧠 開始測試 TensorFlow.js 環境...\n');

  try {
    // 測試基本功能
    console.log('📊 測試基本張量操作...');
    const tensor = tf.tensor2d([[1, 2], [3, 4]]);
    console.log('✅ 張量創建成功:', tensor.toString());

    // 測試數學運算
    console.log('\n🔢 測試數學運算...');
    const result = tensor.square();
    console.log('✅ 平方運算成功:', result.toString());

    // 測試模型創建
    console.log('\n🏗️ 測試模型創建...');
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 1, inputShape: [2] })
      ]
    });
    console.log('✅ 模型創建成功');

    // 測試模型編譯
    console.log('\n⚙️ 測試模型編譯...');
    model.compile({
      optimizer: 'sgd',
      loss: 'meanSquaredError'
    });
    console.log('✅ 模型編譯成功');

    // 測試預測
    console.log('\n🎯 測試模型預測...');
    const prediction = model.predict(tf.tensor2d([[1, 2]]));
    console.log('✅ 預測成功:', prediction.toString());

    // 測試後端
    console.log('\n🚀 檢查後端...');
    const backend = tf.getBackend();
    console.log('✅ 當前後端:', backend);

    // 清理資源
    tensor.dispose();
    result.dispose();
    prediction.dispose();

    console.log('\n🎉 TensorFlow.js 環境測試完成！');
    console.log('✅ 所有功能正常運作');
    console.log('✅ 可以開始進行深度學習模型開發');

  } catch (error) {
    console.error('❌ TensorFlow.js 測試失敗:', error.message);
    console.error('詳細錯誤:', error);
  }
}

// 運行測試
testTensorFlow();

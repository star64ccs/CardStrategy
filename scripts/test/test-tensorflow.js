const tf = require('@tensorflow/tfjs');

async function testTensorFlow() {
  try {
    // 測試基本功能
    const tensor = tf.tensor2d([
      [1, 2],
      [3, 4],
    ]);
// eslint-disable-next-line no-console
    console.log('張量創建成功');

    // 測試數學運算
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const result = tensor.square();
// eslint-disable-next-line no-console
    console.log('數學運算測試完成');

    // 測試模型創建
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const model = tf.sequential({
      layers: [tf.layers.dense({ units: 1, inputShape: [2] })],
    });
    // 測試模型編譯
    model.compile({
      optimizer: 'sgd',
      loss: 'meanSquaredError',
    });
    // 測試預測
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const prediction = model.predict(tf.tensor2d([[1, 2]]));
// eslint-disable-next-line no-console
    console.log('模型預測測試完成');

    // 測試後端
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const backend = tf.getBackend();
    // 清理資源
    tensor.dispose();
    result.dispose();
    prediction.dispose();
  } catch (error) {
// eslint-disable-next-line no-console
    console.error('❌ TensorFlow.js 測試失敗:', error.message);
// eslint-disable-next-line no-console
    console.error('詳細錯誤:', error);
  }
}

// 運行測試
testTensorFlow();

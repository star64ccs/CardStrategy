const tf = require('@tensorflow/tfjs');

async function testTensorFlow() {
  try {
    // Test基本功能
    const tensor = tf.tensor2d([
      [1, 2],
      [3, 4],
    ]);
// eslint-disable-next-line no-console
    console.log('張量CreateSuccess');

    // Test數學運算
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const result = tensor.square();
// eslint-disable-next-line no-console
    console.log('數學運算測試完成');

    // Test模型Create
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const model = tf.sequential({
      layers: [tf.layers.dense({ units: 1, inputShape: [2] })],
    });
    // Test模型Compile
    model.compile({
      optimizer: 'sgd',
      loss: 'meanSquaredError',
    });
    // Test預測
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const prediction = model.predict(tf.tensor2d([[1, 2]]));
// eslint-disable-next-line no-console
    console.log('模型預測測試完成');

    // Test後端
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const backend = tf.getBackend();
    // 清理Resource
    tensor.dispose();
    result.dispose();
    prediction.dispose();
  } catch (error) {
// eslint-disable-next-line no-console
    console.error('❌ TensorFlow.js 測試Failed:', error.message);
// eslint-disable-next-line no-console
    console.error('詳細Error:', error);
  }
}

// 運RowTest
testTensorFlow();

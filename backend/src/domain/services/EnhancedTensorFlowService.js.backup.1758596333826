const tf = require('@tensorflow/tfjs');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');

class EnhancedTensorFlowService {
  constructor() {
    this.models = new Map();
    this.isInitialized = false;
    this.modelConfigs = {
      lstm: {
        units: 50,
        returnSequences: true,
        inputShape: [10, 1],
      },
      dense: {
        units: 1,
        activation: 'linear',
      },
    };
  }

  /**
   * 初始化 TensorFlow.js 服務
   */
  async initialize() {
    try {
      logger.info('初始化 TensorFlow.js 服務...');

      // 設置後端
      await tf.setBackend('cpu');
      logger.info(`TensorFlow.js 後端設置為: ${tf.getBackend()}`);

      this.isInitialized = true;
      logger.info('TensorFlow.js 服務初始化完成');

      return true;
    } catch (error) {
      logger.error('TensorFlow.js 服務初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 創建 LSTM 模型
   */
  async createLSTMModel(inputShape = [10, 1]) {
    try {
// eslint-disable-next-line no-unused-vars
      const model = tf.sequential();

      // LSTM 層
      model.add(
        tf.layers.lstm({
          units: this.modelConfigs.lstm.units,
          returnSequences: true,
          inputShape: inputShape,
        })
      );

      // Dropout 層防止過擬合
      model.add(tf.layers.dropout({ rate: 0.2 }));

      // 第二個 LSTM 層
      model.add(
        tf.layers.lstm({
          units: this.modelConfigs.lstm.units,
          returnSequences: false,
        })
      );

      // Dropout 層
      model.add(tf.layers.dropout({ rate: 0.2 }));

      // 輸出層
      model.add(
        tf.layers.dense({
          units: this.modelConfigs.dense.units,
          activation: this.modelConfigs.dense.activation,
        })
      );

      // 編譯模型
      model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae'],
      });

      logger.info('LSTM 模型創建成功');
      return model;
    } catch (error) {
      logger.error('LSTM 模型創建失敗:', error);
      throw error;
    }
  }

  /**
   * 數據預處理
   */
  preprocessData(data, sequenceLength = 10) {
    try {
      const sequences = [];
      const targets = [];

      for (let i = 0; i < data.length - sequenceLength; i++) {
        const sequence = data.slice(i, i + sequenceLength);
        const target = data[i + sequenceLength];

        sequences.push(sequence);
        targets.push(target);
      }

      return {
        sequences: tf.tensor3d(sequences, [
          sequences.length,
          sequenceLength,
          1,
        ]),
        targets: tf.tensor2d(targets, [targets.length, 1]),
      };
    } catch (error) {
      logger.error('數據預處理失敗:', error);
      throw error;
    }
  }

  /**
   * 訓練模型
   */
  async trainModel(model, trainingData, epochs = 100, batchSize = 32) {
    try {
      logger.info('開始訓練模型...');

      const { sequences, targets } = this.preprocessData(trainingData);

// eslint-disable-next-line no-unused-vars
      const history = await model.fit(sequences, targets, {
        epochs: epochs,
        batchSize: batchSize,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0) {
              logger.info(
                `Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, val_loss = ${logs.val_loss.toFixed(4)}`
              );
            }
          },
        },
      });

      // 清理張量
      sequences.dispose();
      targets.dispose();

      logger.info('模型訓練完成');
      return history;
    } catch (error) {
      logger.error('模型訓練失敗:', error);
      throw error;
    }
  }

  /**
   * 進行預測
   */
  async predict(model, inputData, sequenceLength = 10) {
    try {
      // 準備輸入數據
      const inputSequence = inputData.slice(-sequenceLength);
      const inputTensor = tf.tensor3d([inputSequence], [1, sequenceLength, 1]);

      // 進行預測
// eslint-disable-next-line no-unused-vars
      const prediction = await model.predict(inputTensor);
// eslint-disable-next-line no-unused-vars
      const predictionValue = await prediction.data();

      // 清理張量
      inputTensor.dispose();
      prediction.dispose();

      return predictionValue[0];
    } catch (error) {
      logger.error('預測失敗:', error);
      throw error;
    }
  }

  /**
   * 保存模型
   */
  async saveModel(model, modelName) {
    try {
// eslint-disable-next-line no-unused-vars
      const savePath = `./models/${modelName}`;
      await model.save(`file://${savePath}`);
      logger.info(`模型已保存到: ${savePath}`);
      return savePath;
    } catch (error) {
      logger.error('模型保存失敗:', error);
      throw error;
    }
  }

  /**
   * 加載模型
   */
  async loadModel(modelName) {
    try {
// eslint-disable-next-line no-unused-vars
      const modelPath = `./models/${modelName}`;
// eslint-disable-next-line no-unused-vars
      const model = await tf.loadLayersModel(`file://${modelPath}/model.json`);
      logger.info(`模型已從 ${modelPath} 加載`);
      return model;
    } catch (error) {
      logger.error('模型加載失敗:', error);
      throw error;
    }
  }

  /**
   * 評估模型性能
   */
  async evaluateModel(model, testData) {
    try {
      const { sequences, targets } = this.preprocessData(testData);

      const evaluation = await model.evaluate(sequences, targets);
      const loss = await evaluation[0].data();
      const mae = await evaluation[1].data();

      // 清理張量
      sequences.dispose();
      targets.dispose();
      evaluation[0].dispose();
      evaluation[1].dispose();

      return {
        loss: loss[0],
        mae: mae[0],
      };
    } catch (error) {
      logger.error('模型評估失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取模型摘要
   */
  getModelSummary(model) {
    try {
// eslint-disable-next-line no-unused-vars
      const summary = [];
      model.summary(null, null, null, null, (line) => {
        summary.push(line);
      });
      return summary.join('\n');
    } catch (error) {
      logger.error('獲取模型摘要失敗:', error);
      throw error;
    }
  }

  /**
   * 清理資源
   */
  dispose() {
    try {
      // 清理所有模型
      this.models.forEach((model) => {
        if (model && typeof model.dispose === 'function') {
          model.dispose();
        }
      });
      this.models.clear();

      // 清理 TensorFlow.js 內存
      tf.dispose();

      logger.info('TensorFlow.js 資源已清理');
    } catch (error) {
      logger.error('資源清理失敗:', error);
    }
  }
}

module.exports = new EnhancedTensorFlowService();

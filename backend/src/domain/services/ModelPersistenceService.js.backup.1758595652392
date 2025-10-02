// eslint-disable-next-line no-unused-vars
const fs = require('fs').promises;
const path = require('path');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
const { getModelPersistenceModel } = require('../models/ModelPersistence');

class ModelPersistenceService {
  constructor() {
    this.modelsDirectory = path.join(process.cwd(), 'models');
    this.metadataDirectory = path.join(process.cwd(), 'models', 'metadata');
    this.ensureDirectories();
  }

  // 確保目錄存在
  async ensureDirectories() {
    try {
      await fs.mkdir(this.modelsDirectory, { recursive: true });
      await fs.mkdir(this.metadataDirectory, { recursive: true });
      logger.info('模型持久化目錄創建成功');
    } catch (error) {
      logger.error('創建模型目錄失敗:', error);
    }
  }

  // 生成模型文件名
  generateModelFileName(modelType, version, timestamp) {
    const sanitizedModelType = modelType.replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date(timestamp).toISOString().split('T')[0];
    return `${sanitizedModelType}_v${version}_${dateStr}.json`;
  }

  // 生成模型元數據
  generateModelMetadata(model, modelType, trainingMetrics, performanceMetrics) {
    return {
      modelType,
      version: this.generateVersion(),
      timestamp: new Date().toISOString(),
      architecture: {
        layers: model.layers.length,
        totalParams: model.countParams(),
        trainableParams: model.countParams(true),
        nonTrainableParams: model.countParams(false),
      },
      trainingMetrics: {
        finalLoss: trainingMetrics.finalLoss,
        finalValLoss: trainingMetrics.finalValLoss,
        epochs: trainingMetrics.history?.loss?.length || 0,
      },
      performanceMetrics: {
        accuracy: performanceMetrics.accuracy || 0,
        precision: performanceMetrics.precision || 0,
        recall: performanceMetrics.recall || 0,
        f1Score: performanceMetrics.f1Score || 0,
      },
      modelConfig: {
        inputShape: model.inputs[0].shape,
        outputShape: model.outputs[0].shape,
        optimizer: model.optimizer.getConfig(),
        loss: model.loss,
      },
      fileSize: 0, // 將在保存後更新
      checksum: '', // 將在保存後計算
      status: 'active',
    };
  }

  // 生成版本號
  generateVersion() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${timestamp}_${random}`;
  }

  // 計算文件校驗和
  async calculateChecksum(filePath) {
    try {
      const crypto = require('crypto');
      const fileBuffer = await fs.readFile(filePath);
      const hashSum = crypto.createHash('sha256');
      hashSum.update(fileBuffer);
      return hashSum.digest('hex');
    } catch (error) {
      logger.error('計算校驗和失敗:', error);
      return '';
    }
  }

  // 保存模型
  async saveModel(model, modelType, trainingMetrics, performanceMetrics = {}) {
    try {
      const timestamp = new Date().toISOString();
// eslint-disable-next-line no-unused-vars
      const version = this.generateVersion();
      const fileName = this.generateModelFileName(
        modelType,
        version,
        timestamp
      );
// eslint-disable-next-line no-unused-vars
      const filePath = path.join(this.modelsDirectory, fileName);
      const metadataPath = path.join(
        this.metadataDirectory,
        `${fileName}.meta.json`
      );

      // 生成元數據
      const metadata = this.generateModelMetadata(
        model,
        modelType,
        trainingMetrics,
        performanceMetrics
      );

      // 保存模型權重和架構
// eslint-disable-next-line no-unused-vars
      const modelData = {
        modelTopology: model.toJSON(),
        weightSpecs: model.getWeights().map((w) => w.shape),
        weightData: model.getWeights().map((w) => Array.from(w.dataSync())),
      };

      // 寫入模型文件
      await fs.writeFile(filePath, JSON.stringify(modelData, null, 2));

      // 更新元數據中的文件大小和校驗和
      const stats = await fs.stat(filePath);
      metadata.fileSize = stats.size;
      metadata.checksum = await this.calculateChecksum(filePath);

      // 保存元數據
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

      // 保存到數據庫
      const ModelPersistence = getModelPersistenceModel();
      await ModelPersistence.create({
        modelType,
        version,
        fileName,
        filePath,
        metadataPath,
        metadata: JSON.stringify(metadata),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      logger.info(`模型保存成功: ${fileName}`);

      return {
        success: true,
        fileName,
        version,
        metadata,
        filePath,
        metadataPath,
      };
    } catch (error) {
      logger.error('模型保存失敗:', error);
      throw new Error(`模型保存失敗: ${error.message}`);
    }
  }

  // 加載模型
  async loadModel(modelType, version = null) {
    try {
      const ModelPersistence = getModelPersistenceModel();

      // 查找模型記錄
      const whereClause = { modelType, status: 'active' };
      if (version) {
        whereClause.version = version;
      }

// eslint-disable-next-line no-unused-vars
      const modelRecord = await ModelPersistence.findOne({
        where: whereClause,
        order: [['createdAt', 'DESC']],
      });

      if (!modelRecord) {
        throw new Error(
          `未找到模型: ${modelType}${version ? ` v${version}` : ''}`
        );
      }

      // 讀取模型文件
// eslint-disable-next-line no-unused-vars
      const modelData = JSON.parse(
        await fs.readFile(modelRecord.filePath, 'utf8')
      );
      const metadata = JSON.parse(
        await fs.readFile(modelRecord.metadataPath, 'utf8')
      );

      // 驗證校驗和
      const currentChecksum = await this.calculateChecksum(
        modelRecord.filePath
      );
      if (currentChecksum !== metadata.checksum) {
        throw new Error('模型文件已損壞，校驗和不匹配');
      }

      // 重建模型
      const tf = require('@tensorflow/tfjs-node');
// eslint-disable-next-line no-unused-vars
      const model = tf.models.modelFromJSON(modelData.modelTopology);

      // 重建權重
      const weights = modelData.weightData.map((data, index) => {
        return tf.tensor(data, modelData.weightSpecs[index]);
      });

      model.setWeights(weights);

      logger.info(`模型加載成功: ${modelRecord.fileName}`);

      return {
        success: true,
        model,
        metadata,
        modelRecord,
      };
    } catch (error) {
      logger.error('模型加載失敗:', error);
      throw new Error(`模型加載失敗: ${error.message}`);
    }
  }

  // 獲取模型列表
  async getModelList(modelType = null) {
    try {
      const ModelPersistence = getModelPersistenceModel();

      const whereClause = { status: 'active' };
      if (modelType) {
        whereClause.modelType = modelType;
      }

// eslint-disable-next-line no-unused-vars
      const models = await ModelPersistence.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
      });

// eslint-disable-next-line no-unused-vars
      const modelList = await Promise.all(
        models.map(async (model) => {
          try {
            const metadata = JSON.parse(model.metadata);
            const stats = await fs.stat(model.filePath);

            return {
              id: model.id,
              modelType: model.modelType,
              version: model.version,
              fileName: model.fileName,
              metadata,
              fileSize: stats.size,
              createdAt: model.createdAt,
              updatedAt: model.updatedAt,
            };
          } catch (error) {
            logger.warn(`讀取模型元數據失敗: ${model.fileName}`, error);
            return null;
          }
        })
      );

      return {
        success: true,
        models: modelList.filter((m) => m !== null),
      };
    } catch (error) {
      logger.error('獲取模型列表失敗:', error);
      throw new Error(`獲取模型列表失敗: ${error.message}`);
    }
  }

  // 刪除模型
  async deleteModel(modelType, version) {
    try {
      const ModelPersistence = getModelPersistenceModel();

// eslint-disable-next-line no-unused-vars
      const modelRecord = await ModelPersistence.findOne({
        where: { modelType, version, status: 'active' },
      });

      if (!modelRecord) {
        throw new Error(`未找到模型: ${modelType} v${version}`);
      }

      // 刪除文件
      try {
        await fs.unlink(modelRecord.filePath);
        await fs.unlink(modelRecord.metadataPath);
      } catch (fileError) {
        logger.warn('刪除模型文件失敗:', fileError);
      }

      // 更新數據庫記錄
      await modelRecord.update({ status: 'deleted' });

      logger.info(`模型刪除成功: ${modelRecord.fileName}`);

      return {
        success: true,
        message: `模型 ${modelType} v${version} 已刪除`,
      };
    } catch (error) {
      logger.error('模型刪除失敗:', error);
      throw new Error(`模型刪除失敗: ${error.message}`);
    }
  }

  // 模型版本管理
  async manageModelVersions(modelType, maxVersions = 5) {
    try {
      const ModelPersistence = getModelPersistenceModel();

      // 獲取指定類型的所有活躍模型
// eslint-disable-next-line no-unused-vars
      const models = await ModelPersistence.findAll({
        where: { modelType, status: 'active' },
        order: [['createdAt', 'DESC']],
      });

      if (models.length <= maxVersions) {
        return {
          success: true,
          message: `模型版本數量 (${models.length}) 在限制範圍內 (${maxVersions})`,
        };
      }

      // 刪除舊版本
// eslint-disable-next-line no-unused-vars
      const modelsToDelete = models.slice(maxVersions);
      const deletePromises = modelsToDelete.map(async (model) => {
        try {
          await fs.unlink(model.filePath);
          await fs.unlink(model.metadataPath);
          await model.update({ status: 'deleted' });
          logger.info(`舊版本模型已刪除: ${model.fileName}`);
        } catch (error) {
          logger.warn(`刪除舊版本模型失敗: ${model.fileName}`, error);
        }
      });

      await Promise.all(deletePromises);

      return {
        success: true,
        message: `已刪除 ${modelsToDelete.length} 個舊版本模型`,
        deletedModels: modelsToDelete.map((m) => m.fileName),
      };
    } catch (error) {
      logger.error('模型版本管理失敗:', error);
      throw new Error(`模型版本管理失敗: ${error.message}`);
    }
  }

  // 模型性能評估
  async evaluateModelPerformance(modelType, version, testData) {
    try {
      const { model } = await this.loadModel(modelType, version);
      const tf = require('@tensorflow/tfjs-node');

      // 準備測試數據
// eslint-disable-next-line no-unused-vars
      const testSequences = tf.tensor3d(testData.sequences);
// eslint-disable-next-line no-unused-vars
      const testTargets = tf.tensor2d(testData.targets);

      // 進行預測
// eslint-disable-next-line no-unused-vars
      const predictions = await model.predict(testSequences).array();
      const actualValues = await testTargets.array();

      // 計算性能指標
      const mse = this.calculateMSE(predictions, actualValues);
      const mae = this.calculateMAE(predictions, actualValues);
      const accuracy = this.calculateAccuracy(predictions, actualValues);

      const performanceMetrics = {
        mse,
        mae,
        accuracy,
        rmse: Math.sqrt(mse),
        timestamp: new Date().toISOString(),
      };

      // 更新模型元數據
      await this.updateModelPerformance(modelType, version, performanceMetrics);

      return {
        success: true,
        performanceMetrics,
      };
    } catch (error) {
      logger.error('模型性能評估失敗:', error);
      throw new Error(`模型性能評估失敗: ${error.message}`);
    }
  }

  // 計算均方誤差
  calculateMSE(predictions, actuals) {
    let sum = 0;
    for (let i = 0; i < predictions.length; i++) {
      sum += Math.pow(predictions[i][0] - actuals[i][0], 2);
    }
    return sum / predictions.length;
  }

  // 計算平均絕對誤差
  calculateMAE(predictions, actuals) {
    let sum = 0;
    for (let i = 0; i < predictions.length; i++) {
      sum += Math.abs(predictions[i][0] - actuals[i][0]);
    }
    return sum / predictions.length;
  }

  // 計算準確率
  calculateAccuracy(predictions, actuals) {
    let correct = 0;
    for (let i = 0; i < predictions.length; i++) {
      const predictedDirection = predictions[i][0] > actuals[i][0] ? 1 : -1;
      const actualDirection =
        actuals[i][0] > (i > 0 ? actuals[i - 1][0] : actuals[i][0]) ? 1 : -1;
      if (predictedDirection === actualDirection) {
        correct++;
      }
    }
    return correct / predictions.length;
  }

  // 更新模型性能
  async updateModelPerformance(modelType, version, performanceMetrics) {
    try {
      const ModelPersistence = getModelPersistenceModel();

// eslint-disable-next-line no-unused-vars
      const modelRecord = await ModelPersistence.findOne({
        where: { modelType, version, status: 'active' },
      });

      if (!modelRecord) {
        throw new Error(`未找到模型: ${modelType} v${version}`);
      }

      // 讀取並更新元數據
      const metadata = JSON.parse(
        await fs.readFile(modelRecord.metadataPath, 'utf8')
      );
      metadata.performanceMetrics = {
        ...metadata.performanceMetrics,
        ...performanceMetrics,
      };

      // 保存更新後的元數據
      await fs.writeFile(
        modelRecord.metadataPath,
        JSON.stringify(metadata, null, 2)
      );

      // 更新數據庫記錄
      await modelRecord.update({
        metadata: JSON.stringify(metadata),
        updatedAt: new Date(),
      });

      logger.info(`模型性能已更新: ${modelRecord.fileName}`);
    } catch (error) {
      logger.error('更新模型性能失敗:', error);
      throw error;
    }
  }

  // 模型備份
  async backupModel(modelType, version, backupPath = null) {
    try {
      const ModelPersistence = getModelPersistenceModel();

// eslint-disable-next-line no-unused-vars
      const modelRecord = await ModelPersistence.findOne({
        where: { modelType, version, status: 'active' },
      });

      if (!modelRecord) {
        throw new Error(`未找到模型: ${modelType} v${version}`);
      }

      const backupDir =
        backupPath || path.join(process.cwd(), 'backups', 'models');
      await fs.mkdir(backupDir, { recursive: true });

      const backupFileName = `backup_${modelRecord.fileName}`;
      const backupFilePath = path.join(backupDir, backupFileName);
      const backupMetadataPath = path.join(
        backupDir,
        `${backupFileName}.meta.json`
      );

      // 複製模型文件
      await fs.copyFile(modelRecord.filePath, backupFilePath);
      await fs.copyFile(modelRecord.metadataPath, backupMetadataPath);

      logger.info(`模型備份成功: ${backupFileName}`);

      return {
        success: true,
        backupPath: backupFilePath,
        backupMetadataPath,
      };
    } catch (error) {
      logger.error('模型備份失敗:', error);
      throw new Error(`模型備份失敗: ${error.message}`);
    }
  }

  // 模型恢復
  async restoreModel(backupPath, modelType, version) {
    try {
      const backupMetadataPath = `${backupPath}.meta.json`;

      // 檢查備份文件是否存在
      await fs.access(backupPath);
      await fs.access(backupMetadataPath);

      const fileName = this.generateModelFileName(
        modelType,
        version,
        new Date().toISOString()
      );
// eslint-disable-next-line no-unused-vars
      const filePath = path.join(this.modelsDirectory, fileName);
      const metadataPath = path.join(
        this.metadataDirectory,
        `${fileName}.meta.json`
      );

      // 複製備份文件
      await fs.copyFile(backupPath, filePath);
      await fs.copyFile(backupMetadataPath, metadataPath);

      // 讀取並更新元數據
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      metadata.version = version;
      metadata.timestamp = new Date().toISOString();
      metadata.status = 'active';

      // 保存更新後的元數據
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

      // 保存到數據庫
      const ModelPersistence = getModelPersistenceModel();
      await ModelPersistence.create({
        modelType,
        version,
        fileName,
        filePath,
        metadataPath,
        metadata: JSON.stringify(metadata),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      logger.info(`模型恢復成功: ${fileName}`);

      return {
        success: true,
        fileName,
        version,
        metadata,
      };
    } catch (error) {
      logger.error('模型恢復失敗:', error);
      throw new Error(`模型恢復失敗: ${error.message}`);
    }
  }

  // 清理過期模型
  async cleanupExpiredModels(expirationDays = 30) {
    try {
      const ModelPersistence = getModelPersistenceModel();
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() - expirationDays);

      const expiredModels = await ModelPersistence.findAll({
        where: {
          status: 'deleted',
          updatedAt: {
            [require('sequelize').Op.lt]: expirationDate,
          },
        },
      });

      const cleanupPromises = expiredModels.map(async (model) => {
        try {
          // 刪除文件
          await fs.unlink(model.filePath);
          await fs.unlink(model.metadataPath);

          // 刪除數據庫記錄
          await model.destroy();

          logger.info(`過期模型已清理: ${model.fileName}`);
        } catch (error) {
          logger.warn(`清理過期模型失敗: ${model.fileName}`, error);
        }
      });

      await Promise.all(cleanupPromises);

      return {
        success: true,
        message: `已清理 ${expiredModels.length} 個過期模型`,
      };
    } catch (error) {
      logger.error('清理過期模型失敗:', error);
      throw new Error(`清理過期模型失敗: ${error.message}`);
    }
  }
}

module.exports = new ModelPersistenceService();

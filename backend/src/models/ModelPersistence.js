const { DataTypes } = require('sequelize');

let ModelPersistenceModel = null;

function getModelPersistenceModel(sequelize) {
  if (ModelPersistenceModel) {
    return ModelPersistenceModel;
  }

  ModelPersistenceModel = sequelize.define(
    'ModelPersistence',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      modelType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '模型類型 (lstm, gru, transformer, ensemble)',
      },
      version: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '模型版本號',
      },
      fileName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '模型文件名',
      },
      filePath: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: '模型文件完整路徑',
      },
      metadataPath: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: '元數據文件完整路徑',
      },
      metadata: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '模型元數據 (JSON 格式)',
      },
      status: {
        type: DataTypes.ENUM('active', 'deleted', 'archived'),
        defaultValue: 'active',
        allowNull: false,
        comment: '模型狀態',
      },
      fileSize: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: '模型文件大小 (字節)',
      },
      checksum: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: '文件 SHA256 校驗和',
      },
      performanceMetrics: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '性能指標 (JSON 格式)',
      },
      trainingHistory: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '訓練歷史 (JSON 格式)',
      },
      tags: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '模型標籤 (JSON 格式)',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '模型描述',
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '創建者用戶ID',
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '更新者用戶ID',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'model_persistence',
      timestamps: true,
      indexes: [
        {
          name: 'idx_model_type_version',
          fields: ['modelType', 'version'],
        },
        {
          name: 'idx_model_status',
          fields: ['status'],
        },
        {
          name: 'idx_model_created_at',
          fields: ['createdAt'],
        },
        {
          name: 'idx_model_type_status',
          fields: ['modelType', 'status'],
        },
      ],
      comment: '深度學習模型持久化表',
    }
  );

  // 添加實例方法
  ModelPersistenceModel.prototype.getMetadata = function () {
    try {
      return JSON.parse(this.metadata);
    } catch (error) {
      return null;
    }
  };

  ModelPersistenceModel.prototype.getPerformanceMetrics = function () {
    try {
      return JSON.parse(this.performanceMetrics);
    } catch (error) {
      return null;
    }
  };

  ModelPersistenceModel.prototype.getTrainingHistory = function () {
    try {
      return JSON.parse(this.trainingHistory);
    } catch (error) {
      return null;
    }
  };

  ModelPersistenceModel.prototype.getTags = function () {
    try {
      return JSON.parse(this.tags);
    } catch (error) {
      return [];
    }
  };

  // 添加類方法
  ModelPersistenceModel.findByTypeAndVersion = function (modelType, version) {
    return this.findOne({
      where: { modelType, version, status: 'active' },
    });
  };

  ModelPersistenceModel.findLatestByType = function (modelType) {
    return this.findOne({
      where: { modelType, status: 'active' },
      order: [['createdAt', 'DESC']],
    });
  };

  ModelPersistenceModel.findByPerformance = function (
    modelType,
    minAccuracy = 0
  ) {
    return this.findAll({
      where: {
        modelType,
        status: 'active',
      },
      order: [['createdAt', 'DESC']],
    }).then((models) => {
      return models.filter((model) => {
        const metrics = model.getPerformanceMetrics();
        return metrics && metrics.accuracy >= minAccuracy;
      });
    });
  };

  ModelPersistenceModel.getModelStats = function () {
    return this.findAll({
      where: { status: 'active' },
      attributes: [
        'modelType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('MAX', sequelize.col('createdAt')), 'latestCreated'],
        [sequelize.fn('MIN', sequelize.col('createdAt')), 'earliestCreated'],
      ],
      group: ['modelType'],
    });
  };

  return ModelPersistenceModel;
}

module.exports = {
  getModelPersistenceModel,
};

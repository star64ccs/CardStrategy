const { DataTypes } = require('sequelize');

let TrainingData = null;

const createTrainingDataModel = (sequelize) => {
  if (TrainingData) return TrainingData;

  TrainingData = sequelize.define('TrainingData', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'cards',
        key: 'id'
      }
    },
    imageData: {
      type: DataTypes.TEXT, // base64圖片數據
      allowNull: false
    },
    source: {
      type: DataTypes.ENUM('user_upload', 'official_api', 'third_party', 'user_correction', 'web_scraping'),
      allowNull: false,
      defaultValue: 'user_upload'
    },
    quality: {
      type: DataTypes.ENUM('high', 'medium', 'low'),
      allowNull: false,
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'annotated', 'validated', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {
        uploadDate: null,
        userId: null,
        confidence: 0,
        processingTime: 0,
        imageSize: 0,
        imageFormat: '',
        imageDimensions: { width: 0, height: 0 },
        lightingConditions: '',
        imageQuality: '',
        uploadSource: ''
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'training_data',
    timestamps: true,
    indexes: [
      {
        fields: ['cardId']
      },
      {
        fields: ['source']
      },
      {
        fields: ['quality']
      },
      {
        fields: ['status']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return TrainingData;
};

const getTrainingDataModel = () => {
  if (!TrainingData) {
    throw new Error('TrainingData model not initialized. Call createTrainingDataModel first.');
  }
  return TrainingData;
};

module.exports = { createTrainingDataModel, getTrainingDataModel };

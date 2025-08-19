const { DataTypes } = require('sequelize');

let PredictionModel = null;

const createPredictionModel = (sequelize) => {
  if (PredictionModel) return PredictionModel;

  PredictionModel = sequelize.define('PredictionModel', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cards',
        key: 'id'
      }
    },
    modelType: {
      type: DataTypes.ENUM('linear', 'polynomial', 'exponential', 'arima', 'lstm', 'ensemble'),
      allowNull: false,
      defaultValue: 'linear'
    },
    timeframe: {
      type: DataTypes.ENUM('1d', '7d', '30d', '90d', '180d', '365d'),
      allowNull: false,
      defaultValue: '30d'
    },
    predictedPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    confidence: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.5,
      validate: {
        min: 0,
        max: 1
      }
    },
    accuracy: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      validate: {
        min: 0,
        max: 1
      }
    },
    trend: {
      type: DataTypes.ENUM('up', 'down', 'stable'),
      allowNull: false,
      defaultValue: 'stable'
    },
    volatility: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    factors: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
    riskLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium'
    },
    predictionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    targetDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    modelParameters: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
    trainingDataSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    lastTrainingDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'prediction_models',
    timestamps: true,
    indexes: [
      {
        fields: ['cardId']
      },
      {
        fields: ['modelType']
      },
      {
        fields: ['timeframe']
      },
      {
        fields: ['predictionDate']
      },
      {
        fields: ['targetDate']
      },
      {
        fields: ['confidence']
      },
      {
        fields: ['trend']
      },
      {
        fields: ['cardId', 'timeframe']
      },
      {
        fields: ['cardId', 'modelType']
      }
    ]
  });

  return PredictionModel;
};

const getPredictionModel = () => {
  if (!PredictionModel) {
    try {
      const { getSequelize } = require('../config/database');
      const sequelize = getSequelize();

      if (!sequelize) {
        console.error('Sequelize instance is null - database connection may not be established');
        return null;
      }

      PredictionModel = createPredictionModel(sequelize);
      console.log('PredictionModel created successfully');
    } catch (error) {
      console.error('Error creating PredictionModel:', error);
      return null;
    }
  }
  return PredictionModel;
};

module.exports = getPredictionModel;

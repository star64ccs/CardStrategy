const { DataTypes } = require('sequelize');

let AIAnalysis = null;

const createAIAnalysisModel = (sequelize) => {
  if (AIAnalysis) return AIAnalysis;

  AIAnalysis = sequelize.define('AIAnalysis', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'cards',
        key: 'id'
      }
    },
    analysisType: {
      type: DataTypes.ENUM('image_recognition', 'price_prediction', 'investment_analysis', 'market_analysis', 'portfolio_analysis', 'smart_recommendation'),
      allowNull: false
    },
    confidence: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0.00,
        max: 1.00
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    inputData: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    result: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    processingTime: {
      type: DataTypes.INTEGER, // milliseconds
      allowNull: true
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'ai_analyses',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['cardId']
      },
      {
        fields: ['analysisType']
      },
      {
        fields: ['status']
      },
      {
        fields: ['userId', 'analysisType']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return AIAnalysis;
};

const getAIAnalysisModel = () => {
  if (!AIAnalysis) {
    try {
      const { getSequelize } = require('../config/database');
      const sequelize = getSequelize();

      if (!sequelize) {
        // logger.info('Sequelize instance is null - database connection may not be established');
        return null;
      }

      AIAnalysis = createAIAnalysisModel(sequelize);
      // logger.info('AIAnalysis model created successfully');
    } catch (error) {
      // logger.info('Error creating AIAnalysis model:', error);
      return null;
    }
  }
  return AIAnalysis;
};

module.exports = getAIAnalysisModel;

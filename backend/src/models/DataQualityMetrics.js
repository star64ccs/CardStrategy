const { DataTypes } = require('sequelize');

let DataQualityMetrics = null;

const createDataQualityMetricsModel = (sequelize) => {
  if (DataQualityMetrics) return DataQualityMetrics;

  DataQualityMetrics = sequelize.define('DataQualityMetrics', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    dataType: {
      type: DataTypes.ENUM('training', 'annotation', 'validation', 'market', 'user_generated'),
      allowNull: false
    },
    completeness: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.0000,
      validate: {
        min: 0.0000,
        max: 1.0000
      }
    },
    accuracy: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.0000,
      validate: {
        min: 0.0000,
        max: 1.0000
      }
    },
    consistency: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.0000,
      validate: {
        min: 0.0000,
        max: 1.0000
      }
    },
    timeliness: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.0000,
      validate: {
        min: 0.0000,
        max: 1.0000
      }
    },
    overallScore: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.0000,
      validate: {
        min: 0.0000,
        max: 1.0000
      }
    },
    assessmentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    dataSource: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    sampleSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {
        assessmentMethod: '',
        qualityThreshold: 0.8,
        improvementSuggestions: [],
        errorTypes: [],
        dataAge: 0,
        updateFrequency: '',
        qualityTrend: 'stable',
        criticalIssues: [],
        warningIssues: [],
        infoIssues: []
      }
    }
  }, {
    tableName: 'data_quality_metrics',
    timestamps: true,
    indexes: [
      {
        fields: ['dataType']
      },
      {
        fields: ['assessmentDate']
      },
      {
        fields: ['overallScore']
      },
      {
        fields: ['dataSource']
      },
      {
        fields: ['isActive']
      }
    ]
  });

  return DataQualityMetrics;
};

const getDataQualityMetricsModel = () => {
  if (!DataQualityMetrics) {
    throw new Error('DataQualityMetrics model not initialized. Call createDataQualityMetricsModel first.');
  }
  return DataQualityMetrics;
};

module.exports = { createDataQualityMetricsModel, getDataQualityMetricsModel };

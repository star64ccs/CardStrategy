const { DataTypes } = require('sequelize');

let DataQualityAssessment = null;

const createDataQualityAssessmentModel = (sequelize) => {
  if (DataQualityAssessment) return DataQualityAssessment;

  DataQualityAssessment = sequelize.define('DataQualityAssessment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    assessmentType: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'custom'),
      allowNull: false,
    },
    assessmentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'failed', 'cancelled'),
      allowNull: false,
      defaultValue: 'scheduled',
    },
    dataTypes: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    assessmentCriteria: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        completeness: { weight: 0.25, threshold: 0.8 },
        accuracy: { weight: 0.3, threshold: 0.85 },
        consistency: { weight: 0.25, threshold: 0.8 },
        timeliness: { weight: 0.2, threshold: 0.75 },
      },
    },
    results: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        overallScore: 0,
        completeness: 0,
        accuracy: 0,
        consistency: 0,
        timeliness: 0,
        sampleSize: 0,
        dataSources: [],
        qualityDistribution: {},
        issues: [],
        recommendations: [],
      },
    },
    executionTime: {
      type: DataTypes.INTEGER, // milliseconds
      allowNull: true,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    triggeredBy: {
      type: DataTypes.ENUM('system', 'manual', 'api'),
      allowNull: false,
      defaultValue: 'system',
    },
    triggeredByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    nextAssessmentDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        assessmentVersion: '1.0',
        algorithmVersion: '1.0',
        dataRange: {},
        filters: {},
        customSettings: {},
      },
    },
  },
  {
    tableName: 'data_quality_assessments',
    timestamps: true,
    indexes: [
      { fields: ['assessmentType'] },
      { fields: ['assessmentDate'] },
      { fields: ['scheduledDate'] },
      { fields: ['status'] },
      { fields: ['triggeredBy'] },
      { fields: ['triggeredByUserId'] },
      { fields: ['nextAssessmentDate'] },
      { fields: ['assessmentDate', 'status'] },
      { fields: ['scheduledDate', 'status'] },
    ]
  });

  return DataQualityAssessment;
};

const getDataQualityAssessmentModel = () => {
  if (!DataQualityAssessment) {
    try {
      const { getSequelize } = require('../config/database');
      const sequelize = getSequelize();
      if (sequelize) {
        DataQualityAssessment = createDataQualityAssessmentModel(sequelize);
      }
    } catch (error) {
      console.error('Error creating DataQualityAssessment model:', error);
      return null;
    }
  }
  return DataQualityAssessment;
};

module.exports = {
  createDataQualityAssessmentModel,
  getDataQualityAssessmentModel
};

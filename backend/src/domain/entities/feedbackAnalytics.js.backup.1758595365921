const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FeedbackAnalytics = sequelize.define(
  'FeedbackAnalytics',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    feedbackType: {
      type: DataTypes.ENUM(
        'data_quality',
        'annotation_quality',
        'system_suggestion',
        'bug_report',
        'feature_request'
      ),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        'card_recognition',
        'centering_evaluation',
        'authenticity_verification',
        'price_prediction',
        'data_collection',
        'annotation_process',
        'general'
      ),
      allowNull: false,
    },
    totalSubmitted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalResolved: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    averageResolutionTime: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    satisfactionScore: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    priorityDistribution: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    statusDistribution: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    severityDistribution: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: 'feedback_analytics',
    timestamps: true,
    indexes: [
      {
        fields: ['date'],
      },
      {
        fields: ['feedbackType'],
      },
      {
        fields: ['category'],
      },
      {
        fields: ['date', 'feedbackType'],
      },
      {
        fields: ['date', 'category'],
      },
    ],
  }
);

module.exports = FeedbackAnalytics;

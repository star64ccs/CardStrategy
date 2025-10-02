const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AssessmentSchedule = sequelize.define(
  'AssessmentSchedule',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    assessmentType: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'custom'),
      allowNull: false,
    },
    frequency: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        interval: 1,
        unit: 'days',
        timeOfDay: '00:00',
        daysOfWeek: [], // for weekly
        dayOfMonth: 1, // for monthly
        monthOfQuarter: 1, // for quarterly
      },
    },
    dataTypes: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [
        'training',
        'annotation',
        'validation',
        'market',
        'user_generated',
      ],
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
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastRunDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nextRunDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    totalRuns: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    successfulRuns: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    failedRuns: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    averageExecutionTime: {
      type: DataTypes.INTEGER, // milliseconds
      allowNull: true,
    },
    notificationSettings: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        onSuccess: false,
        onFailure: true,
        onCompletion: false,
        recipients: [],
        emailNotifications: false,
        slackNotifications: false,
      },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        version: '1.0',
        tags: [],
        priority: 'normal',
        category: 'data_quality',
      },
    },
  },
  {
    tableName: 'assessment_schedules',
    timestamps: true,
    indexes: [
      { fields: ['assessmentType'] },
      { fields: ['isActive'] },
      { fields: ['nextRunDate'] },
      { fields: ['createdBy'] },
      { fields: ['isActive', 'nextRunDate'] },
      { fields: ['assessmentType', 'isActive'] },
    ],
  }
);

module.exports = AssessmentSchedule;

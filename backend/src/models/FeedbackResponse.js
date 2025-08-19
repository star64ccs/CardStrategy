const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FeedbackResponse = sequelize.define('FeedbackResponse', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  feedbackId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'feedbacks',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  responseType: {
    type: DataTypes.ENUM('comment', 'status_update', 'assignment', 'resolution', 'follow_up'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isInternal: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'feedback_responses',
  timestamps: true,
  indexes: [
    {
      fields: ['feedbackId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['responseType']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = FeedbackResponse;

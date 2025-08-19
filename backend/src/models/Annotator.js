const { DataTypes } = require('sequelize');

let Annotator = null;

const createAnnotatorModel = (sequelize) => {
  if (Annotator) return Annotator;

  Annotator = sequelize.define('Annotator', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    level: {
      type: DataTypes.ENUM('expert', 'senior', 'junior'),
      allowNull: false,
      defaultValue: 'junior'
    },
    specializations: {
      type: DataTypes.JSON,
      defaultValue: []
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
    totalAnnotations: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    completedAnnotations: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    averageProcessingTime: {
      type: DataTypes.INTEGER, // milliseconds
      allowNull: false,
      defaultValue: 0
    },
    lastActiveDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {
        trainingCompleted: false,
        certificationDate: null,
        reviewCount: 0,
        errorRate: 0,
        preferredCategories: [],
        availability: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: { start: '10:00', end: '15:00' },
          sunday: { start: '10:00', end: '15:00' }
        }
      }
    }
  }, {
    tableName: 'annotators',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId']
      },
      {
        fields: ['level']
      },
      {
        fields: ['accuracy']
      },
      {
        fields: ['isActive']
      }
    ]
  });

  return Annotator;
};

const getAnnotatorModel = () => {
  if (!Annotator) {
    throw new Error('Annotator model not initialized. Call createAnnotatorModel first.');
  }
  return Annotator;
};

module.exports = { createAnnotatorModel, getAnnotatorModel };

const { DataTypes } = require('sequelize');

let AnnotationData = null;

const createAnnotationDataModel = (sequelize) => {
  if (AnnotationData) return AnnotationData;

  AnnotationData = sequelize.define(
    'AnnotationData',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      trainingDataId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'training_data',
          key: 'id',
        },
      },
      annotatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'annotators',
          key: 'id',
        },
      },
      annotationType: {
        type: DataTypes.ENUM(
          'card_identification',
          'condition_assessment',
          'authenticity_verification',
          'centering_analysis'
        ),
        allowNull: false,
      },
      annotationResult: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
      },
      confidence: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          min: 0.0,
          max: 1.0,
        },
      },
      reviewStatus: {
        type: DataTypes.ENUM('pending', 'reviewed', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      reviewNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      reviewedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'annotators',
          key: 'id',
        },
      },
      reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      processingTime: {
        type: DataTypes.INTEGER, // milliseconds
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {
          annotationTool: '',
          annotationVersion: '',
          qualityScore: 0,
          difficultyLevel: 'medium',
          specialNotes: '',
          boundingBoxes: [],
          featurePoints: [],
          textAnnotations: [],
        },
      },
    },
    {
      tableName: 'annotation_data',
      timestamps: true,
      indexes: [
        {
          fields: ['trainingDataId'],
        },
        {
          fields: ['annotatorId'],
        },
        {
          fields: ['annotationType'],
        },
        {
          fields: ['reviewStatus'],
        },
        {
          fields: ['confidence'],
        },
        {
          fields: ['createdAt'],
        },
      ],
    }
  );

  return AnnotationData;
};

const getAnnotationDataModel = () => {
  if (!AnnotationData) {
    throw new Error(
      'AnnotationData model not initialized. Call createAnnotationDataModel first.'
    );
  }
  return AnnotationData;
};

module.exports = { createAnnotationDataModel, getAnnotationDataModel };

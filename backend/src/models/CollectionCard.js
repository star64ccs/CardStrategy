const { DataTypes } = require('sequelize');

let CollectionCard = null;

const createCollectionCardModel = (sequelize) => {
  if (CollectionCard) return CollectionCard;

  CollectionCard = sequelize.define(
    'CollectionCard',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1,
        },
      },
      condition: {
        type: DataTypes.ENUM(
          'mint',
          'near-mint',
          'excellent',
          'good',
          'light-played',
          'played',
          'poor'
        ),
        allowNull: false,
        defaultValue: 'near-mint',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isFoil: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isSigned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isGraded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      grade: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      estimatedValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      addedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'collection_cards',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['collectionId', 'cardId'],
        },
        {
          fields: ['collectionId'],
        },
        {
          fields: ['cardId'],
        },
      ],
    }
  );

  return CollectionCard;
};

const getCollectionCardModel = () => {
  if (!CollectionCard) {
    try {
      const { getSequelize } = require('../config/database');
      const sequelize = getSequelize();

      if (!sequelize) {
        // logger.info('Sequelize instance is null - database connection may not be established');
        return null;
      }

      CollectionCard = createCollectionCardModel(sequelize);
      // logger.info('CollectionCard model created successfully');
    } catch (error) {
      // logger.info('Error creating CollectionCard model:', error);
      return null;
    }
  }
  return CollectionCard;
};

module.exports = getCollectionCardModel;

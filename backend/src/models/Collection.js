const { DataTypes } = require('sequelize');

let Collection = null;

const createCollectionModel = (sequelize) => {
  if (Collection) return Collection;

  Collection = sequelize.define(
    'Collection',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      coverImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tags: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      statistics: {
        type: DataTypes.JSON,
        defaultValue: {
          totalCards: 0,
          totalValue: 0,
          averagePrice: 0,
          mostExpensiveCard: null,
          rarestCard: null,
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'collections',
      timestamps: true,
      indexes: [
        {
          fields: ['userId'],
        },
        {
          fields: ['name'],
        },
        {
          fields: ['isPublic'],
        },
      ],
    }
  );

  return Collection;
};

const getCollectionModel = () => {
  if (!Collection) {
    try {
      const { getSequelize } = require('../config/database');
      const sequelize = getSequelize();

      if (!sequelize) {
        // logger.info('Sequelize instance is null - database connection may not be established');
        return null;
      }

      Collection = createCollectionModel(sequelize);
      // logger.info('Collection model created successfully');
    } catch (error) {
      // logger.info('Error creating Collection model:', error);
      return null;
    }
  }
  return Collection;
};

module.exports = getCollectionModel;

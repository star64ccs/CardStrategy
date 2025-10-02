const { DataTypes } = require('sequelize');

let MarketData = null;

const createMarketDataModel = (sequelize) => {
  if (MarketData) return MarketData;

  MarketData = sequelize.define(
    'MarketData',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'cards',
          key: 'id',
        },
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      openPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      closePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      highPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      lowPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      volume: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      transactions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      priceChange: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      priceChangePercent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      marketCap: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      trend: {
        type: DataTypes.ENUM('up', 'down', 'stable'),
        allowNull: false,
        defaultValue: 'stable',
      },
      volatility: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
    },
    {
      tableName: 'market_data',
      timestamps: true,
      indexes: [
        {
          fields: ['cardId'],
        },
        {
          fields: ['date'],
        },
        {
          fields: ['cardId', 'date'],
        },
        {
          fields: ['trend'],
        },
        {
          fields: ['volume'],
        },
      ],
    }
  );

  return MarketData;
};

const getMarketDataModel = () => {
  if (!MarketData) {
    try {
      const { getSequelize } = require('../config/database');
      const sequelize = getSequelize();

      if (!sequelize) {
        // logger.info('Sequelize instance is null - database connection may not be established');
        return null;
      }

      MarketData = createMarketDataModel(sequelize);
      // logger.info('MarketData model created successfully');
    } catch (error) {
      // logger.info('Error creating MarketData model:', error);
      return null;
    }
  }
  return MarketData;
};

module.exports = getMarketDataModel;

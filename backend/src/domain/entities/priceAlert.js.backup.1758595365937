const { DataTypes } = require('sequelize');

let PriceAlert = null;

const createPriceAlertModel = (sequelize) => {
  if (PriceAlert) return PriceAlert;

  PriceAlert = sequelize.define(
    'PriceAlert',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      alertType: {
        type: DataTypes.ENUM('above', 'below', 'change'),
        allowNull: false,
      },
      targetPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      percentageChange: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
          min: 0,
          max: 100,
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      lastTriggered: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      triggerCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      notificationChannels: {
        type: DataTypes.JSON,
        defaultValue: {
          email: true,
          push: true,
          sms: false,
        },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'price_alerts',
      timestamps: true,
      indexes: [
        {
          fields: ['userId'],
        },
        {
          fields: ['cardId'],
        },
        {
          fields: ['isActive'],
        },
        {
          fields: ['alertType'],
        },
      ],
    }
  );

  return PriceAlert;
};

const getPriceAlertModel = () => {
  if (!PriceAlert) {
    try {
      const { getSequelize } = require('../config/database');
      const sequelize = getSequelize();

      if (!sequelize) {
        // logger.info('Sequelize instance is null - database connection may not be established');
        return null;
      }

      PriceAlert = createPriceAlertModel(sequelize);
      // logger.info('PriceAlert model created successfully');
    } catch (error) {
      // logger.info('Error creating PriceAlert model:', error);
      return null;
    }
  }
  return PriceAlert;
};

module.exports = getPriceAlertModel;

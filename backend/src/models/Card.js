const { DataTypes } = require('sequelize');

let Card = null;

const createCardModel = (sequelize) => {
  if (Card) return Card;

  Card = sequelize.define('Card', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    setName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cardNumber: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    rarity: {
      type: DataTypes.ENUM('common', 'uncommon', 'rare', 'mythic', 'special'),
      allowNull: false
    },
    cardType: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    currentPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    marketPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    priceHistory: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    marketData: {
      type: DataTypes.JSON,
      defaultValue: {
        lastUpdated: null,
        priceChange24h: 0,
        priceChange7d: 0,
        volume24h: 0,
        marketCap: 0
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'cards',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['setName', 'cardNumber']
      },
      {
        fields: ['name']
      },
      {
        fields: ['rarity']
      },
      {
        fields: ['currentPrice']
      }
    ]
  });

  return Card;
};

const getCardModel = () => {
  if (!Card) {
    try {
      const { getSequelize } = require('../config/database');
      const sequelize = getSequelize();

      if (!sequelize) {
        // logger.info('Sequelize instance is null - database connection may not be established');
        return null;
      }

      Card = createCardModel(sequelize);
      // logger.info('Card model created successfully');
    } catch (error) {
      // logger.info('Error creating Card model:', error);
      return null;
    }
  }
  return Card;
};

module.exports = getCardModel;


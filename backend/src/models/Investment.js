const { DataTypes } = require('sequelize');

let Investment = null;

const createInvestmentModel = (sequelize) => {
  if (Investment) return Investment;

  Investment = sequelize.define('Investment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cards',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('purchase', 'sale'),
      allowNull: false,
      defaultValue: 'purchase'
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    purchaseDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    condition: {
      type: DataTypes.ENUM('mint', 'near-mint', 'excellent', 'good', 'light-played', 'played', 'poor'),
      allowNull: false,
      defaultValue: 'near-mint'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    currentValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    profitLoss: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    profitLossPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    status: {
      type: DataTypes.ENUM('active', 'sold', 'cancelled'),
      allowNull: false,
      defaultValue: 'active'
    },
    riskLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium'
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
    tableName: 'investments',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['cardId']
      },
      {
        fields: ['purchaseDate']
      },
      {
        fields: ['condition']
      },
      {
        fields: ['type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['riskLevel']
      }
    ]
  });

  return Investment;
};

const getInvestmentModel = () => {
  if (!Investment) {
    try {
      const { getSequelize } = require('../config/database');
      const sequelize = getSequelize();

      if (!sequelize) {
        console.error('Sequelize instance is null - database connection may not be established');
        return null;
      }

      Investment = createInvestmentModel(sequelize);
      console.log('Investment model created successfully');
    } catch (error) {
      console.error('Error creating Investment model:', error);
      return null;
    }
  }
  return Investment;
};

module.exports = getInvestmentModel;

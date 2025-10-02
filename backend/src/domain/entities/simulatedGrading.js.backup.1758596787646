const { DataTypes } = require('sequelize');
const crypto = require('crypto');

let SimulatedGrading = null;

const createSimulatedGradingModel = (sequelize) => {
  if (SimulatedGrading) return SimulatedGrading;

  SimulatedGrading = sequelize.define(
    'SimulatedGrading',
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
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      agency: {
        type: DataTypes.ENUM('PSA', 'BGS', 'CGC'),
        allowNull: false,
      },
      gradingNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
          len: [8, 20],
        },
      },
      cardInfo: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {
          name: '',
          setName: '',
          cardNumber: '',
          rarity: '',
          imageUrl: '',
        },
      },
      gradingResult: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
      },
      shareUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      qrCode: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      lastViewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
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
      tableName: 'simulated_gradings',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['gradingNumber'],
        },
        {
          fields: ['cardId'],
        },
        {
          fields: ['userId'],
        },
        {
          fields: ['agency'],
        },
        {
          fields: ['expiresAt'],
        },
        {
          fields: ['isActive'],
        },
        {
          fields: ['createdAt'],
        },
      ],
      hooks: {
        beforeCreate: (instance) => {
          // 生成分享 URL
          if (!instance.shareUrl) {
            instance.shareUrl = generateShareUrl(instance.gradingNumber);
          }

          // 生成 QR Code URL
          if (!instance.qrCode) {
            instance.qrCode = generateQRCodeUrl(instance.gradingNumber);
          }

          // 設置過期時間（默認 365 天）
          if (!instance.expiresAt) {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 365);
            instance.expiresAt = expiresAt;
          }
        },
      },
    }
  );

  return SimulatedGrading;
};

// 生成分享 URL
function generateShareUrl(gradingNumber) {
  return `${process.env.FRONTEND_URL || 'https://cardstrategy.com'}/grading/${gradingNumber}`;
}

// 生成 QR Code URL
function generateQRCodeUrl(gradingNumber) {
  const shareUrl = generateShareUrl(gradingNumber);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
}

// 生成隨機鑑定編號
function generateGradingNumber(agency) {
  const chars = '0123456789';
  let number = '';
  for (let i = 0; i < 8; i++) {
    number += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${agency}-${number}`;
}

const getSimulatedGradingModel = () => {
  if (!SimulatedGrading) {
    throw new Error('SimulatedGrading model not initialized');
  }
  return SimulatedGrading;
};

module.exports = {
  createSimulatedGradingModel,
  getSimulatedGradingModel,
  generateGradingNumber,
};

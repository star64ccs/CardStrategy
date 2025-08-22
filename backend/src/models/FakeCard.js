const { DataTypes } = require('sequelize');

let FakeCard = null;

const createFakeCardModel = (sequelize) => {
  if (FakeCard) return FakeCard;

  FakeCard = sequelize.define(
    'FakeCard',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      cardName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '卡牌名稱',
      },
      cardType: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '卡牌類型（Pokémon、Yu-Gi-Oh!、MTG等）',
      },
      fakeType: {
        type: DataTypes.ENUM('counterfeit', 'reprint', 'custom', 'proxy'),
        allowNull: false,
        defaultValue: 'counterfeit',
        comment: '假卡類型',
      },
      imageUrls: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        comment: '假卡圖片URL列表',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '詳細描述',
      },
      fakeIndicators: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        comment: '假卡特徵列表',
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
        comment: '審核狀態',
      },
      submissionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '提交日期',
      },
      reviewDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '審核日期',
      },
      reviewerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        comment: '審核員ID',
      },
      reviewerNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '審核員備註',
      },
      rewardPoints: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: '獎勵積分',
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: '額外元數據',
      },
    },
    {
      tableName: 'fake_cards',
      timestamps: true,
      indexes: [
        {
          fields: ['userId'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['fakeType'],
        },
        {
          fields: ['submissionDate'],
        },
        {
          fields: ['cardType'],
        },
      ],
    }
  );

  // 定義關聯關係
  FakeCard.associate = (models) => {
    FakeCard.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });

    FakeCard.belongsTo(models.User, {
      foreignKey: 'reviewerId',
      as: 'reviewer',
    });
  };

  return FakeCard;
};

module.exports = createFakeCardModel;

const { DataTypes } = require('sequelize');
const crypto = require('crypto');

let ShareVerification = null;

const createShareVerificationModel = (sequelize) => {
  if (ShareVerification) return ShareVerification;

  ShareVerification = sequelize.define('ShareVerification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    verificationCode: {
      type: DataTypes.STRING(16),
      allowNull: false,
      unique: true,
      validate: {
        len: [8, 16]
      }
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
    analysisType: {
      type: DataTypes.ENUM('centering', 'authenticity', 'comprehensive'),
      allowNull: false
    },
    analysisResult: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
    shareUrl: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastViewedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'share_verifications',
    timestamps: true,
    indexes: [
      {
        fields: ['verificationCode'],
        unique: true
      },
      {
        fields: ['userId']
      },
      {
        fields: ['cardId']
      },
      {
        fields: ['analysisType']
      },
      {
        fields: ['expiresAt']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['createdAt']
      }
    ],
    hooks: {
      beforeCreate: (instance) => {
        // 生成隨機驗證碼
        if (!instance.verificationCode) {
          instance.verificationCode = generateVerificationCode();
        }

        // 設置過期時間（默認 30 天）
        if (!instance.expiresAt) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);
          instance.expiresAt = expiresAt;
        }

        // 生成分享 URL
        if (!instance.shareUrl) {
          instance.shareUrl = generateShareUrl(instance.verificationCode);
        }
      }
    }
  });

  return ShareVerification;
};

// 生成隨機驗證碼
function generateVerificationCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 生成分享 URL
function generateShareUrl(verificationCode) {
  const baseUrl = process.env.FRONTEND_URL || 'https://cardstrategy.com';
  return `${baseUrl}/verify/${verificationCode}`;
}

// 生成 QR 碼 URL
function generateQRCodeUrl(shareUrl) {
  const qrApiUrl = 'https://api.qrserver.com/v1/create-qr-code/';
  const params = new URLSearchParams({
    size: '300x300',
    data: shareUrl,
    format: 'png'
  });
  return `${qrApiUrl}?${params.toString()}`;
}

// 生成社交媒體分享鏈接
function generateSocialShareLinks(shareUrl, message = '查看我的卡牌評估結果！') {
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedMessage = encodeURIComponent(message);

  return {
    whatsapp: `whatsapp://send?text=${encodedMessage}%0A%0A${encodedUrl}`,
    instagram: `instagram://library?AssetPath=${encodedUrl}&InstagramCaption=${encodedMessage}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}%0A%0A${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`
  };
}

const getShareVerificationModel = () => {
  return ShareVerification;
};

module.exports = {
  createShareVerificationModel,
  getShareVerificationModel,
  generateVerificationCode,
  generateShareUrl,
  generateQRCodeUrl,
  generateSocialShareLinks
};

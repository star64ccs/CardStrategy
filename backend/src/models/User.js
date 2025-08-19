const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

let User = null;

const createUserModel = (sequelize) => {
  if (User) return User;

  User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 30],
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 255],
        notEmpty: true
      }
    },
    displayName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [1, 50],
        notEmpty: true
      }
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('user', 'premium', 'admin'),
      defaultValue: 'user'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    preferences: {
      type: DataTypes.JSON,
      defaultValue: {
        language: 'zh-TW',
        theme: 'auto',
        notifications: {
          email: true,
          push: true,
          market: true,
          investment: true
        }
      }
    },
    membership: {
      type: DataTypes.JSON,
      defaultValue: {
        type: 'free',
        startDate: new Date(),
        endDate: null,
        features: []
      }
    },
    statistics: {
      type: DataTypes.JSON,
      defaultValue: {
        totalCards: 0,
        totalCollections: 0,
        totalInvestments: 0,
        portfolioValue: 0,
        totalProfitLoss: 0
      }
    }
  }, {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // 實例方法：密碼驗證
  User.prototype.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  // 實例方法：更新最後登錄時間
  User.prototype.updateLastLogin = async function() {
    this.lastLogin = new Date();
    return await this.save();
  };

  // 實例方法：更新統計信息
  User.prototype.updateStatistics = async function(stats) {
    this.statistics = { ...this.statistics, ...stats };
    return await this.save();
  };

  // 虛擬字段：會員狀態
  User.prototype.getIsMembershipActive = function() {
    if (!this.membership.endDate) return true;
    return new Date() < new Date(this.membership.endDate);
  };

  // 虛擬字段：會員剩餘天數
  User.prototype.getMembershipDaysLeft = function() {
    if (!this.membership.endDate) return null;
    const now = new Date();
    const end = new Date(this.membership.endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return User;
};

const getUserModel = () => {
  if (!User) {
    try {
      const { getSequelize, syncDatabase } = require('../config/database');
      const sequelize = getSequelize();

      if (!sequelize) {
        // eslint-disable-next-line no-console
        console.error('Sequelize instance is null - database connection may not be established');
        return null;
      }

      User = createUserModel(sequelize);
      // eslint-disable-next-line no-console
      console.log('User model created successfully');

      // 移除自動同步，讓遷移腳本處理

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating User model:', error);
      return null;
    }
  }
  return User;
};

module.exports = getUserModel;

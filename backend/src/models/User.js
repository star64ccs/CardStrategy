const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用戶名為必填項'],
    unique: true,
    trim: true,
    minlength: [3, '用戶名至少3個字符'],
    maxlength: [30, '用戶名最多30個字符']
  },
  email: {
    type: String,
    required: [true, '郵箱為必填項'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '請輸入有效的郵箱地址']
  },
  password: {
    type: String,
    required: [true, '密碼為必填項'],
    minlength: [6, '密碼至少6個字符'],
    select: false
  },
  displayName: {
    type: String,
    required: [true, '顯示名稱為必填項'],
    trim: true,
    maxlength: [50, '顯示名稱最多50個字符']
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'premium', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  preferences: {
    language: {
      type: String,
      enum: ['zh-TW', 'en-US', 'ja-JP'],
      default: 'zh-TW'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      market: { type: Boolean, default: true },
      investment: { type: Boolean, default: true }
    }
  },
  membership: {
    type: {
      type: String,
      enum: ['free', 'basic', 'premium', 'pro'],
      default: 'free'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null
    },
    features: [{
      type: String,
      enum: ['ai_analysis', 'market_insights', 'portfolio_tracking', 'advanced_charts']
    }]
  },
  statistics: {
    totalCards: { type: Number, default: 0 },
    totalCollections: { type: Number, default: 0 },
    totalInvestments: { type: Number, default: 0 },
    portfolioValue: { type: Number, default: 0 },
    totalProfitLoss: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虛擬字段：會員狀態
userSchema.virtual('isMembershipActive').get(function() {
  if (!this.membership.endDate) return true;
  return new Date() < this.membership.endDate;
});

// 虛擬字段：會員剩餘天數
userSchema.virtual('membershipDaysLeft').get(function() {
  if (!this.membership.endDate) return null;
  const now = new Date();
  const end = new Date(this.membership.endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// 密碼加密中間件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 密碼驗證方法
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 更新最後登錄時間
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// 更新統計信息
userSchema.methods.updateStatistics = function(stats) {
  this.statistics = { ...this.statistics, ...stats };
  return this.save();
};

// 索引
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'membership.type': 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);

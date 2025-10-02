const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class SecureAuthentication {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
    this.jwtExpiresIn = '1h';
    this.refreshTokenExpiresIn = '7d';
    this.maxLoginAttempts = 5;
    this.lockoutTime = 15 * 60 * 1000; // 15分鐘
  }

  // 安全密碼哈希
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // 驗證密碼
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // 生成JWT令牌
  generateAccessToken(userId, role = 'user') {
    return jwt.sign(
      { 
        userId, 
        role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1小時
      },
      this.jwtSecret,
      { algorithm: 'HS256' }
    );
  }

  // 生成刷新令牌
  generateRefreshToken(userId) {
    return jwt.sign(
      { 
        userId, 
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7天
      },
      this.jwtSecret,
      { algorithm: 'HS256' }
    );
  }

  // 驗證JWT令牌
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('無效的令牌');
    }
  }

  // 密碼強度檢查
  validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    const isLongEnough = password.length >= minLength;

    const score = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, isLongEnough]
      .filter(Boolean).length;

    return {
      isValid: score >= 4,
      score,
      requirements: {
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
      }
    };
  }

  // 生成安全的隨機字符串
  generateSecureRandom(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // 生成CSRF令牌
  generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // 驗證CSRF令牌
  verifyCSRFToken(token, sessionToken) {
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(sessionToken, 'hex')
    );
  }
}

module.exports = new SecureAuthentication();
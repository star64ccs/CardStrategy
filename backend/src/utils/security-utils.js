const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { logger } = require('../utils/unified-logger');

// PasswordEncrypt
const hashPassword = async (password) => {
  try {
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    logger.error('Password hashing failed:', error);
    throw new Error('Password hashing failed');
  }
};

// PasswordVerify
const verifyPassword = async (password, hash) => {
  try {
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  } catch (error) {
    logger.error('Password verification failed:', error);
    return false;
  }
};

// JWT Token 生成
const generateToken = (payload, expiresIn = '24h') => {
  try {
// eslint-disable-next-line no-unused-vars
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign(payload, secret, { expiresIn });
    return token;
  } catch (error) {
    logger.error('Token generation failed:', error);
    throw new Error('Token generation failed');
  }
};

// JWT Token Verify
const verifyToken = (token) => {
  try {
// eslint-disable-next-line no-unused-vars
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    logger.error('Token verification failed:', error);
    return null;
  }
};

// 隨機字符串生成
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// 安全隨機數生成
const generateSecureRandom = (min = 100000, max = 999999) => {
  const range = max - min + 1;
  const bytes = crypto.randomBytes(4);
  const value = bytes.readUInt32BE(0);
  return min + (value % range);
};

// DataEncrypt
const encryptData = (data, key = process.env.ENCRYPTION_KEY) => {
  try {
    if (!key) {
      throw new Error('ENCRYPTION_KEY not configured');
    }

    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted,
      iv: iv.toString('hex'),
    };
  } catch (error) {
    logger.error('Data encryption failed:', error);
    throw new Error('Data encryption failed');
  }
};

// DataDecrypt
const decryptData = (encryptedData, iv, key = process.env.ENCRYPTION_KEY) => {
  try {
    if (!key) {
      throw new Error('ENCRYPTION_KEY not configured');
    }

    const algorithm = 'aes-256-cbc';
    const decipher = crypto.createDecipher(algorithm, key);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    logger.error('Data decryption failed:', error);
    throw new Error('Data decryption failed');
  }
};

// Input清理
const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    .replace(/[<>]/g, '') // Remove < 和 >
    .replace(/javascript:/gi, '') // Remove javascript: Protocol
    .replace(/on\w+=/gi, '') // RemoveEventHandle器
    .trim();
};

// 電子郵件Verify
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password強度Check
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

// eslint-disable-next-line no-unused-vars
  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 安全LogRecord
// eslint-disable-next-line no-unused-vars
const logSecurityEvent = (event, details) => {
  logger.warn('Security Event', {
    event,
    details,
    timestamp: new Date().toISOString(),
    ip: details.ip || 'unknown',
  });
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  generateRandomString,
  generateSecureRandom,
  encryptData,
  decryptData,
  sanitizeInput,
  validateEmail,
  validatePassword,
  logSecurityEvent,
};

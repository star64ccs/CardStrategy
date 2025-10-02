const xss = require('xss');
const validator = require('validator');

class XSSProtection {
  constructor() {
    // XSS過濾器配置
    this.xssOptions = {
      whiteList: {
        p: ['class'],
        a: ['href', 'title', 'target'],
        img: ['src', 'alt', 'width', 'height'],
        div: ['class', 'id'],
        span: ['class'],
        br: [],
        strong: [],
        em: [],
        ul: [],
        ol: [],
        li: [],
        h1: [],
        h2: [],
        h3: [],
        h4: [],
        h5: [],
        h6: []
      },
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style']
    };
  }

  // 清理HTML內容
  sanitizeHTML(input) {
    if (typeof input !== 'string') {
      return input;
    }
    return xss(input, this.xssOptions);
  }

  // 清理純文本
  sanitizeText(input) {
    if (typeof input !== 'string') {
      return input;
    }
    return validator.escape(input.trim());
  }

  // 清理URL
  sanitizeURL(url) {
    if (!url || typeof url !== 'string') {
      return null;
    }
    
    // 檢查URL格式
    if (!validator.isURL(url, { protocols: ['http', 'https'] })) {
      return null;
    }
    
    return validator.escape(url);
  }

  // 清理JSON數據
  sanitizeJSON(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeJSON(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeText(value);
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeJSON(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  // 驗證和清理用戶輸入
  validateAndSanitize(input, type = 'text') {
    switch (type) {
      case 'html':
        return this.sanitizeHTML(input);
      case 'url':
        return this.sanitizeURL(input);
      case 'email':
        return validator.isEmail(input) ? validator.normalizeEmail(input) : null;
      case 'number':
        return validator.isNumeric(input) ? parseFloat(input) : null;
      case 'json':
        return this.sanitizeJSON(input);
      default:
        return this.sanitizeText(input);
    }
  }

  // 檢查是否包含XSS攻擊
  detectXSS(input) {
    if (typeof input !== 'string') {
      return false;
    }

    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>/gi,
      /<link[^>]*>/gi,
      /<meta[^>]*>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload=/gi,
      /onerror=/gi,
      /onclick=/gi,
      /onmouseover=/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }
}

module.exports = new XSSProtection();
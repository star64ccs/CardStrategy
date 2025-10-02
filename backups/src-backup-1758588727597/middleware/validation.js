const validator = require('validator');
const { body, validationResult } = require('express-validator');

// 輸入清理函數
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return validator.escape(input.trim());
  }
  return input;
};

// 通用驗證規則
const validationRules = {
  // 用戶名驗證
  username: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('用戶名長度必須在3-30字符之間')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('用戶名只能包含字母、數字和下劃線')
      .customSanitizer(sanitizeInput)
  ],

  // 密碼驗證
  password: [
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('密碼長度必須在8-128字符之間')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('密碼必須包含大小寫字母、數字和特殊字符')
  ],

  // 郵箱驗證
  email: [
    body('email')
      .isEmail()
      .withMessage('請輸入有效的郵箱地址')
      .normalizeEmail()
      .customSanitizer(sanitizeInput)
  ],

  // 卡片ID驗證
  cardId: [
    body('card_id')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('卡片ID長度必須在1-50字符之間')
      .matches(/^[a-zA-Z0-9-_]+$/)
      .withMessage('卡片ID只能包含字母、數字、連字符和下劃線')
      .customSanitizer(sanitizeInput)
  ],

  // 價格驗證
  price: [
    body('price')
      .isFloat({ min: 0, max: 1000000 })
      .withMessage('價格必須是0-1000000之間的數字')
      .customSanitizer(val => parseFloat(val))
  ]
};

// 驗證錯誤處理中間件
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: '輸入驗證失敗',
      details: errors.array()
    });
  }
  next();
};

module.exports = {
  sanitizeInput,
  validationRules,
  handleValidationErrors
};
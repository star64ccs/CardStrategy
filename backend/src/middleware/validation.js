const { validationResult } = require('express-validator');

/**
 * Verify中間件
 * CheckRequestDataYesNo符合Verify規則
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'VerifyFailed',
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }

  next();
};

/**
 * GenericRequestVerify中間件
 * @param {Object} schema - Verify模式
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Verify body
      if (schema.body) {
        for (const [field, rules] of Object.entries(schema.body)) {
          const value = req.body[field];

          // Check必填Field
          if (
            rules.required &&
            (value === undefined || value === null || value === '')
          ) {
            return res.status(400).json({
              success: false,
              message: `${field} 是必填字段`,
              field,
            });
          }

          // 如果Field不Yes必填且為Empty，Skip其他Verify
          if (
            !rules.required &&
            (value === undefined || value === null || value === '')
          ) {
            continue;
          }

          // Class型Verify
          if (rules.type) {
            const actualType = Array.isArray(value) ? 'array' : typeof value;
            if (actualType !== rules.type) {
              return res.status(400).json({
                success: false,
                message: `${field} 必須是 ${rules.type} 類型`,
                field,
              });
            }
          }

          // 枚舉Verify
          if (rules.enum && !rules.enum.includes(value)) {
            return res.status(400).json({
              success: false,
              message: `${field} 必須是以下值之一: ${rules.enum.join(', ')}`,
              field,
            });
          }

          // 長度Verify
          if (rules.minLength && value.length < rules.minLength) {
            return res.status(400).json({
              success: false,
              message: `${field} 長度不能少於 ${rules.minLength} 個字符`,
              field,
            });
          }

          if (rules.maxLength && value.length > rules.maxLength) {
            return res.status(400).json({
              success: false,
              message: `${field} 長度不能超過 ${rules.maxLength} 個字符`,
              field,
            });
          }

          // 數Value範圍Verify
          if (rules.min !== undefined && value < rules.min) {
            return res.status(400).json({
              success: false,
              message: `${field} 不能小於 ${rules.min}`,
              field,
            });
          }

          if (rules.max !== undefined && value > rules.max) {
            return res.status(400).json({
              success: false,
              message: `${field} 不能大於 ${rules.max}`,
              field,
            });
          }
        }
      }

      // Verify query
      if (schema.query) {
        for (const [field, rules] of Object.entries(schema.query)) {
          const value = req.query[field];

          if (
            rules.required &&
            (value === undefined || value === null || value === '')
          ) {
            return res.status(400).json({
              success: false,
              message: `${field} 是必填查詢參數`,
              field,
            });
          }
        }
      }

      // Verify params
      if (schema.params) {
        for (const [field, rules] of Object.entries(schema.params)) {
          const value = req.params[field];

          if (
            rules.required &&
            (value === undefined || value === null || value === '')
          ) {
            return res.status(400).json({
              success: false,
              message: `${field} 是必填路徑參數`,
              field,
            });
          }
        }
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Verify過程中發生Error',
        error: error.message,
      });
    }
  };
};

/**
 * CustomVerify規則
 */
const customValidators = {
  // CheckYesNo為有效的 ObjectId
  isValidObjectId: (value) => {
    return /^[0-9a-fA-F]{24}$/.test(value);
  },

  // CheckYesNo為有效的 UUID
  isValidUUID: (value) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    );
  },

  // CheckYesNo為有效的Email
  isValidEmail: (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

  // CheckYesNo為有效的Phone號碼
  isValidPhone: (value) => {
    return /^\+?[\d\s\-\(\)]{10,}$/.test(value);
  },

  // CheckYesNo為有效的 URL
  isValidURL: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  // CheckYesNo為有效的Day
  isValidDate: (value) => {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date);
  },

  // CheckYesNo為有效的 JSON
  isValidJSON: (value) => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * GenericVerify規則
 */
const commonValidations = {
  // User相OffVerify
  user: {
    email: {
      notEmpty: { errorMessage: '郵箱不能為空' },
      isEmail: { errorMessage: '請輸入有效的郵箱地址' },
    },
    password: {
      isLength: {
        options: { min: 6, max: 128 },
        errorMessage: '密碼長度必須在 6-128 個字符之間',
      },
    },
    username: {
      isLength: {
        options: { min: 2, max: 50 },
        errorMessage: '用戶名長度必須在 2-50 個字符之間',
      },
      matches: {
        options: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
        errorMessage: '用戶名只能包含字母、數字、下劃線和中文字符',
      },
    },
  },

  // 卡片相OffVerify
  card: {
    name: {
      notEmpty: { errorMessage: '卡片名稱不能為空' },
      isLength: {
        options: { min: 1, max: 200 },
        errorMessage: '卡片名稱長度必須在 1-200 個字符之間',
      },
    },
    price: {
      isFloat: {
        options: { min: 0 },
        errorMessage: '價格必須為正數',
      },
    },
    condition: {
      isIn: {
        options: [
          [
            'mint',
            'near-mint',
            'excellent',
            'good',
            'light-played',
            'played',
            'poor',
          ],
        ],
        errorMessage: '卡片狀況必須是有效的選項',
      },
    },
  },

  // Set相OffVerify
  collection: {
    name: {
      notEmpty: { errorMessage: '集合名稱不能為空' },
      isLength: {
        options: { min: 1, max: 100 },
        errorMessage: '集合名稱長度必須在 1-100 個字符之間',
      },
    },
    description: {
      optional: true,
      isLength: {
        options: { max: 1000 },
        errorMessage: '描述長度不能超過 1000 個字符',
      },
    },
  },

  // 投資相OffVerify
  investment: {
    amount: {
      isFloat: {
        options: { min: 0.01 },
        errorMessage: '投資金額必須大於 0',
      },
    },
    type: {
      isIn: {
        options: [['buy', 'sell', 'hold']],
        errorMessage: '投資類型必須是 buy、sell 或 hold',
      },
    },
  },
};

module.exports = {
  validate,
  validateRequest,
  customValidators,
  commonValidations,
};

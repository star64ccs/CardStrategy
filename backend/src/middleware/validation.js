const { validationResult } = require('express-validator');

/**
 * 驗證中間件
 * 檢查請求數據是否符合驗證規則
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '驗證失敗',
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
 * 通用請求驗證中間件
 * @param {Object} schema - 驗證模式
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // 驗證 body
      if (schema.body) {
        for (const [field, rules] of Object.entries(schema.body)) {
          const value = req.body[field];

          // 檢查必填字段
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

          // 如果字段不是必填且為空，跳過其他驗證
          if (
            !rules.required &&
            (value === undefined || value === null || value === '')
          ) {
            continue;
          }

          // 類型驗證
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

          // 枚舉驗證
          if (rules.enum && !rules.enum.includes(value)) {
            return res.status(400).json({
              success: false,
              message: `${field} 必須是以下值之一: ${rules.enum.join(', ')}`,
              field,
            });
          }

          // 長度驗證
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

          // 數值範圍驗證
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

      // 驗證 query
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

      // 驗證 params
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
        message: '驗證過程中發生錯誤',
        error: error.message,
      });
    }
  };
};

/**
 * 自定義驗證規則
 */
const customValidators = {
  // 檢查是否為有效的 ObjectId
  isValidObjectId: (value) => {
    return /^[0-9a-fA-F]{24}$/.test(value);
  },

  // 檢查是否為有效的 UUID
  isValidUUID: (value) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    );
  },

  // 檢查是否為有效的郵箱
  isValidEmail: (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

  // 檢查是否為有效的電話號碼
  isValidPhone: (value) => {
    return /^\+?[\d\s\-\(\)]{10,}$/.test(value);
  },

  // 檢查是否為有效的 URL
  isValidURL: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  // 檢查是否為有效的日期
  isValidDate: (value) => {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date);
  },

  // 檢查是否為有效的 JSON
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
 * 通用驗證規則
 */
const commonValidations = {
  // 用戶相關驗證
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

  // 卡片相關驗證
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

  // 集合相關驗證
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

  // 投資相關驗證
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

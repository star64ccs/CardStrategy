const logger = require('../utils/logger');

/**
 * 異步錯誤處理包裝器
 * @param {Function} fn 異步函數
 * @returns {Function} 包裝後的函數
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 創建統一路由處理器
 * @param {Function} handler 業務邏輯處理函數
 * @param {Object} options 配置選項
 * @returns {Function} 路由處理器
 */
const createRouteHandler = (handler, options = {}) => {
  const {
    auth = true,
    validation = null,
    permissions = [],
    logOperation = true,
    logRequest = false,
    logResponse = false,
    timeout = 30000
  } = options;

  return asyncHandler(async (req, res, next) => {
    const startTime = Date.now();
    const operation = `${req.method} ${req.path}`;

    try {
      // 記錄請求信息
      if (logRequest) {
        logger.info(`📥 ${operation} 請求開始`, {
          userId: req.user?.id,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          body: sanitizeRequestBody(req.body),
          query: req.query,
          params: req.params
        });
      }

      // 權限檢查
      if (auth && (!req.user || (permissions.length > 0 && !permissions.includes(req.user.role)))) {
        const error = new Error('權限不足');
        error.status = 403;
        error.code = 'INSUFFICIENT_PERMISSIONS';
        throw error;
      }

      // 驗證
      if (validation) {
        const errors = validation(req);
        if (!errors.isEmpty()) {
          const error = new Error('驗證失敗');
          error.status = 400;
          error.code = 'VALIDATION_ERROR';
          error.details = errors.array();
          throw error;
        }
      }

      // 記錄操作
      if (logOperation) {
        logger.info(`🔄 ${operation} 開始執行`, {
          userId: req.user?.id,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
      }

      // 設置超時
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('請求超時'));
        }, timeout);
      });

      // 執行處理器
      const result = await Promise.race([
        handler(req, res, next),
        timeoutPromise
      ]);

      // 記錄響應信息
      if (logResponse) {
        const duration = Date.now() - startTime;
        logger.info(`📤 ${operation} 響應完成`, {
          duration: `${duration}ms`,
          status: res.statusCode,
          result: sanitizeResponseBody(result)
        });
      }

      // 標準化響應
      if (result !== undefined) {
        const duration = Date.now() - startTime;

        // 記錄成功日誌
        logger.info(`✅ ${operation} 成功`, {
          duration: `${duration}ms`,
          status: res.statusCode || 200
        });

        res.json({
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;

      // 記錄錯誤日誌
      logger.error(`❌ ${operation} 失敗`, {
        error: error.message,
        status: error.status || 500,
        code: error.code,
        duration: `${duration}ms`,
        stack: error.stack,
        userId: req.user?.id,
        ip: req.ip
      });

      // 設置錯誤狀態碼
      const statusCode = error.status || 500;
      res.status(statusCode);

      // 構建錯誤響應
      const errorResponse = {
        success: false,
        error: {
          message: error.message || '內部服務器錯誤',
          code: error.code || 'INTERNAL_ERROR',
          status: statusCode
        },
        timestamp: new Date().toISOString()
      };

      // 添加詳細錯誤信息（僅在開發環境）
      if (process.env.NODE_ENV === 'development') {
        errorResponse.error.details = error.details;
        errorResponse.error.stack = error.stack;
      }

      res.json(errorResponse);
    }
  });
};

/**
 * 創建 GET 路由處理器
 * @param {Function} handler 業務邏輯處理函數
 * @param {Object} options 配置選項
 * @returns {Function} GET 路由處理器
 */
const createGetHandler = (handler, options = {}) => {
  return createRouteHandler(handler, {
    ...options,
    logRequest: true,
    logResponse: true
  });
};

/**
 * 創建 POST 路由處理器
 * @param {Function} handler 業務邏輯處理函數
 * @param {Object} options 配置選項
 * @returns {Function} POST 路由處理器
 */
const createPostHandler = (handler, options = {}) => {
  return createRouteHandler(handler, {
    ...options,
    logRequest: true,
    logResponse: true
  });
};

/**
 * 創建 PUT 路由處理器
 * @param {Function} handler 業務邏輯處理函數
 * @param {Object} options 配置選項
 * @returns {Function} PUT 路由處理器
 */
const createPutHandler = (handler, options = {}) => {
  return createRouteHandler(handler, {
    ...options,
    logRequest: true,
    logResponse: true
  });
};

/**
 * 創建 DELETE 路由處理器
 * @param {Function} handler 業務邏輯處理函數
 * @param {Object} options 配置選項
 * @returns {Function} DELETE 路由處理器
 */
const createDeleteHandler = (handler, options = {}) => {
  return createRouteHandler(handler, {
    ...options,
    logRequest: true,
    logResponse: true
  });
};

/**
 * 創建批量操作處理器
 * @param {Function} handler 業務邏輯處理函數
 * @param {Object} options 配置選項
 * @returns {Function} 批量操作處理器
 */
const createBatchHandler = (handler, options = {}) => {
  return createRouteHandler(async (req, res, next) => {
    const { items, ...otherParams } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('批量操作需要非空的項目數組');
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const result = await handler(items[i], { ...otherParams, index: i }, req, res);
        results.push({ index: i, success: true, data: result });
      } catch (error) {
        errors.push({
          index: i,
          success: false,
          error: error.message,
          code: error.code
        });
      }
    }

    return {
      total: items.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    };
  }, options);
};

/**
 * 創建分頁查詢處理器
 * @param {Function} handler 業務邏輯處理函數
 * @param {Object} options 配置選項
 * @returns {Function} 分頁查詢處理器
 */
const createPaginatedHandler = (handler, options = {}) => {
  return createRouteHandler(async (req, res, next) => {
    const { page = 1, limit = 20, sortBy, sortOrder = 'desc', ...filters } = req.query;

    const pagination = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100), // 限制最大每頁數量
      sortBy,
      sortOrder
    };

    const result = await handler(filters, pagination, req, res);

    return {
      data: result.data || result,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: result.total || 0,
        totalPages: Math.ceil((result.total || 0) / pagination.limit),
        hasNext: pagination.page < Math.ceil((result.total || 0) / pagination.limit),
        hasPrev: pagination.page > 1
      }
    };
  }, options);
};

/**
 * 創建搜索處理器
 * @param {Function} handler 業務邏輯處理函數
 * @param {Object} options 配置選項
 * @returns {Function} 搜索處理器
 */
const createSearchHandler = (handler, options = {}) => {
  return createRouteHandler(async (req, res, next) => {
    const { query, filters, category, tags, ...otherParams } = req.query;

    const searchParams = {
      query: query?.trim(),
      filters: filters ? JSON.parse(filters) : {},
      category,
      tags: tags ? tags.split(',') : [],
      ...otherParams
    };

    return await handler(searchParams, req, res);
  }, options);
};

/**
 * 創建文件上傳處理器
 * @param {Function} handler 業務邏輯處理函數
 * @param {Object} options 配置選項
 * @returns {Function} 文件上傳處理器
 */
const createFileUploadHandler = (handler, options = {}) => {
  return createRouteHandler(async (req, res, next) => {
    if (!req.file && !req.files) {
      throw new Error('沒有上傳文件');
    }

    const files = req.files || [req.file];

    // 驗證文件
    for (const file of files) {
      if (!file.mimetype.startsWith('image/')) {
        throw new Error('只支持圖片文件上傳');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error('文件大小不能超過10MB');
      }
    }

    return await handler(files, req.body, req, res);
  }, {
    ...options,
    logRequest: true,
    logResponse: true
  });
};

/**
 * 清理請求體中的敏感信息
 * @param {Object} body 請求體
 * @returns {Object} 清理後的請求體
 */
const sanitizeRequestBody = (body) => {
  if (!body) return body;

  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  const sanitized = { ...body };

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
};

/**
 * 清理響應體中的敏感信息
 * @param {Object} response 響應體
 * @returns {Object} 清理後的響應體
 */
const sanitizeResponseBody = (response) => {
  if (!response) return response;

  // 只返回基本信息，避免日誌過大
  if (Array.isArray(response)) {
    return `Array(${response.length})`;
  }

  if (typeof response === 'object') {
    const keys = Object.keys(response);
    return `Object(${keys.length} keys: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''})`;
  }

  return response;
};

/**
 * 創建自定義錯誤
 * @param {string} message 錯誤消息
 * @param {number} status 狀態碼
 * @param {string} code 錯誤代碼
 * @returns {Error} 自定義錯誤
 */
const createCustomError = (message, status = 500, code = 'CUSTOM_ERROR') => {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
};

/**
 * 創建驗證錯誤
 * @param {string} message 錯誤消息
 * @param {Array} details 詳細錯誤信息
 * @returns {Error} 驗證錯誤
 */
const createValidationError = (message, details = []) => {
  const error = new Error(message);
  error.status = 400;
  error.code = 'VALIDATION_ERROR';
  error.details = details;
  return error;
};

/**
 * 創建認證錯誤
 * @param {string} message 錯誤消息
 * @returns {Error} 認證錯誤
 */
const createAuthError = (message = '認證失敗') => {
  const error = new Error(message);
  error.status = 401;
  error.code = 'AUTHENTICATION_ERROR';
  return error;
};

/**
 * 創建權限錯誤
 * @param {string} message 錯誤消息
 * @returns {Error} 權限錯誤
 */
const createPermissionError = (message = '權限不足') => {
  const error = new Error(message);
  error.status = 403;
  error.code = 'PERMISSION_ERROR';
  return error;
};

/**
 * 創建資源不存在錯誤
 * @param {string} message 錯誤消息
 * @returns {Error} 資源不存在錯誤
 */
const createNotFoundError = (message = '資源不存在') => {
  const error = new Error(message);
  error.status = 404;
  error.code = 'NOT_FOUND_ERROR';
  return error;
};

/**
 * 創建數據庫錯誤
 * @param {string} message 錯誤消息
 * @returns {Error} 數據庫錯誤
 */
const createDatabaseError = (message = '數據庫操作失敗') => {
  const error = new Error(message);
  error.status = 500;
  error.code = 'DATABASE_ERROR';
  return error;
};

/**
 * 創建網絡錯誤
 * @param {string} message 錯誤消息
 * @returns {Error} 網絡錯誤
 */
const createNetworkError = (message = '網絡連接失敗') => {
  const error = new Error(message);
  error.status = 500;
  error.code = 'NETWORK_ERROR';
  return error;
};

module.exports = {
  asyncHandler,
  createRouteHandler,
  createGetHandler,
  createPostHandler,
  createPutHandler,
  createDeleteHandler,
  createBatchHandler,
  createPaginatedHandler,
  createSearchHandler,
  createFileUploadHandler,
  createCustomError,
  createValidationError,
  createAuthError,
  createPermissionError,
  createNotFoundError,
  createDatabaseError,
  createNetworkError
};

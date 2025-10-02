const logger = require('../utils/logger');

/**
 * AsyncErrorHandlePackage裝器
 * @param {Function} fn AsyncFunction
 * @returns {Function} Package裝後的Function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create統一路由Handle器
 * @param {Function} handler 業務邏輯HandleFunction
 * @param {Object} options ConfigureOptions
 * @returns {Function} 路由Handle器
 */
const createRouteHandler = (handler, options = {}) => {
  const {
    auth = true,
    validation = null,
    permissions = [],
    logOperation = true,
    logRequest = false,
    logResponse = false,
    timeout = 30000,
  } = options;

  return asyncHandler(async (req, res, next) => {
    const startTime = Date.now();
    const operation = `${req.method} ${req.path}`;

    try {
      // RecordRequestInformation
      if (logRequest) {
        logger.info(`📥 ${operation} 請求開始`, {
          userId: req.user?.id,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          body: sanitizeRequestBody(req.body),
          query: req.query,
          params: req.params,
        });
      }

      // 權限Check
      if (
        auth &&
        (!req.user ||
          (permissions.length > 0 && !permissions.includes(req.user.role)))
      ) {
        const error = new Error('權限不足');
        error.status = 403;
        error.code = 'INSUFFICIENT_PERMISSIONS';
        throw error;
      }

      // Verify
      if (validation) {
        const errors = validation(req);
        if (!errors.isEmpty()) {
          const error = new Error('VerifyFailed');
          error.status = 400;
          error.code = 'VALIDATION_ERROR';
          error.details = errors.array();
          throw error;
        }
      }

      // RecordOperation
      if (logOperation) {
        logger.info(`🔄 ${operation} 開始執行`, {
          userId: req.user?.id,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        });
      }

      // Settings超時
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('請求超時'));
        }, timeout);
      });

      // 執RowHandle器
      const result = await Promise.race([
        handler(req, res, next),
        timeoutPromise,
      ]);

      // RecordResponseInformation
      if (logResponse) {
        const duration = Date.now() - startTime;
        logger.info(`📤 ${operation} 響應完成`, {
          duration: `${duration}ms`,
          status: res.statusCode,
          result: sanitizeResponseBody(result),
        });
      }

      // Standard化Response
      if (result !== undefined) {
        const duration = Date.now() - startTime;

        // RecordSuccessLog
        logger.info(`✅ ${operation} Success`, {
          duration: `${duration}ms`,
          status: res.statusCode || 200,
        });

        res.json({
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;

      // RecordErrorLog
      logger.error(`❌ ${operation} Failed`, {
        error: error.message,
        status: error.status || 500,
        code: error.code,
        duration: `${duration}ms`,
        stack: error.stack,
        userId: req.user?.id,
        ip: req.ip,
      });

      // SettingsErrorStatus碼
      const statusCode = error.status || 500;
      res.status(statusCode);

      // BuildErrorResponse
      const errorResponse = {
        success: false,
        error: {
          message: error.message || '內部ServerError',
          code: error.code || 'INTERNAL_ERROR',
          status: statusCode,
        },
        timestamp: new Date().toISOString(),
      };

      // Add詳細ErrorInformation（僅在On發環境）
      if (process.env.NODE_ENV === 'development') {
        errorResponse.error.details = error.details;
        errorResponse.error.stack = error.stack;
      }

      res.json(errorResponse);
    }
  });
};

/**
 * Create GET 路由Handle器
 * @param {Function} handler 業務邏輯HandleFunction
 * @param {Object} options ConfigureOptions
 * @returns {Function} GET 路由Handle器
 */
const createGetHandler = (handler, options = {}) => {
  return createRouteHandler(handler, {
    ...options,
    logRequest: true,
    logResponse: true,
  });
};

/**
 * Create POST 路由Handle器
 * @param {Function} handler 業務邏輯HandleFunction
 * @param {Object} options ConfigureOptions
 * @returns {Function} POST 路由Handle器
 */
const createPostHandler = (handler, options = {}) => {
  return createRouteHandler(handler, {
    ...options,
    logRequest: true,
    logResponse: true,
  });
};

/**
 * Create PUT 路由Handle器
 * @param {Function} handler 業務邏輯HandleFunction
 * @param {Object} options ConfigureOptions
 * @returns {Function} PUT 路由Handle器
 */
const createPutHandler = (handler, options = {}) => {
  return createRouteHandler(handler, {
    ...options,
    logRequest: true,
    logResponse: true,
  });
};

/**
 * Create DELETE 路由Handle器
 * @param {Function} handler 業務邏輯HandleFunction
 * @param {Object} options ConfigureOptions
 * @returns {Function} DELETE 路由Handle器
 */
const createDeleteHandler = (handler, options = {}) => {
  return createRouteHandler(handler, {
    ...options,
    logRequest: true,
    logResponse: true,
  });
};

/**
 * CreateBatchOperationHandle器
 * @param {Function} handler 業務邏輯HandleFunction
 * @param {Object} options ConfigureOptions
 * @returns {Function} BatchOperationHandle器
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
        const result = await handler(
          items[i],
          { ...otherParams, index: i },
          req,
          res
        );
        results.push({ index: i, success: true, data: result });
      } catch (error) {
        errors.push({
          index: i,
          success: false,
          error: error.message,
          code: error.code,
        });
      }
    }

    return {
      total: items.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    };
  }, options);
};

/**
 * CreatePaginateQueryHandle器
 * @param {Function} handler 業務邏輯HandleFunction
 * @param {Object} options ConfigureOptions
 * @returns {Function} PaginateQueryHandle器
 */
const createPaginatedHandler = (handler, options = {}) => {
  return createRouteHandler(async (req, res, next) => {
    const {
      page = 1,
      limit = 20,
      sortBy,
      sortOrder = 'desc',
      ...filters
    } = req.query;

    const pagination = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100), // Limit最大每頁數量
      sortBy,
      sortOrder,
    };

    const result = await handler(filters, pagination, req, res);

    return {
      data: result.data || result,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: result.total || 0,
        totalPages: Math.ceil((result.total || 0) / pagination.limit),
        hasNext:
          pagination.page < Math.ceil((result.total || 0) / pagination.limit),
        hasPrev: pagination.page > 1,
      },
    };
  }, options);
};

/**
 * CreateSearchHandle器
 * @param {Function} handler 業務邏輯HandleFunction
 * @param {Object} options ConfigureOptions
 * @returns {Function} SearchHandle器
 */
const createSearchHandler = (handler, options = {}) => {
  return createRouteHandler(async (req, res, next) => {
    const { query, filters, category, tags, ...otherParams } = req.query;

    const searchParams = {
      query: query?.trim(),
      filters: filters ? JSON.parse(filters) : {},
      category,
      tags: tags ? tags.split(',') : [],
      ...otherParams,
    };

    return await handler(searchParams, req, res);
  }, options);
};

/**
 * CreateFileUploadHandle器
 * @param {Function} handler 業務邏輯HandleFunction
 * @param {Object} options ConfigureOptions
 * @returns {Function} FileUploadHandle器
 */
const createFileUploadHandler = (handler, options = {}) => {
  return createRouteHandler(
    async (req, res, next) => {
      if (!req.file && !req.files) {
        throw new Error('沒有上傳文件');
      }

      const files = req.files || [req.file];

      // VerifyFile
      for (const file of files) {
        if (!file.mimetype.startsWith('image/')) {
          throw new Error('只支持圖片文件上傳');
        }

        if (file.size > 10 * 1024 * 1024) {
          // 10MB
          throw new Error('文件大小不能超過10MB');
        }
      }

      return await handler(files, req.body, req, res);
    },
    {
      ...options,
      logRequest: true,
      logResponse: true,
    }
  );
};

/**
 * 清理Request體中的敏感Information
 * @param {Object} body Request體
 * @returns {Object} 清理後的Request體
 */
const sanitizeRequestBody = (body) => {
  if (!body) return body;

  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
  ];
  const sanitized = { ...body };

  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
};

/**
 * 清理Response體中的敏感Information
 * @param {Object} response Response體
 * @returns {Object} 清理後的Response體
 */
const sanitizeResponseBody = (response) => {
  if (!response) return response;

  // 只Return基本Information，避免Log過大
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
 * CreateCustomError
 * @param {string} message ErrorMessage
 * @param {number} status Status碼
 * @param {string} code Error代碼
 * @returns {Error} CustomError
 */
const createCustomError = (message, status = 500, code = 'CUSTOM_ERROR') => {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
};

/**
 * CreateVerifyError
 * @param {string} message ErrorMessage
 * @param {Array} details 詳細ErrorInformation
 * @returns {Error} VerifyError
 */
const createValidationError = (message, details = []) => {
  const error = new Error(message);
  error.status = 400;
  error.code = 'VALIDATION_ERROR';
  error.details = details;
  return error;
};

/**
 * CreateAuthenticateError
 * @param {string} message ErrorMessage
 * @returns {Error} AuthenticateError
 */
const createAuthError = (message = '認證Failed') => {
  const error = new Error(message);
  error.status = 401;
  error.code = 'AUTHENTICATION_ERROR';
  return error;
};

/**
 * Create權限Error
 * @param {string} message ErrorMessage
 * @returns {Error} 權限Error
 */
const createPermissionError = (message = '權限不足') => {
  const error = new Error(message);
  error.status = 403;
  error.code = 'PERMISSION_ERROR';
  return error;
};

/**
 * CreateResource不存在Error
 * @param {string} message ErrorMessage
 * @returns {Error} Resource不存在Error
 */
const createNotFoundError = (message = '資源不存在') => {
  const error = new Error(message);
  error.status = 404;
  error.code = 'NOT_FOUND_ERROR';
  return error;
};

/**
 * CreateDatabaseError
 * @param {string} message ErrorMessage
 * @returns {Error} DatabaseError
 */
const createDatabaseError = (message = '數據庫操作Failed') => {
  const error = new Error(message);
  error.status = 500;
  error.code = 'DATABASE_ERROR';
  return error;
};

/**
 * CreateNetworkError
 * @param {string} message ErrorMessage
 * @returns {Error} NetworkError
 */
const createNetworkError = (message = '網絡ConnectFailed') => {
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
  createNetworkError,
};

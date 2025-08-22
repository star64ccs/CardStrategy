const { logger } = require('./unified-logger');

// 成功響應
const successResponse = (
  res,
  data = null,
  message = 'Success',
  statusCode = 200
) => {
// eslint-disable-next-line no-unused-vars
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

// 錯誤響應
// eslint-disable-next-line no-unused-vars
const errorResponse = (
  res,
  message = 'Error occurred',
  statusCode = 500,
  errors = null
) => {
// eslint-disable-next-line no-unused-vars
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  // 記錄錯誤響應
  logger.warn('Error Response', {
    message,
    statusCode,
    errors,
    timestamp: new Date().toISOString(),
  });

  return res.status(statusCode).json(response);
};

// 驗證錯誤響應
const validationErrorResponse = (res, errors) => {
  return errorResponse(res, 'Validation failed', 400, errors);
};

// 認證錯誤響應
// eslint-disable-next-line no-unused-vars
const authenticationErrorResponse = (
  res,
  message = 'Authentication failed'
) => {
  return errorResponse(res, message, 401);
};

// 授權錯誤響應
// eslint-disable-next-line no-unused-vars
const authorizationErrorResponse = (
  res,
  message = 'Insufficient permissions'
) => {
  return errorResponse(res, message, 403);
};

// 未找到錯誤響應
// eslint-disable-next-line no-unused-vars
const notFoundErrorResponse = (res, resource = 'Resource') => {
  return errorResponse(res, `${resource} not found`, 404);
};

// 衝突錯誤響應
const conflictErrorResponse = (res, message = 'Resource conflict') => {
  return errorResponse(res, message, 409);
};

// 服務器錯誤響應
const serverErrorResponse = (res, message = 'Internal server error') => {
  return errorResponse(res, message, 500);
};

// 分頁響應
const paginatedResponse = (res, data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return successResponse(res, {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  });
};

// 文件上傳響應
const fileUploadResponse = (res, fileInfo) => {
  return successResponse(
    res,
    {
      filename: fileInfo.filename,
      originalName: fileInfo.originalname,
      size: fileInfo.size,
      mimetype: fileInfo.mimetype,
      url: fileInfo.url || null,
    },
    'File uploaded successfully'
  );
};

// 批量操作響應
const batchOperationResponse = (res, results) => {
// eslint-disable-next-line no-unused-vars
  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.length - successCount;

  return successResponse(
    res,
    {
      total: results.length,
      success: successCount,
      failed: failureCount,
      results,
    },
    `Batch operation completed. ${successCount} succeeded, ${failureCount} failed`
  );
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  authenticationErrorResponse,
  authorizationErrorResponse,
  notFoundErrorResponse,
  conflictErrorResponse,
  serverErrorResponse,
  paginatedResponse,
  fileUploadResponse,
  batchOperationResponse,
};

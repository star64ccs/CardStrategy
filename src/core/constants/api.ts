// API 相OffConstant
export const _API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:3000';
export const _API_VERSION = 'v1';
export const _API_TIMEOUT = 30000; // 30Second
export const _API_RETRY_ATTEMPTS = 3;
export const _API_RETRY_DELAY = 1000; // 1Second

// API 端點
export const _API_ENDPOINTS = {
  // Authenticate相Off
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // User相Off
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    PREFERENCES: '/user/preferences',
    STATISTICS: '/user/statistics',
    NOTIFICATIONS: '/user/notifications',
  },

  // 卡片相Off
  CARDS: {
    LIST: '/cards',
    DETAIL: '/cards/:id',
    SEARCH: '/cards/search',
    RECOGNIZE: '/cards/recognize',
    ANALYZE: '/cards/analyze',
    PREDICT: '/cards/predict',
  },

  // 收藏相Off
  COLLECTIONS: {
    LIST: '/collections',
    DETAIL: '/collections/:id',
    CREATE: '/collections',
    UPDATE: '/collections/:id',
    DELETE: '/collections/:id',
    ADD_CARD: '/collections/:id/cards',
    REMOVE_CARD: '/collections/:id/cards/:cardId',
  },

  // 投資相Off
  INVESTMENTS: {
    LIST: '/investments',
    DETAIL: '/investments/:id',
    CREATE: '/investments',
    UPDATE: '/investments/:id',
    DELETE: '/investments/:id',
    PORTFOLIO: '/investments/portfolio',
    STATISTICS: '/investments/statistics',
  },

  // 市場相Off
  MARKET: {
    DATA: '/market/data',
    TRENDS: '/market/trends',
    PRICE_HISTORY: '/market/price-history',
    ANALYSIS: '/market/analysis',
  },

  // AI 相Off
  AI: {
    CHAT: '/ai/chat',
    ANALYSIS: '/ai/analysis',
    PREDICTION: '/ai/prediction',
    RECOMMENDATION: '/ai/recommendation',
  },

  // Search相Off
  SEARCH: {
    GLOBAL: '/search',
    SUGGESTIONS: '/search/suggestions',
    HISTORY: '/search/history',
  },

  // FileUpload
  UPLOAD: {
    IMAGE: '/upload/image',
    BATCH: '/upload/batch',
  },

  // 分享Verify
  SHARE: {
    CREATE: '/share/create',
    VERIFY: '/share/verify/:code',
    LOOKUP: '/share/lookup/:code',
  },
} as const;

// HTTP Status碼
export const _HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// RequestMethod
export const _HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// ContentClass型
export const _CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  TEXT: 'text/plain',
  HTML: 'text/html',
} as const;

// Error代碼
export const _ERROR_CODES = {
  // AuthenticateError
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  AUTH_EMAIL_ALREADY_EXISTS: 'AUTH_EMAIL_ALREADY_EXISTS',
  AUTH_USERNAME_ALREADY_EXISTS: 'AUTH_USERNAME_ALREADY_EXISTS',

  // 權限Error
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // ResourceError
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',

  // VerifyError
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // ServiceError
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // FileError
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',

  // AI Error
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  AI_MODEL_UNAVAILABLE: 'AI_MODEL_UNAVAILABLE',
  AI_PROCESSING_FAILED: 'AI_PROCESSING_FAILED',

  // NetworkError
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
} as const;

// PaginateDefaultValue
export const _PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// CacheTime（毫Second）
export const _CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5Minute
  MEDIUM: 30 * 60 * 1000, // 30Minute
  LONG: 2 * 60 * 60 * 1000, // 2Hour
  VERY_LONG: 24 * 60 * 60 * 1000, // 24Hour
} as const;

// RetryConfigure
export const _RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1Second
  RETRY_BACKOFF_MULTIPLIER: 2,
} as const;

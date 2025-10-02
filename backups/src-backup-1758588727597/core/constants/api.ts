// API 相關常量
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:3000';
export const API_VERSION = 'v1';
export const API_TIMEOUT = 30000; // 30秒
export const API_RETRY_ATTEMPTS = 3;
export const API_RETRY_DELAY = 1000; // 1秒

// API 端點
export const API_ENDPOINTS = {
  // 認證相關
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // 用戶相關
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    PREFERENCES: '/user/preferences',
    STATISTICS: '/user/statistics',
    NOTIFICATIONS: '/user/notifications',
  },

  // 卡片相關
  CARDS: {
    LIST: '/cards',
    DETAIL: '/cards/:id',
    SEARCH: '/cards/search',
    RECOGNIZE: '/cards/recognize',
    ANALYZE: '/cards/analyze',
    PREDICT: '/cards/predict',
  },

  // 收藏相關
  COLLECTIONS: {
    LIST: '/collections',
    DETAIL: '/collections/:id',
    CREATE: '/collections',
    UPDATE: '/collections/:id',
    DELETE: '/collections/:id',
    ADD_CARD: '/collections/:id/cards',
    REMOVE_CARD: '/collections/:id/cards/:cardId',
  },

  // 投資相關
  INVESTMENTS: {
    LIST: '/investments',
    DETAIL: '/investments/:id',
    CREATE: '/investments',
    UPDATE: '/investments/:id',
    DELETE: '/investments/:id',
    PORTFOLIO: '/investments/portfolio',
    STATISTICS: '/investments/statistics',
  },

  // 市場相關
  MARKET: {
    DATA: '/market/data',
    TRENDS: '/market/trends',
    PRICE_HISTORY: '/market/price-history',
    ANALYSIS: '/market/analysis',
  },

  // AI 相關
  AI: {
    CHAT: '/ai/chat',
    ANALYSIS: '/ai/analysis',
    PREDICTION: '/ai/prediction',
    RECOMMENDATION: '/ai/recommendation',
  },

  // 搜索相關
  SEARCH: {
    GLOBAL: '/search',
    SUGGESTIONS: '/search/suggestions',
    HISTORY: '/search/history',
  },

  // 文件上傳
  UPLOAD: {
    IMAGE: '/upload/image',
    BATCH: '/upload/batch',
  },

  // 分享驗證
  SHARE: {
    CREATE: '/share/create',
    VERIFY: '/share/verify/:code',
    LOOKUP: '/share/lookup/:code',
  },
} as const;

// HTTP 狀態碼
export const HTTP_STATUS = {
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

// 請求方法
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// 內容類型
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  TEXT: 'text/plain',
  HTML: 'text/html',
} as const;

// 錯誤代碼
export const ERROR_CODES = {
  // 認證錯誤
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  AUTH_EMAIL_ALREADY_EXISTS: 'AUTH_EMAIL_ALREADY_EXISTS',
  AUTH_USERNAME_ALREADY_EXISTS: 'AUTH_USERNAME_ALREADY_EXISTS',

  // 權限錯誤
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // 資源錯誤
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',

  // 驗證錯誤
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // 服務錯誤
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // 文件錯誤
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',

  // AI 錯誤
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  AI_MODEL_UNAVAILABLE: 'AI_MODEL_UNAVAILABLE',
  AI_PROCESSING_FAILED: 'AI_PROCESSING_FAILED',

  // 網絡錯誤
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
} as const;

// 分頁默認值
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// 緩存時間（毫秒）
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5分鐘
  MEDIUM: 30 * 60 * 1000, // 30分鐘
  LONG: 2 * 60 * 60 * 1000, // 2小時
  VERY_LONG: 24 * 60 * 60 * 1000, // 24小時
} as const;

// 重試配置
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1秒
  RETRY_BACKOFF_MULTIPLIER: 2,
} as const;

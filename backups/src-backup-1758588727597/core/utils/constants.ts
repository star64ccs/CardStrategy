// API 相關常數
export const API_BASE_URL =
  (process.env as any)['API_BASE_URL'] ||
  'https://cardstrategy-api.onrender.com/api';
export const API_TIMEOUT = 30000; // 30 秒
export const API_RETRY_ATTEMPTS = 3;
export const API_RETRY_DELAY = 1000; // 1 秒

// 分頁常數
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MIN_PAGE_SIZE = 1;

// 快取常數
export const CACHE_EXPIRY = {
  SHORT: 5 * 60 * 1000, // 5 分鐘
  MEDIUM: 30 * 60 * 1000, // 30 分鐘
  LONG: 24 * 60 * 60 * 1000, // 24 小時
  VERY_LONG: 7 * 24 * 60 * 60 * 1000, // 7 天
};

// 檔案上傳常數
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
export const MAX_IMAGE_DIMENSION = 2048; // 2048px
export const IMAGE_QUALITY = 0.8; // 80%

// 驗證常數
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const EMAIL_MAX_LENGTH = 254;
export const PHONE_MAX_LENGTH = 20;

// 卡牌相關常數
export const CARD_NAME_MAX_LENGTH = 100;
export const CARD_DESCRIPTION_MAX_LENGTH = 500;
export const CARD_NUMBER_MAX_LENGTH = 20;
export const SET_NAME_MAX_LENGTH = 50;
export const ARTIST_NAME_MAX_LENGTH = 100;
export const MAX_CARDS_PER_COLLECTION = 10000;
export const MAX_COLLECTIONS_PER_USER = 100;

// 價格相關常數
export const MIN_PRICE = 0;
export const MAX_PRICE = 1000000; // 100 萬
export const PRICE_DECIMAL_PLACES = 2;
export const CURRENCY_DEFAULT = 'TWD';
export const SUPPORTED_CURRENCIES = ['TWD', 'USD', 'EUR', 'JPY', 'CNY'];

// 會員制度常數
export const TRIAL_DURATION_DAYS = 7;
export const FREE_TIER_LIMITS = {
  CARD_RECOGNITION: 10,
  CONDITION_ANALYSIS: 5,
  AUTHENTICITY_CHECK: 3,
  PRICE_PREDICTION: 5,
  AI_CHAT: 20,
};
export const VIP_TIER_LIMITS = {
  CARD_RECOGNITION: 1000,
  CONDITION_ANALYSIS: 500,
  AUTHENTICITY_CHECK: 300,
  PRICE_PREDICTION: 500,
  AI_CHAT: 1000,
};

// 通知常數
export const NOTIFICATION_EXPIRY_DAYS = 30;
export const MAX_NOTIFICATIONS = 100;
export const PUSH_NOTIFICATION_TTL = 24 * 60 * 60; // 24 小時

// 搜索常數
export const SEARCH_MIN_LENGTH = 2;
export const SEARCH_MAX_LENGTH = 100;
export const SEARCH_DELAY_MS = 300; // 防抖延遲
export const MAX_SEARCH_RESULTS = 100;

// 分析常數
export const ANALYSIS_CONFIDENCE_THRESHOLD = 0.7;
export const MAX_ANALYSIS_ATTEMPTS = 3;
export const ANALYSIS_TIMEOUT_MS = 60000; // 60 秒

// 安全常數
export const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 小時
export const REFRESH_TOKEN_EXPIRY_DAYS = 30;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 分鐘

// 本地化常數
export const DEFAULT_LANGUAGE = 'zh-TW';
export const SUPPORTED_LANGUAGES = ['zh-TW', 'en-US', 'ja-JP'] as const;
export const FALLBACK_LANGUAGE = 'en-US';

// 性能常數
export const DEBOUNCE_DELAY = 300;
export const THROTTLE_DELAY = 100;
export const ANIMATION_DURATION = 300;
export const TRANSITION_DURATION = 200;

// 存儲常數
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  SETTINGS: 'app_settings',
  CACHE: 'app_cache',
  OFFLINE_DATA: 'offline_data',
} as const;

// 錯誤代碼
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
} as const;

// 狀態常數
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// 主題常數
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
} as const;

// 平台常數
export const PLATFORMS = {
  IOS: 'ios',
  ANDROID: 'android',
  WEB: 'web',
} as const;

// 文件類型常數
export const FILE_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  DOCUMENT: 'document',
  AUDIO: 'audio',
} as const;

// 權限常數
export const PERMISSIONS = {
  CAMERA: 'camera',
  PHOTO_LIBRARY: 'photoLibrary',
  NOTIFICATIONS: 'notifications',
  LOCATION: 'location',
} as const;

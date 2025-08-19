// API 相關常數
export const API_BASE_URL = (process.env as any)['API_BASE_URL'] || 'https://cardstrategy-api.onrender.com/api';
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
  VERY_LONG: 7 * 24 * 60 * 60 * 1000 // 7 天
};

// 檔案上傳常數
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
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
  AI_CHAT: 20
};
export const VIP_TIER_LIMITS = {
  CARD_RECOGNITION: 1000,
  CONDITION_ANALYSIS: 500,
  AUTHENTICITY_CHECK: 300,
  PRICE_PREDICTION: 500,
  AI_CHAT: 1000
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

// 主題常數
export const DEFAULT_THEME = 'auto';
export const SUPPORTED_THEMES = ['light', 'dark', 'auto'] as const;

// 錯誤代碼常數
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  FEATURE_LIMIT_REACHED: 'FEATURE_LIMIT_REACHED'
} as const;

// 狀態常數
export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

// 排序常數
export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc'
} as const;

// 過濾常數
export const FILTER_OPERATORS = {
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  GREATER_THAN: 'greater_than',
  LESS_THAN: 'less_than',
  GREATER_THAN_OR_EQUAL: 'greater_than_or_equal',
  LESS_THAN_OR_EQUAL: 'less_than_or_equal',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'not_contains',
  STARTS_WITH: 'starts_with',
  ENDS_WITH: 'ends_with',
  IN: 'in',
  NOT_IN: 'not_in',
  BETWEEN: 'between',
  IS_NULL: 'is_null',
  IS_NOT_NULL: 'is_not_null'
} as const;

// 權限常數
export const PERMISSIONS = {
  READ_CARDS: 'read_cards',
  WRITE_CARDS: 'write_cards',
  DELETE_CARDS: 'delete_cards',
  READ_COLLECTIONS: 'read_collections',
  WRITE_COLLECTIONS: 'write_collections',
  DELETE_COLLECTIONS: 'delete_collections',
  READ_INVESTMENTS: 'read_investments',
  WRITE_INVESTMENTS: 'write_investments',
  DELETE_INVESTMENTS: 'delete_investments',
  USE_AI_FEATURES: 'use_ai_features',
  ACCESS_PREMIUM_FEATURES: 'access_premium_features',
  MANAGE_USERS: 'manage_users',
  VIEW_ANALYTICS: 'view_analytics'
} as const;

// 角色常數
export const ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
} as const;

// 事件常數
export const EVENTS = {
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_REGISTER: 'user_register',
  CARD_ADDED: 'card_added',
  CARD_UPDATED: 'card_updated',
  CARD_DELETED: 'card_deleted',
  COLLECTION_CREATED: 'collection_created',
  COLLECTION_UPDATED: 'collection_updated',
  COLLECTION_DELETED: 'collection_deleted',
  INVESTMENT_CREATED: 'investment_created',
  INVESTMENT_UPDATED: 'investment_updated',
  INVESTMENT_DELETED: 'investment_deleted',
  AI_ANALYSIS_REQUESTED: 'ai_analysis_requested',
  AI_ANALYSIS_COMPLETED: 'ai_analysis_completed',
  PRICE_ALERT_TRIGGERED: 'price_alert_triggered',
  MEMBERSHIP_UPGRADED: 'membership_upgraded',
  MEMBERSHIP_DOWNGRADED: 'membership_downgraded'
} as const;

// 平台常數
export const PLATFORMS = {
  IOS: 'ios',
  ANDROID: 'android',
  WEB: 'web'
} as const;

// 版本常數
export const APP_VERSION = '1.0.0';
export const MIN_SUPPORTED_VERSION = '1.0.0';
export const API_VERSION = 'v1';

// 開發常數
export const IS_DEVELOPMENT = __DEV__;
export const IS_PRODUCTION = !__DEV__;
export const ENABLE_LOGGING = IS_DEVELOPMENT;
export const ENABLE_ANALYTICS = IS_PRODUCTION;

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
  SETTINGS: 'settings',
  THEME: 'theme',
  LANGUAGE: 'language',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  LAST_SYNC: 'last_sync',
  CACHE_DATA: 'cache_data'
} as const;

// 路由常數
export const ROUTES = {
  AUTH: 'Auth',
  MAIN: 'Main',
  HOME: 'Home',
  CARDS: 'Cards',
  COLLECTIONS: 'Collections',
  INVESTMENTS: 'Investments',
  MARKET: 'Market',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  CARD_DETAIL: 'CardDetail',
  COLLECTION_DETAIL: 'CollectionDetail',
  INVESTMENT_DETAIL: 'InvestmentDetail',
  CARD_SCANNER: 'CardScanner',
  AI_CHAT: 'AIChat',
  MARKET_ANALYSIS: 'MarketAnalysis',
  NOTIFICATIONS: 'Notifications',
  HELP: 'Help'
} as const;

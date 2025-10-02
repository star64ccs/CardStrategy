// 應用配置常量
export const APP_CONFIG = {
  // 應用基本信息
  NAME: 'CardStrategy',
  VERSION: '1.0.0',
  DESCRIPTION: '卡牌投資與收藏管理平台',
  AUTHOR: 'CardStrategy Team',
  WEBSITE: 'https://cardstrategy.app',

  // 環境配置
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',

  // 平台配置
  PLATFORM: {
    IOS: 'ios',
    ANDROID: 'android',
    WEB: 'web',
  },

  // 功能開關
  FEATURES: {
    AI_ANALYSIS: true,
    CARD_RECOGNITION: true,
    PRICE_PREDICTION: true,
    SOCIAL_FEATURES: true,
    OFFLINE_MODE: true,
    PUSH_NOTIFICATIONS: true,
    BIOMETRIC_AUTH: true,
    DARK_MODE: true,
    MULTI_LANGUAGE: true,
  },

  // 性能配置
  PERFORMANCE: {
    IMAGE_QUALITY: 'medium', // 'low' | 'medium' | 'high'
    CACHE_ENABLED: true,
    CACHE_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
    REQUEST_TIMEOUT: 30000, // 30秒
    RETRY_ATTEMPTS: 3,
  },

  // 安全配置
  SECURITY: {
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24小時
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REQUIRE_UPPERCASE: true,
    PASSWORD_REQUIRE_LOWERCASE: true,
    PASSWORD_REQUIRE_NUMBERS: true,
    PASSWORD_REQUIRE_SPECIAL_CHARS: true,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15分鐘
  },

  // 用戶體驗配置
  UX: {
    ANIMATION_DURATION: 300, // 毫秒
    DEBOUNCE_DELAY: 300, // 毫秒
    TOAST_DURATION: 3000, // 毫秒
    LOADING_TIMEOUT: 10000, // 10秒
    INFINITE_SCROLL_THRESHOLD: 100, // 像素
  },

  // 分析配置
  ANALYTICS: {
    ENABLED: true,
    TRACK_EVENTS: true,
    TRACK_ERRORS: true,
    TRACK_PERFORMANCE: true,
    SAMPLE_RATE: 1.0, // 100%
  },

  // 錯誤報告配置
  ERROR_REPORTING: {
    ENABLED: true,
    SEND_CRASH_REPORTS: true,
    SEND_ANONYMOUS_DATA: true,
    MAX_ERRORS_PER_SESSION: 10,
  },
} as const;

// 開發配置
export const DEV_CONFIG = {
  // 開發工具
  DEV_TOOLS: {
    ENABLED: !APP_CONFIG.IS_PRODUCTION,
    REDUX_DEVTOOLS: !APP_CONFIG.IS_PRODUCTION,
    REACT_DEVTOOLS: !APP_CONFIG.IS_PRODUCTION,
    LOG_LEVEL: 'debug',
  },

  // 模擬數據
  MOCK_DATA: {
    ENABLED: APP_CONFIG.IS_DEVELOPMENT,
    DELAY: 1000, // 1秒延遲
    ERROR_RATE: 0.1, // 10%錯誤率
  },

  // 熱重載
  HOT_RELOAD: {
    ENABLED: APP_CONFIG.IS_DEVELOPMENT,
    PORT: 8081,
  },
} as const;

// 測試配置
export const TEST_CONFIG = {
  // 測試環境
  ENVIRONMENT: {
    TIMEOUT: 10000, // 10秒
    RETRY_ATTEMPTS: 3,
    SCREENSHOT_ON_FAILURE: true,
  },

  // 模擬服務
  MOCK_SERVICES: {
    API: true,
    STORAGE: true,
    CAMERA: true,
    LOCATION: true,
    NOTIFICATIONS: true,
  },

  // 測試數據
  TEST_DATA: {
    USERS: 10,
    CARDS: 100,
    COLLECTIONS: 5,
    INVESTMENTS: 20,
  },
} as const;

// 生產配置
export const PROD_CONFIG = {
  // 性能優化
  OPTIMIZATION: {
    IMAGE_COMPRESSION: true,
    CODE_SPLITTING: true,
    LAZY_LOADING: true,
    CACHE_STRATEGY: 'aggressive',
  },

  // 監控
  MONITORING: {
    PERFORMANCE: true,
    ERRORS: true,
    USAGE: true,
    CRASH_REPORTS: true,
  },

  // 安全
  SECURITY: {
    HTTPS_ONLY: true,
    CSP_ENABLED: true,
    HSTS_ENABLED: true,
    XSS_PROTECTION: true,
  },
} as const;

// 本地化配置
export const I18N_CONFIG = {
  // 支持語言
  SUPPORTED_LANGUAGES: ['zh-TW', 'en-US', 'ja-JP'],
  DEFAULT_LANGUAGE: 'zh-TW',
  FALLBACK_LANGUAGE: 'en-US',

  // 日期格式
  DATE_FORMATS: {
    'zh-TW': 'YYYY/MM/DD',
    'en-US': 'MM/DD/YYYY',
    'ja-JP': 'YYYY/MM/DD',
  },

  // 時間格式
  TIME_FORMATS: {
    'zh-TW': 'HH:mm',
    'en-US': 'h:mm A',
    'ja-JP': 'HH:mm',
  },

  // 數字格式
  NUMBER_FORMATS: {
    'zh-TW': {
      decimal: '.',
      thousands: ',',
      currency: 'TWD',
    },
    'en-US': {
      decimal: '.',
      thousands: ',',
      currency: 'USD',
    },
    'ja-JP': {
      decimal: '.',
      thousands: ',',
      currency: 'JPY',
    },
  },
} as const;

// 存儲配置
export const STORAGE_CONFIG = {
  // 本地存儲
  LOCAL: {
    PREFIX: 'cardstrategy_',
    VERSION: '1.0.0',
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
  },

  // 緩存存儲
  CACHE: {
    PREFIX: 'cache_',
    DEFAULT_TTL: 30 * 60 * 1000, // 30分鐘
    MAX_ITEMS: 1000,
    MAX_SIZE: 100 * 1024 * 1024, // 100MB
  },

  // 會話存儲
  SESSION: {
    PREFIX: 'session_',
    TTL: 24 * 60 * 60 * 1000, // 24小時
  },
} as const;

// 網絡配置
export const NETWORK_CONFIG = {
  // 連接配置
  CONNECTION: {
    TIMEOUT: 30000, // 30秒
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1秒
    BACKOFF_MULTIPLIER: 2,
  },

  // 離線配置
  OFFLINE: {
    ENABLED: true,
    SYNC_ON_RECONNECT: true,
    QUEUE_SIZE: 100,
    MAX_RETRY_ATTEMPTS: 5,
  },

  // 緩存配置
  CACHE: {
    ENABLED: true,
    STRATEGY: 'network-first', // 'cache-first' | 'network-first' | 'stale-while-revalidate'
    MAX_AGE: 5 * 60 * 1000, // 5分鐘
  },
} as const;

// 導出所有配置
export const CONFIG = {
  APP: APP_CONFIG,
  DEV: DEV_CONFIG,
  TEST: TEST_CONFIG,
  PROD: PROD_CONFIG,
  I18N: I18N_CONFIG,
  STORAGE: STORAGE_CONFIG,
  NETWORK: NETWORK_CONFIG,
} as const;

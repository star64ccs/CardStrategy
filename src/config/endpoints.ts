// API 端點Configure
export const _API_ENDPOINTS = {
  // 基礎端點
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api',

  // Authenticate相Off
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    ME: '/auth/me',
  },

  // User相Off
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/profile',
    AVATAR: '/users/avatar',
    PREFERENCES: '/users/preferences',
    STATISTICS: '/users/statistics',
  },

  // 卡牌相Off
  CARDS: {
    LIST: '/cards',
    CREATE: '/cards',
    DETAIL: (id: string) => `/cards/${id}`,
    UPDATE: (id: string) => `/cards/${id}`,
    DELETE: (id: string) => `/cards/${id}`,
    SEARCH: '/cards/search',
    RECOMMENDATIONS: '/cards/recommendations',
    BATCH_CREATE: '/cards/batch',
    BATCH_UPDATE: '/cards/batch',
    BATCH_DELETE: '/cards/batch',
    UPLOAD_IMAGE: (id: string) => `/cards/${id}/image`,
    ANALYZE: (id: string) => `/cards/${id}/analyze`,
    VERIFY: (id: string) => `/cards/${id}/verify`,
    ANALYZE_CONDITION: (id: string) => `/cards/${id}/analyze-condition`,
    RECOGNIZE: '/cards/recognize',
  },

  // 收藏相Off
  COLLECTIONS: {
    LIST: '/collections',
    CREATE: '/collections',
    DETAIL: (id: string) => `/collections/${id}`,
    UPDATE: (id: string) => `/collections/${id}`,
    DELETE: (id: string) => `/collections/${id}`,
    ADD_CARD: (id: string, cardId: string) =>
      `/collections/${id}/cards/${cardId}`,
    REMOVE_CARD: (id: string, cardId: string) =>
      `/collections/${id}/cards/${cardId}`,
  },

  // 市場相Off
  MARKET: {
    DATA: '/market-data',
    TRENDS: '/market-data/trends',
    ANALYSIS: '/market-data/analysis',
    PREDICTIONS: '/market-data/predictions',
  },

  // 投資相Off
  INVESTMENTS: {
    LIST: '/investments',
    CREATE: '/investments',
    DETAIL: (id: string) => `/investments/${id}`,
    UPDATE: (id: string) => `/investments/${id}`,
    DELETE: (id: string) => `/investments/${id}`,
    PORTFOLIO: '/investments/portfolio',
    ANALYTICS: '/investments/analytics',
  },

  // AI相Off
  AI: {
    RECOGNITION: '/ai/recognition',
    BATCH_RECOGNITION: '/ai/recognition/batch',
    VERIFY: '/ai/verify',
    FEATURE_ANALYSIS: '/ai/features',
    PREDICTION: '/ai/prediction',
    RECOMMENDATION: '/ai/recommendation',
    CHAT: '/ai/chat',
    PORTFOLIO_ANALYSIS: '/ai/portfolio-analysis',
    MARKET_PREDICTION: '/ai/market-prediction',
    SMART_RECOMMENDATIONS: '/ai/smart-recommendations',
    // 增強版AI端點
    ENHANCED_RECOGNITION: '/ai/enhanced-recognition',
    ENHANCED_CONDITION_ANALYSIS: '/ai/enhanced-condition-analysis',
    ENHANCED_VERIFY: '/ai/enhanced-verify',
    ENHANCED_PRICE_PREDICTION: '/ai/enhanced-price-prediction',
    ENHANCED_STATS: '/ai/enhanced-stats',
    UPDATE_MODEL: '/ai/update-model',
    COMPREHENSIVE_ANALYSIS: '/ai/comprehensive-analysis',
  },

  // 防偽判斷相Off
  ANTI_COUNTERFEIT: {
    DETECT: '/anti-counterfeit/detect',
    PRINT_QUALITY: '/anti-counterfeit/print-quality',
    MATERIAL: '/anti-counterfeit/material',
    COLOR: '/anti-counterfeit/color',
    FONT: '/anti-counterfeit/font',
    HOLOGRAM: '/anti-counterfeit/hologram',
    DATABASE: '/anti-counterfeit/database',
    ALERT: '/anti-counterfeit/alert',
    REPORT: '/anti-counterfeit/report',
  },

  // 模擬鑑定相Off
  GRADING: {
    GRADE: '/grading/grade',
    CENTERING: '/grading/centering',
    CORNERS: '/grading/corners',
    EDGES: '/grading/edges',
    SURFACE: '/grading/surface',
    VALUE: '/grading/value',
    REPORT: '/grading/report',
    SHARE: '/grading/share',
  },

  // 會員相Off
  MEMBERSHIP: {
    STATUS: '/membership/status',
    SUBSCRIBE: '/membership/subscribe',
    CANCEL: '/membership/cancel',
    UPGRADE: '/membership/upgrade',
    USAGE: '/membership/usage',
    BILLING: '/membership/billing',
  },

  // Settings相Off
  SETTINGS: {
    GET: '/settings',
    UPDATE: '/settings',
    NOTIFICATIONS: '/settings/notifications',
    SECURITY: '/settings/security',
    EXPORT: '/settings/export',
    DELETE_ACCOUNT: '/settings/delete-account',
  },

  // 掃描歷史相Off
  SCAN_HISTORY: {
    LIST: '/scan-history',
    CREATE: '/scan-history',
    DETAIL: (id: string) => `/scan-history/${id}`,
    UPDATE: (id: string) => `/scan-history/${id}`,
    DELETE: (id: string) => `/scan-history/${id}`,
    TOGGLE_FAVORITE: (id: string) => `/scan-history/${id}/favorite`,
    ADD_NOTE: (id: string) => `/scan-history/${id}/note`,
    ADD_TAGS: (id: string) => `/scan-history/${id}/tags`,
    STATISTICS: '/scan-history/statistics',
    EXPORT: '/scan-history/export',
    SEARCH: '/scan-history/search',
    RECOMMENDED_TAGS: '/scan-history/recommended-tags',
    CLEANUP: '/scan-history/cleanup',
  },

  // 價格Data相Off
  PRICE_DATA: {
    GRADING_DATA: '/price-data/grading-data',
    RECOMMENDED_PLATFORMS: '/price-data/recommended-platforms',
    PLATFORM_STATUS: '/price-data/platform-status',
    SCRAPE_PRICES: '/price-data/scrape-prices',
    SCRAPE_GRADING: '/price-data/scrape-grading',
    UPDATE_CACHE: '/price-data/update-cache',
    ANALYTICS: '/price-data/analytics',
  },

  // 分享Verify相Off
  SHARE_VERIFICATION: {
    LOOKUP: '/share-verification/lookup',
    VALIDATE: '/share-verification/validate',
    STATS: '/share-verification/stats',
    DELETE: '/share-verification/delete',
  },

  // 預測相Off
  PREDICTIONS: {
    HISTORY: '/predictions/history',
    ACCURACY: '/predictions/accuracy',
    BATCH: '/predictions/batch',
    MODELS: '/predictions/models',
    STATISTICS: '/predictions/statistics',
    DELETE: '/predictions',
  },

  // 增強預測相Off
  ENHANCED_PREDICTIONS: {
    ENHANCED_BATCH: '/enhanced-predictions/enhanced-batch',
    MODEL_COMPARISON: '/enhanced-predictions/model-comparison',
    TECHNICAL_ANALYSIS: '/enhanced-predictions/technical-analysis',
    ACCURACY_ASSESSMENT: '/enhanced-predictions/accuracy-assessment',
    PERFORMANCE_STATS: '/enhanced-predictions/performance-stats',
    ENHANCED_MODELS: '/enhanced-predictions/enhanced-models',
  },

  // 模擬鑑定相Off
  SIMULATED_GRADING: {
    GET: '/grading',
    USER_REPORTS: '/grading/user',
    SEARCH: '/grading/search',
    SHARE: '/grading/share',
  },

  // False卡回報相Off
  FAKE_CARD: {
    SUBMIT: '/fake-card/submit',
    USER_SUBMISSIONS: '/fake-card/user-submissions',
    DATABASE: '/fake-card/database',
    REWARDS: '/fake-card/rewards',
    REVIEW: (id: string) => `/fake-card/${id}/review`,
    STATS: '/fake-card/stats',
  },

  // 社District合作相Off
  COMMUNITY: {
    APPLY_PARTNERSHIP: '/community/apply',
    PARTNERS: '/community/partners',
    CREATE_PROJECT: '/community/projects',
    PROJECTS: '/community/projects',
    UPDATE_PROJECT_PROGRESS: (id: string) =>
      `/community/projects/${id}/progress`,
    COLLABORATION_STATS: '/community/stats',
  },

  // 公OnData集相Off
  DATASET: {
    LIST: '/dataset/list',
    INTEGRATE: (id: string) => `/dataset/integrate/${id}`,
    SYNC: (id: string) => `/dataset/sync/${id}`,
    STATS: '/dataset/stats',
    VALIDATE: (id: string) => `/dataset/validate/${id}`,
  },

  // 合規相Off
  COMPLIANCE: {
    STATUS: '/compliance/status',
    REPORT: '/compliance/report',
    AUDIT: '/compliance/audit',
    UPDATE: '/compliance/update',
  },

  // Analysis相Off
  ANALYTICS: {
    USER_BEHAVIOR: '/analytics/user-behavior',
    BUSINESS_METRICS: '/analytics/business-metrics',
    PREDICTIONS: '/analytics/predictions',
    VISUALIZATION: '/analytics/visualization',
    REPORTS: '/analytics/reports',
    INSIGHTS: '/analytics/insights',
  },

  // Search相Off
  SEARCH: {
    FULL_TEXT: '/search/full-text',
    INTELLIGENT: '/search/intelligent',
    ANALYSIS: '/search/analysis',
  },

  // 推薦相Off
  RECOMMENDATIONS: {
    COLLABORATIVE: '/recommendations/collaborative',
    CONTENT: '/recommendations/content',
    HYBRID: '/recommendations/hybrid',
  },
};

export default API_ENDPOINTS;

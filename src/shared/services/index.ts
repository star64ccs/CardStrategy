// 共享服務索引
// 提供應用程序的共享服務

// 認證服務
export { authService, AuthService } from './authService';

// 用戶服務
export { userService, UserService } from './userService';

// 卡牌服務
export { cardService, CardService } from './cardService';

// 收藏服務
export { collectionService, CollectionService } from './collectionService';

// 市場服務
export { marketService, MarketService } from './marketService';

// AI 服務
export { aiService, AIService } from './aiService';

// 搜索服務
export { searchService, SearchService } from './searchService';

// 分析服務
export { analyticsService, AnalyticsService } from './analyticsService';

// 通知服務
export {
  notificationService,
  NotificationService,
} from './notificationService';

// 文件服務
export { fileService, FileService } from './fileService';

// 日誌服務
export { logService, LogService } from './logService';

// 緩存服務
export { cacheService, CacheService } from './cacheService';

// 同步服務
export { syncService, SyncService } from './syncService';

// AI 服務
export { openaiService, OpenAIService } from './ai/openaiService';
export { geminiService, GeminiService } from './ai/geminiService';
export { cohereService, CohereService } from './ai/cohereService';
export { replicateService, ReplicateService } from './ai/replicateService';

// 存儲服務
export {
  cloudinaryService,
  CloudinaryService,
} from './storage/cloudinaryService';
export { s3Service, S3Service } from './storage/s3Service';
export {
  cloudflareService,
  CloudflareService,
} from './storage/cloudflareService';
export { storageService, StorageService } from './storage/storageService';

// 通信服務
export {
  sendgridService,
  SendGridService,
} from './communication/sendgridService';
export { twilioService, TwilioService } from './communication/twilioService';
export { gmailService, GmailService } from './communication/gmailService';
export {
  communicationService,
  CommunicationService,
} from './communication/communicationService';

// 分析服務
export { segmentService, SegmentService } from './analytics/segmentService';
export { mixelService, MixelService } from './analytics/mixelService';

// 認證子服務
export { oauthService, OAuthService } from './auth/oauthService';
export { jwtService, JWTService } from './auth/jwtService';
export { twoFactorService, TwoFactorService } from './auth/twoFactorService';
export { rbacService, RBACService } from './auth/rbacService';

// 安全服務
export {
  rateLimitService,
  RateLimitService,
} from './security/rateLimitService';
export {
  encryptionService,
  EncryptionService,
} from './security/encryptionService';

// 業務服務
export { feedbackService, FeedbackService } from './feedbackService';
export { investmentService, InvestmentService } from './investmentService';
export { membershipService, MembershipService } from './membershipService';
export { priceDataService, PriceDataService } from './priceDataService';
export { privacyService, PrivacyService } from './privacyService';
export { scanHistoryService, ScanHistoryService } from './scanHistoryService';

// 類型導出 - 從核心類型文件導出
export type {
  ApiResponse,
  ApiError,
  BaseEntity,
  User,
  Card,
  AnalysisResult,
  AIAnalysis,
  ShareVerification,
  VerificationLookupResponse,
  NotificationSettings,
  PrivacySettings,
  AccessibilitySettings,
} from '../../core/types';

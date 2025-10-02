// 共享ServiceIndex
// 提供Apply程序的共享Service

// AuthenticateService
export { authService, AuthService } from './authService';

// UserService
export { userService, UserService } from './userService';

// 卡牌Service
export { cardService, CardService } from './cardService';

// 收藏Service
export { collectionService, CollectionService } from './collectionService';

// 市場Service
export { marketService, MarketService } from './marketService';

// AI Service
export { aiService, AIService } from './aiService';

// SearchService
export { searchService, SearchService } from './searchService';

// AnalysisService
export { analyticsService, AnalyticsService } from './analyticsService';

// NotificationService
export {
  notificationService,
  NotificationService,
} from './notificationService';

// FileService
export { fileService, FileService } from './fileService';

// LogService
export { logService, LogService } from './logService';

// CacheService
export { cacheService, CacheService } from './cacheService';

// SyncService
export { syncService, SyncService } from './syncService';

// AI Service
export { openaiService, OpenAIService } from './ai/openaiService';
export { geminiService, GeminiService } from './ai/geminiService';
export { cohereService, CohereService } from './ai/cohereService';
export { replicateService, ReplicateService } from './ai/replicateService';

// StorageService
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

// 通信Service
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

// AnalysisService
export { segmentService, SegmentService } from './analytics/segmentService';
export { mixelService, MixelService } from './analytics/mixelService';

// Authenticate子Service
export { oauthService, OAuthService } from './auth/oauthService';
export { jwtService, JWTService } from './auth/jwtService';
export { twoFactorService, TwoFactorService } from './auth/twoFactorService';
export { rbacService, RBACService } from './auth/rbacService';

// 安全Service
export {
  rateLimitService,
  RateLimitService,
} from './security/rateLimitService';
export {
  encryptionService,
  EncryptionService,
} from './security/encryptionService';

// 業務Service
export { feedbackService, FeedbackService } from './feedbackService';
export { investmentService, InvestmentService } from './investmentService';
export { membershipService, MembershipService } from './membershipService';
export { priceDataService, PriceDataService } from './priceDataService';
export { privacyService, PrivacyService } from './privacyService';
export { scanHistoryService, ScanHistoryService } from './scanHistoryService';

// Class型Export - 從核心Class型FileExport
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

import type { BaseEntity } from './common';

// User相OffClass型
export interface User extends BaseEntity {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  isVerified: boolean;
  isPremium: boolean;
  preferences: UserPreferences;
  statistics: UserStatistics;
}

export interface UserPreferences {
  language: 'zh-TW' | 'en-US' | 'ja-JP';
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  marketAlerts: boolean;
  priceAlerts: boolean;
  newsAlerts: boolean;
  socialAlerts: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  collectionVisibility: 'public' | 'private' | 'friends';
  activityVisibility: 'public' | 'private' | 'friends';
  dataSharing: boolean;
  analyticsEnabled: boolean;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  screenReader: boolean;
  reducedMotion: boolean;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

export interface UserStatistics {
  totalCards: number;
  totalValue: number;
  totalInvestments: number;
  totalTrades: number;
  joinDate: Date;
  lastActive: Date;
}

// Authenticate相OffClass型
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// NotificationClass型
export interface Notification extends BaseEntity {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: Date;
}

export type NotificationType =
  | 'price_alert'
  | 'market_update'
  | 'investment_advice'
  | 'system'
  | 'social_login'
  | 'security_alert';

// 社交Login相OffClass型
export type SocialProvider =
  | 'google'
  | 'facebook'
  | 'apple'
  | 'twitter'
  | 'github'
  | 'discord'
  | 'line'
  | 'kakao';

export interface SocialLoginCredentials {
  provider: SocialProvider;
  accessToken: string;
  idToken?: string;
  userInfo?: SocialUserInfo;
}

export interface SocialUserInfo {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  locale?: string;
  timezone?: string;
}

export interface SocialAuthResponse extends AuthResponse {
  provider: SocialProvider;
  socialUserId: string;
  isNewUser: boolean;
}

export interface SocialAccountLink {
  id: string;
  provider: SocialProvider;
  socialUserId: string;
  email: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  linkedAt: Date;
  lastUsedAt?: Date;
}

export interface SocialLoginConfig {
  google: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  facebook: {
    appId: string;
    appSecret: string;
    redirectUri: string;
  };
  apple: {
    clientId: string;
    teamId: string;
    keyId: string;
    privateKey: string;
    redirectUri: string;
  };
  twitter: {
    consumerKey: string;
    consumerSecret: string;
    redirectUri: string;
  };
  github: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  discord: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  line: {
    channelId: string;
    channelSecret: string;
    redirectUri: string;
  };
  kakao: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
}

// 雙因素AuthenticateClass型
export interface TwoFactorAuth {
  isEnabled: boolean;
  method: 'sms' | 'email' | 'authenticator';
  backupCodes?: string[];
  lastUsed?: Date;
}

export interface TwoFactorChallenge {
  challengeId: string;
  method: 'sms' | 'email' | 'authenticator';
  expiresAt: Date;
}

export interface TwoFactorVerification {
  challengeId: string;
  code: string;
  rememberDevice?: boolean;
}

// 會話ManageClass型
export interface UserSession {
  id: string;
  userId: string;
  deviceId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  location?: string;
  isActive: boolean;
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  os: string;
  browser?: string;
  model?: string;
  isTrusted: boolean;
}

export interface SessionManagement {
  activeSessions: UserSession[];
  maxSessions: number;
  allowMultipleSessions: boolean;
  sessionTimeout: number; // Minute
}

// 生物識別AuthenticateClass型
export type BiometricType =
  | 'fingerprint'
  | 'faceId'
  | 'touchId'
  | 'voiceId'
  | 'iris'
  | 'palm';

export interface BiometricCapability {
  type: BiometricType;
  isAvailable: boolean;
  isEnrolled: boolean;
  isSupported: boolean;
  hardwareDetected: boolean;
  securityLevel: 'weak' | 'strong' | 'class3';
}

export interface BiometricAuthRequest {
  promptMessage?: string;
  cancelButtonText?: string;
  fallbackButtonText?: string;
  disableDeviceFallback?: boolean;
  allowedAuthenticators?: BiometricType[];
}

export interface BiometricAuthResult {
  success: boolean;
  biometricType?: BiometricType;
  authenticationMethod?: 'biometric' | 'device_credential' | 'fallback';
  errorCode?: BiometricErrorCode;
  errorMessage?: string;
  timestamp: Date;
}

export type BiometricErrorCode =
  | 'user_cancel'
  | 'user_fallback'
  | 'system_cancel'
  | 'timeout'
  | 'unable_to_process'
  | 'authentication_failed'
  | 'biometry_not_available'
  | 'biometry_not_enrolled'
  | 'biometry_lockout'
  | 'biometry_lockout_permanent'
  | 'device_not_secure'
  | 'invalid_context'
  | 'app_cancel'
  | 'unknown_error';

export interface BiometricSettings {
  isEnabled: boolean;
  enabledTypes: BiometricType[];
  fallbackToDeviceCredential: boolean;
  requireConfirmation: boolean;
  invalidateOnEnrollment: boolean;
  maxRetryAttempts: number;
  lockoutDuration: number; // Second
}

export interface BiometricEnrollmentStatus {
  hasEnrolledBiometrics: boolean;
  enrolledTypes: BiometricType[];
  canEnroll: boolean;
  enrollmentDate?: Date;
  lastUsedDate?: Date;
}

export interface BiometricSecurityInfo {
  keyAlias: string;
  keyGenerated: boolean;
  keyInvalidated: boolean;
  biometricChanged: boolean;
  securityLevel: 'weak' | 'strong' | 'class3';
  attestationSupported: boolean;
}

export interface BiometricPromptConfig {
  title: string;
  subtitle?: string;
  description?: string;
  negativeButtonText: string;
  confirmationRequired?: boolean;
  deviceCredentialAllowed?: boolean;
}

export interface BiometricAuthState {
  // 能力檢測
  capabilities: BiometricCapability[];
  isCapabilityLoading: boolean;
  capabilityError: string | null;

  // AuthenticateStatus
  isAuthenticating: boolean;
  authResult: BiometricAuthResult | null;
  authError: string | null;

  // Settings
  settings: BiometricSettings;
  isSettingsLoading: boolean;
  settingsError: string | null;

  // RegisterStatus
  enrollmentStatus: BiometricEnrollmentStatus | null;
  isEnrollmentLoading: boolean;
  enrollmentError: string | null;

  // 安全Information
  securityInfo: BiometricSecurityInfo | null;
  isSecurityLoading: boolean;
  securityError: string | null;
}

// Redux AuthenticateStatusClass型
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// 會話Manage相OffClass型
export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  deviceInfo: DeviceInfo;
  locationInfo?: LocationInfo;
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date;
  isActive: boolean;
  isCurrent: boolean;
}

export interface DeviceInfo {
  deviceId: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'web';
  platform: 'ios' | 'android' | 'web' | 'windows' | 'macos' | 'linux';
  platformVersion: string;
  appVersion: string;
  deviceModel?: string;
  deviceName?: string;
  browserInfo?: BrowserInfo;
  ipAddress?: string;
  userAgent: string;
}

export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  engineVersion: string;
}

export interface LocationInfo {
  country: string;
  region?: string;
  city?: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
}

export interface SessionConfig {
  maxSessionsPerUser: number;
  sessionTimeout: number; // Minute
  refreshTokenExpiry: number; // 天
  autoRefreshEnabled: boolean;
  refreshThreshold: number; // Minute，在過期前多久BeginRefresh
  concurrentSessionLimit: number;
  deviceTrackingEnabled: boolean;
  locationTrackingEnabled: boolean;
}

export interface SessionActivity {
  id: string;
  sessionId: string;
  userId: string;
  activityType: SessionActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export type SessionActivityType =
  | 'login'
  | 'logout'
  | 'refresh_token'
  | 'password_change'
  | 'profile_update'
  | 'security_setting_change'
  | 'device_added'
  | 'device_removed'
  | 'suspicious_activity'
  | 'session_expired'
  | 'force_logout'
  | 'account_locked'
  | 'failed_login_attempt'
  | 'successful_login'
  | 'api_call'
  | 'data_access'
  | 'settings_change';

export interface SessionSecurityInfo {
  isCompromised: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  suspiciousActivities: SessionActivity[];
  lastSecurityCheck: Date;
  securityScore: number; // 0-100
  recommendations: string[];
}

export interface SessionRefreshRequest {
  refreshToken: string;
  deviceId?: string;
  forceRefresh?: boolean;
}

export interface SessionRefreshResponse {
  success: boolean;
  newToken?: string;
  newRefreshToken?: string;
  expiresIn?: number;
  errorCode?: SessionErrorCode;
  errorMessage?: string;
}

export type SessionErrorCode =
  | 'invalid_refresh_token'
  | 'refresh_token_expired'
  | 'session_not_found'
  | 'session_expired'
  | 'device_mismatch'
  | 'location_mismatch'
  | 'suspicious_activity'
  | 'account_locked'
  | 'too_many_sessions'
  | 'concurrent_session_limit'
  | 'server_error'
  | 'network_error'
  | 'unknown_error';

export interface SessionTerminationRequest {
  sessionId?: string; // 如果未提供，終止當前會話
  reason?: string;
  forceTerminate?: boolean;
}

export interface SessionTerminationResponse {
  success: boolean;
  terminatedSessions: string[];
  errorCode?: SessionErrorCode;
  errorMessage?: string;
}

export interface SessionListResponse {
  sessions: Session[];
  totalCount: number;
  activeCount: number;
  currentSessionId?: string;
}

export interface SessionAnalytics {
  totalSessions: number;
  activeSessions: number;
  averageSessionDuration: number; // Minute
  mostActiveDevice: string;
  mostActiveLocation: string;
  sessionTrends: SessionTrend[];
  securityIncidents: number;
  lastUpdated: Date;
}

export interface SessionTrend {
  date: Date;
  activeSessions: number;
  newSessions: number;
  terminatedSessions: number;
  averageDuration: number;
}

export interface SessionState {
  // 當前會話
  currentSession: Session | null;
  isSessionLoading: boolean;
  sessionError: string | null;

  // 會話List
  sessions: Session[];
  isSessionsLoading: boolean;
  sessionsError: string | null;

  // 會話Configure
  config: SessionConfig;
  isConfigLoading: boolean;
  configError: string | null;

  // 會話活動
  activities: SessionActivity[];
  isActivitiesLoading: boolean;
  activitiesError: string | null;

  // 安全Information
  securityInfo: SessionSecurityInfo | null;
  isSecurityLoading: boolean;
  securityError: string | null;

  // 會話Analysis
  analytics: SessionAnalytics | null;
  isAnalyticsLoading: boolean;
  analyticsError: string | null;

  // OperationStatus
  isRefreshing: boolean;
  refreshError: string | null;
  isTerminating: boolean;
  terminationError: string | null;
}

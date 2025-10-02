import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

import { AuthStorage } from '../../../core/storage/authStorage';
import type {
  Session,
  DeviceInfo as SessionDeviceInfo,
  LocationInfo,
  SessionConfig,
  SessionActivity,
  SessionActivityType,
  SessionSecurityInfo,
  SessionRefreshRequest,
  SessionRefreshResponse,
  SessionTerminationRequest,
  SessionTerminationResponse,
  SessionListResponse,
  SessionAnalytics,
} from '../../../core/types';
import { SessionErrorCode } from '../../../core/types';
import { logger } from '../../../core/utils/logger';

class SessionService {
  private static instance: SessionService;
  private isInitialized = false;
  private refreshTimer: NodeJS.Timeout | null = null;
  private activityTimer: NodeJS.Timeout | null = null;
  private currentSession: Session | null = null;

  private constructor() {}

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    logger.info('初始化 SessionService');

    try {
      await this.restoreCurrentSession();
      this.setupAutoRefresh();
      this.setupActivityTracking();
      this.isInitialized = true;
      logger.info('SessionService 初始化完成');
    } catch (error: unknown) {
      logger.error('SessionService InitializeFailed:', error);
      throw error;
    }
  }

  public async createSession(
    userId: string,
    token: string,
    refreshToken: string,
    expiresIn: number
  ): Promise<Session> {
    try {
      const _deviceInfo = await this.getDeviceInfo();
      const _locationInfo = await this.getLocationInfo();

      const session: Session = {
        id: this.generateSessionId(),
        userId,
        token,
        refreshToken,
        deviceInfo,
        locationInfo,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        lastActiveAt: new Date(),
        isActive: true,
        isCurrent: true,
      };

      await AuthStorage.setSession(session);
      await this.recordActivity(session.id, userId, 'login', '用戶登錄Success');

      this.currentSession = session;
      logger.info('會話CreateSuccess:', { sessionId: session.id, userId });

      return session;
    } catch (error: unknown) {
      logger.error('Create會話Failed:', error);
      throw new Error(`Create會話Failed: ${error.message}`);
    }
  }

  public async refreshSession(
    request: SessionRefreshRequest
  ): Promise<SessionRefreshResponse> {
    try {
      const { refreshToken, deviceId, forceRefresh } = request;

      if (!refreshToken) {
        return {
          success: false,
          errorCode: 'invalid_refresh_token',
          errorMessage: '刷新令牌不能為空',
        };
      }

      if (
        !this.currentSession ||
        this.currentSession.refreshToken !== refreshToken
      ) {
        return {
          success: false,
          errorCode: 'session_not_found',
          errorMessage: '會話不存在或刷新令牌不匹配',
        };
      }

      if (deviceId && this.currentSession.deviceInfo.deviceId !== deviceId) {
        return {
          success: false,
          errorCode: 'device_mismatch',
          errorMessage: '設備不匹配',
        };
      }

      if (this.currentSession.expiresAt < new Date() && !forceRefresh) {
        return {
          success: false,
          errorCode: 'session_expired',
          errorMessage: '會話已過期',
        };
      }

      const _response = await this.callRefreshTokenAPI(refreshToken);

      if (response.success && response.newToken && response.newRefreshToken) {
        this.currentSession.token = response.newToken;
        this.currentSession.refreshToken = response.newRefreshToken;
        this.currentSession.expiresAt = new Date(
          Date.now() + (response.expiresIn || 3600) * 1000
        );
        this.currentSession.lastActiveAt = new Date();

        await AuthStorage.setSession(this.currentSession);
        await this.recordActivity(
          this.currentSession.id,
          this.currentSession.userId,
          'refresh_token',
          '會話令牌刷新Success'
        );

        logger.info('會話刷新Success:', { sessionId: this.currentSession.id });

        return {
          success: true,
          newToken: response.newToken,
          newRefreshToken: response.newRefreshToken,
          expiresIn: response.expiresIn,
        };
      } else {
        return {
          success: false,
          errorCode: response.errorCode || 'unknown_error',
          errorMessage: response.errorMessage || '刷新令牌Failed',
        };
      }
    } catch (error: unknown) {
      logger.error('刷新會話Failed:', error);
      return {
        success: false,
        errorCode: 'server_error',
        errorMessage: `ServerError: ${error.message}`,
      };
    }
  }

  public async terminateSession(
    request: SessionTerminationRequest
  ): Promise<SessionTerminationResponse> {
    try {
      const { sessionId, reason, forceTerminate } = request;
      const _targetSessionId = sessionId || this.currentSession?.id;

      if (!targetSessionId) {
        return {
          success: false,
          terminatedSessions: [],
          errorCode: 'session_not_found',
          errorMessage: '會話不存在',
        };
      }

      if (!sessionId || targetSessionId === this.currentSession?.id) {
        if (this.currentSession) {
          await this.recordActivity(
            this.currentSession.id,
            this.currentSession.userId,
            'logout',
            reason || '用戶登出'
          );

          await AuthStorage.clearSession();
          this.stopAutoRefresh();
          this.stopActivityTracking();

          const _terminatedSession = this.currentSession;
          this.currentSession = null;

          logger.info('當前會話已終止:', {
            sessionId: terminatedSession.id,
            reason,
          });

          return {
            success: true,
            terminatedSessions: [terminatedSession.id],
          };
        }
      }

      const _response = await this.callTerminateSessionAPI(
        targetSessionId,
        reason,
        forceTerminate
      );

      if (response.success) {
        logger.info('會話終止Success:', { sessionId: targetSessionId, reason });
        return response;
      } else {
        return {
          success: false,
          terminatedSessions: [],
          errorCode: response.errorCode || 'unknown_error',
          errorMessage: response.errorMessage || '終止會話Failed',
        };
      }
    } catch (error: unknown) {
      logger.error('終止會話Failed:', error);
      return {
        success: false,
        terminatedSessions: [],
        errorCode: 'server_error',
        errorMessage: `ServerError: ${error.message}`,
      };
    }
  }

  public async getSessions(): Promise<SessionListResponse> {
    try {
      const _response = await this.callGetSessionsAPI();

      if (response.success) {
        logger.info('Get會話列表Success:', { count: response.sessions.length });
        return {
          sessions: response.sessions,
          totalCount: response.sessions.length,
          activeCount: response.sessions.filter(s => s.isActive).length,
        };
      } else {
        throw new Error(response.errorMessage || 'Get會話列表Failed');
      }
    } catch (error: unknown) {
      logger.error('Get會話列表Failed:', error);
      throw new Error(`Get會話列表Failed: ${error.message}`);
    }
  }

  public async getSessionConfig(): Promise<SessionConfig> {
    try {
      const _response = await this.callGetSessionConfigAPI();

      if (response.success) {
        logger.info('Get會話ConfigureSuccess');
        return response.config;
      } else {
        throw new Error(response.errorMessage || 'Get會話ConfigureFailed');
      }
    } catch (error: unknown) {
      logger.error('Get會話ConfigureFailed:', error);
      return {
        maxSessionsPerUser: 5,
        sessionTimeout: 30,
        refreshTokenExpiry: 30,
        autoRefreshEnabled: true,
        refreshThreshold: 5,
        concurrentSessionLimit: 3,
        deviceTrackingEnabled: true,
        locationTrackingEnabled: true,
      };
    }
  }

  public async getSessionActivities(
    sessionId?: string
  ): Promise<SessionActivity[]> {
    try {
      const _targetSessionId = sessionId || this.currentSession?.id;

      if (!targetSessionId) {
        throw new Error('會話不存在');
      }

      const _response = await this.callGetSessionActivitiesAPI(targetSessionId);

      if (response.success) {
        logger.info('Get會話活動Success:', { count: response.activities.length });
        return response.activities;
      } else {
        throw new Error(response.errorMessage || 'Get會話活動Failed');
      }
    } catch (error: unknown) {
      logger.error('Get會話活動Failed:', error);
      throw new Error(`Get會話活動Failed: ${error.message}`);
    }
  }

  public async getSessionSecurityInfo(): Promise<SessionSecurityInfo> {
    try {
      if (!this.currentSession) {
        throw new Error('當前會話不存在');
      }

      const _response = await this.callGetSessionSecurityAPI(
        this.currentSession.id
      );

      if (response.success) {
        logger.info('Get會話安全信息Success');
        return response.securityInfo;
      } else {
        throw new Error(response.errorMessage || 'Get會話安全信息Failed');
      }
    } catch (error: unknown) {
      logger.error('Get會話安全信息Failed:', error);
      throw new Error(`Get會話安全信息Failed: ${error.message}`);
    }
  }

  public async getSessionAnalytics(): Promise<SessionAnalytics> {
    try {
      const _response = await this.callGetSessionAnalyticsAPI();

      if (response.success) {
        logger.info('Get會話分析Success');
        return response.analytics;
      } else {
        throw new Error(response.errorMessage || 'Get會話分析Failed');
      }
    } catch (error: unknown) {
      logger.error('Get會話分析Failed:', error);
      throw new Error(`Get會話分析Failed: ${error.message}`);
    }
  }

  public async recordActivity(
    sessionId: string,
    userId: string,
    activityType: SessionActivityType,
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      const activity: SessionActivity = {
        id: this.generateActivityId(),
        sessionId,
        userId,
        activityType,
        description,
        metadata,
        timestamp: new Date(),
        ipAddress: await this.getCurrentIPAddress(),
        userAgent: await this.getUserAgent(),
      };

      await this.callRecordActivityAPI(activity);
      logger.debug('會話活動已記錄:', { activityType, description });
    } catch (error: unknown) {
      logger.error('記錄會話活動Failed:', error);
    }
  }

  public isSessionValid(): boolean {
    if (!this.currentSession) {
      return false;
    }

    const _now = new Date();
    return this.currentSession.isActive && this.currentSession.expiresAt > now;
  }

  public getCurrentSession(): Session | null {
    return this.currentSession;
  }

  public async updateSessionActivity(): Promise<void> {
    if (this.currentSession) {
      this.currentSession.lastActiveAt = new Date();
      await AuthStorage.setSession(this.currentSession);
    }
  }

  // PrivateMethod
  private async restoreCurrentSession(): Promise<void> {
    try {
      const _session = await AuthStorage.getSession();
      if (session) {
        // Check會話YesNo有效
        const _now = new Date();
        const _isValid = session.isActive && session.expiresAt > now;

        if (isValid) {
          this.currentSession = session;
          logger.info('會話恢復Success:', { sessionId: session.id });
        } else {
          await AuthStorage.clearSession();
          logger.info('過期會話已清除');
        }
      }
    } catch (error: unknown) {
      logger.error('恢復會話Failed:', error);
      throw error; // ReThrowError
    }
  }

  private setupAutoRefresh(): void {
    if (!this.currentSession) return;

    const _refreshThreshold = 5 * 60 * 1000; // 5Minute
    const _timeUntilRefresh =
      this.currentSession.expiresAt.getTime() - Date.now() - refreshThreshold;

    if (timeUntilRefresh > 0) {
      this.refreshTimer = setTimeout(async () => {
        await this.autoRefreshSession();
      }, timeUntilRefresh);
    }
  }

  private async autoRefreshSession(): Promise<void> {
    if (!this.currentSession) return;

    try {
      const _response = await this.refreshSession({
        refreshToken: this.currentSession.refreshToken,
        deviceId: this.currentSession.deviceInfo.deviceId,
      });

      if (response.success) {
        this.setupAutoRefresh();
      } else {
        logger.warn('自動刷新會話Failed:', {
          errorMessage: response.errorMessage,
        });
      }
    } catch (error: unknown) {
      logger.error('自動刷新會話Failed:', error);
    }
  }

  private setupActivityTracking(): void {
    this.activityTimer = setInterval(
      async () => {
        await this.updateSessionActivity();
      },
      5 * 60 * 1000
    );
  }

  private stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private stopActivityTracking(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
  }

  private async getDeviceInfo(): Promise<SessionDeviceInfo> {
    const _deviceId = await DeviceInfo.getUniqueId();
    const _deviceType = await this.getDeviceType();
    const _platform = (Platform.OS as any) || 'web';
    const _platformVersion = Platform.Version?.toString() || '1.0.0';
    const _appVersion = await DeviceInfo.getVersion();
    const _deviceModel = await DeviceInfo.getModel();
    const _deviceName = await DeviceInfo.getDeviceName();
    const _userAgent = await this.getUserAgent();

    return {
      deviceId,
      deviceType,
      platform,
      platformVersion,
      appVersion,
      deviceModel,
      deviceName,
      userAgent,
    } as SessionDeviceInfo;
  }

  private async getDeviceType(): Promise<
    'mobile' | 'tablet' | 'desktop' | 'web'
  > {
    if (Platform.OS === 'web') {
      return 'web';
    }

    try {
      const _isTablet = await DeviceInfo.isTablet();
      if (isTablet) {
        return 'tablet';
      }
    } catch (error) {
      // 如果無法檢測設備Class型，Default為 mobile
    }

    return 'mobile';
  }

  private async getLocationInfo(): Promise<LocationInfo | undefined> {
    try {
      return {
        country: 'TW',
        timezone: 'Asia/Taipei',
      };
    } catch (error) {
      logger.warn('Get位置信息Failed:', error);
      return undefined;
    }
  }

  private async getCurrentIPAddress(): Promise<string | undefined> {
    try {
      return undefined;
    } catch (error) {
      logger.warn('Get IP 地址Failed:', error);
      return undefined;
    }
  }

  private async getUserAgent(): Promise<string> {
    try {
      return await DeviceInfo.getUserAgent();
    } catch (error) {
      return 'Unknown';
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateActivityId(): string {
    return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // API 調用Method（模擬實現）
  private async callRefreshTokenAPI(
    refreshToken: string
  ): Promise<SessionRefreshResponse> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          newToken: `new_access_token_${Date.now()}`,
          newRefreshToken: `new_refresh_token_${Date.now()}`,
          expiresIn: 3600,
        });
      }, 100);
    });
  }

  private async callTerminateSessionAPI(
    sessionId: string,
    reason?: string,
    forceTerminate?: boolean
  ): Promise<SessionTerminationResponse> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          terminatedSessions: [sessionId],
        });
      }, 100);
    });
  }

  private async callGetSessionsAPI(): Promise<{
    success: boolean;
    sessions: Session[];
    errorMessage?: string;
  }> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          sessions: this.currentSession ? [this.currentSession] : [],
        });
      }, 100);
    });
  }

  private async callGetSessionConfigAPI(): Promise<{
    success: boolean;
    config: SessionConfig;
    errorMessage?: string;
  }> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          config: {
            maxSessionsPerUser: 5,
            sessionTimeout: 30,
            refreshTokenExpiry: 30,
            autoRefreshEnabled: true,
            refreshThreshold: 5,
            concurrentSessionLimit: 3,
            deviceTrackingEnabled: true,
            locationTrackingEnabled: true,
          },
        });
      }, 100);
    });
  }

  private async callGetSessionActivitiesAPI(sessionId: string): Promise<{
    success: boolean;
    activities: SessionActivity[];
    errorMessage?: string;
  }> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          activities: [],
        });
      }, 100);
    });
  }

  private async callGetSessionSecurityAPI(sessionId: string): Promise<{
    success: boolean;
    securityInfo: SessionSecurityInfo;
    errorMessage?: string;
  }> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          securityInfo: {
            isCompromised: false,
            riskLevel: 'low',
            suspiciousActivities: [],
            lastSecurityCheck: new Date(),
            securityScore: 95,
            recommendations: [],
          },
        });
      }, 100);
    });
  }

  private async callGetSessionAnalyticsAPI(): Promise<{
    success: boolean;
    analytics: SessionAnalytics;
    errorMessage?: string;
  }> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          analytics: {
            totalSessions: 1,
            activeSessions: 1,
            averageSessionDuration: 30,
            mostActiveDevice: 'mobile',
            mostActiveLocation: 'Taiwan',
            sessionTrends: [],
            securityIncidents: 0,
            lastUpdated: new Date(),
          },
        });
      }, 100);
    });
  }

  private async callRecordActivityAPI(
    activity: SessionActivity
  ): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 50);
    });
  }
}

export const _sessionService = SessionService.getInstance();

import { AuthStorage } from '../../../core/storage/authStorage';
import { logger } from '../../../core/utils/logger';
import { sessionService } from '../services/sessionService';

// Mock dependencies
jest.mock('../../../core/storage/authStorage');
jest.mock('../../../core/utils/logger');
jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn().mockResolvedValue('test-device-id'),
  getVersion: jest.fn().mockResolvedValue('1.0.0'),
  getModel: jest.fn().mockResolvedValue('Test Device'),
  getDeviceName: jest.fn().mockResolvedValue('Test Device Name'),
  getUserAgent: jest.fn().mockResolvedValue('Test User Agent'),
  isTablet: jest.fn().mockResolvedValue(false),
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: '15.0',
  },
}));

const _mockAuthStorage = AuthStorage as jest.Mocked<typeof AuthStorage>;
const _mockLogger = logger as jest.Mocked<typeof logger>;

describe('SessionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton instance
    (sessionService as any).instance = null;
    (sessionService as any).isInitialized = false;
    (sessionService as any).currentSession = null;
    (sessionService as any).refreshTimer = null;
    (sessionService as any).activityTimer = null;
  });

  afterEach(() => {
    // Clear timers
    if ((sessionService as any).refreshTimer) {
      clearTimeout((sessionService as any).refreshTimer);
    }
    if ((sessionService as any).activityTimer) {
      clearInterval((sessionService as any).activityTimer);
    }
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const _instance1 = sessionService;
      const _instance2 = sessionService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      mockAuthStorage.getSession.mockResolvedValue(null);

      await sessionService.initialize();

      expect(mockLogger.info).toHaveBeenCalledWith('初始化 SessionService');
      expect(mockLogger.info).toHaveBeenCalledWith('SessionService 初始化完成');
      expect((sessionService as any).isInitialized).toBe(true);
    });

    it('should restore existing valid session', async () => {
      const _mockSession = {
        id: 'test-session',
        userId: 'user123',
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        deviceInfo: {
          deviceId: 'test-device-id',
          deviceType: 'mobile' as const,
          platform: 'ios' as const,
          platformVersion: '15.0',
          appVersion: '1.0.0',
          userAgent: 'Test User Agent',
        },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        lastActiveAt: new Date(),
        isActive: true,
        isCurrent: true,
      };

      mockAuthStorage.getSession.mockResolvedValue(mockSession);

      await sessionService.initialize();

      // CheckYesNo調用了正確的Log
      const _infoCalls = (mockLogger.info as jest.Mock).mock.calls;
      const _hasRestoreCall = infoCalls.some(
        call =>
          call[0] === '會話恢復Success:' && call[1]?.sessionId === 'test-session'
      );
      expect(hasRestoreCall).toBe(true);
      expect((sessionService as any).currentSession).toEqual(mockSession);
    });

    it('should clear expired session', async () => {
      const _mockExpiredSession = {
        id: 'test-session',
        userId: 'user123',
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        deviceInfo: {
          deviceId: 'test-device-id',
          deviceType: 'mobile' as const,
          platform: 'ios' as const,
          platformVersion: '15.0',
          appVersion: '1.0.0',
          userAgent: 'Test User Agent',
        },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        lastActiveAt: new Date(),
        isActive: true,
        isCurrent: true,
      };

      mockAuthStorage.getSession.mockResolvedValue(mockExpiredSession);

      await sessionService.initialize();

      expect(mockLogger.info).toHaveBeenCalledWith('過期會話已清除');
      expect(mockAuthStorage.clearSession).toHaveBeenCalled();
    });

    it('should handle initialization error', async () => {
      mockAuthStorage.getSession.mockRejectedValue(new Error('Storage error'));

      await expect(sessionService.initialize()).rejects.toThrow(
        'Storage error'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'SessionService InitializeFailed:',
        expect.any(Error)
      );
    });
  });

  describe('createSession', () => {
    beforeEach(async () => {
      await sessionService.initialize();
    });

    it('should create session successfully', async () => {
      const _userId = 'user123';
      const _token = 'test-token';
      const _refreshToken = 'test-refresh-token';
      const _expiresIn = 3600;

      const _session = await sessionService.createSession(
        userId,
        token,
        refreshToken,
        expiresIn
      );

      expect(session).toMatchObject({
        userId,
        token,
        refreshToken,
        isActive: true,
        isCurrent: true,
      });
      expect(session.deviceInfo).toMatchObject({
        deviceType: 'mobile',
        platform: 'ios',
        platformVersion: '15.0',
      });
      expect(mockAuthStorage.setSession).toHaveBeenCalledWith(session);
      expect(mockLogger.info).toHaveBeenCalledWith('會話CreateSuccess:', {
        sessionId: session.id,
        userId,
      });
    });

    it('should handle create session error', async () => {
      mockAuthStorage.setSession.mockRejectedValue(new Error('Storage error'));

      await expect(
        sessionService.createSession('user123', 'token', 'refresh-token', 3600)
      ).rejects.toThrow('Create會話Failed: Storage error');
    });
  });

  describe('refreshSession', () => {
    beforeEach(async () => {
      await sessionService.initialize();
      // Create a session first
      await sessionService.createSession(
        'user123',
        'test-token',
        'test-refresh-token',
        3600
      );
    });

    it('should refresh session successfully', async () => {
      const { currentSession } = sessionService as any;
      const _response = await sessionService.refreshSession({
        refreshToken: currentSession.refreshToken,
        deviceId: currentSession.deviceInfo.deviceId,
      });

      expect(response.success).toBe(true);
      expect(response.newToken).toBeDefined();
      expect(response.newRefreshToken).toBeDefined();
      expect(response.expiresIn).toBe(3600);
    });

    it('should fail with invalid refresh token', async () => {
      const _response = await sessionService.refreshSession({
        refreshToken: 'invalid-token',
      });

      expect(response.success).toBe(false);
      expect(response.errorCode).toBe('session_not_found');
      expect(response.errorMessage).toBe('會話不存在或刷新令牌不匹配');
    });

    it('should fail with device mismatch', async () => {
      const { currentSession } = sessionService as any;
      const _response = await sessionService.refreshSession({
        refreshToken: currentSession.refreshToken,
        deviceId: 'different-device-id',
      });

      expect(response.success).toBe(false);
      expect(response.errorCode).toBe('device_mismatch');
      expect(response.errorMessage).toBe('設備不匹配');
    });

    it('should fail with expired session', async () => {
      // Manually expire the session
      const { currentSession } = sessionService as any;
      currentSession.expiresAt = new Date(Date.now() - 1000);

      const _response = await sessionService.refreshSession({
        refreshToken: currentSession.refreshToken,
        deviceId: currentSession.deviceInfo.deviceId,
      });

      expect(response.success).toBe(false);
      expect(response.errorCode).toBe('session_expired');
      expect(response.errorMessage).toBe('會話已過期');
    });
  });

  describe('terminateSession', () => {
    beforeEach(async () => {
      await sessionService.initialize();
      await sessionService.createSession(
        'user123',
        'test-token',
        'test-refresh-token',
        3600
      );
    });

    it('should terminate current session successfully', async () => {
      const _response = await sessionService.terminateSession({
        reason: 'User logout',
      });

      expect(response.success).toBe(true);
      expect(response.terminatedSessions).toHaveLength(1);
      expect((sessionService as any).currentSession).toBeNull();
      expect(mockAuthStorage.clearSession).toHaveBeenCalled();
    });

    it('should handle termination error', async () => {
      mockAuthStorage.clearSession.mockRejectedValue(
        new Error('Storage error')
      );

      const _response = await sessionService.terminateSession({
        reason: 'User logout',
      });

      expect(response.success).toBe(false);
      expect(response.errorCode).toBe('server_error');
    });
  });

  describe('getSessions', () => {
    beforeEach(async () => {
      await sessionService.initialize();
    });

    it('should get sessions successfully', async () => {
      const _response = await sessionService.getSessions();

      expect(response.sessions).toBeDefined();
      expect(Array.isArray(response.sessions)).toBe(true);
    });

    it('should handle get sessions error', async () => {
      // Mock the API call to fail
      const _originalCall = (sessionService as any).callGetSessionsAPI;
      (sessionService as any).callGetSessionsAPI = jest.fn().mockResolvedValue({
        success: false,
        errorMessage: 'API error',
      });

      await expect(sessionService.getSessions()).rejects.toThrow(
        'Get會話列表Failed: API error'
      );

      // Restore original method
      (sessionService as any).callGetSessionsAPI = originalCall;
    });
  });

  describe('getSessionConfig', () => {
    beforeEach(async () => {
      await sessionService.initialize();
    });

    it('should get session config successfully', async () => {
      const _config = await sessionService.getSessionConfig();

      expect(config).toMatchObject({
        maxSessionsPerUser: 5,
        sessionTimeout: 30,
        refreshTokenExpiry: 30,
        autoRefreshEnabled: true,
        refreshThreshold: 5,
        concurrentSessionLimit: 3,
        deviceTrackingEnabled: true,
        locationTrackingEnabled: true,
      });
    });

    it('should return default config on error', async () => {
      // Mock the API call to fail
      const _originalCall = (sessionService as any).callGetSessionConfigAPI;
      (sessionService as any).callGetSessionConfigAPI = jest
        .fn()
        .mockRejectedValue(new Error('API error'));

      const _config = await sessionService.getSessionConfig();

      expect(config).toMatchObject({
        maxSessionsPerUser: 5,
        sessionTimeout: 30,
        refreshTokenExpiry: 30,
        autoRefreshEnabled: true,
        refreshThreshold: 5,
        concurrentSessionLimit: 3,
        deviceTrackingEnabled: true,
        locationTrackingEnabled: true,
      });

      // Restore original method
      (sessionService as any).callGetSessionConfigAPI = originalCall;
    });
  });

  describe('getSessionActivities', () => {
    beforeEach(async () => {
      await sessionService.initialize();
      await sessionService.createSession(
        'user123',
        'test-token',
        'test-refresh-token',
        3600
      );
    });

    it('should get session activities successfully', async () => {
      const _activities = await sessionService.getSessionActivities();

      expect(Array.isArray(activities)).toBe(true);
    });

    it('should fail without current session', async () => {
      (sessionService as any).currentSession = null;

      await expect(sessionService.getSessionActivities()).rejects.toThrow(
        '會話不存在'
      );
    });
  });

  describe('getSessionSecurityInfo', () => {
    beforeEach(async () => {
      await sessionService.initialize();
      await sessionService.createSession(
        'user123',
        'test-token',
        'test-refresh-token',
        3600
      );
    });

    it('should get security info successfully', async () => {
      const _securityInfo = await sessionService.getSessionSecurityInfo();

      expect(securityInfo).toMatchObject({
        isCompromised: false,
        riskLevel: 'low',
        suspiciousActivities: [],
        securityScore: 95,
        recommendations: [],
      });
    });

    it('should fail without current session', async () => {
      (sessionService as any).currentSession = null;

      await expect(sessionService.getSessionSecurityInfo()).rejects.toThrow(
        '當前會話不存在'
      );
    });
  });

  describe('getSessionAnalytics', () => {
    beforeEach(async () => {
      await sessionService.initialize();
    });

    it('should get analytics successfully', async () => {
      const _analytics = await sessionService.getSessionAnalytics();

      expect(analytics).toMatchObject({
        totalSessions: 1,
        activeSessions: 1,
        averageSessionDuration: 30,
        mostActiveDevice: 'mobile',
        mostActiveLocation: 'Taiwan',
        sessionTrends: [],
        securityIncidents: 0,
      });
    });
  });

  describe('recordActivity', () => {
    beforeEach(async () => {
      await sessionService.initialize();
      await sessionService.createSession(
        'user123',
        'test-token',
        'test-refresh-token',
        3600
      );
    });

    it('should record activity successfully', async () => {
      const { currentSession } = sessionService as any;

      await sessionService.recordActivity(
        currentSession.id,
        currentSession.userId,
        'login',
        'User logged in successfully'
      );

      expect(mockLogger.debug).toHaveBeenCalledWith('會話活動已記錄:', {
        activityType: 'login',
        description: 'User logged in successfully',
      });
    });

    it('should handle activity recording error gracefully', async () => {
      // Mock the API call to fail
      const _originalCall = (sessionService as any).callRecordActivityAPI;
      (sessionService as any).callRecordActivityAPI = jest
        .fn()
        .mockRejectedValue(new Error('API error'));

      const { currentSession } = sessionService as any;

      // Should not throw error
      await expect(
        sessionService.recordActivity(
          currentSession.id,
          currentSession.userId,
          'login',
          'User logged in successfully'
        )
      ).resolves.toBeUndefined();

      expect(mockLogger.error).toHaveBeenCalledWith(
        '記錄會話活動Failed:',
        expect.any(Error)
      );

      // Restore original method
      (sessionService as any).callRecordActivityAPI = originalCall;
    });
  });

  describe('isSessionValid', () => {
    beforeEach(async () => {
      await sessionService.initialize();
    });

    it('should return false when no session exists', () => {
      expect(sessionService.isSessionValid()).toBe(false);
    });

    it('should return true for valid session', async () => {
      await sessionService.createSession(
        'user123',
        'test-token',
        'test-refresh-token',
        3600
      );
      expect(sessionService.isSessionValid()).toBe(true);
    });

    it('should return false for expired session', async () => {
      await sessionService.createSession(
        'user123',
        'test-token',
        'test-refresh-token',
        3600
      );
      const { currentSession } = sessionService as any;
      currentSession.expiresAt = new Date(Date.now() - 1000);
      expect(sessionService.isSessionValid()).toBe(false);
    });

    it('should return false for inactive session', async () => {
      await sessionService.createSession(
        'user123',
        'test-token',
        'test-refresh-token',
        3600
      );
      const { currentSession } = sessionService as any;
      currentSession.isActive = false;
      expect(sessionService.isSessionValid()).toBe(false);
    });
  });

  describe('getCurrentSession', () => {
    beforeEach(async () => {
      await sessionService.initialize();
    });

    it('should return null when no session exists', () => {
      expect(sessionService.getCurrentSession()).toBeNull();
    });

    it('should return current session', async () => {
      const _createdSession = await sessionService.createSession(
        'user123',
        'test-token',
        'test-refresh-token',
        3600
      );
      expect(sessionService.getCurrentSession()).toEqual(createdSession);
    });
  });

  describe('updateSessionActivity', () => {
    beforeEach(async () => {
      await sessionService.initialize();
      await sessionService.createSession(
        'user123',
        'test-token',
        'test-refresh-token',
        3600
      );
    });

    it('should update session activity', async () => {
      const { currentSession } = sessionService as any;
      const _originalLastActiveAt = currentSession.lastActiveAt;

      await sessionService.updateSessionActivity();

      expect(currentSession.lastActiveAt.getTime()).toBeGreaterThan(
        originalLastActiveAt.getTime()
      );
      expect(mockAuthStorage.setSession).toHaveBeenCalledWith(currentSession);
    });

    it('should do nothing when no session exists', async () => {
      // Clear之前Create的會話
      (sessionService as any).currentSession = null;
      mockAuthStorage.setSession.mockClear();

      await expect(
        sessionService.updateSessionActivity()
      ).resolves.toBeUndefined();
      expect(mockAuthStorage.setSession).not.toHaveBeenCalled();
    });
  });
});

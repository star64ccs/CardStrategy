import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  BiometricAuthRequest,
} from '../../core/types';
import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';
import { securityUtils } from '../../core/utils/securityUtils';
import { AuthStorage, UserStorage } from '../../core/utils/storage';
import { biometricAuthService } from '../../features/auth/services/biometricAuthService';

/**
 * AuthenticateService
 * HandleUserLogin、Register、登出等Authenticate相Off功能
 */
export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private isAuthenticated = false;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * UserLogin
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      logger.info('用戶登錄嘗試:', { email: credentials.email });

      // VerifyInput
      if (!securityUtils.validateInput(credentials.email, 'email')) {
        throw new Error('無效的電子郵件格式');
      }

      if (!credentials.password || credentials.password.length < 8) {
        throw new Error('密碼長度不足');
      }

      // SendLoginRequest
      const _response = await api.post<AuthResponse>(
        '/auth/login',
        credentials
      );

      if (response.success && response.data) {
        // SaveAuthenticateInformation
        await this.saveAuthData(response.data);

        // UpdateStatus
        this.currentUser = response.data.user;
        this.isAuthenticated = true;

        logger.info('用戶登錄Success:', { userId: this.currentUser?.id });
        return response.data;
      } else {
        throw new Error('登錄Failed');
      }
    } catch (error) {
      logger.error('用戶登錄Failed:', { error, email: credentials.email });
      throw error;
    }
  }

  /**
   * UserRegister
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      logger.info('用戶註冊嘗試:', { email: userData.email });

      // VerifyInput
      if (!securityUtils.validateInput(userData.email, 'email')) {
        throw new Error('無效的電子郵件格式');
      }

      if (!securityUtils.validateInput(userData.username, 'text')) {
        throw new Error('無效的用戶名格式');
      }

      // VerifyPassword強度
      const _passwordValidation = securityUtils.validatePassword(
        userData.password
      );
      if (!passwordValidation.isValid) {
        throw new Error(
          `密碼不符合要求: ${passwordValidation.errors.join(', ')}`
        );
      }

      // SendRegisterRequest
      const _response = await api.post<AuthResponse>(
        '/auth/register',
        userData
      );

      if (response.success && response.data) {
        // SaveAuthenticateInformation
        await this.saveAuthData(response.data);

        // UpdateStatus
        this.currentUser = response.data.user;
        this.isAuthenticated = true;

        logger.info('用戶註冊Success:', { userId: this.currentUser?.id });
        return response.data;
      } else {
        throw new Error('註冊Failed');
      }
    } catch (error) {
      logger.error('用戶註冊Failed:', { error, email: userData.email });
      throw error;
    }
  }

  /**
   * User登出
   */
  async logout(): Promise<void> {
    try {
      logger.info('用戶登出:', { userId: this.currentUser?.id });

      // Send登出Request
      await api.post('/auth/logout');

      // ClearLocalAuthenticateInformation
      await this.clearAuthData();

      // UpdateStatus
      this.currentUser = null;
      this.isAuthenticated = false;

      logger.info('用戶登出Success');
    } catch (error) {
      logger.error('用戶登出Failed:', { error });
      // 即使ServerRequestFailed，也要ClearLocalData
      await this.clearAuthData();
      this.currentUser = null;
      this.isAuthenticated = false;
    }
  }

  /**
   * RefreshAuthenticate令牌
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const _refreshToken = await AuthStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('沒有可用的刷新令牌');
      }

      const _response = await api.post<AuthResponse>('/auth/refresh', {
        refreshToken,
      });

      if (response.success && response.data) {
        // Save新的AuthenticateInformation
        await this.saveAuthData(response.data);

        // UpdateStatus
        this.currentUser = response.data.user;
        this.isAuthenticated = true;

        logger.info('令牌刷新Success');
        return response.data;
      } else {
        throw new Error('令牌刷新Failed');
      }
    } catch (error) {
      logger.error('令牌刷新Failed:', { error });
      // RefreshFailed，ClearAuthenticateInformation
      await this.clearAuthData();
      this.currentUser = null;
      this.isAuthenticated = false;
      throw error;
    }
  }

  /**
   * CheckAuthenticateStatus
   */
  async checkAuthStatus(): Promise<boolean> {
    try {
      const _token = await AuthStorage.getToken();
      if (!token) {
        this.isAuthenticated = false;
        return false;
      }

      // SendRequestVerify令牌
      const _response = await api.get<User>('/auth/me');

      if (response.success && response.data) {
        this.currentUser = response.data;
        this.isAuthenticated = true;
        return true;
      } else {
        // 令牌無效，嘗試Refresh
        try {
          await this.refreshToken();
          return true;
        } catch {
          await this.clearAuthData();
          this.isAuthenticated = false;
          return false;
        }
      }
    } catch (error) {
      logger.error('Check認證狀態Failed:', { error });
      this.isAuthenticated = false;
      return false;
    }
  }

  /**
   * Get當前User（SyncVersion）
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * CheckYesNo已Authenticate
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  /**
   * UpdateUserInformation
   */
  async updateUserProfile(updates: Partial<User>): Promise<User> {
    try {
      if (!this.isAuthenticated) {
        throw new Error('用戶未認證');
      }

      const _response = await api.put<User>('/auth/profile', updates);

      if (response.success && response.data) {
        this.currentUser = response.data;
        logger.info('用戶信息UpdateSuccess');
        return response.data;
      } else {
        throw new Error('Update用戶信息Failed');
      }
    } catch (error) {
      logger.error('Update用戶信息Failed:', { error });
      throw error;
    }
  }

  /**
   * ModifyPassword
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      if (!this.isAuthenticated) {
        throw new Error('用戶未認證');
      }

      // Verify新Password強度
      const _passwordValidation = securityUtils.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(
          `新密碼不符合要求: ${passwordValidation.errors.join(', ')}`
        );
      }

      const _response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (response.success) {
        logger.info('密碼修改Success');
      } else {
        throw new Error('密碼修改Failed');
      }
    } catch (error) {
      logger.error('密碼修改Failed:', { error });
      throw error;
    }
  }

  /**
   * 忘記Password
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      if (!securityUtils.validateInput(email, 'email')) {
        throw new Error('無效的電子郵件格式');
      }

      const _response = await api.post('/auth/forgot-password', { email });

      if (response.success) {
        logger.info('密碼重置郵件已發送');
      } else {
        throw new Error('發送密碼重置郵件Failed');
      }
    } catch (error) {
      logger.error('忘記密碼請求Failed:', { error, email });
      throw error;
    }
  }

  /**
   * ResetPassword
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Verify新Password強度
      const _passwordValidation = securityUtils.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(
          `新密碼不符合要求: ${passwordValidation.errors.join(', ')}`
        );
      }

      const _response = await api.post('/auth/reset-password', {
        token,
        newPassword,
      });

      if (response.success) {
        logger.info('密碼重置Success');
      } else {
        throw new Error('密碼重置Failed');
      }
    } catch (error) {
      logger.error('密碼重置Failed:', { error });
      throw error;
    }
  }

  /**
   * SaveAuthenticateData
   */
  private async saveAuthData(authData: AuthResponse): Promise<void> {
    if (authData.token) {
      await AuthStorage.setToken(authData.token);
    }
    if (authData.refreshToken) {
      await AuthStorage.setRefreshToken(authData.refreshToken);
    }
    if (authData.user) {
      await UserStorage.setUserData(authData.user);
    }
  }

  /**
   * ClearAuthenticateData
   */
  private async clearAuthData(): Promise<void> {
    await AuthStorage.clearAuth();
    await UserStorage.removeUserData();
  }

  /**
   * CheckYesNo已Authenticate
   */
  async checkAuthenticationStatus(): Promise<boolean> {
    return this.isAuthenticated;
  }

  /**
   * Get當前User（AsyncVersion）
   */
  async getCurrentUserAsync(): Promise<User | null> {
    if (!this.isAuthenticated) {
      return null;
    }
    return this.currentUser;
  }

  /**
   * GetStorage的令牌
   */
  async getStoredToken(): Promise<string | null> {
    return AuthStorage.getToken();
  }

  /**
   * UpdateUser資料（存RootMethod）
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    logger.info('更新用戶資料（存根方法）:', { updates });
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...updates };
      await UserStorage.setUserData(this.currentUser);
    }
    return this.currentUser || ({} as User);
  }

  /**
   * 生物識別Login
   */
  async biometricLogin(request?: BiometricAuthRequest): Promise<AuthResponse> {
    try {
      logger.info('生物識別登錄嘗試');

      // Check生物識別YesNo可用
      const _isAvailable = await biometricAuthService.isBiometricAvailable();
      if (!isAvailable) {
        throw new Error('生物識別不可用');
      }

      // 執Row生物識別Authenticate
      const _biometricResult = await biometricAuthService.authenticate(request);

      if (!biometricResult.success) {
        throw new Error(biometricResult.errorMessage || '生物識別認證Failed');
      }

      // Create生物識別Sign用於ServerVerify
      const _payload = JSON.stringify({
        timestamp: Date.now(),
        biometricType: biometricResult.biometricType,
        deviceId: 'device-id', // 實際Apply中應該YesTrue實的設備ID
      });

      const _signature =
        await biometricAuthService.createBiometricSignature(payload);

      // Send生物識別LoginRequest到Server
      const _response = await api.post<AuthResponse>('/auth/biometric/login', {
        biometricType: biometricResult.biometricType,
        signature,
        payload,
        timestamp: biometricResult.timestamp,
      });

      if (response.success && response.data) {
        // SaveAuthenticateInformation
        await this.saveAuthData(response.data);

        // UpdateStatus
        this.currentUser = response.data.user;
        this.isAuthenticated = true;

        logger.info('生物識別登錄Success:', {
          userId: this.currentUser?.id,
          biometricType: biometricResult.biometricType,
        });
        return response.data;
      } else {
        throw new Error('生物識別登錄Failed');
      }
    } catch (error) {
      logger.error('生物識別登錄Failed:', error);
      throw error;
    }
  }

  /**
   * Enable生物識別Authenticate
   */
  async enableBiometricAuth(): Promise<boolean> {
    try {
      logger.info('啟用生物識別認證');

      if (!this.isAuthenticated) {
        throw new Error('用戶未認證');
      }

      // Check生物識別能力
      const _capabilities =
        await biometricAuthService.detectBiometricCapabilities();
      const _availableCapabilities = capabilities.filter(
        cap => cap.isAvailable && cap.isEnrolled
      );

      if (availableCapabilities.length === 0) {
        throw new Error('沒有可用的生物識別方式');
      }

      // Create生物識別密鑰
      const _keyCreated = await biometricAuthService.createBiometricKeys();
      if (!keyCreated) {
        throw new Error('Create生物識別密鑰Failed');
      }

      // 執Row一次Authenticate以VerifySettings
      const _authResult = await biometricAuthService.authenticate({
        promptMessage: '請進行生物識別認證以完成設置',
      });

      if (!authResult.success) {
        // 如果AuthenticateFailed，Delete已Create的密鑰
        await biometricAuthService.deleteBiometricKeys();
        throw new Error('生物識別認證VerifyFailed');
      }

      // 向ServerRegister生物識別
      const _response = await api.post('/auth/biometric/register', {
        biometricType: authResult.biometricType,
        capabilities: availableCapabilities,
      });

      if (response.success) {
        logger.info('生物識別認證啟用Success');
        return true;
      } else {
        // RegisterFailed，清理Local密鑰
        await biometricAuthService.deleteBiometricKeys();
        throw new Error('Server註冊生物識別Failed');
      }
    } catch (error) {
      logger.error('啟用生物識別認證Failed:', error);
      throw error;
    }
  }

  /**
   * Disable生物識別Authenticate
   */
  async disableBiometricAuth(): Promise<boolean> {
    try {
      logger.info('禁用生物識別認證');

      if (!this.isAuthenticated) {
        throw new Error('用戶未認證');
      }

      // 向ServerLogout生物識別
      const _response = await api.delete('/auth/biometric/unregister');

      // 無論ServerRequestYesNoSuccess，都要清理Local密鑰
      await biometricAuthService.deleteBiometricKeys();

      if (response.success) {
        logger.info('生物識別認證禁用Success');
        return true;
      } else {
        logger.warn('Server註銷生物識別Failed，但本地密鑰已清理');
        return false;
      }
    } catch (error) {
      logger.error('禁用生物識別認證Failed:', error);
      // 即使出錯也要嘗試清理Local密鑰
      try {
        await biometricAuthService.deleteBiometricKeys();
      } catch (cleanupError) {
        logger.error('清理生物識別密鑰Failed:', cleanupError);
      }
      throw error;
    }
  }

  /**
   * Check生物識別AuthenticateStatus
   */
  async checkBiometricAuthStatus(): Promise<{
    isAvailable: boolean;
    isEnabled: boolean;
    isRegistered: boolean;
    capabilities: unknown[];
  }> {
    try {
      logger.info('檢查生物識別認證狀態');

      // CheckLocal生物識別能力
      const _capabilities =
        await biometricAuthService.detectBiometricCapabilities();
      const _isAvailable = await biometricAuthService.isBiometricAvailable();
      const _keysExist = await biometricAuthService.biometricKeysExist();

      let isRegistered = false;

      // 如果User已Authenticate，CheckServerRegisterStatus
      if (this.isAuthenticated) {
        try {
          const _response = await api.get('/auth/biometric/status');
          isRegistered =
            response.success && (response.data as any)?.isRegistered;
        } catch (error) {
          logger.warn('CheckServer生物識別狀態Failed:', error);
        }
      }

      const _status = {
        isAvailable,
        isEnabled: keysExist,
        isRegistered,
        capabilities,
      };

      logger.info('生物識別認證狀態:', status);
      return status;
    } catch (error) {
      logger.error('Check生物識別認證狀態Failed:', error);
      throw error;
    }
  }

  /**
   * 快速Login（優先使用生物識別）
   */
  async quickLogin(): Promise<AuthResponse> {
    try {
      logger.info('快速登錄嘗試');

      // 首先嘗試生物識別Login
      const _biometricStatus = await this.checkBiometricAuthStatus();

      if (
        biometricStatus.isAvailable &&
        biometricStatus.isEnabled &&
        biometricStatus.isRegistered
      ) {
        try {
          return await this.biometricLogin({
            promptMessage: '使用生物識別快速登錄',
          });
        } catch (biometricError) {
          logger.warn('生物識別快速登錄Failed，嘗試令牌刷新:', biometricError);
        }
      }

      // 生物識別Failed或不可用，嘗試令牌Refresh
      try {
        return await this.refreshToken();
      } catch (tokenError) {
        logger.warn('令牌刷新Failed:', tokenError);
        throw new Error('快速登錄Failed，請使用用戶名密碼登錄');
      }
    } catch (error) {
      logger.error('快速登錄Failed:', error);
      throw error;
    }
  }
}

// Export單例Instance
export const _authService = AuthService.getInstance();

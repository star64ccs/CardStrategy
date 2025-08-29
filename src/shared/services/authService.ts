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
 * 認證服務
 * 處理用戶登錄、註冊、登出等認證相關功能
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
   * 用戶登錄
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      logger.info('用戶登錄嘗試:', { email: credentials.email });

      // 驗證輸入
      if (!securityUtils.validateInput(credentials.email, 'email')) {
        throw new Error('無效的電子郵件格式');
      }

      if (!credentials.password || credentials.password.length < 8) {
        throw new Error('密碼長度不足');
      }

      // 發送登錄請求
      const _response = await api.post<AuthResponse>(
        '/auth/login',
        credentials
      );

      if (response.success && response.data) {
        // 保存認證信息
        await this.saveAuthData(response.data);

        // 更新狀態
        this.currentUser = response.data.user;
        this.isAuthenticated = true;

        logger.info('用戶登錄成功:', { userId: this.currentUser?.id });
        return response.data;
      } else {
        throw new Error('登錄失敗');
      }
    } catch (error) {
      logger.error('用戶登錄失敗:', { error, email: credentials.email });
      throw error;
    }
  }

  /**
   * 用戶註冊
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      logger.info('用戶註冊嘗試:', { email: userData.email });

      // 驗證輸入
      if (!securityUtils.validateInput(userData.email, 'email')) {
        throw new Error('無效的電子郵件格式');
      }

      if (!securityUtils.validateInput(userData.username, 'text')) {
        throw new Error('無效的用戶名格式');
      }

      // 驗證密碼強度
      const _passwordValidation = securityUtils.validatePassword(
        userData.password
      );
      if (!passwordValidation.isValid) {
        throw new Error(
          `密碼不符合要求: ${passwordValidation.errors.join(', ')}`
        );
      }

      // 發送註冊請求
      const _response = await api.post<AuthResponse>(
        '/auth/register',
        userData
      );

      if (response.success && response.data) {
        // 保存認證信息
        await this.saveAuthData(response.data);

        // 更新狀態
        this.currentUser = response.data.user;
        this.isAuthenticated = true;

        logger.info('用戶註冊成功:', { userId: this.currentUser?.id });
        return response.data;
      } else {
        throw new Error('註冊失敗');
      }
    } catch (error) {
      logger.error('用戶註冊失敗:', { error, email: userData.email });
      throw error;
    }
  }

  /**
   * 用戶登出
   */
  async logout(): Promise<void> {
    try {
      logger.info('用戶登出:', { userId: this.currentUser?.id });

      // 發送登出請求
      await api.post('/auth/logout');

      // 清除本地認證信息
      await this.clearAuthData();

      // 更新狀態
      this.currentUser = null;
      this.isAuthenticated = false;

      logger.info('用戶登出成功');
    } catch (error) {
      logger.error('用戶登出失敗:', { error });
      // 即使服務器請求失敗，也要清除本地數據
      await this.clearAuthData();
      this.currentUser = null;
      this.isAuthenticated = false;
    }
  }

  /**
   * 刷新認證令牌
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
        // 保存新的認證信息
        await this.saveAuthData(response.data);

        // 更新狀態
        this.currentUser = response.data.user;
        this.isAuthenticated = true;

        logger.info('令牌刷新成功');
        return response.data;
      } else {
        throw new Error('令牌刷新失敗');
      }
    } catch (error) {
      logger.error('令牌刷新失敗:', { error });
      // 刷新失敗，清除認證信息
      await this.clearAuthData();
      this.currentUser = null;
      this.isAuthenticated = false;
      throw error;
    }
  }

  /**
   * 檢查認證狀態
   */
  async checkAuthStatus(): Promise<boolean> {
    try {
      const _token = await AuthStorage.getToken();
      if (!token) {
        this.isAuthenticated = false;
        return false;
      }

      // 發送請求驗證令牌
      const _response = await api.get<User>('/auth/me');

      if (response.success && response.data) {
        this.currentUser = response.data;
        this.isAuthenticated = true;
        return true;
      } else {
        // 令牌無效，嘗試刷新
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
      logger.error('檢查認證狀態失敗:', { error });
      this.isAuthenticated = false;
      return false;
    }
  }

  /**
   * 獲取當前用戶（同步版本）
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * 檢查是否已認證
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  /**
   * 更新用戶信息
   */
  async updateUserProfile(updates: Partial<User>): Promise<User> {
    try {
      if (!this.isAuthenticated) {
        throw new Error('用戶未認證');
      }

      const _response = await api.put<User>('/auth/profile', updates);

      if (response.success && response.data) {
        this.currentUser = response.data;
        logger.info('用戶信息更新成功');
        return response.data;
      } else {
        throw new Error('更新用戶信息失敗');
      }
    } catch (error) {
      logger.error('更新用戶信息失敗:', { error });
      throw error;
    }
  }

  /**
   * 修改密碼
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      if (!this.isAuthenticated) {
        throw new Error('用戶未認證');
      }

      // 驗證新密碼強度
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
        logger.info('密碼修改成功');
      } else {
        throw new Error('密碼修改失敗');
      }
    } catch (error) {
      logger.error('密碼修改失敗:', { error });
      throw error;
    }
  }

  /**
   * 忘記密碼
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
        throw new Error('發送密碼重置郵件失敗');
      }
    } catch (error) {
      logger.error('忘記密碼請求失敗:', { error, email });
      throw error;
    }
  }

  /**
   * 重置密碼
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // 驗證新密碼強度
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
        logger.info('密碼重置成功');
      } else {
        throw new Error('密碼重置失敗');
      }
    } catch (error) {
      logger.error('密碼重置失敗:', { error });
      throw error;
    }
  }

  /**
   * 保存認證數據
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
   * 清除認證數據
   */
  private async clearAuthData(): Promise<void> {
    await AuthStorage.clearAuth();
    await UserStorage.removeUserData();
  }

  /**
   * 檢查是否已認證
   */
  async checkAuthenticationStatus(): Promise<boolean> {
    return this.isAuthenticated;
  }

  /**
   * 獲取當前用戶（異步版本）
   */
  async getCurrentUserAsync(): Promise<User | null> {
    if (!this.isAuthenticated) {
      return null;
    }
    return this.currentUser;
  }

  /**
   * 獲取存儲的令牌
   */
  async getStoredToken(): Promise<string | null> {
    return AuthStorage.getToken();
  }

  /**
   * 更新用戶資料（存根方法）
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
   * 生物識別登錄
   */
  async biometricLogin(request?: BiometricAuthRequest): Promise<AuthResponse> {
    try {
      logger.info('生物識別登錄嘗試');

      // 檢查生物識別是否可用
      const _isAvailable = await biometricAuthService.isBiometricAvailable();
      if (!isAvailable) {
        throw new Error('生物識別不可用');
      }

      // 執行生物識別認證
      const _biometricResult = await biometricAuthService.authenticate(request);

      if (!biometricResult.success) {
        throw new Error(biometricResult.errorMessage || '生物識別認證失敗');
      }

      // 創建生物識別簽名用於服務器驗證
      const _payload = JSON.stringify({
        timestamp: Date.now(),
        biometricType: biometricResult.biometricType,
        deviceId: 'device-id', // 實際應用中應該是真實的設備ID
      });

      const _signature =
        await biometricAuthService.createBiometricSignature(payload);

      // 發送生物識別登錄請求到服務器
      const _response = await api.post<AuthResponse>('/auth/biometric/login', {
        biometricType: biometricResult.biometricType,
        signature,
        payload,
        timestamp: biometricResult.timestamp,
      });

      if (response.success && response.data) {
        // 保存認證信息
        await this.saveAuthData(response.data);

        // 更新狀態
        this.currentUser = response.data.user;
        this.isAuthenticated = true;

        logger.info('生物識別登錄成功:', {
          userId: this.currentUser?.id,
          biometricType: biometricResult.biometricType,
        });
        return response.data;
      } else {
        throw new Error('生物識別登錄失敗');
      }
    } catch (error) {
      logger.error('生物識別登錄失敗:', error);
      throw error;
    }
  }

  /**
   * 啟用生物識別認證
   */
  async enableBiometricAuth(): Promise<boolean> {
    try {
      logger.info('啟用生物識別認證');

      if (!this.isAuthenticated) {
        throw new Error('用戶未認證');
      }

      // 檢查生物識別能力
      const _capabilities =
        await biometricAuthService.detectBiometricCapabilities();
      const _availableCapabilities = capabilities.filter(
        cap => cap.isAvailable && cap.isEnrolled
      );

      if (availableCapabilities.length === 0) {
        throw new Error('沒有可用的生物識別方式');
      }

      // 創建生物識別密鑰
      const _keyCreated = await biometricAuthService.createBiometricKeys();
      if (!keyCreated) {
        throw new Error('創建生物識別密鑰失敗');
      }

      // 執行一次認證以驗證設置
      const _authResult = await biometricAuthService.authenticate({
        promptMessage: '請進行生物識別認證以完成設置',
      });

      if (!authResult.success) {
        // 如果認證失敗，刪除已創建的密鑰
        await biometricAuthService.deleteBiometricKeys();
        throw new Error('生物識別認證驗證失敗');
      }

      // 向服務器註冊生物識別
      const _response = await api.post('/auth/biometric/register', {
        biometricType: authResult.biometricType,
        capabilities: availableCapabilities,
      });

      if (response.success) {
        logger.info('生物識別認證啟用成功');
        return true;
      } else {
        // 註冊失敗，清理本地密鑰
        await biometricAuthService.deleteBiometricKeys();
        throw new Error('服務器註冊生物識別失敗');
      }
    } catch (error) {
      logger.error('啟用生物識別認證失敗:', error);
      throw error;
    }
  }

  /**
   * 禁用生物識別認證
   */
  async disableBiometricAuth(): Promise<boolean> {
    try {
      logger.info('禁用生物識別認證');

      if (!this.isAuthenticated) {
        throw new Error('用戶未認證');
      }

      // 向服務器註銷生物識別
      const _response = await api.delete('/auth/biometric/unregister');

      // 無論服務器請求是否成功，都要清理本地密鑰
      await biometricAuthService.deleteBiometricKeys();

      if (response.success) {
        logger.info('生物識別認證禁用成功');
        return true;
      } else {
        logger.warn('服務器註銷生物識別失敗，但本地密鑰已清理');
        return false;
      }
    } catch (error) {
      logger.error('禁用生物識別認證失敗:', error);
      // 即使出錯也要嘗試清理本地密鑰
      try {
        await biometricAuthService.deleteBiometricKeys();
      } catch (cleanupError) {
        logger.error('清理生物識別密鑰失敗:', cleanupError);
      }
      throw error;
    }
  }

  /**
   * 檢查生物識別認證狀態
   */
  async checkBiometricAuthStatus(): Promise<{
    isAvailable: boolean;
    isEnabled: boolean;
    isRegistered: boolean;
    capabilities: unknown[];
  }> {
    try {
      logger.info('檢查生物識別認證狀態');

      // 檢查本地生物識別能力
      const _capabilities =
        await biometricAuthService.detectBiometricCapabilities();
      const _isAvailable = await biometricAuthService.isBiometricAvailable();
      const _keysExist = await biometricAuthService.biometricKeysExist();

      let isRegistered = false;

      // 如果用戶已認證，檢查服務器註冊狀態
      if (this.isAuthenticated) {
        try {
          const _response = await api.get('/auth/biometric/status');
          isRegistered =
            response.success && (response.data as any)?.isRegistered;
        } catch (error) {
          logger.warn('檢查服務器生物識別狀態失敗:', error);
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
      logger.error('檢查生物識別認證狀態失敗:', error);
      throw error;
    }
  }

  /**
   * 快速登錄（優先使用生物識別）
   */
  async quickLogin(): Promise<AuthResponse> {
    try {
      logger.info('快速登錄嘗試');

      // 首先嘗試生物識別登錄
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
          logger.warn('生物識別快速登錄失敗，嘗試令牌刷新:', biometricError);
        }
      }

      // 生物識別失敗或不可用，嘗試令牌刷新
      try {
        return await this.refreshToken();
      } catch (tokenError) {
        logger.warn('令牌刷新失敗:', tokenError);
        throw new Error('快速登錄失敗，請使用用戶名密碼登錄');
      }
    } catch (error) {
      logger.error('快速登錄失敗:', error);
      throw error;
    }
  }
}

// 導出單例實例
export const _authService = AuthService.getInstance();

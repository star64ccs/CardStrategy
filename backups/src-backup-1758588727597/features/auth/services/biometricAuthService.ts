import { Platform } from 'react-native';

import type {
  BiometricType,
  BiometricCapability,
  BiometricAuthRequest,
  BiometricAuthResult,
  BiometricSettings,
  BiometricEnrollmentStatus,
  BiometricSecurityInfo,
  BiometricPromptConfig,
  BiometricErrorCode,
} from '../../../core/types';
import { logger } from '../../../core/utils/logger';

// Mock 生物識別庫接口
interface BiometricLibrary {
  isSensorAvailable(): Promise<BiometricType | null>;
  createKeys(options?: unknown): Promise<boolean>;
  biometricKeysExist(): Promise<boolean>;
  deleteKeys(): Promise<boolean>;
  createSignature(promptMessage: string, payload: string): Promise<any>;
  simplePrompt(promptConfig: BiometricPromptConfig): Promise<any>;
}

/**
 * 生物識別認證服務
 * 處理指紋、Face ID 等生物識別認證功能
 */
export class BiometricAuthService {
  private static instance: BiometricAuthService;
  private biometricLib: BiometricLibrary | null = null;
  private isInitialized = false;

  private constructor() {
    this.initializeBiometricLibrary();
  }

  static getInstance(): BiometricAuthService {
    if (!BiometricAuthService.instance) {
      BiometricAuthService.instance = new BiometricAuthService();
    }
    return BiometricAuthService.instance;
  }

  /**
   * 初始化生物識別庫
   */
  private async initializeBiometricLibrary(): Promise<void> {
    try {
      // 在實際應用中，這裡會導入真實的生物識別庫
      // 例如：react-native-biometrics, react-native-touch-id 等

      if (Platform.OS === 'ios') {
        // iOS 使用 TouchID/FaceID
        this.biometricLib = await this.loadIOSBiometricLib();
      } else if (Platform.OS === 'android') {
        // Android 使用 Fingerprint/BiometricPrompt
        this.biometricLib = await this.loadAndroidBiometricLib();
      } else {
        // Web 或其他平台
        this.biometricLib = await this.loadWebBiometricLib();
      }

      this.isInitialized = true;
      logger.info('生物識別庫初始化成功');
    } catch (error) {
      logger.error('生物識別庫初始化失敗:', error);
      this.isInitialized = false;
    }
  }

  /**
   * 加載 iOS 生物識別庫
   */
  private async loadIOSBiometricLib(): Promise<BiometricLibrary> {
    // Mock iOS 生物識別庫
    return {
      isSensorAvailable: async () => {
        // 模擬檢測 iOS 設備的生物識別能力
        const hasTouch = Math.random() > 0.3;
        const hasFace = Math.random() > 0.7;

        if (hasFace) return 'faceId';
        if (hasTouch) return 'touchId';
        return null;
      },
      createKeys: async () => true,
      biometricKeysExist: async () => Math.random() > 0.5,
      deleteKeys: async () => true,
      createSignature: async (promptMessage: string, payload: string) => {
        return { signature: 'mock-signature', success: true };
      },
      simplePrompt: async (config: BiometricPromptConfig) => {
        // 模擬用戶交互
        const success = Math.random() > 0.3;
        if (success) {
          return { success: true, biometryType: 'faceId' };
        } else {
          throw new Error('User canceled');
        }
      },
    };
  }

  /**
   * 加載 Android 生物識別庫
   */
  private async loadAndroidBiometricLib(): Promise<BiometricLibrary> {
    // Mock Android 生物識別庫
    return {
      isSensorAvailable: async () => {
        // 模擬檢測 Android 設備的生物識別能力
        const hasFingerprint = Math.random() > 0.4;
        return hasFingerprint ? 'fingerprint' : null;
      },
      createKeys: async () => true,
      biometricKeysExist: async () => Math.random() > 0.5,
      deleteKeys: async () => true,
      createSignature: async (promptMessage: string, payload: string) => {
        return { signature: 'mock-signature', success: true };
      },
      simplePrompt: async (config: BiometricPromptConfig) => {
        // 模擬用戶交互
        const success = Math.random() > 0.3;
        if (success) {
          return { success: true, biometryType: 'fingerprint' };
        } else {
          throw new Error('Authentication failed');
        }
      },
    };
  }

  /**
   * 加載 Web 生物識別庫
   */
  private async loadWebBiometricLib(): Promise<BiometricLibrary> {
    // Mock Web 生物識別庫 (WebAuthn)
    return {
      isSensorAvailable: async () => {
        // 檢查 WebAuthn 支持
        if (
          typeof window !== 'undefined' &&
          window.navigator &&
          window.navigator.credentials
        ) {
          return 'fingerprint'; // 假設支持指紋
        }
        return null;
      },
      createKeys: async () => true,
      biometricKeysExist: async () => false,
      deleteKeys: async () => true,
      createSignature: async (promptMessage: string, payload: string) => {
        return { signature: 'mock-web-signature', success: true };
      },
      simplePrompt: async (config: BiometricPromptConfig) => {
        // 模擬 WebAuthn 認證
        const success = Math.random() > 0.4;
        if (success) {
          return { success: true, biometryType: 'fingerprint' };
        } else {
          throw new Error('WebAuthn authentication failed');
        }
      },
    };
  }

  /**
   * 檢測生物識別能力
   */
  async detectBiometricCapabilities(): Promise<BiometricCapability[]> {
    try {
      logger.info('檢測生物識別能力');

      if (!this.isInitialized || !this.biometricLib) {
        await this.initializeBiometricLibrary();
      }

      const capabilities: BiometricCapability[] = [];

      if (this.biometricLib) {
        const availableType = await this.biometricLib.isSensorAvailable();
        const keysExist = await this.biometricLib.biometricKeysExist();

        if (availableType) {
          capabilities.push({
            type: availableType,
            isAvailable: true,
            isEnrolled: keysExist,
            isSupported: true,
            hardwareDetected: true,
            securityLevel: this.getSecurityLevel(availableType),
          });
        }

        // 檢測其他可能的生物識別類型
        const allTypes: BiometricType[] = [
          'fingerprint',
          'faceId',
          'touchId',
          'voiceId',
          'iris',
          'palm',
        ];

        for (const type of allTypes) {
          if (type !== availableType) {
            capabilities.push({
              type,
              isAvailable: false,
              isEnrolled: false,
              isSupported: this.isTypeSupported(type),
              hardwareDetected: false,
              securityLevel: 'weak',
            });
          }
        }
      }

      logger.info('生物識別能力檢測完成:', { capabilities });
      return capabilities;
    } catch (error) {
      logger.error('檢測生物識別能力失敗:', error);
      throw error;
    }
  }

  /**
   * 執行生物識別認證
   */
  async authenticate(
    request: BiometricAuthRequest = {}
  ): Promise<BiometricAuthResult> {
    try {
      logger.info('開始生物識別認證:', { request });

      if (!this.isInitialized || !this.biometricLib) {
        throw new Error('生物識別庫未初始化');
      }

      const config: BiometricPromptConfig = {
        title: '生物識別認證',
        subtitle: request.promptMessage || '請使用您的生物識別進行認證',
        description: '使用指紋、Face ID 或其他生物識別方式進行安全認證',
        negativeButtonText: request.cancelButtonText || '取消',
        confirmationRequired: true,
        deviceCredentialAllowed: !request.disableDeviceFallback,
      };

      const result = await this.biometricLib.simplePrompt(config);

      const authResult: BiometricAuthResult = {
        success: result.success,
        biometricType: result.biometryType,
        authenticationMethod: 'biometric',
        timestamp: new Date(),
      };

      logger.info('生物識別認證成功:', { authResult });
      return authResult;
    } catch (error: unknown) {
      logger.error('生物識別認證失敗:', error);

      const errorCode = this.mapErrorToCode(error);
      const authResult: BiometricAuthResult = {
        success: false,
        errorCode,
        errorMessage: error.message || '認證失敗',
        authenticationMethod: 'biometric',
        timestamp: new Date(),
      };

      return authResult;
    }
  }

  /**
   * 創建生物識別密鑰
   */
  async createBiometricKeys(): Promise<boolean> {
    try {
      logger.info('創建生物識別密鑰');

      if (!this.isInitialized || !this.biometricLib) {
        throw new Error('生物識別庫未初始化');
      }

      const result = await this.biometricLib.createKeys();
      logger.info('生物識別密鑰創建成功');
      return result;
    } catch (error) {
      logger.error('創建生物識別密鑰失敗:', error);
      throw error;
    }
  }

  /**
   * 檢查生物識別密鑰是否存在
   */
  async biometricKeysExist(): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.biometricLib) {
        return false;
      }

      const exists = await this.biometricLib.biometricKeysExist();
      logger.info('生物識別密鑰檢查:', { exists });
      return exists;
    } catch (error) {
      logger.error('檢查生物識別密鑰失敗:', error);
      return false;
    }
  }

  /**
   * 刪除生物識別密鑰
   */
  async deleteBiometricKeys(): Promise<boolean> {
    try {
      logger.info('刪除生物識別密鑰');

      if (!this.isInitialized || !this.biometricLib) {
        throw new Error('生物識別庫未初始化');
      }

      const result = await this.biometricLib.deleteKeys();
      logger.info('生物識別密鑰刪除成功');
      return result;
    } catch (error) {
      logger.error('刪除生物識別密鑰失敗:', error);
      throw error;
    }
  }

  /**
   * 創建生物識別簽名
   */
  async createBiometricSignature(
    payload: string,
    promptMessage?: string
  ): Promise<string> {
    try {
      logger.info('創建生物識別簽名');

      if (!this.isInitialized || !this.biometricLib) {
        throw new Error('生物識別庫未初始化');
      }

      const message = promptMessage || '請進行生物識別認證以創建簽名';
      const result = await this.biometricLib.createSignature(message, payload);

      logger.info('生物識別簽名創建成功');
      return result.signature;
    } catch (error) {
      logger.error('創建生物識別簽名失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取生物識別設置
   */
  async getBiometricSettings(): Promise<BiometricSettings> {
    try {
      logger.info('獲取生物識別設置');

      // 從本地存儲或服務器獲取設置
      const settings: BiometricSettings = {
        isEnabled: true,
        enabledTypes: ['fingerprint', 'faceId'],
        fallbackToDeviceCredential: true,
        requireConfirmation: true,
        invalidateOnEnrollment: false,
        maxRetryAttempts: 3,
        lockoutDuration: 30,
      };

      logger.info('生物識別設置獲取成功:', { settings });
      return settings;
    } catch (error) {
      logger.error('獲取生物識別設置失敗:', error);
      throw error;
    }
  }

  /**
   * 更新生物識別設置
   */
  async updateBiometricSettings(
    settings: Partial<BiometricSettings>
  ): Promise<BiometricSettings> {
    try {
      logger.info('更新生物識別設置:', settings);

      // 獲取當前設置
      const currentSettings = await this.getBiometricSettings();

      // 合併設置
      const updatedSettings: BiometricSettings = {
        ...currentSettings,
        ...settings,
      };

      // 保存到本地存儲或服務器
      // await this.saveBiometricSettings(updatedSettings);

      logger.info('生物識別設置更新成功:', { updatedSettings });
      return updatedSettings;
    } catch (error) {
      logger.error('更新生物識別設置失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取註冊狀態
   */
  async getEnrollmentStatus(): Promise<BiometricEnrollmentStatus> {
    try {
      logger.info('獲取生物識別註冊狀態');

      const capabilities = await this.detectBiometricCapabilities();
      const enrolledTypes = capabilities
        .filter(cap => cap.isEnrolled)
        .map(cap => cap.type);

      const status: BiometricEnrollmentStatus = {
        hasEnrolledBiometrics: enrolledTypes.length > 0,
        enrolledTypes,
        canEnroll: capabilities.some(cap => cap.isAvailable && !cap.isEnrolled),
        enrollmentDate: enrolledTypes.length > 0 ? new Date() : undefined,
        lastUsedDate: undefined,
      };

      logger.info('生物識別註冊狀態獲取成功:', { status });
      return status;
    } catch (error) {
      logger.error('獲取生物識別註冊狀態失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取安全信息
   */
  async getSecurityInfo(): Promise<BiometricSecurityInfo> {
    try {
      logger.info('獲取生物識別安全信息');

      const keysExist = await this.biometricKeysExist();

      const securityInfo: BiometricSecurityInfo = {
        keyAlias: 'CardStrategy_Biometric_Key',
        keyGenerated: keysExist,
        keyInvalidated: false,
        biometricChanged: false,
        securityLevel: 'strong',
        attestationSupported: Platform.OS === 'android',
      };

      logger.info('生物識別安全信息獲取成功:', { securityInfo });
      return securityInfo;
    } catch (error) {
      logger.error('獲取生物識別安全信息失敗:', error);
      throw error;
    }
  }

  /**
   * 檢查生物識別是否可用
   */
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const capabilities = await this.detectBiometricCapabilities();
      return capabilities.some(cap => cap.isAvailable && cap.isEnrolled);
    } catch (error) {
      logger.error('檢查生物識別可用性失敗:', error);
      return false;
    }
  }

  /**
   * 獲取安全級別
   */
  private getSecurityLevel(
    biometricType: BiometricType
  ): 'weak' | 'strong' | 'class3' {
    switch (biometricType) {
      case 'faceId':
      case 'iris':
        return 'class3';
      case 'fingerprint':
      case 'touchId':
        return 'strong';
      case 'voiceId':
      case 'palm':
        return 'weak';
      default:
        return 'weak';
    }
  }

  /**
   * 檢查類型是否支持
   */
  private isTypeSupported(biometricType: BiometricType): boolean {
    switch (Platform.OS) {
      case 'ios':
        return ['faceId', 'touchId'].includes(biometricType);
      case 'android':
        return ['fingerprint', 'faceId'].includes(biometricType);
      default:
        return ['fingerprint'].includes(biometricType);
    }
  }

  /**
   * 映射錯誤到錯誤代碼
   */
  private mapErrorToCode(error: unknown): BiometricErrorCode {
    const message = error.message?.toLowerCase() || '';

    if (message.includes('cancel')) {
      return 'user_cancel';
    } else if (message.includes('fallback')) {
      return 'user_fallback';
    } else if (message.includes('timeout')) {
      return 'timeout';
    } else if (
      message.includes('failed') ||
      message.includes('authentication')
    ) {
      return 'authentication_failed';
    } else if (message.includes('not available')) {
      return 'biometry_not_available';
    } else if (message.includes('not enrolled')) {
      return 'biometry_not_enrolled';
    } else if (message.includes('lockout')) {
      return 'biometry_lockout';
    } else {
      return 'unknown_error';
    }
  }
}

// 導出單例實例
export const biometricAuthService = BiometricAuthService.getInstance();

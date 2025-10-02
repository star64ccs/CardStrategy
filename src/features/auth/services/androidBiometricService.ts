import { Platform } from 'react-native';

import type {
  BiometricAuthRequest,
  BiometricAuthResult,
  BiometricCapability,
  BiometricErrorCode,
  BiometricSecurityInfo,
  BiometricType,
} from '../../../core/types';
import { logger } from '../../../core/utils/logger';

// Android Specific的生物識別Interface
interface AndroidBiometricLibrary {
  // 設備能力檢測
  isSensorAvailable(): Promise<BiometricType | null>;
  getBiometryType(): Promise<'fingerprint' | 'face' | 'iris' | null>;
  isDeviceSecure(): Promise<boolean>;

  // 密鑰Manage
  createKeys(options?: AndroidKeyOptions): Promise<boolean>;
  biometricKeysExist(): Promise<boolean>;
  deleteKeys(): Promise<boolean>;

  // AuthenticateOperation
  createSignature(
    promptMessage: string,
    payload: string
  ): Promise<AndroidSignatureResult>;
  simplePrompt(config: AndroidPromptConfig): Promise<AndroidPromptResult>;

  // 高級功能
  invalidateKeys(): Promise<boolean>;
  getSecurityLevel(): Promise<'weak' | 'strong' | 'class3'>;
  isAttestationSupported(): Promise<boolean>;
}

interface AndroidKeyOptions {
  keySize?: number;
  keyType?: string;
  blockMode?: string;
  padding?: string;
  digest?: string;
  userAuthenticationRequired?: boolean;
  userAuthenticationValidityDurationSeconds?: number;
  invalidatedByBiometricEnrollment?: boolean;
}

interface AndroidSignatureResult {
  signature: string;
  success: boolean;
  error?: string;
}

interface AndroidPromptResult {
  success: boolean;
  biometryType?: 'fingerprint' | 'face' | 'iris';
  error?: string;
  errorCode?: string;
}

interface AndroidPromptConfig {
  title: string;
  subtitle?: string;
  description?: string;
  negativeButtonText: string;
  confirmationRequired?: boolean;
  deviceCredentialAllowed?: boolean;
  allowedAuthenticators?: number[];
}

/**
 * Android 專用生物識別Service
 * 深度集成指紋/面部識別功能
 */
export class AndroidBiometricService {
  private static instance: AndroidBiometricService;
  private biometricLib: AndroidBiometricLibrary | null = null;
  private isInitialized = false;
  private deviceCapabilities: BiometricCapability[] = [];
  private securityInfo: BiometricSecurityInfo | null = null;

  private constructor() {
    this.initializeAndroidBiometricLibrary();
  }

  static getInstance(): AndroidBiometricService {
    if (!AndroidBiometricService.instance) {
      AndroidBiometricService.instance = new AndroidBiometricService();
    }
    return AndroidBiometricService.instance;
  }

  /**
   * Initialize Android 生物識別Library
   */
  private async initializeAndroidBiometricLibrary(): Promise<void> {
    try {
      if (Platform.OS !== 'android') {
        throw new Error('此Service僅支持 Android 平台');
      }

      this.biometricLib = await this.loadAndroidBiometricLibrary();
      await this.detectDeviceCapabilities();
      await this.initializeSecurityInfo();

      this.isInitialized = true;
      logger.info('Android 生物識別ServiceInitializeSuccess');
    } catch (error) {
      logger.error('Android 生物識別ServiceInitializeFailed:', error);
      this.isInitialized = false;
    }
  }

  /**
   * 加載 Android 生物識別Library
   */
  private async loadAndroidBiometricLibrary(): Promise<AndroidBiometricLibrary> {
    // 在實際Apply中，這裡會ImportTrue實的 Android 生物識別Library
    // 例如：react-native-biometrics, react-native-fingerprint-scanner 等

    return {
      isSensorAvailable: async () => {
        // 模擬檢測 Android 設備的生物識別能力
        const _hasFingerprint = Math.random() > 0.2;
        const _hasFace = Math.random() > 0.6;
        const _hasIris = Math.random() > 0.8;

        if (hasIris) return 'iris';
        if (hasFace) return 'faceId';
        if (hasFingerprint) return 'fingerprint';
        return null;
      },

      getBiometryType: async () => {
        // 模擬GetConcrete的生物識別Class型
        const _hasFace = Math.random() > 0.6;
        const _hasIris = Math.random() > 0.8;

        if (hasIris) return 'iris';
        if (hasFace) return 'face';
        return 'fingerprint';
      },

      isDeviceSecure: async () => {
        // 模擬Check設備YesNo安全
        return Math.random() > 0.1;
      },

      createKeys: async (options?: AndroidKeyOptions) => {
        // 模擬Create密鑰
        logger.info(
          '創建 Android 生物識別密鑰',
          options as Record<string, unknown>
        );
        return true;
      },

      biometricKeysExist: async () => {
        // 模擬Check密鑰YesNo存在
        return Math.random() > 0.5;
      },

      deleteKeys: async () => {
        // 模擬Delete密鑰
        logger.info('刪除 Android 生物識別密鑰');
        return true;
      },

      createSignature: async (promptMessage: string, payload: string) => {
        // 模擬CreateSign
        const _success = Math.random() > 0.3;
        if (success) {
          return {
            signature: `android-signature-${Date.now()}`,
            success: true,
          };
        } else {
          return {
            signature: '',
            success: false,
            error: 'Authentication failed',
          };
        }
      },

      simplePrompt: async (config: AndroidPromptConfig) => {
        // 模擬生物識別提示
        const _success = Math.random() > 0.3;
        if (success) {
          const _biometryType =
            Math.random() > 0.7
              ? 'face'
              : Math.random() > 0.5
                ? 'iris'
                : 'fingerprint';
          return {
            success: true,
            biometryType,
          };
        } else {
          return {
            success: false,
            error: 'User canceled',
            errorCode: 'user_cancel',
          };
        }
      },

      invalidateKeys: async () => {
        // 模擬使密鑰失效
        logger.info('使 Android 生物識別密鑰失效');
        return true;
      },

      getSecurityLevel: async () => {
        // 模擬Get安全級別
        const levels: ('weak' | 'strong' | 'class3')[] = [
          'weak',
          'strong',
          'class3',
        ];
        return levels[Math.floor(Math.random() * levels.length)];
      },

      isAttestationSupported: async () => {
        // 模擬CheckYesNoSupportAuthenticate
        return Math.random() > 0.5;
      },
    };
  }

  /**
   * 檢測設備能力
   */
  private async detectDeviceCapabilities(): Promise<void> {
    try {
      if (!this.biometricLib) return;

      const _availableType = await this.biometricLib.isSensorAvailable();
      const _biometryType = await this.biometricLib.getBiometryType();
      const _isDeviceSecure = await this.biometricLib.isDeviceSecure();
      const _keysExist = await this.biometricLib.biometricKeysExist();
      const _securityLevel = await this.biometricLib.getSecurityLevel();
      const _attestationSupported =
        await this.biometricLib.isAttestationSupported();

      this.deviceCapabilities = [];

      if (availableType) {
        this.deviceCapabilities.push({
          type: availableType,
          isAvailable: true,
          isEnrolled: keysExist,
          isSupported: true,
          hardwareDetected: true,
          securityLevel,
        });
      }

      // Add其他可能的生物識別Class型
      const allTypes: BiometricType[] = [
        'faceId',
        'touchId',
        'fingerprint',
        'iris',
        'voiceId',
        'palm',
      ];
      allTypes.forEach(type => {
        if (type !== availableType) {
          this.deviceCapabilities.push({
            type,
            isAvailable: false,
            isEnrolled: false,
            isSupported: false,
            hardwareDetected: false,
            securityLevel: 'weak',
          });
        }
      });

      logger.info('Android 設備能力檢測完成', {
        availableType,
        biometryType,
        isDeviceSecure,
        capabilities: this.deviceCapabilities,
      });
    } catch (error) {
      logger.error('檢測 Android 設備能力Failed:', error);
    }
  }

  /**
   * Initialize安全Information
   */
  private async initializeSecurityInfo(): Promise<void> {
    try {
      if (!this.biometricLib) return;

      const _keyGenerated = await this.biometricLib.biometricKeysExist();
      const _securityLevel = await this.biometricLib.getSecurityLevel();
      const _attestationSupported =
        await this.biometricLib.isAttestationSupported();

      this.securityInfo = {
        keyAlias: 'android_biometric_key',
        keyGenerated,
        keyInvalidated: false,
        biometricChanged: false,
        securityLevel,
        attestationSupported,
      };

      logger.info(
        'Android 安全信息初始化完成',
        this.securityInfo as unknown as Record<string, unknown>
      );
    } catch (error) {
      logger.error('Initialize Android 安全信息Failed:', error);
    }
  }

  /**
   * 檢測生物識別能力
   */
  public async detectCapabilities(): Promise<BiometricCapability[]> {
    if (!this.isInitialized) {
      throw new Error('Android 生物識別Service未Initialize');
    }

    return this.deviceCapabilities;
  }

  /**
   * 執Row生物識別Authenticate
   */
  public async authenticate(
    request: BiometricAuthRequest = {}
  ): Promise<BiometricAuthResult> {
    if (!this.isInitialized || !this.biometricLib) {
      throw new Error('Android 生物識別Service未Initialize');
    }

    try {
      const _startTime = Date.now();

      // Check設備能力
      const _capabilities = await this.detectCapabilities();
      const _availableCapability = capabilities.find(
        cap => cap.isAvailable && cap.isEnrolled
      );

      if (!availableCapability) {
        return {
          success: false,
          errorCode: 'biometry_not_enrolled',
          errorMessage: '未設置生物識別或設備不支持',
          timestamp: new Date(),
        };
      }

      // 準備AuthenticateConfigure
      const promptConfig: AndroidPromptConfig = {
        title: request.promptMessage || '請進行生物識別認證',
        subtitle: '使用指紋、面部或虹膜識別登錄',
        description: '請將手指放在指紋傳感器上或看向設備進行面部識別',
        negativeButtonText: request.cancelButtonText || '取消',
        confirmationRequired: true,
        deviceCredentialAllowed: !request.disableDeviceFallback,
        allowedAuthenticators: [1, 2, 4], // BIOMETRIC_STRONG, BIOMETRIC_WEAK, DEVICE_CREDENTIAL
      };

      // 執RowAuthenticate
      const _result = await this.biometricLib.simplePrompt(promptConfig);
      const _processingTime = Date.now() - startTime;

      if (result.success) {
        logger.info('Android 生物識別認證Success', {
          biometryType: result.biometryType,
          processingTime,
        });

        return {
          success: true,
          biometricType: this.mapAndroidBiometryType(result.biometryType),
          authenticationMethod: 'biometric',
          timestamp: new Date(),
        };
      } else {
        logger.warn('Android 生物識別認證Failed', {
          error: result.error,
          errorCode: result.errorCode,
        });

        return {
          success: false,
          errorCode: this.mapAndroidErrorCode(result.errorCode),
          errorMessage: result.error || '認證Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Android 生物識別認證異常:', error);
      return {
        success: false,
        errorCode: 'unknown_error',
        errorMessage: error instanceof Error ? error.message : '未知Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * CreateSignAuthenticate
   */
  public async createSignature(
    promptMessage: string,
    payload: string
  ): Promise<{ signature: string; success: boolean }> {
    if (!this.isInitialized || !this.biometricLib) {
      throw new Error('Android 生物識別Service未Initialize');
    }

    try {
      const _result = await this.biometricLib.createSignature(
        promptMessage,
        payload
      );

      if (result.success) {
        logger.info('Android 生物識別簽名CreateSuccess');
      } else {
        logger.warn('Android 生物識別簽名CreateFailed', { error: result.error });
      }

      return result;
    } catch (error) {
      logger.error('Android 生物識別簽名創建異常:', error);
      return { signature: '', success: false };
    }
  }

  /**
   * Get安全Information
   */
  public getSecurityInfo(): BiometricSecurityInfo | null {
    return this.securityInfo;
  }

  /**
   * 使密鑰失效
   */
  public async invalidateKeys(): Promise<boolean> {
    if (!this.isInitialized || !this.biometricLib) {
      throw new Error('Android 生物識別Service未Initialize');
    }

    try {
      const _result = await this.biometricLib.invalidateKeys();
      if (result && this.securityInfo) {
        this.securityInfo.keyInvalidated = true;
      }

      logger.info('Android 生物識別密鑰已失效');
      return result;
    } catch (error) {
      logger.error('使 Android 生物識別密鑰失效Failed:', error);
      return false;
    }
  }

  /**
   * ReInitialize密鑰
   */
  public async reinitializeKeys(): Promise<boolean> {
    if (!this.isInitialized || !this.biometricLib) {
      throw new Error('Android 生物識別Service未Initialize');
    }

    try {
      // Delete舊密鑰
      await this.biometricLib.deleteKeys();

      // Create新密鑰
      const _result = await this.biometricLib.createKeys();

      if (result) {
        await this.initializeSecurityInfo();
        logger.info('Android 生物識別密鑰重新InitializeSuccess');
      }

      return result;
    } catch (error) {
      logger.error('重新Initialize Android 生物識別密鑰Failed:', error);
      return false;
    }
  }

  /**
   * Map Android 生物識別Class型
   */
  private mapAndroidBiometryType(androidType?: string): BiometricType {
    switch (androidType) {
      case 'fingerprint':
        return 'fingerprint';
      case 'face':
        return 'faceId';
      case 'iris':
        return 'iris';
      default:
        return 'fingerprint';
    }
  }

  /**
   * Map Android Error代碼
   */
  private mapAndroidErrorCode(androidErrorCode?: string): BiometricErrorCode {
    switch (androidErrorCode) {
      case 'user_cancel':
        return 'user_cancel';
      case 'user_fallback':
        return 'user_fallback';
      case 'system_cancel':
        return 'system_cancel';
      case 'timeout':
        return 'timeout';
      case 'unable_to_process':
        return 'unable_to_process';
      case 'authentication_failed':
        return 'authentication_failed';
      case 'biometry_not_available':
        return 'biometry_not_available';
      case 'biometry_not_enrolled':
        return 'biometry_not_enrolled';
      case 'biometry_lockout':
        return 'biometry_lockout';
      case 'biometry_lockout_permanent':
        return 'biometry_lockout_permanent';
      case 'device_not_secure':
        return 'device_not_secure';
      case 'invalid_context':
        return 'invalid_context';
      case 'app_cancel':
        return 'app_cancel';
      default:
        return 'unknown_error';
    }
  }

  /**
   * CheckServiceStatus
   */
  public isServiceReady(): boolean {
    return this.isInitialized && this.biometricLib !== null;
  }

  /**
   * GetServiceInformation
   */
  public getServiceInfo() {
    return {
      isInitialized: this.isInitialized,
      isServiceReady: this.isServiceReady(),
      platform: Platform.OS,
      capabilities: this.deviceCapabilities,
      securityInfo: this.securityInfo,
    };
  }
}

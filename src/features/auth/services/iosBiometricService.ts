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

// iOS Specific的生物識別Interface
interface IOSBiometricLibrary {
  // 設備能力檢測
  isSensorAvailable(): Promise<BiometricType | null>;
  getBiometryType(): Promise<'FaceID' | 'TouchID' | null>;
  isDeviceSecure(): Promise<boolean>;

  // 密鑰Manage
  createKeys(options?: IOSKeyOptions): Promise<boolean>;
  biometricKeysExist(): Promise<boolean>;
  deleteKeys(): Promise<boolean>;

  // AuthenticateOperation
  createSignature(
    promptMessage: string,
    payload: string
  ): Promise<IOSSignatureResult>;
  simplePrompt(config: IOSPromptConfig): Promise<IOSPromptResult>;

  // 高級功能
  invalidateKeys(): Promise<boolean>;
  getSecurityLevel(): Promise<'weak' | 'strong' | 'class3'>;
  isAttestationSupported(): Promise<boolean>;
}

interface IOSKeyOptions {
  accessControl?: string;
  accessible?: string;
  authenticationType?: string;
  authenticationPolicy?: string;
  keySize?: number;
  keyType?: string;
}

interface IOSSignatureResult {
  signature: string;
  success: boolean;
  error?: string;
}

interface IOSPromptResult {
  success: boolean;
  biometryType?: 'FaceID' | 'TouchID';
  error?: string;
  errorCode?: string;
}

interface IOSPromptConfig {
  title: string;
  subtitle?: string;
  description?: string;
  cancelButtonText: string;
  fallbackButtonText?: string;
  confirmationRequired?: boolean;
  deviceCredentialAllowed?: boolean;
}

/**
 * iOS 專用生物識別Service
 * 深度集成 Face ID / Touch ID 功能
 */
export class IOSBiometricService {
  private static instance: IOSBiometricService;
  private biometricLib: IOSBiometricLibrary | null = null;
  private isInitialized = false;
  private deviceCapabilities: BiometricCapability[] = [];
  private securityInfo: BiometricSecurityInfo | null = null;

  private constructor() {
    this.initializeIOSBiometricLibrary();
  }

  static getInstance(): IOSBiometricService {
    if (!IOSBiometricService.instance) {
      IOSBiometricService.instance = new IOSBiometricService();
    }
    return IOSBiometricService.instance;
  }

  /**
   * Initialize iOS 生物識別Library
   */
  private async initializeIOSBiometricLibrary(): Promise<void> {
    try {
      if (Platform.OS !== 'ios') {
        throw new Error('此Service僅支持 iOS 平台');
      }

      this.biometricLib = await this.loadIOSBiometricLibrary();
      await this.detectDeviceCapabilities();
      await this.initializeSecurityInfo();

      this.isInitialized = true;
      logger.info('iOS 生物識別ServiceInitializeSuccess');
    } catch (error) {
      logger.error('iOS 生物識別ServiceInitializeFailed:', error);
      this.isInitialized = false;
    }
  }

  /**
   * 加載 iOS 生物識別Library
   */
  private async loadIOSBiometricLibrary(): Promise<IOSBiometricLibrary> {
    // 在實際Apply中，這裡會ImportTrue實的 iOS 生物識別Library
    // 例如：react-native-biometrics, react-native-touch-id 等

    return {
      isSensorAvailable: async () => {
        // 模擬檢測 iOS 設備的生物識別能力
        const _hasTouch = Math.random() > 0.3;
        const _hasFace = Math.random() > 0.7;

        if (hasFace) return 'faceId';
        if (hasTouch) return 'touchId';
        return null;
      },

      getBiometryType: async () => {
        // 模擬GetConcrete的生物識別Class型
        const _hasFace = Math.random() > 0.7;
        return hasFace ? 'FaceID' : 'TouchID';
      },

      isDeviceSecure: async () => {
        // 模擬Check設備YesNo安全
        return Math.random() > 0.1;
      },

      createKeys: async (options?: IOSKeyOptions) => {
        // 模擬Create密鑰
        logger.info(
          '創建 iOS 生物識別密鑰',
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
        logger.info('刪除 iOS 生物識別密鑰');
        return true;
      },

      createSignature: async (promptMessage: string, payload: string) => {
        // 模擬CreateSign
        const _success = Math.random() > 0.3;
        if (success) {
          return {
            signature: `ios-signature-${Date.now()}`,
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

      simplePrompt: async (config: IOSPromptConfig) => {
        // 模擬生物識別提示
        const _success = Math.random() > 0.3;
        if (success) {
          const _biometryType = Math.random() > 0.7 ? 'FaceID' : 'TouchID';
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
        logger.info('使 iOS 生物識別密鑰失效');
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

      logger.info('iOS 設備能力檢測完成', {
        availableType,
        biometryType,
        isDeviceSecure,
        capabilities: this.deviceCapabilities,
      });
    } catch (error) {
      logger.error('檢測 iOS 設備能力Failed:', error);
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
        keyAlias: 'ios_biometric_key',
        keyGenerated,
        keyInvalidated: false,
        biometricChanged: false,
        securityLevel,
        attestationSupported,
      };

      logger.info(
        'iOS 安全信息初始化完成',
        this.securityInfo as unknown as Record<string, unknown>
      );
    } catch (error) {
      logger.error('Initialize iOS 安全信息Failed:', error);
    }
  }

  /**
   * 檢測生物識別能力
   */
  public async detectCapabilities(): Promise<BiometricCapability[]> {
    if (!this.isInitialized) {
      throw new Error('iOS 生物識別Service未Initialize');
    }

    return this.deviceCapabilities;
  }

  /**
   * 執Row生物識別Authenticate
   */
  public async authenticate(
    request: BiometricAuthRequest = {}
  ): Promise<BiometricAuthResult> {
    try {
      if (!this.isInitialized || !this.biometricLib) {
        throw new Error('iOS 生物識別Service未Initialize');
      }

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
      const promptConfig: IOSPromptConfig = {
        title: request.promptMessage || '請進行生物識別認證',
        subtitle: '使用 Face ID 或 Touch ID 登錄',
        description: '請將手指放在 Touch ID 上或看向設備進行 Face ID 認證',
        cancelButtonText: request.cancelButtonText || '取消',
        fallbackButtonText: request.fallbackButtonText || '使用密碼',
        confirmationRequired: true,
        deviceCredentialAllowed: !request.disableDeviceFallback,
      };

      // 執RowAuthenticate
      const _result = await this.biometricLib.simplePrompt(promptConfig);
      const _processingTime = Date.now() - startTime;

      if (result.success) {
        logger.info('iOS 生物識別認證Success', {
          biometryType: result.biometryType,
          processingTime,
        });

        return {
          success: true,
          biometricType:
            result.biometryType === 'FaceID' ? 'faceId' : 'touchId',
          authenticationMethod: 'biometric',
          timestamp: new Date(),
        };
      } else {
        logger.warn('iOS 生物識別認證Failed', {
          error: result.error,
          errorCode: result.errorCode,
        });

        return {
          success: false,
          errorCode: this.mapIOSErrorCode(result.errorCode),
          errorMessage: result.error || '認證Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('iOS 生物識別認證異常:', error);
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
    try {
      if (!this.isInitialized || !this.biometricLib) {
        throw new Error('iOS 生物識別Service未Initialize');
      }

      const _result = await this.biometricLib.createSignature(
        promptMessage,
        payload
      );

      if (result.success) {
        logger.info('iOS 生物識別簽名CreateSuccess');
      } else {
        logger.warn('iOS 生物識別簽名CreateFailed', { error: result.error });
      }

      return result;
    } catch (error) {
      logger.error('iOS 生物識別簽名創建異常:', error);
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
    try {
      if (!this.isInitialized || !this.biometricLib) {
        throw new Error('iOS 生物識別Service未Initialize');
      }

      const _result = await this.biometricLib.invalidateKeys();
      if (result && this.securityInfo) {
        this.securityInfo.keyInvalidated = true;
      }

      logger.info('iOS 生物識別密鑰已失效');
      return result;
    } catch (error) {
      logger.error('使 iOS 生物識別密鑰失效Failed:', error);
      return false;
    }
  }

  /**
   * ReInitialize密鑰
   */
  public async reinitializeKeys(): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.biometricLib) {
        throw new Error('iOS 生物識別Service未Initialize');
      }

      // Delete舊密鑰
      await this.biometricLib.deleteKeys();

      // Create新密鑰
      const _result = await this.biometricLib.createKeys();

      if (result) {
        await this.initializeSecurityInfo();
        logger.info('iOS 生物識別密鑰重新InitializeSuccess');
      }

      return result;
    } catch (error) {
      logger.error('重新Initialize iOS 生物識別密鑰Failed:', error);
      return false;
    }
  }

  /**
   * Map iOS Error代碼
   */
  private mapIOSErrorCode(iosErrorCode?: string): BiometricErrorCode {
    switch (iosErrorCode) {
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

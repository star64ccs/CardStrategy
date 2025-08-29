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

// Android 特定的生物識別接口
interface AndroidBiometricLibrary {
  // 設備能力檢測
  isSensorAvailable(): Promise<BiometricType | null>;
  getBiometryType(): Promise<'fingerprint' | 'face' | 'iris' | null>;
  isDeviceSecure(): Promise<boolean>;

  // 密鑰管理
  createKeys(options?: AndroidKeyOptions): Promise<boolean>;
  biometricKeysExist(): Promise<boolean>;
  deleteKeys(): Promise<boolean>;

  // 認證操作
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
 * Android 專用生物識別服務
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
   * 初始化 Android 生物識別庫
   */
  private async initializeAndroidBiometricLibrary(): Promise<void> {
    try {
      if (Platform.OS !== 'android') {
        throw new Error('此服務僅支持 Android 平台');
      }

      this.biometricLib = await this.loadAndroidBiometricLibrary();
      await this.detectDeviceCapabilities();
      await this.initializeSecurityInfo();

      this.isInitialized = true;
      logger.info('Android 生物識別服務初始化成功');
    } catch (error) {
      logger.error('Android 生物識別服務初始化失敗:', error);
      this.isInitialized = false;
    }
  }

  /**
   * 加載 Android 生物識別庫
   */
  private async loadAndroidBiometricLibrary(): Promise<AndroidBiometricLibrary> {
    // 在實際應用中，這裡會導入真實的 Android 生物識別庫
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
        // 模擬獲取具體的生物識別類型
        const _hasFace = Math.random() > 0.6;
        const _hasIris = Math.random() > 0.8;

        if (hasIris) return 'iris';
        if (hasFace) return 'face';
        return 'fingerprint';
      },

      isDeviceSecure: async () => {
        // 模擬檢查設備是否安全
        return Math.random() > 0.1;
      },

      createKeys: async (options?: AndroidKeyOptions) => {
        // 模擬創建密鑰
        logger.info(
          '創建 Android 生物識別密鑰',
          options as Record<string, unknown>
        );
        return true;
      },

      biometricKeysExist: async () => {
        // 模擬檢查密鑰是否存在
        return Math.random() > 0.5;
      },

      deleteKeys: async () => {
        // 模擬刪除密鑰
        logger.info('刪除 Android 生物識別密鑰');
        return true;
      },

      createSignature: async (promptMessage: string, payload: string) => {
        // 模擬創建簽名
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
        // 模擬獲取安全級別
        const levels: ('weak' | 'strong' | 'class3')[] = [
          'weak',
          'strong',
          'class3',
        ];
        return levels[Math.floor(Math.random() * levels.length)];
      },

      isAttestationSupported: async () => {
        // 模擬檢查是否支持認證
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

      // 添加其他可能的生物識別類型
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
      logger.error('檢測 Android 設備能力失敗:', error);
    }
  }

  /**
   * 初始化安全信息
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
      logger.error('初始化 Android 安全信息失敗:', error);
    }
  }

  /**
   * 檢測生物識別能力
   */
  public async detectCapabilities(): Promise<BiometricCapability[]> {
    if (!this.isInitialized) {
      throw new Error('Android 生物識別服務未初始化');
    }

    return this.deviceCapabilities;
  }

  /**
   * 執行生物識別認證
   */
  public async authenticate(
    request: BiometricAuthRequest = {}
  ): Promise<BiometricAuthResult> {
    if (!this.isInitialized || !this.biometricLib) {
      throw new Error('Android 生物識別服務未初始化');
    }

    try {
      const _startTime = Date.now();

      // 檢查設備能力
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

      // 準備認證配置
      const promptConfig: AndroidPromptConfig = {
        title: request.promptMessage || '請進行生物識別認證',
        subtitle: '使用指紋、面部或虹膜識別登錄',
        description: '請將手指放在指紋傳感器上或看向設備進行面部識別',
        negativeButtonText: request.cancelButtonText || '取消',
        confirmationRequired: true,
        deviceCredentialAllowed: !request.disableDeviceFallback,
        allowedAuthenticators: [1, 2, 4], // BIOMETRIC_STRONG, BIOMETRIC_WEAK, DEVICE_CREDENTIAL
      };

      // 執行認證
      const _result = await this.biometricLib.simplePrompt(promptConfig);
      const _processingTime = Date.now() - startTime;

      if (result.success) {
        logger.info('Android 生物識別認證成功', {
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
        logger.warn('Android 生物識別認證失敗', {
          error: result.error,
          errorCode: result.errorCode,
        });

        return {
          success: false,
          errorCode: this.mapAndroidErrorCode(result.errorCode),
          errorMessage: result.error || '認證失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Android 生物識別認證異常:', error);
      return {
        success: false,
        errorCode: 'unknown_error',
        errorMessage: error instanceof Error ? error.message : '未知錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 創建簽名認證
   */
  public async createSignature(
    promptMessage: string,
    payload: string
  ): Promise<{ signature: string; success: boolean }> {
    if (!this.isInitialized || !this.biometricLib) {
      throw new Error('Android 生物識別服務未初始化');
    }

    try {
      const _result = await this.biometricLib.createSignature(
        promptMessage,
        payload
      );

      if (result.success) {
        logger.info('Android 生物識別簽名創建成功');
      } else {
        logger.warn('Android 生物識別簽名創建失敗', { error: result.error });
      }

      return result;
    } catch (error) {
      logger.error('Android 生物識別簽名創建異常:', error);
      return { signature: '', success: false };
    }
  }

  /**
   * 獲取安全信息
   */
  public getSecurityInfo(): BiometricSecurityInfo | null {
    return this.securityInfo;
  }

  /**
   * 使密鑰失效
   */
  public async invalidateKeys(): Promise<boolean> {
    if (!this.isInitialized || !this.biometricLib) {
      throw new Error('Android 生物識別服務未初始化');
    }

    try {
      const _result = await this.biometricLib.invalidateKeys();
      if (result && this.securityInfo) {
        this.securityInfo.keyInvalidated = true;
      }

      logger.info('Android 生物識別密鑰已失效');
      return result;
    } catch (error) {
      logger.error('使 Android 生物識別密鑰失效失敗:', error);
      return false;
    }
  }

  /**
   * 重新初始化密鑰
   */
  public async reinitializeKeys(): Promise<boolean> {
    if (!this.isInitialized || !this.biometricLib) {
      throw new Error('Android 生物識別服務未初始化');
    }

    try {
      // 刪除舊密鑰
      await this.biometricLib.deleteKeys();

      // 創建新密鑰
      const _result = await this.biometricLib.createKeys();

      if (result) {
        await this.initializeSecurityInfo();
        logger.info('Android 生物識別密鑰重新初始化成功');
      }

      return result;
    } catch (error) {
      logger.error('重新初始化 Android 生物識別密鑰失敗:', error);
      return false;
    }
  }

  /**
   * 映射 Android 生物識別類型
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
   * 映射 Android 錯誤代碼
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
   * 檢查服務狀態
   */
  public isServiceReady(): boolean {
    return this.isInitialized && this.biometricLib !== null;
  }

  /**
   * 獲取服務信息
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

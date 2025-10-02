/**
 * 第三方ServiceConfigure
 * 統一Manage所有第三方Service的ConfigureInformation
 */

// 環境VariableClass型定義
interface EnvironmentConfig {
  // OpenAI Configure
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  OPENAI_MAX_TOKENS: number;
  OPENAI_TEMPERATURE: number;

  // Google Cloud Configure
  GOOGLE_CLOUD_PROJECT_ID: string;
  GOOGLE_CLOUD_PRIVATE_KEY: string;
  GOOGLE_CLOUD_CLIENT_EMAIL: string;
  GOOGLE_VISION_API_KEY: string;

  // Google Gemini Configure
  GOOGLE_GEMINI_API_KEY: string;
  GOOGLE_GEMINI_MODEL: string;

  // Cohere Configure
  COHERE_API_KEY: string;
  COHERE_MODEL: string;

  // Replicate Configure
  REPLICATE_API_TOKEN: string;

  // Cloudinary Configure
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;

  // AWS S3 Configure
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  AWS_S3_BUCKET: string;

  // Cloudflare Configure
  CLOUDFLARE_ZONE_ID: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_API_TOKEN: string;

  // 通信ServiceConfigure
  SENDGRID_API_KEY: string;
  SENDGRID_FROM_EMAIL: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;
  GMAIL_SMTP_USER: string;
  GMAIL_SMTP_PASS: string;

  // AnalysisServiceConfigure
  SEGMENT_WRITE_KEY: string;
  MIXEL_PROJECT_TOKEN: string;
  MIXEL_API_SECRET: string;

  // ApplyConfigure
  NODE_ENV: string;
  API_BASE_URL: string;
}

// DefaultConfigureValue
const DEFAULT_CONFIG: Partial<EnvironmentConfig> = {
  OPENAI_MODEL: 'gpt-3.5-turbo',
  OPENAI_MAX_TOKENS: 2000,
  OPENAI_TEMPERATURE: 0.7,
  GOOGLE_GEMINI_MODEL: 'gemini-pro',
  COHERE_MODEL: 'embed-multilingual-v2.0',
  AWS_REGION: 'us-east-1',
  NODE_ENV: 'development',
};

/**
 * ServiceConfigureClass
 * 提供統一的ConfigureManage和Verify
 */
export class ServiceConfig {
  private static instance: ServiceConfig;
  private config: Partial<EnvironmentConfig> = {};
  private isInitialized = false;

  private constructor() {}

  static getInstance(): ServiceConfig {
    if (!ServiceConfig.instance) {
      ServiceConfig.instance = new ServiceConfig();
    }
    return ServiceConfig.instance;
  }

  /**
   * InitializeConfigure
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 從環境Variable加載Configure
      this.loadFromEnvironment();

      // 從LocalStorage加載Configure（用於On發環境）
      await this.loadFromStorage();

      // VerifyRequired的Configure
      this.validateRequiredConfig();

      this.isInitialized = true;
      console.log('ServiceConfigureInitialize完成');
    } catch (error) {
      console.error('ServiceConfigureInitializeFailed:', error);
      throw error;
    }
  }

  /**
   * 從環境Variable加載Configure
   */
  private loadFromEnvironment(): void {
    const _env = process.env as any;

    // OpenAI Configure
    if (env.OPENAI_API_KEY) {
      this.config.OPENAI_API_KEY = env.OPENAI_API_KEY;
    }
    if (env.OPENAI_MODEL) {
      this.config.OPENAI_MODEL = env.OPENAI_MODEL;
    }

    // Google Cloud Configure
    if (env.GOOGLE_CLOUD_PROJECT_ID) {
      this.config.GOOGLE_CLOUD_PROJECT_ID = env.GOOGLE_CLOUD_PROJECT_ID;
    }
    if (env.GOOGLE_VISION_API_KEY) {
      this.config.GOOGLE_VISION_API_KEY = env.GOOGLE_VISION_API_KEY;
    }

    // Google Gemini Configure
    if (env.GOOGLE_GEMINI_API_KEY) {
      this.config.GOOGLE_GEMINI_API_KEY = env.GOOGLE_GEMINI_API_KEY;
    }

    // Cohere Configure
    if (env.COHERE_API_KEY) {
      this.config.COHERE_API_KEY = env.COHERE_API_KEY;
    }

    // Replicate Configure
    if (env.REPLICATE_API_TOKEN) {
      this.config.REPLICATE_API_TOKEN = env.REPLICATE_API_TOKEN;
    }

    // Cloudinary Configure
    if (env.CLOUDINARY_CLOUD_NAME) {
      this.config.CLOUDINARY_CLOUD_NAME = env.CLOUDINARY_CLOUD_NAME;
    }
    if (env.CLOUDINARY_API_KEY) {
      this.config.CLOUDINARY_API_KEY = env.CLOUDINARY_API_KEY;
    }
    if (env.CLOUDINARY_API_SECRET) {
      this.config.CLOUDINARY_API_SECRET = env.CLOUDINARY_API_SECRET;
    }

    // AWS S3 Configure
    if (env.AWS_ACCESS_KEY_ID) {
      this.config.AWS_ACCESS_KEY_ID = env.AWS_ACCESS_KEY_ID;
    }
    if (env.AWS_SECRET_ACCESS_KEY) {
      this.config.AWS_SECRET_ACCESS_KEY = env.AWS_SECRET_ACCESS_KEY;
    }

    // Cloudflare Configure
    if (env.CLOUDFLARE_ZONE_ID) {
      this.config.CLOUDFLARE_ZONE_ID = env.CLOUDFLARE_ZONE_ID;
    }
    if (env.CLOUDFLARE_ACCOUNT_ID) {
      this.config.CLOUDFLARE_ACCOUNT_ID = env.CLOUDFLARE_ACCOUNT_ID;
    }

    // 通信ServiceConfigure
    if (env.SENDGRID_API_KEY) {
      this.config.SENDGRID_API_KEY = env.SENDGRID_API_KEY;
    }
    if (env.TWILIO_ACCOUNT_SID) {
      this.config.TWILIO_ACCOUNT_SID = env.TWILIO_ACCOUNT_SID;
    }
    if (env.TWILIO_AUTH_TOKEN) {
      this.config.TWILIO_AUTH_TOKEN = env.TWILIO_AUTH_TOKEN;
    }

    // AnalysisServiceConfigure
    if (env.SEGMENT_WRITE_KEY) {
      this.config.SEGMENT_WRITE_KEY = env.SEGMENT_WRITE_KEY;
    }
    if (env.MIXEL_PROJECT_TOKEN) {
      this.config.MIXEL_PROJECT_TOKEN = env.MIXEL_PROJECT_TOKEN;
    }

    // ApplyDefaultConfigure
    this.config = { ...DEFAULT_CONFIG, ...this.config };
  }

  /**
   * 從LocalStorage加載Configure（On發環境）
   */
  private async loadFromStorage(): Promise<void> {
    try {
      // 在 React Native 環境中，可以從 AsyncStorage 加載Configure
      if (typeof window === 'undefined') {
        const _AsyncStorage = require('@react-native-async-storage/async-storage');
        const _storedConfig = await AsyncStorage.getItem('service_config');
        if (storedConfig) {
          const _parsedConfig = JSON.parse(storedConfig);
          this.config = { ...this.config, ...parsedConfig };
        }
      }
    } catch (error) {
      console.warn('從存儲加載ConfigureFailed:', error);
    }
  }

  /**
   * VerifyRequired的Configure
   */
  private validateRequiredConfig(): void {
    const requiredKeys: (keyof EnvironmentConfig)[] = [
      'OPENAI_API_KEY',
      'GOOGLE_GEMINI_API_KEY',
      'COHERE_API_KEY',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
    ];

    const missingKeys: string[] = [];

    for (const key of requiredKeys) {
      if (!this.config[key]) {
        missingKeys.push(key);
      }
    }

    if (missingKeys.length > 0) {
      console.warn('缺少以下必需的配置項:', missingKeys);
      // 在On發環境中，我們可以使用模擬Configure
      if (this.config.NODE_ENV === 'development') {
        this.setMockConfig(missingKeys);
      }
    }
  }

  /**
   * Settings模擬Configure（On發環境）
   */
  private setMockConfig(missingKeys: string[]): void {
    const mockConfig: Partial<EnvironmentConfig> = {
      OPENAI_API_KEY: 'sk-mock-openai-key',
      GOOGLE_GEMINI_API_KEY: 'mock-gemini-key',
      COHERE_API_KEY: 'mock-cohere-key',
      CLOUDINARY_CLOUD_NAME: 'mock-cloud-name',
      CLOUDINARY_API_KEY: 'mock-api-key',
      CLOUDINARY_API_SECRET: 'mock-api-secret',
    };

    for (const key of missingKeys) {
      const _mockValue = mockConfig[key as keyof EnvironmentConfig];
      if (mockValue !== undefined) {
        (this.config as any)[key] = mockValue;
      }
    }

    console.log('使用模擬配置進行開發');
  }

  /**
   * GetConfigureValue
   */
  get<K extends keyof EnvironmentConfig>(
    key: K
  ): EnvironmentConfig[K] | undefined {
    return this.config[key];
  }

  /**
   * SettingsConfigureValue
   */
  set<K extends keyof EnvironmentConfig>(
    key: K,
    value: EnvironmentConfig[K]
  ): void {
    this.config[key] = value;
  }

  /**
   * Get所有Configure
   */
  getAll(): Partial<EnvironmentConfig> {
    return { ...this.config };
  }

  /**
   * CheckServiceYesNo可用
   */
  isServiceAvailable(service: string): boolean {
    switch (service) {
      case 'openai':
        return !!this.config.OPENAI_API_KEY;
      case 'gemini':
        return !!this.config.GOOGLE_GEMINI_API_KEY;
      case 'cohere':
        return !!this.config.COHERE_API_KEY;
      case 'replicate':
        return !!this.config.REPLICATE_API_TOKEN;
      case 'cloudinary':
        return !!(
          this.config.CLOUDINARY_CLOUD_NAME && this.config.CLOUDINARY_API_KEY
        );
      case 'aws':
        return !!(
          this.config.AWS_ACCESS_KEY_ID && this.config.AWS_SECRET_ACCESS_KEY
        );
      case 'cloudflare':
        return !!(
          this.config.CLOUDFLARE_ZONE_ID && this.config.CLOUDFLARE_ACCOUNT_ID
        );
      case 'sendgrid':
        return !!this.config.SENDGRID_API_KEY;
      case 'twilio':
        return !!(
          this.config.TWILIO_ACCOUNT_SID && this.config.TWILIO_AUTH_TOKEN
        );
      case 'segment':
        return !!this.config.SEGMENT_WRITE_KEY;
      case 'mixel':
        return !!this.config.MIXEL_PROJECT_TOKEN;
      default:
        return false;
    }
  }

  /**
   * GetServiceStatusReport
   */
  getServiceStatus(): Record<string, boolean> {
    return {
      openai: this.isServiceAvailable('openai'),
      gemini: this.isServiceAvailable('gemini'),
      cohere: this.isServiceAvailable('cohere'),
      replicate: this.isServiceAvailable('replicate'),
      cloudinary: this.isServiceAvailable('cloudinary'),
      aws: this.isServiceAvailable('aws'),
      cloudflare: this.isServiceAvailable('cloudflare'),
      sendgrid: this.isServiceAvailable('sendgrid'),
      twilio: this.isServiceAvailable('twilio'),
      segment: this.isServiceAvailable('segment'),
      mixel: this.isServiceAvailable('mixel'),
    };
  }
}

// Export單例Instance
export const _serviceConfig = ServiceConfig.getInstance();

// ExportConfigureClass型
export type { EnvironmentConfig };

import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  AccessibilityConfig,
  AccessibilityEvent,
  AccessibilityManager,
  AccessibilityProfile,
  AccessibilityTools,
  SpeechOptions,
} from '../types/accessibility';

// Default無障礙Configure
const defaultAccessibilityConfig: AccessibilityConfig = {
  // 視覺輔助
  highContrast: false,
  largeText: false,
  boldText: false,
  reduceMotion: false,
  reduceTransparency: false,

  // 聽覺輔助
  closedCaptions: false,
  audioDescriptions: false,
  monoAudio: false,

  // 語音輔助
  screenReader: false,
  voiceOver: false,
  talkBack: false,

  // 交互輔助
  switchControl: false,
  assistiveTouch: false,
  guidedAccess: false,

  // 認知輔助
  simplifiedInterface: false,
  focusIndicators: true,
  errorPrevention: true,

  // 運動輔助
  touchAccommodations: false,
  shakeToUndo: false,
  homeClickSpeed: 'normal',
};

// DefaultConfigureFile
const defaultProfiles: AccessibilityProfile[] = [
  {
    id: 'default',
    name: '默認配置',
    description: '標準無障礙配置',
    config: defaultAccessibilityConfig,
    isDefault: true,
  },
  {
    id: 'visual',
    name: '視覺輔助',
    description: '適合視覺障礙用戶的配置',
    config: {
      ...defaultAccessibilityConfig,
      highContrast: true,
      largeText: true,
      boldText: true,
      reduceMotion: true,
      reduceTransparency: true,
    },
    isDefault: false,
  },
  {
    id: 'hearing',
    name: '聽覺輔助',
    description: '適合聽覺障礙用戶的配置',
    config: {
      ...defaultAccessibilityConfig,
      closedCaptions: true,
      audioDescriptions: true,
      monoAudio: true,
    },
    isDefault: false,
  },
  {
    id: 'motor',
    name: '運動輔助',
    description: '適合運動障礙用戶的配置',
    config: {
      ...defaultAccessibilityConfig,
      switchControl: true,
      assistiveTouch: true,
      touchAccommodations: true,
      homeClickSpeed: 'slow',
    },
    isDefault: false,
  },
];

class AccessibilityService implements AccessibilityManager, AccessibilityTools {
  private static instance: AccessibilityService;
  private config: AccessibilityConfig;
  private currentProfile: string;
  private availableProfiles: AccessibilityProfile[];
  private readonly eventListeners: ((event: AccessibilityEvent) => void)[] = [];
  private readonly storageKey = '@accessibility_service';
  private _isSpeaking = false;
  private focusedElement: string | null = null;

  private constructor() {
    this.config = { ...defaultAccessibilityConfig };
    this.currentProfile = 'default';
    this.availableProfiles = [...defaultProfiles];
  }

  static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.loadConfig();
      await this.checkSystemAccessibility();

      this.emitEvent({
        type: 'config_changed',
        timestamp: Date.now(),
      });
    } catch (error) {
      this.emitEvent({
        type: 'error_occurred',
        timestamp: Date.now(),
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  // ConfigureManage
  getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  async updateConfig(config: Partial<AccessibilityConfig>): Promise<void> {
    this.config = { ...this.config, ...config };

    // SaveConfigure
    await this.saveConfig();

    this.emitEvent({
      type: 'config_changed',
      timestamp: Date.now(),
    });
  }

  async resetConfig(): Promise<void> {
    this.config = { ...defaultAccessibilityConfig };
    this.currentProfile = 'default';
    await this.saveConfig();

    this.emitEvent({
      type: 'config_changed',
      timestamp: Date.now(),
    });
  }

  // ConfigureFileManage
  getCurrentProfile(): AccessibilityProfile {
    const _profile = this.availableProfiles.find(
      p => p.id === this.currentProfile
    );
    return profile || this.availableProfiles[0];
  }

  getAvailableProfiles(): AccessibilityProfile[] {
    return [...this.availableProfiles];
  }

  async switchProfile(profileId: string): Promise<void> {
    const _profile = this.availableProfiles.find(p => p.id === profileId);
    if (!profile) {
      throw new Error(`Profile not found: ${profileId}`);
    }

    this.currentProfile = profileId;
    this.config = { ...profile.config };
    await this.saveConfig();

    this.emitEvent({
      type: 'profile_changed',
      profileId,
      timestamp: Date.now(),
    });
  }

  async createProfile(
    profile: Omit<AccessibilityProfile, 'id'>
  ): Promise<void> {
    const newProfile: AccessibilityProfile = {
      ...profile,
      id: `profile_${Date.now()}`,
    };

    this.availableProfiles.push(newProfile);
    await this.saveConfig();

    this.emitEvent({
      type: 'config_changed',
      timestamp: Date.now(),
    });
  }

  async deleteProfile(profileId: string): Promise<void> {
    if (profileId === 'default') {
      throw new Error('Cannot delete default profile');
    }

    const _index = this.availableProfiles.findIndex(p => p.id === profileId);
    if (index === -1) {
      throw new Error(`Profile not found: ${profileId}`);
    }

    this.availableProfiles.splice(index, 1);

    if (this.currentProfile === profileId) {
      this.currentProfile = 'default';
      this.config = { ...defaultAccessibilityConfig };
    }

    await this.saveConfig();

    this.emitEvent({
      type: 'config_changed',
      timestamp: Date.now(),
    });
  }

  // 功能Check
  isFeatureEnabled(feature: keyof AccessibilityConfig): boolean {
    return this.config[feature] as boolean;
  }

  async toggleFeature(feature: keyof AccessibilityConfig): Promise<void> {
    const _currentValue = this.config[feature] as boolean;
    await this.updateConfig({ [feature]: !currentValue });

    this.emitEvent({
      type: 'feature_toggled',
      feature,
      value: !currentValue,
      timestamp: Date.now(),
    });
  }

  // 系統集成
  async checkSystemAccessibility(): Promise<Partial<AccessibilityConfig>> {
    // 在實際Apply中，這裡應該Check系統的無障礙Settings
    // 目前Return一個模擬的系統Configure
    return {
      reduceMotion: false,
      reduceTransparency: false,
      focusIndicators: true,
    };
  }

  async applySystemSettings(): Promise<void> {
    const _systemConfig = await this.checkSystemAccessibility();
    await this.updateConfig(systemConfig);
  }

  // EventManage
  addEventListener(listener: (event: AccessibilityEvent) => void): void {
    this.eventListeners.push(listener);
  }

  removeEventListener(listener: (event: AccessibilityEvent) => void): void {
    const _index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  // 無障礙Tool實現
  async speak(text: string, options?: SpeechOptions): Promise<void> {
    if (this.isSpeaking() && options?.interrupt) {
      this.stopSpeaking();
    }

    this._isSpeaking = true;

    // 在實際Apply中，這裡應該使用語音合成 API
    console.log(`Speaking: ${text}`, options);

    // 模擬語音播放
    setTimeout(() => {
      this._isSpeaking = false;
    }, 1000);
  }

  stopSpeaking(): void {
    this._isSpeaking = false;
    console.log('Stopped speaking');
  }

  isSpeaking(): boolean {
    return this._isSpeaking;
  }

  vibrate(pattern?: number | number[]): void {
    // 在實際Apply中，這裡應該使用振動 API
    console.log('Vibrating:', pattern);
  }

  hapticFeedback(
    type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'
  ): void {
    // 在實際Apply中，這裡應該使用觸覺反饋 API
    console.log('Haptic feedback:', type);
  }

  async setFocus(elementId: string): Promise<boolean> {
    this.focusedElement = elementId;
    console.log('Focus set to:', elementId);
    return true;
  }

  getFocusedElement(): string | null {
    return this.focusedElement;
  }

  async moveFocus(
    direction: 'next' | 'previous' | 'up' | 'down' | 'left' | 'right'
  ): Promise<boolean> {
    // 在實際Apply中，這裡應該實現焦點導航邏輯
    console.log('Moving focus:', direction);
    return true;
  }

  calculateContrastRatio(color1: string, color2: string): number {
    // 簡化的對比度計算
    // 在實際Apply中，這裡應該實現完整的 WCAG 對比度計算
    return 4.5; // 模擬Value
  }

  isHighContrast(color1: string, color2: string): boolean {
    const _ratio = this.calculateContrastRatio(color1, color2);
    return ratio >= 4.5;
  }

  suggestContrastColor(baseColor: string, targetRatio: number): string {
    // 在實際Apply中，這裡應該實現顏色建議算法
    return '#000000'; // 模擬Value
  }

  // PrivateMethod
  private async loadConfig(): Promise<void> {
    try {
      const _savedConfig = await AsyncStorage.getItem(this.storageKey);
      if (savedConfig) {
        try {
          const _parsed = JSON.parse(savedConfig);
          this.config = { ...this.config, ...parsed.config };
          this.currentProfile = parsed.currentProfile || 'default';
          this.availableProfiles = parsed.availableProfiles || defaultProfiles;
        } catch (parseError) {
          console.warn('Failed to parse accessibility config:', parseError);
          // 如果JSONParseFailed，使用DefaultConfigure
          this.config = { ...defaultAccessibilityConfig };
          this.currentProfile = 'default';
          this.availableProfiles = [...defaultProfiles];
        }
      }
    } catch (error) {
      console.warn('Failed to load accessibility config:', error);
      throw error; // ReThrowError以便TestCatch
    }
  }

  private async saveConfig(): Promise<void> {
    try {
      const _configData = {
        config: this.config,
        currentProfile: this.currentProfile,
        availableProfiles: this.availableProfiles,
      };
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(configData));
    } catch (error) {
      console.warn('Failed to save accessibility config:', error);
      throw error; // ReThrowError以便TestCatch
    }
  }

  private emitEvent(event: AccessibilityEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.warn('Accessibility event listener error:', error);
      }
    });
  }
}

export default AccessibilityService;

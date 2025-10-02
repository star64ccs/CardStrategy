import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import type {
  Theme,
  ThemeConfig,
  ThemeCustomization,
  ThemeEvent,
  ThemeManager,
  ThemeColors,
  ThemeSpacing,
  ThemeTypography,
  ThemeBorderRadius,
  ThemeShadows,
} from '../types/theme';
import { ThemeChangeRequest } from '../types/theme';

// 預設Theme定義
const defaultLightTheme: Theme = {
  id: 'light',
  name: '淺色主題',
  type: 'light',
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    accent: '#FF9500',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    card: '#FFFFFF',
    text: {
      primary: '#000000',
      secondary: '#8E8E93',
      disabled: '#C7C7CC',
      inverse: '#FFFFFF',
    },
    border: '#C6C6C8',
    divider: '#C6C6C8',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    highlight: '#F0F8FF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    fontFamily: {
      regular: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
      medium: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
      bold: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
      mono: Platform.OS === 'ios' ? 'SF Mono' : 'Roboto Mono',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
  },
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  },
};

const defaultDarkTheme: Theme = {
  id: 'dark',
  name: '深色主題',
  type: 'dark',
  colors: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    accent: '#FF9F0A',
    background: '#000000',
    surface: '#1C1C1E',
    card: '#2C2C2E',
    text: {
      primary: '#FFFFFF',
      secondary: '#8E8E93',
      disabled: '#3A3A3C',
      inverse: '#000000',
    },
    border: '#38383A',
    divider: '#38383A',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    info: '#0A84FF',
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    highlight: '#1A1A1A',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    fontFamily: {
      regular: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
      medium: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
      bold: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
      mono: Platform.OS === 'ios' ? 'SF Mono' : 'Roboto Mono',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
  },
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.5)',
  },
};

const defaultAutoTheme: Theme = {
  id: 'auto',
  name: '自動主題',
  type: 'auto',
  colors: defaultLightTheme.colors, // 將Root據系統ThemeDynamic調整
  spacing: defaultLightTheme.spacing,
  typography: defaultLightTheme.typography,
  borderRadius: defaultLightTheme.borderRadius,
  shadows: defaultLightTheme.shadows,
};

class ThemeService implements ThemeManager {
  private static instance: ThemeService;
  private currentTheme: Theme;
  private availableThemes: Theme[];
  private config: ThemeConfig;
  private isAutoTheme: boolean;
  private systemTheme: 'light' | 'dark';
  private readonly eventListeners: ((event: ThemeEvent) => void)[] = [];
  private readonly storageKey = '@theme_service';

  private constructor() {
    this.currentTheme = defaultLightTheme;
    this.availableThemes = [
      defaultLightTheme,
      defaultDarkTheme,
      defaultAutoTheme,
    ];
    this.config = {
      defaultTheme: 'light',
      availableThemes: ['light', 'dark', 'auto'],
      autoThemeEnabled: false,
      systemThemeDetection: true,
      themePersistence: true,
    };
    this.isAutoTheme = false;
    this.systemTheme = 'light';
  }

  static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // LoadSave的Configure
      await this.loadConfig();

      // 檢測系統Theme
      await this.detectSystemTheme();

      // Settings初始Theme
      await this.setInitialTheme();

      this.emitEvent({
        type: 'theme_loaded',
        themeId: this.currentTheme.id,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.emitEvent({
        type: 'theme_error',
        timestamp: Date.now(),
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  getCurrentTheme(): Theme {
    if (this.isAutoTheme) {
      return this.getEffectiveTheme();
    }
    return this.currentTheme;
  }

  async setTheme(themeId: string): Promise<void> {
    const _theme = this.availableThemes.find(t => t.id === themeId);
    if (!theme) {
      throw new Error(`Theme not found: ${themeId}`);
    }

    this.currentTheme = theme;
    this.isAutoTheme = theme.type === 'auto';

    if (this.config.themePersistence) {
      await this.saveConfig();
    }

    this.emitEvent({
      type: 'theme_changed',
      themeId,
      timestamp: Date.now(),
    });
  }

  async toggleTheme(): Promise<void> {
    const _currentThemeId = this.currentTheme.id;
    const _nextThemeId = currentThemeId === 'light' ? 'dark' : 'light';
    await this.setTheme(nextThemeId);
  }

  getAvailableThemes(): Theme[] {
    return [...this.availableThemes];
  }

  isDarkMode(): boolean {
    const _effectiveTheme = this.getEffectiveTheme();
    return effectiveTheme.type === 'dark';
  }

  isAutoThemeEnabled(): boolean {
    return this.isAutoTheme;
  }

  getSystemTheme(): 'light' | 'dark' {
    return this.systemTheme;
  }

  async setAutoTheme(enabled: boolean): Promise<void> {
    this.config.autoThemeEnabled = enabled;
    if (enabled) {
      await this.setTheme('auto');
    } else {
      await this.setTheme(this.config.defaultTheme);
    }

    if (this.config.themePersistence) {
      await this.saveConfig();
    }
  }

  async customizeTheme(customization: ThemeCustomization): Promise<void> {
    const _theme = this.availableThemes.find(
      t => t.id === customization.themeId
    );
    if (!theme) {
      throw new Error(`Theme not found: ${customization.themeId}`);
    }

    // CreateCustomTheme
    const customTheme: Theme = {
      ...theme,
      id: `${theme.id}_custom`,
      name: `${theme.name} (自定義)`,
      colors: {
        ...theme.colors,
        ...customization.customizations,
      },
    };

    this.availableThemes.push(customTheme);

    if (this.config.themePersistence) {
      await this.saveConfig();
    }
  }

  async resetTheme(): Promise<void> {
    await this.setTheme(this.config.defaultTheme);
  }

  async exportTheme(themeId: string): Promise<string> {
    const _theme = this.availableThemes.find(t => t.id === themeId);
    if (!theme) {
      throw new Error(`Theme not found: ${themeId}`);
    }

    return JSON.stringify(theme);
  }

  async importTheme(themeData: string): Promise<void> {
    try {
      const theme: Theme = JSON.parse(themeData);

      // VerifyThemeData
      if (!theme.id || !theme.name || !theme.colors) {
        throw new Error('Invalid theme data');
      }

      // CheckYesNo已存在
      const _existingIndex = this.availableThemes.findIndex(
        t => t.id === theme.id
      );
      if (existingIndex >= 0) {
        this.availableThemes[existingIndex] = theme;
      } else {
        this.availableThemes.push(theme);
      }

      if (this.config.themePersistence) {
        await this.saveConfig();
      }
    } catch (error) {
      throw new Error(
        `Failed to import theme: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Event監聽器Manage
  addEventListener(listener: (event: ThemeEvent) => void): void {
    this.eventListeners.push(listener);
  }

  removeEventListener(listener: (event: ThemeEvent) => void): void {
    const _index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  // PrivateMethod
  private getEffectiveTheme(): Theme {
    if (this.isAutoTheme) {
      return this.systemTheme === 'dark' ? defaultDarkTheme : defaultLightTheme;
    }
    return this.currentTheme;
  }

  private async loadConfig(): Promise<void> {
    try {
      const _savedConfig = await AsyncStorage.getItem(this.storageKey);
      if (savedConfig) {
        const _parsed = JSON.parse(savedConfig);
        this.config = { ...this.config, ...parsed.config };
        this.currentTheme = parsed.currentTheme || defaultLightTheme;
        this.isAutoTheme = parsed.isAutoTheme || false;
      }
    } catch (error) {
      console.warn('Failed to load theme config:', error);
    }
  }

  private async saveConfig(): Promise<void> {
    try {
      const _configData = {
        config: this.config,
        currentTheme: this.currentTheme,
        isAutoTheme: this.isAutoTheme,
      };
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(configData));
    } catch (error) {
      console.warn('Failed to save theme config:', error);
    }
  }

  private async detectSystemTheme(): Promise<void> {
    // 在 React Native 中，我們需要通過其他方式檢測系統Theme
    // 這裡使用一個簡單的實現，實際Apply中可能需要使用原生模組
    this.systemTheme = 'light'; // DefaultValue，實際應該從系統Get
  }

  private async setInitialTheme(): Promise<void> {
    if (this.config.autoThemeEnabled) {
      await this.setTheme('auto');
    } else {
      await this.setTheme(this.currentTheme.id);
    }
  }

  private emitEvent(event: ThemeEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.warn('Theme event listener error:', error);
      }
    });
  }

  // ToolMethod
  getThemeColors(): ThemeColors {
    return this.getCurrentTheme().colors;
  }

  getThemeSpacing(): ThemeSpacing {
    return this.getCurrentTheme().spacing;
  }

  getThemeTypography(): ThemeTypography {
    return this.getCurrentTheme().typography;
  }

  getThemeBorderRadius(): ThemeBorderRadius {
    return this.getCurrentTheme().borderRadius;
  }

  getThemeShadows(): ThemeShadows {
    return this.getCurrentTheme().shadows;
  }
}

export default ThemeService;

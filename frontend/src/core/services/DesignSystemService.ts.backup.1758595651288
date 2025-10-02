// 設計系統服務類
import type {
  AccessibilityConfig,
  ComponentConfig,
  ComponentLibrary,
  DesignSystemEvent,
  DesignSystemService,
  DesignToken,
  Theme,
  ThemeType,
} from '../types/designSystem';

export class DesignSystemServiceClass implements DesignSystemService {
  private currentTheme: ThemeType = 'dark';
  private themes: Record<ThemeType, Theme> = {} as Record<ThemeType, Theme>;
  private readonly components: ComponentLibrary = {
    atoms: {} as any,
    molecules: {} as any,
    organisms: {} as any,
    templates: {} as any,
  };
  private readonly tokens: DesignToken[] = [];
  private accessibility: AccessibilityConfig = {
    contrastRatios: { normal: 4.5, large: 3.0, ui: 3.0 },
    focusIndicator: { color: '#FFD700', width: 2, style: 'solid' },
    animationPreferences: { reduceMotion: false, prefersReducedMotion: false },
    fontSizePreferences: { minimum: 12, maximum: 24, step: 2 },
  };
  private readonly eventListeners: Map<
    string,
    Set<(event: DesignSystemEvent) => void>
  > = new Map();

  constructor() {
    this.initializeThemes();
    this.loadThemePreference();
  }

  // 主題管理
  getCurrentTheme(): ThemeType {
    return this.currentTheme;
  }

  setTheme(theme: ThemeType): void {
    if (this.currentTheme === theme) return;
    const oldTheme = this.currentTheme;
    this.currentTheme = theme;

    if (typeof window !== 'undefined') {
      localStorage.setItem('cardstrategy-theme', theme);
    }

    this.emit({
      type: 'themeChange',
      from: oldTheme,
      to: theme,
      timestamp: Date.now(),
    });
  }

  getTheme(theme: ThemeType): Theme {
    return this.themes[theme];
  }

  getAllThemes(): Record<ThemeType, Theme> {
    return { ...this.themes };
  }

  // 組件管理
  registerComponent(name: string, config: ComponentConfig): void {
    const category = this.determineComponentCategory(name);
    if (category) {
      (this.components[category] as any)[name] = config;
      this.emit({
        type: 'componentRegister',
        componentName: name,
        config,
        timestamp: Date.now(),
      });
    }
  }

  getComponent(name: string): ComponentConfig | null {
    for (const category of Object.values(this.components)) {
      if (category[name]) return category[name];
    }
    return null;
  }

  getAllComponents(): ComponentLibrary {
    return { ...this.components };
  }

  updateComponent(name: string, config: Partial<ComponentConfig>): void {
    const existingConfig = this.getComponent(name);
    if (existingConfig) {
      this.registerComponent(name, { ...existingConfig, ...config });
    }
  }

  // 令牌管理
  getToken(name: string): DesignToken | null {
    return this.tokens.find(token => token.name === name) || null;
  }

  getAllTokens(): DesignToken[] {
    return [...this.tokens];
  }

  updateToken(name: string, value: string | number): void {
    const token = this.getToken(name);
    if (token) {
      const oldValue = token.value;
      token.value = value;
      this.emit({
        type: 'tokenUpdate',
        tokenName: name,
        oldValue,
        newValue: value,
        timestamp: Date.now(),
      });
    }
  }

  addToken(token: DesignToken): void {
    this.tokens.push(token);
  }

  // 可訪問性管理
  getAccessibilityConfig(): AccessibilityConfig {
    return { ...this.accessibility };
  }

  updateAccessibilityConfig(config: Partial<AccessibilityConfig>): void {
    const oldConfig = { ...this.accessibility };
    this.accessibility = { ...this.accessibility, ...config };

    Object.keys(config).forEach(setting => {
      this.emit({
        type: 'accessibilityUpdate',
        setting,
        oldValue: oldConfig[setting as keyof AccessibilityConfig],
        newValue: config[setting as keyof AccessibilityConfig],
        timestamp: Date.now(),
      });
    });
  }

  checkContrastRatio(color1: string, color2: string): number {
    const luminance1 = this.getLuminance(color1);
    const luminance2 = this.getLuminance(color2);
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  isAccessible(
    foreground: string,
    background: string,
    size: 'normal' | 'large' = 'normal'
  ): boolean {
    const ratio = this.checkContrastRatio(foreground, background);
    const requiredRatio =
      size === 'large'
        ? this.accessibility.contrastRatios.large
        : this.accessibility.contrastRatios.normal;
    return ratio >= requiredRatio;
  }

  // 事件管理
  subscribe(
    event: string,
    callback: (event: DesignSystemEvent) => void
  ): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
    return () => this.unsubscribe(event, callback);
  }

  unsubscribe(
    event: string,
    callback: (event: DesignSystemEvent) => void
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) listeners.delete(callback);
  }

  emit(event: DesignSystemEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in design system event listener:', error);
        }
      });
    }
  }

  // 私有方法
  private initializeThemes(): void {
    this.themes = {
      light: this.createLightTheme(),
      dark: this.createDarkTheme(),
      highContrast: this.createHighContrastTheme(),
    };
  }

  private createLightTheme(): Theme {
    return {
      type: 'light',
      colors: {
        background: {
          primary: '#FFFFFF',
          secondary: '#F8F9FA',
          tertiary: '#E9ECEF',
          overlay: 'rgba(0, 0, 0, 0.5)',
          card: '#FFFFFF',
          modal: '#FFFFFF',
        },
        text: {
          primary: '#212529',
          secondary: '#6C757D',
          tertiary: '#ADB5BD',
          disabled: '#CED4DA',
          inverse: '#FFFFFF',
          link: '#007BFF',
        },
        brand: {
          primary: '#007BFF',
          secondary: '#6C757D',
          accent: '#FFD700',
          success: '#28A745',
          warning: '#FFC107',
          error: '#DC3545',
          info: '#17A2B8',
        },
        border: {
          primary: '#DEE2E6',
          secondary: '#E9ECEF',
          focus: '#007BFF',
          disabled: '#CED4DA',
        },
        shadow: {
          light: '0 2px 4px rgba(0, 0, 0, 0.1)',
          medium: '0 4px 8px rgba(0, 0, 0, 0.15)',
          heavy: '0 8px 16px rgba(0, 0, 0, 0.2)',
          focus: '0 0 0 3px rgba(0, 123, 255, 0.25)',
        },
        status: {
          success: '#28A745',
          warning: '#FFC107',
          error: '#DC3545',
          info: '#17A2B8',
          neutral: '#6C757D',
        },
        rarity: {
          common: '#6C757D',
          uncommon: '#28A745',
          rare: '#007BFF',
          mythic: '#FFC107',
          special: '#E91E63',
          promo: '#9C27B0',
        },
      },
      typography: {
        sizes: {
          xs: 12,
          sm: 14,
          base: 16,
          lg: 18,
          xl: 20,
          '2xl': 24,
          '3xl': 30,
          '4xl': 36,
          '5xl': 48,
          '6xl': 60,
        },
        weights: {
          thin: '100',
          light: '300',
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
          extrabold: '800',
          black: '900',
        },
        lineHeights: {
          none: 1,
          tight: 1.25,
          snug: 1.375,
          normal: 1.5,
          relaxed: 1.625,
          loose: 2,
        },
        letterSpacing: {
          tighter: -0.05,
          tight: -0.025,
          normal: 0,
          wide: 0.025,
          wider: 0.05,
          widest: 0.1,
        },
        fonts: {
          sans: 'system-ui, -apple-system, sans-serif',
          serif: 'Georgia, serif',
          mono: 'Monaco, monospace',
        },
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        '2xl': 48,
        '3xl': 64,
        '4xl': 96,
        '5xl': 128,
        '6xl': 160,
      },
      borderRadius: {
        none: 0,
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        '2xl': 24,
        '3xl': 32,
        full: 9999,
      },
      shadow: {
        none: 'none',
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px rgba(0, 0, 0, 0.1)',
        inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
        focus: '0 0 0 3px rgba(0, 123, 255, 0.25)',
      },
      animation: {
        duration: { fast: 150, normal: 300, slow: 500 },
        easing: {
          linear: 'linear',
          ease: 'ease',
          easeIn: 'ease-in',
          easeOut: 'ease-out',
          easeInOut: 'ease-in-out',
        },
        types: {
          fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
          fadeOut: { from: { opacity: 1 }, to: { opacity: 0 } },
          slideUp: {
            from: { transform: 'translateY(20px)', opacity: 0 },
            to: { transform: 'translateY(0)', opacity: 1 },
          },
          slideDown: {
            from: { transform: 'translateY(-20px)', opacity: 0 },
            to: { transform: 'translateY(0)', opacity: 1 },
          },
          slideLeft: {
            from: { transform: 'translateX(20px)', opacity: 0 },
            to: { transform: 'translateX(0)', opacity: 1 },
          },
          slideRight: {
            from: { transform: 'translateX(-20px)', opacity: 0 },
            to: { transform: 'translateX(0)', opacity: 1 },
          },
          scaleIn: {
            from: { transform: 'scale(0.9)', opacity: 0 },
            to: { transform: 'scale(1)', opacity: 1 },
          },
          scaleOut: {
            from: { transform: 'scale(1)', opacity: 1 },
            to: { transform: 'scale(0.9)', opacity: 0 },
          },
          rotate: {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(360deg)' },
          },
        },
      },
      breakpoints: { xs: 0, sm: 576, md: 768, lg: 992, xl: 1200, '2xl': 1400 },
    };
  }

  private createDarkTheme(): Theme {
    return {
      type: 'dark',
      colors: {
        background: {
          primary: '#0A0E1A',
          secondary: '#1A1F2E',
          tertiary: '#2A2F3E',
          overlay: 'rgba(10, 14, 26, 0.8)',
          card: '#2A2F3E',
          modal: '#1A1F2E',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#E0E0E0',
          tertiary: '#B0B0B0',
          disabled: '#666666',
          inverse: '#0A0E1A',
          link: '#FFD700',
        },
        brand: {
          primary: '#FFD700',
          secondary: '#B0B0B0',
          accent: '#FFA500',
          success: '#4CAF50',
          warning: '#FF9800',
          error: '#F44336',
          info: '#2196F3',
        },
        border: {
          primary: '#333333',
          secondary: '#444444',
          focus: '#FFD700',
          disabled: '#666666',
        },
        shadow: {
          light: '0 2px 8px rgba(0, 0, 0, 0.3)',
          medium: '0 4px 16px rgba(0, 0, 0, 0.4)',
          heavy: '0 8px 32px rgba(0, 0, 0, 0.5)',
          focus: '0 0 0 3px rgba(255, 215, 0, 0.25)',
        },
        status: {
          success: '#4CAF50',
          warning: '#FF9800',
          error: '#F44336',
          info: '#2196F3',
          neutral: '#B0B0B0',
        },
        rarity: {
          common: '#9E9E9E',
          uncommon: '#4CAF50',
          rare: '#2196F3',
          mythic: '#FF9800',
          special: '#E91E63',
          promo: '#9C27B0',
        },
      },
      typography: {
        sizes: {
          xs: 12,
          sm: 14,
          base: 16,
          lg: 18,
          xl: 20,
          '2xl': 24,
          '3xl': 30,
          '4xl': 36,
          '5xl': 48,
          '6xl': 60,
        },
        weights: {
          thin: '100',
          light: '300',
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
          extrabold: '800',
          black: '900',
        },
        lineHeights: {
          none: 1,
          tight: 1.25,
          snug: 1.375,
          normal: 1.5,
          relaxed: 1.625,
          loose: 2,
        },
        letterSpacing: {
          tighter: -0.05,
          tight: -0.025,
          normal: 0,
          wide: 0.025,
          wider: 0.05,
          widest: 0.1,
        },
        fonts: {
          sans: 'system-ui, -apple-system, sans-serif',
          serif: 'Georgia, serif',
          mono: 'Monaco, monospace',
        },
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        '2xl': 48,
        '3xl': 64,
        '4xl': 96,
        '5xl': 128,
        '6xl': 160,
      },
      borderRadius: {
        none: 0,
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        '2xl': 24,
        '3xl': 32,
        full: 9999,
      },
      shadow: {
        none: 'none',
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px rgba(0, 0, 0, 0.4)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.4)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.4)',
        '2xl': '0 25px 50px rgba(0, 0, 0, 0.4)',
        inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
        focus: '0 0 0 3px rgba(255, 215, 0, 0.25)',
      },
      animation: {
        duration: { fast: 150, normal: 300, slow: 500 },
        easing: {
          linear: 'linear',
          ease: 'ease',
          easeIn: 'ease-in',
          easeOut: 'ease-out',
          easeInOut: 'ease-in-out',
        },
        types: {
          fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
          fadeOut: { from: { opacity: 1 }, to: { opacity: 0 } },
          slideUp: {
            from: { transform: 'translateY(20px)', opacity: 0 },
            to: { transform: 'translateY(0)', opacity: 1 },
          },
          slideDown: {
            from: { transform: 'translateY(-20px)', opacity: 0 },
            to: { transform: 'translateY(0)', opacity: 1 },
          },
          slideLeft: {
            from: { transform: 'translateX(20px)', opacity: 0 },
            to: { transform: 'translateX(0)', opacity: 1 },
          },
          slideRight: {
            from: { transform: 'translateX(-20px)', opacity: 0 },
            to: { transform: 'translateX(0)', opacity: 1 },
          },
          scaleIn: {
            from: { transform: 'scale(0.9)', opacity: 0 },
            to: { transform: 'scale(1)', opacity: 1 },
          },
          scaleOut: {
            from: { transform: 'scale(1)', opacity: 1 },
            to: { transform: 'scale(0.9)', opacity: 0 },
          },
          rotate: {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(360deg)' },
          },
        },
      },
      breakpoints: { xs: 0, sm: 576, md: 768, lg: 992, xl: 1200, '2xl': 1400 },
    };
  }

  private createHighContrastTheme(): Theme {
    return {
      type: 'highContrast',
      colors: {
        background: {
          primary: '#000000',
          secondary: '#1A1A1A',
          tertiary: '#2A2A2A',
          overlay: 'rgba(0, 0, 0, 0.9)',
          card: '#2A2A2A',
          modal: '#1A1A1A',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#FFFFFF',
          tertiary: '#FFFFFF',
          disabled: '#666666',
          inverse: '#000000',
          link: '#FFFF00',
        },
        brand: {
          primary: '#FFFF00',
          secondary: '#FFFFFF',
          accent: '#FFA500',
          success: '#00FF00',
          warning: '#FFA500',
          error: '#FF0000',
          info: '#00FFFF',
        },
        border: {
          primary: '#FFFFFF',
          secondary: '#FFFFFF',
          focus: '#FFFF00',
          disabled: '#666666',
        },
        shadow: {
          light: '0 2px 8px rgba(255, 255, 255, 0.3)',
          medium: '0 4px 16px rgba(255, 255, 255, 0.4)',
          heavy: '0 8px 32px rgba(255, 255, 255, 0.5)',
          focus: '0 0 0 3px rgba(255, 255, 0, 0.5)',
        },
        status: {
          success: '#00FF00',
          warning: '#FFA500',
          error: '#FF0000',
          info: '#00FFFF',
          neutral: '#FFFFFF',
        },
        rarity: {
          common: '#FFFFFF',
          uncommon: '#00FF00',
          rare: '#00FFFF',
          mythic: '#FFA500',
          special: '#FF00FF',
          promo: '#8000FF',
        },
      },
      typography: {
        sizes: {
          xs: 14,
          sm: 16,
          base: 18,
          lg: 20,
          xl: 22,
          '2xl': 26,
          '3xl': 32,
          '4xl': 38,
          '5xl': 50,
          '6xl': 62,
        },
        weights: {
          thin: '300',
          light: '400',
          normal: '500',
          medium: '600',
          semibold: '700',
          bold: '800',
          extrabold: '900',
          black: '900',
        },
        lineHeights: {
          none: 1,
          tight: 1.25,
          snug: 1.375,
          normal: 1.5,
          relaxed: 1.625,
          loose: 2,
        },
        letterSpacing: {
          tighter: -0.05,
          tight: -0.025,
          normal: 0,
          wide: 0.025,
          wider: 0.05,
          widest: 0.1,
        },
        fonts: {
          sans: 'system-ui, -apple-system, sans-serif',
          serif: 'Georgia, serif',
          mono: 'Monaco, monospace',
        },
      },
      spacing: {
        xs: 6,
        sm: 10,
        md: 18,
        lg: 26,
        xl: 34,
        '2xl': 50,
        '3xl': 66,
        '4xl': 98,
        '5xl': 130,
        '6xl': 162,
      },
      borderRadius: {
        none: 0,
        sm: 6,
        md: 10,
        lg: 14,
        xl: 18,
        '2xl': 26,
        '3xl': 34,
        full: 9999,
      },
      shadow: {
        none: 'none',
        sm: '0 2px 4px rgba(255, 255, 255, 0.3)',
        md: '0 6px 8px rgba(255, 255, 255, 0.4)',
        lg: '0 12px 18px rgba(255, 255, 255, 0.4)',
        xl: '0 22px 28px rgba(255, 255, 255, 0.4)',
        '2xl': '0 28px 52px rgba(255, 255, 255, 0.4)',
        inner: 'inset 0 2px 4px rgba(255, 255, 255, 0.3)',
        focus: '0 0 0 4px rgba(255, 255, 0, 0.5)',
      },
      animation: {
        duration: { fast: 200, normal: 400, slow: 600 },
        easing: {
          linear: 'linear',
          ease: 'ease',
          easeIn: 'ease-in',
          easeOut: 'ease-out',
          easeInOut: 'ease-in-out',
        },
        types: {
          fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
          fadeOut: { from: { opacity: 1 }, to: { opacity: 0 } },
          slideUp: {
            from: { transform: 'translateY(20px)', opacity: 0 },
            to: { transform: 'translateY(0)', opacity: 1 },
          },
          slideDown: {
            from: { transform: 'translateY(-20px)', opacity: 0 },
            to: { transform: 'translateY(0)', opacity: 1 },
          },
          slideLeft: {
            from: { transform: 'translateX(20px)', opacity: 0 },
            to: { transform: 'translateX(0)', opacity: 1 },
          },
          slideRight: {
            from: { transform: 'translateX(-20px)', opacity: 0 },
            to: { transform: 'translateX(0)', opacity: 1 },
          },
          scaleIn: {
            from: { transform: 'scale(0.9)', opacity: 0 },
            to: { transform: 'scale(1)', opacity: 1 },
          },
          scaleOut: {
            from: { transform: 'scale(1)', opacity: 1 },
            to: { transform: 'scale(0.9)', opacity: 0 },
          },
          rotate: {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(360deg)' },
          },
        },
      },
      breakpoints: { xs: 0, sm: 576, md: 768, lg: 992, xl: 1200, '2xl': 1400 },
    };
  }

  private loadThemePreference(): void {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(
        'cardstrategy-theme'
      ) as ThemeType;
      if (savedTheme && this.themes[savedTheme]) {
        this.currentTheme = savedTheme;
      }
    }
  }

  private determineComponentCategory(
    name: string
  ): keyof ComponentLibrary | null {
    const atomComponents = ['Button', 'Input', 'Label', 'Icon', 'Badge'];
    const moleculeComponents = ['Card', 'Modal', 'Dropdown', 'Tabs', 'Alert'];
    const organismComponents = [
      'Header',
      'Footer',
      'Navigation',
      'Sidebar',
      'Form',
    ];
    const templateComponents = ['Page', 'Layout', 'Dashboard'];

    if (atomComponents.includes(name)) return 'atoms';
    if (moleculeComponents.includes(name)) return 'molecules';
    if (organismComponents.includes(name)) return 'organisms';
    if (templateComponents.includes(name)) return 'templates';

    return null;
  }

  private getLuminance(color: string): number {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const rsRGB = r <= 0.03928 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4;
    const gsRGB = g <= 0.03928 ? g / 12.92 : ((g + 0.055) / 1.055) ** 2.4;
    const bsRGB = b <= 0.03928 ? b / 12.92 : ((b + 0.055) / 1.055) ** 2.4;

    return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
  }
}

export const designSystemService = new DesignSystemServiceClass();
export default designSystemService;

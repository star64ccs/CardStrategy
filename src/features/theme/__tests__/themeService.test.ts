import AsyncStorage from '@react-native-async-storage/async-storage';

import ThemeService from '../services/themeService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

describe('ThemeService', () => {
  let themeService: ThemeService;

  beforeEach(() => {
    // 清除所有模擬
    jest.clearAllMocks();

    // 重置單例
    (ThemeService as any).instance = undefined;

    // 獲取實例
    themeService = ThemeService.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('應該返回相同的實例', () => {
      const _instance1 = ThemeService.getInstance();
      const _instance2 = ThemeService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化', () => {
    it('應該成功初始化', async () => {
      const _mockConfig = {
        config: {
          defaultTheme: 'light',
          availableThemes: ['light', 'dark', 'auto'],
          autoThemeEnabled: false,
          systemThemeDetection: true,
          themePersistence: true,
        },
        currentTheme: {
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
          spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
          typography: {
            fontFamily: {
              regular: 'System',
              medium: 'System',
              bold: 'System',
              mono: 'System',
            },
            fontSize: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24 },
            lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.8 },
          },
          borderRadius: { none: 0, sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
          shadows: {
            none: 'none',
            sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
            md: '0 4px 6px rgba(0, 0, 0, 0.1)',
            lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
            xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
          },
        },
        isAutoTheme: false,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockConfig)
      );

      await themeService.initialize();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@theme_service');
      expect(themeService.getCurrentTheme().id).toBe('light');
    });

    it('應該處理初始化錯誤', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      // 初始化錯誤應該被捕獲並記錄警告，而不是拋出錯誤
      await expect(themeService.initialize()).resolves.not.toThrow();
    });
  });

  describe('主題管理', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await themeService.initialize();
    });

    it('應該獲取當前主題', () => {
      const _theme = themeService.getCurrentTheme();
      expect(theme).toBeDefined();
      expect(theme.id).toBe('light');
      expect(theme.name).toBe('淺色主題');
    });

    it('應該設置主題', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await themeService.setTheme('dark');

      expect(themeService.getCurrentTheme().id).toBe('dark');
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('應該在設置不存在的主題時拋出錯誤', async () => {
      await expect(themeService.setTheme('nonexistent')).rejects.toThrow(
        'Theme not found: nonexistent'
      );
    });

    it('應該切換主題', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await themeService.setTheme('light');
      await themeService.toggleTheme();

      expect(themeService.getCurrentTheme().id).toBe('dark');
    });

    it('應該獲取可用主題列表', () => {
      const _themes = themeService.getAvailableThemes();
      expect(themes).toHaveLength(3);
      expect(themes.map(t => t.id)).toContain('light');
      expect(themes.map(t => t.id)).toContain('dark');
      expect(themes.map(t => t.id)).toContain('auto');
    });
  });

  describe('深色模式檢測', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await themeService.initialize();
    });

    it('應該正確檢測深色模式', async () => {
      await themeService.setTheme('dark');
      expect(themeService.isDarkMode()).toBe(true);

      await themeService.setTheme('light');
      expect(themeService.isDarkMode()).toBe(false);
    });

    it('應該檢測自動主題狀態', async () => {
      await themeService.setTheme('auto');
      expect(themeService.isAutoThemeEnabled()).toBe(true);

      await themeService.setTheme('light');
      expect(themeService.isAutoThemeEnabled()).toBe(false);
    });

    it('應該獲取系統主題', () => {
      const _systemTheme = themeService.getSystemTheme();
      expect(systemTheme).toBe('light');
    });
  });

  describe('自動主題', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await themeService.initialize();
    });

    it('應該設置自動主題', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await themeService.setAutoTheme(true);
      expect(themeService.isAutoThemeEnabled()).toBe(true);

      await themeService.setAutoTheme(false);
      expect(themeService.isAutoThemeEnabled()).toBe(false);
    });
  });

  describe('主題自定義', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await themeService.initialize();
    });

    it('應該自定義主題', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const _customization = {
        themeId: 'light',
        customizations: {
          primary: '#FF0000',
          background: '#000000',
        },
      };

      await themeService.customizeTheme(customization);

      const _themes = themeService.getAvailableThemes();
      const _customTheme = themes.find(t => t.id === 'light_custom');
      expect(customTheme).toBeDefined();
      expect(customTheme?.colors.primary).toBe('#FF0000');
      expect(customTheme?.colors.background).toBe('#000000');
    });

    it('應該在自定義不存在的主題時拋出錯誤', async () => {
      const _customization = {
        themeId: 'nonexistent',
        customizations: { primary: '#FF0000' },
      };

      await expect(themeService.customizeTheme(customization)).rejects.toThrow(
        'Theme not found: nonexistent'
      );
    });
  });

  describe('主題重置', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await themeService.initialize();
    });

    it('應該重置主題', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await themeService.setTheme('dark');
      await themeService.resetTheme();

      expect(themeService.getCurrentTheme().id).toBe('light');
    });
  });

  describe('主題導入/導出', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await themeService.initialize();
    });

    it('應該導出主題', async () => {
      const _themeData = await themeService.exportTheme('light');
      const _parsed = JSON.parse(themeData);
      expect(parsed.id).toBe('light');
      expect(parsed.name).toBe('淺色主題');
    });

    it('應該在導出不存在的主題時拋出錯誤', async () => {
      await expect(themeService.exportTheme('nonexistent')).rejects.toThrow(
        'Theme not found: nonexistent'
      );
    });

    it('應該導入主題', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const _themeData = JSON.stringify({
        id: 'imported',
        name: '導入的主題',
        type: 'light',
        colors: {
          primary: '#FF0000',
          secondary: '#00FF00',
          accent: '#0000FF',
          background: '#FFFFFF',
          surface: '#F0F0F0',
          card: '#FFFFFF',
          text: {
            primary: '#000000',
            secondary: '#666666',
            disabled: '#CCCCCC',
            inverse: '#FFFFFF',
          },
          border: '#DDDDDD',
          divider: '#DDDDDD',
          success: '#00FF00',
          warning: '#FFFF00',
          error: '#FF0000',
          info: '#0000FF',
          overlay: 'rgba(0, 0, 0, 0.5)',
          shadow: 'rgba(0, 0, 0, 0.1)',
          highlight: '#F0F8FF',
        },
        spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
        typography: {
          fontFamily: {
            regular: 'System',
            medium: 'System',
            bold: 'System',
            mono: 'System',
          },
          fontSize: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24 },
          lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.8 },
        },
        borderRadius: { none: 0, sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
        shadows: {
          none: 'none',
          sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
          md: '0 4px 6px rgba(0, 0, 0, 0.1)',
          lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
          xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
        },
      });

      await themeService.importTheme(themeData);

      const _themes = themeService.getAvailableThemes();
      const _importedTheme = themes.find(t => t.id === 'imported');
      expect(importedTheme).toBeDefined();
      expect(importedTheme?.name).toBe('導入的主題');
    });

    it('應該在導入無效主題數據時拋出錯誤', async () => {
      await expect(themeService.importTheme('invalid json')).rejects.toThrow(
        'Failed to import theme'
      );
    });

    it('應該在導入缺少必要字段的主題時拋出錯誤', async () => {
      const _invalidTheme = JSON.stringify({ id: 'invalid' });
      await expect(themeService.importTheme(invalidTheme)).rejects.toThrow(
        'Failed to import theme'
      );
    });
  });

  describe('事件監聽器', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await themeService.initialize();
    });

    it('應該添加和移除事件監聽器', () => {
      const _listener = jest.fn();

      themeService.addEventListener(listener);
      expect(themeService['eventListeners']).toContain(listener);

      themeService.removeEventListener(listener);
      expect(themeService['eventListeners']).not.toContain(listener);
    });

    it('應該發送主題變更事件', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const _listener = jest.fn();
      themeService.addEventListener(listener);

      await themeService.setTheme('dark');

      expect(listener).toHaveBeenCalledWith({
        type: 'theme_changed',
        themeId: 'dark',
        timestamp: expect.any(Number),
      });
    });
  });

  describe('工具方法', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await themeService.initialize();
    });

    it('應該獲取主題顏色', () => {
      const _colors = themeService.getThemeColors();
      expect(colors.primary).toBe('#007AFF');
      expect(colors.background).toBe('#FFFFFF');
    });

    it('應該獲取主題間距', () => {
      const _spacing = themeService.getThemeSpacing();
      expect(spacing.md).toBe(16);
      expect(spacing.lg).toBe(24);
    });

    it('應該獲取主題字體', () => {
      const _typography = themeService.getThemeTypography();
      expect(typography.fontSize.md).toBe(16);
      expect(typography.fontSize.lg).toBe(18);
    });

    it('應該獲取主題圓角', () => {
      const _borderRadius = themeService.getThemeBorderRadius();
      expect(borderRadius.md).toBe(8);
      expect(borderRadius.lg).toBe(12);
    });

    it('應該獲取主題陰影', () => {
      const _shadows = themeService.getThemeShadows();
      expect(shadows.md).toBe('0 4px 6px rgba(0, 0, 0, 0.1)');
      expect(shadows.lg).toBe('0 10px 15px rgba(0, 0, 0, 0.1)');
    });
  });

  describe('錯誤處理', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await themeService.initialize();
    });

    it('應該處理存儲錯誤', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      // 這不應該拋出錯誤，而是記錄警告
      await expect(themeService.setTheme('dark')).resolves.not.toThrow();
    });

    it('應該處理事件監聽器錯誤', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const _errorListener = jest.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });

      themeService.addEventListener(errorListener);

      // 這不應該拋出錯誤，而是記錄警告
      await expect(themeService.setTheme('dark')).resolves.not.toThrow();
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await themeService.initialize();
    });

    it('應該快速切換主題', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const _startTime = Date.now();

      for (let i = 0; i < 10; i++) {
        await themeService.setTheme('light');
        await themeService.setTheme('dark');
      }

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      // 10次切換應該在100ms內完成
      expect(duration).toBeLessThan(100);
    });

    it('應該快速獲取主題屬性', () => {
      const _startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        themeService.getCurrentTheme();
        themeService.getThemeColors();
        themeService.getThemeSpacing();
      }

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      // 1000次獲取應該在50ms內完成
      expect(duration).toBeLessThan(50);
    });
  });

  describe('邊界條件', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await themeService.initialize();
    });

    it('應該處理空主題列表', () => {
      // 這是一個邊界情況，正常情況下不應該發生
      themeService['availableThemes'] = [];

      expect(() => themeService.getAvailableThemes()).not.toThrow();
      expect(themeService.getAvailableThemes()).toEqual([]);
    });

    it('應該處理無效的存儲數據', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      // 這不應該拋出錯誤，而是使用默認值
      await expect(themeService.initialize()).resolves.not.toThrow();
    });

    it('應該處理部分無效的存儲數據', async () => {
      const _partialData = {
        config: { defaultTheme: 'light' },
        // 缺少 currentTheme 和 isAutoTheme
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(partialData)
      );

      await themeService.initialize();

      // 應該使用默認值
      expect(themeService.getCurrentTheme().id).toBe('light');
      expect(themeService.isAutoThemeEnabled()).toBe(false);
    });
  });
});

// 設計系統單元測試
import { designSystemService } from '../services/designSystemService';
import type {
  ComponentConfig,
  DesignToken,
  ThemeType,
} from '../types/designSystem';

// 模擬設計令牌
const mockToken: DesignToken = {
  name: 'primary-color',
  value: '#007AFF',
  category: 'color',
  description: '主要顏色',
  usage: ['Button', 'Link'],
};

// 模擬組件配置
const mockComponentConfig: ComponentConfig = {
  name: 'Button',
  category: 'atoms',
  variants: {
    primary: {
      backgroundColor: '#007AFF',
      color: '#FFFFFF',
      padding: '12px 24px',
      borderRadius: '8px',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: '#007AFF',
      padding: '12px 24px',
      borderRadius: '8px',
      border: '1px solid #007AFF',
    },
  },
  props: {
    size: {
      type: 'string',
      default: 'medium',
      options: ['small', 'medium', 'large'],
    },
    disabled: {
      type: 'boolean',
      default: false,
    },
  },
  accessibility: {
    ariaLabel: '按鈕',
    keyboardSupport: true,
    focusIndicator: true,
  },
};

describe('設計系統服務測試', () => {
  beforeEach(() => {
    // 重置服務狀態
    designSystemService.setTheme('dark');
  });

  describe('主題管理', () => {
    test('應該能夠設置和獲取當前主題', () => {
      designSystemService.setTheme('light');
      expect(designSystemService.getCurrentTheme()).toBe('light');

      designSystemService.setTheme('dark');
      expect(designSystemService.getCurrentTheme()).toBe('dark');
    });

    test('應該能夠獲取特定主題', () => {
      const _lightTheme = designSystemService.getTheme('light');
      expect(lightTheme).toBeDefined();
      expect(lightTheme?.colors?.background?.primary).toBeDefined();

      const _darkTheme = designSystemService.getTheme('dark');
      expect(darkTheme).toBeDefined();
      expect(darkTheme?.colors?.background?.primary).toBeDefined();
    });

    test('應該能夠獲取所有主題', () => {
      const _allThemes = designSystemService.getAllThemes();
      expect(allThemes).toHaveProperty('light');
      expect(allThemes).toHaveProperty('dark');
      expect(allThemes).toHaveProperty('highContrast');
    });
  });

  describe('組件管理', () => {
    test('應該能夠註冊組件', () => {
      designSystemService.registerComponent('Button', mockComponentConfig);
      const _component = designSystemService.getComponent('Button');
      expect(component).toBeDefined();
      expect(component?.name).toBe('Button');
    });

    test('應該能夠獲取所有組件', () => {
      designSystemService.registerComponent('Button', mockComponentConfig);
      const _allComponents = designSystemService.getAllComponents();
      expect(allComponents.atoms.Button).toBeDefined();
    });

    test('應該能夠更新組件', () => {
      designSystemService.registerComponent('Button', mockComponentConfig);

      const _updatedConfig = {
        ...mockComponentConfig,
        variants: {
          ...mockComponentConfig.variants,
          tertiary: {
            backgroundColor: '#FF3B30',
            color: '#FFFFFF',
            padding: '12px 24px',
            borderRadius: '8px',
          },
        },
      };

      designSystemService.updateComponent('Button', updatedConfig);
      const _component = designSystemService.getComponent('Button');
      expect(component?.variants?.tertiary).toBeDefined();
    });
  });

  describe('設計令牌管理', () => {
    test('應該能夠添加令牌', () => {
      designSystemService.addToken(mockToken);
      const _token = designSystemService.getToken('primary-color');
      expect(token).toBeDefined();
      expect(token?.value).toBe('#007AFF');
    });

    test('應該能夠獲取所有令牌', () => {
      designSystemService.addToken(mockToken);
      const _allTokens = designSystemService.getAllTokens();
      expect(allTokens).toContainEqual(mockToken);
    });

    test('應該能夠更新令牌', () => {
      designSystemService.addToken(mockToken);
      designSystemService.updateToken('primary-color', '#FF3B30');
      const _token = designSystemService.getToken('primary-color');
      expect(token?.value).toBe('#FF3B30');
    });
  });

  describe('可訪問性管理', () => {
    test('應該能夠獲取可訪問性配置', () => {
      const _config = designSystemService.getAccessibilityConfig();
      expect(config).toBeDefined();
      expect(config.contrastRatios).toBeDefined();
      expect(config.focusIndicator).toBeDefined();
    });

    test('應該能夠更新可訪問性配置', () => {
      const _newConfig = {
        contrastRatios: {
          normal: 5.0,
          large: 3.5,
          ui: 3.5,
        },
      };

      designSystemService.updateAccessibilityConfig(newConfig);
      const _config = designSystemService.getAccessibilityConfig();
      expect(config.contrastRatios.normal).toBe(5.0);
    });

    test('應該能夠檢查對比度', () => {
      const _ratio = designSystemService.checkContrastRatio(
        '#000000',
        '#FFFFFF'
      );
      expect(ratio).toBeGreaterThan(20); // 黑白對比度應該很高

      const _lowRatio = designSystemService.checkContrastRatio(
        '#CCCCCC',
        '#DDDDDD'
      );
      expect(lowRatio).toBeLessThan(2); // 相似顏色對比度應該很低
    });

    test('應該能夠檢查可訪問性', () => {
      const _isAccessible = designSystemService.isAccessible(
        '#000000',
        '#FFFFFF'
      );
      expect(isAccessible).toBe(true);

      const _isNotAccessible = designSystemService.isAccessible(
        '#CCCCCC',
        '#DDDDDD'
      );
      expect(isNotAccessible).toBe(false);
    });
  });

  describe('事件管理', () => {
    test('應該能夠訂閱和取消訂閱事件', () => {
      const _mockCallback = jest.fn();

      designSystemService.subscribe('themeChange', mockCallback);
      designSystemService.setTheme('light');

      expect(mockCallback).toHaveBeenCalled();

      designSystemService.unsubscribe('themeChange', mockCallback);
      mockCallback.mockClear();

      designSystemService.setTheme('dark');
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('應該能夠發射事件', () => {
      const _mockCallback = jest.fn();

      designSystemService.subscribe('componentRegister', mockCallback);
      designSystemService.registerComponent('Button', mockComponentConfig);

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'componentRegister',
          componentName: 'Button',
          config: mockComponentConfig,
        })
      );
    });
  });

  describe('錯誤處理', () => {
    test('應該處理不存在的組件', () => {
      const _component = designSystemService.getComponent(
        'NonExistentComponent'
      );
      expect(component).toBeNull();
    });

    test('應該處理不存在的令牌', () => {
      const _token = designSystemService.getToken('non-existent-token');
      expect(token).toBeNull();
    });

    test('應該處理不存在的主題', () => {
      const _theme = designSystemService.getTheme(
        'nonExistentTheme' as ThemeType
      );
      expect(theme).toBeUndefined();
    });
  });

  describe('性能測試', () => {
    test('應該能夠快速處理大量組件', () => {
      const _startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        const _componentConfig = {
          ...mockComponentConfig,
          name: `Component${i}`,
        };
        designSystemService.registerComponent(`Component${i}`, componentConfig);
      }

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // 應該在 100ms 內完成
    });

    test('應該能夠快速處理大量令牌', () => {
      const _startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        const token: DesignToken = {
          name: `token-${i}`,
          value: `#${i.toString().padStart(6, '0')}`,
          category: 'color',
        };
        designSystemService.addToken(token);
      }

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // 應該在 100ms 內完成
    });
  });
});

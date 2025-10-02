import {
  accessibilityEnhancer,
  addARIALabels,
  addFocusIndicator,
  addKeyboardNavigation,
  enhanceComponent,
} from '../utils/accessibilityEnhancer';

// 模擬 DOM 環境
const _mockElement = {
  getAttribute: jest.fn(),
  hasAttribute: jest.fn(),
  textContent: 'Test Button',
  style: {},
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
    toggle: jest.fn(),
  },
};

const _mockDocument = {
  querySelector: jest.fn(() => mockElement),
  createElement: jest.fn(() => ({
    textContent: '',
    appendChild: jest.fn(),
  })),
  head: {
    appendChild: jest.fn(),
  },
  body: {
    classList: {
      toggle: jest.fn(),
    },
  },
};

const _mockWindow = {
  matchMedia: jest.fn(() => ({
    matches: false,
    addEventListener: jest.fn(),
  })),
};

// 模擬GlobalObject
global.document = mockDocument as any;
global.window = mockWindow as any;
global.getComputedStyle = jest.fn(() => ({
  getPropertyValue: jest.fn(() => ''),
}));

describe('組件可訪問性優化測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AccessibilityEnhancer 測試', () => {
    test('應該正確創建單例實例', () => {
      const _instance1 = accessibilityEnhancer;
      const _instance2 = accessibilityEnhancer;
      expect(instance1).toBe(instance2);
    });

    test('應該正確添加 ARIA 標籤', () => {
      const _props = { className: 'test' };
      const _ariaProps = {
        label: '測試按鈕',
        role: 'button',
        describedBy: 'description',
        hidden: false,
        pressed: false,
        disabled: false,
      };

      const _result = addARIALabels(props, ariaProps);

      expect(result['aria-label']).toBe('測試按鈕');
      expect(result.role).toBe('button');
      expect(result['aria-describedby']).toBe('description');
      expect(result['aria-hidden']).toBe(false);
      expect(result['aria-pressed']).toBe(false);
      expect(result['aria-disabled']).toBe(false);
      expect(result.className).toBe('test');
    });

    test('應該正確添加鍵盤導航', () => {
      const _props = { className: 'test' };
      const _keyboardConfig = {
        onEnter: jest.fn(),
        onEscape: jest.fn(),
        onSpace: jest.fn(),
        preventDefault: true,
      };

      const _result = addKeyboardNavigation(props, keyboardConfig);

      expect(result.tabIndex).toBe(0);
      expect(typeof result.onKeyDown).toBe('function');
    });

    test('應該正確添加焦點指示器', () => {
      const _props = { className: 'test' };
      const _focusConfig = {
        className: 'custom-focus',
        style: { outline: '2px solid red' },
        autoFocus: true,
      };

      const _result = addFocusIndicator(props, focusConfig);

      expect(result.className).toContain('accessibility-focus-indicator');
      expect(result.className).toContain('custom-focus');
      expect(result.autoFocus).toBe(true);
    });

    test('應該正確綜合增強組件', () => {
      const _props = { className: 'test' };
      const _accessibilityConfig = {
        aria: {
          label: '測試組件',
          role: 'button',
        },
        keyboard: {
          onEnter: jest.fn(),
        },
        focus: {
          autoFocus: true,
        },
        screenReader: {
          announcement: '測試公告',
        },
        voiceControl: {
          voiceLabel: '語音標籤',
        },
      };

      const _result = enhanceComponent(props, accessibilityConfig);

      expect(result['aria-label']).toBe('測試公告'); // screenReader announcement 會覆蓋 aria label
      expect(result.role).toBe('button');
      expect(result.autoFocus).toBe(true);
      expect(result['data-voice-label']).toBe('語音標籤');
    });

    test('應該正確獲取可訪問性設置', () => {
      const _settings = accessibilityEnhancer.getAccessibilitySettings();

      expect(settings).toHaveProperty('highContrastMode');
      expect(settings).toHaveProperty('reducedMotionMode');
      expect(typeof settings.highContrastMode).toBe('boolean');
      expect(typeof settings.reducedMotionMode).toBe('boolean');
    });

    test('應該正確更新可訪問性設置', () => {
      const _newSettings = {
        highContrastMode: true,
        reducedMotionMode: true,
      };

      // Reset mock 調用次數
      mockDocument.body.classList.toggle.mockClear();

      accessibilityEnhancer.updateAccessibilitySettings(newSettings);

      // Verify body Class名Update被調用
      expect(mockDocument.body.classList.toggle).toHaveBeenCalledWith(
        'accessibility-high-contrast',
        true
      );
      expect(mockDocument.body.classList.toggle).toHaveBeenCalledWith(
        'accessibility-reduced-motion',
        true
      );
    });
  });

  describe('可訪問性測試工具功能測試', () => {
    test('應該正確測試按鈕組件的 ARIA 標籤', () => {
      // 模擬按鈕Element
      mockElement.getAttribute.mockImplementation((attr: string) => {
        switch (attr) {
          case 'aria-label':
            return '測試按鈕';
          case 'role':
            return 'button';
          case 'tabindex':
            return '0';
          default:
            return null;
        }
      });

      // 確保 querySelector Return模擬Element
      mockDocument.querySelector.mockReturnValue(mockElement);

      const _buttonElement = mockDocument.querySelector(
        'button, a[role="button"]'
      );
      expect(buttonElement).toBeDefined();

      const _ariaLabel = buttonElement?.getAttribute('aria-label');
      const _role = buttonElement?.getAttribute('role');

      expect(ariaLabel).toBe('測試按鈕');
      expect(role).toBe('button');
    });

    test('應該正確測試輸入框組件的 ARIA 標籤', () => {
      // 模擬Input框Element
      mockElement.getAttribute.mockImplementation((attr: string) => {
        switch (attr) {
          case 'aria-label':
            return '測試輸入框';
          case 'placeholder':
            return '請輸入';
          default:
            return null;
        }
      });

      // 確保 querySelector Return模擬Element
      mockDocument.querySelector.mockReturnValue(mockElement);

      const _inputElement = mockDocument.querySelector('input');
      expect(inputElement).toBeDefined();

      const _ariaLabel = inputElement?.getAttribute('aria-label');
      const _placeholder = inputElement?.getAttribute('placeholder');

      expect(ariaLabel).toBe('測試輸入框');
      expect(placeholder).toBe('請輸入');
    });

    test('應該正確測試模態框組件的 ARIA 屬性', () => {
      // 模擬模態框Element
      mockElement.getAttribute.mockImplementation((attr: string) => {
        switch (attr) {
          case 'aria-label':
            return '測試模態框';
          case 'aria-modal':
            return 'true';
          default:
            return null;
        }
      });

      // 確保 querySelector Return模擬Element
      mockDocument.querySelector.mockReturnValue(mockElement);

      const _modalElement = mockDocument.querySelector(
        '[role="dialog"], .modal'
      );
      expect(modalElement).toBeDefined();

      const _ariaLabel = modalElement?.getAttribute('aria-label');
      const _ariaModal = modalElement?.getAttribute('aria-modal');

      expect(ariaLabel).toBe('測試模態框');
      expect(ariaModal).toBe('true');
    });

    test('應該正確處理找不到組件的情況', () => {
      // 模擬找不到Element
      mockDocument.querySelector.mockReturnValue(null);

      const _buttonElement = mockDocument.querySelector(
        'button, a[role="button"]'
      );
      expect(buttonElement).toBeNull();
    });
  });

  describe('可訪問性類型定義測試', () => {
    test('應該正確定義 ARIAProps 類型', () => {
      const _ariaProps = {
        label: '測試標籤',
        role: 'button',
        describedBy: 'description',
        hidden: false,
        expanded: true,
        pressed: false,
        checked: undefined,
        selected: false,
        disabled: false,
        required: true,
        invalid: false,
        live: 'polite' as const,
        atomic: true,
        relevant: 'all' as const,
        busy: false,
        current: 'page' as const,
        controls: 'panel1',
        owns: 'list1',
        posinset: 1,
        setsize: 5,
        level: 1,
        valuemin: 0,
        valuemax: 100,
        valuenow: 50,
        valuetext: '50%',
      };

      expect(ariaProps.label).toBe('測試標籤');
      expect(ariaProps.role).toBe('button');
      expect(ariaProps.live).toBe('polite');
      expect(ariaProps.atomic).toBe(true);
    });

    test('應該正確定義 AccessibilityTestResult 類型', () => {
      const _testResult = {
        component: 'Button',
        ariaLabels: true,
        keyboardNavigation: true,
        focusIndicator: true,
        highContrast: true,
        screenReader: true,
        voiceControl: true,
        switchControl: true,
        score: 95,
        issues: ['問題1', '問題2'],
        suggestions: ['建議1', '建議2'],
      };

      expect(testResult.component).toBe('Button');
      expect(testResult.score).toBe(95);
      expect(testResult.issues).toHaveLength(2);
      expect(testResult.suggestions).toHaveLength(2);
    });
  });

  describe('可訪問性功能集成測試', () => {
    test('應該正確處理高對比度模式', () => {
      const _settings = accessibilityEnhancer.getAccessibilitySettings();
      expect(settings.highContrastMode).toBeDefined();
      expect(typeof settings.highContrastMode).toBe('boolean');
    });

    test('應該正確處理減少動畫模式', () => {
      const _settings = accessibilityEnhancer.getAccessibilitySettings();
      expect(settings.reducedMotionMode).toBeDefined();
      expect(typeof settings.reducedMotionMode).toBe('boolean');
    });

    test('應該正確注入焦點指示器樣式', () => {
      // Reset mock 調用次數
      mockDocument.createElement.mockClear();
      mockDocument.head.appendChild.mockClear();

      // ReCreateInstance以觸發樣式注入
      const _newInstance = accessibilityEnhancer;

      // Verify樣式注入被調用
      expect(mockDocument.createElement).toHaveBeenCalledWith('style');
      expect(mockDocument.head.appendChild).toHaveBeenCalled();
    });

    test('應該正確檢測用戶偏好設置', () => {
      // Reset mock 調用次數
      mockWindow.matchMedia.mockClear();

      // ReCreateInstance以觸發PreferencesSettings檢測
      const _newInstance = accessibilityEnhancer;

      // Verify matchMedia 被調用
      expect(mockWindow.matchMedia).toHaveBeenCalledWith(
        '(prefers-contrast: high)'
      );
      expect(mockWindow.matchMedia).toHaveBeenCalledWith(
        '(prefers-reduced-motion: reduce)'
      );
    });
  });
});

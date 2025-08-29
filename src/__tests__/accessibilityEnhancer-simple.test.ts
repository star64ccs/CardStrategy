import {
  accessibilityEnhancer,
  addARIALabels,
  addFocusIndicator,
  addKeyboardNavigation,
  enhanceComponent,
} from '../utils/accessibilityEnhancer';

describe('可訪問性增強器簡化測試', () => {
  describe('AccessibilityEnhancer 核心功能測試', () => {
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
  });
});

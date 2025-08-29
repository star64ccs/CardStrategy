// 可訪問性組件單元測試
// 測試可訪問性服務和類型定義

import { accessibilityService } from '../services/accessibilityService';
import type {
  AccessibilityConfig,
  AccessibilityIssue,
  AccessibilityServiceConfig,
  AccessibilitySuggestion,
  AccessibilityTestConfig,
  AccessibilityTestResult,
  FocusManagerConfig,
  KeyboardNavigationConfig,
  ScreenReaderConfig,
} from '../types/accessibility';

describe('AccessibilityService', () => {
  beforeEach(() => {
    // 重置服務狀態
    accessibilityService.destroy();
  });

  describe('初始化', () => {
    test('應該正確初始化服務', () => {
      accessibilityService.init();
      const _state = accessibilityService.getState();

      expect(state).toBeDefined();
      expect(state.config).toBeDefined();
      expect(state.focusManager).toBeDefined();
      expect(state.assistiveTechnology).toBeDefined();
    });

    test('應該使用自定義配置初始化', () => {
      const customConfig: Partial<AccessibilityConfig> = {
        highContrast: true,
        reducedMotion: true,
        largeText: true,
      };

      accessibilityService.init();
      accessibilityService.updateConfig(customConfig);
      const _state = accessibilityService.getState();

      expect(state.config.highContrast).toBe(true);
      expect(state.config.reducedMotion).toBe(true);
      expect(state.config.largeText).toBe(true);
    });
  });

  describe('配置管理', () => {
    test('應該更新焦點管理配置', () => {
      accessibilityService.init();

      const focusConfig: Partial<FocusManagerConfig> = {
        trapFocus: true,
        restoreFocus: false,
        focusIndicator: 'custom',
        focusIndicatorColor: '#FF0000',
      };

      accessibilityService.updateConfig({ focusManager: focusConfig });
      const _state = accessibilityService.getState();

      expect(state.config.focusManager?.trapFocus).toBe(true);
      expect(state.config.focusManager?.restoreFocus).toBe(false);
      expect(state.config.focusManager?.focusIndicator).toBe('custom');
      expect(state.config.focusManager?.focusIndicatorColor).toBe('#FF0000');
    });

    test('應該更新鍵盤導航配置', () => {
      accessibilityService.init();

      const keyboardConfig: Partial<KeyboardNavigationConfig> = {
        enabled: false,
        mode: 'grid',
        arrowKeys: false,
        tabKey: false,
      };

      accessibilityService.updateConfig({ keyboardNavigation: keyboardConfig });
      const _state = accessibilityService.getState();

      expect(state.config.keyboardNavigation?.enabled).toBe(false);
      expect(state.config.keyboardNavigation?.mode).toBe('grid');
      expect(state.config.keyboardNavigation?.arrowKeys).toBe(false);
      expect(state.config.keyboardNavigation?.tabKey).toBe(false);
    });

    test('應該更新屏幕閱讀器配置', () => {
      accessibilityService.init();

      const screenReaderConfig: Partial<ScreenReaderConfig> = {
        enabled: false,
        voice: {
          rate: 0.8,
          pitch: 1.2,
          volume: 0.9,
          language: 'en-US',
        },
      };

      accessibilityService.updateConfig({ screenReader: screenReaderConfig });
      const _state = accessibilityService.getState();

      expect(state.config.screenReader?.enabled).toBe(false);
      expect(state.config.screenReader?.voice?.rate).toBe(0.8);
      expect(state.config.screenReader?.voice?.pitch).toBe(1.2);
      expect(state.config.screenReader?.voice?.volume).toBe(0.9);
      expect(state.config.screenReader?.voice?.language).toBe('en-US');
    });
  });

  describe('測試功能', () => {
    test('應該運行可訪問性測試', async () => {
      accessibilityService.init();

      const testConfig: Partial<AccessibilityTestConfig> = {
        type: 'automated',
        standards: ['WCAG2.1AA'],
        scope: 'component',
        depth: 'basic',
      };

      const _result = await accessibilityService.runTest(testConfig);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.config).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.result).toBeDefined();
      expect(result.details).toBeDefined();
      expect(result.passed).toBeDefined();
    });

    test('應該生成測試報告', async () => {
      accessibilityService.init();

      const testConfig: Partial<AccessibilityTestConfig> = {
        type: 'automated',
        standards: ['WCAG2.1AA'],
        scope: 'component',
        depth: 'basic',
      };

      const _result = await accessibilityService.runTest(testConfig);
      const _report = accessibilityService.generateReport(result);

      expect(report).toBeDefined();
      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(0);
      expect(report).toContain('可訪問性測試報告');
    });
  });

  describe('問題修復', () => {
    test('應該修復可訪問性問題', async () => {
      accessibilityService.init();

      const issues: AccessibilityIssue[] = [
        {
          id: 'test-issue-1',
          type: 'error',
          description: '測試問題 1',
          location: 'test-component',
          severity: 'high',
          fix: '修復建議 1',
          wcagCriteria: ['1.1.1'],
          fixed: false,
        },
        {
          id: 'test-issue-2',
          type: 'warning',
          description: '測試問題 2',
          location: 'test-component',
          severity: 'medium',
          fix: '修復建議 2',
          wcagCriteria: ['1.4.3'],
          fixed: false,
        },
      ];

      await accessibilityService.fixIssues(issues);

      // 驗證問題已被標記為已修復
      issues.forEach(issue => {
        expect(issue.fixed).toBe(true);
      });
    });
  });

  describe('事件處理', () => {
    test('應該發送和接收事件', () => {
      accessibilityService.init();

      let receivedEvent = null;
      accessibilityService.onEvent('test', event => {
        receivedEvent = event;
      });

      const _testEvent = {
        type: 'test',
        data: { message: 'test event' },
        timestamp: new Date(),
        source: 'test',
      };

      accessibilityService.emitEvent(testEvent);

      expect(receivedEvent).toBeDefined();
      expect(receivedEvent.type).toBe('test');
      expect(receivedEvent.data.message).toBe('test event');
    });
  });
});

describe('Accessibility Types', () => {
  test('AccessibilityServiceConfig 類型應該正確定義', () => {
    const config: AccessibilityServiceConfig = {
      name: 'Test Service',
      version: '1.0.0',
      defaultConfig: {
        focusManager: {
          trapFocus: false,
          restoreFocus: true,
        },
        keyboardNavigation: {
          enabled: true,
          mode: 'linear',
        },
        screenReader: {
          enabled: true,
          voice: {
            rate: 1,
            pitch: 1,
            volume: 1,
            language: 'zh-CN',
          },
        },
        highContrast: false,
        reducedMotion: false,
        largeText: false,
        voiceControl: false,
        switchControl: false,
        assistiveTechnology: {
          screenReader: false,
          voiceControl: false,
          switchControl: false,
          keyboardOnly: false,
          mouseOnly: false,
        },
      },
      testConfig: {
        type: 'automated',
        standards: ['WCAG2.1AA'],
        tools: ['axe-core'],
        environment: {
          browser: 'chrome',
        },
        scope: 'application',
        depth: 'comprehensive',
      },
      eventHandlers: {},
      logging: {
        enabled: true,
        level: 'info',
        output: 'console',
      },
    };

    expect(config.name).toBe('Test Service');
    expect(config.version).toBe('1.0.0');
    expect(config.defaultConfig).toBeDefined();
    expect(config.testConfig).toBeDefined();
  });

  test('AccessibilityTestResult 類型應該正確定義', () => {
    const result: AccessibilityTestResult = {
      id: 'test-result-1',
      config: {
        type: 'automated',
        standards: ['WCAG2.1AA'],
        tools: ['axe-core'],
        environment: {
          browser: 'chrome',
        },
        scope: 'application',
        depth: 'comprehensive',
      },
      timestamp: new Date(),
      result: {
        passed: 10,
        failed: 2,
        warnings: 3,
        total: 15,
      },
      details: {
        issues: [],
        suggestions: [],
        score: 85,
      },
      report: '測試報告內容',
      passed: true,
    };

    expect(result.id).toBe('test-result-1');
    expect(result.result.passed).toBe(10);
    expect(result.result.failed).toBe(2);
    expect(result.details.score).toBe(85);
    expect(result.passed).toBe(true);
  });

  test('AccessibilityIssue 類型應該正確定義', () => {
    const issue: AccessibilityIssue = {
      id: 'issue-1',
      type: 'error',
      description: '圖片缺少 alt 屬性',
      location: 'img-element',
      severity: 'high',
      fix: '為圖片添加 alt 屬性',
      wcagCriteria: ['1.1.1'],
      fixed: false,
    };

    expect(issue.id).toBe('issue-1');
    expect(issue.type).toBe('error');
    expect(issue.severity).toBe('high');
    expect(issue.wcagCriteria).toContain('1.1.1');
    expect(issue.fixed).toBe(false);
  });

  test('AccessibilitySuggestion 類型應該正確定義', () => {
    const suggestion: AccessibilitySuggestion = {
      id: 'suggestion-1',
      type: 'improvement',
      description: '建議添加更多 ARIA 標籤',
      location: 'form-component',
      priority: 'medium',
      implementation: '為表單控件添加 aria-label 屬性',
      impact: '提高屏幕閱讀器用戶體驗',
      implemented: false,
    };

    expect(suggestion.id).toBe('suggestion-1');
    expect(suggestion.type).toBe('improvement');
    expect(suggestion.priority).toBe('medium');
    expect(suggestion.implemented).toBe(false);
  });
});

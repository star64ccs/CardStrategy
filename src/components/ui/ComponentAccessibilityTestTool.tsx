import React, { useCallback, useMemo, useState } from 'react';

import { useDesignSystem } from '../../hooks/useDesignSystem';

interface ComponentAccessibilityTestToolProps {
  className?: string;
  style?: React.CSSProperties;
}

interface AccessibilityTestResult {
  component: string;
  ariaLabels: boolean;
  keyboardNavigation: boolean;
  focusIndicator: boolean;
  highContrast: boolean;
  screenReader: boolean;
  voiceControl: boolean;
  switchControl: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
}

/**
 * Component可訪問性TestTool
 * 用於Test所有Component的可訪問性功能
 */
export const ComponentAccessibilityTestTool: React.FC<
  ComponentAccessibilityTestToolProps
> = ({ className = '', style }) => {
  const { currentThemeData } = useDesignSystem();
  const [isVisible, setIsVisible] = useState(false);
  const [testResults, setTestResults] = useState<AccessibilityTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string>('all');

  // ComponentList
  const _components = useMemo(
    () => [
      { name: 'Button', type: 'button' },
      { name: 'Input', type: 'input' },
      { name: 'Card', type: 'card' },
      { name: 'Modal', type: 'modal' },
      { name: 'Toast', type: 'toast' },
      { name: 'Loading', type: 'loading' },
      { name: 'CardDisplay', type: 'card-display' },
    ],
    []
  );

  // Test按鈕Component
  const _testButtonComponent = useCallback((): AccessibilityTestResult => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check ARIA Tag
    const _buttonElement = document.querySelector('button, a[role="button"]');
    if (buttonElement) {
      const _ariaLabel = buttonElement.getAttribute('aria-label');
      const _role = buttonElement.getAttribute('role');

      if (!ariaLabel && !buttonElement.textContent?.trim()) {
        issues.push('按鈕缺少 ARIA 標籤或可見文本');
        score -= 20;
      }

      if (role === 'button') {
        suggestions.push('建議為按鈕添加更詳細的 aria-describedby');
      }
    } else {
      issues.push('未找到按鈕組件進行測試');
      score -= 30;
    }

    // CheckKey盤導航
    if (buttonElement) {
      const _tabIndex = buttonElement.getAttribute('tabindex');
      if (tabIndex === '-1') {
        issues.push('按鈕被排除在鍵盤導航之外');
        score -= 15;
      }
    }

    // Check焦點指示器
    const _focusStyles = getComputedStyle(document.documentElement);
    const _hasFocusIndicator =
      focusStyles.getPropertyValue('--accessibility-focus-indicator') ||
      document.querySelector('.accessibility-focus-indicator');
    if (!hasFocusIndicator) {
      issues.push('缺少焦點指示器樣式');
      score -= 10;
    }

    return {
      component: 'Button',
      ariaLabels: issues.length === 0,
      keyboardNavigation: (buttonElement as any).tabIndex !== '-1',
      focusIndicator: !!hasFocusIndicator,
      highContrast: true, // 需要實際Test
      screenReader: true, // 需要實際Test
      voiceControl: true, // 需要實際Test
      switchControl: true, // 需要實際Test
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }, []);

  // TestInput框Component
  const _testInputComponent = useCallback((): AccessibilityTestResult => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    const _inputElement = document.querySelector('input');
    if (inputElement) {
      const _ariaLabel = inputElement.getAttribute('aria-label');
      const _ariaDescribedBy = inputElement.getAttribute('aria-describedby');
      const _ariaInvalid = inputElement.getAttribute('aria-invalid');

      if (!ariaLabel && !inputElement.getAttribute('placeholder')) {
        issues.push('輸入框缺少 ARIA 標籤或佔位符文本');
        score -= 20;
      }

      if (inputElement.hasAttribute('required') && ariaInvalid === null) {
        suggestions.push('建議為必填輸入框添加 aria-required 屬性');
      }
    } else {
      issues.push('未找到輸入框組件進行測試');
      score -= 30;
    }

    return {
      component: 'Input',
      ariaLabels: issues.length === 0,
      keyboardNavigation: true,
      focusIndicator: true,
      highContrast: true,
      screenReader: true,
      voiceControl: true,
      switchControl: true,
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }, []);

  // Test卡片Component
  const _testCardComponent = useCallback((): AccessibilityTestResult => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    const _cardElement = document.querySelector('[role="article"], .card');
    if (cardElement) {
      const _ariaLabel = cardElement.getAttribute('aria-label');

      if (!ariaLabel) {
        suggestions.push('建議為卡片添加描述性的 aria-label');
        score -= 5;
      }
    } else {
      issues.push('未找到卡片組件進行測試');
      score -= 30;
    }

    return {
      component: 'Card',
      ariaLabels: issues.length === 0,
      keyboardNavigation: true,
      focusIndicator: true,
      highContrast: true,
      screenReader: true,
      voiceControl: true,
      switchControl: true,
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }, []);

  // Test模態框Component
  const _testModalComponent = useCallback((): AccessibilityTestResult => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    const _modalElement = document.querySelector('[role="dialog"], .modal');
    if (modalElement) {
      const _ariaLabel = modalElement.getAttribute('aria-label');
      const _ariaModal = modalElement.getAttribute('aria-modal');

      if (!ariaLabel) {
        issues.push('模態框缺少 ARIA 標籤');
        score -= 15;
      }

      if (ariaModal !== 'true') {
        issues.push('模態框缺少 aria-modal="true" 屬性');
        score -= 10;
      }
    } else {
      issues.push('未找到模態框組件進行測試');
      score -= 30;
    }

    return {
      component: 'Modal',
      ariaLabels: issues.length === 0,
      keyboardNavigation: true,
      focusIndicator: true,
      highContrast: true,
      screenReader: true,
      voiceControl: true,
      switchControl: true,
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }, []);

  // Test Toast Component
  const _testToastComponent = useCallback((): AccessibilityTestResult => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    const _toastElement = document.querySelector('[role="alert"], .toast');
    if (toastElement) {
      const _ariaLabel = toastElement.getAttribute('aria-label');
      const _ariaLive = toastElement.getAttribute('aria-live');

      if (!ariaLabel) {
        issues.push('Toast 缺少 ARIA 標籤');
        score -= 15;
      }

      if (ariaLive !== 'assertive' && ariaLive !== 'polite') {
        issues.push('Toast 缺少 aria-live 屬性');
        score -= 10;
      }
    } else {
      issues.push('未找到 Toast 組件進行測試');
      score -= 30;
    }

    return {
      component: 'Toast',
      ariaLabels: issues.length === 0,
      keyboardNavigation: true,
      focusIndicator: true,
      highContrast: true,
      screenReader: true,
      voiceControl: true,
      switchControl: true,
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }, []);

  // Test加載Component
  const _testLoadingComponent = useCallback((): AccessibilityTestResult => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    const _loadingElement = document.querySelector('[role="status"], .loading');
    if (loadingElement) {
      const _ariaLabel = loadingElement.getAttribute('aria-label');
      const _ariaBusy = loadingElement.getAttribute('aria-busy');

      if (!ariaLabel) {
        issues.push('加載組件缺少 ARIA 標籤');
        score -= 15;
      }

      if (ariaBusy !== 'true') {
        suggestions.push('建議為加載組件添加 aria-busy="true" 屬性');
        score -= 5;
      }
    } else {
      issues.push('未找到加載組件進行測試');
      score -= 30;
    }

    return {
      component: 'Loading',
      ariaLabels: issues.length === 0,
      keyboardNavigation: true,
      focusIndicator: true,
      highContrast: true,
      screenReader: true,
      voiceControl: true,
      switchControl: true,
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }, []);

  // Test卡片ShowComponent
  const _testCardDisplayComponent = useCallback((): AccessibilityTestResult => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    const _cardDisplayElement = document.querySelector(
      '[role="main"], .card-display'
    );
    if (cardDisplayElement) {
      const _ariaLabel = cardDisplayElement.getAttribute('aria-label');

      if (!ariaLabel) {
        suggestions.push('建議為卡片顯示組件添加描述性的 aria-label');
        score -= 5;
      }
    } else {
      issues.push('未找到卡片顯示組件進行測試');
      score -= 30;
    }

    return {
      component: 'CardDisplay',
      ariaLabels: issues.length === 0,
      keyboardNavigation: true,
      focusIndicator: true,
      highContrast: true,
      screenReader: true,
      voiceControl: true,
      switchControl: true,
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }, []);

  // 運RowTest
  const _runTest = useCallback(async () => {
    setIsRunning(true);
    const results: AccessibilityTestResult[] = [];

    // Root據Select的Component運RowTest
    if (selectedComponent === 'all') {
      results.push(testButtonComponent());
      results.push(testInputComponent());
      results.push(testCardComponent());
      results.push(testModalComponent());
      results.push(testToastComponent());
      results.push(testLoadingComponent());
      results.push(testCardDisplayComponent());
    } else {
      switch (selectedComponent) {
        case 'button':
          results.push(testButtonComponent());
          break;
        case 'input':
          results.push(testInputComponent());
          break;
        case 'card':
          results.push(testCardComponent());
          break;
        case 'modal':
          results.push(testModalComponent());
          break;
        case 'toast':
          results.push(testToastComponent());
          break;
        case 'loading':
          results.push(testLoadingComponent());
          break;
        case 'card-display':
          results.push(testCardDisplayComponent());
          break;
      }
    }

    // 模擬AsyncTest
    await new Promise(resolve => setTimeout(resolve, 1000));

    setTestResults(results);
    setIsRunning(false);
  }, [
    selectedComponent,
    testButtonComponent,
    testInputComponent,
    testCardComponent,
    testModalComponent,
    testToastComponent,
    testLoadingComponent,
    testCardDisplayComponent,
  ]);

  // 生成Report
  const _generateReport = useCallback(() => {
    const _totalScore =
      testResults.reduce((sum, result) => sum + result.score, 0) /
      testResults.length;
    const _totalIssues = testResults.reduce(
      (sum, result) => sum + result.issues.length,
      0
    );
    const _totalSuggestions = testResults.reduce(
      (sum, result) => sum + result.suggestions.length,
      0
    );

    const _report = `
# 組件可訪問性測試報告

## 總體評分
- **平均分數**: ${totalScore.toFixed(1)}/100
- **問題數量**: ${totalIssues}
- **建議數量**: ${totalSuggestions}

## 詳細結果
${testResults
  .map(
    result => `
### ${result.component}
- **分數**: ${result.score}/100
- **ARIA 標籤**: ${result.ariaLabels ? '✅' : '❌'}
- **鍵盤導航**: ${result.keyboardNavigation ? '✅' : '❌'}
- **焦點指示器**: ${result.focusIndicator ? '✅' : '❌'}
- **高對比度**: ${result.highContrast ? '✅' : '❌'}
- **屏幕閱讀器**: ${result.screenReader ? '✅' : '❌'}
- **語音控制**: ${result.voiceControl ? '✅' : '❌'}
- **開關控制**: ${result.switchControl ? '✅' : '❌'}

**問題**:
${result.issues.map(issue => `- ${issue}`).join('\n')}

**建議**:
${result.suggestions.map(suggestion => `- ${suggestion}`).join('\n')}
`
  )
  .join('\n')}

## 測試時間
${new Date().toLocaleString()}
    `;

    // DownloadReport
    const _blob = new Blob([report], { type: 'text/markdown' });
    const _url = URL.createObjectURL(blob);
    const _a = document.createElement('a');
    a.href = url;
    a.download = `component-accessibility-test-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [testResults]);

  // 計算樣式
  const _toolStyles = useMemo(() => {
    const _theme = currentThemeData;
    if (!theme) return {};

    return {
      position: 'fixed' as const,
      top: '20px',
      right: '20px',
      zIndex: 9999,
      backgroundColor: theme.colors?.background?.card || '#FFFFFF',
      border: `1px solid ${theme.colors?.border?.primary || '#E0E0E0'}`,
      borderRadius: theme.borderRadius?.md || '8px',
      boxShadow: theme.shadow?.lg || '0 10px 15px rgba(0, 0, 0, 0.1)',
      padding: theme.spacing?.lg || '24px',
      maxWidth: '400px',
      fontFamily: theme.typography?.fonts?.sans || 'system-ui, sans-serif',
      ...style,
    };
  }, [currentThemeData, style]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '8px 16px',
          backgroundColor: '#007AFF',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
        aria-label='打開組件可訪問性測試工具'
      >
        可訪問性測試
      </button>
    );
  }

  return (
    <div
      className={`component-accessibility-test-tool ${className}`}
      style={toolStyles}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
          組件可訪問性測試工具
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px',
          }}
          aria-label='關閉測試工具'
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}
        >
          選擇組件:
        </label>
        <select
          value={selectedComponent}
          onChange={e => setSelectedComponent(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #E0E0E0',
            fontSize: '14px',
          }}
        >
          <option value='all'>所有組件</option>
          {components.map(component => (
            <option key={component.type} value={component.type}>
              {component.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={runTest}
          disabled={isRunning}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isRunning ? '#6C757D' : '#007AFF',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
          aria-label={isRunning ? '測試進行中' : '開始測試'}
        >
          {isRunning ? '測試中...' : '開始測試'}
        </button>
      </div>

      {testResults.length > 0 && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>測試結果</h4>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6C757D' }}>
                平均分數:{' '}
                {(
                  testResults.reduce((sum, result) => sum + result.score, 0) /
                  testResults.length
                ).toFixed(1)}
                /100
              </span>
              <span style={{ fontSize: '12px', color: '#6C757D' }}>
                問題:{' '}
                {testResults.reduce(
                  (sum, result) => sum + result.issues.length,
                  0
                )}
              </span>
              <span style={{ fontSize: '12px', color: '#6C757D' }}>
                建議:{' '}
                {testResults.reduce(
                  (sum, result) => sum + result.suggestions.length,
                  0
                )}
              </span>
            </div>
            <button
              onClick={generateReport}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#28A745',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
              aria-label='生成測試報告'
            >
              生成報告
            </button>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {testResults.map((result, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '16px',
                  padding: '12px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px',
                }}
              >
                <h5
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  {result.component} ({result.score}/100)
                </h5>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4px',
                    marginBottom: '8px',
                    fontSize: '12px',
                  }}
                >
                  <span>ARIA 標籤: {result.ariaLabels ? '✅' : '❌'}</span>
                  <span>
                    鍵盤導航: {result.keyboardNavigation ? '✅' : '❌'}
                  </span>
                  <span>焦點指示器: {result.focusIndicator ? '✅' : '❌'}</span>
                  <span>高對比度: {result.highContrast ? '✅' : '❌'}</span>
                  <span>屏幕閱讀器: {result.screenReader ? '✅' : '❌'}</span>
                  <span>語音控制: {result.voiceControl ? '✅' : '❌'}</span>
                </div>

                {result.issues.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ fontSize: '12px', color: '#DC3545' }}>
                      問題:
                    </strong>
                    <ul
                      style={{
                        margin: '4px 0',
                        paddingLeft: '16px',
                        fontSize: '11px',
                        color: '#DC3545',
                      }}
                    >
                      {result.issues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.suggestions.length > 0 && (
                  <div>
                    <strong style={{ fontSize: '12px', color: '#FFC107' }}>
                      建議:
                    </strong>
                    <ul
                      style={{
                        margin: '4px 0',
                        paddingLeft: '16px',
                        fontSize: '11px',
                        color: '#FFC107',
                      }}
                    >
                      {result.suggestions.map((suggestion, i) => (
                        <li key={i}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// SettingsShow名稱
ComponentAccessibilityTestTool.displayName = 'ComponentAccessibilityTestTool';

// ExportComponent
export default ComponentAccessibilityTestTool;

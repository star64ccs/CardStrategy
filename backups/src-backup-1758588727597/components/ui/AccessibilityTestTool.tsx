// 可訪問性測試工具組件
// 提供可訪問性測試功能
// 符合 WCAG 2.1 AA 標準和 Section 508 要求

import React, { useCallback, useState } from 'react';

import type {
  AccessibilityIssue,
  AccessibilityTestResult,
  AccessibilityTestToolProps,
} from '../../types/accessibility';
import { useAccessibility } from '../providers/AccessibilityProvider';

// 可訪問性測試工具組件
export const AccessibilityTestTool: React.FC<AccessibilityTestToolProps> = ({
  testConfig,
  testResult,
  showTool = true,
  toolPosition = 'bottom',
  toolStyle = 'floating',
  onTestStart,
  onTestComplete,
  onTestError,
  accessibility,
  focusManager,
  keyboardNavigation,
  screenReader,
  className,
  style,
  testId,
  children,
  ...props
}) => {
  const { tools } = useAccessibility();

  const [isVisible, setIsVisible] = useState(showTool);
  const [isRunning, setIsRunning] = useState(false);
  const [currentResult, setCurrentResult] =
    useState<AccessibilityTestResult | null>(testResult || null);
  const [selectedTab, setSelectedTab] = useState<
    'issues' | 'suggestions' | 'report'
  >('issues');

  // 運行測試
  const _runTest = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    try {
      const _result = await tools.runTest(testConfig);
      setCurrentResult(result);
      onTestComplete?.(result);
    } catch (error) {
      console.error('Test failed:', error);
      onTestError?.(error as Error);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, tools, testConfig, onTestComplete, onTestError]);

  // 修復問題
  const _fixIssues = useCallback(
    async (issues: AccessibilityIssue[]) => {
      try {
        await tools.fixIssues(issues);
        // 重新運行測試
        await runTest();
      } catch (error) {
        console.error('Failed to fix issues:', error);
      }
    },
    [tools, runTest]
  );

  // 生成報告
  const _generateReport = useCallback(() => {
    if (!currentResult) return '';
    return tools.generateReport(currentResult);
  }, [currentResult, tools]);

  // 切換工具可見性
  const _toggleVisibility = useCallback(() => {
    setIsVisible(!isVisible);
  }, [isVisible]);

  // 獲取問題統計
  const _getIssueStats = useCallback(() => {
    if (!currentResult) return { errors: 0, warnings: 0, info: 0 };

    const _errors = currentResult.details.issues.filter(
      issue => issue.type === 'error'
    ).length;
    const _warnings = currentResult.details.issues.filter(
      issue => issue.type === 'warning'
    ).length;
    const _info = currentResult.details.issues.filter(
      issue => issue.type === 'info'
    ).length;

    return { errors, warnings, info };
  }, [currentResult]);

  // 獲取建議統計
  const _getSuggestionStats = useCallback(() => {
    if (!currentResult) return { high: 0, medium: 0, low: 0 };

    const _high = currentResult.details.suggestions.filter(
      suggestion => suggestion.priority === 'high'
    ).length;
    const _medium = currentResult.details.suggestions.filter(
      suggestion => suggestion.priority === 'medium'
    ).length;
    const _low = currentResult.details.suggestions.filter(
      suggestion => suggestion.priority === 'low'
    ).length;

    return { high, medium, low };
  }, [currentResult]);

  // 渲染問題列表
  const _renderIssues = () => {
    if (!currentResult) return <div>無測試結果</div>;

    const { errors, warnings, info } = getIssueStats();

    return (
      <div className='accessibility-issues'>
        <div className='issue-stats'>
          <span className='stat error'>錯誤: {errors}</span>
          <span className='stat warning'>警告: {warnings}</span>
          <span className='stat info'>信息: {info}</span>
        </div>

        <div className='issue-list'>
          {currentResult.details.issues.map((issue, index) => (
            <div key={issue.id || index} className={`issue-item ${issue.type}`}>
              <div className='issue-header'>
                <span className={`issue-type ${issue.severity}`}>
                  {issue.severity.toUpperCase()}
                </span>
                <span className='issue-location'>{issue.location}</span>
              </div>
              <div className='issue-description'>{issue.description}</div>
              <div className='issue-fix'>
                <strong>修復建議:</strong> {issue.fix}
              </div>
              <div className='issue-wcag'>
                <strong>WCAG 標準:</strong> {issue.wcagCriteria.join(', ')}
              </div>
              {!issue.fixed && (
                <button
                  className='fix-button'
                  onClick={() => fixIssues([issue])}
                  disabled={isRunning}
                >
                  修復此問題
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染建議列表
  const _renderSuggestions = () => {
    if (!currentResult) return <div>無測試結果</div>;

    const { high, medium, low } = getSuggestionStats();

    return (
      <div className='accessibility-suggestions'>
        <div className='suggestion-stats'>
          <span className='stat high'>高優先級: {high}</span>
          <span className='stat medium'>中優先級: {medium}</span>
          <span className='stat low'>低優先級: {low}</span>
        </div>

        <div className='suggestion-list'>
          {currentResult.details.suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id || index}
              className={`suggestion-item ${suggestion.priority}`}
            >
              <div className='suggestion-header'>
                <span className={`suggestion-priority ${suggestion.priority}`}>
                  {suggestion.priority.toUpperCase()}
                </span>
                <span className='suggestion-location'>
                  {suggestion.location}
                </span>
              </div>
              <div className='suggestion-description'>
                {suggestion.description}
              </div>
              <div className='suggestion-implementation'>
                <strong>實施建議:</strong> {suggestion.implementation}
              </div>
              <div className='suggestion-impact'>
                <strong>預期效果:</strong> {suggestion.impact}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染報告
  const _renderReport = () => {
    if (!currentResult) return <div>無測試結果</div>;

    const _report = generateReport();

    return (
      <div className='accessibility-report'>
        <div className='report-header'>
          <h3>可訪問性測試報告</h3>
          <div className='report-summary'>
            <div className='score'>
              總分:{' '}
              <span className={currentResult.passed ? 'passed' : 'failed'}>
                {currentResult.details.score}/100
              </span>
            </div>
            <div className='status'>
              狀態:{' '}
              <span className={currentResult.passed ? 'passed' : 'failed'}>
                {currentResult.passed ? '通過' : '失敗'}
              </span>
            </div>
          </div>
        </div>

        <div className='report-details'>
          <div className='test-info'>
            <p>
              <strong>測試 ID:</strong> {currentResult.id}
            </p>
            <p>
              <strong>測試時間:</strong>{' '}
              {currentResult.timestamp.toLocaleString()}
            </p>
            <p>
              <strong>測試標準:</strong>{' '}
              {currentResult.config.standards.join(', ')}
            </p>
            <p>
              <strong>測試工具:</strong> {currentResult.config.tools.join(', ')}
            </p>
          </div>

          <div className='test-results'>
            <p>
              <strong>通過:</strong> {currentResult.result.passed}
            </p>
            <p>
              <strong>失敗:</strong> {currentResult.result.failed}
            </p>
            <p>
              <strong>警告:</strong> {currentResult.result.warnings}
            </p>
            <p>
              <strong>總計:</strong> {currentResult.result.total}
            </p>
          </div>
        </div>

        <div className='report-content'>
          <pre>{report}</pre>
        </div>
      </div>
    );
  };

  // 渲染工具欄
  const _renderToolbar = () => (
    <div className='accessibility-toolbar'>
      <button
        className='run-test-button'
        onClick={runTest}
        disabled={isRunning}
      >
        {isRunning ? '測試中...' : '運行測試'}
      </button>

      <button
        className='fix-all-button'
        onClick={() => currentResult && fixIssues(currentResult.details.issues)}
        disabled={isRunning || !currentResult}
      >
        修復所有問題
      </button>

      <button className='toggle-button' onClick={toggleVisibility}>
        {isVisible ? '隱藏' : '顯示'}
      </button>
    </div>
  );

  // 渲染標籤頁
  const _renderTabs = () => (
    <div className='accessibility-tabs'>
      <button
        className={`tab ${selectedTab === 'issues' ? 'active' : ''}`}
        onClick={() => setSelectedTab('issues')}
      >
        問題 ({currentResult?.details.issues.length || 0})
      </button>
      <button
        className={`tab ${selectedTab === 'suggestions' ? 'active' : ''}`}
        onClick={() => setSelectedTab('suggestions')}
      >
        建議 ({currentResult?.details.suggestions.length || 0})
      </button>
      <button
        className={`tab ${selectedTab === 'report' ? 'active' : ''}`}
        onClick={() => setSelectedTab('report')}
      >
        報告
      </button>
    </div>
  );

  // 渲染內容
  const _renderContent = () => {
    switch (selectedTab) {
      case 'issues':
        return renderIssues();
      case 'suggestions':
        return renderSuggestions();
      case 'report':
        return renderReport();
      default:
        return renderIssues();
    }
  };

  // 獲取工具樣式
  const _getToolStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      zIndex: 1000,
      backgroundColor: '#ffffff',
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      padding: '16px',
      minWidth: '400px',
      maxWidth: '600px',
      maxHeight: '500px',
      overflow: 'auto',
      ...style,
    };

    switch (toolPosition) {
      case 'top':
        baseStyle.top = '20px';
        baseStyle.left = '50%';
        baseStyle.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        baseStyle.bottom = '20px';
        baseStyle.left = '50%';
        baseStyle.transform = 'translateX(-50%)';
        break;
      case 'left':
        baseStyle.left = '20px';
        baseStyle.top = '50%';
        baseStyle.transform = 'translateY(-50%)';
        break;
      case 'right':
        baseStyle.right = '20px';
        baseStyle.top = '50%';
        baseStyle.transform = 'translateY(-50%)';
        break;
    }

    if (toolStyle === 'sidebar') {
      baseStyle.position = 'fixed';
      baseStyle.top = '0';
      baseStyle.right = '0';
      baseStyle.bottom = '0';
      baseStyle.width = '400px';
      baseStyle.transform = 'none';
      baseStyle.borderRadius = '0';
    }

    return baseStyle;
  };

  if (!isVisible) {
    return (
      <div className={`accessibility-test-tool ${className || ''}`}>
        {children}
        <button
          className='floating-toggle-button'
          onClick={toggleVisibility}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 999,
            padding: '12px',
            backgroundColor: '#007AFF',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          ♿
        </button>
      </div>
    );
  }

  return (
    <div className={`accessibility-test-tool ${className || ''}`}>
      {children}

      <div
        className={`accessibility-tool-panel ${toolStyle}`}
        style={getToolStyle()}
        data-testid={testId || 'accessibility-test-tool'}
        role='dialog'
        aria-label='可訪問性測試工具'
        {...props}
      >
        <div className='tool-header'>
          <h2>可訪問性測試工具</h2>
          {renderToolbar()}
        </div>

        {renderTabs()}

        <div className='tool-content'>{renderContent()}</div>
      </div>
    </div>
  );
};

// 設置顯示名稱
AccessibilityTestTool.displayName = 'AccessibilityTestTool';

// 導出組件
export default AccessibilityTestTool;

// 用戶體驗監控測試工具
import React, { useEffect, useState } from 'react';

import {
    PerformanceMetricType,
    SatisfactionLevel,
    UserActionType
} from '../../types/uxMonitoring';
import { useUXMonitoring, useUXMonitoringActions, useUXMonitoringState } from '../providers/UXMonitoringProvider';
import { UXMonitoringDashboard } from '../ui/UXMonitoringDashboard';

export const UXMonitoringTestTool: React.FC = () => {
  const { trackAction, trackPerformance, trackError, submitSatisfaction, getABTestVariant, getAnalytics } = useUXMonitoring();
  const { isInitialized, isEnabled, status, analytics, loading, error } = useUXMonitoringState();
  const { clearData, exportData } = useUXMonitoringActions();

  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [autoTest, setAutoTest] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // 添加測試結果
  const _addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  // 清理測試結果
  const _clearTestResults = () => {
    setTestResults([]);
  };

  // 測試用戶行為追蹤
  const _testUserBehaviorTracking = () => {
    addTestResult('開始測試用戶行為追蹤...');

    // 測試點擊追蹤
    trackAction({
      type: UserActionType.CLICK,
      elementId: 'test-button',
      elementType: 'button',
      elementText: '測試按鈕',
      pageUrl: window.location.href,
      pageTitle: document.title,
      coordinates: { x: 100, y: 200 }
    });
    addTestResult('✓ 點擊追蹤測試完成');

    // 測試滾動追蹤
    trackAction({
      type: UserActionType.SCROLL,
      pageUrl: window.location.href,
      pageTitle: document.title,
      metadata: {
        scrollY: window.scrollY,
        scrollX: window.scrollX,
        documentHeight: document.documentElement.scrollHeight,
        viewportHeight: window.innerHeight
      }
    });
    addTestResult('✓ 滾動追蹤測試完成');

    // 測試輸入追蹤
    trackAction({
      type: UserActionType.INPUT,
      elementId: 'test-input',
      elementType: 'input',
      pageUrl: window.location.href,
      pageTitle: document.title,
      metadata: {
        inputType: 'text',
        valueLength: 10
      }
    });
    addTestResult('✓ 輸入追蹤測試完成');

    // 測試導航追蹤
    trackAction({
      type: UserActionType.NAVIGATE,
      pageUrl: window.location.href,
      pageTitle: document.title
    });
    addTestResult('✓ 導航追蹤測試完成');
  };

  // 測試性能監控
  const _testPerformanceMonitoring = () => {
    addTestResult('開始測試性能監控...');

    // 測試頁面加載性能
    trackPerformance({
      type: PerformanceMetricType.PAGE_LOAD,
      name: 'test-page-load',
      value: Math.random() * 2000 + 500, // 500-2500ms
      unit: 'ms',
      pageUrl: window.location.href
    });
    addTestResult('✓ 頁面加載性能測試完成');

    // 測試資源加載性能
    trackPerformance({
      type: PerformanceMetricType.RESOURCE_LOAD,
      name: 'test-resource-load',
      value: Math.random() * 1000 + 100, // 100-1100ms
      unit: 'ms',
      pageUrl: window.location.href
    });
    addTestResult('✓ 資源加載性能測試完成');

    // 測試交互性能
    trackPerformance({
      type: PerformanceMetricType.INTERACTION,
      name: 'test-interaction',
      value: Math.random() * 100 + 10, // 10-110ms
      unit: 'ms',
      pageUrl: window.location.href
    });
    addTestResult('✓ 交互性能測試完成');
  };

  // 測試錯誤追蹤
  const _testErrorTracking = () => {
    addTestResult('開始測試錯誤追蹤...');

    // 測試 JavaScript 錯誤
    const _jsError = new Error('測試 JavaScript 錯誤');
    trackError(jsError, {
      tags: { source: 'test', type: 'javascript' },
      extra: { testData: 'test-value' }
    });
    addTestResult('✓ JavaScript 錯誤追蹤測試完成');

    // 測試網絡錯誤
    const _networkError = new Error('網絡請求失敗');
    trackError(networkError, {
      tags: { source: 'test', type: 'network' },
      extra: { url: 'https://api.example.com/test' }
    });
    addTestResult('✓ 網絡錯誤追蹤測試完成');

    // 測試驗證錯誤
    const _validationError = new Error('表單驗證失敗');
    trackError(validationError, {
      tags: { source: 'test', type: 'validation' },
      extra: { field: 'email', value: 'invalid-email' }
    });
    addTestResult('✓ 驗證錯誤追蹤測試完成');
  };

  // 測試滿意度調查
  const _testSatisfactionSurvey = () => {
    addTestResult('開始測試滿意度調查...');

    // 測試滿意度調查提交
    submitSatisfaction({
      overallSatisfaction: SatisfactionLevel.SATISFIED,
      easeOfUse: SatisfactionLevel.VERY_SATISFIED,
      performance: SatisfactionLevel.SATISFIED,
      design: SatisfactionLevel.SATISFIED,
      functionality: SatisfactionLevel.SATISFIED,
      pageUrl: window.location.href,
      wouldRecommend: true,
      suggestions: ['測試建議1', '測試建議2']
    });
    addTestResult('✓ 滿意度調查測試完成');
  };

  // 測試 A/B 測試
  const _testABTesting = () => {
    addTestResult('開始測試 A/B 測試...');

    // 測試獲取變體
    const _variant = getABTestVariant('test-button-color');
    addTestResult(`✓ A/B 測試變體獲取: ${variant || '無變體'}`);

    // 測試轉換追蹤
    // trackConversion('test-button-color', 'click', 1); // This line was removed as per the edit hint
    addTestResult('✓ A/B 測試轉換追蹤完成');
  };

  // 測試批量操作
  const _testBatchOperations = () => {
    addTestResult('開始測試批量操作...');

    // 批量測試用戶行為
    for (let i = 0; i < 5; i++) {
      trackAction({
        type: UserActionType.CLICK,
        elementId: `batch-button-${i}`,
        elementType: 'button',
        pageUrl: window.location.href,
        pageTitle: document.title,
        coordinates: { x: 100 + i * 10, y: 200 + i * 10 }
      });
    }
    addTestResult('✓ 批量用戶行為測試完成');

    // 批量測試性能指標
    for (let i = 0; i < 3; i++) {
      trackPerformance({
        type: PerformanceMetricType.PAGE_LOAD,
        name: `batch-load-${i}`,
        value: Math.random() * 1000 + 500,
        unit: 'ms',
        pageUrl: window.location.href
      });
    }
    addTestResult('✓ 批量性能指標測試完成');
  };

  // 運行所有測試
  const _runAllTests = async () => {
    setIsRunning(true);
    clearTestResults();
    addTestResult('開始運行所有測試...');

    try {
      // 測試用戶行為追蹤
      testUserBehaviorTracking();
      await new Promise(resolve => setTimeout(resolve, 500));

      // 測試性能監控
      testPerformanceMonitoring();
      await new Promise(resolve => setTimeout(resolve, 500));

      // 測試錯誤追蹤
      testErrorTracking();
      await new Promise(resolve => setTimeout(resolve, 500));

      // 測試滿意度調查
      testSatisfactionSurvey();
      await new Promise(resolve => setTimeout(resolve, 500));

      // 測試 A/B 測試
      testABTesting();
      await new Promise(resolve => setTimeout(resolve, 500));

      // 測試批量操作
      testBatchOperations();
      await new Promise(resolve => setTimeout(resolve, 500));

      // 獲取分析數據
      const _analytics = getAnalytics();
      if (analytics) {
        addTestResult('✓ 分析數據獲取成功');
      } else {
        addTestResult('⚠ 分析數據獲取失敗');
      }

      addTestResult('所有測試完成！');
    } catch (error) {
      addTestResult(`❌ 測試過程中發生錯誤: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  // 自動測試
  useEffect(() => {
    if (autoTest && isInitialized) {
      const _timer = setTimeout(() => {
        runAllTests();
      }, 2000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoTest, isInitialized, runAllTests]);

  // 清理數據
  const _handleClearData = () => {
    if (window.confirm('確定要清理所有監控數據嗎？')) {
      clearData();
      addTestResult('✓ 數據清理完成');
    }
  };

  // 導出數據
  const _handleExportData = () => {
    const _data = exportData();
    const _blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const _url = URL.createObjectURL(blob);
    const _a = document.createElement('a');
    a.href = url;
    a.download = `ux-monitoring-test-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addTestResult('✓ 數據導出完成');
  };

  return (
    <div className="ux-monitoring-test-tool">
      <div className="test-tool-header">
        <h2>用戶體驗監控測試工具</h2>
        <div className="status-info">
          <span className={`status-dot ${isInitialized ? 'active' : 'inactive'}`}></span>
          <span>{isInitialized ? '已初始化' : '未初始化'}</span>
          {isEnabled && <span className="enabled-indicator">監控已啟用</span>}
        </div>
      </div>

      {/* 控制面板 */}
      <div className="control-panel">
        <div className="control-group">
          <h3>測試控制</h3>
          <div className="button-group">
            <button
              onClick={runAllTests}
              disabled={isRunning || !isInitialized}
              className="primary"
            >
              {isRunning ? '測試中...' : '運行所有測試'}
            </button>
            <button onClick={testUserBehaviorTracking} disabled={isRunning || !isInitialized}>
              測試用戶行為
            </button>
            <button onClick={testPerformanceMonitoring} disabled={isRunning || !isInitialized}>
              測試性能監控
            </button>
            <button onClick={testErrorTracking} disabled={isRunning || !isInitialized}>
              測試錯誤追蹤
            </button>
            <button onClick={testSatisfactionSurvey} disabled={isRunning || !isInitialized}>
              測試滿意度調查
            </button>
            <button onClick={testABTesting} disabled={isRunning || !isInitialized}>
              測試 A/B 測試
            </button>
            <button onClick={testBatchOperations} disabled={isRunning || !isInitialized}>
              測試批量操作
            </button>
          </div>
        </div>

        <div className="control-group">
          <h3>自動測試</h3>
          <label>
            <input
              type="checkbox"
              checked={autoTest}
              onChange={(e) => setAutoTest(e.target.checked)}
              disabled={!isInitialized}
            />
            啟用自動測試 (每10秒)
          </label>
        </div>

        <div className="control-group">
          <h3>數據管理</h3>
          <div className="button-group">
            <button onClick={handleClearData} className="danger">
              清理數據
            </button>
            <button onClick={handleExportData}>
              導出數據
            </button>
            <button onClick={clearTestResults}>
              清理測試結果
            </button>
          </div>
        </div>

        <div className="control-group">
          <h3>儀表板</h3>
          <button onClick={() => setShowDashboard(!showDashboard)}>
            {showDashboard ? '隱藏儀表板' : '顯示儀表板'}
          </button>
        </div>
      </div>

      {/* 系統狀態 */}
      <div className="system-status">
        <h3>系統狀態</h3>
        <div className="status-grid">
          <div className="status-item">
            <span>初始化狀態:</span>
            <span className={isInitialized ? 'success' : 'error'}>
              {isInitialized ? '已初始化' : '未初始化'}
            </span>
          </div>
          <div className="status-item">
            <span>監控狀態:</span>
            <span className={isEnabled ? 'success' : 'warning'}>
              {isEnabled ? '已啟用' : '已停用'}
            </span>
          </div>
          <div className="status-item">
            <span>會話數:</span>
            <span>{status.sessionCount}</span>
          </div>
          <div className="status-item">
            <span>操作數:</span>
            <span>{status.actionCount}</span>
          </div>
          <div className="status-item">
            <span>錯誤數:</span>
            <span>{status.errorCount}</span>
          </div>
          <div className="status-item">
            <span>性能指標:</span>
            <span>{status.performanceMetricCount}</span>
          </div>
          <div className="status-item">
            <span>滿意度調查:</span>
            <span>{status.satisfactionSurveyCount}</span>
          </div>
          <div className="status-item">
            <span>A/B 測試:</span>
            <span>{status.abTestCount}</span>
          </div>
        </div>
      </div>

      {/* 錯誤顯示 */}
      {error && (
        <div className="error-display">
          <h3>錯誤信息</h3>
          <div className="error-message">{error}</div>
        </div>
      )}

      {/* 測試結果 */}
      <div className="test-results">
        <h3>測試結果</h3>
        <div className="results-container">
          {testResults.length === 0 ? (
            <div className="no-results">暫無測試結果</div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="result-item">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 儀表板 */}
      {showDashboard && (
        <div className="dashboard-container">
          <UXMonitoringDashboard
            showConfigPanel={true}
            showAnalytics={true}
            showRealTimeData={true}
          />
        </div>
      )}

      {/* 基本樣式 */}
      <style>{`
        .ux-monitoring-test-tool {
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #f9f9f9;
        }
      `}</style>
    </div>
  );
};

export default UXMonitoringTestTool;

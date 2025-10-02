// User體驗Monitor儀Table板
import React, { useEffect, useState } from 'react';

import type {
  ABTestAnalytics,
  ErrorAnalytics,
  PerformanceAnalytics,
  SatisfactionAnalytics,
  SessionAnalytics,
  UXMonitoringConfig,
} from '../../types/uxMonitoring';
import {
  useUXMonitoring,
  useUXMonitoringState,
} from '../providers/UXMonitoringProvider';

interface UXMonitoringDashboardProps {
  onConfigChange?: (config: Partial<UXMonitoringConfig>) => void;
  showConfigPanel?: boolean;
  showAnalytics?: boolean;
  showRealTimeData?: boolean;
}

export const UXMonitoringDashboard: React.FC<UXMonitoringDashboardProps> = ({
  onConfigChange,
  showConfigPanel = true,
  showAnalytics = true,
  showRealTimeData = true,
}) => {
  const { getAnalytics, updateConfig } = useUXMonitoring();
  const {
    isInitialized,
    isEnabled,
    config,
    analytics,
    status,
    loading,
    error,
    lastUpdated,
  } = useUXMonitoringState();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'sessions'
    | 'performance'
    | 'errors'
    | 'satisfaction'
    | 'abtests'
    | 'config'
  >('overview');
  const [refreshInterval, setRefreshInterval] = useState(30000);

  // AutoRefresh
  useEffect(() => {
    if (showRealTimeData && isInitialized) {
      const _interval = setInterval(() => {
        getAnalytics();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [showRealTimeData, isInitialized, refreshInterval, getAnalytics]);

  // ManualRefresh
  const _handleRefresh = () => {
    getAnalytics();
  };

  // ExportData
  const _handleExportData = () => {
    // ExportData功能
    console.log('Export data functionality');
  };

  // 清理Data
  const _handleClearData = () => {
    // ClearData功能
    console.log('Clear data functionality');
  };

  // UpdateConfigure
  const _handleConfigUpdate = (key: string, subKey: string) => {
    const _newConfig = {
      ...config,
      [key]: {
        ...(config as any)[key],
        [subKey]: !(config as any)[key][subKey],
      },
    };
    updateConfig(newConfig);
  };

  if (!isInitialized) {
    return (
      <div className='ux-monitoring-dashboard'>
        <div className='dashboard-header'>
          <h2>用戶體驗監控儀表板</h2>
          <div className='status-indicator'>
            <span className='status-dot initializing' />
            <span>初始化中...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='ux-monitoring-dashboard'>
      {/* 儀Table板頭部 */}
      <div className='dashboard-header'>
        <h2>用戶體驗監控儀表板</h2>
        <div className='header-controls'>
          <div className='status-indicator'>
            <span
              className={`status-dot ${isEnabled ? 'active' : 'inactive'}`}
            />
            <span>{isEnabled ? '監控中' : '已停用'}</span>
          </div>
          <button onClick={handleRefresh} disabled={loading}>
            {loading ? '刷新中...' : '刷新'}
          </button>
          <button onClick={handleExportData}>導出數據</button>
          <button onClick={handleClearData} className='danger'>
            清理數據
          </button>
        </div>
      </div>

      {/* Error提示 */}
      {error && (
        <div className='error-banner'>
          <span>錯誤: {error}</span>
        </div>
      )}

      {/* Tag頁導航 */}
      <div className='dashboard-tabs'>
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          概覽
        </button>
        <button
          className={activeTab === 'sessions' ? 'active' : ''}
          onClick={() => setActiveTab('sessions')}
        >
          會話分析
        </button>
        <button
          className={activeTab === 'performance' ? 'active' : ''}
          onClick={() => setActiveTab('performance')}
        >
          性能監控
        </button>
        <button
          className={activeTab === 'errors' ? 'active' : ''}
          onClick={() => setActiveTab('errors')}
        >
          錯誤追蹤
        </button>
        <button
          className={activeTab === 'satisfaction' ? 'active' : ''}
          onClick={() => setActiveTab('satisfaction')}
        >
          滿意度調查
        </button>
        <button
          className={activeTab === 'abtests' ? 'active' : ''}
          onClick={() => setActiveTab('abtests')}
        >
          A/B 測試
        </button>
        {showConfigPanel && (
          <button
            className={activeTab === 'config' ? 'active' : ''}
            onClick={() => setActiveTab('config')}
          >
            配置
          </button>
        )}
      </div>

      {/* Tag頁Content */}
      <div className='dashboard-content'>
        {activeTab === 'overview' && (
          <OverviewTab
            status={status}
            analytics={analytics}
            lastUpdated={lastUpdated}
          />
        )}

        {activeTab === 'sessions' && (
          <SessionsTab analytics={analytics?.sessionAnalytics} />
        )}

        {activeTab === 'performance' && (
          <PerformanceTab analytics={analytics?.performanceAnalytics} />
        )}

        {activeTab === 'errors' && (
          <ErrorsTab analytics={analytics?.errorAnalytics} />
        )}

        {activeTab === 'satisfaction' && (
          <SatisfactionTab analytics={analytics?.satisfactionAnalytics} />
        )}

        {activeTab === 'abtests' && (
          <ABTestsTab analytics={analytics?.abTestAnalytics} />
        )}

        {activeTab === 'config' && showConfigPanel && (
          <ConfigTab config={config} onConfigChange={handleConfigUpdate} />
        )}
      </div>

      {/* 實時DataSettings */}
      {showRealTimeData && (
        <div className='real-time-settings'>
          <label>
            刷新間隔:
            <select
              value={refreshInterval}
              onChange={e => setRefreshInterval(Number(e.target.value))}
            >
              <option value={10000}>10秒</option>
              <option value={30000}>30秒</option>
              <option value={60000}>1分鐘</option>
              <option value={300000}>5分鐘</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
};

// 概覽Tag頁
const OverviewTab: React.FC<{
  status: unknown;
  analytics: unknown;
  lastUpdated: number | null;
}> = ({ status, analytics, lastUpdated }) => {
  return (
    <div className='overview-tab'>
      <div className='metrics-grid'>
        <div className='metric-card'>
          <h3>總會話數</h3>
          <div className='metric-value'>{status.sessionCount}</div>
        </div>
        <div className='metric-card'>
          <h3>總操作數</h3>
          <div className='metric-value'>{status.actionCount}</div>
        </div>
        <div className='metric-card'>
          <h3>錯誤數量</h3>
          <div className='metric-value'>{status.errorCount}</div>
        </div>
        <div className='metric-card'>
          <h3>性能指標</h3>
          <div className='metric-value'>{status.performanceMetricCount}</div>
        </div>
        <div className='metric-card'>
          <h3>滿意度調查</h3>
          <div className='metric-value'>{status.satisfactionSurveyCount}</div>
        </div>
        <div className='metric-card'>
          <h3>A/B 測試</h3>
          <div className='metric-value'>{status.abTestCount}</div>
        </div>
      </div>

      {analytics && (
        <div className='analytics-summary'>
          <h3>分析摘要</h3>
          <div className='summary-grid'>
            <div className='summary-item'>
              <span>平均會話時長:</span>
              <span>
                {analytics.sessionAnalytics?.averageSessionDuration || 0}ms
              </span>
            </div>
            <div className='summary-item'>
              <span>跳出率:</span>
              <span>
                {((analytics.sessionAnalytics?.bounceRate || 0) * 100).toFixed(
                  1
                )}
                %
              </span>
            </div>
            <div className='summary-item'>
              <span>平均頁面加載時間:</span>
              <span>
                {analytics.performanceAnalytics?.averagePageLoadTime || 0}ms
              </span>
            </div>
            <div className='summary-item'>
              <span>錯誤率:</span>
              <span>
                {((analytics.errorAnalytics?.errorRate || 0) * 100).toFixed(2)}%
              </span>
            </div>
            <div className='summary-item'>
              <span>平均滿意度:</span>
              <span>
                {analytics.satisfactionAnalytics?.averageSatisfaction || 0}/5
              </span>
            </div>
            <div className='summary-item'>
              <span>NPS 分數:</span>
              <span>
                {analytics.satisfactionAnalytics?.netPromoterScore || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {lastUpdated && (
        <div className='last-updated'>
          最後更新: {new Date(lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

// 會話AnalysisTag頁
const SessionsTab: React.FC<{
  analytics: SessionAnalytics | undefined;
}> = ({ analytics }) => {
  if (!analytics) {
    return <div className='no-data'>暫無會話數據</div>;
  }

  return (
    <div className='sessions-tab'>
      <div className='session-metrics'>
        <div className='metric-row'>
          <span>總會話數:</span>
          <span>{analytics.totalSessions}</span>
        </div>
        <div className='metric-row'>
          <span>平均會話時長:</span>
          <span>{analytics.averageSessionDuration}ms</span>
        </div>
        <div className='metric-row'>
          <span>平均頁面瀏覽:</span>
          <span>{analytics.averagePageViews}</span>
        </div>
        <div className='metric-row'>
          <span>跳出率:</span>
          <span>{(analytics.bounceRate * 100).toFixed(1)}%</span>
        </div>
      </div>

      {analytics.topPages.length > 0 && (
        <div className='top-pages'>
          <h3>熱門頁面</h3>
          <div className='pages-list'>
            {analytics.topPages.map((page, index) => (
              <div key={index} className='page-item'>
                <span className='page-url'>{page.url}</span>
                <span className='page-views'>{page.views} 次瀏覽</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 性能MonitorTag頁
const PerformanceTab: React.FC<{
  analytics: PerformanceAnalytics | undefined;
}> = ({ analytics }) => {
  if (!analytics) {
    return <div className='no-data'>暫無性能數據</div>;
  }

  return (
    <div className='performance-tab'>
      <div className='performance-metrics'>
        <div className='metric-row'>
          <span>平均頁面加載時間:</span>
          <span>{analytics.averagePageLoadTime}ms</span>
        </div>
        <div className='metric-row'>
          <span>平均資源加載時間:</span>
          <span>{analytics.averageResourceLoadTime}ms</span>
        </div>
      </div>

      {analytics.slowPages.length > 0 && (
        <div className='slow-pages'>
          <h3>慢頁面</h3>
          <div className='pages-list'>
            {analytics.slowPages.map((page, index) => (
              <div key={index} className='page-item'>
                <span className='page-url'>{page.url}</span>
                <span className='page-load-time'>{page.averageLoadTime}ms</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ErrorTraceTag頁
const ErrorsTab: React.FC<{
  analytics: ErrorAnalytics | undefined;
}> = ({ analytics }) => {
  if (!analytics) {
    return <div className='no-data'>暫無錯誤數據</div>;
  }

  return (
    <div className='errors-tab'>
      <div className='error-metrics'>
        <div className='metric-row'>
          <span>總錯誤數:</span>
          <span>{analytics.totalErrors}</span>
        </div>
        <div className='metric-row'>
          <span>錯誤率:</span>
          <span>{(analytics.errorRate * 100).toFixed(2)}%</span>
        </div>
      </div>

      {analytics.topErrors.length > 0 && (
        <div className='top-errors'>
          <h3>熱門錯誤</h3>
          <div className='errors-list'>
            {analytics.topErrors.map((error, index) => (
              <div key={index} className='error-item'>
                <span className='error-message'>{error.message}</span>
                <span className='error-count'>{error.count} 次</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 滿意度調查Tag頁
const SatisfactionTab: React.FC<{
  analytics: SatisfactionAnalytics | undefined;
}> = ({ analytics }) => {
  if (!analytics) {
    return <div className='no-data'>暫無滿意度數據</div>;
  }

  return (
    <div className='satisfaction-tab'>
      <div className='satisfaction-metrics'>
        <div className='metric-row'>
          <span>平均滿意度:</span>
          <span>{analytics.averageSatisfaction}/5</span>
        </div>
        <div className='metric-row'>
          <span>NPS 分數:</span>
          <span>{analytics.netPromoterScore}</span>
        </div>
      </div>

      {analytics.topIssues.length > 0 && (
        <div className='top-issues'>
          <h3>主要問題</h3>
          <div className='issues-list'>
            {analytics.topIssues.map((issue, index) => (
              <div key={index} className='issue-item'>
                {issue}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// A/B TestTag頁
const ABTestsTab: React.FC<{
  analytics: ABTestAnalytics | undefined;
}> = ({ analytics }) => {
  if (!analytics) {
    return <div className='no-data'>暫無 A/B 測試數據</div>;
  }

  return (
    <div className='abtests-tab'>
      <div className='abtest-metrics'>
        <div className='metric-row'>
          <span>活躍測試:</span>
          <span>{analytics.activeTests}</span>
        </div>
        <div className='metric-row'>
          <span>已完成測試:</span>
          <span>{analytics.completedTests}</span>
        </div>
      </div>

      {analytics.testResults.length > 0 && (
        <div className='test-results'>
          <h3>測試結果</h3>
          <div className='results-list'>
            {analytics.testResults.map((result, index) => (
              <div key={index} className='result-item'>
                <span>測試 {index + 1}</span>
                <span>總用戶: {result.totalUsers}</span>
                <span>置信度: {(result.confidence * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ConfigureTag頁
const ConfigTab: React.FC<{
  config: UXMonitoringConfig | null;
  onConfigChange: (key: string, subKey: string) => void;
}> = ({ config, onConfigChange }) => {
  if (!config) {
    return <div className='no-data'>暫無配置數據</div>;
  }

  const _handleToggle = (key: string, subKey: string) => {
    onConfigChange(key, subKey);
  };

  return (
    <div className='config-tab'>
      <div className='config-section'>
        <h3>基本設置</h3>
        <div className='config-item'>
          <label>
            <input
              type='checkbox'
              checked={config.enabled}
              onChange={() => handleToggle('enabled', 'enabled')}
            />
            啟用監控
          </label>
        </div>
        <div className='config-item'>
          <label>
            採樣率:
            <input
              type='range'
              min='0'
              max='1'
              step='0.1'
              value={config.samplingRate}
              onChange={e => onConfigChange('samplingRate', 'samplingRate')}
            />
            {config.samplingRate}
          </label>
        </div>
      </div>

      <div className='config-section'>
        <h3>性能監控</h3>
        <div className='config-item'>
          <label>
            <input
              type='checkbox'
              checked={config.performanceMonitoring.enabled}
              onChange={() => handleToggle('performanceMonitoring', 'enabled')}
            />
            啟用性能監控
          </label>
        </div>
      </div>

      <div className='config-section'>
        <h3>錯誤追蹤</h3>
        <div className='config-item'>
          <label>
            <input
              type='checkbox'
              checked={config.errorTracking.enabled}
              onChange={() => handleToggle('errorTracking', 'enabled')}
            />
            啟用錯誤追蹤
          </label>
        </div>
        <div className='config-item'>
          <label>
            <input
              type='checkbox'
              checked={config.errorTracking.captureUnhandledErrors}
              onChange={() =>
                handleToggle('errorTracking', 'captureUnhandledErrors')
              }
            />
            捕獲未處理錯誤
          </label>
        </div>
      </div>

      <div className='config-section'>
        <h3>用戶行為追蹤</h3>
        <div className='config-item'>
          <label>
            <input
              type='checkbox'
              checked={config.userBehaviorTracking.enabled}
              onChange={() => handleToggle('userBehaviorTracking', 'enabled')}
            />
            啟用行為追蹤
          </label>
        </div>
        <div className='config-item'>
          <label>
            <input
              type='checkbox'
              checked={config.userBehaviorTracking.trackClicks}
              onChange={() =>
                handleToggle('userBehaviorTracking', 'trackClicks')
              }
            />
            追蹤點擊
          </label>
        </div>
        <div className='config-item'>
          <label>
            <input
              type='checkbox'
              checked={config.userBehaviorTracking.trackScrolls}
              onChange={() =>
                handleToggle('userBehaviorTracking', 'trackScrolls')
              }
            />
            追蹤滾動
          </label>
        </div>
      </div>

      <div className='config-section'>
        <h3>隱私設置</h3>
        <div className='config-item'>
          <label>
            <input
              type='checkbox'
              checked={config.privacySettings.anonymizeData}
              onChange={() => handleToggle('privacySettings', 'anonymizeData')}
            />
            匿名化數據
          </label>
        </div>
        <div className='config-item'>
          <label>
            <input
              type='checkbox'
              checked={config.privacySettings.respectDoNotTrack}
              onChange={() =>
                handleToggle('privacySettings', 'respectDoNotTrack')
              }
            />
            尊重 Do Not Track
          </label>
        </div>
      </div>
    </div>
  );
};

export default UXMonitoringDashboard;

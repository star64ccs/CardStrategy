// 反饋系統TestTool
import React, { useState, useEffect } from 'react';

import type {
  FeedbackFilter,
  FeedbackSort
} from '../../types/feedback';
import {
  FeedbackType,
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
  SatisfactionRating
} from '../../types/feedback';
import { useFeedback, useFeedbackState, useFeedbackActions } from '../providers/FeedbackProvider';
import { FeedbackForm } from '../ui/FeedbackForm';

// 反饋TestToolComponent
export const FeedbackTestTool: React.FC = () => {
  const { submitFeedback, getFeedbacks, getAnalytics, loading, error } = useFeedback();
  const { feedbacks, analytics, notifications, reports } = useFeedbackState();
  const { fetchFeedbacks, fetchAnalytics } = useFeedbackActions();

  // TestStatus
  const [showForm, setShowForm] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [filters, setFilters] = useState<FeedbackFilter>({});
  const [sort, setSort] = useState<FeedbackSort>({ field: 'timestamp', direction: 'desc' });

  // AddTest結果
  const _addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  // ClearTest結果
  const _clearTestResults = () => {
    setTestResults([]);
  };

  // TestSubmit反饋
  const _testSubmitFeedback = async () => {
    try {
      const _testData = {
        type: FeedbackType.FEATURE_REQUEST,
        category: FeedbackCategory.FUNCTIONALITY,
        priority: FeedbackPriority.HIGH,
        title: '測試功能請求',
        description: '這是一個測試反饋，用於驗證反饋系統的功能。',
        userEmail: 'test@example.com',
        userName: '測試用戶',
        satisfactionRating: SatisfactionRating.SATISFIED,
        followUpRequired: true,
        attachments: [],
        tags: ['測試', '功能請求']
      };

      await submitFeedback(testData);
      addTestResult('✅ 反饋提交測試Success');
    } catch (error) {
      addTestResult(`❌ 反饋提交測試Failed: ${error}`);
    }
  };

  // TestGet反饋List
  const _testGetFeedbacks = async () => {
    try {
      const _result = await getFeedbacks(filters, sort);
      addTestResult(`✅ Get反饋列表Success，共 ${result.feedbacks.length} 條`);
    } catch (error) {
      addTestResult(`❌ Get反饋列表Failed: ${error}`);
    }
  };

  // TestGetAnalysisData
  const _testGetAnalytics = async () => {
    try {
      const _result = await getAnalytics(filters);
      addTestResult(`✅ Get分析數據Success，總反饋數: ${result.totalFeedbacks}`);
    } catch (error) {
      addTestResult(`❌ Get分析數據Failed: ${error}`);
    }
  };

  // TestBatchOperation
  const _testBatchOperations = async () => {
    try {
      // SubmitMultipleTest反饋
      const _testFeedbacks = [
        {
          type: FeedbackType.BUG_REPORT,
          category: FeedbackCategory.PERFORMANCE,
          priority: FeedbackPriority.CRITICAL,
          title: '性能問題測試',
          description: '測試性能相關的反饋',
          userEmail: 'test1@example.com',
          userName: '測試用戶1',
          satisfactionRating: SatisfactionRating.DISSATISFIED,
          followUpRequired: false,
          attachments: [],
          tags: ['測試', '性能']
        },
        {
          type: FeedbackType.USER_EXPERIENCE,
          category: FeedbackCategory.UI_UX,
          priority: FeedbackPriority.MEDIUM,
          title: '用戶體驗測試',
          description: '測試用戶體驗相關的反饋',
          userEmail: 'test2@example.com',
          userName: '測試用戶2',
          satisfactionRating: SatisfactionRating.VERY_SATISFIED,
          followUpRequired: true,
          attachments: [],
          tags: ['測試', 'UX']
        }
      ];

      for (const feedback of testFeedbacks) {
        await submitFeedback(feedback);
      }

      addTestResult('✅ 批量反饋提交測試Success');
    } catch (error) {
      addTestResult(`❌ 批量操作測試Failed: ${error}`);
    }
  };

  // TestFilter和Sort
  const _testFilterAndSort = async () => {
    try {
      const testFilters: FeedbackFilter = {
        types: [FeedbackType.FEATURE_REQUEST, FeedbackType.BUG_REPORT],
        priorities: [FeedbackPriority.HIGH, FeedbackPriority.CRITICAL],
        search: '測試'
      };

      const testSort: FeedbackSort = {
        field: 'priority',
        direction: 'desc'
      };

      const _result = await getFeedbacks(testFilters, testSort);
      addTestResult(`✅ 過濾和排序測試Success，結果: ${result.feedbacks.length} 條`);
    } catch (error) {
      addTestResult(`❌ 過濾和排序測試Failed: ${error}`);
    }
  };

  // 運Row所有Test
  const _runAllTests = async () => {
    clearTestResults();
    addTestResult('🚀 開始運行反饋系統測試...');

    await testSubmitFeedback();
    await testBatchOperations();
    await testGetFeedbacks();
    await testGetAnalytics();
    await testFilterAndSort();

    addTestResult('✅ 所有測試完成');
  };

  // Component加載時Get初始Data
  useEffect(() => {
    fetchFeedbacks();
    fetchAnalytics();
  }, [fetchFeedbacks, fetchAnalytics]);

  return (
    <div className="feedback-test-tool">
      <div className="feedback-test-tool__header">
        <h2>反饋系統測試工具</h2>
        <p>用於測試反饋系統的各項功能</p>
      </div>

      <div className="feedback-test-tool__content">
        {/* TestControl面板 */}
        <div className="feedback-test-tool__controls">
          <h3>測試控制</h3>
          <div className="feedback-test-tool__buttons">
            <button
              className="feedback-test-tool__btn feedback-test-tool__btn--primary"
              onClick={runAllTests}
              disabled={loading}
            >
              運行所有測試
            </button>
            <button
              className="feedback-test-tool__btn"
              onClick={testSubmitFeedback}
              disabled={loading}
            >
              測試提交反饋
            </button>
            <button
              className="feedback-test-tool__btn"
              onClick={testGetFeedbacks}
              disabled={loading}
            >
              測試獲取列表
            </button>
            <button
              className="feedback-test-tool__btn"
              onClick={testGetAnalytics}
              disabled={loading}
            >
              測試分析數據
            </button>
            <button
              className="feedback-test-tool__btn"
              onClick={testBatchOperations}
              disabled={loading}
            >
              測試批量操作
            </button>
            <button
              className="feedback-test-tool__btn"
              onClick={testFilterAndSort}
              disabled={loading}
            >
              測試過濾排序
            </button>
            <button
              className="feedback-test-tool__btn"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? '隱藏' : '顯示'} 反饋表單
            </button>
            <button
              className="feedback-test-tool__btn"
              onClick={clearTestResults}
            >
              清除測試結果
            </button>
          </div>
        </div>

        {/* 反饋Table單 */}
        {showForm && (
          <div className="feedback-test-tool__form">
            <h3>反饋表單測試</h3>
            <FeedbackForm
              onSubmit={(data) => {
                addTestResult(`✅ 表單提交Success: ${data.title}`);
              }}
              onCancel={() => {
                addTestResult('ℹ️ 表單取消');
              }}
            />
          </div>
        )}

        {/* 系統Status */}
        <div className="feedback-test-tool__status">
          <h3>系統狀態</h3>
          <div className="feedback-test-tool__status-grid">
            <div className="feedback-test-tool__status-item">
              <span className="feedback-test-tool__status-label">總反饋數:</span>
              <span className="feedback-test-tool__status-value">{feedbacks.length}</span>
            </div>
            <div className="feedback-test-tool__status-item">
              <span className="feedback-test-tool__status-label">通知數:</span>
              <span className="feedback-test-tool__status-value">{notifications.length}</span>
            </div>
            <div className="feedback-test-tool__status-item">
              <span className="feedback-test-tool__status-label">報告數:</span>
              <span className="feedback-test-tool__status-value">{reports.length}</span>
            </div>
            <div className="feedback-test-tool__status-item">
              <span className="feedback-test-tool__status-label">加載狀態:</span>
              <span className="feedback-test-tool__status-value">
                {loading ? '加載中...' : '就緒'}
              </span>
            </div>
          </div>
          {error && (
            <div className="feedback-test-tool__error">
              錯誤: {error}
            </div>
          )}
        </div>

        {/* AnalysisData */}
        {analytics && (
          <div className="feedback-test-tool__analytics">
            <h3>分析數據</h3>
            <div className="feedback-test-tool__analytics-grid">
              <div className="feedback-test-tool__analytics-item">
                <span className="feedback-test-tool__analytics-label">總反饋:</span>
                <span className="feedback-test-tool__analytics-value">{analytics.totalFeedbacks}</span>
              </div>
              <div className="feedback-test-tool__analytics-item">
                <span className="feedback-test-tool__analytics-label">平均滿意度:</span>
                <span className="feedback-test-tool__analytics-value">
                  {analytics.averageSatisfaction.toFixed(1)}
                </span>
              </div>
              <div className="feedback-test-tool__analytics-item">
                <span className="feedback-test-tool__analytics-label">高優先級:</span>
                <span className="feedback-test-tool__analytics-value">
                  {analytics.feedbacksByPriority[FeedbackPriority.HIGH] || 0}
                </span>
              </div>
              <div className="feedback-test-tool__analytics-item">
                <span className="feedback-test-tool__analytics-label">待處理:</span>
                <span className="feedback-test-tool__analytics-value">
                  {analytics.feedbacksByStatus[FeedbackStatus.PENDING] || 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Test結果 */}
        <div className="feedback-test-tool__results">
          <h3>測試結果</h3>
          <div className="feedback-test-tool__results-container">
            {testResults.length === 0 ? (
              <p className="feedback-test-tool__no-results">暫無測試結果</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="feedback-test-tool__result-item">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 反饋List */}
        <div className="feedback-test-tool__list">
          <h3>反饋列表 (最近5條)</h3>
          <div className="feedback-test-tool__list-container">
            {feedbacks.slice(0, 5).map((feedback) => (
              <div key={feedback.id} className="feedback-test-tool__feedback-item">
                <div className="feedback-test-tool__feedback-header">
                  <span className="feedback-test-tool__feedback-title">{feedback.title}</span>
                  <span className={`feedback-test-tool__feedback-priority feedback-test-tool__feedback-priority--${feedback.priority}`}>
                    {feedback.priority}
                  </span>
                </div>
                <div className="feedback-test-tool__feedback-meta">
                  <span className="feedback-test-tool__feedback-type">{feedback.type}</span>
                  <span className="feedback-test-tool__feedback-status">{feedback.status}</span>
                  <span className="feedback-test-tool__feedback-date">
                    {new Date(feedback.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="feedback-test-tool__feedback-description">
                  {feedback.description.substring(0, 100)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .feedback-test-tool {
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #f9f9f9;
        }
      `}</style>
    </div>
  );
};

// ExportComponent
export default FeedbackTestTool;

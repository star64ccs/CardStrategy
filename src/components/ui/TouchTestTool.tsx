import React, { useCallback, useState } from 'react';

import { useDesignSystem } from '../../hooks/useDesignSystem';
import { useResponsive } from '../../hooks/useResponsive';
import { touchService } from '../../services/touchService';
import type {
  TouchFeedbackType,
  TouchGestureType,
  TouchTestConfig,
  TouchTestResult,
  TouchTestToolProps,
} from '../../types/touch';

import { OptimizedScrollView } from './OptimizedScrollView';
import { ResponsiveTable } from './ResponsiveTable';
import { TouchFeedback } from './TouchFeedback';
import { TouchGesture } from './TouchGesture';

/**
 * 觸控TestToolComponent
 * 提供觸控手勢、反饋效果和滾動優化的Test功能
 */
export const TouchTestTool: React.FC<TouchTestToolProps> = ({
  config = {},
  onTestComplete,
  onTestError,
  className = '',
  style = {},
  visible = true,
}) => {
  const { currentThemeData } = useDesignSystem();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // StatusManage
  const [isVisible, setIsVisible] = useState(visible);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TouchTestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);

  // DefaultTestConfigure
  const defaultConfig: TouchTestConfig = {
    deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    platform: 'web',
    gestures: [
      'tap',
      'doubleTap',
      'longPress',
      'swipe',
      'pinch',
      'rotate',
      'pan',
    ],
    feedbackTypes: ['ripple', 'scale', 'opacity', 'color'],
    scrollOptimization: true,
    performance: true,
    accessibility: true,
  };

  const _finalConfig = { ...defaultConfig, ...config };

  // Test設備Configure
  const _testDevices = [
    { deviceType: 'mobile', platform: 'ios' },
    { deviceType: 'mobile', platform: 'android' },
    { deviceType: 'mobile', platform: 'web' },
    { deviceType: 'tablet', platform: 'ios' },
    { deviceType: 'tablet', platform: 'android' },
    { deviceType: 'tablet', platform: 'web' },
    { deviceType: 'desktop', platform: 'web' },
  ];

  // 運RowTest
  const _runTests = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setProgress(0);
    setTestResults([]);

    try {
      const results: TouchTestResult[] = [];
      const _totalTests = testDevices.length;

      for (let i = 0; i < testDevices.length; i++) {
        const _device = testDevices[i];
        setCurrentTest(`${device.deviceType} (${device.platform})`);

        const testConfig: TouchTestConfig = {
          ...finalConfig,
          deviceType: device.deviceType as any,
          platform: device.platform as any,
        };

        const _result = await touchService.runTouchTest(testConfig);
        results.push(result);

        setProgress(((i + 1) / totalTests) * 100);

        // 短暫延遲以Show進度
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setTestResults(results);

      if (onTestComplete) {
        onTestComplete(results[0]); // Return第一個結果作為示例
      }

      // 生成TestReport
      const _report = touchService.generateTestReport(results);
      console.log('Touch Test Report:', report);
    } catch (error) {
      console.error('Touch test failed:', error);
      if (onTestError) {
        onTestError(
          error instanceof Error ? error : new Error('Unknown error')
        );
      }
    } finally {
      setIsRunning(false);
      setCurrentTest('');
      setProgress(0);
    }
  }, [isRunning, finalConfig, onTestComplete, onTestError]);

  // 手勢TestHandle器
  const _handleGestureTest = useCallback((gesture: TouchGestureType) => {
    console.log(`Gesture test: ${gesture}`);
    touchService.trackPerformance('gesture-test', {
      gesture,
      timestamp: Date.now(),
    });
  }, []);

  // 反饋TestHandle器
  const _handleFeedbackTest = useCallback((feedback: TouchFeedbackType) => {
    console.log(`Feedback test: ${feedback}`);
    touchService.trackPerformance('feedback-test', {
      feedback,
      timestamp: Date.now(),
    });
  }, []);

  // 樣式計算
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    width: '400px',
    maxHeight: '80vh',
    backgroundColor: currentThemeData?.colors?.background?.primary || '#ffffff',
    border: `1px solid ${currentThemeData?.colors?.border || '#e0e0e0'}`,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    overflow: 'hidden',
    display: isVisible ? 'flex' : 'none',
    flexDirection: 'column',
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    padding: '12px 16px',
    backgroundColor: currentThemeData?.colors?.brand?.primary || '#007bff',
    color: '#ffffff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  };

  const contentStyle: React.CSSProperties = {
    padding: '16px',
    flex: 1,
    overflow: 'auto',
  };

  // Test結果Table格Column定義
  const _resultColumns = [
    {
      key: 'deviceType',
      title: '設備類型',
      width: '120px',
      dataIndex: 'deviceType',
    },
    { key: 'platform', title: '平台', width: '100px', dataIndex: 'platform' },
    {
      key: 'overallScore',
      title: '總分',
      width: '80px',
      dataIndex: 'overallScore',
    },
    {
      key: 'gestureScore',
      title: '手勢',
      width: '80px',
      dataIndex: 'gestureScore',
    },
    {
      key: 'feedbackScore',
      title: '反饋',
      width: '80px',
      dataIndex: 'feedbackScore',
    },
    {
      key: 'scrollScore',
      title: '滾動',
      width: '80px',
      dataIndex: 'scrollScore',
    },
    {
      key: 'performanceScore',
      title: '性能',
      width: '80px',
      dataIndex: 'performanceScore',
    },
    {
      key: 'accessibilityScore',
      title: '可訪問性',
      width: '100px',
      dataIndex: 'accessibilityScore',
    },
  ];

  // HandleTest結果Data
  const _getResultData = useCallback(() => {
    return testResults.map(result => ({
      deviceType: result.deviceType,
      platform: result.platform,
      overallScore: `${result.overall.score}/100`,
      gestureScore: `${Math.round(Object.values(result.gestures).reduce((sum, g) => sum + (g.success ? g.accuracy : 0), 0) / Object.keys(result.gestures).length || 0)}%`,
      feedbackScore: `${Math.round(Object.values(result.feedback).reduce((sum, f) => sum + (f.success ? f.visualQuality * 10 : 0), 0) / Object.keys(result.feedback).length || 0)}%`,
      scrollScore: `${result.scroll ? Math.round((result.scroll.smoothness + result.scroll.responsiveness) * 5) : 0}%`,
      performanceScore: `${result.performance ? Math.round(result.performance.fps) : 0} FPS`,
      accessibilityScore: result.accessibility ? '✅' : '❌',
    }));
  }, [testResults]);

  return (
    <div className={`touch-test-tool ${className}`} style={containerStyle}>
      {/* 標題欄 */}
      <div style={headerStyle} onClick={() => setIsVisible(!isVisible)}>
        <span style={{ fontWeight: 'bold' }}>觸控測試工具</span>
        <span>{isVisible ? '−' : '+'}</span>
      </div>

      {/* ContentDistrict域 */}
      <div style={contentStyle}>
        {/* Control按鈕 */}
        <div style={{ marginBottom: '16px' }}>
          <TouchFeedback
            feedback={{ type: 'ripple' }}
            onPress={runTests}
            disabled={isRunning}
          >
            <button
              style={{
                width: '100%',
                padding: '8px 16px',
                backgroundColor:
                  currentThemeData?.colors?.brand?.primary || '#007bff',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                opacity: isRunning ? 0.6 : 1,
              }}
            >
              {isRunning ? `測試中... ${Math.round(progress)}%` : '開始測試'}
            </button>
          </TouchFeedback>
        </div>

        {/* 當前TestStatus */}
        {isRunning && currentTest && (
          <div
            style={{
              marginBottom: '16px',
              padding: '8px',
              backgroundColor:
                currentThemeData?.colors?.background?.secondary || '#f8f9fa',
              borderRadius: '4px',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '4px',
              }}
            >
              正在測試: {currentTest}
            </div>
            <div
              style={{
                width: '100%',
                height: '4px',
                backgroundColor: '#e9ecef',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor:
                    currentThemeData?.colors?.brand?.primary || '#007bff',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* 手勢TestDistrict域 */}
        <div style={{ marginBottom: '16px' }}>
          <h4
            style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            手勢測試
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
            }}
          >
            {finalConfig.gestures.map(gesture => (
              <TouchGesture
                key={gesture}
                onTap={() => handleGestureTest('tap')}
                onDoubleTap={() => handleGestureTest('doubleTap')}
                onLongPress={() => handleGestureTest('longPress')}
                onSwipe={() => handleGestureTest('swipe')}
                onPinch={() => handleGestureTest('pinch')}
                onRotate={() => handleGestureTest('rotate')}
                onPan={() => handleGestureTest('pan')}
              >
                <div
                  style={{
                    padding: '8px',
                    backgroundColor:
                      currentThemeData?.colors?.background?.secondary ||
                      '#f8f9fa',
                    border: `1px solid ${currentThemeData?.colors?.border || '#e0e0e0'}`,
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {gesture}
                </div>
              </TouchGesture>
            ))}
          </div>
        </div>

        {/* 反饋TestDistrict域 */}
        <div style={{ marginBottom: '16px' }}>
          <h4
            style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            反饋測試
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
            }}
          >
            {finalConfig.feedbackTypes.map(feedback => (
              <TouchFeedback
                key={feedback}
                feedback={{ type: feedback }}
                onPress={() => handleFeedbackTest(feedback)}
              >
                <div
                  style={{
                    padding: '8px',
                    backgroundColor:
                      currentThemeData?.colors?.background?.secondary ||
                      '#f8f9fa',
                    border: `1px solid ${currentThemeData?.colors?.border || '#e0e0e0'}`,
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {feedback}
                </div>
              </TouchFeedback>
            ))}
          </div>
        </div>

        {/* 滾動TestDistrict域 */}
        {finalConfig.scrollOptimization && (
          <div style={{ marginBottom: '16px' }}>
            <h4
              style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              滾動測試
            </h4>
            <OptimizedScrollView
              style={{
                height: '100px',
                border: `1px solid ${currentThemeData?.colors?.border || '#e0e0e0'}`,
                borderRadius: '4px',
              }}
            >
              <div style={{ padding: '16px', height: '200px' }}>
                <p>這是一個滾動測試區域。請嘗試滾動來測試滾動優化功能。</p>
                <p>滾動測試內容 1</p>
                <p>滾動測試內容 2</p>
                <p>滾動測試內容 3</p>
                <p>滾動測試內容 4</p>
                <p>滾動測試內容 5</p>
              </div>
            </OptimizedScrollView>
          </div>
        )}

        {/* Test結果 */}
        {testResults.length > 0 && (
          <div>
            <h4
              style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              測試結果
            </h4>
            <ResponsiveTable
              data={getResultData()}
              columns={resultColumns}
              style={{
                fontSize: '12px',
                maxHeight: '200px',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

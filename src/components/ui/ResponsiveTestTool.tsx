// Response式TestToolComponent

import React, { useCallback, useMemo, useState } from 'react';

import { useDesignSystem } from '../../hooks/useDesignSystem';
import { useResponsive } from '../../hooks/useResponsive';
import type {
  ResponsiveTestConfig,
  ResponsiveTestResult,
} from '../../types/responsive';

import { Button } from './Button';
import { ResponsiveTable } from './ResponsiveTable';

interface ResponsiveTestToolProps {
  componentName: string;
  component: React.ReactNode;
  config?: ResponsiveTestConfig;
  onTestComplete?: (results: ResponsiveTestResult[]) => void;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export const ResponsiveTestTool: React.FC<ResponsiveTestToolProps> = ({
  componentName,
  component,
  config,
  onTestComplete,
  className = '',
  style = {},
  'data-testid': dataTestId,
}) => {
  const { getResponsiveValue } = useResponsive();
  const { currentTheme, currentThemeData } = useDesignSystem();

  const [currentDevice, setCurrentDevice] = useState<string>('Desktop');
  const [currentOrientation, setCurrentOrientation] = useState<
    'portrait' | 'landscape'
  >('landscape');
  const [testResults, setTestResults] = useState<ResponsiveTestResult[]>([]);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);

  // DefaultTestConfigure
  const defaultConfig: ResponsiveTestConfig = useMemo(
    () => ({
      breakpoints: {
        xs: 575,
        sm: 767,
        md: 991,
        lg: 1199,
        xl: 1399,
        xxl: 1400,
      },
      devices: [
        {
          name: 'iPhone SE',
          width: 375,
          height: 667,
          userAgent:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
          pixelRatio: 2,
          touch: true,
        },
        {
          name: 'iPhone 12',
          width: 390,
          height: 844,
          userAgent:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
          pixelRatio: 3,
          touch: true,
        },
        {
          name: 'iPad',
          width: 768,
          height: 1024,
          userAgent:
            'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
          pixelRatio: 2,
          touch: true,
        },
        {
          name: 'Desktop',
          width: 1920,
          height: 1080,
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          pixelRatio: 1,
          touch: false,
        },
      ],
      orientations: ['portrait', 'landscape'],
      userAgents: [],
    }),
    []
  );

  const _testConfig = config || defaultConfig;

  // 當前設備Configure
  const _currentDeviceConfig = useMemo(() => {
    return (
      testConfig.devices.find(device => device.name === currentDevice) ||
      testConfig.devices[0]
    );
  }, [currentDevice, testConfig.devices]);

  // 當前視窗尺寸
  const _currentWindowSize = useMemo(() => {
    const _device = currentDeviceConfig;
    if (currentOrientation === 'portrait') {
      return { width: device.width, height: device.height };
    } else {
      return { width: device.height, height: device.width };
    }
  }, [currentDeviceConfig, currentOrientation]);

  // 當前斷點
  const _currentBreakpoint = useMemo(() => {
    const { width } = currentWindowSize;
    const { breakpoints } = testConfig;

    if (width <= breakpoints.xs) return 'xs';
    if (width <= breakpoints.sm) return 'sm';
    if (width <= breakpoints.md) return 'md';
    if (width <= breakpoints.lg) return 'lg';
    if (width <= breakpoints.xl) return 'xl';
    return 'xxl';
  }, [currentWindowSize, testConfig.breakpoints]);

  // 運RowTest
  const _runTest = useCallback(async () => {
    setIsTesting(true);
    const results: ResponsiveTestResult[] = [];

    for (const device of testConfig.devices) {
      for (const orientation of testConfig.orientations) {
        const _windowSize =
          orientation === 'portrait'
            ? { width: device.width, height: device.height }
            : { width: device.height, height: device.width };

        const _breakpoint = (() => {
          if (windowSize.width <= testConfig.breakpoints.xs) return 'xs';
          if (windowSize.width <= testConfig.breakpoints.sm) return 'sm';
          if (windowSize.width <= testConfig.breakpoints.md) return 'md';
          if (windowSize.width <= testConfig.breakpoints.lg) return 'lg';
          if (windowSize.width <= testConfig.breakpoints.xl) return 'xl';
          return 'xxl';
        })();

        // 模擬Test結果
        const result: ResponsiveTestResult = {
          component: componentName,
          device: device.name,
          breakpoint,
          orientation,
          passed: Math.random() > 0.2, // 80% 通過率
          issues: Math.random() > 0.8 ? ['渲染問題', '佈局問題'] : [],
          performance: {
            renderTime: Math.random() * 100 + 10,
            memoryUsage: Math.random() * 20 + 5,
            interactionTime: Math.random() * 50 + 10,
          },
        };

        results.push(result);

        // 模擬Test延遲
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    setTestResults(results);
    setIsTesting(false);
    setShowResults(true);
    onTestComplete?.(results);
  }, [componentName, testConfig, onTestComplete]);

  // Switch設備
  const _handleDeviceChange = useCallback((deviceName: string) => {
    setCurrentDevice(deviceName);
  }, []);

  // Switch方向
  const _handleOrientationChange = useCallback(
    (orientation: 'portrait' | 'landscape') => {
      setCurrentOrientation(orientation);
    },
    []
  );

  // TestTool樣式
  const _toolStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      backgroundColor:
        currentThemeData?.colors?.background?.primary || '#ffffff',
      border: `1px solid ${currentThemeData?.colors?.border?.primary || '#dee2e6'}`,
      borderRadius: currentThemeData?.borderRadius?.md || '8px',
      padding: '16px',
      marginBottom: '16px',
      ...style,
    };

    return baseStyle;
  }, [currentTheme, style]);

  // 預覽容器樣式
  const _previewStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      border: `2px solid ${currentThemeData?.colors?.border?.primary || '#dee2e6'}`,
      borderRadius: currentThemeData?.borderRadius?.sm || '4px',
      overflow: 'hidden',
      backgroundColor:
        currentThemeData?.colors?.background?.secondary || '#f8f9fa',
      transition: 'all 0.3s ease',
    };

    // Settings視窗尺寸
    baseStyle.width = `${currentWindowSize.width}px`;
    baseStyle.height = `${currentWindowSize.height}px`;
    baseStyle.maxWidth = '100%';
    baseStyle.maxHeight = '600px';

    return baseStyle;
  }, [currentWindowSize, currentTheme]);

  // 渲染設備Select器
  const _renderDeviceSelector = () => (
    <div style={{ marginBottom: '16px' }}>
      <h4
        style={{
          margin: '0 0 8px 0',
          color: currentThemeData?.colors?.text?.primary || '#000000',
        }}
      >
        設備選擇
      </h4>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {testConfig.devices.map(device => (
          <Button
            key={device.name}
            variant={currentDevice === device.name ? 'primary' : 'outline'}
            size='small'
            onClick={() => handleDeviceChange(device.name)}
          >
            {device.name}
          </Button>
        ))}
      </div>
    </div>
  );

  // 渲染方向Select器
  const _renderOrientationSelector = () => (
    <div style={{ marginBottom: '16px' }}>
      <h4
        style={{
          margin: '0 0 8px 0',
          color: currentThemeData?.colors?.text?.primary || '#000000',
        }}
      >
        方向選擇
      </h4>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          variant={currentOrientation === 'portrait' ? 'primary' : 'outline'}
          size='small'
          onClick={() => handleOrientationChange('portrait')}
        >
          豎屏
        </Button>
        <Button
          variant={currentOrientation === 'landscape' ? 'primary' : 'outline'}
          size='small'
          onClick={() => handleOrientationChange('landscape')}
        >
          橫屏
        </Button>
      </div>
    </div>
  );

  // 渲染設備Information
  const _renderDeviceInfo = () => (
    <div style={{ marginBottom: '16px' }}>
      <h4
        style={{
          margin: '0 0 8px 0',
          color: currentThemeData?.colors?.text?.primary || '#000000',
        }}
      >
        設備信息
      </h4>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '8px',
          fontSize: '14px',
          color: currentThemeData?.colors?.text?.secondary || '#666666',
        }}
      >
        <div>設備: {currentDeviceConfig.name}</div>
        <div>
          尺寸: {currentWindowSize.width} × {currentWindowSize.height}
        </div>
        <div>斷點: {currentBreakpoint}</div>
        <div>方向: {currentOrientation}</div>
        <div>像素比: {currentDeviceConfig.pixelRatio}x</div>
        <div>觸控: {currentDeviceConfig.touch ? '是' : '否'}</div>
      </div>
    </div>
  );

  // 渲染Test按鈕
  const _renderTestButton = () => (
    <div style={{ marginBottom: '16px' }}>
      <Button
        variant='primary'
        onClick={runTest}
        disabled={isTesting}
        style={{ marginRight: '8px' }}
      >
        {isTesting ? '測試中...' : '運行測試'}
      </Button>
      {testResults.length > 0 && (
        <Button variant='outline' onClick={() => setShowResults(!showResults)}>
          {showResults ? '隱藏結果' : '顯示結果'}
        </Button>
      )}
    </div>
  );

  // 渲染Test結果
  const _renderTestResults = () => {
    if (!showResults || testResults.length === 0) return null;

    const _totalTests = testResults.length;
    const _passedTests = testResults.filter(r => r.passed).length;
    const _failedTests = totalTests - passedTests;
    const _passRate = ((passedTests / totalTests) * 100).toFixed(2);

    return (
      <div style={{ marginTop: '16px' }}>
        <h4
          style={{
            margin: '0 0 8px 0',
            color: currentThemeData?.colors?.text?.primary || '#000000',
          }}
        >
          測試結果
        </h4>
        <div style={{ marginBottom: '16px' }}>
          <div>總測試數: {totalTests}</div>
          <div>通過: {passedTests}</div>
          <div>失敗: {failedTests}</div>
          <div>通過率: {passRate}%</div>
        </div>

        <ResponsiveTable
          data={testResults}
          columns={[
            {
              key: 'device',
              title: '設備',
              dataIndex: 'device',
            },
            {
              key: 'breakpoint',
              title: '斷點',
              dataIndex: 'breakpoint',
            },
            {
              key: 'orientation',
              title: '方向',
              dataIndex: 'orientation',
            },
            {
              key: 'status',
              title: '狀態',
              dataIndex: 'passed',
              render: value => (
                <span style={{ color: value ? 'green' : 'red' }}>
                  {value ? '通過' : 'Failed'}
                </span>
              ),
            },
            {
              key: 'renderTime',
              title: '渲染時間',
              dataIndex: 'performance',
              render: value => `${value.renderTime.toFixed(2)}ms`,
            },
            {
              key: 'issues',
              title: '問題',
              dataIndex: 'issues',
              render: value => (value.length > 0 ? value.join(', ') : '無'),
            },
          ]}
          responsive={{ scroll: true, breakpoint: 'md' }}
        />
      </div>
    );
  };

  return (
    <div
      className={`responsive-test-tool ${className}`}
      style={toolStyle}
      data-testid={dataTestId}
    >
      <h3
        style={{
          margin: '0 0 16px 0',
          color: currentThemeData?.colors?.text?.primary || '#000000',
        }}
      >
        響應式測試工具 - {componentName}
      </h3>

      {renderDeviceSelector()}
      {renderOrientationSelector()}
      {renderDeviceInfo()}
      {renderTestButton()}

      <div style={{ marginBottom: '16px' }}>
        <h4
          style={{
            margin: '0 0 8px 0',
            color: currentThemeData?.colors?.text?.primary || '#000000',
          }}
        >
          組件預覽
        </h4>
        <div style={previewStyle}>
          <div
            style={{
              width: '100%',
              height: '100%',
              overflow: 'auto',
              padding: '16px',
            }}
          >
            {component}
          </div>
        </div>
      </div>

      {renderTestResults()}
    </div>
  );
};

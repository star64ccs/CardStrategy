// 微交互TestToolComponent
import React, { useCallback, useState } from 'react';

import type {
  ButtonClickConfig,
  FormValidationConfig,
  LoadingConfig,
} from '../../types/microInteractions';
import {
  MicroInteractionType,
  TriggerType,
} from '../../types/microInteractions';
import { useMicroInteraction } from '../providers/MicroInteractionProvider';

import {
  FloatingActionButton,
  IconButton,
  PrimaryButton,
} from './ButtonClickAnimation';
import {
  ValidatedInput,
  ValidatedSelect,
  ValidatedTextarea,
} from './FormValidationAnimation';
import {
  ButtonLoading,
  FullScreenLoading,
  InlineLoading,
} from './LoadingAnimation';

// TestToolComponent
export const MicroInteractionTestTool: React.FC = () => {
  const { register, trigger, unregister, stats, config } =
    useMicroInteraction();
  const [activeTests, setActiveTests] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    message: '',
  });
  const [validationStates, setValidationStates] = useState({
    name: 'idle' as const,
    email: 'idle' as const,
    category: 'idle' as const,
    message: 'idle' as const,
  });
  const [validationMessages, setValidationMessages] = useState({
    name: '',
    email: '',
    category: '',
    message: '',
  });
  const [loadingStates, setLoadingStates] = useState({
    fullscreen: false,
    inline: false,
    button: false,
  });

  // Test按鈕點擊動畫
  const _testButtonClick = useCallback(async () => {
    const _testId = 'button-click-test';
    const config: ButtonClickConfig = {
      id: testId,
      type: MicroInteractionType.BUTTON_CLICK,
      trigger: TriggerType.CLICK,
      duration: 300,
      easing: 'ease-out',
      ripple: {
        enabled: true,
        color: 'rgba(255, 255, 255, 0.3)',
        duration: 600,
        scale: 1.5,
      },
      scale: {
        enabled: true,
        scale: 0.95,
        duration: 150,
      },
      shadow: {
        enabled: true,
        intensity: 0.2,
        duration: 150,
      },
    };

    try {
      setActiveTests(prev => new Set(prev).add(testId));
      const _id = register(config);
      await trigger(id, { test: true });
      setTestResults(prev => ({
        ...prev,
        [testId]: { success: true, timestamp: Date.now() },
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testId]: {
          success: false,
          error: error.message,
          timestamp: Date.now(),
        },
      }));
    } finally {
      setActiveTests(prev => {
        const _newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
    }
  }, [register, trigger]);

  // TestTable單Verify動畫
  const _testFormValidation = useCallback(async () => {
    const _testId = 'form-validation-test';
    const config: FormValidationConfig = {
      id: testId,
      type: MicroInteractionType.FORM_VALIDATION,
      trigger: TriggerType.AUTO,
      duration: 500,
      easing: 'ease-out',
      success: {
        icon: '✓',
        color: '#4CAF50',
        duration: 500,
        shake: false,
      },
      error: {
        icon: '✗',
        color: '#F44336',
        duration: 500,
        shake: true,
        shakeIntensity: 10,
      },
      warning: {
        icon: '⚠',
        color: '#FF9800',
        duration: 500,
        pulse: true,
      },
    };

    try {
      setActiveTests(prev => new Set(prev).add(testId));
      const _id = register(config);

      // 模擬Verify過程
      await trigger(id, { validationState: 'validating' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      await trigger(id, { validationState: 'success' });

      setTestResults(prev => ({
        ...prev,
        [testId]: { success: true, timestamp: Date.now() },
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testId]: {
          success: false,
          error: error.message,
          timestamp: Date.now(),
        },
      }));
    } finally {
      setActiveTests(prev => {
        const _newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
    }
  }, [register, trigger]);

  // Test加載動畫
  const _testLoadingAnimation = useCallback(async () => {
    const _testId = 'loading-animation-test';
    const config: LoadingConfig = {
      id: testId,
      type: MicroInteractionType.LOADING,
      trigger: TriggerType.AUTO,
      duration: 2000,
      easing: 'ease-in-out',
      spinner: {
        type: 'circular',
        size: 32,
        color: '#1976D2',
        thickness: 3,
      },
      progress: {
        enabled: true,
        type: 'determinate',
        value: 0,
        color: '#1976D2',
      },
    };

    try {
      setActiveTests(prev => new Set(prev).add(testId));
      const _id = register(config);

      // 模擬加載過程
      for (let i = 0; i <= 100; i += 10) {
        await trigger(id, { loading: true, progress: i });
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      await trigger(id, { loading: false });

      setTestResults(prev => ({
        ...prev,
        [testId]: { success: true, timestamp: Date.now() },
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testId]: {
          success: false,
          error: error.message,
          timestamp: Date.now(),
        },
      }));
    } finally {
      setActiveTests(prev => {
        const _newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
    }
  }, [register, trigger]);

  // HandleTable單Verify
  const _handleValidationChange = useCallback(
    (field: string, state: string, message?: string) => {
      setValidationStates(prev => ({ ...prev, [field]: state }));
      setValidationMessages(prev => ({ ...prev, [field]: message || '' }));
    },
    []
  );

  // HandleTable單Data變化
  const _handleFormChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // 運Row所有Test
  const _runAllTests = useCallback(async () => {
    await Promise.all([
      testButtonClick(),
      testFormValidation(),
      testLoadingAnimation(),
    ]);
  }, [testButtonClick, testFormValidation, testLoadingAnimation]);

  // ClearTest結果
  const _clearTestResults = useCallback(() => {
    setTestResults({});
    setActiveTests(new Set());
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px', color: '#333' }}>微交互測試工具</h1>

      {/* StatisticsInformation */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3>總交互數</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976D2' }}>
            {stats.totalInteractions}
          </p>
        </div>
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3>成功交互</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
            {stats.successfulInteractions}
          </p>
        </div>
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3>失敗交互</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#F44336' }}>
            {stats.failedInteractions}
          </p>
        </div>
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3>性能分數</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>
            {Math.round(stats.performanceScore)}
          </p>
        </div>
      </div>

      {/* TestControl */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}
      >
        <PrimaryButton
          onClick={testButtonClick}
          disabled={activeTests.has('button-click-test')}
        >
          測試按鈕點擊動畫
        </PrimaryButton>
        <PrimaryButton
          onClick={testFormValidation}
          disabled={activeTests.has('form-validation-test')}
        >
          測試表單驗證動畫
        </PrimaryButton>
        <PrimaryButton
          onClick={testLoadingAnimation}
          disabled={activeTests.has('loading-animation-test')}
        >
          測試加載動畫
        </PrimaryButton>
        <PrimaryButton onClick={runAllTests} variant='secondary'>
          運行所有測試
        </PrimaryButton>
        <PrimaryButton onClick={clearTestResults} variant='outline'>
          清除結果
        </PrimaryButton>
      </div>

      {/* Test結果 */}
      {Object.keys(testResults).length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2>測試結果</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
            }}
          >
            {Object.entries(testResults).map(([testId, result]) => (
              <div
                key={testId}
                style={{
                  padding: '16px',
                  backgroundColor: result.success ? '#e8f5e8' : '#ffebee',
                  border: `1px solid ${result.success ? '#4CAF50' : '#F44336'}`,
                  borderRadius: '8px',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 8px 0',
                    color: result.success ? '#2e7d32' : '#c62828',
                  }}
                >
                  {testId}
                </h4>
                <p style={{ margin: '0 0 4px 0' }}>
                  狀態: {result.success ? 'Success' : 'Failed'}
                </p>
                {result.error && (
                  <p style={{ margin: '0 0 4px 0', color: '#c62828' }}>
                    錯誤: {result.error}
                  </p>
                )}
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                  時間: {new Date(result.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 按鈕點擊動畫演示 */}
      <div style={{ marginBottom: '32px' }}>
        <h2>按鈕點擊動畫演示</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <PrimaryButton>主要按鈕</PrimaryButton>
          <PrimaryButton variant='secondary'>次要按鈕</PrimaryButton>
          <PrimaryButton variant='outline'>輪廓按鈕</PrimaryButton>
          <PrimaryButton variant='ghost'>幽靈按鈕</PrimaryButton>
          <IconButton icon='★' size='medium'>
            <span>★</span>
          </IconButton>
          <IconButton icon='⚙' size='large' circular>
            <span>⚙</span>
          </IconButton>
          <FloatingActionButton icon='+' size='medium'>
            <span>+</span>
          </FloatingActionButton>
        </div>
      </div>

      {/* Table單Verify動畫演示 */}
      <div style={{ marginBottom: '32px' }}>
        <h2>表單驗證動畫演示</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          <div>
            <h4>輸入框驗證</h4>
            <ValidatedInput
              value={formData.name}
              onChange={value => handleFormChange('name', value)}
              placeholder='請輸入姓名'
              required
              validationState={validationStates.name}
              message={validationMessages.name}
              onValidationChange={(state, message) =>
                handleValidationChange('name', state, message)
              }
            />
          </div>
          <div>
            <h4>郵箱驗證</h4>
            <ValidatedInput
              value={formData.email}
              onChange={value => handleFormChange('email', value)}
              placeholder='請輸入郵箱'
              type='email'
              pattern='[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'
              validationState={validationStates.email}
              message={validationMessages.email}
              onValidationChange={(state, message) =>
                handleValidationChange('email', state, message)
              }
            />
          </div>
          <div>
            <h4>選擇框驗證</h4>
            <ValidatedSelect
              value={formData.category}
              onChange={value => handleFormChange('category', value)}
              options={[
                { value: 'tech', label: '科技' },
                { value: 'design', label: '設計' },
                { value: 'business', label: '商業' },
              ]}
              placeholder='請選擇類別'
              required
              validationState={validationStates.category}
              message={validationMessages.category}
              onValidationChange={(state, message) =>
                handleValidationChange('category', state, message)
              }
            />
          </div>
          <div>
            <h4>文本域驗證</h4>
            <ValidatedTextarea
              value={formData.message}
              onChange={value => handleFormChange('message', value)}
              placeholder='請輸入消息'
              minLength={10}
              maxLength={200}
              rows={4}
              validationState={validationStates.message}
              message={validationMessages.message}
              onValidationChange={(state, message) =>
                handleValidationChange('message', state, message)
              }
            />
          </div>
        </div>
      </div>

      {/* 加載動畫演示 */}
      <div style={{ marginBottom: '32px' }}>
        <h2>加載動畫演示</h2>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div>
            <h4>內聯加載</h4>
            <InlineLoading loading={loadingStates.inline} />
            <PrimaryButton
              size='small'
              onClick={() =>
                setLoadingStates(prev => ({ ...prev, inline: !prev.inline }))
              }
            >
              切換內聯加載
            </PrimaryButton>
          </div>
          <div>
            <h4>按鈕加載</h4>
            <ButtonLoading
              loading={loadingStates.button}
              message={loadingStates.button ? '處理中...' : undefined}
            />
            <PrimaryButton
              size='small'
              onClick={() =>
                setLoadingStates(prev => ({ ...prev, button: !prev.button }))
              }
            >
              切換按鈕加載
            </PrimaryButton>
          </div>
          <div>
            <h4>全屏加載</h4>
            <PrimaryButton
              onClick={() =>
                setLoadingStates(prev => ({
                  ...prev,
                  fullscreen: !prev.fullscreen,
                }))
              }
            >
              切換全屏加載
            </PrimaryButton>
          </div>
        </div>
      </div>

      {/* ConfigureInformation */}
      <div style={{ marginBottom: '32px' }}>
        <h2>系統配置</h2>
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '14px',
          }}
        >
          <pre>{JSON.stringify(config, null, 2)}</pre>
        </div>
      </div>

      {/* 全屏加載覆蓋層 */}
      {loadingStates.fullscreen && (
        <FullScreenLoading
          loading={true}
          message='正在處理請求...'
          config={{
            spinner: {
              type: 'circular',
              size: 48,
              color: '#ffffff',
              thickness: 4,
            },
            progress: {
              enabled: true,
              type: 'indeterminate',
              color: '#ffffff',
            },
          }}
        />
      )}
    </div>
  );
};

// DefaultExport
export default MicroInteractionTestTool;

import { touchService } from '../services/touchService';
import type {
  TouchGestureType,
  TouchFeedbackType,
  TouchTestConfig,
  TouchTestResult,
  TouchServiceConfig,
} from '../types/touch';

describe('Touch Components - Simple Tests', () => {
  beforeEach(() => {
    // 重置服務狀態
    const config: TouchServiceConfig = {
      enableGestures: true,
      enableFeedback: true,
      enableScrollOptimization: true,
      enablePerformanceMonitoring: true,
      enableAccessibilitySupport: true,
      defaultConfig: {
        gestures: {
          enabled: true,
          threshold: 10,
          timeout: 300,
          minDistance: 5,
          maxDistance: 1000,
          minDuration: 50,
          maxDuration: 5000,
          preventDefault: true,
          stopPropagation: false,
        },
        feedback: {
          type: 'ripple',
          duration: 300,
          scale: 0.95,
          opacity: 0.8,
          color: '#000000',
          rippleColor: '#ffffff',
          rippleSize: 100,
          disabled: false,
        },
        scroll: {
          enabled: true,
          momentum: true,
          bounce: true,
          deceleration: 0.998,
          snapToInterval: 0,
          snapToAlignment: 'start',
          showsHorizontalScrollIndicator: true,
          showsVerticalScrollIndicator: true,
        },
      },
    };
    touchService.updateConfig(config);
  });

  describe('Touch Service', () => {
    test('should register and retrieve gesture configuration', () => {
      const _componentId = 'test-gesture-component';
      const _gestureConfig = {
        type: 'tap' as TouchGestureType,
        enabled: true,
        threshold: 15,
        timeout: 400,
      };

      touchService.registerGesture(componentId, gestureConfig);
      const _retrieved = touchService.getGestureConfig(componentId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.type).toBe('tap');
      expect(retrieved?.threshold).toBe(15);
      expect(retrieved?.timeout).toBe(400);
    });

    test('should register and retrieve feedback configuration', () => {
      const _componentId = 'test-feedback-component';
      const _feedbackConfig = {
        type: 'scale' as TouchFeedbackType,
        duration: 250,
        scale: 0.9,
      };

      touchService.registerFeedback(componentId, feedbackConfig);
      const _retrieved = touchService.getFeedbackConfig(componentId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.type).toBe('scale');
      expect(retrieved?.duration).toBe(250);
      expect(retrieved?.scale).toBe(0.9);
    });

    test('should register and retrieve scroll configuration', () => {
      const _componentId = 'test-scroll-component';
      const _scrollConfig = {
        enabled: true,
        momentum: false,
        bounce: true,
        deceleration: 0.995,
      };

      touchService.registerScroll(componentId, scrollConfig);
      const _retrieved = touchService.getScrollConfig(componentId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.enabled).toBe(true);
      expect(retrieved?.momentum).toBe(false);
      expect(retrieved?.bounce).toBe(true);
      expect(retrieved?.deceleration).toBe(0.995);
    });

    test('should unregister components', () => {
      const _componentId = 'test-unregister-component';
      const _gestureConfig = { type: 'tap' as TouchGestureType };
      const _feedbackConfig = { type: 'ripple' as TouchFeedbackType };
      const _scrollConfig = { enabled: true };

      touchService.registerGesture(componentId, gestureConfig);
      touchService.registerFeedback(componentId, feedbackConfig);
      touchService.registerScroll(componentId, scrollConfig);

      touchService.unregisterGesture(componentId);
      touchService.unregisterFeedback(componentId);
      touchService.unregisterScroll(componentId);

      expect(touchService.getGestureConfig(componentId)).toBeNull();
      expect(touchService.getFeedbackConfig(componentId)).toBeNull();
      expect(touchService.getScrollConfig(componentId)).toBeNull();
    });

    test('should track performance metrics', () => {
      const _componentId = 'test-performance-component';
      const _metrics = {
        gesture: 'tap',
        latency: 150,
        timestamp: Date.now(),
      };

      touchService.trackPerformance(componentId, metrics);
      const _report = touchService.getPerformanceReport();

      expect(report).toBeDefined();
      expect(report.components).toHaveLength(1);
      expect(report.components[0][0]).toBe(componentId);
    });

    test('should handle events', () => {
      const _eventCallback = jest.fn();
      touchService.onEvent(eventCallback);

      const _testEvent = {
        type: 'gesture' as const,
        data: { type: 'tap' },
        timestamp: Date.now(),
        source: 'test-source',
      };

      touchService.emitEvent(testEvent);
      expect(eventCallback).toHaveBeenCalledWith(testEvent);
    });

    test('should update configuration', () => {
      const _newConfig = {
        enableGestures: false,
        enableFeedback: true,
      };

      touchService.updateConfig(newConfig);
      const _currentConfig = touchService.getConfig();

      expect(currentConfig.enableGestures).toBe(false);
      expect(currentConfig.enableFeedback).toBe(true);
    });
  });

  describe('Touch Test Functionality', () => {
    test('should run touch test successfully', async () => {
      const testConfig: TouchTestConfig = {
        deviceType: 'mobile',
        platform: 'ios',
        gestures: ['tap', 'swipe'],
        feedbackTypes: ['ripple', 'scale'],
        scrollOptimization: true,
        performance: true,
        accessibility: true,
      };

      const _result = await touchService.runTouchTest(testConfig);

      expect(result).toBeDefined();
      expect(result.deviceType).toBe('mobile');
      expect(result.platform).toBe('ios');
      expect(result.overall.score).toBeGreaterThan(0);
      expect(result.overall.score).toBeLessThanOrEqual(100);
    });

    test('should generate test report', async () => {
      const testConfig: TouchTestConfig = {
        deviceType: 'desktop',
        platform: 'web',
        gestures: ['tap'],
        feedbackTypes: ['ripple'],
        scrollOptimization: false,
        performance: false,
        accessibility: false,
      };

      const _result = await touchService.runTouchTest(testConfig);
      const _report = touchService.generateTestReport([result]);

      expect(report).toBeDefined();
      expect(typeof report).toBe('string');
      expect(report).toContain('觸控優化測試報告');
      expect(report).toContain('desktop');
      expect(report).toContain('web');
    });

    test('should handle multiple test results', async () => {
      const testConfigs: TouchTestConfig[] = [
        {
          deviceType: 'mobile',
          platform: 'ios',
          gestures: ['tap'],
          feedbackTypes: ['ripple'],
          scrollOptimization: true,
          performance: true,
          accessibility: true,
        },
        {
          deviceType: 'desktop',
          platform: 'web',
          gestures: ['tap'],
          feedbackTypes: ['ripple'],
          scrollOptimization: true,
          performance: true,
          accessibility: true,
        },
      ];

      const results: TouchTestResult[] = [];
      for (const config of testConfigs) {
        const _result = await touchService.runTouchTest(config);
        results.push(result);
      }

      expect(results).toHaveLength(2);
      expect(results[0].deviceType).toBe('mobile');
      expect(results[1].deviceType).toBe('desktop');

      const _report = touchService.generateTestReport(results);
      expect(report).toContain('測試設備數量: 2');
    });
  });

  describe('Type Definitions', () => {
    test('should validate TouchGestureType', () => {
      const validGestures: TouchGestureType[] = [
        'tap',
        'doubleTap',
        'longPress',
        'swipe',
        'pinch',
        'rotate',
        'pan',
      ];

      validGestures.forEach(gesture => {
        expect(typeof gesture).toBe('string');
        expect(gesture).toMatch(
          /^(tap|doubleTap|longPress|swipe|pinch|rotate|pan)$/
        );
      });
    });

    test('should validate TouchFeedbackType', () => {
      const validFeedbacks: TouchFeedbackType[] = [
        'ripple',
        'scale',
        'opacity',
        'color',
        'custom',
      ];

      validFeedbacks.forEach(feedback => {
        expect(typeof feedback).toBe('string');
        expect(feedback).toMatch(/^(ripple|scale|opacity|color|custom)$/);
      });
    });

    test('should validate TouchTestConfig structure', () => {
      const config: TouchTestConfig = {
        deviceType: 'mobile',
        platform: 'ios',
        gestures: ['tap', 'swipe'],
        feedbackTypes: ['ripple'],
        scrollOptimization: true,
        performance: true,
        accessibility: true,
      };

      expect(config.deviceType).toBe('mobile');
      expect(config.platform).toBe('ios');
      expect(Array.isArray(config.gestures)).toBe(true);
      expect(Array.isArray(config.feedbackTypes)).toBe(true);
      expect(typeof config.scrollOptimization).toBe('boolean');
      expect(typeof config.performance).toBe('boolean');
      expect(typeof config.accessibility).toBe('boolean');
    });

    test('should validate TouchTestResult structure', async () => {
      const testConfig: TouchTestConfig = {
        deviceType: 'tablet',
        platform: 'android',
        gestures: ['tap'],
        feedbackTypes: ['ripple'],
        scrollOptimization: true,
        performance: true,
        accessibility: true,
      };

      const _result = await touchService.runTouchTest(testConfig);

      expect(result.deviceType).toBe('tablet');
      expect(result.platform).toBe('android');
      expect(typeof result.gestures).toBe('object');
      expect(typeof result.feedback).toBe('object');
      expect(typeof result.scroll).toBe('object');
      expect(typeof result.performance).toBe('object');
      expect(typeof result.accessibility).toBe('object');
      expect(typeof result.overall).toBe('object');
      expect(typeof result.overall.score).toBe('number');
      expect(Array.isArray(result.overall.recommendations)).toBe(true);
    });
  });

  describe('Performance Monitoring', () => {
    test('should track multiple performance metrics', () => {
      const _componentId = 'test-multi-metrics';
      const _metrics1 = { gesture: 'tap', latency: 100 };
      const _metrics2 = { gesture: 'swipe', latency: 200 };
      const _metrics3 = { fps: 60, memoryUsage: 50 };

      touchService.trackPerformance(componentId, metrics1);
      touchService.trackPerformance(componentId, metrics2);
      touchService.trackPerformance(componentId, metrics3);

      const _report = touchService.getPerformanceReport();
      // 檢查是否包含我們的組件，而不是檢查總數（因為可能有其他測試的數據）
      const _ourComponent = report.components.find(([id]) => id === componentId);
      expect(ourComponent).toBeDefined();
      expect(ourComponent[0]).toBe(componentId);
    });

    test('should calculate performance summary', () => {
      const _componentIds = ['comp1', 'comp2', 'comp3'];
      const _latencies = [100, 150, 200];
      const _fpsValues = [60, 55, 50];

      componentIds.forEach((id, index) => {
        touchService.trackPerformance(id, {
          latency: latencies[index],
          fps: fpsValues[index],
        });
      });

      const _report = touchService.getPerformanceReport();
      // 檢查是否包含我們的組件，而不是檢查總數
      componentIds.forEach(id => {
        const _component = report.components.find(
          ([componentId]) => componentId === id
        );
        expect(component).toBeDefined();
      });
      expect(report.summary.averageLatency).toBeGreaterThan(0);
      expect(report.summary.averageFPS).toBeGreaterThan(0);
    });
  });
});
